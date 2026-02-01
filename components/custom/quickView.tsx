"use client"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { Product } from "@/types/product";
import { Images } from "@/types/images";
import { useCartStore } from '@/store/cartStore';
import { CartProduct } from "@/types/cartProduct";
import { toast } from "sonner";

const QuickView = ({ item }: { item: Product }) => {
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  const addToCart = useCartStore((state) => state.addToCartFromQuickView);

  const cartProduct: CartProduct = {
    id: item.id,
    title: item.title,
    image: item.thumbnail,
    quantity: quantity,
    price: item.variants?.[0]?.calculated_price?.calculated_amount
  }

  useEffect(() => {
    async function fetchProduct() {
      try {
        if (item.thumbnail) setSelectedImage(item.thumbnail)
      } catch (err) {
        
      } finally {
        setLoading(false)
      }
    }
    fetchProduct()
  })

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const handleAddToCart = () => {
    addToCart(cartProduct, quantity);
    toast.success("¡Producto agregado al carrito!", { position: "top-center"})
  };

  return (
    <div className="bg-white dark:bg-black py-16 px-6">
      <div className="max-w-350 mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Images */}
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt={item.title}
                fill
                className="object-cover"
                unoptimized={selectedImage.startsWith("http://localhost") || selectedImage.startsWith("http://127.0.0.1")}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
            )}
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {item.images?.map((img: Images) => (
              <button
                key={img.id}
                onClick={() => setSelectedImage(img.url)}
                className={`relative w-20 h-20 flex-shrink-0 border-2 rounded-md overflow-hidden ${
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
            <h1 className="text-4xl font-italiana font-bold mb-4">{item.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {item.description || "Descripción no disponible"}
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
              Agregar al carrito
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickView;
