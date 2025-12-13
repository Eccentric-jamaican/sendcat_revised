import { defineSchema, defineTable } from "convex/server";

import { v } from "convex/values";



export default defineSchema({

  sessions: defineTable({

    sessionId: v.string(),

    clerkUserId: v.optional(v.string()),

    createdAt: v.number(),

    lastSeenAt: v.number(),

  })

    .index("by_sessionId", ["sessionId"])

    .index("by_clerkUserId", ["clerkUserId"]),



  items: defineTable({

    source: v.string(), // "ebay" | "amazon" | ...

    externalId: v.string(),

    title: v.string(),

    imageUrl: v.optional(v.string()),

    priceUsdCents: v.number(), // integer cents

    currency: v.optional(v.string()),

    affiliateUrl: v.optional(v.string()),

    lastSeenAt: v.number(),

  })

    .index("by_source_and_externalId", ["source", "externalId"])

    .index("by_source_and_lastSeenAt", ["source", "lastSeenAt"])

    .index("by_lastSeenAt", ["lastSeenAt"]),



  events: defineTable({

    type: v.string(), // "impression" | "click" | ...

    itemId: v.id("items"),

    sessionId: v.optional(v.string()),

    source: v.optional(v.string()),

    clerkUserId: v.optional(v.string()),

    metadata: v.optional(v.any()),

    createdAt: v.number(),

  })

    .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"])

    .index("by_clerkUserId_and_createdAt", ["clerkUserId", "createdAt"])

    .index("by_itemId_and_createdAt", ["itemId", "createdAt"]),



  searchCache: defineTable({

    key: v.string(), // stable hash of (source+query+filters)

    source: v.string(),

    query: v.string(),

    filters: v.optional(v.any()),

    itemIds: v.array(v.id("items")),

    createdAt: v.number(),

    expiresAt: v.number(),

  })

    .index("by_key", ["key"])

    .index("by_expiresAt", ["expiresAt"]),


  ebayTaxonomyCache: defineTable({

    marketplaceId: v.string(), // e.g. "EBAY_US"

    categoryTreeId: v.string(),

    // Flattened categories: { categoryId, name, parentCategoryId?, level }
    categories: v.array(
      v.object({
        categoryId: v.string(),
        name: v.string(),
        parentCategoryId: v.optional(v.string()),
        level: v.number(),
      }),
    ),

    fetchedAt: v.number(),

  })

    .index("by_marketplaceId", ["marketplaceId"])
    .index("by_marketplaceId_and_fetchedAt", ["marketplaceId", "fetchedAt"]),

});





