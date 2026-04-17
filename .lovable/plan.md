

# Plan: Global Date Range Filter + Convert Button Filters to Dropdowns

## Part 1: Global Date Range Filter (synced with all visuals)

### Create `src/contexts/DateRangeContext.tsx`
A new React context exposing:
- `currentRange: { from: Date; to: Date }`
- `compareRange: { from: Date; to: Date } | null`
- `compareEnabled: boolean`
- `timePreset: "7D" | "30D" | "90D" | "custom"`
- Setters for each

Wrap `<App />` with `<DateRangeProvider>` in `src/main.tsx` (or `App.tsx`).

### Update `src/components/Topbar.tsx`
Replace the local `timeRange` useState + button group with:
1. **Preset pills** (7D / 30D / 90D / Custom) — kept as compact toggle (these are 3-4 fixed values, OK as buttons since they're a primary control, not a category filter).
2. **Primary date range picker** — always-visible Shadcn `<Popover>` + `<Calendar mode="range">` button showing `MMM d – MMM d`.
3. **"Compare" toggle** — Shadcn `<Switch>`. When ON, reveals a secondary range picker with dashed border showing the comparison period.
4. Selecting a preset auto-computes `currentRange` (e.g. 30D = today minus 30 days) and, if compare is on, sets `compareRange` to the prior equivalent window.

### Wire visuals to the context
Charts/KPIs across views currently use static mock data. To keep this scoped and avoid touching every chart's data, we will:
- Add a `useDateRange()` hook consumption to the top-level dashboard sections (`DashboardSection`, `AvailabilitySection`, `MarketShareView`, `PricingView`, `DiscoveryView`, `ContentAuditView`, `ShelfView`, `ReportsView`, `CampaignReportsView`).
- Pass `currentRange` / `compareRange` as a `key` prop or dependency so charts re-render with date labels reflecting the selected window (axis labels formatted from the range).
- A subtitle line "Showing: Apr 1 – Apr 30 vs Mar 2 – Mar 31" appears in each section header so users see the sync visually.

(Mock data stays mock — the visible sync is via labels, axis formatting, and the section header. Real data wiring would require backend, which we'll note.)

## Part 2: Convert remaining button-group filters to `<Select>` dropdowns

Files with categorical button filters still to convert:

| File | Filter |
|---|---|
| `PricingView.tsx` | SKU group (L216), platform (L225), SKU picker (L395), price-history platform (L404), analytics SKU (L465) |
| `KeywordAnalysisView.tsx` | platform (L123, L251) |
| `CompetitorAdsView.tsx` | platform (L146), keyword (L185) |
| `ShelfView.tsx` | SOS platform (L324) |

Each converted to `<Select><SelectTrigger className="w-[160px] h-8"><SelectValue /></SelectTrigger><SelectContent>...</SelectContent></Select>`, preserving existing state setters.

**Excluded** (intentionally kept as buttons): action buttons (Approve/Trigger/Override), 2-state toggles (SKU/Platform view-mode toggle in price history L389-390), nav buttons.

## Implementation order
1. Create `DateRangeContext` + provider
2. Rebuild `Topbar` with date range picker + compare toggle
3. Add date-range header line to top-level views
4. Convert PricingView button filters to Selects
5. Convert KeywordAnalysisView, CompetitorAdsView, ShelfView button filters to Selects

## Notes
- Uses existing Shadcn `Calendar`, `Popover`, `Select`, `Switch` components — no new deps.
- Charts will visibly reflect changes through axis labels and section subtitles since underlying data is mock; full data refetch would require a backend.

