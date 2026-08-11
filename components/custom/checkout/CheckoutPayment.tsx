import React, { FC, ReactElement } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CreditCard, RefreshCw } from "lucide-react";
import { formatPrice } from "@/lib/utils";

/**
 * Solo métodos que Wompi procesa de verdad en Colombia. En public/payment/ hay
 * además PayPal, Apple Pay y Google Pay: no se muestran a propósito, porque
 * prometerlos en el checkout y que no aparezcan en la pasarela genera reclamos.
 *
 * Para agregar PSE, Daviplata o Bancolombia basta con dejar el SVG en
 * public/payment/ y sumar una línea a esta lista.
 */
const PAYMENT_METHODS = [
  { src: "/payment/payment-01.svg", alt: "Visa", width: 66, height: 22 },
  { src: "/payment/payment-03.svg", alt: "Mastercard", width: 66, height: 22 },
  { src: "/payment/nequi-2.svg", alt: "Nequi", width: 66, height: 22 },
];

export interface CheckoutPaymentProps {
  allowInteraction: boolean;
  paymentMethod: "wompi" | "cod";
  setPaymentMethod: (method: "wompi" | "cod") => void;
  isBogota: boolean;
  isWompiLoaded: boolean;
  isMounted: boolean;
  loading: boolean;
  showReset: boolean;
  setShowReset: (val: boolean) => void;
  total: number;
  onWompiPayment: () => void;
  onPlaceCodOrder: () => void;
}

export const CheckoutPayment: FC<CheckoutPaymentProps> = ({
  allowInteraction,
  paymentMethod,
  setPaymentMethod,
  isBogota,
  isWompiLoaded,
  isMounted,
  loading,
  showReset,
  setShowReset,
  total,
  onWompiPayment,
  onPlaceCodOrder
}): ReactElement => {
  return (
    <Card className={`shadow-sm border-0 ring-1 ring-gray-200 ${!allowInteraction ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CreditCard className="w-5 h-5" />
          4. Pago
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
          <p className="text-sm text-blue-800">
            {paymentMethod === 'wompi'
              ? "Serás redirigido a la pasarela de pagos segura de Wompi Bancolombia para completar tu transacción."
              : "Pagarás el total de tu pedido al momento de recibirlo en tu domicilio en Bogotá."}
          </p>
        </div>

        {isBogota && (
          <div className="mb-6 space-y-3">
            <Label className="text-base font-semibold">Método de Pago</Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val as 'wompi' | 'cod')}
              className="grid grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <div className={`relative flex items-center space-x-3 rounded-md border p-4 transition-all ${paymentMethod === 'wompi' ? 'border-black ring-1 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}>
                <RadioGroupItem value="wompi" id="wompi" />
                <Label htmlFor="wompi" className="cursor-pointer font-medium w-full">Pago Online (Wompi)</Label>
              </div>
              <div className={`relative flex items-center space-x-3 rounded-md border p-4 transition-all ${paymentMethod === 'cod' ? 'border-black ring-1 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}>
                <RadioGroupItem value="cod" id="cod" />
                <Label htmlFor="cod" className="cursor-pointer font-medium w-full">Pago Contra Entrega</Label>
              </div>
            </RadioGroup>
          </div>
        )}

        {paymentMethod === 'wompi' ? (
          <Button
            onClick={onWompiPayment}
            className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg mt-4"
            disabled={loading || !isWompiLoaded || !isMounted}
          >
            {loading ? "Procesando..." : (isMounted ? `Pagar con Wompi ${formatPrice(total)}` : "Cargando...")}
          </Button>
        ) : (
          <Button
            onClick={onPlaceCodOrder}
            className="w-full bg-black text-white hover:bg-gray-800 py-6 text-lg mt-4"
            disabled={loading || !isMounted}
          >
            {loading ? "Procesando..." : `Confirmar Pedido (Pago al recibir ${formatPrice(total)})`}
          </Button>
        )}

        {loading && showReset && (
          <div className="text-center mt-3 animate-fade-in">
            <button
              onClick={() => {
                setShowReset(false);
                // Parent should handle loading reset if needed, we assume it's exposed or we hack it
              }}
              className="text-sm text-red-500 hover:text-red-700 underline flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              ¿Cerraste la ventana de pago? Da clic para reiniciar UI (no cancela el proceso Wompi subyacente)
            </button>
          </div>
        )}

        <div className="mt-6">
          <p className="text-center text-xs text-gray-500 mb-3">
            Métodos de pago aceptados
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.src}
                title={method.alt}
                className="flex items-center justify-center h-11 w-20 rounded-lg border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
              >
                <Image
                  src={method.src}
                  alt={method.alt}
                  width={method.width}
                  height={method.height}
                  className="object-contain max-h-6 w-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
