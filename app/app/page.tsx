"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { useAction, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

type SearchResultItem = {
  itemId: string;
  source: string;
  externalId: string;
  title: string;
  imageUrl?: string;
  priceUsdCents: number;
  currency?: string;
  affiliateUrl?: string;
};

type TrendingItem = {
  _id: string;
  source: string;
  externalId: string;
  title: string;
  imageUrl?: string;
  priceUsdCents: number;
  currency?: string;
  affiliateUrl?: string;
};

type SearchFilters = {
  minPriceUsd?: number;
  maxPriceUsd?: number;
  condition?: "new" | "used" | "refurbished";
  buyingFormat?: "fixedPrice" | "auction";
  sort?: "bestMatch" | "priceAsc" | "priceDesc" | "newlyListed";
  freeShippingOnly?: boolean;
  returnsAcceptedOnly?: boolean;
  itemLocationCountry?: string; // e.g. "US"
  brand?: string;
  categoryId?: string;
};

export default function AppPage() {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return (
      <div className="flex flex-col gap-4 p-8 max-w-3xl mx-auto w-full text-white">
        <h1 className="text-xl font-semibold">Explore</h1>
        <p className="text-zinc-400">
          Convex isn’t configured yet. Run <span className="font-mono">bunx convex dev</span> and set{" "}
          <span className="font-mono">NEXT_PUBLIC_CONVEX_URL</span> to enable live search.
        </p>
      </div>
    );
  }

  return <ExploreWithConvex />;
}

function ExploreWithConvex() {
  const stores = [
    { name: "amazon", label: "Amazon" },
    { name: "walmart", label: "Walmart" },
    { name: "ebay", label: "eBay" },
    { name: "shein", label: "SHEIN" },
    { name: "depop", label: "Depop" },
  ]

  const defaultQueries: Record<string, string> = {
    amazon: "best selling electronics",
    walmart: "home essentials",
    ebay: "electronics deals",
    shein: "new arrival fashion",
    depop: "vintage clothing",
  };

  const [selectedSource, setSelectedSource] = useState<string>("ebay");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    itemLocationCountry: "US",
    sort: "bestMatch",
  });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const [selectedCategoryLabel, setSelectedCategoryLabel] = useState<string | null>(null);
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSource = useAction(api.actions.search.searchSource);
  const refreshEbayCategories = useAction(api.actions.ebayTaxonomy.refreshEbayCategories);
  const taxonomy = useQuery(api.queries.ebayTaxonomy.getCategories, {
    marketplaceId: "EBAY_US",
    search: categorySearch.trim() ? categorySearch : undefined,
    parentCategoryId: categorySearch.trim() ? undefined : "0",
    limit: 50,
  }) as unknown as
    | { fetchedAt: number | null; categories: Array<{ categoryId: string; name: string }> }
    | undefined;
  const trending = useQuery(api.queries.trending.getTrendingItems, {
    source: selectedSource,
    limit: 12,
  }) as unknown as TrendingItem[] | undefined;

  const displayItems = useMemo(() => {
    if (results.length) return results;
    return (trending ?? []).map((t) => ({
      itemId: t._id,
      source: t.source,
      externalId: t.externalId,
      title: t.title,
      imageUrl: t.imageUrl,
      priceUsdCents: t.priceUsdCents,
      currency: t.currency,
      affiliateUrl: t.affiliateUrl,
    }));
  }, [results, trending]);

  async function runSearch(opts?: { source?: string; overrideQuery?: string; overrideFilters?: SearchFilters }) {
    const sourceToUse = opts?.source ?? selectedSource;
    const rawQuery = opts?.overrideQuery ?? query;
    const filtersToUse = opts?.overrideFilters ?? filters;
    const fallback = defaultQueries[sourceToUse] ?? "popular products";
    const q = rawQuery.trim() || fallback;
    if (!q) return;

    setIsSearching(true);
    setError(null);
    try {
      const items = (await searchSource({
        source: sourceToUse,
        query: q,
        filters: filtersToUse,
        limit: 24,
      })) as unknown as SearchResultItem[];
      setResults(items);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  useEffect(() => {
    void runSearch({ source: selectedSource });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!filtersOpen) return;
    if (taxonomy && taxonomy.fetchedAt) return;
    void refreshEbayCategories({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen]);

  const activeFilterChips = useMemo(() => {
    const chips: Array<{ key: string; label: string; onClear: () => void }> = [];

    if (typeof filters.minPriceUsd === "number" || typeof filters.maxPriceUsd === "number") {
      const min = typeof filters.minPriceUsd === "number" ? `$${filters.minPriceUsd}` : "";
      const max = typeof filters.maxPriceUsd === "number" ? `$${filters.maxPriceUsd}` : "";
      chips.push({
        key: "price",
        label: `Price ${min}${min && max ? "–" : ""}${max}`.trim(),
        onClear: () => setFilters((f) => ({ ...f, minPriceUsd: undefined, maxPriceUsd: undefined })),
      });
    }
    if (filters.condition) {
      chips.push({
        key: "condition",
        label: `Condition: ${filters.condition}`,
        onClear: () => setFilters((f) => ({ ...f, condition: undefined })),
      });
    }
    if (filters.buyingFormat) {
      chips.push({
        key: "buyingFormat",
        label: filters.buyingFormat === "fixedPrice" ? "Buy It Now" : "Auction",
        onClear: () => setFilters((f) => ({ ...f, buyingFormat: undefined })),
      });
    }
    if (filters.freeShippingOnly) {
      chips.push({
        key: "freeShipping",
        label: "Free shipping",
        onClear: () => setFilters((f) => ({ ...f, freeShippingOnly: undefined })),
      });
    }
    if (filters.returnsAcceptedOnly) {
      chips.push({
        key: "returns",
        label: "Returns",
        onClear: () => setFilters((f) => ({ ...f, returnsAcceptedOnly: undefined })),
      });
    }
    if (filters.brand?.trim()) {
      chips.push({
        key: "brand",
        label: `Brand: ${filters.brand.trim()}`,
        onClear: () => setFilters((f) => ({ ...f, brand: undefined })),
      });
    }
    if (filters.categoryId?.trim()) {
      chips.push({
        key: "category",
        label: `Category: ${selectedCategoryLabel ?? "Selected"}`,
        onClear: () => {
          setSelectedCategoryLabel(null);
          setFilters((f) => ({ ...f, categoryId: undefined }));
        },
      });
    }
    if (filters.itemLocationCountry && filters.itemLocationCountry !== "US") {
      chips.push({
        key: "location",
        label: `From: ${filters.itemLocationCountry}`,
        onClear: () => setFilters((f) => ({ ...f, itemLocationCountry: "US" })),
      });
    }
    if (filters.sort && filters.sort !== "bestMatch") {
      const label =
        filters.sort === "priceAsc"
          ? "Sort: Price ↑"
          : filters.sort === "priceDesc"
            ? "Sort: Price ↓"
            : "Sort: New";
      chips.push({
        key: "sort",
        label,
        onClear: () => setFilters((f) => ({ ...f, sort: "bestMatch" })),
      });
    }

    return chips;
  }, [filters]);

  return (
    <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      {/* Search Bar */}
      <div className="relative w-full">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <Input 
          placeholder="Search products, brands, or stores" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void runSearch();
          }}
          className="pl-10 h-12 text-base rounded-xl border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/50"
        />
      </div>

      {/* Filters */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {activeFilterChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onClear}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-zinc-900/50 px-3 py-1.5 text-xs text-white hover:bg-zinc-800"
              title="Click to clear"
            >
              <span>{chip.label}</span>
              <X className="h-3.5 w-3.5 text-zinc-400" />
            </button>
          ))}
          {!activeFilterChips.length ? (
            <span className="text-sm text-zinc-500">No filters applied</span>
          ) : null}
        </div>

        <Button
          type="button"
          variant="outline"
          className="border-white/10 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white"
          onClick={() => setFiltersOpen(true)}
        >
          <SlidersHorizontal className="h-4 w-4" />
          All filters
        </Button>
      </div>

      {filtersOpen ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            className="absolute inset-0 bg-black/70"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="absolute left-1/2 top-1/2 w-[min(92vw,560px)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-[#0b0b0f] p-5 shadow-2xl flex flex-col">
            <div className="flex items-center justify-between shrink-0 mb-4">
              <h3 className="text-lg font-semibold text-white">All filters</h3>
              <Button
                type="button"
                variant="ghost"
                className="text-white hover:bg-white/10"
                onClick={() => setFiltersOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0 pr-2 grid grid-cols-1 md:grid-cols-2 gap-4 content-start">
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Min price (USD)</label>
                <Input
                  value={filters.minPriceUsd ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, minPriceUsd: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  placeholder="e.g. 25"
                  className="h-10 rounded-xl border-white/10 bg-zinc-900/50 text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Max price (USD)</label>
                <Input
                  value={filters.maxPriceUsd ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, maxPriceUsd: e.target.value ? Number(e.target.value) : undefined }))
                  }
                  placeholder="e.g. 200"
                  className="h-10 rounded-xl border-white/10 bg-zinc-900/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Brand</label>
                <Input
                  value={filters.brand ?? ""}
                  onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value || undefined }))}
                  placeholder="e.g. Nike"
                  className="h-10 rounded-xl border-white/10 bg-zinc-900/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Item location country</label>
                <Input
                  value={filters.itemLocationCountry ?? "US"}
                  onChange={(e) => setFilters((f) => ({ ...f, itemLocationCountry: e.target.value || "US" }))}
                  placeholder="US"
                  className="h-10 rounded-xl border-white/10 bg-zinc-900/50 text-white"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Condition</label>
                <div className="flex flex-wrap gap-2">
                  {(["new", "used", "refurbished"] as const).map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, condition: f.condition === c ? undefined : c }))}
                      className={`rounded-full px-3 py-2 text-xs border ${
                        filters.condition === c
                          ? "border-indigo-500/60 bg-indigo-500/15 text-white"
                          : "border-white/10 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs text-zinc-400">Buying format</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "fixedPrice", label: "Buy It Now" },
                    { key: "auction", label: "Auction" },
                  ] as const).map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() =>
                        setFilters((f) => ({ ...f, buyingFormat: f.buyingFormat === o.key ? undefined : o.key }))
                      }
                      className={`rounded-full px-3 py-2 text-xs border ${
                        filters.buyingFormat === o.key
                          ? "border-indigo-500/60 bg-indigo-500/15 text-white"
                          : "border-white/10 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Sort</label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { key: "bestMatch", label: "Best match" },
                    { key: "newlyListed", label: "New" },
                    { key: "priceAsc", label: "Price ↑" },
                    { key: "priceDesc", label: "Price ↓" },
                  ] as const).map((o) => (
                    <button
                      key={o.key}
                      type="button"
                      onClick={() => setFilters((f) => ({ ...f, sort: o.key }))}
                      className={`rounded-full px-3 py-2 text-xs border ${
                        filters.sort === o.key
                          ? "border-indigo-500/60 bg-indigo-500/15 text-white"
                          : "border-white/10 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800"
                      }`}
                    >
                      {o.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Toggles</label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, freeShippingOnly: !f.freeShippingOnly }))}
                    className={`rounded-full px-3 py-2 text-xs border ${
                      filters.freeShippingOnly
                        ? "border-indigo-500/60 bg-indigo-500/15 text-white"
                        : "border-white/10 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    Free shipping
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilters((f) => ({ ...f, returnsAcceptedOnly: !f.returnsAcceptedOnly }))}
                    className={`rounded-full px-3 py-2 text-xs border ${
                      filters.returnsAcceptedOnly
                        ? "border-indigo-500/60 bg-indigo-500/15 text-white"
                        : "border-white/10 bg-zinc-900/50 text-zinc-200 hover:bg-zinc-800"
                    }`}
                  >
                    Returns accepted
                  </button>
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-xs text-zinc-400">Category</label>
                <div className="space-y-2">
                  <Input
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories (e.g. Electronics, Shoes)"
                    className="h-10 rounded-xl border-white/10 bg-zinc-900/50 text-white"
                  />
                  <div className="max-h-40 overflow-auto rounded-xl border border-white/10 bg-zinc-900/30">
                    {!taxonomy ? (
                      <div className="p-3 text-sm text-zinc-400">Loading categories…</div>
                    ) : taxonomy.categories.length ? (
                      <div className="divide-y divide-white/5">
                        {taxonomy.categories.map((c) => (
                          <button
                            key={c.categoryId}
                            type="button"
                            onClick={() => {
                              setFilters((f) => ({ ...f, categoryId: c.categoryId }));
                              setSelectedCategoryLabel(c.name);
                            }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-white/5 ${
                              filters.categoryId === c.categoryId ? "bg-white/5 text-white" : "text-zinc-200"
                            }`}
                          >
                            {c.name}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 text-sm text-zinc-400">No categories found.</div>
                    )}
                  </div>
                  {taxonomy?.fetchedAt ? (
                    <p className="text-[11px] text-zinc-500">
                      Categories updated {new Date(taxonomy.fetchedAt).toLocaleString()}.
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3 shrink-0 pt-4 border-t border-white/10">
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-300 hover:bg-white/10 hover:text-white"
                onClick={() =>
                    setFilters({
                      itemLocationCountry: "US",
                      sort: "bestMatch",
                    })
                }
              >
                Reset
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border-white/10 bg-zinc-900/50 text-white hover:bg-zinc-800 hover:text-white"
                  onClick={() => setFiltersOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    setFiltersOpen(false);
                    setResults([]);
                    void runSearch({ source: selectedSource, overrideFilters: filters });
                  }}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Stores */}
      <div className="md:hidden">
        <Carousel
          opts={{
            align: "start",
            dragFree: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-3">
            {stores.map((store) => (
              <CarouselItem key={store.name} className="basis-1/2 pl-3">
                <Card
                  className={`bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border-white/10 shadow-sm ${
                    selectedSource === store.name ? "ring-1 ring-indigo-500/60" : ""
                  }`}
                  onClick={() => {
                    setSelectedSource(store.name);
                    setResults([]);
                    void runSearch({ source: store.name });
                  }}
                >
                  <CardContent className="flex items-center justify-center p-5 h-20">
                    <span className="text-lg font-bold text-white">{store.label}</span>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="hidden md:grid grid-cols-2 md:grid-cols-5 gap-4">
        {stores.map((store) => (
          <Card
            key={store.name}
            className={`bg-zinc-900/50 hover:bg-zinc-800 transition-colors cursor-pointer border-white/10 shadow-sm ${
              selectedSource === store.name ? "ring-1 ring-indigo-500/60" : ""
            }`}
            onClick={() => {
              setSelectedSource(store.name);
              setResults([]);
              void runSearch({ source: store.name });
            }}
          >
            <CardContent className="flex items-center justify-center p-6 h-24">
              <span className="text-xl font-bold text-white">{store.label}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Trending Products */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">
            {results.length ? "Results" : "Trending Products"}
          </h2>
          <button
            type="button"
            onClick={() => void runSearch()}
            disabled={isSearching || !query.trim()}
            className="text-sm rounded-lg px-3 py-2 bg-white/10 hover:bg-white/15 disabled:opacity-50"
          >
            {isSearching ? "Searching…" : "Search"}
          </button>
        </div>

        {error ? <p className="text-sm text-red-400">{error}</p> : null}
        {!results.length && !trending ? (
          <p className="text-sm text-zinc-500">Loading trending…</p>
        ) : null}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {displayItems.map((item) => (
            <Card
              key={item.itemId}
              className="overflow-hidden border-white/10 bg-zinc-900/50 shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              onClick={() => {
                if (!item.affiliateUrl) return;
                window.open(`/api/out?url=${encodeURIComponent(item.affiliateUrl)}`, "_blank", "noopener,noreferrer");
              }}
            >
              <CardContent className="p-0">
                <div className="aspect-square bg-zinc-800 relative">
                  {item.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="absolute inset-0 h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-500">
                      No image
                    </div>
                  )}
                </div>
                <div className="p-3 space-y-1">
                  <h3 className="font-medium text-sm text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    ${(item.priceUsdCents / 100).toFixed(2)} {item.currency ?? "USD"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
