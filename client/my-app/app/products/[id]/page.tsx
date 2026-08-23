import { notFound } from "next/navigation";
import ProductDetailPage from "../../components/ProductDetailPage";
import type { Product } from "../../data/demo";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

function categorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const response = await fetch(`${API_BASE_URL}/api/products/${encodeURIComponent(id)}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    return notFound();
  }

  const payload = (await response.json()) as { data?: { product?: Product } };
  const product = payload.data?.product;

  if (!product) {
    return notFound();
  }

  const ageGroupLabel = product.ageGroup === "newborn" ? "Newborns" : product.ageGroup === "toddler" ? "Toddlers" : "Accessories";
    const genderLabel = product.gender === "boy" ? "Boys" : product.gender === "girl" ? "Girls" : "Accessories";
  const categoryPath = product.category ? categorySlug(product.category) : "";

  let relatedProducts: Product[] = [];

  try {
      const relatedUrl = product.gender
        ? `${API_BASE_URL}/api/products?ageGroup=${encodeURIComponent(product.ageGroup)}&gender=${encodeURIComponent(product.gender)}&active=true`
        : `${API_BASE_URL}/api/products?ageGroup=${encodeURIComponent(product.ageGroup)}&active=true`;

      const relatedResponse = await fetch(relatedUrl, { cache: "no-store" });

    if (relatedResponse.ok) {
      const relatedPayload = (await relatedResponse.json()) as { data?: { products?: Product[] } };
      relatedProducts = (relatedPayload.data?.products ?? [])
        .filter((item) => item.id !== product.id && (item.category ? categorySlug(item.category) : "") === categoryPath)
        .slice(0, 4);
    }
  } catch {
    relatedProducts = [];
  }

  return (
    <ProductDetailPage
      product={product}
      backHref={`/${product.ageGroup === "newborn" ? "newborns" : "toddlers"}`}
      backLabel={product.category ?? "Accessories"}
      parentLabel={genderLabel}
      grandParentLabel={ageGroupLabel}
      grandParentHref={`/${product.ageGroup === "newborn" ? "newborns" : product.ageGroup === "toddler" ? "toddlers" : "accessories"}`}
      relatedProducts={relatedProducts}
      relatedHrefBase="/products"
    />
  );
}
