"use node";

import crypto from "node:crypto";

type TokenCache = { token: string; expiresAtMs: number };

const EBAY_API_BASE = "https://api.ebay.com";
const ALLOWED_EBAY_ORIGINS = new Set([
  "https://api.ebay.com",
  "https://apix.ebay.com",
  "https://api.sandbox.ebay.com",
  "https://apix.sandbox.ebay.com",
]);
const DEFAULT_SCOPE = "https://api.ebay.com/oauth/api_scope";

const appTokenCacheByScope: Record<string, TokenCache | undefined> = {};

function getRequiredEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function withTimeout(ms: number): AbortSignal {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), ms);
  // Avoid keeping the event loop alive in Node.
  (t as any).unref?.();
  return controller.signal;
}

export async function getEbayAppAccessToken(params?: { scope?: string }): Promise<string> {
  const scope = params?.scope ?? DEFAULT_SCOPE;
  const now = Date.now();
  const cached = appTokenCacheByScope[scope];
  if (cached && cached.expiresAtMs - 60_000 > now) {
    return cached.token;
  }

  const clientId = getRequiredEnv("EBAY_CLIENT_ID");
  const clientSecret = getRequiredEnv("EBAY_CLIENT_SECRET");
  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const tokenRes = await fetch(`${EBAY_API_BASE}/identity/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${authHeader}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      scope,
    }),
    signal: withTimeout(12_000),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text().catch(() => "");
    throw new Error(`eBay OAuth failed (${tokenRes.status}): ${text}`);
  }

  const tokenJson = (await tokenRes.json()) as {
    access_token?: string;
    expires_in?: number;
  };
  const token = tokenJson.access_token;
  const expiresIn = Number(tokenJson.expires_in ?? 0);
  if (!token) throw new Error("eBay OAuth returned no access_token");

  appTokenCacheByScope[scope] = { token, expiresAtMs: now + expiresIn * 1000 };
  return token;
}

export async function ebayFetchJson<T>(params: {
  path: string;
  baseUrl?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  accessToken: string;
  headers?: Record<string, string>;
  body?: unknown;
  marketplaceId?: string;
  timeoutMs?: number;
}): Promise<T> {
  const url = resolveEbayUrl(params.path, params.baseUrl);

  const res = await fetch(url.toString(), {
    method: params.method ?? "GET",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      ...(params.marketplaceId ? { "X-EBAY-C-MARKETPLACE-ID": params.marketplaceId } : {}),
      ...(params.headers ?? {}),
    },
    body: params.body === undefined ? undefined : JSON.stringify(params.body),
    signal: withTimeout(params.timeoutMs ?? 12_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`eBay API failed (${res.status}) ${params.method ?? "GET"} ${url.pathname}: ${text}`);
  }

  return (await res.json()) as T;
}

export async function ebayFetch(params: {
  path: string;
  baseUrl?: string;
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  accessToken: string;
  headers?: Record<string, string>;
  body?: unknown;
  marketplaceId?: string;
  timeoutMs?: number;
}): Promise<Response> {
  const url = resolveEbayUrl(params.path, params.baseUrl);
  const res = await fetch(url.toString(), {
    method: params.method ?? "GET",
    headers: {
      Authorization: `Bearer ${params.accessToken}`,
      "Content-Type": "application/json",
      ...(params.marketplaceId ? { "X-EBAY-C-MARKETPLACE-ID": params.marketplaceId } : {}),
      ...(params.headers ?? {}),
    },
    body: params.body === undefined ? undefined : JSON.stringify(params.body),
    signal: withTimeout(params.timeoutMs ?? 12_000),
  });
  return res;
}

export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

function resolveEbayUrl(path: string, baseUrl?: string): URL {
  const base = baseUrl ?? EBAY_API_BASE;
  const url = new URL(path, base);

  // Security: never allow arbitrary hosts.
  if (!ALLOWED_EBAY_ORIGINS.has(url.origin)) {
    throw new Error(`Blocked eBay URL origin: ${url.origin}`);
  }

  return url;
}


