"use client";

import { useState, useEffect } from "react";
import type { Category } from "@/lib/api";
import FilterSidebar from "./FilterSidebar";

interface Props {
  categories: Category[];
}

export default function MobileFilterDrawer({ categories }: Props) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text-secondary transition-colors hover:border-border-light hover:text-text-primary lg:hidden"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
        </svg>
        Filters
      </button>

      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed inset-y-0 left-0 z-50 w-full max-w-sm overflow-y-auto border-r border-border bg-background p-5 shadow-elevation-3 lg:hidden">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-text-primary">
                Filters
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
                aria-label="Close filters"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <FilterSidebar categories={categories} onClose={() => setOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}
