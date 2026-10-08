import { formatWeekRangeLabel } from "@/lib/format";

export function WeekNav({
  weekStart,
  onPrev,
  onNext,
  onToday,
}: {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <div className="flex items-center gap-4 pb-5">
      <p className="font-serif text-2xl text-ink">{formatWeekRangeLabel(weekStart)}</p>
      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrev}
          aria-label="Previous week"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-charcoal hover:text-ink"
        >
          ‹
        </button>
        <button
          onClick={onToday}
          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink transition-colors hover:border-charcoal"
        >
          Today
        </button>
        <button
          onClick={onNext}
          aria-label="Next week"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-line text-muted transition-colors hover:border-charcoal hover:text-ink"
        >
          ›
        </button>
      </div>
    </div>
  );
}
