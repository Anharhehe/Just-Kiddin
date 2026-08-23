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
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

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
          `${API_BASE_URL}/api/products?ageGroup=toddler&gender=${genderKey}`,
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
    let filtered = products.filter(
      (p) =>
        p.ageGroup === "toddler" &&
        p.gender === genderKey &&
        (p.category ? categorySlug(p.category) === activeCategory : false)
    );

    if (sortBy === "Price: Low to High") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeCategory, genderKey, products, sortBy]);

  return (
    <div className="min-h-screen bg-[0000]" style={{ fontFamily: FONT_HEADING }}>


      {/* ---------------------------------------------------------- */}
      {/*  Category strip — rounded top, skin gradient dark→light,     */}
      {/*  single line, light line separating it from the listing      */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-t-[2.5rem] border-b border-[#E6D9C4] bg-gradient-to-b from-[#F8ECDD] to-[#FBF2E9]">
        <div className={`${CONTAINER} py-8`}>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-6 py-3">
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
                    className={`whitespace-nowrap text-sm ${
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
      {/*  Body: filters + product grid — back to skin background      */}
      {/* ---------------------------------------------------------- */}
      <div className="bg-[0000]">
        <div className={`${CONTAINER} grid grid-cols-1 gap-10 py-10 md:grid-cols-[180px_1fr]`}>
          <aside className="space-y-5 border-b border-[#E6D9C4] pb-5 md:border-b-0 md:border-r md:pr-8 md:pb-0">
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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
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

            {loading ? (
              <p className="text-sm text-[#8a8071]">Loading products from the database...</p>
            ) : error ? (
              <p className="text-sm text-[#b91c1c]">{error}</p>
            ) : visibleProducts.length === 0 ? (
              <p className="text-sm text-[#8a8071]">No products yet in this category.</p>
            ) : (
              <div className="grid grid-cols-2 gap-15 sm:grid-cols-3">
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

                      <p className="mt-3 text-base font-bold text-[#293A55] items-center text-center truncate" title={product.name}>
                        {product.name}
                      </p>
                      <p className="text-sm font-medium text-[#5c5445] items-center text-center">
                        PKR {product.price.toLocaleString()}
                      </p>
                    </Link>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}