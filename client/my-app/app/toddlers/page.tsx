"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Heart, ChevronDown } from "lucide-react";
import type { Product } from "../data/demo";
import { useFavourites } from "../hooks/useFavourites";
import { getProductImage } from "../utils/product-image";

/* ------------------------------------------------------------------ */
/*  Types & static config                                             */
/* ------------------------------------------------------------------ */

type Gender = "boys" | "girls";

type Category = {
  slug: string;
  label: string;
  image: string;
};

const FONT_HEADING = "'Quicksand', sans-serif";

const CATEGORIES: Category[] = [
  { slug: "co-ords", label: "Co ords", image: "/demo.png" },
  { slug: "sweat-shirts", label: "Sweat shirts", image: "/demo.png" },
  { slug: "trousers", label: "Trousers", image: "/demo.png" },
];

// Tight, consistent page gutter reused across every section
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

function categorySlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ToddlersPage() {
  const [gender, setGender] = useState<Gender>("boys");
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0].slug);
  const [sortBy, setSortBy] = useState("Newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favouriteIds, toggle: toggleFav } = useFavourites();

  // demo.ts uses "boy"/"girl", page state uses "boys"/"girls"
  const genderKey = gender === "boys" ? "boy" : "girl";

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/products?ageGroup=toddler&active=true`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error("Failed to load products");
        }

        const payload = (await response.json()) as { data?: { products?: Product[] } };
        if (!controller.signal.aborted) {
          setProducts(payload.data?.products ?? []);
        }
      } catch (fetchError) {
        if (!controller.signal.aborted) {
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load products");
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadProducts();

    return () => {
      controller.abort();
    };
  }, [genderKey]);

  const visibleProducts = useMemo(() => {
    const activeCategoryLabel = CATEGORIES.find((category) => category.slug === activeCategory)?.label ?? "";

    let filtered = products.filter((p) => {
      const matchesAge = p.ageGroup === "toddler";
      const genderVal = String(p.gender ?? "");
      // @ts-ignore - allow 'unisex' string in runtime data even if TS types differ
      const matchesGender = genderVal === genderKey || genderVal === "unisex";
      const matchesCategory = p.category ? categorySlug(p.category) === activeCategory : false;
      const matchesLabel = activeCategoryLabel ? (p.category ?? "").trim().toLowerCase() === activeCategoryLabel.trim().toLowerCase() : true;
      return matchesAge && matchesGender && matchesCategory && matchesLabel;
    });

    if (sortBy === "Price: Low to High") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeCategory, genderKey, products, sortBy]);

  return (
    <div className="min-h-screen bg-[#0000]" style={{ fontFamily: FONT_HEADING }}>

      {/* ---------------------------------------------------------- */}
      {/*  Category strip — DESKTOP: circular avatars, unchanged       */}
      {/* ---------------------------------------------------------- */}
      <div className="hidden rounded-t-[2.5rem] border-b border-[#E6D9C4] bg-gradient-to-b from-[#F8ECDD] to-[#FBF2E9] md:block">
        <div className={`${CONTAINER} py-8`}>
          <div className="flex flex-wrap justify-center gap-x-8 gap-y-6 py-3">
            {CATEGORIES.map((cat) => {
              const active = cat.slug === activeCategory;

              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className="flex shrink-0 cursor-pointer flex-col items-center gap-3"
                >
                  <span
                    className={`flex h-20 w-20 overflow-hidden rounded-full border-2 bg-white shadow-[0_12px_26px_rgba(41,58,85,0.12)] transition-all ${
                      active ? "border-[#293A55] ring-2 ring-[#293A55]/20 ring-offset-2" : "border-[#efe0cf]"
                    }`}
                  >
                    <img src={cat.image} alt={cat.label} className="h-full w-full object-cover" />
                  </span>

                  <span
                    className={`text-center text-sm leading-tight ${
                      active ? "font-semibold text-[#293A55]" : "text-[#8a8071]"
                    }`}
                  >
                    {cat.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  Category strip — MOBILE: horizontal scrollable chip menu    */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-t-[2rem] border-b border-[#E6D9C4] bg-gradient-to-b from-[#F8ECDD] to-[#FBF2E9] md:hidden">
        <div className="px-4 pb-4 pt-6">
          <div
            className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {CATEGORIES.map((cat) => {
              const active = cat.slug === activeCategory;

              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => setActiveCategory(cat.slug)}
                  className={`flex shrink-0 cursor-pointer items-center gap-2 rounded-full border py-2 pl-2 pr-4 text-sm font-medium transition-colors ${
                    active
                      ? "border-[#293A55] bg-[#293A55] text-white"
                      : "border-[#e6ddcd] bg-white text-[#5c5445]"
                  }`}
                >
                  <span className="flex h-7 w-7 shrink-0 overflow-hidden rounded-full bg-[#F3E9DC]">
                    <img src={cat.image} alt="" className="h-full w-full object-cover" />
                  </span>
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  Body: filters + product grid — back to skin background      */}
      {/* ---------------------------------------------------------- */}
      <div className="bg-[0000]">
        <div className={`${CONTAINER} py-6 md:py-10`}>

          {/* ── MOBILE filter bar: gender segmented control + sort ── */}
          <div className="mb-6 flex items-center justify-between gap-3 md:hidden">
            <div className="inline-flex rounded-full border border-[#e6ddcd] bg-white p-1">
              {(["boys", "girls"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-colors ${
                    gender === g ? "bg-[#293A55] text-white" : "text-[#5c5445]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="cursor-pointer appearance-none rounded-full border border-[#e6ddcd] bg-white py-2 pl-4 pr-9 text-sm font-medium text-[#293A55] outline-none"
                style={{ fontFamily: FONT_HEADING }}
              >
                <option>Newest</option>
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8071]" />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-[180px_1fr]">
            {/* ── DESKTOP sidebar: unchanged ── */}
            <aside className="hidden space-y-5 border-b border-[#E6D9C4] pb-5 md:block md:border-b-0 md:border-r md:pr-8 md:pb-0">
              <p className="text-xs font-bold uppercase tracking-wide text-[#a89d8b]">Gender</p>
              <div className="space-y-3">
                {(["boys", "girls"] as Gender[]).map((g) => (
                  <label key={g} className="flex cursor-pointer items-center gap-3 text-sm font-medium text-[#5c5445]">
                    <input
                      type="checkbox"
                      checked={gender === g}
                      onChange={() => setGender(g)}
                      className="h-4 w-4 cursor-pointer rounded border-[#d8cdb8] accent-[#293A55]"
                    />
                    <span className={gender === g ? "text-[#293A55]" : "text-[#5c5445]"}>
                      {g}
                    </span>
                  </label>
                ))}
              </div>
            </aside>

            <section>
              {/* ── DESKTOP results row: unchanged ── */}
              <div className="mb-6 hidden flex-wrap items-center justify-between gap-3 md:flex">
                <p className="text-sm text-[#8a8071]">
                  Showing 1 - {visibleProducts.length} of {visibleProducts.length} products
                </p>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="cursor-pointer appearance-none rounded-2xl border border-[#e6ddcd] bg-white py-2 pl-4 pr-9 text-sm font-medium text-[#293A55] outline-none"
                    style={{ fontFamily: FONT_HEADING }}
                  >
                    <option>Newest</option>
                    <option>Price: Low to High</option>
                    <option>Price: High to Low</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8071]" />
                </div>
              </div>

              {/* ── MOBILE result count ── */}
              <p className="mb-4 text-sm text-[#8a8071] md:hidden">
                Showing {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"}
              </p>

              {loading ? (
                <p className="text-sm text-[#8a8071]">Loading products...</p>
              ) : error ? (
                <p className="text-sm text-[#b91c1c]">{error}</p>
              ) : visibleProducts.length === 0 ? (
                <p className="text-sm text-[#8a8071]">No products yet in this category.</p>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-15">
                  {visibleProducts.map((product) => {
                    const liked = favouriteIds.has(product.id);
                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.id}`}
                        className="group block cursor-pointer"
                      >
                        <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F3E9DC]">
                          <Image
                            src={getProductImage(product)}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          />

                          {product.discountPercent ? (
                            <div className="absolute left-3 top-3 rounded-full bg-[#E8735F] px-3 py-1 text-xs font-bold text-white">
                              {product.discountPercent}% OFF
                            </div>
                          ) : null}

                          <button
                            type="button"
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); void toggleFav(product); }}
                            className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm"
                            aria-label="Add to wishlist"
                          >
                            <Heart
                              className={`h-4 w-4 ${
                                liked
                                  ? "fill-red-500 text-red-500"
                                  : "text-[#293A55]"
                              }`}
                            />
                          </button>
                          {!product.inStock && (
                            <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                              Out of stock
                            </span>
                          )}
                        </div>

                        <div className="mt-3 text-left">
                          <p className="text-base font-bold text-[#293A55] truncate" title={product.name}>{product.name}</p>
                          <p className="mt-1 text-2xl font-extrabold text-[#E8735F]">PKR {product.price.toLocaleString()}</p>
                          <p className="text-sm text-[#9a8f7f] line-through">PKR {Math.round((product.price) / (1 - ((product as any).discountPercent || 0)/100)).toLocaleString()}</p>
                          <div className="mt-1 flex items-center gap-2 text-sm text-[#5c5445]">
                            <span className="flex items-center gap-1"><span className="text-yellow-500">★</span><span className="font-semibold">{(() => { const rs = (product as any).reviews ?? []; if (!Array.isArray(rs) || rs.length===0) return '0.0'; const s = rs.reduce((a:any,b:any)=>a+(b?.rating||0),0); return (s/rs.length).toFixed(1); })()}</span></span>
                            <span className="text-[#7A6F5D]">({((product as any).reviews ?? []).length || 0})</span>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}