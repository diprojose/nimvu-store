import React, { FC } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CartItem } from "@/store/cart";
import { formatPrice } from "@/lib/utils";

/**
 * Piezas compartidas entre el resumen de escritorio (columna sticky) y el de
 * móvil (acordeón arriba). Viven aquí para que un cambio de precios o de
 * cupones no haya que hacerlo en dos sitios y se desincronicen.
 */

export interface DiscountCoupon {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  products?: { id: string }[];
  collections?: { products?: { id: string }[] }[];
}

export const SummaryItems: FC<{ items: CartItem[] }> = ({ items }) => (
  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
    {items?.map((product: CartItem) => (
      <div className="flex gap-4 pt-2" key={`${product.id}-${product.variantId}`}>
        <div className="h-16 w-16 rounded-md border flex-shrink-0 relative">
          <Image
            src={product.thumbnail}
            fill
            alt={product.title}
            sizes="64px"
            className="object-cover rounded-md"
          />
          <span className="absolute -top-2 -right-2 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {product.quantity}
          </span>
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm line-clamp-2">{product.title}</p>
          {product.variantName && <p className="text-xs text-gray-500">{product.variantName}</p>}
        </div>
        <div className="text-sm font-medium">{formatPrice(product.unit_price)}</div>
      </div>
    ))}
  </div>
);

export interface SummaryCouponProps {
  couponCode: string;
  setCouponCode: (c: string) => void;
  couponError: string;
  loadingCoupon: boolean;
  appliedCoupon: DiscountCoupon | null;
  onApplyCoupon: () => void;
  onRemoveCoupon: () => void;
}

export const SummaryCoupon: FC<SummaryCouponProps> = ({
  couponCode,
  setCouponCode,
  couponError,
  loadingCoupon,
  appliedCoupon,
  onApplyCoupon,
  onRemoveCoupon,
}) => (
  <div>
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (couponCode.trim() && !loadingCoupon && !appliedCoupon) {
          onApplyCoupon();
        }
      }}
      className="flex gap-2"
    >
      <Input
        placeholder="Código de descuento"
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
        disabled={loadingCoupon || appliedCoupon !== null}
        className="bg-white uppercase placeholder:normal-case font-medium"
      />
      {appliedCoupon ? (
        <Button variant="outline" type="button" onClick={onRemoveCoupon}>
          Quitar
        </Button>
      ) : (
        <Button variant="secondary" type="submit" disabled={loadingCoupon || !couponCode.trim()}>
          {loadingCoupon ? "..." : "Aplicar"}
        </Button>
      )}
    </form>
    {couponError && <p className="text-red-500 text-xs mt-1.5 font-medium">{couponError}</p>}
  </div>
);

export interface SummaryTotalsProps {
  subtotal: number;
  shippingCost: number;
  discountAmount: number;
  appliedCoupon: DiscountCoupon | null;
  /**
   * Si ya se sabe cuánto cuesta el envío: hay dirección, o el subtotal superó
   * el umbral de envío gratis. Mientras sea false el total tampoco debe
   * sumarlo, o el cliente ve un total que no cuadra con las líneas de arriba.
   */
  shippingKnown: boolean;
}

export const SummaryTotals: FC<SummaryTotalsProps> = ({
  subtotal,
  shippingCost,
  discountAmount,
  appliedCoupon,
  shippingKnown,
}) => (
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
      {!shippingKnown ? (
        <span className="text-gray-400">Calculado al ingresar la dirección</span>
      ) : shippingCost === 0 ? (
        <span className="font-medium text-green-600">Gratis</span>
      ) : (
        <span>{formatPrice(shippingCost)}</span>
      )}
    </div>
  </div>
);

export const SummaryTotalLine: FC<{ total: number }> = ({ total }) => (
  <div className="flex justify-between items-center text-lg font-bold">
    <span>Total</span>
    <span>{formatPrice(total)}</span>
  </div>
);
