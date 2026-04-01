"use client";
import React, { FC, ReactElement, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FrontendProduct } from "@/lib/api";
import { cn, formatPrice } from "@/lib/utils";
import { ShoppingCart, Eye } from "lucide-react";
import { useCartStore } from '@/store/cart';
import { toast } from "sonner"
import QuickView from "@/components/custom/quickView";
import { Modal } from "@/components/custom/modal";

export interface ProductItemProps {
  item: FrontendProduct;
}

const ProductItem: FC<ProductItemProps> = ({ item }: ProductItemProps): ReactElement => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const addToCart: (product: FrontendProduct, variantId: string, quantity: number) => void = useCartStore((state: any) => state.addItem);

  const handleAddToCart = (): void => {
    // Add logic to select variant if needed, for now default to first or product ID
    const variantId: string = item.variants?.[0]?.id || item.id;
    addToCart(item, variantId, 1);
    toast.success("¡Producto agregado al carrito!", { position: "top-center" });
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
              className={cn("object-cover rounded-md static transition-opacity duration-300", item.images && item.images.length > 1 ? "group-hover:opacity-0" : "")}
              unoptimized={
                item.thumbnail.startsWith("http://localhost") ||
                item.thumbnail.startsWith("http://127.0.0.1") ||
                item.thumbnail.includes("supabase.co")
              }
            />
            {item.images && item.images.length > 1 && (
              <Image
                src={item.images[1].url}
                fill
                alt={`${item.title} - 2`}
                className="object-cover rounded-md absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                unoptimized={
                  item.images[1].url.startsWith("http://localhost") ||
                  item.images[1].url.startsWith("http://127.0.0.1") ||
                  item.images[1].url.includes("supabase.co")
                }
              />
            )}
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
          <button className="bg-white rounded-full cursor-pointer" onClick={(): void => setIsModalOpen(true)}>
            <Eye className="m-2 w-5 h-5" />
          </button>
        </div>
      </div>
      <div className="mt-3">
        {item.category && (
          <Link href={`/categorias/${item.category.slug}`} className="text-[10px] md:text-xs text-gray-500 uppercase tracking-widest mb-1 block hover:text-black transition-colors">
            {item.category.name}
          </Link>
        )}
        <Link href={`/productos/${item.slug || item.id}`} className="block">
          <span className="font-medium line-clamp-2 min-h-[3rem] leading-tight">{item.title}</span>
        </Link>
      </div>
      <p className="flex gap-2 font-medium items-center mt-1">
        {item.discountPrice && item.discountPrice > 0 && item.discountPrice < item.price && (!item.discountEndDate || new Date(item.discountEndDate) >= new Date()) ? (
          <>
            <span className="text-gray-400 line-through text-sm">{formatPrice(item.price)}</span>
            <span className="text-red-600 font-bold">{formatPrice(item.discountPrice)}</span>
          </>
        ) : (
          <span className="text-dark text-black font-bold">{formatPrice(item.price)}</span>
        )}
      </p>
      <button 
        onClick={handleAddToCart}
        className="w-full mt-4 bg-black text-white text-xs md:text-sm font-medium py-2.5 rounded hover:bg-gray-800 transition-colors uppercase tracking-wider"
      >
        Agregar al carrito
      </button>
      <Modal
        isOpen={isModalOpen}
        onClose={(): void => setIsModalOpen(false)}
        title={item.title}
      >
        <QuickView item={item} />
      </Modal>
    </div>
  );
};

export default ProductItem;
