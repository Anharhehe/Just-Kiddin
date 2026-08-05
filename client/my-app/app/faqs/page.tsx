"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";

const FONT_HEADING = "'Quicksand', sans-serif";

const faqs = [
  {
    question: "How long does delivery take?",
    answer:
      "Orders are typically delivered within 3-5 business days across Pakistan, depending on your location.",
  },
  {
    question: "Do you offer Cash on Delivery?",
    answer:
      "Yes, Cash on Delivery is available all across Pakistan.",
  },
  {
    question: "What is your exchange policy?",
    answer:
      "We offer an easy 7-day exchange on all items, as long as tags are intact and items are unworn.",
  },
  {
    question: "How can I track my order?",
    answer:
      "Once your order ships, you'll receive a tracking link via email or SMS to follow its progress.",
  },
];

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b" style={{ borderColor: "#0000" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 text-left cursor-pointer"
        style={{ color: "#2F2A22", fontFamily: FONT_HEADING }}
      >
        <span className="text-base font-medium">{question}</span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ${
          open ? "max-h-40 opacity-100 pb-4" : "max-h-0 opacity-0"
        }`}
      >
        <p className="text-sm" style={{ color: "#7A6F5D", fontFamily: FONT_HEADING }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FaqsPage() {
  return (
    <section className="bg-[0000]">
      <div className="mx-auto grid max-w-[90rem] items-center gap-16 px-10 py-16 sm:px-16 lg:px-24 md:grid-cols-2 md:py-24">
        {/* ---------- Left: FAQ list ---------- */}
        <div>
          <h1
            className="text-3xl font-extrabold sm:text-4xl mb-8"
            style={{ color: "#2F2A22", fontFamily: FONT_HEADING }}
          >
            Frequently Asked Questions
          </h1>

          <div className="max-w-2xl">
            {faqs.map((faq) => (
              <FaqItem key={faq.question} question={faq.question} answer={faq.answer} />
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