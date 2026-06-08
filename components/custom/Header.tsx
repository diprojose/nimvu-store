"use client"

import React, { FC, ReactElement, useMemo, useState } from "react";
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
import { Customer } from "@/types/customer";
import { useUniverse, universeCssVars } from "@/lib/universe-context";
import { BackendUniverse, BackendCategory } from "@/lib/api";
import { getUniverseIcon } from "@/lib/universe-icons";

function UniverseHref(universe: BackendUniverse): string {
  // Hogar lives at root to keep existing URLs/SEO. Other universes at /:slug.
  return universe.slug === "hogar" ? "/" : `/${universe.slug}`;
}

function hasProducts(cat: BackendCategory): boolean {
  // Show by default if the backend didn't include _count; only hide explicit zero.
  return cat._count?.products === undefined ? true : cat._count.products > 0;
}

function categoryHrefFor(universeSlug: string | undefined, categorySlug: string): string {
  if (!universeSlug || universeSlug === "hogar") return `/categorias/${categorySlug}`;
  return `/${universeSlug}/categorias/${categorySlug}`;
}

function UniverseColumn({
  universe,
  categories,
  isCurrent,
}: {
  universe: BackendUniverse;
  categories: BackendCategory[];
  isCurrent: boolean;
}) {
  const Icon = getUniverseIcon(universe.icon);
  const disabled = universe.comingSoon || !universe.isActive;
  const visible = categories.filter(hasProducts);

  const header = (
    <div
      className={`flex items-center gap-3 px-3 py-2.5 rounded-md ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:bg-zinc-50 transition-colors"
      }`}
    >
      <div
        className="flex h-9 w-9 items-center justify-center rounded-md shrink-0"
        style={{
          backgroundColor: universe.secondaryColor || "#f3f4f6",
          color: universe.accentColor || "#374151",
        }}
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          {universe.name}
          {disabled && (
            <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">
              pronto
            </span>
          )}
        </span>
        {isCurrent && !disabled && (
          <span className="text-xs text-gray-500">Activo</span>
        )}
      </div>
      {isCurrent && !disabled && (
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ backgroundColor: universe.primaryColor || "#10B981" }}
        />
      )}
    </div>
  );

  return (
    <div className="space-y-1">
      {disabled ? (
        <div>{header}</div>
      ) : (
        <Link href={UniverseHref(universe)}>{header}</Link>
      )}

      {!disabled && (
        <div className="pt-1 px-2 space-y-0.5">
          {visible.length === 0 ? (
            <div className="px-3 py-1.5 text-xs text-gray-400">Sin categorías</div>
          ) : (
            visible.map((cat) => (
              <Link
                key={cat.id}
                href={categoryHrefFor(universe.slug, cat.slug)}
                className="block px-3 py-1.5 text-sm text-gray-600 hover:text-black hover:bg-zinc-50 rounded transition-colors"
              >
                {cat.name}
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

const Header: FC = (): ReactElement | null => {
  const items: CartItem[] = useCartStore((state: CartState): CartItem[] => state.items);
  const getCartSubtotal: (isB2BContext?: boolean) => number = useCartStore((state: CartState) => state.getCartSubtotal);

  const customer: Customer | null = useAuthStore((state: any): Customer | null => state.customer);
  const logout: (redirect?: string) => Promise<void> = useAuthStore((state: any) => state.logout);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const pathname: string = usePathname();

  const { universes, currentUniverse, categoriesByUniverseId } = useUniverse();

  React.useEffect(() => {
    setIsMounted(true);
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

  const themeStyle = universeCssVars(currentUniverse);

  return (
    <header
      className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md"
      style={themeStyle}
    >
      <div className="w-full max-w-350 mx-auto px-5 md:px-16">
        <div className="flex justify-between items-center h-16">

          {/* Logo - Nimvu */}
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-tighter text-black">
              <Image
                className="dark:invert"
                src="/isologo-nimvu.png"
                alt="Nimvu logo"
                width={44}
                height={44}
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

            {/* Universos (megamenu con categorías por universo) */}
            <div className="relative group/uni h-full flex items-center">
              <button className="text-black transition flex items-center gap-1 cursor-pointer outline-none py-4">
                Universos <ChevronDown className="w-4 h-4 transition-transform group-hover/uni:-rotate-180" />
              </button>
              <div className="absolute top-[calc(100%-0.5rem)] left-1/2 -translate-x-1/2 w-[640px] bg-white border border-gray-100 rounded-lg shadow-xl opacity-0 invisible group-hover/uni:opacity-100 group-hover/uni:visible transition-all duration-300 z-50 p-3 translate-y-2 group-hover/uni:translate-y-0">
                <div className="px-3 pt-1 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Universos
                </div>
                {universes.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2">
                    {universes.map((u) => (
                      <UniverseColumn
                        key={u.id}
                        universe={u}
                        categories={categoriesByUniverseId[u.id] || []}
                        isCurrent={currentUniverse?.id === u.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="px-3 py-2 text-sm text-gray-400">Cargando...</div>
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
                  <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                    <SheetTitle className="sr-only">Menú de navegación</SheetTitle>
                    <nav className="flex flex-col gap-4 mt-8 px-2">

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

                      <Separator />

                      <div className="space-y-3">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400 px-1">
                          Universos
                        </div>

                        {universes.map((u) => {
                          const Icon = getUniverseIcon(u.icon);
                          const disabled = u.comingSoon || !u.isActive;
                          const isCurrent = currentUniverse?.id === u.id;
                          const cats = (categoriesByUniverseId[u.id] || []).filter(hasProducts);

                          const row = (
                            <div className={`flex items-center gap-3 py-2 px-1 ${disabled ? "opacity-50" : ""}`}>
                              <div
                                className="flex h-8 w-8 items-center justify-center rounded-md shrink-0"
                                style={{
                                  backgroundColor: u.secondaryColor || "#f3f4f6",
                                  color: u.accentColor || "#374151",
                                }}
                              >
                                {Icon ? <Icon className="h-4 w-4" /> : null}
                              </div>
                              <span className="text-md font-semibold flex items-center gap-2">
                                {u.name}
                                {disabled && (
                                  <span className="text-[10px] uppercase tracking-wide text-gray-400 font-medium">pronto</span>
                                )}
                                {isCurrent && !disabled && (
                                  <span
                                    className="h-2 w-2 rounded-full"
                                    style={{ backgroundColor: u.primaryColor || "#10B981" }}
                                  />
                                )}
                              </span>
                            </div>
                          );

                          return (
                            <div key={u.id} className="space-y-1">
                              {disabled ? (
                                <div>{row}</div>
                              ) : (
                                <SheetClose asChild>
                                  <Link href={UniverseHref(u)}>{row}</Link>
                                </SheetClose>
                              )}

                              {!disabled && cats.length > 0 && (
                                <div className="pl-11 space-y-0.5">
                                  {cats.map((cat) => (
                                    <SheetClose asChild key={cat.id}>
                                      <Link
                                        href={categoryHrefFor(u.slug, cat.slug)}
                                        className="block py-1.5 text-sm text-gray-600 hover:text-primary transition-colors"
                                      >
                                        {cat.name}
                                      </Link>
                                    </SheetClose>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <Separator />

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
