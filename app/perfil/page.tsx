"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { addresses, orders } from "@/lib/api"
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPin, User, Plus, Package, Calendar, DollarSign } from "lucide-react";
import { toast } from "sonner"
import Link from 'next/link';

function ProfileContent() {
  const { customer, updateCustomer, syncWithBackend } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isDeleteAddressModalOpen, setIsDeleteAddressModalOpen] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState("profile");
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  useEffect(() => {
    setIsMounted(true);
    syncWithBackend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'orders') {
      setActiveTab('orders');
    }
  }, [searchParams]);

  useEffect(() => {
    if (activeTab === 'orders' && customer) {
      fetchOrders();
    }
  }, [activeTab, customer]);

  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const data = await orders.list();
      setUserOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Error al cargar pedidos");
    } finally {
      setLoadingOrders(false);
    }
  };

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
    router.replace("/");
    return null;
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
      await addresses.create(newAddress);
      await syncWithBackend();

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
      toast.success("Dirección agregada", { position: "top-center" })
    } catch (error) {
      console.error(error);
      toast.error("Error al agregar dirección");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addrId) => {
    try {
      await addresses.delete(addrId);
      await syncWithBackend();
      setIsDeleteAddressModalOpen(false);
      toast.success("Dirección borrada", { position: "top-center" });
    } catch (err) {
      console.error(err);
      toast.error("Error al borrar dirección");
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    // 3. FIX: Agregado min-h-[80vh] para empujar el footer
    <div className="max-w-350 mx-auto py-20 px-16 space-y-8 min-h-[80vh]">

      <div className="mb-6">
        <h1 className="text-3xl font-italiana font-bold">Mi Cuenta</h1>
        <p className="text-gray-500">Gestiona tu información personal y pedidos.</p>
      </div>

      {/* 2. FIX: Implementación de TABS */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">

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
                      onChange={(e) => setProfileData({ ...profileData, first_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Apellido</Label>
                    <Input
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({ ...profileData, last_name: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Correo Electrónico</Label>
                  <Input value={customer.email} disabled className="bg-gray-100 cursor-not-allowed" />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  />
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
                  <Button variant="outline" className="mt-4 gap-2 border-black text-black hover:bg-gray-100" onClick={() => setIsAddressModalOpen(true)}>
                    <Plus className="w-4 h-4" /> Agregar dirección
                  </Button>
                </div>
              ) : (
                // LISTA DE DIRECCIONES
                <div className="space-y-4">
                  {profileData?.addresses?.map((addr: any) => (
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
                          <Button className="mr-2 cursor-pointer" variant="outline" size="sm">Editar</Button>
                          <Dialog open={isDeleteAddressModalOpen} onOpenChange={setIsDeleteAddressModalOpen}>
                            <DialogTrigger asChild>
                              <Button className="bg-red-900 cursor-pointer" size="sm" onClick={() => setIsDeleteAddressModalOpen(true)}>Borrar</Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-sm">
                              <DialogHeader>
                                <DialogTitle>¿Estas seguro de borrar la dirección?</DialogTitle>
                              </DialogHeader>
                              <DialogFooter>
                                <Button variant="outline" onClick={() => setIsDeleteAddressModalOpen(false)}>Cancelar</Button>
                                <Button className="bg-red-900 cursor-pointer" onClick={() => handleDeleteAddress(addr.id)}>Borrar</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </CardFooter>
                      </Card>
                    </div>
                  ))}

                  <div className="pt-4">
                    <Button variant="outline" className="gap-2 border-black text-black hover:bg-gray-100" onClick={() => setIsAddressModalOpen(true)}>
                      <Plus className="w-4 h-4" /> Agregar otra dirección
                    </Button>
                  </div>
                </div>
              )}

              {/* GLOBAL ADDRESS MODAL */}
              <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
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
        </TabsContent>

        {/* === CONTENIDO TAB 2: PEDIDOS === */}
        <TabsContent value="orders" className="mt-8">
          {loadingOrders ? (
            <div className="text-center py-12">Cargando pedidos...</div>
          ) : userOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {userOrders.map((order) => (
                <Card key={order.id} className="overflow-hidden">
                  <CardHeader className="bg-gray-50/50 border-b py-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-base font-bold">Pedido #{order.id.slice(0, 8)}...</CardTitle>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-medium border ${order.status === 'CONFIRMED' || order.status === 'COMPLETED' ? 'bg-green-100 text-green-700 border-green-200' :
                          order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}>
                          {order.status === 'CONFIRMED' ? 'Confirmado' :
                            order.status === 'PENDING' ? 'Pendiente' :
                              order.status === 'PROCESSING' ? 'Procesando' : order.status}
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>Ver Detalles</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row justify-between gap-6">
                      <div className="space-y-2">
                        <p className="text-sm text-gray-500">Total del Pedido</p>
                        <div className="flex items-center gap-1 font-bold text-lg">
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Items ({order.items?.length || 0})</p>
                        <div className="flex -space-x-3 overflow-hidden pt-1">
                          {order.items?.slice(0, 4).map((item: any, i: number) => (
                            <div key={i} className="w-10 h-10 rounded border-2 border-white bg-gray-100 flex items-center justify-center text-xs overflow-hidden relative">
                              {/* Placeholder if no image, ideally we'd have images here */}
                              {item.product?.images?.[0] ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.product.images[0]} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          ))}
                          {order.items?.length > 4 && (
                            <div className="w-10 h-10 rounded border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium text-gray-600">
                              +{order.items.length - 4}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 border rounded-lg bg-gray-50 border-dashed">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Historial de Pedidos</h3>
              <p className="text-gray-500">No has realizado ningún pedido aún.</p>
              <Link href="/category" className="mt-4">
                <Button>Ir a comprar</Button>
              </Link>
            </div>
          )}
        </TabsContent>

      </Tabs>

      {/* ORDER DETAILS MODAL */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalle del Pedido #{selectedOrder?.id?.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleDateString()} {new Date(selectedOrder.createdAt).toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Estado</p>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${selectedOrder.status === 'CONFIRMED' ? 'bg-green-100 text-green-700 border-green-200' :
                    selectedOrder.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                      'bg-gray-100 text-gray-700 border-gray-200'
                    }`}>
                    {selectedOrder.status === 'CONFIRMED' ? 'Confirmado' :
                      selectedOrder.status === 'PENDING' ? 'Pendiente' : selectedOrder.status}
                  </span>
                </div>
                {/* Address if available */}
                {/* Note: Backend order model stores snapshot in shippingAddress JSON, need to check structure or display if available */}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold mb-3">Productos</h4>
                <div className="space-y-3">
                  {selectedOrder.items?.map((item: any, i: number) => (
                    <div key={i} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {item.product?.images?.[0] && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.product?.images?.[0]} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.product?.name || "Producto"}</p>
                          <p className="text-xs text-gray-500">Cant: {item.quantity}</p>
                        </div>
                      </div>
                      <p className="text-sm font-medium">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Envío</span>
                  <span>{formatCurrency(12000)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedOrder.total + 12000)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Cargando perfil...</div>}>
      <ProfileContent />
    </Suspense>
  )
}