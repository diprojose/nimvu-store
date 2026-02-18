"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useCartStore } from '@/store/cart';
import { toast } from "sonner";
import { FrontendProduct } from "@/lib/api"; // Ensure this is exported
import { formatPrice } from "@/lib/utils";

interface ProductDetailsProps {
  product: FrontendProduct;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedVariant, setSelectedVariant] = useState<any>(null); // Variant state
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((state) => state.addItem);

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta));
  };

  const handleAddToCart = () => {
    // Use selected variant or fallback to first or product ID
    const variantId = selectedVariant?.id || product?.variants?.[0]?.id || product.id;
    addToCart(product, variantId, quantity);
    toast.success("¡Producto agregado al carrito!", { position: "top-center" });
  };

  // Determine images to show
  const currentImages = (selectedVariant?.images && selectedVariant.images.length > 0)
    ? selectedVariant.images.map((url: string, index: number) => ({ id: `var-img-${index}`, url }))
    : product.images;

  // Helper to clean up HTML content styles
  const formatHtmlContent = (htmlContent: string) => {
    if (!htmlContent) return "";
    let clean = htmlContent.replace(/style="[^"]*"/gi, "");
    clean = clean.replace(/width="[^"]*"/gi, "").replace(/height="[^"]*"/gi, "");
    clean = clean.replace(/&nbsp;/g, " ");
    return clean;
  };

  return (
    <div className="bg-white dark:bg-black py-16 px-4 sm:px-8 md:px-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Side: Images (Vertical Stack) */}
        <div className="flex flex-col gap-8">
          {currentImages?.map((img: { id: string; url: string }) => (
            <div key={img.id} className="relative w-full aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={img.url}
                alt={product.title}
                fill
                className="object-cover"
                unoptimized={img.url.startsWith("http") || img.url.includes("supabase.co")}
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
            <h1 className="text-4xl font-italiana font-bold mb-4 dark:text-white">{product.title}</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              {product.description || "No description available."}
            </p>
            <div className="mt-4">
              {(() => {
                const basePrice = selectedVariant?.price || product.price;
                const discount = selectedVariant ? selectedVariant.discountPrice : product.discountPrice;
                const hasDiscount = discount && discount > 0 && discount < basePrice;

                return hasDiscount ? (
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-bold text-red-600 font-sans">{formatPrice(discount)}</span>
                    <span className="text-xl text-gray-400 line-through font-sans">{formatPrice(basePrice)}</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold font-sans dark:text-white">
                    {formatPrice(basePrice)}
                  </p>
                );
              })()}
            </div>
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Variantes:</span>
              <div className="flex flex-wrap gap-3">
                {/* Main Product Option */}
                <button
                  onClick={() => setSelectedVariant(null)}
                  className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${!selectedVariant ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  title={product.title}
                >
                  {product.images && product.images.length > 0 ? (
                    <Image
                      src={product.images[0].url}
                      alt={product.title}
                      fill
                      className="object-cover"
                      unoptimized={product.images[0].url.startsWith("http") || product.images[0].url.includes("supabase.co")}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      Base
                    </div>
                  )}
                </button>
                {product.variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`relative w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${selectedVariant?.id === variant.id ? 'border-black ring-1 ring-black' : 'border-gray-200 hover:border-gray-400'
                      }`}
                    title={variant.title}
                  >
                    {variant.images && variant.images.length > 0 ? (
                      <Image
                        src={variant.images[0]}
                        alt={variant.title}
                        fill
                        className="object-cover"
                        unoptimized={variant.images[0].startsWith("http") || variant.images[0].includes("supabase.co")}
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
                <p className="text-sm text-gray-500">Seleccionado: <span className="font-medium text-black dark:text-white">{selectedVariant.title}</span></p>
              )}
            </div>
          )}

          {/* Quantity and Add to Cart */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex items-center border border-gray-300 rounded-md w-fit bg-white text-black">
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
              className="flex-1 py-6 text-lg bg-black hover:bg-gray-800 text-white shadow-lg dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              <ShoppingCart className="mr-2 w-5 h-5" />
              Agregar al Carrito
            </Button>
          </div>

          {/* Data Table (Dimensions) */}
          {product.dimensions && (product.dimensions.width > 0 || product.dimensions.height > 0 || product.dimensions.length > 0) && (
            <div className="mt-4 border rounded-lg overflow-hidden dark:border-gray-700">
              <div className="bg-gray-50 px-4 py-2 border-b font-medium text-sm dark:bg-gray-800 dark:text-white dark:border-gray-700">Dimensiones</div>
              <table className="w-full text-sm text-left dark:text-white">
                <tbody>
                  {product.dimensions.width > 0 && (
                    <tr className="border-b last:border-0 dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 w-1/3">Ancho</td>
                      <td className="px-4 py-2">{product.dimensions.width} cm</td>
                    </tr>
                  )}
                  {product.dimensions.height > 0 && (
                    <tr className="border-b last:border-0 dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 w-1/3">Alto</td>
                      <td className="px-4 py-2">{product.dimensions.height} cm</td>
                    </tr>
                  )}
                  {product.dimensions.length > 0 && (
                    <tr className="border-b last:border-0 dark:border-gray-700">
                      <td className="px-4 py-2 text-gray-500 dark:text-gray-400 w-1/3">Largo</td>
                      <td className="px-4 py-2">{product.dimensions.length} cm</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* Long Description (HTML) */}
          {product.longDescription && (
            <div className="mt-4 pt-6 border-t w-full dark:border-gray-700">
              <h3 className="text-xl font-bold mb-4 font-italiana dark:text-white">Detalles del Producto</h3>
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
  );
}
