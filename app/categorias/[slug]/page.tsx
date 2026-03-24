import ShopPage from "@/app/productos/page";

export default async function CategoryPage(props: any) {
  // Support for both Next.js 14 and Next.js 15 (where params is a Promise)
  const params = await props.params;
  const slug = params?.slug;

  return <ShopPage initialCategorySlug={slug} />;
}
