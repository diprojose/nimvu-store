import type { MetadataRoute } from 'next';
import { SITE_URL, absoluteUrl } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Las rutas transaccionales y privadas (/cart, /checkout, /perfil, /order,
        // /b2b, auth) NO se bloquean aquí a propósito: llevan `noindex` en su
        // metadata y Google necesita poder rastrearlas para leer esa etiqueta.
        // Bloquearlas haría que las indexara solo por URL.
        disallow: ['/api/'],
      },
    ],
    sitemap: absoluteUrl('/sitemap.xml'),
    host: SITE_URL,
  };
}
