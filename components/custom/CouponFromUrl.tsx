"use client";

import { useEffect } from "react";
import { toast } from "sonner";

import { discounts } from "@/lib/api";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";

const PARAM = "codigo";

/**
 * Activa un cupón desde el enlace: somosnimvu.com/?codigo=NBC15 funciona en
 * cualquier página. El código se valida, se guarda con el carrito y el
 * checkout lo aplica solo.
 *
 * Lee `window.location` en vez de `useSearchParams` para no obligar a envolver
 * todo el layout en un <Suspense>, y no hace ninguna petición si el enlace no
 * trae el parámetro: el home sigue sin peticiones extra.
 */
export default function CouponFromUrl() {
  const setCouponCode = useCartStore((s) => s.setCouponCode);

  useEffect(() => {
    const url = new URL(window.location.href);
    const raw = url.searchParams.get(PARAM)?.trim();
    if (!raw) return;

    // Se quita del enlace para que no quede en la URL compartida ni se vuelva
    // a procesar al recargar. Los demás parámetros (utm_*, fbclid) se conservan.
    url.searchParams.delete(PARAM);
    window.history.replaceState(window.history.state, "", url.toString());

    const code = raw.toUpperCase();
    discounts
      .validate(code)
      .then((coupon: { code: string; type: string; value: number }) => {
        setCouponCode(coupon.code || code);
        const amount =
          coupon.type === "PERCENTAGE" ? `${coupon.value}%` : formatPrice(coupon.value);
        toast.success(`Cupón ${coupon.code || code} activado`, {
          description: `Tienes ${amount} de descuento. Se aplica automáticamente al pagar.`,
          position: "top-center",
        });
      })
      .catch((error: unknown) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const message = (error as any)?.response?.data?.message;
        toast.error(`El cupón ${code} no está disponible`, {
          description: typeof message === "string" ? message : "Puede que haya expirado.",
          position: "top-center",
        });
      });
  }, [setCouponCode]);

  return null;
}
