
## Governance Module Revamp

### 1. Data model (`src/views/governance/types.ts` + `mockData.ts`)

Add e-commerce/q-commerce placement primitives shared across audit + creative screens.

- New type `PlacementSurface = "Homepage Hero" | "Homepage Carousel" | "Category Page Banner" | "Category Top Slot" | "Featured Banner" | "Search Top" | "Brand Shelf" | "PDP Cross-sell"`.
- Extend `CreativeCheck` with:
  - `surface: PlacementSurface`
  - `slot: string` (e.g. "Slot #1", "Position 3")
  - `state: "active" | "preflight"` — preflight = scheduled/pending go-live
  - `platformChecks: { spec: string; required: string; actual: string; pass: boolean }[]` (aspect ratio, file size, safe-zone, max text %, resolution)
  - `brandChecks: { guideline: string; expected: string; actual: string; pass: boolean }[]` (logo placement + min size, product name visibility, mandatory disclaimer, colour palette, approved font)
- Extend `Violation` with `severityScore` derived label already exists; add `impact: "spend_at_risk" | "brand_risk" | "policy"` for grouping.
- New type `CompetitorBanner`:
  - `competitor, brand, platform, surface, slot, creativeThumb (placeholder), shareOfVoice (%), estSpendIndex, daysLive, ownEquivalent?: { slot, shareOfVoice }`.
- Seed ~12 creatives spanning 3 surfaces × active/preflight × biscuit SKUs, and ~10 competitor banners (Britannia vs Parle vs Sunfeast) across Blinkit, Zepto, Instamart, Amazon, Flipkart with own-vs-comp positional + SoV comparison.

### 2. Campaign Audit — `GovernanceAuditView.tsx`

Restructure into three stacked sections under existing filters.

**A. Breach Summary strip** (new, top)
- 3 severity tiles: Critical / Warning / Info with counts, tinted borders, click to filter table.
- Small distribution bar showing breach categories (Geo, Tracking, Frequency, Placements, Naming, Objective).

**B. Breaches table** (existing, upgraded)
- Left-border colour by severity, severity chip enlarged.
- New "Impact" column (spend_at_risk / brand_risk / policy).
- Group toggle: by Campaign vs by Severity.

**C. Active Campaign Performance** (new)
For every currently-live campaign in `seedPlans`, show a compact row:
- Campaign, Platform, Spend MTD, ROAS, CTR, Pacing % vs plan, Breach count chip (links to filter above).
- Sparkline of last 7d spend.
- Colour cue when pacing <80% or >120%, or when campaign has any critical breach.
- Data mocked deterministically from campaign id.

**D. Competition Analysis** (new subsection, collapsible)
- Filter by Platform + Surface.
- Table columns: Competitor, Surface, Slot, Creative (thumb), Days Live, Competitor SoV, Own Slot on same surface, Own SoV, Positional verdict ("Beating" / "Behind" / "Not present"), Share verdict.
- Summary tiles above: Surfaces where own brand leads / trails / absent.
- Row action: "Plan counter-banner" → toast stub.

### 3. Creative Compliance — `GovernanceCreativeView.tsx`

Reframe from "served vs approved" diff to a **placement-aware validation console** covering both live and pre-flight creatives against platform specs and brand guidelines.

**Header controls**
- Tabs: `Active` | `Preflight` (default Active).
- Filters: Publisher, Surface (Homepage / Category / Featured Banner / …), Result (Pass / Fail / Warning).
- KPI row: Total creatives · Passing · Platform-spec fails · Brand-guideline fails · Preflight blockers.

**Grouping**
- Group by **Surface** first (Homepage Hero, Category Banner, Featured Banner, …), then by publisher inside each group. This mirrors how e-com/q-com apps organise inventory.

**Creative card (replaces current row)**
- Left: thumbnail placeholder + product name + SKU + surface/slot chip + state badge (Active/Preflight).
- Middle: two checklist columns
  - **Platform guidelines**: aspect ratio, min resolution, max file size, safe-zone, max text coverage, allowed file types. Each row shows required vs actual with ✓/✗.
  - **Brand guidelines**: logo present + min size + corner, product name visibility, mandatory disclaimer, approved colour palette, approved font, price/offer legibility. Each row ✓/✗ with expected vs actual.
- Right: overall verdict pill (Pass / Warning / Blocked), and actions:
  - Active → "View diff", "Request fix", "Waive".
  - Preflight → "Approve for launch" (only if all pass), "Send back to design", "Waive with note".
- Expand caret opens the full checklist + existing landing page / CTA / asset-version diff.

**Preflight tab specifics**
- Additional column: scheduled go-live date.
- Blocking rule: creatives with any Critical brand or platform fail cannot be approved; button disabled with reason tooltip.

### 4. Overview touch-ups — `GovernanceOverview.tsx`

- Add a small "Preflight queue" tile (count of creatives in preflight, count blocked).
- "Creative discrepancies" panel updated to include surface + state chip.
- Add "Competitive banner watch" panel: 3-line list showing surfaces where own brand trails competitor SoV.

### 5. Files touched

- `src/views/governance/types.ts` — new types + extensions.
- `src/views/governance/mockData.ts` — new creative + competitor seed data, extend existing seeds with surface/slot.
- `src/views/GovernanceAuditView.tsx` — breach summary, impact column, active-performance section, competition subsection.
- `src/views/GovernanceCreativeView.tsx` — full rework: active/preflight tabs, surface grouping, platform + brand checklists, cards, approve/send-back actions.
- `src/views/GovernanceOverview.tsx` — preflight tile, competitive watch panel.
- (No changes to Rules or Plans views, no routing changes.)

### Out of scope
- No real image uploads; thumbnails are coloured placeholder tiles.
- No backend / persistence — state stays in-memory as today.
- Rules and Approved Plans screens unchanged.
