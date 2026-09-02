"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Heart } from "lucide-react";
import type { Product } from "../data/demo";
import { useFavourites } from "../hooks/useFavourites";
import { getProductImage } from "../utils/product-image";

type Gender = "boys" | "girls";
type AgeGroup = "newborn" | "toddler";
type SortOption = "Newest" | "Oldest" | "Price: Low to High" | "Price: High to Low";

type FilterOption = {
  label: string;
  ageGroup: AgeGroup;
  gender: Gender;
};

const FONT_HEADING = "'Quicksand', sans-serif";
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

const FILTERS: FilterOption[] = [
  { label: "Boys Newborns", ageGroup: "newborn", gender: "boys" },
  { label: "Girls Newborns", ageGroup: "newborn", gender: "girls" },
  { label: "Boys Toddlers", ageGroup: "toddler", gender: "boys" },
  { label: "Girls Toddlers", ageGroup: "toddler", gender: "girls" },
];

const SORT_OPTIONS: SortOption[] = ["Newest", "Oldest", "Price: Low to High", "Price: High to Low"];

function toSortTimestamp(value: string | Date | undefined) {
  if (!value) return 0;
  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function getProductDate(product: Product) {
  return toSortTimestamp((product as Product & { createdAt?: string | Date }).createdAt);
}

function compareAtPrice(price: number, discountPercent?: number) {
  const dp = Math.max(0, Math.min(100, Number(discountPercent || 0)));
  if (dp <= 0) return price;
  return Math.round(price / (1 - dp / 100));
}

function averageRating(product: any) {
  const reviews: any[] = (product as any).reviews ?? [];
  if (!Array.isArray(reviews) || reviews.length === 0) return { avg: 0, count: 0 };
  const sum = reviews.reduce((s, r) => s + (r?.rating || 0), 0);
  return { avg: sum / reviews.length, count: reviews.length };
}

export default function Under999Page() {
  const [ageGroup, setAgeGroup] = useState<AgeGroup>("newborn");
  const [gender, setGender] = useState<Gender>("boys");
  const [sortBy, setSortBy] = useState<SortOption>("Newest");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { favouriteIds, toggle: toggleFav } = useFavourites();

  const genderKey = gender === "boys" ? "boy" : "girl";

  useEffect(() => {
    const controller = new AbortController();

    async function loadProducts() {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `/api/products?ageGroup=${ageGroup}&active=true`,
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

    return () => controller.abort();
  }, [ageGroup, genderKey]);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      // ageGroup and gender selection applied client-side; include unisex in both boy/girl views
      const matchesAge = product.ageGroup === ageGroup;
      const genderKeyLocal = gender === "boys" ? "boy" : "girl";
      const matchesGender = product.gender === genderKeyLocal || product.gender === "unisex";
      const underLimit = product.price < 1000;
      return matchesAge && matchesGender && underLimit;
    });

    if (sortBy === "Price: Low to High") return filtered.sort((l, r) => l.price - r.price);
    if (sortBy === "Price: High to Low") return filtered.sort((l, r) => r.price - l.price);
    if (sortBy === "Oldest") return filtered.sort((l, r) => getProductDate(l) - getProductDate(r));
    return filtered.sort((l, r) => getProductDate(r) - getProductDate(l));
  }, [products, sortBy, ageGroup, gender]);

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: FONT_HEADING }}>
      <main className={`${CONTAINER} py-8 sm:py-10`}>
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f836f]">Under PKR 1000</p>
            <h1 className="mt-2 text-3xl font-extrabold text-[#293A55] sm:text-4xl">Our Special Budget Friendly Picks </h1>
          </div>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="cursor-pointer appearance-none rounded-2xl border border-[#e6ddcd] bg-white py-2 pl-4 pr-9 text-sm font-medium text-[#293A55] outline-none"
              style={{ fontFamily: FONT_HEADING }}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a8071]" />
          </div>
        </div>

        <div className="mb-8 flex flex-wrap gap-3">
          {FILTERS.map((filter) => {
            const active = filter.ageGroup === ageGroup && filter.gender === gender;

            return (
              <button
                key={`${filter.label}-desktop`}
                type="button"
                onClick={() => {
                  setAgeGroup(filter.ageGroup);
                  setGender(filter.gender);
                }}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-[#293A55] bg-[#293A55] text-white" : "border-[#e6ddcd] bg-white text-[#293A55] hover:bg-black/[0.03]"}`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <p className="text-sm text-[#8a8071]">Loading products...</p>
        ) : error ? (
          <p className="text-sm text-[#b91c1c]">{error}</p>
        ) : visibleProducts.length === 0 ? (
          <div className="rounded-[2rem] border border-dashed border-[#d9c8ae] bg-white px-6 py-14 text-center shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
            <h2 className="text-2xl font-extrabold text-[#293A55]">No products under PKR 1000 yet</h2>
            
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-12">
            {visibleProducts.map((product) => {
              const liked = favouriteIds.has(product.id);

              return (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="group flex cursor-pointer flex-col items-center"
                >
                  <div className="relative aspect-square w-11/12 overflow-hidden rounded-xl border border-[#eee1cd] bg-[#F3E9DC] shadow-[0_4px_12px_rgba(41,58,85,0.06)] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_10px_22px_rgba(41,58,85,0.14)]">
                      <Image
                        src={getProductImage(product)}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 40vw, (max-width: 1024px) 20vw, 16vw"
                      />

                      {/* discount badge */}
                      {product.discountPercent ? (
                        <div className="absolute left-2 top-2 rounded-full bg-[#E8735F] px-3 py-1 text-xs font-bold text-white">
                          {product.discountPercent}% OFF
                        </div>
                      ) : null}

                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          void toggleFav(product);
                        }}
                        className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform hover:scale-105"
                        aria-label="Add to wishlist"
                      >
                        <Heart className={`h-3.5 w-3.5 ${liked ? "fill-red-500 text-red-500" : "text-[#293A55]"}`} />
                      </button>

                      {!product.inStock && (
                        <span className="absolute left-2 top-2 rounded-full bg-black/70 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white">
                          Out of stock
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex w-11/12 flex-col items-start text-left">
                      <p className="truncate text-lg font-bold text-[#293A55]">{product.name}</p>
                      <p className="mt-1 text-2xl font-extrabold text-[#E8735F]">PKR {product.price.toLocaleString()}</p>
                      <p className="text-sm text-[#9a8f7f] line-through">PKR {compareAtPrice(product.price, (product as any).discountPercent).toLocaleString()}</p>
                      <div className="mt-1 flex items-center gap-2 text-sm text-[#5c5445]">
                        <span className="flex items-center gap-1">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold">{Number(averageRating(product).avg).toFixed(1)}</span>
                        </span>
                        <span className="text-[#7A6F5D]">({averageRating(product).count})</span>
                      </div>
                    </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}