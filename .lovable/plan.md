

# Add Subjective Context to KPI Card Subtexts

## What changes

Update the `sub` (sw/KPICard) and `changeLabel` (KPICard) text on every KPI card across all screens to include a brief subjective reason explaining **why** the metric changed or whether the change is **good or bad**. Cards that are actionable (e.g., "Click to pause OOS campaigns", "Flagged for budget reduction", "6 reallocation recommendations") keep their existing subtext unchanged.

## Files and changes

### `src/views/AvailabilityView.tsx` (4 cards, 1 actionable — keep "Ad Budget Wasted" sub)
| Card | Current sub | New sub |
|------|------------|---------|
| Overall Availability | Across 5 platforms · 6 SKUs | **Dropped due to Flipkart OOS surge — needs attention** |
| OOS Products Today | Products currently out of stock | **Stockout spike from delayed replenishment — critical** |
| Darkstore Gaps | Across 3 cities · Q-Commerce | **Listing gaps widening — lost discoverability in key cities** |
| Ad Budget Wasted | Click to pause OOS campaigns | *(unchanged — actionable)* |

### `src/views/MarketShareView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Overall Category Share | **Growing — new keyword wins driving incremental share** |
| Rank in Category | **Positive — ad + organic improvements closing gap with Parle** |
| Fastest Growing Competitor | **Risk — ITC gaining via aggressive Blinkit & Zepto push** |
| Platform Where You Lead | **Strong — Flipkart dominance from better pricing + content** |

### `src/views/PricingView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Price Competitiveness | **Good — competitive positioning maintained across SKUs** |
| Price Changes (24h) | **Monitor — competitor price cuts may erode your margin** |
| Avg Price Index | **Caution — slightly above market; may impact conversion** |
| Conversion at Risk | **Bad — overpriced SKUs losing click-to-buy rate** |

### `src/views/DiscoveryView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Trending Keywords | **Good — early capture opportunity on rising search terms** |
| Competition Rank Improved | **Risk — competitors climbing on your core keywords** |
| New Keywords on Ad Manager | **Positive — AI surfaced untapped high-intent terms** |
| Overall Share of Shelf | **Improving — better organic rank boosting shelf presence** |

### `src/views/CampaignView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Total Ad Spend (30D) | **Spend up due to new campaign launches — on track** |
| Blended ROAS | **Healthy — budget reallocation improving efficiency** |
| AI-Optimised Budget | **Good — auto-shifting spend from low-ROAS campaigns** |
| Impressions (30D) | **Growing — higher bids + new keywords driving visibility** |

### `src/views/CampaignReportsView.tsx` (5 cards)
| Card | New sub |
|------|---------|
| Total Spend (30D) | **Up from new campaign activations — within budget** |
| Blended ROAS | **Improving — underperformers paused, winners scaled** |
| Total Impressions | **Healthy growth — broader keyword coverage driving reach** |
| Avg CTR | **Strong — above industry avg, creative refresh working** |
| Avg CPC | **Good — lower CPC from better quality scores** |

### `src/views/CompetitorsView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Competitors Tracked | **New entrants detected — expanding monitoring coverage** |
| Price Changes (24h) | **Watch — competitor price drops may trigger share loss** |
| Share of Voice | **Positive — ad spend efficiency improving visibility** |
| Your Price Position | **Good — price-value perception strong vs competitors** |

### `src/views/CompetitorAdsView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Competitors Tracked | **Active monitoring — no blind spots in ad landscape** |
| Budget Exhaustions (24h) | **Opportunity — capture their lost impressions now** |
| Keyword Poaching Opps | **Good — uncontested brand keywords available for conquest** |
| Est. Competitor Spend | **Risk — competitors increasing investment aggressively** |

### `src/views/ShelfView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Shelf Health Score | **Dropped — OOS and content gaps pulling score down** |
| OOS Products Today | **Bad — replenishment delays impacting 2 platforms** |
| Share of Search | **Positive — improved keyword bidding lifting presence** |
| Content Score Avg | **Needs work — outdated images and titles on 11 SKUs** |

### `src/views/ContentAuditView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Avg Content Score | **Driven by image quality gaps on newer listings** |
| SKUs Below 60 | **Critical — poor content directly impacts conversion rate** |
| Competitor Content Stronger | **Risk — competitors investing in A+ content aggressively** |
| Last Audit | *(check if actionable — if not, add context)* |

### `src/views/BudgetOptimiserView.tsx` (4 cards, 2 actionable)
| Card | New sub |
|------|---------|
| Budget to Reallocate | 6 reallocation recommendations *(unchanged — actionable)* |
| Projected ROAS Gain | **Good — shifting budget to high-performers drives efficiency** |
| Conversion Uplift | **Positive — reallocating to top campaigns lifts volume** |
| Underperforming Campaigns | Flagged for budget reduction *(unchanged — actionable)* |

### `src/views/KeywordAnalysisView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Tracked Keywords | **Coverage across selected platform keywords** |
| Page 1 (Organic) | **Good if all on page 1; otherwise needs SEO push** |
| Avg Share of Search | **Improving — better ad placements boosting share** |
| Spend Reducible | **Good — strong organic rank means ad savings possible** |

### `src/views/CategoryWhitespaceView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| White-space Opportunities | **Good — new gaps opening from competitor exits** |
| Sub-category Gaps | **Moderate — product line expansion recommended** |
| Total Addressable Search | **Large — high uncontested demand volume available** |
| Avg Competition | **Favorable — low barriers to entry in gap areas** |

### `src/views/FestivalCampaignsView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Upcoming Festivals | **Plan ahead — early campaign setup improves ROAS** |
| Pre-built Campaigns | **Ready — AI-optimised campaigns reduce setup time** |
| Avg Festival ROAS | **Strong — festivals consistently outperform regular periods** |
| Total Planned Spend | **Allocated — deploy selectively based on inventory** |

### `src/views/OfflineAdsView.tsx` (4 cards)
| Card | New sub |
|------|---------|
| Online ROAS | **Healthy — online channels performing well** |
| Offline Opportunity | **Good — large untapped offline revenue potential** |
| Est. Blended ROI | **Positive — combined online + offline boosts total return** |
| Cities to Target | **Strategic — high online penetration signals offline demand** |

### `src/views/ReportsView.tsx` (5 cards — dynamic values, update sub only)
| Card | New sub |
|------|---------|
| Availability % | **Reflects stock health across all connected platforms** |
| Share of Search | **Trend driven by keyword bid and content changes** |
| Sponsored Rank | **Weighted by spend — stable indicates consistent bidding** |
| Organic Rank | **Reflects SEO and content quality across keywords** |
| ROAS | **Blended efficiency — higher means better spend utilisation** |

### Section KPICards (`src/components/sections/*.tsx` — uses `changeLabel` prop)

**DashboardSection.tsx** (4 cards):
- In-Stock Rate: `changeLabel` → **"Improving — fewer OOS events this month"**
- Price Competitiveness: → **"Good — within 5% of competition pricing"**
- Market Share: → **"Growing — ad + organic gains driving share"**
- Content Score: → **"Declining — search page listings need refresh"**

**AdOptimisationSection.tsx** (4 cards):
- Avg ROAS: → **"Improving — bid optimisation paying off"**
- Monthly Spend: → **"Good — reduced without losing performance"**
- Active Campaigns: `changeLabel` unchanged → "across platforms" *(neutral/informational)*
- Est. Clicks: → **"Healthy growth from better targeting"**

**PricingSection.tsx** (4 cards):
- Avg Selling Price: → **"Slight increase — within acceptable range"**
- MAP Violations: → **"Improving — enforcement reducing violations"**
- Price Competitiveness: → **"Good — maintaining competitive position"**
- Margin Opportunity: → **"Positive — margin upside from pricing corrections"**

**AvailabilitySection.tsx** (4 cards):
- In-Stock Rate: → **"Improving — replenishment cycles tightening"**
- OOS SKUs: → **"Good — fewer stockouts than last period"**
- *(remaining 2 cards — update similarly)*

**CategoryRecommendationSection.tsx** (3 cards):
- Top Opportunity Score: → **"High — strong whitespace for new variant"**
- Category Growth: → **"Positive — category expanding quarter over quarter"**
- Whitespace Gaps: → **"Actionable — ready for product line expansion"**

## Implementation approach
- Simple string replacement of `sub=` and `changeLabel=` values across ~20 files
- No component logic or styling changes
- Actionable cards (containing "Click to", "Flagged for", "reallocation recommendations") are left untouched

