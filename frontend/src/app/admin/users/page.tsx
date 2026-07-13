"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getAdminUsers,
  type AdminUser,
  type PaginatedResponse,
} from "@/lib/api";

export default function UserListPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const page = Number(searchParams.get("page") ?? "1");
  const search = searchParams.get("search") ?? "";

  const [data, setData] = useState<PaginatedResponse<AdminUser> | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(search);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const params: Record<string, string> = { page: String(page), limit: "15" };
    if (search) params.search = search;
    getAdminUsers(params).then((result) => {
      if (!cancelled && mountedRef.current) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchInput) params.set("search", searchInput);
    params.set("page", "1");
    router.push(`/admin/users?${params}`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Users</h1>
        <p className="text-text-secondary">Manage user accounts and roles.</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by name or email..."
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
              <th className="px-4 py-3 font-medium text-text-muted">User</th>
              <th className="px-4 py-3 font-medium text-text-muted">Email</th>
              <th className="px-4 py-3 font-medium text-text-muted">Role</th>
              <th className="px-4 py-3 font-medium text-text-muted">Orders</th>
              <th className="px-4 py-3 font-medium text-text-muted">Joined</th>
              <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-surface-tertiary" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-text-muted">
                  No users found.
                </td>
              </tr>
            ) : (
              data?.data.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-surface-tertiary/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent-tertiary text-xs font-semibold text-accent-primary">
                        {user.firstName[0]?.toUpperCase()}
                      </div>
                      <span className="font-medium text-text-primary">
                        {user.firstName} {user.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{user.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.role === "ADMIN"
                          ? "bg-accent-primary/10 text-accent-primary"
                          : "bg-surface-tertiary text-text-secondary"
                      }`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{user._count.orders}</td>
                  <td className="px-4 py-3 text-text-muted">
                    {new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/users/${user.id}`}
                      className="rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary"
                    >
                      View
                    </Link>
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
                href={`/admin/users?page=${p}${search ? `&search=${search}` : ""}`}
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
