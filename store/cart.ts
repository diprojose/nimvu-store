import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string; // unique ID for the cart item (can be variantId for simplicity if no duplicates allowed)
  variantId: string;
  productId: string;
  title: string;
  thumbnail: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  unit_price: number; // Compatibility
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  addItem: (product: any, variantId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartSubtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: any, variantId: string, quantity: number) => {
        const { items } = get();
        const existingItemIndex = items.findIndex((item) => item.variantId === variantId);

        // Find the variant details
        const variant = product.variants?.find((v: any) => v.id === variantId);

        let basePrice = product.price || 0;
        let discount = product.discountPrice;

        if (variant) {
          basePrice = variant.price || product.price || 0;
          discount = variant.discountPrice;
        }

        const hasDiscount = discount && discount > 0 && discount < basePrice;
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
                id: variantId, // Using variantId as ID for simplicity
                variantId,
                productId: product.id,
                title: product.title,
                thumbnail: product.thumbnail,
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
        set({ items: [] });
      },

      getCartTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      getCartSubtotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
      },

      // Compatibility getters for the UI which expects 'cart' object
      cart: null, // Placeholder if strictly needed, but we'll try to migrate usage
    }),
    {
      name: 'nimvu-cart-storage',
    }
  )
);
