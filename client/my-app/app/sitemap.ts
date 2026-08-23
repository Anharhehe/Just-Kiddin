import type { MetadataRoute } from "next";
import { products } from "./data/demo";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_URL ??
    "justkidin.store";

  const normalized = configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")
    ? configuredUrl
    : `https://${configuredUrl}`;

  return normalized.replace(/\/$/, "");
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();
  const now = new Date();

  const staticRoutes = [
    "/",
    "/about",
    "/accessories",
    "/contactus",
    "/faqs",
    "/newborns",
    "/reviews",
    "/returns",
    "/toddlers",
    "/tos",
    "/under999",
  ];

  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: product.updatedAt ? new Date(product.updatedAt) : now,
  }));

  return [...staticEntries, ...productEntries];
}