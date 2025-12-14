"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import webpush from "web-push";

type IntentResult = {
  intent: string;
  query: string;
  filters?: {
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
  needsClarification?: boolean;
  clarifyingQuestion?: string;
};

function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function parseJsonStrict<T>(raw: string): T {
  // Try strict JSON first
  try {
    return JSON.parse(raw) as T;
  } catch {
    // Common fallback: model wraps JSON in ```json ... ```
    const match = raw.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match?.[1]) return JSON.parse(match[1]) as T;
    throw new Error("Failed to parse model JSON output");
  }
}

/** Default timeout for OpenRouter API calls (ms). Configurable via OPENROUTER_TIMEOUT_MS env var. */
function getOpenRouterTimeoutMs(): number {
  const envVal = process.env.OPENROUTER_TIMEOUT_MS;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!Number.isNaN(parsed) && parsed > 0) return parsed;
  }
  return 30_000; // default 30s
}

/**
 * Fetch with an AbortController timeout. Throws a clear error on timeout.
 */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`OpenRouter request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function extractIntent(prompt: string): Promise<IntentResult> {
  const apiKey = getEnv("OPENROUTER_API_KEY");
  const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

  const system = [
    "You are an intent parser for a shopping assistant that helps a user shop like an expert store clerk.",
    "Return ONLY valid JSON (no markdown).",
    "Schema (all keys required unless marked optional):",
    "{",
    '  "intent": "product_search",',
    '  "query": "string",',
    '  "filters": {',
    '    "minPriceUsd"?: number,',
    '    "maxPriceUsd"?: number,',
    '    "condition"?: "new"|"used"|"refurbished",',
    '    "buyingFormat"?: "fixedPrice"|"auction",',
    '    "sort"?: "bestMatch"|"priceAsc"|"priceDesc"|"newlyListed",',
    '    "freeShippingOnly"?: boolean,',
    '    "returnsAcceptedOnly"?: boolean,',
    '    "itemLocationCountry"?: string,',
    '    "brand"?: string,',
    '    "categoryId"?: string',
    "  }",
    '  "needsClarification"?: boolean,',
    '  "clarifyingQuestion"?: string',
    "}",
    "Use itemLocationCountry='US' unless the user asks otherwise.",
    "If user gives a budget like '$500', map to maxPriceUsd.",
    "If you cannot form a good query (missing the product), set needsClarification=true and ask ONE short question.",
  ].join("\n");

  const timeoutMs = getOpenRouterTimeoutMs();
  const res = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          { role: "system", content: system },
          { role: "user", content: prompt },
        ],
        response_format: { type: "json_object" },
      }),
    },
    timeoutMs,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenRouter returned no content");

  const parsed = parseJsonStrict<IntentResult>(content);
  if (parsed.needsClarification) {
    if (!parsed.clarifyingQuestion) parsed.clarifyingQuestion = "What product are you looking for?";
    if (!parsed.query) parsed.query = "";
    if (!parsed.intent) parsed.intent = "product_search";
    return parsed;
  }
  if (!parsed.query || typeof parsed.query !== "string") throw new Error("Model intent output missing query");
  if (!parsed.intent) parsed.intent = "product_search";
  return parsed;
}

type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

function buildHistoryForModel(args: { messages: Array<{ role: string; content: string }>; maxTurns: number }): ChatMessage[] {
  // Keep the last N user/assistant messages (system messages aren't helpful to replay).
  const ua = args.messages.filter((m) => m.role === "user" || m.role === "assistant");
  const sliced = ua.slice(-Math.max(1, args.maxTurns * 2));
  return sliced.map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

function stripMarkdown(input: string): string {
  let s = input;
  // unwrap fenced code blocks
  s = s.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1");
  // headings -> plain
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  // bullets -> plain bullets (not markdown)
  s = s.replace(/^\s*[-*+]\s+/gm, "• ");
  // numbered list "1." -> "1) "
  s = s.replace(/^\s*(\d+)\.\s+/gm, "$1) ");
  // links [text](url) -> text (url)
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
  // emphasis / inline code markers
  s = s.replace(/[*_~`]/g, "");
  // collapse extra blank lines
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
}

async function generateAssistantReply(input: {
  prompt: string;
  history: ChatMessage[];
  intent: IntentResult;
  items: Array<{ title: string; priceUsdCents: number; externalId: string; affiliateUrl?: string }>;
}): Promise<string> {
  const apiKey = getEnv("OPENROUTER_API_KEY");
  const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

  const itemLines = input.items.slice(0, 8).map((i) => {
    const price = `$${(i.priceUsdCents / 100).toFixed(2)}`;
    return `- ${i.title} (${price}) [id:${i.externalId}]`;
  });

  const system = [
    "You are SendCat's shopping concierge and freight-forwarding assistant for Jamaican shoppers.",
    "Be conversational and helpful like a store clerk.",
    "Use the conversation history to understand what the user means.",
    "You have already searched eBay and must summarize results and ask 1-2 smart follow-up questions if helpful.",
    "Do not mention internal tool calls or JSON.",
    "IMPORTANT: Output plain text only. Do not use Markdown formatting (no # headings, no bullet '-' lists, no **bold**, no backticks).",
    "If you include lists, use short sentences separated by line breaks, and use the '•' character for bullets.",
  ].join("\n");

  const context = [
    `User request (latest): ${input.prompt}`,
    `Parsed intent: ${input.intent.intent}`,
    `Search query used: ${input.intent.query}`,
    `Filters: ${JSON.stringify(input.intent.filters ?? {})}`,
    "Top eBay results:",
    ...itemLines,
  ].join("\n");

  const timeoutMs = getOpenRouterTimeoutMs();
  const res = await fetchWithTimeout(
    `${baseUrl}/chat/completions`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.6,
        messages: [{ role: "system", content: system }, ...input.history, { role: "user", content: context }],
      }),
    },
    timeoutMs,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter reply error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  const raw = json.choices?.[0]?.message?.content?.trim() || "Here are a few good options I found.";
  return stripMarkdown(raw);
}

export const runAgentJob = internalAction({
  args: { jobId: v.id("agentJobs") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const job = await ctx.runQuery(api.queries.agentJobs.getJob, { jobId: args.jobId });
    if (!job) {
      return null;
    }
    const threadId = job.threadId;
    if (!threadId) {
      await ctx.runMutation(internal.mutations.agentJobs.setJobFailed, {
        jobId: args.jobId,
        completedAt: Date.now(),
        error: "Missing threadId on job",
      });
      return null;
    }

    await ctx.runMutation(internal.mutations.agentJobs.setJobRunning, { jobId: args.jobId, startedAt: now });
    await ctx.runMutation(internal.mutations.agentJobs.appendSystemMessage, {
      jobId: args.jobId,
      threadId,
      content: "Analyzing your request…",
      createdAt: now,
    });

    try {
      const threadMessages: Array<{ role: "user" | "assistant" | "system"; content: string }> =
        await ctx.runQuery(api.queries.agentJobs.listThreadMessages, { threadId });
      const history = buildHistoryForModel({
        messages: threadMessages.map((m) => ({ role: m.role, content: m.content })),
        maxTurns: 6,
      });

      // Use conversation history for intent extraction by concatenating a compact recap.
      const recap = history
        .slice(-6)
        .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
        .join("\n");
      const intent = await extractIntent(`Conversation:\n${recap}\n\nLatest user message:\n${job.prompt}`);

      if (intent.needsClarification) {
        await ctx.runMutation(internal.mutations.agentJobs.appendAssistantMessage, {
          jobId: args.jobId,
          threadId,
          content: intent.clarifyingQuestion ?? "What product are you looking for?",
          createdAt: Date.now(),
        });
        await ctx.runMutation(internal.mutations.agentJobs.setJobCompleted, {
          jobId: args.jobId,
          completedAt: Date.now(),
          intent,
          resultItemIds: [],
        });
        return null;
      }

      await ctx.runMutation(internal.mutations.agentJobs.appendSystemMessage, {
        jobId: args.jobId,
        threadId,
        content: `Searching eBay for: ${intent.query}`,
        createdAt: Date.now(),
      });

      const search = await ctx.runAction(api.actions.search.searchSource, {
        source: "ebay",
        query: intent.query,
        filters: intent.filters ?? { itemLocationCountry: "US", sort: "bestMatch" },
        limit: 24,
        offset: 0,
      });

      const itemIds = search.items.map((i) => i.itemId as Id<"items">);

      const assistantMessage = await generateAssistantReply({
        prompt: job.prompt,
        history,
        intent,
        items: search.items.map((i) => ({
          title: i.title,
          priceUsdCents: i.priceUsdCents,
          externalId: i.externalId,
          affiliateUrl: i.affiliateUrl,
        })),
      });

      await ctx.runMutation(internal.mutations.agentJobs.appendAssistantMessage, {
        jobId: args.jobId,
        threadId,
        content: assistantMessage,
        createdAt: Date.now(),
      });

      await ctx.runMutation(internal.mutations.agentJobs.setJobCompleted, {
        jobId: args.jobId,
        completedAt: Date.now(),
        intent,
        resultItemIds: itemIds,
      });

      // Push notify (best effort) — handle errors locally so they don't fail the job.
      const payload = {
        title: "SendCat: Results ready",
        body: `Tap to view results for: ${intent.query}`,
        url: `/app?agent=1&jobId=${args.jobId}`,
      };
      const sub = await ctx.runQuery(internal.queries.pushSubscriptions.getLatestForSession, {
        sessionId: job.sessionId,
      });
      if (sub) {
        try {
          const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
          const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
          const vapidSubject = process.env.VAPID_SUBJECT;
          if (vapidPublicKey && vapidPrivateKey && vapidSubject) {
            webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              JSON.stringify(payload),
            );
          }
        } catch (err: unknown) {
          // Log the push failure, including context so we can debug subscription problems.
          // Do not rethrow — notifications are best-effort.
          const msg = err instanceof Error ? err.message : String(err);
          // eslint-disable-next-line no-console
          console.error("Push notification failed", {
            sessionId: job.sessionId,
            endpoint: sub.endpoint,
            error: msg,
          });

          // If the error indicates the subscription is gone/unsubscribed (HTTP 410/404),
          // attempt to remove the stale subscription row so we don't keep trying it.
          const statusCode = (err as any)?.statusCode ?? (err as any)?.status;
          if (statusCode === 410 || statusCode === 404) {
            try {
              await ctx.runMutation(internal.mutations.pushSubscriptions.deleteByEndpoint, {
                endpoint: sub.endpoint,
              });
            } catch (delErr: unknown) {
              // eslint-disable-next-line no-console
              console.error("Failed to remove stale push subscription", {
                endpoint: sub.endpoint,
                error: delErr instanceof Error ? delErr.message : String(delErr),
              });
            }
          }
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Agent job failed";
      await ctx.runMutation(internal.mutations.agentJobs.appendAssistantMessage, {
        jobId: args.jobId,
        threadId,
        content: `Sorry — I couldn't complete that request.\n\nError: ${message}`,
        createdAt: Date.now(),
      });
      await ctx.runMutation(internal.mutations.agentJobs.setJobFailed, {
        jobId: args.jobId,
        completedAt: Date.now(),
        error: message,
      });
    }

    return null;
  },
});


