import { query } from "../_generated/server";
import { v } from "convex/values";
import { normalizeEbayImageUrl } from "../lib/imageUtils";

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
    const results = [];
    for (const id of args.itemIds) {
      const doc = await ctx.db.get(id);
      if (doc) {
        // Normalize eBay image URLs to high-resolution versions
        const imageUrl =
          doc.source === "ebay"
            ? normalizeEbayImageUrl(doc.imageUrl)
            : doc.imageUrl;
        results.push({ ...doc, imageUrl });
      }
    }
    return results;
  },
});

