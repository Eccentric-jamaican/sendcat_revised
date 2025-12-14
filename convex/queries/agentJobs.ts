import { v } from "convex/values";
import { query } from "../_generated/server";

export const getJob = query({
  args: { jobId: v.id("agentJobs") },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("agentJobs"),
      _creationTime: v.number(),
      sessionId: v.string(),
      clerkUserId: v.optional(v.string()),
      threadId: v.optional(v.id("agentThreads")),
      status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed")),
      prompt: v.string(),
      intent: v.optional(v.any()),
      resultItemIds: v.optional(v.array(v.id("items"))),
      error: v.optional(v.string()),
      createdAt: v.number(),
      startedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const doc = await ctx.db.get(args.jobId);
    return doc ?? null;
  },
});

export const listJobsForSession = query({
  args: { sessionId: v.string(), limit: v.optional(v.number()) },
  returns: v.array(
    v.object({
      _id: v.id("agentJobs"),
      _creationTime: v.number(),
      sessionId: v.string(),
      clerkUserId: v.optional(v.string()),
      status: v.union(v.literal("queued"), v.literal("running"), v.literal("completed"), v.literal("failed")),
      prompt: v.string(),
      createdAt: v.number(),
      completedAt: v.optional(v.number()),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(50, Math.floor(args.limit ?? 20)));
    const rows = await ctx.db
      .query("agentJobs")
      .withIndex("by_sessionId_and_createdAt", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(limit);
    return rows.map((r) => ({
      _id: r._id,
      _creationTime: r._creationTime,
      sessionId: r.sessionId,
      clerkUserId: r.clerkUserId,
      status: r.status,
      prompt: r.prompt,
      createdAt: r.createdAt,
      completedAt: r.completedAt,
    }));
  },
});

export const listMessages = query({
  args: { jobId: v.id("agentJobs") },
  returns: v.array(
    v.object({
      _id: v.id("agentMessages"),
      _creationTime: v.number(),
      jobId: v.id("agentJobs"),
      threadId: v.optional(v.id("agentThreads")),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("agentMessages")
      .withIndex("by_jobId_and_createdAt", (q) => q.eq("jobId", args.jobId))
      .order("asc")
      .collect();
    return rows;
  },
});

export const listThreadMessages = query({
  args: { threadId: v.id("agentThreads") },
  returns: v.array(
    v.object({
      _id: v.id("agentMessages"),
      _creationTime: v.number(),
      jobId: v.id("agentJobs"),
      threadId: v.optional(v.id("agentThreads")),
      role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),
      content: v.string(),
      createdAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const rows = await ctx.db
      .query("agentMessages")
      .withIndex("by_threadId_and_createdAt", (q) => q.eq("threadId", args.threadId))
      .order("asc")
      .collect();
    return rows;
  },
});


