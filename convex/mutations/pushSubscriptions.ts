import { v } from "convex/values";
import { internalMutation, mutation } from "../_generated/server";

export const upsertPushSubscription = mutation({
  args: {
    sessionId: v.string(),
    subscription: v.object({
      endpoint: v.string(),
      keys: v.object({
        p256dh: v.string(),
        auth: v.string(),
      }),
    }),
    userAgent: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const identity = await ctx.auth.getUserIdentity();
    const clerkUserId = identity?.subject ?? undefined;

    const { endpoint, keys } = args.subscription;

    const existing = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", endpoint))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        sessionId: args.sessionId,
        clerkUserId,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: args.userAgent,
        lastSeenAt: now,
      });
      return null;
    }

    await ctx.db.insert("pushSubscriptions", {
      sessionId: args.sessionId,
      clerkUserId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userAgent: args.userAgent,
      createdAt: now,
      lastSeenAt: now,
    });

    return null;
  },
});

/**
 * Internal mutation to delete a stale push subscription by endpoint.
 * Called from actions when web-push returns 410/404 (subscription expired).
 */
export const deleteByEndpoint = internalMutation({
  args: { endpoint: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_endpoint", (q) => q.eq("endpoint", args.endpoint))
      .unique();
    if (row) {
      await ctx.db.delete(row._id);
    }
    return null;
  },
});
