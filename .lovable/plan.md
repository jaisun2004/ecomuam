# Central Cockpit Revamp

Goal: make the cockpit calmer and more informational. Each area gets the same two-pane pattern — a trend visualisation on the left, a compact issue panel on the right — so the user can read the signal themselves without colour-coded verdicts.

## 1. Strip severity verdicts

- Remove the `Critical / Watch / OK` chip on every panel header and campaign row.
- Remove the `Critical / Watch / Clear` summary tiles and the severity filter at the top.
- Remove the left coloured severity bar on cards.
- Keep small neutral dots only where they mark a single data point (e.g. a city in the issue list). No global "severity" wording anywhere in copy.
- KPI tiles inside panels are replaced by the trend+issues pattern (below), so per-KPI red/amber dots also go away.

## 2. Unified panel pattern

Every area card uses the same two-column body:

```text
+--------------------------- Area name --------------------- → +
|  Trend (last 7d)              |  Issue panel               |
|  -- sparkline / mini chart -- |  ── count ── label         |
|  current value · delta        |  • item                    |
|                               |  • item                    |
+----------------------------------------------------------+
```

- Header: icon + area name + chevron to drill into the screen (existing `g.navigateTo`). No status chip.
- Left pane: a small Recharts line/area sparkline over the last 7 days plus the latest value and 7d delta.
- Right pane: one or two stacked "stat blocks". Each block = big number + short label + up to 3 example items (city or SKU names).
- Card is no longer expandable; everything sits in the body. Drops the "View flags" toggle and the divider list.

## 3. Per-area content

- **Availability**
  - Trend: own in-stock % (last 7d).
  - Issue panel: "Cities with low availability" (count + sample cities) and "Products with low availability" (count + sample SKUs).
- **Pricing**
  - Trend: own avg discount % and avg price, two lines on one chart (last 7d).
  - Issue panel: "Cities where competitors priced lower" and "Products with price jump".
- **Keyword Analysis**
  - Trend: avg keyword rank across tracked set (last 7d, inverted axis).
  - Issue panel: "Keywords lost rank" and "Keywords where competitors lead".
- **Content Quality Score**
  - Trend: portfolio avg content score (last 7d).
  - Issue panel: "Products below score threshold" and "Products with missing assets".
- **Category Assortment**
  - Trend: share of shelf % in tracked category (last 7d).
  - Issue panel: "Categories with shelf drop" and "Products missing from category shelf".
- **Campaign Manager**
  - Trend: portfolio ROAS (last 7d).
  - Issue panel: "Campaigns underpacing" and "Campaigns overpacing / budget exhausted".
- **Budget Optimiser**
  - Trend: daily spend vs plan (two lines, last 7d).
  - Issue panel: "Reallocation opportunities" and "Wasted spend pockets".

Competitor Ads, Share of Shelf (separate from Keyword), Guardrails, Content Audit duplicates: keep only the areas listed above; remove the rest from the cockpit grid to match the user's six-area list (Availability, Pricing, Keyword Analysis, Content Quality Score, Category Assortment, Campaign Manager, Budget Optimiser).

## 4. Flagged Campaigns section

- Keep the list but drop the severity chip and coloured left border.
- Each row: campaign name, platform pill, issue labels (Underpacing, Low bids, etc.), key metric line, chevron to navigate. No "Act" button (already removed).

## Technical notes

- All work lives in `src/views/CentralCockpitView.tsx`.
- Replace `PANELS` typing: each area now carries `{ trend: { label, series: {d,v}[], unit, delta }, stats: { value, label, items: string[] }[] }` instead of `kpis` + `flags`.
- Use Recharts `LineChart` / `AreaChart` (already a project dep) at ~140×60 inside each card; reuse existing chart styling tokens.
- Delete the `Severity`, `sevColor`, `sevLabel` helpers and the filter state (`filter`, `setFilter`, `SummaryTile`s for severity, `filteredPanels`, `filteredCampaigns` reduced to identity).
- Keep `g.navigateTo(routeId)` on the header click and on campaign rows; targets unchanged.
- Pricing chart uses two `<Line>`s on a shared axis; Budget chart same pattern for spend vs plan.
- Mock data stays inline and deterministic (no new endpoints).
