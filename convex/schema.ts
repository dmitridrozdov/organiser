import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // The two people who can use the organiser.
  users: defineTable({
    username: v.string(),
    name: v.string(),
    passwordHash: v.string(),
    // Only users with this flag can create/see "private" tasks.
    canCreatePrivate: v.optional(v.boolean()),
  }).index("by_username", ["username"]),

  // Active login sessions, created by convex/auth.ts:login.
  sessions: defineTable({
    token: v.string(),
    userId: v.id("users"),
    createdAt: v.number(),
  }).index("by_token", ["token"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    color: v.union(
      v.literal("violet"),
      v.literal("cyan"),
      v.literal("coral"),
      v.literal("amber"),
      v.literal("green"),
      v.literal("blue"),
      v.literal("pink"),
      v.literal("slate")
    ),
    startTime: v.number(), // ms since epoch — midnight of the day for all-day tasks
    durationMinutes: v.number(), // ignored (but still stored) when allDay is true
    allDay: v.boolean(),
    // Private tasks are only visible to (and editable by) their creator.
    isPrivate: v.optional(v.boolean()),
    tags: v.array(v.string()),
    createdBy: v.id("users"),
    assignedTo: v.optional(v.id("users")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_status", ["status"])
    .index("by_startTime", ["startTime"]),

  comments: defineTable({
    taskId: v.id("tasks"),
    authorId: v.id("users"),
    body: v.string(),
    createdAt: v.number(),
  }).index("by_task", ["taskId"]),
});
