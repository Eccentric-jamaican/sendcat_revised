"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal, X, ExternalLink, Package, BadgeCheck, Truck, MapPin, Bot, ArrowRight, Bell, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { useAction, useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useSearchParams } from "next/navigation";
import type { Doc, Id } from "@/convex/_generated/dataModel";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie.split(";").map((c) => c.trim());
  const match = cookies.find((c) => c.startsWith(`${name}=`));
  if (!match) return null;
  return decodeURIComponent(match.split("=").slice(1).join("="));
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type SearchResultItem = {
  itemId: string;
  source: string;
  externalId: string;
  title: string;
  imageUrl?: string;
  priceUsdCents: number;
  currency?: string;
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

type TrendingItem = {
  _id: string;
  source: string;
  externalId: string;
  title: string;
  imageUrl?: string;
  priceUsdCents: number;
  currency?: string;
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

type RunSearchOptions = {
  source?: string;
  overrideQuery?: string;
  overrideFilters?: SearchFilters;
  offset?: number;
  append?: boolean;
};

const STORES = [
  { name: "amazon", label: "Amazon" },
  { name: "walmart", label: "Walmart" },
  { name: "ebay", label: "eBay" },
  { name: "shein", label: "SHEIN" },
  { name: "depop", label: "Depop" },
];

const DEFAULT_QUERIES: Record<string, string> = {
  amazon: "best selling electronics",
  walmart: "home essentials",
  ebay: "electronics deals",
  shein: "new arrival fashion",
  depop: "vintage clothing",
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
  const stores = STORES;
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
  const [selectedItem, setSelectedItem] = useState<SearchResultItem | null>(null);
  const [nextOffset, setNextOffset] = useState<number | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [lastSearchParams, setLastSearchParams] = useState<{
    source: string;
    query: string;
    filters: SearchFilters;
  } | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // New state for Agent Mode
  const [isAgentMode, setIsAgentMode] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<Id<"agentJobs"> | null>(null);
  const [threadId, setThreadId] = useState<Id<"agentThreads"> | null>(null);
  const [isEnablingPush, setIsEnablingPush] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  const searchSource = useAction(api.actions.search.searchSource);
  const createAgentJob = useMutation(api.mutations.agentJobs.createAgentJob);
  const upsertPushSubscription = useMutation(api.mutations.pushSubscriptions.upsertPushSubscription);
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

  const displayItems: SearchResultItem[] = useMemo(() => {
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
      condition: t.condition,
      buyingOptions: t.buyingOptions,
      sellerUsername: t.sellerUsername,
      sellerFeedbackPercent: t.sellerFeedbackPercent,
      sellerFeedbackScore: t.sellerFeedbackScore,
      shippingCostUsdCents: t.shippingCostUsdCents,
      shippingCurrency: t.shippingCurrency,
      itemLocation: t.itemLocation,
      shortDescription: t.shortDescription,
    }));
  }, [results, trending]);
  const showingSearchResults = results.length > 0;

  const job = useQuery(api.queries.agentJobs.getJob, currentJobId ? { jobId: currentJobId } : "skip");
  const messages = useQuery(api.queries.agentJobs.listThreadMessages, threadId ? { threadId } : "skip");
  const resultItems = useQuery(
    api.queries.items.getManyItems,
    currentJobId && job?.resultItemIds?.length ? { itemIds: job.resultItemIds } : "skip",
  );

  useEffect(() => {
    const shouldOpen = searchParams?.get("agent") === "1";
    const jobId = searchParams?.get("jobId");
    if (shouldOpen) setIsAgentMode(true);

    // Validate the jobId from the URL before casting and setting state.
    // Convex IDs are opaque strings at runtime; ensure we at least have a
    // non-empty, URL-safe token (alphanumeric, dash, underscore) of reasonable length.
    if (typeof jobId === "string" && /^[A-Za-z0-9_-]{6,}$/.test(jobId)) {
      setCurrentJobId(jobId as Id<"agentJobs">);
    } else if (jobId) {
      // If present but invalid, avoid setting malformed IDs and log for debugging.
      // Do not set state (leave as null) so downstream queries won't receive a bad id.
      // eslint-disable-next-line no-console
      console.warn("Invalid agent jobId in URL, ignoring:", jobId);
      setCurrentJobId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!job) return;
    if (!("threadId" in job)) return;
    if (job.threadId && !threadId) setThreadId(job.threadId);
  }, [job, threadId]);

  // Auto-scroll to bottom of chat when messages change
  useEffect(() => {
    if (!isAgentMode) return;
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, isAgentMode, currentJobId, job?.status]);


  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission !== "granted") return;
    setPushEnabled(true);
  }, []);

  const enablePush = useCallback(async () => {
    setIsEnablingPush(true);
    setPushError(null);
    try {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator)) {
        throw new Error("Service Worker not supported in this browser");
      }
      if (!("PushManager" in window)) {
        throw new Error("Push notifications not supported in this browser");
      }

      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        throw new Error("Notification permission was not granted");
      }

      const reg = await navigator.serviceWorker.register("/sw.js");

      const vapidRes = await fetch("/api/push/vapidPublicKey");
      if (!vapidRes.ok) throw new Error("Failed to load VAPID public key");
      const { publicKey } = (await vapidRes.json()) as { publicKey: string };

      const existing = await reg.pushManager.getSubscription();
      const sub =
        existing ??
        (await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey) as any,
        }));

      const sessionId = getCookie("sendcat_sid");
      if (!sessionId) throw new Error("Missing sendcat_sid cookie");

      const json = sub.toJSON();
      const endpoint = json.endpoint;
      const p256dh = json.keys?.p256dh;
      const auth = json.keys?.auth;
      if (!endpoint || !p256dh || !auth) throw new Error("Invalid push subscription");

      await upsertPushSubscription({
        sessionId,
        subscription: { endpoint, keys: { p256dh, auth } },
        userAgent: navigator.userAgent,
      });

      setPushEnabled(true);
    } catch (e: unknown) {
      setPushError(e instanceof Error ? e.message : "Failed to enable notifications");
    } finally {
      setIsEnablingPush(false);
    }
  }, [upsertPushSubscription]);

  const runSearch = useCallback(
    async (opts?: RunSearchOptions) => {
      // In agent mode, standard search is intercepted or deferred
      if (isAgentMode) {
        const raw = opts?.overrideQuery ?? query;
        const prompt = raw.trim();
        if (!prompt) return;

        setError(null);
        setSelectedItem(null);

        const sessionId = getCookie("sendcat_sid");
        if (!sessionId) {
          setError("Missing session cookie. Refresh the page and try again.");
          return;
        }

        try {
          const res = await createAgentJob({ prompt, sessionId, threadId: threadId ?? undefined });
          setCurrentJobId(res.jobId);
          setThreadId(res.threadId);
        } catch (e: unknown) {
          setError(e instanceof Error ? e.message : "Failed to start agent job");
        }
        return;
      }

      const isAppend = Boolean(opts?.append);
      const sourceToUse =
        isAppend && lastSearchParams ? lastSearchParams.source : opts?.source ?? selectedSource;
      const filtersToUse =
        isAppend && lastSearchParams ? lastSearchParams.filters : opts?.overrideFilters ?? filters;
      const rawQuery =
        isAppend && lastSearchParams ? lastSearchParams.query : opts?.overrideQuery ?? query;
      const fallback = DEFAULT_QUERIES[sourceToUse] ?? "popular products";
      const q = rawQuery.trim() || fallback;
      if (!q) return;

      if (isAppend) {
        if (!lastSearchParams) return;
        if (opts?.offset === undefined || opts.offset === null) return;
        setIsLoadingMore(true);
      } else {
        setIsSearching(true);
        setError(null);
        setHasMore(false);
        setNextOffset(null);
        setLastSearchParams(null);
      }

      try {
        const response = await searchSource({
          source: sourceToUse,
          query: q,
          filters: filtersToUse,
          limit: 24,
          offset: Math.max(0, Math.floor(opts?.offset ?? 0)),
        });

        const mergeUniqueByItemId = (prev: SearchResultItem[], next: SearchResultItem[]) => {
          const map = new Map<string, SearchResultItem>();
          for (const item of prev) map.set(item.itemId, item);
          for (const item of next) map.set(item.itemId, item);
          return Array.from(map.values());
        };

        if (isAppend) {
          setResults((prev) => mergeUniqueByItemId(prev, response.items));
        } else {
          setResults(mergeUniqueByItemId([], response.items));
          setLastSearchParams({
            source: sourceToUse,
            query: q,
            filters: { ...filtersToUse },
          });
        }

        const next = typeof response.nextOffset === "number" ? response.nextOffset : null;
        setNextOffset(next);
        setHasMore(next !== null);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Search failed");
      } finally {
        if (isAppend) {
          setIsLoadingMore(false);
        } else {
          setIsSearching(false);
        }
      }
    },
    [filters, lastSearchParams, query, searchSource, selectedSource, isAgentMode, createAgentJob, threadId],
  );

  useEffect(() => {
    // Only run initial search if NOT in agent mode
    if (!isAgentMode) {
      void runSearch({ source: selectedSource });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty deps for initial load

  useEffect(() => {
    if (!filtersOpen) return;
    if (taxonomy && taxonomy.fetchedAt) return;
    void refreshEbayCategories({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtersOpen]);

  useEffect(() => {
    if (!hasMore) return;
    if (isSearching || isLoadingMore) return;
    if (nextOffset === null) return;
    if (!results.length) return;
    const target = loadMoreRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          observer.unobserve(entry.target);
          void runSearch({ append: true, offset: nextOffset });
        }
      },
      { rootMargin: "200px" },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, isSearching, nextOffset, results.length, runSearch]);

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
  }, [filters, selectedCategoryLabel]);

  let pageContent: React.ReactNode;

  // If in Agent Mode, render the modified UI
  if (isAgentMode) {
    const messageList = Array.isArray(messages) ? messages : [];
    const hasConversation = Boolean(currentJobId) && messageList.length > 0;

    const itemDocs: Doc<"items">[] = Array.isArray(resultItems) ? (resultItems as Doc<"items">[]) : [];
    const items: SearchResultItem[] = itemDocs.map((i) => ({
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
    }));

    pageContent = (
      <div className="flex flex-col h-[100dvh] md:h-[calc(100vh-4.5rem)] w-full relative bg-[#050505]">
        {/* Header - Agent Controls */}
        <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-[#050505] shrink-0 z-10">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-indigo-400" />
            <span className="font-medium text-white text-sm md:text-base">Shopping Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-white/5 px-2 md:px-3"
                onClick={() => void enablePush()}
                disabled={pushEnabled || isEnablingPush}
                title={pushEnabled ? "Notifications enabled" : "Enable notifications"}
            >
                {isEnablingPush ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                <span className="hidden sm:inline ml-2">{pushEnabled ? "Enabled" : "Notify me"}</span>
            </Button>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-zinc-400 hover:text-white hover:bg-white/5 px-2 md:px-3"
                onClick={() => {
                setIsAgentMode(false);
                setCurrentJobId(null);
                setThreadId(null);
                setQuery("");
                setError(null);
                }}
            >
                <X className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Close</span>
            </Button>
          </div>
        </div>

        {pushError ? <div className="px-6 py-2 bg-red-500/10 text-red-400 text-sm">{pushError}</div> : null}
        {error ? <div className="px-6 py-2 bg-red-500/10 text-red-400 text-sm">{error}</div> : null}

        {/* Scrollable Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 scroll-smooth pb-24 md:pb-32" ref={chatScrollRef}>
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {!hasConversation ? (
                <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                        <Bot className="h-8 w-8 text-indigo-400" />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-semibold text-white mb-3">
                        What can I help you find?
                    </h1>
                    <p className="text-zinc-400 mb-8 max-w-md px-4">
                        I can search eBay for you, compare prices, and help you find the best deals shipped to Jamaica.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-2xl px-4 md:px-0">
                        {[
                        "Wrinkle-free clothes for travel",
                        "Waterproof bluetooth speaker",
                        "Best eco-friendly baby products",
                        "Dinner party hosting gifts"
                        ].map((suggestion) => (
                        <button
                            key={suggestion}
                            onClick={() => {
                            setQuery(suggestion);
                            void runSearch({ overrideQuery: suggestion });
                            }}
                            className="text-left px-4 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all text-sm text-zinc-300 active:scale-[0.98]"
                        >
                            {suggestion}
                        </button>
                        ))}
                    </div>
                </div>
                ) : (
                <>
                    {/* Message History */}
                    {messageList.map((m, idx) => (
                        <div
                        key={`${m.createdAt}-${idx}`}
                        className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                        >
                        <div
                            className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 md:px-5 md:py-3.5 text-sm leading-relaxed whitespace-pre-wrap shadow-sm ${
                            m.role === "user"
                                ? "bg-indigo-600 text-white rounded-br-sm"
                                : m.role === "system"
                                ? "bg-zinc-900/50 text-zinc-400 border border-white/5"
                                : "bg-zinc-800 text-zinc-100 rounded-bl-sm border border-white/5"
                            }`}
                        >
                            {m.content}
                        </div>
                        </div>
                    ))}

                    {/* Loading State */}
                    {(job?.status === "running" || job?.status === "queued") && (
                        <div className="flex items-center gap-3 text-zinc-400 text-sm ml-1">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                                <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                            </div>
                            <span>Searching for products...</span>
                        </div>
                    )}

                    {/* Results (Horizontal Scroll) */}
                    {items.length > 0 && (
                    <div className="mt-2 space-y-3">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-sm font-medium text-zinc-300">Found {items.length} results</h2>
                        </div>
                        <div className="flex gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 scrollbar-hide snap-x">
                        {items.map((item) => (
                            <div key={item.itemId} className="flex-none w-[180px] md:w-[200px] snap-center">
                                <Card
                                className="h-full overflow-hidden border-white/10 bg-zinc-900/40 hover:bg-zinc-900/60 transition-colors group cursor-pointer flex flex-col"
                                onClick={() => setSelectedItem(item)}
                                >
                                <CardContent className="p-0 flex flex-col h-full">
                                    <div className="aspect-square bg-zinc-800/50 relative overflow-hidden">
                                    {item.imageUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                        src={item.imageUrl}
                                        alt={item.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform group-hover:scale-105"
                                        loading="lazy"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-zinc-600">
                                        <Package className="h-8 w-8 opacity-20" />
                                        </div>
                                    )}
                                    {item.condition === 'New' && (
                                        <span className="absolute top-2 left-2 bg-emerald-500/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                                            NEW
                                        </span>
                                    )}
                                    </div>
                                    <div className="p-3 flex flex-col flex-1 gap-1">
                                    <h3 className="font-medium text-xs sm:text-sm text-zinc-200 line-clamp-2 leading-snug group-hover:text-indigo-300 transition-colors">
                                        {item.title}
                                    </h3>
                                    <div className="mt-auto pt-2 flex items-baseline gap-1.5">
                                        <span className="text-sm sm:text-base font-semibold text-white">
                                            ${(item.priceUsdCents / 100).toFixed(2)}
                                        </span>
                                        {item.shippingCostUsdCents === 0 && (
                                            <span className="text-[10px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded">Free Ship</span>
                                        )}
                                    </div>
                                    </div>
                                </CardContent>
                                </Card>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}
                </>
                )}
            </div>
        </div>

        {/* Input Area (Floating Bottom) */}
        <div className="absolute bottom-4 md:bottom-6 left-0 right-0 px-3 md:px-6 z-20 pointer-events-none">
            <div className="max-w-3xl mx-auto relative pointer-events-auto">
                <div className="relative group shadow-2xl rounded-full">
                    {/* Optional glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-full opacity-50 group-hover:opacity-75 transition duration-500 blur-sm"></div>
                    
                    <Input 
                        autoFocus
                        placeholder="Ask anything..." 
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                void runSearch();
                            }
                        }}
                        className="pl-5 md:pl-6 pr-12 md:pr-14 h-12 md:h-16 text-base md:text-lg rounded-full border-white/10 bg-zinc-900/90 backdrop-blur-xl text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/50 shadow-black/50"
                    />
                    <button 
                        onClick={() => void runSearch()}
                        disabled={!query.trim() || job?.status === "running"}
                        className="absolute right-1.5 md:right-2 top-1/2 -translate-y-1/2 p-2 md:p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-full transition-all disabled:opacity-50 disabled:bg-zinc-800 text-white shadow-lg"
                    >
                        {job?.status === "running" ? (
                            <Loader2 className="h-4 w-4 md:h-5 md:w-5 animate-spin" />
                        ) : (
                            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
                        )}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  } else {
    // Standard Explore Mode
    pageContent = (
      <div className="flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full">
      {/* Search Bar */}
      <div className="flex items-center w-full">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <Input 
            placeholder="Search products, brands, or stores" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch();
            }}
            className="pl-10 h-12 text-base rounded-l-xl rounded-r-none border-r-0 border-white/10 bg-zinc-900/50 text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500/50"
          />
        </div>
        <Button
          type="button"
          className="h-12 rounded-l-none rounded-r-xl border border-l-0 border-white/10 bg-zinc-900/60 text-white hover:bg-zinc-800 shrink-0 px-4"
          onClick={() => setIsAgentMode(!isAgentMode)}
        >
          <Bot className="h-4 w-4 sm:mr-2" />
          <span className="hidden sm:inline">AI Chat</span>
        </Button>
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
                onClick={() => {
                  setSelectedCategoryLabel(null);
                  setFilters({
                    itemLocationCountry: "US",
                    sort: "bestMatch",
                  });
                }}
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
              onClick={() => setSelectedItem(item)}
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
        {showingSearchResults ? (
          <div className="flex flex-col items-center gap-2 pt-4">
            {isLoadingMore ? (
              <span className="text-xs text-zinc-400">Loading more results…</span>
            ) : hasMore ? (
              <span className="text-xs text-zinc-500">Scroll to load more products</span>
            ) : (
              <span className="text-xs text-zinc-500">You’ve reached the end of results</span>
            )}
            {hasMore ? <div ref={loadMoreRef} className="h-1 w-full" /> : null}
          </div>
        ) : null}
      </div>

      </div>
    );
  }

  const productDetailSheet = (
    <Sheet open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
      <SheetContent className="w-full sm:max-w-md border-l border-white/10 bg-zinc-950 text-white overflow-y-auto p-0 flex flex-col h-full" side="right">
        {selectedItem ? (
          <div className="flex flex-col h-full">
            <SheetHeader className="p-4 sm:p-6 border-b border-white/10 shrink-0">
              <SheetTitle className="text-left text-lg sm:text-xl font-semibold text-white">Product Details</SheetTitle>
            </SheetHeader>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
              <div className="aspect-square w-full overflow-hidden rounded-xl bg-zinc-900 border border-white/10 relative shrink-0">
                {selectedItem.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={selectedItem.imageUrl}
                    alt={selectedItem.title}
                    className="h-full w-full object-contain p-4"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-zinc-500">
                    No image
                  </div>
                )}
              </div>

              <div className="space-y-3 sm:space-y-4">
                <h2 className="text-base sm:text-lg font-medium leading-snug">{selectedItem.title}</h2>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    ${(selectedItem.priceUsdCents / 100).toFixed(2)}
                  </span>
                  <span className="text-sm text-zinc-400 font-medium">{selectedItem.currency ?? "USD"}</span>
                </div>

                {(selectedItem.condition || selectedItem.buyingOptions?.length) && (
                  <div className="flex flex-wrap gap-2">
                    {selectedItem.condition ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-white">
                        <Package className="w-3 h-3 text-indigo-400" />
                        {selectedItem.condition}
                      </span>
                    ) : null}
                    {selectedItem.buyingOptions?.map((option) => (
                      <span
                        key={option}
                        className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-zinc-900 px-2.5 py-1 text-[11px] sm:text-xs capitalize text-zinc-300 font-medium"
                      >
                        {option.replaceAll("_", " ")}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm py-4 border-y border-white/10">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">Source</span>
                  <span className="text-white capitalize font-medium text-sm">{selectedItem.source}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">Item ID</span>
                  <span className="text-white font-mono text-xs truncate opacity-70" title={selectedItem.externalId}>
                    {selectedItem.externalId}
                  </span>
                </div>
              </div>

              {selectedItem.shortDescription ? (
                <div className="space-y-2">
                  <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium">Quick summary</p>
                  <div className="rounded-2xl border border-white/10 bg-zinc-900/40 p-3 sm:p-4">
                    <p className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed">
                      {selectedItem.shortDescription}
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 sm:gap-4">
                {selectedItem.sellerUsername ? (
                  <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-zinc-900/40 p-3 sm:p-4">
                    <BadgeCheck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">Seller</p>
                      <p className="text-sm font-semibold text-white">{selectedItem.sellerUsername}</p>
                      {(selectedItem.sellerFeedbackPercent !== undefined ||
                        selectedItem.sellerFeedbackScore !== undefined) && (
                        <p className="text-xs text-zinc-400 mt-1 font-medium">
                          {selectedItem.sellerFeedbackPercent !== undefined
                            ? `${selectedItem.sellerFeedbackPercent.toFixed(1)}% positive`
                            : null}
                          {selectedItem.sellerFeedbackPercent !== undefined &&
                          selectedItem.sellerFeedbackScore !== undefined
                            ? " · "
                            : ""}
                          {selectedItem.sellerFeedbackScore !== undefined
                            ? `${selectedItem.sellerFeedbackScore.toLocaleString()} reviews`
                            : null}
                        </p>
                      )}
                    </div>
                  </div>
                ) : null}

                {selectedItem.shippingCostUsdCents !== undefined || selectedItem.itemLocation ? (
                  <div className="grid gap-3 sm:gap-4 rounded-2xl border border-white/10 bg-zinc-900/40 p-3 sm:p-4">
                    {selectedItem.shippingCostUsdCents !== undefined ? (
                      <div className="flex items-start gap-3">
                        <Truck className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">Shipping</p>
                          <p className="text-sm font-semibold text-white">
                            ${(selectedItem.shippingCostUsdCents / 100).toFixed(2)}{" "}
                            {selectedItem.shippingCurrency ?? "USD"}
                          </p>
                          <p className="text-[10px] sm:text-xs text-zinc-400 mt-1">Carrier options at checkout</p>
                        </div>
                      </div>
                    ) : null}

                    {selectedItem.itemLocation ? (
                      <div className="flex items-start gap-3 pt-3 sm:pt-4 border-t border-white/5">
                        <MapPin className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] sm:text-xs uppercase tracking-wider text-zinc-500 font-medium mb-1">Ships from</p>
                          <p className="text-sm font-medium text-white">{selectedItem.itemLocation}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            <div className="p-4 sm:p-6 border-t border-white/10 bg-zinc-950 shrink-0 mt-auto pb-8 sm:pb-6">
              <Button
                className="w-full h-11 sm:h-12 text-sm sm:text-base font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                onClick={() => {
                  if (selectedItem.affiliateUrl) {
                    window.open(
                      `/api/out?url=${encodeURIComponent(selectedItem.affiliateUrl)}`,
                      "_blank",
                      "noopener,noreferrer",
                    );
                  }
                }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on {selectedItem.source === "ebay" ? "eBay" : "Store"}
              </Button>
            </div>
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  );

  return (
    <>
      {pageContent}
      {productDetailSheet}
    </>
  );
}
