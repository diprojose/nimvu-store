'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'
import { sdk } from '../lib/sdk'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

function OrderConfirmedContent() {
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('id')

  const { cart, clearCart } = useCartStore()

  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [orderId, setOrderId] = useState<string | null>(null)

  useEffect(() => {
    const finalizeOrder = async () => {
      if (!transactionId || !cart?.id) {
        if (!transactionId) setStatus('error')
        return
      }

      try {
        console.log("Procesando pago Wompi:", transactionId)

        // 1. GUARDAR REFERENCIA
        await sdk.store.cart.update(cart.id, {
          metadata: {
            wompi_transaction_id: transactionId,
            payment_method: 'wompi'
          }
        })

        try {
          // 2. GESTIÓN DE PAGO INTERNO
          console.log("Iniciando sesión de pago manual...")
          // Recuperamos carrito fresco
          const { cart: freshCart } = await sdk.store.cart.retrieve(cart.id, {
            fields: '+payment_collection.id,+shipping_methods'
          })

          // 2.1 ASIGNAR METODO DE ENVIO AUTOMATICO (Si no tiene)
          if (!freshCart.shipping_methods || freshCart.shipping_methods.length === 0) {
            console.log("Detectado carrito sin envío. Asignando método por defecto...")
            const { shipping_options } = await sdk.store.fulfillment.listCartOptions({
              cart_id: cart.id
            })

            if (shipping_options.length > 0) {
              const defaultOption = shipping_options[0]
              console.log("Asignando método de envío:", defaultOption.name)

              await sdk.store.cart.addShippingMethod(cart.id, {
                option_id: defaultOption.id
              })

              // Actualizamos freshCart después de añadir envío
              // No es estrictamente necesario volver a pedirlo si initiatePaymentSession 
              // usa el ID, pero la firma pide el objeto cart. 
              // Por seguridad, actualizamos la referencia local o pedimos de nuevo si fuera necesario.
              // Sin embargo, initiatePaymentSession probablemente use solo IDs internos.
              // Vamos a refrescar para pasar el objeto mas actualizado posible.
              const { cart: updatedCart } = await sdk.store.cart.retrieve(cart.id, {
                fields: '+payment_collection.id'
              })
              freshCart.payment_collection = updatedCart.payment_collection
              // Nota: initiatePaymentSesssion pide 'cart', usemos updatedCart
              Object.assign(freshCart, updatedCart)
            } else {
              console.warn("ADVERTENCIA: No hay métodos de envío disponibles para asignar.")
            }
          }

          // En v2 SDK, initiatePaymentSession maneja la creación de la colección si no existe
          // y requiere el objeto 'cart' completo como primer argumento
          await sdk.store.payment.initiatePaymentSession(
            freshCart,
            { provider_id: "pp_system_default" }
          )

        } catch (e) {
          console.error("Error FATAL iniciando colección de pago:", e)
          // Si falla el inicio del pago, NO intentamos completar la orden porque fallará
          throw new Error("No se pudo iniciar la sesión de pago en Medusa")
        }

        // 3. COMPLETAR ORDEN
        console.log("Completando orden...")
        const { type, data } = await sdk.store.cart.complete(cart.id)

        if (type === 'order') {
          console.log("¡Orden creada exitosamente! ID:", data.id)
          setOrderId(data.id)
          setStatus('success')
          clearCart()
        } else {
          console.error("Error completando orden (Medusa rechazó):", data)
          setStatus('error')
        }

      } catch (error) {
        console.error("Error crítico finalizando orden:", error)
        setStatus('error')
      }
    }

    if (status === 'processing') {
      finalizeOrder()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId, cart?.id])

  if (status === 'processing') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <Loader2 className="w-16 h-16 text-gray-400 animate-spin mb-4" />
        <h2 className="text-2xl font-bold">Procesando tu pedido...</h2>
        <p className="text-gray-500 mt-2">Estamos confirmando el pago con el sistema.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <XCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-red-600">Hubo un problema</h2>
        <p className="text-gray-600 max-w-md mb-6">
          El pago se registró en Wompi (Ref: {transactionId}), pero hubo un error interno al crear el pedido.
        </p>
        <div className="bg-orange-50 border border-orange-200 p-4 rounded-lg text-sm text-orange-800 mb-6">
          Toma una captura de esta pantalla y contáctanos por WhatsApp con tu referencia: <strong>{transactionId}</strong>
        </div>
        <Link href="/" className="underline text-gray-500">Volver al inicio</Link>
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
          <span className="font-mono font-bold">{orderId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Ref. Pago:</span>
          <span className="font-mono text-xs">{transactionId}</span>
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