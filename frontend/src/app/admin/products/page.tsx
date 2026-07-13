"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAllProducts,
  deleteProduct,
  type Product,
  type PaginatedResponse,
} from "@/lib/api";

export default function ProductListPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";

  const [data, setData] = useState<PaginatedResponse<Product> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, string> = { page: String(page), limit: "10" };
    if (search) params.search = search;
    getAllProducts(params).then((result) => {
      if (!cancelled && mountedRef.current) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const refetch = () => {
    const params: Record<string, string> = { page: String(page), limit: "10" };
    if (search) params.search = search;
    getAllProducts(params).then((result) => {
      if (mountedRef.current) {
        setData(result);
      }
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    params.set("page", "1");
    router.push(`/admin/products?${params}`);
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await deleteProduct(id);
      refetch();
    } finally {
      setActionLoading(null);
      setDeleteId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-text-secondary">Manage your product catalog.</p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-background transition-all hover:bg-accent-primary/90 hover:shadow-glow-accent"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Product
        </Link>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products..."
          className="flex-1"
        />
        <button
          type="submit"
          className="rounded-lg bg-surface-tertiary px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-border"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30 bg-surface-tertiary/50">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">Product</th>
              <th className="px-4 py-3 font-medium text-text-muted">Category</th>
              <th className="px-4 py-3 font-medium text-text-muted">Variants</th>
              <th className="px-4 py-3 font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 w-40 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-8 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-surface-tertiary" /></td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-text-muted">
                  No products found.
                </td>
              </tr>
            ) : (
              data?.data.map((product) => (
                <tr key={product.id} className="transition-colors hover:bg-surface-tertiary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                      ) : (
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-tertiary text-text-muted">
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12A2.25 2.25 0 003.75 21z" />
                          </svg>
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-text-primary">{product.name}</p>
                        <p className="text-xs text-text-muted">{product.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{product.category.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{product._count.variants}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                      Active
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/products/${product.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                      >
                        Edit
                      </Link>
                      {deleteId === product.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={actionLoading === product.id}
                            className="rounded-lg bg-error/10 px-3 py-1.5 text-sm font-medium text-error transition-colors hover:bg-error/20"
                          >
                            {actionLoading === product.id ? "..." : "Confirm"}
                          </button>
                          <button
                            onClick={() => setDeleteId(null)}
                            className="rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-surface-tertiary"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteId(product.id)}
                          className="rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map(
            (p) => (
              <Link
                key={p}
                href={`/admin/products?page=${p}${search ? `&search=${search}` : ""}`}
                className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  p === page
                    ? "bg-accent-primary text-background"
                    : "text-text-secondary hover:bg-surface-tertiary"
                }`}
              >
                {p}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}
