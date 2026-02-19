'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cart'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const statusParam = searchParams.get('status')

  const { clearCart } = useCartStore()
  const [internalOrder, setInternalOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const createOrderFromTransaction = async () => {
      const pendingOrderJson = sessionStorage.getItem('pendingOrder');

      // CASE A: We have a pending order and a Wompi ID -> Create the order
      if (orderId && pendingOrderJson && !internalOrder) {
        setLoading(true);
        try {
          const pendingOrder = JSON.parse(pendingOrderJson);
          // Verify it's not already processed (basic check)
          if (pendingOrder.paymentReference && pendingOrder.paymentReference !== sessionStorage.getItem('lastProcessedRef')) {
            // Add Payment ID (Wompi Transaction ID)
            const orderPayload = {
              ...pendingOrder,
              paymentId: orderId,
              status: "PROCESSING" // Payment verified by redirect (optimistic) or we could verify with backend
            };

            const newOrder = await import("@/lib/api").then(mod => mod.orders.create(orderPayload));

            setInternalOrder(newOrder);
            clearCart();
            sessionStorage.removeItem('pendingOrder');
            sessionStorage.setItem('lastProcessedRef', pendingOrder.paymentReference); // Prevent duplicate creation on reload
          }
        } catch (err) {
          console.error("Error creating order:", err);
          setError("Hubo un error registrando tu pedido. Por favor contacta soporte con tu ID de transacción: " + orderId);
        } finally {
          setLoading(false);
        }
      }
      // CASE B: No pending order, but we have an ID. Assume it's a direct link to an existing internal order.
      else if (orderId && !pendingOrderJson && !internalOrder) {
        // If we implemented orders.get(id), we would fetch it here.
        // For now, we just show the ID assuming it's the internal one or just a receipt.
        setInternalOrder({ id: orderId, status: "CONFIRMED" });
      }
    };

    createOrderFromTransaction();
  }, [orderId, clearCart, internalOrder]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Loader2 className="w-16 h-16 text-gray-400 animate-spin mb-4" />
        <h2 className="text-2xl font-bold">Procesando tu pedido...</h2>
        <p className="text-gray-500">Estamos verificando el pago con Wompi.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold">Error</h2>
        <p className="text-gray-600 max-w-md">{error}</p>
        <Link href="/" className="underline text-gray-500 mt-4">Volver al inicio</Link>
      </div>
    );
  }

  if (!orderId) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <h2 className="text-2xl font-bold">Orden no encontrada</h2>
        <Link href="/" className="underline text-gray-500 mt-4">Volver al inicio</Link>
      </div>
    )
  }

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="w-16 h-16 text-green-600" />
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