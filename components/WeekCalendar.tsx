import { DragEvent, MouseEvent, useEffect, useRef, useState } from "react";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { AllDayChip, CalendarEventBlock, HOUR_HEIGHT } from "./CalendarEventBlock";
import { LatestComment } from "./CalendarTypes";
import { layoutOverlaps } from "@/lib/layout";
import { addDays, dayAndMinutesToTimestamp, formatDayHeader, formatHourLabel, isSameDay, minutesSinceMidnight, snap } from "@/lib/format";

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const GUTTER_WIDTH = 56;

export function WeekCalendar({
  weekStart,
  tasks,
  userNames,
  latestComments,
  onSelect,
  onReschedule,
  onCreateAtSlot,
}: {
  weekStart: Date;
  tasks: Doc<"tasks">[];
  userNames: Map<Id<"users">, string>;
  latestComments: Record<string, LatestComment>;
  onSelect: (task: Doc<"tasks">) => void;
  onReschedule: (taskId: Id<"tasks">, newStartTime: number) => void;
  onCreateAtSlot: (day: Date, minutes: number) => void;
}) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const scrollRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 7 * HOUR_HEIGHT });
  }, [weekStart]);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex h-full flex-col">
      {/* Day headers, aligned with the columns below */}
      <div className="flex border-b border-line pl-14">
        {days.map((day) => {
          const { weekday, dayNum } = formatDayHeader(day);
          const today = isSameDay(day, now);
          return (
            <div key={day.toISOString()} className="flex flex-1 flex-col items-center gap-1 py-2">
              <span className="text-[11px] uppercase tracking-wider text-muted">{weekday}</span>
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                  today ? "bg-charcoal font-medium text-on-charcoal" : "text-ink"
                }`}
              >
                {dayNum}
              </span>
            </div>
          );
        })}
      </div>

      {/* All-day row */}
      <div className="flex border-b border-line">
        <div className="w-14 shrink-0" />
        {days.map((day) => {
          const allDayTasks = tasks.filter((t) => t.allDay && isSameDay(new Date(t.startTime), day));
          return (
            <div key={day.toISOString()} className="flex-1 space-y-1 border-l border-line px-1 py-1.5">
              {allDayTasks.map((task) => (
                <AllDayChip key={task._id} task={task} onSelect={() => onSelect(task)} />
              ))}
            </div>
          );
        })}
      </div>

      <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
        <div className="relative flex" style={{ height: 24 * HOUR_HEIGHT }}>
          {/* Time gutter */}
          <div className="sticky left-0 z-10 shrink-0 bg-page" style={{ width: GUTTER_WIDTH }}>
            {HOURS.map((h) => (
              <div key={h} style={{ height: HOUR_HEIGHT }} className="relative">
                {h > 0 && (
                  <span className="absolute -top-2 right-2 font-mono text-[10px] text-muted">{formatHourLabel(h)}</span>
                )}
              </div>
            ))}
          </div>

          {days.map((day) => (
            <DayColumn
              key={day.toISOString()}
              day={day}
              isToday={isSameDay(day, now)}
              now={now}
              tasks={tasks.filter((t) => !t.allDay && isSameDay(new Date(t.startTime), day))}
              userNames={userNames}
              latestComments={latestComments}
              onSelect={onSelect}
              onReschedule={onReschedule}
              onCreateAtSlot={onCreateAtSlot}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  day,
  isToday,
  now,
  tasks,
  userNames,
  latestComments,
  onSelect,
  onReschedule,
  onCreateAtSlot,
}: {
  day: Date;
  isToday: boolean;
  now: Date;
  tasks: Doc<"tasks">[];
  userNames: Map<Id<"users">, string>;
  latestComments: Record<string, LatestComment>;
  onSelect: (task: Doc<"tasks">) => void;
  onReschedule: (taskId: Id<"tasks">, newStartTime: number) => void;
  onCreateAtSlot: (day: Date, minutes: number) => void;
}) {
  const [dragOver, setDragOver] = useState(false);
  const layout = layoutOverlaps(tasks);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const raw = e.dataTransfer.getData("text/plain");
    if (!raw) return;
    try {
      const { taskId, grabOffsetMinutes } = JSON.parse(raw) as { taskId: Id<"tasks">; grabOffsetMinutes: number };
      const rect = e.currentTarget.getBoundingClientRect();
      const dropY = e.clientY - rect.top;
      const minutes = snap((dropY / HOUR_HEIGHT) * 60 - grabOffsetMinutes);
      onReschedule(taskId, dayAndMinutesToTimestamp(day, minutes));
    } catch {
      // ignore malformed drag payloads
    }
  }

  function handleClick(e: MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const minutes = snap((clickY / HOUR_HEIGHT) * 60, 30);
    onCreateAtSlot(day, minutes);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={handleClick}
      className={`relative flex-1 cursor-pointer border-l border-line transition-colors ${dragOver ? "bg-surface-muted" : ""}`}
    >
      {HOURS.map((h) => (
        <div key={h} style={{ height: HOUR_HEIGHT }} className="border-b border-line" />
      ))}

      {isToday && (
        <div
          className="pointer-events-none absolute left-0 right-0 z-10 flex items-center"
          style={{ top: (minutesSinceMidnight(now) / 60) * HOUR_HEIGHT }}
        >
          <span className="-ml-1 h-2 w-2 rounded-full bg-charcoal" />
          <span className="h-px flex-1 bg-charcoal" />
        </div>
      )}

      {tasks.map((task) => (
        <CalendarEventBlock
          key={task._id}
          task={task}
          assigneeName={task.assignedTo ? userNames.get(task.assignedTo) ?? null : null}
          latestComment={latestComments[task._id]}
          lane={layout[task._id]?.lane ?? 0}
          lanes={layout[task._id]?.lanes ?? 1}
          onSelect={() => onSelect(task)}
        />
      ))}
    </div>
  );
}
