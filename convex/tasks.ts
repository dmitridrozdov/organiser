import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { canSeeTask, requireUser } from "./lib";

const statusValidator = v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done"));
const priorityValidator = v.union(v.literal("low"), v.literal("medium"), v.literal("high"));
const colorValidator = v.union(
  v.literal("violet"),
  v.literal("cyan"),
  v.literal("coral"),
  v.literal("amber"),
  v.literal("green"),
  v.literal("blue"),
  v.literal("pink"),
  v.literal("slate")
);

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.filter((t) => canSeeTask(t, user)).sort((a, b) => a.startTime - b.startTime);
  },
});

export const get = query({
  args: { token: v.string(), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const task = await ctx.db.get(args.taskId);
    return task && canSeeTask(task, user) ? task : null;
  },
});

export const create = mutation({
  args: {
    token: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    priority: priorityValidator,
    color: colorValidator,
    startTime: v.number(),
    durationMinutes: v.number(),
    allDay: v.boolean(),
    isPrivate: v.optional(v.boolean()),
    tags: v.array(v.string()),
    assignedTo: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    if (args.isPrivate && !user.canCreatePrivate) {
      throw new Error("You don't have permission to create private tasks.");
    }
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title.trim(),
      description: args.description?.trim() || undefined,
      status: "todo",
      priority: args.priority,
      color: args.color,
      startTime: args.startTime,
      durationMinutes: args.durationMinutes,
      allDay: args.allDay,
      isPrivate: args.isPrivate ? true : undefined,
      tags: args.tags.map((t) => t.trim()).filter(Boolean),
      createdBy: user._id,
      // A private task belongs to its creator alone, so it can't be assigned to someone else.
      assignedTo: args.isPrivate ? undefined : args.assignedTo,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    token: v.string(),
    taskId: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(statusValidator),
    priority: v.optional(priorityValidator),
    color: v.optional(colorValidator),
    startTime: v.optional(v.number()),
    durationMinutes: v.optional(v.number()),
    allDay: v.optional(v.boolean()),
    isPrivate: v.optional(v.boolean()),
    tags: v.optional(v.array(v.string())),
    assignedTo: v.optional(v.union(v.id("users"), v.null())),
  },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const task = await ctx.db.get(args.taskId);
    if (!task || !canSeeTask(task, user)) throw new Error("Task not found.");

    const { token, taskId, assignedTo, isPrivate, ...rest } = args;
    const patch: Record<string, unknown> = { ...rest, updatedAt: Date.now() };

    if (isPrivate !== undefined) {
      if (!user.canCreatePrivate || task.createdBy !== user._id) {
        throw new Error("You can't change the privacy of this task.");
      }
      patch.isPrivate = isPrivate ? true : undefined;
      if (isPrivate) patch.assignedTo = undefined;
    }

    const willBePrivate = isPrivate ?? task.isPrivate;
    if (assignedTo !== undefined && !willBePrivate) patch.assignedTo = assignedTo ?? undefined;

    await ctx.db.patch(taskId, patch);
  },
});

export const remove = mutation({
  args: { token: v.string(), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    const task = await ctx.db.get(args.taskId);
    if (!task || !canSeeTask(task, user)) throw new Error("Task not found.");

    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("taskId", args.taskId))
      .collect();
    await Promise.all(comments.map((c) => ctx.db.delete(c._id)));
    await ctx.db.delete(args.taskId);
  },
});
