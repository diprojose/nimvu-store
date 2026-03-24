"use client"

import { useEffect, useState } from "react";
import Link from 'next/link';
import Image from "next/image";
import { Bell, ShoppingCart, CircleUserRound, Menu } from "lucide-react";
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/cart';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet";

const B2BHeader = () => {
  const items = useCartStore((state) => state.items);
  const customer = useAuthStore((state) => state.customer);
  const logout = useAuthStore((state) => state.logout);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const productQuantity = items?.reduce((total, item) => total + item?.quantity, 0) || 0;

  return (
    <header className="fixed w-full top-0 z-50 bg-white border-b border-gray-100">
      <div className="px-4 sm:px-6 lg:px-8 mx-auto xl:max-w-[1400px]">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Main Nav */}
          <div className="flex items-center gap-8">
            <Link href="/b2b" className="flex-shrink-0 flex items-center gap-2">
              <Image
                className="dark:invert"
                src="/nimvu-logo.png"
                alt="Nimvu B2B logo"
                width={100}
                height={20}
                priority
              />
              <span className="text-sm font-bold tracking-tight text-blue-600 uppercase border border-blue-600 px-1 rounded-sm mt-1">Enterprise</span>
            </Link>

            <nav className="hidden md:flex space-x-6 text-sm font-medium">
              <Link href="/b2b" className="text-blue-600 border-b-2 border-blue-600 py-5 uppercase text-xs tracking-wider">
                CATÁLOGO
              </Link>
              <Link href="/b2b/profile?tab=orders" className="text-gray-500 hover:text-black py-5 uppercase text-xs tracking-wider">
                PEDIDOS
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            {isMounted && (
              <>
                <button className="p-2 text-gray-500 hover:text-black relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full"></span>
                </button>

                <Link href="/b2b/cart" className="p-2 text-gray-500 hover:text-black relative flex items-center">
                  <ShoppingCart className="w-5 h-5" />
                  {productQuantity > 0 && (
                    <Badge className="absolute -top-1 -right-1 bg-blue-600 text-white min-w-4 h-4 p-0 flex items-center justify-center text-[10px]">
                      {productQuantity}
                    </Badge>
                  )}
                </Link>

                <div className="hidden md:block h-8 w-px bg-gray-200 mx-2"></div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-3 text-left focus:outline-none">
                      <div className="hidden md:flex flex-col items-end">
                        <span className="text-sm font-medium text-gray-900 leading-none">
                          {customer?.companyName || customer?.first_name || 'Agente de Compras'}
                        </span>
                        <span className="text-xs text-gray-500 mt-1">Cuenta Enterprise</span>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 border border-orange-200">
                        {customer?.first_name?.charAt(0) || <CircleUserRound className="w-5 h-5" />}
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>
                      <div className="flex flex-col">
                        <span>{customer?.companyName || 'Empresa B2B'}</span>
                        <span className="text-xs text-muted-foreground">{customer?.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/b2b/profile" className="cursor-pointer">Perfil de Empresa</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/b2b/profile?tab=orders" className="cursor-pointer">Historial de Pedidos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/b2b/profile?tab=billing" className="cursor-pointer">Métodos de Pago</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => logout()} className="text-red-600 cursor-pointer">
                      Cerrar sesión
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetTitle>Menú B2B</SheetTitle>
                  <nav className="flex flex-col gap-4 mt-8">
                    <SheetClose asChild><Link href="/b2b" className="uppercase font-medium text-sm">CATÁLOGO</Link></SheetClose>
                    <SheetClose asChild><Link href="/b2b/profile?tab=orders" className="uppercase font-medium text-sm">PEDIDOS</Link></SheetClose>
                    <SheetClose asChild><Link href="/b2b/profile" className="uppercase font-medium text-sm">MI PERFIL</Link></SheetClose>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default B2BHeader;
