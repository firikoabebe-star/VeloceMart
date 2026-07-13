"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useRef, useState, useEffect } from "react";

const SORT_OPTIONS = [
  { label: "Newest", value: "createdAt:desc" },
  { label: "Oldest", value: "createdAt:asc" },
  { label: "Name A–Z", value: "name:asc" },
  { label: "Name Z–A", value: "name:desc" },
  { label: "Category", value: "category:asc" },
] as const;

export default function SortDropdown() {
  const router = useRouter();
  const params = useSearchParams();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const sortBy = params.get("sortBy") ?? "createdAt";
  const sortOrder = params.get("sortOrder") ?? "desc";
  const currentValue = `${sortBy}:${sortOrder}`;
  const currentLabel =
    SORT_OPTIONS.find((o) => o.value === currentValue)?.label ?? "Newest";

  const setSort = useCallback(
    (value: string) => {
      const [by, order] = value.split(":");
      const sp = new URLSearchParams(params.toString());
      sp.set("sortBy", by);
      sp.set("sortOrder", order);
      sp.delete("page");
      router.push(`/products?${sp.toString()}`, { scroll: false });
      setOpen(false);
    },
    [router, params],
  );

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border-light hover:text-text-primary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 7h6M3 12h10M3 17h14"
          />
        </svg>
        <span className="hidden sm:inline">Sort:</span>
        <span className="font-medium text-text-primary">{currentLabel}</span>
        <svg
          className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-surface shadow-elevation-3">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setSort(option.value)}
              className={`flex w-full items-center px-4 py-2.5 text-left text-sm transition-colors ${
                currentValue === option.value
                  ? "bg-accent-primary/10 font-medium text-accent-primary"
                  : "text-text-secondary hover:bg-surface-tertiary hover:text-text-primary"
              }`}
            >
              {option.label}
              {currentValue === option.value && (
                <svg
                  className="ml-auto h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
