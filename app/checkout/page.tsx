"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useCartStore } from "@/store/cartStore";
import { sdk } from "../lib/sdk"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, MapPin, User, CreditCard, Plus, ArrowLeft  } from "lucide-react";
import { Address } from "@/types/address"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import WompiButtonProps from "@/components/custom/wompi-button";
import { WompiCart } from "@/types/wompiCart";
import { CartItem } from "@/types/cartItem";


export default function CheckoutPage() {
  const { customer, syncWithBackend } = useAuthStore();
  const { cart } = useCartStore();
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedAddress, setSelectedAddress] = useState<Address>();
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const shipping = 12000;
  const subtotal = cart?.subtotal;
  const total = cart?.total;
  const [receiverData, setReceiverData] = useState({
    fullName: "",
    phone: "",
    idNumber: "" 
  });
  
  
  useEffect(() => {
    if (customer?.addresses && customer?.addresses?.length > 0) {
      setSelectedAddressId(customer?.addresses?.[0].id);
      setSelectedAddress(customer?.addresses?.[0]);
    }
  }, [customer?.addresses]);

  const [newAddress, setNewAddress] = useState({
    first_name: "",
    last_name: "",
    address_1: "",
    company: "",
    postal_code: "",
    city: "",
    country_code: "co",
    province: "",
    phone: "",
  });

  // Handlers

  const handleChange = (field: string, value: string) => {
    setNewAddress((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddAddress = async () => {
    setLoading(true);
    try {
      sdk.store.customer.createAddress({
        first_name: newAddress.first_name,
        last_name: newAddress.last_name,
        address_1: newAddress.address_1,
        company: newAddress.company,
        postal_code: newAddress.postal_code,
        city: newAddress.city,
        country_code: newAddress.country_code,
        province: newAddress.province,
        phone: newAddress.phone,
      })
      .then(({ customer }) => {
        syncWithBackend();
        setIsAddressModalOpen(false);
        setNewAddress({
          first_name: "",
          last_name: "",
          address_1: "",
          company: "",
          postal_code: "",
          city: "",
          country_code: "co",
          province: "",
          phone: "",
        })
        toast.success("Dirección agregada", { position: "top-center"})
      })
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelected = (id: string) => {
    setSelectedAddressId(id);
    const selected: Address = customer.addresses.find((add) => id === add.id);
    setSelectedAddress(selected);
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 min-h-[80vh]">
      <div className="container px-4 max-w-6xl">

        <Link href="/cart" className="flex pb-4 text-gray-500 "><ArrowLeft /> Volver</Link>
        
        <h1 className="text-3xl font-italiana font-bold mb-8">Finalizar Compra</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* === COLUMNA IZQUIERDA (PASOS) === */}
          <div className="lg:col-span-8 space-y-6">

            {/* --- PASO 1: CUENTA --- */}
            <Card className="shadow-sm border-0 ring-1 ring-gray-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 " />
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
                    <p className="text-gray-600 text-sm">
                      Para continuar, necesitas identificarte.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Link href="/register?redirect=/checkout">
                        <Button variant="outline" className="w-full">Iniciar Sesión</Button>
                      </Link>
                      <Link href="/register?redirect=/checkout">
                        <Button className="w-full bg-black text-white hover:bg-gray-800">Registrarse</Button>
                      </Link>
                    </div>
                    {/* Opcional: Guest Checkout inputs aquí */}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* --- PASO 2: DIRECCIÓN DE ENVÍO --- */}
            <Card className={`shadow-sm border-0 ring-1 ring-gray-200 ${!customer ? 'opacity-50 pointer-events-none' : ''}`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 " />
                  2. Envío
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                
                {customer?.addresses && customer?.addresses?.length > 0 ? (
                  <RadioGroup 
                    value={selectedAddressId} 
                    onValueChange={() => handleAddressSelected(selectedAddressId)}
                    className="grid grid-cols-1 gap-3"
                  >
                    {customer?.addresses?.map((addr: Address) => (
                      <div key={addr.id} className={`relative flex items-start space-x-3 space-y-0 rounded-md border p-4 transition-all ${selectedAddressId === addr.id ? 'border-black ring-1 ring-black bg-gray-50' : 'hover:bg-gray-50'}`}>
                        <RadioGroupItem value={addr.id} id={addr.id} className="mt-1" />
                        <Label htmlFor={addr.id} className="cursor-pointer w-full font-normal">
                          <div className="font-medium text-base">
                            {addr.first_name} {addr.last_name} <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded ml-2">{addr.company || "Casa"}</span>
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            {addr.address_1}, {addr.city}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {addr.province}, {addr.postal_code}
                          </div>
                          <div className="text-gray-500 text-sm mt-1">
                            📞 {addr.phone}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                ) : (
                  <div className="text-center py-6 bg-gray-50 rounded border border-dashed">
                    <p className="text-gray-500 mb-2">No tienes direcciones guardadas.</p>
                  </div>
                )}

                {/* BOTÓN / COMPONENTE PARA AGREGAR DIRECCIÓN */}
                <div className="pt-2">
                   <Dialog open={isAddressModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2 border-black text-black hover:bg-gray-100" onClick={() => setIsAddressModalOpen(true)}>
                          <Plus className="w-4 h-4" /> Agregar otra dirección
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader className="md:col-span-2">
                          <DialogTitle>Nueva Dirección</DialogTitle>
                        </DialogHeader>
                          <div className="space-y-2">
                            <Label>Nombre *</Label>
                            <Input required value={newAddress.first_name} onChange={(e) => handleChange("first_name", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Apellido *</Label>
                            <Input required value={newAddress.last_name} onChange={(e) => handleChange("last_name", e.target.value)} />
                          </div>

                          <div className="space-y-2">
                            <Label>Empresa (Opcional)</Label>
                            <Input value={newAddress.company} onChange={(e) => handleChange("company", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Teléfono *</Label>
                            <Input required value={newAddress.phone} onChange={(e) => handleChange("phone", e.target.value)} />
                          </div>

                          <div className="md:col-span-2 space-y-2">
                            <Label>Dirección *</Label>
                            <Input required placeholder="Calle 123 # 45 - 67" value={newAddress.address_1} onChange={(e) => handleChange("address_1", e.target.value)} />
                          </div>

                          <div className="space-y-2">
                            <Label>Ciudad *</Label>
                            <Input required value={newAddress.city} onChange={(e) => handleChange("city", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>Provincia / Depto *</Label>
                            <Input required value={newAddress.province} onChange={(e) => handleChange("province", e.target.value)} />
                          </div>

                          <div className="space-y-2">
                            <Label>Código Postal *</Label>
                            <Input required value={newAddress.postal_code} onChange={(e) => handleChange("postal_code", e.target.value)} />
                          </div>
                          <div className="space-y-2">
                            <Label>País</Label>
                            <Input value="Colombia" disabled className="bg-gray-100" />
                          </div>

                          <div className="md:col-span-2 pt-4">
                            <Button type="submit" className="w-full bg-black text-white hover:bg-gray-800" disabled={loading} onClick={handleAddAddress}>
                              {loading ? "Guardando..." : "Guardar Dirección"}
                            </Button>
                          </div>
                      </DialogContent>
                    </Dialog>
                </div>

              </CardContent>
            </Card>

            {/* --- PASO 3: DATOS DE QUIEN RECIBE --- */}
            <Card className={`shadow-sm border-0 ring-1 ring-gray-200 ${!selectedAddressId ? 'opacity-50 pointer-events-none' : ''}`}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <User className="w-5 h-5 " />
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
                      onChange={(e) => setReceiverData({...receiverData, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="receiverId">Cédula / NIT</Label>
                    <Input 
                      id="receiverId" 
                      placeholder="Para facturación electrónica" 
                      value={receiverData.idNumber}
                      onChange={(e) => setReceiverData({...receiverData, idNumber: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="receiverPhone">Celular de contacto</Label>
                    <Input 
                      id="receiverPhone" 
                      placeholder="Ej: 300 123 4567" 
                      value={receiverData.phone}
                      onChange={(e) => setReceiverData({...receiverData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* --- PASO 4: PAGO (WOMPI) --- */}
            <Card className={`shadow-sm border-0 ring-1 ring-gray-200 ${!receiverData.fullName ? 'opacity-50 pointer-events-none' : ''}`}>
               <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CreditCard className="w-5 h-5 " />
                  4. Pago
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 p-4 rounded-md border border-blue-100 mb-6">
                  <p className="text-sm text-blue-800">
                    Serás redirigido a la pasarela de pagos segura de <strong>Wompi Bancolombia</strong> para completar tu transacción.
                  </p>
                </div>
                
                {/* AQUÍ VA EL BOTÓN DE WOMPI */}
                {/* <WompiButton cart={cart} email={customer?.email} /> */}
                <WompiButtonProps cart={cart} address={selectedAddress} customer={receiverData} />
                
                <div className="flex justify-center gap-4 mt-4 opacity-50 grayscale">
                    {/* Puedes poner logos de Visa, Mastercard, Nequi, Bancolombia aquí */}
                    <Image
                      src="/payment/payment-01.svg"
                      alt="visa card"
                      width={66}
                      height={22}
                    />
                    <Image
                      src="/payment/payment-03.svg"
                      alt="visa card"
                      width={66}
                      height={22}
                    />
                    <Image
                      src="/payment/nequi-2.svg"
                      alt="visa card"
                      width={66}
                      height={22}
                    />
                </div>
              </CardContent>
            </Card>

          </div>

          {/* === COLUMNA DERECHA (RESUMEN STICKY) === */}
          <div className="lg:col-span-4">
             <div className="sticky top-24">
                <Card className="shadow-lg border-0 bg-white">
                  <CardHeader className="bg-gray-50/50 border-b pb-4">
                    <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-6 space-y-6">
                    
                    {/* Lista de Items (Mockup visual) */}
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                       {/* Item 1 */}
                       {cart?.items?.map((product: CartItem) => (
                        <div className="flex gap-4 pt-2" key={product.id}>
                            <div className="h-16 w-16 rounded-md border flex-shrink-0 relative">
                              {/* <Image src... /> */}
                              <Image
                                src={product.thumbnail}
                                fill
                                alt={product.title}
                                className="object-cover rounded-md"
                                unoptimized={
                                  product.thumbnail.startsWith("http://localhost") ||
                                  product.thumbnail.startsWith("http://127.0.0.1")
                                }
                              />
                              <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{product.quantity}</span>
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                            </div>
                            <div className="text-sm font-medium">{formatCurrency(product.unit_price)}</div>
                        </div>
                       ))}
                    </div>

                    <Separator />

                    {/* Totales */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Envío</span>
                        <span>{formatCurrency(shipping)}</span> 
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(total)} COP</span>
                    </div>

                  </CardContent>
                </Card>

                {/* Info de confianza */}
                <div className="mt-6 text-center text-xs text-gray-400 space-y-2">
                   <p>🔒 Pagos procesados seguramente por Wompi</p>
                   <p>📦 Envíos a todo Colombia</p>
                </div>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
}