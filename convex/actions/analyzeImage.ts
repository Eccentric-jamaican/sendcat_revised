"use node";

import { internalAction } from "../_generated/server";
import { v } from "convex/values";
import { analyzeImage, generateSearchQueriesFromImage } from "../lib/vision";

export const analyzeImageForProductSearch = internalAction({
  args: {
    imageUrl: v.string(),
    sessionId: v.string(),
    clerkUserId: v.optional(v.string()),
  },
  returns: v.object({
    visionAnalysis: v.any(),
    generatedQueries: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    const visionResult = await analyzeImage(args.imageUrl);
    const generatedQueries = generateSearchQueriesFromImage(visionResult);

    const result = {
      visionAnalysis,
      generatedQueries,
    };

    return result;
  },
});
