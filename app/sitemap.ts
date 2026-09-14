import type { MetadataRoute } from 'next';
import {
  products as productsApi,
  universes as universesApi,
  collections as collectionsApi,
} from '@/lib/api';
import { absoluteUrl } from '@/lib/seo';

// El sitemap se regenera junto con el resto del contenido cacheado (5 min).
export const revalidate = 300;

/** Rutas estáticas indexables, con su prioridad relativa. */
const STATIC_ROUTES: Array<{ path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'daily' },
  { path: '/productos', priority: 0.9, changeFrequency: 'daily' },
  { path: '/nosotros', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/contacto', priority: 0.5, changeFrequency: 'yearly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/politicas-de-devoluciones', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/politicas-de-privacidad', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terminos-de-uso', priority: 0.3, changeFrequency: 'yearly' },
];

const toDate = (value?: string | null) => (value ? new Date(value) : new Date());

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = STATIC_ROUTES.map(({ path, priority, changeFrequency }) => ({
    url: absoluteUrl(path),
    lastModified: new Date(),
    changeFrequency,
    priority,
  }));

  // Cada fuente se pide por separado: si el backend falla en una, el sitemap
  // sigue sirviéndose con el resto en vez de devolver 500.
  const [universesResult, productsResult, collectionsResult] = await Promise.allSettled([
    universesApi.list({ activeOnly: true }),
    productsApi.list(),
    collectionsApi.list(),
  ]);

  if (universesResult.status === 'fulfilled') {
    for (const universe of universesResult.value) {
      if (universe.comingSoon) continue;

      // "hogar" es el universo por defecto: vive en / y /categorias/[slug],
      // las rutas /hogar/* redirigen, así que no se listan.
      const isHome = universe.slug.toLowerCase() === 'hogar';

      if (!isHome) {
        entries.push({
          url: absoluteUrl(`/${universe.slug}`),
          lastModified: toDate(universe.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }

      for (const category of universe.categories ?? []) {
        entries.push({
          url: isHome
            ? absoluteUrl(`/categorias/${category.slug}`)
            : absoluteUrl(`/${universe.slug}/categorias/${category.slug}`),
          lastModified: toDate(category.updatedAt),
          changeFrequency: 'weekly',
          priority: 0.7,
        });
      }
    }
  } else {
    console.error('sitemap: failed to load universes', universesResult.reason);
  }

  if (productsResult.status === 'fulfilled') {
    for (const product of productsResult.value) {
      if (!product.slug || product.isB2BOnly) continue;
      entries.push({
        url: absoluteUrl(`/productos/${product.slug}`),
        lastModified: toDate(product.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    }
  } else {
    console.error('sitemap: failed to load products', productsResult.reason);
  }

  if (collectionsResult.status === 'fulfilled') {
    for (const collection of collectionsResult.value) {
      if (!collection.slug || !collection.isActive) continue;
      entries.push({
        url: absoluteUrl(`/coleccion/${collection.slug}`),
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  } else {
    console.error('sitemap: failed to load collections', collectionsResult.reason);
  }

  return entries;
}
