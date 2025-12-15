import { internalMutation, mutation } from "../_generated/server";
import { v } from "convex/values";

/**
 * Clear all search cache entries. Useful when image URL normalization
 * or other data transformations change and you want fresh data.
 */
export const clearAllSearchCache = internalMutation({
  args: {},
  returns: v.number(),
  handler: async (ctx) => {
    const allCached = await ctx.db.query("searchCache").collect();
    for (const entry of allCached) {
      await ctx.db.delete(entry._id);
    }
    return allCached.length;
  },
});

export const setSearchCache = mutation({
  args: {
    key: v.string(),
    source: v.string(),
    query: v.string(),
    filters: v.optional(v.any()),
    itemIds: v.array(v.id("items")),
    createdAt: v.number(),
    ttlSeconds: v.number(),
    meta: v.optional(
      v.object({
        total: v.optional(v.number()),
        offset: v.optional(v.number()),
        limit: v.optional(v.number()),
        nextOffset: v.optional(v.number()),
      }),
    ),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const expiresAt = args.createdAt + args.ttlSeconds * 1000;
    const payload = {
      key: args.key,
      source: args.source,
      query: args.query,
      filters: args.filters ?? undefined,
      itemIds: args.itemIds,
      createdAt: args.createdAt,
      expiresAt,
      meta: args.meta ?? undefined,
    };

    const existing = await ctx.db
      .query("searchCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("searchCache", payload);
    }

    return null;
  },
});

