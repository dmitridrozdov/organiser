import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { canSeeTask, requireUser } from "./lib";

export const listForTask = query({
  args: { token: v.string(), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const task = await ctx.db.get(args.taskId);
    if (!task || !canSeeTask(task, user)) return [];

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();

    return await Promise.all(
      comments
        .sort((a, b) => a.createdAt - b.createdAt)
        .map(async (c) => ({ ...c, author: await ctx.db.get(c.authorId) }))
    );
  },
});

/**
 * One-shot lookup used by the calendar blocks: the latest comment (and total
 * count) for every task the current user can see, keyed by task id.
 */
export const latestForAllTasks = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);

    const tasks = await ctx.db.query("tasks").collect();
    const visibleTaskIds = new Set<string>(tasks.filter((t) => canSeeTask(t, user)).map((t) => t._id));

    const comments = (await ctx.db.query("comments").collect()).filter((c) => visibleTaskIds.has(c.taskId));

    const latestByTask = new Map<string, (typeof comments)[number]>();
    const countByTask = new Map<string, number>();
    for (const c of comments) {
      countByTask.set(c.taskId, (countByTask.get(c.taskId) ?? 0) + 1);
      const existing = latestByTask.get(c.taskId);
      if (!existing || c.createdAt > existing.createdAt) {
        latestByTask.set(c.taskId, c);
      }
    }

    const authorCache = new Map<string, string>();
    async function authorName(authorId: (typeof comments)[number]["authorId"]) {
      const cached = authorCache.get(authorId);
      if (cached) return cached;
      const author = await ctx.db.get(authorId);
      const name = author?.name ?? "Someone";
      authorCache.set(authorId, name);
      return name;
    }

    const result: Record<string, { body: string; authorName: string; createdAt: number; count: number }> = {};
    for (const [taskId, comment] of latestByTask) {
      result[taskId] = {
        body: comment.body,
        authorName: await authorName(comment.authorId),
        createdAt: comment.createdAt,
        count: countByTask.get(taskId) ?? 0,
      };
    }
    return result;
  },
});

export const add = mutation({
  args: { token: v.string(), taskId: v.id("tasks"), body: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const task = await ctx.db.get(args.taskId);
    if (!task || !canSeeTask(task, user)) throw new Error("Task not found.");

    const body = args.body.trim();
    if (!body) return;
    await ctx.db.insert("comments", {
      taskId: args.taskId,
      authorId: user._id,
      body,
      createdAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { token: v.string(), commentId: v.id("comments") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const comment = await ctx.db.get(args.commentId);
    if (!comment) return;
    const task = await ctx.db.get(comment.taskId);
    if (!task || !canSeeTask(task, user)) throw new Error("Task not found.");
    await ctx.db.delete(args.commentId);
  },
});
