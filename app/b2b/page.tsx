"use client";
import { useEffect, useState, useMemo, Suspense } from "react";
import { useAuthStore } from '@/store/authStore';
import { products as apiProducts, categories as apiCategories, FrontendProduct, BackendCategory } from "@/lib/api";
import { B2BProductCard } from "@/components/b2b/B2BProductCard";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthRedirect } from "@/lib/hooks/redirect-if-authenticated";

function B2BCatalogContent() {
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [categories, setCategories] = useState<BackendCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const customer = useAuthStore((state) => state.customer);

  const { isChecking } = useAuthRedirect({
    redirectTo: "/b2b/login",
    condition: "ifUnauthenticated",
  });

  useEffect(() => {
    if (!customer) return;

    async function fetchData() {
      try {
        const [productList, categoryList] = await Promise.all([
          apiProducts.list(true),
          apiCategories.list()
        ]);
        setProducts(productList);
        setCategories(categoryList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [customer]);

  const filteredProducts = useMemo(() => {
    let result = products;
    if (selectedCategory) {
      result = result.filter(p => p.category?.slug === selectedCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p => {
        const matchTitle = p.title.toLowerCase().includes(q);
        const skuCalc = `NIM-${p.id.substring(0, 6).toUpperCase()}`.toLowerCase();
        const matchSku = skuCalc.includes(q);
        
        // Check if any variant matches the search query (name or sku)
        const matchVariants = p.variants?.some(v => 
          (v.title && v.title.toLowerCase().includes(q)) || 
          (v.sku && v.sku.toLowerCase().includes(q))
        );

        return matchTitle || matchSku || matchVariants;
      });
    }
    return result;
  }, [products, selectedCategory, search]);

  if (isChecking) return <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;

  return (
    <div className="bg-[#F8F9FA] min-h-screen pb-24">
      {/* Header Area */}
      <div className="bg-white border-b border-gray-200 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Catálogo Mayorista B2B</h1>
          <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Acceda a nuestra gama completa de componentes industriales impresos en 3D con precios por volumen para socios corporativos.
          </p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar por nombre de producto o SKU..."
              className="pl-12 py-6 rounded-full text-base bg-gray-50 border-gray-200 focus:bg-white transition-colors"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="mb-8">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Filtros</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${!selectedCategory ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  Todos los Materiales
                </button>
              </li>
              {categories.map(cat => (
                <li key={cat.id}>
                  <button
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${selectedCategory === cat.slug ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 bg-gray-900 rounded-xl p-5 text-white">
            <p className="text-xs font-bold text-blue-400 mb-2">Soporte Prioritario</p>
            <p className="text-sm font-medium mb-4">¿Necesita una cotización personalizada para prototipos en masa?</p>
            <a href="https://wa.me/573123478307" target="_blank" rel="noopener noreferrer" className="block w-full">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white border-0">
                Contactar Experto
              </Button>
            </a>
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex justify-between items-center text-sm text-gray-500">
                <span>Mostrando <span className="font-bold text-gray-900">{filteredProducts.length}</span> productos</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map(product => (
                  <B2BProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function B2BCatalogPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#F8F9FA]"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>}>
      <B2BCatalogContent />
    </Suspense>
  );
}
