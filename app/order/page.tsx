'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { CheckCircle, Clock, Loader2, XCircle } from 'lucide-react'
import { trackPurchase } from '@/lib/analytics'
import { orders } from '@/lib/api'
import type { CartItem } from '@/store/cart'

type PaymentState = 'checking' | 'approved' | 'pending' | 'declined'

// Wompi redirige apenas termina el intento, pero el webhook que confirma el
// pago puede llegar unos segundos después. Primero se pregunta seguido; si
// tarda (PSE y Nequi pueden demorar minutos), se sigue preguntando más espaciado.
const FAST_POLL_MS = 2000
const FAST_POLL_UNTIL_MS = 40_000
const SLOW_POLL_MS = 10_000
const GIVE_UP_MS = 10 * 60_000

const WHATSAPP_NUMBER = '573123478307'

const btnPrimary =
  'bg-[#2C2A29] text-white px-8 py-3 rounded-md font-medium hover:bg-black transition-colors text-center'
const btnSecondary =
  'border border-gray-300 text-gray-900 px-8 py-3 rounded-md font-medium hover:border-black transition-colors text-center'

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const methodParam = searchParams.get('method')
  const internalOrderIdParam = searchParams.get('internalOrderId')
  const isWompi = !!(orderId && internalOrderIdParam && methodParam !== 'cod')

  const { clearCart } = useCartStore()
  // El pago contra entrega no pasa por la pasarela: la orden ya está confirmada.
  const [payment, setPayment] = useState<PaymentState>(isWompi ? 'checking' : 'approved')
  const [total, setTotal] = useState<number | null>(null)

  const confirmedOrderId = isWompi ? internalOrderIdParam : orderId

  // ── Estado real del pago ──────────────────────────────────────────────────
  // Antes esta página decía "¡Pedido Confirmado!" y vaciaba el carrito apenas
  // Wompi redirigía, también cuando el pago se RECHAZABA: el cliente creía que
  // había comprado, no le llegaba nada y para reintentar tenía que armar el
  // carrito otra vez.
  useEffect(() => {
    if (!isWompi || !internalOrderIdParam) return
    let cancelled = false
    let timer: ReturnType<typeof setTimeout>
    const startedAt = Date.now()

    const poll = async () => {
      const elapsed = Date.now() - startedAt
      try {
        const res = await orders.paymentStatus(internalOrderIdParam)
        if (cancelled) return
        if (res.status !== 'pending') {
          setTotal(res.total)
          setPayment(res.status)
          return
        }
        if (elapsed > FAST_POLL_UNTIL_MS) setPayment('pending')
      } catch {
        // Un fallo de red no cambia nada: se vuelve a preguntar.
        if (elapsed > FAST_POLL_UNTIL_MS) setPayment('pending')
      }
      if (elapsed < GIVE_UP_MS) {
        timer = setTimeout(poll, elapsed < FAST_POLL_UNTIL_MS ? FAST_POLL_MS : SLOW_POLL_MS)
      }
    }

    poll()
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [isWompi, internalOrderIdParam])

  // El carrito se vacía solo con el pago confirmado: si lo rechazan, el
  // cliente reintenta con todo lo que ya había elegido.
  useEffect(() => {
    if (payment === 'approved' && confirmedOrderId) clearCart()
  }, [payment, confirmedOrderId, clearCart])

  // ── Purchase tracking ───────────────────────────────────────────────────────
  // Fires custom_purchase ONCE per order, and only for paid orders: a declined
  // payment used to count as a sale in Meta and GA.
  useEffect(() => {
    if (payment !== 'approved' || !confirmedOrderId) return;

    const guardKey = `purchase_tracked_${confirmedOrderId}`;
    if (sessionStorage.getItem(guardKey)) return; // Already tracked

    // Reconstruct items from purchaseItems snapshot (saved before pendingOrder is cleared)
    // or fall back to the still-available pendingOrder (COD flow, first render).
    const snapshotJson = sessionStorage.getItem('purchaseItems') ||
                         sessionStorage.getItem('pendingOrder');
    let purchaseItems = [];
    let orderTotal = total ?? 0;

    try {
      if (snapshotJson) {
        const snapshot = JSON.parse(snapshotJson);
        const rawItems = snapshot.items || [];
        purchaseItems = rawItems.map((item: CartItem) => ({
          item_id: item.productId,
          item_name: item.title,
          price: item.price,
          quantity: item.quantity,
        }));
        if (!orderTotal && snapshot.total) orderTotal = snapshot.total;
      }
    } catch (_) {
      // fallback: fire without items detail
    }

    trackPurchase({
      orderId: confirmedOrderId,
      value: orderTotal,
      items: purchaseItems,
    });

    sessionStorage.setItem(guardKey, '1');
    sessionStorage.removeItem('purchaseItems'); // cleanup
  }, [payment, confirmedOrderId, total]);
  // ────────────────────────────────────────────────────────────────────────────

  if (!orderId) {
    return (
      <div className="min-h-[80vh] py-32 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold">Orden no encontrada</h2>
        <Link href="/" className="underline text-gray-500 mt-4">Volver al inicio</Link>
      </div>
    )
  }

  const shortId = (confirmedOrderId ?? '').slice(0, 8)
  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, intenté pagar mi pedido #${shortId} en la web y no pude. ¿Me ayudan a terminar la compra?`,
  )}`

  if (payment === 'checking') {
    return (
      <div className="min-h-[80vh] py-32 flex flex-col items-center justify-center text-center px-4" role="status">
        <Loader2 className="w-12 h-12 text-gray-400 animate-spin mb-6 motion-reduce:animate-none" aria-hidden="true" />
        <h1 className="text-2xl font-bold mb-2">Confirmando tu pago...</h1>
        <p className="text-gray-600 max-w-md">Esto toma unos segundos. No cierres esta página.</p>
      </div>
    )
  }

  if (payment === 'declined') {
    return (
      <div className="min-h-[80vh] py-32 flex flex-col items-center justify-center text-center px-4">
        <div className="bg-red-50 p-4 rounded-full mb-8">
          <XCircle className="w-20 h-20 text-red-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Tu pago no se completó</h1>
        <p className="text-gray-600 max-w-md mb-6">
          El pago fue rechazado, así que no se hizo ningún cobro. Tus productos siguen en el carrito para que lo intentes de nuevo.
        </p>
        <ul className="text-left text-sm text-gray-700 max-w-md mb-8 space-y-2 list-disc pl-5">
          <li>Si pagaste con <strong>Nequi</strong>, acepta la notificación en tu celular antes de que expire.</li>
          <li>Con <strong>PSE</strong>, elige &ldquo;Transferencia&rdquo;, tu banco, tu documento y marca las dos casillas para que se habilite el botón.</li>
          <li>Si tu <strong>tarjeta</strong> fue rechazada, prueba con otro medio: muchos bancos bloquean las compras en línea por seguridad.</li>
        </ul>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <Link href="/checkout" className={`${btnPrimary} flex-1`}>Intentar de nuevo</Link>
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`${btnSecondary} flex-1`}>
            Pagar por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  if (payment === 'pending') {
    return (
      <div className="min-h-[80vh] py-32 flex flex-col items-center justify-center text-center px-4" role="status">
        <div className="bg-amber-50 p-4 rounded-full mb-8">
          <Clock className="w-20 h-20 text-amber-600" aria-hidden="true" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Tu pago está en proceso</h1>
        <p className="text-gray-600 max-w-md mb-8">
          Algunos bancos y Nequi tardan unos minutos en confirmar. Te enviaremos un correo apenas se apruebe; esta página también se actualizará sola.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={`${btnSecondary} flex-1`}>
            Escríbenos por WhatsApp
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] py-32 flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-4 rounded-full mb-8">
        <CheckCircle className="w-20 h-20 text-green-600" />
      </div>

      <h1 className="text-3xl font-bold mb-2">¡Pedido Confirmado!</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Muchas gracias por tu compra. Hemos recibido tu pedido correctamente.
      </p>

      <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left max-w-sm w-full border border-gray-200 shadow-sm">
        <div className="flex justify-between mb-2">
          <span className="text-gray-500">Orden #:</span>
          <span className="font-mono font-bold">{confirmedOrderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Estado:</span>
          <span className="font-mono text-xs text-green-600 font-bold uppercase">Confirmado</span>
        </div>
      </div>

      <Link
        href="/"
        className="bg-[#2C2A29] text-white px-8 py-3 rounded-md font-medium hover:bg-black transition-colors shadow-lg"
      >
        Seguir comprando
      </Link>
    </div>
  )
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  )
}
