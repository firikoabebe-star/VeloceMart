"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

const LABEL_MAP: Record<string, string> = {
  categoryId: "Category",
  minPrice: "Min price",
  maxPrice: "Max price",
  size: "Size",
  color: "Color",
  search: "Search",
};

function prettyValue(key: string, value: string): string {
  if (key === "minPrice") return `Over $${(parseInt(value) / 100).toFixed(0)}`;
  if (key === "maxPrice") return `Under $${(parseInt(value) / 100).toFixed(0)}`;
  return value;
}

export default function ActiveFilters() {
  const router = useRouter();
  const params = useSearchParams();

  const remove = useCallback(
    (key: string, value?: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value) {
        const values = sp.getAll(key).filter((v) => v !== value);
        sp.delete(key);
        values.forEach((v) => sp.append(key, v));
      } else {
        sp.delete(key);
      }
      sp.delete("page");
      router.push(`/products?${sp.toString()}`, { scroll: false });
    },
    [router, params],
  );

  const pills: { key: string; value: string; label: string }[] = [];

  const categoryId = params.get("categoryId");
  if (categoryId) {
    pills.push({ key: "categoryId", value: categoryId, label: "Category" });
  }
  params.getAll("size").forEach((v) => {
    pills.push({ key: "size", value: v, label: `Size: ${v}` });
  });
  params.getAll("color").forEach((v) => {
    pills.push({ key: "color", value: v, label: v });
  });
  const minP = params.get("minPrice");
  if (minP) {
    pills.push({ key: "minPrice", value: minP, label: prettyValue("minPrice", minP) });
  }
  const maxP = params.get("maxPrice");
  if (maxP) {
    pills.push({ key: "maxPrice", value: maxP, label: prettyValue("maxPrice", maxP) });
  }
  const search = params.get("search");
  if (search) {
    pills.push({ key: "search", value: search, label: `"${search}"` });
  }

  if (pills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {pills.map((pill) => (
        <button
          key={`${pill.key}-${pill.value}`}
          onClick={() => remove(pill.key, pill.value)}
          className="group flex items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1 text-xs text-text-secondary transition-colors hover:border-accent-secondary/40 hover:text-accent-secondary"
        >
          <span className="capitalize">{LABEL_MAP[pill.key] ?? pill.key}:</span>
          <span className="font-medium">{pill.label}</span>
          <svg
            className="h-3 w-3 text-text-muted transition-colors group-hover:text-accent-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      ))}
    </div>
  );
}
