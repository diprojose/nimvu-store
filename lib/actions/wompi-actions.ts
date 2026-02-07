// lib/actions/wompi-actions.ts
"use server";

import { createHash } from "crypto";

export async function generateWompiSignature(cartId: string, amountInCents: number) {
  // OJO: El monto debe ser en CENTAVOS (Ej: $10.000 COP -> 1000000)
  // Wompi usa la cadena: "Referencia + MontoEnCentavos + Moneda + SecretoIntegridad"
  
  const currency = "COP";
  const integritySecret = process.env.WOMPI_INTEGRITY_SECRET; // Pon esto en tu .env

  const chain = `${cartId}${amountInCents}${currency}${integritySecret}`;
  
  const signature = createHash("sha256").update(chain).digest("hex");

  return signature;
}