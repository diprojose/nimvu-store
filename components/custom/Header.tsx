"use client"

import React, { FC, ReactElement, useMemo, useState } from "react";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from "next/image";
import { ShoppingCart, CircleUserRound, Menu, ChevronDown, Truck, ArrowRight } from "lucide-react";
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
  SheetDescription,
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
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";
import { Customer } from "@/types/customer";
import { useUniverse, universeCssVars } from "@/lib/universe-context";
import { BackendUniverse, BackendCategory } from "@/lib/api";
import { getUniverseIcon } from "@/lib/universe-icons";
import ShippingBanner from "@/components/custom/ShippingBanner";

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
    <>
    <header
      className="fixed w-full top-0 z-50 bg-white/80 backdrop-blur-md"
      style={themeStyle}
    >
      <ShippingBanner />
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
                <SheetContent className="flex flex-col h-[100dvh] max-h-[100dvh] p-0 w-full max-w-[420px] sm:max-w-md bg-white dark:bg-zinc-950">
                  <div className="p-5 pb-3 border-b border-gray-100 dark:border-gray-800 flex flex-col shrink-0">
                    <SheetTitle className="text-lg font-bold text-gray-900 dark:text-white">
                      Carrito
                    </SheetTitle>
                    <SheetDescription className="text-xs text-gray-500 mt-0.5">
                      {productQuantity === 1 ? "1 producto seleccionado" : `${productQuantity} productos seleccionados`}
                    </SheetDescription>
                  </div>

                  {/* Barra de Envío Gratis */}
                  {items && items.length > 0 && (
                    <div className="bg-emerald-50/70 border-b border-emerald-100 px-5 py-2.5 shrink-0">
                      <div className="flex items-center gap-2 text-xs text-emerald-800 font-medium mb-1.5">
                        <Truck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        {totalPrice >= FREE_SHIPPING_THRESHOLD ? (
                          <span>¡Genial! Tienes <strong>Envío Gratis</strong></span>
                        ) : (
                          <span>
                            Te faltan <strong>{formatPrice(FREE_SHIPPING_THRESHOLD - totalPrice)}</strong> para <strong>Envío Gratis</strong>
                          </span>
                        )}
                      </div>
                      <div className="w-full bg-emerald-200/60 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (totalPrice / FREE_SHIPPING_THRESHOLD) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Lista de productos scrolleable */}
                  <div className="cart-products flex-1 min-h-0 overflow-y-auto px-5 py-2">
                    {items && items.length > 0 ? (
                      <div className="divide-y divide-gray-100">
                        {items.map((product: CartItem) => (
                          <CartProductItem key={product.id} item={product} cart={true} />
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
                        <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-3">
                          <ShoppingCart className="w-7 h-7" />
                        </div>
                        <p className="font-semibold text-gray-900 mb-1">No hay productos</p>
                        <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                          Tu carrito está vacío. Agrega tus piezas favoritas para continuar.
                        </p>
                        <SheetClose asChild>
                          <Link href="/productos">
                            <Button variant="outline" size="sm" className="text-xs uppercase tracking-wider font-semibold border-black">
                              Ver Tienda
                            </Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
                  </div>

                  {/* Footer fijo al fondo con Subtotal y Botón de Pago */}
                  <div className="p-5 pt-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-zinc-950 mt-auto shrink-0 space-y-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                    <div className="subtotal-section flex justify-between items-center text-sm">
                      <p className="text-gray-600 font-medium">Subtotal:</p>
                      {totalPrice ? (
                        <p className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(totalPrice)}</p>
                      ) : (
                        <p className="text-base font-bold text-gray-900 dark:text-white">{formatPrice(0)}</p>
                      )}
                    </div>
                    {items && items.length > 0 ? (
                      <div className="checkout-section flex flex-col gap-2">
                        <SheetClose asChild>
                          <Link href="/checkout" className="w-full">
                            <Button className="w-full py-6 text-xs uppercase tracking-widest font-bold bg-black hover:bg-gray-800 text-white shadow-md cursor-pointer flex items-center justify-center gap-2">
                              <span>Ir a pagar</span>
                              <ArrowRight className="w-4 h-4" />
                            </Button>
                          </Link>
                        </SheetClose>
                        <SheetClose asChild>
                          <Link href="/cart" className="w-full text-center">
                            <span className="text-xs text-gray-500 hover:text-black underline transition-colors cursor-pointer py-1 block">
                              Ver carrito detallado
                            </span>
                          </Link>
                        </SheetClose>
                      </div>
                    ) : (
                      <div className="checkout-section">
                        <SheetClose asChild>
                          <Link href="/cart">
                            <Button className="w-full cursor-pointer" disabled>Ir a pagar</Button>
                          </Link>
                        </SheetClose>
                      </div>
                    )}
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
    {/* Spacer del alto del banner: el header es fixed, así que compensa el
        espacio extra que la franja añade sobre la altura de la navegación. */}
    <div className="h-9" aria-hidden="true" />
    </>
  );
};

export default Header;
