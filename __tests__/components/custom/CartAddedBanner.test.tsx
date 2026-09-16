import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import CartAddedBanner from "@/components/custom/cart/CartAddedBanner";
import { useCartUIStore } from "@/store/cartUI";
import { useCartStore } from "@/store/cart";

const producto = {
  id: "v-1",
  variantId: "v-1",
  productId: "p-1",
  title: "Portavasos Anturio",
  variantName: "Verde Dorado",
  thumbnail: "https://example.com/m.jpg",
  price: 40000,
  unit_price: 40000,
  quantity: 3,
};

describe("CartAddedBanner", () => {
  beforeEach(() => {
    useCartUIStore.setState({ isOpen: false, lastAddedId: null });
    useCartStore.setState({ items: [producto] });
  });

  it("no muestra nada si no se acaba de agregar nada", () => {
    const { container } = render(<CartAddedBanner />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el mensaje de confirmacion", () => {
    useCartUIStore.setState({ lastAddedId: "v-1" });
    render(<CartAddedBanner />);

    expect(screen.getByText("Agregado al carrito")).toBeInTheDocument();
  });

  it("NO repite el producto: eso ya lo muestra la fila resaltada de la lista", () => {
    useCartUIStore.setState({ lastAddedId: "v-1" });
    render(<CartAddedBanner />);

    // Repetir nombre y precio aqui hacia parecer que se agrego dos veces.
    expect(screen.queryByText("Portavasos Anturio")).not.toBeInTheDocument();
    expect(screen.queryByText(/40\.000/)).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("desaparece cuando el resaltado se apaga", () => {
    useCartUIStore.setState({ lastAddedId: "v-1" });
    const { rerender, container } = render(<CartAddedBanner />);
    expect(screen.getByText("Agregado al carrito")).toBeInTheDocument();

    useCartUIStore.setState({ lastAddedId: null });
    rerender(<CartAddedBanner />);
    expect(container.firstChild).toBeNull();
  });
});
