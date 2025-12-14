import { v } from "convex/values";
import { query } from "../_generated/server";

export const listThreadsForSession = query({
  args: { sessionId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("agentThreads"),
      _creationTime: v.number(),
      sessionId: v.string(),
      clerkUserId: v.optional(v.string()),
      title: v.optional(v.string()),
      createdAt: v.number(),
      lastMessageAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(50, Math.floor(args.limit ?? 20)));
    const rows = await ctx.db
      .query("agentThreads")
      .withIndex("by_sessionId_and_lastMessageAt", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);
    return rows;
  },
});


