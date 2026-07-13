"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  getAdminUser,
  updateUserRole,
  type AdminUser,
} from "@/lib/api";

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminUser(id).then((u) => {
      setUser(u);
      setLoading(false);
    });
  }, [id]);

  const handleRoleChange = async (role: "CUSTOMER" | "ADMIN") => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateUserRole(id, role);
      setUser(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update role");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
      </div>
    );
  }

  if (!user) {
    return <div className="text-center text-text-muted">User not found.</div>;
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <Link href="/admin/users" className="text-sm text-text-muted hover:text-accent-primary">
          ← Back to users
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-text-primary">
          {user.firstName} {user.lastName}
        </h1>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
      )}

      {/* User info card */}
      <div className="rounded-xl border border-border/50 bg-surface p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent-tertiary text-xl font-bold text-accent-primary">
            {user.firstName[0]?.toUpperCase()}
          </div>
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-sm text-text-muted">Email</p>
              <p className="text-text-primary">{user.email}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">User ID</p>
              <p className="font-mono text-xs text-text-secondary">{user.id}</p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Joined</p>
              <p className="text-text-primary">
                {new Date(user.createdAt).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div>
              <p className="text-sm text-text-muted">Total Orders</p>
              <p className="text-text-primary">{user._count.orders}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Role management */}
      <div className="rounded-xl border border-border/50 bg-surface p-6">
        <p className="mb-4 text-sm font-medium text-text-secondary">Role</p>
        <div className="flex gap-3">
          <button
            onClick={() => handleRoleChange("CUSTOMER")}
            disabled={updating || user.role === "CUSTOMER"}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              user.role === "CUSTOMER"
                ? "bg-accent-primary text-background"
                : "bg-surface-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            Customer
          </button>
          <button
            onClick={() => handleRoleChange("ADMIN")}
            disabled={updating || user.role === "ADMIN"}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
              user.role === "ADMIN"
                ? "bg-accent-primary text-background"
                : "bg-surface-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            Admin
          </button>
        </div>
        <p className="mt-3 text-xs text-text-muted">
          Changing a user to admin grants full access to this dashboard.
        </p>
      </div>
    </div>
  );
}
