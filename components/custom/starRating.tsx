import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number; // Ej: 4
}

export default function StarRating({ rating }: StarRatingProps) {
  // Creamos un array de 5 posiciones vacías para poder iterar
  const totalStars = 5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalStars }).map((_, index) => {
        // La lógica mágica:
        // Si el índice (0, 1, 2...) es menor que el rating (4), es true.
        const isActive = index < rating;

        return (
          <Star
            key={index}
            size={20} // Tamaño de la estrella
            className={`${
              isActive 
                ? "text-yellow-400 fill-yellow-400" // Activa: Amarilla y rellena
                : "text-gray-300 fill-gray-100"     // Inactiva: Gris y rellena suave
            }`}
          />
        );
      })}
    </div>
  );
}