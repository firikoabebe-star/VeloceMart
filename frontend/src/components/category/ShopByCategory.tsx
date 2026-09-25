"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { getProducts, getProductListing } from "@/lib/api";
import { getCategoryId } from "@/lib/product-groups";
import { slugFromHref, type GenderSlug } from "@/lib/navigation";

interface Tile {
  label: string;
  href: string;
  source: "category" | "new" | "bestsellers";
}

const TILES: Record<GenderSlug, Tile[]> = {
  men: [
    { label: "Sneakers", href: "/category/men/sneakers", source: "category" },
    { label: "Tops & Tees", href: "/category/men/tops", source: "category" },
    { label: "Hoodies & Sweatshirts", href: "/category/men/hoodies", source: "category" },
    { label: "Running", href: "/category/men/running", source: "category" },
    { label: "Just Released", href: "/collections/new", source: "new" },
    { label: "Best Sellers", href: "/collections/bestsellers", source: "bestsellers" },
  ],
  women: [
    { label: "Dresses & Jumpsuits", href: "/category/women/dresses", source: "category" },
    { label: "Heels & Platforms", href: "/category/women/heels", source: "category" },
    { label: "Handbags", href: "/category/women/handbags", source: "category" },
    { label: "Running", href: "/category/women/running", source: "category" },
    { label: "Just Released", href: "/collections/new", source: "new" },
    { label: "Best Sellers", href: "/collections/bestsellers", source: "bestsellers" },
  ],
  kids: [
    { label: "Sneakers", href: "/category/kids/sneakers", source: "category" },
    { label: "Tops & Tees", href: "/category/kids/tops", source: "category" },
    { label: "Running", href: "/category/kids/running", source: "category" },
    { label: "Teens (13 - 17 years)", href: "/category/kids/teens", source: "category" },
    { label: "Just Released", href: "/collections/new", source: "new" },
    { label: "Best Sellers", href: "/collections/bestsellers", source: "bestsellers" },
  ],
};

const SECTION_HEADING: Record<GenderSlug, string> = {
  men: "Trending for Men",
  women: "Trending for Women",
  kids: "Shop by Category",
};

async function loadCover(tile: Tile): Promise<string | undefined> {
  try {
    if (tile.source === "new") {
      const products = await getProducts({ limit: "1" });
      return products[0]?.imageUrl ?? undefined;
    }
    if (tile.source === "bestsellers") {
      const res = await getProductListing({ saleOnly: true, limit: 1 });
      return res.data[0]?.imageUrl ?? undefined;
    }
    const categoryId = await getCategoryId(slugFromHref(tile.href));
    if (!categoryId) return undefined;
    const res = await getProductListing({ categoryId, limit: 1 });
    return res.data[0]?.imageUrl ?? undefined;
  } catch {
    return undefined;
  }
}

export default function ShopByCategory({ gender }: { gender: GenderSlug }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [covers, setCovers] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    let cancelled = false;
    TILES[gender].forEach(async (tile) => {
      const url = await loadCover(tile);
      if (!cancelled && url) {
        setCovers((prev) => ({ ...prev, [tile.href]: url }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [gender]);

  const scrollByAmount = (direction: 1 | -1) => {
    scrollerRef.current?.scrollBy({
      left: direction * scrollerRef.current.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  return (
    <section
      id="collections"
      aria-labelledby={`trending-${gender}-heading`}
      className="mx-auto max-w-7xl scroll-mt-[120px] px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="flex items-end justify-between gap-4">
        <h2
          id={`trending-${gender}-heading`}
          className="text-2xl font-bold tracking-tight text-text-primary"
        >
          {SECTION_HEADING[gender]}
        </h2>
        <div className="hidden shrink-0 items-center gap-2 sm:flex">
          <button
            type="button"
            onClick={() => scrollByAmount(-1)}
            aria-label="Scroll categories left"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors duration-150 hover:bg-surface-tertiary hover:text-text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => scrollByAmount(1)}
            aria-label="Scroll categories right"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-surface text-text-secondary transition-colors duration-150 hover:bg-surface-tertiary hover:text-text-primary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>

      <div
        ref={scrollerRef}
        className="mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TILES[gender].map((tile) => (
          <Link
            key={tile.label}
            href={tile.href}
            className="group relative block w-40 shrink-0 snap-start overflow-hidden rounded-xl border border-border bg-surface transition-transform duration-200 hover:-translate-y-1 sm:w-48"
          >
            <div className="aspect-[4/5] w-full overflow-hidden bg-gradient-to-br from-surface-tertiary to-border/40">
              {covers[tile.href] ? (
                <img
                  src={covers[tile.href]}
                  alt={tile.label}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full animate-pulse" />
              )}
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8">
              <span className="text-sm font-semibold text-white">{tile.label}</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
