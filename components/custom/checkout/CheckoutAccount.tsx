import React, { FC, ReactElement, useState } from "react";
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

export const CheckoutAccount: FC<CheckoutAccountProps> = ({ customer, guestEmail, setGuestEmail }): ReactElement => {
  const [tempEmail, setTempEmail] = useState(guestEmail);

  const handleContinueGuest = () => {
    setGuestEmail(tempEmail);
  };

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
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="guest-email">Continuar como invitado</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="guest-email"
                        type="email" 
                        placeholder="tu@correo.com" 
                        value={tempEmail}
                        onChange={(e) => setTempEmail(e.target.value)}
                        className="flex-1"
                      />
                      <Button onClick={handleContinueGuest} disabled={!tempEmail || !tempEmail.includes('@')} className="bg-black text-white hover:bg-gray-800">
                        Continuar
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">Recibirás la confirmación de tu pedido en este correo.</p>
                  </div>
                </div>

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
