'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { CheckCircle } from 'lucide-react'
import { trackPurchase } from '@/lib/analytics'
import type { CartItem } from '@/store/cart'

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const statusParam = searchParams.get('status')
  const methodParam = searchParams.get('method')
  const internalOrderIdParam = searchParams.get('internalOrderId')

  const { clearCart } = useCartStore()
  const [internalOrder, setInternalOrder] = useState<any>(null)

  // ── Purchase tracking ───────────────────────────────────────────────────────
  // Fires custom_purchase ONCE per order. The guard key prevents re-firing
  // if the user reloads the confirmation page.
  useEffect(() => {
    if (!internalOrder?.id) return;

    const guardKey = `purchase_tracked_${internalOrder.id}`;
    if (sessionStorage.getItem(guardKey)) return; // Already tracked

    // Reconstruct items from purchaseItems snapshot (saved before pendingOrder is cleared)
    // or fall back to the still-available pendingOrder (COD flow, first render).
    const snapshotJson = sessionStorage.getItem('purchaseItems') ||
                         sessionStorage.getItem('pendingOrder');
    let purchaseItems = [];
    let orderTotal = internalOrder.total ?? 0;

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
        if (!internalOrder.total && snapshot.total) orderTotal = snapshot.total;
      }
    } catch (_) {
      // fallback: fire without items detail
    }

    trackPurchase({
      orderId: internalOrder.id,
      value: orderTotal,
      items: purchaseItems,
    });

    sessionStorage.setItem(guardKey, '1');
    sessionStorage.removeItem('purchaseItems'); // cleanup
  }, [internalOrder?.id, internalOrder?.total]);
  // ────────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (internalOrder) return;

    if (orderId && internalOrderIdParam && methodParam !== 'cod') {
      // Wompi flow: el webhook de Wompi actualiza el estado en el backend de forma
      // asíncrona. Aquí solo mostramos la confirmación y limpiamos el carrito.
      // No llamamos al backend desde el frontend para evitar problemas de autenticación
      // con usuarios invitados y condiciones de carrera con el webhook.
      clearCart();
      setInternalOrder({ id: internalOrderIdParam, status: "PROCESSING", paymentId: orderId });
    } else if (orderId && !internalOrderIdParam) {
      // COD flow
      setInternalOrder({ id: orderId, status: "CONFIRMED" });
    }
  }, [orderId, internalOrderIdParam, clearCart, internalOrder, methodParam]);

  if (!orderId) {
    return (
      <div className="min-h-[80vh] py-32 flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold">Orden no encontrada</h2>
        <Link href="/" className="underline text-gray-500 mt-4">Volver al inicio</Link>
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
          <span className="font-mono font-bold">{internalOrder?.id || orderId}</span>
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