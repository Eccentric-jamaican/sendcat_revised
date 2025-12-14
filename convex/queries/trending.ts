import { query } from "../_generated/server";
import { v } from "convex/values";

export const getTrendingItems = query({
  args: {
    source: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
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
      condition: v.optional(v.string()),
      buyingOptions: v.optional(v.array(v.string())),
      sellerUsername: v.optional(v.string()),
      sellerFeedbackPercent: v.optional(v.number()),
      sellerFeedbackScore: v.optional(v.number()),
      shippingCostUsdCents: v.optional(v.number()),
      shippingCurrency: v.optional(v.string()),
      itemLocation: v.optional(v.string()),
      shortDescription: v.optional(v.string()),
      lastSeenAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(50, Math.floor(args.limit ?? 12)));
    const source = args.source?.toLowerCase();

    if (!source) {
      // Generic fallback: show most recently seen items (across all sources).
      // This is intentionally simple for MVP; later we’ll compute weighted events.
      return await ctx.db
        .query("items")
        .withIndex("by_lastSeenAt")
        .order("desc")
        .take(limit);
    }

    return await ctx.db
      .query("items")
      .withIndex("by_source_and_lastSeenAt", (q) => q.eq("source", source))
      .order("desc")
      .take(limit);
  },
});

