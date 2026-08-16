import React, { FC, ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, ShieldCheck } from "lucide-react";

export interface ReceiverData {
  fullName: string;
  phone: string;
  idNumber: string;
}

export interface CheckoutReceiverProps {
  selectedAddressId: string;
  receiverData: ReceiverData;
  setReceiverData: (data: ReceiverData) => void;
}

export const CheckoutReceiver: FC<CheckoutReceiverProps> = ({ selectedAddressId, receiverData, setReceiverData }): ReactElement => {
  return (
    <Card className={`shadow-sm border-0 ring-1 ring-gray-200 ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <User className="w-5 h-5" />
          3. ¿Quién recibe el pedido?
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2.5 rounded-md border border-gray-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Datos para la guía de transporte y facturación. El nombre y teléfono se completan con tu dirección.</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiverName">Nombre Completo *</Label>
            <Input
              id="receiverName"
              autoComplete="name"
              placeholder="Ej: José Parejo"
              value={receiverData.fullName}
              onChange={(e) => setReceiverData({ ...receiverData, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiverId">Cédula de Ciudadanía / NIT *</Label>
            <Input
              id="receiverId"
              inputMode="numeric"
              placeholder="Ej: 1020304050"
              value={receiverData.idNumber}
              onChange={(e) => setReceiverData({ ...receiverData, idNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="receiverPhone">Celular de contacto *</Label>
            <Input
              id="receiverPhone"
              type="tel"
              autoComplete="tel"
              placeholder="Ej: 300 123 4567"
              value={receiverData.phone}
              onChange={(e) => setReceiverData({ ...receiverData, phone: e.target.value })}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
