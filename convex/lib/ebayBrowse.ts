export type EbayItem = {
  externalId: string;
  title: string;
  priceUsdCents: number;
  currency?: string;
  imageUrl?: string;
  affiliateUrl?: string;
  condition?: string;
  buyingOptions?: string[];
  sellerUsername?: string;
  sellerFeedbackPercent?: number;
  sellerFeedbackScore?: number;
  shippingCostUsdCents?: number;
  shippingCurrency?: string;
  itemLocation?: string;
  shortDescription?: string;
};

export type EbayBrowseFilters = {
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

export async function searchEbayBrowse(params: {
  accessToken: string;
  query: string;
  filters?: EbayBrowseFilters;
  limit: number;
  offset?: number;
}): Promise<{ items: EbayItem[]; total: number; nextOffset: number | null }> {
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  const brandPrefix = params.filters?.brand?.trim();
  url.searchParams.set("q", brandPrefix ? `${brandPrefix} ${params.query}` : params.query);
  url.searchParams.set("limit", String(params.limit));
  const offset = Math.max(0, Math.floor(params.offset ?? 0));
  if (offset > 0) {
    url.searchParams.set("offset", String(offset));
  }
  // Request richer fields (seller details, shipping, descriptions, etc.)
  url.searchParams.set("fieldgroups", "PRODUCT,EXTENDED");

  if (params.filters?.categoryId?.trim()) {
    // Browse API supports filtering by category IDs via `category_ids` (comma-separated).
    url.searchParams.set("category_ids", params.filters.categoryId.trim());
  }

  const sort = params.filters?.sort ?? "bestMatch";
  const sortMap: Record<NonNullable<EbayBrowseFilters["sort"]>, string> = {
    bestMatch: "BEST_MATCH",
    priceAsc: "PRICE_PLUS_SHIPPING_LOWEST",
    priceDesc: "PRICE_PLUS_SHIPPING_HIGHEST",
    newlyListed: "NEWLY_LISTED",
  };
  url.searchParams.set("sort", sortMap[sort]);

  const filterParts: string[] = [];

  const min = params.filters?.minPriceUsd;
  const max = params.filters?.maxPriceUsd;
  if (typeof min === "number" || typeof max === "number") {
    const minVal =
      typeof min === "number" && Number.isFinite(min) ? Math.max(0, min) : undefined;
    const maxVal =
      typeof max === "number" && Number.isFinite(max) ? Math.max(0, max) : undefined;
    let lo = "";
    let hi = "";
    let hasRange = false;

    if (minVal !== undefined && maxVal !== undefined) {
      if (minVal <= maxVal) {
        lo = `${minVal}`;
        hi = `${maxVal}`;
      } else {
        lo = `${maxVal}`;
        hi = `${minVal}`;
      }
      hasRange = true;
    } else if (minVal !== undefined) {
      lo = `${minVal}`;
      hasRange = true;
    } else if (maxVal !== undefined) {
      hi = `${maxVal}`;
      hasRange = true;
    }

    if (hasRange) {
      filterParts.push(`price:[${lo}..${hi}]`);
      filterParts.push("priceCurrency:USD");
    }
  }

  const condition = params.filters?.condition;
  if (condition) {
    const conditionIds =
      condition === "new"
        ? "conditionIds:{1000}"
        : condition === "used"
          ? "conditionIds:{3000}"
          : "conditionIds:{2000|2500}";
    filterParts.push(conditionIds);
  }

  const buyingFormat = params.filters?.buyingFormat;
  if (buyingFormat) {
    filterParts.push(buyingFormat === "fixedPrice" ? "buyingOptions:{FIXED_PRICE}" : "buyingOptions:{AUCTION}");
  }

  if (params.filters?.freeShippingOnly) {
    // Browse API doesn't have `freeShipping=true`; using delivery cost 0 is the common workaround.
    filterParts.push("maxDeliveryCost:0");
  }
  if (params.filters?.returnsAcceptedOnly) {
    filterParts.push("returnsAccepted:true");
  }

  const loc = params.filters?.itemLocationCountry?.trim();
  if (loc) {
    filterParts.push(`itemLocationCountry:${loc.toUpperCase()}`);
  }

  if (filterParts.length) {
    url.searchParams.set("filter", filterParts.join(","));
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      // Helps some marketplaces localize currency; we still normalize to USD cents when possible.
      "X-EBAY-C-MARKETPLACE-ID": "EBAY_US",
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`eBay search failed (${res.status}): ${text}`);
  }

  type BrowseResponse = {
    itemSummaries?: Array<{
      itemId?: string;
      title?: string;
      price?: { value?: string; currency?: string };
      image?: { imageUrl?: string };
      itemWebUrl?: string;
      condition?: string;
      buyingOptions?: string[];
      seller?: {
        username?: string;
        feedbackPercentage?: string | number;
        feedbackScore?: number;
      };
      shippingOptions?: Array<{
        shippingCost?: { value?: string; currency?: string };
      }>;
      itemLocation?: {
        city?: string;
        stateOrProvince?: string;
        country?: string;
      };
      shortDescription?: string;
    }>;
    total?: number;
    offset?: number;
    limit?: number;
    next?: string;
  };

  const data = (await res.json()) as BrowseResponse;
  const summaries = data.itemSummaries ?? [];

  const items: EbayItem[] = [];
  for (const s of summaries) {
    const itemId = s.itemId;
    const title = s.title;
    const price = s.price;

    if (!itemId || !title || !price?.value) continue;

    const rawValue = price.value.trim();
    const value = Number(rawValue);
    const currency = price.currency as string | undefined;
    // Prefer USD in the API; if not USD, we still store cents as numeric with currency recorded.
    if (Number.isNaN(value)) {
      console.warn(`eBay returned invalid price value for item ${itemId}: ${price.value}`);
      continue;
    }
    const priceUsdCents = Math.round(value * 100);

    const imageUrl = s.image?.imageUrl as string | undefined;
    const affiliateUrl = s.itemWebUrl as string | undefined;

    const condition = typeof s.condition === "string" ? s.condition : undefined;

    const buyingOptions = Array.isArray(s.buyingOptions)
      ? s.buyingOptions.filter((opt): opt is string => typeof opt === "string" && opt.trim().length > 0)
      : undefined;

    const sellerUsername = typeof s.seller?.username === "string" ? s.seller.username : undefined;
    const sellerFeedbackPercentRaw = s.seller?.feedbackPercentage;
    const sellerFeedbackPercent =
      typeof sellerFeedbackPercentRaw === "number"
        ? sellerFeedbackPercentRaw
        : typeof sellerFeedbackPercentRaw === "string"
          ? Number(sellerFeedbackPercentRaw)
          : undefined;
    const sellerFeedbackScore =
      typeof s.seller?.feedbackScore === "number" ? s.seller.feedbackScore : undefined;

    const firstShipping = s.shippingOptions?.find((opt) => opt?.shippingCost?.value);
    const shippingCostValue = firstShipping?.shippingCost?.value;
    const shippingCostCurrency = firstShipping?.shippingCost?.currency;
    const shippingCostUsdCents =
      typeof shippingCostValue === "string" || typeof shippingCostValue === "number"
        ? Math.round(Number(shippingCostValue) * 100)
        : undefined;

    const locationParts = [
      typeof s.itemLocation?.city === "string" ? s.itemLocation.city : undefined,
      typeof s.itemLocation?.stateOrProvince === "string" ? s.itemLocation.stateOrProvince : undefined,
      typeof s.itemLocation?.country === "string" ? s.itemLocation.country : undefined,
    ].filter((part): part is string => Boolean(part?.trim()));
    const itemLocation = locationParts.length ? locationParts.join(", ") : undefined;

    const shortDescription = typeof s.shortDescription === "string" ? s.shortDescription : undefined;

    items.push({
      externalId: String(itemId),
      title: String(title),
      priceUsdCents,
      currency,
      imageUrl,
      affiliateUrl,
      condition,
      buyingOptions,
      sellerUsername,
      sellerFeedbackPercent: Number.isFinite(sellerFeedbackPercent) ? sellerFeedbackPercent : undefined,
      sellerFeedbackScore,
      shippingCostUsdCents: Number.isFinite(shippingCostUsdCents) ? shippingCostUsdCents : undefined,
      shippingCurrency: shippingCostCurrency as string | undefined,
      itemLocation,
      shortDescription,
    });
  }

  const apiTotal =
    typeof data.total === "number"
      ? data.total
      : (typeof data.offset === "number" ? data.offset : offset) + items.length;
  const nextHref = typeof data.next === "string" ? data.next : null;
  let nextOffset: number | null = null;
  if (nextHref) {
    try {
      const nextUrl = new URL(nextHref);
      const offsetParam = nextUrl.searchParams.get("offset");
      if (offsetParam) {
        const parsed = Number(offsetParam);
        if (Number.isFinite(parsed)) nextOffset = parsed;
      }
    } catch {
      nextOffset = null;
    }
  }

  return { items, total: apiTotal, nextOffset };
}
