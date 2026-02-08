'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { WompiCart } from '@/types/wompiCart'
import { Address } from '@/types/address'

interface Customer {
  email?: string
  fullName: string
  phone?: string
  idNumber?: string // Asumo que aquí tienes la cédula
}

interface WompiButtonProps {
  cart: WompiCart
  address: Address
  customer: Customer
}

export default function WompiButton({ cart, address, customer }: WompiButtonProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadingPayment, setLoadingPayment] = useState(false)

  // 1. CALCULAMOS LOS VALORES AQUÍ (Para asegurarnos de que existan)
  // Usamos el operador ?. y || para evitar que sean undefined
  const amountInCents = (cart?.total * 100) || 0;
  const currency = cart?.region?.currency_code?.toUpperCase() || 'COP';
  const email = cart?.email;
  const publicKey = process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY_TEST;
  const integrityKey = process.env.NEXT_PUBLIC_WOMPI_INTEGRITY_KEY_TEST;
  // Generamos referencia única
  const reference = cart?.id;

  const handlePayment = () => {
    if (!amountInCents || !reference) {
      console.error("Error Wompi: Faltan datos críticos", { amountInCents, reference, cart })
      alert("Error: No se pudo calcular el total a pagar. Intenta recargar.")
      return
    }

    if (!window.WidgetCheckout) {
      alert('La pasarela de pagos no cargó correctamente.')
      return
    }

    setLoadingPayment(true)

    const checkout = new window.WidgetCheckout({
      currency: currency,
      amountInCents: amountInCents,
      reference: reference,
      publicKey: publicKey,
      signature: {integrity : integrityKey},
      taxInCents: {
        vat: 0,
        consumption: 0
      },
      customerData: { // Opcional
        email: email,
        fullName: customer.fullName,
        phoneNumber: customer.phone,
        phoneNumberPrefix: '+57',
        legalId: customer.idNumber,
        legalIdType: 'CC'
      },
      shippingAddress: { // Opcional
        addressLine1: address?.address_1,
        city: address?.city,
        phoneNumber: address?.phone,
        region: address?.province,
        country: "CO"
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    checkout.open((result: any) => {
      const transaction = result.transaction
      setLoadingPayment(false)
      if (transaction.status === 'APPROVED') {
        console.log("Pago Aprobado", transaction)
      }
    })
  }

  return (
    <div className="w-full">
      <Script
        type="text/javascript"
        src="https://checkout.wompi.co/widget.js"
      ></Script>

      <button
        onClick={handlePayment}
        className='w-full py-4 px-6 rounded-lg font-bold text-white shadow-md transition-all bg-[#2C2A29] hover:bg-black hover:shadow-lg transform hover:-translate-y-0.5'
      >
        Pagar con Wompi
      </button>
    </div>
  )
}

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    WidgetCheckout: any;
  }
}