"use client";

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart';
import { Button } from '@/components/ui/button';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useAuthRedirect } from "@/lib/hooks/redirect-if-authenticated";

export default function B2BCartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const { isChecking } = useAuthRedirect({
    redirectTo: "/b2b/login",
    condition: "ifUnauthenticated",
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (isChecking || !isMounted) {
    return <div className="min-h-screen bg-[#F8F9FA]" />;
  }

  // Precios base sumando retail price ignorando B2B context
  const subtotalBeforeDiscounts = getCartSubtotal(false);

  // Precios subtotal utilizando los arreglos de volumen evaluados dinamicamente
  const subtotal = getCartSubtotal(true);

  const bulkSavings = subtotalBeforeDiscounts - subtotal;
  const tax = subtotal * 0.19; // 19% IVA (Colombia standard)
  const total = subtotal + tax; // Podría usar getCartTotal(true) + tax


  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        <div className="mb-10">
          <nav className="text-sm font-medium text-gray-500 mb-4">
            <Link href="/b2b" className="hover:text-blue-600 transition-colors">Catálogo</Link>
            <span className="mx-2 text-gray-400">/</span>
            <span className="text-gray-900">Carrito de Proyecto</span>
          </nav>

          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Carrito de Proyecto</h1>
          <p className="text-gray-500 text-lg">
            Revise sus configuraciones de impresión 3D y los precios por volumen.
          </p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-xl p-16 text-center border border-gray-200 shadow-sm mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Su Carrito de Proyecto está vacío</h2>
            <p className="text-gray-500 mb-8 max-w-md mx-auto">
              Comience a agregar componentes industriales a su carrito para ver aplicados automáticamente los descuentos por volumen.
            </p>
            <Link href="/b2b">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 rounded-md text-base">
                Explorar Catálogo Mayorista
              </Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {items.map((item) => {
                let originalItemPrice = item.originalPrice || item.price;
                let displayPrice = originalItemPrice;
                
                if (item.quantity >= 200) {
                  displayPrice = originalItemPrice * 0.75;
                } else if (item.quantity >= 50) {
                  displayPrice = originalItemPrice * 0.80;
                } else if (item.quantity >= 12) {
                  displayPrice = originalItemPrice * 0.90;
                }

                const discountPercentage = originalItemPrice > displayPrice
                  ? Math.round(((originalItemPrice - displayPrice) / originalItemPrice) * 100)
                  : 0;

                return (
                  <div key={item.id} className="bg-white rounded-xl p-6 border border-gray-200 flex flex-col sm:flex-row gap-6 items-start sm:items-center relative">

                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-6 right-6 text-gray-400 hover:text-red-500 transition-colors"
                      title="Eliminar artículo"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>

                    <div className="relative w-24 h-24 bg-gray-100 rounded-md flex-shrink-0 overflow-hidden border border-gray-100">
                      <Image
                        src={item.thumbnail || '/placeholder.jpg'}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 leading-tight mb-1 pr-8">{item.title}</h3>
                      <p className="text-sm text-gray-500 mb-2">SKU: NIM-{item.productId.substring(0, 6).toUpperCase()}</p>

                      {discountPercentage > 0 ? (
                        <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-2 py-1 rounded text-xs font-bold mb-4 border border-green-200">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          Nivel de Volumen Aplicado ({discountPercentage}% Desc)
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-2 bg-gray-100 text-gray-600 px-2 py-1 rounded text-xs font-medium mb-4">
                          <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                          Precio Estándar
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-4 mt-2">
                        <div className="flex border border-gray-200 rounded-md overflow-hidden bg-white">
                          <button
                            className="px-3 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <div className="w-12 flex items-center justify-center font-medium border-x border-gray-200">
                            {item.quantity}
                          </div>
                          <button
                            className="px-3 py-1.5 text-blue-600 hover:bg-blue-50 transition-colors"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-right">
                          {discountPercentage > 0 && (
                            <p className="text-xs text-gray-400 line-through mb-0.5">
                              {formatPrice(item.price)} / unidad
                            </p>
                          )}
                          <p className="font-bold text-gray-900 text-lg leading-none mb-1">
                            {formatPrice(displayPrice)} <span className="text-sm font-normal text-gray-500">/ unidad</span>
                          </p>
                          <p className="text-sm font-bold text-blue-600">
                            Total: {formatPrice(displayPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <Link href="/b2b" className="inline-flex items-center text-blue-600 font-medium mt-6 hover:underline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Continuar Comprando
              </Link>
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-96 flex-shrink-0">
              <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm sticky top-24">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Resumen del Pedido</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal ({items.reduce((acc, item) => acc + item.quantity, 0)} artículos)</span>
                    <span className="font-medium text-gray-900">{formatPrice(subtotalBeforeDiscounts)}</span>
                  </div>

                  {bulkSavings > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Ahorro por Volumen</span>
                      <span className="font-medium">-{formatPrice(bulkSavings)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-600">
                    <span>Envío Estimado</span>
                    <span className="text-sm">Calculado al finalizar la compra</span>
                  </div>

                  <div className="flex justify-between text-gray-600 border-b border-gray-100 pb-4">
                    <span>Impuestos (IVA 19%)</span>
                    <span className="font-medium text-gray-900">{formatPrice(tax)}</span>
                  </div>

                  <div className="flex justify-between items-end pt-2">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-blue-600">{formatPrice(total)}</span>
                      <span className="text-xs font-medium text-gray-400 ml-1">COP</span>
                    </div>
                  </div>
                </div>

                <Link href="/b2b/checkout" className="block w-full">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-6 text-base rounded-md flex items-center justify-center">
                    Proceder al Pago
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>

                <div className="mt-6 bg-blue-50 bg-opacity-50 p-4 rounded-md border border-blue-100 flex items-start gap-3">
                  <div className="text-blue-600 mt-0.5">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 9.2C5 8.77976 5 8.56965 5.08175 8.40918C5.15365 8.26806 5.26806 8.15365 5.40918 8.08175C5.56965 8 5.77976 8 6.2 8H17.8C18.2202 8 18.4303 8 18.5908 8.08175C18.7319 8.15365 18.8464 8.26806 18.9182 8.40918C19 8.56965 19 8.77976 19 9.2V11M5 9.2V17.8C5 18.2202 5 18.4303 5.08175 18.5908C5.15365 18.7319 5.26806 18.8464 5.40918 18.9182C5.56965 19 5.77976 19 6.2 19H17.8C18.2202 19 18.4303 19 18.5908 18.9182C18.7319 18.8464 18.8464 18.7319 18.9182 18.5908C19 18.4303 19 18.2202 19 17.8V11M5 9.2H19M5 11H19M9 5L15 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase">Tiempos de Entrega a Medida</h4>
                    <p className="text-xs text-gray-500 mt-1">Evaluamos cada proyecto de forma individual. El tiempo de producción y entrega se calcula según el volumen exacto de tu pedido para garantizar que cumplamos con los más altos estándares de calidad.</p>
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
                    Pago B2B seguro encriptado
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
                    Soporte técnico directo para sus piezas
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
