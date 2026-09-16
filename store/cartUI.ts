import { create } from 'zustand';

/**
 * Estado de interfaz del carrito. Deliberadamente SIN persistir: el drawer no
 * debe reabrirse solo al recargar la pagina, a diferencia del contenido del
 * carrito (ver store/cart.ts, que si persiste).
 */
export interface CartUIState {
  /** Drawer del carrito abierto. */
  isOpen: boolean;
  /** Ultimo producto agregado, para resaltarlo en la lista. */
  lastAddedId: string | null;
  setOpen: (open: boolean) => void;
  /**
   * Feedback tras agregar al carrito. Sustituye al toast de "producto
   * agregado": en vez de avisar, se muestra el carrito con el producto dentro.
   *
   * `openDrawer` es false cuando el cliente ya esta en /cart, donde abrir el
   * drawer encima del carrito no aporta nada: alli basta con resaltarlo.
   */
  notifyAdded: (itemId: string, openDrawer?: boolean) => void;
}

/**
 * Cuanto dura la confirmacion (banner + fila resaltada) antes de apagarse sola.
 * Si no se apagara, quedaria fija hasta recargar y el cliente veria un
 * "Agregado al carrito" viejo al abrir el carrito mas tarde.
 *
 * 5s y no menos: con 3s la accion pasaba demasiado rapido para leerse.
 */
const HIGHLIGHT_MS = 5000;
let highlightTimer: ReturnType<typeof setTimeout> | null = null;

export const useCartUIStore = create<CartUIState>()((set) => ({
  isOpen: false,
  lastAddedId: null,

  setOpen: (open: boolean) => {
    if (highlightTimer) clearTimeout(highlightTimer);
    // Al cerrar se limpia el resaltado para que no reaparezca en la siguiente
    // apertura del drawer.
    set(open ? { isOpen: true } : { isOpen: false, lastAddedId: null });
  },

  notifyAdded: (itemId: string, openDrawer = true) => {
    if (highlightTimer) clearTimeout(highlightTimer);
    set((state) => ({
      isOpen: openDrawer ? true : state.isOpen,
      lastAddedId: itemId,
    }));
    highlightTimer = setTimeout(() => {
      set({ lastAddedId: null });
      highlightTimer = null;
    }, HIGHLIGHT_MS);
  },
}));
