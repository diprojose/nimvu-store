import React, { FC, ReactElement } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { User, CheckCircle2 } from "lucide-react";

export interface CheckoutAccountProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any | null; // Tipado temporal hasta tener el Customer type fuerte
}

export const CheckoutAccount: FC<CheckoutAccountProps> = ({ customer }): ReactElement => {
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
          <div className="space-y-4">
            <p className="text-gray-600 text-sm">Para continuar, necesitas identificarte.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link href="/register?redirect=/checkout">
                <Button variant="outline" className="w-full">Iniciar Sesión</Button>
              </Link>
              <Link href="/register?redirect=/checkout">
                <Button className="w-full bg-black text-white hover:bg-gray-800">Registrarse</Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
