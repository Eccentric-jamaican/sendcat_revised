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

    // Multi-row semantics (race-safe): always insert. Reads should fetch latest by fetchedAt desc.
    await ctx.db.insert("ebayTaxonomyCache", payload);
    return null;
  },
});

