import { query } from "./_generated/server";
import { v } from "convex/values";
import { requireUser } from "./lib";

export const list = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    await requireUser(ctx, args.token);
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({ id: u._id, name: u.name, username: u.username }));
  },
});

/** What the current user is allowed to do — read live so it never goes stale in localStorage. */
export const me = query({
  args: { token: v.string() },
  handler: async (ctx, args) => {
    const user = await requireUser(ctx, args.token);
    return { canCreatePrivate: user.canCreatePrivate === true };
  },
});
