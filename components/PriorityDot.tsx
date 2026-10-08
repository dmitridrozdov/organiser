type Priority = "low" | "medium" | "high";

const LABEL: Record<Priority, string> = {
  high: "High",
  medium: "Medium",
  low: "Low",
};

const DOT: Record<Priority, string> = {
  high: "bg-priority-high",
  medium: "bg-priority-medium",
  low: "bg-priority-low",
};

const BADGE: Record<Priority, string> = {
  high: "bg-priority-high/15 text-priority-high border-priority-high/30",
  medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/30",
  low: "bg-priority-low/15 text-priority-low border-priority-low/30",
};

export function PriorityDot({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-block h-2 w-2 shrink-0 rounded-full ${DOT[priority]}`}
      title={`${LABEL[priority]} priority`}
      aria-label={`${LABEL[priority]} priority`}
    />
  );
}

export function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`rounded-md border px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider ${BADGE[priority]}`}>
      {LABEL[priority]}
    </span>
  );
}

export function Avatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-gradient font-mono text-[10px] font-medium text-[#1F2023]"
      title={name}
    >
      {initials}
    </span>
  );
}
