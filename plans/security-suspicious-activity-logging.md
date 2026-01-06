# Security: Suspicious Activity Logging & Detection

**Priority**: LOW  
**Cost Impact**: $ (detection)  
**Estimated Effort**: Medium  

## Problem
No centralized logging or detection of suspicious usage patterns that could indicate abuse or attacks.

## Solution
Log security-relevant events and create queries to detect suspicious patterns.

## Files to Modify
- `convex/schema.ts` - Add `securityEvents` table
- `convex/mutations/securityEvents.ts` - New security logging mutations
- `convex/actions/agentRunner.ts` - Log suspicious patterns
- `convex/mutations/agentJobs.ts` - Log rate limit violations

## Implementation Steps

### Step 1: Add Security Events Schema
In `convex/schema.ts`:
```typescript
securityEvents: defineTable({
  sessionId: v.string(),
  clerkUserId: v.optional(v.string()),
  eventType: v.union(
    v.literal("rate_limit_exceeded"),
    v.literal("quota_exceeded"),
    v.literal("suspicious_prompt"),
    v.literal("circuit_opened"),
    v.literal("api_failure"),
    v.literal("unusual_pattern")
  ),
  severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  details: v.optional(v.any()),
  ipAddress: v.optional(v.string()),
  userAgent: v.optional(v.string()),
  createdAt: v.number(),
})
  .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"])
  .index("by_clerkUserId_and_createdAt", ["clerkUserId", "createdAt"])
  .index("by_eventType_and_createdAt", ["eventType", "createdAt"])
  .index("by_severity_and_createdAt", ["severity", "createdAt"])
```

### Step 2: Create Security Logging Mutations
Create `convex/mutations/securityEvents.ts`:
```typescript
export const logSecurityEvent = internalMutation({
  args: {
    sessionId: v.string(),
    clerkUserId: v.optional(v.string()),
    eventType: v.union(
      v.literal("rate_limit_exceeded"),
      v.literal("quota_exceeded"),
      v.literal("suspicious_prompt"),
      v.literal("circuit_opened"),
      v.literal("api_failure"),
      v.literal("unusual_pattern")
    ),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    details: v.optional(v.any()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
  },
  returns: v.id("securityEvents"),
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("securityEvents", {
      ...args,
      createdAt: Date.now(),
    });
    return eventId;
  },
});
```

### Step 3: Detect Suspicious Prompts
Modify `convex/actions/agentRunner.ts`:
```typescript
import { internal } from "../_generated/api";

// Suspicious patterns to detect
const SUSPICIOUS_PATTERNS = [
  /ignore previous instructions/i,
  /system prompt/i,
  /admin override/i,
  /debug mode/i,
  /sql injection/i,
  /xss/i,
  /script.*alert/i,
  /eval\s*\(/i,
  /function\s*\(/i,
];

function detectSuspiciousPrompt(prompt: string): boolean {
  return SUSPICIOUS_PATTERNS.some(pattern => pattern.test(prompt));
}

async function extractIntent(prompt: string): Promise<IntentResult> {
  if (detectSuspiciousPrompt(prompt)) {
    await ctx.runMutation(internal.mutations.securityEvents.logSecurityEvent, {
      sessionId: job.sessionId,
      clerkUserId: job.clerkUserId,
      eventType: "suspicious_prompt",
      severity: "high",
      details: { prompt: prompt.substring(0, 200) }, // Store truncated prompt
    });
    throw new Error("Your request contains suspicious patterns and was blocked.");
  }
  // ... rest of function ...
}
```

### Step 4: Log Rate Limit Violations
Modify `convex/mutations/agentJobs.ts`:
```typescript
import { internal } from "../_generated/api";

export const createAgentJob = mutation({
  // ... existing args ...
  handler: async (ctx, args) => {
    const allowed = await ctx.runMutation(internal.mutations.rateLimits.checkRateLimit, {
      sessionId: args.sessionId,
      maxRequests: 10,
      windowMs: 5 * 60 * 1000,
    });
    
    if (!allowed) {
      await ctx.runMutation(internal.mutations.securityEvents.logSecurityEvent, {
        sessionId: args.sessionId,
        clerkUserId: (await ctx.auth.getUserIdentity())?.subject,
        eventType: "rate_limit_exceeded",
        severity: "medium",
        details: { attemptedAt: Date.now() },
      });
      throw new Error("Rate limit exceeded. Please try again in a few minutes.");
    }
    // ...
  },
});
```

### Step 5: Log Circuit Breaker Events
Modify `convex/lib/circuitBreaker.ts`:
```typescript
export async function recordFailure(
  ctx: GenericActionCtx<DataModel>,
  serviceName: string,
  error: Error
): Promise<void> {
  // ... existing code ...
  
  if (newFailureCount >= config.failureThreshold) {
    await ctx.db.patch(breaker._id, {
      state: "open",
      // ...
    });
    
    // Log circuit open event
    await ctx.runMutation(internal.mutations.securityEvents.logSecurityEvent, {
      sessionId: "system",
      clerkUserId: undefined,
      eventType: "circuit_opened",
      severity: "high",
      details: { 
        serviceName, 
        failureCount: newFailureCount,
        error: error.message,
      },
    });
  }
}
```

### Step 6: Create Detection Queries
Create `convex/queries/securityEvents.ts`:
```typescript
export const getRecentSecurityEvents = query({
  args: {
    limit: v.optional(v.number()),
    severity: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
  },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const limit = Math.min(100, args.limit ?? 50);
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    let q = ctx.db
      .query("securityEvents")
      .withIndex("by_severity_and_createdAt", (q) => q.gte("createdAt", oneDayAgo));
    
    if (args.severity) {
      q = q.filter(q => q.eq(q.field("severity"), args.severity));
    }
    
    return await q.order("desc").take(limit);
  },
});

export const getSuspiciousSessions = query({
  args: { minEventCount: v.optional(v.number()) },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    const minCount = args.minEventCount ?? 5;
    const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const events = await ctx.db
      .query("securityEvents")
      .withIndex("by_sessionId_and_createdAt", (q) => q.gte("createdAt", oneDayAgo))
      .collect();
    
    // Count events per session
    const sessionCounts = new Map<string, number>();
    for (const event of events) {
      const count = sessionCounts.get(event.sessionId) ?? 0;
      sessionCounts.set(event.sessionId, count + 1);
    }
    
    // Return sessions exceeding threshold
    return Array.from(sessionCounts.entries())
      .filter(([_, count]) => count >= minCount)
      .map(([sessionId, count]) => ({ sessionId, count }));
  },
});
```

### Step 7: Create Automated Alerting
Create `convex/actions/securityAlerts.ts`:
```typescript
export const checkForSuspiciousActivity = internalAction({
  handler: async (ctx) => {
    const criticalEvents = await ctx.runQuery(api.queries.securityEvents.getRecentSecurityEvents, {
      limit: 10,
      severity: "critical",
    });
    
    if (criticalEvents.length > 0) {
      console.error(`🚨 CRITICAL SECURITY EVENTS: ${criticalEvents.length}`);
      // TODO: Send webhook/email notification
    }
    
    const suspiciousSessions = await ctx.runQuery(api.queries.securityEvents.getSuspiciousSessions, {
      minEventCount: 10,
    });
    
    if (suspiciousSessions.length > 0) {
      console.error(`⚠️ SUSPICIOUS SESSIONS: ${suspiciousSessions.length}`);
      // TODO: Send notification with session details
    }
  },
});
```

### Step 8: Schedule Security Checks
```bash
bunx convex schedule run --every 15m internal.actions.securityAlerts.checkForSuspiciousActivity
```

## Testing Strategy

### Manual Testing
1. Trigger rate limit violation - verify event logged
2. Send suspicious prompt patterns - verify detection
3. Cause circuit to open - verify event logged
4. Query `getRecentSecurityEvents` - verify data

### Automated Testing
Create test in `tests/security-logging.test.ts`:
```typescript
describe("Security Event Logging", () => {
  it("should log rate limit violations", async () => {
    const t = convexTest();
    // Trigger rate limit
    // Verify security event created
  });
  
  it("should detect suspicious prompts", async () => {
    const t = convexTest();
    // Send "ignore previous instructions"
    // Verify event logged and request blocked
  });
});
```

## Monitoring Dashboard
TODO: Create security dashboard showing:
- Recent security events by severity
- Top suspicious sessions
- Event trends over time
- Circuit breaker status

## Alert Configuration
- Critical events: Immediate alert
- High severity: Alert within 5 minutes
- Multiple events from same session: Alert when >5 events/hour
