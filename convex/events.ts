import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const logEvent = mutation({
  args: {
    type: v.string(), // "impression" | "click" | ...
    itemId: v.id("items"),
    sessionId: v.optional(v.string()),
    metadata: v.optional(v.any()),
    now: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkUserId = identity?.subject ?? undefined;

    await ctx.db.insert("events", {
      type: args.type,
      itemId: args.itemId,
      sessionId: args.sessionId,
      clerkUserId,
      metadata: args.metadata,
      createdAt: args.now,
    });

    return null;
  },
});


