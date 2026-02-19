"use client"
import Link from "next/link"
import { collections, FrontendProduct } from "@/lib/api"
import { useEffect, useState } from "react"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ProductItem from "@/components/custom/singleProduct";
import TestimonialItem from "@/components/custom/testimonialItem";
// import { Product } from "@/types/product"; // Removed in favor of FrontendProduct
import { TestimonialsModel } from "@/types/testimonials";
import testimonials from "@/data/testimonials.json"

export default function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [products, setProducts] = useState<FrontendProduct[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const bestSellers = await collections.retrieve("ec6d6793-e160-4858-b231-561cb035ff9f")
        setProducts(bestSellers.products)
      } catch (err) {
        let errorMessage = "An error occurred"
        if (err instanceof Error) {
          errorMessage = err.message
        }
        if (errorMessage === "Network Error") {
          errorMessage = "Failed to fetch. Ensure your NestJS backend is running on port 3001."
        }
        setError(errorMessage)
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  return (
    <div className="flex items-center justify-center font-sans dark:bg-black">
      <main className="flex sm:max-w-full md:max-w-350 w-full flex-col items-center py-16 px-5 md:px-16 bg-white dark:bg-black sm:items-start">
        <section className="banner-section w-full pb-[100px]">
          <div className="call-to-action bg-[url(/banner-mobile.jpg)] md:bg-[url(/BANNER-1.jpg)] md:max-h-500 w-full bg-cover h-[600px] p-10 flex items-baseline grid-cols-1 flex-col justify-start pt-32 md:justify-center md:pt-10 rounded-md">
            <h1 className="font-italiana text-5xl py-4">Diseño funcional que emociona</h1>
            <Link href="/productos" className="bg-black text-white py-2 px-4">Ver más</Link>
          </div>
        </section>
        <section className="top-products-section w-full pb-[100px]">
          <h2 className="text-4xl font-italiana">Nuestros productos más populares</h2>
          <p className="pb-[50px]">Explora los favoritos en decoración moderna y accesorios de mesa. Piezas de diseño único y funcional perfectas para renovar tu hogar.</p>
          <div className="carousel-container">
            {loading && <p>Cargando...</p>}

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {products.map((product: FrontendProduct) => (
                  <CarouselItem key={product.id} className="md:basis-1/2 lg:basis-1/4 p-5">
                    <ProductItem item={product}></ProductItem>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>

        <section className="kpop-banner w-full pb-[100px]">
          <div className="relative w-full rounded-md overflow-hidden">
            {/* Mobile Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bts21-3.jpg" alt="Colección K-POP Mobile" className="block md:hidden w-full h-auto" />

            {/* Desktop Image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/bts21-1.jpg" alt="Colección K-POP Desktop" className="hidden md:block w-full h-auto" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-16 md:justify-center md:items-start md:pl-24 md:pt-0 text-center md:text-left">
              <span className="text-xs md:text-sm font-bold tracking-[0.2em] mb-2 text-purple-900 uppercase">
                Colección K-POP
              </span>
              <h2 className="font-italiana text-4xl md:text-6xl mb-4 text-purple-950 leading-tight">
                Organiza <br className="md:hidden" /> tu Pasión
              </h2>
              <p className="text-sm md:text-lg mb-8 max-w-[250px] md:max-w-md text-gray-600 font-medium">
                Dale a tu Army Bomb el lugar que merece.
              </p>
              <a href="/coleccion/bts" className="bg-purple-900 text-white py-3 px-8 rounded-none font-bold text-xs tracking-widest hover:opacity-90 transition-opacity uppercase">
                Ver Modelos
              </a>
            </div>
          </div>
        </section>
        <section className="testimonials w-full">
          <h2 className="text-4xl font-italiana">Qué dicen nuestros clientes</h2>
          <p className="pb-[50px]">La experiencia de quienes ya transformaron sus mesas y espacios con Nimvu.</p>
          <div className="carousel-container">
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent>
                {testimonials.map((user: TestimonialsModel) => (
                  <CarouselItem key={user.id} className="md:basis-1/2 lg:basis-1/4 p-5">
                    <TestimonialItem item={user} />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="hidden md:flex" />
              <CarouselNext className="hidden md:flex" />
            </Carousel>
          </div>
        </section>
      </main>
    </div>
  );
}
