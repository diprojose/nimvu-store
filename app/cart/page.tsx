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

export default function CartPage() {
  const [isLoading, setIsLoading] = useState(true);

  const items = useCartStore((state) => state.items);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 0);
    return () => clearTimeout(timer);
  }, []); // Only run once on mount

  const { productQuantity, totalProductPrice, totalPrice, shippingPrice } = useMemo(() => {
    const shipping = 12000;
    const qty = items?.reduce((total, item) => total + item?.quantity, 0) || 0;
    const subtotal = getCartSubtotal();
    const total = subtotal + (qty > 0 ? shipping : 0);

    return {
      productQuantity: qty,
      totalProductPrice: subtotal,
      totalPrice: total,
      shippingPrice: shipping
    };
  }, [items, getCartSubtotal]);

  return (
    <div className="container mx-auto max-w-7xl px-4 py-20 min-h-[80vh]">

      {/* TÍTULO */}
      <h1 className="text-3xl md:text-4xl font-italiana text-gray-900 mb-6">
        Carrito de Compras
      </h1>

      <Separator className="mb-8" />

      {isLoading ? (
        <div className="animate-pulse space-y-4">
          <Skeleton className="h-32 rounded-md w-full" />
          <Skeleton className="h-32 rounded-md w-full" />
        </div>
      ) : items?.length > 0 ? (

        // --- LAYOUT GRID: 2 COLUMNAS ---
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* COLUMNA IZQUIERDA: PRODUCTOS (66% del ancho) */}
          <div className="lg:col-span-8 space-y-6">
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
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
              <h2 className="text-lg font-bold uppercase tracking-wider mb-4 font-italiana text-gray-900">
                Resumen del Pedido
              </h2>

              <Separator className="mb-4 bg-gray-300" />

              <div className="space-y-3 text-sm mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Productos ({productQuantity})</span>
                  <span>{formatPrice(totalProductPrice)}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span>{formatPrice(shippingPrice)}</span>
                </div>

                <Separator className="my-2" />

                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="flex flex-col gap-3">
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