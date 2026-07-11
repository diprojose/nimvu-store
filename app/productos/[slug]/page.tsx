import { Metadata } from 'next';
import { products, FrontendProduct } from "@/lib/api";
import ProductDetails from "@/components/custom/ProductDetails";
import RelatedProducts from "@/components/custom/RelatedProducts";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await products.retrieve(slug);

    const title = product.title;
    const description = product.description || `Compra ${product.title} en Nimvu Store.`;
    const images = product.images.map(img => img.url);

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        url: `https://nimvu.store/productos/${slug}`, // Assuming base URL, good practice
        siteName: 'Nimvu Store',
        images: [
          {
            url: images[0], // Primary image
            width: 800,
            height: 600,
            alt: title,
          },
          ...images.slice(1).map(url => ({ url, alt: title })),
        ],
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
      title: "Producto no encontrado | Nimvu Store",
      description: "El producto que buscas no existe o ha sido movido.",
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
      <ProductDetails product={product} />
      <RelatedProducts products={related} />
    </>
  );
}