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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.subject) {
      throw new Error("Unauthenticated");
    }
    const clerkUserId = identity.subject;

    const limit = Math.max(1, Math.min(50, Math.floor(args.limit ?? 20)));

    // Query by clerkUserId to ensure user can only access their own threads,
    // then filter by sessionId to match the requested session.
    const rows = await ctx.db
      .query("agentThreads")
      .withIndex("by_clerkUserId_and_lastMessageAt", (q) => q.eq("clerkUserId", clerkUserId))
      .order("desc")
      .filter((q) => q.eq(q.field("sessionId"), args.sessionId))
      .take(limit);

    return rows;
  },
});


