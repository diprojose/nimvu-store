import { products as productsApi, FrontendProduct } from "@/lib/api";
import CartView from "@/components/custom/cart/CartView";

/**
 * El carrito en sí es cliente (depende del store de Zustand). Esta página solo
 * resuelve en el servidor los candidatos del carrusel "Completa tu pedido".
 *
 * Se filtran y recortan AQUÍ y no en el navegador a propósito: `products.list()`
 * devuelve el catálogo completo, y serializarlo entero en el payload RSC
 * engordaría el HTML de una página que hoy se prerenderiza.
 */
export default async function CartPage() {
  let crossSellProducts: FrontendProduct[] = [];

  try {
    const all = await productsApi.list();
    const effectivePrice = (p: FrontendProduct) =>
      p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price
        ? p.discountPrice
        : p.price;

    crossSellProducts = all
      .filter((p) => !p.isB2BOnly && p.stock > 0)
      // De menor a mayor precio: se busca que sumar una pieza más sea una
      // decisión pequeña. Se piden 12 y no 10 porque el cliente descarta
      // después las que ya tenga en el carrito.
      .sort((a, b) => effectivePrice(a) - effectivePrice(b))
      .slice(0, 12);
  } catch (error) {
    // Sin sugerencias el carrito funciona igual: el carrusel simplemente no se
    // muestra. No es motivo para tumbar la página donde la gente va a pagar.
    console.error("No se pudieron cargar las sugerencias del carrito", error);
  }

  return <CartView crossSellProducts={crossSellProducts} />;
}
