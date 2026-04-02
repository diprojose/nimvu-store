import { FrontendProduct } from "@/lib/api";

/**
 * Fires a custom_add_to_cart event to window.dataLayer (Google Tag Manager).
 * GTM escucha este evento y dispara la etiqueta de Facebook Pixel configurada
 * con el activador "custom_add_to_cart".
 *
 * Call this function whenever a product is added to the cart.
 */
export function trackAddToCart(
  product: FrontendProduct,
  quantity: number = 1
): void {
  if (typeof window === "undefined") return;

  const effectivePrice =
    product.discountPrice && product.discountPrice > 0 && product.discountPrice < product.price
      ? product.discountPrice
      : product.price;

  const totalValue = effectivePrice * quantity;

  // GTM picks up this event and fires the Facebook Pixel tag via the
  // "custom_add_to_cart" Custom Event trigger configured in the container.
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "custom_add_to_cart",
    ecommerce: {
      currency: "COP",
      value: totalValue,
      items: [
        {
          item_id: product.id,
          item_name: product.title,
          item_category: product.category?.name ?? "",
          price: effectivePrice,
          quantity,
        },
      ],
    },
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export interface PurchaseItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  price: number;
  quantity: number;
}

export interface PurchasePayload {
  /** Internal order ID (e.g. from backend response) */
  orderId: string;
  /** Total amount paid by the customer (after discounts + shipping) */
  value: number;
  items: PurchaseItem[];
}

/**
 * Fires a custom_purchase event to window.dataLayer (Google Tag Manager).
 * GTM escucha este evento y dispara la etiqueta de Facebook Pixel con Purchase.
 *
 * IMPORTANT: Call this ONLY ONCE per order. Use a sessionStorage guard in the
 * caller to prevent duplicate fires on page reload.
 */
export function trackPurchase({ orderId, value, items }: PurchasePayload): void {
  if (typeof window === "undefined") return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: "custom_purchase",
    ecommerce: {
      transaction_id: orderId,
      currency: "COP",
      value,
      items,
    },
  });
}
