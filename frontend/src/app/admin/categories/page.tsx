"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAllCategories,
  deleteCategory,
  type Category,
  type PaginatedResponse,
} from "@/lib/api";

export default function CategoryListPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");

  const [data, setData] = useState<PaginatedResponse<Category> | null>(null);
  const [loading, setLoading] = useState(true);
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
    getAllCategories(page, 20).then((result) => {
      if (!cancelled && mountedRef.current) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page]);

  const refetch = () => {
    getAllCategories(page, 20).then((result) => {
      if (mountedRef.current) {
        setData(result);
      }
    });
  };

  const handleDelete = async (id: string) => {
    setActionLoading(id);
    try {
      await deleteCategory(id);
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
          <h1 className="text-2xl font-bold text-text-primary">Categories</h1>
          <p className="text-text-secondary">Organize your product catalog.</p>
        </div>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-2 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-background transition-all hover:bg-accent-primary/90 hover:shadow-glow-accent"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Category
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30 bg-surface-tertiary/50">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">Name</th>
              <th className="px-4 py-3 font-medium text-text-muted">Slug</th>
              <th className="px-4 py-3 font-medium text-text-muted">Products</th>
              <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-3"><div className="h-4 w-32 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-8 animate-pulse rounded bg-surface-tertiary" /></td>
                  <td className="px-4 py-3"><div className="ml-auto h-4 w-20 animate-pulse rounded bg-surface-tertiary" /></td>
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-text-muted">
                  No categories found.
                </td>
              </tr>
            ) : (
              data?.data.map((cat) => (
                <tr key={cat.id} className="transition-colors hover:bg-surface-tertiary/30">
                  <td className="px-4 py-3 font-medium text-text-primary">{cat.name}</td>
                  <td className="px-4 py-3 text-text-secondary">{cat.slug}</td>
                  <td className="px-4 py-3 text-text-secondary">{cat._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/categories/${cat.id}`}
                        className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                      >
                        Edit
                      </Link>
                      {deleteId === cat.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleDelete(cat.id)}
                            disabled={actionLoading === cat.id}
                            className="rounded-lg bg-error/10 px-3 py-1.5 text-sm font-medium text-error transition-colors hover:bg-error/20"
                          >
                            {actionLoading === cat.id ? "..." : "Confirm"}
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
                          onClick={() => setDeleteId(cat.id)}
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
                href={`/admin/categories?page=${p}`}
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
