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
    <section className="mt-12 border-t border-gray-200 pt-8" id="resenas">
      <h2 className="mb-6 font-source-serif text-xl font-bold dark:text-white">
        Reseñas
      </h2>

      {ratingCount > 0 ? (
        <div className="mb-8 flex items-center gap-4">
          <span className="text-4xl font-semibold text-gray-900">
            {ratingAverage.toFixed(1)}
          </span>
          <div>
            <StarRating value={ratingAverage} size="md" />
            <p className="mt-1 text-sm text-gray-500">
              {ratingCount === 1 ? "1 reseña" : `${ratingCount} reseñas`}
            </p>
          </div>
        </div>
      ) : (
        <p className="mb-8 text-sm text-gray-500">
          Este producto todavía no tiene reseñas.
        </p>
      )}

      <div className="mb-8">
        <ReviewForm productId={productId} />
      </div>

      <ul className="space-y-6">
        {items.map((review) => (
          <li key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <StarRating value={review.rating} size="sm" />
              <span className="text-sm font-medium text-gray-900">
                {review.authorName}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                <BadgeCheck className="h-3.5 w-3.5" />
                Compra verificada
              </span>
              <span className="text-xs text-gray-400">{formatDate(review.createdAt)}</span>
            </div>

            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-700">
              {review.comment}
            </p>

            {review.adminReply && (
              <div className="mt-3 rounded-md border-l-2 border-gray-300 bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold text-gray-900">Respuesta de Nimvu</p>
                <p className="mt-1 whitespace-pre-line text-sm text-gray-700">
                  {review.adminReply}
                </p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
};

export default ProductReviews;
