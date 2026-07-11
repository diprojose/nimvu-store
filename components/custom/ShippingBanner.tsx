import { Truck } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

/**
 * Franja superior con el aviso de envío gratis. Se renderiza arriba de la
 * navegación, dentro del header fijo.
 */
export default function ShippingBanner() {
  return (
    <div className="w-full bg-black text-white">
      <div className="flex h-9 items-center justify-center gap-2 px-4 text-center text-[11px] sm:text-xs font-medium tracking-wide whitespace-nowrap">
        <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span>
          Envío gratis en compras superiores a{" "}
          {formatPrice(FREE_SHIPPING_THRESHOLD)}
        </span>
      </div>
    </div>
  );
}
