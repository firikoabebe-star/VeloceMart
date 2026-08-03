"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  getMyOrders,
  type Order,
  type OrderStatus,
  type PaginatedResponse,
} from "@/lib/api";

/* ── Theme-aware Status Colors & Badges ─────────────────── */

const STATUS_STYLES: Record<OrderStatus, { badge: string; dot: string }> = {
  PENDING: {
    badge: "bg-warning/10 text-warning border-warning/20",
    dot: "bg-warning",
  },
  CONFIRMED: {
    badge: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
    dot: "bg-accent-primary",
  },
  SHIPPED: {
    badge: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    dot: "bg-blue-500",
  },
  DELIVERED: {
    badge: "bg-success/10 text-success border-success/20",
    dot: "bg-success",
  },
  CANCELLED: {
    badge: "bg-error/10 text-error border-error/20",
    dot: "bg-error",
  },
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

function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border/50 bg-surface p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-lg bg-surface-tertiary" />
          <div className="space-y-2">
            <div className="h-4 w-24 rounded bg-surface-tertiary" />
            <div className="h-3 w-32 rounded bg-surface-tertiary" />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-6 w-20 rounded-full bg-surface-tertiary" />
          <div className="h-4 w-16 rounded bg-surface-tertiary" />
        </div>
      </div>
    </div>
  );
}

export default function OrderHistoryPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Number(searchParams.get("page") ?? "1");
  const status = searchParams.get("status") ?? "";

  const [data, setData] = useState<PaginatedResponse<Order> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: "10" };
    if (status) params.status = status;
    getMyOrders(params).then((result) => {
      if (!cancelled) {
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
    const nextStatus = overrides.status ?? status;
    const nextPage = overrides.page ?? "1";
    if (nextStatus) params.set("status", nextStatus);
    params.set("page", nextPage);
    return `${pathname}?${params}`;
  };

  const renderPagination = () => {
    if (!data || data.meta.totalPages <= 1) return null;
    const { totalPages } = data.meta;
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      for (
        let i = Math.max(2, page - 1);
        i <= Math.min(totalPages - 1, page + 1);
        i++
      ) {
        pages.push(i);
      }
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return (
      <div className="flex items-center justify-center gap-1.5 pt-2">
        <button
          onClick={() => router.push(buildHref({ page: String(page - 1) }))}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Previous
        </button>
        {pages.map((p, i) =>
          p === "..." ? (
            <span
              key={`ellipsis-${i}`}
              className="flex h-9 w-9 items-center justify-center text-sm text-text-muted"
            >
              ...
            </span>
          ) : (
            <Link
              key={p}
              href={buildHref({ page: String(p) })}
              className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ${
                p === page
                  ? "bg-accent-primary text-background shadow-sm"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
              }`}
            >
              {p}
            </Link>
          ),
        )}
        <button
          onClick={() => router.push(buildHref({ page: String(page + 1) }))}
          disabled={page >= (data?.meta.totalPages ?? 1)}
          className="inline-flex items-center gap-1 rounded-lg px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-tertiary hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    );
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-text-primary">
          Order History
        </h1>
        <p className="mt-1 text-text-secondary">
          View and track all your orders.
        </p>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => {
          const isActive = status === opt.value || (!status && !opt.value);
          const statusColor = opt.value
            ? STATUS_STYLES[opt.value as OrderStatus]?.dot
            : "";
          return (
            <Link
              key={opt.value}
              href={buildHref({ status: opt.value, page: "1" })}
              className={`relative inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-accent-primary text-background shadow-sm"
                  : "bg-surface-tertiary text-text-secondary hover:bg-surface-tertiary/80 hover:text-text-primary"
              }`}
            >
              {statusColor && (
                <span
                  className={`h-1.5 w-1.5 rounded-full ${statusColor}`}
                />
              )}
              {opt.label}
            </Link>
          );
        })}
      </div>

      {/* Data summary */}
      {!loading && data && data.meta.total > 0 && (
        <p className="text-xs text-text-muted">
          Showing page {page} of {data.meta.totalPages} ({data.meta.total} total)
        </p>
      )}

      {/* Order cards */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-surface-tertiary">
            <svg className="h-7 w-7 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            No orders found
          </h3>
          <p className="mt-1 max-w-sm text-sm text-text-secondary">
            {status
              ? `No orders with status "${status}". Try a different filter.`
              : "You haven't placed any orders yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.data.map((order, idx) => {
            const style = STATUS_STYLES[order.status];
            return (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group flex items-center justify-between rounded-xl border border-border/50 bg-surface p-5 transition-all duration-200 hover:shadow-elevation-2 hover:border-accent-primary/20"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-tertiary/5 text-accent-primary transition-all duration-200 group-hover:scale-110 group-hover:bg-accent-tertiary/10">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  {/* Info */}
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                      #{order.id.slice(0, 8)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-xs text-text-muted">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="text-border">·</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {/* Status badge */}
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style.badge}`}
                  >
                    <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {order.status}
                  </span>
                  {/* Total */}
                  <span className="text-sm font-bold text-text-primary tabular-nums">
                    {formatPrice(order.totalAmount)}
                  </span>
                  {/* Chevron */}
                  <svg
                    className="h-4 w-4 text-text-muted transition-all duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {renderPagination()}
    </div>
  );
}
