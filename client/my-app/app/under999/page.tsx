import Link from "next/link";
import {
  ArrowRight,
  BadgePercent,
  Baby,
  Gift,
  Heart,
  Sparkles,
  Tag,
  Shirt,
  ShieldCheck,
} from "lucide-react";
import { products } from "../data/products";

type BudgetProduct = (typeof products)[number];

const FONT_HEADING = "'Quicksand', sans-serif";
const CONTAINER = "mx-auto max-w-7xl px-4 sm:px-6 lg:px-8";
const BANNED_TAGS = new Set(["newborn", "newborns", "toddler", "boy", "boys", "girl", "girls"]);

function formatPrice(price: number) {
  return `PKR ${price.toLocaleString()}`;
}

function getCollectionLink(product: BudgetProduct) {
  const category = product.tags.find((tag) => !BANNED_TAGS.has(tag)) ?? "";
  const gender = product.gender === "boy" ? "boys" : "girls";
  const ageGroup = product.ageGroup === "newborn" ? "newborns" : "toddlers";

  if (!category) {
    return `/${ageGroup}/${gender}`;
  }

  return `/${ageGroup}/${gender}/${category}`;
}

const budgetProducts = [...products]
  .filter((product) => product.pricePkr < 1000)
  .sort((a, b) => a.pricePkr - b.pricePkr);

const budgetPriceRange = budgetProducts.length
  ? `${formatPrice(budgetProducts[0].pricePkr)} - ${formatPrice(budgetProducts[budgetProducts.length - 1].pricePkr)}`
  : "Under PKR 1000";

const highlights = [
  { label: "Fresh finds", value: `${budgetProducts.length} products`, icon: Sparkles },
  { label: "Best value", value: "Under PKR 1000", icon: BadgePercent },
  { label: "Gentle picks", value: "Soft everyday wear", icon: ShieldCheck },
];

export default function Under999Page() {
  return (
    <div className="min-h-screen bg-[#FBF2E9]" style={{ fontFamily: FONT_HEADING }}>
      <section className={`${CONTAINER} pb-10 pt-10 sm:pb-14 sm:pt-12`}>
        <div className="overflow-hidden rounded-[2.5rem] border border-[#e7dcc8] bg-gradient-to-br from-[#fff7f0] via-[#fef2e5] to-[#f8ead9] shadow-[0_22px_60px_rgba(41,58,85,0.08)]">
          <div className="grid gap-8 px-5 py-7 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-[#ead9c1] bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#E8735F] shadow-sm">
                <Tag className="h-4 w-4" />
                Budget collection
              </div>

              <h1 className="mt-5 max-w-2xl text-4xl font-extrabold leading-tight text-[#293A55] sm:text-5xl">
                Style picks under PKR 1000 for little wardrobes.
              </h1>

              <p className="mt-4 max-w-2xl text-base leading-7 text-[#7a6f5d] sm:text-lg">
                A curated set of affordable pieces from our main catalog. Simple, soft, and easy on the budget.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {highlights.map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 rounded-2xl border border-[#ead9c1] bg-white px-4 py-3 shadow-sm"
                    >
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#293A55]/5 text-[#293A55]">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8d8272]">
                          {item.label}
                        </p>
                        <p className="text-sm font-bold text-[#293A55]">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="relative overflow-hidden rounded-[2rem] bg-[#293A55] p-6 text-white shadow-[0_18px_50px_rgba(41,58,85,0.25)] sm:p-8">
              <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-[#E8735F]/20 blur-2xl" />
              <div className="absolute -bottom-14 -left-10 h-40 w-40 rounded-full bg-[#7FA08D]/20 blur-2xl" />

              <div className="relative space-y-5">
                <div className="flex items-center gap-3">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10">
                    <Gift className="h-6 w-6" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">Affordable picks</p>
                    <p className="text-lg font-bold">Budget-friendly collection</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/55">Price range</p>
                    <p className="mt-2 text-2xl font-bold">{budgetPriceRange}</p>
                  </div>
                  <div className="rounded-2xl bg-white/10 p-4">
                    <p className="text-xs uppercase tracking-[0.16em] text-white/55">Catalog</p>
                    <p className="mt-2 text-2xl font-bold">Everyday wear</p>
                  </div>
                </div>

                <p className="max-w-sm text-sm leading-6 text-white/75">
                  Browse simple essentials that keep the same warm design language as the rest of the store.
                </p>

                <Link
                  href="#budget-products"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-bold text-[#293A55] transition-transform hover:scale-[1.02]"
                >
                  View under 1000 products
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="budget-products" className={`${CONTAINER} pb-14 sm:pb-20`}>
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#8f836f]">Under PKR 1000</p>
            <h2 className="mt-2 text-3xl font-extrabold text-[#293A55] sm:text-4xl">
              Budget picks from the main catalog
            </h2>
          </div>
          <p className="max-w-xl text-sm text-[#7a6f5d]">
            Showing all products from <span className="font-bold text-[#293A55]">data.ts</span> priced below PKR 1000.
          </p>
        </div>

        {budgetProducts.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {budgetProducts.map((product) => (
              <article
                key={product.id}
                className="group overflow-hidden rounded-[2rem] border border-[#ead9c1] bg-white shadow-[0_16px_40px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-1"
              >
                <div className="relative aspect-square overflow-hidden bg-[#f6ede2]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
                    <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-[#E8735F] shadow-sm">
                      Under 1000
                    </span>
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/95 text-[#E8735F] shadow-sm">
                      <Heart className="h-4 w-4" />
                    </span>
                  </div>
                </div>

                <div className="space-y-4 px-5 py-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">
                      {product.ageGroup} / {product.gender} / {product.tags.find((tag) => !BANNED_TAGS.has(tag)) ?? "collection"}
                    </p>
                    <h3 className="mt-2 text-lg font-extrabold leading-snug text-[#293A55]">
                      {product.name}
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-[#7a6f5d]">
                    {product.description}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-[#293A55]/5 px-3 py-1 text-xs font-semibold text-[#293A55]">
                      {formatPrice(product.pricePkr)}
                    </span>
                    {product.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#f7ede5] px-3 py-1 text-xs font-semibold text-[#8f836f]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-3 border-t border-[#f0e3d2] pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.16em] text-[#8f836f]">Price</p>
                      <p className="text-xl font-extrabold text-[#E8735F]">{formatPrice(product.pricePkr)}</p>
                    </div>

                    <Link
                      href={getCollectionLink(product)}
                      className="inline-flex items-center gap-2 rounded-full bg-[#293A55] px-4 py-2.5 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
                    >
                      Shop collection
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-[#d9c8ae] bg-white px-6 py-14 text-center shadow-[0_16px_40px_rgba(0,0,0,0.04)]">
            <Baby className="mx-auto h-12 w-12 text-[#E8735F]" />
            <h3 className="mt-4 text-2xl font-extrabold text-[#293A55]">No products under PKR 1000 yet</h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#7a6f5d]">
              Once new budget-friendly items are added to <span className="font-semibold text-[#293A55]">data.ts</span>, they will appear here automatically.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}