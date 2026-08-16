"use client";
import React, { FC, ReactElement } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { useCartStore, CartState, CartItem } from '@/store/cart';
import { Minus, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export interface CartProductItemProps {
  item: CartItem;
  cart: boolean;
  isB2BContext?: boolean;
}

const CartProductItem: FC<CartProductItemProps> = ({ item, cart, isB2BContext }: CartProductItemProps): ReactElement => {

  const removeItem: (itemId: string) => void = useCartStore((state: CartState) => state.removeItem);
  const updateQuantity: (itemId: string, quantity: number) => void = useCartStore((state: CartState) => state.updateQuantity);

  const handleRemoveFromCart = (): void => {
    removeItem(item.id);
    toast.error("Producto removido del carrito", { position: "top-center" });
  };

  const handleIncreaseQuantity = (): void => {
    updateQuantity(item.id, item.quantity + 1);
    toast.success(`${item.title} actualizado`, { position: "top-center" });
  };

  const handleDecreaseQuantity = (): void => {
    updateQuantity(item.id, item.quantity - 1);
    toast.error(`${item.title} actualizado`, { position: "top-center" });
  };

  let displayPrice: number = item.unit_price || item.price;
  let originalPrice: number | undefined = item.originalPrice;

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
    <div className="product-item flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0">
      {/* Thumbnail */}
      <div className="relative h-16 w-16 min-w-16 rounded-md overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
        {item.thumbnail ? (
          <Link href={`/productos/${item.productId || item.id}`}>
            <Image
              src={item.thumbnail}
              fill
              alt={item.title}
              sizes="64px"
              className="object-cover"
            />
          </Link>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
            Sin foto
          </div>
        )}
      </div>

      {/* Info: Title, Variant, Price */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <Link 
          href={`/productos/${item.productId || item.id}`}
          className="text-sm font-medium text-gray-900 hover:text-gray-600 transition-colors line-clamp-2 leading-snug"
        >
          {item.title}
        </Link>
        {item.variantName && (
          <span className="text-xs text-gray-500 mt-0.5">{item.variantName}</span>
        )}
        <div className="flex items-center gap-2 mt-1">
          {originalPrice && originalPrice > displayPrice ? (
            <>
              <span className="text-gray-400 line-through text-xs">{formatPrice(originalPrice)}</span>
              <span className="text-red-600 font-semibold text-sm">{formatPrice(displayPrice)}</span>
            </>
          ) : (
            <span className="text-gray-900 font-semibold text-sm">{formatPrice(displayPrice)}</span>
          )}
        </div>
      </div>

      {/* Right side: Delete button & Quantity Stepper */}
      <div className="flex flex-col items-end justify-between shrink-0 gap-2">
        <button
          className="cursor-pointer text-gray-400 hover:text-red-600 transition-colors p-1 rounded hover:bg-gray-50"
          onClick={handleRemoveFromCart}
          aria-label="Eliminar producto"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        <div className="quantity-controls">
          {cart ? (
            <div className="flex items-center border border-gray-200 rounded-md bg-white shadow-xs">
              <button
                onClick={(): void => handleDecreaseQuantity()}
                className="p-1 hover:bg-gray-100 transition-colors text-gray-600 rounded-l"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-7 text-center text-xs font-semibold text-gray-800">{item.quantity}</span>
              <button
                onClick={(): void => handleIncreaseQuantity()}
                className="p-1 hover:bg-gray-100 transition-colors text-gray-600 rounded-r"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <span className="text-sm font-medium text-gray-600">{item.quantity}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartProductItem;
