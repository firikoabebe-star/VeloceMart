import Link from "next/link";
import type { Product } from "@/lib/api";

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

function priceRange(
  variants: { price: number }[],
): { min: number; max: number } | null {
  if (variants.length === 0) return null;
  const prices = variants.map((v) => v.price);
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

export default function ProductCard({ product }: { product: Product }) {
  const range = priceRange(product.variants);
  const colors = [
    ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
  ];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all duration-200 hover:shadow-elevation-2 hover:border-accent-primary/30"
    >
      {/* Image placeholder */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-tertiary">
        {product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <svg
              className="h-12 w-12 text-text-muted/40"
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

        {/* Sale badge example — show if variants have varied pricing */}
        {range && range.min !== range.max && (
          <span className="absolute left-3 top-3 rounded-md bg-accent-secondary px-2 py-0.5 text-[11px] font-semibold text-white">
            Various prices
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
          {product.category.name}
        </span>
        <h3 className="text-sm font-semibold text-text-primary line-clamp-1 group-hover:text-accent-primary transition-colors">
          {product.name}
        </h3>

        {/* Price */}
        {range && (
          <p className="mt-1 text-sm font-bold text-accent-primary">
            {range.min === range.max
              ? formatPrice(range.min)
              : `${formatPrice(range.min)} – ${formatPrice(range.max)}`}
          </p>
        )}

        {/* Variant info */}
        <div className="mt-auto flex items-center gap-2 pt-2">
          <span className="text-xs text-text-muted">
            {product._count.variants} variant
            {product._count.variants !== 1 ? "s" : ""}
          </span>
          {colors.length > 0 && (
            <>
              <span className="text-text-muted">·</span>
              <span className="text-xs text-text-muted">
                {colors.length} color{colors.length !== 1 ? "s" : ""}
              </span>
            </>
          )}
        </div>
      </div>
    </Link>
  );
}
