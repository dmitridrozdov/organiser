import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword } from "./lib";

/**
 * Run once from your terminal to create the two accounts:
 *
 *   npx convex run seed:setupAccounts '{
 *     "wifeName": "Ada", "wifeUsername": "ada", "wifePassword": "choose-a-password",
 *     "bossName": "Sam", "bossUsername": "sam", "bossPassword": "choose-a-password"
 *   }'
 *
 * Safe to run only once — it refuses if any accounts already exist.
 */
export const setupAccounts = internalMutation({
  args: {
    wifeName: v.string(),
    wifeUsername: v.string(),
    wifePassword: v.string(),
    bossName: v.string(),
    bossUsername: v.string(),
    bossPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").first();
    if (existing) {
      throw new Error("Accounts already exist — refusing to overwrite them.");
    }

    for (const person of [
      { name: args.wifeName, username: args.wifeUsername, password: args.wifePassword },
      { name: args.bossName, username: args.bossUsername, password: args.bossPassword },
    ]) {
      await ctx.db.insert("users", {
        name: person.name,
        username: person.username.trim().toLowerCase(),
        passwordHash: await hashPassword(person.password),
      });
    }

    return "Accounts created.";
  },
});

/**
 * Gives one person the ability to create private tasks (only visible to them):
 *
 *   npx convex run seed:grantPrivate '{"username": "natasha"}'
 */
export const grantPrivate = internalMutation({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_username", (q) => q.eq("username", args.username.trim().toLowerCase()))
      .unique();
    if (!user) throw new Error(`No user named "${args.username}".`);
    await ctx.db.patch(user._id, { canCreatePrivate: true });
    return `${user.name} can now create private tasks.`;
  },
});
