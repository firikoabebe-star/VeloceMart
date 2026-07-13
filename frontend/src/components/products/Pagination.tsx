"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

interface Props {
  totalPages: number;
}

export default function Pagination({ totalPages }: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const currentPage = Math.max(1, parseInt(params.get("page") ?? "1", 10));

  const goTo = useCallback(
    (page: number) => {
      const sp = new URLSearchParams(params.toString());
      if (page <= 1) {
        sp.delete("page");
      } else {
        sp.set("page", String(page));
      }
      router.push(`/products?${sp.toString()}`, { scroll: false });
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router, params],
  );

  const pages = useMemo(() => {
    const result: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) result.push(i);
    } else {
      result.push(1);
      if (currentPage > 3) result.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) result.push(i);
      if (currentPage < totalPages - 2) result.push("...");
      result.push(totalPages);
    }
    return result;
  }, [currentPage, totalPages]);

  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-center gap-1"
    >
      {/* Previous */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm text-text-secondary transition-colors hover:border-border-light hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="hidden sm:inline">Prev</span>
      </button>

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex h-9 w-9 items-center justify-center text-sm text-text-muted"
          >
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => goTo(p)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              p === currentPage
                ? "bg-accent-primary text-background"
                : "border border-border text-text-secondary hover:border-border-light hover:text-text-primary"
            }`}
          >
            {p}
          </button>
        ),
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm text-text-secondary transition-colors hover:border-border-light hover:text-text-primary disabled:pointer-events-none disabled:opacity-40"
      >
        <span className="hidden sm:inline">Next</span>
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </nav>
  );
}
