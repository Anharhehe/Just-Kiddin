"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Heart } from "lucide-react";
import { products as demoProducts, type Product } from "../../data/demo";
import { useFavourites } from "../../hooks/useFavourites";
import { getProductImage } from "../../utils/product-image";

interface HeroProps {
  onSelectNewborns: () => void;
  onSelectToddlers: () => void;
}

const FONT_HEADING = "'Quicksand', sans-serif";

export default function Hero({ onSelectNewborns, onSelectToddlers }: HeroProps) {
  return (
    <section className="relative w-full overflow-x-hidden" style={{ fontFamily: FONT_HEADING }}>
      {/* Background photo band - 65vh on mobile, original 92vh on desktop */}
      <div className="relative flex min-h-[65vh] w-full flex-col justify-center sm:min-h-[92vh]">
        {/* Mobile background */}
        <Image
          src="/hero.jpg"
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="object-cover sm:hidden"
        />
        {/* Desktop background - unchanged */}
        <Image
          src="/hero.png"
          alt="Hero background"
          fill
          priority
          sizes="100vw"
          className="hidden object-cover sm:block"
        />
        {/* soft overlay so text/buttons stay legible over the photo */}
        <div className="absolute inset-0 bg-white/40" />

        {/* Logo + heading + buttons, layered on top of the photo */}
        <div className="relative z-10">
          <div className="mx-auto flex max-w-7xl justify-end px-6 pt-6 sm:px-10 sm:pt-8">
            <Wordmark />
          </div>
          <HeroBody onSelectNewborns={onSelectNewborns} onSelectToddlers={onSelectToddlers} />
        </div>
      </div>

      {/* Feature strip sits below the photo, with breathing room above it */}
      <div className="pt-10 sm:pt-14">
        <FeatureStrip />
      </div>

      <FeaturedProducts />
    </section>
  );
}

/* ------------------------------- Wordmark ------------------------------- */

function Wordmark() {
  return (
    <div className="relative mx-auto w-fit text-center">
      {/* balloon */}
    </div>
  );
}

/* --------------------------------- Body ---------------------------------- */

function HeroBody({ onSelectNewborns, onSelectToddlers }: HeroProps) {
  const body = { fontFamily: FONT_HEADING };
  const display = { fontFamily: FONT_HEADING };

  return (
    <div
      className="relative z-10 mx-auto flex max-w-2xl flex-col items-center px-6 pb-6 pt-8 text-center sm:px-10 sm:pt-10"
      style={body}
    >
      {/* mobile: no offset, content centers naturally in the 65vh band */}
      {/* desktop: original -mt-40 restored, same as before */}
      <div className="mx-auto flex w-full flex-col items-center sm:-mt-40">
        <h2
          className="text-[8vw] font-extrabold leading-[1.15] xs:text-[7.5vw] sm:text-5xl lg:text-6xl"
          style={{ ...display, color: "#293A55" }}
        >
          <span className="block whitespace-nowrap">
            Softness they <span style={{ color: "#E8735F" }}>love.</span>
          </span>
          <span className="mt-1 block whitespace-nowrap">
            Quality you{" "}
            <span className="italic" style={{ color: "#7FA08D" }}>
              trust.
            </span>
          </span>
        </h2>

        <p className="mt-4 max-w-md text-base text-[#6B7280] sm:text-lg" style={body}>
          Thoughtfully made clothing for newborns to 5 years, for every little moment.
        </p>

        {/* buttons: bigger on mobile, original size restored from sm: up */}
        <div className="mt-7 flex flex-wrap justify-center gap-4 sm:gap-3">
          <button
            type="button"
            onClick={onSelectNewborns}
            className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-base font-bold uppercase tracking-wide text-white transition-transform hover:scale-105 sm:px-6 sm:py-3.5 sm:text-base"
            style={{ background: "#E8735F", ...body }}
          >
            Shop Newborns
            <ArrowIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>

          <button
            type="button"
            onClick={onSelectToddlers}
            className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-base font-bold uppercase tracking-wide text-white transition-transform hover:scale-105 sm:px-6 sm:py-3.5 sm:text-base"
            style={{ background: "#7FA08D", ...body }}
          >
            Shop Toddlers
            <ArrowIcon className="h-5 w-5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Icons --------------------------------- */

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 21s-7.2-4.6-9.8-9C.6 8.4 2 4.5 5.6 3.6 8 3 10.2 4 12 6.5 13.8 4 16 3 18.4 3.6 22 4.5 23.4 8.4 21.8 12 19.2 16.4 12 21 12 21z" />
    </svg>
  );
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ------------------------------ Feature strip ----------------------------- */

const FEATURES = [
  {
    label: "Ultra Soft",
    desc: "Gentle on delicate skin",
    bg: "#DCEEE3",
    fg: "#4F9A81",
    icon: (c: string) => <CloudSoftIcon color={c} />,
  },
  {
    label: "Safe & Comfy",
    desc: "Premium quality fabrics",
    bg: "#FBDAD3",
    fg: "#E8735F",
    icon: (c: string) => <ShieldIcon color={c} />,
  },
  {
    label: "Thoughtful Design",
    desc: "Made for everyday moments",
    bg: "#FCEACD",
    fg: "#E0A63C",
    icon: (c: string) => <HeartOutlineIcon color={c} />,
  },
  {
    label: "Made with Love",
    desc: "For your little ones",
    bg: "#EAE1F5",
    fg: "#9B87C4",
    icon: (c: string) => <GiftIcon color={c} />,
  },
];

function FeatureStrip() {
  return (
    <div className="relative z-10 mx-auto max-w-[92rem] px-4 pb-10 sm:px-10">
      <div
        className="grid grid-cols-1 divide-y divide-[#F0E4D6] rounded-3xl px-4 py-2 shadow-[0_16px_40px_rgba(0,0,0,0.06)] sm:grid-cols-4 sm:divide-x sm:divide-y-0 sm:rounded-full sm:px-8 sm:py-4"
        style={{ background: "#FCF5EE" }}
      >
        {FEATURES.map((f) => (
          <div key={f.label} className="flex items-center gap-3 py-4 sm:gap-4 sm:py-6 sm:px-6">
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full sm:h-16 sm:w-16"
              style={{ background: f.bg, color: f.fg }}
            >
              {f.icon(f.fg)}
            </span>
            <div style={{ fontFamily: FONT_HEADING }}>
              <p className="flex items-center gap-1.5 text-base font-bold text-[#293A55] sm:text-lg">
                {f.label} <HeartIcon className="h-4 w-4 text-[#E8735F]" />
              </p>
              <p className="text-sm text-[#6B7280]">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function CloudSoftIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M7 18a4 4 0 0 1-1-7.9A5 5 0 0 1 15 8a4.5 4.5 0 0 1 1 8.9" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="18" r="0.5" />
    </svg>
  );
}
function ShieldIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
    </svg>
  );
}
function HeartOutlineIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M12 21s-7.2-4.6-9.8-9C.6 8.4 2 4.5 5.6 3.6 8 3 10.2 4 12 6.5 13.8 4 16 3 18.4 3.6 22 4.5 23.4 8.4 21.8 12 19.2 16.4 12 21 12 21z" strokeLinejoin="round" />
    </svg>
  );
}
function GiftIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="4" y="9" width="16" height="11" rx="1" />
      <path d="M4 9h16v3H4z" />
      <path d="M12 9v11M12 9c-2-3-6-3-6 0 0 1.2 1 1.5 3 1.5M12 9c2-3 6-3 6 0 0 1.2-1 1.5-3 1.5" />
    </svg>
  );
}

/* --------------------------- Featured products grid --------------------------- */

const FEATURED_PRODUCT_IDS = [
  "newborn-boy-sleepsuits-1",
  "newborn-boy-sleepsuits-2",
  "newborn-boy-sleepsuits-3",
  "newborn-boy-sleepsuits-4",
  "toddler-boy-hoodies-1",
  "toddler-boy-hoodies-2",
  "toddler-boy-hoodies-3",
  "toddler-boy-hoodies-4",
] as const;

type FeaturedProduct = Product & { image: string | string[] };

function FeaturedProducts() {
  const [showMore, setShowMore] = useState(false);
  const { favouriteIds, toggle: toggleFav } = useFavourites();

  const featuredProducts = useMemo(() => {
    return FEATURED_PRODUCT_IDS.map((id) => demoProducts.find((product) => product.id === id)).filter(
      (product): product is FeaturedProduct => Boolean(product)
    );
  }, []);

  const visibleProducts = showMore ? featuredProducts : featuredProducts.slice(0, 4);

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <div>
        <p className="flex items-center gap-2 text-sm font-bold tracking-wide text-[#E8735F] sm:text-base">
          FEATURED PRODUCTS <HeartIcon className="h-3.5 w-3.5" />
        </p>
        <h2 className="mt-3 text-3xl font-extrabold leading-[1.15] text-[#293A55] sm:text-4xl lg:text-5xl">
          Our hot sellers from the collection.
        </h2>
      </div>

      <div className="mt-8 flex items-center justify-between gap-3 border-b border-[#E6D9C4] pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7FA08D]">
          Newborns + Toddlers
        </p>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product) => {
          const liked = favouriteIds.has(product.id);
          const imageSrc = getProductImage(product);
          const ageSegment = product.ageGroup === "newborn" ? "newborns" : "toddlers";
          const genderSegment = product.gender === "boy" ? "boys" : product.gender === "girl" ? "girls" : "accessories";
          const categorySlug = product.tags.find((tag) => tag !== product.ageGroup && tag !== product.gender) ?? (product.category ?? "accessories").toLowerCase().replace(/\s+/g, "-");

          return (
            <Link
              key={product.id}
              href={`/${ageSegment}/${genderSegment}/${categorySlug}/${product.id}`}
              className="group block cursor-pointer"
            >
              <article className="overflow-hidden rounded-2xl border border-[#E6D9C4] bg-[#FCF5EE] shadow-[0_10px_28px_rgba(41,58,85,0.08)] transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-[0_16px_34px_rgba(41,58,85,0.14)]">
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={imageSrc}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  />

                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      void toggleFav(product);
                    }}
                    className="absolute right-3 top-3 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white shadow-sm transition-transform hover:scale-105"
                    aria-label="Add to wishlist"
                  >
                    <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-[#293A55]"}`} />
                  </button>

                  {!product.inStock && (
                    <span className="absolute left-3 top-3 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white">
                      Out of stock
                    </span>
                  )}
                </div>

                <div className="p-4 text-left">
                  <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[#7FA08D]">
                    {product.ageGroup === "newborn" ? "Newborn" : "Toddler"}
                  </p>
                  <h3 className="mt-1 text-base font-bold leading-tight text-[#293A55] sm:text-lg">
                    {product.name}
                  </h3>
                  <p className="mt-1 text-sm text-[#5c5445]">{product.category}</p>
                  <p className="mt-3 text-base font-semibold text-[#E8735F]">PKR {product.price.toLocaleString()}</p>
                </div>
              </article>
            </Link>
          );
        })}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => setShowMore((value) => !value)}
          className="flex cursor-pointer items-center gap-2 rounded-full px-8 py-4 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-105 sm:text-base"
          style={{ background: "#E8735F" }}
        >
          {showMore ? "Show Less" : "View Toddler Deals"}
          <ChevronDown className={`h-4 w-4 transition-transform ${showMore ? "rotate-180" : ""}`} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------- Top Sellers ------------------------------ */

interface TopSellerProduct {
  name: string;
  price: string;
  seed: string;
  bg: string;
}

const PRODUCTS: TopSellerProduct[] = [
  { name: "Cozy Cloud Onesie", price: "$24.00", seed: "baby-onesie-1", bg: "#DCEEE3" },
  { name: "Little Star Romper", price: "$28.00", seed: "baby-romper-2", bg: "#FBDAD3" },
  { name: "Soft Knit Cardigan", price: "$32.00", seed: "baby-cardigan-3", bg: "#FCEACD" },
  { name: "Dreamy Sleep Sack", price: "$26.00", seed: "baby-sleepsack-4", bg: "#EAE1F5" },
  { name: "Sunny Days Bodysuit", price: "$22.00", seed: "baby-bodysuit-5", bg: "#DCEEE3" },
  { name: "Toddler Dungarees", price: "$34.00", seed: "toddler-dungarees-6", bg: "#FBDAD3" },
  { name: "Snuggle Fleece Set", price: "$30.00", seed: "baby-fleece-7", bg: "#FCEACD" },
  { name: "Little Explorer Tee", price: "$20.00", seed: "toddler-tee-8", bg: "#EAE1F5" },
];

function TopSellers() {
  const [showAll, setShowAll] = useState(false);
  const visibleProducts = showAll ? PRODUCTS : PRODUCTS.slice(0, 4);

  return (
    <div
      className="relative z-10 mx-auto max-w-7xl px-6 pb-16 pt-14 sm:px-10 sm:pt-16"
      style={{ fontFamily: FONT_HEADING }}
    >
      <div className="mx-auto max-w-xl text-center sm:mx-0 sm:text-left">
        <p className="flex items-center justify-center gap-2 text-sm font-bold tracking-wide text-[#E8735F] sm:justify-start sm:text-base">
          OUR TOP SELLERS <HeartIcon className="h-3.5 w-3.5" />
        </p>
        <h2
          className="mt-3 text-3xl font-extrabold leading-[1.15] sm:text-4xl lg:text-5xl"
          style={{ color: "#293A55" }}
        >
          Loved by little ones,
          <br className="hidden sm:block" /> chosen by parents.
        </h2>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
        {visibleProducts.map((p) => (
          <ProductCard key={p.name} product={p} />
        ))}
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={() => setShowAll((prev) => !prev)}
          className="flex cursor-pointer items-center gap-2 rounded-full px-6 py-3.5 text-sm font-bold uppercase tracking-wide text-white transition-transform hover:scale-105 sm:text-base"
          style={{ background: "#293A55" }}
        >
          {showAll ? "Show Less" : "View Toddler Deals"}
          <ArrowIcon className={`h-4 w-4 transition-transform ${showAll ? "-rotate-90" : "rotate-90"}`} />
        </button>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: TopSellerProduct }) {
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1">
      <div
        className="relative aspect-square w-full overflow-hidden"
        style={{ background: product.bg }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://picsum.photos/seed/${product.seed}/500/500`}
          alt={product.name}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-[#E8735F] shadow-sm">
          <HeartIcon className="h-4 w-4" />
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-1 px-4 py-4 text-left">
        <p className="text-sm font-bold text-[#293A55] sm:text-base">{product.name}</p>
        <p className="text-sm font-semibold text-[#E8735F] sm:text-base">{product.price}</p>
      </div>
    </div>
  );
}