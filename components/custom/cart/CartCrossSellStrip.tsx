"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { trackAddToCart } from "@/lib/analytics";
import { FrontendProduct } from "@/lib/api";

/** Producto recortado que devuelve /api/cross-sell. */
export interface CrossSellProduct {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  price: number;
  discountPrice?: number;
  discountEndDate?: string | null;
  category?: { name: string };
  universe?: { slug: string };
}

// Se cachea a nivel de módulo, por combinación de carrito: el drawer se monta
// y desmonta en cada apertura y no tiene sentido volver a pedir lo mismo.
const cache = new Map<string, CrossSellProduct[]>();
const inFlight = new Map<string, Promise<CrossSellProduct[]>>();

const loadSuggestions = (ids: string): Promise<CrossSellProduct[]> => {
  const hit = cache.get(ids);
  if (hit) return Promise.resolve(hit);

  let pending = inFlight.get(ids);
  if (!pending) {
    pending = fetch("/api/cross-sell?ids=" + encodeURIComponent(ids))
      .then((res) => (res.ok ? res.json() : []))
      .then((data: CrossSellProduct[]) => {
        cache.set(ids, data);
        return data;
      })
      .catch(() => [])
      .finally(() => {
        inFlight.delete(ids);
      });
    inFlight.set(ids, pending);
  }
  return pending;
};

/**
 * Tira compacta de sugerencias dentro del drawer del carrito.
 *
 * Va aquí y no solo en /cart porque el botón principal del drawer lleva
 * directo al checkout: la página del carrito casi nadie la ve. Este es el
 * único momento en que el cliente mira lo que lleva antes de pagar.
 *
 * El envío que se le cobra depende solo de la ubicación, nunca de la cantidad
 * de piezas, así que sumar otra no le cuesta más envío. Eso es lo que dice.
 */
export default function CartCrossSellStrip() {
  const items = useCartStore((state) => state.items);
  const addItem = useCartStore((state) => state.addItem);

  // Se congela al abrir el drawer. Si se recalculara con cada "Agregar", la
  // tira se reordenaría bajo el dedo del cliente justo al tocarla.
  const [idsAlAbrir] = useState(() =>
    (items ?? []).map((item) => item.productId).join(","),
  );

  const [products, setProducts] = useState<CrossSellProduct[]>(
    () => cache.get(idsAlAbrir) ?? [],
  );

  useEffect(() => {
    let active = true;
    loadSuggestions(idsAlAbrir).then((data) => {
      if (active) setProducts(data);
    });
    return () => {
      active = false;
    };
  }, [idsAlAbrir]);

  const suggestions = useMemo(() => {
    const inCart = new Set(items?.map((item) => item.productId) ?? []);
    return products.filter((p) => !inCart.has(p.id)).slice(0, 8);
  }, [products, items]);

  if (suggestions.length === 0) return null;

  const handleAdd = (product: CrossSellProduct) => {
    // Siempre el producto base, nunca una variante concreta: la tira no es el
    // lugar para elegir color. El que quiera escoger entra a la ficha. Al no
    // mandar variante, el backend valida y descuenta contra `product.stock`.
    addItem(product, product.id, 1);
    // Lleva los campos que el evento usa (id, title, category, precios).
    trackAddToCart(product as unknown as FrontendProduct, 1);
    toast.success("¡Producto agregado!", { position: "top-center" });
  };

  return (
    <div className="mt-6 border-t border-gray-100 dark:border-gray-800 pt-4">
      <p className="text-sm font-semibold text-gray-900 dark:text-white">
        Completa tu pedido
      </p>
      <p className="text-xs text-gray-500 mb-3">
        El envío te sigue costando lo mismo.
      </p>

      <div className="flex items-stretch gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x">
        {suggestions.map((product) => {
          const hasDiscount =
            !!product.discountPrice &&
            product.discountPrice > 0 &&
            product.discountPrice < product.price;
          const shown = hasDiscount ? product.discountPrice! : product.price;

          return (
            <div
              key={product.id}
              className="w-[124px] shrink-0 snap-start flex flex-col gap-1.5 h-auto"
            >
              <div className="relative w-full aspect-square rounded-md overflow-hidden bg-gray-50">
                {product.thumbnail ? (
                  <Image
                    src={product.thumbnail}
                    alt={product.title}
                    fill
                    sizes="124px"
                    className="object-cover"
                  />
                ) : null}
              </div>

              <p className="text-[11px] leading-tight text-gray-800 dark:text-gray-200 line-clamp-2 h-[28px] overflow-hidden">
                {product.title}
              </p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {formatPrice(shown)}
              </p>

              <button
                type="button"
                onClick={() => handleAdd(product)}
                aria-label={`Agregar ${product.title} al carrito`}
                className="mt-auto inline-flex items-center justify-center gap-1 w-full rounded-md border border-black py-1.5 text-[11px] font-semibold uppercase tracking-wide text-black hover:bg-black hover:text-white transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                Agregar
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
