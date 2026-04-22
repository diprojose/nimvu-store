"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils";
import { useAuthRedirect } from "@/lib/hooks/redirect-if-authenticated";
import { toast } from "sonner";
import { AlertCircle, ShieldCheck } from "lucide-react";

export default function B2BCheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clearCart);
  const customer = useAuthStore((state) => state.customer);
  const [loading, setLoading] = useState(false);

  // Form State
  // Removed shippingMethod and paymentMethod state as they are no longer user-selectable
  // const [shippingMethod, setShippingMethod] = useState("standard");
  // const [paymentMethod, setPaymentMethod] = useState("wire");

  // Pre-fill from customer if available
  const [formData, setFormData] = useState({
    companyName: '',
    taxId: '',
    address: '',
    contactName: '',
    email: '',
  });

  const { isChecking } = useAuthRedirect({
    redirectTo: "/b2b/login",
    condition: "ifUnauthenticated",
  });

  useEffect(() => {
    setIsMounted(true);
    if (customer) {
      setFormData({
        companyName: customer.companyName || '',
        taxId: customer.taxId || '',
        address: customer.addresses?.[0]?.address_1 || '',
        contactName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim(),
        email: customer.email || '',
      });
    }
  }, [customer]);

  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  if (isChecking || !isMounted) {
    return <div className="min-h-screen bg-[#F8F9FA]" />;
  }

  const subtotalBeforeDiscounts = getCartSubtotal(false);
  const currentSubtotal = getCartSubtotal(true);
  const bulkSavings = subtotalBeforeDiscounts - currentSubtotal;

  // En B2B, el envío suele cotizarse aparte o no se cobra por defecto en esta vista
  const shippingCost = 0;

  const tax = currentSubtotal * 0.19;
  const total = currentSubtotal + shippingCost + tax;

  const handlePlaceOrder = async () => {
    if (!formData.companyName || !formData.contactName || !formData.email) {
      toast.error("Por favor, complete toda la información requerida de la empresa");
      return;
    }

    setLoading(true);

    // Simulate API call for B2B Order Creation
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      clearCart();
      toast.success("¡Pedido corporativo realizado con éxito!");
      router.push("/b2b/profile?tab=orders");
    } catch (err) {
      toast.error("Error al realizar el pedido. Por favor, inténtelo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        <div className="mb-10">
          <nav className="text-sm font-medium text-gray-500 mb-4 flex items-center">
            <Link href="/b2b/cart" className="hover:text-blue-600 transition-colors">Carrito</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">Pago</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Pago B2B</h1>
          <p className="text-gray-500 text-lg">
            Revise los detalles de su pedido comercial y complete la compra.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Checkout Form */}
          <div className="flex-1 space-y-10">

            {/* 1. Billing Info */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">1</div>
                <h2 className="text-2xl font-bold text-gray-900">Información de Empresa y Facturación</h2>
              </div>
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Razón Social</label>
                  <Input
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ej. Nimvu Additive Tech SAS"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">NIT</label>
                  <Input
                    value={formData.taxId}
                    onChange={e => setFormData({ ...formData, taxId: e.target.value })}
                    placeholder="900.123.456-7"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-semibold text-gray-700">Dirección de Facturación Corporativa</label>
                  <Input
                    value={formData.address}
                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Oficina 400, Parque Industrial"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Nombre de Contacto</label>
                  <Input
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Alex Rivera"
                    className="bg-gray-50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Correo Electrónico Laboral</label>
                  <Input
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="compras@empresa.com"
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </section>

            {/* 2. Shipping Method */}
            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">2</div>
                <h2 className="text-2xl font-bold text-gray-900">Método de Envío</h2>
              </div>
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex gap-4 text-blue-800">
                <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold mb-1">El envío se calculará posteriormente</h3>
                  <p className="text-sm">
                    Los métodos de envío y sus tiempos de entrega pueden variar según la cantidad exacta de productos en su pedido y su ubicación. Un ejecutivo de cuenta se comunicará con usted para coordinar la mejor opción logística.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">3</div>
                <h2 className="text-2xl font-bold text-gray-900">Método de Pago</h2>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center">
                    <span className="font-extrabold tracking-tighter text-[#0f265c] text-2xl">wompi</span>
                    <span className="w-2 h-2 rounded-full bg-blue-500 ml-0.5 mt-2"></span>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-0">
                  El pago se procesará de forma totalmente segura a través de <strong>Wompi</strong>. No almacenamos ninguna información financiera en nuestros servidores. Será redirigido a la pasarela de pago al realizar el pedido.
                </p>
              </div>
            </section>

          </div>

          {/* Order Summary Sidebar */}
          <div className="w-full lg:w-96 flex-shrink-0">
            <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm sticky top-24">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 h-16 bg-gray-100 rounded border border-gray-200 flex-shrink-0 overflow-hidden relative">
                    <Image src={item.thumbnail || '/placeholder.jpg'} alt={item.title} fill className="object-cover" unoptimized />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                    <p className="font-bold text-blue-600 text-sm mt-1">{formatPrice(item.price * item.quantity)}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 pt-6 space-y-4 mb-6">
              <div className="flex justify-between text-gray-600 text-sm">
                <span>Subtotal</span>
                <span className="font-medium text-gray-900">{formatPrice(subtotalBeforeDiscounts)}</span>
              </div>

              {bulkSavings > 0 && (
                <div className="flex justify-between text-green-600 text-sm">
                  <span>Ahorro por Volumen</span>
                  <span className="font-medium">-{formatPrice(bulkSavings)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600 text-sm">
                <span>Envío</span>
                <span className="font-medium text-gray-900">Por calcular</span>
              </div>

              <div className="flex justify-between text-gray-600 text-sm border-b border-gray-100 pb-4">
                <span>Impuestos (IVA 19%)</span>
                <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
              </div>

              <div className="flex justify-between flex-col gap-2 pt-2">
                <span className="text-xl font-bold text-gray-900">Total</span>
                <span className="text-3xl font-bold text-blue-600 text-right">{formatPrice(total)}</span>
              </div>
            </div>

            <Button
              onClick={handlePlaceOrder}
              disabled={loading || items.length === 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 text-base rounded-md"
            >
              {loading ? "Procesando..." : "Proceder al Pago Seguro →"}
            </Button>
            <p className="text-[10px] text-center uppercase tracking-widest text-gray-400 font-bold mt-4">Transacción B2B Segura</p>

            <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-gray-900">Garantía Enterprise</h4>
                <p className="text-xs text-gray-500 mt-1">Todo el hardware industrial incluye una garantía de fabricación de 2 años y soporte técnico prioritario.</p>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div >
  );
}
