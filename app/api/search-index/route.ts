import { NextResponse } from 'next/server';
import { products as productsApi } from '@/lib/api';
import { toSearchItem } from '@/lib/search';

// Se genera en Vercel y se sirve desde su caché: el buscador no despierta al
// backend de Render. La etiqueta 'products' de products.list() lo invalida
// cuando el admin cambia algo, igual que al resto de la tienda.
export const revalidate = 300;

/**
 * Índice del buscador del header: todo el catálogo público (Hogar, Kpop,
 * Gamer) con solo los campos que el panel pinta. El navegador lo pide una vez,
 * al abrir la lupa, y desde ahí busca sin más peticiones.
 */
export async function GET() {
  try {
    const all = await productsApi.list();
    const items = all.filter((p) => !p.isB2BOnly).map(toSearchItem);
    return NextResponse.json(items);
  } catch (error) {
    console.error('No se pudo armar el índice de búsqueda', error);
    // Sin índice el panel muestra "Ver todos los resultados" y la búsqueda
    // completa en /productos?q= sigue funcionando.
    return NextResponse.json([], { headers: { 'Cache-Control': 'no-store' } });
  }
}
