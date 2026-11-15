"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Heart } from "lucide-react";

const ORDER_CONFIRMATION_STORAGE_KEY = "jk-order-confirmation";
const WHATSAPP_LINK = "https://wa.me/923222227004";

type OrderConfirmationItem = {
  name: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
};

type OrderConfirmation = {
  orderId: string;
  items: OrderConfirmationItem[];
  subtotal: number;
  discountAmount: number;
  deliveryCharge: number;
  totalAmount: number;
};

function formatCurrency(value: number) {
  return `PKR ${value.toLocaleString("en-PK")}`;
}

function parseOrderConfirmation(value: string): OrderConfirmation | null {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return null;
  }

  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  const confirmation = parsed as Partial<OrderConfirmation>;
  const validItems = Array.isArray(confirmation.items)
    && confirmation.items.every((item) => item
      && typeof item.name === "string"
      && typeof item.quantity === "number"
      && typeof item.price === "number"
      && typeof item.size === "string"
      && typeof item.color === "string");

  return typeof confirmation.orderId === "string"
    && validItems
    && typeof confirmation.subtotal === "number"
    && typeof confirmation.discountAmount === "number"
    && typeof confirmation.deliveryCharge === "number"
    && typeof confirmation.totalAmount === "number"
    ? confirmation as OrderConfirmation
    : null;
}

export default function ThankYouPage() {
  const [orderId, setOrderId] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<OrderConfirmation | null>(null);

  useEffect(() => {
    const currentOrderId = new URLSearchParams(window.location.search).get("orderId");
    setOrderId(currentOrderId);

    if (!currentOrderId) {
      return;
    }

    try {
      const saved = window.sessionStorage.getItem(ORDER_CONFIRMATION_STORAGE_KEY);
      const parsed = saved ? parseOrderConfirmation(saved) : null;

      if (parsed?.orderId === currentOrderId) {
        setConfirmation(parsed);
      }
    } catch (error) {
      console.error("Could not load order confirmation details:", error);
    }
  }, []);

  return (
    <main
      className="flex min-h-[70vh] items-center justify-center bg-[#0000] px-4 py-8 sm:px-10"
      style={{ fontFamily: "'Quicksand', sans-serif" }}
    >
      <div className="flex w-full max-w-2xl flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#4d7a6c]">
          <Check className="h-7 w-7 text-white" strokeWidth={3} />
        </div>

        <h1 className="mt-4 flex items-center gap-2 text-3xl font-semibold text-[#1f2937] sm:text-4xl">
          Thank You!
          <Heart className="h-6 w-6 fill-[#e0645a] text-[#e0645a]" />
        </h1>

        <p className="mt-2 text-[#6b7280]">Your order has been placed successfully.</p>
        <p className="mt-2 text-sm text-[#9ca3af]">We will call you shortly for order confirmation.</p>

        {orderId ? (
          <section className="mt-6 w-full rounded-3xl border border-[#e3dccb] bg-white p-5 text-left shadow-[0_12px_36px_rgba(0,0,0,0.06)] sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#7FA08D]">Your order ID</p>
            <p className="mt-2 break-all rounded-2xl bg-[#f8f5ef] px-4 py-3 font-mono text-sm font-semibold text-[#1f2937]">
              {orderId}
            </p>
            <p className="mt-2 text-sm font-semibold text-[#b45309]">Please save this order ID for tracking and support.</p>

            {confirmation ? (
              <div className="mt-6 border-t border-[#e3dccb] pt-5">
                <h2 className="text-lg font-bold text-[#1f2937]">Order summary</h2>
                <div className="mt-3 divide-y divide-[#eee7dc]">
                  {confirmation.items.map((item, index) => (
                    <div key={`${item.name}-${index}`} className="flex items-start justify-between gap-4 py-3 text-sm">
                      <div className="min-w-0">
                        <p className="font-semibold text-[#1f2937]">{item.name}</p>
                        <p className="mt-1 text-xs text-[#6b7280]">
                          {item.size ? `Size ${item.size} · ` : ""}
                          {item.color ? `Color ${item.color} · ` : ""}
                          Qty {item.quantity}
                        </p>
                      </div>
                      <p className="shrink-0 font-semibold text-[#1f2937]">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  ))}
                </div>
                <dl className="mt-3 space-y-2 border-t border-[#e3dccb] pt-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6b7280]">Subtotal</dt>
                    <dd className="font-medium text-[#1f2937]">{formatCurrency(confirmation.subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6b7280]">Discount</dt>
                    <dd className="font-medium text-[#1f2937]">-{formatCurrency(confirmation.discountAmount)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-[#6b7280]">Delivery</dt>
                    <dd className="font-medium text-[#1f2937]">
                      {confirmation.deliveryCharge === 0 ? "Free" : formatCurrency(confirmation.deliveryCharge)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4 border-t border-[#e3dccb] pt-3 text-base font-bold">
                    <dt className="text-[#1f2937]">Order total</dt>
                    <dd className="text-[#1f2937]">{formatCurrency(confirmation.totalAmount)}</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="mt-5 text-sm text-[#6b7280]">
                Your order summary is unavailable on this visit. Keep your order ID to track the order.
              </p>
            )}
          </section>
        ) : null}

        <p className="mt-6 max-w-xl text-sm leading-6 text-[#6b7280]">
          For order tracking, click the message button in the bottom-right corner. You can also contact our representative directly on WhatsApp.
        </p>
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex cursor-pointer items-center justify-center rounded-full border border-[#25D366] px-6 py-3 text-sm font-semibold text-[#168a41] transition-colors hover:bg-[#effcf3]"
        >
          Chat with us on WhatsApp
        </a>

        <Link
          href="/"
          className="mt-6 cursor-pointer rounded-full bg-[#4d7a6c] px-8 py-3 text-sm font-semibold tracking-wide text-white transition-colors hover:bg-[#3f6759]"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </main>
  );
}
