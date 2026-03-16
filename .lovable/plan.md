

## Plan: Central Cockpit + Two-Tab Pattern + Navigation Fixes + Competitor Analytics

### Summary
Four major workstreams: (1) Fix cross-screen navigation with scroll+pulse, (2) Replace Digital Shelf with Central Cockpit as top-level landing, (3) Rebuild Competitor Ads Hub with competitive intelligence analytics, (4) Add Overview/Analytics two-tab pattern to all screens.

---

### File Changes

**1. `src/pages/Index.tsx`** — Edits
- Replace `shelf` with `cockpit` as default active state
- Import new `CentralCockpitView` instead of `ShelfView`
- Update views map: remove `shelf`, add `cockpit: CentralCockpitView`
- Extend `handleNavigate` to support query-param-style highlight targets (conflict-banner, digest-panel, defense-insight)
- On Campaign Manager mount, read scrollTarget and find elements by id or `[data-insight-type]` attribute

**2. `src/components/Sidebar.tsx`** — Edits
- Add Central Cockpit as standalone top-level item ABOVE the PLANNING section label, with `Gauge` icon, id `cockpit`, slightly brighter label styling
- Remove `shelf` item from PLANNING section
- Keep all other items identical

**3. `src/views/CentralCockpitView.tsx`** — NEW (replaces ShelfView)
- **Header**: "Central Cockpit" title, dynamic subtitle with date + greeting + urgent action summary from GuardrailContext
- **Left column (65%)**: 
  - Live Feed card: pulsing green/red dot, chronological list of mock feed items (Tier 1 stops, blocked insights, defense actions, opportunities, conflicts) with timestamp, screen source chip, tier chip, action button or "Handled" chip, arrow link to source screen
  - Pending Approvals card: items needing human review (low confidence or escalation mode), same format as Campaign Manager digest, "Approve all safe" button
- **Right column (35%)**:
  - System Status: traffic-light rows for each screen (Campaign Manager, Availability, Pricing, Competitor Ads Hub, Budget Optimiser, Festival Campaigns)
  - Quick Stats: 2x2 grid (Active campaigns, Avg ROAS, Total spend, Pending actions)
  - Guardrail Health: Tier 1/2 active counts, velocity status, "Edit guardrails →" link

**4. `src/components/ScreenTabs.tsx`** — NEW shared component
- Reusable two-tab component (Overview / Analytics)
- Props: `activeTab`, `onTabChange`, optional custom tab labels
- Styling: 13px weight 500, active = bottom 2px #4F7FFF border + #E8EAF0 text, inactive = #555A6E, hover #8B8FA8
- In-page state only, no URL changes

**5. `src/views/CampaignView.tsx`** — Additive edits
- Wrap existing content in ScreenTabs. Overview = all existing content
- Analytics tab: Spend vs ROAS 30-day dual-axis chart, Campaign performance scatter plot (mock), Action history log table
- Add `data-insight-type` and `data-status` attributes to digest rows for deep-link targeting
- Add `id="conflict-callout-banner"` and `id="action-digest-panel"` to respective elements (some may already exist)

**6. `src/views/AvailabilityView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing + dedup banner
- Fix dedup banner CTA: call `g.navigateTo("campaigns", "campaign-conflict-banner")` — if no conflict banner visible, fall back to `"campaign-digest"`
- Analytics tab: Availability score 30-day line chart with 20% threshold, SKU-level availability heatmap, Stockout impact estimate card

**7. `src/views/PricingView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing content
- Fix any campaign reference links to use `g.navigateTo("campaigns", "action-digest-panel")`
- Analytics tab: Price index trend chart (your price vs category avg), Price elasticity bar chart, Competitor price gap table

**8. `src/views/CompetitorAdsView.tsx`** — Major additive rebuild
- Wrap in ScreenTabs. Overview tab = existing content + NEW competitive summary bar (4 stat tiles: Share of Voice stacked bar, Competitor Spend Index, Keyword Overlap Score, Brand Defence Status)
- Fix all defense CTAs/chips to call `g.navigateTo("campaigns", "defense-insight")`
- Analytics tab (NEW):
  - Share of Voice 30-day line chart (your brand purple + 3 competitors red shades)
  - Competitor spend heatmap 7x24 grid (days × hours)
  - Top contested keywords sortable table
  - Revenue impact estimate (two stat cards: revenue at risk + recoverable with defence)

**9. `src/views/BudgetOptimiserView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing content
- Analytics tab: Budget utilisation horizontal bar chart, Wasted spend donut chart, Budget shift impact simulator (read-only)

**10. `src/views/FestivalCampaignsView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing content
- Analytics tab: Festival performance grouped bar chart, Pre-festival ramp-up line chart, Category share stacked area chart

**11. `src/views/DiscoveryView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing content
- Analytics tab: Search trend line chart, Category demand forecast, Keyword opportunity matrix

**12. `src/views/ReportsView.tsx`** — Additive edits
- Wrap in ScreenTabs (Tab 1: "Summary", Tab 2: "Raw Data")
- Summary = existing content. Raw Data = table view + chart builder placeholder

**13. `src/views/GuardrailsView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing guardrail cards. Analytics tab: Rule trigger history timeline, Action block/allow ratio chart

**14. `src/views/OfflineAdsView.tsx`** — Additive edits
- Wrap in ScreenTabs. Overview = existing content. Analytics tab: Offline channel performance comparison, ROI estimates

---

### Chart Design Standards (applied globally)
All Recharts components: transparent bg, horizontal-only dashed gridlines `rgba(255,255,255,0.06)`, axis labels 11px monospace #555A6E, dark tooltip card #1C1F27, 2px line strokes, 4px bar radius, legend below chart, empty state "No data for selected period"

### Navigation Deep-Link Flow
- Availability → Campaign Manager: `navigateTo("campaigns", "campaign-conflict-banner")` with fallback to `"campaign-digest"`
- Pricing → Campaign Manager: `navigateTo("campaigns", "action-digest-panel")`
- Competitor Ads Hub → Campaign Manager: `navigateTo("campaigns", "defense-insight")` — on arrival, find first `[data-insight-type="defense"]` element, scroll + 1s blue pulse
- All cross-screen links use the existing `handleNavigate` function in Index.tsx, extended to support attribute-based element finding

