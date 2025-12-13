"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
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
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchSource = useAction(api.search.searchSource);
  const trending = useQuery(api.trending.getTrendingItems, {
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

  async function runSearch(opts?: { source?: string; overrideQuery?: string }) {
    const sourceToUse = opts?.source ?? selectedSource;
    const rawQuery = opts?.overrideQuery ?? query;
    const fallback = defaultQueries[sourceToUse] ?? "popular products";
    const q = rawQuery.trim() || fallback;
    if (!q) return;

    setIsSearching(true);
    setError(null);
    try {
      const items = (await searchSource({
        source: sourceToUse,
        query: q,
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
