"use client";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from '@/store/cart';
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner"
import { CartItem } from "@/store/cart";

const CartProductItem = ({ item, cart }: { item: CartItem, cart: boolean }) => {

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="product-item flex items-center justify-between mb-5">
      <div className="remove-product mr-2 grow">
        <button className="cursor-pointer" onClick={handleRemoveFromCart}>
          <X />
        </button>
      </div>
      <div className="w-full aspect-square relative overflow-hidden max-w-12.5 mr-2 grow-2">
        {item.thumbnail ? (
          <Link href={`/products/${item.id}`}>
            <Image
              src={item.thumbnail}
              fill
              alt={item.title}
              className="object-cover rounded-md"
              unoptimized={
                item.thumbnail.startsWith("http://localhost") ||
                item.thumbnail.startsWith("http://127.0.0.1")
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
        <Link href={`/products/${item.id}`}><span className="font-medium">{item.title}</span></Link>
        <p className="gap-2 font-medium">
          <span className="text-black">{formatCurrency(item.unit_price)}</span>
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
