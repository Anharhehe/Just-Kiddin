"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "../context/CartContext";

const FONT_HEADING = "'Quicksand', sans-serif";

function formatCurrency(amount: number) {
  return `PKR ${amount.toLocaleString()}`;
}

export default function CartPage() {
  const { items, subtotal, updateQuantity, removeItem, hydrated } = useCart();

  if (!hydrated) {
    return (
      <main className="min-h-[60vh] w-full bg-[#FCF5EE] px-6 py-14 sm:px-10" style={{ fontFamily: FONT_HEADING }}>
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <p className="text-sm text-[#7A6F5D]">Loading your cart...</p>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-[60vh] w-full bg-[#0000] px-6 py-14 sm:px-10" style={{ fontFamily: FONT_HEADING }}>
        <div className="mx-auto flex max-w-7xl items-center justify-center">
          <div className="max-w-lg rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] px-8 py-10 text-center shadow-[0_12px_36px_rgba(0,0,0,0.08)]">
            <ShoppingBag className="mx-auto h-12 w-12 text-[#ff7d6b]" />
            <h1 className="mt-4 text-3xl font-bold text-[#0F2540]">
              Your cart is empty
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#7A6F5D]">
              Browse the store and add your favorite items before checking out.
            </p>
            <Link href="/" className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#ff7d6b] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105">
              Start Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full bg-[#0000] px-4 py-10 sm:px-6 lg:px-8 lg:py-14" style={{ fontFamily: FONT_HEADING }}>
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7FA08D]">Shopping cart</span>
          <h1 className="text-4xl font-bold text-[#0F2540]">
            Cart Summary
          </h1>
          <p className="text-sm text-[#7A6F5D]">Review your selected items before moving to checkout.</p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.4fr_0.6fr]">
        <section className="space-y-4">
          {items.map((item) => {
            const lineTotal = item.price * item.quantity;

            return (
              <article key={item.cartItemId} className="flex flex-col gap-4 rounded-[1.75rem] border border-[#e3dccb] bg-white p-4 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:flex-row sm:items-center">
                <div className="relative h-28 w-full overflow-hidden rounded-2xl bg-[#f8f5ef] sm:h-28 sm:w-28 sm:flex-shrink-0">
                  <Image src={item.image} alt={item.name} fill className="object-cover" sizes="112px" />
                </div>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#7FA08D]">{item.category}</p>
                      <h2 className="mt-1 text-xl font-bold text-[#0F2540]" style={{ fontFamily: FONT_HEADING }}>
                        {item.name}
                      </h2>
                      <p className="mt-1 text-sm text-[#7A6F5D]">
                        Size: {item.size} · Color: {item.color}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.cartItemId)}
                      className="rounded-full border border-[#e3dccb] p-2 text-[#7A6F5D] transition-colors hover:bg-[#f8f5ef] cursor-pointer"
                      aria-label={`Remove ${item.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                    <p className="text-lg font-bold text-[#E8735F]" style={{ fontFamily: FONT_HEADING }}>
                      {formatCurrency(item.price)}
                    </p>
                    <div className="inline-flex items-center rounded-full border border-[#D8CCBC] bg-[#FCF5EE]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, Math.max(1, item.quantity - 1))}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F5E8D8] cursor-pointer"
                        aria-label={`Decrease quantity for ${item.name}`}
                      >
                        <Minus className="h-4 w-4 text-[#3d372c]" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-[#3d372c]">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}
                        className="flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-[#F5E8D8] cursor-pointer"
                        aria-label={`Increase quantity for ${item.name}`}
                      >
                        <Plus className="h-4 w-4 text-[#3d372c]" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="sm:w-28 sm:text-right">
                  <p className="text-xs uppercase tracking-[0.14em] text-[#7FA08D]">Line total</p>
                  <p className="mt-1 text-xl font-bold text-[#0F2540]" style={{ fontFamily: FONT_HEADING }}>
                    {formatCurrency(lineTotal)}
                  </p>
                </div>
              </article>
            );
          })}
        </section>

        <aside className="h-fit rounded-[2rem] border border-[#e3dccb] bg-[#f8f5ef] p-5 shadow-[0_12px_36px_rgba(0,0,0,0.08)] sm:p-7">
          <h2 className="text-2xl font-bold text-[#0F2540]" style={{ fontFamily: FONT_HEADING }}>
            Order total
          </h2>
          <div className="mt-5 space-y-3 text-sm text-[#7A6F5D]">
            <div className="flex items-center justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-[#0F2540]">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Delivery</span>
              <span className="font-semibold text-[#0F2540]">Calculated at checkout</span>
            </div>
          </div>

          <Link href="/checkout" className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-[#ff7d6b] px-5 py-3 text-sm font-semibold text-white transition-transform duration-200 hover:scale-105">
            Proceed to Checkout
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link href="/" className="mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-[#e3dccb] px-5 py-3 text-sm font-semibold text-[#0F2540] transition-transform duration-200 hover:scale-105">
            Continue Shopping
          </Link>
        </aside>
        </div>
      </div>
    </main>
  );
}
