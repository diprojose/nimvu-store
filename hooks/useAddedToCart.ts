"use client";

import { usePathname } from "next/navigation";
import { useCartUIStore } from "@/store/cartUI";

/**
 * Devuelve la funcion que da feedback al agregar un producto al carrito:
 * abre el drawer con el producto dentro y lo resalta.
 *
 * En /cart no abre el drawer — el carrito ya esta a la vista y superponerle
 * el panel solo tapa lo que el cliente está mirando; alli el producto se
 * resalta en la lista de la propia pagina.
 */
export function useAddedToCart() {
  const pathname = usePathname() || "";
  const notifyAdded = useCartUIStore((state) => state.notifyAdded);

  const isOnCartPage = pathname === "/cart" || pathname.startsWith("/cart/");

  return (itemId: string) => notifyAdded(itemId, !isOnCartPage);
}
