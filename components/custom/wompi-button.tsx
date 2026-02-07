// components/checkout/wompi-button.tsx
"use client";

import Script from "next/script";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { generateWompiSignature } from "@/lib/actions/wompi-actions"; // Importa la acción del paso 1
import { sdk } from "../../app/lib/sdk";
import { toast } from "sonner"; // O tu librería de toast

export function WompiButton({ cart, email }: { cart: any; email: string }) {
  const [loading, setLoading] = useState(false);

  // Wompi necesita el monto en centavos (Medusa ya lo guarda así, pero confirma)
  // Si Medusa dice 10000 (y son pesos), para Wompi es 1000000
  const amountInCents = cart.total * 100; 

  const handlePayment = async () => {
    setLoading(true);

    try {
      // 1. Generamos la firma en el servidor
      const signature = await generateWompiSignature(cart.id, amountInCents);

      // 2. Configuramos el Widget
      const checkout = new (window as any).WidgetCheckout({
        currency: "COP",
        amountInCents: amountInCents,
        reference: cart.id, // Usamos el ID del carrito como referencia
        publicKey: process.env.NEXT_PUBLIC_WOMPI_PUBLIC_KEY,
        signature: signature, // La firma de seguridad
        redirectUrl: `${window.location.origin}/checkout/success`, // A donde vuelve el usuario
        customerData: {
          email: email,
          fullName: `${cart.shipping_address?.first_name} ${cart.shipping_address?.last_name}`,
          phoneNumber: cart.shipping_address?.phone,
          legalId: "1234567890", // Opcional o pedir cédula en el checkout
          phoneNumberPrefix: "+57"
        }
      });

      // 3. Abrimos el widget
      checkout.open((result: any) => {
        const transaction = result.transaction;
        
        if (transaction.status === "APPROVED") {
           // Si Wompi responde APPROVED directo en el callback (a veces no pasa y solo redirige)
           completeMedusaOrder(); 
        } else if (transaction.status === "DECLINED") {
           toast.error("El pago fue rechazado.");
           setLoading(false);
        }
      });

    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const completeMedusaOrder = async () => {
    // Aquí le decimos a Medusa "Cierra la orden"
    // NOTA: Debes tener el proveedor "manual" habilitado en tu backend de Medusa
    try {
      await sdk.store.cart.complete(cart.id);
      window.location.href = "/checkout/success"; // Forzar redirección
    } catch (e) {
      console.error("Error cerrando orden en Medusa", e);
    }
  };

  return (
    <>
      <Script src="https://checkout.wompi.co/widget.js" strategy="lazyOnload" />
      
      <Button 
        onClick={handlePayment} 
        className="w-full bg-[#182662] hover:bg-[#111b46] text-white" // Azul Wompi
        disabled={loading}
      >
        {loading ? "Procesando..." : "Pagar con Wompi"}
      </Button>
    </>
  );
}