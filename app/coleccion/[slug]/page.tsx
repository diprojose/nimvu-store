
"use client"
import { collections, FrontendProduct } from "@/lib/api"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import ProductItem from "@/components/custom/singleProduct"

// Define interface for the collection data we use
interface CollectionData {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  products: FrontendProduct[];
}

export default function CollectionPage() {
  const params = useParams()
  const slug = params.slug as string
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCollection() {
      if (!slug) return

      try {
        setLoading(true)
        const data = await collections.retrieveBySlug(slug)
        setCollection(data as unknown as CollectionData)
      } catch (err) {
        console.error(err)
        setError("No se pudo cargar la colección. Intenta nuevamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchCollection()
  }, [slug])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <p className="text-xl">Cargando...</p>
      </div>
    )
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

  return (
    <div className="flex items-center justify-center font-sans dark:bg-black">
      <main className="w-full flex flex-col items-center bg-white dark:bg-black sm:max-w-full md:max-w-350 px-5 md:px-16">
        {/* Banner Section */}
        <div className="w-full relative h-[300px] flex flex-col items-center justify-center text-center mb-10 overflow-hidden">
          {collection.image ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={collection.image} alt={collection.name} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40" />
            </>
          ) : (
            <div className="absolute inset-0 bg-gray-100 dark:bg-zinc-800 rounded-md" />
          )}

          <div className="relative z-10 px-4 max-w-4xl">
            <h1 className={`font-italiana text-4xl md:text-5xl mb-4 capitalize ${collection.image ? 'text-white' : 'text-purple-950 dark:text-white'}`}>
              {collection.name}
            </h1>
            {collection.description && (
              <p className={`text-lg max-w-2xl mx-auto ${collection.image ? 'text-gray-100' : 'text-gray-600 dark:text-gray-300'}`}>
                {collection.description}
              </p>
            )}
          </div>
        </div>

        {/* Products Grid */}
        <div className="w-full pb-16 max-w-[1440px]">
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
