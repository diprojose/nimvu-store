import { Metadata } from 'next';
import { products } from "@/lib/api";
import ProductDetails from "@/components/custom/ProductDetails";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { product } = await products.retrieve(slug);
    return {
      title: `${product.title} | Nimvu Store`,
      description: product.description || `Compra ${product.title} en Nimvu Store.`,
      openGraph: {
        title: product.title,
        description: product.description || "",
        images: product.images.map(img => img.url),
      },
    };
  } catch (error) {
    return {
      title: "Producto no encontrado | Nimvu Store",
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

  return <ProductDetails product={product} />;
}