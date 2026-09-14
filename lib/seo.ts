/**
 * Constantes y helpers de SEO compartidos por metadata, sitemap, robots y JSON-LD.
 * El dominio canónico vive aquí para que no vuelva a divergir entre archivos.
 */
export const SITE_URL = 'https://www.somosnimvu.com';
export const SITE_NAME = 'Nimvu';
export const SITE_DESCRIPTION =
  'Diseño que acompaña tus momentos. Piezas de diseño impresas en 3D para tu hogar: lámparas, materas, organizadores y más.';

/** Construye una URL absoluta a partir de una ruta interna ("/productos/x"). */
export const absoluteUrl = (path = '/') =>
  `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`;

/**
 * Metadata para páginas que no deben indexarse (carrito, checkout, cuenta, B2B).
 * No aportan nada en búsqueda y diluyen el crawl budget.
 */
export const NO_INDEX = {
  robots: { index: false, follow: false },
} as const;
