import type { FrontendProduct } from "@/lib/api";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/seo";

/**
 * Datos estructurados de la ficha de producto.
 *
 * Viven aquí y no dentro de `app/productos/[slug]/page.tsx` porque Next
 * restringe qué se puede exportar desde un archivo de página, y sin poder
 * exportarlos no habría forma de probarlos. Son la pieza que decide qué muestra
 * Google en el resultado de búsqueda, así que conviene tenerlos cubiertos.
 */

/**
 * Schema.org Product: es lo que permite a Google mostrar precio y
 * disponibilidad en el resultado de búsqueda. El precio efectivo replica la
 * lógica de ProductDetails (el descuento solo aplica si no ha vencido).
 */
export function buildProductJsonLd(product: FrontendProduct) {
  const discountIsLive =
    !!product.discountPrice &&
    product.discountPrice > 0 &&
    product.discountPrice < product.price &&
    (!product.discountEndDate || new Date(product.discountEndDate) >= new Date());
  const price = discountIsLive ? product.discountPrice! : product.price;
  const url = absoluteUrl(`/productos/${product.slug}`);

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: product.description || product.longDescription || product.title,
    image: product.images.map((img) => img.url),
    sku: product.variants[0]?.sku || product.id,
    url,
    brand: { '@type': 'Brand', name: SITE_NAME },
    ...(product.category ? { category: product.category.name } : {}),
    // Solo se declara con reseñas reales detrás. Un aggregateRating en cero, o
    // inventado, es motivo de penalización en Google — no un adorno vacío.
    ...(product.ratingCount > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.ratingAverage.toFixed(1),
            reviewCount: product.ratingCount,
            bestRating: 5,
            worstRating: 1,
          },
        }
      : {}),
    offers: {
      '@type': 'Offer',
      url,
      priceCurrency: 'COP',
      price: String(price),
      availability:
        product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: SITE_NAME },
      ...(discountIsLive && product.discountEndDate
        ? { priceValidUntil: product.discountEndDate.slice(0, 10) }
        : {}),
    },
  };
}

/** Migas de pan: Google las usa para reemplazar la URL cruda en el resultado. */
export function buildBreadcrumbJsonLd(product: FrontendProduct) {
  const items: Array<{ name: string; path: string }> = [
    { name: 'Inicio', path: '/' },
    { name: 'Productos', path: '/productos' },
  ];

  if (product.category) {
    const universeSlug = product.universe?.slug?.toLowerCase();
    items.push({
      name: product.category.name,
      path:
        universeSlug && universeSlug !== 'hogar'
          ? `/${universeSlug}/categorias/${product.category.slug}`
          : `/categorias/${product.category.slug}`,
    });
  }

  items.push({ name: product.title, path: `/productos/${product.slug}` });

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
