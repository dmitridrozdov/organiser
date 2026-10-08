"use client";

import { FormEvent, useState } from "react";
import { Doc } from "@/convex/_generated/dataModel";

type CommentWithAuthor = Doc<"comments"> & { author: Doc<"users"> | null };

export function CommentThread({
  comments,
  currentUserId,
  onAdd,
  onDelete,
}: {
  comments: CommentWithAuthor[];
  currentUserId: string;
  onAdd: (body: string) => Promise<void>;
  onDelete: (commentId: CommentWithAuthor["_id"]) => void;
}) {
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSubmitting(true);
    try {
      await onAdd(body.trim());
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted">Comments</p>

      <div className="mt-3 space-y-3">
        {comments.length === 0 && <p className="text-sm italic text-muted">Nothing here yet.</p>}
        {comments.map((c) => (
          <div key={c._id} className="group flex items-start justify-between gap-3 rounded-lg border border-line bg-page p-3">
            <div>
              <p className="text-sm text-ink">{c.body}</p>
              <p className="mt-1 font-mono text-[11px] text-muted">
                {c.author?.name ?? "Someone"} · {new Date(c.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </p>
            </div>
            {c.authorId === currentUserId && (
              <button
                onClick={() => onDelete(c._id)}
                className="shrink-0 text-xs text-muted opacity-0 transition-opacity hover:text-priority-high group-hover:opacity-100"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-5 flex gap-2">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Add a comment"
          className="min-w-0 flex-1 rounded-lg border border-line bg-page px-3 py-2 text-sm text-ink outline-none focus-visible:border-charcoal"
        />
        <button
          type="submit"
          disabled={submitting}
          className="rounded-lg border border-line px-3 py-2 text-sm text-ink transition-colors hover:border-charcoal disabled:opacity-60"
        >
          Post
        </button>
      </form>
    </div>
  );
}
