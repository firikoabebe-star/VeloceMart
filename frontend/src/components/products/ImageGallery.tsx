"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/api";

/* ── Placeholder gradients for additional gallery views ──── */
const placeholderGradients = [
  "from-accent-primary/20 via-accent-secondary/10 to-accent-tertiary/20",
  "from-accent-secondary/20 via-accent-tertiary/15 to-accent-primary/15",
  "from-accent-tertiary/15 via-accent-primary/20 to-accent-secondary/10",
  "from-accent-primary/15 via-accent-tertiary/10 to-accent-primary/20",
];

/* ── Gallery image type ──────────────────────────────────── */
interface GalleryImage {
  id: string;
  type: "image" | "gradient";
  src?: string;
  gradient?: string;
  label: string;
}

/* ── Build gallery array from product ────────────────────── */
function buildGallery(product: Product): GalleryImage[] {
  const items: GalleryImage[] = [];

  if (product.imageUrl) {
    items.push({
      id: "main",
      type: "image",
      src: product.imageUrl,
      label: product.name,
    });
  }

  // Add gradient placeholders as additional "views"
  const colors = [
    ...new Set(product.variants.map((v) => v.color).filter(Boolean)),
  ];
  const count = Math.max(0, 4 - items.length);

  for (let i = 0; i < count; i++) {
    const idx = items.length + i;
    items.push({
      id: `view-${idx}`,
      type: "gradient",
      gradient: placeholderGradients[idx % placeholderGradients.length],
      label: colors[i] ?? `View ${idx + 1}`,
    });
  }

  return items;
}

/* ── Zoom lens overlay ───────────────────────────────────── */
function ZoomLens({
  mouseX,
  mouseY,
  isActive,
}: {
  mouseX: number;
  mouseY: number;
  isActive: boolean;
}) {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{ opacity: isActive ? 1 : 0 }}
    >
      {/* Lens ring */}
      <div
        className="absolute h-28 w-28 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent-primary/60 shadow-[0_0_20px_rgba(255,165,134,0.15)]"
        style={{ left: mouseX, top: mouseY }}
      />
    </div>
  );
}

/* ── ImageGallery ────────────────────────────────────────── */
export default function ImageGallery({ product }: { product: Product }) {
  const gallery = buildGallery(product);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = gallery[activeIndex] ?? gallery[0];

  /* ── Mouse tracking for zoom ────────────────────────────── */
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setMousePos({ x, y });

      if (!isZoomed) {
        setIsZoomed(true);
      }
    },
    [isZoomed],
  );

  const handleMouseLeave = useCallback(() => {
    // Debounce zoom-out so it doesn't flicker when passing over gaps
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
    zoomTimeoutRef.current = setTimeout(() => {
      setIsZoomed(false);
    }, 80);
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (zoomTimeoutRef.current) clearTimeout(zoomTimeoutRef.current);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      {/* ── Main image area ────────────────────────────────── */}
      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onMouseEnter={handleMouseEnter}
        className="group relative aspect-square overflow-hidden rounded-xl border border-border bg-surface-tertiary"
      >
        {/* Image with AnimatePresence for smooth transitions */}
        <div className="relative h-full w-full overflow-hidden">
          <AnimatePresence mode="wait">
            {active.type === "image" && active.src ? (
              <motion.img
                key={active.id}
                src={active.src}
                alt={active.label}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{
                  opacity: 1,
                  scale: isZoomed ? 2.2 : 1,
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{
                  opacity: { duration: 0.3 },
                  scale: { duration: isZoomed ? 0.05 : 0.35, ease: [0.25, 0.1, 0.25, 1] },
                }}
                className="h-full w-full object-cover will-change-transform"
                draggable={false}
              />
            ) : (
              <motion.div
                key={active.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${active.gradient ?? placeholderGradients[0]}`}
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-16 w-16 text-accent-primary/40"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={1}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                    />
                  </svg>
                  <p className="mt-2 text-xs font-medium uppercase tracking-wider text-accent-primary/30">
                    {active.label}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Zoom lens indicator */}
        <ZoomLens mouseX={mousePos.x} mouseY={mousePos.y} isActive={isZoomed} />

        {/* Hint badge */}
        <div
          className={`pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-[11px] text-text-muted backdrop-blur-sm transition-all duration-300 ${
            isZoomed
              ? "translate-y-2 opacity-0"
              : "translate-y-0 opacity-100"
          }`}
        >
          Hover to zoom
        </div>

        {/* Image counter */}
        {gallery.length > 1 && (
          <div className="pointer-events-none absolute right-3 top-3 rounded-md bg-background/70 px-2.5 py-1 text-[11px] font-medium text-text-muted backdrop-blur-sm">
            {activeIndex + 1} / {gallery.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail strip ────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {gallery.map((img, i) => {
          const isActive = i === activeIndex;
          return (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              className={`group/thmb relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary ${
                isActive
                  ? "border-accent-primary shadow-glow-accent"
                  : "border-border/40 hover:border-border hover:shadow-elevation-1"
              }`}
              aria-label={`View ${img.label}`}
              aria-current={isActive ? "true" : undefined}
            >
              {img.type === "image" && img.src ? (
                <img
                  src={img.src}
                  alt={img.label}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover/thmb:scale-110"
                  draggable={false}
                />
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${img.gradient ?? placeholderGradients[0]}`}
                >
                  {/* Tiny color swatch indicator */}
                  {img.label.includes("#") || img.label.match(/^#[0-9a-f]{3,6}$/i) ? (
                    <span
                      className="block h-4 w-4 rounded-full ring-1 ring-white/20"
                      style={{ backgroundColor: img.label }}
                    />
                  ) : (
                    <span className="text-[8px] font-bold uppercase tracking-wider text-accent-primary/40">
                      {i + 1}
                    </span>
                  )}
                </div>
              )}

              {/* Active indicator bar */}
              <span
                className={`absolute inset-x-0 bottom-0 h-0.5 bg-accent-primary transition-transform duration-200 ${
                  isActive ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* ── Color swatch chips (from variants) ─────────────── */}
      {product.variants.some((v) => v.color) && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
            Colors
          </span>
          <div className="flex gap-1.5">
            {[
              ...new Set(
                product.variants.map((v) => v.color).filter(Boolean) as string[],
              ),
            ].map((color) => (
              <span
                key={color}
                className="flex h-5 w-5 items-center justify-center rounded-full ring-1 ring-border/30 transition-transform duration-200 hover:scale-125"
                style={{ backgroundColor: color.toLowerCase() }}
                title={color}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
