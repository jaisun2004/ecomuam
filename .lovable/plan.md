

# Revised Plan: Fix Visuals, Filters, and Bugs Across All Screens

## Point 1 (revised): Remove sparkline/trend columns from tables

Only **one file** has inline trend charts inside a table:

- **`src/views/ContentAuditView.tsx`** — The "SKU Content Performance" table has a `Trend` column (line 522) rendering a `<Sparkline>` SVG component (line 574). Remove:
  - The `<th>` for "Trend" (line 522)
  - The `<td>` with `<Sparkline>` (lines 573-575)
  - The `Sparkline` component definition (lines 57-69) and `sparklineData` constant (lines 48-55) if no longer used elsewhere

No other screens have trend/sparkline columns inside tables.

## Point 2: Replace scatter plots with grouped bar charts
**File**: `src/views/CategoryAssortmentView.tsx`
- Replace scatter chart visuals with horizontal grouped bar charts showing the same dimensions

## Point 3: Replace filter buttons with `<Select>` dropdowns
Replace button-based filters with shadcn `<Select>` in:
- `MarketShareView.tsx` — platform and store filters
- `DiscoveryView.tsx` — SOS platform filter
- `ContentAuditSkuDetailView.tsx` — platform filter
- `ApprovalFlowView.tsx` — day part/day type filters
- `AvailabilityView.tsx` — city selector

## Point 4: Fix Market Share analytics tab
Debug conditional rendering so the analytics tab content appears correctly.

## Point 5: Fix Availability heatmap bugs
- **Values changing on click**: Wrap `heatmapData` in `useMemo` with empty deps to stabilize random values across re-renders
- **Tooltip hidden**: Increase z-index on the action panel to `z-50` and set `overflow-visible` on parent

## Implementation order
1. Remove Sparkline trend column from ContentAuditView
2. Fix Availability heatmap (useMemo + z-index)
3. Fix Market Share analytics
4. Replace filter buttons → Select dropdowns (all files)
5. Replace scatter plots → bar charts

