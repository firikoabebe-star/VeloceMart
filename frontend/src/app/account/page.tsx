"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useAuth } from "@/features/auth/hooks/useAuth";
import {
  getMyOrderStats,
  getMyOrders,
  type UserOrderStats,
  type Order,
} from "@/lib/api";

/* ── Status Colors & Badges ─────────────────────────────── */

const STATUS_COLORS: Record<string, string> = {
  PENDING: "#F39C12",
  CONFIRMED: "#FFA586",
  SHIPPED: "#3498DB",
  DELIVERED: "#2ECC71",
  CANCELLED: "#E74C3C",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-warning/10 text-warning border-warning/20",
  CONFIRMED: "bg-accent-primary/10 text-accent-primary border-accent-primary/20",
  SHIPPED: "bg-[#3498DB]/10 text-[#3498DB] border-[#3498DB]/20",
  DELIVERED: "bg-success/10 text-success border-success/20",
  CANCELLED: "bg-error/10 text-error border-error/20",
};

/* ── Helpers ─────────────────────────────────────────────── */

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

function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-tertiary ${className}`}
    />
  );
}

/* ── Stat card icon map ──────────────────────────────────── */

function StatIcon({ label }: { label: string }) {
  const cls = "h-5 w-5";
  switch (label) {
    case "Total Orders":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
        </svg>
      );
    case "Total Spent":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Active Orders":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5" />
        </svg>
      );
    case "Pending Orders":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    case "Member Since":
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      );
    default:
      return (
        <svg className={cls} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
        </svg>
      );
  }
}

/* ── Custom tooltip ──────────────────────────────────────── */

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-surface px-3 py-2 text-sm shadow-elevation-2">
      <p className="font-medium text-text-primary">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-text-secondary">
          {entry.name}:{" "}
          <span className="font-semibold text-text-primary">
            {typeof entry.value === "number"
              ? `$${entry.value.toFixed(2)}`
              : entry.value}
          </span>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const entry = payload[0];
  return (
    <div className="rounded-lg border border-border/50 bg-surface px-3 py-2 text-sm shadow-elevation-2">
      <p className="font-medium text-text-primary">{entry.name}</p>
      <p className="text-text-secondary">
        Count:{" "}
        <span className="font-semibold text-text-primary">{entry.value}</span>
      </p>
    </div>
  );
}

/* ── Page Component ──────────────────────────────────────── */

export default function AccountOverviewPage() {
  const { user, isLoading: authLoading } = useAuth();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<UserOrderStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (authLoading) return;
    let cancelled = false;
    Promise.all([getMyOrderStats(), getMyOrders({ limit: "5" })]).then(
      ([s, o]) => {
        if (!cancelled) {
          setStats(s);
          setOrders(o.data);
          setLoading(false);
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [authLoading]);

  const chartTextColor =
    mounted && resolvedTheme === "dark" ? "#9CA3AF" : "#6B7280";
  const chartGridColor =
    mounted && resolvedTheme === "dark" ? "#374151" : "#E5E7EB";

  const spendingData =
    stats?.spendingOverTime.map((d) => ({
      month: d.month,
      total: d.total / 100,
    })) ?? [];

  const pieData = stats
    ? Object.entries(stats.orderStatusBreakdown)
        .filter(([, v]) => v > 0)
        .map(([name, value]) => ({ name, value }))
    : [];

  const totalOrders = stats?.totalOrders ?? 0;

  const statCards = [
    { label: "Total Orders", value: totalOrders },
    { label: "Total Spent", value: formatCurrency(stats?.totalSpent ?? 0) },
    { label: "Active Orders", value: stats?.activeOrders ?? 0 },
    { label: "Pending Orders", value: stats?.pendingOrders ?? 0 },
    {
      label: "Member Since",
      value: user?.createdAt ? formatDate(user.createdAt) : "—",
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-xl border border-border/50 bg-surface p-6 sm:p-8">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent-primary/5 blur-2xl" />
        <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-accent-tertiary/5 blur-xl" />
        <div className="relative">
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">
            {loading || authLoading ? (
              <SkeletonBlock className="h-8 w-64" />
            ) : (
              <>
                Welcome back,{" "}
                <span className="text-accent-primary">{user?.firstName}</span>
              </>
            )}
          </h1>
          <p className="mt-1 text-text-secondary">
            Here&apos;s an overview of your account activity.
          </p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="rounded-xl border border-border/50 bg-surface p-5"
              >
                <SkeletonBlock className="h-4 w-24" />
                <SkeletonBlock className="mt-3 h-9 w-20" />
              </div>
            ))
          : statCards.map((item, idx) => (
              <div
                key={item.label}
                className="group rounded-xl border border-border/50 bg-surface p-5 transition-all duration-200 hover:shadow-elevation-2 hover:border-accent-primary/20"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-text-muted">
                    {item.label}
                  </p>
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-tertiary/5 text-accent-primary transition-transform duration-200 group-hover:scale-110 group-hover:bg-accent-tertiary/10">
                    <StatIcon label={item.label} />
                  </span>
                </div>
                <p className="mt-3 text-2xl font-bold tracking-tight text-text-primary">
                  {item.value}
                </p>
                {item.label === "Total Orders" && stats && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className="inline-flex items-center gap-0.5 text-success">
                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                      </svg>
                      {stats.deliveredOrders > 0
                        ? `${Math.round((stats.deliveredOrders / totalOrders) * 100)}%`
                        : "0%"}
                    </span>
                    <span className="text-text-muted">delivered</span>
                  </div>
                )}
                {item.label === "Total Spent" && stats && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs">
                    <span className="text-text-muted">
                      Avg.{" "}
                      {totalOrders > 0
                        ? formatCurrency(stats.totalSpent / totalOrders)
                        : "$0.00"}{" "}
                      per order
                    </span>
                  </div>
                )}
              </div>
            ))}
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Spending bar chart */}
        <div className="rounded-xl border border-border/50 bg-surface p-6 transition-all duration-200 hover:shadow-elevation-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              Spending Over Time
            </h2>
            {spendingData.length > 0 && (
              <span className="rounded-full bg-accent-primary/10 px-2.5 py-0.5 text-xs font-medium text-accent-primary">
                Total: {formatCurrency(stats?.totalSpent ?? 0)}
              </span>
            )}
          </div>
          {loading ? (
            <SkeletonBlock className="h-64 w-full" />
          ) : spendingData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-text-muted">
              No spending data yet
            </div>
          ) : (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={spendingData}
                  margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="spendingGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent-primary)" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="var(--accent-primary)" stopOpacity={0.2} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    tick={{ fill: chartTextColor, fontSize: 12 }}
                    axisLine={{ stroke: chartGridColor }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: chartTextColor, fontSize: 12 }}
                    axisLine={{ stroke: chartGridColor }}
                    tickLine={false}
                    tickFormatter={(v: number) => `$${v}`}
                  />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "var(--color-surface-tertiary)", opacity: 0.5 }} />
                  <Bar
                    dataKey="total"
                    fill="url(#spendingGradient)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    animationBegin={200}
                    animationDuration={800}
                    animationEasing="ease-out"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Order status pie chart */}
        <div className="rounded-xl border border-border/50 bg-surface p-6 transition-all duration-200 hover:shadow-elevation-1">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              Order Status Breakdown
            </h2>
            {pieData.length > 0 && (
              <span className="rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-medium text-success">
                {totalOrders} total
              </span>
            )}
          </div>
          {loading ? (
            <SkeletonBlock className="h-64 w-full" />
          ) : pieData.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-text-muted">
              No orders yet
            </div>
          ) : (
            <div className="flex h-64 items-center gap-6">
              <div className="h-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      dataKey="value"
                      stroke="none"
                      animationBegin={400}
                      animationDuration={800}
                      animationEasing="ease-out"
                    >
                      {pieData.map((entry) => (
                        <Cell
                          key={entry.name}
                          fill={STATUS_COLORS[entry.name] ?? "#8884d8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<PieTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Legend */}
              <div className="flex flex-col gap-3">
                {pieData.map((entry) => {
                  const pct = totalOrders > 0 ? ((entry.value / totalOrders) * 100).toFixed(0) : "0";
                  return (
                    <div key={entry.name} className="flex items-center gap-2.5">
                      <span
                        className="inline-block h-2.5 w-2.5 rounded-full ring-2 ring-transparent"
                        style={{
                          backgroundColor: STATUS_COLORS[entry.name] ?? "#8884d8",
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium text-text-primary">
                          {entry.name}
                        </span>
                        <span className="text-[11px] text-text-muted">
                          {entry.value} ({pct}%)
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent orders */}
      <div className="rounded-xl border border-border/50 bg-surface p-6 transition-all duration-200 hover:shadow-elevation-1">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-text-primary">
              Recent Orders
            </h2>
            {orders.length > 0 && (
              <p className="mt-0.5 text-xs text-text-muted">
                Showing the {orders.length} most recent
              </p>
            )}
          </div>
          <Link
            href="/account/orders"
            className="inline-flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium text-accent-primary transition-all duration-200 hover:bg-accent-primary/10"
          >
            View all
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </Link>
        </div>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface-tertiary">
              <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-text-primary">
              No orders yet
            </p>
            <p className="mt-1 text-xs text-text-muted">
              Start shopping to see your orders here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order, idx) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.id}`}
                className="group flex items-center justify-between rounded-lg border border-border/30 bg-surface-tertiary/30 p-4 transition-all duration-200 hover:border-accent-primary/20 hover:bg-surface-tertiary/60 hover:shadow-elevation-1"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-tertiary/5 text-accent-primary transition-transform duration-200 group-hover:scale-110">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary group-hover:text-accent-primary transition-colors">
                      #{order.id.slice(0, 8)}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                      <span>{formatDate(order.createdAt)}</span>
                      <span className="text-border">·</span>
                      <span>{order.items.length} item{order.items.length !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_BADGE[order.status] ?? "bg-surface-tertiary text-text-muted border-border"}`}
                  >
                    {order.status}
                  </span>
                  <span className="text-sm font-bold text-text-primary">
                    {formatCurrency(order.totalAmount)}
                  </span>
                  <svg className="h-4 w-4 text-text-muted transition-transform duration-200 group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
