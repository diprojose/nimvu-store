"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cart";
import { orders, addresses, shipping, discounts } from "@/lib/api";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { trackCheckoutFailure } from "@/lib/analytics";
import { useCheckoutLeadCapture } from "@/hooks/useCheckoutLeadCapture";
import { Address } from "@/types/address";

import { CheckoutAccount } from "@/components/custom/checkout/CheckoutAccount";
import { CheckoutAddress } from "@/components/custom/checkout/CheckoutAddress";
import { CheckoutReceiver, ReceiverData } from "@/components/custom/checkout/CheckoutReceiver";
import { CheckoutPayment } from "@/components/custom/checkout/CheckoutPayment";
import { CheckoutSummary, DiscountCoupon } from "@/components/custom/checkout/CheckoutSummary";
import { CheckoutSummaryMobile } from "@/components/custom/checkout/CheckoutSummaryMobile";
import { InAppBrowserNotice } from "@/components/custom/checkout/InAppBrowserNotice";
import { AddressFormData } from "@/components/custom/AddressForm";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WidgetCheckout: any;
  }
}

/**
 * Traduce un fallo al iniciar el pago en algo accionable: un mensaje que le
 * diga al cliente qué hacer, y una etiqueta corta para registrar la causa.
 * Todos estos errores ocurren antes de crear la orden, así que este es el
 * único lugar donde queda constancia de lo que pasó.
 */
function describeCheckoutError(err: unknown): { message: string; log: string } {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  const status: number | undefined = e?.response?.status;
  const backendMessage: string | undefined =
    e?.response?.data?.message ?? e?.response?.data?.error;

  if (status === 401 || status === 403) {
    return {
      message: "Tu sesión expiró. Vuelve a iniciar sesión e intenta de nuevo.",
      log: `auth_${status}`,
    };
  }

  if (status === 400 && backendMessage) {
    // El backend responde aquí cuando no hay stock suficiente, entre otros.
    const isStock = /stock/i.test(backendMessage);
    return {
      message: isStock
        ? "Uno de los productos se quedó sin unidades disponibles. Revisa tu carrito."
        : backendMessage,
      log: `400_${backendMessage.slice(0, 80)}`,
    };
  }

  if (status && status >= 500) {
    return {
      message: "Nuestro servidor no respondió. Espera un momento e intenta otra vez.",
      log: `server_${status}`,
    };
  }

  // Sin respuesta: servidor dormido, timeout o el cliente sin conexión.
  if (e?.code === "ECONNABORTED" || e?.message === "Network Error" || !status) {
    return {
      message:
        "No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo en unos segundos.",
      log: `network_${e?.code ?? e?.message ?? "sin_respuesta"}`,
    };
  }

  return {
    message: "Error iniciando el pago. Intenta de nuevo.",
    log: `desconocido_${String(e?.message ?? e).slice(0, 80)}`,
  };
}

export default function CheckoutPage() {
  const { customer, syncWithBackend } = useAuthStore();
  const { items, getCartTotal, getCartSubtotal, clearCart } = useCartStore();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  // Mantenido para compatibilidad con CheckoutPayment; ya no dependemos del script de Wompi.
  const [isWompiLoaded] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'wompi' | 'cod'>('wompi');
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const [guestEmail, setGuestEmail] = useState("");
  const [guestAddress, setGuestAddress] = useState<Address | null>(null);
  const isGuest = !customer && guestEmail !== "";
  
  const [shippingCost, setShippingCost] = useState(15000);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<DiscountCoupon | null>(null);
  const [couponError, setCouponError] = useState("");
  const [loadingCoupon, setLoadingCoupon] = useState(false);
  
  const [receiverData, setReceiverData] = useState<ReceiverData>({
    fullName: "",
    phone: "",
    idNumber: ""
  });

  // Una vez creada la orden ya no tiene sentido seguir capturando el lead.
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Guarda el contacto en segundo plano mientras el cliente llena el
  // formulario: si se va antes de darle a pagar, queda el dato para cerrarlo
  // por WhatsApp. No crea orden ni descuenta stock.
  useCheckoutLeadCapture({
    email: customer?.email || guestEmail,
    phone: receiverData.phone || selectedAddress?.phone,
    name: receiverData.fullName || customer?.name,
    shippingAddress: selectedAddress,
    items,
    disabled: orderPlaced,
  });

  const subtotal = isMounted ? getCartSubtotal() : 0;

  const discountAmount = isMounted && appliedCoupon ? (() => {
    const hasSpecificTargets = (appliedCoupon.products && appliedCoupon.products.length > 0) || 
                               (appliedCoupon.collections && appliedCoupon.collections.length > 0);
    let applicableSubtotal = subtotal;

    if (hasSpecificTargets) {
      applicableSubtotal = 0;
      const targetProductIds = new Set([
        ...(appliedCoupon.products?.map(p => p.id) || []),
        ...(appliedCoupon.collections?.flatMap(c => c.products?.map(p => p.id)) || [])
      ]);

      items.forEach(item => {
        if (targetProductIds.has(item.productId)) {
          applicableSubtotal += item.price * item.quantity;
        }
      });
    }

    if (applicableSubtotal === 0) return 0;
    if (appliedCoupon.type === "PERCENTAGE") {
      return applicableSubtotal * (appliedCoupon.value / 100);
    } else {
      return Math.min(applicableSubtotal, appliedCoupon.value);
    }
  })() : 0;

  // Envío gratis sobre el umbral (evaluado sobre el subtotal antes del cupón).
  // El backend valida esto de forma autoritativa al crear la orden.
  const qualifiesForFreeShipping = isMounted && subtotal >= FREE_SHIPPING_THRESHOLD;

  // El envío solo se conoce con una dirección: `shippingCost` arranca en 15000
  // como respaldo y eso no es un precio, es una suposición. Cobrarlo en el
  // total mientras la fila de envío dice "calculado al ingresar la dirección"
  // deja al cliente viendo un total que no cuadra con lo que ve sumado.
  const shippingKnown = qualifiesForFreeShipping || !!selectedAddress;
  const effectiveShippingCost = qualifiesForFreeShipping || !selectedAddress ? 0 : shippingCost;

  const total = isMounted ? Math.max(0, (getCartTotal() - discountAmount + effectiveShippingCost)) : 0;
  const isBogota = selectedAddress?.city?.toLowerCase()?.includes('bogota') || selectedAddress?.city?.toLowerCase()?.includes('bogotá') || false;

  useEffect(() => {
    if (selectedAddress) {
      if (!isBogota) setPaymentMethod('wompi');
      
      const calcShipping = async () => {
        try {
          const rate = await shipping.calculate({
            country: 'Colombia',
            state: selectedAddress.province,
            city: selectedAddress.city
          });
          if (rate && rate.price) {
            setShippingCost(rate.price);
          } else {
            setShippingCost(15000);
          }
        } catch (error) {
          console.error("Shipping calc failed", error);
          setShippingCost(15000);
        }
      };
      calcShipping();
    }
  }, [selectedAddress, isBogota]);

  useEffect(() => {
    setIsMounted(true);

    if (customer?.addresses && customer.addresses.length > 0 && !selectedAddressId) {
      const defaultAddr = customer.addresses[0];
      setSelectedAddressId(defaultAddr.id);
      setSelectedAddress(defaultAddr);
    }
  }, [customer?.addresses, selectedAddressId]);

  const handleSaveAddress = async (data: AddressFormData) => {
    if (isGuest) {
      const mockAddress: Address = {
        id: "guest-addr",
        address_1: data.address_1,
        city: data.city,
        province: data.province,
        postal_code: data.postal_code,
        country: "Colombia",
        phone: data.phone,
        company: data.company || "",
        first_name: data.first_name,
        last_name: data.last_name,
      } as unknown as Address;
      setGuestAddress(mockAddress);
      setSelectedAddress(mockAddress);
      setSelectedAddressId("guest-addr");
      setIsAddressModalOpen(false);
      return;
    }

    setLoading(true);
    try {
      const newAddr = await addresses.create(data);
      await syncWithBackend();
      setIsAddressModalOpen(false);
      toast.success("Dirección agregada", { position: "top-center" });

      if (newAddr && newAddr.id) {
        setSelectedAddressId(newAddr.id);
        setSelectedAddress(newAddr);
      }
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar dirección");
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelected = (id: string) => {
    setSelectedAddressId(id);
    const selected = customer?.addresses?.find((add: Address) => id === add.id);
    if (selected) setSelectedAddress(selected);
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setLoadingCoupon(true);
    setCouponError("");
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const coupon: any = await discounts.validate(couponCode.toUpperCase());
      setAppliedCoupon(coupon as DiscountCoupon);
      toast.success("Cupón aplicado correctamente");
    } catch (error: unknown) {
      setAppliedCoupon(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setCouponError((error as any)?.response?.data?.message || "Cupón inválido o expirado");
    } finally {
      setLoadingCoupon(false);
    }
  };

  const handleWompiPayment = async () => {
    if (items.length === 0) return toast.error("Tu carrito está vacío. Agrega productos antes de pagar.");
    if (!customer?.id && !isGuest) return toast.error("Debes iniciar sesión o continuar como invitado");
    const activeAddressId = isGuest ? (guestAddress ? "guest-addr" : "") : selectedAddressId;
    if (!activeAddressId) return toast.error("Selecciona una dirección de envío");
    if (!receiverData.fullName || !receiverData.idNumber || !receiverData.phone) return toast.error("Completa los datos de quien recibe");

    setLoading(true);
    setShowReset(false);
    setTimeout(() => setShowReset(true), 5000);

    try {
      const amountInCents = Math.floor(total * 100);
      const currency = "COP";

      const activeAddress = isGuest ? guestAddress : customer.addresses?.find((a: Address) => a.id === selectedAddressId);

      // --- CREAR LA ORDEN PRIMERO para usar su ID como reference de Wompi ---
      const orderPayload = {
        userId: isGuest ? undefined : customer.id,
        email: isGuest ? guestEmail : undefined,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId === item.productId ? undefined : item.variantId,
          quantity: item.quantity,
          price: item.price
        })),
        paymentMethod: "WOMPI",
        shippingAddress: activeAddress,
        shippingCost: effectiveShippingCost,
        // El servidor revalida el cupón y calcula el total definitivo; el
        // webhook de Wompi compara el pago contra ese valor.
        couponCode: appliedCoupon?.code
      };

      const api = await import("@/lib/api");
      const newOrder = isGuest
        ? await api.orders.createGuest(orderPayload)
        : await api.orders.create(orderPayload);

      setOrderPlaced(true);

      // Usar el ID de la orden como reference de Wompi — así el webhook lo encuentra directamente
      const reference = newOrder.id;

      const response = await fetch('/api/wompi/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amountInCents, currency })
      });

      if (!response.ok) throw new Error(`Error al obtener firma: ${response.status}`);
      const { signature } = await response.json();

      const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
      if (!publicKey) return setLoading(false);

      // Guardar snapshot del carrito para que /order pueda disparar el evento
      // custom_purchase a Meta con los detalles correctos al volver del redirect.
      sessionStorage.setItem('purchaseItems', JSON.stringify({
        items: items,
        total: total,
      }));

      // URL de retorno: Wompi le agregará ?id={transactionId}&env=... al final.
      // La página /order ya lee internalOrderId + id y dispara trackPurchase con guard key.
      const redirectUrl = `${window.location.origin}/order?internalOrderId=${newOrder.id}`;

      // --- Wompi Web Checkout (redirect completo via FORM submit) ---
      // El widget modal rompía en navegadores in-app de Instagram/Facebook.
      // El Web Checkout es una página externa que funciona en cualquier navegador.
      //
      // La docs de Wompi recomienda usar un FORM con method="GET" (no
      // window.location.href). El navegador serializa los campos correctamente
      // y aparentemente CloudFront/WAF de Wompi no responde igual a una request
      // de window.location.href directo.
      const customerEmail = isGuest ? guestEmail : customer.email;

      const form = document.createElement('form');
      form.method = 'GET';
      form.action = 'https://checkout.wompi.co/p/';
      form.style.display = 'none';

      const addField = (name: string, value: string) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
      };

      addField('public-key', publicKey);
      addField('currency', currency);
      addField('amount-in-cents', String(amountInCents));
      addField('reference', reference);
      addField('signature:integrity', signature);
      addField('redirect-url', redirectUrl);
      addField('customer-data:email', customerEmail);
      addField('customer-data:full-name', receiverData.fullName);
      addField('customer-data:phone-number', receiverData.phone);
      addField('customer-data:phone-number-prefix', '+57');
      addField('customer-data:legal-id', receiverData.idNumber);
      addField('customer-data:legal-id-type', 'CC');

      document.body.appendChild(form);
      form.submit();
    } catch (err) {
      // Antes esto mostraba siempre el mismo texto genérico, así que cuando un
      // cliente decía "no puedo pagar" no quedaba ni rastro de la causa.
      const detail = describeCheckoutError(err);
      console.error("[checkout] fallo iniciando el pago:", detail.log, err);
      trackCheckoutFailure(detail.log);
      toast.error(detail.message);
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (isCod: boolean = false) => {
    if (items.length === 0) return toast.error("Tu carrito está vacío. Agrega productos antes de pagar.");
    if (!customer?.id && !isGuest) return toast.error("Debes iniciar sesión o continuar como invitado");
    const activeAddressId = isGuest ? (guestAddress ? "guest-addr" : "") : selectedAddressId;
    if (!activeAddressId) return toast.error("Selecciona una dirección de envío");
    if (!receiverData.fullName || !receiverData.idNumber || !receiverData.phone) return toast.error("Completa los datos de quien recibe");

    setLoading(true);
    try {
      const activeAddress = isGuest ? guestAddress : customer.addresses?.find((a: Address) => a.id === selectedAddressId);
      
      const orderData = {
        userId: isGuest ? undefined : customer.id,
        email: isGuest ? guestEmail : undefined,
        items: items.map(item => ({
          productId: item.productId,
          variantId: item.variantId === item.productId ? undefined : item.variantId,
          quantity: item.quantity,
          price: item.price
        })),
        total,
        status: "PENDING",
        paymentMethod: isCod ? "CASH_ON_DELIVERY" : "WOMPI",
        shippingAddress: activeAddress,
        shippingCost: effectiveShippingCost,
      };

      const newOrder = isGuest ? await orders.createGuest(orderData) : await orders.create(orderData);

      setOrderPlaced(true);
      clearCart();
      sessionStorage.removeItem('pendingOrder');

      toast.success("Pedido creado con éxito!");
      router.push(`/order?id=${newOrder.id}&status=success${isCod ? '&method=cod' : ''}`);
    } catch (err) {
      console.error(err);
      toast.error("Error al crear el pedido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 min-h-[80vh]">
      <div className="container px-4 max-w-6xl">
        <Link href="/cart" className="flex pb-4 text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" /> Volver
        </Link>
        <h1 className="text-3xl font-source-serif font-semibold font-bold mb-8">Finalizar Compra</h1>

        <div className="mb-6">
          <InAppBrowserNotice />
        </div>

        {/* En móvil el resumen va arriba (patrón de Shopify): abajo quedaba
            debajo del botón de pagar y el cliente nunca veía el costo de envío. */}
        <div className="mb-6">
          <CheckoutSummaryMobile
            items={items}
            subtotal={subtotal}
            shippingCost={effectiveShippingCost}
            total={total}
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponError={couponError}
            loadingCoupon={loadingCoupon}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={() => { setAppliedCoupon(null); setCouponCode(""); }}
            discountAmount={discountAmount}
            shippingKnown={shippingKnown}
            isMounted={isMounted}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* === COLUMNA IZQUIERDA (PASOS) === */}
          <div className="lg:col-span-8 space-y-6">
            <CheckoutAccount customer={customer} guestEmail={guestEmail} setGuestEmail={setGuestEmail} />
            
            <CheckoutAddress 
              customer={customer}
              selectedAddressId={selectedAddressId}
              onSelect={handleAddressSelected}
              onSaveNew={handleSaveAddress}
              isModalOpen={isAddressModalOpen}
              setIsModalOpen={setIsAddressModalOpen}
              loading={loading}
              isGuest={isGuest}
              guestAddress={guestAddress}
            />
            
            <CheckoutReceiver 
              selectedAddressId={selectedAddressId}
              receiverData={receiverData}
              setReceiverData={setReceiverData}
            />
            
            <CheckoutPayment
              allowInteraction={!!(receiverData.fullName && receiverData.idNumber && receiverData.phone)}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              isBogota={isBogota}
              isWompiLoaded={isWompiLoaded}
              isMounted={isMounted}
              loading={loading}
              showReset={showReset}
              setShowReset={setShowReset}
              total={total}
              onWompiPayment={handleWompiPayment}
              onPlaceCodOrder={() => handlePlaceOrder(true)}
            />
          </div>

          {/* === COLUMNA DERECHA (RESUMEN STICKY) === */}
          {/* Oculto en móvil: allí se muestra CheckoutSummaryMobile arriba. */}
          <div className="hidden lg:block lg:col-span-4">
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shippingCost={effectiveShippingCost}
              total={total}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponError={couponError}
              loadingCoupon={loadingCoupon}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => { setAppliedCoupon(null); setCouponCode(""); }}
              discountAmount={discountAmount}
              shippingKnown={shippingKnown}
            />
          </div>
        </div>
      </div>
    </div>
  );
}