"use client";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from '@/store/cart';
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner"
import { CartItem } from "@/store/cart";

const CartProductItem = ({ item, cart, isB2BContext }: { item: CartItem, cart: boolean, isB2BContext?: boolean }) => {

  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);

  const handleRemoveFromCart = () => {
    removeItem(item.id);
    toast.error("Producto removido del carrito", { position: "top-center" })
  };

  const handleIncreaseQuantity = () => {
    updateQuantity(item.id, item.quantity + 1);
    toast.success(`${item.title} actualizado`, { position: "top-center" })
  };

  const handleDecreaseQuantity = () => {
    updateQuantity(item.id, item.quantity - 1);
    toast.error(`${item.title} actualizado`, { position: "top-center" })
  };

  let displayPrice = item.unit_price || item.price;
  let originalPrice = item.originalPrice;

  // Renderizar la visual del flotante B2B usando las reglas matemáticas globales
  if (isB2BContext) {
    originalPrice = item.originalPrice || item.price;
    displayPrice = originalPrice;

    if (item.quantity >= 200) {
      displayPrice = originalPrice * 0.75;
    } else if (item.quantity >= 50) {
      displayPrice = originalPrice * 0.80;
    } else if (item.quantity >= 12) {
      displayPrice = originalPrice * 0.90;
    }
  }

  return (
    <div className="product-item flex items-center justify-between mb-5">
      <div className="remove-product mr-2 grow">
        <button className="cursor-pointer" onClick={handleRemoveFromCart}>
          <X />
        </button>
      </div>
      <div className="w-full aspect-square relative overflow-hidden max-w-12.5 mr-2 grow-2">
        {item.thumbnail ? (
          <Link href={`/productos/${item.id}`}>
            <Image
              src={item.thumbnail}
              fill
              alt={item.title}
              className="object-cover rounded-md"
              unoptimized={
                item.thumbnail.startsWith("http://localhost") ||
                item.thumbnail.startsWith("http://127.0.0.1") ||
                item.thumbnail.includes("supabase.co")
              }
            />
          </Link>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
      </div>
      <div className="right-side grow-4 w-full pr-1">
        <Link href={`/productos/${item.id}`}><span className="font-medium">{item.title}</span></Link>
        <p className="flex gap-2 font-medium items-center">
          {originalPrice && originalPrice > displayPrice ? (
            <>
              <span className="text-gray-400 line-through text-sm">{formatPrice(originalPrice)}</span>
              <span className="text-red-600 font-bold">{formatPrice(displayPrice)}</span>
            </>
          ) : (
            <span className="text-black">{formatPrice(displayPrice)}</span>
          )}
        </p>
      </div>
      <div className="quantity-controls grow-3">
        {cart ? (
          <div className="flex items-center border border-gray-300 rounded-md w-fit">
            <button
              onClick={() => handleDecreaseQuantity()}
              className="p-2 hover:bg-gray-50 transition-colors"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-medium">{item.quantity}</span>
            <button
              onClick={() => handleIncreaseQuantity()}
              className="p-2 hover:bg-gray-50 transition-colors"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <span className="w-8 text-center font-medium">{item.quantity}</span>
        )}

      </div>
    </div>
  );
};

export default CartProductItem;
