"use client";

import { useMemo } from "react";
import { FrontendProduct } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import { useCartStore } from "@/store/cart";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export interface CartCrossSellProps {
  /** Candidatos ya filtrados y acotados en el servidor. */
  products: FrontendProduct[];
}

/**
 * "Completa tu pedido": sugerencias dentro del carrito.
 *
 * Casi todos los pedidos salen con un solo producto. El envío que se le cobra
 * al cliente depende solo de la ubicación (`shipping.resolveShippingCost` no
 * mira cantidades), así que sumar una segunda pieza no le cuesta un peso más
 * de envío a quien compra. Ese es el argumento que se le muestra, y es cierto.
 *
 * Se ordenan de menor a mayor precio a propósito: la idea es que agregar algo
 * más se sienta trivial, no abrir una segunda decisión de compra grande.
 */
export default function CartCrossSell({ products }: CartCrossSellProps) {
  const items = useCartStore((state) => state.items);

  const suggestions = useMemo(() => {
    const inCart = new Set(items?.map((item) => item.productId) ?? []);
    return products.filter((product) => !inCart.has(product.id)).slice(0, 10);
  }, [products, items]);

  if (suggestions.length === 0) return null;

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="text-2xl md:text-3xl font-source-serif font-semibold text-gray-900 mb-2">
        Completa tu pedido
      </h2>
      <p className="font-inter text-sm text-gray-600 mb-8">
        Suma otra pieza: el envío de tu pedido sigue costando lo mismo.
      </p>

      <Carousel opts={{ align: "start" }} className="w-full">
        <CarouselContent className="-ml-4">
          {suggestions.map((product) => (
            <CarouselItem
              key={product.id}
              className="pl-4 basis-3/4 sm:basis-1/2 md:basis-1/3 lg:basis-1/4"
            >
              <ProductItem item={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>
    </section>
  );
}
