import { getProductListing, type ProductFilters } from "@/lib/api";
import ProductListing from "@/components/products/ProductListing";

interface SearchParams {
  page?: string;
  limit?: string;
  sortBy?: string;
  sortOrder?: string;
  size?: string | string[];
  color?: string | string[];
  minPrice?: string;
  maxPrice?: string;
}

function toArray(v: string | string[] | undefined): string[] {
  if (!v) return [];
  return Array.isArray(v) ? v : [v];
}

export const metadata = {
  title: "New Arrivals — VeloceMart",
  description: "Discover the latest additions to our curated collection.",
};

export default async function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const filters: ProductFilters = {
    page: sp.page ? parseInt(sp.page, 10) : 1,
    limit: sp.limit ? parseInt(sp.limit, 10) : 24,
    sortBy: sp.sortBy ?? "createdAt",
    sortOrder: (sp.sortOrder as "asc" | "desc") ?? "desc",
  };
  if (sp.minPrice) filters.minPrice = parseInt(sp.minPrice, 10);
  if (sp.maxPrice) filters.maxPrice = parseInt(sp.maxPrice, 10);
  const sizes = toArray(sp.size);
  const colors = toArray(sp.color);
  if (sizes.length > 0) filters.size = sizes[0];
  if (colors.length > 0) filters.color = colors[0];

  return (
    <ProductListing
      title="New Arrivals"
      description="Fresh styles just dropped — shop the latest."
      filters={filters}
      basePath="/collections/new"
    />
  );
}