import { query } from "../_generated/server";
import { v } from "convex/values";

export const getSearchCache = query({
  args: {
    key: v.string(),
    now: v.number(),
  },
  returns: v.nullable(
    v.object({
      itemIds: v.array(v.id("items")),
    }),
  ),
  handler: async (ctx, args) => {
    const [entry] = await ctx.db
      .query("searchCache")
      .withIndex("by_key", (q) => q.eq("key", args.key))
      .order("desc")
      .take(1);

    if (!entry || entry.expiresAt < args.now) {
      return null;
    }

    return { itemIds: entry.itemIds };
  },
});
