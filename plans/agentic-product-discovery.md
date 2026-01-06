# SOTA Agentic Product Discovery Workflow

**Status**: Planning Phase  
**Timeline**: ~10-12 days  
**Cost Impact**: ~$1-2/user/month in additional API costs

---

## 🎯 Executive Summary

Build a state-of-the-art agentic product discovery platform that helps Jamaican shoppers find products they can't easily locate elsewhere.

### Core Capabilities
- **Multi-Modal Input**: Text queries + Image uploads (visual search)
- **Multi-Source Search**: eBay API + Exa AI web search in parallel
- **Smart Disambiguation**: Agent asks clarifying questions before searching
- **Broad Discovery**: Web search across entire internet (not limited to e-commerce)
- **Affiliate-First Flow**: Prioritize eBay results for monetization
- **Vision-Powered**: Use Gemini Flash for image recognition
- **Cost-Optimized**: No unnecessary image/chat storage

---

## 📋 Implementation Phases

### Phase 1: Exa AI Integration (Days 1-3)

#### Objective
Add semantic web search capability to complement existing eBay API.

#### Changes Required

**New Files:**
```
convex/lib/exaSearch.ts          # Exa API client
convex/actions/exaSearch.ts          # Exa Convex action
```

**Schema Updates (`convex/schema.ts`):**
- Add `searchQueries` table to track queries and sources used
- Extend `items` table with `sourcePlatform` field (ebay/exa/web)
- Add `itemSources` tracking table

**Key Features:**
- Semantic search with Exa's neural API
- Search with highlights for better UX
- Query refinement suggestions
- Content extraction for discovered product pages
- Affiliate link detection from web results

#### Implementation Steps

1. Create Exa API client with retry logic
2. Integrate `searchSource` action to support `exa` source
3. Run eBay and Exa searches in parallel
4. Normalize Exa results to match eBay item structure
5. Implement eBay-first ranking algorithm
6. Add affiliate suggestion flow after web search

#### Success Criteria
- [ ] User can search web via chat
- [ ] Results include both eBay and web sources
- [ ] eBay results ranked first
- [ ] Affiliate suggestion prompts displayed after web search
- [ ] Cost tracking for Exa API calls

---

### Phase 2: Gemini Flash Vision Integration (Days 4-6)

#### Objective
Enable visual product discovery using uploaded images.

#### Changes Required

**New Files:**
```
convex/lib/vision.ts               # Gemini Flash API client
convex/actions/analyzeImage.ts       # Image analysis Convex action
```

**Schema Updates:**
- No persistent tables needed (images processed and discarded)
- Use existing `agentJobs` to track visual search sessions
- Add vision analysis to `intent` field in jobs

#### Vision Workflow
```
User Uploads Image
    ↓
[Temporary Storage] - Store in memory/Vercel Blob (not persisted)
    ↓
[Analyze Image] - Call Gemini Flash API to extract:
    - Product name/description
    - Brand (if visible)
    - Color, size, condition
    - Unique identifiers (barcodes, model numbers)
    - Style category (clothing, electronics, etc.)
    ↓
[Generate Search Queries] - Create optimized searches:
    - Primary: Exact product detected
    - Variations: Alternative terms, related models
    - eBay-specific: Format for Browse API
    ↓
[Parallel Search] - eBay + Exa with multiple queries
    ↓
[Present Results] - Show what was detected + found products
    ↓
[Prompt eBay Search] - "Would you like me to search eBay for this item?"
```

#### Key Design Decisions
- **No Image Storage**: Process immediately, don't persist (cost optimization)
- **No Chat History with Images**: Purchase history at retailer is sufficient
- **Gemini Flash**: Faster and better at spatial recognition than GPT-4o
- **OpenRouter Integration**: Route through OpenRouter for unified API management

#### Success Criteria
- [ ] Users can upload images via drag-drop
- [ ] Vision model accurately identifies products
- [ ] Generated search queries are relevant
- [ ] Results include eBay suggestion flow
- [ ] No image data persisted to database

---

### Phase 3: Enhanced Agent Orchestration (Days 7-8)

#### Objective
Update agent to handle multi-modal inputs and multi-source results.

#### Changes Required

**Modify Files:**
```
convex/actions/agentRunner.ts     # Add image handling, multi-source synthesis
convex/lib/resultSynthesizer.ts # NEW: Multi-source ranking
```

**New Intent Types:**
```typescript
type IntentResult = {
  // Existing
  intent: "product_search";
  query: string;
  filters?: Filters;

  // NEW
  inputType?: "text" | "image";
  imageUrl?: string; // Temporary, not persisted
  detectedProductInfo?: {
    productName: string;
    brand?: string;
    color?: string;
    size?: string;
    category?: string;
    confidence?: number;
  };
};
```

#### Enhanced Clarifying Questions
- **Text Queries**: Keep current approach (already SOTA)
- **Image Queries**:
  - "I detected this is [product]. Would you like me to search for the exact model or open to similar alternatives?"
  - "What color/size/condition are you looking for?"

#### Multi-Source Ranking Algorithm
```typescript
function rankResults(results: SearchResult[]): RankedResult[] {
  return results.sort((a, b) => {
    // Priority 1: eBay results (monetization priority)
    if (a.source === 'ebay' && b.source === 'web') return -1;
    if (a.source === 'web' && b.source === 'ebay') return 1;

    // Priority 2: Vision-based exact matches
    if (a.fromVision && !b.fromVision) return -1;

    // Priority 3: Relevance score from Exa (semantic matching)
    if (b.exaScore && a.exaScore) return b.exaScore - a.exaScore;

    // Priority 4: User filters (price, condition, etc.)
    // Priority 5: Availability and seller rating
  });
}
```

#### Affiliate Suggestion Flow
```typescript
async function checkAffiliateSuggestion(results: SearchResult[]): Promise<void> {
  const hasWebResults = results.some(r => r.source === 'web');
  const hasEbayResults = results.some(r => r.source === 'ebay');

  if (hasWebResults && !hasEbayResults) {
    await ctx.runMutation(internal.mutations.agentJobs.appendAssistantMessage, {
      content: "Would you like me to search eBay for this item? (yes/no)",
      expectingAffiliateResponse: true,
    });
  }
}
```

#### Success Criteria
- [ ] Agent handles both text and image inputs
- [ ] Clarifying questions work for image uploads
- [ ] Multi-source results ranked eBay-first
- [ ] Affiliate suggestion appears after web-only results
- [ ] Yes/No responses to affiliate prompts handled

---

### Phase 4: SOTA UI/UX Improvements (Days 9-12)

#### Objective
Create modern, intuitive interface for multi-modal product discovery.

#### New Components

**Image Upload Component:**
```tsx
// convex/components/ui/image-upload.tsx
interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  onAnalyze: (imageUrl: string) => Promise<void>;
}

<DropZone onDrop={handleImageUpload}>
  <CameraButton onClick={handleCameraCapture} />
  <FileInput accept="image/*" />
</DropZone>
```

**Enhanced Product Card:**
```tsx
// convex/components/ui/product-card.tsx
interface ProductCardProps {
  item: SearchResult;
  showSourceBadge: boolean;
  onBuyClick: () => void;
}

<ProductCard>
  <SourceBadge>
    {source === 'ebay' ? 'eBay ✓' : 'Web Search'}
  </SourceBadge>

  <ProductImage src={imageUrl} />

  <ProductInfo>
    <Title>{title}</Title>
    <Price>${price}</Price>
    {condition && <Condition>{condition}</Condition>}
  </ProductInfo>

  <TrustSignals>
    {source === 'ebay' && (
      <SellerRating>
        {feedbackPercent}% positive ({feedbackScore} reviews)
      </SellerRating>
    )}
    {source === 'web' && <DomainBadge>{extractDomain(url)}</DomainBadge>}
  </TrustSignals>

  <Actions>
    <BuyButton onClick={onBuyClick}>
      Buy on {source === 'ebay' ? 'eBay' : 'Merchant Site'}
    </BuyButton>
    {source === 'web' && (
      <SearchEbayButton onClick={handleEbaySearch}>
        🔍 Check eBay for this item
      </SearchEbayButton>
    )}
  </Actions>
</ProductCard>
```

**Search Source Selector:**
```tsx
// convex/components/ui/search-source-selector.tsx
<SearchSourceSelector>
  <Option value="ebay">
    <Icon name="eBay" />
    <Label>eBay</Label>
  </Option>
  <Option value="web">
    <Icon name="Globe" />
    <Label>Web Search</Label>
  </Option>
  <Option value="both">
    <Icon name="Multi" />
    <Label>All Sources</Label>
  </Option>
</SearchSourceSelector>
```

#### Success Criteria
- [ ] Image upload with drag-drop works
- [ ] Camera capture functional on mobile
- [ ] Product cards show source badges
- [ ] eBay results visually prioritized
- [ ] Affiliate suggestion buttons work
- [ ] Responsive design for all screen sizes

---

## 🔧 Technical Architecture

### API Integration Strategy

**Exa AI API:**
```typescript
// convex/lib/exaSearch.ts
const EXA_API_KEY = process.env.EXA_API_KEY;
const EXA_BASE_URL = 'https://api.exa.ai';

export async function searchExa(params: {
  query: string;
  numResults?: number; // default 10
  highlights?: boolean; // default true for better UX
  contents?: {
    text?: boolean;
    maxCharacters?: number;
  };
  category?: 'company' | 'paper' | 'news' | 'github' | 'tweet' | 'movie' | 'song' | 'book' | 'profile' | 'law';
}) {
  const response = await fetch(`${EXA_BASE_URL}/search`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EXA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: params.query,
      numResults: params.numResults ?? 10,
      highlights: params.highlights ?? true,
      contents: params.contents ?? { text: true },
      category: params.category,
    }),
  });

  const data = await response.json();
  return normalizeExaResults(data);
}
```

**Gemini Flash Vision:**
```typescript
// convex/lib/vision.ts
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
// Using OpenRouter for unified management
const GEMINI_MODEL = 'google/gemini-2.0-flash-exp';

export async function analyzeImage(imageUrl: string): Promise<VisionAnalysis> {
  const response = await fetch(`${OPENROUTER_BASE_URL}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GEMINI_MODEL,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this product image. Return: 1) Product name 2) Brand 3) Color 4) Size/condition 5) Category. Be specific and concise.',
            },
            {
              type: 'image_url',
              image_url: imageUrl,
            },
          ],
        },
      ],
    }),
  });

  const data = await response.json();
  return parseVisionResponse(data);
}
```

### Schema Updates

**New Tables in `convex/schema.ts`:**
```typescript
export default defineSchema({
  // ... existing tables ...

  // Track search queries and sources used
  searchQueries: defineTable({
    sessionId: v.string(),
    jobId: v.id("agentJobs"),
    queryType: v.union(v.literal("text"), v.literal("image")),
    sourcesUsed: v.array(v.string()), // ["ebay", "exa"]
    clarifyingQuestionsAsked: v.optional(v.array(v.string())),
    detectedEntities: v.optional(v.array(v.string())), // From vision
    affiliateSuggestionShown: v.optional(v.boolean()),
    affiliateSuggestionResponse: v.optional(v.union(v.literal("yes"), v.literal("no"))),
    createdAt: v.number(),
  })
    .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"])
    .index("by_jobId", ["jobId"]),

  // Visual search sessions (no persistent image storage)
  visualSearches: defineTable({
    sessionId: v.string(),
    clerkUserId: v.optional(v.string()),
    jobId: v.id("agentJobs"),
    visionAnalysis: v.optional(v.any()), // What model detected (not image itself)
    generatedQueries: v.array(v.string()),
    matchedItemIds: v.optional(v.array(v.id("items"))),
    completedAt: v.number(),
  })
    .index("by_sessionId_and_createdAt", ["sessionId", "createdAt"])
    .index("by_clerkUserId_and_createdAt", ["clerkUserId", "createdAt"]),
});
```

### Cost Tracking

**Extend existing `costTracking` table:**
```typescript
costTracking: defineTable({
  // ... existing fields ...

  // NEW fields
  provider: v.union(
    v.literal("openrouter"),
    v.literal("exa"),
    v.literal("gemini"),
    v.literal("ebay") // track eBay API costs too
  ),
  operationType: v.union(
    v.literal("intent_parsing"),
    v.literal("response_generation"),
    v.literal("image_analysis"),
    v.literal("web_search"),
    v.literal("product_search")
  ),
})
```

---

## 💰 Cost Analysis

### Per Active User (50 queries/month + 5 image searches)

**Exa AI:**
- 50 web searches × $0.02 = $1.00/month
- Free tier covers 1,000 searches/month (good buffer)

**Gemini Flash Vision:**
- 5 image analyses × ~$0.001 = $0.005/month
- Significantly cheaper than GPT-4o Vision (~$0.01)

**OpenRouter (LLM):**
- Already budgeted in existing flow
- Slight increase for vision-related generation

**Total Additional Cost**: ~$1.05/user/month

### Scaling to 1,000 Active Users
- Exa: 1,000 × $0.02 = $20/month (need paid tier)
- Gemini: 1,000 × $0.001 = $1/month
- **Total**: ~$21/month for 1K users

---

## ✅ Success Metrics

### Phase 1 (Exa)
- Web search accuracy > 85% (relevant results)
- Latency < 2s for search results
- eBay-first ranking compliance > 95%

### Phase 2 (Vision)
- Product identification accuracy > 80%
- Image processing time < 3s
- Generated query relevance > 90%

### Phase 3 (Agent)
- Clarifying question response rate > 70%
- Affiliate suggestion click-through > 15%
- Multi-source result quality score > 4/5

### Phase 4 (UI)
- Image upload success rate > 95%
- Mobile completion rate > 90%
- User satisfaction score > 4.2/5

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
tests/
  ├── exa-search.test.ts          // Exa API client
  ├── vision-gemini.test.ts       // Vision API client
  ├── result-synthesizer.test.ts // Ranking algorithm
  └── agent-runner-multimodal.test.ts // End-to-end flows
```

### Integration Tests
- Test parallel eBay + Exa searches
- Test image upload → vision → search pipeline
- Test affiliate suggestion flow
- Test multi-source ranking

### Manual Testing Checklist
- [ ] Web search returns relevant results
- [ ] Image upload correctly identifies products
- [ ] Affiliate suggestions appear when expected
- [ ] eBay results rank higher than web
- [ ] All user inputs handled gracefully

---

## 🚀 Deployment Checklist

### Pre-Deployment
- [ ] Sign up for Exa API key
- [ ] Configure Gemini Flash via OpenRouter
- [ ] Set up cost monitoring
- [ ] Update rate limits for Exa API
- [ ] Test image upload endpoint
- [ ] Verify affiliate link generation

### Rollout Plan
- **Week 1**: Exa integration (text search only)
- **Week 2**: Vision model integration (image upload in dev)
- **Week 3**: Multi-modal agent (combine both in staging)
- **Week 4**: UI polish and public beta

### Post-Deployment
- [ ] Monitor Exa API costs
- [ ] Track affiliate suggestion conversion
- [ ] A/B test eBay-first ranking
- [ ] Gather user feedback on vision search
- [ ] Optimize vision prompts based on results

---

## 📚 Related Documentation

- Exa AI: https://docs.exa.ai
- Gemini Flash: https://ai.google.dev/gemini-api/docs/models/gemini
- OpenRouter: https://openrouter.ai/docs
- Convex Actions: https://docs.convex.dev/actions

## 🔑 Environment Variables Required

Add these to your `.env.local`:

```bash
# Exa AI for Web Search
EXA_API_KEY=your_exa_api_key_here

# Gemini Flash Vision (via OpenRouter)
# OPENROUTER_API_KEY and OPENROUTER_BASE_URL already configured
# Just need to use the gemini-2.0-flash-exp model

# Existing (keep these)
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
EBAY_CLIENT_ID=your_ebay_client_id
EBAY_CLIENT_SECRET=your_ebay_client_secret
```

### Getting API Keys

1. **Exa AI**: https://dashboard.exa.ai/signup
   - Free tier: 1,000 searches/month
   - Paid: ~$0.01-0.05 per search

2. **Gemini Flash**: Use via OpenRouter (no separate signup needed)
   - Already using OpenRouter
   - Just specify `google/gemini-2.0-flash-exp` model

---

**Last Updated**: 2025-01-XX
**Next Review**: After Phase 1 completion
