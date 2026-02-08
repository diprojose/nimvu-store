import { create } from 'zustand';
import { sdk } from "../app/lib/sdk";

// Helper para leer los datos de autenticación de tu otro store de forma segura
const getAuthData = () => {
  try {
    const authStorage = localStorage.getItem("nimvu-auth-storage");
    if (!authStorage) return null;
    const parsed = JSON.parse(authStorage);
    // Zustand guarda los datos dentro de la propiedad 'state'.
    // En tu caso, dentro de 'state' hay un objeto 'customer'.
    return parsed.state || null;
  } catch (e) {
    return null;
  }
};

export const useCartStore = create((set, get) => ({
  cart: null, 
  loading: false,

  // 1. INICIALIZAR (Ahora con auto-detección de usuario)
  initialize: async () => {
    const cartId = localStorage.getItem("cart_id");
    // A. Validación robusta del ID
    // Si no existe, o es un string "undefined"/"null" (basura vieja), limpiamos y salimos.
    if (!cartId || cartId === "undefined" || cartId === "null") {
      console.log("No se encontró cart_id válido en localStorage. Iniciando vacío.");
      set({ cart: null, loading: false });
      return;
    }
    
    // B. Solo si hay carrito, leemos la sesión para ver si hay que sincronizar
    const authState = getAuthData(); 
    const customer = authState?.customer; 

    set({ loading: true });
    try {
      // C. Recuperamos el carrito de Medusa
      console.log("Recuperando carrito:", cartId);
      const { cart } = await sdk.store.cart.retrieve(cartId);
      
      // D. LÓGICA DE AUTO-CORRECCIÓN:
      // Verificamos si hay un customer y si el email del carrito no coincide
      if (customer?.email && cart.email !== customer.email) {
        console.log("Detectado usuario logueado. Vinculando carrito...");
        const { cart: updatedCart } = await sdk.store.cart.update(cartId, {
          email: customer.email
        });
        set({ cart: updatedCart });
      } else {
        // Si ya coinciden o no hay usuario, solo guardamos el carrito tal cual
        set({ cart });
      }

    } catch (error) {
      console.warn("Carrito no encontrado o expirado. Limpiando...", error);
      set({ cart: null });
    } finally {
      set({ loading: false });
    }
  },

  // 2. AGREGAR PRODUCTO
  addToCart: async (variantId, quantity = 1, countryCode = "co") => {
    set({ loading: true });
    try {
      let cartId = get().cart?.id;

      // A. Si no existe carrito, lo creamos
      if (!cartId) {
        const authState = getAuthData();
        const customer = authState?.customer;
        
        // Preparamos los datos iniciales
        const createPayload = {
          shipping_address: {
            country_code: countryCode, 
          }
        };

        // ¡MAGIA! Si ya está logueado, vinculamos email de una vez
        if (customer?.email) {
          createPayload.email = customer.email;
          // CORRECCIÓN: No enviamos customer_id aquí tampoco.
        }

        const { cart: newCart } = await sdk.store.cart.create(createPayload);
        
        cartId = newCart.id;
        localStorage.setItem("cart_id", cartId);
        set({ cart: newCart });
      }

      // B. Agregamos la línea al carrito
      const { cart: updatedCart } = await sdk.store.cart.createLineItem(cartId, {
        variant_id: variantId,
        quantity: quantity,
      });

      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error agregando al carrito:", error);
    } finally {
      set({ loading: false });
    }
  },

  // Alias para mantener compatibilidad
  addToCartFromQuickView: async (variantId, quantity) => {
    await get().addToCart(variantId, quantity);
  },

  // 3. ACTUALIZAR CANTIDAD (Optimista)
  updateLineItem: async (lineId, quantity) => {
    const { cart } = get();
    if (!cart) return;

    const previousCart = JSON.parse(JSON.stringify(cart));
    // Actualización visual inmediata
    const optimisticItems = cart.items.map(item => 
        item.id === lineId ? { ...item, quantity: quantity } : item
    );
    set({ cart: { ...cart, items: optimisticItems } });

    try {
      const { cart: updatedCart } = await sdk.store.cart.updateLineItem(cart.id, lineId, {
        quantity: quantity,
      });
      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error actualizando cantidad:", error);
      set({ cart: previousCart }); // Rollback
    }
  },

  increaseQuantity: async (lineId, currentQuantity) => {
    await get().updateLineItem(lineId, currentQuantity + 1);
  },

  decreaseQuantity: async (lineId, currentQuantity) => {
    const newQuantity = Math.max(1, currentQuantity - 1);
    await get().updateLineItem(lineId, newQuantity);
  },

  // 4. ELIMINAR ITEM (Optimista)
  removeItem: async (lineId) => {
    const { cart } = get();
    if (!cart) return;

    const previousCart = JSON.parse(JSON.stringify(cart));
    // Filtramos visualmente
    const optimisticItems = cart.items.filter(item => item.id !== lineId);
    set({ cart: { ...cart, items: optimisticItems } });

    try {
      const { cart: updatedCart } = await sdk.store.cart.deleteLineItem(cart.id, lineId);
      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error eliminando item:", error);
      set({ cart: previousCart });
    }
  },

  // Alias para mantener compatibilidad
  removeProductFromCart: async (lineId) => {
    await get().removeItem(lineId);
  },

  // 5. SINCRONIZAR SESIÓN MANUAL (Fallback)
  syncUserSession: async (user) => {
    const cart = get().cart;
    if (!cart || !user) return;

    // Si el email ya coincide, no gastamos recursos
    if (cart.email === user.email) return;

    set({ loading: true });
    try {
      const { cart: updatedCart } = await sdk.store.cart.update(cart.id, {
        email: user.email,
        // CORRECCIÓN: Eliminamos customer_id
      });
      set({ cart: updatedCart });
    } catch (error) {
      console.error("Error sincronizando sesión:", error);
    } finally {
      set({ loading: false });
    }
  },

  // 6. LIMPIAR
  clearCart: () => {
    localStorage.removeItem("cart_id");
    set({ cart: null });
  },
}));