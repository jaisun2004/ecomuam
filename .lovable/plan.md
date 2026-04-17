

## Plan: Extensive Competitor Comparison + Absolute Values + Concrete Campaign Surfacing

Three changes to `src/views/BestsellerIntelligenceView.tsx` only.

### 1. Extensive Bestseller Rank Comparison (Overview tab)
Replace the compact 2-row competitor strip with a richer comparison block:

- **Multi-line rank chart**: Add competitor lines to the existing rank-over-time chart. Our SKU + top 4 competitor brands plotted on the same inverted Y-axis. Each line color-coded; legend below. Lets the user instantly see who is climbing/falling vs us in bestseller rank.
- **Competitor leaderboard table** (below the chart): 5 rows (Us + 4 competitors) with columns:
  - Brand · Current Bestseller Rank · Δ vs start of window · Avg Organic Rank · Avg Sponsored Rank · Movement label (Climbing / Stable / Falling)
  - Color: green for improvement, red for decline, grey stable. Arrow icons only — no inline sparklines (per memory rule).
  - Sort by current rank ascending.

### 2. Remove slider, use absolute values
In the **Spend Efficiency Planner** card (Analytics tab):
- Delete the `<Slider>` for `organicThreshold`.
- Replace with **3 fixed absolute threshold cards** shown side by side: "Top 3", "Top 5", "Top 10". Each card displays the recommended paid spend reduction band (conservative / base / aggressive) for that exact threshold.
- No interactive control — pure read-only comparison, matching the analytics-tab read-only rule.

### 3. Concrete campaign surfacing in Organic Momentum card
Currently the `OrganicMomentumCard` lists 2 mock candidate campaigns generically. Strengthen it:
- Show **named campaigns** with: Campaign name · Platform · Current daily spend · Current ROAS · Suggested new spend · Estimated monthly savings.
- Add a small "Why flagged" line per row: e.g. "ROAS 1.4x, organic rank already #3 — paid spend redundant".
- Keep the "Review in Campaign Manager" CTA; add a secondary inline "Apply -30% budget" ghost button per row (visual only, triggers existing toast pattern).
- Sort campaigns by potential savings descending.

### Design adherence
- Tier color system (green/red/grey) preserved
- KPI context one-liner on new cards
- No sparklines in tables — arrow indicators only
- Insufficient-data warning still applies

### File touched
- `src/views/BestsellerIntelligenceView.tsx` (only)

