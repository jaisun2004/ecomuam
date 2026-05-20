## Scope

Seven targeted changes. Presentation/mock-data only — no schema, routing, or context changes.

---

### 1. Re-skin mock data: Beverages category, PepsiCo on ME platforms

- **Own brand**: **PepsiCo** (SKUs across its beverage portfolio: Pepsi 330ml/1L/2.25L, 7UP 1L, Mirinda Orange 1L, Mountain Dew 1L, Aquafina 500ml/1.5L, Lipton Ice Tea Peach 320ml, Tropicana Orange 1L, Gatorade Blue 500ml).
- **Competitors**: Coca-Cola, Almarai, Rauch, Lacnor, Masafi.
- **Platforms** (canonical list used across every view): **Talabat**, **Noon**, **Noon Minutes**, **Carrefour**.
  - National-style (aggregate): Noon, Carrefour.
  - Q-Commerce (pincode/area granularity): Talabat, Noon Minutes.
- **Geography**: Dubai (Downtown, Marina, JLT, Deira), Abu Dhabi (Khalifa City, Al Reem), Sharjah (Al Nahda), Riyadh (Olaya, Al Malqa), Jeddah (Al Hamra), Doha (West Bay), Kuwait City (Salmiya). Short area codes in place of pincodes.
- **Currency**: ₹ → **AED** globally.
- **Platform colors** (remap, keep existing token style): Talabat → orange `#FF5A00`, Noon → yellow `#FEEE00`, Noon Minutes → magenta `#E91E63`, Carrefour → blue `#0E4C92`.
- **Files touched** (mechanical string + array swaps, no structural change):
  - Views: `BudgetOptimiserView`, `AvailabilityView`, `PricingView`, `MarketShareView`, `CampaignView`, `KeywordAnalysisView`, `RecommendationsView`, `DiscoveryView`, `CompetitorAdsView`, `CompetitorsView`, `ShelfView`, `ContentAuditView`, `CategoryAssortmentView`, `BestsellerIntelligenceView`, `CategoryWhitespaceView`, `FestivalCampaignsView`, `CampaignReportsView`, `CentralCockpitView`, `WarRoomView`, `AlertsView`, `ApprovalFlowView`, `OfflineAdsView`, `GuardrailsView`, `StrategicPlanningView`, `CrawlingInputsView`, `TaxonomyConfigView`, `ContentAuditSkuDetailView`, `ReportsView`, `AccountView`.
  - `src/components/sections/*` panels.
  - `src/contexts/GuardrailContext.tsx` if it carries platform labels.
- `src/components/IndiaMap.tsx` → relabel to "MENA Coverage", reposition pins to ME cities within existing SVG viewBox (cosmetic only, kept lightweight).

---

### 2. Budget Optimiser — new "Standardised Optimisation Rules" panel

New `PanelCard title="Standardised Optimisation Rules"` in `src/views/BudgetOptimiserView.tsx`, slotted between existing reallocation visuals.

Rendered as toggleable rule cards (shadcn `Switch`, defaults: first two ON):
- **No competition on keyword → reduce bid 20%** (trigger: SoV competitors = 0 for 3d).
- **3+ competitors OOS → reduce both budget −30% and bid −15%**.
- **Own SKU OOS in pincode → pause campaign there**.
- **CTR > 2× category avg AND ROAS > 3.5 → raise bid +15%, budget +20%**.
- **CPC drops 25% w/w → hold budget, raise bid +10%** (cheaper auction).
- **New competitor SKU enters top 10 → defensive bid +25% on branded keywords**.

Each card: rule name, one-line "Why", inline impact estimate ("Affects 4 campaigns · ~AED 1.2K/wk"), and `Switch`. Local state only.

---

### 3. Budget Optimiser — new "Campaign Recommendations" panel

Another `PanelCard title="Campaign Recommendations"` in the same view. Feed of 5–6 cards, each:
- Campaign name (mono), platform chip.
- Suggested change pill: "↑ Budget +AED 800/day", "↓ Bid −12%", "Pause", "Shift AED 500 → Noon Minutes".
- One-liner rationale ("Talabat ROAS 4.2x vs goal 3.0x — capacity headroom").
- `Apply` (primary) + `Dismiss` (ghost). Apply fires a toast; local state only.

Mock examples mix Talabat / Noon / Noon Minutes / Carrefour and PepsiCo SKUs.

---

### 4. Availability — replace "Stock-out Forecast" panel

In `src/views/AvailabilityView.tsx`, remove the `Stock-out Forecast` panel (~lines 300–325) and replace with:

**New panel: "Replenishment Lead-Time Heatmap"**
- Rows = top 6 PepsiCo SKUs.
- Cols = 4 platforms (Talabat, Noon, Noon Minutes, Carrefour).
- Cell = days-to-restock with color tier (green ≤1d, amber 2–3d, red ≥4d) and small `Truck` icon when in-transit.
- Click cell → toast "Restock task created for {SKU} on {Platform}".

Uses existing semantic tier tokens.

---

### 5. Availability/Analytics — replace "Competition Availability vs Yours"

Same file, remove the panel at line 449 and replace with:

**New panel: "Competitor Low-Availability — Auto Campaign Triggers"**
- Table by city: City · # competitor SKUs OOS · Your availability % · Suggested campaign (e.g. "Boost Pepsi 330ml — Dubai Marina") · Status chip (`Triggered` / `Pending`).
- Rows where competitor OOS ≥3 SKUs and own avail ≥85% show an auto-triggered badge with `Zap` icon and `MapPin`.
- "Trigger All Pending" button at top-right (toast on click).

---

### 6. Pricing — replace "Active Price Alerts" with campaign-actionable insight

In `src/views/PricingView.tsx`, swap `Active Price Alerts` (~line 280) for:

**New panel: "Price-Driven Campaign Opportunities"** — each row is an insight that can trigger a campaign action:
- "Pepsi 1L is 12% cheaper than Coca-Cola on Noon Minutes → **Launch Price-Win Campaign**" (`Megaphone`).
- "Lacnor raised price 8% on Talabat → **Increase bid on competing keywords**".
- "Aquafina 1.5L underpriced vs market by 15% on Carrefour → **Cap discount, redirect spend**".
- "Tropicana OJ matches Almarai on Noon — **Hold pricing, push share-of-shelf**".
Each row: insight (1 line), Δ chip, platform chip, primary CTA → toast.

---

### 7. Pricing — Platform Price Index flip toggle

On the existing **Platform Price Index** panel header, add a segmented toggle:

- **`Competitors`** (default — current visual: own SKU vs competitor avg across platforms).
- **`Own SKU × Platforms`** (new): a `Select` to pick one PepsiCo SKU; chart shows that single SKU's price line across all 4 platforms over time (one series per platform using platform colors).

Implementation: keep existing Recharts container; swap data series + lines based on toggle state. SKU select only renders in the second mode.

---

## Technical notes

- Presentation-only. No new contexts, hooks, or routes.
- Reuse `PanelCard`, shadcn `Switch`, `Select`, `Badge`, `Button`, `useToast`, tier tokens.
- Re-skin (#1) is large in line-count but mechanical — search-replace SKU/platform/city/currency strings.
- Lucide icons added where missing: `Truck`, `Megaphone`, `MapPin`, `Zap`.
- Each new/replaced panel keeps its grid slot and `delay` prop so layout density is preserved.

## Out of scope

- Arabic / RTL translation.
- Real lat/lng accuracy for ME cities (cosmetic pins only).
- Backend, persistence, schema.
- Any change to KeywordAnalysisView / CampaignView review-dialog logic from prior turns.
