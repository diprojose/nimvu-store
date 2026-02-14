import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

export async function POST(request: Request) {
  try {
    const { reference, amountInCents, currency } = await request.json()
    
    // USAMOS TU LLAVE DE TEST QUEMADA (Para descartar errores de lectura)
    const integritySecret = process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_KEY_TEST;

    // 1. Cadena de concatenación CON Expiración
    // Orden estricto: Referencia + Monto + Moneda + Expiración + Secreto
    const chain = `${reference}${amountInCents}${currency}${integritySecret}`
    
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