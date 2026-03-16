

## Plan: Central Cockpit Simplification + New Intelligence Screens + Discovery Enhancements

### Overview
5 workstreams: (1) Simplify Central Cockpit to 3-card single-column layout, (2) Add heatmap with action panel to Availability Analytics tab, (3) Add SoS/poaching/retailer content to Discovery, (4) New Market Share screen, (5) New Content Audit screen. Plus sidebar updates and Campaign Manager context param handling.

---

### 1. `src/views/CentralCockpitView.tsx` — Full rewrite

Replace entire content with simplified 3-card single-column layout. No ScreenTabs (no Analytics tab). No charts. No multi-column.

- **Header**: Title "Central Cockpit" + live clock (updates every minute via `setInterval`) + "Updated 4 min ago" muted text on right
- **Card 1 — Urgent**: Red pulsing dot if issues exist, green steady if clear. Count badge. Flat list of up to 5 issue rows: Tier chip (T1/T2/T3) + plain English description + source screen chip + "→ View" link using `g.navigateTo()`. Empty state: green dot + "All clear" message.
- **Card 2 — Pending approval**: Count badge. Up to 5 rows of low-confidence/escalated insights. Each: icon + campaign + action desc + confidence pips + "Approve" purple button + "Review" ghost button. Approve triggers undo toast (5s). Empty state text.
- **Card 3 — System health**: 8 rows (Campaign Manager, Availability, Pricing, Competitor Ads Hub, Budget Optimiser, Festival Campaigns, Rule Engine, Guardrails). Each: name + dot (green/amber/red) + one-word status + "→" link.

Remove: quick stats, guardrail health card, two-column layout, live feed with timestamps, analytics tab.

### 2. `src/views/AvailabilityView.tsx` — Analytics tab addition

Add as FIRST section in existing Analytics tab (above current availability score chart):

- **Availability heatmap**: SKUs on Y-axis, 30 days on X-axis. Cells colored red (0-20%), amber (20-50%), green (50-100%). Tooltip with SKU, date, availability %, campaigns affected.
- **Clickable cells**: Red/amber cells open a slide-over panel (absolute positioned from right). Panel shows SKU name, date, affected campaigns, active Tier 2 locks, recommended action. CTA: "View in Campaign Manager →" with context params (`?highlight=digest-panel&context=availability&sku=SKU-ID`).

### 3. `src/views/DiscoveryView.tsx` — Overview + Analytics additions

**Overview tab** — add below existing content:
- **SoS summary strip**: 4 stat tiles (Your SoS %, SoS change WoW, Top gaining competitor, Category SoS leader). Each with "→ See full analytics" link switching to Analytics tab.
- **Brand keyword poaching alerts**: Red left border card. List of poaching incidents with keyword (monospace), competitor, platform chips, severity chip, "Defend →" button routing to Campaign Manager with defense-insight highlight.
- **Retailer visibility issues**: Amber left border card. Platform-level SoS anomalies with "Fix visibility →" routing to Campaign Manager.

**Analytics tab** — add below existing content:
- **SoS over time**: Line chart (your brand purple + 3 competitors red shades + category avg dashed gray). Platform filter chips above.
- **SoS by retailer heatmap**: Retailers on Y, weeks on X, colored by SoS %.
- **Poaching history table**: Sortable — keyword, competitor, platform, duration, impact, status, action chip.

### 4. `src/views/MarketShareView.tsx` — NEW screen

Full new screen with Overview/Analytics tabs.

**Overview**:
- Header: "Market Share" + subtitle
- 4 stat tiles (overall share, rank, fastest growing competitor, best platform)
- Share by platform stacked bar chart (Recharts)
- Top subcategory movers list with CTAs to Campaign Manager

**Analytics**:
- Market share over time (90-day line chart, subcategory + platform filters)
- Platform share matrix table (you + 5 competitors × platforms)
- Share velocity bar chart (WoW change)
- New entrant detection card list
- Quick commerce metrics (4 stat cards: dark store coverage, delivery slot share, platform exclusivity, impulse category rank)

### 5. `src/views/ContentAuditView.tsx` — NEW screen

Full new screen with Overview/Analytics tabs. Content quality scoring system (5 dimensions × 20 points each = /100).

**Overview**:
- 4 stat tiles (avg score, SKUs below 60, SKUs where competitor content stronger, last audit timestamp)
- Filterable sortable SKU score table: thumbnail, overall score with mini bar, 5 dimension pills, action button ("Fix now" red / "Improve" amber / "View" ghost) routing to Campaign Manager with context params
- Platform and score filter chips

**Analytics**:
- Score distribution histogram
- Dimension breakdown radar/spider chart
- Title quality detail (expandable per SKU with issues + AI suggested title)
- Hero image quality detail (thumbnail + issues + "Flag for content team" clipboard action)
- Search listing performance (per SKU: top 5 keywords, ranks, issues, "Boost keyword bids" CTA)
- Competitor content aggression tracker table

### 6. `src/components/Sidebar.tsx` — Add INTELLIGENCE section

Add new section between OPTIMISATION and REPORTS:
```
INTELLIGENCE
  - Market Share    (PieChart icon)
  - Content Audit   (FileCheck icon)
```

### 7. `src/pages/Index.tsx` — Register new views

Add imports for `MarketShareView` and `ContentAuditView`. Add to views map: `marketshare: MarketShareView`, `contentaudit: ContentAuditView`.

### 8. `src/views/CampaignView.tsx` — Context param handling

Extend the Campaign Manager to read context from GuardrailContext (simulated since there's no actual URL routing — use shared state).

Add to GuardrailContext:
- `contextFilter: { type: string; params: Record<string, string> } | null`
- `setContextFilter` method

When navigating from other screens with context (availability, sos-retailer, content-audit, search-listing, competitor-content), set `contextFilter` in context.

Campaign Manager reads `contextFilter` and:
- Shows a filter chip bar above digest: "Filtered: [context description]" + "× Clear filter" button
- For content-audit context: inserts a contextual insight card (blue left border) at top of digest with SKU name, score, weak dimensions, and "Apply bid boost" CTA
- For other contexts: filters/highlights relevant digest rows

### 9. `src/contexts/GuardrailContext.tsx` — Extended state

Add `contextFilter` state and `setContextFilter` method. Update `navigateTo` to accept optional context params that get set before navigation.

---

### File summary
- **Rewrite**: `CentralCockpitView.tsx`
- **New**: `MarketShareView.tsx`, `ContentAuditView.tsx`
- **Edit**: `Sidebar.tsx` (add INTELLIGENCE section), `Index.tsx` (register views), `DiscoveryView.tsx` (add SoS/poaching), `AvailabilityView.tsx` (add heatmap to analytics), `CampaignView.tsx` (context param handling), `GuardrailContext.tsx` (add contextFilter)

