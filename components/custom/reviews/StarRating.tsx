"use client";

import React, { FC, ReactElement, useState } from "react";
import { Star } from "lucide-react";

export interface StarRatingProps {
  /** Valor actual, de 0 a 5. Admite decimales en modo lectura (4.3). */
  value: number;
  /** Con `onChange` el control es seleccionable; sin él, solo lectura. */
  onChange?: (value: number) => void;
  size?: "sm" | "md" | "lg";
  /** Etiqueta accesible cuando no hay texto al lado (p. ej. en las tarjetas). */
  label?: string;
}

const SIZES = {
  sm: "w-3.5 h-3.5",
  md: "w-5 h-5",
  lg: "w-7 h-7",
} as const;

/**
 * Estrellas de calificación, en modo lectura y en modo selección.
 *
 * En lectura se rellena por porcentaje, no redondeando: un 4.3 se ve distinto
 * de un 4.0, que es justo lo que el promedio quiere comunicar. En selección
 * son botones reales, para que funcione con teclado y con lector de pantalla.
 */
export const StarRating: FC<StarRatingProps> = ({
  value,
  onChange,
  size = "md",
  label,
}): ReactElement => {
  const [hovered, setHovered] = useState<number | null>(null);
  const interactive = typeof onChange === "function";
  const shown = hovered ?? value;
  const cls = SIZES[size];

  if (!interactive) {
    return (
      <span
        className="inline-flex items-center gap-0.5"
        role="img"
        aria-label={label ?? `${value.toFixed(1)} de 5 estrellas`}
      >
        {[1, 2, 3, 4, 5].map((i) => {
          // Relleno parcial de esta estrella: 0 vacía, 100 llena. Se redondea
          // a un decimal porque en coma flotante 4.3 - 4 da 0.29999999999998,
          // y eso terminaría escrito tal cual en el `width` del HTML.
          const raw = Math.max(0, Math.min(1, value - (i - 1))) * 100;
          const pct = Math.round(raw * 10) / 10;
          return (
            <span key={i} className={`relative inline-block ${cls}`}>
              <Star className={`${cls} absolute inset-0 text-gray-300 fill-gray-100`} />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${pct}%` }}
              >
                <Star className={`${cls} fill-amber-400 text-amber-400`} />
              </span>
            </span>
          );
        })}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1" onMouseLeave={() => setHovered(null)}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange!(i)}
          onMouseEnter={() => setHovered(i)}
          aria-label={`${i} ${i === 1 ? "estrella" : "estrellas"}`}
          aria-pressed={value === i}
          className="cursor-pointer rounded p-0.5 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500"
        >
          <Star
            className={`${cls} ${
              i <= shown ? "fill-amber-400 text-amber-400" : "text-gray-300 fill-gray-100"
            }`}
          />
        </button>
      ))}
    </span>
  );
};

export default StarRating;
