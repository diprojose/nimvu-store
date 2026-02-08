'use client'

import { useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/store/cartStore'
import { useSearchParams } from 'next/navigation'
import { CheckCircle } from 'lucide-react' // O tu ícono de check

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const clearCart = useCartStore((state) => state.clearCart)
  
  // Wompi nos manda el ID de la transacción en la URL (?id=...)
  const transactionId = searchParams.get('id')
  // También manda el estado (?env=test o prod)

  useEffect(() => {
    // Si llegamos aquí con un ID de transacción, asumimos éxito por ahora y limpiamos el carrito local
    if (transactionId) {
      clearCart()
    }
  }, [transactionId, clearCart])

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="bg-green-100 p-4 rounded-full mb-6">
        <CheckCircle className="w-16 h-16 text-green-600" />
      </div>
      
      <h1 className="text-3xl font-bold mb-2">¡Gracias por tu compra!</h1>
      <p className="text-gray-600 max-w-md mb-8">
        Estamos procesando tu pago. En breve recibirás un correo con los detalles de tu pedido.
      </p>

      {transactionId && (
        <div className="bg-gray-50 p-4 rounded-md mb-8 text-sm text-gray-500 border border-gray-200">
          Ref de pago: <span className="font-mono text-black">{transactionId}</span>
        </div>
      )}

      <Link 
        href="/"
        className="bg-black text-white px-8 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
      >
        Volver a la tienda
      </Link>
    </div>
  )
}

export default function OrderConfirmedPage() {
  return (
    <Suspense fallback={<div>Verificando pago...</div>}>
      <OrderConfirmedContent />
    </Suspense>
  )
}