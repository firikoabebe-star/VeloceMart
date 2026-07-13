"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getAdminOrders,
  type Order,
  type OrderStatus,
  type PaginatedResponse,
} from "@/lib/api";

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-accent-primary/10 text-accent-primary",
  SHIPPED: "bg-accent-secondary/10 text-accent-secondary",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-error/10 text-error",
};

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function OrderListPage() {
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "";

  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);
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
    if (status) params.status = status;
    getAdminOrders(params).then((result) => {
      if (!cancelled && mountedRef.current) {
        setData(result);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [page, status]);

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    if (overrides.status ?? status) params.set("status", overrides.status ?? status);
    params.set("page", overrides.page ?? "1");
    return `/admin/orders?${params}`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Orders</h1>
        <p className="text-text-secondary">Manage customer orders and fulfillment.</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildHref({ status: opt.value, page: "1" })}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              status === opt.value || (!status && !opt.value)
                ? "bg-accent-primary text-background"
                : "bg-surface-tertiary text-text-secondary hover:text-text-primary"
            }`}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border/50">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border/30 bg-surface-tertiary/50">
            <tr>
              <th className="px-4 py-3 font-medium text-text-muted">Order</th>
              <th className="px-4 py-3 font-medium text-text-muted">Customer</th>
              <th className="px-4 py-3 font-medium text-text-muted">Items</th>
              <th className="px-4 py-3 font-medium text-text-muted">Total</th>
              <th className="px-4 py-3 font-medium text-text-muted">Status</th>
              <th className="px-4 py-3 font-medium text-text-muted">Date</th>
              <th className="px-4 py-3 text-right font-medium text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 7 }).map((_, j) => (
                    <td key={j} className="px-4 py-3">
                      <div className="h-4 w-20 animate-pulse rounded bg-surface-tertiary" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data?.data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-text-muted">
                  No orders found.
                </td>
              </tr>
            ) : (
              data?.data.map((order) => (
                <tr key={order.id} className="transition-colors hover:bg-surface-tertiary/30">
                  <td className="px-4 py-3 font-mono text-xs text-text-primary">
                    {order.id.slice(0, 8)}...
                  </td>
                  <td className="px-4 py-3 text-text-secondary">
                    {order.user
                      ? `${order.user.firstName} ${order.user.lastName}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-text-secondary">{order.items.length}</td>
                  <td className="px-4 py-3 font-medium text-text-primary">
                    {formatPrice(Number(order.totalAmount))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[order.status]}`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-muted">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
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
                href={buildHref({ page: String(p) })}
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
