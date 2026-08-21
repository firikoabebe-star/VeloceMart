"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getWishlist, removeFromWishlist, type WishlistItem } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [addingCartId, setAddingCartId] = useState<string | null>(null);
  const addToCart = useCartStore((s) => s.addToCart);

  useEffect(() => {
    getWishlist()
      .then(setItems)
      .catch((err) => setError(err?.message ?? "Failed to load wishlist"))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: string) => {
    setRemovingId(productId);
    try {
      await removeFromWishlist(productId);
      setItems((prev) => prev.filter((i) => i.productId !== productId));
    } catch {
    } finally {
      setRemovingId(null);
    }
  };

  const handleAddToCart = async (item: WishlistItem) => {
    const variant = item.product.variants[0];
    if (!variant) return;
    setAddingCartId(item.id);
    await addToCart({
      productId: item.productId,
      productVariantId: variant.id,
      quantity: 1,
    });
    setAddingCartId(null);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          My Wishlist
        </h1>
        <p className="mt-1 text-text-secondary">
          {loading
            ? "Loading..."
            : `${items.length} saved item${items.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border/50 bg-surface">
              <div className="aspect-square animate-pulse bg-surface-tertiary" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-16 animate-pulse rounded bg-surface-tertiary" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface-tertiary" />
                <div className="h-5 w-20 animate-pulse rounded bg-surface-tertiary" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
            <svg className="h-7 w-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-base font-semibold text-text-primary">Error loading wishlist</p>
          <p className="mt-1 text-sm text-text-muted">{error}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-accent-tertiary">
            <svg
              className="h-8 w-8 text-accent-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Your wishlist is empty
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            Save items you love to revisit them later. Browse our products and tap the heart icon.
          </p>
          <Link
            href="/products"
            className="mt-6 inline-flex items-center gap-1.5 rounded-lg bg-accent-primary px-5 py-2.5 text-sm font-medium text-on-accent transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent"
          >
            Browse Products
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item) => {
            const variant = item.product.variants[0];
            return (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-xl border border-border/50 bg-surface transition-all duration-200 hover:shadow-elevation-2 hover:border-accent-primary/50"
              >
                {/* Image area */}
                <div className="relative aspect-square overflow-hidden bg-surface-tertiary">
                  <Link href={`/products/${item.product.slug}`}>
                    {item.product.imageUrl ? (
                      <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <svg
                          className="h-12 w-12 text-text-muted/30"
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
                  </Link>

                  {/* Remove button */}
                  <button
                    onClick={() => handleRemove(item.productId)}
                    disabled={removingId === item.productId}
                    className="absolute right-2.5 top-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-background/70 text-text-secondary backdrop-blur-sm transition-all duration-200 hover:bg-background hover:text-error hover:scale-110 disabled:opacity-50"
                    aria-label="Remove from wishlist"
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      stroke="none"
                    >
                      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                    </svg>
                  </button>

                  {/* Category badge */}
                  <span className="absolute bottom-2.5 left-2.5 rounded-md bg-background/70 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-secondary backdrop-blur-sm">
                    {item.product.category.name}
                  </span>
                </div>

                {/* Content */}
                <div className="p-4">
                  <Link
                    href={`/products/${item.product.slug}`}
                    className="text-sm font-semibold text-text-primary transition-colors hover:text-accent-strong line-clamp-1"
                  >
                    {item.product.name}
                  </Link>
                  {variant && (
                    <p className="mt-2 text-lg font-bold text-text-primary tabular-nums">
                      ${(variant.price / 100).toFixed(2)}
                    </p>
                  )}
                  <button
                    onClick={() => handleAddToCart(item)}
                    disabled={addingCartId === item.id || !variant}
                    className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-accent-primary px-4 py-2.5 text-sm font-medium text-on-accent transition-all duration-200 hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:opacity-50 active:scale-[0.98]"
                  >
                    {addingCartId === item.id ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Adding...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                        </svg>
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
