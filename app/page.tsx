import Link from "next/link"
import ReactDOM from "react-dom"
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
  // Precarga la imagen LCP del banner (fondo CSS) para que el navegador la
  // descubra desde el HTML inicial y la baje con prioridad alta (mejora LCP).
  ReactDOM.preload("/banner-web-3.jpg", { as: "image", fetchPriority: "high" });

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
          <div className="call-to-action font-inter relative bg-[url(/banner-web-3.jpg)] md:max-h-500 w-full bg-cover bg-left md:bg-center h-[600px] px-6 py-10 md:p-10 flex items-start grid-cols-1 flex-col justify-start pt-24 md:justify-center md:pt-10 rounded-md">
            <span className="font-inter text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-[#B55934]">
              Bienvenido a Nimvu
            </span>

            <h1 className="font-source-serif font-semibold text-[2.5rem] md:text-6xl leading-[1.05] tracking-tight max-w-[85%] md:max-w-xl text-gray-900">
              Piezas únicas para espacios que cuentan historias
            </h1>

            <span
              className="block my-5 md:my-6 bg-[#B55934]"
              style={{ width: '60px', height: '2px' }}
              aria-hidden="true"
            />

            <p className="font-inter text-sm md:text-base mb-6 max-w-[80%] md:max-w-md text-gray-700 dark:text-gray-200">
              Diseño moderno y funcional, hecho para durar.
            </p>

            <Link
              href="/productos"
              className="font-inter font-medium text-white bg-[#B55934] hover:bg-[#9A4929] py-3 px-6 text-sm tracking-wide transition-colors w-fit self-start inline-block"
            >
              Explorar la tienda →
            </Link>
          </div>
        </section>

        <section className="top-products-section w-full pb-[100px]">
          <h2 className="font-source-serif font-semibold text-4xl md:text-5xl tracking-tight">Nuestros productos más populares</h2>
          <p className="font-inter pb-[50px] mt-2 text-gray-700">Explora los favoritos en decoración moderna y accesorios de mesa. Piezas de diseño único y funcional perfectas para renovar tu hogar.</p>
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
              <span className="font-inter text-[10px] md:text-xs font-semibold tracking-[0.25em] uppercase mb-3 text-[#1A1A1A]">
                Iluminación
              </span>
              <h2 className="font-source-serif font-semibold text-3xl md:text-6xl mb-3 text-black leading-[1.05] tracking-tight">
                Aura. Duna. Cala.
              </h2>
              <p className="font-inter text-xs md:text-lg mb-6 md:max-w-md text-black/80 font-medium">
                Tres formas. Una sola luz cálida para tu hogar.
              </p>
              <a href="/coleccion/lamparas-decorativas" className="font-inter bg-[#1F4D3F] hover:bg-[#163A2F] text-white py-3 px-8 rounded-none font-bold text-xs tracking-widest transition-colors uppercase">
                Ver colección
              </a>
            </div>
          </div>
        </section>

        <section className="testimonials w-full pb-[100px]">
          <h2 className="font-source-serif font-semibold text-4xl md:text-5xl tracking-tight">Qué dicen nuestros clientes</h2>
          <p className="font-inter pb-[50px] mt-2 text-gray-700">La experiencia de quienes ya transformaron sus mesas y espacios con Nimvu.</p>
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
              <span className="font-inter text-[10px] md:text-xs font-semibold tracking-[0.25em] mb-3 text-purple-900 uppercase">
                Colección K-POP
              </span>
              <h2 className="font-source-serif font-semibold text-4xl md:text-6xl mb-4 text-purple-950 leading-[1.05] tracking-tight">
                Organiza <br className="md:hidden" /> tu Pasión
              </h2>
              <p className="font-inter text-sm md:text-lg mb-8 max-w-[280px] md:max-w-md text-gray-700 font-medium">
                Soportes de diseño para tu Army Bomb y figuras coleccionables.
              </p>
              <a href="/coleccion/bts" className="font-inter bg-white hover:bg-gray-50 text-[#7B5BA8] py-3 px-8 rounded-none font-bold text-xs tracking-widest transition-colors uppercase shadow-sm">
                Ver Modelos
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
