"use node";

import { v } from "convex/values";
import { internalAction } from "../_generated/server";
import { api, internal } from "../_generated/api";
import type { Id } from "../_generated/dataModel";
import webpush from "web-push";
import { AGENT_TOOLS, normalizeToolOutput } from "../lib/agentTools";

type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

type AgentResponse = {
  content: string | null;
  tool_calls?: ToolCall[];
};

type ChatMessage =
  | { role: "system"; content: string }
  | { role: "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: ToolCall[] }
  | { role: "tool"; tool_call_id: string; name: string; content: string };



function getEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
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

function historyToOpenRouter(messages: Array<{ role: string; content: string }>): ChatMessage[] {
  return messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
}

async function callOpenRouter(messages: ChatMessage[], tools: Record<string, unknown>[]): Promise<AgentResponse> {
  const apiKey = getEnv("OPENROUTER_API_KEY");
  const baseUrl = process.env.OPENROUTER_BASE_URL ?? "https://openrouter.ai/api/v1";
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini";

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
        messages,
        tools,
        tool_choice: "auto",
      }),
    },
    timeoutMs,
  );

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`OpenRouter error (${res.status}): ${text}`);
  }

  const json = (await res.json()) as {
    choices?: Array<{ message?: AgentResponse }>;
  };
  const response = json.choices?.[0]?.message;
  if (!response) throw new Error("OpenRouter returned no content");

  return response;
}

function stripMarkdown(input: string): string {
  let s = input;
  s = s.replace(/```(?:json)?\s*([\s\S]*?)\s*```/gi, "$1");
  s = s.replace(/^\s{0,3}#{1,6}\s+/gm, "");
  s = s.replace(/^\s*[-*+]\s+/gm, "• ");
  s = s.replace(/^\s*(\d+)\.\s+/gm, "$1) ");
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");
  s = s.replace(/[*_~`]/g, "");
  s = s.replace(/\n{3,}/g, "\n\n");
  return s.trim();
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

      const history: ChatMessage[] = [
        {
          role: "system",
          content: [
            "You are SendCat's autonomous shopping concierge for Jamaica.",
            "Your goal is to find products and calculate their TOTAL LANDED COST to Jamaica.",
            "Workflow:",
            "1. Search marketplaces (eBay for structure, Exa for broad web/Amazon/Nvidia).",
            "2. If results are found, always call 'estimate_landed_cost' for the best options.",
            "3. Finally, give a conversational helpful reply with '•' bullets and no markdown.",
            "If the user is vague, call a search tool anyway to see what's out there, or ask a clarifying question.",
          ].join("\n")
        },
        ...historyToOpenRouter(threadMessages),
        { role: "user", content: job.prompt }
      ];

      let iterations = 0;
      const MAX_ITERATIONS = 5;
      const finalResultItemIds: Id<"items">[] = [];

      while (iterations < MAX_ITERATIONS) {
        iterations++;
        const response = await callOpenRouter(history, AGENT_TOOLS);

        if (response.tool_calls) {
          history.push({ role: "assistant", content: response.content, tool_calls: response.tool_calls });

          for (const toolCall of response.tool_calls) {
            const toolArgs = JSON.parse(toolCall.function.arguments);
            let toolResult;

            if (toolCall.function.name === "search_ebay") {
              await ctx.runMutation(internal.mutations.agentJobs.appendSystemMessage, {
                jobId: args.jobId, threadId, content: `Searching eBay for: ${toolArgs.query}`, createdAt: Date.now()
              });
              const search = await ctx.runAction(api.actions.search.searchSource, {
                source: "ebay",
                query: toolArgs.query,
                filters: {
                  minPriceUsd: toolArgs.minPrice,
                  maxPriceUsd: toolArgs.maxPrice,
                  condition: toolArgs.condition,
                  sort: toolArgs.sort ?? "bestMatch",
                  itemLocationCountry: "US"
                },
                limit: 12, offset: 0
              });
              toolResult = normalizeToolOutput("search_ebay", search);
              finalResultItemIds.push(...(search.items.map((i) => i.itemId)));
            }
            else if (toolCall.function.name === "search_exa") {
              await ctx.runMutation(internal.mutations.agentJobs.appendSystemMessage, {
                jobId: args.jobId, threadId, content: `Searching web for: ${toolArgs.query}`, createdAt: Date.now()
              });
              // @ts-ignore - searchExa is conditionally available until api.d.ts regenerates
              const searchAction = (internal.actions.search as Record<string, unknown>).searchExa as any;
              const search = await ctx.runAction(searchAction, {
                query: toolArgs.query,
                numResults: 10,
                includeDomains: toolArgs.includeDomains,
                type: toolArgs.searchStrategy === "broad" ? "neural" : "auto",
                category: "company"
              });

              // Persist Exa results so they show up in UI carousels
              const itemsToUpsert = (search.items || []).map((i: Record<string, unknown>) => ({
                source: "exa",
                externalId: i.externalId || i.itemId,
                title: i.title,
                imageUrl: i.imageUrl,
                priceUsdCents: i.priceUsdCents || 0,
                currency: i.currency || "USD",
                affiliateUrl: i.affiliateUrl,
              }));

              const upsertedIds = await ctx.runMutation(api.mutations.items.upsertManyItems, {
                items: itemsToUpsert,
                now: Date.now(),
              });

              finalResultItemIds.push(...upsertedIds);
              toolResult = normalizeToolOutput("search_exa", search);
            }
            else if (toolCall.function.name === "estimate_landed_cost") {
              const price = toolArgs.productPriceUsd;
              const weight = toolArgs.weightLbs || 1;

              // Basic freight forwarding rates: ~$5 USD per lb + $10 handling
              const shippingUsd = (weight * 5) + 10;

              // Jamaica Duty Estimates
              let dutyUsd = 0;
              if (price > 100) {
                const dutyRate = toolArgs.category === "clothing" ? 0.30 : 0.20;
                const baseDuty = price * dutyRate;
                const gct = (price + shippingUsd + baseDuty) * 0.15;
                dutyUsd = baseDuty + gct;
              }

              toolResult = {
                shippingUsd: shippingUsd.toFixed(2),
                dutyUsd: dutyUsd.toFixed(2),
                totalUsd: (price + shippingUsd + dutyUsd).toFixed(2),
                currency: "USD",
                breakdown: price > 100 ? "Includes Duty & GCT" : "Duty Free (Under $100)"
              };
            }

            history.push({
              role: "tool",
              tool_call_id: toolCall.id,
              name: toolCall.function.name,
              content: JSON.stringify(toolResult)
            });
          }
          continue; // Loop to let it think about tool results
        }

        if (response.content) {
          const assistantMessage = stripMarkdown(response.content);
          await ctx.runMutation(internal.mutations.agentJobs.appendAssistantMessage, {
            jobId: args.jobId,
            threadId,
            content: assistantMessage,
            createdAt: Date.now(),
          });
          break;
        }
      }

      await ctx.runMutation(internal.mutations.agentJobs.setJobCompleted, {
        jobId: args.jobId,
        completedAt: Date.now(),
        intent: { intent: "product_search", query: job.prompt }, // Simplified for setJobCompleted
        resultItemIds: [...new Set(finalResultItemIds)],
      });

      // Push notify (best effort) — handle errors locally so they don't fail the job.
      const payload = {
        title: "SendCat: Results ready",
        body: `Tap to view results for your request`,
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

          console.error("Push notification failed", {
            sessionId: job.sessionId,
            endpoint: sub.endpoint,
            error: msg,
          });

          // If the error indicates the subscription is gone/unsubscribed (HTTP 410/404),
          // attempt to remove the stale subscription row so we don't keep trying it.
          const statusCode = (err as { statusCode?: number; status?: number })?.statusCode ?? (err as { statusCode?: number; status?: number })?.status;
          if (statusCode === 410 || statusCode === 404) {
            try {
              await ctx.runMutation(internal.mutations.pushSubscriptions.deleteByEndpoint, {
                endpoint: sub.endpoint,
              });
            } catch (delErr: unknown) {

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


