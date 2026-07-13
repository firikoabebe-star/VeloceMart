"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/lib/api";
import { getRecommendations } from "@/lib/api";

/* ── Price helper (unchanged) ────────────────────────────── */
function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

/* ── Visual placeholder gradients ────────────────────────── */
const placeholderGradients = [
  "from-accent-primary/20 via-accent-secondary/10 to-accent-tertiary/20",
  "from-accent-secondary/20 via-accent-tertiary/15 to-accent-primary/15",
  "from-accent-tertiary/15 via-accent-primary/20 to-accent-secondary/10",
  "from-accent-primary/15 via-accent-tertiary/10 to-accent-primary/20",
  "from-accent-secondary/15 via-accent-primary/20 to-accent-tertiary/15",
  "from-accent-tertiary/20 via-accent-secondary/10 to-accent-primary/15",
];

/* ── Badge helper ────────────────────────────────────────── */
function getBadge(
  product: Product,
): { label: string; variant: "new" | "sale" } | null {
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
  if (isNew) return { label: "New", variant: "new" };

  const hasDiscount = product.variants.some(
    (v) => Number(v.price) < 50 && Number(v.price) > 0,
  );
  if (hasDiscount) return { label: "Sale", variant: "sale" };

  return null;
}

/* ── RecommendationSection ───────────────────────────────── */
export default function RecommendationSection({
  productId,
}: {
  productId: string;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchRecommendations() {
      try {
        const data = await getRecommendations(productId);
        if (!cancelled) {
          setProducts(data.products ?? []);
          setVisible((data.products ?? []).length > 0);
        }
      } catch {
        if (!cancelled) setVisible(false);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchRecommendations();
    return () => {
      cancelled = true;
    };
  }, [productId]);

  if (loading || !visible || products.length === 0) return null;

  return (
    <section>
      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        className="mb-6 text-lg font-semibold text-text-primary"
      >
        You might also like
      </motion.h2>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((product, index) => {
          const prices = product.variants.map((v) => v.price);
          const min = prices.length > 0 ? Math.min(...prices) : null;
          const max = prices.length > 0 ? Math.max(...prices) : null;
          const badge = getBadge(product);

          return (
            <motion.a
              key={product.id}
              href={`/products/${product.slug}`}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{
                duration: 0.5,
                delay: index * 0.08,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              whileHover={{ y: -6 }}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border/20 bg-surface transition-all duration-300 hover:border-accent-primary/25 hover:shadow-elevation-2"
            >
              {/* Image container */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-tertiary">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                ) : (
                  <div
                    className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${
                      placeholderGradients[index % placeholderGradients.length]
                    }`}
                  >
                    <svg
                      className="h-12 w-12 text-accent-primary/40"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={1}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                      />
                    </svg>
                  </div>
                )}

                {/* Badge */}
                {badge && (
                  <span
                    className={`absolute left-3 top-3 z-10 inline-flex items-center rounded-md px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                      badge.variant === "new"
                        ? "bg-accent-primary text-background"
                        : "bg-accent-secondary text-white"
                    }`}
                  >
                    {badge.label}
                  </span>
                )}

                {/* Quick-add overlay */}
                {min !== null && (
                  <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/80 via-background/40 to-transparent p-4 pt-12 transition-transform duration-300 group-hover:translate-y-0">
                    <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-xs font-semibold text-background transition-all duration-200 hover:bg-accent-primary/90">
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"
                        />
                      </svg>
                      Quick View
                    </span>
                  </div>
                )}

                {/* Shine overlay */}
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </div>

              {/* Info */}
              <div className="flex flex-1 flex-col gap-1.5 p-4">
                <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
                  {product.category.name}
                </span>
                <h3 className="text-sm font-semibold leading-snug text-text-primary transition-colors duration-200 group-hover:text-accent-primary">
                  {product.name}
                </h3>

                {/* Price */}
                {min !== null && (
                  <p className="mt-auto text-sm font-bold text-accent-primary">
                    {min === max
                      ? formatPrice(min)
                      : `${formatPrice(min)} – ${formatPrice(max!)}`}
                  </p>
                )}

                {/* Variant details */}
                {product.variants.length > 0 && (
                  <div className="mt-1.5 flex items-center gap-2">
                    {/* Color dots */}
                    {product.variants
                      .filter((v) => v.color)
                      .slice(0, 4)
                      .map((v) => (
                        <span
                          key={v.id}
                          className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border/30"
                          style={{
                            backgroundColor: v.color?.toLowerCase() || "oklch(0.7 0 0)",
                          }}
                          title={v.color || "color"}
                        />
                      ))}
                    {product.variants.filter((v) => v.color).length > 4 && (
                      <span className="text-[10px] text-text-muted">
                        +{product.variants.filter((v) => v.color).length - 4}
                      </span>
                    )}

                    {/* Size info */}
                    {product.variants.some((v) => v.size) && (
                      <span className="ml-auto text-[10px] text-text-muted">
                        {product.variants.filter((v) => v.size).length} sizes
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.a>
          );
        })}
      </div>
    </section>
  );
}
