"use client"
import { useEffect, useState, use } from "react"
import Image from "next/image"
import { sdk } from "../../lib/sdk"
import { Button } from "../../components/ui/button"
import { Minus, Plus, ShoppingCart } from "lucide-react"

// Mock product data for fallback
const MOCK_PRODUCT = {
  id: "prod_mock",
  title: "Modern Lamp",
  description: "A beautiful modern lamp that fits perfectly in any room. Crafted with high-quality materials to ensure durability and style.",
  thumbnail: "/oficina.jpg",
  images: [
    { url: "/oficina.jpg", id: "img_1" },
    { url: "/sala.jpg", id: "img_2" },
    { url: "/cuarto.jpg", id: "img_3" }
  ],
  options: [
    {
      id: "opt_color",
      title: "Color",
      values: [
        { value: "White" },
        { value: "Black" },
        { value: "Gold" }
      ]
    }
  ],
  variants: [
    { id: "var_1", title: "White", options: [{ value: "White" }] },
    { id: "var_2", title: "Black", options: [{ value: "Black" }] },
    { id: "var_3", title: "Gold", options: [{ value: "Gold" }] }
  ]
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const [product, setProduct] = useState<any>(null)
  const [selectedImage, setSelectedImage] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const { product } = await sdk.store.product.retrieve(unwrappedParams.id)
        setProduct(product)
        if (product.thumbnail) setSelectedImage(product.thumbnail)

        // Default to first color if available
        const colorOption = product.options?.find((opt: any) => opt.title === "Color")
        if (colorOption?.values?.length > 0) {
          setSelectedColor(colorOption.values[0].value)
        }
      } catch (err) {
        console.error("Failed to fetch product, using mock data", err)
        setProduct(MOCK_PRODUCT)
        setSelectedImage(MOCK_PRODUCT.thumbnail)
        setSelectedColor(MOCK_PRODUCT.options[0].values[0].value)
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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color)
    // Logic to change image based on color (mock logic for now)
    // In a real scenario, we would find the variant with this color and use its image
    // For now, we'll just rotate the images based on index if using mock
    if (product.id === "prod_mock") {
       const colorIndex = product.options[0].values.findIndex((v: any) => v.value === color)
       if (colorIndex >= 0 && product.images[colorIndex]) {
         setSelectedImage(product.images[colorIndex].url)
       }
    }
  }

  const handleQuantityChange = (delta: number) => {
    setQuantity(prev => Math.max(1, prev + delta))
  }

  const addToCart = () => {
    console.log(`Added ${quantity} of ${product.title} (${selectedColor}) to cart`)
    // Implement actual add to cart logic here
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black py-16 px-4 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
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
            {product.images?.map((img: any) => (
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
            <h1 className="text-4xl font-italiana font-bold mb-4">{product.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || "No description available."}
            </p>
          </div>

          {/* Color Selection */}
          {product.options?.map((option: any) => {
            if (option.title === "Color") {
              return (
                <div key={option.id}>
                  <h3 className="font-medium mb-3">Color: {selectedColor}</h3>
                  <div className="flex gap-3">
                    {option.values.map((val: any) => (
                      <button
                        key={val.value}
                        onClick={() => handleColorSelect(val.value)}
                        className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
                          selectedColor === val.value
                            ? "border-black ring-1 ring-black ring-offset-2"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: val.value.toLowerCase() }}
                        title={val.value}
                      >
                         {/* Fallback for white/light colors to be visible */}
                         {['white', 'transparent'].includes(val.value.toLowerCase()) && (
                           <span className="block w-full h-full rounded-full border border-gray-100"></span>
                         )}
                      </button>
                    ))}
                  </div>
                </div>
              )
            }
            return null
          })}

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
              onClick={addToCart}
              className="flex-1 py-6 text-lg bg-black hover:bg-gray-800 text-white"
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
