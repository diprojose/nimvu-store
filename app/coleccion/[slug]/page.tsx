import { collections, FrontendProduct } from "@/lib/api"
import ProductItem from "@/components/custom/singleProduct"
import collectionImages from "@/data/collectionImages.json"

// Define interface for the collection data we use
interface CollectionData {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  products: FrontendProduct[];
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
  // Await params safely for Next.js 15+ 
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  
  let collection: CollectionData | null = null;
  let error: string | null = null;

  try {
    const data = await collections.retrieveBySlug(slug);
    collection = data as unknown as CollectionData;
  } catch (err) {
    console.error(err);
    error = "No se pudo cargar la colección. Intenta nuevamente.";
  }

  if (error || !collection) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-4">
        <h1 className="text-2xl font-bold text-red-600">Error</h1>
        <p>{error || "Colección no encontrada"}</p>
        <a href="/" className="underline text-blue-600">Volver al inicio</a>
      </div>
    )
  }

  const mappedImage = (collectionImages as Record<string, string>)[slug];
  const finalImage = collection.image || mappedImage || "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?auto=format&fit=crop&w=1920&q=80";

  return (
    <div className="flex justify-center font-sans dark:bg-black bg-white">
      <main className="w-full flex flex-col items-center sm:max-w-full md:max-w-350 px-5 md:px-16 py-16">
        {/* Boxed Banner Section */}
        <div className="w-full relative h-[300px] flex flex-col items-center justify-center text-center mb-12 overflow-hidden rounded-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={finalImage} alt={collection.name} className="absolute inset-0 w-full h-full object-cover z-0" />
          <div className="absolute inset-0 bg-black/40 z-10" />

          <div className="relative z-20 flex flex-col items-center px-4">
            <h1 className="font-italiana text-4xl md:text-5xl mb-4 capitalize text-white drop-shadow-md">
              {collection.name}
            </h1>
            {collection.description && (
              <p className="text-sm md:text-lg max-w-2xl mx-auto text-gray-200 drop-shadow-md">
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="w-full max-w-[1440px] pb-16">
          <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {collection.products.length > 0 ? (
              collection.products.map((product) => (
                <div key={product.id} className="w-full">
                  <ProductItem item={product} />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No hay productos en esta colección.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
