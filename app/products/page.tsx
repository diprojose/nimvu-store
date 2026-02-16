"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { products as apiProducts, categories as apiCategories, FrontendProduct, BackendCategory } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import { Loader2, Filter } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

function ProductsContent() {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const selectedCategorySlug = searchParams.get("category");
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

  const CategorySidebar = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-italiana text-xl mb-4">Categorías</h3>
        <ul className="space-y-3 text-sm">
          <li>
            <Link
              href="/products"
              className={`block hover:text-black transition-colors ${!selectedCategorySlug ? 'text-black font-bold' : 'text-gray-500'}`}
            >
              Todos los productos
            </Link>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <Link
                href={`/products?category=${cat.slug}`}
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
      <header className="py-24 px-6 md:px-16 text-center bg-zinc-50 dark:bg-black">
        <h1 className="text-5xl md:text-6xl font-italiana mb-4 dark:text-white">Tienda</h1>
        <p className="text-gray-500 text-sm tracking-wide max-w-lg mx-auto dark:text-gray-400">
          Explora nuestra colección de objetos diseñados para elevar tu espacio.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row gap-12">
        {/* Mobile Filter */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <span className="text-sm text-gray-500">{filteredProducts.length} Productos</span>
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
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0">
          <CategorySidebar />
        </aside>

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
                  <Link href="/products" className="text-black underline mt-2 block">Ver todos</Link>
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

export default function ShopPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center h-screen bg-white">
        <Loader2 className="w-10 h-10 animate-spin text-gray-900" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
