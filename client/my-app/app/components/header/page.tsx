"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ShoppingBag,
  Heart,
  Menu,
  X,
  UserCircle2,
} from "lucide-react";
import { useCart } from "../../context/CartContext";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

// ─── Nav Link ─────────────────────────────────────────────────────────────

function NavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="relative text-base font-medium cursor-pointer group inline-block"
      style={{ color: "var(--foreground)", fontFamily: "'Quicksand', sans-serif" }}
    >
      <span className="relative inline-block pb-2">
        {label}

        {/* left half of the underline — grows from the heart outward to the left */}
        <span
          className="absolute bottom-0 left-0 h-[2px] w-1/2 origin-right scale-x-0 bg-[var(--primary)] transition-transform duration-300 ease-out group-hover:scale-x-100"
        />

        {/* right half of the underline — grows from the heart outward to the right */}
        <span
          className="absolute bottom-0 right-0 h-[2px] w-1/2 origin-left scale-x-0 bg-[var(--primary)] transition-transform duration-300 ease-out group-hover:scale-x-100"
        />

        {/* heart sitting at the midpoint of the line */}
        <Heart
          className="absolute bottom-0 left-1/2 h-3 w-3 -translate-x-1/2 translate-y-1/2 scale-0 opacity-0 transition-all duration-300 ease-out delay-150 group-hover:scale-100 group-hover:opacity-100"
          fill="#FF7D6B"
          stroke="#FF7D6B"
        />
      </span>
    </Link>
  );
}

// ─── Icon Button ───────────────────────────────────────────────────────────

function IconBtn({
  onClick,
  title,
  className,
  children,
}: {
  onClick?: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-1.5 sm:p-2.5 rounded-full cursor-pointer transition-all duration-200 hover:bg-[var(--blush)] dark:hover:bg-[#C7BFBD] ${className ?? ""}`}
      style={{ color: "var(--foreground)" }}
    >
      {children}
    </button>
  );
}

// ─── Main Header ─────────────────────────────────────────────────────

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const { itemCount, hydrated } = useCart();

  const heroBg = "#FCF5EE";

  useEffect(() => {
    let cancelled = false;

    async function loadAuthStatus() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: "GET",
          credentials: "include",
        });

        if (!cancelled) {
          setIsAuthenticated(response.ok);
        }
      } catch (_error) {
        if (!cancelled) {
          setIsAuthenticated(false);
        }
      }
    }

    void loadAuthStatus();
    const onFocus = () => {
      void loadAuthStatus();
    };
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [pathname]);

  // Close the mobile menu on route change so it doesn't stay open
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const handleProfileClick = () => {
    router.push(isAuthenticated ? "/profile" : "/auth");
  };

  const navLinks = [
    { href: "/under999", label: "Under 999" },
    { href: "/accessories", label: "Accessories" },
    { href: "/contactus", label: "Contact Us" },
    { href: "/about", label: "About Us" },
    { href: "/returns", label: "Returns / Exchanges" },
    { href: "/faqs", label: "FAQ's" },
  ];

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{ background: heroBg }}
    >
      {/*
        Padding used to be a hard-coded `px-[1in]` (96px fixed, both sides,
        on every screen). On a ~375px phone that alone ate over half the
        width before the logo, nav, or icons even rendered — that's what
        was crushing the logo. Now it scales with the viewport instead.
      */}
      <div className="w-full px-3 sm:px-6 md:px-10 lg:px-16 xl:px-[1in] transition-colors duration-300">
        <div className="flex h-16 sm:h-20 md:h-22 items-center justify-between gap-2 sm:gap-6">

          {/* ── Logo ───────────────────────────────────────────────── */}
          <Link href="/" className="flex-shrink-0 min-w-0">
            <Image
              src="/logo.png"
              alt="Just Kidin' Logo"
              width={190}
              height={76}
              className="w-[100px] xs:w-[118px] sm:w-[150px] md:w-[176px] h-auto object-contain"
              priority
            />
          </Link>

          {/* ── Desktop Nav ────────────────────────────────────────────── */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-7 flex-shrink-0">
            {navLinks.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          {/* ── Right Icons ────────────────────────────────────────────── */}
          <div className="flex items-center gap-0 xs:gap-0.5 sm:gap-1 shrink-0">
            <IconBtn title="Cart" onClick={() => router.push("/cart")}>
              <div className="relative">
                <ShoppingBag className="h-[18px] w-[18px] sm:h-6 sm:w-6" />
                {hydrated && itemCount > 0 ? (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-3.5 min-w-3.5 px-1 sm:h-4 sm:min-w-4 items-center justify-center rounded-full text-[9px] sm:text-[10px] font-bold text-white"
                    style={{ background: "var(--primary)" }}
                  >
                    {itemCount}
                  </span>
                ) : null}
              </div>
            </IconBtn>

            <IconBtn title="Wishlist" onClick={() => router.push("/favourites")}>
              <Heart className="h-[18px] w-[18px] sm:h-6 sm:w-6" />
            </IconBtn>

            <IconBtn onClick={handleProfileClick} title={isAuthenticated ? "My Profile" : "Login / Signup"}>
              <UserCircle2
                className="h-[18px] w-[18px] sm:h-6 sm:w-6"
                style={{ color: isAuthenticated ? "var(--primary)" : "var(--foreground)" }}
              />
            </IconBtn>

            <button
              className="md:hidden p-1.5 sm:p-2 rounded-full cursor-pointer transition-colors duration-200"
              style={{ color: "var(--foreground)" }}
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5 sm:h-6 sm:w-6" /> : <Menu className="h-5 w-5 sm:h-6 sm:w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile Menu ────────────────────────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ${
          mobileOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
        style={{
          borderTop: "1px solid #f0e3d8",
          background: heroBg,
        }}
      >
        <div className="px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="text-base py-1"
              style={{ color: "var(--foreground)", fontFamily: "'Quicksand', sans-serif" }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </header>
  );
}