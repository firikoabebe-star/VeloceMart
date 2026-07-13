"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import type { RecentlyViewedProduct } from "@/lib/api";

const STORAGE_KEY = "recentlyViewedProducts";
const MAX_ITEMS = 10;

/* ── Track a product view (exported for use in pages) ─────── */

export function trackProductView(product: {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  categoryName: string;
}) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: RecentlyViewedProduct[] = raw ? JSON.parse(raw) : [];
    const filtered = list.filter((p) => p.id !== product.id);
    filtered.unshift(product);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(filtered.slice(0, MAX_ITEMS)),
    );
  } catch {
    /* localStorage unavailable — silent fail */
  }
}

/* ── Subscribe to localStorage changes ────────────────────── */

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getSnapshot(excludeId: string): string {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: RecentlyViewedProduct[] = raw ? JSON.parse(raw) : [];
    const filtered = list
      .filter((p) => p.id !== excludeId)
      .slice(0, 6);
    return JSON.stringify(filtered);
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

/* ── Component ────────────────────────────────────────────── */

export default function RecentlyViewed({
  currentProductId,
}: {
  currentProductId: string;
}) {
  const itemsJson = useSyncExternalStore(
    subscribe,
    () => getSnapshot(currentProductId),
    getServerSnapshot,
  );

  const items: RecentlyViewedProduct[] = JSON.parse(itemsJson);

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="mb-4 text-lg font-semibold text-text-primary">
        Recently Viewed
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/products/${item.slug}`}
            className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-all hover:shadow-elevation-1 hover:border-accent-primary/30"
          >
            {/* Image placeholder */}
            <div className="aspect-square overflow-hidden bg-surface-tertiary">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg
                    className="h-8 w-8 text-text-muted/30"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-[11px] text-text-muted">{item.categoryName}</p>
              <p className="mt-0.5 text-xs font-medium text-text-primary line-clamp-2 group-hover:text-accent-primary transition-colors">
                {item.name}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
