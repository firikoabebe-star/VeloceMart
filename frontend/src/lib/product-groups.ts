import { getCategoryBySlug, getProductListing, type Product } from "@/lib/api";
import { slugFromHref, type CategoryGroup } from "@/lib/navigation";

const categoryIdCache = new Map<string, string | null>();

export async function getCategoryId(slug: string): Promise<string | null> {
  if (categoryIdCache.has(slug)) return categoryIdCache.get(slug) ?? null;
  const category = await getCategoryBySlug(slug).catch(() => null);
  const id = category?.id ?? null;
  categoryIdCache.set(slug, id);
  return id;
}

/**
 * Fetches real products for a landing-page category group by querying each
 * leaf category under it (the backend filters by a single categoryId) and
 * merging the results into one deduplicated list.
 */
export async function fetchGroupProducts(
  group: CategoryGroup,
  { perCategory = 6, maxCategories = 8, maxTotal = 24 }: {
    perCategory?: number;
    maxCategories?: number;
    maxTotal?: number;
  } = {},
): Promise<Product[]> {
  const listings = await Promise.all(
    group.items.slice(0, maxCategories).map(async (item) => {
      try {
        const categoryId = await getCategoryId(slugFromHref(item.href));
        if (!categoryId) return [];
        const res = await getProductListing({
          categoryId,
          limit: perCategory,
          sortBy: "createdAt",
          sortOrder: "desc",
        });
        return res.data;
      } catch {
        return [];
      }
    }),
  );

  const seen = new Set<string>();
  const merged: Product[] = [];
  for (const list of listings) {
    for (const product of list) {
      if (!seen.has(product.id)) {
        seen.add(product.id);
        merged.push(product);
      }
    }
  }
  return merged.slice(0, maxTotal);
}
