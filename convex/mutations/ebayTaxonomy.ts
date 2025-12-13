import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const upsertTaxonomyCache = mutation({
  args: {
    marketplaceId: v.string(),
    categoryTreeId: v.string(),
    categories: v.any(),
    fetchedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("ebayTaxonomyCache")
      .withIndex("by_marketplaceId", (q) => q.eq("marketplaceId", args.marketplaceId))
      .unique();

    const payload = {
      marketplaceId: args.marketplaceId,
      categoryTreeId: args.categoryTreeId,
      categories: args.categories,
      fetchedAt: args.fetchedAt,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
    } else {
      await ctx.db.insert("ebayTaxonomyCache", payload);
    }
    return null;
  },
});

