"use node";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
const GEMINI_FLASH_MODEL = "google/gemini-2.0-flash-exp";

export type VisionAnalysis = {
  productName: string;
  brand?: string;
  color?: string;
  size?: string;
  condition?: string;
  category?: string;
  confidence: number;
  additionalDetails?: string;
  suggestedSearchTerms?: string[];
};

export async function analyzeImage(imageUrl: string): Promise<VisionAnalysis> {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OPENROUTER_API_KEY not configured");
  }

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GEMINI_FLASH_MODEL,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this product image and return a JSON response with the following structure:
{
  "productName": "exact product name",
  "brand": "brand name if visible (optional)",
  "color": "color if visible (optional)",
  "size": "size/dimensions if visible (optional)",
  "condition": "condition if apparent (new/used/damaged) (optional)",
  "category": "broad category (clothing, electronics, home, beauty, sports, etc.)",
  "confidence": "your confidence in identification (0-100)",
  "additionalDetails": "any other relevant observations",
  "suggestedSearchTerms": ["term1", "term2", "term3"]
}

Be specific and accurate. If uncertain, set confidence lower.`,
            },
            {
              type: "image_url",
              image_url: imageUrl,
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 500,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`Gemini Vision API failed (${response.status}): ${errorText}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{
      message?: { content?: string };
    }>;
  };

  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("Gemini Vision API returned no content");
  }

  const parsed = JSON.parse(content) as VisionAnalysis;

  return {
    productName: parsed.productName || "Unknown Product",
    brand: parsed.brand,
    color: parsed.color,
    size: parsed.size,
    condition: parsed.condition,
    category: parsed.category,
    confidence: parsed.confidence ?? 50,
    additionalDetails: parsed.additionalDetails,
    suggestedSearchTerms: parsed.suggestedSearchTerms || [],
  };
}

export function generateSearchQueriesFromImage(visionResult: VisionAnalysis): string[] {
  const queries: string[] = [];

  const baseQuery = visionResult.productName;

  if (visionResult.brand) {
    queries.push(`${visionResult.brand} ${baseQuery}`);
    queries.push(baseQuery);
    queries.push(`${visionResult.brand} ${visionResult.category || "product"}`);
  } else {
    queries.push(baseQuery);
  }

  if (visionResult.color) {
    queries.push(`${baseQuery} ${visionResult.color}`);
  }

  if (visionResult.size) {
    queries.push(`${baseQuery} size ${visionResult.size}`);
  }

  if (visionResult.condition && visionResult.condition !== "new") {
    queries.push(`${baseQuery} ${visionResult.condition}`);
  }

  if (visionResult.suggestedSearchTerms && visionResult.suggestedSearchTerms.length > 0) {
    queries.push(...visionResult.suggestedSearchTerms);
  }

  return [...new Set(queries)].slice(0, 8);
}
