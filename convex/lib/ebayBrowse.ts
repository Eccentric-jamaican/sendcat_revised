export type EbayItem = {
  externalId: string;
  title: string;
  priceUsdCents: number;
  currency?: string;
  imageUrl?: string;
  affiliateUrl?: string;
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
}): Promise<EbayItem[]> {
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  const brandPrefix = params.filters?.brand?.trim();
  url.searchParams.set("q", brandPrefix ? `${brandPrefix} ${params.query}` : params.query);
  url.searchParams.set("limit", String(params.limit));

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
    const minVal = typeof min === "number" && Number.isFinite(min) ? min : undefined;
    const maxVal = typeof max === "number" && Number.isFinite(max) ? max : undefined;
    if (minVal !== undefined || maxVal !== undefined) {
      const lo = minVal !== undefined ? Math.max(0, minVal) : "";
      const hi = maxVal !== undefined ? Math.max(0, maxVal) : "";
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
    filterParts.push(`itemLocationCountry:${loc}`);
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
    }>;
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

    items.push({
      externalId: String(itemId),
      title: String(title),
      priceUsdCents,
      currency,
      imageUrl,
      affiliateUrl,
    });
  }

  return items;
}
