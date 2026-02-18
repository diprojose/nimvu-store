"use client";
import { useState } from "react"
import Image from "next/image";
import Link from "next/link";
import { FrontendProduct } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import { ShoppingCart, Eye } from "lucide-react";
import { useCartStore } from '@/store/cart';
import { toast } from "sonner"
import QuickView from "@/components/custom/quickView";
import { Modal } from "@/components/custom/modal";

const ProductItem = ({ item }: { item: FrontendProduct }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    // Add logic to select variant if needed, for now default to first or product ID
    const variantId = item.variants?.[0]?.id || item.id;
    addToCart(item, variantId, 1);
    toast.success("¡Producto agregado al carrito!", { position: "top-center" })
  };

  return (
    <div className="product-item">
      <div className="w-full aspect-square relative overflow-hidden mb-2 group">
        {item.thumbnail ? (
          <Link href={`/productos/${item.slug || item.id}`}>
            <Image
              src={item.thumbnail}
              fill
              alt={item.title}
              className="object-cover rounded-md static"
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
      <Link href={`/productos/${item.slug || item.id}`}><span className="font-medium">{item.title}</span></Link>
      <p className="flex gap-2 font-medium items-center">
        {item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price ? (
          <>
            <span className="text-gray-400 line-through text-sm">{formatPrice(item.price)}</span>
            <span className="text-red-600 font-bold">{formatPrice(item.discountPrice)}</span>
          </>
        ) : (
          <span className="text-dark text-black font-bold">{formatPrice(item.price)}</span>
        )}
      </p>
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
