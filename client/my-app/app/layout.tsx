import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AudienceProvider } from "./context/AudienceContext";
import { CartProvider } from "./context/CartContext";
import LayoutShell from "./components/LayoutShell";
import AnnouncementPanel from "./components/panel/page";
import WhatsAppWidget from "./components/whatsapp/page";

function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    process.env.VERCEL_URL ??
    "justkidin.store";

  const normalized = configuredUrl.startsWith("http://") || configuredUrl.startsWith("https://")
    ? configuredUrl
    : `https://${configuredUrl}`;

  return normalized.replace(/\/$/, "");
}

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Just Kidin' | Kids Clothing & Accessories",
    template: "%s | Just Kidin'",
  },
  description:
    "Just Kidin' is a kids clothing store for newborns and toddlers, with cute, comfortable outfits and accessories for boys and girls.",
  applicationName: "Just Kidin'",
  authors: [{ name: "Just Kidin'" }],
  creator: "Just Kidin'",
  publisher: "Just Kidin'",
  category: "ecommerce",
  keywords: [
    "kids clothing",
    "baby clothes",
    "newborn outfits",
    "toddler clothing",
    "boys clothes",
    "girls clothes",
    "accessories",
    "kids e-commerce",
    "Just Kidin'",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Just Kidin'",
    title: "Just Kidin' | Kids Clothing & Accessories",
    description:
      "Cute, comfortable kids clothing and accessories for newborns and toddlers.",
    images: [
      {
        url: "/hero.png",
        width: 1200,
        height: 630,
        alt: "Just Kidin' kids clothing store",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Just Kidin' | Kids Clothing & Accessories",
    description:
      "Cute, comfortable kids clothing and accessories for newborns and toddlers.",
    images: ["/hero.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/logo.png", type: "image/png" },
    ],
    apple: "/logo.png",
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Just Kidin'",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
    address: false,
    email: false,
  },
};

export const viewport = {
  themeColor: "#FCF5EE",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--background)",
          color: "var(--foreground)",
          transition: "background 0.3s, color 0.3s",
          fontFamily: "'Quicksand', sans-serif",
        }}
      >
        <ThemeProvider>
          <AudienceProvider>
            <CartProvider>
              <AnnouncementPanel />
              <LayoutShell>{children}</LayoutShell>
              <WhatsAppWidget />
            </CartProvider>
          </AudienceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}