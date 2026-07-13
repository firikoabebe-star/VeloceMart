"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getCategories, type Category } from "@/lib/api";
import { Skeleton } from "@/components/ui/Skeleton";

/* ── Category icon map ────────────────────────────────────── */
const categoryIcons: Record<string, React.ReactNode> = {
  default: (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
    </svg>
  ),
};

function getCategoryIcon(name: string): React.ReactNode {
  const key = name.toLowerCase().trim();
  if (key.includes("men") || key.includes("woman")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
      </svg>
    );
  }
  if (key.includes("accessor")) {
    return (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    );
  }
  return categoryIcons.default;
}

/* ── Color stops for gradient backgrounds ─────────────────── */
const accentColors = [
  "from-accent-primary/20 to-accent-primary/5",
  "from-accent-secondary/20 to-accent-secondary/5",
  "from-accent-tertiary/20 to-accent-tertiary/5",
  "from-accent-primary/15 to-accent-secondary/10",
  "from-accent-secondary/15 to-accent-tertiary/10",
  "from-accent-tertiary/15 to-accent-primary/10",
];

/* ── CategoryCard ─────────────────────────────────────────── */
function CategoryCard({
  category,
  index,
}: {
  category: Category;
  index: number;
}) {
  return (
    <motion.a
      href={`/category/${category.slug}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -4 }}
      className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-border/20 bg-surface p-5 transition-all duration-300 hover:border-accent-primary/30 hover:shadow-elevation-2"
    >
      {/* Icon container */}
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br text-accent-primary transition-all duration-300 group-hover:scale-110 ${accentColors[index % accentColors.length]}`}
      >
        {getCategoryIcon(category.name)}
      </div>

      {/* Content */}
      <div className="flex-1">
        <h3 className="text-sm font-semibold text-text-primary transition-colors duration-200 group-hover:text-accent-primary">
          {category.name}
        </h3>
        <p className="mt-0.5 text-xs text-text-muted">
          {category._count.products}{" "}
          {category._count.products === 1 ? "product" : "products"}
        </p>
      </div>

      {/* Arrow */}
      <svg
        className="h-4 w-4 shrink-0 text-text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-accent-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
      </svg>

      {/* Shine overlay */}
      <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
    </motion.a>
  );
}

/* ── CategoryHighlights ───────────────────────────────────── */
export default function CategoryHighlights() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([]);
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
          className="mb-10 text-center"
        >
          <span className="inline-block text-xs font-semibold uppercase tracking-[0.2em] text-accent-primary">
            Categories
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">
            Shop by Category
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-text-secondary">
            Explore our curated collections — from timeless classics to the
            latest trends.
          </p>
        </motion.div>

        {/* Category grid */}
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-4 rounded-xl border border-border/20 bg-surface p-5"
              >
                <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : categories.length === 0 && !error ? (
          <p className="text-center text-sm text-text-muted">
            No categories available yet.
          </p>
        ) : error ? (
          <p className="text-center text-sm text-text-muted">
            Unable to load categories right now.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, i) => (
              <CategoryCard key={cat.id} category={cat} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
