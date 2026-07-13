"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getDashboardStats } from "@/lib/api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalProducts: number;
    totalCategories: number;
    totalOrders: number;
    monthlyRevenue: number;
    pendingOrders: number;
    totalUsers: number;
  } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getDashboardStats().then((s) => {
      if (!cancelled) setStats(s);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary">Welcome to the VeloceMart admin panel.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { label: "Products", value: stats?.totalProducts ?? "—", href: "/admin/products" },
          { label: "Categories", value: stats?.totalCategories ?? "—", href: "/admin/categories" },
          { label: "Users", value: stats?.totalUsers ?? "—", href: "/admin/users" },
          { label: "Total Orders", value: stats?.totalOrders ?? "—", href: "/admin/orders" },
          { label: "Pending Orders", value: stats?.pendingOrders ?? "—", href: "/admin/orders?status=PENDING" },
          {
            label: "Monthly Revenue",
            value: stats !== null ? `$${(stats.monthlyRevenue / 100).toFixed(2)}` : "—",
            href: "/admin/orders",
          },
        ].map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-xl border border-border/50 bg-surface p-6 transition-all hover:shadow-elevation-2"
          >
            <p className="text-sm text-text-muted">{item.label}</p>
            <p className="mt-2 text-3xl font-bold text-text-primary">
              {stats === null ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-surface-tertiary" />
              ) : (
                item.value
              )}
            </p>
          </Link>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/admin/products/new"
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-6 transition-all hover:shadow-elevation-2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-tertiary/10 text-accent-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Add Product</p>
            <p className="text-sm text-text-muted">Create a new product listing</p>
          </div>
        </Link>
        <Link
          href="/admin/categories/new"
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-6 transition-all hover:shadow-elevation-2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-tertiary/10 text-accent-primary">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Add Category</p>
            <p className="text-sm text-text-muted">Create a new product category</p>
          </div>
        </Link>
        <Link
          href="/admin/orders?status=PENDING"
          className="flex items-center gap-3 rounded-xl border border-border/50 bg-surface p-6 transition-all hover:shadow-elevation-2"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-text-primary">Pending Orders</p>
            <p className="text-sm text-text-muted">Review orders awaiting fulfillment</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
