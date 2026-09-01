import { headers } from "next/headers";
import { notFound } from "next/navigation";
import ProductDetailPage from "../../components/ProductDetailPage";
import type { Product } from "../../data/demo";

async function getAppOrigin() {
  const requestHeaders = await Promise.resolve(headers());
  const forwardedHost = requestHeaders.get("x-forwarded-host");
  const host = forwardedHost ?? requestHeaders.get("host");
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";

  return host ? `${protocol}://${host}` : "http://localhost:3000";
}

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
  const appOrigin = await getAppOrigin();

  const response = await fetch(`${appOrigin}/api/products/${encodeURIComponent(id)}`, {
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
        ? `${appOrigin}/api/products?ageGroup=${encodeURIComponent(product.ageGroup)}&gender=${encodeURIComponent(product.gender)}&active=true`
        : `${appOrigin}/api/products?ageGroup=${encodeURIComponent(product.ageGroup)}&active=true`;

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
