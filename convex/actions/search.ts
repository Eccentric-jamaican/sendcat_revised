import { action, internalAction } from "../_generated/server";
import type { GenericActionCtx } from "convex/server";
import type { DataModel, Doc, Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { api } from "../_generated/api";
import { searchEbayBrowse } from "../lib/ebayBrowse";
import { searchAndContents, ExaSearchResult } from "../lib/exaSearch";
import crypto from "node:crypto";

type TokenCache = { token: string; expiresAtMs: number };
type SearchFilters = {
  minPriceUsd?: number;
  maxPriceUsd?: number;
  condition?: "new" | "used" | "refurbished";
  buyingFormat?: "fixedPrice" | "auction";
  sort?: "bestMatch" | "priceAsc" | "priceDesc" | "newlyListed";
  freeShippingOnly?: boolean;
  returnsAcceptedOnly?: boolean;
  itemLocationCountry?: string;
  brand?: string;
  categoryId?: string;
};
type SearchSourceArgs = {
  source: string;
  query: string;
  filters?: SearchFilters;
  limit?: number;
  offset?: number;
};
type SearchActionCtx = GenericActionCtx<DataModel>;
type ItemDoc = Doc<"items">;
type SearchCacheResult =
  | {
    itemIds: Id<"items">[];
    meta?: {
      total?: number;
      offset?: number;
      limit?: number;
      nextOffset?: number;
    };
  }
  | null;
let ebayTokenCache: TokenCache | null = null;
const SEARCH_CACHE_VERSION = "v2";

async function getEbayAccessToken(): Promise<string> {
  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing EBAY_CLIENT_ID or EBAY_CLIENT_SECRET");
  }

  const now = Date.now();
  if (ebayTokenCache && ebayTokenCache.expiresAtMs - 60_000 > now) {
    return ebayTokenCache.token;
  }

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch("https://api.ebay.com/identity/v1/oauth2/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope: "https://api.ebay.com/oauth/api_scope",
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    throw new Error(`eBay OAuth failed (${tokenRes.status}): ${text}`);
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  const token = tokenJson.access_token;
  const expiresIn = Number(tokenJson.expires_in ?? 0);
  if (!token) throw new Error("eBay OAuth returned no access_token");

  ebayTokenCache = { token, expiresAtMs: now + expiresIn * 1000 };
  return token;
}

function cacheKeyFor(params: { source: string; query: string; filters?: unknown; offset: number; limit: number }) {
  const raw = `${SEARCH_CACHE_VERSION}::${params.source}::${params.query}::${JSON.stringify(params.filters ?? {})}::${params.offset}::${params.limit}`.toLowerCase();
  return crypto.createHash("sha256").update(raw).digest("hex");
}

export const searchSource = action({
  args: {
    source: v.string(), // MVP: "ebay"
    query: v.string(),
    filters: v.optional(
      v.object({
        minPriceUsd: v.optional(v.number()),
        maxPriceUsd: v.optional(v.number()),
        condition: v.optional(v.union(v.literal("new"), v.literal("used"), v.literal("refurbished"))),
        buyingFormat: v.optional(v.union(v.literal("fixedPrice"), v.literal("auction"))),
        sort: v.optional(
          v.union(v.literal("bestMatch"), v.literal("priceAsc"), v.literal("priceDesc"), v.literal("newlyListed")),
        ),
        freeShippingOnly: v.optional(v.boolean()),
        returnsAcceptedOnly: v.optional(v.boolean()),
        itemLocationCountry: v.optional(v.string()),
        brand: v.optional(v.string()),
        categoryId: v.optional(v.string()),
      }),
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  returns: v.object({
    items: v.array(
      v.object({
        itemId: v.id("items"),
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
      }),
    ),
    total: v.optional(v.number()),
    nextOffset: v.optional(v.number()),
  }),
  handler: async (ctx: SearchActionCtx, args: SearchSourceArgs) => {
    const now = Date.now();
    const source = args.source.toLowerCase();
    const limit = Math.max(1, Math.min(50, Math.floor(args.limit ?? 20)));
    const offset = Math.max(0, Math.floor(args.offset ?? 0));

    const key = cacheKeyFor({ source, query: args.query, filters: args.filters, offset, limit });
    const cached = (await ctx.runQuery(api.queries.searchCache.getSearchCache, {
      key,
      now,
    })) as SearchCacheResult;

    if (cached?.itemIds?.length) {
      const items = (await ctx.runQuery(api.queries.items.getManyItems, {
        itemIds: cached.itemIds,
      })) as ItemDoc[];

      return {
        items: items.map((i) => ({
          itemId: i._id,
          source: i.source,
          externalId: i.externalId,
          title: i.title,
          imageUrl: i.imageUrl,
          priceUsdCents: i.priceUsdCents,
          currency: i.currency,
          affiliateUrl: i.affiliateUrl,
          condition: i.condition,
          buyingOptions: i.buyingOptions,
          sellerUsername: i.sellerUsername,
          sellerFeedbackPercent: i.sellerFeedbackPercent,
          sellerFeedbackScore: i.sellerFeedbackScore,
          shippingCostUsdCents: i.shippingCostUsdCents,
          shippingCurrency: i.shippingCurrency,
          itemLocation: i.itemLocation,
          shortDescription: i.shortDescription,
        })),
        total: cached.meta?.total ?? undefined,
        nextOffset: cached.meta?.nextOffset ?? undefined,
      };
    }

    if (source !== "ebay") {
      throw new Error(`Source not implemented yet: ${source}`);
    }

    const accessToken = await getEbayAccessToken();
    const ebayResult = await searchEbayBrowse({
      accessToken,
      query: args.query,
      filters: args.filters,
      limit,
      offset,
    });
    const { items: ebayItems, total, nextOffset } = ebayResult;

    const upsertIds = (await ctx.runMutation(api.mutations.items.upsertManyItems, {
      items: ebayItems.map((i) => ({
        source,
        externalId: i.externalId,
        title: i.title,
        imageUrl: i.imageUrl,
        priceUsdCents: i.priceUsdCents,
        currency: i.currency,
        affiliateUrl: i.affiliateUrl,
        condition: i.condition,
        buyingOptions: i.buyingOptions,
        sellerUsername: i.sellerUsername,
        sellerFeedbackPercent: i.sellerFeedbackPercent,
        sellerFeedbackScore: i.sellerFeedbackScore,
        shippingCostUsdCents: i.shippingCostUsdCents,
        shippingCurrency: i.shippingCurrency,
        itemLocation: i.itemLocation,
        shortDescription: i.shortDescription,
      })),
      now,
    })) as Id<"items">[];

    // Cache search results for 20 minutes (tunable).
    await ctx.runMutation(api.mutations.searchCache.setSearchCache, {
      key,
      source,
      query: args.query,
      filters: args.filters,
      itemIds: upsertIds,
      createdAt: now,
      ttlSeconds: 20 * 60,
      meta: {
        total,
        offset,
        limit,
        nextOffset: nextOffset ?? undefined,
      },
    });

    const items = (await ctx.runQuery(api.queries.items.getManyItems, {
      itemIds: upsertIds,
    })) as ItemDoc[];

    return {
      items: items.map((i) => ({
        itemId: i._id,
        source: i.source,
        externalId: i.externalId,
        title: i.title,
        imageUrl: i.imageUrl,
        priceUsdCents: i.priceUsdCents,
        currency: i.currency,
        affiliateUrl: i.affiliateUrl,
        condition: i.condition,
        buyingOptions: i.buyingOptions,
        sellerUsername: i.sellerUsername,
        sellerFeedbackPercent: i.sellerFeedbackPercent,
        sellerFeedbackScore: i.sellerFeedbackScore,
        shippingCostUsdCents: i.shippingCostUsdCents,
        shippingCurrency: i.shippingCurrency,
        itemLocation: i.itemLocation,
        shortDescription: i.shortDescription,
      })),
      total,
      nextOffset: nextOffset ?? undefined,
    };
  },
});

export const searchExa = internalAction({
  args: {
    query: v.string(),
    numResults: v.optional(v.number()),
    includeDomains: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    type: v.optional(v.string()),
  },
  returns: v.object({
    items: v.array(v.any()),
  }),
  handler: async (ctx, args) => {
    const searchResults = await searchAndContents({
      query: args.query,
      numResults: args.numResults ?? 10,
      highlights: true,
      contents: { text: true, maxCharacters: 3000 },
      includeDomains: args.includeDomains,
      category: args.category as "company" | "research paper" | "news" | "pdf" | "github" | "tweet" | "personal site" | "financial report" | "people" | undefined,
      type: args.type as "auto" | "neural" | "fast" | "deep" | undefined,
    });

    const items = searchResults.results.map((result: ExaSearchResult) => ({
      itemId: result.url,
      source: "exa",
      externalId: result.url,
      title: result.title,
      imageUrl: result.image,
      priceUsdCents: result.price ? parsePriceInternal(result.price) : undefined,
      currency: result.currency,
      affiliateUrl: result.url,
      exaScore: result.score,
      exaHighlights: result.highlights?.map((h) => h.text) || [],
      publishedDate: result.publishedDate,
      author: result.author,
    }));

    return { items };
  },
});

function parsePriceInternal(priceText: string | undefined): number | undefined {
  if (!priceText) return undefined;
  const match = priceText.match(/\$?(\d+\.?\d*)/);
  if (!match) return undefined;
  const price = parseFloat(match[1]);
  return Math.round(price * 100);
}
