"use client";

import { useEffect, useState } from "react";
import { Heart } from "lucide-react";

// Change this hex value whenever you want a different banner background
const BANNER_BG_COLOR = "#e8dbc8"; // warm ivory

const messages: string[] = [
  "FREE Shipping on Orders Above Rs. 3,000",
  "Flat 20% OFF on Your First Order – Shop Now!",
  "Buy 2, Get 1 FREE on Selected Kids Collection",
  "New Arrivals Just Dropped – Dress Your Little One in Style",
  "Premium Baby & Toddler Clothing at Affordable Prices",
  "Easy 7-Day Exchange for a Worry-Free Shopping Experience",
  "Cash on Delivery Available All Across Pakistan",
  "Trusted by Thousands of Happy Parents Nationwide",
  "Special Discounts on Matching Family & Kids Outfits",
  "Limited-Time Sale – Save Up to 50% Before It's Gone!",
];

const DISPLAY_DURATION = 5000; // ms each message stays fully visible
const FADE_DURATION = 500; // ms for the fade transition

export default function AnnouncementPanel() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // start fading out slightly before the display duration ends
    const fadeOutTimer = setTimeout(() => {
      setVisible(false);
    }, DISPLAY_DURATION - FADE_DURATION);

    // after the fade-out completes, swap message and fade back in
    const nextMessageTimer = setTimeout(() => {
      setIndex((prev) => (prev + 1) % messages.length);
      setVisible(true);
    }, DISPLAY_DURATION);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(nextMessageTimer);
    };
  }, [index]);

  return (
    <div
      className="relative w-full overflow-hidden py-0.5 px-4"
      style={{ backgroundColor: BANNER_BG_COLOR }}
    >
      {/* floating decorative hearts */}
      <Heart
        className="absolute left-[8%] top-1/2 -translate-y-1/2 text-rose-300/60 animate-[float_4s_ease-in-out_infinite]"
        size={16}
        fill="currentColor"
      />
      <Heart
        className="absolute left-[20%] top-1/2 -translate-y-1/2 text-rose-300/40 animate-[float_5s_ease-in-out_infinite]"
        size={12}
        fill="currentColor"
        style={{ animationDelay: "1s" }}
      />
      <Heart
        className="absolute right-[15%] top-1/2 -translate-y-1/2 text-rose-300/50 animate-[float_4.5s_ease-in-out_infinite]"
        size={14}
        fill="currentColor"
        style={{ animationDelay: "0.5s" }}
      />

      {/* message */}
      <div className="flex items-center justify-center min-h-[24px]">
        <p
          className="flex items-center gap-2 text-sm font-medium text-neutral-800 text-center transition-opacity ease-in-out"
          style={{
            opacity: visible ? 1 : 0,
            transitionDuration: `${FADE_DURATION}ms`,
          }}
        >
          <Heart size={14} className="text-red-500 shrink-0" fill="currentColor" />
          {messages[index]}
        </p>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(-50%) translateX(0px);
          }
          50% {
            transform: translateY(-60%) translateX(4px);
          }
        }
      `}</style>
    </div>
  );
}