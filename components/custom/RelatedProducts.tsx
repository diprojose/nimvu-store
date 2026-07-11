"use client";

import { FrontendProduct } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";

export interface RelatedProductsProps {
  products: FrontendProduct[];
}

/**
 * Carrusel "Esto te puede gustar" para la página de producto.
 * Recibe una lista ya filtrada (sin el producto actual) desde el servidor.
 */
export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="bg-white dark:bg-black pb-20 px-4 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-gray-800 pt-12">
        <h2 className="text-2xl md:text-3xl font-source-serif font-semibold font-bold mb-8 dark:text-white">
          Esto te puede gustar
        </h2>

        <Carousel opts={{ align: "start", loop: true }} className="w-full">
          <CarouselContent className="-ml-4">
            {products.map((product) => (
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
      </div>
    </section>
  );
}
