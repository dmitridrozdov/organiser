export function TagPill({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-line bg-page px-2 py-0.5 font-mono text-[11px] text-muted">
      {label}
    </span>
  );
}
