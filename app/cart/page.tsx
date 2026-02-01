"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { sdk } from "../lib/sdk"; 
import CartProductItem from "@/components/custom/cartProductItem";
import { CartProduct } from "@/types/cartProduct";
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@/components/ui/table"

export default function CartPage() {
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCartStrategy = async () => {
      // 1. ESTRATEGIA DE CACHÉ (VELOCIDAD)
      // Buscamos primero en el navegador
      const localCartData = localStorage.getItem("shopping-cart-storage");
      const cartId = localStorage.getItem("cart_id"); // El ID de Medusa guardado

      // Si hay datos locales, los usamos y CORTAMOS la ejecución aquí.
      // Esto hace que la carga sea instantánea.
      if (localCartData) {
        try {
          const parsedItems = JSON.parse(localCartData);
          if (parsedItems.state.cart.length > 0) {
            setCartProducts(parsedItems.state.cart);
            setIsLoading(false);
            
            // Opcional: En segundo plano, podrías revalidar con la DB si quisieras,
            // pero para tu requerimiento de velocidad, nos quedamos aquí.
            return; 
          }
        } catch (e) {
          console.error("Error leyendo caché local:", e);
          // Si falla el parseo, dejamos que continúe a la DB
        }
      }

      // 2. ESTRATEGIA DE RESPALDO (DB / MEDUSA)
      // Solo llegamos aquí si el localStorage estaba vacío o corrupto
      if (cartId) {
        try {
          const { cart } = await sdk.store.cart.retrieve(cartId, {
            fields: "+items.thumbnail,+items.product_title,+items.variant_title", // Optimización: Traer campos clave
          });

          if (cart && cart.items && cart.items.length > 0) {
            setCartProducts(cart.items);
            
            // AUTO-REPARACIÓN: Guardamos en local para que la próxima vez sea rápido
            localStorage.setItem("nimvu_cart_items", JSON.stringify(cart.items));
          }
        } catch (error) {
          console.error("Error recuperando carrito de Medusa:", error);
        }
      }

      // Terminamos la carga (tenga productos o no)
      setIsLoading(false);
    };

    loadCartStrategy();
  }, []);

  const shippingPrice: number = 12000;

  const totalProductPrice: number = cartProducts.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  const totalPrice: number = cartProducts.reduce((total, item) => {
    return total + (item.price * item.quantity) + shippingPrice;
  }, 0);

  return (
    <div className="container mx-auto max-w-350 sm:py-16 md:py-32 px-16 min-h-220">
      
      {/* TÍTULO */}
      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-italiana text-gray-900">
          Carrito
        </h1>
      </div>

      {/* SEPARADOR SHADCN */}
      <Separator className="my-6 bg-gray-200" />

      {/* CONTENIDO */}
      <div className="space-y-6">
        {isLoading ? (
          // Skeleton loader simple o texto de carga
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-gray-100 rounded-md w-full"></div>
            <div className="h-24 bg-gray-100 rounded-md w-full"></div>
          </div>
        ) : (
          <>
            {cartProducts && cartProducts.length > 0 ? (
              <div className="flex flex-col gap-6">
                {cartProducts.map((product: CartProduct) => (
                  <CartProductItem key={product.id} item={product} />
                ))}
                
                {/* Aquí podrías poner el resumen de totales más abajo */}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500 font-light">
                  No hay productos en tu carrito aún.
                </p>
                {/* Opcional: Botón para volver a la tienda */}
              </div>
            )}
          </>
        )}
      </div>

      <Separator className="my-6 bg-gray-200" />
      {/* TOTAL */}

      <div className="space-y-6">
        <h2 className="text-xl md:text-xl text-gray-900 font-bold">Resumen de compra</h2>
        <Table>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">Productos ({cartProducts.length})</TableCell>
              <TableCell>{totalProductPrice}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Envío</TableCell>
              <TableCell>{shippingPrice}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell className="font-medium">Total</TableCell>
              <TableCell>{totalPrice}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

    </div>
  );
}