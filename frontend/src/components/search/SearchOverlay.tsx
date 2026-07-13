"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { searchProducts, type Product } from "@/lib/api";

/* ── Helpers ──────────────────────────────────────────────── */

function getPriceRange(variants: Product["variants"]): string {
  const prices = variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  if (min === max) return `$${min.toFixed(2)}`;
  return `$${min.toFixed(2)}–$${max.toFixed(2)}`;
}

function getGradient(index: number): string {
  const palettes = [
    "from-accent-primary/20 to-accent-primary/5",
    "from-accent-secondary/20 to-accent-secondary/5",
    "from-accent-tertiary/20 to-accent-tertiary/5",
    "from-surface-secondary/60 to-surface-secondary/20",
  ];
  return palettes[index % palettes.length];
}

/* ── Result Skeleton ──────────────────────────────────────── */

function ResultSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-lg p-3">
      <div className="h-16 w-16 shrink-0 animate-pulse rounded-lg bg-surface-tertiary" />
      <div className="flex flex-1 flex-col gap-2">
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-tertiary" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-surface-tertiary" />
      </div>
    </div>
  );
}

/* ── Search Result Row ────────────────────────────────────── */

function SearchResultRow({
  product,
  index,
  query,
  onSelect,
}: {
  product: Product;
  index: number;
  query: string;
  onSelect: () => void;
}) {
  const gradient = getGradient(index);

  return (
    <motion.a
      href={`/products/${product.slug}`}
      onClick={onSelect}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25, ease: "easeOut" }}
      className="group flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-surface-secondary/60"
    >
      {/* Thumbnail */}
      <div
        className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${gradient}`}
      >
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full rounded-lg object-cover"
          />
        ) : (
          <svg
            className="h-6 w-6 text-text-muted/40"
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
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-text-primary transition-colors group-hover:text-accent-primary">
          {highlightMatch(product.name, query)}
        </span>
        <span className="mt-0.5 text-xs text-text-muted">
          {product.category.name}
        </span>
        <span className="mt-1 text-sm font-semibold text-accent-primary">
          {getPriceRange(product.variants)}
        </span>
      </div>

      {/* Arrow hint */}
      <svg
        className="h-4 w-4 shrink-0 text-text-muted/40 transition-all group-hover:translate-x-0.5 group-hover:text-accent-primary"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    </motion.a>
  );
}

/* ── Highlight search match ───────────────────────────────── */

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const regex = new RegExp(`(${escaped})`, "gi");
  const parts = text.split(regex);

  /* When split includes a capture group, matched portions always occupy
     odd indices, unmatched portions even indices. */
  if (parts.length === 1) return text;

  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark
            key={i}
            className="rounded-sm bg-accent-primary/20 text-accent-primary"
          >
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/* ── Quick suggestions ────────────────────────────────────── */

const QUICK_SUGGESTIONS = [
  { label: "New Arrivals", query: "new" },
  { label: "Sale Items", query: "sale" },
  { label: "Accessories", query: "accessories" },
  { label: "Premium", query: "premium" },
];

/* ── Main Overlay ─────────────────────────────────────────── */

export default function SearchOverlay({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [error, setError] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  /* Reset state when opening */
  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      setError(false);
      // Auto-focus after animation
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  /* Debounced search */
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setTotalCount(0);
      setHasSearched(false);
      setError(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortRef.current) abortRef.current.abort();

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      setError(false);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await searchProducts(query, { limit: 6 }, controller.signal);
        if (!controller.signal.aborted) {
          setResults(res.data);
          setTotalCount(res.meta.total);
          setHasSearched(true);
        }
      } catch (err) {
        if (
          err instanceof DOMException &&
          err.name === "AbortError"
        ) {
          return;
        }
        if (!controller.signal.aborted) {
          setError(true);
          setHasSearched(true);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  /* Keyboard handling */
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    },
    [onClose],
  );

  /* Body scroll lock */
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* Cleanup on unmount */
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, []);

  const handleResultClick = () => {
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-start justify-center"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Overlay panel */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative mt-20 w-full max-w-2xl rounded-2xl border border-border/40 bg-surface shadow-elevation-3 sm:mx-4"
            role="dialog"
            aria-modal="true"
            aria-label="Search products"
          >
            {/* Search input */}
            <div className="flex items-center gap-3 border-b border-border/30 px-5 py-4">
              <svg
                className="h-5 w-5 shrink-0 text-text-muted"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search products..."
                className="flex-1 bg-transparent text-base text-text-primary placeholder-text-muted/60 outline-none"
                autoComplete="off"
                spellCheck={false}
              />

              {/* Loading spinner */}
              {loading && (
                <svg
                  className="h-4 w-4 animate-spin text-accent-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-secondary hover:text-text-primary"
                aria-label="Close search"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Results area */}
            <div className="max-h-[60vh] overflow-y-auto overscroll-contain p-2">
              {/* Loading skeletons */}
              {loading && (
                <div className="space-y-1">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <ResultSkeleton key={i} />
                  ))}
                </div>
              )}

              {/* Quick suggestions (no query yet) */}
              {!query.trim() && !loading && (
                <div className="px-3 py-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-text-muted">
                    Quick suggestions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => {
                          setQuery(s.query);
                          inputRef.current?.focus();
                        }}
                        className="rounded-full border border-border/40 px-3 py-1.5 text-xs font-medium text-text-secondary transition-all hover:border-accent-primary/40 hover:bg-accent-primary/10 hover:text-accent-primary"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Error state */}
              {!loading && hasSearched && error && (
                <div className="flex flex-col items-center px-3 py-12 text-center">
                  <svg
                    className="mb-3 h-10 w-10 text-text-muted/40"
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
                  <p className="text-sm font-medium text-text-primary">
                    Something went wrong
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Couldn&apos;t complete your search. Please try again.
                  </p>
                </div>
              )}

              {/* No results */}
              {!loading && hasSearched && !error && results.length === 0 && (
                <div className="flex flex-col items-center px-3 py-12 text-center">
                  <svg
                    className="mb-3 h-10 w-10 text-text-muted/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                    />
                  </svg>
                  <p className="text-sm font-medium text-text-primary">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="mt-1 text-xs text-text-muted">
                    Try a different search term or browse our categories.
                  </p>
                </div>
              )}

              {/* Results */}
              {!loading && hasSearched && !error && results.length > 0 && (
                <div>
                  <p className="px-3 pb-1 pt-2 text-xs font-medium text-text-muted">
                    {totalCount} result{totalCount !== 1 ? "s" : ""} found
                  </p>
                  <div className="mt-1 space-y-1">
                    {results.map((product, i) => (
                      <SearchResultRow
                        key={product.id}
                        product={product}
                        index={i}
                        query={query}
                        onSelect={handleResultClick}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Footer with "View all results" */}
            {query.trim() && results.length > 0 && (
              <div className="border-t border-border/30 px-5 py-3">
                <a
                  href={`/products?search=${encodeURIComponent(query)}`}
                  onClick={onClose}
                  className="group flex items-center justify-center gap-2 rounded-lg bg-accent-primary/10 px-4 py-2.5 text-sm font-semibold text-accent-primary transition-all hover:bg-accent-primary/20"
                >
                  View all results
                  <svg
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                    />
                  </svg>
                </a>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
