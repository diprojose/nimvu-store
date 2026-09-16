import { Metadata } from 'next';
import { products, FrontendProduct } from "@/lib/api";
import ProductDetails from "@/components/custom/ProductDetails";
import RelatedProducts from "@/components/custom/RelatedProducts";
import ProductReviews from "@/components/custom/reviews/ProductReviews";
import { notFound } from "next/navigation";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";
import { buildProductJsonLd, buildBreadcrumbJsonLd } from "@/lib/product-jsonld";

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
      <div className="mx-auto max-w-350 px-5 md:px-16">
        <ProductReviews
          productId={product.id}
          productSlug={product.slug}
          ratingAverage={product.ratingAverage}
          ratingCount={product.ratingCount}
        />
      </div>
      <RelatedProducts products={related} />
    </>
  );
}
