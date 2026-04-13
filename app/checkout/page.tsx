"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cart";
import { orders, addresses, shipping, discounts } from "@/lib/api";
import { trackPurchase } from "@/lib/analytics";
import { Address } from "@/types/address";

import { CheckoutAccount } from "@/components/custom/checkout/CheckoutAccount";
import { CheckoutAddress } from "@/components/custom/checkout/CheckoutAddress";
import { CheckoutReceiver, ReceiverData } from "@/components/custom/checkout/CheckoutReceiver";
import { CheckoutPayment } from "@/components/custom/checkout/CheckoutPayment";
import { CheckoutSummary, DiscountCoupon } from "@/components/custom/checkout/CheckoutSummary";
import { AddressFormData } from "@/components/custom/AddressForm";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WidgetCheckout: any;
  }
}

export default function CheckoutPage() {
  const { customer, syncWithBackend } = useAuthStore();
  const { items, getCartTotal, getCartSubtotal, clearCart } = useCartStore();
  const router = useRouter();

  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<Address | undefined>();
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [isWompiLoaded, setIsWompiLoaded] = useState(false);
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

  const total = isMounted ? Math.max(0, (getCartTotal() - discountAmount + shippingCost)) : 0;
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
    if (window.WidgetCheckout) setIsWompiLoaded(true);

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
    if (!customer?.id && !isGuest) return toast.error("Debes iniciar sesión o continuar como invitado");
    const activeAddressId = isGuest ? (guestAddress ? "guest-addr" : "") : selectedAddressId;
    if (!activeAddressId) return toast.error("Selecciona una dirección de envío");
    if (!receiverData.fullName || !receiverData.idNumber || !receiverData.phone) return toast.error("Completa los datos de quien recibe");
    if (!window.WidgetCheckout) return toast.error("Error: La pasarela de pagos no cargó correctamente. Recarga la página.");

    setLoading(true);
    setShowReset(false);
    setTimeout(() => setShowReset(true), 5000);

    try {
      const amountInCents = Math.floor(total * 100);
      const currency = "COP";
      const reference = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

      const response = await fetch('/api/wompi/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference, amountInCents, currency })
      });

      if (!response.ok) throw new Error(`Error al obtener firma: ${response.status}`);
      const { signature } = await response.json();

      const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY;
      if (!publicKey) return setLoading(false);

      const activeAddress = isGuest ? guestAddress : customer.addresses?.find((a: Address) => a.id === selectedAddressId);

      // --- GUARDE LA ORDEN ANTES DE ABRIR WOMPI ---
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
        shippingCost
      };

      const api = await import("@/lib/api");
      const newOrder = isGuest
        ? await api.orders.createGuest(orderPayload)
        : await api.orders.create(orderPayload);
      
      // Save item data for tracking before redirect
      sessionStorage.setItem('purchaseItems', JSON.stringify({
        items: items,
        total: total,
      }));

      // No guardaremos pendingOrder local, ya está en DB.
      const redirectUrl = `${window.location.origin}/order?internalOrderId=${newOrder.id}`;

      const checkoutOptions = {
        currency,
        amountInCents,
        reference,
        publicKey,
        signature: { integrity: signature },
        taxInCents: { vat: 0, consumption: 0 },
        redirectUrl: redirectUrl, // En caso de que Wompi obligue full redirect
        customerData: {
          email: isGuest ? guestEmail : customer.email,
          fullName: receiverData.fullName,
          phoneNumber: receiverData.phone,
          phoneNumberPrefix: '+57',
          legalId: receiverData.idNumber,
          legalIdType: 'CC'
        }
      };

      const checkout = new window.WidgetCheckout(checkoutOptions);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      checkout.open((result: any) => {
        const transaction = result.transaction;
        if (transaction.status === 'APPROVED') {
          toast.success("Pago Aprobado! Confirmando orden...");

          // Disparar evento purchase inmediatamente cuando Wompi confirma el pago,
          // antes de cualquier redirect o llamada al backend. Así Meta recibe el
          // evento aunque falle algo posterior (P2024, error de red, etc.)
          const guardKey = `purchase_tracked_${newOrder.id}`;
          if (!sessionStorage.getItem(guardKey)) {
            trackPurchase({
              orderId: newOrder.id,
              value: total,
              items: items.map(item => ({
                item_id: item.productId,
                item_name: item.title,
                price: item.price,
                quantity: item.quantity,
              })),
            });
            sessionStorage.setItem(guardKey, '1');
          }

          // Callback JS redirect
          window.location.href = `/order?id=${transaction.id}&internalOrderId=${newOrder.id}`;
        } else if (transaction.status === 'DECLINED') {
          toast.error("Pago rechazado");
          setLoading(false);
        } else if (transaction.status === 'ERROR') {
          toast.error("Error en la transacción");
          setLoading(false);
        } else {
           // En caso de que el usuario cierre el iframe de wompi sin pagar
           setLoading(false);
           toast.info("Pago cancelado. Puedes reintentar.");
        }
      });
    } catch (err) {
      console.error(err);
      toast.error("Error iniciando el pago. Intenta de nuevo.");
      setLoading(false);
    }
  };

  const handlePlaceOrder = async (isCod: boolean = false) => {
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
        shippingCost,
      };

      const newOrder = isGuest ? await orders.createGuest(orderData) : await orders.create(orderData);
      
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
      <Script
        src="https://checkout.wompi.co/widget.js"
        strategy="lazyOnload"
        onLoad={() => setIsWompiLoaded(true)}
        onReady={() => { if (window.WidgetCheckout) setIsWompiLoaded(true); }}
        onError={() => {
          toast.error("Error cargando la pasarela de pagos. Por favor recarga la página.");
          setLoading(false);
        }}
      />
      <div className="container px-4 max-w-6xl">
        <Link href="/cart" className="flex pb-4 text-gray-500 hover:text-black transition-colors">
          <ArrowLeft className="w-5 h-5 mr-1" /> Volver
        </Link>
        <h1 className="text-3xl font-italiana font-bold mb-8">Finalizar Compra</h1>

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
          <div className="lg:col-span-4">
            <CheckoutSummary
              items={items}
              subtotal={subtotal}
              shippingCost={shippingCost}
              total={total}
              couponCode={couponCode}
              setCouponCode={setCouponCode}
              couponError={couponError}
              loadingCoupon={loadingCoupon}
              appliedCoupon={appliedCoupon}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={() => { setAppliedCoupon(null); setCouponCode(""); }}
              discountAmount={discountAmount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}