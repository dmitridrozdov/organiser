import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./lib";

export const login = mutation({
  args: { username: v.string(), password: v.string() },
  handler: async (ctx, args) => {
    const username = args.username.trim().toLowerCase();
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", username))
      .unique();

    const passwordHash = await hashPassword(args.password);
    if (!user || user.passwordHash !== passwordHash) {
      throw new Error("That username or password isn't right.");
    }

    const token = crypto.randomUUID();
    await ctx.db.insert("sessions", {
      token,
      userId: user._id,
      createdAt: Date.now(),
    });

    return {
      token,
      user: { id: user._id, name: user.name, username: user.username },
    };
  },
});

export const logout = mutation({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .unique();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});
