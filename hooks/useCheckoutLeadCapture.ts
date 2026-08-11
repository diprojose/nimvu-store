"use client";

import { useEffect, useRef } from "react";
import { checkoutLeads } from "@/lib/api";

const SESSION_KEY = "nimvu-checkout-session";
/**
 * Espera a que el cliente deje de escribir antes de mandar. Sin esto se
 * dispararía una petición por cada tecla del campo de correo.
 */
const DEBOUNCE_MS = 2000;

/** Un id por navegador: es la clave con la que el backend hace upsert. */
function getSessionId() {
  let id = localStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

const isEmailValid = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

export interface CheckoutLeadInput {
  email: string;
  phone?: string;
  name?: string;
  shippingAddress?: unknown;
  items: { productId: string; variantId?: string; quantity: number }[];
  /** Deja de capturar cuando el cliente ya creó la orden. */
  disabled?: boolean;
}

/**
 * Guarda el contacto del cliente mientras llena el checkout, antes de que le dé
 * click a pagar.
 *
 * El motivo: de 151 vistas de checkout en 28 días solo 57 llegaron a crear
 * orden. De los ~94 restantes no quedaba absolutamente ningún dato, así que no
 * había forma de cerrarlos por WhatsApp.
 *
 * Deliberadamente no crea una orden: no descuenta stock ni crea usuario.
 */
export function useCheckoutLeadCapture(input: CheckoutLeadInput) {
  const { email, phone, name, shippingAddress, items, disabled } = input;
  // Evita reenviar lo mismo cuando el componente re-renderiza sin cambios
  // reales (el checkout recalcula envío y cupón con frecuencia).
  const lastSent = useRef<string>("");

  useEffect(() => {
    if (disabled) return;
    if (!isEmailValid(email)) return;
    if (!items.length) return;
    // Sin dirección ni teléfono el lead no sirve para contactar a nadie.
    if (!shippingAddress && !phone) return;

    const payload = {
      email,
      phone,
      name,
      shippingAddress,
      items: items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId,
        quantity: i.quantity,
      })),
    };

    const fingerprint = JSON.stringify(payload);
    if (fingerprint === lastSent.current) return;

    const timer = setTimeout(() => {
      lastSent.current = fingerprint;
      void checkoutLeads.capture({ ...payload, sessionId: getSessionId() });
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [email, phone, name, shippingAddress, items, disabled]);
}
