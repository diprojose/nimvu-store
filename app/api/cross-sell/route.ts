import { NextResponse } from 'next/server';
import { products as productsApi, FrontendProduct } from '@/lib/api';

const MAX_SUGERENCIAS = 12;

// Dentro del universo del cliente se permite más repetición de categoría: a
// quien compra un soporte de lightstick, ver los de los otros miembros SÍ le
// sirve — es la línea de producto, no monotonía. Fuera de su universo el tope
// es estricto para que el relleno no se coma la tira.
const MAX_POR_CATEGORIA_RELEVANTE = 4;
const MAX_POR_CATEGORIA_RELLENO = 2;


const effectivePrice = (p: FrontendProduct) =>
  p.discountPrice && p.discountPrice > 0 && p.discountPrice < p.price
    ? p.discountPrice
    : p.price;

/**
 * Recorre los candidatos en orden y se queda con los primeros, sin dejar que
 * una sola categoría cope la tira. Lo que se descarta se devuelve aparte para
 * poder rellenar: es preferible una tira completa a una a medias.
 */
const limitarPorCategoria = (candidatos: FrontendProduct[], tope: number) => {
  const usados = new Map<string, number>();
  const elegidos: FrontendProduct[] = [];
  const descartados: FrontendProduct[] = [];

  for (const p of candidatos) {
    const cat = p.category?.id ?? 'sin-categoria';
    const n = usados.get(cat) ?? 0;
    if (n < tope) {
      usados.set(cat, n + 1);
      elegidos.push(p);
    } else {
      descartados.push(p);
    }
  }

  return { elegidos, descartados };
};

/**
 * Sugerencias para el carrito ("Completa tu pedido").
 *
 * Recibe en `?ids=` los productos que el cliente ya lleva. Con eso resuelve a
 * qué universos pertenecen (Hogar / Kpop / Gamer) y prioriza piezas de esos
 * mismos universos: a quien está armando su comedor no se le ofrece un soporte
 * de lightstick. Los universos se resuelven aquí y no en el navegador porque el
 * carrito guarda solo id, título y precio — no sabe de qué universo es nada.
 *
 * Existe como endpoint y no como prop del layout para no meter estos productos
 * en el payload de todas las páginas: `products.list()` trae el catálogo
 * completo y aquí solo salen los campos que la tarjeta necesita.
 */
export async function GET(request: Request) {
  try {
    const idsParam = new URL(request.url).searchParams.get('ids') ?? '';
    const enCarrito = new Set(idsParam.split(',').filter(Boolean));

    const all = await productsApi.list();

    // Universos presentes en el carrito.
    const universos = new Set(
      all
        .filter((p) => enCarrito.has(p.id))
        .map((p) => p.universe?.slug)
        .filter((slug): slug is string => !!slug),
    );

    const disponibles = all
      // Se filtra por el stock del producto base porque es contra ese que se
      // agrega desde la tira: sin variante, el backend descuenta `product.stock`.
      .filter((p) => !p.isB2BOnly && p.stock > 0 && !enCarrito.has(p.id))
      // De menor a mayor precio: sumar una pieza más debe sentirse una decisión
      // pequeña, no una segunda compra.
      .sort((a, b) => effectivePrice(a) - effectivePrice(b));

    // Primero el mismo universo; el resto queda de relleno por si no alcanza
    // (catálogo corto, o carrito vacío en la primera apertura del drawer).
    const mismoUniverso = universos.size
      ? disponibles.filter((p) => p.universe?.slug && universos.has(p.universe.slug))
      : [];
    const otros = universos.size
      ? disponibles.filter((p) => !p.universe?.slug || !universos.has(p.universe.slug))
      : disponibles;

    const relevantes = limitarPorCategoria(mismoUniverso, MAX_POR_CATEGORIA_RELEVANTE);

    // Si sabemos en qué universo anda el cliente NUNCA se rellena con otros,
    // ni siquiera si su universo se queda corto por falta de stock: a quien
    // está armando su comedor no le puede salir un soporte de BTS. Una tira
    // corta y toda pertinente vende más que una larga a medias, y así la regla
    // no se rompe sola el día que se agote el inventario de una línea.
    const relleno = universos.size
      ? { elegidos: [] as FrontendProduct[], descartados: [] as FrontendProduct[] }
      : limitarPorCategoria(otros, MAX_POR_CATEGORIA_RELLENO);

    const suggestions = [
      ...relevantes.elegidos,
      ...relleno.elegidos,
      ...relevantes.descartados,
      ...relleno.descartados,
    ]
      .slice(0, MAX_SUGERENCIAS)
      .map((p) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        thumbnail: p.thumbnail,
        price: p.price,
        discountPrice: p.discountPrice,
        discountEndDate: p.discountEndDate,
        category: p.category ? { name: p.category.name } : undefined,
        universe: p.universe ? { slug: p.universe.slug } : undefined,
      }));

    return NextResponse.json(suggestions);
  } catch (error) {
    // Sin sugerencias el carrito funciona igual. Nunca romper el carrito por esto.
    console.error('No se pudieron cargar las sugerencias del carrito', error);
    return NextResponse.json([]);
  }
}
