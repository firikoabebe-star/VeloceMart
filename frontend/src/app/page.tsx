"use client";

import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import CategoryHighlights from "@/components/home/CategoryHighlights";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import PromotionalBanner from "@/components/home/PromotionalBanner";
import { useEffect, useState } from "react";

/* ── Scroll progress indicator ────────────────────────────── */
function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="fixed inset-x-0 top-16 z-30 h-0.5 bg-border/30">
      <motion.div
        className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
        style={{ scaleX: progress, transformOrigin: "left" }}
      />
    </div>
  );
}

/* ── Home Page ────────────────────────────────────────────── */
export default function Home() {
  return (
    <>
      <ScrollProgress />

      {/* Hero Section */}
      <HeroSection />

      {/* Banner 1 — Between Hero and Categories */}
      <PromotionalBanner
        title="Free Shipping on Orders Over $100"
        subtitle="Plus easy 30-day returns on all full-price items. Terms and conditions apply."
        ctaLabel="Start Shopping"
        ctaHref="/collections/new"
        variant="accent"
      />

      {/* Category Highlights */}
      <CategoryHighlights />

      {/* Featured Products */}
      <FeaturedProducts />

      {/* Banner 2 — Between Featured and Footer */}
      <div className="pb-section">
        <PromotionalBanner
          title="Sign Up & Save 15%"
          subtitle="Join the Veloce community and get an exclusive discount on your first order. Members also enjoy early access to new drops."
          ctaLabel="Join Now"
          ctaHref="/auth/register"
          variant="secondary"
        />
      </div>
    </>
  );
}
