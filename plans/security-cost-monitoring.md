# Security: OpenRouter Cost Monitoring & Alerts

**Priority**: HIGH  
**Cost Impact**: $$$ (prevents surprise bills)  
**Estimated Effort**: Small  

## Problem
OpenRouter API costs can accumulate quickly. Need visibility and alerts before exceeding budget.

## Solution
Track OpenRouter API usage and alert when approaching thresholds.

## Files to Modify
- `convex/schema.ts` - Add `costTracking` table
- `convex/actions/agentRunner.ts` - Log API costs
- `convex/queries/costTracking.ts` - New cost monitoring queries

## Implementation Steps

### Step 1: Add Cost Tracking Schema
In `convex/schema.ts`:
```typescript
costTracking: defineTable({
  sessionId: v.string(),
  clerkUserId: v.optional(v.string()),
  provider: v.string(), // "openrouter", "ebay"
  model: v.string(), // "openai/gpt-4o-mini", etc.
  requestType: v.string(), // "intent_parsing", "response_generation"
  inputTokens: v.number(),
  outputTokens: v.number(),
  costUsd: v.number(),
  timestamp: v.number(),
})
  .index("by_sessionId_and_timestamp", ["sessionId", "timestamp"])
  .index("by_clerkUserId_and_timestamp", ["clerkUserId", "timestamp"])
  .index("by_timestamp", ["timestamp"])
```

### Step 2: Log API Costs in agentRunner
Modify `convex/actions/agentRunner.ts`:
```typescript
import { internal } from "../_generated/api";

// Token pricing (update as needed)
const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  "openai/gpt-4o-mini": { input: 0.00015, output: 0.0006 }, // per 1K tokens
  "openai/gpt-4o": { input: 0.005, output: 0.015 },
};

async function trackCost(
  ctx: GenericActionCtx<DataModel>,
  args: {
    sessionId: string;
    clerkUserId?: string;
    model: string;
    requestType: string;
    inputTokens: number;
    outputTokens: number;
  }
) {
  const pricing = MODEL_PRICING[args.model];
  if (!pricing) return;
  
  const costUsd = (args.inputTokens / 1000) * pricing.input + 
                 (args.outputTokens / 1000) * pricing.output;
  
  await ctx.runMutation(internal.mutations.costTracking.logCost, {
    sessionId: args.sessionId,
    clerkUserId: args.clerkUserId,
    provider: "openrouter",
    model: args.model,
    requestType: args.requestType,
    inputTokens: args.inputTokens,
    outputTokens: args.outputTokens,
    costUsd,
    timestamp: Date.now(),
  });
}

// In extractIntent function:
const res = await fetchWithTimeout(/* ... */);
const json = await res.json();
const inputTokens = json.usage?.prompt_tokens ?? 0;
const outputTokens = json.usage?.completion_tokens ?? 0;
await trackCost(ctx, {
  sessionId: job.sessionId,
  clerkUserId: job.clerkUserId,
  model,
  requestType: "intent_parsing",
  inputTokens,
  outputTokens,
});

// In generateAssistantReply function:
// Similar tracking for response generation
```

### Step 3: Create Cost Monitoring Queries
Create `convex/queries/costTracking.ts`:
```typescript
export const getTotalCost = query({
  args: { 
    period: v.union(v.literal("hour"), v.literal("day"), v.literal("week")) 
  },
  returns: v.number(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowMs = args.period === "hour" ? 60 * 60 * 1000
                   : args.period === "day" ? 24 * 60 * 60 * 1000
                   : 7 * 24 * 60 * 60 * 1000;
    const periodStart = now - windowMs;
    
    const costs = await ctx.db
      .query("costTracking")
      .withIndex("by_timestamp", (q) => q.gte("timestamp", periodStart))
      .collect();
    
    return costs.reduce((sum, c) => sum + c.costUsd, 0);
  },
});

export const getCostBySession = query({
  args: { sessionId: v.string(), period: v.string() },
  returns: v.number(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowMs = args.period === "hour" ? 60 * 60 * 1000
                   : args.period === "day" ? 24 * 60 * 60 * 1000
                   : 7 * 24 * 60 * 60 * 1000;
    const periodStart = now - windowMs;
    
    const costs = await ctx.db
      .query("costTracking")
      .withIndex("by_sessionId_and_timestamp", (q) => 
        q.eq("sessionId", args.sessionId).gte("timestamp", periodStart)
      )
      .collect();
    
    return costs.reduce((sum, c) => sum + c.costUsd, 0);
  },
});
```

### Step 4: Create Cost Alerting Function
Create `convex/actions/costAlerts.ts`:
```typescript
export const checkCostThresholds = internalAction({
  handler: async (ctx) => {
    // Run via Convex scheduler every hour
    const dailyCost = await ctx.runQuery(api.queries.costTracking.getTotalCost, { period: "day" });
    const weeklyCost = await ctx.runQuery(api.queries.costTracking.getTotalCost, { period: "week" });
    
    // Thresholds - ADJUST THESE BASED ON YOUR BUDGET
    const DAILY_ALERT_THRESHOLD = 10; // $10/day
    const WEEKLY_ALERT_THRESHOLD = 100; // $100/week
    
    if (dailyCost > DAILY_ALERT_THRESHOLD) {
      console.error(`🚨 COST ALERT: Daily cost $${dailyCost.toFixed(2)} exceeds $${DAILY_ALERT_THRESHOLD}`);
      // TODO: Send webhook/email notification here
    }
    
    if (weeklyCost > WEEKLY_ALERT_THRESHOLD) {
      console.error(`🚨 COST ALERT: Weekly cost $${weeklyCost.toFixed(2)} exceeds $${WEEKLY_ALERT_THRESHOLD}`);
      // TODO: Send webhook/email notification here
    }
  },
});
```

### Step 5: Schedule Cost Checks
In `convex/schema.ts` or via Convex CLI:
```bash
bunx convex schedule run --hourly internal.actions.costAlerts.checkCostThresholds
```

## Testing Strategy

### Manual Testing
1. Make several agent requests
2. Query `getTotalCost` to verify tracking
3. Manually trigger `checkCostThresholds` to see alerts

### Automated Testing
Create test in `tests/security-cost-monitoring.test.ts`:
```typescript
describe("Cost Monitoring", () => {
  it("should accurately track API costs", async () => {
    const t = convexTest();
    // Mock API call with known token usage
    // Verify cost is logged correctly
  });
});
```

## Configuration
**Initial thresholds (adjust as needed)**:
- Daily alert: $10
- Weekly alert: $100
- Hard shutdown: $500 (optional, implement if needed)

## Monitoring Dashboard
TODO: Create Convex dashboard to visualize costs over time
