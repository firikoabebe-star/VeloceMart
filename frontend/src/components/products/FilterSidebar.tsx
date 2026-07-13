"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useId, useState } from "react";
import type { Category } from "@/lib/api";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;

const COLORS = [
  { label: "Black", value: "Black" },
  { label: "White", value: "White" },
  { label: "Navy", value: "Navy" },
  { label: "Red", value: "Red" },
  { label: "Blue", value: "Blue" },
  { label: "Green", value: "Green" },
  { label: "Grey", value: "Grey" },
  { label: "Brown", value: "Brown" },
  { label: "Beige", value: "Beige" },
] as const;

const PRICE_PRESETS = [
  { label: "Under $50", max: 5000 },
  { label: "$50 – $100", min: 5000, max: 10000 },
  { label: "$100 – $200", min: 10000, max: 20000 },
  { label: "$200+", min: 20000 },
] as const;

interface Props {
  categories: Category[];
  onClose?: () => void;
}

export default function FilterSidebar({ categories, onClose }: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const [minPriceInput, setMinPriceInput] = useState(
    params.get("minPrice") ?? "",
  );
  const [maxPriceInput, setMaxPriceInput] = useState(
    params.get("maxPrice") ?? "",
  );

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const sp = new URLSearchParams(params.toString());
      if (value === null || value === "") {
        sp.delete(key);
      } else {
        sp.set(key, value);
      }
      sp.delete("page");
      router.push(`/products?${sp.toString()}`, { scroll: false });
    },
    [router, params],
  );

  const toggleArrayParam = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(params.toString());
      const existing = sp.getAll(key);
      if (existing.includes(value)) {
        sp.delete(key);
        existing
          .filter((v) => v !== value)
          .forEach((v) => sp.append(key, v));
      } else {
        sp.append(key, value);
      }
      sp.delete("page");
      router.push(`/products?${sp.toString()}`, { scroll: false });
    },
    [router, params],
  );

  const applyPriceRange = useCallback(
    (min?: number, max?: number) => {
      const sp = new URLSearchParams(params.toString());
      if (min !== undefined) sp.set("minPrice", String(min));
      else sp.delete("minPrice");
      if (max !== undefined) sp.set("maxPrice", String(max));
      else sp.delete("maxPrice");
      sp.delete("page");
      router.push(`/products?${sp.toString()}`, { scroll: false });
    },
    [router, params],
  );

  const clearAll = useCallback(() => {
    router.push("/products", { scroll: false });
    setMinPriceInput("");
    setMaxPriceInput("");
  }, [router]);

  const hasActiveFilters =
    params.has("categoryId") ||
    params.has("minPrice") ||
    params.has("maxPrice") ||
    params.has("size") ||
    params.has("color");

  const activeCategoryId = params.get("categoryId");
  const activeSizes = params.getAll("size");
  const activeColors = params.getAll("color");
  const activeMinPrice = params.get("minPrice");
  const activeMaxPrice = params.get("maxPrice");

  return (
    <aside className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-text-primary">
          Filters
        </h2>
        {hasActiveFilters && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-accent-primary hover:text-accent-secondary transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category */}
      <FilterSection title="Category">
        <ul className="space-y-1">
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                onClick={() =>
                  setParam(
                    "categoryId",
                    activeCategoryId === cat.id ? null : cat.id,
                  )
                }
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeCategoryId === cat.id
                    ? "bg-accent-primary/10 font-medium text-accent-primary"
                    : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span className="ml-2 text-xs text-text-muted">
                  {cat._count.products}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        {/* Presets */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {PRICE_PRESETS.map((preset) => {
            const isActive =
              ("min" in preset &&
                preset.min !== undefined &&
                activeMinPrice === String(preset.min)) ||
              ("max" in preset &&
                preset.max !== undefined &&
                activeMaxPrice === String(preset.max));
            return (
              <button
                key={preset.label}
                onClick={() =>
                  isActive
                    ? applyPriceRange(undefined, undefined)
                    : applyPriceRange(
                        "min" in preset ? preset.min : undefined,
                        "max" in preset ? preset.max : undefined,
                      )
                }
                className={`rounded-full border px-2.5 py-1 text-xs transition-colors ${
                  isActive
                    ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                    : "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom range */}
        <div className="flex items-center gap-2">
          <PriceInput
            placeholder="Min"
            value={minPriceInput}
            onChange={setMinPriceInput}
            onCommit={(v) =>
              applyPriceRange(
                v ? Math.round(parseFloat(v) * 100) : undefined,
                activeMaxPrice
                  ? parseInt(activeMaxPrice)
                  : undefined,
              )
            }
          />
          <span className="text-text-muted">–</span>
          <PriceInput
            placeholder="Max"
            value={maxPriceInput}
            onChange={setMaxPriceInput}
            onCommit={(v) =>
              applyPriceRange(
                activeMinPrice ? parseInt(activeMinPrice) : undefined,
                v ? Math.round(parseFloat(v) * 100) : undefined,
              )
            }
          />
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div className="flex flex-wrap gap-1.5">
          {SIZES.map((size) => (
            <button
              key={size}
              onClick={() => toggleArrayParam("size", size)}
              className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2.5 text-xs font-medium transition-colors ${
                activeSizes.includes(size)
                  ? "border-accent-primary bg-accent-primary/10 text-accent-primary"
                  : "border-border text-text-secondary hover:border-border-light hover:text-text-primary"
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Color */}
      <FilterSection title="Color">
        <div className="flex flex-wrap gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => toggleArrayParam("color", color.value)}
              title={color.label}
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition-all ${
                activeColors.includes(color.value)
                  ? "border-accent-primary scale-110"
                  : "border-transparent hover:border-border-light"
              }`}
            >
              <span
                className="h-5 w-5 rounded-full border border-border/30"
                style={{ backgroundColor: getColorHex(color.value) }}
              />
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-2 flex w-full items-center justify-center rounded-lg bg-accent-primary px-4 py-3 text-sm font-semibold text-background transition-colors hover:bg-accent-primary/90 lg:hidden"
        >
          Show Results
        </button>
      )}
    </aside>
  );
}

/* ── Sub-components ───────────────────────────────────────── */

function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div className="border-t border-border/40 pt-4">
      <h3
        id={id}
        className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-muted"
      >
        {title}
      </h3>
      <div role="group" aria-labelledby={id}>
        {children}
      </div>
    </div>
  );
}

function PriceInput({
  placeholder,
  value,
  onChange,
  onCommit,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  onCommit: (v: string) => void;
}) {
  return (
    <div className="relative flex-1">
      <span className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-text-muted">
        $
      </span>
      <input
        type="number"
        min="0"
        step="5"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => onCommit(value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onCommit(value);
        }}
        className="w-full rounded-lg border border-border bg-background py-2 pl-6 pr-2 text-sm text-text-primary placeholder-text-muted transition-colors focus:border-accent-primary focus:ring-1 focus:ring-accent-primary/20"
      />
    </div>
  );
}

function getColorHex(name: string): string {
  const map: Record<string, string> = {
    Black: "#1a1a1a",
    White: "#f5f5f5",
    Navy: "#1e3a5f",
    Red: "#dc2626",
    Blue: "#2563eb",
    Green: "#16a34a",
    Grey: "#6b7280",
    Brown: "#92400e",
    Beige: "#d4c5a9",
  };
  return map[name] ?? "#6b7280";
}
