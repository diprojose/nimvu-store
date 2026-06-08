import { notFound, redirect } from "next/navigation";
import {
  universes as universesApi,
  banners as bannersApi,
  products as productsApi,
  type FrontendProduct,
  type BackendBanner,
} from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import UniverseBanner from "@/components/custom/UniverseBanner";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ universo: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universo } = await params;
  try {
    const u = await universesApi.retrieve(universo);
    return {
      title: `${u.name} | Nimvu`,
      description: u.description ?? `Productos del universo ${u.name} de Nimvu.`,
    };
  } catch {
    return { title: "Nimvu" };
  }
}

export default async function UniversePage({ params }: PageProps) {
  const { universo } = await params;

  // Canonical: hogar lives at /, not /hogar
  if (universo.toLowerCase() === "hogar") {
    redirect("/");
  }

  let universe;
  try {
    universe = await universesApi.retrieve(universo);
  } catch {
    notFound();
  }

  if (!universe || !universe.isActive || universe.comingSoon) {
    notFound();
  }

  let bannerList: BackendBanner[] = [];
  let productList: FrontendProduct[] = [];
  try {
    [bannerList, productList] = await Promise.all([
      bannersApi.list({ universeSlug: universe.slug, activeOnly: true }),
      productsApi.list({ universeSlug: universe.slug }),
    ]);
  } catch (err) {
    console.error("Error loading universe content", universe.slug, err);
  }

  return (
    <div className="flex items-center justify-center font-sans dark:bg-black">
      <main className="flex sm:max-w-full md:max-w-350 w-full flex-col items-center py-16 px-5 md:px-16 bg-white dark:bg-black sm:items-start">

        {/* Banners (el primero hace de hero) */}
        {bannerList.map((banner) => (
          <UniverseBanner
            key={banner.id}
            banner={banner}
            fallbackTextColor={universe.accentColor || undefined}
          />
        ))}

        {/* Grid de productos del universo */}
        <section className="w-full pb-[100px]">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="font-source-serif font-semibold text-3xl md:text-4xl tracking-tight">
                Productos
              </h2>
              <p className="font-inter mt-2 text-gray-700">
                Todo lo que tenemos en {universe.name}.
              </p>
            </div>
            <span className="text-sm text-gray-500 hidden md:block">
              {productList.length} productos
            </span>
          </div>

          {productList.length === 0 ? (
            <p className="text-gray-500 py-12 text-center w-full">
              Pronto vamos a tener productos en este universo. ¡Volvé pronto!
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 w-full">
              {productList.map((product) => (
                <ProductItem key={product.id} item={product} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
