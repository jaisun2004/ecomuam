

# UI Improvements: Date Comparison, Confirmations, OOS City Column, Cockpit Redesign

## 1. Comparison Date Range in Topbar

**File**: `src/components/Topbar.tsx`

Add a "Compare" toggle next to the time range selector. When enabled, show two date-range selectors (current period + comparison period) using the Popover + Calendar pattern. The Topbar already manages `timeRange` state; extend it with `compareEnabled` and `compareRange` state. Display delta badges (e.g., "vs Mar 1-7") when comparison is active. This propagates visually — KPI cards already show deltas, so the comparison range serves as context for those deltas.

## 2. Confirmation Dialogs for Major Actions

Use the existing `AlertDialog` component from `src/components/ui/alert-dialog.tsx` (already in the project).

Add confirmation dialogs to these destructive/high-impact actions:

| Screen | Action | File |
|--------|--------|------|
| Availability | "Pause Campaigns" per SKU (line 158) | `AvailabilityView.tsx` |
| Availability | "Bulk Pause All OOS Campaigns" (line 170) | `AvailabilityView.tsx` |
| Central Cockpit | "Approve" and "Approve all safe" actions | `CentralCockpitView.tsx` |
| War Room | Rule actions that include "Pause campaign" / "Increase budget" | `WarRoomView.tsx` |
| Budget Optimiser | Any budget reallocation confirmations | `BudgetOptimiserView.tsx` |

**Pattern**: Wrap each action button in `<AlertDialog>` + `<AlertDialogTrigger>`. The dialog content shows a summary of what will happen (SKU name, campaign name, budget amount). Two buttons: Cancel and Confirm (styled red for destructive, purple for approvals).

## 3. Add City Column to OOS Products Today

**File**: `src/views/AvailabilityView.tsx`

- Add `city` field to `oosProductsToday` data (lines 16-21), e.g., `{ sku: "50-50 Maska Chaska 120g", platform: "Flipkart", city: "Delhi NCR", since: "6h ago" }`
- Add `<th>City</th>` column header (line 141) and `<td>{item.city}</td>` in the row
- Update "Pause Campaigns" button to navigate with city context: `g.navigateWithContext("campaigns", "campaign-digest", { type: "oos-bulk-off", params: { skus: item.sku, city: item.city } })` — this filters the campaign list to that city

## 4. Central Cockpit Redesign — Simpler, Web-Friendly

**File**: `src/views/CentralCockpitView.tsx` — full rewrite

Current problems: single-column scroll-heavy layout, dense row items, watching section + health accordion adds vertical bulk.

**New layout** (fits in one viewport, no scroll needed):

```text
┌──────────────────────────────────────────────────┐
│  Central Cockpit          Updated 4m ago  [↻]    │
├──────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                │
│  │ SoV │ │Score│ │ROAS │ │Avail│   (KPI cards)   │
│  │ 48% │ │74   │ │4.2x │ │ 68% │                │
│  └─────┘ └─────┘ └─────┘ └─────┘                │
├──────────────┬───────────────────────────────────┤
│  Alerts (3)  │  Watching (5)    │  Health (8)    │
│  ─────────── │  ───────────────  │  ────────────  │
│  T1 item     │  Watch item 1    │  ● Campaign Mgr│
│  T1 item     │  Watch item 2    │  ● Availability│
│  T2 item     │  Watch item 3    │  ● Pricing     │
│  T3 approve  │  ...             │  ...           │
└──────────────┴───────────────────┴───────────────┘
```

Key changes:
- **KPI summary row** at top (4 cards in a grid) — uses the existing `kpiData` array which is currently unused
- **Three-column grid below** (alerts | watching | system health) — all visible at once, no accordions or expandable sections
- Alerts column: compact list with tier badges, action buttons inline
- Watching column: simple list with blue dot indicators
- Health column: always-visible module status dots (no accordion toggle)
- Remove `max-w-3xl` constraint to use full width
- Batch approve button stays at top of alerts column
- "All clear" empty state remains centered when nothing to show

## Technical details

- Confirmation dialog uses existing `AlertDialog` from shadcn — no new dependencies
- Comparison date range uses existing `Calendar` + `Popover` components
- City data added as static mock data to `oosProductsToday`
- Cockpit redesign is a layout-only change, all logic (approve, navigate, batch) preserved

