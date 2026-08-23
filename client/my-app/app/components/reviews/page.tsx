"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Loader2, MapPin, PenLine, Plus, Star, X } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const PAGE_SIZE = 5;

type ReviewRecord = {
  id: string;
  name: string;
  city: string;
  rating: number;
  review: string;
  createdAt: string;
  updatedAt: string;
};

type FormState = {
  name: string;
  city: string;
  rating: number;
  review: string;
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function Stars({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, index) => {
        const filled = index < value;
        return <Star key={index} className={`h-4 w-4 ${filled ? "fill-[#E8735F] text-[#E8735F]" : "text-[#D8CCBC]"}`} />;
      })}
    </div>
  );
}

export default function ReviewsWidget() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>({ name: "", city: "", rating: 5, review: "" });
  const [reviews, setReviews] = useState<ReviewRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return reviews.reduce((sum, item) => sum + item.rating, 0) / reviews.length;
  }, [reviews]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const loadReviews = async (skip = 0, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      const response = await fetch(`/api/reviews?limit=${PAGE_SIZE}&skip=${skip}`);
      const payload = (await response.json()) as {
        success?: boolean;
        data?: { reviews?: ReviewRecord[]; total?: number; hasMore?: boolean };
        message?: string;
      };

      if (!response.ok || !payload.success) {
        throw new Error(payload.message ?? "Failed to load reviews");
      }

      const nextReviews = payload.data?.reviews ?? [];
      setTotal(payload.data?.total ?? 0);
      setHasMore(Boolean(payload.data?.hasMore));
      setReviews((current) => (append ? [...current, ...nextReviews] : nextReviews));
    } catch {
      setError("Unable to load reviews right now.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    void loadReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);

    try {
      const response = await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          city: form.city.trim(),
          rating: form.rating,
          review: form.review.trim(),
        }),
      });

      const payload = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: ReviewRecord;
      };

      if (!response.ok || !payload.success || !payload.data) {
        throw new Error(payload.message ?? "Failed to submit review");
      }

      setSuccess("Review submitted successfully.");
      setForm({ name: "", city: "", rating: 5, review: "" });
      await loadReviews();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const modal = (
    <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/50 p-4 backdrop-blur-sm sm:p-6">
      <div className="flex max-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-[#e3dccb] bg-[#FCF5EE] shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="flex items-center justify-between border-b border-[#e3dccb] px-5 py-4 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Reviews</p>
            <h2 className="text-2xl font-extrabold text-[#293A55]">Share your experience</h2>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-[#293A55] shadow-sm cursor-pointer"
            aria-label="Close reviews modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid min-h-0 flex-1 gap-0 overflow-hidden lg:grid-cols-[0.95fr_1.05fr]">
          <section className="flex min-h-0 flex-col overflow-y-auto border-b border-[#e3dccb] bg-white px-5 py-5 sm:px-6 lg:border-b-0 lg:border-r">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#293A55]/5 text-[#293A55]">
                <PenLine className="h-6 w-6" />
              </span>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Write a review</p>
                <h3 className="text-xl font-extrabold text-[#293A55]">Tell us what you think</h3>
              </div>
            </div>

            <form className="mt-5 flex min-h-0 flex-1 flex-col gap-4" onSubmit={handleSubmit}>
              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">Name</span>
                <input
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Your name"
                  required
                  className="h-12 w-full cursor-text rounded-2xl border border-[#e3dccb] bg-[#FCF5EE] px-4 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#E8735F]"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">City</span>
                <div className="relative">
                  <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7A6F5D]" />
                  <input
                    value={form.city}
                    onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                    placeholder="Your city"
                    required
                    className="h-12 w-full cursor-text rounded-2xl border border-[#e3dccb] bg-[#FCF5EE] pl-10 pr-4 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#E8735F]"
                  />
                </div>
              </label>

              <div>
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">Rating</span>
                <div className="flex flex-wrap items-center gap-2">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const rating = index + 1;
                    const active = rating <= form.rating;

                    return (
                      <button
                        key={rating}
                        type="button"
                        onClick={() => setForm((current) => ({ ...current, rating }))}
                        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-transform hover:scale-105 cursor-pointer ${active ? "border-[#E8735F] bg-[#E8735F] text-white" : "border-[#e3dccb] bg-white text-[#D8CCBC]"}`}
                        aria-label={`Set rating to ${rating}`}
                      >
                        <Star className={`h-5 w-5 ${active ? "fill-current" : ""}`} />
                      </button>
                    );
                  })}
                  <span className="ml-2 text-sm font-semibold text-[#293A55]">{form.rating}/5</span>
                </div>
              </div>

              <label className="block">
                <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-[#8f836f]">Review</span>
                <textarea
                  value={form.review}
                  onChange={(event) => setForm((current) => ({ ...current, review: event.target.value }))}
                  placeholder="Write your review here..."
                  required
                  rows={5}
                  className="w-full cursor-text resize-none rounded-2xl border border-[#e3dccb] bg-[#FCF5EE] px-4 py-3 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#E8735F]"
                />
              </label>

              <div className="min-h-[4.75rem] space-y-3">
                </div>

              <button
                type="submit"
                disabled={submitting}
                className="-mt-20 inline-flex h-12 w-full shrink-0 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#293A55] px-5 text-sm font-bold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                {submitting ? "Submitting..." : "Submit review"}
              </button>
            </form>
          </section>

          <section className="flex min-h-0 flex-col overflow-y-auto bg-[#FCF5EE] px-5 py-5 sm:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7FA08D]">Customer reviews</p>
                <h3 className="text-xl font-extrabold text-[#293A55]">What people are saying</h3>
              </div>
              <div className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#293A55] shadow-sm">
                {total} reviews
              </div>
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <div className="flex items-center gap-2 text-[#E8735F]">
                <Star className="h-5 w-5 fill-current" />
                <span className="text-lg font-extrabold">{averageRating ? averageRating.toFixed(1) : "0.0"}</span>
              </div>
              <span className="text-sm text-[#7a6f5d]">Average rating from loaded reviews</span>
            </div>

            <div className="mt-5 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
              {loading ? (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#d9c8ae] bg-white px-6 py-12 text-sm text-[#7a6f5d]">
                  Loading reviews...
                </div>
              ) : reviews.length > 0 ? (
                reviews.map((item) => (
                  <article key={item.id} className="rounded-2xl border border-[#ead9c1] bg-white px-4 py-4 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-bold text-[#293A55]">{item.name}</p>
                        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[#8f836f]">{item.city}</p>
                      </div>
                      <span className="rounded-full bg-[#f8f5ef] px-3 py-1 text-xs font-semibold text-[#7A6F5D]">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-3">
                      <Stars value={item.rating} />
                      <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#E8735F]">{item.rating}/5</span>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-[#5c5445]">{item.review}</p>
                  </article>
                ))
              ) : (
                <div className="flex h-full items-center justify-center rounded-2xl border border-dashed border-[#d9c8ae] bg-white px-6 py-12 text-center">
                  <div>
                    <p className="text-lg font-bold text-[#293A55]">No reviews yet</p>
                    <p className="mt-2 text-sm text-[#7a6f5d]">Be the first to share your experience.</p>
                  </div>
                </div>
              )}
            </div>

            {hasMore ? (
              <button
                type="button"
                onClick={() => void loadReviews(reviews.length, true)}
                disabled={loadingMore}
                className="mt-4 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-[#e3dccb] bg-white px-5 text-sm font-bold text-[#293A55] transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loadingMore ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {loadingMore ? "Loading more..." : "View more reviews"}
              </button>
            ) : (
              <div className="mt-4 rounded-2xl border border-dashed border-[#d9c8ae] bg-white px-5 py-3 text-center text-sm text-[#7a6f5d]">
                You have reached the end of the review list.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-24 right-5 z-[61] flex h-14 w-14 items-center justify-center rounded-full bg-[#E8735F] text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-transform hover:scale-105"
        aria-label="Open reviews"
      >
        <Star className="h-7 w-7 fill-current" />
      </button>

      {open ? createPortal(modal, document.body) : null}
    </>
  );
}