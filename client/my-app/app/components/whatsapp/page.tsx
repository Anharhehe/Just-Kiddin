"use client";

import { useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { FaWhatsapp } from "react-icons/fa";
import { MessageSquareMore, X, Search, PhoneCall, PackageSearch, Loader2, CircleCheckBig } from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";
const WHATSAPP_NUMBER = "923222227004";
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}`;

function getStatusMessage(status: string) {
  const normalized = status.trim().toUpperCase();

  if (normalized === "PENDING") {
    return "Your order is pending and will be confirmed by a phone call.";
  }

  if (normalized === "DISPATCHED" || normalized === "SHIPPED") {
    return "Your order has been dispatched and you will receive it within 2 working days.";
  }

  if (normalized === "COMPLETE" || normalized === "DELIVERED") {
    return "Your order has been received.";
  }

  return `Your order status is ${status.toLowerCase()}.`;
}

type TrackResult = {
  orderId: string;
  status: string;
  message: string;
};

export default function WhatsAppWidget() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"menu" | "track">("menu");
  const [orderId, setOrderId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TrackResult | null>(null);
  const [error, setError] = useState("");

  const whatsappHref = useMemo(
    () => `${WHATSAPP_LINK}?text=${encodeURIComponent("Hi, I need help with my order.")}`,
    []
  );

  const handleClose = () => {
    setOpen(false);
    setMode("menu");
    setOrderId("");
    setResult(null);
    setError("");
  };

  const handleTrackOrder = async () => {
    const trimmedOrderId = orderId.trim();

    if (!trimmedOrderId) {
      setError("Please paste your order id.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/orders/track/${encodeURIComponent(trimmedOrderId)}`, {
        method: "GET",
      });

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
        data?: { orderId?: string; status?: string; message?: string };
      };

      if (!response.ok || !data.success || !data.data?.orderId || !data.data?.status) {
        setError(data.message ?? "Order not found.");
        return;
      }

      const status = data.data.status;
      setResult({
        orderId: data.data.orderId,
        status,
        message: data.data.message ?? getStatusMessage(status),
      });
    } catch {
      setError("Unable to track the order right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-[0_18px_40px_rgba(0,0,0,0.22)] transition-transform hover:scale-105"
        aria-label="Open message menu"
      >
        <MessageSquareMore className="h-7 w-7" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[70] flex items-end justify-end bg-black/30 p-4 sm:items-end sm:justify-end sm:p-6">
          <div className="w-full max-w-sm rounded-3xl border border-[#e3dccb] bg-[#FCF5EE] shadow-[0_24px_60px_rgba(0,0,0,0.2)]">
            <div className="flex items-center justify-between border-b border-[#e3dccb] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#7FA08D]">Need help?</p>
                <h2 className="text-lg font-bold text-[#293A55]">Message Us</h2>
              </div>
              <button
                type="button"
                onClick={handleClose}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#293A55] shadow-sm"
                aria-label="Close message menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-5">
              {mode === "menu" ? (
                <div className="space-y-3">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 rounded-2xl border border-[#d7eadf] bg-white px-4 py-4 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#25D366] text-white">
                      <FaWhatsapp className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#293A55]">Talk to us on WhatsApp</p>
                      <p className="truncate text-xs text-[#7A6F5D]">+92 322 2227004</p>
                    </div>
                  </a>

                  <button
                    type="button"
                    onClick={() => setMode("track")}
                    className="flex w-full items-center gap-3 rounded-2xl border border-[#e3dccb] bg-white px-4 py-4 text-left shadow-sm transition-transform hover:-translate-y-0.5"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E8735F]/10 text-[#E8735F]">
                      <PackageSearch className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#293A55]">Track your order</p>
                      <p className="text-xs text-[#7A6F5D]">Paste your order id and check the status instantly.</p>
                    </div>
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-2xl bg-[#f8f5ef] px-4 py-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E8735F]/10 text-[#E8735F]">
                      <Search className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#293A55]">Track your order</p>
                      <p className="text-xs text-[#7A6F5D]">Paste the order id from your checkout confirmation.</p>
                    </div>
                  </div>

                  <label className="block">
                    <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-[#7FA08D]">
                      Order ID
                    </span>
                    <input
                      type="text"
                      value={orderId}
                      onChange={(event) => setOrderId(event.target.value)}
                      placeholder="Paste order id here"
                      className="h-12 w-full rounded-2xl border border-[#e3dccb] bg-white px-4 text-sm text-[#0F2540] outline-none transition-colors focus:border-[#E8735F]"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={handleTrackOrder}
                    disabled={loading}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-[#293A55] px-4 text-sm font-semibold text-white transition-transform hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
                    {loading ? "Checking..." : "Check Status"}
                  </button>

                  {error ? (
                    <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {error}
                    </p>
                  ) : null}

                  {result ? (
                    <div className="rounded-2xl border border-[#dbeadf] bg-white px-4 py-4 shadow-sm">
                      <div className="flex items-center gap-2 text-[#3a988a]">
                        <CircleCheckBig className="h-5 w-5" />
                        <p className="text-sm font-semibold uppercase tracking-[0.16em]">Status found</p>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#293A55]">Order #{result.orderId.slice(0, 8).toUpperCase()}</p>
                      <p className="mt-1 text-sm text-[#5c5445]">{result.message}</p>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setMode("menu")}
                    className="w-full rounded-2xl border border-[#e3dccb] bg-white px-4 py-3 text-sm font-semibold text-[#293A55] shadow-sm"
                  >
                    Back to options
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}