import { Metadata } from 'next';
import { products, FrontendProduct } from "@/lib/api";
import ProductDetails from "@/components/custom/ProductDetails";
import RelatedProducts from "@/components/custom/RelatedProducts";
import { notFound } from "next/navigation";
import { SITE_URL, SITE_NAME, absoluteUrl } from "@/lib/seo";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await products.retrieve(slug);

    const title = product.title;
    const description = product.description || `Compra ${product.title} en Nimvu.`;
    const images = product.images.map(img => img.url);
    const url = absoluteUrl(`/productos/${slug}`);

    return {
      title: title,
      description: description,
      alternates: { canonical: `/productos/${slug}` },
      openGraph: {
        title: title,
        description: description,
        url,
        siteName: SITE_NAME,
        // La primera imagen es la principal (la misma que se usa como thumbnail
        // en las tarjetas de catálogo). No se declaran width/height: las fotos
        // reales son verticales o cuadradas (765x1024, 1024x1024, 1600x1600) y
        // anunciar un tamaño fijo hace que los scrapers recorten mal la vista previa.
        images: images.map(url => ({ url, alt: title })),
        locale: 'es_CO',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: title,
        description: description,
        images: images,
      },
    };
  } catch (error) {
    return {
      title: "Producto no encontrado",
      description: "El producto que buscas no existe o ha sido movido.",
      robots: { index: false, follow: true },
    };
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params;
  let product;
  try {
    const response = await products.retrieve(slug);
    product = response.product;
  } catch (error) {
    notFound();
  }

  if (!product) notFound();

  // Productos relacionados para el carrusel "Esto te puede gustar":
  // solo productos del mismo universo, menos el actual, priorizando la misma categoría.
  let related: FrontendProduct[] = [];
  try {
    const universeSlug = product.universe?.slug;
    const all = universeSlug
      ? await products.list({ universeSlug })
      : await products.list();
    related = all.filter((p) => p.id !== product.id && !p.isB2BOnly);

    if (product.category) {
      const categoryId = product.category.id;
      related.sort((a, b) => {
        const aMatch = a.category?.id === categoryId ? 0 : 1;
        const bMatch = b.category?.id === categoryId ? 0 : 1;
        return aMatch - bMatch;
      });
    }

    related = related.slice(0, 12);
  } catch (error) {
    related = [];
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildProductJsonLd(product)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbJsonLd(product)) }}
      />
      <ProductDetails product={product} />
      <RelatedProducts products={related} />
    </>
  );
}

/**
 * Schema.org Product: es lo que permite a Google mostrar precio y disponibilidad
 * en el resultado de búsqueda. El precio efectivo replica la lógica de
 * ProductDetails (el descuento solo aplica si no ha vencido).
 */
function buildProductJsonLd(product: FrontendProduct) {
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
function buildBreadcrumbJsonLd(product: FrontendProduct) {
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