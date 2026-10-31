import { collections, products as apiProducts, reviews, FrontendProduct, FeaturedReview } from "@/lib/api"
import HomeProductCarousel from "@/components/custom/HomeProductCarousel";
import HomeReviews from "@/components/custom/HomeReviews";
import HomeHero from "@/components/custom/HomeHero";
import HomeStatement from "@/components/custom/HomeStatement";

const BEST_SELLERS_COLLECTION_ID = "ec6d6793-e160-4858-b231-561cb035ff9f";
const NUEVOS_COLLECTION_SLUG = "nuevos";

export default async function Home() {

  let products: FrontendProduct[] = [];
  let newProducts: FrontendProduct[] = [];
  let error: string | null = null;

  // Las dos colecciones se piden en paralelo para no encadenar dos esperas.
  const [bestSellersResult, nuevosResult, reviewsResult] = await Promise.allSettled([
    collections.retrieve(BEST_SELLERS_COLLECTION_ID),
    collections.retrieveBySlug(NUEVOS_COLLECTION_SLUG),
    reviews.featured(),
  ]);

  // Sin reseñas (o si falla la consulta) la sección simplemente no aparece.
  const featuredReviews: FeaturedReview[] =
    reviewsResult.status === "fulfilled" ? reviewsResult.value : [];

  if (bestSellersResult.status === "fulfilled") {
    products = bestSellersResult.value.products;
  } else {
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

  // Novedades no tiene fallback a propósito: rellenar esta sección con
  // productos cualesquiera sería mentirle al cliente. Si falla, no se muestra.
  if (nuevosResult.status === "fulfilled") {
    newProducts = nuevosResult.value.products;
  } else {
    console.error("No se pudo cargar la colección 'nuevos'", nuevosResult.reason);
  }

  return (
    <div className="flex items-center justify-center font-sans dark:bg-black">
      <main className="flex sm:max-w-full md:max-w-350 w-full flex-col items-center py-16 px-5 md:px-16 bg-white dark:bg-black sm:items-start">
        <section className="banner-section w-full pb-[100px]">
          <HomeHero />
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

        <HomeReviews items={featuredReviews} />

        {newProducts.length > 0 && (
          <section className="new-products-section w-full pb-[100px]">
            <h2 className="font-source-serif font-semibold text-4xl md:text-5xl tracking-tight">Nuevo en Nimvu</h2>
            <p className="font-inter pb-[50px] mt-2 text-gray-700">Lo último que salió de nuestros talleres. Piezas diseñadas para darle un aire distinto a tu espacio.</p>
            <div className="carousel-container">
              <HomeProductCarousel products={newProducts} />
            </div>
          </section>
        )}

        <HomeStatement />
      </main>
    </div>
  );
}
