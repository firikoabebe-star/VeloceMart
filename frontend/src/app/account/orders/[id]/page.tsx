"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getMyOrder, type Order, type OrderStatus } from "@/lib/api";

/* ── Status Styles ───────────────────────────────────────── */

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  CONFIRMED: "bg-accent-primary text-on-accent border-accent-primary/50",
  SHIPPED: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-error/10 text-error border-error/20",
};

const TIMELINE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "SHIPPED",
  "DELIVERED",
];

const TIMELINE_INDEX: Record<string, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  SHIPPED: 2,
  DELIVERED: 3,
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!params?.id) return;
    let cancelled = false;
    getMyOrder(params.id)
      .then((o) => {
        if (!cancelled) {
          setOrder(o);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params?.id]);

  if (loading) {
    return (
      <div className="flex min-h-[30vh] items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-border border-t-accent-primary" />
          <span className="text-sm">Loading order...</span>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="animate-fade-in space-y-6">
        <Link
          href="/account/orders"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-strong transition-colors hover:text-accent-strong/80"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Orders
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-border/50 bg-surface py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-error/10">
            <svg className="h-7 w-7 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <p className="text-lg font-semibold text-text-primary">
            Order not found
          </p>
          <p className="mt-1 text-sm text-text-muted">
            The order you are looking for does not exist or you do not have access to it.
          </p>
        </div>
      </div>
    );
  }

  const subtotal = order.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0,
  );

  const currentTimelineIndex =
    order.status === "CANCELLED" ? -1 : TIMELINE_INDEX[order.status] ?? -1;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Back link */}
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
        Back to Orders
      </Link>

      {/* Order header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border/50 bg-surface p-6 sm:p-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            Order <span className="text-accent-strong">#{order.id.slice(0, 8)}</span>
          </h1>
          <div className="mt-1.5 flex items-center gap-2 text-sm text-text-muted">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            Placed on {formatDate(order.createdAt)}
          </div>
        </div>
        <span
          className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${STATUS_BADGE[order.status] ?? "bg-surface-tertiary text-text-muted border-border"}`}
        >
          <span className={`mr-1.5 h-1.5 w-1.5 rounded-full ${order.status === "PENDING" ? "bg-warning" : order.status === "CONFIRMED" ? "bg-accent-primary" : order.status === "SHIPPED" ? "bg-blue-500" : order.status === "DELIVERED" ? "bg-success" : "bg-error"}`} />
          {order.status}
        </span>
      </div>

      {/* Order timeline */}
      {order.status !== "CANCELLED" && (
        <div className="rounded-xl border border-border/50 bg-surface p-6 sm:p-8">
          <h2 className="mb-6 text-base font-semibold text-text-primary">
            Order Status
          </h2>
          <div className="relative flex items-start justify-between">
            {TIMELINE_STATUSES.map((status, i) => {
              const isCompleted = currentTimelineIndex >= i;
              const isCurrent = currentTimelineIndex === i;
              return (
                <div key={status} className="flex flex-1 flex-col items-center">
                  <div className="relative flex flex-col items-center">
                    {/* Step circle */}
                    <div
                      className={`relative flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all duration-500 ${
                        isCurrent
                          ? "bg-accent-primary text-on-accent shadow-lg shadow-accent-primary/30"
                          : isCompleted
                            ? "bg-success text-white shadow-sm"
                            : "bg-surface-tertiary text-text-muted"
                      }`}
                    >
                      {isCompleted && !isCurrent ? (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        i + 1
                      )}
                    </div>
                    {/* Label */}
                    <span
                      className={`mt-2.5 text-center text-[11px] font-semibold uppercase tracking-wider ${
                        isCurrent
                          ? "text-accent-strong"
                          : isCompleted
                            ? "text-success"
                            : "text-text-muted"
                      }`}
                    >
                      {status}
                    </span>
                  </div>
                  {/* Connector line */}
                  {i < TIMELINE_STATUSES.length - 1 && (
                    <div className="absolute left-[calc(50%+1.125rem)] right-[calc(50%-1.125rem)] top-[1.125rem] hidden sm:block">
                      <div
                        className={`h-0.5 transition-all duration-700 ${
                          currentTimelineIndex > i
                            ? "bg-success"
                            : "bg-surface-tertiary"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cancelled notice */}
      {order.status === "CANCELLED" && (
        <div className="rounded-xl border border-error/20 bg-error/5 p-6">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-error/10">
              <svg className="h-4 w-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-error">Order Cancelled</p>
              <p className="mt-0.5 text-xs text-text-muted">
                This order has been cancelled and will not be processed.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="rounded-xl border border-border/50 bg-surface p-6 sm:p-8">
        <h2 className="mb-5 text-base font-semibold text-text-primary">
          Order Items
          <span className="ml-2 text-sm font-normal text-text-muted">
            ({order.items.length} item{order.items.length !== 1 ? "s" : ""})
          </span>
        </h2>
        <div className="divide-y divide-border/30">
          {order.items.map((item) => (
            <div key={item.id} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-tertiary ring-1 ring-border/30">
                {item.product.imageUrl ? (
                  <Image
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <svg className="h-6 w-6 text-text-muted/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {item.product.name}
                  </p>
                  <p className="mt-0.5 text-xs text-text-secondary">
                    {item.productVariant.name}
                  </p>
                  {(item.productVariant.size || item.productVariant.color) && (
                    <div className="mt-1 flex items-center gap-2 text-xs text-text-muted">
                      {item.productVariant.size && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-tertiary px-1.5 py-0.5 text-[10px] font-medium">
                          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                          </svg>
                          {item.productVariant.size}
                        </span>
                      )}
                      {item.productVariant.color && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-surface-tertiary px-1.5 py-0.5 text-[10px] font-medium">
                          <span
                            className="h-2.5 w-2.5 rounded-full ring-1 ring-border/50"
                            style={{ backgroundColor: item.productVariant.color }}
                          />
                          {item.productVariant.color}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-text-secondary">
                    Qty: {item.quantity} &times; {formatCurrency(item.unitPrice)}
                  </span>
                  <span className="font-semibold text-text-primary tabular-nums">
                    {formatCurrency(item.quantity * item.unitPrice)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Order summary */}
      <div className="rounded-xl border border-border/50 bg-surface p-6 sm:p-8">
        <h2 className="mb-4 text-base font-semibold text-text-primary">
          Order Summary
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Subtotal ({order.items.length} item{order.items.length !== 1 ? "s" : ""})</span>
            <span className="text-text-primary tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm text-text-secondary">
            <span>Shipping</span>
            <span className="text-success">Free</span>
          </div>
          <div className="flex justify-between border-t border-border/30 pt-3 text-base">
            <span className="font-semibold text-text-primary">Total</span>
            <span className="font-bold text-text-primary tabular-nums">
              {formatCurrency(order.totalAmount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
