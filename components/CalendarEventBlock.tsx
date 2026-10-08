import { DragEvent, MouseEvent } from "react";
import { Doc } from "@/convex/_generated/dataModel";
import { TASK_COLORS } from "@/lib/colors";
import { formatTimeRange } from "@/lib/format";
import { Avatar, PriorityDot } from "./PriorityDot";
import { LatestComment } from "./CalendarTypes";
import { LockIcon } from "./LockIcon";

const HOUR_HEIGHT = 56;

/** Private tasks get diagonal stripes + a dashed outline so they're recognisable at a glance. */
function privateStyle(palette: { bg: string; border: string }) {
  return {
    backgroundImage: `repeating-linear-gradient(135deg, transparent 0 7px, ${palette.border}26 7px 14px)`,
    outline: `1px dashed ${palette.border}`,
    outlineOffset: "-1px",
  } as const;
}

export function CalendarEventBlock({
  task,
  assigneeName,
  latestComment,
  lane,
  lanes,
  onSelect,
}: {
  task: Doc<"tasks">;
  assigneeName: string | null;
  latestComment: LatestComment | undefined;
  lane: number;
  lanes: number;
  onSelect: () => void;
}) {
  const palette = TASK_COLORS[task.color];
  const crowded = lanes > 1;
  const start = new Date(task.startTime);
  const top = ((start.getHours() * 60 + start.getMinutes()) / 60) * HOUR_HEIGHT;
  const height = Math.max((task.durationMinutes / 60) * HOUR_HEIGHT, 22);
  const roomy = height >= 60;
  const done = task.status === "done";

  function handleDragStart(e: DragEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const grabOffsetMinutes = ((e.clientY - rect.top) / HOUR_HEIGHT) * 60;
    e.dataTransfer.setData("text/plain", JSON.stringify({ taskId: task._id, grabOffsetMinutes }));
    e.dataTransfer.effectAllowed = "move";
  }

  function handleClick(e: MouseEvent) {
    e.stopPropagation();
    onSelect();
  }

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      style={{
        top,
        height,
        // Overlapping tasks share the column width side by side.
        left: `calc(${(lane / lanes) * 100}% + 2px)`,
        width: `calc(${100 / lanes}% - 4px)`,
        backgroundColor: palette.bg,
        borderLeftColor: palette.border,
        ...(task.isPrivate ? privateStyle(palette) : {}),
      }}
      className={`absolute cursor-pointer overflow-hidden rounded-md border-l-[3px] px-2 py-1 shadow-soft transition-transform hover:z-10 hover:-translate-y-px active:cursor-grabbing ${
        done ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center gap-1.5">
        {task.isPrivate && <LockIcon color={palette.text} />}
        <p
          className="truncate text-xs font-medium leading-tight"
          style={{ color: palette.text, textDecoration: done ? "line-through" : undefined }}
        >
          {task.title}
        </p>
        {roomy && !crowded && <PriorityDot priority={task.priority} />}
      </div>

      {roomy && (
        <p className="mt-0.5 truncate font-mono text-[10px]" style={{ color: palette.text, opacity: 0.75 }}>
          {formatTimeRange(task.startTime, task.durationMinutes)}
        </p>
      )}

      {height >= 90 && !crowded && assigneeName && (
        <div className="mt-1.5 flex items-center gap-1.5">
          <Avatar name={assigneeName} />
          <span className="truncate text-[11px]" style={{ color: palette.text, opacity: 0.85 }}>
            {assigneeName}
          </span>
        </div>
      )}

      {height >= 120 && !crowded && latestComment && (
        <p className="mt-1.5 line-clamp-2 text-[11px] italic" style={{ color: palette.text, opacity: 0.75 }}>
          &ldquo;{latestComment.body}&rdquo;
        </p>
      )}
    </div>
  );
}

export function AllDayChip({ task, onSelect }: { task: Doc<"tasks">; onSelect: () => void }) {
  const palette = TASK_COLORS[task.color];
  const done = task.status === "done";

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
      style={{
        backgroundColor: palette.bg,
        borderLeftColor: palette.border,
        color: palette.text,
        ...(task.isPrivate ? privateStyle(palette) : {}),
      }}
      className={`flex w-full items-center gap-1.5 truncate rounded-md border-l-[3px] px-2 py-1 text-left text-xs font-medium shadow-soft ${
        done ? "opacity-50 line-through" : ""
      }`}
    >
      {task.isPrivate && <LockIcon color={palette.text} />}
      <span className="truncate">{task.title}</span>
    </button>
  );
}

export { HOUR_HEIGHT };