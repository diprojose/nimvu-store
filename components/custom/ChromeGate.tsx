"use client";

import { usePathname } from "next/navigation";

/**
 * Oculta el header, el footer y el boton flotante de WhatsApp en las rutas de
 * pago.
 *
 * Es practica habitual en ecommerce: una vez el cliente entra a pagar, cada
 * enlace del menu y del pie es una salida del embudo. En su lugar el checkout
 * monta su propia barra minima con el logo (ver CheckoutHeader), y conserva el
 * enlace "Volver" al carrito, asi que nadie queda atrapado.
 */
const ROUTES_WITHOUT_CHROME = ["/checkout"];

export default function ChromeGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";

  const hidden = ROUTES_WITHOUT_CHROME.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );

  if (hidden) return null;

  return <>{children}</>;
}
