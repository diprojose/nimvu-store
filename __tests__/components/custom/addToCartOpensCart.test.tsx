import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, fireEvent, screen } from "@testing-library/react";
import { useCartUIStore } from "@/store/cartUI";
import { useCartStore } from "@/store/cart";

const toastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccess(...args),
    error: vi.fn(),
  },
}));

// Controla la ruta para probar el caso /cart, donde el drawer NO debe abrirse.
let rutaActual = "/productos";
vi.mock("next/navigation", () => ({
  usePathname: () => rutaActual,
}));

vi.mock("@/lib/analytics", () => ({ trackAddToCart: vi.fn() }));

import ProductItem from "@/components/custom/singleProduct";

const producto = {
  id: "prod-1",
  title: "Portavaso Psyduck",
  slug: "posavaso-psyduck",
  description: "",
  thumbnail: "https://example.com/a.jpg",
  price: 40000,
  stock: 5,
  images: [{ id: "i1", url: "https://example.com/a.jpg" }],
  variants: [],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

describe("agregar al carrito abre el carrito en vez de avisar", () => {
  beforeEach(() => {
    toastSuccess.mockClear();
    rutaActual = "/productos";
    useCartUIStore.setState({ isOpen: false, lastAddedId: null });
    useCartStore.setState({ items: [] });
  });

  const agregar = () => {
    render(<ProductItem item={producto} />);
    const boton = screen.getAllByRole("button").find((b) => !!b.querySelector("svg"));
    fireEvent.click(boton!);
  };

  it("abre el carrito y resalta el producto", () => {
    agregar();

    expect(useCartUIStore.getState().isOpen).toBe(true);
    expect(useCartUIStore.getState().lastAddedId).toBe("prod-1");
  });

  it("ya no muestra el aviso de producto agregado", () => {
    agregar();
    expect(toastSuccess).not.toHaveBeenCalled();
  });

  it("de verdad agrega el producto al carrito", () => {
    agregar();
    const items = useCartStore.getState().items;
    expect(items).toHaveLength(1);
    expect(items[0].title).toBe("Portavaso Psyduck");
  });

  it("estando en /cart no abre el drawer encima, solo resalta", () => {
    rutaActual = "/cart";
    agregar();

    expect(useCartUIStore.getState().isOpen).toBe(false);
    expect(useCartUIStore.getState().lastAddedId).toBe("prod-1");
  });
});
