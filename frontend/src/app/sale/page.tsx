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
  title: "Sale — VeloceMart",
  description: "Browse our sale collection for premium fashion at reduced prices.",
};

export default async function SalePage({
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
    saleOnly: true,
  };
  if (sp.minPrice) filters.minPrice = parseInt(sp.minPrice, 10);
  if (sp.maxPrice) filters.maxPrice = parseInt(sp.maxPrice, 10);
  const sizes = toArray(sp.size);
  const colors = toArray(sp.color);
  if (sizes.length > 0) filters.size = sizes[0];
  if (colors.length > 0) filters.color = colors[0];

  return (
    <ProductListing
      title="Sale"
      description="Discover our latest deals on premium fashion and accessories."
      filters={filters}
      basePath="/sale"
    />
  );
}