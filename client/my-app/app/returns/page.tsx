import { CheckCircle2, MessageCircle, Sparkles } from "lucide-react";
import Image from "next/image";

/**
 * Just KiDiN' — Exchange & Return Policy
 * --------------------------------------------------------------
 * Matches AboutPage / FaqsPage design language 1:1.
 *   Heading : "Quicksand"
 *   Body    : "Quicksand"
 * --------------------------------------------------------------
 */

const FONT_HEADING = "'Quicksand', sans-serif";
const FONT_BODY    = "'Quicksand', sans-serif";

const CORAL  = "#FF7D6B";
const YELLOW = "#dbc548";
const PURPLE = "#b36dcf";
const GREEN  = "#3a988a";
const INK    = "#2F2A22";
const MUTED  = "#7A6F5D";

const policyPoints = [
  "Exchange requests must be made within 7 days of receiving your order.",
  "Items must be unused, unwashed, and returned with all original tags and packaging intact.",
  "We only offer exchanges for size issues, damaged items, or if you receive the wrong product.",
  "Sale, discounted, and promotional items are not eligible for exchange unless they arrive damaged or incorrect.",
  "Returns for refunds are not accepted unless the product is defective or an incorrect item was delivered.",
  "Customers are responsible for exchange shipping charges unless the mistake is on our end.",
  "If the requested size or item is unavailable, you may exchange it for another product of equal value, or pay the price difference for a higher-priced one.",
  "Any product found to be used, washed, or damaged by the customer will not qualify for exchange.",
];

const dotColors = [GREEN, CORAL, YELLOW, PURPLE];

export default function ExchangePolicyPage() {
  return (
    <section className="relative overflow-hidden bg-[0000]" style={{ fontFamily: FONT_BODY }}>
      {/* soft decorative backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full opacity-40 blur-3xl"
        style={{ background: "#DCE6DE" }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-32 left-[-6rem] h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{ background: "#F5E6D3" }}
      />

      <div className="relative mx-auto grid max-w-[90rem] items-start gap-16 px-10 py-16 sm:px-16 lg:px-24 md:grid-cols-2 md:py-24">
        {/* ---------- Left: copy ---------- */}
        <div>

          <h1
            className="-mt-10 text-3xl font-extrabold leading-tight sm:text-4xl"
            style={{ fontFamily: FONT_HEADING }}
          >
            <span style={{ color: GREEN }}>Exchange</span>{" "}
            <span style={{ color: INK }}>&amp;</span>{" "}
            <span style={{ color: CORAL }}>Return</span>{" "}
            <span style={{ color: INK }}>Policy</span>
          </h1>

          <p className="mt-4 max-w-md text-[18px] leading-relaxed" style={{ color: MUTED }}>
            At Just KiDiN', we want you to love what you wear. If something
            isn't quite right, we've made exchanges simple and hassle-free.
          </p>

          <div className="mt-8 max-w-lg rounded-[2rem] bg-white/70 p-6 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm sm:p-7">
            <ul className="space-y-4">
              {policyPoints.map((point, i) => {
                const color = dotColors[i % dotColors.length];
                return (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${color}1A` }}
                    >
                      <CheckCircle2 className="h-4 w-4" style={{ color }} strokeWidth={2.25} />
                    </span>
                    <span className="text-base leading-relaxed" style={{ color: INK }}>
                      {point}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

        </div>

        {/* ---------- Right: image ---------- */}
        <div className="md:sticky md:top-24">
          <div className="-mt-10 relative ml-auto flex aspect-[6/5] w-full max-w-xl items-center justify-center overflow-hidden rounded-[4.5rem] bg-[#F5E6D3]">
            <Image
              src="/3.png"
              alt="Just KiDiN' baby clothing collection"
              width={900}
              height={675}
              className="h-auto w-[155%]"
              priority
            />
          </div>

           <div className="mt-8 ml-0 md:mt-20 md:ml-12 flex max-w-lg items-start gap-3 rounded-3xl bg-[#DCE6DE] px-6 py-5">
            <MessageCircle className="mt-0.5 h-6 w-6 shrink-0" style={{ color: INK }} strokeWidth={1.75} />
            <p className="text-base leading-relaxed" style={{ color: INK }}>
              To request an exchange, reach out through our official social
              media pages or customer support with your order number and
              clear pictures, if applicable.
            </p>
          </div>

          <p className="mt-6 ml-0 md:mt-15 md:ml-30 text-lg font-semibold" style={{ color: CORAL }}>
            Thank you for shopping with Just Kidin'!
          </p>

        </div>
      </div>
    </section>
  );
}