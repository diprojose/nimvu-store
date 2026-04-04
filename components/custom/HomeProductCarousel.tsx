"use client";

import { useState, useEffect, useCallback } from "react";
import { FrontendProduct } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
  type CarouselApi,
} from "@/components/ui/carousel";

interface HomeProductCarouselProps {
  products: FrontendProduct[];
}

export default function HomeProductCarousel({ products }: HomeProductCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slideCount, setSlideCount] = useState(0);

  const onSelect = useCallback((api: CarouselApi) => {
    if (!api) return;
    setCurrentSlide(api.selectedScrollSnap());
    setSlideCount(api.scrollSnapList().length);
  }, []);

  useEffect(() => {
    if (!carouselApi) return;
    onSelect(carouselApi);
    carouselApi.on("select", () => onSelect(carouselApi));
    return () => { carouselApi.off("select", () => onSelect(carouselApi)); };
  }, [carouselApi, onSelect]);

  return (
    <>
      <Carousel
        setApi={setCarouselApi}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {products.map((product: FrontendProduct) => (
            <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4 p-5">
              <ProductItem item={product} />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex" />
        <CarouselNext className="hidden md:flex" />
      </Carousel>

      {/* Dots — solo visibles en mobile */}
      {slideCount > 1 && (
        <div className="flex md:hidden justify-center gap-2 mt-4">
          {Array.from({ length: slideCount }).map((_, i) => (
            <button
              key={i}
              onClick={() => carouselApi?.scrollTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                i === currentSlide ? "bg-black scale-125" : "bg-gray-300"
              }`}
              aria-label={`Ir a producto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </>
  );
}
