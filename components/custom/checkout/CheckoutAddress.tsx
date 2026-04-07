import React, { FC, ReactElement } from "react";
import { Address } from "@/types/address";
import AddressForm, { AddressFormData } from "@/components/custom/AddressForm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { MapPin, Plus, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export interface CheckoutAddressProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  customer: any | null;
  selectedAddressId: string;
  onSelect: (id: string) => void;
  onSaveNew: (data: AddressFormData) => Promise<void>;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  loading: boolean;
  isGuest?: boolean;
  guestAddress?: Address | null;
}

export const CheckoutAddress: FC<CheckoutAddressProps> = ({
  customer,
  selectedAddressId,
  onSelect,
  onSaveNew,
  isModalOpen,
  setIsModalOpen,
  loading,
  isGuest,
  guestAddress
}): ReactElement => {
  const isDisabled = !customer && !isGuest;

  return (
    <Card className={`shadow-sm border-0 ring-1 ring-gray-200 ${isDisabled ? 'opacity-50 pointer-events-none' : ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="w-5 h-5" />
          2. Envío
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {customer?.addresses && customer.addresses.length > 0 ? (
          <RadioGroup
            value={selectedAddressId}
            onValueChange={onSelect}
            className="grid grid-cols-1 gap-3"
          >
            {customer.addresses.map((addr: Address) => (
              <div key={addr.id} className={`relative flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-all ${selectedAddressId === addr.id ? 'border-black ring-1 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}>
                <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                <Label htmlFor={addr.id} className="cursor-pointer w-full font-normal">
                  <div className="font-medium text-base">
                    {addr.first_name} {addr.last_name} <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded ml-2">{addr.company || "Casa"}</span>
                  </div>
                  <div className="text-gray-500 text-sm mt-1">{addr.address_1}, {addr.city}</div>
                  <div className="text-gray-500 text-sm">{addr.province}, {addr.postal_code}</div>
                  <div className="text-gray-500 text-sm mt-1">📞 {addr.phone}</div>
                </Label>
              </div>
            ))}
          </RadioGroup>
        ) : isGuest && guestAddress ? (
          <div className="relative flex items-start space-x-3 space-y-0 rounded-md border border-black ring-1 ring-black bg-gray-50 p-4 transition-all">
            <RadioGroup value="guest" className="grid grid-cols-1 gap-3">
              <RadioGroupItem value="guest" id="guest-addr" className="mt-1" checked />
            </RadioGroup>
            <div className="w-full font-normal">
              <div className="font-medium text-base">
                {guestAddress.first_name} {guestAddress.last_name} <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded ml-2">{guestAddress.company || "Casa"}</span>
              </div>
              <div className="text-gray-500 text-sm mt-1">{guestAddress.address_1}, {guestAddress.city}</div>
              <div className="text-gray-500 text-sm">{guestAddress.province}, {guestAddress.postal_code}</div>
              <div className="text-gray-500 text-sm mt-1">📞 {guestAddress.phone}</div>
              <Button variant="link" className="px-0 h-auto mt-2 text-blue-600 flex items-center gap-1" onClick={() => setIsModalOpen(true)}>
                <Edit className="w-3 h-3"/> Editar dirección
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 bg-gray-50 rounded border border-dashed">
            <p className="text-gray-500 mb-2">
              {isGuest ? 'Por favor, ingresa tu dirección de envío.' : 'No tienes direcciones guardadas.'}
            </p>
          </div>
        )}

        {(!isGuest || (isGuest && !guestAddress)) && (
          <div className="pt-2">
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 border-black text-black hover:bg-gray-100" onClick={() => setIsModalOpen(true)}>
                  <Plus className="w-4 h-4" /> {isGuest && !guestAddress ? 'Ingresar dirección' : 'Agregar otra dirección'}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="md:col-span-2">
                  <DialogTitle>{isGuest && !guestAddress ? 'Dirección de envío' : 'Nueva Dirección'}</DialogTitle>
                </DialogHeader>
                <AddressForm
                  initialData={guestAddress || undefined}
                  onSubmit={onSaveNew}
                  loading={loading}
                  onCancel={() => setIsModalOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
