"use client";

import { FormEvent, useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { TaskColor } from "@/lib/colors";
import { dateAndTimeInputToTimestamp, timestampToDateInput, timestampToTimeInput } from "@/lib/format";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import { LockIcon } from "./LockIcon";

const fieldClass =
  "mt-1.5 w-full rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none focus-visible:border-charcoal";

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420];

export function NewTaskDialog({
  users,
  canCreatePrivate,
  initialStart,
  onClose,
  onCreate,
}: {
  users: { id: Id<"users">; name: string }[];
  canCreatePrivate: boolean;
  initialStart?: Date;
  onClose: () => void;
  onCreate: (input: {
    title: string;
    description?: string;
    priority: "low" | "medium" | "high";
    color: TaskColor;
    startTime: number;
    durationMinutes: number;
    allDay: boolean;
    isPrivate: boolean;
    tags: string[];
    assignedTo?: Id<"users">;
  }) => Promise<void>;
}) {
  const base = initialStart ?? new Date();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
  const [color, setColor] = useState<TaskColor>("violet");
  const [allDay, setAllDay] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [date, setDate] = useState(timestampToDateInput(base.getTime()));
  const [time, setTime] = useState(timestampToTimeInput(base.getTime()));
  const [duration, setDuration] = useState(60);
  const [tags, setTags] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        color,
        startTime: allDay ? dateAndTimeInputToTimestamp(date, "00:00") : dateAndTimeInputToTimestamp(date, time),
        durationMinutes: allDay ? 1440 : duration,
        allDay,
        isPrivate,
        tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
        assignedTo: !isPrivate && assignedTo ? (assignedTo as Id<"users">) : undefined,
      });
      onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-20 flex items-start justify-center bg-black/40 px-6 pt-20" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl border border-line bg-surface p-6 shadow-panel">
        <p className="font-serif text-2xl text-ink">New task</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-muted">Title</label>
            <input autoFocus value={title} onChange={(e) => setTitle(e.target.value)} required className={fieldClass} />
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={`${fieldClass} resize-none`}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-charcoal"
            />
            All day
          </label>

          <div className={`grid gap-4 ${allDay ? "grid-cols-1" : "grid-cols-3"}`}>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={fieldClass} />
            </div>
            {!allDay && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Time</label>
                  <input type="time" value={time} onChange={(e) => setTime(e.target.value)} className={fieldClass} />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Duration</label>
                  <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className={fieldClass}>
                    {DURATIONS.map((d) => (
                      <option key={d} value={d}>
                        {d < 60 ? `${d} min` : `${d / 60} hr${d > 60 ? "s" : ""}`}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-muted">Color</label>
            <ColorSwatchPicker value={color} onChange={setColor} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className={fieldClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Assign to</label>
              <select
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                disabled={isPrivate}
                className={`${fieldClass} disabled:opacity-50`}
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {canCreatePrivate && (
            <label className="flex items-start gap-2 rounded-lg border border-dashed border-line-strong p-3 text-sm text-ink">
              <input
                type="checkbox"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-line accent-charcoal"
              />
              <span>
                <span className="flex items-center gap-1.5 font-medium">
                  <LockIcon size={12} /> Private
                </span>
                <span className="mt-0.5 block text-xs text-muted">Only you can see this task and its comments.</span>
              </span>
            </label>
          )}

          <div>
            <label className="text-xs uppercase tracking-wider text-muted">Tags</label>
            <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="billing, urgent" className={fieldClass} />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-2 text-sm text-muted hover:text-ink">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-charcoal px-4 py-2 text-sm font-medium text-on-charcoal transition-colors hover:bg-charcoal-hover disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
