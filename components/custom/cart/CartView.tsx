"use client";

import { useEffect, useState, useMemo } from "react";
import { Separator } from "@/components/ui/separator";
import CartProductItem from "@/components/custom/cartProductItem";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { CartItem } from "@/store/cart";
import { useCartStore } from '@/store/cart';
import { Skeleton } from "@/components/ui/skeleton"
import { formatPrice } from "@/lib/utils";

import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { Truck } from "lucide-react";
import { FrontendProduct } from "@/lib/api";
import CartCrossSell from "@/components/custom/cart/CartCrossSell";

export interface CartViewProps {
  /** Sugerencias del carrusel "Completa tu pedido", resueltas en el servidor. */
  crossSellProducts: FrontendProduct[];
}

export default function CartView({ crossSellProducts }: CartViewProps) {
  const [isLoading, setIsLoading] = useState(true);

  const items = useCartStore((state) => state.items);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const { productQuantity, totalProductPrice, totalPrice } = useMemo(() => {
    const qty = items?.reduce((total, item) => total + item?.quantity, 0) || 0;
    const subtotal = getCartSubtotal();
    const total = subtotal;

    return {
      productQuantity: qty,
      totalProductPrice: subtotal,
      totalPrice: total
    };
  }, [items, getCartSubtotal]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-20 min-h-[80vh]">

      {/* TÍTULO */}
      <h1 className="text-3xl md:text-4xl font-source-serif font-semibold text-gray-900 mb-6">
        Carrito de Compras
      </h1>

      <Separator className="mb-8" />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <Skeleton className="h-32 rounded-md w-full" />
          <Skeleton className="h-32 rounded-md w-full" />
        </div>
      ) : items?.length > 0 ? (
        <>
        {/* --- LAYOUT GRID: 2 COLUMNAS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* COLUMNA IZQUIERDA: PRODUCTOS (66% del ancho) */}
          <div className="lg:col-span-8 bg-white rounded-lg border border-gray-100 p-4 md:p-6 divide-y divide-gray-100">
            {items?.map((product: CartItem) => (
              <CartProductItem
                key={product.id}
                item={product}
                cart={true}
              />
            ))}
          </div>

          {/* COLUMNA DERECHA: RESUMEN (33% del ancho) */}
          <div className="lg:col-span-4">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-28 space-y-4">
              <h2 className="text-lg font-bold uppercase tracking-wider font-source-serif text-gray-900">
                Resumen del Pedido
              </h2>

              {/* Barra de envío gratis */}
              <div className="bg-emerald-50/80 border border-emerald-100 p-3 rounded-md">
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1.5">
                  <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                  {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                    <span>¡Tienes <strong>Envío Gratis</strong> en tu pedido!</span>
                  ) : (
                    <span>
                      Te faltan <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)}</strong> para <strong>Envío Gratis</strong>
                    </span>
                  )}
                </div>
                <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                  />
                </div>
              </div>

              <Separator className="bg-gray-200" />

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Productos ({productQuantity})</span>
                  <span>{formatPrice(totalProductPrice)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <p className="text-xs text-gray-500">Impuestos y costo final de envío calculados en el checkout.</p>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/checkout" className="w-full">
                  <Button className="w-full py-6 uppercase tracking-widest font-bold text-xs bg-black hover:bg-gray-800 text-white shadow-md cursor-pointer">
                    Proceder al Pago
                  </Button>
                </Link>

                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full py-6 uppercase tracking-widest font-bold text-xs border-black text-black hover:bg-gray-100 cursor-pointer">
                    Seguir Comprando
                  </Button>
                </Link>
              </div>
            </div>
          </div>

        </div>

        <CartCrossSell products={crossSellProducts} />
        </>

      ) : items?.length === 0 ? (
        // ESTADO VACÍO
        <div className="text-center py-20 flex flex-col items-center justify-center">
          <p className="text-xl text-gray-500 font-light mb-6">
            Tu carrito está vacío.
          </p>
          <Link href="/">
            <Button className="px-8 py-6 uppercase tracking-widest bg-black text-white hover:bg-gray-800">
              Volver a la tienda
            </Button>
          </Link>
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <Skeleton className="h-32 rounded-md w-full" />
          <Skeleton className="h-32 rounded-md w-full" />
        </div>
      )}
    </div>
  );
}