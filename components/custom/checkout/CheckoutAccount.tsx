import React, { FC, ReactElement, useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, CheckCircle2 } from "lucide-react";

export interface CheckoutAccountProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any | null; 
  guestEmail: string;
  setGuestEmail: (email: string) => void;
}

/**
 * Un correo valido de verdad: algo@algo.tld con un TLD de al menos 2 letras.
 * No basta con buscar "@" — con "jose@gmail" se avanzaba y la confirmacion
 * del pedido nunca llegaba a ninguna parte.
 */
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;

export const CheckoutAccount: FC<CheckoutAccountProps> = ({ customer, guestEmail, setGuestEmail }): ReactElement => {
  const [tempEmail, setTempEmail] = useState(guestEmail);
  // Solo se marca en rojo cuando el campo ya perdio el foco: avisar mientras
  // el cliente escribe la primera letra es ruido, no ayuda.
  const [touched, setTouched] = useState(false);

  const trimmedEmail = tempEmail.trim();
  const isValidEmail = EMAIL_RE.test(trimmedEmail);

  // Sin boton: en cuanto el correo es valido se avanza solo. Se hace con un
  // pequeno retraso para no dar el paso por bueno a media escritura (p. ej.
  // "jose@gmail.co" camino a "jose@gmail.com").
  useEffect(() => {
    if (!isValidEmail) return;
    const t = setTimeout(() => setGuestEmail(trimmedEmail), 700);
    return () => clearTimeout(t);
  }, [isValidEmail, trimmedEmail, setGuestEmail]);

  return (
    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          1. Cuenta
        </CardTitle>
      </CardHeader>
      <CardContent>
        {customer ? (
          <div className="flex items-center gap-3 bg-blue-50 p-4 rounded-lg border border-blue-100 text-blue-800">
            <CheckCircle2 className="w-5 h-5" />
            <div>
              <p className="font-medium">Sesión iniciada como {customer.first_name}</p>
              <p className="text-sm opacity-80">{customer.email}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {!guestEmail ? (
              <>
                <form
                  onSubmit={(e) => {
                    // El Enter sigue funcionando y se salta la espera.
                    e.preventDefault();
                    if (isValidEmail) setGuestEmail(trimmedEmail);
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Continuar como invitado</Label>
                    <div className="relative">
                      <Input
                        id="guest-email"
                        type="email"
                        autoComplete="email"
                        placeholder="tu@correo.com"
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        onBlur={() => setTouched(true)}
                        aria-invalid={touched && !!trimmedEmail && !isValidEmail}
                        className={`pr-10 ${touched && trimmedEmail && !isValidEmail ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {isValidEmail && (
                        <CheckCircle2 className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-600" />
                      )}
                    </div>
                    {touched && trimmedEmail && !isValidEmail ? (
                      <p className="text-sm text-red-600" role="alert">
                        Revisa el correo: parece incompleto.
                      </p>
                    ) : (
                      <p className="text-xs text-gray-500">Recibirás la confirmación de tu pedido en este correo.</p>
                    )}
                  </div>
                </form>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-200" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-gray-500">O si ya tienes cuenta</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Link href="/register?redirect=/checkout">
                    <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                  </Link>
                  <Link href="/register?redirect=/checkout">
                    <Button variant="outline" className="w-full bg-gray-50 hover:bg-gray-100">Registrarse</Button>
                  </Link>
                </div>
              </>
            ) : (
               <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex items-center gap-3 text-gray-800">
                  <User className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">Comprando como invitado</p>
                    <p className="text-sm text-gray-500">{guestEmail}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setGuestEmail(''); setTempEmail(''); }} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                  Modificar
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
