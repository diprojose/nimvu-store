"use client";

import React, { FC, ReactElement, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { reviews, type ReviewEligibility } from "@/lib/api";
import { useAuthStore } from "@/store/authStore";
import StarRating from "./StarRating";

export interface ReviewFormProps {
  productId: string;
}

const MAX_LENGTH = 2000;

/**
 * Formulario para dejar una reseña.
 *
 * Solo aparece si el backend confirma que este cliente compró el producto y
 * aún no lo ha reseñado. A quien no compró no se le muestra un formulario para
 * luego rechazarlo: no se le muestra nada.
 */
export const ReviewForm: FC<ReviewFormProps> = ({ productId }): ReactElement | null => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customer = useAuthStore((state: any) => state.customer);

  const [eligibility, setEligibility] = useState<ReviewEligibility | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!customer) {
      setEligibility(null);
      return;
    }
    let cancelled = false;
    reviews
      .eligibility(productId)
      .then((r) => {
        if (!cancelled) setEligibility(r);
      })
      .catch(() => {
        // Sin elegibilidad simplemente no se ofrece el formulario. No es un
        // error que el cliente deba ver.
        if (!cancelled) setEligibility(null);
      });
    return () => {
      cancelled = true;
    };
  }, [customer, productId]);

  // Sin sesión no se puede acreditar la compra.
  if (!customer) return null;
  if (!eligibility) return null;

  if (sent || eligibility.alreadyReviewed) {
    const status = sent ? "PENDING" : eligibility.review?.status;
    if (status === "PENDING") {
      return (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Gracias por tu reseña. La revisamos antes de publicarla, así que puede
          tardar un poco en aparecer.
        </div>
      );
    }
    return (
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        Ya dejaste tu reseña de este producto.
      </div>
    );
  }

  if (!eligibility.canReview) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) return setError("Elige cuántas estrellas le das.");
    if (!comment.trim()) return setError("Cuéntanos qué te pareció.");

    setSending(true);
    try {
      await reviews.create({ productId, rating, comment: comment.trim() });
      setSent(true);
      toast.success("¡Gracias! Tu reseña quedó registrada.", { position: "top-center" });
    } catch (err) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const backend = (err as any)?.response?.data?.message;
      setError(
        typeof backend === "string"
          ? backend
          : "No pudimos guardar tu reseña. Intenta de nuevo.",
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 p-5" noValidate>
      <h3 className="text-base font-semibold text-gray-900">Deja tu reseña</h3>
      <p className="mt-0.5 text-xs text-gray-500">
        Compraste este producto, así que tu opinión aparecerá como compra verificada.
      </p>

      <div className="mt-4 space-y-2">
        <Label>Tu calificación *</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="mt-4 space-y-2">
        <Label htmlFor="review-comment">Tu comentario *</Label>
        <textarea
          id="review-comment"
          rows={4}
          maxLength={MAX_LENGTH}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="¿Cómo te llegó? ¿Qué tal la calidad?"
          className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        />
        <p className="text-right text-xs text-gray-400">
          {comment.length}/{MAX_LENGTH}
        </p>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={sending}
        className="mt-4 bg-black text-white hover:bg-gray-800"
      >
        {sending ? "Enviando..." : "Publicar reseña"}
      </Button>
    </form>
  );
};

export default ReviewForm;
