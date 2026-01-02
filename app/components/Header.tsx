"use client"
import { useState } from 'react';
import Link from 'next/link';
import Image from "next/image";
import {
  Menu,
  Search,
  ShoppingCart,
  X,
  Phone,
  LayoutGrid,
  Users
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./ui/sheet";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchValue);
  };

  const NavLinks = ({ mobile = false }: { mobile?: boolean }) => (
    <>
      <Link
        href="/about"
        className={`${mobile ? 'flex items-center gap-3 text-lg py-2' : 'text-gray-600 hover:text-black transition'}`}
      >
        {mobile && <Users className="w-5 h-5" />}
        Nosotros
      </Link>
      <Link
        href="/category"
        className={`${mobile ? 'flex items-center gap-3 text-lg py-2' : 'text-gray-600 hover:text-black transition'}`}
      >
        {mobile && <LayoutGrid className="w-5 h-5" />}
        Categorias
      </Link>
      <Link
        href="/contact"
        className={`${mobile ? 'flex items-center gap-3 text-lg py-2' : 'text-gray-600 hover:text-black transition'}`}
      >
        {mobile && <Phone className="w-5 h-5" />}
        Contacto
      </Link>
    </>
  );

  return (
    <header className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Mobile: Hamburger Menu (Left) */}
          <div className="md:hidden flex items-center">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2" aria-label="Open menu">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle className="text-left">Menu</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col space-y-4 mt-8">
                  <NavLinks mobile />
                </nav>
              </SheetContent>
            </Sheet>
          </div>

          {/* Logo - Nimvu (Center on Mobile, Left on Desktop) */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
              <Image
                className="dark:invert"
                src="/nimvu-logo-2.png"
                alt="Nimvu logo"
                width={100}
                height={20}
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation (Center) */}
          <nav className="hidden md:flex space-x-8">
            <NavLinks />
          </nav>

          {/* Actions: Search & Cart (Right) */}
          <div className="flex items-center space-x-2">

            {/* Search */}
            <div className={`flex items-center transition-all duration-300 ${isSearchOpen ? 'w-full absolute left-0 top-16 px-4 bg-white py-2 border-b md:relative md:top-0 md:w-auto md:p-0 md:border-none' : ''}`}>
              {isSearchOpen ? (
                <form onSubmit={handleSearchSubmit} className="flex w-full items-center gap-2 md:w-64">
                  <Input
                    autoFocus
                    type="text"
                    placeholder="Search products..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    className="h-9"
                  />
                  <Button type="submit" size="sm" variant="ghost" className="md:hidden">
                    Go
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsSearchOpen(false)}
                    aria-label="Close search"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <Button variant="ghost" size="icon" onClick={() => setIsSearchOpen(true)} aria-label="Open search">
                  <Search className="h-5 w-5" />
                </Button>
              )}
            </div>

            {/* Cart Sheet */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative" aria-label="Open cart">
                  <ShoppingCart className="h-5 w-5" />
                  {/* Badge example */}
                  {/* <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span> */}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Shopping Cart</SheetTitle>
                  <SheetDescription>
                    Review your items before checkout.
                  </SheetDescription>
                </SheetHeader>
                <div className="flex flex-col items-center justify-center h-[calc(100vh-200px)] text-gray-500">
                  <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
                  <p>Your cart is empty</p>
                  <Button className="mt-4" variant="outline" onClick={() => document.querySelector('[data-radix-collection-item]')?.dispatchEvent(new Event('click', { bubbles: true }))}>
                    Continue Shopping
                  </Button>
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
