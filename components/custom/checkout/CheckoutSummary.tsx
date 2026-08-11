import React, { FC, ReactElement } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/store/cart";
import {
  SummaryItems,
  SummaryCoupon,
  SummaryTotals,
  SummaryTotalLine,
  type DiscountCoupon,
} from "./CheckoutSummaryParts";

export type { DiscountCoupon };

export interface CheckoutSummaryProps {
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
}

/**
 * Resumen de escritorio: columna sticky a la derecha. En móvil se usa
 * CheckoutSummaryMobile, porque aquí abajo el cliente nunca lo veía.
 */
export const CheckoutSummary: FC<CheckoutSummaryProps> = ({
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
}): ReactElement => {
  return (
    <div className="sticky top-28">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <SummaryItems items={items} />

          <Separator />

          <div className="space-y-4">
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

          <Separator />

          <SummaryTotalLine total={total} />
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-gray-400 space-y-2">
        <p>🔒 Pagos procesados seguramente por Wompi</p>
        <p>📦 Envíos a todo Colombia</p>
      </div>
    </div>
  );
};
