import { query } from "../_generated/server";
import { v } from "convex/values";

export const getCategories = query({
  args: {
    marketplaceId: v.optional(v.string()), // default "EBAY_US"
    search: v.optional(v.string()),
    parentCategoryId: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    fetchedAt: v.union(v.number(), v.null()),
    categories: v.array(
      v.object({
        categoryId: v.string(),
        name: v.string(),
        parentCategoryId: v.optional(v.string()),
        level: v.number(),
      }),
    ),
  }),
  handler: async (ctx, args) => {
    const marketplaceId = (args.marketplaceId ?? "EBAY_US").toUpperCase();
    const [cache] = await ctx.db
      .query("ebayTaxonomyCache")
      .withIndex("by_marketplaceId", (q) => q.eq("marketplaceId", marketplaceId))
      .take(1);

    if (!cache) {
      return { fetchedAt: null, categories: [] };
    }

    const raw = (cache.categories ?? []) as Array<{
      categoryId: string;
      name: string;
      parentCategoryId?: string;
      level: number;
    }>;

    const limit = Math.max(1, Math.min(200, Math.floor(args.limit ?? 50)));
    const parent = args.parentCategoryId?.trim();
    const search = args.search?.trim().toLowerCase();

    let list = raw;
    if (parent) list = list.filter((c) => c.parentCategoryId === parent);
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search));

    return { fetchedAt: cache.fetchedAt, categories: list.slice(0, limit) };
  },
});

