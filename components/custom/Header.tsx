"use client"

import { useMemo } from "react";
import Link from 'next/link';
import Image from "next/image";
import { ShoppingCart, Search, CircleUserRound } from "lucide-react";
import CartProductItem from "@/components/custom/cartProductItem";
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { CartProduct } from "@/types/cartProduct";
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

const Header = () => {

  const cartProducts: CartProduct[] = useCartStore((state) => state.cart);

  const customer = useAuthStore((state) => state.customer);
  const logout = useAuthStore((state) => state.logout);

  const { productQuantity, totalProductPrice, totalPrice, shippingPrice } = useMemo(() => {
      const shipping = 12000;
      
      const qty = cartProducts.reduce((total, item) => total + item.quantity, 0);
      const subtotal = cartProducts.reduce((total, item) => total + (item.price * item.quantity), 0);
      const total = subtotal + shipping;
  
      return {
        productQuantity: qty,
        totalProductPrice: subtotal,
        totalPrice: total,
        shippingPrice: shipping
      };
    }, [cartProducts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  
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
            <Link href="/category" className="text-black transition">
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
                  {cartProducts && cartProducts.length > 0 ? (
                    cartProducts.map((product: CartProduct) => (
                      <CartProductItem key={product.id} item={product} cart={true} />
                    ))
                  ) : (
                    <p>No hay productos</p>
                  )}
                </div>
                <Separator />
                <div className="subtotal-section py-5 flex justify-between">
                  <p>Subtotal:</p>
                  <p className='font-bold'>{formatCurrency(totalPrice)}</p>
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
                {customer ? (
                  // ✅ Envuelves todo en <> ... </>
                  <>
                    <DropdownMenuLabel>Hola, {customer.first_name}</DropdownMenuLabel>
                    <DropdownMenuItem>
                      <Link href="/profile">Perfil</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>Mis pedidos</DropdownMenuItem>
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
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;