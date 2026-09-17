"use client";

import React, { FC, ReactElement, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { reviewInvites } from "@/lib/api";
import StarRating from "./StarRating";

export interface InviteReviewFormProps {
  token: string;
  productName: string;
  productImage?: string;
}

const MAX_LENGTH = 2000;

/**
 * Formulario de la página a la que lleva el correo post-entrega.
 *
 * A diferencia de ReviewForm, no consulta elegibilidad ni necesita sesión: el
 * token firmado que viene en la URL es la credencial, y el backend lo valida
 * contra la orden al guardar.
 */
export const InviteReviewForm: FC<InviteReviewFormProps> = ({
  token,
  productName,
  productImage,
}): ReactElement => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (sent) {
    return (
      <div className="mt-8 rounded-lg border border-emerald-200 bg-emerald-50 p-5 text-sm text-emerald-900">
        <p className="font-semibold">¡Gracias por tu reseña!</p>
        <p className="mt-1">
          La revisamos antes de publicarla, así que puede tardar un poco en aparecer en la tienda.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (rating < 1) return setError("Elige cuántas estrellas le das.");
    if (!comment.trim()) return setError("Cuéntanos qué te pareció.");

    setSending(true);
    try {
      await reviewInvites.submit({ token, rating, comment: comment.trim() });
      setSent(true);
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
    <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate>
      <div className="flex items-center gap-3 rounded-lg border border-gray-200 p-3">
        {productImage ? (
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-gray-100">
            <Image src={productImage} alt={productName} fill sizes="56px" className="object-cover" />
          </div>
        ) : null}
        <p className="text-sm font-medium text-gray-900">{productName}</p>
      </div>

      <div className="space-y-2">
        <Label>Tu calificación *</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="invite-comment">Tu comentario *</Label>
        <textarea
          id="invite-comment"
          rows={5}
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
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <Button
        type="submit"
        disabled={sending}
        className="w-full bg-black py-6 text-white hover:bg-gray-800"
      >
        {sending ? "Enviando..." : "Enviar reseña"}
      </Button>
    </form>
  );
};

export default InviteReviewForm;
