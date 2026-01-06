# Security: Request Quotas Per Session/User

**Priority**: HIGH  
**Cost Impact**: $$$ (controls cumulative usage)  
**Estimated Effort**: Small  

## Problem
Even with rate limiting, persistent users could accumulate high costs over time without aggregate limits.

## Solution
Implement daily/weekly quota tracking per session and per authenticated user.

## Files to Modify
- `convex/schema.ts` - Add `usageQuotas` table
- `convex/mutations/usageQuotas.ts` - New quota tracking mutations
- `convex/mutations/agentJobs.ts` - Integrate quota checks

## Implementation Steps

### Step 1: Add Usage Quotas Schema
In `convex/schema.ts`:
```typescript
usageQuotas: defineTable({
  sessionId: v.string(),
  clerkUserId: v.optional(v.string()), // null for anonymous sessions
  periodType: v.union(v.literal("daily"), v.literal("weekly")),
  periodStart: v.number(), // timestamp
  requestCount: v.number(),
})
  .index("by_sessionId_and_period", ["sessionId", "periodStart"])
  .index("by_clerkUserId_and_period", ["clerkUserId", "periodStart"])
```

### Step 2: Create Quota Check Mutation
Create `convex/mutations/usageQuotas.ts`:
```typescript
export const checkQuota = internalMutation({
  args: { 
    sessionId: v.string(), 
    clerkUserId: v.optional(v.string()),
    periodType: v.union(v.literal("daily"), v.literal("weekly")),
    maxRequests: v.number(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const now = Date.now();
    const windowMs = args.periodType === "daily" ? 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;
    const periodStart = now - windowMs;
    
    const index = args.clerkUserId 
      ? "by_clerkUserId_and_period"
      : "by_sessionId_and_period";
    const field = args.clerkUserId ? "clerkUserId" : "sessionId";
    const value = args.clerkUserId ?? args.sessionId;
    
    const existing = await ctx.db
      .query("usageQuotas")
      .withIndex(index as any, (q: any) => 
        q.eq(field, value).gte("periodStart", periodStart)
      )
      .first();
    
    if (existing) {
      if (existing.requestCount >= args.maxRequests) {
        return false; // Quota exceeded
      }
      await ctx.db.patch(existing._id, { requestCount: existing.requestCount + 1 });
    } else {
      await ctx.db.insert("usageQuotas", {
        sessionId: args.sessionId,
        clerkUserId: args.clerkUserId,
        periodType: args.periodType,
        periodStart: now,
        requestCount: 1,
      });
    }
    
    return true;
  },
});
```

### Step 3: Integrate into createAgentJob
Modify `convex/mutations/agentJobs.ts`:
```typescript
export const createAgentJob = mutation({
  // ... existing args ...
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const clerkUserId = identity?.subject ?? undefined;
    
    // Check daily quota
    const allowedDaily = await ctx.runMutation(internal.mutations.usageQuotas.checkQuota, {
      sessionId: args.sessionId,
      clerkUserId,
      periodType: "daily",
      maxRequests: clerkUserId ? 50 : 10, // Authenticated users get more
    });
    
    if (!allowedDaily) {
      throw new Error("Daily quota exceeded. Try again tomorrow.");
    }
    
    // ... rest of existing code ...
  },
});
```

## Testing Strategy

### Manual Testing
1. Create 10 requests from anonymous session - should all work
2. 11th request should fail with daily quota error
3. Wait 24 hours, verify quota resets

### Automated Testing
Create test in `tests/security-quotas.test.ts`:
```typescript
describe("Usage Quotas", () => {
  it("should enforce anonymous daily quota of 10", async () => {
    const t = convexTest();
    const sessionId = "anonymous-123";
    
    for (let i = 0; i < 10; i++) {
      await t.runMutation(api.mutations.agentJobs.createAgentJob, {
        prompt: "test",
        sessionId,
      });
    }
    
    await expect(t.runMutation(api.mutations.agentJobs.createAgentJob, {
      prompt: "test",
      sessionId,
    })).rejects.toThrow("Daily quota exceeded");
  });
  
  it("should allow higher quota for authenticated users", async () => {
    // Test with mocked auth context
  });
});
```

## Configuration
- Anonymous sessions: 10 requests/day
- Authenticated users: 50 requests/day
- Adjust quotas based on actual usage and costs after launch
