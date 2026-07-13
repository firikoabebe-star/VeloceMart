import { isAxiosError } from "axios";
import api from "./axios";

/* ── Types ────────────────────────────────────────────────── */

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt?: string;
  updatedAt?: string;
  _count?: { orders: number };
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

/* ── Error class ─────────────────────────────────────────── */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function toApiError(err: unknown): ApiError {
  if (isAxiosError(err) && err.response) {
    const data = err.response.data;
    const message =
      typeof data?.message === "string"
        ? data.message
        : `API error ${err.response.status}`;
    return new ApiError(err.response.status, message);
  }
  return new ApiError(500, "An unexpected error occurred");
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

/* ── Catalog API ──────────────────────────────────────────── */

export async function getCategories(): Promise<Category[]> {
  try {
    const { data } = await api.get<PaginatedResponse<Category>>(
      "/categories?limit=50",
    );
    return data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getProducts(
  filters?: Record<string, string>,
): Promise<Product[]> {
  try {
    const params = new URLSearchParams(filters ?? {});
    if (!params.has("limit")) params.set("limit", "8");
    params.set("sortBy", "createdAt");
    params.set("sortOrder", "desc");
    const { data } = await api.get<PaginatedResponse<Product>>(
      `/products?${params}`,
    );
    return data.data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getFeaturedProducts(): Promise<Product[]> {
  return getProducts({ limit: "8" });
}

export async function getProductListing(
  filters: ProductFilters = {},
): Promise<PaginatedResponse<Product>> {
  try {
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
    const { data } = await api.get<PaginatedResponse<Product>>(
      `/products?${params}`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getProductBySlug(slug: string): Promise<Product> {
  try {
    const { data } = await api.get<Product>(`/products/slug/${slug}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getProductById(id: string): Promise<Product> {
  try {
    const { data } = await api.get<Product>(`/products/${id}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getRecommendations(
  productId: string,
): Promise<RecommendationResponse> {
  try {
    const { data } = await api.get<RecommendationResponse>(
      `/products/${productId}/recommendations`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function searchProducts(
  query: string,
  filters: Omit<ProductFilters, "search"> = {},
  signal?: AbortSignal,
): Promise<PaginatedResponse<Product>> {
  try {
    const params = new URLSearchParams({ q: query });
    if (filters.page) params.set("page", String(filters.page));
    if (filters.limit) params.set("limit", String(filters.limit));
    if (filters.sortBy) params.set("sortBy", filters.sortBy);
    if (filters.sortOrder) params.set("sortOrder", filters.sortOrder);
    const { data } = await api.get<PaginatedResponse<Product>>(
      `/products/search?${params}`,
      { signal },
    );
    return data;
  } catch (err) {
    if (isAxiosError(err) && err.name === "CanceledError") throw err;
    throw toApiError(err);
  }
}

/* ── Auth API ─────────────────────────────────────────────── */

export async function login(data: {
  email: string;
  password: string;
}): Promise<User> {
  try {
    const { data: res } = await api.post<User>("/auth/login", data);
    return res;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function register(data: RegisterData): Promise<User> {
  try {
    const { data: res } = await api.post<User>("/auth/register", data);
    return res;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getMe(): Promise<User> {
  try {
    const { data } = await api.get<User>("/auth/me");
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function logout(): Promise<void> {
  try {
    await api.post("/auth/logout");
  } catch (err) {
    throw toApiError(err);
  }
}

/* ── Admin API ──────────────────────────────────────────── */

export interface UploadResponse {
  url: string;
  filename: string;
  originalName: string;
  size: number;
  mimetype: string;
}

export interface AdminProductFilters extends ProductFilters {
  includeDeleted?: boolean;
}

export async function uploadImage(file: File): Promise<UploadResponse> {
  try {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<UploadResponse>("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "category" | "variants" | "_count">,
): Promise<Product> {
  try {
    const { data: res } = await api.post<Product>("/products", data);
    return res;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateProduct(
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    categoryId: string;
  }>,
): Promise<Product> {
  try {
    const { data: res } = await api.patch<Product>(`/products/${id}`, data);
    return res;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  try {
    await api.delete(`/products/${id}`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function restoreProduct(id: string): Promise<Product> {
  try {
    const { data } = await api.post<Product>(`/products/${id}/restore`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function generateDescription(
  id: string,
): Promise<{ description: string }> {
  try {
    const { data } = await api.post<{ description: string }>(
      `/products/${id}/generate-description`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createCategory(
  data: Omit<Category, "id" | "_count">,
): Promise<Category> {
  try {
    const { data: res } = await api.post<Category>("/categories", data);
    return res;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateCategory(
  id: string,
  data: Partial<{ name: string; slug: string }>,
): Promise<Category> {
  try {
    const { data: res } = await api.patch<Category>(
      `/categories/${id}`,
      data,
    );
    return res;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/categories/${id}`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function restoreCategory(id: string): Promise<Category> {
  try {
    const { data } = await api.post<Category>(`/categories/${id}/restore`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getAllProducts(
  filters?: Record<string, string>,
): Promise<PaginatedResponse<Product>> {
  try {
    const params = new URLSearchParams(filters ?? {});
    if (!params.has("limit")) params.set("limit", "10");
    const { data } = await api.get<PaginatedResponse<Product>>(
      `/products?${params}`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getAllCategories(
  page = 1,
  limit = 50,
): Promise<PaginatedResponse<Category>> {
  try {
    const { data } = await api.get<PaginatedResponse<Category>>(
      `/categories?page=${page}&limit=${limit}`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getDashboardStats(): Promise<{
  totalProducts: number;
  totalCategories: number;
  totalOrders: number;
  monthlyRevenue: number;
  pendingOrders: number;
  totalUsers: number;
}> {
  try {
    const [products, categories, orders, users] = await Promise.all([
      getAllProducts({ limit: "1" }),
      getAllCategories(1, 1),
      api.get<{ totalOrders: number; pendingOrders: number; monthlyRevenue: number }>(
        "/orders/admin/stats",
      ),
      api.get<{ totalUsers: number; totalCustomers: number; totalAdmins: number }>(
        "/users/stats",
      ),
    ]);
    return {
      totalProducts: products.meta.total,
      totalCategories: categories.meta.total,
      totalOrders: orders.data.totalOrders,
      monthlyRevenue: orders.data.monthlyRevenue,
      pendingOrders: orders.data.pendingOrders,
      totalUsers: users.data.totalUsers,
    };
  } catch {
    const [products, categories] = await Promise.all([
      getAllProducts({ limit: "1" }),
      getAllCategories(1, 1),
    ]);
    return {
      totalProducts: products.meta.total,
      totalCategories: categories.meta.total,
      totalOrders: 0,
      monthlyRevenue: 0,
      pendingOrders: 0,
      totalUsers: 0,
    };
  }
}

/* ── Order types & API ───────────────────────────────────── */

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  product: { id: string; name: string; slug: string; imageUrl?: string };
  productVariant: {
    id: string;
    sku: string;
    name: string;
    price?: number;
    size: string | null;
    color: string | null;
  };
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  user?: { id: string; email: string; firstName: string; lastName: string };
  items: OrderItem[];
}

export async function getAdminOrders(
  filters?: Record<string, string>,
): Promise<PaginatedResponse<Order>> {
  try {
    const params = new URLSearchParams(filters ?? {});
    if (!params.has("limit")) params.set("limit", "15");
    const { data } = await api.get<PaginatedResponse<Order>>(
      `/orders/admin/all?${params}`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getAdminOrder(id: string): Promise<Order> {
  try {
    const { data } = await api.get<Order>(`/orders/admin/${id}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  try {
    const { data } = await api.patch<Order>(`/orders/${id}/status`, { status });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

/* ── User types & API ────────────────────────────────────── */

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "CUSTOMER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
  _count: { orders: number };
}

export async function getAdminUsers(
  filters?: Record<string, string>,
): Promise<PaginatedResponse<AdminUser>> {
  try {
    const params = new URLSearchParams(filters ?? {});
    if (!params.has("limit")) params.set("limit", "15");
    const { data } = await api.get<PaginatedResponse<AdminUser>>(
      `/users?${params}`,
    );
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getAdminUser(id: string): Promise<AdminUser> {
  try {
    const { data } = await api.get<AdminUser>(`/users/${id}`);
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateUserRole(
  id: string,
  role: "CUSTOMER" | "ADMIN",
): Promise<AdminUser> {
  try {
    const { data } = await api.patch<AdminUser>(`/users/${id}/role`, null, {
      params: { role },
    });
    return data;
  } catch (err) {
    throw toApiError(err);
  }
}
