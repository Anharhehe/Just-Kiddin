"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Heart, Trash2 } from "lucide-react";
import type { FavouriteItem } from "../hooks/useFavourites";

const API          = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const FONT_HEADING = "'Quicksand', sans-serif";
const FONT_BODY    = "'Quicksand', sans-serif";

export default function FavouritesPage() {
  const [items,   setItems]   = useState<FavouriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed,  setAuthed]  = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${API}/api/favourites`, { credentials: "include" });
        if (res.status === 401) { setAuthed(false); setLoading(false); return; }
        const json = (await res.json()) as { success: boolean; data: FavouriteItem[] };
        setItems(json.data ?? []);
      } catch {
        /* network offline */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function remove(productId: string) {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
    await fetch(`${API}/api/favourites/${productId}`, {
      method: "DELETE",
      credentials: "include",
    });
  }

  function productHref(item: FavouriteItem) {
    const agp    = item.ageGroup === "newborn" ? "newborns" : "toddlers";
    const gender = item.gender === "boy" ? "boys" : "girls";
    // derive category slug from productId e.g. "newborn-boy-bodysuits-1" → "bodysuits"
    const parts  = item.productId.split("-");
    const slug   = parts.slice(2, parts.length - 1).join("-");
    return `/${agp}/${gender}/${slug}/${item.productId}`;
  }

  return (
    <div className="min-h-screen bg-[#0000]" style={{ fontFamily: FONT_BODY }}>
      {/* Header */}
      <div className="px-6 pt-10 pb-6 sm:px-[1in]">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 fill-rose-400 text-rose-400" />
          <h1 className="text-4xl font-extrabold text-[#2F2A22] sm:text-5xl" style={{ fontFamily: FONT_HEADING }}>
            My Favourites
          </h1>
        </div>
        <p className="mt-2 text-sm text-[#9a8f7f]">
          {loading ? "Loading…" : authed ? `${items.length} saved item${items.length !== 1 ? "s" : ""}` : ""}
        </p>
      </div>

      <div className="px-6 pb-20 sm:px-[1in]">
        {/* Not logged in */}
        {!loading && !authed && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <Heart className="h-20 w-20 text-[#E8D0C0]" />
            <p className="text-lg text-[#7A6F5D]" style={{ fontFamily: FONT_HEADING }}>
              Sign in to see your favourites
            </p>
            <Link
              href="/auth"
              className="rounded-full px-8 py-3 text-base font-bold text-white transition-transform hover:scale-105"
              style={{ background: "#E8735F", fontFamily: FONT_HEADING }}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Empty */}
        {!loading && authed && items.length === 0 && (
          <div className="flex flex-col items-center gap-6 py-24 text-center">
            <Heart className="h-20 w-20 text-[#E8D0C0]" />
            <p className="text-lg text-[#7A6F5D]" style={{ fontFamily: FONT_HEADING }}>
              No favourites yet
            </p>
            <p className="text-sm text-[#9a8f7f]">
              Tap the heart on any product to save it here.
            </p>
            <div className="flex gap-3">
              <Link href="/newborns" className="rounded-full border border-[#D8CCBC] bg-white px-6 py-3 text-sm font-bold text-[#3d372c] hover:scale-105 transition-transform" style={{ fontFamily: FONT_HEADING }}>
                Shop Newborns
              </Link>
              <Link href="/toddlers" className="rounded-full px-6 py-3 text-sm font-bold text-white hover:scale-105 transition-transform" style={{ background: "#E8735F", fontFamily: FONT_HEADING }}>
                Shop Toddlers
              </Link>
            </div>
          </div>
        )}

        {/* Skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl bg-[#EFE9DF] animate-pulse">
                <div className="aspect-square w-full" />
                <div className="space-y-2 p-3">
                  <div className="h-4 w-3/4 rounded bg-[#E0D5C5]" />
                  <div className="h-3 w-1/2 rounded bg-[#E0D5C5]" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {!loading && authed && items.length > 0 && (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-2xl border border-[#E8DDCC] bg-white shadow-sm transition-transform hover:scale-[1.02]">
                <Link href={productHref(item)} className="block">
                  <div className="relative aspect-square bg-[#F7EFE4]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-[#7FA08D]" style={{ fontFamily: FONT_HEADING }}>
                      {item.category}
                    </p>
                    <p className="mt-1 truncate text-sm font-bold text-[#2F2A22]" style={{ fontFamily: FONT_HEADING }}>
                      {item.name}
                    </p>
                    <p className="mt-1 text-sm font-bold text-[#E8735F]" style={{ fontFamily: FONT_HEADING }}>
                      PKR {item.price.toLocaleString()}
                    </p>
                  </div>
                </Link>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => void remove(item.productId)}
                  className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 shadow-sm transition-colors hover:bg-rose-50"
                  aria-label="Remove from favourites"
                >
                  <Trash2 className="h-4 w-4 text-rose-500" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
