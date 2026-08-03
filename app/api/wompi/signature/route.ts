import { NextResponse } from 'next/server'
import crypto from 'node:crypto'

/**
 * Firma de integridad de Wompi. El secreto NUNCA sale de aqui: solo se
 * devuelve el hash.
 *
 * OJO con la variable de entorno: `WOMPI_INTEGRITY_SECRET` es la correcta
 * (solo servidor). `NEXT_PUBLIC_WOMPI_INTEGRITY_KEY` queda como respaldo
 * unicamente para no tumbar los pagos si es la unica configurada, pero Next
 * inyecta cualquier `NEXT_PUBLIC_*` en el bundle del navegador, asi que
 * mientras se use el secreto es publico. Hay que migrarla y borrarla.
 */
export async function POST(request: Request) {
  try {
    const { reference, amountInCents, currency } = await request.json()

    if (!reference || !amountInCents || !currency) {
      return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 })
    }

    const integritySecret = (
      process.env.WOMPI_INTEGRITY_SECRET ||
      process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_KEY ||
      ''
    ).trim()

    if (!integritySecret) {
      console.error('WOMPI_INTEGRITY_SECRET no esta configurado')
      return NextResponse.json({ error: 'Error de configuracion del servidor' }, { status: 500 })
    }

    const chain = `${reference}${amountInCents}${currency}${integritySecret}`
    const signature = crypto.createHash('sha256').update(chain).digest('hex')

    // Solo la firma. Devolver `chain` filtraba el secreto en texto plano.
    return NextResponse.json({ signature })
  } catch (error) {
    console.error('Error generando firma Wompi:', error)
    return NextResponse.json({ error: 'Error generando firma' }, { status: 500 })
  }
}
