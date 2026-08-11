import React, { FC, ReactElement, useState } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  SummaryItems,
  SummaryCoupon,
  SummaryTotals,
  type DiscountCoupon,
} from "./CheckoutSummaryParts";

export interface CheckoutSummaryMobileProps {
  items: CartItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  couponCode: string;
  setCouponCode: (c: string) => void;
  couponError: string;
  loadingCoupon: boolean;
  appliedCoupon: DiscountCoupon | null;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
  discountAmount: number;
  shippingKnown: boolean;
  /**
   * El carrito vive en localStorage: antes de hidratar, items está vacío y el
   * total es 0. Como aquí el total es lo primero que ve el cliente, mostrar
   * "$0" un instante se lee como un error de precio.
   */
  isMounted: boolean;
}

/**
 * Resumen del pedido en móvil, con el patrón de checkout de Shopify: una barra
 * plegable arriba de todo, con el total siempre a la vista.
 *
 * El problema que resuelve: el resumen vivía al final de la página, debajo del
 * botón de pagar. Como el costo de envío solo se conoce al escribir la
 * dirección, el cliente llegaba al botón sin haber visto nunca cuánto costaba
 * el envío ni que tenía envío gratis. Con el total arriba, cualquier cambio es
 * visible sin tener que bajar.
 */
export const CheckoutSummaryMobile: FC<CheckoutSummaryMobileProps> = ({
  items,
  subtotal,
  shippingCost,
  total,
  couponCode,
  setCouponCode,
  couponError,
  loadingCoupon,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
  discountAmount,
  shippingKnown,
  isMounted,
}): ReactElement => {
  const [open, setOpen] = useState(false);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="lg:hidden rounded-lg ring-1 ring-gray-200 bg-white shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="resumen-pedido-movil"
        className="w-full flex items-center justify-between gap-3 px-4 py-4 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <ShoppingBag className="w-4 h-4" />
          {open ? "Ocultar resumen" : "Mostrar resumen"}
          {isMounted && (
            <span className="text-gray-500 font-normal">
              ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
        <span className="text-lg font-bold shrink-0">
          {isMounted ? (
            formatPrice(total)
          ) : (
            <span className="inline-block h-5 w-24 rounded bg-gray-100 animate-pulse" />
          )}
        </span>
      </button>

      {open && (
        <div id="resumen-pedido-movil" className="px-4 pb-4 space-y-4 border-t pt-4">
          <SummaryItems items={items} />

          <Separator />

          <SummaryCoupon
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponError={couponError}
            loadingCoupon={loadingCoupon}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
          />

          <Separator />

          <SummaryTotals
            subtotal={subtotal}
            shippingCost={shippingCost}
            discountAmount={discountAmount}
            appliedCoupon={appliedCoupon}
            shippingKnown={shippingKnown}
          />
        </div>
      )}
    </div>
  );
};
