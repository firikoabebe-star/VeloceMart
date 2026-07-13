"use client";

import { motion } from "framer-motion";
import type { Product } from "@/lib/api";

/* ── Helpers ──────────────────────────────────────────────── */

function getPriceRange(product: Product): string {
  if (!product.variants.length) return "—";
  const prices = product.variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toFixed(2)}`;
  return `$${min.toFixed(2)} – $${max.toFixed(2)}`;
}

/* ── Visual placeholder by name ───────────────────────────── */
const placeholderGradients = [
  "from-accent-primary/20 via-accent-secondary/10 to-accent-tertiary/20",
  "from-accent-secondary/20 via-accent-tertiary/15 to-accent-primary/10",
  "from-accent-tertiary/15 via-accent-primary/20 to-accent-secondary/10",
  "from-accent-primary/15 via-accent-tertiary/10 to-accent-primary/20",
];

function ProductImage({ product, index }: { product: Product; index: number }) {
  const gradient =
    placeholderGradients[index % placeholderGradients.length];

  if (product.imageUrl) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
        loading="lazy"
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${gradient}`}
    >
      <div className="text-center">
        <svg
          className="mx-auto h-10 w-10 text-accent-primary/40"
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
        <p className="mt-1 text-[10px] font-medium uppercase tracking-wider text-accent-primary/30">
          {product.category.name}
        </p>
      </div>
    </div>
  );
}

/* ── Badge helper ─────────────────────────────────────────── */
function getBadge(product: Product): { label: string; variant: "new" | "sale" } | null {
  const isNew =
    Date.now() - new Date(product.createdAt).getTime() < 14 * 24 * 60 * 60 * 1000;
  if (isNew) return { label: "New", variant: "new" };

  const hasDiscount = product.variants.some(
    (v) => Number(v.price) < 50 && Number(v.price) > 0,
  );
  if (hasDiscount) return { label: "Sale", variant: "sale" };

  return null;
}

/* ── ProductCard ──────────────────────────────────────────── */
export default function ProductCard({
  product,
  index = 0,
}: {
  product: Product;
  index?: number;
}) {
  const badge = getBadge(product);

  return (
    <motion.a
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
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductImage product={product} index={index} />

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

        {/* Quick add overlay */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-background/80 via-background/40 to-transparent p-4 pt-12 transition-transform duration-300 group-hover:translate-y-0">
          <span className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-4 py-2.5 text-xs font-semibold text-background transition-all duration-200 hover:bg-accent-primary/90">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs font-medium uppercase tracking-wider text-text-muted">
          {product.category.name}
        </p>
        <h3 className="text-sm font-semibold leading-snug text-text-primary transition-colors duration-200 group-hover:text-accent-primary">
          {product.name}
        </h3>
        <p className="mt-auto text-sm font-bold text-accent-primary">
          {getPriceRange(product)}
        </p>

        {/* Color/size dots */}
        {product.variants.length > 0 && (
          <div className="mt-1.5 flex items-center gap-2">
            {product.variants
              .filter((v) => v.color)
              .slice(0, 4)
              .map((v) => (
                <span
                  key={v.id}
                  className="flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border/30"
                  style={{ backgroundColor: v.color?.toLowerCase() || "oklch(0.7 0 0)" }}
                  title={v.color || "color"}
                />
              ))}
            {product.variants.filter((v) => v.color).length > 4 && (
              <span className="text-[10px] text-text-muted">
                +{product.variants.filter((v) => v.color).length - 4}
              </span>
            )}
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
}
