import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertManyItems = mutation({
  args: {
    items: v.array(
      v.object({
        source: v.string(),
        externalId: v.string(),
        title: v.string(),
        imageUrl: v.optional(v.string()),
        priceUsdCents: v.number(),
        currency: v.optional(v.string()),
        affiliateUrl: v.optional(v.string()),
      }),
    ),
    now: v.number(),
  },
  returns: v.array(v.id("items")),
  handler: async (ctx, args) => {
    const ids = [];

    for (const item of args.items) {
      const existing = await ctx.db
        .query("items")
        .withIndex("by_source_and_externalId", (q) =>
          q.eq("source", item.source).eq("externalId", item.externalId),
        )
        .unique();

      if (existing) {
        await ctx.db.patch(existing._id, { ...item, lastSeenAt: args.now });
        ids.push(existing._id);
      } else {
        const id = await ctx.db.insert("items", { ...item, lastSeenAt: args.now });
        ids.push(id);
      }
    }

    return ids;
  },
});

export const getManyItems = query({
  args: { itemIds: v.array(v.id("items")) },
  returns: v.array(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(),
      source: v.string(),
      externalId: v.string(),
      title: v.string(),
      imageUrl: v.optional(v.string()),
      priceUsdCents: v.number(),
      currency: v.optional(v.string()),
      affiliateUrl: v.optional(v.string()),
      lastSeenAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const results = [];
    for (const id of args.itemIds) {
      const doc = await ctx.db.get(id);
      if (doc) results.push(doc);
    }
    return results;
  },
});

