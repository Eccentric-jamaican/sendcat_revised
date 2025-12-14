import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";

export const createAgentJob = mutation({
  args: {
    prompt: v.string(),
    sessionId: v.string(),
    threadId: v.optional(v.id("agentThreads")),
  },
  returns: v.object({ jobId: v.id("agentJobs"), threadId: v.id("agentThreads") }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const identity = await ctx.auth.getUserIdentity();
    const clerkUserId = identity?.subject ?? undefined;

    const threadId =
      args.threadId ??
      (await ctx.db.insert("agentThreads", {
        sessionId: args.sessionId,
        clerkUserId,
        createdAt: now,
        lastMessageAt: now,
      }));

    const jobId = await ctx.db.insert("agentJobs", {
      sessionId: args.sessionId,
      clerkUserId,
      threadId,
      status: "queued",
      prompt: args.prompt,
      createdAt: now,
    });

    await ctx.db.insert("agentMessages", {
      jobId,
      threadId,
      role: "user",
      content: args.prompt,
      createdAt: now,
    });

    await ctx.db.patch(threadId, { lastMessageAt: now });

    // Kick off background execution immediately.
    await ctx.scheduler.runAfter(0, internal.actions.agentRunner.runAgentJob, { jobId });

    return { jobId, threadId };
  },
});

export const setJobRunning = internalMutation({
  args: { jobId: v.id("agentJobs"), startedAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: "running", startedAt: args.startedAt });
    return null;
  },
});

export const setJobCompleted = internalMutation({
  args: {
    jobId: v.id("agentJobs"),
    completedAt: v.number(),
    intent: v.optional(v.any()),
    resultItemIds: v.optional(v.array(v.id("items"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, {
      status: "completed",
      completedAt: args.completedAt,
      intent: args.intent,
      resultItemIds: args.resultItemIds,
    });
    return null;
  },
});

export const setJobFailed = internalMutation({
  args: { jobId: v.id("agentJobs"), completedAt: v.number(), error: v.string() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.jobId, { status: "failed", completedAt: args.completedAt, error: args.error });
    return null;
  },
});

export const appendAssistantMessage = internalMutation({
  args: { jobId: v.id("agentJobs"), threadId: v.id("agentThreads"), content: v.string(), createdAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("agentMessages", {
      jobId: args.jobId,
      threadId: args.threadId,
      role: "assistant",
      content: args.content,
      createdAt: args.createdAt,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: args.createdAt });
    return null;
  },
});

export const appendSystemMessage = internalMutation({
  args: { jobId: v.id("agentJobs"), threadId: v.id("agentThreads"), content: v.string(), createdAt: v.number() },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.insert("agentMessages", {
      jobId: args.jobId,
      threadId: args.threadId,
      role: "system",
      content: args.content,
      createdAt: args.createdAt,
    });
    await ctx.db.patch(args.threadId, { lastMessageAt: args.createdAt });
    return null;
  },
});

export type AgentJobId = Id<"agentJobs">;


