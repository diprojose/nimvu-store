"use client"
import { useEffect, useState, use } from "react"
import Image from "next/image"
import { sdk } from "../../lib/sdk"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { useCartStore } from '@/store/cartStore';
import { CartProduct } from "@/types/cartProduct"
import { toast } from "sonner";
import { Images } from "@/types/images"

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [product, setProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  const addToCart = useCartStore((state) => state.addToCartFromQuickView);

  const cartProduct = {
    id: product?.variants?.[0]?.id,
    quantity: quantity,
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { product } = await sdk.store.product.retrieve(unwrappedParams.id)
        setProduct(product)
        if (product.thumbnail) setSelectedImage(product.thumbnail)
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
    addToCart(cartProduct.id, quantity).then(() => {
      toast.success("¡Producto agregado al carrito!", { position: "top-center"})
    });
  };

  return (
    <div className="bg-white dark:bg-black py-16 px-4 sm:px-8 md:px-16">
      <div className="max-w-350 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Images */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized={selectedImage.startsWith("http://localhost") || selectedImage.startsWith("http://127.0.0.1")}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {product.images?.map((img: Images) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.url)}
                className={`relative w-20 h-20 shrink-0 border-2 rounded-md overflow-hidden ${
                  selectedImage === img.url ? "border-black" : "border-transparent"
                }`}
              >
                <Image
                  src={img.url}
                  alt="Product thumbnail"
                  fill
                  className="object-cover"
                  unoptimized={img.url.startsWith("http://localhost") || img.url.startsWith("http://127.0.0.1")}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Info */}
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="text-4xl font-italiana font-bold mb-4">{product.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
            <div className="flex items-center border border-gray-300 rounded-md w-fit">
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
              className="flex-1 py-6 text-lg bg-black hover:bg-gray-800 text-white"
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              Agregar al Carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}