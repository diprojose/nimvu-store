"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { products as apiProducts, categories as apiCategories, FrontendProduct, BackendCategory } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import { Loader2, Filter } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import categoryImages from "@/data/categoryImages.json";

function ProductsContent({ initialCategorySlug }: { initialCategorySlug?: string }) {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isCategoryPage = Boolean(initialCategorySlug);
  const searchParams = useSearchParams();
  const selectedCategorySlug = initialCategorySlug || searchParams.get("category");
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      try {
        const [productList, categoryList] = await Promise.all([
          apiProducts.list(),
          apiCategories.list()
        ]);
        setProducts(productList);
        setCategories(categoryList);
      } catch (err) {
        setError("Error loading products");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredProducts = useMemo(() => {
    if (!selectedCategorySlug) return products;
    return products.filter(p => p.category?.slug === selectedCategorySlug);
  }, [products, selectedCategorySlug]);

  const activeCategory = useMemo(() => {
    return categories.find(c => c.slug === selectedCategorySlug);
  }, [categories, selectedCategorySlug]);

  const headerTitle = activeCategory ? activeCategory.name : "Tienda";
  const headerDescription = activeCategory?.description || "Explora nuestra colección de objetos diseñados para elevar tu espacio.";
  
  // Typecast to avoid TS error if slug isn't in JSON
  const mappedImage = activeCategory && selectedCategorySlug 
    ? (categoryImages as Record<string, string>)[selectedCategorySlug]
    : undefined;
  
  const headerImage = mappedImage || "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1920&q=80";

  const CategorySidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-italiana text-xl mb-4">Categorías</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <Link
              href="/productos"
              className={`block hover:text-black transition-colors ${!selectedCategorySlug ? 'text-black font-bold' : 'text-gray-500'}`}
            >
              Todos los productos
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/categorias/${cat.slug}`}
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
    <div className="bg-white text-black font-sans min-h-screen">
      {/* Header */}
      <header className="relative py-32 px-6 md:px-16 text-center text-white overflow-hidden">
        <Image 
          src={headerImage}
          alt={headerTitle}
          fill
          className="object-cover absolute inset-0 z-0"
          priority
        />
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center">
          {loading && selectedCategorySlug ? (
            <>
              <Skeleton className="h-[48px] md:h-[60px] w-64 md:w-96 mb-4 bg-white/20" />
              <Skeleton className="h-4 w-[280px] md:w-[480px] mx-auto bg-white/20" />
            </>
          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-italiana mb-4 drop-shadow-md">{headerTitle}</h1>
              <p className="text-gray-200 text-sm tracking-wide max-w-lg mx-auto drop-shadow-md">
                {headerDescription}
              </p>
            </>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row gap-12">
        {/* Mobile Filter */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <span className="text-sm text-gray-500">{filteredProducts.length} Productos</span>
          {!isCategoryPage && (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" /> Filtros
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <div className="py-6">
                  <CategorySidebar />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>

        {/* Desktop Sidebar */}
        {!isCategoryPage && (
          <aside className="hidden md:block w-64 flex-shrink-0">
            <CategorySidebar />
          </aside>
        )}

        {/* Product Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-gray-300" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <>
              <div className="hidden md:flex justify-between items-center mb-8">
                <span className="text-sm text-gray-500">{filteredProducts.length} Productos</span>
                {/* Sorting could go here */}
              </div>

              {filteredProducts.length === 0 ? (
                <div className="text-center py-24 text-gray-500">
                  <p>No se encontraron productos en esta categoría.</p>
                  <Link href="/productos" className="text-black underline mt-2 block">Ver todos</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                  {filteredProducts.map((product) => (
                    <ProductItem key={product.id} item={product} />
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

export default function ShopPage({ initialCategorySlug }: { initialCategorySlug?: string }) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
      </div>
    }>
      <ProductsContent initialCategorySlug={initialCategorySlug} />
    </Suspense>
  );
}
