/* ── Skeleton ─────────────────────────────────────────────── */

export function Skeleton({
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`animate-pulse rounded-md bg-surface-tertiary ${className}`}
      {...props}
    />
  );
}

/* ── Preset shapes ────────────────────────────────────────── */

export function TextSkeleton({ lines = 1 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={`h-4 ${i === lines - 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border/20 bg-surface">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="mt-3 h-4 w-1/4" />
      </div>
    </div>
  );
}

export function CategoryCardSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border/20 bg-surface p-5">
      <Skeleton className="h-12 w-12 shrink-0 rounded-lg" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8 lg:py-36">
        <div className="max-w-2xl space-y-6">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <div className="flex gap-4 pt-2">
            <Skeleton className="h-12 w-36 rounded-lg" />
            <Skeleton className="h-12 w-40 rounded-lg" />
          </div>
        </div>
      </div>
    </section>
  );
}
