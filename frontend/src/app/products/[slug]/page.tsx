import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { getProductBySlug } from "@/lib/api";
import ProductActions from "@/components/products/ProductActions";
import ImageGallery from "@/components/products/ImageGallery";
import RecommendationSection from "@/components/products/RecommendationSection";
import RecentlyViewed from "@/components/products/RecentlyViewed";
import RecentlyViewedTracker from "@/components/products/RecentlyViewedTracker";

/* ── Metadata ─────────────────────────────────────────────── */

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.name} — VeloceMart`,
      description:
        product.description ??
        `Shop ${product.name} in the ${product.category.name} collection at VeloceMart.`,
    };
  } catch {
    return { title: "Product Not Found — VeloceMart" };
  }
}

/* ── Page ─────────────────────────────────────────────────── */

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug).catch(() => null);
  if (!product) notFound();

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-text-muted">
        <Link href="/" className="hover:text-text-primary transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href="/products"
          className="hover:text-text-primary transition-colors"
        >
          Products
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/products?categoryId=${product.categoryId}`}
          className="hover:text-text-primary transition-colors"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-text-primary">{product.name}</span>
      </nav>

      {/* Main product grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Left: Image gallery */}
        <ImageGallery product={product} />

        {/* Right: Product info + actions */}
        <div className="flex flex-col gap-6">
          {/* Category */}
          <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">
            {product.category.name}
          </span>

          {/* Title */}
          <h1 className="text-2xl font-bold text-text-primary sm:text-3xl">
            {product.name}
          </h1>

          {/* Description */}
          {product.description && (
            <p className="text-sm leading-relaxed text-text-secondary">
              {product.description}
            </p>
          )}

          {/* Variant info summary */}
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <span>
              {product.variants.length} variant
              {product.variants.length !== 1 ? "s" : ""}
            </span>
            {[
              ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
            ].length > 0 && (
              <span>
                {[
                  ...new Set(
                    product.variants.map((v) => v.color).filter(Boolean),
                  ),
                ].length}{" "}
                color
                {[
                  ...new Set(
                    product.variants.map((v) => v.color).filter(Boolean),
                  ),
                ].length !== 1
                  ? "s"
                  : ""}
              </span>
            )}
            {[
              ...new Set(product.variants.map((v) => v.size).filter(Boolean)),
            ].length > 0 && (
              <span>
                {[
                  ...new Set(
                    product.variants.map((v) => v.size).filter(Boolean),
                  ),
                ].length}{" "}
                size
                {[
                  ...new Set(
                    product.variants.map((v) => v.size).filter(Boolean),
                  ),
                ].length !== 1
                  ? "s"
                  : ""}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="border-t border-border/40" />

          {/* Variant selector + Add to cart */}
          <ProductActions product={product} />
        </div>
      </div>

      {/* Client-side tracking + recently viewed + recommendations */}
      <div className="mt-16 border-t border-border/40 pt-10">
        <RecentlyViewedTracker product={product} />
        <RecommendationSection productId={product.id} />
      </div>

      <div className="mt-16 border-t border-border/40 pt-10">
        <RecentlyViewed currentProductId={product.id} />
      </div>
    </section>
  );
}
