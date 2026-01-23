"use client";
import Image from "next/image";
import Link from "next/link";
import { useCartStore } from '@/store/cartStore';
import { CartProduct } from "@/types/cartProduct";
import { Minus, Plus, X } from "lucide-react";
import { toast } from "sonner"

const CartProductItem = ({ item }: { item: CartProduct }) => {

  const removeProductFromCart = useCartStore((state) => state.removeProductFromCart);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);

  const handleRemoveFromCart = () => {
    removeProductFromCart(item);
    toast.error("Producto removido del carrito", { position: "top-center"})
  };

  const handleIncreaseQuantity = () => {
    increaseQuantity(item.id);
    toast.success(`${item.title} actualizado`, { position: "top-center"})
  };
  
  const handleDecreaseQuantity = () => {
    decreaseQuantity(item.id);
    toast.error(`${item.title} actualizado`, { position: "top-center"})
  };

  return (
    <div className="product-item flex items-center justify-between mb-5">
      <div className="remove-product mr-2 grow-1">
        <button className="cursor-pointer" onClick={handleRemoveFromCart}>
          <X />
        </button>
      </div>
      <div className="w-full aspect-square relative overflow-hidden max-w-[50px] mr-2 grow-2">
        {item.image ? (
          <Link href={`/products/${item.id}`}>
            <Image
              src={item.image}
              fill
              alt={item.title}
              className="object-cover rounded-md"
              unoptimized={
                item.image.startsWith("http://localhost") ||
                item.image.startsWith("http://127.0.0.1")
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
          <span className="text-black">${item.price}</span>
        </p>
      </div>
      <div className="quantity-controls grow-3">
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
      </div>
    </div>
  );
};

export default CartProductItem;
