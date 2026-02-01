"use client";
import { useState } from "react"
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types/product";
import { ShoppingCart, Heart, Eye } from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { CartProduct } from "@/types/cartProduct";
import { toast } from "sonner"
import QuickView from "@/components/custom/quickView";
import { Modal } from "@/components/custom/modal";

const ProductItem = ({ item }: { item: Product }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  const cartProduct: CartProduct = {
    id: item.id,
    title: item.title,
    image: item.thumbnail,
    quantity: 1,
    price: item.variants?.[0]?.calculated_price?.calculated_amount
  }

  const handleAddToCart = () => {
    addToCart(cartProduct);
    toast.success("¡Producto agregado al carrito!", { position: "top-center"})
  };

  return (
    <div className="product-item">
      <div className="w-full aspect-square relative overflow-hidden mb-2 group">
        {item.thumbnail ? (
          <Link href={`/products/${item.id}`}>
            <Image
              src={item.thumbnail}
              fill
              alt={item.title}
              className="object-cover rounded-md static"
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
        <div className="icons absolute right-0 top-0 translate-x-full u-w-full flex flex-col gap-2 p-2 ease-linear duration-300 group-hover:translate-x-0">
          {/* <button className="bg-white rounded-full">
            <Heart className="m-2 w-5 h-5" />
          </button> */}
          <button className="bg-white rounded-full cursor-pointer" onClick={handleAddToCart}>
            <ShoppingCart className="m-2 w-5 h-5" />
          </button>
          <button className="bg-white rounded-full cursor-pointer" onClick={() => setIsModalOpen(true)}>
            <Eye className="m-2 w-5 h-5" />
          </button>
        </div>
      </div>
      <Link href={`/products/${item.id}`}><span className="font-medium">{item.title}</span></Link>
      {item.variants?.[0]?.calculated_price?.calculated_amount === item.variants?.[0]?.calculated_price?.original_amount ? (
        <p className="gap-2 font-medium">
          <span className="text-dark text-black font-bold">${item.variants?.[0]?.calculated_price?.original_amount}</span>
        </p>
      ) : (
        <p className="gap-2 font-medium">
          <span className="text-dark pr-2 text-red-500">${item.variants?.[0]?.calculated_price?.calculated_amount}</span>
          <span className="text-dark-4 line-through">${item.variants?.[0]?.calculated_price?.original_amount}</span>
        </p>
      )}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={item.title}
      >
        <QuickView item={item} />
      </Modal>
    </div>
  );
};

export default ProductItem;
