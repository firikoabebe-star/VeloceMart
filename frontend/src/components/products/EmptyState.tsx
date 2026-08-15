export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20 text-center">
      <svg
        className="mb-4 h-12 w-12 text-text-muted/50"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
        />
      </svg>
      <h3 className="text-lg font-semibold text-text-primary">
        No products found
      </h3>
      <p className="mt-1 max-w-sm text-sm text-text-secondary">
        Try adjusting your filters or search terms to find what you&apos;re
        looking for.
      </p>
    </div>
  );
}