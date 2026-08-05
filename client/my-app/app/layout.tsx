import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "./context/ThemeContext";
import { AudienceProvider } from "./context/AudienceContext";
import { CartProvider } from "./context/CartContext";
import LayoutShell from "./components/LayoutShell";
import AnnouncementPanel from "./components/panel/page";
import WhatsAppWidget from "./components/whatsapp/page";

export const metadata: Metadata = {
  title: "Just Kidin'",
  description: "Just Kidin' — Kids E-Commerce Store",
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