import Link from "next/link"
import { collections, products as apiProducts, FrontendProduct } from "@/lib/api"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import HomeProductCarousel from "@/components/custom/HomeProductCarousel";
import TestimonialItem from "@/components/custom/testimonialItem";
import { TestimonialsModel } from "@/types/testimonials";
import testimonials from "@/data/testimonials.json"

export default async function Home() {
  let products: FrontendProduct[] = [];
  let error: string | null = null;

  try {
    // Intentamos cargar la colección por ID usando fetch con caché (ISR)
    const bestSellers = await collections.retrieve("ec6d6793-e160-4858-b231-561cb035ff9f");
    products = bestSellers.products;
  } catch (err) {
    // FALLBACK: Si no existe el ID o falla, cargamos productos genéricos
    try {
      const allProducts = await apiProducts.list();
      products = allProducts.slice(0, 8); // Mostramos hasta 8 en el carousel
    } catch (e) {
      if (e instanceof Error) {
        error = e.message === "Network Error"
          ? "Failed to fetch. Ensure your NestJS backend is running."
          : e.message;
      } else {
        error = "An unexpected error occurred.";
      }
      console.error("El fallback también falló", e);
    }
  }

  return (
    <div className="flex items-center justify-center font-sans dark:bg-black">
      <main className="flex sm:max-w-full md:max-w-350 w-full flex-col items-center py-16 px-5 md:px-16 bg-white dark:bg-black sm:items-start">
        <section className="banner-section w-full pb-[100px]">
          <div className="call-to-action font-inter relative bg-[url(/banner-web-2.jpg)] md:max-h-500 w-full bg-cover bg-left md:bg-center h-[600px] px-6 py-10 md:p-10 flex items-start grid-cols-1 flex-col justify-start pt-24 md:justify-center md:pt-10 rounded-md">
            <span
              className="font-inter text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase mb-3"
              style={{ color: '#D63A2F' }}
            >
              Día de la Madre
            </span>

            <h1
              className="font-fraunces font-semibold text-[2.5rem] md:text-6xl leading-[1.05] tracking-tight max-w-[85%] md:max-w-xl text-gray-900"
            >
              Para la mujer<br />
              que siempre<br />
              cuida tu mesa.
            </h1>

            <span
              className="block my-5 md:my-6"
              style={{ width: '60px', height: '2px', backgroundColor: '#D63A2F' }}
              aria-hidden="true"
            />

            <p className="font-inter text-sm md:text-base mb-6 max-w-[80%] md:max-w-md text-gray-700 dark:text-gray-200">
              Esta vez, regálale algo que también cuide la suya.
            </p>

            <Link
              href="/productos"
              className="font-inter font-medium text-white bg-[#D63A2F] hover:bg-[#B82E26] py-3 px-6 text-sm tracking-wide transition-colors w-fit self-start inline-block"
            >
              Ver regalos para mamá →
            </Link>

            <p className="font-inter absolute bottom-10 md:bottom-8 left-6 right-6 md:left-10 md:right-10 text-xs md:text-sm italic max-w-[85%] md:max-w-md text-gray-600 dark:text-gray-300">
              *Síguenos en redes y descubre un descuento para mamá.
            </p>
          </div>
        </section>

        <section className="top-products-section w-full pb-[100px]">
          <h2 className="text-4xl font-italiana">Nuestros productos más populares</h2>
          <p className="pb-[50px]">Explora los favoritos en decoración moderna y accesorios de mesa. Piezas de diseño único y funcional perfectas para renovar tu hogar.</p>
          <div className="carousel-container">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <strong>Error:</strong> {error}
              </div>
            )}

            {!error && products.length > 0 && (
              <HomeProductCarousel products={products} />
            )}
          </div>
        </section>

        <section className="lamparas-banner w-full pb-[100px]">
          <div className="relative w-full rounded-md overflow-hidden">
            {/* Mobile Image */}
            <img src="/banner-lamparas-mobile.jpg" alt="Colección Iluminación Nimvu Mobile" className="block md:hidden w-full h-auto" />

            {/* Desktop Image */}
            <img src="/banner-lamparas.jpg" alt="Colección Iluminación Nimvu Desktop" className="hidden md:block w-full h-auto" />

            {/* Content Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-start pt-10 md:justify-center md:items-start md:pl-24 md:pt-0 text-center md:text-left">
              <h2 className="font-italiana text-3xl md:text-6xl mb-2 text-black leading-tight">
                Aura. Duna. Cala.
              </h2>
              <p className="text-xs md:text-lg mb-6 md:max-w-md text-black/80 font-medium">
                La primera colección de iluminación Nimvu
              </p>
              <a href="/coleccion/lamparas-decorativas" className="bg-black text-white py-3 px-8 rounded-none font-bold text-xs tracking-widest hover:opacity-90 transition-opacity uppercase">
                Ver colección
              </a>
            </div>
          </div>
        </section>

        <section className="testimonials w-full pb-[100px]">
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

        <section className="kpop-banner w-full">
          <div className="relative w-full rounded-md overflow-hidden">
            {/* Mobile Image */}
            <img src="/bts21-3.jpg" alt="Colección K-POP Mobile" className="block md:hidden w-full h-auto" />

            {/* Desktop Image */}
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
      </main>
    </div>
  );
}
