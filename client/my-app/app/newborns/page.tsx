"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Heart,
  ChevronDown,
  ChevronUp,
  Baby,
  Moon,
  Layers,
  Bed,
  Hand,
  Crown,
  Shirt,
  Footprints,
  LayoutGrid,
  Snowflake,
  Droplet,
  CircleDot,
  Package,
  Gift,
} from "lucide-react";
import { products as demoProducts } from "../data/demo";
import { useFavourites } from "../hooks/useFavourites";

/* ------------------------------------------------------------------ */
/*  Types & static config                                             */
/* ------------------------------------------------------------------ */

type Gender = "boys" | "girls";

type Category = {
  slug: string;
  label: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
};

const FONT_HEADING = "'Baloo 2', cursive";

const CATEGORIES: Category[] = [
  { slug: "bodysuits", label: "Bodysuits", icon: Baby, iconBg: "bg-sky-100", iconColor: "text-sky-600" },
  { slug: "sleepsuits", label: "Sleepsuits", icon: Moon, iconBg: "bg-indigo-100", iconColor: "text-indigo-600" },
  { slug: "swaddles", label: "Swaddles", icon: Layers, iconBg: "bg-purple-100", iconColor: "text-purple-600" },
  { slug: "blankets", label: "Blankets", icon: Bed, iconBg: "bg-rose-100", iconColor: "text-rose-600" },
  { slug: "mittens", label: "Mittens", icon: Hand, iconBg: "bg-amber-100", iconColor: "text-amber-600" },
  { slug: "caps", label: "Caps", icon: Crown, iconBg: "bg-yellow-100", iconColor: "text-yellow-600" },
  { slug: "zippers", label: "Zippers", icon: Shirt, iconBg: "bg-emerald-100", iconColor: "text-emerald-600" },
  { slug: "footed-rompers", label: "Footed Rompers", icon: Footprints, iconBg: "bg-teal-100", iconColor: "text-teal-600" },
  { slug: "knit-sets", label: "Knit Sets", icon: LayoutGrid, iconBg: "bg-orange-100", iconColor: "text-orange-600" },
  { slug: "thermal-sets", label: "Thermal Sets", icon: Snowflake, iconBg: "bg-cyan-100", iconColor: "text-cyan-600" },
  { slug: "jackets", label: "Jackets", icon: Shirt, iconBg: "bg-red-100", iconColor: "text-red-600" },
  { slug: "bibs", label: "Bibs", icon: Droplet, iconBg: "bg-pink-100", iconColor: "text-pink-600" },
  { slug: "headbands", label: "Headbands", icon: CircleDot, iconBg: "bg-lime-100", iconColor: "text-lime-600" },
  { slug: "sleeping-bags", label: "Sleeping Bags", icon: Package, iconBg: "bg-fuchsia-100", iconColor: "text-fuchsia-600" },
  { slug: "receiving-blankets", label: "Receiving Blankets", icon: Gift, iconBg: "bg-slate-100", iconColor: "text-slate-600" },
];

const SIZES = ["0-6M", "6-12M", "1-2Y", "2-3Y", "3-4Y"];

// Tight, consistent page gutter reused across every section
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function NewbornsPage() {
  const [gender, setGender] = useState<Gender>("boys");
  const [activeCategory, setActiveCategory] = useState<string>("bodysuits");
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState("Newest");
  const [categoryOpen, setCategoryOpen] = useState(true);
  const { favouriteIds, toggle: toggleFav } = useFavourites();

  // demo.ts uses "boy"/"girl", page state uses "boys"/"girls"
  const genderKey = gender === "boys" ? "boy" : "girl";

  const products = useMemo(() => {
    let filtered = demoProducts.filter(
      (p) =>
        p.ageGroup === "newborn" &&
        p.gender === genderKey &&
        p.tags.includes(activeCategory)
    );

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((p) =>
        p.sizes.some((s) => selectedSizes.includes(s))
      );
    }

    if (sortBy === "Price: Low to High") return [...filtered].sort((a, b) => a.price - b.price);
    if (sortBy === "Price: High to Low") return [...filtered].sort((a, b) => b.price - a.price);
    return filtered;
  }, [activeCategory, gender, genderKey, selectedSizes, sortBy]);

  // Counts per category (for the sidebar checkbox labels), scoped to current gender/age
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      map[cat.slug] = demoProducts.filter(
        (p) => p.ageGroup === "newborn" && p.gender === genderKey && p.tags.includes(cat.slug)
      ).length;
    });
    return map;
  }, [genderKey]);

  const toggleSize = (size: string) => {
    setSelectedSizes((prev) =>
      prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]
    );
  };

  return (
    <div className="min-h-screen bg-[#FBF2E9]" style={{ fontFamily: FONT_HEADING }}>
      {/* ---------------------------------------------------------- */}
      {/*  Hero                                                       */}
      {/* ---------------------------------------------------------- */}
      <div className={`relative ${CONTAINER} pb-12 pt-10`}>
        <nav className="mb-6 text-sm text-[#9a8f7f]">
          <span>Home</span>
          <span className="mx-2">›</span>
          <span className="text-[#3d372c]">Newborns</span>
        </nav>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 md:items-center">
          <div>
            <h1 className="flex items-center gap-3 text-4xl font-extrabold text-[#293A55] sm:text-5xl">
              Newborns
              <Heart className="h-8 w-8 fill-red-500 text-red-500" />
            </h1>
            <p className="mt-3 max-w-md text-[#8a8071]">
              Gentle, soft and made with love for new beginnings.
            </p>

            {/* Gender toggle */}
            <div className="mt-6 inline-flex rounded-full border border-[#e6ddcd] bg-white p-1">
              {(["boys", "girls"] as Gender[]).map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGender(g)}
                  className={`cursor-pointer rounded-full px-6 py-2 text-sm font-medium capitalize transition-colors ${
                    gender === g
                      ? "bg-[#293A55] text-white"
                      : "text-[#8a8071] hover:text-[#293A55]"
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div className="relative mx-auto h-40 w-full max-w-md overflow-hidden rounded-[2rem] bg-[#efe4d3] shadow-[0_18px_38px_rgba(41,58,85,0.15)] sm:h-48 md:h-56">
            <img
              src={`https://picsum.photos/seed/newborn-hero-${gender}/900/500`}
              alt={`Newborn ${gender} collection`}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------- */}
      {/*  Category strip — rounded top, skin gradient dark→light,     */}
      {/*  single line, light line separating it from the listing      */}
      {/* ---------------------------------------------------------- */}
      <div className="rounded-t-[2.5rem] border-b border-[#E6D9C4] bg-gradient-to-b from-[#F8ECDD] to-[#FBF2E9]"> <div className={`${CONTAINER} py-8`}> <div className="flex flex-wrap justify-center gap-x-6 gap-y-4 py-3"> {CATEGORIES.map((cat) => { const Icon = cat.icon; const active = cat.slug === activeCategory; return ( <button key={cat.slug} type="button" onClick={() => setActiveCategory(cat.slug)} className="flex shrink-0 cursor-pointer flex-col items-center gap-2" > <span className={`flex h-14 w-14 items-center justify-center rounded-full ${cat.iconBg} ${cat.iconColor} transition-all ${ active ? "ring-2 ring-offset-2 ring-[#293A55]" : "" }`} > <Icon className="h-5 w-5" strokeWidth={1.75} /> </span> <span className={`whitespace-nowrap text-xs ${ active ? "font-semibold text-[#293A55]" : "text-[#8a8071]" }`} > {cat.label} </span> </button> ); })} </div> </div> </div>

      {/* ---------------------------------------------------------- */}
      {/*  Body: filters + product grid — back to skin background      */}
      {/* ---------------------------------------------------------- */}
      <div className="bg-[#FBF2E9]">
        <div className={`${CONTAINER} grid grid-cols-1 gap-10 py-10 md:grid-cols-[220px_1fr]`}>
          {/* Sidebar */}
          <aside className="space-y-8 md:border-r md:border-[#E6D9C4] md:pr-8">
            <div>
              <h3 className="mb-4 text-xs font-bold uppercase tracking-wide text-[#a89d8b]">
                Filter by
              </h3>

              <button
                type="button"
                onClick={() => setCategoryOpen((v) => !v)}
                className="mb-3 flex w-full cursor-pointer items-center justify-between text-sm font-bold text-[#293A55]"
              >
                Category
                {categoryOpen ? (
                  <ChevronUp className="h-4 w-4 text-[#a89d8b]" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-[#a89d8b]" />
                )}
              </button>

              {categoryOpen && (
                <ul className="space-y-2.5">
                  {CATEGORIES.map((cat) => (
                    <li key={cat.slug}>
                      <label className="flex cursor-pointer items-center gap-2 text-sm text-[#5c5445]">
                        <input
                          type="checkbox"
                          checked={cat.slug === activeCategory}
                          onChange={() => setActiveCategory(cat.slug)}
                          className="h-4 w-4 cursor-pointer rounded border-[#d8cdb8] accent-[#293A55]"
                        />
                        {cat.label}
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div>
              <h4 className="mb-3 text-sm font-bold text-[#293A55]">Size</h4>
              <ul className="space-y-2.5">
                {SIZES.map((size) => (
                  <li key={size}>
                    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#5c5445]">
                      <input
                        type="checkbox"
                        checked={selectedSizes.includes(size)}
                        onChange={() => toggleSize(size)}
                        className="h-4 w-4 cursor-pointer rounded border-[#d8cdb8] accent-[#293A55]"
                      />
                      {size}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Product grid */}
          <section className="md:pl-2">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-[#8a8071]">
                Showing 1 - {products.length} of {products.length} products
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

            {products.length === 0 ? (
              <p className="text-sm text-[#8a8071]">
                No products yet in this category.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-15 sm:grid-cols-3">
                {products.map((product) => {
                  const liked = favouriteIds.has(product.id);
                  return (
                    <Link
                      key={product.id}
                      href={`/newborns/${product.gender === "boy" ? "boys" : "girls"}/${product.tags.find((t) => t !== "newborn" && t !== product.gender) ?? ""}/${product.id}`}
                      className="group block cursor-pointer"
                    >
                      <div className="relative aspect-square overflow-hidden rounded-2xl bg-[#F3E9DC]">
                        <Image
                          src={product.image}
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

                      <p className="mt-3 text-base font-bold text-[#293A55]">
                        {product.name}
                      </p>
                      <p className="text-sm font-medium text-[#5c5445]">
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