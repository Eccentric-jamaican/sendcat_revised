export type EbayItem = {
  externalId: string;
  title: string;
  priceUsdCents: number;
  currency?: string;
  imageUrl?: string;
  affiliateUrl?: string;
};

export async function searchEbayBrowse(params: {
  accessToken: string;
  query: string;
  limit: number;
}): Promise<EbayItem[]> {
  const url = new URL("https://api.ebay.com/buy/browse/v1/item_summary/search");
  url.searchParams.set("q", params.query);
  url.searchParams.set("limit", String(params.limit));

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

    const value = Number(price.value);
    const currency = price.currency as string | undefined;
    // Prefer USD in the API; if not USD, we still store cents as numeric with currency recorded.
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

