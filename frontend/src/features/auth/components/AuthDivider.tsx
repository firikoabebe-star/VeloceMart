export default function AuthDivider({ label = "or" }: { label?: string }) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-surface px-2 text-xs font-medium uppercase tracking-wide text-text-muted">
          {label}
        </span>
      </div>
    </div>
  );
}
