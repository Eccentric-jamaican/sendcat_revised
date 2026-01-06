"use node";

const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_BASE_URL = "https://api.exa.ai";

export type ExaSearchOptions = {
  query: string;
  numResults?: number;
  highlights?: boolean;
  contents?: {
    text?: boolean;
    maxCharacters?: number;
    summary?: boolean;
  };
  category?: "company" | "research paper" | "news" | "pdf" | "github" | "tweet" | "personal site" | "financial report" | "people";
  type?: "auto" | "neural" | "fast" | "deep";
  includeDomains?: string[];
  excludeDomains?: string[];
  includeText?: string[];
  excludeText?: string[];
  userLocation?: string;
  useAutoprompt?: boolean;
};

export type ExaSearchResult = {
  title: string;
  url: string;
  publishedDate?: string;
  author?: string;
  id: string;
  score?: number;
  highlights?: Array<{
    text: string;
    query?: string;
  }>;
  text?: string;
  image?: string;
  price?: string;
  currency?: string;
};

export async function searchExa(options: ExaSearchOptions): Promise<ExaSearchResult[]> {
  if (!EXA_API_KEY) {
    throw new Error("EXA_API_KEY not configured");
  }

  const response = await fetch(`${EXA_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "x-api-key": EXA_API_KEY,
      "Content-Type": "application/json",
    } as Record<string, string>,
    body: JSON.stringify({
      query: options.query,
      numResults: options.numResults ?? 10,
      highlights: options.highlights ?? true,
      contents: options.contents ?? { text: true, maxCharacters: 3000 },
      category: options.category,
      type: options.type ?? "auto",
      includeDomains: options.includeDomains,
      excludeDomains: options.excludeDomains,
      includeText: options.includeText,
      excludeText: options.excludeText,
      userLocation: options.userLocation,
      useAutoprompt: options.useAutoprompt ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Exa API failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    results?: ExaSearchResult[];
  };

  return data.results ?? [];
}

export async function searchAndContents(options: ExaSearchOptions): Promise<{
  results: ExaSearchResult[];
}> {
  if (!EXA_API_KEY) {
    throw new Error("EXA_API_KEY not configured");
  }

  const response = await fetch(`${EXA_BASE_URL}/search`, {
    method: "POST",
    headers: {
      "x-api-key": EXA_API_KEY,
      "Content-Type": "application/json",
    } as Record<string, string>,
    body: JSON.stringify({
      query: options.query,
      numResults: options.numResults ?? 10,
      highlights: options.highlights ?? true,
      contents: options.contents ?? { text: true, maxCharacters: 3000 },
      category: options.category,
      type: options.type ?? "auto",
      includeDomains: options.includeDomains,
      excludeDomains: options.excludeDomains,
      includeText: options.includeText,
      excludeText: options.excludeText,
      userLocation: options.userLocation,
      useAutoprompt: options.useAutoprompt ?? true,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Exa API failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    results?: ExaSearchResult[];
  };

  return {
    results: data.results ?? [],
  };
}

export function extractAffiliateUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    const affiliatePatterns: Array<{ domains: string[]; pattern: RegExp; replacement: string }> = [
      {
        domains: ["amazon.com", "www.amazon.com"],
        pattern: /amazon\.com\/.*\/([A-Z0-9]{10})/,
        replacement: "https://www.amazon.com/dp/$1?tag=sendcat-20",
      },
      {
        domains: ["ebay.com", "www.ebay.com", "ebay.com"],
        pattern: /ebay\.com\/itm\/([A-Za-z0-9-]+)/,
        replacement: "https://rover.ebay.com/rover/1/711-53200-1/2?mpre=https%3A%2F%2Fwww.ebay.com%2Fitm%2F$1&toolid=10001&campid=533802690&customid=sendcat",
      },
    ];

    const affiliateConfig = affiliatePatterns.find((config) =>
      config.domains.some((d) => hostname.includes(d))
    );

    if (affiliateConfig) {
      return url.replace(affiliateConfig.pattern, affiliateConfig.replacement);
    }

    return null;
  } catch {
    return null;
  }
}

export function normalizeExaResults(results: ExaSearchResult[]): Array<{
  title: string;
  url: string;
  affiliateUrl: string | null;
  price?: string;
  imageUrl?: string;
  source: "exa";
  publishedDate?: string;
  author?: string;
  score?: number;
  highlights?: string[];
}> {
  return results.map((result) => {
    const affiliateUrl = extractAffiliateUrl(result.url);

    // Heuristic: Try to find price in text if missing
    let price = result.price;
    if (!price && result.text) {
      const priceMatch = result.text.match(/\$\s?(\d{1,5}(\.\d{2})?)/);
      if (priceMatch) price = priceMatch[0];
    }

    return {
      title: result.title,
      url: result.url,
      affiliateUrl,
      source: "exa",
      publishedDate: result.publishedDate,
      author: result.author,
      score: result.score,
      highlights: result.highlights?.map((h) => h.text) || [],
      price,
      imageUrl: result.image,
    };
  });
}

/**
 * Convenience function for searching ecommerce products across major platforms
 * using Exa's path filtering and neural search.
 */
export async function searchEcommerceProducts(params: {
  query: string;
  numResults?: number;
  platforms?: ("amazon" | "ebay" | "etsy" | "ikea" | "walmart")[];
}): Promise<ReturnType<typeof normalizeExaResults>> {
  const domainMap: Record<string, string> = {
    amazon: "amazon.com/dp",
    ebay: "ebay.com/itm",
    etsy: "etsy.com/listing",
    ikea: "ikea.com",
    walmart: "walmart.com/ip",
  };

  const includeDomains = params.platforms
    ? params.platforms.map((p) => domainMap[p]).filter(Boolean)
    : ["amazon.com/dp", "ebay.com/itm"]; // Default to big two

  const results = await searchExa({
    query: params.query,
    numResults: params.numResults ?? 10,
    type: "auto",
    category: "company",
    includeDomains,
    useAutoprompt: true,
    contents: { text: true, maxCharacters: 1000 },
  });

  return normalizeExaResults(results);
}
