"use client"

import React, { FC, ReactElement, useEffect, useMemo, useState } from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { ShoppingCart, CircleUserRound, Menu, ChevronDown } from "lucide-react";
import CartProductItem from "@/components/custom/cartProductItem";
import { useCartStore, CartState, CartItem } from '@/store/cart';
import { useAuthStore } from '@/store/authStore';
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
  SheetClose
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils";
import { categories as apiCategories, BackendCategory } from "@/lib/api";
import { Customer } from "@/types/customer";

const Header: FC = (): ReactElement | null => {
  const items: CartItem[] = useCartStore((state: CartState): CartItem[] => state.items);
  const getCartSubtotal: (isB2BContext?: boolean) => number = useCartStore((state: CartState) => state.getCartSubtotal);

  const customer: Customer | null = useAuthStore((state: any): Customer | null => state.customer);
  const logout: (redirect?: string) => Promise<void> = useAuthStore((state: any) => state.logout);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const pathname: string = usePathname();

  useEffect((): void => {
    setIsMounted(true);
    apiCategories.list().then(setCategories).catch(console.error);
  }, []);

  interface HeaderTotals {
    productQuantity: number;
    totalPrice: number;
  }

  const { productQuantity, totalPrice }: HeaderTotals = useMemo((): HeaderTotals => {
    const qty: number = items?.reduce((total: number, item: CartItem): number => total + (item?.quantity || 0), 0) || 0;
    const subtotal: number = getCartSubtotal();

    return {
      productQuantity: qty,
      totalPrice: subtotal
    };
  }, [items, getCartSubtotal]);

  if (pathname.startsWith('/b2b')) return null;

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="md:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo - Nimvu */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
              <Image
                className="dark:invert"
                src="/nimvu-logo.png"
                alt="Nimvu logo"
                width={100}
                height={20}
                priority
              />
            </Link>
          </div>

          {/* Navegación Desktop */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/nosotros" className="text-black transition">
              Nosotros
            </Link>
            <Link href="/productos" className="text-black transition">
              Tienda
            </Link>
            <div className="relative group/nav h-full flex items-center">
              <button className="text-black transition flex items-center gap-1 cursor-pointer outline-none py-4">
                Categorías <ChevronDown className="w-4 h-4 transition-transform group-hover/nav:-rotate-180" />
              </button>
              <div className="absolute top-[calc(100%-0.5rem)] left-0 w-56 bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover/nav:opacity-100 group-hover/nav:visible transition-all duration-300 z-50 flex flex-col py-2 translate-y-2 group-hover/nav:translate-y-0">
                {categories.length > 0 ? categories.map((cat: BackendCategory) => (
                  <Link key={cat.id} href={`/categorias/${cat.slug}`} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-zinc-50 hover:text-black transition-colors w-full">
                    {cat.name}
                  </Link>
                )) : (
                  <div className="px-4 py-2 text-sm text-gray-400">Cargando...</div>
                )}
              </div>
            </div>
            <Link href="/contacto" className="text-black transition">
              Contacto
            </Link>
          </nav>

          {/* Acciones: Carrito/Contacto */}
          <div className="flex items-center space-x-4">
            {isMounted ? (
              <Sheet>
                <SheetTrigger>
                  <div className="flex relative">
                    <ShoppingCart className="w-7 h-7 cursor-pointer" />
                    <Badge className="bg-black text-white p-1 rounded-full min-w-3.75 max-h-3.75">{productQuantity}</Badge>
                  </div>
                </SheetTrigger>
                <SheetContent>
                  <SheetTitle className="sr-only">
                    Carrito
                  </SheetTitle>
                  <div className="cart-products py-5">
                    {items && items.length > 0 ? (
                      items.map((product: CartItem) => (
                        <CartProductItem key={product.id} item={product} cart={true} />
                      ))
                    ) : (
                      <p>No hay productos</p>
                    )}
                  </div>
                  <Separator />
                  <div className="subtotal-section py-5 flex justify-between">
                    <p>Subtotal:</p>
                    {totalPrice ? (
                      <p className='font-bold'>{formatPrice(totalPrice)}</p>
                    ) : (
                      <p className='font-bold'>{formatPrice(0)}</p>
                    )}
                  </div>
                  <div className="checkout-section py-5">
                    <SheetClose asChild>
                      <Link href="/cart">
                        <Button className='w-full cursor-pointer'>Continuar</Button>
                      </Link>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            ) : (
              <button type="button">
                <div className="flex relative">
                  <ShoppingCart className="w-7 h-7 cursor-pointer" />
                  <Badge className="bg-black text-white p-1 rounded-full min-w-3.75 max-h-3.75">0</Badge>
                </div>
              </button>
            )}
            {isMounted ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-2 text-black cursor-pointer">
                    <CircleUserRound className="w-7 h-7" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {customer ? (
                    <>
                      <DropdownMenuLabel>Hola, {customer.first_name}</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Link href="/perfil">Perfil</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/perfil?tab=orders" className="w-full">Mis pedidos</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(): Promise<void> => logout()}>Cerrar Sesión</DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem>
                        <Link href="/register">Iniciar Sesión</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Link href="/register">Registrarse</Link>
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button className="p-2 text-black cursor-pointer">
                <CircleUserRound className="w-7 h-7" />
              </button>
            )}

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
              {isMounted ? (
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="md:hidden">
                      <Menu className="h-6 w-6" />
                      <span className="sr-only">Menú de navegación</span>
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                    <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                    <nav className="flex flex-col gap-4 mt-8">
                      <SheetClose asChild>
                        <Link href="/nosotros" className="text-lg font-medium hover:text-primary transition-colors">
                          Nosotros
                        </Link>
                      </SheetClose>
                      <SheetClose asChild>
                        <Link href="/productos" className="text-lg font-medium hover:text-primary transition-colors">
                          Tienda
                        </Link>
                      </SheetClose>
                      {categories.map((cat: BackendCategory) => (
                        <SheetClose asChild key={cat.id}>
                          <Link href={`/categorias/${cat.slug}`} className="text-md pl-4 font-medium text-gray-600 hover:text-primary transition-colors">
                            {cat.name}
                          </Link>
                        </SheetClose>
                      ))}
                      <SheetClose asChild>
                        <Link href="/contacto" className="text-lg font-medium hover:text-primary transition-colors">
                          Contacto
                        </Link>
                      </SheetClose>
                    </nav>
                  </SheetContent>
                </Sheet>
              ) : (
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Menú de navegación</span>
                </Button>
              )}
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;