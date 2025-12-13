import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getSearchCache = query({
  args: { key: v.string(), now: v.number() },
  returns: v.union(
    v.null(),
    v.object({
      itemIds: v.array(v.id("items")),
    }),
  ),
  handler: async (ctx, args) => {
    const entry = await ctx.db
      .query("searchCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    if (!entry) return null;
    if (entry.expiresAt <= args.now) return null;

    return { itemIds: entry.itemIds };
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
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const expiresAt = args.createdAt + args.ttlSeconds * 1000;

    const existing = await ctx.db
      .query("searchCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .unique();

    const doc = {
      key: args.key,
      source: args.source,
      query: args.query,
      filters: args.filters,
      itemIds: args.itemIds,
      createdAt: args.createdAt,
      expiresAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, doc);
    } else {
      await ctx.db.insert("searchCache", doc);
    }
    return null;
  },
});


