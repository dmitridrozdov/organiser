"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc, Id } from "@/convex/_generated/dataModel";
import { TaskColor } from "@/lib/colors";
import { CommentThread } from "./CommentThread";
import { ColorSwatchPicker } from "./ColorSwatchPicker";
import { LockIcon } from "./LockIcon";
import {
  dateAndTimeInputToTimestamp,
  timestampToDateInput,
  timestampToTimeInput,
} from "@/lib/format";

const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-page px-2 py-1.5 text-sm text-ink outline-none focus-visible:border-charcoal";

const DURATIONS = [15, 30, 45, 60, 90, 120, 180, 240, 300, 360, 420];

export function TaskDetailPanel({
  task,
  token,
  currentUserId,
  users,
  canCreatePrivate,
  onClose,
  onDelete,
}: {
  task: Doc<"tasks">;
  token: string;
  currentUserId: string;
  users: { id: Id<"users">; name: string }[];
  canCreatePrivate: boolean;
  onClose: () => void;
  onDelete: () => void;
}) {
  const comments = useQuery(api.comments.listForTask, { token, taskId: task._id });
  const update = useMutation(api.tasks.update);
  const addComment = useMutation(api.comments.add);
  const removeComment = useMutation(api.comments.remove);

  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [date, setDate] = useState(timestampToDateInput(task.startTime));
  const [time, setTime] = useState(timestampToTimeInput(task.startTime));

  function saveField(patch: Partial<Parameters<typeof update>[0]>) {
    void update({ token, taskId: task._id, ...patch });
  }

  function saveDateTime(nextDate: string, nextTime: string) {
    if (!nextDate || !nextTime) return;
    saveField({ startTime: dateAndTimeInputToTimestamp(nextDate, nextTime) });
  }

  function toggleAllDay(checked: boolean) {
    if (checked) {
      saveField({ allDay: true, startTime: dateAndTimeInputToTimestamp(date, "00:00"), durationMinutes: 1440 });
    } else {
      saveField({ allDay: false, startTime: dateAndTimeInputToTimestamp(date, time || "09:00"), durationMinutes: 60 });
    }
  }

  return (
    <div className="fixed inset-0 z-20" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-0 h-full w-full max-w-md overflow-y-auto border-l border-line bg-surface p-7 shadow-panel"
      >
        <div className="flex items-start justify-between">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => title.trim() && saveField({ title: title.trim() })}
            className="w-full bg-transparent font-serif text-2xl text-ink outline-none"
          />
          <button onClick={onClose} className="ml-3 shrink-0 text-muted hover:text-ink" aria-label="Close">
            ✕
          </button>
        </div>

        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={() => saveField({ description: description.trim() || undefined })}
          placeholder="Add a description"
          rows={3}
          className="mt-3 w-full resize-none bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />

        <div className="mt-5 space-y-4 border-y border-line py-5 text-sm">
          {canCreatePrivate && task.createdBy === currentUserId && (
            <label className="flex items-start gap-2 rounded-lg border border-dashed border-line-strong p-3 text-ink">
              <input
                type="checkbox"
                checked={task.isPrivate === true}
                onChange={(e) => saveField({ isPrivate: e.target.checked })}
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

          <label className="flex items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={task.allDay}
              onChange={(e) => toggleAllDay(e.target.checked)}
              className="h-4 w-4 rounded border-line accent-charcoal"
            />
            All day
          </label>

          <div className={`grid gap-4 ${task.allDay ? "grid-cols-1" : "grid-cols-3"}`}>
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  if (task.allDay) {
                    saveField({ startTime: dateAndTimeInputToTimestamp(e.target.value, "00:00") });
                  } else {
                    saveDateTime(e.target.value, time);
                  }
                }}
                className={fieldClass}
              />
            </div>
            {!task.allDay && (
              <>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Time</label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => {
                      setTime(e.target.value);
                      saveDateTime(date, e.target.value);
                    }}
                    className={fieldClass}
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-wider text-muted">Duration</label>
                  <select
                    value={task.durationMinutes}
                    onChange={(e) => saveField({ durationMinutes: Number(e.target.value) })}
                    className={fieldClass}
                  >
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
            <ColorSwatchPicker value={task.color as TaskColor} onChange={(color) => saveField({ color })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Status</label>
              <select
                value={task.status}
                onChange={(e) => saveField({ status: e.target.value as Doc<"tasks">["status"] })}
                className={fieldClass}
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Priority</label>
              <select
                value={task.priority}
                onChange={(e) => saveField({ priority: e.target.value as Doc<"tasks">["priority"] })}
                className={fieldClass}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Assigned to</label>
              <select
                value={task.assignedTo ?? ""}
                onChange={(e) => saveField({ assignedTo: (e.target.value || null) as Id<"users"> | null })}
                disabled={task.isPrivate === true}
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

            <div>
              <label className="text-xs uppercase tracking-wider text-muted">Tags</label>
              <input
                defaultValue={task.tags.join(", ")}
                onBlur={(e) =>
                  saveField({
                    tags: e.target.value.split(",").map((t) => t.trim()).filter(Boolean),
                  })
                }
                placeholder="billing, urgent"
                className={fieldClass}
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <CommentThread
            comments={comments ?? []}
            currentUserId={currentUserId}
            onAdd={(body) => addComment({ token, taskId: task._id, body })}
            onDelete={(commentId) => removeComment({ token, commentId })}
          />
        </div>

        <button
          onClick={onDelete}
          className="mt-8 text-xs text-muted underline decoration-line underline-offset-2 hover:text-priority-high"
        >
          Delete task
        </button>
      </div>
    </div>
  );
}
