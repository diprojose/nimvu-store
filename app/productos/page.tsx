import { products as apiProducts, categories as apiCategories, FrontendProduct, BackendCategory } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import { Filter } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import categoryImages from "@/data/categoryImages.json";
import type { Metadata } from "next";
import { searchProducts, toSearchItem } from "@/lib/search";

type SearchParams = { [key: string]: string | string[] | undefined };

function searchTerm(params: SearchParams): string {
  const q = params.q;
  return (Array.isArray(q) ? q[0] : q)?.trim().slice(0, 80) ?? "";
}

// El canónico apunta siempre a /productos: los filtros por query (?category=)
// muestran el mismo catálogo y no deben competir como URLs distintas. Los
// resultados de búsqueda (?q=) además no se indexan.
export async function generateMetadata(props: {
  searchParams?: Promise<SearchParams>;
}): Promise<Metadata> {
  const q = searchTerm((await props.searchParams) ?? {});
  return {
    title: q ? `Resultados para "${q}"` : "Productos",
    description:
      "Explora el catálogo Nimvu: lámparas, materas, organizadores y piezas de diseño para tu hogar.",
    alternates: { canonical: "/productos" },
    ...(q && { robots: { index: false, follow: true } }),
  };
}

function categoryHref(universeSlug: string | undefined, slug: string): string {
  if (!universeSlug || universeSlug === "hogar") return `/categorias/${slug}`;
  return `/${universeSlug}/categorias/${slug}`;
}

function hasProducts(cat: BackendCategory): boolean {
  // Show by default if the backend didn't include _count; only hide explicit zero.
  return cat._count?.products === undefined ? true : cat._count.products > 0;
}

export async function ShopPage(props: {
  initialCategorySlug?: string;
  universeSlug?: string;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  // Await searchParams and combine logic gracefully
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const queryCategory = resolvedSearchParams.category as string | undefined;
  // Búsqueda del header ("Ver todos los resultados"). Abarca todo el catálogo
  // público, no solo el universo de la página: quien busca "BTS" desde Hogar
  // igual quiere encontrarlo.
  const query = props.initialCategorySlug ? "" : searchTerm(resolvedSearchParams);

  const selectedCategorySlug = props.initialCategorySlug || queryCategory;
  const universeSlug = props.universeSlug;

  let products: FrontendProduct[] = [];
  let categories: BackendCategory[] = [];
  let error: string | null = null;

  try {
    const [productList, categoryList] = await Promise.all([
      query
        ? apiProducts.list()
        : apiProducts.list({ universeSlug, categorySlug: selectedCategorySlug }),
      apiCategories.list({ universeSlug }),
    ]);
    products = query
      ? searchProducts(productList.filter((p) => !p.isB2BOnly).map(toSearchItem), query)
          .map((r) => productList.find((p) => p.id === r.item.id)!)
      : productList;
    categories = categoryList;
  } catch (err) {
    console.error(err);
    error = "Error loading products";
  }

  // Backend already filters by categorySlug when provided; no extra filtering needed.
  const filteredProducts = products;

  const activeCategory = categories.find(c => c.slug === selectedCategorySlug);
  const headerTitle = activeCategory ? activeCategory.name : "Tienda";
  const headerDescription = activeCategory?.description || "Explora nuestra colección de objetos diseñados para elevar tu espacio.";
  
  const mappedImage = activeCategory && selectedCategorySlug 
    ? (categoryImages as Record<string, string>)[selectedCategorySlug]
    : undefined;
  
  const headerImage = mappedImage || "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1920&q=80";

  const allProductsHref =
    !universeSlug || universeSlug === "hogar" ? "/productos" : `/${universeSlug}`;

  const visibleCategories = categories.filter(hasProducts);

  const CategorySidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-source-serif font-semibold text-xl mb-4">Categorías</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <Link
              href={allProductsHref}
              className={`block hover:text-black transition-colors ${!selectedCategorySlug ? 'text-black font-bold' : 'text-gray-500'}`}
            >
              Todos los productos
            </Link>
          </li>
          {visibleCategories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={categoryHref(universeSlug, cat.slug)}
                className={`block hover:text-black transition-colors ${selectedCategorySlug === cat.slug ? 'text-black font-bold' : 'text-gray-500'}`}
              >
                {cat.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="flex justify-center bg-white font-sans min-h-screen dark:bg-black">
      <main className="w-full max-w-7xl flex flex-col px-5 md:px-16 py-16 sm:max-w-full md:max-w-350">
        
        {query ? (
          // Con búsqueda el banner de foto sobra: lo que importa son los resultados.
          <div className="mb-10 pt-6 md:pt-10 font-inter">
            <p className="text-sm text-gray-600">Resultados de búsqueda</p>
            <h1 className="mt-1 text-3xl md:text-4xl font-source-serif font-semibold text-gray-900">
              &ldquo;{query}&rdquo;
            </h1>
          </div>
        ) : (
        /* Boxed Banner */
        <div className="w-full relative h-[300px] flex flex-col items-center justify-center text-center text-white overflow-hidden rounded-md mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={headerImage}
            alt={headerTitle}
            className="object-cover absolute inset-0 z-0 w-full h-full"
          />
          <div className="absolute inset-0 bg-black/40 z-10"></div>
          <div className="relative z-20 flex flex-col items-center px-4">
             <h1 className="text-5xl md:text-6xl font-source-serif font-semibold mb-4 drop-shadow-md">{headerTitle}</h1>
             <p className="text-gray-200 text-sm tracking-wide max-w-lg mx-auto drop-shadow-md">
               {headerDescription}
             </p>
          </div>
        </div>
        )}

        <div className="w-full">
          {/* Top bar: products count + filter button (hidden when already inside a category) */}
          <div className="flex justify-between items-center mb-8">
            <span className="text-sm text-gray-500">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Producto" : "Productos"}
            </span>
            {!selectedCategorySlug && !query && (
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="w-4 h-4" /> Filtros
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <div className="py-6 px-6">
                    <CategorySidebar />
                  </div>
                </SheetContent>
              </Sheet>
            )}
          </div>

          {error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-24 text-gray-500">
              <p>
                {query
                  ? `No encontramos productos para "${query}". Prueba con otra palabra.`
                  : "No se encontraron productos en esta categoría."}
              </p>
              <Link href={allProductsHref} className="text-black underline mt-2 block">
                {query ? "Ver toda la tienda" : "Ver todos"}
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
              {filteredProducts.map((product) => (
                <ProductItem key={product.id} item={product} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// Route handler for /productos — scoped to hogar so the "Tienda" link in the
// header doesn't mix products across universes. Other universes have their
// own catalog at /:universo.
export default async function ProductosRoute(props: {
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined };
}) {
  return ShopPage({ universeSlug: "hogar", searchParams: props.searchParams });
}
