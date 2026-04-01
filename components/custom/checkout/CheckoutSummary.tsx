import React, { FC, ReactElement } from "react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

// Interface for actual expected API Discount
export interface DiscountCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  products?: { id: string }[];
  collections?: { products?: { id: string }[] }[];
}

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
}

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
  discountAmount
}): ReactElement => {
  return (
    <div className="sticky top-24">
      <Card className="shadow-lg border-0 bg-white">
        <CardHeader className="bg-gray-50/50 border-b pb-4">
          <CardTitle className="text-lg">Resumen del Pedido</CardTitle>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">

          {/* Lista de Items */}
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {items?.map((product: CartItem) => (
              <div className="flex gap-4 pt-2" key={`${product.id}-${product.variantId}`}>
                <div className="h-16 w-16 rounded-md border flex-shrink-0 relative">
                  <Image
                    src={product.thumbnail}
                    fill
                    alt={product.title}
                    className="object-cover rounded-md"
                    unoptimized={
                      product.thumbnail.startsWith("http://localhost") ||
                      product.thumbnail.startsWith("http://127.0.0.1") ||
                      product.thumbnail.includes("supabase.co")
                    }
                  />
                  <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">{product.quantity}</span>
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm line-clamp-2">{product.title}</p>
                </div>
                <div className="text-sm font-medium">{formatPrice(product.unit_price)}</div>
              </div>
            ))}
          </div>

          <Separator />

          <div className="space-y-4">
            {/* Código de Descuento */}
            <div className="flex gap-2">
              <Input
                placeholder="Código de descuento"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                disabled={loadingCoupon || appliedCoupon !== null}
                className="bg-white"
              />
              {appliedCoupon ? (
                <Button variant="outline" onClick={onRemoveCoupon}>
                  Quitar
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  onClick={onApplyCoupon}
                  disabled={loadingCoupon || !couponCode}
                >
                  {loadingCoupon ? "..." : "Aplicar"}
                </Button>
              )}
            </div>
            {couponError && <p className="text-red-500 text-xs mt-1">{couponError}</p>}

            <Separator />

            {/* Totales */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Descuento ({appliedCoupon.code})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatPrice(total)}</span>
          </div>

        </CardContent>
      </Card>

      <div className="mt-6 text-center text-xs text-gray-400 space-y-2">
        <p>🔒 Pagos procesados seguramente por Wompi</p>
        <p>📦 Envíos a todo Colombia</p>
      </div>
    </div>
  );
};
