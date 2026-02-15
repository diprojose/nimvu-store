"use client"
import { useEffect, useState, use } from "react"
import Image from "next/image"
import { products } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useCartStore } from '@/store/cart';
import { toast } from "sonner";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null); // Variant state
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  const addToCart = useCartStore((state) => state.addItem);

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { product } = await products.retrieve(unwrappedParams.id)
        setProduct(product)
        // Default to first variant if exists, or null
        // However, user said "if has variants place thumbnail, upon selecting change photos".
        // So initially maybe show product photos? Or first variant?
        // Let's defaut to null (Product View) and let user select.
        if (product.variants && product.variants.length > 0) {
          // Optional: Pre-select first variant? 
          // setSelectedVariant(product.variants[0]); 
        }
      } catch (err) {

      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  }, [unwrappedParams.id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  if (!product) {
    return <div className="min-h-screen flex items-center justify-center">Product not found</div>
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    // Use selected variant or fallback to first or product ID
    // If variants exist but none selected, maybe force selection? 
    // For now, adhere to previous logic: first variant or product id.
    const variantId = selectedVariant?.id || product?.variants?.[0]?.id || product.id;
    addToCart(product, variantId, quantity);
    toast.success("¡Producto agregado al carrito!", { position: "top-center" })
  };

  // Determine images to show
  // If variant selected and has images, show those. Else product images.
  const currentImages = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images.map((url: string, index: number) => ({ id: `var-img-${index}`, url }))
    : product.images;

  // Helper to clean up HTML content styles that might break layout
  const formatHtmlContent = (htmlContent: string) => {
    if (!htmlContent) return "";

    // 1. Remove inline style attributes to let our CSS take over
    let clean = htmlContent.replace(/style="[^"]*"/gi, "");

    // 2. Remove width and height attributes to prevent fixed sizes
    clean = clean.replace(/width="[^"]*"/gi, "").replace(/height="[^"]*"/gi, "");

    // 3. Replace non-breaking spaces with normal spaces to allow wrapping
    clean = clean.replace(/&nbsp;/g, " ");

    return clean;
  };

  return (
    <div className="bg-white dark:bg-black py-16 px-4 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">


        {/* We need to retain the rest of the component but I am editing a small chunk? 
       Wait, I need to place the function definition inside the component or outside. 
       And then update the render. 
       Let's place the function inside the component before return, and update the render block.
    */}

        {/* Left Side: Images (Vertical Stack) */}
        <div className="flex flex-col gap-8">
          {currentImages?.map((img: { id: string, url: string }) => (
            <div key={img.id} className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={img.url}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized={img.url.startsWith("http://localhost") || img.url.startsWith("http://127.0.0.1")}
              />
            </div>
          ))}
          {(!currentImages || currentImages.length === 0) && (
            <div className="w-full aspect-square bg-gray-100 flex items-center justify-center text-gray-400">
              No Images
            </div>
          )}
        </div>

        {/* Right Side: Info (Sticky) */}
        <div className="md:sticky md:top-24 h-fit flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-italiana font-bold mb-4">{product.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || "No description available."}
            </p>
            <p className="text-2xl font-bold mt-4 font-sans">
              ${selectedVariant?.price ? selectedVariant.price.toLocaleString("es-CO") : product.price.toLocaleString("es-CO")}
            </p>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-900">Variantes:</span>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${selectedVariant?.id === variant.id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    title={variant.title}
                  >
                    {/* Access variant image if available, else product thumbnail */}
                    {variant.images && variant.images.length > 0 ? (
                      <Image
                        src={variant.images[0]}
                        alt={variant.title}
                        fill
                        className="object-cover"
                        unoptimized={variant.images[0].startsWith("http")}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                        {variant.title.slice(0, 2)}
                      </div>
                    )}
                  </button>
                ))}
              </div>
              {selectedVariant && (
                <p className="text-sm text-gray-500">Seleccionado: <span className="font-medium text-black">{selectedVariant.title}</span></p>
              )}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center border border-gray-300 rounded-md w-fit bg-white">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="p-3 hover:bg-gray-50 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-medium">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="p-3 hover:bg-gray-50 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <Button
              onClick={handleAddToCart}
              className="flex-1 py-6 text-lg bg-black hover:bg-gray-800 text-white shadow-lg"
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              Agregar al Carrito
            </Button>
          </div>

          {/* Data Table (Dimensions) */}
          {(product.dimensions?.width > 0 || product.dimensions?.height > 0 || product.dimensions?.length > 0) && (
            <div className="mt-4 border rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm">Dimensiones</div>
              <table className="w-full text-sm text-left">
                <tbody>
                  {product.dimensions.width > 0 && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2 text-gray-500 w-1/3">Ancho</td>
                      <td className="px-4 py-2">{product.dimensions.width} cm</td>
                    </tr>
                  )}
                  {product.dimensions.height > 0 && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2 text-gray-500 w-1/3">Alto</td>
                      <td className="px-4 py-2">{product.dimensions.height} cm</td>
                    </tr>
                  )}
                  {product.dimensions.length > 0 && (
                    <tr className="border-b last:border-0">
                      <td className="px-4 py-2 text-gray-500 w-1/3">Largo</td>
                      <td className="px-4 py-2">{product.dimensions.length} cm</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Long Description (HTML) */}
          {product.longDescription && (
            <div className="mt-4 pt-6 border-t w-full">
              <h3 className="text-xl font-bold mb-4 font-italiana">Detalles del Producto</h3>
              <div
                className="prose prose-sm sm:prose-base dark:prose-invert max-w-none
                  prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-600 dark:prose-p:text-gray-300
                  prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-white
                  prose-ul:list-disc prose-ul:pl-5 prose-li:mb-1
                  prose-ol:list-decimal prose-ol:pl-5
                  [&_p]:mb-4 [&_p]:leading-relaxed
                  [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1
                  [&_ol]:list-decimal [&_ol]:pl-5"
                dangerouslySetInnerHTML={{ __html: formatHtmlContent(product.longDescription) }}
              />
            </div>
          )}

        </div>
      </div>
    </div>
  )
}