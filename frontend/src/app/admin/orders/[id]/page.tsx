"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import {
  getAdminOrder,
  updateOrderStatus,
  type Order,
  type OrderStatus,
} from "@/lib/api";

const STATUS_COLORS: Record<OrderStatus, string> = {
  PENDING: "bg-warning/10 text-warning",
  CONFIRMED: "bg-accent-primary/10 text-accent-primary",
  SHIPPED: "bg-accent-secondary/10 text-accent-secondary",
  DELIVERED: "bg-success/10 text-success",
  CANCELLED: "bg-error/10 text-error",
};

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAdminOrder(id).then((o) => {
      setOrder(o);
      setLoading(false);
    });
  }, [id]);

  const handleStatusUpdate = async (newStatus: OrderStatus) => {
    setUpdating(true);
    setError(null);
    try {
      const updated = await updateOrderStatus(id, newStatus);
      setOrder(updated);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status");
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

  if (!order) {
    return (
      <div className="text-center text-text-muted">
        Order not found.
      </div>
    );
  }

  const nextStatuses = VALID_TRANSITIONS[order.status];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/admin/orders" className="text-sm text-text-muted hover:text-accent-primary">
          ← Back to orders
        </Link>
        <div className="mt-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">
              Order {order.id.slice(0, 8)}...
            </h1>
            <p className="text-text-muted">{formatDate(order.createdAt)}</p>
          </div>
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${STATUS_COLORS[order.status]}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      {error && (
        <div className="rounded-lg bg-error/10 p-3 text-sm text-error">{error}</div>
      )}

      {/* Status update */}
      {nextStatuses.length > 0 && (
        <div className="rounded-xl border border-border/50 bg-surface p-4">
          <p className="mb-3 text-sm font-medium text-text-secondary">Update Status</p>
          <div className="flex flex-wrap gap-2">
            {nextStatuses.map((status) => (
              <button
                key={status}
                onClick={() => handleStatusUpdate(status)}
                disabled={updating}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors disabled:opacity-50 ${
                  status === "CANCELLED"
                    ? "bg-error/10 text-error hover:bg-error/20"
                    : "bg-accent-tertiary/10 text-accent-primary hover:bg-accent-tertiary/20"
                }`}
              >
                {updating ? "..." : status}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Customer info */}
      {order.user && (
        <div className="rounded-xl border border-border/50 bg-surface p-4">
          <p className="mb-2 text-sm font-medium text-text-secondary">Customer</p>
          <p className="text-text-primary">
            {order.user.firstName} {order.user.lastName}
          </p>
          <p className="text-sm text-text-muted">{order.user.email}</p>
        </div>
      )}

      {/* Order items */}
      <div className="rounded-xl border border-border/50 bg-surface p-4">
        <p className="mb-3 text-sm font-medium text-text-secondary">Items</p>
        <div className="divide-y divide-border/30">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
              {item.product.imageUrl ? (
                <img
                  src={item.product.imageUrl}
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-surface-tertiary text-text-muted">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H3.75A2.25 2.25 0 001.5 6.75v12A2.25 2.25 0 003.75 21z" />
                  </svg>
                </div>
              )}
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary">{item.product.name}</p>
                <p className="text-xs text-text-muted">
                  {item.productVariant.name}
                  {item.productVariant.size && ` · ${item.productVariant.size}`}
                  {item.productVariant.color && ` · ${item.productVariant.color}`}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-text-primary">
                  {formatPrice(Number(item.unitPrice))}
                </p>
                <p className="text-xs text-text-muted">Qty: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border/30 pt-4">
          <p className="text-sm font-medium text-text-secondary">Total</p>
          <p className="text-lg font-bold text-text-primary">
            {formatPrice(Number(order.totalAmount))}
          </p>
        </div>
      </div>
    </div>
  );
}
