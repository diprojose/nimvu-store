import { products as apiProducts, categories as apiCategories, FrontendProduct, BackendCategory } from "@/lib/api";
import ProductItem from "@/components/custom/singleProduct";
import { Filter } from "lucide-react";
import Link from "next/link";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import categoryImages from "@/data/categoryImages.json";

export default async function ShopPage(props: { initialCategorySlug?: string; searchParams?: Promise<{ [key: string]: string | string[] | undefined }> | { [key: string]: string | string[] | undefined } }) {
  // Await searchParams and combine logic gracefully
  const resolvedSearchParams = props.searchParams ? await props.searchParams : {};
  const queryCategory = resolvedSearchParams.category as string | undefined;
  
  const selectedCategorySlug = props.initialCategorySlug || queryCategory;

  let products: FrontendProduct[] = [];
  let categories: BackendCategory[] = [];
  let error: string | null = null;

  try {
    const [productList, categoryList] = await Promise.all([
      apiProducts.list(),
      apiCategories.list()
    ]);
    products = productList;
    categories = categoryList;
  } catch (err) {
    console.error(err);
    error = "Error loading products";
  }

  const filteredProducts = selectedCategorySlug 
    ? products.filter(p => p.category?.slug === selectedCategorySlug) 
    : products;

  const activeCategory = categories.find(c => c.slug === selectedCategorySlug);
  const headerTitle = activeCategory ? activeCategory.name : "Tienda";
  const headerDescription = activeCategory?.description || "Explora nuestra colección de objetos diseñados para elevar tu espacio.";
  
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
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={headerImage}
          alt={headerTitle}
          className="object-cover absolute inset-0 z-0 w-full h-full"
        />
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <div className="relative z-20 flex flex-col items-center">
           <h1 className="text-5xl md:text-6xl font-italiana mb-4 drop-shadow-md">{headerTitle}</h1>
           <p className="text-gray-200 text-sm tracking-wide max-w-lg mx-auto drop-shadow-md">
             {headerDescription}
           </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 md:px-16 py-12 flex flex-col md:flex-row gap-12">
        {/* Mobile Filter */}
        <div className="md:hidden flex justify-between items-center mb-6">
          <span className="text-sm text-gray-500">{filteredProducts.length} Productos</span>
          {!selectedCategorySlug && (
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
        {!selectedCategorySlug && (
          <aside className="hidden md:block w-64 flex-shrink-0">
            <CategorySidebar />
          </aside>
        )}

        {/* Product Grid */}
        <main className="flex-1">
          {error ? (
            <div className="text-center text-red-500 py-12">{error}</div>
          ) : (
            <>
              <div className="hidden md:flex justify-between items-center mb-8">
                <span className="text-sm text-gray-500">{filteredProducts.length} Productos</span>
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
