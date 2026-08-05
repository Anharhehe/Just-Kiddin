import { notFound } from "next/navigation";
import { products } from "../../../../data/demo";
import ProductDetailPage from "../../../../components/ProductDetailPage";

export function generateStaticParams() {
  return products
    .filter((p) => p.ageGroup === "newborn" && p.gender === "girl" && p.tags.includes("receiving-blankets"))
    .map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = products.find((p) => p.id === id);
  if (!product) return notFound();
  return (
    <ProductDetailPage
      product={product}
      backHref="/newborns/girls/receiving-blankets"
      backLabel="Receiving Blankets"
      parentLabel="Girls"
      grandParentLabel="Newborns"
      grandParentHref="/newborns"
    />
  );
}
