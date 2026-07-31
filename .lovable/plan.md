## 1. Availability — Dark Store Level Availability drill-down

Target visual: the **Darkstore Listing Gaps** panel in `src/views/AvailabilityView.tsx` (the one already filtered by a city dropdown — Mumbai / Delhi NCR / Riyadh).

- Add a new column at the end of each product row with a small **"Dark Store Level Availability"** button.
- Clicking it opens a **right-side slide-over panel** (shadcn `Sheet`, side="right") — not a centre modal.
- The panel header shows the SKU, the currently selected city, and a summary count (e.g. "38 of 142 stores out of stock").
- The panel body lists dark stores for that SKU within the selected city, grouped by **locality**, each row showing:
  - Pincode (mono font)
  - Locality name
  - Store name / ID
  - Status pill: **In Stock** (green) or **Out of Stock** (red)
- Add a small filter row inside the panel: search by pincode/locality + a status toggle (All / In Stock / Out of Stock).
- Data: extend the existing mock `darkstoreGaps` with a per-city list of localities & pincodes (Mumbai: Bandra West 400050, Andheri East 400069, Powai 400076…; Delhi NCR: Saket 110017, Gurgaon 122002…). Per-SKU in/out status is derived deterministically from the SKU's coverage % so counts stay consistent with the "Listed / Unlisted" numbers already shown in the row.

## 2. Pricing — replace Price Elasticity by SKU

In `src/views/PricingView.tsx`, replace the **"Price Elasticity by SKU"** panel with **"Discount % Trend — Last 30 Days"**:

- Multi-line chart (Recharts `LineChart`), X axis = last 30 days, Y axis = average discount %.
- One line per brand: own brand highlighted (solid, brand colour, thicker) vs competing brands (thinner lines, muted palette) — e.g. Britannia, Parle, Sunfeast, Unibic.
- Two filters sit above the chart:
  - **SKU Group** select (All groups, Glucose, Cream, Marie, Cookies)
  - **Brand** multi-select/select controlling which competitor lines are shown (All brands + individual)
- Chart data recomputes per SKU-group selection from a mock 30-day dataset.
- Sub-caption shows own-brand average discount vs category average for the period.
- The old `elasticityData` constant is removed.

## Technical notes

- Files touched: `src/views/AvailabilityView.tsx`, `src/views/PricingView.tsx` only.
- Uses existing shadcn `Sheet` and `Select` components plus existing `PanelCard` styling; colours stay on the current semantic tokens (`sw-green`, `sw-red`, `sw-amber`).
- All data is mock/deterministic — no backend changes.
