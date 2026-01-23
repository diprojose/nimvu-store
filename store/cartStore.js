// src/store/cartStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useCartStore = create(
  persist(
    (set, get) => ({
      cart: [],
      
      // Acción para agregar producto
      addToCart: (product) => {
        const { cart } = get();
        // Verificamos si ya está
        const productInCart = cart.find((item) => item.id === product.id);

        if (productInCart) {
          // Si existe, creamos un nuevo array actualizando SOLO ese producto (+1)
          const updatedCart = cart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: (item.quantity || 1) + 1 }
              : item
          );
          set({ cart: updatedCart });
        } else {
          // Si es nuevo, lo agregamos con quantity: 1
          set({ cart: [...cart, { ...product, quantity: 1 }] });
        }
      },

      increaseQuantity: (productId) => {
        const { cart } = get();
        const updatedCart = cart.map((item) =>
          item.id === productId 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
        set({ cart: updatedCart });
      },

      // 3. DISMINUIR (-)
      decreaseQuantity: (productId) => {
        const { cart } = get();
        const updatedCart = cart.map((item) => {
          if (item.id === productId) {
            // Evitamos que baje de 1. 
            // Si quieres que al llegar a 0 se borre, la lógica cambiaría un poco.
            return { ...item, quantity: Math.max(1, item.quantity - 1) };
          }
          return item;
        });
        set({ cart: updatedCart });
      },

      removeProductFromCart: (product) => {
        const { cart } = get();
        const updatedCart = cart.filter((item) => item.id !== product.id);
        set({ cart: updatedCart });
      },

      // Acción para limpiar carrito
      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'shopping-cart-storage', // Nombre único en LocalStorage
      // Por defecto usa localStorage, así que no necesitas configurar más
    }
  )
);