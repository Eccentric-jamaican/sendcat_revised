# Implementation Checklist: SOTA Agentic Product Discovery

Use this checklist to track progress through the 4 phases of implementation.

## Phase 1: Exa AI Integration (Days 1-3)

### API Setup
- [ ] Sign up for Exa AI account at https://dashboard.exa.ai/signup
- [ ] Add EXA_API_KEY to `.env.local`
- [ ] Verify free tier (1,000 searches/month) is sufficient for testing

### Code Implementation
- [ ] Create `convex/lib/exaSearch.ts` with Exa client
- [ ] Create `convex/actions/exaSearch.ts` action
- [ ] Update `convex/actions/search.ts` to support "exa" source
- [ ] Implement affiliate link extraction (Amazon, eBay)
- [ ] Add Exa results to `searchCache` table
- [ ] Implement eBay-first ranking algorithm
- [ ] Add Exa cost tracking to `costTracking` table

### Schema Updates
- [ ] Add `searchQueries` table to `convex/schema.ts`
- [ ] Add `sourcePlatform` field to `items` table
- [ ] Add `itemSources` table to `convex/schema.ts`

### Testing
- [ ] Test Exa API search functionality
- [ ] Test affiliate link generation
- [ ] Test eBay vs Exa result ranking
- [ ] Test parallel search execution (eBay + Exa)
- [ ] Verify cost tracking for Exa calls

### Integration
- [ ] Update `agentRunner.ts` to call Exa for "web" searches
- [ ] Add web search option to chat interface
- [ ] Test end-to-end web search flow

---

## Phase 2: Gemini Flash Vision Integration (Days 4-6)

### API Setup
- [ ] Verify OPENROUTER_API_KEY in `.env.local`
- [ ] Test Gemini Flash model availability via OpenRouter

### Code Implementation
- [ ] Create `convex/lib/vision.ts` with Gemini Flash client
- [ ] Create `convex/actions/analyzeImage.ts` action
- [ ] Implement query generation from vision results
- [ ] Add product identification confidence scoring
- [ ] Add category detection (clothing, electronics, etc.)

### Schema Updates
- [ ] Ensure existing `agentJobs` table supports vision metadata
- [ ] No new tables needed (images not persisted)

### Frontend Implementation
- [ ] Create `components/ui/image-upload.tsx` component
- [ ] Add drag-drop functionality
- [ ] Add camera capture button (mobile)
- [ ] Implement base64 image encoding
- [ ] Add image preview display
- [ ] Add loading states and error handling

### Testing
- [ ] Test image upload from file system
- [ ] Test drag-and-drop functionality
- [ ] Test camera capture on mobile
- [ ] Test vision model accuracy (product identification)
- [ ] Test generated search query relevance
- [ ] Verify no image data is persisted

### Integration
- [ ] Connect image upload to agent workflow
- [ ] Add clarifying questions for image inputs
- [ ] Implement "exact model vs similar" user choice
- [ ] Test end-to-end image search flow

---

## Phase 3: Enhanced Agent Orchestration (Days 7-8)

### Agent Logic Updates
- [ ] Update `agentRunner.ts` to handle `inputType: "image"`
- [ ] Add image-based intent extraction
- [ ] Implement multi-source result synthesis
- [ ] Add vision-based ranking boost
- [ ] Implement affiliate suggestion flow after web search

### Result Ranking
- [ ] Implement eBay-first ranking (monetization priority)
- [ ] Add Exa semantic scoring
- [ ] Add vision match confidence weighting
- [ ] Add user filter priority

### Clarifying Questions
- [ ] Keep existing text query clarifying (already working)
- [ ] Add image-specific clarifying questions
- [ ] Add "yes/no" response handling for affiliate suggestions

### Testing
- [ ] Test multi-source search (eBay + web)
- [ ] Test image → vision → search pipeline
- [ ] Test clarifying question flows
- [ ] Test affiliate suggestion click-through
- [ ] Verify ranking algorithm (eBay first, relevance second)

---

## Phase 4: SOTA UI/UX Improvements (Days 9-12)

### Component Creation
- [ ] Enhance `ProductCard` component with source badges
- [ ] Add trust signals (seller rating, domain badge)
- [ ] Add affiliate suggestion buttons
- [ ] Create `SearchSourceSelector` component
- [ ] Add "Check eBay" quick action buttons

### Visual Design
- [ ] Implement eBay-first visual prioritization
- [ ] Add clear source differentiation (icons, badges)
- [ ] Add loading states for multi-source searches
- [ ] Add error states for failed searches

### Image Upload UX
- [ ] Optimize drag-drop animations
- [ ] Add progress indicators for image upload
- [ ] Add "Analyze with AI" button states
- [ ] Display detected product info to user
- [ ] Show suggested search queries before searching

### Mobile Optimization
- [ ] Test image upload on mobile devices
- [ ] Test camera capture functionality
- [ ] Ensure touch-friendly buttons
- [ ] Optimize product cards for small screens

### Testing
- [ ] Cross-browser testing (Chrome, Safari, Firefox)
- [ ] Mobile device testing (iOS, Android)
- [ ] Accessibility testing (screen readers)
- [ ] Performance testing (large image uploads)
- [ ] User acceptance testing (real users)

---

## Deployment Checklist

### Pre-Deployment
- [ ] Run `npx convex dev` and verify no schema errors
- [ ] Run `bun run dev` and verify no build errors
- [ ] Test all API integrations locally
- [ ] Verify environment variables are set
- [ ] Review and update API quotas as needed

### Production Rollout
- [ ] Deploy Exa integration (web search only)
- [ ] Deploy image upload in staging environment
- [ ] Deploy multi-modal agent in staging
- [ ] Conduct final integration testing
- [ ] Deploy to production with feature flags

### Post-Deployment Monitoring
- [ ] Monitor Exa API usage and costs
- [ ] Monitor Gemini Flash API usage
- [ ] Track affiliate suggestion conversion rates
- [ ] Monitor search latency and success rates
- [ ] Set up alerts for API failures

---

## Success Metrics to Track

### Phase 1 (Exa)
- Target: Web search accuracy > 85%
- Target: Latency < 2s for search results
- Target: eBay-first ranking compliance > 95%
- Target: Affiliate link generation rate > 90%

### Phase 2 (Vision)
- Target: Product identification accuracy > 80%
- Target: Image processing time < 3s
- Target: Generated query relevance > 90%
- Target: User satisfaction with vision flow > 4/5

### Phase 3 (Agent)
- Target: Clarifying question response rate > 70%
- Target: Affiliate suggestion click-through > 15%
- Target: Multi-source result quality score > 4/5
- Target: End-to-end search time < 5s

### Phase 4 (UI)
- Target: Image upload success rate > 95%
- Target: Mobile completion rate > 90%
- Target: Average task completion time < 30s
- Target: User satisfaction score > 4.2/5

---

## Notes & Issues

### Phase 1 Issues
- (Document any issues encountered during Exa integration)

### Phase 2 Issues
- (Document any issues during vision integration)

### Phase 3 Issues
- (Document any issues during agent orchestration)

### Phase 4 Issues
- (Document any issues during UI improvements)

---

**Last Updated**: 2025-01-XX
**Next Phase**: After Phase 1 completion, proceed to Phase 2
