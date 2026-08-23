"use client";

import { useCallback, useEffect, useState } from "react";
import type { Product } from "../data/demo";
import { getProductImage } from "../utils/product-image";

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface FavouriteItem {
  id:        string;
  productId: string;
  name:      string;
  price:     number;
  image:     string;
  category:  string;
  ageGroup:  string;
  gender:    string;
}

export function useFavourites() {
  const [favouriteIds, setFavouriteIds] = useState<Set<string>>(new Set());
  const [loading,      setLoading]      = useState(false);

  // Load the user's current favourite IDs once on mount
  useEffect(() => {
    void (async () => {
      try {
        const res = await fetch(`${API}/api/favourites`, { credentials: "include" });
        if (!res.ok) return; // not logged in — silent
        const json = (await res.json()) as { success: boolean; data: FavouriteItem[] };
        setFavouriteIds(new Set(json.data.map((f) => f.productId)));
      } catch {
        /* network error — ignore */
      }
    })();
  }, []);

  const toggle = useCallback(async (product: Product) => {
    const isFav = favouriteIds.has(product.id);
    setLoading(true);
    try {
      if (isFav) {
        await fetch(`${API}/api/favourites/${product.id}`, {
          method: "DELETE",
          credentials: "include",
        });
        setFavouriteIds((prev) => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      } else {
        await fetch(`${API}/api/favourites`, {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            productId: product.id,
            name:      product.name,
            price:     product.price,
            image:     getProductImage(product),
            category:  product.category ?? "Accessories",
            ageGroup:  product.ageGroup,
            gender:    product.gender ?? "accessories",
          }),
        });
        setFavouriteIds((prev) => new Set([...prev, product.id]));
      }
    } catch {
      /* network error — ignore */
    } finally {
      setLoading(false);
    }
  }, [favouriteIds]);

  return { favouriteIds, toggle, loading };
}
