"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap, Minus, Plus, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { products as allProducts, type Product } from "../data/demo";
import { reviews as REVIEWS, type Review } from "../reviews/page";
import { useFavourites } from "../hooks/useFavourites";
import { useCart } from "../context/CartContext";

const FONT_HEADING = "'Quicksand', sans-serif";
const FONT_BODY = "'Quicksand', sans-serif";

// turns any string/number id into a stable numeric seed
function hashSeed(id: string | number): number {
  const str = String(id);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash || 1;
}

function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function pickRandomReviews(id: string | number, count: number): Review[] {
  const rand = seededRandom(hashSeed(id));
  const pool = [...REVIEWS];
  const picked: Review[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    picked.push(pool.splice(idx, 1)[0]);
  }
  return picked;
}

interface Props {
  product: Product;
  backHref: string;
  backLabel: string;
  parentLabel: string;
  grandParentLabel: string;
  grandParentHref: string;
}

export default function ProductDetailPage({
  product,
  backHref,
  backLabel,
  parentLabel,
  grandParentLabel,
  grandParentHref,
}: Props) {
  const router = useRouter();
  const galleryImages = Array.isArray(product.image)
    ? product.image.length > 0
      ? product.image
      : ["/demo.png"]
    : [product.image || "/demo.png"];

  // product.colors is a plain string array (e.g. "Blue", "White") — CSS understands these names directly
  const availableColors = product.colors ?? [];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(availableColors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const { favouriteIds, toggle: toggleFav } = useFavourites();
  const { addItem } = useCart();
  const favourited = favouriteIds.has(product.id);

  // zoom-on-hover state for the main image
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const imageWrapRef = useRef<HTMLDivElement>(null);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  // "was" price shown struck-through — 15% higher than the actual price
  const compareAtPrice = useMemo(() => Math.round(product.price * 1.15), [product.price]);

  const related = useMemo(
    () =>
      allProducts
        .filter(
          (p) =>
            p.ageGroup === product.ageGroup &&
            p.gender === product.gender &&
            p.category === product.category &&
            p.id !== product.id
        )
        .slice(0, 4),
    [product]
  );

  const productReviews = useMemo(() => pickRandomReviews(product.id, 6), [product.id]);
  const avgRating = useMemo(() => {
    if (productReviews.length === 0) return 0;
    return productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length;
  }, [productReviews]);

  const handleAddToCart = () => {
    if (!selectedSize) {
      setActionMessage("Please choose a size before adding this item to cart.");
      return;
    }

    addItem({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor ?? "Default",
    });
    setActionMessage("Added to cart.");
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setActionMessage("Please choose a size before checking out.");
      return;
    }

    addItem({
      product,
      quantity,
      size: selectedSize,
      color: selectedColor ?? "Default",
    });
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-[0000]" style={{ fontFamily: FONT_BODY }}>

      {/* Breadcrumb — plain text, not clickable */}
      <div className="px-6 pt-5 pb-3 text-xs text-[#9a8f7f] sm:px-[1in]">
        <span>Home</span>
        <span className="mx-1.5">›</span>
        <span>{grandParentLabel}</span>
        <span className="mx-1.5">›</span>
        <span>{parentLabel}</span>
        <span className="mx-1.5">›</span>
        <span>{backLabel}</span>
        <span className="mx-1.5">›</span>
        <span className="font-medium text-[#3d372c]">{product.name}</span>
      </div>

      <div className="px-6 pb-12 sm:px-[1in]">
        <div className="flex flex-col gap-10 lg:flex-row">

          {/* Image gallery — main image on top (smaller, zoom-on-hover), thumbnails below, arrows on all breakpoints */}
          <div className="flex w-full max-w-md flex-col gap-3 lg:shrink-0">
            {/* Main image */}
            <div
              ref={imageWrapRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleImageMouseMove}
              className="relative aspect-square w-full overflow-hidden rounded-2xl bg-[#EFE9DF] shadow-[0_12px_32px_rgba(41,58,85,0.10)] cursor-zoom-in"
            >
              <Image
                src={galleryImages[activeImage]}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-150 ease-out"
                style={{
                  transform: isZoomed ? "scale(2.2)" : "scale(1)",
                  transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
                }}
                sizes="(max-width: 1024px) 90vw, 24rem"
                priority
              />
              {!product.inStock && (
                <span className="absolute left-4 top-4 z-10 rounded-full bg-[#B66A3C] px-2.5 py-1 text-[11px] font-semibold text-white">
                  Out of Stock
                </span>
              )}

              {/* arrows — shown on desktop and mobile */}
              {galleryImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
                    }}
                    className="absolute left-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#3d372c] shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImage((i) => (i === galleryImages.length - 1 ? 0 : i + 1));
                    }}
                    className="absolute right-2 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-[#3d372c] shadow-md transition-transform hover:scale-110 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails — small, in a row below the main image */}
            {galleryImages.length > 1 && (
              <div className="flex w-full gap-2">
                {galleryImages.map((img, idx) => (
                  <button
                    key={img + idx}
                    type="button"
                    onClick={() => setActiveImage(idx)}
                    className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border-2 bg-[#EFE9DF] transition-all cursor-pointer ${
                      activeImage === idx
                        ? "border-[#E8735F] ring-1 ring-[#E8735F]"
                        : "border-transparent opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details — more compact */}
          <div className="flex w-full flex-col justify-center gap-3.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#7FA08D]" style={{ fontFamily: FONT_HEADING }}>
                {product.category} · {grandParentLabel} · {parentLabel}
              </p>
              <h1 className="mt-1.5 text-2xl font-extrabold leading-tight text-[#2F2A22] sm:text-3xl" style={{ fontFamily: FONT_HEADING }}>
                {product.name}
              </h1>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <span className="text-base font-medium text-[#9a8f7f] line-through">
                  Rs {compareAtPrice.toLocaleString()}
                </span>
                <span className="ml-10 text-xl font-bold text-[#E8735F]" style={{ fontFamily: FONT_HEADING }}>
                  Rs {product.price.toLocaleString()}
                </span>
                <span className="ml-10 rounded-full bg-[#7FA08D]/15 px-2 py-0.5 text-xs font-bold text-[#7FA08D]" style={{ fontFamily: FONT_HEADING }}>
                  Save 15%
                </span>
              </div>
            </div>

            <hr className="border-[#C86909]/60" />

            {/* Description */}
            {product.description && (
              <p className="text-sm leading-relaxed text-[#6B7280]">
                {product.description}
              </p>
            )}

            {/* Colour — only rendered/selectable if the product actually has colors */}
            {availableColors.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>
                  Colour{selectedColor && <span className="ml-2 font-normal text-[#7FA08D]">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => setSelectedColor(c)}
                      className={`h-7 w-7 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
                        selectedColor === c
                          ? "border-[#E8735F] ring-2 ring-[#E8735F] ring-offset-2"
                          : "border-white shadow-md"
                      }`}
                      style={{ background: c.toLowerCase() }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Age / Size — only rendered if the product has sizes */}
            {product.sizes.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>
                  Age / Size
                  {selectedSize && <span className="ml-2 font-normal text-[#7FA08D]">— {selectedSize}</span>}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-all cursor-pointer ${
                        selectedSize === size
                          ? "border-[#E8735F] bg-[#E8735F] text-white"
                          : "border-[#D8CCBC] bg-white text-[#3d372c] hover:border-[#E8735F]"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="mb-1.5 text-sm font-semibold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>Quantity</p>
              <div className="inline-flex items-center rounded-full border border-[#D8CCBC] bg-white">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F5E8D8] cursor-pointer"
                >
                  <Minus className="h-3.5 w-3.5 text-[#3d372c]" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-[#F5E8D8] cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-[#3d372c]" />
                </button>
              </div>
            </div>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${product.inStock ? "bg-emerald-500" : "bg-red-400"}`} />
              <span className="text-xs text-[#6B7280]">
                {product.inStock ? "In Stock" : "Currently unavailable"}
              </span>
            </div>

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleAddToCart}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                style={{ background: "#E8735F", fontFamily: FONT_HEADING }}
              >
                <ShoppingCart className="h-4 w-4" />
                Add to Cart
              </button>

              <button
                type="button"
                disabled={!product.inStock}
                onClick={handleBuyNow}
                className="flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                style={{ background: "#293A55", fontFamily: FONT_HEADING }}
              >
                <Zap className="h-4 w-4" />
                Buy Now
              </button>

              <button
                type="button"
                onClick={() => void toggleFav(product)}
                className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-bold transition-transform hover:scale-105 cursor-pointer ${
                  favourited
                    ? "border-rose-400 bg-rose-50 text-rose-500"
                    : "border-[#D8CCBC] bg-white text-[#3d372c]"
                }`}
                style={{ fontFamily: FONT_HEADING }}
              >
                <Heart className={`h-4 w-4 ${favourited ? "fill-rose-500 text-rose-500" : ""}`} />
                {favourited ? "Favourited" : "Favourite"}
              </button>
            </div>

            {actionMessage ? (
              <p className="text-sm font-medium text-[#7FA08D]" aria-live="polite">
                {actionMessage}
              </p>
            ) : null}
          </div>
        </div>

<div className="mt-20 mb-8 flex w-full justify-center">
  <div className="h-0 w-full border-t border-[#C86909]/60" />
</div>

        {/* Reviews */}
        {productReviews.length > 0 && (
          <div className="mt-14">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-2">
              <h2 className="text-xl font-extrabold text-[#2F2A22] sm:text-2xl" style={{ fontFamily: FONT_HEADING }}>
                Customer Reviews
              </h2>
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Star
                      key={n}
                      className={`h-4 w-4 ${n <= Math.round(avgRating) ? "fill-[#E8735F] text-[#E8735F]" : "text-[#D8CCBC]"}`}
                    />
                  ))}
                </div>
                <span className="text-xs font-semibold text-[#6B7280]">
                  {avgRating.toFixed(1)} · {productReviews.length} reviews
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {productReviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-[#E8DDCC] bg-white p-4 shadow-sm"
                >
                  <div className="mb-2 flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star
                        key={n}
                        className={`h-3.5 w-3.5 ${n <= r.rating ? "fill-[#E8735F] text-[#E8735F]" : "text-[#D8CCBC]"}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm leading-relaxed text-[#3d372c]">&ldquo;{r.review}&rdquo;</p>
                  <p className="mt-3 text-xs font-bold text-[#2F2A22]" style={{ fontFamily: FONT_HEADING }}>
                    {r.name}
                    <span className="ml-1.5 font-normal text-[#9a8f7f]">— {r.city}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

<div className="mt-20 mb-8 flex w-full justify-center">
  <div className="h-0 w-full border-t border-[#C86909]/60" />
</div>

        {/* Related — comes last */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-xl font-extrabold text-[#2F2A22] sm:text-2xl" style={{ fontFamily: FONT_HEADING }}>
              More in {product.category}
            </h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`${backHref}/${rel.id}`}
                  className="group overflow-hidden rounded-xl border border-[#E8DDCC] bg-white shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <div className="relative aspect-square bg-[#F7EFE4]">
                    <Image src={rel.image[0]} alt={rel.name} fill className="object-cover" sizes="25vw" />
                  </div>
                  <div className="p-2.5">
                    <p className="truncate text-xs font-semibold text-[#2F2A22]" style={{ fontFamily: FONT_HEADING }}>
                      {rel.name}
                    </p>
                    <p className="mt-0.5 text-xs font-bold text-[#E8735F]" style={{ fontFamily: FONT_HEADING }}>
                      PKR {rel.price.toLocaleString()}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}