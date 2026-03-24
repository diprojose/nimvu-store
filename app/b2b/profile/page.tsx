"use client";

import { useEffect, useState, Suspense } from "react";
import { useAuthStore } from '@/store/authStore';
import { useAuthRedirect } from "@/lib/hooks/redirect-if-authenticated";
import { useSearchParams } from 'next/navigation';
import { Building2, History, CreditCard, Users, Settings, LogOut, CheckCircle2, Copy } from 'lucide-react';
import { Button } from "@/components/ui/button";

function ProfileContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');

  const customer = useAuthStore((state) => state.customer);
  const logout = useAuthStore((state) => state.logout);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(tab);
  }, [searchParams]);

  const { isChecking } = useAuthRedirect({
    redirectTo: "/b2b/login",
    condition: "ifUnauthenticated",
  });

  if (isChecking || !isMounted) {
    return <div className="min-h-screen bg-[#F8F9FA]" />;
  }

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
      <div className="max-w-[1400px] mx-auto px-6 py-10">

        <div className="flex flex-col lg:flex-row gap-8">

          {/* Sidebar Navigation */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-200 p-4 sticky top-24">

              <div className="flex items-center gap-3 px-4 py-4 mb-4 border-b border-gray-100">
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded flex items-center justify-center font-bold text-lg">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-900 text-sm">{customer?.companyName || 'Enterprise Account'}</h2>
                  <p className="text-xs text-gray-500">Nimvu B2B</p>
                </div>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Building2 className={`w-4 h-4 ${activeTab === 'profile' ? 'opacity-100' : 'opacity-50'}`} />
                  Perfil de Empresa
                </button>
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'orders' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <History className={`w-4 h-4 ${activeTab === 'orders' ? 'opacity-100' : 'opacity-50'}`} />
                  Historial de Pedidos
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'billing' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <CreditCard className={`w-4 h-4 ${activeTab === 'billing' ? 'opacity-100' : 'opacity-50'}`} />
                  Métodos de Pago
                </button>
                <button
                  onClick={() => setActiveTab('team')}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'team' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50'}`}
                >
                  <Users className={`w-4 h-4 ${activeTab === 'team' ? 'opacity-100' : 'opacity-50'}`} />
                  Gestión de Usuarios
                </button>
              </nav>

              <div className="mt-8 border-t border-gray-100 pt-4 space-y-1">
                <button className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  <Settings className="w-4 h-4 opacity-50" />
                  Configuración
                </button>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4 opacity-50" />
                  Cerrar sesión
                </button>
              </div>

            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 space-y-8">

            {activeTab === 'profile' && (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Perfil de Empresa</h1>
                    <p className="text-gray-500 mt-1">Administre los detalles de su empresa y la configuración organizacional.</p>
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">Editar Perfil</Button>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Información General</h3>
                  </div>
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Razón Social</p>
                      <p className="text-gray-900 font-medium">{customer?.companyName || 'Nimvu Technologies S.A.S.'}</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">NIT / Tax ID</p>
                      <p className="text-gray-900 font-medium">901.432.765-1</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Industria</p>
                      <p className="text-gray-900 font-medium">Software y Servicios Tecnológicos</p>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Sede Principal</p>
                      <p className="text-gray-900 font-medium">{customer?.addresses?.[0]?.city || 'Medellín'}, {customer?.addresses?.[0]?.country_code || 'CO'}</p>
                    </div>
                  </div>
                </div>

                {/* Dashboard Preview Widgets inside Profile view */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900">Métodos de Pago</h3>
                      <button className="text-blue-600 text-sm font-medium hover:underline">+ Añadir</button>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-100 w-12 h-8 rounded flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Visa terminada en 4242</p>
                          <p className="text-xs text-gray-500">Vence 12/26 • <span className="text-black font-medium">Predeterminado</span></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-gray-900">Miembros del Equipo</h3>
                      <button className="text-blue-600 text-sm font-medium hover:underline">+ Invitar</button>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                            {customer?.first_name?.charAt(0)}{customer?.last_name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 text-sm">{customer?.first_name} {customer?.last_name}</p>
                            <p className="text-xs text-gray-500">Administrador</p>
                          </div>
                        </div>
                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-medium">Activo</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeTab === 'orders' && (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Pedidos</h1>
                  <p className="text-gray-500 mt-1">Vea y rastree todos sus pedidos corporativos.</p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-6 py-4">ID de Pedido</th>
                        <th className="px-6 py-4">Fecha</th>
                        <th className="px-6 py-4">Monto</th>
                        <th className="px-6 py-4">Estado</th>
                        <th className="px-6 py-4">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">#ORD-2024-8902</td>
                        <td className="px-6 py-4 text-gray-500">Oct 12, 2026</td>
                        <td className="px-6 py-4 font-bold text-gray-900">$1,250.00</td>
                        <td className="px-6 py-4">
                          <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Entregado</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 font-medium hover:underline">Detalles</button>
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">#ORD-2024-8841</td>
                        <td className="px-6 py-4 text-gray-500">Sep 28, 2026</td>
                        <td className="px-6 py-4 font-bold text-gray-900">$840.00</td>
                        <td className="px-6 py-4">
                          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold">Procesando</span>
                        </td>
                        <td className="px-6 py-4">
                          <button className="text-blue-600 font-medium hover:underline">Detalles</button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {(activeTab === 'billing' || activeTab === 'team') && (
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Próximamente</h2>
                <p className="text-gray-500">Esta sección está actualmente en desarrollo.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F8F9FA]" />}>
      <ProfileContent />
    </Suspense>
  );
}
