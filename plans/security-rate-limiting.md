# Security: Rate Limiting for Agent Jobs

**Priority**: HIGH  
**Cost Impact**: $$$ (prevents API budget burn)  
**Estimated Effort**: Small  

## Problem
Attackers can spam `createAgentJob` mutation to trigger expensive LLM and eBay API calls, draining your budget.

## Solution
Implement rate limiting on `createAgentJob` mutation with per-session limits.

## Files to Modify
- `convex/mutations/agentJobs.ts` - Add rate limit check
- `convex/_generated/server.d.ts` - (auto-generated, no manual changes)

## Implementation Steps

### Step 1: Add Rate Limit Schema
Create a new `rateLimits` table in `convex/schema.ts`:
```typescript
rateLimits: defineTable({
  sessionId: v.string(),
  requestCount: v.number(),
  windowStart: v.number(), // timestamp
})
  .index("by_sessionId_and_windowStart", ["sessionId", "windowStart"])
```

### Step 2: Add Rate Limit Check Mutation
Create `convex/mutations/rateLimits.ts`:
```typescript
export const checkRateLimit = internalMutation({
  args: { sessionId: v.string(), maxRequests: v.number(), windowMs: v.number() },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowStart = now - args.windowMs;
    
    // Clean old entries
    const oldEntries = await ctx.db
      .query("rateLimits")
      .withIndex("by_sessionId_and_windowStart", (q) => 
        q.eq("sessionId", args.sessionId).lt("windowStart", windowStart)
      )
      .collect();
    
    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }
    
    // Get current window entry
    const existing = await ctx.db
      .query("rateLimits")
      .withIndex("by_sessionId_and_windowStart", (q) => 
        q.eq("sessionId", args.sessionId).gte("windowStart", windowStart)
      )
      .first();
    
    if (existing) {
      if (existing.requestCount >= args.maxRequests) {
        return false; // Rate limited
      }
      await ctx.db.patch(existing._id, { requestCount: existing.requestCount + 1 });
    } else {
      await ctx.db.insert("rateLimits", {
        sessionId: args.sessionId,
        requestCount: 1,
        windowStart: now,
      });
    }
    
    return true;
  },
});
```

### Step 3: Integrate into createAgentJob
Modify `convex/mutations/agentJobs.ts`:
```typescript
import { internal } from "../_generated/api";

export const createAgentJob = mutation({
  // ... existing args ...
  handler: async (ctx, args) => {
    // Check rate limit: 10 requests per 5 minutes per session
    const allowed = await ctx.runMutation(internal.mutations.rateLimits.checkRateLimit, {
      sessionId: args.sessionId,
      maxRequests: 10,
      windowMs: 5 * 60 * 1000, // 5 minutes
    });
    
    if (!allowed) {
      throw new Error("Rate limit exceeded. Please try again in a few minutes.");
    }
    
    // ... rest of existing code ...
  },
});
```

## Testing Strategy

### Manual Testing
1. Call `createAgentJob` 10 times rapidly from the same session
2. 11th call should throw rate limit error
3. Wait 6 minutes, then verify you can make 10 more requests

### Automated Testing
Create test in `tests/security-rate-limit.test.ts`:
```typescript
import { describe, it, expect } from "bun:test";
import { convexTest } from "convex/test";

describe("Rate Limiting", () => {
  it("should reject requests after limit is reached", async () => {
    const t = convexTest();
    const sessionId = "test-session-123";
    
    // Should allow 10 requests
    for (let i = 0; i < 10; i++) {
      await t.runMutation(api.mutations.agentJobs.createAgentJob, {
        prompt: "test",
        sessionId,
      });
    }
    
    // 11th should fail
    await expect(t.runMutation(api.mutations.agentJobs.createAgentJob, {
      prompt: "test",
      sessionId,
    })).rejects.toThrow("Rate limit exceeded");
  });
});
```

## Monitoring
- Track rate limit rejections via Convex logs
- Alert if >5% of requests are rate limited (indicates abuse or limits too tight)
