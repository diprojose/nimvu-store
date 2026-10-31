"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, ChevronLeft, ChevronRight } from "lucide-react";
import { FeaturedReview } from "@/lib/api";
import StarRating from "@/components/custom/reviews/StarRating";

const productHref = (review: FeaturedReview) =>
  review.product.slug ? `/productos/${review.product.slug}` : "/productos";

const arrow =
  "w-12 h-12 shrink-0 rounded-full bg-white text-gray-900 flex items-center justify-center transition-colors hover:bg-gray-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900";

/**
 * Reseñas reales del home, de una en una, rodeadas por hojas recortadas de
 * nuestra propia Monstera. Si no hay reseñas aprobadas la sección no se pinta:
 * nada de testimonios de relleno.
 */
export default function HomeReviews({ items }: { items: FeaturedReview[] }) {
  const [cur, setCur] = useState(0);
  if (items.length === 0) return null;

  const many = items.length > 1;
  const go = (d: number) => setCur((c) => (c + d + items.length) % items.length);

  return (
    <section id="opiniones" className="home-reviews w-full pb-[100px] scroll-mt-24">
      <div className="relative overflow-hidden rounded-md bg-[#F6EEE6] px-5 pt-24 pb-28 md:px-16 md:pt-40 md:pb-36 xl:pt-32 xl:pb-32">
        {/* Hojas de la Monstera entrando por dos esquinas */}
        <Image
          src="/home/hojas-monstera.png"
          alt=""
          aria-hidden="true"
          width={591}
          height={689}
          sizes="(max-width: 768px) 144px, 352px"
          className="pointer-events-none select-none absolute -right-12 -top-20 w-36 md:-right-14 md:-top-24 md:w-56 xl:w-72 2xl:w-[22rem] 2xl:-right-16 2xl:-top-28 rotate-[200deg]"
        />
        <Image
          src="/home/hojas-monstera.png"
          alt=""
          aria-hidden="true"
          width={591}
          height={689}
          sizes="(max-width: 768px) 128px, 288px"
          className="pointer-events-none select-none absolute -left-14 -bottom-24 w-32 md:-left-16 md:-bottom-28 md:w-52 xl:w-64 2xl:w-72 rotate-[25deg] -scale-x-100"
        />

        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <h2 className="font-source-serif font-semibold text-4xl md:text-5xl tracking-tight text-gray-900">
            Qué dicen nuestros clientes
          </h2>
          <p className="font-inter mt-3 text-gray-700">Reseñas de personas que ya recibieron su pedido de Nimvu.</p>

          <div className="mt-12 flex items-center gap-4 md:gap-8">
            {many && (
              <button type="button" onClick={() => go(-1)} className={`${arrow} hidden md:flex`} aria-label="Reseña anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Todas apiladas en la misma celda: la altura no salta al cambiar */}
            <div className="grid flex-1" aria-live="polite">
              {items.map((review, i) => {
                const active = i === cur;
                return (
                  <figure
                    key={review.id}
                    className={`[grid-area:1/1] flex flex-col items-center gap-5 transition-opacity duration-500 ${active ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                    aria-hidden={!active}
                    inert={!active}
                  >
                    <StarRating value={review.rating} size="md" label={`${review.rating} de 5 estrellas`} />
                    <blockquote className="font-source-serif text-xl md:text-2xl leading-snug text-gray-900">
                      “{review.comment}”
                    </blockquote>
                    <figcaption className="flex flex-col items-center gap-2">
                      <span className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                        <span className="font-medium text-gray-900">{review.authorName}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-700">
                          <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                          Compra verificada
                        </span>
                      </span>
                      <Link
                        href={productHref(review)}
                        className="text-sm text-gray-700 underline underline-offset-4 hover:text-black"
                      >
                        {review.product.name}
                      </Link>
                    </figcaption>
                  </figure>
                );
              })}
            </div>

            {many && (
              <button type="button" onClick={() => go(1)} className={`${arrow} hidden md:flex`} aria-label="Reseña siguiente">
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {many && (
            <div className="mt-8 flex justify-center gap-4 md:hidden">
              <button type="button" onClick={() => go(-1)} className={arrow} aria-label="Reseña anterior">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button type="button" onClick={() => go(1)} className={arrow} aria-label="Reseña siguiente">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
