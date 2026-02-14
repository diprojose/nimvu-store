/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useState } from 'react'
import Script from 'next/script'
import { WompiCart } from '@/types/wompiCart'
import { Address } from '@/types/address'
import { useCartStore } from "@/store/cartStore";


interface Customer {
  email?: string
  fullName: string
  phone?: string
  idNumber?: string 
}

interface WompiButtonProps {
  cart: WompiCart
  address: Address
  customer: Customer
}

export default function WompiButton({ cart, address, customer }: WompiButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)

  const amountInCents = Math.floor((cart?.total || 0) * 100) 
  const currency = 'COP'
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY_TEST;

  const handlePayment = async () => {
    const reference = `${cart?.id}`

    if (!amountInCents || !cart?.id) {
      alert("Error: Datos del carrito incompletos.")
      return
    }

    if (!window.WidgetCheckout) {
      alert('Error: El script de Wompi no cargó.')
      return
    }

    setLoadingPayment(true)

    try {
      // 2. PEDIR FIRMA AL SERVIDOR (Enviando la expiración)
      const response = await fetch('/api/wompi/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          reference, 
          amountInCents, 
          currency
        })
      });

      if (!response.ok) throw new Error('Error al obtener firma');

      const { signature } = await response.json();
      
      console.log("✅ Firma (con expiración) recibida:", signature);

      // 3. CONFIGURAR WIDGET
      const checkoutOptions = {
        currency: currency,
        amountInCents: amountInCents,
        reference: reference,
        publicKey: publicKey,
        signature: {integrity : signature},
        taxInCents: { vat: 0, consumption: 0 },
        customerData: { 
          email: cart.email,
          fullName: customer.fullName,
          phoneNumber: customer.phone,
          phoneNumberPrefix: '+57',
          legalId: customer.idNumber,
          legalIdType: 'CC'
        }
      };

      console.log("🚀 Abriendo Wompi con:", checkoutOptions);

      const checkout = new window.WidgetCheckout(checkoutOptions)

      checkout.open((result: any) => {
        const transaction = result.transaction
        setLoadingPayment(false)
        if (transaction.status === 'APPROVED') {
          console.log("Pago Aprobado", transaction)
          window.location.href = `/order?id=${transaction.id}`
        }
      })

    } catch (error) {
      console.error("Error en pago:", error);
      alert("Hubo un error iniciando la pasarela.");
      setLoadingPayment(false);
    }
  }

  return (
    <div className="w-full mt-6">
      <Script 
        src="https://checkout.wompi.co/widget.js" 
        strategy="lazyOnload"
        onLoad={() => setIsLoaded(true)}
      />

      <button
        onClick={handlePayment}
        disabled={!isLoaded || loadingPayment}
        className={`w-full py-4 px-6 rounded-lg font-bold text-white shadow-md transition-all
          ${!isLoaded || loadingPayment 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-[#2C2A29] hover:bg-black hover:shadow-lg transform hover:-translate-y-0.5'
          }`}
      >
        {loadingPayment 
          ? 'Conectando...' 
          : isLoaded 
            ? `Pagar $${(amountInCents / 100).toLocaleString('es-CO')}`
            : 'Pagar con Wompi'
        }
      </button>
    </div>
  )
}

declare global {
  interface Window {
    WidgetCheckout: any;
  }
}