import React, { FC, ReactElement } from "react";
import { BadgeCheck } from "lucide-react";
import { reviews as reviewsApi, type BackendReview } from "@/lib/api";
import StarRating from "./StarRating";
import ReviewForm from "./ReviewForm";

export interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  ratingAverage: number;
  ratingCount: number;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

/**
 * Bloque de reseñas de la ficha de producto.
 *
 * Server component: las reseñas aprobadas se piden en el servidor y entran en
 * la caché de Next con el tag del producto, así que al aprobar una el backend
 * las refresca al invalidar `product-<slug>`. El formulario, que sí necesita
 * sesión, es el único trozo cliente.
 */
export const ProductReviews: FC<ProductReviewsProps> = async ({
  productId,
  productSlug,
  ratingAverage,
  ratingCount,
}): Promise<ReactElement> => {
  let items: BackendReview[] = [];
  try {
    const data = await reviewsApi.listByProduct(productId, productSlug);
    items = data.items;
  } catch (err) {
    // Que el servicio de reseñas falle no debe tumbar la ficha del producto.
    console.error("No se pudieron cargar las reseñas", productId, err);
  }

  return (
    // Dos columnas en escritorio: el resumen y el formulario a un lado, las
    // reseñas al otro. Separadas por espacio, sin rayas.
    <section className="mt-16 md:mt-24 grid gap-10 lg:grid-cols-12 lg:gap-16" id="resenas">
      <div className="lg:col-span-4 reveal-on-scroll">
        <h2 className="mb-6 font-source-serif text-2xl font-semibold dark:text-white">
          Reseñas
        </h2>

        {ratingCount > 0 ? (
          <div className="mb-8 flex items-center gap-4">
            <span className="text-5xl font-semibold text-gray-900">
              {ratingAverage.toFixed(1)}
            </span>
            <div>
              <StarRating value={ratingAverage} size="md" />
              <p className="mt-1 text-sm text-gray-600">
                {ratingCount === 1 ? "1 reseña" : `${ratingCount} reseñas`}
              </p>
            </div>
          </div>
        ) : (
          <p className="mb-8 text-base text-gray-700">
            Este producto todavía no tiene reseñas.
          </p>
        )}

        <ReviewForm productId={productId} />
      </div>

      {items.length > 0 && (
        <ul className="lg:col-span-8 space-y-10">
          {items.map((review) => (
            <li key={review.id} className="reveal-on-scroll">
              <StarRating value={review.rating} size="sm" />
              <p className="mt-3 whitespace-pre-line text-base leading-relaxed text-gray-900">
                {review.comment}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="font-medium text-gray-900">{review.authorName}</span>
                <span className="inline-flex items-center gap-1 font-medium text-emerald-700">
                  <BadgeCheck className="h-4 w-4" aria-hidden="true" />
                  Compra verificada
                </span>
                <span className="text-gray-600">{formatDate(review.createdAt)}</span>
              </div>

              {review.adminReply && (
                <div className="mt-4 rounded-md bg-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">Respuesta de Nimvu</p>
                  <p className="mt-1 whitespace-pre-line text-base text-gray-800">
                    {review.adminReply}
                  </p>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default ProductReviews;
