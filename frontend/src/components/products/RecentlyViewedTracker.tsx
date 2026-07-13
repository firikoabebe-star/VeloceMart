"use client";

import { useEffect } from "react";
import { trackProductView } from "@/components/products/RecentlyViewed";
import type { Product } from "@/lib/api";

export default function RecentlyViewedTracker({
  product,
}: {
  product: Product;
}) {
  useEffect(() => {
    trackProductView({
      id: product.id,
      name: product.name,
      slug: product.slug,
      imageUrl: product.imageUrl,
      categoryName: product.category.name,
    });
  }, [product]);

  return null;
}
