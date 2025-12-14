import { v } from "convex/values";
import { internalQuery } from "../_generated/server";

export const getLatestForSession = internalQuery({
  args: { sessionId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      endpoint: v.string(),
      p256dh: v.string(),
      auth: v.string(),
    }),
  ),
  handler: async (ctx, args) => {
    const row = await ctx.db
      .query("pushSubscriptions")
      .withIndex("by_sessionId_and_lastSeenAt", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .first();
    if (!row) return null;
    return { endpoint: row.endpoint, p256dh: row.p256dh, auth: row.auth };
  },
});


