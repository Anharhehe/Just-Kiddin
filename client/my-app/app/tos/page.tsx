import { CheckCircle2, MessageCircle } from "lucide-react";
import Image from "next/image";

/**
 * Just KiDiN' — Terms of Service
 * --------------------------------------------------------------
 * Built to mirror ExchangePolicyPage exactly — same structure,
 * same classes, same single typeface throughout.
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

const dotColors = [GREEN, CORAL, YELLOW, PURPLE];

const sections = [
  {
    title: "Product Information",
    body: "We strive to ensure that all product descriptions, images, and prices are accurate. However, slight variations in color may occur due to lighting, photography, and individual screen settings.",
  },
  {
    title: "Pricing & Payments",
    body: "All prices are listed in Pakistani Rupees (PKR) and are subject to change without prior notice. Orders will only be processed once payment or order confirmation has been received, depending on the selected payment method.",
  },
  {
    title: "Order Acceptance",
    body: "We reserve the right to accept, decline, or cancel any order at our sole discretion. In the event of cancellation, any prepaid amount will be refunded accordingly.",
  },
  {
    title: "Shipping & Delivery",
    body: "Estimated delivery times are provided for convenience and may vary depending on location, courier services, and unforeseen circumstances. Just Kidin' is not liable for delays caused by third-party courier companies.",
  },
  {
    title: "Exchange & Returns",
    body: "All exchanges and returns are subject to our Exchange & Return Policy. Customers are encouraged to review the policy before placing an order.",
  },
  {
    title: "Customer Responsibility",
    body: "Customers are responsible for providing accurate shipping and contact information. Just Kidin' will not be responsible for delays or failed deliveries resulting from incorrect information provided by the customer.",
  },
  {
    title: "Intellectual Property",
    body: "All logos, designs, photographs, product images, and content published by Just Kidin' are the intellectual property of the brand and may not be copied, reproduced, or used without prior written permission.",
  },
  {
    title: "Limitation of Liability",
    body: "Just Kidin' shall not be held liable for any indirect, incidental, or consequential damages arising from the use or purchase of our products beyond the amount paid for the respective order.",
  },
  {
    title: "Policy Changes",
    body: "We reserve the right to modify or update these Terms of Service at any time. Any changes will become effective immediately upon publication on our official platforms.",
  },
];

export default function TermsOfServicePage() {
  return (
    <section className="bg-[#0000]" style={{ fontFamily: FONT_BODY }}>
      <div className="mx-auto grid max-w-[90rem] items-start gap-16 px-10 py-16 sm:px-16 lg:px-24 md:grid-cols-2 md:py-24">
        {/* ---------- Left: copy ---------- */}
        <div>

          <h1
            className="-mt-10 text-3xl font-extrabold leading-tight sm:text-4xl"
            style={{ fontFamily: FONT_HEADING }}
          >
            <span style={{ color: INK }}>Terms of</span>{" "}
            <span style={{ color: CORAL }}>Service</span>
          </h1>

          <p className="mt-4 max-w-md text-[18px] leading-relaxed" style={{ color: MUTED }}>
            Welcome to Just Kidin'. By placing an order through our website
            or social media platforms, you agree to the following Terms of
            Service.
          </p>

          <div className="mt-8 max-w-lg rounded-[2rem] bg-white/70 p-6 shadow-sm ring-1 ring-black/[0.03] backdrop-blur-sm sm:p-7">
            <ul className="space-y-4">
              {sections.map((section, i) => {
                const color = dotColors[i % dotColors.length];
                return (
                  <li key={section.title} className="flex items-start gap-3">
                    <span
                      className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${color}1A` }}
                    >
                      <CheckCircle2 className="h-4 w-4" style={{ color }} strokeWidth={2.25} />
                    </span>
                    <span className="text-base leading-relaxed" style={{ color: INK }}>
                      <span className="font-bold">{section.title}.</span>{" "}
                      {section.body}
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
              For any questions regarding your order or our policies, please
              contact us through our official customer support channels.
            </p>
          </div>

          <p className="mt-6 ml-0 md:mt-15 md:ml-14 text-lg font-semibold" style={{ color: CORAL }}>
            By placing an order with Just Kidin', you agree to these Terms of Service.
          </p>

        </div>
      </div>
    </section>
  );
}