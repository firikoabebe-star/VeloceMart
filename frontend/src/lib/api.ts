/* ── Types ────────────────────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  _count: { products: number };
}

export interface ProductVariant {
  id: string;
  sku: string;
  name: string;
  price: number;
  stock: number;
  size: string | null;
  color: string | null;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  categoryId: string;
  createdAt: string;
  category: { id: string; name: string; slug: string };
  variants: ProductVariant[];
  _count: { variants: number };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}

export interface RecommendationResponse {
  source: "ai" | "fallback";
  products: Product[];
}

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  categoryName: string;
}

/* ── Config ───────────────────────────────────────────────── */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/* ── Fetch wrapper ────────────────────────────────────────── */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function fetchJson<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    cache: "no-store",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const message =
      typeof body?.message === "string"
        ? body.message
        : `API error ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return res.json() as Promise<T>;
}

/* ── Product filters type ─────────────────────────────────── */

export interface ProductFilters {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  size?: string;
  color?: string;
  search?: string;
}

/* ── API functions ────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  const res = await fetchJson<PaginatedResponse<Category>>(
    "/categories?limit=50",
  );
  return res.data;
}

export async function getProducts(
  filters?: Record<string, string>,
): Promise<Product[]> {
  const params = new URLSearchParams(filters ?? {});
  if (!params.has("limit")) params.set("limit", "8");
  params.set("sortBy", "createdAt");
  params.set("sortOrder", "desc");
  const res = await fetchJson<PaginatedResponse<Product>>(
    `/products?${params}`,
  );
  return res.data;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ limit: "8" });
}

export async function getProductListing(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.minPrice !== undefined)
    params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined)
    params.set("maxPrice", String(filters.maxPrice));
  if (filters.size) params.set("size", filters.size);
  if (filters.color) params.set("color", filters.color);
  if (filters.search) params.set("search", filters.search);
  return fetchJson<PaginatedResponse<Product>>(`/products?${params}`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return fetchJson<Product>(`/products/slug/${slug}`);
}

export async function getProductById(id: string): Promise<Product> {
  return fetchJson<Product>(`/products/${id}`);
}

export async function getRecommendations(
  productId: string,
): Promise<RecommendationResponse> {
  return fetchJson<RecommendationResponse>(
    `/products/${productId}/recommendations`,
  );
}

export async function addToCart(payload: {
  productId: string;
  productVariantId: string;
  quantity: number;
}): Promise<{ id: string; itemCount: number; totalAmount: number }> {
  return fetchJson(`/cart/items`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function searchProducts(
  query: string,
  filters: Omit<ProductFilters, "search"> = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<Product>> {
  const params = new URLSearchParams({ q: query });
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.sortBy) params.set("sortBy", filters.sortBy);
  if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
  return fetchJson<PaginatedResponse<Product>>(
    `/products/search?${params}`,
    { signal },
  );
}

/* ── Auth API ────────────────────────────────────────────── */

export async function login(data: {
  email: string;
  password: string;
}): Promise<User> {
  return fetchJson<User>("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function register(data: RegisterData): Promise<User> {
  return fetchJson<User>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function getMe(): Promise<User> {
  return fetchJson<User>("/auth/me");
}

export async function logout(): Promise<void> {
  await fetchJson("/auth/logout", { method: "POST" });
}
