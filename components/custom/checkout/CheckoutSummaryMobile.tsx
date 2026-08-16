import React, { FC, ReactElement } from "react";
import { ShoppingBag } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import {
  SummaryItems,
  SummaryCoupon,
  SummaryTotals,
  SummaryTotalLine,
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
 * Resumen del pedido en móvil: siempre visible y desplegado al inicio del checkout,
 * para que el cliente vea sus productos, el total y el campo de cupones de inmediato.
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
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="lg:hidden rounded-lg ring-1 ring-gray-200 bg-white shadow-sm overflow-hidden mb-6">
      {/* Header del resumen */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5 bg-gray-50/80 border-b border-gray-100">
        <span className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <ShoppingBag className="w-4 h-4 text-gray-700" />
          Resumen del Pedido
          {isMounted && (
            <span className="text-gray-500 text-xs font-normal">
              ({itemCount} {itemCount === 1 ? "artículo" : "artículos"})
            </span>
          )}
        </span>
        <span className="text-base font-bold text-gray-900 shrink-0">
          {isMounted ? (
            formatPrice(total)
          ) : (
            <span className="inline-block h-5 w-20 rounded bg-gray-200 animate-pulse" />
          )}
        </span>
      </div>

      {/* Contenido completo siempre desplegado */}
      <div id="resumen-pedido-movil" className="p-4 space-y-4">
        <SummaryItems items={items} />

        <Separator />

        <div>
          <label className="text-xs font-semibold text-gray-700 mb-1.5 block">
            ¿Tienes un cupón de descuento?
          </label>
          <SummaryCoupon
            couponCode={couponCode}
            setCouponCode={setCouponCode}
            couponError={couponError}
            loadingCoupon={loadingCoupon}
            appliedCoupon={appliedCoupon}
            onApplyCoupon={onApplyCoupon}
            onRemoveCoupon={onRemoveCoupon}
          />
        </div>

        <Separator />

        <SummaryTotals
          subtotal={subtotal}
          shippingCost={shippingCost}
          discountAmount={discountAmount}
          appliedCoupon={appliedCoupon}
          shippingKnown={shippingKnown}
        />

        <Separator />

        <SummaryTotalLine total={total} />
      </div>
    </div>
  );
};
