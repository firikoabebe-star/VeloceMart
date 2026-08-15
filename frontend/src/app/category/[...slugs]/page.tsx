import { notFound } from "next/navigation";
import { getCategoryBySlug, getProductListing, type ProductFilters } from "@/lib/api";
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

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slugs: string[] }>;
  searchParams: Promise<SearchParams>;
}) {
  const { slugs } = await params;
  const sp = await searchParams;
  const slug = slugs.join("-");

  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const filters: ProductFilters = {
    page: sp.page ? parseInt(sp.page, 10) : 1,
    limit: sp.limit ? parseInt(sp.limit, 10) : 24,
    sortBy: sp.sortBy ?? "createdAt",
    sortOrder: (sp.sortOrder as "asc" | "desc") ?? "desc",
    categoryId: category.id,
  };
  if (sp.minPrice) filters.minPrice = parseInt(sp.minPrice, 10);
  if (sp.maxPrice) filters.maxPrice = parseInt(sp.maxPrice, 10);
  const sizes = toArray(sp.size);
  const colors = toArray(sp.color);
  if (sizes.length > 0) filters.size = sizes[0];
  if (colors.length > 0) filters.color = colors[0];

  return (
    <ProductListing
      title={category.name}
      description={`Browse our ${category.name} collection`}
      filters={filters}
      basePath={`/category/${slugs.join("/")}`}
    />
  );
}