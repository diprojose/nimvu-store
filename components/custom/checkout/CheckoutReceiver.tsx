import React, { FC, ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";

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
        <p className="text-sm text-gray-500">Datos de contacto para la transportadora.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="receiverName">Nombre Completo</Label>
            <Input
              id="receiverName"
              placeholder="Ej: José Parejo"
              value={receiverData.fullName}
              onChange={(e) => setReceiverData({ ...receiverData, fullName: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="receiverId">Cédula / NIT</Label>
            <Input
              id="receiverId"
              placeholder="Para facturación electrónica"
              value={receiverData.idNumber}
              onChange={(e) => setReceiverData({ ...receiverData, idNumber: e.target.value })}
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="receiverPhone">Celular de contacto</Label>
            <Input
              id="receiverPhone"
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
