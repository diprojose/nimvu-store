import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { useCartUIStore } from "@/store/cartUI";

/**
 * Al agregar un producto ya no sale un toast: se abre el carrito mostrando el
 * producto dentro, resaltado.
 */
describe("cartUI store", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    useCartUIStore.setState({ isOpen: false, lastAddedId: null });
  });
  afterEach(() => vi.useRealTimers());

  const estado = () => useCartUIStore.getState();

  it("arranca cerrado", () => {
    expect(estado().isOpen).toBe(false);
    expect(estado().lastAddedId).toBeNull();
  });

  it("abre el carrito y marca el producto agregado", () => {
    estado().notifyAdded("variant-1");

    expect(estado().isOpen).toBe(true);
    expect(estado().lastAddedId).toBe("variant-1");
  });

  it("apaga el resaltado solo, sin cerrar el carrito", () => {
    estado().notifyAdded("variant-1");

    vi.advanceTimersByTime(5500);

    expect(estado().lastAddedId).toBeNull();
    expect(estado().isOpen).toBe(true); // el carrito sigue abierto
  });

  it("no abre el carrito cuando se pide no abrirlo (caso /cart)", () => {
    estado().notifyAdded("variant-1", false);

    expect(estado().isOpen).toBe(false);
    expect(estado().lastAddedId).toBe("variant-1"); // pero sí lo resalta
  });

  it("mantiene el carrito abierto si ya lo estaba", () => {
    estado().setOpen(true);
    estado().notifyAdded("variant-2", false);

    expect(estado().isOpen).toBe(true);
    expect(estado().lastAddedId).toBe("variant-2");
  });

  it("al cerrar limpia el resaltado para que no reaparezca", () => {
    estado().notifyAdded("variant-1");
    estado().setOpen(false);

    expect(estado().isOpen).toBe(false);
    expect(estado().lastAddedId).toBeNull();

    estado().setOpen(true);
    expect(estado().lastAddedId).toBeNull();
  });

  it("agregar otro producto reinicia el temporizador del resaltado", () => {
    estado().notifyAdded("variant-1");
    vi.advanceTimersByTime(4000);

    estado().notifyAdded("variant-2");
    vi.advanceTimersByTime(3000); // 7s desde el primero, 3s desde el segundo

    expect(estado().lastAddedId).toBe("variant-2");
  });

  it("no persiste: no escribe en localStorage", () => {
    estado().notifyAdded("variant-1");
    const claves = Object.keys(localStorage);
    expect(claves.some((k) => k.toLowerCase().includes("cartui"))).toBe(false);
  });
});
