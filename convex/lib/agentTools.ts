"use node";

export const AGENT_TOOLS = [
    {
        type: "function",
        function: {
            name: "search_ebay",
            description: "Search for products on eBay using high-quality structured data. Best for common items, electronics, and clothing where exact pricing and condition (new/used) are important.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The product to search for" },
                    minPrice: { type: "number", description: "Minimum price in USD" },
                    maxPrice: { type: "number", description: "Maximum price in USD" },
                    condition: {
                        type: "string",
                        enum: ["new", "used", "refurbished"],
                        description: "Filter by item condition"
                    },
                    sort: {
                        type: "string",
                        enum: ["bestMatch", "priceAsc", "priceDesc", "newlyListed"],
                        description: "Sort order for results"
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "search_exa",
            description: "Adaptive web search for products. Best for official brand sites (Nvidia, Apple), Amazon, Walmart, or niche stores. Can target specific domains.",
            parameters: {
                type: "object",
                properties: {
                    query: { type: "string", description: "The product to search for" },
                    includeDomains: {
                        type: "array",
                        items: { type: "string" },
                        description: "Specific domains to target (e.g. ['nvidia.com', 'amazon.com'])"
                    },
                    searchStrategy: {
                        type: "string",
                        enum: ["marketplace", "specialized", "broad"],
                        description: "Level of search depth. 'broad' is best for rare items."
                    }
                },
                required: ["query"]
            }
        }
    },
    {
        type: "function",
        function: {
            name: "estimate_landed_cost",
            description: "Calculate the total cost to get a product to Jamaica, including shipping, duties (CIF), and GCT.",
            parameters: {
                type: "object",
                properties: {
                    productPriceUsd: { type: "number", description: "The price of the item in USD" },
                    weightLbs: { type: "number", description: "Estimated weight in pounds (guess if unknown, e.g. laptop=5lbs, t-shirt=0.5lbs)" },
                    category: {
                        type: "string",
                        enum: ["electronics", "clothing", "tools", "auto_parts", "general"],
                        description: "Broad category for duty calculation"
                    }
                },
                required: ["productPriceUsd", "weightLbs"]
            }
        }
    }
];

interface SearchResultItem {
    title: string;
    priceUsdCents: number;
    affiliateUrl?: string;
    url?: string;
    source: string;
    externalId?: string;
    itemId?: string;
}

export function normalizeToolOutput(toolName: string, data: { items?: SearchResultItem[] } | Record<string, unknown>) {
    switch (toolName) {
        case "search_ebay":
        case "search_exa": {
            const results = data as { items?: SearchResultItem[] };
            return {
                items: results.items?.slice(0, 10).map((i) => ({
                    title: i.title,
                    price: (i.priceUsdCents / 100).toFixed(2),
                    url: i.affiliateUrl || i.url,
                    source: i.source,
                    id: i.externalId || i.itemId
                })) || []
            };
        }
        case "estimate_landed_cost":
            return data;
        default:
            return data;
    }
}
