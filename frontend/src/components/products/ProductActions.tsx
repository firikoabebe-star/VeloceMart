"use client";

import { useState, useMemo, useCallback } from "react";
import type { Product } from "@/lib/api";
import { useCartStore } from "@/stores/cart-store";

/* ── Helpers ──────────────────────────────────────────────── */

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function unique<T>(arr: (T | null)[]): T[] {
  return [...new Set(arr.filter(Boolean))] as T[];
}

function stockLabel(stock: number): { text: string; tone: "ok" | "low" | "out" } {
  if (stock <= 0) return { text: "Out of stock", tone: "out" };
  if (stock <= 5) return { text: `Only ${stock} left`, tone: "low" };
  return { text: "In stock", tone: "ok" };
}

/* ── Component ────────────────────────────────────────────── */

export default function ProductActions({ product }: { product: Product }) {
  const { variants } = product;

  const colors = useMemo(() => unique(variants.map((v) => v.color)), [variants]);
  const sizes = useMemo(() => unique(variants.map((v) => v.size)), [variants]);

  const hasColors = colors.length > 0;
  const hasSizes = sizes.length > 0;

  const [selectedColor, setSelectedColor] = useState<string | null>(
    colors[0] ?? null,
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    sizes[0] ?? null,
  );
  const [quantity, setQuantity] = useState(1);

  const addToCart = useCartStore((s) => s.addToCart);
  const cartStatus = useCartStore((s) => s.status);
  const cartError = useCartStore((s) => s.error);

  /* Find the currently selected variant */
  const selectedVariant = useMemo(() => {
    return variants.find(
      (v) =>
        (!hasColors || v.color === selectedColor) &&
        (!hasSizes || v.size === selectedSize),
    );
  }, [variants, selectedColor, selectedSize, hasColors, hasSizes]);

  /* Compute available sizes for the selected color */
  const availableSizes = useMemo(() => {
    if (!hasColors || !selectedColor) return sizes;
    return sizes.filter((s) =>
      variants.some(
        (v) => v.color === selectedColor && v.size === s && v.stock > 0,
      ),
    );
  }, [sizes, variants, selectedColor, hasColors]);

  /* Compute available colors for the selected size */
  const availableColors = useMemo(() => {
    if (!hasSizes || !selectedSize) return colors;
    return colors.filter((c) =>
      variants.some(
        (v) => v.color === c && v.size === selectedSize && v.stock > 0,
      ),
    );
  }, [colors, variants, selectedSize, hasSizes]);

  /* Price display */
  const displayPrice = selectedVariant
    ? selectedVariant.price
    : variants.length > 0
      ? Math.min(...variants.map((v) => v.price))
      : 0;

  const maxPrice = selectedVariant
    ? selectedVariant.price
    : variants.length > 0
      ? Math.max(...variants.map((v) => v.price))
      : 0;

  const priceHasRange = !selectedVariant && displayPrice !== maxPrice;

  /* Stock */
  const stock = selectedVariant?.stock ?? 0;
  const stockInfo = stockLabel(stock);

  /* Add to cart */
  const handleAddToCart = useCallback(async () => {
    if (!selectedVariant) return;
    await addToCart({
      productId: product.id,
      productVariantId: selectedVariant.id,
      quantity,
    });
  }, [addToCart, selectedVariant, product.id, quantity]);

  return (
    <div className="flex flex-col gap-6">
      {/* Price */}
      <div>
        <p className="text-2xl font-bold text-accent-primary">
          {formatPrice(displayPrice)}
          {priceHasRange && (
            <span className="ml-1 text-sm font-normal text-text-muted">
              – {formatPrice(maxPrice)}
            </span>
          )}
        </p>
      </div>

      {/* Color selector */}
      {hasColors && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Color{selectedColor ? `: ${selectedColor}` : ""}
          </label>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => {
              const isAvailable = availableColors.includes(color);
              const isSelected = selectedColor === color;
              return (
                <button
                  key={color}
                  onClick={() => {
                    setSelectedColor(color);
                    setQuantity(1);
                  }}
                  disabled={!isAvailable}
                  className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : isAvailable
                        ? "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
                        : "cursor-not-allowed border-border/40 text-text-muted/40 line-through"
                  }`}
                >
                  {color}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Size selector */}
      {hasSizes && (
        <div>
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-text-muted">
            Size{selectedSize ? `: ${selectedSize}` : ""}
          </label>
          <div className="flex flex-wrap gap-2">
            {sizes.map((size) => {
              const isAvailable = availableSizes.includes(size);
              const isSelected = selectedSize === size;
              const variantForSize = variants.find(
                (v) =>
                  v.size === size &&
                  (!hasColors || v.color === selectedColor),
              );
              const isOutOfStock = variantForSize && variantForSize.stock <= 0;
              return (
                <button
                  key={size}
                  onClick={() => {
                    setSelectedSize(size);
                    setQuantity(1);
                  }}
                  disabled={!isAvailable || isOutOfStock}
                  className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 text-sm font-medium transition-all ${
                    isSelected
                      ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                      : isOutOfStock
                        ? "cursor-not-allowed border-border/40 text-text-muted/40 line-through"
                        : isAvailable
                          ? "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
                          : "cursor-not-allowed border-border/40 text-text-muted/40"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stock status */}
      {selectedVariant && (
        <div className="flex items-center gap-2">
          <span
            className={`h-2 w-2 rounded-full ${
              stockInfo.tone === "ok"
                ? "bg-success"
                : stockInfo.tone === "low"
                  ? "bg-warning"
                  : "bg-error"
            }`}
          />
          <span
            className={`text-sm font-medium ${
              stockInfo.tone === "out"
                ? "text-error"
                : stockInfo.tone === "low"
                  ? "text-warning"
                  : "text-text-muted"
            }`}
          >
            {stockInfo.text}
          </span>
        </div>
      )}

      {/* Quantity + Add to cart */}
      <div className="flex flex-col gap-3">
        {selectedVariant && stock > 0 && (
          <div className="flex items-center gap-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Qty
            </label>
            <div className="flex items-center rounded-lg border border-border">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className="flex h-9 w-10 items-center justify-center border-x border-border text-sm font-medium text-text-primary">
                {quantity}
              </span>
              <button
                onClick={() =>
                  setQuantity((q) => Math.min(stock, q + 1))
                }
                className="flex h-9 w-9 items-center justify-center text-text-secondary transition-colors hover:text-text-primary"
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
        )}

        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || stock <= 0 || cartStatus === "loading"}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent-primary px-6 py-3.5 text-sm font-semibold text-background transition-all hover:bg-accent-primary/90 hover:shadow-glow-accent disabled:pointer-events-none disabled:opacity-50"
        >
          {cartStatus === "loading" ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Adding…
            </>
          ) : cartStatus === "success" ? (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Added to cart!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007z" />
              </svg>
              {stock <= 0 ? "Out of stock" : "Add to Cart"}
            </>
          )}
        </button>

        {cartStatus === "error" && (
          <p className="text-sm text-error">{cartError}</p>
        )}
      </div>
    </div>
  );
}
