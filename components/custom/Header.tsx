"use client"
import Link from 'next/link';
import Image from "next/image";
import { ShoppingCart, Heart, Search } from "lucide-react";
import CartProductItem from "@/components/custom/cartProductItem";
import { useCartStore } from '@/store/cartStore';
import { CartProduct } from "@/types/cartProduct";
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet"

const Header = () => {

  const cartProducts: CartProduct[] = useCartStore((state) => state.cart);

  const totalPrice = cartProducts.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  
  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <button className="p-2 text-black cursor-pointer">
              <Search className="w-7 h-7" />
            </button>
            {/* <button className="p-2 text-black cursor-pointer">
              <Heart className="w-7 h-7" />
            </button> */}
            <Sheet>
              <SheetTrigger>
                <div>
                  <ShoppingCart className="w-7 h-7 cursor-pointer" />
                </div>
              </SheetTrigger>
              <SheetContent>
                <SheetTitle className="sr-only">
                  Carrito
                </SheetTitle>
                <div className="cart-products py-5">
                  {cartProducts && cartProducts.length > 0 ? (
                    cartProducts.map((product: CartProduct) => (
                      <CartProductItem key={product.id} item={product}/>
                    ))
                  ) : (
                    <p>No hay productos</p>
                  )}
                </div>
                <Separator />
                <div className="subtotal-section py-5 flex justify-between">
                  <p>Subtotal:</p>
                  <p className='font-bold'>${totalPrice}</p>
                </div>
                <div className="checkout-section py-5">
                  <Link href="/cart">
                    <Button className='w-full cursor-pointer'>Continuar</Button>
                  </Link>
                </div>
              </SheetContent>
            </Sheet>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;