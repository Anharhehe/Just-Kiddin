"use client";

import Header from "./header/page";
import Footer from "./footer/page";
import ReviewsWidget from "./reviews/page";

export default function LayoutShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main style={{ flex: "0 0 auto" }}>{children}</main>
      <Footer />
      <ReviewsWidget />
    </>
  );
}
