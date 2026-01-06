# Security: Circuit Breaker for External API Calls

**Priority**: MEDIUM  
**Cost Impact**: $$ (prevents cascading failures)  
**Estimated Effort**: Medium  

## Problem
If eBay or OpenRouter APIs become unavailable or slow, agents could keep retrying, wasting resources and creating bad user experience.

## Solution
Implement circuit breaker pattern to fail-fast when external APIs are degraded.

## Files to Modify
- `convex/schema.ts` - Add `circuitBreaker` table
- `convex/actions/agentRunner.ts` - Add circuit breaker checks
- `convex/actions/search.ts` - Add eBay API circuit breaker
- `convex/lib/ebayBrowse.ts` - (if needed)

## Implementation Steps

### Step 1: Add Circuit Breaker Schema
In `convex/schema.ts`:
```typescript
circuitBreaker: defineTable({
  serviceName: v.string(), // "openrouter", "ebay"
  state: v.union(v.literal("closed"), v.literal("open"), v.literal("half-open")),
  failureCount: v.number(),
  lastFailureAt: v.number(),
  openedAt: v.number(),
  nextAttemptAt: v.number(),
})
  .index("by_serviceName", ["serviceName"])
```

### Step 2: Create Circuit Breaker Utility
Create `convex/lib/circuitBreaker.ts`:
```typescript
import { v } from "convex/values";

const CONFIG = {
  openrouter: {
    failureThreshold: 5,
    recoveryTimeMs: 60 * 1000, // 1 minute
  },
  ebay: {
    failureThreshold: 10,
    recoveryTimeMs: 5 * 60 * 1000, // 5 minutes
  },
};

export async function checkCircuitBreaker(
  ctx: GenericActionCtx<DataModel>,
  serviceName: string
): Promise<{ allowed: boolean; reason?: string }> {
  const breaker = await ctx.db
    .query("circuitBreaker")
    .withIndex("by_serviceName", (q) => q.eq("serviceName", serviceName))
    .first();
  
  if (!breaker) {
    return { allowed: true };
  }
  
  const config = CONFIG[serviceName as keyof typeof CONFIG];
  const now = Date.now();
  
  // If in OPEN state, check if recovery time has passed
  if (breaker.state === "open") {
    if (now >= breaker.nextAttemptAt) {
      // Move to HALF-OPEN to test recovery
      await ctx.db.patch(breaker._id, {
        state: "half-open",
      });
      return { allowed: true, reason: "Testing recovery" };
    }
    return { 
      allowed: false, 
      reason: `Service ${serviceName} is in circuit-open state until ${new Date(breaker.nextAttemptAt).toISOString()}` 
    };
  }
  
  return { allowed: true };
}

export async function recordSuccess(
  ctx: GenericActionCtx<DataModel>,
  serviceName: string
): Promise<void> {
  const breaker = await ctx.db
    .query("circuitBreaker")
    .withIndex("by_serviceName", (q) => q.eq("serviceName", serviceName))
    .first();
  
  if (!breaker) {
    await ctx.db.insert("circuitBreaker", {
      serviceName,
      state: "closed",
      failureCount: 0,
      lastFailureAt: 0,
      openedAt: 0,
      nextAttemptAt: 0,
    });
    return;
  }
  
  // If in HALF-OPEN, successful call means circuit is recovered
  if (breaker.state === "half-open") {
    await ctx.db.patch(breaker._id, {
      state: "closed",
      failureCount: 0,
      openedAt: 0,
      nextAttemptAt: 0,
    });
    return;
  }
  
  // Reset failure count on success
  await ctx.db.patch(breaker._id, { failureCount: 0 });
}

export async function recordFailure(
  ctx: GenericActionCtx<DataModel>,
  serviceName: string,
  error: Error
): Promise<void> {
  const config = CONFIG[serviceName as keyof typeof CONFIG];
  const now = Date.now();
  
  const breaker = await ctx.db
    .query("circuitBreaker")
    .withIndex("by_serviceName", (q) => q.eq("serviceName", serviceName))
    .first();
  
  if (!breaker) {
    await ctx.db.insert("circuitBreaker", {
      serviceName,
      state: "closed",
      failureCount: 1,
      lastFailureAt: now,
      openedAt: 0,
      nextAttemptAt: 0,
    });
    return;
  }
  
  const newFailureCount = breaker.failureCount + 1;
  
  // Open circuit if threshold exceeded
  if (newFailureCount >= config.failureThreshold) {
    await ctx.db.patch(breaker._id, {
      state: "open",
      failureCount: newFailureCount,
      lastFailureAt: now,
      openedAt: now,
      nextAttemptAt: now + config.recoveryTimeMs,
    });
    console.error(`🔌 Circuit OPEN for ${serviceName}: ${newFailureCount} failures`);
  } else {
    await ctx.db.patch(breaker._id, {
      failureCount: newFailureCount,
      lastFailureAt: now,
    });
  }
}
```

### Step 3: Integrate into agentRunner
Modify `convex/actions/agentRunner.ts`:
```typescript
import { checkCircuitBreaker, recordSuccess, recordFailure } from "../lib/circuitBreaker";

async function extractIntent(prompt: string): Promise<IntentResult> {
  const { allowed, reason } = await checkCircuitBreaker(ctx, "openrouter");
  if (!allowed) {
    throw new Error(`OpenRouter unavailable: ${reason}`);
  }
  
  try {
    // ... existing fetch logic ...
    const res = await fetchWithTimeout(/* ... */);
    await recordSuccess(ctx, "openrouter");
    // ... rest of function ...
  } catch (err) {
    await recordFailure(ctx, "openrouter", err as Error);
    throw err;
  }
}

// Similarly for generateAssistantReply
```

### Step 4: Integrate into search.ts
Modify `convex/actions/search.ts`:
```typescript
import { checkCircuitBreaker, recordSuccess, recordFailure } from "../lib/circuitBreaker";

export const searchSource = action({
  // ... existing args ...
  handler: async (ctx: SearchActionCtx, args: SearchSourceArgs) => {
    if (source === "ebay") {
      const { allowed, reason } = await checkCircuitBreaker(ctx, "ebay");
      if (!allowed) {
        throw new Error(`eBay unavailable: ${reason}`);
      }
      
      try {
        const accessToken = await getEbayAccessToken();
        const ebayResult = await searchEbayBrowse({ /* ... */ });
        await recordSuccess(ctx, "ebay");
        // ... rest of function ...
      } catch (err) {
        await recordFailure(ctx, "ebay", err as Error);
        throw err;
      }
    }
    // ...
  },
});
```

## Testing Strategy

### Manual Testing
1. Temporarily modify eBay API endpoint to fail
2. Make requests until circuit opens
3. Verify subsequent requests fail-fast with circuit breaker message
4. Wait recovery time, verify circuit closes

### Automated Testing
Create test in `tests/security-circuit-breaker.test.ts`:
```typescript
describe("Circuit Breaker", () => {
  it("should open circuit after threshold failures", async () => {
    const t = convexTest();
    // Simulate 10 failures for eBay
    // Verify circuit is open
    // Verify next request is rejected immediately
  });
  
  it("should recover after timeout", async () => {
    // Test recovery after configured timeout
  });
});
```

## Configuration
- OpenRouter: 5 failures → open for 1 minute
- eBay: 10 failures → open for 5 minutes

## Monitoring
- Log circuit state transitions
- Alert if circuits open frequently (indicates upstream issues)
