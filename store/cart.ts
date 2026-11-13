import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique ID for the cart item (can be variantId for simplicity if no duplicates allowed)
  variantId: string;
  productId: string;
  title: string;
  variantName?: string;
  /** Frase del cliente en un producto personalizable, ya normalizada. */
  customText?: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  unit_price: number; // Compatibility
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  /**
   * Cupón que el cliente trae de un enlace (?codigo=NBC15) o que ya aplicó en
   * el checkout. Persiste con el carrito para que el checkout lo aplique solo,
   * aunque el cliente llegue a pagar días después, y se borra con `clearCart`
   * cuando la compra se completa.
   */
  couponCode: string | null;
  setCouponCode: (code: string | null) => void;
  addItem: (product: any, variantId: string, quantity: number, customText?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: (isB2BContext?: boolean) => number;
  getCartSubtotal: (isB2BContext?: boolean) => number;
}

/**
 * Id de una línea del carrito. Dos bolsos con frases distintas son productos
 * distintos para el cliente, así que la frase forma parte del id: cada una
 * tiene su línea y su cantidad.
 */
export const cartItemId = (variantId: string, customText?: string) =>
  customText ? `${variantId}::${customText}` : variantId;

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      couponCode: null,

      setCouponCode: (code: string | null) => {
        set({ couponCode: code ? code.trim().toUpperCase() : null });
      },

      addItem: (product: any, variantId: string, quantity: number, customText?: string) => {
        const { items } = get();
        const id = cartItemId(variantId, customText);
        const existingItemIndex = items.findIndex((item) => item.id === id);

        // Find the variant details
        const variant = product.variants?.find((v: any) => v.id === variantId);

        let basePrice = product.price || 0;
        let discount = product.discountPrice;

        if (variant) {
          basePrice = variant.price || product.price || 0;
          discount = variant.discountPrice;
        }

        const isDiscountActive = !product.discountEndDate || new Date(product.discountEndDate) >= new Date();
        const hasDiscount = isDiscountActive && discount && discount > 0 && discount < basePrice;
        const finalPrice = hasDiscount ? discount : basePrice;

        if (existingItemIndex > -1) {
          // Update quantity if item exists
          const updatedItems = [...items];
          updatedItems[existingItemIndex].quantity += quantity;
          // Update price in case it changed
          updatedItems[existingItemIndex].price = finalPrice;
          updatedItems[existingItemIndex].unit_price = finalPrice;
          updatedItems[existingItemIndex].originalPrice = hasDiscount ? basePrice : undefined;
          set({ items: updatedItems });
        } else {
          // Add new item
          set({
            items: [
              ...items,
              {
                id,
                variantId,
                customText,
                productId: product.id,
                title: product.title,
                variantName: variant?.title || variant?.name,
                thumbnail: (variant?.images?.[0]) || product.thumbnail,
                price: finalPrice,
                originalPrice: hasDiscount ? basePrice : undefined,
                discountPrice: hasDiscount ? discount : undefined,
                unit_price: finalPrice, // Alias for compatibility
                quantity,
              },
            ],
          });
        }
      },

      removeItem: (itemId: string) => {
        set({ items: get().items.filter((item) => item.id !== itemId) });
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity < 1) return;
        set({
          items: get().items.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        });
      },

      clearCart: () => {
        set({ items: [], couponCode: null });
      },

      getCartTotal: (isB2BContext?: boolean) => {
        const { items } = get();
        return items.reduce((total, item) => {
          let currentPrice = item.price;
          let originalItemPrice = item.originalPrice || item.price; // fallback if discountPrice wasn't active

          if (isB2BContext) {
            // Evaluamos la lógica de porcentaje global
            if (item.quantity >= 200) {
              currentPrice = originalItemPrice * 0.75; // 25% descuento
            } else if (item.quantity >= 50) {
              currentPrice = originalItemPrice * 0.80; // 20% descuento
            } else if (item.quantity >= 12) {
              currentPrice = originalItemPrice * 0.90; // 10% descuento
            } else {
              currentPrice = originalItemPrice; // Precio normal para -11 items si pasa (aunque B2B tiene defaults manuales)
            }
          }
          return total + (currentPrice * item.quantity);
        }, 0);
      },

      getCartSubtotal: (isB2BContext?: boolean) => {
        const { items } = get();
        // Since getCartTotal is identical to subtotal right now for missing shipping logic
        return get().getCartTotal(isB2BContext);
      },

      // Compatibility getters for the UI which expects 'cart' object
      cart: null, // Placeholder if strictly needed, but we'll try to migrate usage
    }),
    {
      name: 'nimvu-cart-storage',
    }
  )
);
