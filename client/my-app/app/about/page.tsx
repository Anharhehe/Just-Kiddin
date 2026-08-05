import { Heart, ShieldCheck, Cloud, Gift } from "lucide-react";
import Image from "next/image";

/**
 * Just KiDiN' — About Us
 * --------------------------------------------------------------
 * Single-section page, matching the reference image 1:1.
 * Fonts match the rest of the app:
 *   Heading : "Quicksand"
 *   Body    : "Quicksand"
 *
 * Make sure both are loaded globally, e.g. in app/layout.tsx:
 *
 *   import { Quicksand } from "next/font/google";
 *   const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-body" });
 *   // apply `${quicksand.variable}` to <html> or <body>
 * --------------------------------------------------------------
 */

const FONT_HEADING = "'Quicksand', sans-serif";
const FONT_BODY    = "'Quicksand', sans-serif";

const DEEP_NAVY   = "#0F2540";
const SOFT_TEAL   = "#DCE6DE";
const CORAL       = "#FF7D6B";
const WARM_IVORY  = "#F8F5EF";
const YELLOW = "#dbc548";
const PURPLE = "#b36dcf";
const GREEN = "#3a988a";

const values = [
  { icon: ShieldCheck, label: "Premium Quality" },
  { icon: Heart,       label: "Made with Love" },
  { icon: Cloud,       label: "Comfort First" },
  { icon: Gift,        label: "Thoughtful Design" },
];

export default function AboutPage() {
  return (
    <section className="bg-[0000]" style={{ fontFamily: FONT_BODY }}>
      <div className="mx-auto grid max-w-[90rem] items-center gap-16 px-10 py-16 sm:px-16 lg:px-24 md:grid-cols-2 md:py-24">
        {/* ---------- Left: copy ---------- */}
        <div>
        <h1
          className="flex items-center gap-3 text-4xl font-extrabold sm:text-5xl"
          style={{ fontFamily: FONT_HEADING }}
        >
          <span>
            <span style={{ color: "#2F2A22" }}>About </span>
            <span style={{ color: GREEN }}>J</span>
            <span style={{ color: CORAL }}>U</span>
            <span style={{ color: YELLOW }}>S</span>
            <span style={{ color: PURPLE }}>T</span>{" "}
            <span style={{ color: "#2F2A22" }}>KiDiN</span>
            <span style={{ color: CORAL }}>'</span>
          </span>

          <Heart
            className="h-8 w-8 fill-rose-400 text-rose-400"
            strokeWidth={1.5}
          />
        </h1>

            <p
            className="mt-5 max-w-md text-[15px] leading-relaxed text-[#7A6F5D]"
            style={{ fontFamily: FONT_HEADING }}
            >
            At Just KiDiN', we believe every little moment deserves the
            softest touch. Our collections are thoughtfully designed and
            crafted with love, using premium quality fabrics that are gentle
            on your little one's skin.
            </p>

          <div className="mt-10 grid max-w-lg grid-cols-4 gap-10 ">
            {values.map(({ icon: Icon, label }) => (
              <div key={label} className="flex flex-col items-center text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DCE6DE]">
                  <Icon className="h-10 w-10 text-[#2F2A22]" strokeWidth={1.75} />
                </div>
                <p
                  className="mt-2 text-xs font-semibold leading-tight text-[#2F2A22]"
                  style={{ fontFamily: FONT_HEADING }}
                >
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---------- Right: image ---------- */}
        <div className="relative flex items-center justify-center w-full aspect-[6/5] rounded-[4.5rem] bg-[#F5E6D3] overflow-hidden -mt-6">
          <Image
            src="/3.png"
            alt="Just KiDiN' baby clothing collection"
            width={900}
            height={675}
            className="w-[155%] h-auto"
            priority
            
          />
        </div>
      </div>
    </section>
  );
}