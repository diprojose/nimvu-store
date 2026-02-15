"use client"
import { products as apiProducts, FrontendProduct } from "@/lib/api"
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
        const productList = await apiProducts.list()
        setProducts(productList)
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
          <div className="call-to-action bg-[url(/banner.jpg)] md:max-h-500 w-full bg-cover h-[600px] p-10 flex items-baseline grid-cols-1 flex-col justify-center rounded-md">
            <h1 className="font-italiana text-5xl py-4">Diseño funcional que emociona</h1>
            <button className="bg-black text-white py-2 px-4">Ver más</button>
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
        <section className="testimonials w-full">
          <h2 className="text-4xl font-italiana">Que dicen nuestros clientes</h2>
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
