# Agent Instructions
You are an AI agent that helps the user build SendCat – an AI-powered shopping concierge and freight forwarding platform for Jamaica. You are given a set of tools to help you build the application using Next.js, Convex, and Clerk. Use the tools in MCP servers available to you to assist the user in building production-grade features.

Your responsibilities:

1. **Understand Intent**: Ask clarifying questions about user requirements, user flows, and business logic before implementation.

2. **Build Production-Grade Solutions**: 
   - Follow the SendCat architecture (Next.js app router with marketing + auth-protected `/app` routes).
   - Use Convex for backend logic (actions, mutations, queries).
   - Integrate Clerk for authentication and user identity.
   - Use Bun as the package manager.

3. **Testing**: After implementing a major feature, write comprehensive tests in `/tests/[feature-name].test.ts` to verify functionality, edge cases, and integration with Convex/Clerk.

4. **Documentation**: After a major feature, create documentation in `/docs/[feature-name].md` that includes:
   - What the feature does
   - How it was implemented
   - Which files are involved and their roles
   - How to use the feature
   - Integration points with Convex, Clerk, or other services

5. **Keep Documentation Current**: Ensure all documentation in `/docs` is updated whenever related code changes.

6. **Suggest Improvements**: Recommend best practices for the SendCat platform, such as leveraging Convex for data persistence, Clerk for user management, and affiliate integration for monetization.

# User behaviour
- The user will almost always share screenshots of what they want to have built in the frontend. 
- The user will Provide instructions and request that are vague at times.


> Project: **SendCat** – AI‑powered shopping + forwarding platform for Jamaica  
> Purpose: Business overview, product overview, and setup/config for the AI
> agents, Convex backend, and auth (Clerk) within a single Next.js app
> (marketing + application).  
> Preferred package manager: **Bun**  
> Auth provider: **Clerk**

---



## 1. Business Overview

### 1.1 Problem

Jamaican shoppers want to buy from US/UK online stores (Amazon, eBay, Walmart,
Shein, etc.), but:

- International shipping is expensive and unclear.
- Duties/taxes (CIF, CET, GCT) are confusing and often a surprise.
- Local freight forwarders (Mailpac, MyCart, Shipme, etc.) provide:
  - Basic web portals, no AI assistance.
  - No up‑front total‑landed‑cost estimate.
  - Little personalization or product discovery.

### 1.2 Solution

**SendCat** is an AI‑powered **shopping concierge + freight forwarder**:

- Users describe what they want in natural language.
- AI agents search marketplaces (currently **eBay**; later Amazon/Walmart).
- The system computes **total landed cost to Jamaica**, including:
  - Product price
  - Shipping to/from the US hub
  - Estimated duties + GCT
- Users can:
  - Click through via affiliate links, **or**
  - Use a **“Buy & Ship to Jamaica”** flow powered by SendCat’s forwarding
    service.

Revenue streams:

1. **Forwarding fees** (core shipping margin).
2. **Affiliate commissions** (Amazon/eBay/others).
3. Future:
   - **Premium membership tiers**.
   - **Insurance attach** on shipments.
   - **FX spread** on JMD⇄USD conversions.
   - **Sponsored placements** in a recommendation feed.

---

## 2. Product & Agent Overview

### 2.1 Core User Flows

1. **AI Shopping Search (MVP – eBay only)**  
   - User asks: “men suits under $200”, “men’s blazers”, etc.
   - AI agent:
     - Understands the query (category, budget, filters).
     - Calls an internal eBay search action (Convex).
     - Returns options in chat (title + price) and as visual cards.

2. **Planned Multi‑Retailer Search**  
   - Same conversational interface.
   - Agent queries:
     - Amazon PA‑API 5.0 (when added).
     - eBay Browse API.
     - Later, Walmart or others.
   - Results are aggregated and ranked for best total value to Jamaica.

3. **Total Landed Cost Estimator**  
   - For each candidate product:
     - Estimate/lookup weight.
     - Compute shipping to Jamaica based on SendCat’s carrier rates.
     - Estimate duties + GCT using a simple CIF‑based model.
   - Show:
     - Product price.
     - Shipping.
     - Estimated duties/taxes.
     - **Total to chosen parish** (e.g., Kingston).

4. **Affiliate + Forwarding Integration**  
   - “View on eBay” → affiliate link (eBay Partner Network).
   - Future: “Buy & Ship to Jamaica”:
     - Create a forwarding order in Convex.
     - Track external order → US warehouse → Jamaica delivery.

5. **Recommendation Feed (Planned)**  
   - Personalized **product feed** similar to a timeline:
     - Uses user search history, clicks, and shipments.
     - Mixes:
       - Personal relevance.
       - Price fit.
       - Engagement/conversion data.
       - Freshness/diversity.
   - Starts rule‑based; can evolve into a small ML recommender.

---

## 3. Agent Architecture

### 3.1 High‑Level Design

Agents are orchestrated via an LLM (e.g., GPT‑4‑Turbo / Claude) with tool
calling. The LLM:

- Parses user requests.
- Chooses which tools to call.
- Aggregates product / shipping data.
- Generates user‑facing responses.

Convex provides:

- **Actions** for calling external APIs (eBay, Amazon, shipping).
- **Queries** for fetching user data and recommendation candidates.
- **Mutations** for logging events (impressions, clicks, shipments).

Clerk provides:

- Authentication (email/password, OAuth, etc.).
- User management and sessions.
- Secure user identity for Convex and the agents.

#### Core Tools (Conceptual)

1. **`searchEbay` (Convex Action)**  
   - Params: `{ query, condition?, maxPrice?, buyingFormat? }`  
   - Calls eBay Browse API.  
   - Returns normalized products:
     - `id`, `title`, `price`, `image`, `condition`, `sellerRating`,
       `affiliateUrl`, etc.

2. **(Planned) `searchAmazon` (Convex Action)**  
   - Params: `{ query, category?, minPrice?, maxPrice?, brand? }`  
   - Calls Amazon PA‑API 5.0.  
   - Normalizes response to same internal product format.

3. **(Planned) `searchWalmart` (Convex Action)**

4. **`estimateShippingToJamaica` (Convex Action)**  
   - Params: `{ productPrice, weightLbs, destinationParish }`  
   - Uses a simplified shipping + duties model.  
   - Returns:
     - Shipping options (`express`, `economy`, `sea`).
     - Estimated duties + GCT.
     - Total landed cost for each option.

5. **`logEvent` (Convex Mutation)**  
   - Logs:
     - `userId` (Clerk user id) / anonymous session.
     - `itemId`.
     - `eventType` (`impression`, `click`, `add_to_shipment`, `purchase`).
     - `source` (`ebay`, `amazon`, etc.).
     - Timestamps + context.
   - Feeds the recommendation system and analytics.

6. **(Planned) `getRecommendedItems` (Convex Query)**  
   - Returns a ranked list of affiliate items for a given user:
     - Uses recent search history, event logs, and global trends.
     - Ranking is initially rule‑based, later ML‑driven.

### 3.2 Agent Prompt (Conceptual)

System role:

> “You are a shopping assistant for a Jamaican freight‑forwarding service.
> Help users find products on US marketplaces and show the total estimated cost
> to get items to Jamaica (including shipping and duties). Use the provided
> tools for searching products and estimating shipping. Always explain prices
> clearly and offer to refine by price, condition, or brand.”

---

## 4. Tech Stack & App Structure

### 4.1 Single Next.js App (Marketing + Application)

One Next.js project serves both:

- **Marketing site** (public, SEO‑friendly).
- **Logged‑in application** (AI assistant, dashboard).

Using the App Router with **route groups**:

```text
app/
  (marketing)/
    layout.tsx              # Marketing layout
    page.tsx                # "/" – landing page
    pricing/page.tsx
    how-it-works/page.tsx
    faq/page.tsx

  (auth)/                   # Clerk auth pages (mounted under "/auth" or root)
    sign-in/[[...index]]/page.tsx
    sign-up/[[...index]]/page.tsx

  (app)/
    layout.tsx              # App layout (requires Clerk auth)
    app/page.tsx            # "/app" – main assistant/dashboard
    app/orders/page.tsx
    app/settings/page.tsx

  api/
    chat/route.ts           # LLM orchestration (server/edge)
    search/ebay/route.ts
    shipping/estimate/route.ts
```

- `https://sendcat.com/` → marketing landing page.  
- `https://sendcat.com/app` → protected product (AI chat + shopping, requires
  Clerk session).  
- `https://sendcat.com/sign-in` / `/sign-up` (or `/auth/...`) → Clerk auth
  pages.

`middleware.ts` will typically protect `/app` routes using Clerk’s Next.js
middleware.

### 4.2 Frontend

- **Framework**: Next.js (App Router).
- **Package manager**: **Bun**.
- **Auth**: `@clerk/nextjs` (React components + server helpers).
- **UI**:
  - Chat interface for the AI assistant.
  - Product result cards in a mobile‑friendly sheet/grid.
  - Buttons for quick queries (“Men suits”, “Search men’s blazers”, etc.).
  - Navbar with “Sign in / Sign up” from Clerk on marketing pages.

### 4.3 Backend – Convex

Convex is used for:

- **Data storage** (collections for users, events, items, shipments).
- **Serverless logic**:
  - `actions/` → external API calls (eBay, Amazon, shipping, LLM).
  - `mutations/` → writes to Convex (users, events, shipments).
  - `queries/` → reads (feeds, history, user profile).
- **Auth bridging**:
  - Use Clerk user ID (`user.id`) as the stable identifier in Convex tables.
  - Optionally verify Clerk JWTs server‑side in Convex actions/mutations.

Illustrative Convex structure:

```text
convex/
  schema.ts
  actions/
    searchEbay.ts
    searchAmazon.ts        # planned
    estimateShipping.ts
  mutations/
    users.ts
    events.ts
    shipments.ts
  queries/
    user.ts
    feed.ts
    history.ts
```

---

## 5. Convex Schema (High‑Level)

Example collections:

```ts
// convex/schema.ts (conceptual)
import { defineSchema, defineTable } from "convex/server";

export default defineSchema({
  users: defineTable({
    clerkUserId: "string",   // primary identity from Clerk
    email: "string",
    name: "string",
    country: "string",       // e.g. "JM"
    defaultParish: "string", // Kingston, St. Andrew, etc.
    createdAt: "number",
  }),

  sessions: defineTable({
    clerkUserId: "string?",
    createdAt: "number",
    lastSeenAt: "number",
  }),

  events: defineTable({
    clerkUserId: "string?",
    sessionId: "string?",
    itemId: "string",
    source: "string",        // "ebay" | "amazon" | ...
    type: "string",          // "impression" | "click" | "add_to_shipment" | "purchase"
    metadata: "any",
    createdAt: "number",
  }),

  items: defineTable({
    externalId: "string",    // eBay itemId, Amazon ASIN, etc.
    source: "string",
    title: "string",
    imageUrl: "string",
    priceUsd: "number",
    category: "string",
    brand: "string?",
    rating: "number?",
    sellerRating: "number?",
    affiliateUrl: "string",
    lastSeenAt: "number",
  }),

  shipments: defineTable({
    clerkUserId: "string",
    status: "string",        // "pending", "in_transit", "delivered", etc.
    items: "any",            // array of item snapshots
    totalPriceUsd: "number",
    shippingOption: "string",
    destinationParish: "string",
    createdAt: "number",
  }),
});
```

---

## 6. Configuration & Environment

Create `.env.local` in the project root (never commit this):

```bash
# LLM
OPENAI_API_KEY=...

# eBay
EBAY_APP_ID=...
EBAY_CERT_ID=...
EBAY_DEV_ID=...

# (Planned) Amazon PA-API
AMAZON_ACCESS_KEY=...
AMAZON_SECRET_KEY=...
AMAZON_PARTNER_TAG=sendcat-20

# Convex
NEXT_PUBLIC_CONVEX_URL=...        # injected by convex dev for local
CONVEX_DEPLOYMENT=...             # prod deployment URL

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
# Optional routing overrides
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# App config
NEXT_PUBLIC_APP_NAME="SendCat"
NEXT_PUBLIC_DEFAULT_PARISH="Kingston"
```

Additional production secrets are managed via:

- Vercel project env vars.
- Clerk dashboard (OAuth providers, webhooks).
- Convex dashboard (if needed).

---

## 7. Local Development Setup (with Bun + Clerk + Convex)

1. **Install dependencies**

   ```bash
   bun install
   ```

2. **Configure Clerk (once)**

   - Create a Clerk application in the Clerk dashboard.
   - Enable desired providers (email, Google, etc.).
   - Copy:
     - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
     - `CLERK_SECRET_KEY`
   - Put them into `.env.local`.

3. **Start Convex locally**

   ```bash
   bunx convex dev
   ```

4. **Run the Next.js dev server (via Bun)**

   ```bash
   bun run dev
   ```

   - Marketing site: `http://localhost:3000/`
   - App (protected): `http://localhost:3000/app`
   - Sign‑in: `http://localhost:3000/sign-in`
   - Convex dev dashboard: URL printed by `bunx convex dev`.

5. **Verify auth + app**

   - Visit `/`.
   - Click “Sign in” → Clerk UI should appear.
   - After sign‑in, navigate to `/app` and confirm:
     - Clerk session is available via `useUser` / `auth()`.
     - Convex functions receive the mapped `clerkUserId`.

6. **Verify eBay search**

   - In `/app`, ask the assistant for “men’s suits”.
   - Confirm `searchEbay` action runs and product grid populates.

7. **Deploy**

   - Deploy Convex:

     ```bash
     bunx convex deploy
     ```

   - Deploy Next.js (Vercel).
   - Set all Clerk, Convex, and API keys in Vercel + Clerk dashboards.

---

## 8. Future Work Checklist

### 8.1 Business / Product

- Add **Amazon** and **Walmart** integrations.
- Show **“Total to Jamaica”** on every product card using
  `estimateShippingToJamaica`.
- Implement **“Buy & Ship to Jamaica”** checkout backed by Convex `shipments`.
- Add richer account pages under `/app` (history, saved items, addresses).
- Offer **premium membership** using Clerk’s user metadata/roles.

### 8.2 Agents & Algorithms

- Expand tools to multi‑retailer search.
- Log all events via Convex `events` for analytics and recommendations.
- Build v1 **recommendation feed** as a Convex query:
  - Rule‑based scoring with relevance + engagement + freshness.
- Later, experiment with a simple ML model (offline training) and persist
  per‑user preferences in Convex.

---

## 9. Vision

SendCat evolves from:

1. **MVP**: AI chat with eBay search + Convex‑backed logging inside a single
   Next.js app, using Bun and Clerk for a smooth auth/dev experience.
2. **Phase 2**: Multi‑retailer assistant, clear landed‑cost estimates, clean
   separation between marketing routes and `/app` (auth‑protected).
3. **Phase 3**: Personalized affiliate feed and “Buy & Ship” loop leveraging
   Convex event data and Clerk user profiles.
4. **Phase 4**: Regional expansion and deeper carrier integrations for
   full‑stack logistics + commerce in the Caribbean.

This `agents.md` should give any collaborator enough context to understand what
SendCat is, how the agents work, and how Convex + Clerk + Next.js (with Bun)
fit together across marketing and application routes.