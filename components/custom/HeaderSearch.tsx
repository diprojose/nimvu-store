"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search, X, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { trackSearch } from "@/lib/analytics";
import { SearchItem, searchProducts, splitHighlights } from "@/lib/search";

const MAX_RESULTS = 8;

// Atajos cuando el campo está vacío o no hay resultados: el panel nunca se ve
// en blanco y quien no sabe qué escribir tiene por dónde empezar.
const POPULAR = ["Portavasos", "Monstera", "Lámparas", "Army Bomb", "Gamer"];

// Tiempo sin escribir para dar una búsqueda por terminada y medirla. Más corto
// mediría cada letra ("m", "mo", "mon"...).
const TRACK_DELAY_MS = 1200;

// El índice se pide una sola vez por visita y se comparte entre aperturas.
let indexPromise: Promise<SearchItem[]> | null = null;

function loadIndex(): Promise<SearchItem[]> {
  if (!indexPromise) {
    indexPromise = fetch("/api/search-index")
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(res.statusText))))
      .catch((error) => {
        // Se olvida la promesa fallida para reintentar en la próxima apertura.
        indexPromise = null;
        throw error;
      });
  }
  return indexPromise;
}

const hasActiveDiscount = (item: SearchItem) =>
  !!item.discountPrice &&
  item.discountPrice > 0 &&
  item.discountPrice < item.price &&
  (!item.discountEndDate || new Date(item.discountEndDate) >= new Date());

const resultsHref = (query: string) => `/productos?q=${encodeURIComponent(query.trim())}`;

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName);
}

export default function HeaderSearch() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchItem[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(-1);
  const lastTracked = useRef("");

  const prefetch = useCallback(() => {
    loadIndex().then(setIndex, () => setFailed(true));
  }, []);

  const term = query.trim();
  const results = useMemo(
    () => (index && term ? searchProducts(index, term) : []),
    [index, term],
  );
  const visible = results.slice(0, MAX_RESULTS);

  const track = useCallback(() => {
    if (!index || term.length < 2 || lastTracked.current === term) return;
    lastTracked.current = term;
    trackSearch(term, results.length);
  }, [index, term, results.length]);

  // Se mide cuando la persona deja de escribir, no en cada letra.
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(track, TRACK_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open, track]);

  // "/" o Ctrl+K abren el buscador desde cualquier parte, salvo mientras se
  // escribe en otro campo (el checkout, el formulario de reseñas...).
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const shortcut =
        (e.key === "k" && (e.metaKey || e.ctrlKey)) ||
        (e.key === "/" && !e.metaKey && !e.ctrlKey && !e.altKey && !isTypingTarget(e.target));
      if (!shortcut) return;
      e.preventDefault();
      prefetch();
      setOpen(true);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [prefetch]);

  const onOpenChange = (next: boolean) => {
    if (next) prefetch();
    else track();
    setOpen(next);
  };

  const updateQuery = (value: string) => {
    setQuery(value);
    setActive(-1);
  };

  const go = (href: string) => {
    track();
    setOpen(false);
    router.push(href);
  };

  const onInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown" && visible.length) {
      e.preventDefault();
      setActive((i) => (i + 1) % visible.length);
    } else if (e.key === "ArrowUp" && visible.length) {
      e.preventDefault();
      setActive((i) => (i <= 0 ? visible.length - 1 : i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (active >= 0 && visible[active]) go(`/productos/${visible[active].item.slug}`);
      else if (visible.length === 1) go(`/productos/${visible[0].item.slug}`);
      else if (term) go(resultsHref(term));
    }
  };

  const loading = !!term && !index && !failed;
  const showEmpty = !!term && !!index && results.length === 0;

  const chips = (
    <div>
      <p className="mb-3 text-sm text-gray-600">Búsquedas populares</p>
      <div className="flex flex-wrap gap-2">
        {POPULAR.map((label) => (
          <button
            key={label}
            type="button"
            onClick={() => {
              updateQuery(label);
              inputRef.current?.focus();
            }}
            className="rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-900 transition-colors hover:border-black active:bg-gray-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Trigger asChild>
        <button
          type="button"
          aria-label="Buscar productos"
          onMouseEnter={prefetch}
          onFocus={prefetch}
          onTouchStart={prefetch}
          className="p-1 text-black cursor-pointer"
        >
          <Search className="h-6 w-6" />
        </button>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-[1000] bg-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
          className="fixed inset-x-0 top-0 z-[1000] flex h-[100dvh] flex-col bg-white font-inter shadow-xl md:h-auto md:max-h-[85vh] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-top-4 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 motion-reduce:animate-none"
        >
          <DialogPrimitive.Title className="sr-only">Buscar productos</DialogPrimitive.Title>

          <div className="mx-auto flex w-full max-w-350 min-h-0 flex-1 flex-col px-5 md:px-16">
            <form
              role="search"
              onSubmit={(e) => e.preventDefault()}
              className="mt-3 flex h-12 shrink-0 items-center gap-3 rounded-md bg-gray-100 pl-4 pr-1 md:mt-5 md:h-14"
            >
              <Search className="h-5 w-5 shrink-0 text-gray-600" aria-hidden="true" />
              <input
                ref={inputRef}
                type="search"
                inputMode="search"
                enterKeyHint="search"
                autoComplete="off"
                spellCheck={false}
                placeholder="¿Qué estás buscando?"
                value={query}
                onChange={(e) => updateQuery(e.target.value)}
                onKeyDown={onInputKeyDown}
                role="combobox"
                aria-label="Buscar productos"
                aria-autocomplete="list"
                aria-expanded={visible.length > 0}
                aria-controls="header-search-results"
                aria-activedescendant={active >= 0 ? `header-search-option-${active}` : undefined}
                className="h-full min-w-0 flex-1 bg-transparent text-base text-gray-900 placeholder:text-gray-600 outline-none md:text-xl [&::-webkit-search-cancel-button]:hidden"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    updateQuery("");
                    inputRef.current?.focus();
                  }}
                  className="shrink-0 rounded-md px-2 py-1 text-sm text-gray-600 hover:text-black cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                >
                  Borrar
                </button>
              )}
              <DialogPrimitive.Close
                aria-label="Cerrar buscador"
                className="flex shrink-0 items-center gap-2 rounded-md p-2 text-gray-900 hover:bg-gray-200 active:bg-gray-300 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <kbd className="hidden rounded border border-gray-300 bg-white px-1.5 py-0.5 font-sans text-xs text-gray-600 md:inline">Esc</kbd>
                <X className="h-5 w-5" />
              </DialogPrimitive.Close>
            </form>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-6 md:py-8">
              {!term && chips}

              {loading && <p className="text-sm text-gray-600">Buscando...</p>}

              {showEmpty && (
                <div className="space-y-8">
                  <p className="text-gray-900">
                    No encontramos productos para <strong>&ldquo;{term}&rdquo;</strong>. Prueba con otra palabra.
                  </p>
                  {chips}
                </div>
              )}

              {/* Si el índice no cargó, la búsqueda completa en /productos sigue disponible. */}
              {term && failed && !index && (
                <Link
                  href={resultsHref(term)}
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-2 font-medium text-gray-900 underline underline-offset-4"
                >
                  Buscar &ldquo;{term}&rdquo; en la tienda <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {visible.length > 0 && (
                <>
                  <ul
                    id="header-search-results"
                    role="listbox"
                    aria-label="Productos encontrados"
                    className="grid gap-x-8 gap-y-1 md:grid-cols-2"
                  >
                    {visible.map(({ item, highlights }, i) => {
                      const href = `/productos/${item.slug}`;
                      const discounted = hasActiveDiscount(item);
                      return (
                        <li
                          key={item.id}
                          id={`header-search-option-${i}`}
                          role="option"
                          aria-selected={active === i}
                          onMouseMove={() => setActive(i)}
                        >
                          <Link
                            href={href}
                            tabIndex={-1}
                            onClick={(e) => {
                              // Ctrl/Cmd+clic abre en otra pestaña sin cerrar el panel.
                              if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                              e.preventDefault();
                              go(href);
                            }}
                            className={`flex items-center gap-4 rounded-md p-2 transition-colors ${active === i ? "bg-gray-100" : ""}`}
                          >
                            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-gray-100">
                              {item.thumbnail && (
                                <Image src={item.thumbnail} alt="" fill sizes="64px" className="object-cover" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-2 text-[15px] leading-snug text-gray-900">
                                {splitHighlights(item.title, highlights).map((part, j) =>
                                  part.match ? (
                                    <mark key={j} className="bg-transparent font-semibold text-black">{part.text}</mark>
                                  ) : (
                                    <React.Fragment key={j}>{part.text}</React.Fragment>
                                  ),
                                )}
                              </p>
                              <p className="mt-1 flex flex-wrap items-baseline gap-x-2 text-sm">
                                {discounted ? (
                                  <>
                                    <span className="font-semibold text-red-600">{formatPrice(item.discountPrice!)}</span>
                                    <span className="text-gray-500 line-through">{formatPrice(item.price)}</span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-gray-900">{formatPrice(item.price)}</span>
                                )}
                                {item.category && <span className="text-gray-600">· {item.category}</span>}
                                {item.stock <= 0 && <span className="text-gray-600">· Agotado</span>}
                              </p>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  <Link
                    href={resultsHref(term)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                      e.preventDefault();
                      go(resultsHref(term));
                    }}
                    className="mt-6 inline-flex items-center gap-2 rounded-sm font-medium text-gray-900 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  >
                    Ver todos los resultados ({results.length})
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
