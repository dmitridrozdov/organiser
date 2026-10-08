import { QueryCtx, MutationCtx } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

/**
 * Every protected query/mutation takes a `token` argument (the session
 * token issued at login) and calls this first. Throwing here is what
 * keeps tasks and comments private to the two logged-in accounts.
 */
export async function requireUser(ctx: QueryCtx | MutationCtx, token: string) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .unique();

  if (!session) {
    throw new Error("Your session has expired. Please log in again.");
  }

  const user = await ctx.db.get(session.userId);
  if (!user) {
    throw new Error("Your session has expired. Please log in again.");
  }

  return user;
}

export async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Private tasks are visible only to the person who created them. */
export function canSeeTask(task: Doc<"tasks">, user: Doc<"users">): boolean {
  return !task.isPrivate || task.createdBy === user._id;
}
