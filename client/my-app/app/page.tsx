"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { useAudience, wasInitiallyLoadedAtHome } from "./context/AudienceContext";
import { useTheme } from "./context/ThemeContext";
import { products } from "./data/products";
import Hero from "./components/hero/page";

let welcomePromoHandledThisDocument = false;

function WelcomePromoOverlay({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#172437]/65 p-4 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-promo-title"
        className="relative w-full max-w-md rounded-3xl border border-[#ead9c1] bg-white p-7 text-center shadow-[0_24px_80px_rgba(0,0,0,0.3)] sm:p-9"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="Close welcome offer"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full border border-[#ead9c1] text-[#293A55] transition-colors hover:bg-[#FCF5EE]"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">A little welcome treat</p>
        <h2 id="welcome-promo-title" className="mt-3 text-3xl font-extrabold text-[#293A55]" style={{ fontFamily: "'Quicksand', sans-serif" }}>
          Welcome to Just Kiddin
        </h2>
        <p className="mt-3 text-sm leading-6 text-[#5c5445]">
          New here? Get an extra 10% off your first order with this one-time promo code.
        </p>
        <div className="mx-auto mt-5 w-fit rounded-xl border border-dashed border-[#7FA08D] bg-[#F4F8F5] px-6 py-3 text-xl font-extrabold tracking-[0.12em] text-[#293A55]">
          JK05
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[#293A55] px-7 text-sm font-bold text-white transition-transform hover:scale-[1.02]"
        >
          Start exploring
        </button>
      </section>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  const { isDark } = useTheme();
  const { audience, clearAudience } = useAudience();
  const [showWelcomePromo, setShowWelcomePromo] = useState(false);

  useEffect(() => {
    if (welcomePromoHandledThisDocument) return;
    welcomePromoHandledThisDocument = true;

    if (!wasInitiallyLoadedAtHome() || window.localStorage.getItem("jk-audience")) return;
    setShowWelcomePromo(true);
  }, []);

  useEffect(() => {
    if (!showWelcomePromo || audience) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [audience, showWelcomePromo]);

  const dismissWelcomePromo = () => {
    setShowWelcomePromo(false);
  };

  const visibleProducts = useMemo(() => {
    if (!audience) return [];
    return products.filter((item) => item.tags.includes(audience));
  }, [audience]);

  if (!audience) {
    return (
      <>
        <Hero
          onSelectNewborns={() => router.push("/newborns")}
          onSelectToddlers={() => router.push("/toddlers")}
        />
        {showWelcomePromo ? <WelcomePromoOverlay onDismiss={dismissWelcomePromo} /> : null}
      </>
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