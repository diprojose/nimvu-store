"use client";

import React, { FC, ReactElement } from "react";
import { Check } from "lucide-react";
import { useCartUIStore } from "@/store/cartUI";

/**
 * Confirmacion de "producto agregado" dentro del propio carrito.
 *
 * Sustituye al toast flotante que habia antes: al abrirse el drawer sin mas,
 * la accion pasaba demasiado rapido y no se leia como que algo se hubiera
 * agregado.
 *
 * Es solo el mensaje, sin miniatura ni nombre del producto, a proposito: el
 * producto ya aparece (resaltado) en la lista de abajo, y repetirlo aqui daba
 * la sensacion de haberlo agregado dos veces. El banner dice QUE paso; la fila
 * resaltada dice CUAL es.
 */
export const CartAddedBanner: FC = (): ReactElement | null => {
  const lastAddedId = useCartUIStore((state) => state.lastAddedId);

  if (!lastAddedId) return null;

  return (
    <div
      role="status"
      className="shrink-0 flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-5 py-2.5 text-sm font-semibold text-emerald-800 animate-in fade-in slide-in-from-top-2 duration-300"
    >
      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-600">
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
      </span>
      Agregado al carrito
    </div>
  );
};

export default CartAddedBanner;
