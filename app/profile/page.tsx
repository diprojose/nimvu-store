"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { sdk } from "../lib/sdk"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; // Importamos Tabs
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { MapPin, User, Plus, Package } from "lucide-react";
import { toast } from "sonner"

export default function ProfilePage() {
  const { customer, updateCustomer, syncWithBackend } = useAuthStore();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] = useState(false);

  // Estados de formularios
  const [profileData, setProfileData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    addresses: []
  });

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

  /* const { isChecking } = useAuthRedirect({
    redirectTo: "/", 
    condition: "ifUnauthenticated",
  }); */

  useEffect(() => {
    setIsMounted(true);
    syncWithBackend();
  }, [syncWithBackend]);

  useEffect(() => {
    if (customer) {
      setProfileData({
        first_name: customer.first_name || "",
        last_name: customer.last_name || "",
        phone: customer.phone || "",
        addresses: customer.addresses,
      });
    }
  }, [customer]);

  if (!isMounted) return <div className="min-h-[80vh] p-12 text-center">Cargando...</div>;

  if (!customer) {
    return router.replace("/");
  }

  // --- HANDLERS ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateCustomer({
      first_name: profileData.first_name,
      last_name: profileData.last_name,
      phone: profileData.phone
    });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleDeleteAddress = (addrId) => {
    sdk.store.customer.deleteAddress(addrId)
    .then(({ parent: customer }) => {
      syncWithBackend();
      setIsDeleteAddressModalOpen(false);
      toast.success("Dirección borrada", { position: "top-center"});
    })
  }

  return (
    // 3. FIX: Agregado min-h-[80vh] para empujar el footer
    <div className="max-w-350 mx-auto py-20 px-16 space-y-8 min-h-[80vh]">
      
      <div className="mb-6">
        <h1 className="text-3xl font-italiana font-bold">Mi Cuenta</h1>
        <p className="text-gray-500">Gestiona tu información personal y pedidos.</p>
      </div>

      {/* 2. FIX: Implementación de TABS */}
      <Tabs defaultValue="profile" className="w-full">
        
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="orders">Mis Pedidos</TabsTrigger>
          {/* Wishlist iría aquí en el futuro */}
        </TabsList>

        {/* === CONTENIDO TAB 1: PERFIL === */}
        <TabsContent value="profile" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* COLUMNA IZQUIERDA: DATOS PERSONALES */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-xl font-semibold border-b pb-2">
                <User className="w-5 h-5" />
                <h2>Datos Personales</h2>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nombre</Label>
                    <Input 
                      value={profileData.first_name} 
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input 
                      value={profileData.last_name} 
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input 
                    value={profileData.phone} 
                    onChange={(e) => setProfileData({...profileData, phone: e.target.value})} 
                  />
                </div>

                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input value={customer.email} disabled className="bg-gray-100 cursor-not-allowed" />
                </div>

                <Button type="submit" disabled={loading} className="w-full bg-black hover:bg-gray-800">
                  {loading ? "Guardando..." : "Actualizar Datos"}
                </Button>
              </form>
            </div>

            {/* COLUMNA DERECHA: DIRECCIONES */}
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2 text-xl font-semibold">
                  <MapPin className="w-5 h-5" />
                  <h2>Direcciones</h2>
                </div>
              </div>

              {/* 1. FIX: Uso de ?. (Optional Chaining) para evitar crashes */}
              {profileData?.addresses?.length === 0 ? (
                // ESTADO VACÍO
                <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center space-y-4 flex flex-col items-center justify-center min-h-[200px]">
                  <div className="bg-white p-3 rounded-full shadow-sm">
                    <MapPin className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">No tienes direcciones guardadas</h3>
                    <p className="text-sm text-gray-500 mt-1">Agrega una dirección para facilitar tus compras.</p>
                  </div>
                </div>
              ) : (
                // LISTA DE DIRECCIONES
                <div className="space-y-4">
                  {profileData?.addresses?.map((addr) => (
                    <div key={addr.id}>
                      <Card>
                        <CardContent>
                          <p className="font-bold pt-6">{addr.first_name} {addr.last_name}</p>
                          <p className="text-sm text-gray-600">{addr.company}</p>
                          <p className="mt-1">{addr.address_1}</p>
                          <p className="text-sm text-gray-500">{addr.city}, {addr.province}, {addr.postal_code}</p>
                          <p className="text-sm text-gray-500 mt-1">📞 {addr.phone}</p>
                        </CardContent>
                        <CardFooter>
                          <Button className="mr-2 cursor-pointer">Editar</Button>
                          <Dialog open={isDeleteAddressModalOpen}>
                              <DialogTrigger asChild>
                                <Button className="bg-red-900 cursor-pointer" onClick={() => setIsDeleteAddressModalOpen(true)}>Borrar</Button>
                              </DialogTrigger>
                              <DialogContent className="sm:max-w-sm">
                                <DialogHeader>
                                  <DialogTitle>¿Estas seguro de borrar la dirección?</DialogTitle>
                                </DialogHeader>
                                <DialogFooter>
                                  <Button variant="outline">Cancelar</Button>
                                  <Button className="bg-red-900 cursor-pointer" onClick={() => handleDeleteAddress(addr.id)}>Borrar</Button>
                                </DialogFooter>
                              </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}
                  
                  <div className="pt-4">
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
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* === CONTENIDO TAB 2: PEDIDOS === */}
        <TabsContent value="orders" className="mt-8">
           <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-gray-50 border-dashed">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Historial de Pedidos</h3>
              <p className="text-gray-500">Aquí aparecerán tus compras recientes.</p>
              {/* Aquí integraremos el componente de órdenes más adelante */}
           </div>
        </TabsContent>

      </Tabs>
    </div>
  );
}