"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getFeaturedProducts, type Product } from "@/lib/api";
import ProductCard from "./ProductCard";
import { Skeleton } from "@/components/ui/Skeleton";

/* ── Loading grid ─────────────────────────────────────────── */
function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-xl border border-border/20 bg-surface"
        >
          <Skeleton className="aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="mt-3 h-4 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── FeaturedProducts ─────────────────────────────────────── */
export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getFeaturedProducts()
      .then(setProducts)
      .catch(() => {
        setProducts([]);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="bg-background py-section">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row"
        >
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
              Featured
            </span>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
              New Arrivals
            </h2>
            <p className="mt-2 text-text-secondary">
              The latest drops, fresh off the runway.
            </p>
          </div>
          <a
            href="/collections/new"
            className="group inline-flex shrink-0 items-center gap-2 text-sm font-medium text-accent-primary transition-all duration-200 hover:text-accent-primary/80"
          >
            View All
            <svg
              className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </motion.div>

        {/* Products grid */}
        {loading ? (
          <ProductGridSkeleton count={8} />
        ) : products.length === 0 && !error ? (
          <div className="rounded-xl border border-border/20 bg-surface p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-text-muted/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-text-secondary">
              No products available yet.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Products will appear here once added to the catalog.
            </p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-border/20 bg-surface p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-text-muted/50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
              />
            </svg>
            <p className="mt-4 text-sm font-medium text-text-secondary">
              Couldn&apos;t load products.
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Please try again later.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
