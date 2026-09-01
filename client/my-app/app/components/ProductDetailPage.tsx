"use client";

import Image from "next/image";
import Link from "next/link";
import { createPortal } from "react-dom";
import { useState, useMemo, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Heart, ShoppingCart, Zap, Minus, Plus, Star, ChevronLeft, ChevronRight, X, CalendarDays, RotateCcw, Truck } from "lucide-react";
import { products as allProducts, type Product } from "../data/demo";
import { useFavourites } from "../hooks/useFavourites";
import { useCart } from "../context/CartContext";
import { getProductGallery, getProductImage } from "../utils/product-image";

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

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function extractColorFromAltText(altText: string | null | undefined) {
  if (!altText) {
    return null;
  }

  const trimmed = altText.trim();
  const separatorIndex = trimmed.lastIndexOf(" - ");
  const candidate = separatorIndex >= 0 ? trimmed.slice(separatorIndex + 3).trim() : trimmed;

  return candidate || null;
}

function normalizeColorValue(value: string) {
  return isHexColor(value) ? value.toUpperCase() : value.trim();
}

function normalizeVariantToken(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function getVariantQuantity(
  entries: Array<{ size?: string | null; color?: string | null; quantity: number }> | undefined,
  size: string | null,
  color: string | null
) {
  if (!entries || entries.length === 0) {
    return null;
  }

  const normalizedSize = normalizeVariantToken(size);
  const normalizedColor = normalizeVariantToken(color);

  const match = entries.find((entry) => {
    return normalizeVariantToken(entry.size) === normalizedSize && normalizeVariantToken(entry.color) === normalizedColor;
  });

  return match?.quantity ?? null;
}

type ProductReview = {
  id: string;
  productId?: string | null;
  name: string;
  city: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
};

type ReviewFormState = {
  name: string;
  city: string;
  rating: number;
  review: string;
};



interface Props {
  product: Product;
  backHref: string;
  backLabel: string;
  parentLabel: string;
  grandParentLabel: string;
  grandParentHref: string;
  relatedProducts?: Product[];
  relatedHrefBase?: string;
}

export default function ProductDetailPage({
  product,
  backHref,
  backLabel,
  parentLabel,
  grandParentLabel,
  grandParentHref,
  relatedProducts,
  relatedHrefBase,
}: Props) {
  const router = useRouter();
  const galleryImages = getProductGallery(product);
  const productImageEntries = product.images ?? [];
  const variantStockEntries = product.variantStock ?? [];

  // product.colors is a plain string array (e.g. "Blue", "White") — CSS understands these names directly
  const availableColors = product.colors ?? [];

  const colorImageMap = useMemo(() => {
    const entries = new Map<string, number>();

    productImageEntries.forEach((image, index) => {
      const color = normalizeColorValue(extractColorFromAltText(image.altText) ?? "");

      if (color && !entries.has(color)) {
        entries.set(color, index);
      }
    });

    return entries;
  }, [productImageEntries]);

  const imageColors = useMemo(() => {
    return productImageEntries.map((image) => normalizeColorValue(extractColorFromAltText(image.altText) ?? ""));
  }, [productImageEntries]);

  const initialActiveImage = useMemo(() => {
    const initialColor = availableColors[0] ? normalizeColorValue(availableColors[0]) : null;
    const mappedIndex = initialColor ? colorImageMap.get(initialColor) : undefined;

    return typeof mappedIndex === "number" ? mappedIndex : 0;
  }, [availableColors, colorImageMap]);

  const [activeImage, setActiveImage] = useState(initialActiveImage);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(availableColors[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [reviewForm, setReviewForm] = useState<ReviewFormState>({ name: "", city: "", rating: 5, review: "" });
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [showMoreReviews, setShowMoreReviews] = useState(false);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewNotice, setReviewNotice] = useState<string | null>(null);
  const { favouriteIds, toggle: toggleFav } = useFavourites();
  const { addItem } = useCart();
  const favourited = favouriteIds.has(product.id);

  // zoom-on-hover state for the main image
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomOrigin, setZoomOrigin] = useState({ x: 50, y: 50 });
  const imageWrapRef = useRef<HTMLDivElement>(null);
  const reviewsSectionRef = useRef<HTMLDivElement>(null);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  const roundedAverageRating = Math.round(averageRating);

  const serviceInfo = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "short" });
    const today = new Date();
    const dispatchDate = new Date(today);
    const deliveryDate = new Date(today);

    dispatchDate.setDate(today.getDate());
    deliveryDate.setDate(today.getDate() + 3);

    return {
      deliveryLabel: formatter.format(deliveryDate),
      dispatchLabel: formatter.format(dispatchDate),
    };
  }, []);

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((rating) => {
      const count = reviews.filter((item) => item.rating === rating).length;
      return { rating, count };
    });
  }, [reviews]);

  const visibleReviews = useMemo(() => reviews.slice(0, 6), [reviews]);
  const hiddenReviews = useMemo(() => reviews.slice(6), [reviews]);

  const selectedVariantQuantity = useMemo(() => {
    const quantity = getVariantQuantity(variantStockEntries, selectedSize, selectedColor);

    if (quantity !== null) {
      return quantity;
    }

    return product.inStock ? Number.MAX_SAFE_INTEGER : 0;
  }, [product.inStock, selectedColor, selectedSize, variantStockEntries]);

  useEffect(() => {
    const nextColor = imageColors[activeImage];

    if (nextColor && nextColor !== selectedColor) {
      setSelectedColor(nextColor);
    }
  }, [activeImage, imageColors, selectedColor]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadReviews() {
      setReviewsLoading(true);
      setReviewsError(null);

      try {
        const response = await fetch(`/api/reviews?productId=${encodeURIComponent(product.id)}&limit=100`, {
          cache: "no-store",
          signal: controller.signal,
        });

        const payload = (await response.json()) as {
          success?: boolean;
          data?: { reviews?: ProductReview[] };
          message?: string;
        };

        if (!response.ok || !payload.success) {
          throw new Error(payload.message ?? "Failed to load product reviews");
        }

        if (!controller.signal.aborted) {
          setReviews(payload.data?.reviews ?? []);
        }
      } catch (error) {
        if (!controller.signal.aborted) {
          setReviewsError(error instanceof Error ? error.message : "Failed to load product reviews");
        }
      } finally {
        if (!controller.signal.aborted) {
          setReviewsLoading(false);
        }
      }
    }

    void loadReviews();

    return () => controller.abort();
  }, [product.id]);

  useEffect(() => {
    if (!showSizeChart) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showSizeChart]);

  const handleImageMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = imageWrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  const discountPercent = Math.min(100, Math.max(0, product.discountPercent ?? 15));
  const compareAtPrice = useMemo(() => {
    if (discountPercent <= 0 || discountPercent >= 100) {
      return product.price;
    }

    return Math.round(product.price / (1 - discountPercent / 100));
  }, [discountPercent, product.price]);

  const relatedSource = relatedProducts ?? allProducts;

  const related = useMemo(
    () =>
      relatedSource
        .filter((p) => {
          if (p.id === product.id) {
            return false;
          }

          if (product.ageGroup === "accessories") {
            return p.ageGroup === "accessories" && p.category === product.category;
          }

          return p.ageGroup === product.ageGroup && p.gender === product.gender && p.category === product.category;
        })
        .slice(0, 4),
    [product, relatedSource]
  );



  const handleAddToCart = () => {
    if (!selectedSize) {
      setActionMessage("Please choose a size before adding this item to cart.");
      return;
    }

    if (selectedVariantQuantity < quantity) {
      setActionMessage(`Only ${selectedVariantQuantity} left for the selected size and color.`);
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

  const handleColorSelect = (color: string) => {
    setSelectedColor(color);

    const mappedIndex = colorImageMap.get(normalizeColorValue(color));
    if (typeof mappedIndex === "number") {
      setActiveImage(mappedIndex);
      return;
    }

    setActiveImage(0);
  };

  const handleBuyNow = () => {
    if (!selectedSize) {
      setActionMessage("Please choose a size before checking out.");
      return;
    }

    if (selectedVariantQuantity < quantity) {
      setActionMessage(`Only ${selectedVariantQuantity} left for the selected size and color.`);
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

  const jumpToReviews = () => {
    reviewsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleReviewSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setReviewNotice(null);
    setSubmittingReview(true);

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          name: reviewForm.name.trim(),
          city: reviewForm.city.trim(),
          rating: reviewForm.rating,
          review: reviewForm.review.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ProductReview;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Failed to submit review");
      }

      setReviews((current) => [payload.data as ProductReview, ...current]);
      setReviewForm({ name: "", city: "", rating: 5, review: "" });
      setReviewNotice("Review submitted successfully.");
    } catch (error) {
      setReviewNotice(error instanceof Error ? error.message : "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  const reviewStars = (value: number) =>
    Array.from({ length: 5 }).map((_, index) => {
      const active = index < value;
      return <Star key={index} className={`h-4 w-4 ${active ? "fill-[#7FA08D] text-[#7FA08D]" : "text-[#D8CCBC]"}`} />;
    });

  const sizeChartModal = showSizeChart ? (
  <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
    <div className="relative flex max-h-[1000vh] w-full max-w-7xl flex-col overflow-hidden rounded-[2rem] border border-[#ead9c1] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.3)]">
      <div className="flex items-center justify-between border-b border-[#ead9c1] px-5 py-2 sm:px-6">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Size chart</p>
          <h3 className="text-2xl font-extrabold text-[#2F2A22]">Find the right fit</h3>
        </div>
        <button
          type="button"
          onClick={() => setShowSizeChart(false)}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead9c1] bg-white text-[#2F2A22]"
          aria-label="Close size chart modal"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="overflow-y-auto bg-[#FCF5EE] p-4 sm:p-6">
        <div className="overflow-hidden rounded-[1.5rem] border border-[#ead9c1] bg-white">
          <Image
            src="/chart.png"
            alt="Size chart"
            width={1200}
            height={1600}
            className="h-auto w-full object-contain"
            priority={false}
          />
        </div>
      </div>
    </div>
  </div>
) : null;

  const reviewsModal = showMoreReviews ? (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-[2rem] border border-[#ead9c1] bg-white shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between border-b border-[#ead9c1] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">More reviews</p>
            <h3 className="text-2xl font-extrabold text-[#2F2A22]">All customer feedback</h3>
          </div>
          <button
            type="button"
            onClick={() => setShowMoreReviews(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#ead9c1] bg-white text-[#2F2A22]"
            aria-label="Close reviews modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-[#ead9c1] bg-[#FCF5EE] px-5 py-5 lg:border-b-0 lg:border-r sm:px-6">
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Leave a review</p>
            <form className="mt-4 space-y-4" onSubmit={handleReviewSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">Name</span>
                <input
                  value={reviewForm.name}
                  onChange={(event) => setReviewForm((current) => ({ ...current, name: event.target.value }))}
                  required
                  className="h-12 w-full rounded-2xl border border-[#ead9c1] bg-white px-4 text-sm text-[#2F2A22] outline-none focus:border-[#7FA08D]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">City</span>
                <input
                  value={reviewForm.city}
                  onChange={(event) => setReviewForm((current) => ({ ...current, city: event.target.value }))}
                  required
                  className="h-12 w-full rounded-2xl border border-[#ead9c1] bg-white px-4 text-sm text-[#2F2A22] outline-none focus:border-[#7FA08D]"
                />
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">Rating</span>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const rating = index + 1;
                    const active = rating <= reviewForm.rating;

                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setReviewForm((current) => ({ ...current, rating }))}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-transform hover:scale-105 ${active ? "border-[#7FA08D] bg-[#7FA08D] text-white" : "border-[#ead9c1] bg-white text-[#D8CCBC]"}`}
                        aria-label={`Set rating to ${rating}`}
                      >
                        <Star className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
                      </button>
                    );
                  })}
                  <span className="ml-2 self-center text-sm font-semibold text-[#2F2A22]">{reviewForm.rating}/5</span>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">Review</span>
                <textarea
                  value={reviewForm.review}
                  onChange={(event) => setReviewForm((current) => ({ ...current, review: event.target.value }))}
                  required
                  rows={5}
                  className="w-full rounded-2xl border border-[#ead9c1] bg-white px-4 py-3 text-sm text-[#2F2A22] outline-none focus:border-[#7FA08D]"
                />
              </label>

              {reviewNotice ? <p className="text-sm font-medium text-[#7FA08D]">{reviewNotice}</p> : null}

              <button
                type="submit"
                disabled={submittingReview}
                className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-[#293A55] px-5 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submittingReview ? "Submitting..." : "Submit review"}
              </button>
            </form>
          </div>

          <div className="flex min-h-0 flex-col bg-white px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Customer reviews</p>
                <h4 className="text-xl font-extrabold text-[#2F2A22]">All product feedback</h4>
              </div>
              <div className="rounded-full bg-[#FCF5EE] px-4 py-2 text-sm font-semibold text-[#2F2A22]">{reviews.length} reviews</div>
            </div>

            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {hiddenReviews.map((review) => (
                <article key={review.id} className="rounded-2xl border border-[#ead9c1] bg-[#FCF5EE] px-4 py-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#2F2A22]">{review.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8f836f]">{review.city}</p>
                    </div>
                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#7A6F5D]">
                      {new Date(review.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">{reviewStars(review.rating)}</div>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7FA08D]">{review.rating}/5</span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-[#5c5445]">{review.review}</p>
                </article>
              ))}
              {hiddenReviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#ead9c1] bg-[#FCF5EE] px-6 py-10 text-center text-sm text-[#7a6f5d]">
                  There are no extra reviews beyond the preview set.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : null;

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
        <div className="flex flex-col gap-10 lg:flex-row lg:items-stretch">

          {/* Image gallery — main image on top (smaller, zoom-on-hover), thumbnails below, arrows on all breakpoints */}
          <div className="flex w-full max-w-md lg:max-w-[461px] flex-col gap-3 lg:shrink-0">
            {/* Main image */}
            <div
              ref={imageWrapRef}
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleImageMouseMove}
              className="relative aspect-square w-full flex-1 overflow-hidden rounded-2xl bg-[#EFE9DF] shadow-[0_12px_32px_rgba(41,58,85,0.10)] cursor-zoom-in lg:aspect-auto lg:min-h-[535px]"
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
          <div className="grid w-full gap-5 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
            <div className="flex w-full flex-col justify-center gap-3.5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest text-[#7FA08D]" style={{ fontFamily: FONT_HEADING }}>
                {product.category ?? "Accessories"} · {grandParentLabel} · {parentLabel}
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
                  Save {discountPercent}%
                </span>
              </div>
              <button
                type="button"
                onClick={jumpToReviews}
                className="mt-3 flex items-center gap-3 rounded-full border border-[#E8DDCC] bg-white px-4 py-2 text-left text-sm text-[#3d372c] shadow-sm transition-transform hover:scale-[1.01]"
              >
                <div className="flex items-center gap-1">
                  {averageRating > 0 ? reviewStars(roundedAverageRating) : reviewStars(0)}
                </div>
                <span className="font-semibold text-[#2F2A22]">
                  {reviewsLoading ? "Loading reviews..." : averageRating > 0 ? averageRating.toFixed(1) : "0.0"}
                </span>
                <span className="text-[#7A6F5D]">
                  {reviews.length > 0 ? `${reviews.length} review${reviews.length === 1 ? "" : "s"}` : "Be the first to review"}
                </span>
              </button>
            </div>

            <hr className="border-[#C86909]/60" />

            {/* Description */}
            {product.description && (
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-[#6B7280]">
                {product.description}
              </p>
            )}

            {/* Colour — only rendered/selectable if the product actually has colors */}
            {availableColors.length > 0 && (
              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>
                  Colour{selectedColor && <span className="ml-2 font-normal text-[#7FA08D]">— {selectedColor}</span>}
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {availableColors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      title={c}
                      onClick={() => handleColorSelect(c)}
                      className={`h-9 w-9 rounded-full border-2 transition-all hover:scale-110 cursor-pointer ${
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
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>
                    Age / Size
                    {selectedSize && <span className="ml-2 font-normal text-[#7FA08D]">— {selectedSize}</span>}
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="text-sm font-semibold underline decoration-[#E8735F] decoration-2 underline-offset-4 text-[#2F2A22] transition-colors hover:text-[#E8735F]"
                  >
                    Size Chart
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setSelectedSize(size === selectedSize ? null : size)}
                      className={`rounded-full border px-4.5 py-2 text-base font-medium transition-all cursor-pointer ${
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

            {/* Quantity + Stock — on the same row, stock aligned to the right */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="mb-1.5 text-sm font-semibold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>Quantity</p>
                <div className="inline-flex items-center rounded-full border border-[#D8CCBC] bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F5E8D8] cursor-pointer"
                  >
                    <Minus className="h-4 w-4 text-[#3d372c]" />
                  </button>
                  <span className="w-10 text-center text-base font-bold text-[#3d372c]" style={{ fontFamily: FONT_HEADING }}>
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-[#F5E8D8] cursor-pointer"
                  >
                    <Plus className="h-4 w-4 text-[#3d372c]" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 rounded-full ${selectedVariantQuantity > 0 ? "bg-[#7FA08D]" : "bg-red-400"}`} />
                <span className="text-xs text-[#6B7280]">
                  {selectedVariantQuantity > 0
                    ? selectedVariantQuantity === Number.MAX_SAFE_INTEGER
                      ? "In Stock"
                      : `${selectedVariantQuantity} left for selected variant`
                    : "Currently unavailable for selected variant"}
                </span>
              </div>
            </div>
          </div>
            <div className="mx-auto w-full max-w-xs lg:sticky lg:top-6">
              <aside className="rounded-[1.5rem] border border-[#E8DDCC] bg-[#FCF5EE] p-4 shadow-[0_10px_28px_rgba(41,58,85,0.06)]">
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#7FA08D]/10 text-[#7FA08D]">
                        <Zap className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Express</p>
                        <p className="mt-1 text-sm font-semibold text-[#2F2A22]">Instant dispatch, no delays.</p>
                        <p className="mt-1 text-xs text-[#7A6F5D]">Dispatch today: {serviceInfo.dispatchLabel}</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#E8735F]/10 text-[#E8735F]">
                        <Truck className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8735F]">Expected delivery</p>
                        <p className="mt-1 text-sm font-semibold text-[#2F2A22]">{serviceInfo.deliveryLabel}</p>
                        <p className="mt-1 text-xs text-[#7A6F5D]">Order today and receive it in about 3 days.</p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#293A55]/10 text-[#293A55]">
                        <RotateCcw className="h-5 w-5" />
                      </span>
                      <div>
                        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#293A55]">Easy returns</p>
                        <p className="mt-1 text-sm font-semibold text-[#2F2A22]">Refund and exchange within 17 days.</p>
                        <p className="mt-1 text-xs text-[#7A6F5D]">Hassle free support if the fit is not right.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </aside>

              {/* CTA buttons — below the express section, outside its div */}
              <div className="mt-4 flex flex-col gap-2.5">
                <div className="flex items-stretch gap-2.5">
                  <button
                    type="button"
                    disabled={!product.inStock}
                    onClick={handleAddToCart}
                    className="flex h-14 flex-1 items-center justify-center gap-2 rounded-full border border-[#D8CCBC] bg-white px-4 text-sm font-bold text-[#3d372c] transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                    style={{ fontFamily: FONT_HEADING }}
                  >
                    <ShoppingCart className="h-4 w-4" />
                    Add to Cart
                  </button>

                  <button
                    type="button"
                    onClick={() => void toggleFav(product)}
                    className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-bold transition-transform hover:scale-105 cursor-pointer ${
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

                <button
                  type="button"
                  disabled={!product.inStock}
                  onClick={handleBuyNow}
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-full px-4 text-base font-bold text-white transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
                  style={{ background: "#7FA08D", fontFamily: FONT_HEADING }}
                >
                  <Zap className="h-4 w-4" />
                  Buy Now
                </button>

                {actionMessage ? (
                  <p className="text-center text-sm font-medium text-[#7FA08D]" aria-live="polite">
                    {actionMessage}
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        <div ref={reviewsSectionRef} className="mt-16 rounded-[2rem] border border-[#E8DDCC] bg-white px-5 py-6 shadow-[0_12px_32px_rgba(41,58,85,0.06)] sm:px-7">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Reviews</p>
              <h2 className="mt-2 text-2xl font-extrabold text-[#2F2A22]" style={{ fontFamily: FONT_HEADING }}>
                What customers say about {product.name}
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#6B7280]">
                Reviews are tied to this product only, so the feedback here reflects this exact listing.
              </p>
              <button
                type="button"
                onClick={() => setShowMoreReviews(true)}
                className="mt-5 inline-flex h-14 items-center justify-center rounded-full px-7 text-base font-bold text-white shadow-sm transition-transform hover:scale-105"
                style={{ background: "#7FA08D", fontFamily: FONT_HEADING }}
              >
                Write a Review
              </button>
            </div>

            <div className="grid min-w-[16rem] gap-3 rounded-[1.5rem] bg-[#FCF5EE] p-4">
              <div className="flex items-center gap-2 text-[#7FA08D]">
                <span className="text-3xl font-extrabold">{averageRating > 0 ? averageRating.toFixed(1) : "0.0"}</span>
                <div className="flex items-center gap-1">{reviewStars(roundedAverageRating)}</div>
              </div>
              <p className="text-sm text-[#7A6F5D]">Based on {reviews.length} customer review{reviews.length === 1 ? "" : "s"}</p>
              <div className="space-y-2">
                {ratingDistribution.map(({ rating, count }) => {
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                  return (
                    <div key={rating} className="flex items-center gap-3 text-xs text-[#7A6F5D]">
                      <span className="w-6 font-semibold text-[#2F2A22]">{rating}★</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-white">
                        <div className="h-full rounded-full bg-[#7FA08D]" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="w-8 text-right font-semibold">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {reviewsError ? <p className="mt-5 text-sm font-medium text-rose-500">{reviewsError}</p> : null}

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {reviewsLoading ? (
              <div className="rounded-[1.5rem] border border-dashed border-[#E8DDCC] bg-[#FCF5EE] px-6 py-10 text-center text-sm text-[#7a6f5d] md:col-span-2">
                Loading reviews...
              </div>
            ) : visibleReviews.length > 0 ? (
              visibleReviews.map((review) => (
                <article key={review.id} className="flex h-full flex-col rounded-[1.5rem] border border-[#E8DDCC] bg-white px-5 py-5 shadow-[0_10px_28px_rgba(41,58,85,0.06)]">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-bold text-[#2F2A22]">{review.name}</p>
                      <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8f836f]">{review.city}</p>
                    </div>
                    <div className="text-right text-xs text-[#7A6F5D]">
                      <p className="font-semibold">{new Date(review.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1">{reviewStars(review.rating)}</div>
                    <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#7FA08D]">{review.rating}/5</span>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-[#5c5445]">{review.review}</p>
                </article>
              ))
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-[#E8DDCC] bg-[#FCF5EE] px-6 py-10 text-center md:col-span-2">
                <p className="text-lg font-bold text-[#2F2A22]">No reviews yet</p>
                <p className="mt-2 text-sm text-[#7a6f5d]">Be the first to leave feedback for this product.</p>
              </div>
            )}
          </div>

          {!reviewsLoading && reviews.length > 6 ? (
            <div className="mt-5 flex justify-center">
              <button
                type="button"
                onClick={() => setShowMoreReviews(true)}
                className="inline-flex h-12 items-center justify-center rounded-full border border-[#E8DDCC] bg-white px-5 text-sm font-bold text-[#2F2A22] shadow-sm transition-transform hover:scale-[1.01]"
              >
                More reviews
              </button>
            </div>
          ) : null}
        </div>



            <div className="mt-20 mb-8 flex w-full justify-center">
            <div className="h-0 w-full border-t border-[#C86909]/60" />
            </div>

        {/* Related — comes last */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="mb-5 text-xl font-extrabold text-[#2F2A22] sm:text-2xl" style={{ fontFamily: FONT_HEADING }}>
              More in {product.category ?? "Accessories"}
            </h2>
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`${relatedHrefBase ?? backHref}/${rel.id}`}
                  className="group overflow-hidden rounded-xl border border-[#E8DDCC] bg-white shadow-sm transition-transform hover:scale-[1.02]"
                >
                  <div className="relative aspect-square bg-[#F7EFE4]">
                    <Image
                      src={getProductImage(rel)}
                      alt={rel.name}
                      fill
                      className="object-cover"
                      sizes="25vw"
                    />
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
        {showSizeChart ? createPortal(sizeChartModal, document.body) : null}
        {showMoreReviews ? createPortal(reviewsModal, document.body) : null}
      </div>
    </div>
  );
}