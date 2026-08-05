import { notFound } from "next/navigation";
import { products } from "../../../../data/demo";
import ProductDetailPage from "../../../../components/ProductDetailPage";

export function generateStaticParams() {
  return products
    .filter((p) => p.ageGroup === "toddler" && p.gender === "boy" && p.tags.includes("trousers"))
    .map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return notFound();
  return (
    <ProductDetailPage
      product={product}
      backHref="/toddlers/boys/trousers"
      backLabel="Trousers"
      parentLabel="Boys"
      grandParentLabel="Toddlers"
      grandParentHref="/toddlers"
    />
  );
}
