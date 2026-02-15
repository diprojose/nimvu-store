import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

export async function POST(request: Request) {
  try {
    const { reference, amountInCents, currency } = await request.json()

    // USAMOS TU LLAVE DE TEST QUEMADA (Para descartar errores de lectura)
    // INTENTAMOS LEER AMBAS VARIABLES COMUNES
    const rawSecret = process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_KEY || process.env.WOMPI_INTEGRITY_SECRET || "";
    const integritySecret = rawSecret.trim(); // IMPORTANT: Trim whitespace

    console.log("🔹 [DEBUG] Generando firma Wompi...");
    console.log("🔹 [DEBUG] Reference:", reference);
    console.log("🔹 [DEBUG] Amount (Items + Shipping):", amountInCents);
    console.log("🔹 [DEBUG] Currency:", currency);
    console.log("🔹 [DEBUG] Secret Prefix:", integritySecret ? integritySecret.substring(0, 7) + "..." : "MISSING");
    console.log("🔹 [DEBUG] Integrity Secret Length:", integritySecret.length);

    // Validate Integrity Secret content
    if (!integritySecret) {
      console.error("❌ WOMPI_INTEGRITY_SECRET is missing!");
      return NextResponse.json({ error: 'Server configuration error: Integrity Secret missing' }, { status: 500 });
    }

    if (integritySecret.startsWith("prv_")) {
      console.warn("⚠️ [WARNING] Your Integrity Secret starts with 'prv_'. This looks like a PRIVATE KEY. You must use the INTEGRITY SECRET (Secreto de Integridad).");
    }

    if (integritySecret !== rawSecret) {
      console.warn("⚠️ [WARNING] The Integrity Secret had leading/trailing whitespace which was removed.");
    }

    // 1. Cadena de concatenación CON Expiración
    // Orden estricto: Referencia + Monto + Moneda + Expiración + Secreto
    const chain = `${reference}${amountInCents}${currency}${integritySecret}`
    const safeChainToLog = `${reference}${amountInCents}${currency}${integritySecret.substring(0, 5)}...`

    console.log("🔹 [DEBUG] FULL CHAIN TO HASH:", safeChainToLog);

    // 2. Generar Hash SHA-256
    const signature = crypto
      .createHash('sha256')
      .update(chain)
      .digest('hex')

    return NextResponse.json({ signature, chain })
  } catch (error) {
    console.error("❌ Error generando firma:", error)
    return NextResponse.json({ error: 'Error generando firma' }, { status: 500 })
  }
}