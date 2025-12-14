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

    meta: v.optional(
      v.object({
        total: v.optional(v.number()),
        offset: v.optional(v.number()),
        limit: v.optional(v.number()),
        nextOffset: v.optional(v.number()),
      }),
    ),

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

  agentJobs: defineTable({

    sessionId: v.string(),

    clerkUserId: v.optional(v.string()),

    threadId: v.optional(v.id("agentThreads")),

    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed"),
    ),

    prompt: v.string(),

    intent: v.optional(v.any()),

    resultItemIds: v.optional(v.array(v.id("items"))),

    error: v.optional(v.string()),

    createdAt: v.number(),

    startedAt: v.optional(v.number()),

    completedAt: v.optional(v.number()),

  })

    .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"])

    .index("by_clerkUserId_and_createdAt", ["clerkUserId", "createdAt"])

    .index("by_status_and_createdAt", ["status", "createdAt"])

    .index("by_threadId_and_createdAt", ["threadId", "createdAt"]),


  agentThreads: defineTable({

    sessionId: v.string(),

    clerkUserId: v.optional(v.string()),

    title: v.optional(v.string()),

    createdAt: v.number(),

    lastMessageAt: v.number(),

  })

    .index("by_sessionId_and_lastMessageAt", ["sessionId", "lastMessageAt"])

    .index("by_clerkUserId_and_lastMessageAt", ["clerkUserId", "lastMessageAt"]),


  agentMessages: defineTable({

    jobId: v.id("agentJobs"),

    // Optional to allow older dev rows created before threads existed.
    // New writes always include threadId.
    threadId: v.optional(v.id("agentThreads")),

    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("system")),

    content: v.string(),

    createdAt: v.number(),

  })

    .index("by_jobId_and_createdAt", ["jobId", "createdAt"])
    .index("by_threadId_and_createdAt", ["threadId", "createdAt"]),


  pushSubscriptions: defineTable({

    sessionId: v.string(),

    clerkUserId: v.optional(v.string()),

    endpoint: v.string(),

    p256dh: v.string(),

    auth: v.string(),

    userAgent: v.optional(v.string()),

    createdAt: v.number(),

    lastSeenAt: v.number(),

  })

    .index("by_endpoint", ["endpoint"])

    .index("by_sessionId_and_lastSeenAt", ["sessionId", "lastSeenAt"])

    .index("by_clerkUserId_and_lastSeenAt", ["clerkUserId", "lastSeenAt"]),

});





