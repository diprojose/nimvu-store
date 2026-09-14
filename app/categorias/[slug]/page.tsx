import { ShopPage } from "@/app/productos/page";
import { categories as categoriesApi } from "@/lib/api";
import type { Metadata } from "next";

export async function generateMetadata(props: any): Promise<Metadata> {
  const params = await props.params;
  const slug: string = params?.slug;
  try {
    const cats = await categoriesApi.list({ universeSlug: "hogar" });
    const cat = cats.find((c) => c.slug === slug);
    if (cat) {
      return {
        title: cat.name,
        description:
          cat.description ?? `Descubre las piezas de ${cat.name} diseñadas e impresas en 3D por Nimvu.`,
        alternates: { canonical: `/categorias/${slug}` },
      };
    }
  } catch {
    // Si el backend falla, caemos al título genérico en vez de romper la página.
  }
  return { title: "Productos", alternates: { canonical: `/categorias/${slug}` } };
}

export default async function CategoryPage(props: any) {
  // Support for both Next.js 14 and Next.js 15 (where params is a Promise)
  const params = await props.params;
  const slug = params?.slug;

  // Legacy /categorias/[slug] is scoped to the hogar universe so it doesn't
  // accidentally include identically-named categories from other universes.
  return ShopPage({ initialCategorySlug: slug, universeSlug: "hogar" });
}
