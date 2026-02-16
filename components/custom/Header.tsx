"use client"

import { useEffect, useMemo, useState } from "react";
import Link from 'next/link';
import Image from "next/image";
import { ShoppingCart, Search, CircleUserRound, Menu } from "lucide-react";
import CartProductItem from "@/components/custom/cartProductItem";
import { useCartStore } from '@/store/cart';
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
import { CartItem } from "@/store/cart";

const Header = () => {
  const items = useCartStore((state) => state.items);
  const getCartSubtotal = useCartStore((state) => state.getCartSubtotal);
  const getCartTotal = useCartStore((state) => state.getCartTotal);

  const customer = useAuthStore((state) => state.customer);
  const logout = useAuthStore((state) => state.logout);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const { productQuantity, totalPrice } = useMemo(() => {
    const shipping = 12000;

    const qty = items?.reduce((total, item) => total + item?.quantity, 0) || 0;
    const subtotal = getCartSubtotal();
    // const total = getCartTotal(); // If shipping needs to be added here or not. 
    // original code had total = cartProducts.total. 
    // My store total is just products. 
    // Let's assume header just shows subtotal or simple total.
    const total = subtotal + (qty > 0 ? shipping : 0);

    return {
      productQuantity: qty,
      totalProductPrice: subtotal,
      totalPrice: total,
      shippingPrice: shipping
    };
  }, [items, getCartSubtotal]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Initialize removed as it's auto-handled by persist middleware
  // const initialize = useCartStore((state) => state.initialize)

  // useEffect(() => {
  //   initialize();
  // }, [])

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
          <nav className="hidden md:flex space-x-8">
            <Link href="/about" className="text-black transition">
              Nosotros
            </Link>
            <Link href="/products" className="text-black transition">
              Categorias
            </Link>
            <Link href="/contact" className="text-black transition">
              Contacto
            </Link>
          </nav>

          {/* Acciones: Carrito/Contacto */}
          <div className="flex items-center space-x-4">
            {/* <button className="p-2 text-black cursor-pointer">
              <Search className="w-7 h-7" />
            </button> */}
            {/* <button className="p-2 text-black cursor-pointer">
              <Heart className="w-7 h-7" />
            </button> */}
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
                    <p className='font-bold'>{formatCurrency(totalPrice)}</p>
                  ) : (
                    <p className='font-bold'>{formatCurrency(0)}</p>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-black cursor-pointer">
                  <CircleUserRound className="w-7 h-7" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {isMounted && customer ? (
                  // ✅ Envuelves todo en <> ... </>
                  <>
                    <DropdownMenuLabel>Hola, {customer.first_name}</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link href="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Link href="/profile?tab=orders" className="w-full">Mis pedidos</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => logout()}>Cerrar Sesión</DropdownMenuItem>
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

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center">
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
                      <Link href="/about" className="text-lg font-medium hover:text-primary transition-colors">
                        Nosotros
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/products" className="text-lg font-medium hover:text-primary transition-colors">
                        Categorias
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link href="/contact" className="text-lg font-medium hover:text-primary transition-colors">
                        Contacto
                      </Link>
                    </SheetClose>
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

export default Header;