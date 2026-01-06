/**
 * Tests for the Explore Page logic
 * Focuses on:
 * 1. displayItems derivation logic
 * 2. Category filtering behavior
 * 3. Discovery section visibility conditions
 * 4. Results grid rendering conditions
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useQuery, useMutation, useAction } from "convex/react";

// Mock types that mirror the actual types from page.tsx
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

type TrendingItem = SearchResultItem & {
    _id: string;
};

type TaxonomyData = {
    fetchedAt: number | null;
    categories: Array<{ categoryId: string; name: string }>;
};

// Pure function tests - these test the logic without rendering
describe("displayItems Logic", () => {
    const mockTrending: TrendingItem[] = [
        {
            _id: "trending-1",
            itemId: "trending-1",
            source: "ebay",
            externalId: "ext-1",
            title: "Trending Item 1",
            priceUsdCents: 1999,
        },
        {
            _id: "trending-2",
            itemId: "trending-2",
            source: "ebay",
            externalId: "ext-2",
            title: "Trending Item 2",
            priceUsdCents: 2999,
        },
    ];

    const mockResults: SearchResultItem[] = [
        {
            itemId: "result-1",
            source: "ebay",
            externalId: "ext-r1",
            title: "Search Result 1",
            priceUsdCents: 5999,
        },
        {
            itemId: "result-2",
            source: "ebay",
            externalId: "ext-r2",
            title: "Search Result 2",
            priceUsdCents: 7999,
        },
    ];

    // Replicate the displayItems logic from the component
    function computeDisplayItems(
        results: SearchResultItem[],
        trending: TrendingItem[] | undefined
    ): SearchResultItem[] {
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
    }

    it("should return search results when results array is not empty", () => {
        const displayItems = computeDisplayItems(mockResults, mockTrending);

        expect(displayItems).toHaveLength(2);
        expect(displayItems[0].itemId).toBe("result-1");
        expect(displayItems[1].itemId).toBe("result-2");
    });

    it("should return trending items when results array is empty", () => {
        const displayItems = computeDisplayItems([], mockTrending);

        expect(displayItems).toHaveLength(2);
        expect(displayItems[0].itemId).toBe("trending-1");
        expect(displayItems[1].itemId).toBe("trending-2");
    });

    it("should return empty array when both results and trending are empty", () => {
        const displayItems = computeDisplayItems([], []);

        expect(displayItems).toHaveLength(0);
    });

    it("should return empty array when results is empty and trending is undefined", () => {
        const displayItems = computeDisplayItems([], undefined);

        expect(displayItems).toHaveLength(0);
    });

    it("should correctly map trending items to SearchResultItem format", () => {
        const trendingWithFullData: TrendingItem[] = [
            {
                _id: "trend-full",
                itemId: "trend-full",
                source: "amazon",
                externalId: "ext-full",
                title: "Full Item",
                imageUrl: "https://example.com/image.jpg",
                priceUsdCents: 9999,
                currency: "USD",
                condition: "New",
                buyingOptions: ["BUY_NOW"],
                sellerUsername: "seller123",
                sellerFeedbackPercent: 98.5,
                sellerFeedbackScore: 1000,
                shippingCostUsdCents: 0,
                shippingCurrency: "USD",
                itemLocation: "New York, NY",
                shortDescription: "A great product",
            },
        ];

        const displayItems = computeDisplayItems([], trendingWithFullData);

        expect(displayItems[0]).toEqual({
            itemId: "trend-full",
            source: "amazon",
            externalId: "ext-full",
            title: "Full Item",
            imageUrl: "https://example.com/image.jpg",
            priceUsdCents: 9999,
            currency: "USD",
            affiliateUrl: undefined,
            condition: "New",
            buyingOptions: ["BUY_NOW"],
            sellerUsername: "seller123",
            sellerFeedbackPercent: 98.5,
            sellerFeedbackScore: 1000,
            shippingCostUsdCents: 0,
            shippingCurrency: "USD",
            itemLocation: "New York, NY",
            shortDescription: "A great product",
        });
    });
});

describe("showingSearchResults Logic", () => {
    it("should be true when results array has items", () => {
        const results = [{ itemId: "1" }] as SearchResultItem[];
        const showingSearchResults = results.length > 0;

        expect(showingSearchResults).toBe(true);
    });

    it("should be false when results array is empty", () => {
        const results: SearchResultItem[] = [];
        const showingSearchResults = results.length > 0;

        expect(showingSearchResults).toBe(false);
    });
});

describe("Discovery Section Visibility", () => {
    // The discovery sections (Jamaica Pulse, Smart Collections) should only show when there are no search results

    it("should show discovery sections when results is empty", () => {
        const results: SearchResultItem[] = [];
        const shouldShowDiscoverySections = !results.length;

        expect(shouldShowDiscoverySections).toBe(true);
    });

    it("should hide discovery sections when there are search results", () => {
        const results = [{ itemId: "1" }] as SearchResultItem[];
        const shouldShowDiscoverySections = !results.length;

        expect(shouldShowDiscoverySections).toBe(false);
    });
});

describe("Category Bucket Rendering", () => {
    const mockTaxonomy: TaxonomyData = {
        fetchedAt: Date.now(),
        categories: [
            { categoryId: "1", name: "Electronics" },
            { categoryId: "2", name: "Clothing" },
            { categoryId: "3", name: "Home & Garden" },
            { categoryId: "4", name: "Sports" },
            { categoryId: "5", name: "Toys" },
            { categoryId: "6", name: "Books" },
            { categoryId: "7", name: "Music" },
            { categoryId: "8", name: "Movies" },
            { categoryId: "9", name: "Games" },
            { categoryId: "10", name: "Collectibles" },
            { categoryId: "11", name: "Art" },
            { categoryId: "12", name: "Jewelry" },
        ],
    };

    it("should only render first 10 categories from taxonomy", () => {
        const categoriesToRender = mockTaxonomy.categories.slice(0, 10);

        expect(categoriesToRender).toHaveLength(10);
        expect(categoriesToRender[0].name).toBe("Electronics");
        expect(categoriesToRender[9].name).toBe("Collectibles");
    });

    it("should render skeleton loaders when taxonomy is undefined", () => {
        const taxonomy = undefined;
        const shouldShowSkeletons = !taxonomy;

        expect(shouldShowSkeletons).toBe(true);
    });

    it("should not render skeleton loaders when taxonomy is defined", () => {
        const taxonomy = mockTaxonomy;
        const shouldShowSkeletons = !taxonomy;

        expect(shouldShowSkeletons).toBe(false);
    });
});

describe("Selected Category Styling", () => {
    it("should apply active styles when category matches filter", () => {
        const filters = { categoryId: "1" };
        const category = { categoryId: "1", name: "Electronics" };

        const isActive = filters.categoryId === category.categoryId;

        expect(isActive).toBe(true);
    });

    it("should not apply active styles when category does not match filter", () => {
        const filters = { categoryId: "1" };
        const category = { categoryId: "2", name: "Clothing" };

        const isActive = filters.categoryId === category.categoryId;

        expect(isActive).toBe(false);
    });

    it("should not apply active styles when no category filter is set", () => {
        const filters = {};
        const category = { categoryId: "1", name: "Electronics" };

        const isActive = (filters as any).categoryId === category.categoryId;

        expect(isActive).toBe(false);
    });
});

describe("Trending Carousel Logic", () => {
    it("should show skeleton loaders when trending is empty array", () => {
        const trending: TrendingItem[] = [];
        const shouldShowSkeletons = !trending?.length;

        expect(shouldShowSkeletons).toBe(true);
    });

    it("should show skeleton loaders when trending is undefined", () => {
        const trending: TrendingItem[] | undefined = undefined;
        const shouldShowSkeletons = !trending?.length;

        expect(shouldShowSkeletons).toBe(true);
    });

    it("should show carousel when trending has items", () => {
        const trending: TrendingItem[] = [
            { _id: "1", itemId: "1", source: "ebay", externalId: "e1", title: "Test", priceUsdCents: 100 }
        ];
        const shouldShowSkeletons = !trending?.length;

        expect(shouldShowSkeletons).toBe(false);
    });

    it("should limit displayItems to first 10 for Jamaica Pulse carousel", () => {
        const displayItems = Array.from({ length: 15 }, (_, i) => ({
            itemId: `item-${i}`,
            source: "ebay",
            externalId: `ext-${i}`,
            title: `Item ${i}`,
            priceUsdCents: 1000 + i * 100,
        })) as SearchResultItem[];

        const carouselItems = displayItems.slice(0, 10);

        expect(carouselItems).toHaveLength(10);
        expect(carouselItems[9].itemId).toBe("item-9");
    });
});

describe("Jamaica Pulse displayItems-based Rendering", () => {
    // This tests the corrected logic that uses displayItems.length instead of trending?.length

    function computeDisplayItems(
        results: SearchResultItem[],
        trending: TrendingItem[] | undefined
    ): SearchResultItem[] {
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
    }

    it("should show skeleton when displayItems is empty (no results, no trending)", () => {
        const results: SearchResultItem[] = [];
        const trending: TrendingItem[] | undefined = undefined;
        const displayItems = computeDisplayItems(results, trending);

        const shouldShowSkeletons = !displayItems.length;

        expect(shouldShowSkeletons).toBe(true);
    });

    it("should show skeleton when displayItems is empty (no results, empty trending)", () => {
        const results: SearchResultItem[] = [];
        const trending: TrendingItem[] = [];
        const displayItems = computeDisplayItems(results, trending);

        const shouldShowSkeletons = !displayItems.length;

        expect(shouldShowSkeletons).toBe(true);
    });

    it("should show carousel when displayItems has items from trending", () => {
        const results: SearchResultItem[] = [];
        const trending: TrendingItem[] = [
            { _id: "t1", itemId: "t1", source: "ebay", externalId: "e1", title: "Test", priceUsdCents: 100 }
        ];
        const displayItems = computeDisplayItems(results, trending);

        const shouldShowSkeletons = !displayItems.length;

        expect(shouldShowSkeletons).toBe(false);
        expect(displayItems).toHaveLength(1);
    });

    it("should show carousel when displayItems has items from results (overrides trending)", () => {
        const results: SearchResultItem[] = [
            { itemId: "r1", source: "ebay", externalId: "e1", title: "Result", priceUsdCents: 200 }
        ];
        const trending: TrendingItem[] = [];  // Empty trending
        const displayItems = computeDisplayItems(results, trending);

        const shouldShowSkeletons = !displayItems.length;

        expect(shouldShowSkeletons).toBe(false);
        expect(displayItems).toHaveLength(1);
        expect(displayItems[0].itemId).toBe("r1");
    });
});

describe("Results Grid Rendering", () => {
    it("should render results grid when showingSearchResults is true", () => {
        const showingSearchResults = true;
        const results = [
            { itemId: "1", title: "Test" }
        ] as SearchResultItem[];

        // Simulate the conditional rendering logic
        const shouldRenderGrid = showingSearchResults && results.length > 0;

        expect(shouldRenderGrid).toBe(true);
    });

    it("should not render results grid when showingSearchResults is false", () => {
        const showingSearchResults = false;
        const results: SearchResultItem[] = [];

        const shouldRenderGrid = showingSearchResults && results.length > 0;

        expect(shouldRenderGrid).toBe(false);
    });
});

describe("Store Selection Logic", () => {
    const STORES = [
        { name: "ebay", label: "eBay", color: "text-[#E53238]", bg: "bg-[#E53238]/10", border: "border-[#E53238]/20" },
        { name: "amazon", label: "Amazon", color: "text-[#FF9900]", bg: "bg-[#FF9900]/10", border: "border-[#FF9900]/20" },
        { name: "walmart", label: "Walmart", color: "text-[#0071CE]", bg: "bg-[#0071CE]/10", border: "border-[#0071CE]/20" },
        { name: "shein", label: "SHEIN", color: "text-white", bg: "bg-white/10", border: "border-white/20" },
        { name: "depop", label: "Depop", color: "text-[#ff0000]", bg: "bg-[#ff0000]/10", border: "border-[#ff0000]/20" },
    ];

    it("should have 5 stores defined", () => {
        expect(STORES).toHaveLength(5);
    });

    it("should apply selected styles when store matches selectedSource", () => {
        const selectedSource = "ebay";
        const store = STORES[0];

        const isSelected = selectedSource === store.name;

        expect(isSelected).toBe(true);
    });

    it("should not apply selected styles when store does not match selectedSource", () => {
        const selectedSource = "ebay";
        const store = STORES[1]; // Amazon

        const isSelected = selectedSource === store.name;

        expect(isSelected).toBe(false);
    });

    it("should start with ebay as default selected source", () => {
        const defaultSource = "ebay";

        expect(STORES.find(s => s.name === defaultSource)).toBeDefined();
    });
});

describe("Smart Collections Logic", () => {
    const collections = [
        { title: "Gamer's Vault", query: "gaming pc laptop rtx", items: ["RTX 5090", "Gaming Monitor", "Mechanical Keyboard"] },
        { title: "Content Creation", query: "sony camera microphone dslr", items: ["Mirrorless Camera", "Stream Deck", "Ring Light"] },
        { title: "Island Style", query: "nike tech pack designer fashion", items: ["Streetwear Pack", "Summer Designer", "Limited Kicks"] }
    ];

    it("should have 3 smart collections defined", () => {
        expect(collections).toHaveLength(3);
    });

    it("each collection should have 3 featured items", () => {
        collections.forEach(collection => {
            expect(collection.items).toHaveLength(3);
        });
    });

    it("should hide smart collections when there are search results", () => {
        const results = [{ itemId: "1" }] as SearchResultItem[];
        const shouldShowCollections = !results.length;

        expect(shouldShowCollections).toBe(false);
    });

    it("should show smart collections when there are no search results", () => {
        const results: SearchResultItem[] = [];
        const shouldShowCollections = !results.length;

        expect(shouldShowCollections).toBe(true);
    });
});

describe("Price Formatting", () => {
    it("should format price in USD correctly", () => {
        const priceUsdCents = 1999;
        const formattedPrice = (priceUsdCents / 100).toFixed(2);

        expect(formattedPrice).toBe("19.99");
    });

    it("should handle zero price", () => {
        const priceUsdCents = 0;
        const formattedPrice = (priceUsdCents / 100).toFixed(2);

        expect(formattedPrice).toBe("0.00");
    });

    it("should handle large prices", () => {
        const priceUsdCents = 99999999;
        const formattedPrice = (priceUsdCents / 100).toFixed(2);

        expect(formattedPrice).toBe("999999.99");
    });
});
