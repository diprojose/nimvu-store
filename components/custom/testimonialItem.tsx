"use client";
import Image from "next/image";
import Link from "next/link";
import { TestimonialsModel } from "@/types/testimonials";
import StarRating from "@/components/custom/starRating";

const TestimonialItem = ({ item }: { item: TestimonialsModel }) => {



  return (
    <div className="product-item">
      <div className="">
        <div className="review-container flex gap-2 pb-2">
          <StarRating rating={item.stars} />
        </div>
        <p className="font-medium">{item.text}</p>
      </div>
      <div className="text-container flex items-center pt-2">
        <div className="image-container pr-5">
          {item.photo ? (
            <Link href={`/products/${item.id}`}>
              <Image
                src={item.photo}
                alt={item.name}
                width={50}
                height={50}
                className="rounded-full"
                unoptimized={
                  item.photo.startsWith("http://localhost") ||
                  item.photo.startsWith("http://127.0.0.1")
                }
              />
            </Link>
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
              No Image
            </div>
          )}
        </div>
        <p className="font-medium">{item.name}</p>
      </div>
    </div>
  );
};

export default TestimonialItem;
