"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";
import { FaInstagram, FaFacebookF, FaWhatsapp, FaTiktok } from "react-icons/fa";
import { useTheme } from "../../context/ThemeContext";

const quickLinks = [
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contactus" },
  { label: "Shopping Cart", href: "/cart" },
  { label: "Returns / Exchanges", href: "/returns" },
  { label: "Terms of Service", href: "/tos" },
];

const socialLinks = [
  { label: "Instagram", href: "https://www.instagram.com/justkidin.store?igsh=MTNvY2pqbG43amVi", icon: FaInstagram },
  { label: "WhatsApp", href: "https://wa.me/923222227004", icon: FaWhatsapp },
  { label: "TikTok", href: "https://www.tiktok.com/@justkidin_?_r=1&_t=ZP-98HTCj6AQFa", icon: FaTiktok },
];

// Brand palette
const DEEP_NAVY   = "#0F2540";
const SOFT_TEAL   = "#DCE6DE";
const CORAL       = "#FF7D6B";
const WARM_IVORY  = "#F8F5EF";
const YELLOW = "#dbc548";
const PURPLE = "#b36dcf";
const GREEN = "#3a988a";

const socialHoverColors: Record<string, string> = {
  Instagram: CORAL,
  WhatsApp: CORAL,
  TikTok: DEEP_NAVY,
};

export default function Footer() {
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false); 
  const [error, setError] = useState("");

  const footerBg = SOFT_TEAL;
  const cardBg = WARM_IVORY;
  const borderColor = "#E3DCCB";
  const textColor = DEEP_NAVY;
  const mutedText = "#2C4A63";

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail);

    if (!isValidEmail) {
      setError("Please enter a valid email address");
      setSubscribed(false);
      return;
    }

    // TODO: replace with real API call, e.g.
    // await fetch("/api/subscribe", { method: "POST", body: JSON.stringify({ email: trimmedEmail }) });

    setError("");
    setSubscribed(true);
    setEmail("");

    // auto-hide the success message after a few seconds
    setTimeout(() => setSubscribed(false), 4000);
  };

  return (
    <footer
      style={{
        background: footerBg,
        color: textColor,
        position: "relative",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      {/* ---------- Cloudy top edge ---------- */}
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="w-full block"
        style={{ height: "40px", display: "block" }}
      >
        <path
          d="M0,60 L0,30
             C 40,0 80,0 120,30
             C 160,60 200,60 240,30
             C 280,0 320,0 360,30
             C 400,60 440,60 480,30
             C 520,0 560,0 600,30
             C 640,60 680,60 720,30
             C 760,0 800,0 840,30
             C 880,60 920,60 960,30
             C 1000,0 1040,0 1080,30
             C 1120,60 1160,60 1200,30
             C 1240,0 1280,0 1320,30
             C 1360,60 1400,60 1440,30
             L1440,60 Z"
          fill={footerBg}
        />
      </svg>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-12 sm:pb-14 pt-2">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8 lg:gap-12">
          <section className="min-w-0">
            <h3
            className="text-2xl sm:text-3xl font-semibold"
            style={{ fontFamily: "'Quicksand', sans-serif" }}
            >
            <span style={{ color: GREEN }}>J</span>
            <span style={{ color: CORAL }}>U</span>
            <span style={{ color: YELLOW }}>S</span>
            <span style={{ color: PURPLE }}>T</span>{" "}
            <span >KidiN</span>
            <span style={{ color: CORAL }}>'</span>
            </h3>
            <p
              className="mt-4 text-sm sm:text-base leading-7 max-w-sm"
              style={{ color: mutedText }}
            >
              We bring comfy, stylish, and quality clothing for infants, babies,
              and growing children, designed for everyday joy and easy parenting.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="h-10 w-10 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = socialHoverColors[item.label] ?? textColor;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = DEEP_NAVY;
                    }}
                    style={{
                      background: cardBg,
                      color: DEEP_NAVY,
                      border: `1px solid ${borderColor}`,
                    }}
                  >
                    <Icon size={18} />
                  </Link>
                );
              })}
            </div>
          </section>

          <section className="w-full">
            <h4
              className="text-xl font-semibold"
              style={{ fontFamily: "'Quicksand', sans-serif", color: DEEP_NAVY }}
            >
              Quick Links
            </h4>
            <nav className="mt-4 flex flex-col gap-3">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm sm:text-base w-fit cursor-pointer transition-all duration-200 hover:underline"
                  style={{ color: mutedText, fontFamily: "'Quicksand', sans-serif" }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </section>

          <section>
            <h4
              className="text-xl font-semibold"
              style={{ fontFamily: "'Quicksand', sans-serif", color: DEEP_NAVY }}
            >
              Stay in the Loop
            </h4>
            <p
              className="mt-4 text-sm sm:text-base leading-7 max-w-md"
              style={{ color: mutedText }}
            >
              Sign up to get first dibs on new arrivals, sales, exclusive
              content, events and more.
            </p>

            <form className="mt-5 w-full" onSubmit={handleSubscribe}>
              <div
                className="grid grid-cols-[1fr_auto] items-center gap-2 p-2 rounded-xl w-full"
                style={{
                  background: cardBg,
                  border: `1px solid ${borderColor}`,
                }}
              >
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  className="h-12 sm:h-11 min-w-0 w-full px-4 rounded-md text-base outline-none placeholder:text-[15px]"
                  style={{
                    background: "#ffffff",
                    color: DEEP_NAVY,
                    border: `1px solid ${borderColor}`,
                  }}
                />
                <button
                  type="submit"
                  className="h-12 sm:h-11 shrink-0 px-4 sm:px-5 rounded-md font-semibold text-base cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap transition-colors duration-200"
                  style={{
                    background: CORAL,
                    color: WARM_IVORY,
                    fontFamily: "'Quicksand', sans-serif",
                  }}
                >
                  Subscribe <ArrowUpRight size={16} />
                </button>
              </div>

              {/* Feedback message */}
              {subscribed && (
                <div
                  className="mt-3 flex items-center gap-2 text-sm rounded-md px-3 py-2"
                  style={{
                    background: "#EAF7EF",
                    color: GREEN,
                    border: `1px solid ${GREEN}`,
                  }}
                >
                  <CheckCircle2 size={16} />
                  <span>Thanks! Your email has been recorded.</span>
                </div>
              )}
              {error && (
                <div
                  className="mt-3 text-sm rounded-md px-3 py-2"
                  style={{
                    background: "#FDEAE7",
                    color: CORAL,
                    border: `1px solid ${CORAL}`,
                  }}
                >
                  {error}
                </div>
              )}
            </form>
          </section>
        </div>

        <div
          className="mt-10 pt-5 text-xs text-center"
          style={{
            borderTop: `1px solid ${borderColor}`,
            color: mutedText,
          }}
        >
          © {new Date().getFullYear()} Just Kiddin. All rights reserved.
        </div>
      </div>
    </footer>
  );
}