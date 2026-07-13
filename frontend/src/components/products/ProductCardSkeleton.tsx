export default function ProductCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-surface">
      {/* Image placeholder */}
      <div className="aspect-[4/3] animate-pulse bg-surface-tertiary" />

      {/* Content */}
      <div className="flex flex-1 flex-col gap-2.5 p-4">
        <div className="h-2.5 w-16 animate-pulse rounded bg-surface-tertiary" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-surface-tertiary" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-surface-tertiary" />
        <div className="mt-auto flex items-center gap-2 pt-2">
          <div className="h-3 w-14 animate-pulse rounded bg-surface-tertiary" />
          <div className="h-3 w-3 animate-pulse rounded-full bg-surface-tertiary" />
          <div className="h-3 w-12 animate-pulse rounded bg-surface-tertiary" />
        </div>
      </div>
    </div>
  );
}
