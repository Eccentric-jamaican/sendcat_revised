import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const upsertTaxonomyCache = mutation({
  args: {
    marketplaceId: v.string(),
    categoryTreeId: v.string(),
    categories: v.array(
      v.object({
        categoryId: v.string(),
        name: v.string(),
        parentCategoryId: v.optional(v.string()),
        level: v.number(),
      }),
    ),
    fetchedAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const marketplaceId = args.marketplaceId.toUpperCase();

    const payload = {
      marketplaceId,
      categoryTreeId: args.categoryTreeId,
      categories: args.categories,
      fetchedAt: args.fetchedAt,
    };

    // Cache semantics (race-safe): insert a new row, then prune older rows for this marketplace.
    await ctx.db.insert("ebayTaxonomyCache", payload);

    const rows = await ctx.db
      .query("ebayTaxonomyCache")
      .withIndex("by_marketplaceId_and_fetchedAt", (q) => q.eq("marketplaceId", marketplaceId))
      .order("desc")
      .take(100);

    // Keep the newest row (by fetchedAt desc) and delete the rest to prevent unbounded growth.
    for (const row of rows.slice(1)) {
      await ctx.db.delete(row._id);
    }
    return null;
  },
});

