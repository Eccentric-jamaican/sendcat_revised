import { query } from "../_generated/server";
import { v } from "convex/values";

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
