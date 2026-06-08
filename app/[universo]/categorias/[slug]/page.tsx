import { notFound, redirect } from "next/navigation";
import { ShopPage } from "@/app/productos/page";
import { universes as universesApi } from "@/lib/api";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ universo: string; slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { universo, slug } = await params;
  try {
    const u = await universesApi.retrieve(universo);
    const cat = u.categories?.find((c) => c.slug === slug);
    if (cat) {
      return {
        title: `${cat.name} · ${u.name} | Nimvu`,
        description: cat.description ?? `Categoría ${cat.name} del universo ${u.name}.`,
      };
    }
    return { title: `${u.name} | Nimvu` };
  } catch {
    return { title: "Nimvu" };
  }
}

export default async function UniverseCategoryPage({ params }: PageProps) {
  const { universo, slug } = await params;

  // Canonical: hogar lives at /categorias/[slug], not /hogar/categorias/[slug]
  if (universo.toLowerCase() === "hogar") {
    redirect(`/categorias/${slug}`);
  }

  let universe;
  try {
    universe = await universesApi.retrieve(universo);
  } catch {
    notFound();
  }

  if (!universe || !universe.isActive || universe.comingSoon) {
    notFound();
  }

  return ShopPage({ initialCategorySlug: slug, universeSlug: universe.slug });
}
