"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAudience } from "./context/AudienceContext";
import { useTheme } from "./context/ThemeContext";
import { products } from "./data/products";
import Hero from "./components/hero/page";

export default function Home() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { audience, clearAudience } = useAudience();

  const visibleProducts = useMemo(() => {
    if (!audience) return [];
    return products.filter((item) => item.tags.includes(audience));
  }, [audience]);

  if (!audience) {
    return (
      <Hero
        onSelectNewborns={() => router.push("/newborns")}
        onSelectToddlers={() => router.push("/toddlers")}
      />
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1
            className="text-3xl font-extrabold sm:text-4xl"
            style={{ fontFamily: "'Baloo 2', cursive", color: "var(--foreground)" }}
          >
            {audience === "toddlers" ? "Toddler Collection" : "Newborn Collection"}
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
            Products are filtered by your selected segment. Keep tagging future products with newborns or toddlers.
          </p>
        </div>

        <button
          type="button"
          onClick={clearAudience}
          className="h-10 cursor-pointer rounded-full px-4 text-sm font-medium"
          style={{
            background: isDark ? "#3A3A5C" : "var(--blush)",
            color: "var(--foreground)",
            border: isDark ? "1px solid #5A5A7A" : "1px solid transparent",
            fontFamily: "'DM Sans', sans-serif",
          }}
        >
          Change Selection
        </button>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {visibleProducts.map((product) => (
          <article
            key={product.id}
            className="overflow-hidden rounded-2xl border"
            style={{ background: "var(--card-bg)", borderColor: "var(--card-border)" }}
          >
            <img src={product.imageUrl} alt={product.name} className="h-48 w-full object-cover" />
            <div className="p-4">
              <h2 className="text-lg leading-tight" style={{ fontFamily: "'Baloo 2', cursive", fontWeight: 700, color: "var(--foreground)" }}>
                {product.name}
              </h2>
              <p className="mt-1 text-sm" style={{ color: "var(--muted)", fontFamily: "'DM Sans', sans-serif" }}>
                {product.description}
              </p>
              <p className="mt-3 text-base font-semibold" style={{ color: "var(--primary)", fontFamily: "'DM Sans', sans-serif" }}>
                PKR {product.pricePkr}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}