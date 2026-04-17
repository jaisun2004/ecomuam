

## Plan: Competitive Angle + Campaign Linkage for Bestseller Intelligence

Add competitor keyword-rank context and a campaign efficiency tie-back to the existing `BestsellerIntelligenceView`. No new screens — extend the two existing tabs.

### Overview tab additions
1. **Competitor Keyword Rank strip** (below the main rank/volume chart)
   - Compact card showing top 2 competing SKUs with their average **Organic Rank** and **Sponsored Rank** across the brand's tracked keywords for the selected window
   - Each row: competitor name · organic rank (with green/red delta) · sponsored rank (with delta) · mini trend indicator (arrow only, no sparkline — per memory rule)
   - Source: keyword data already tracked in `KeywordAnalysisView` pattern

2. **Campaign Efficiency Callout card** (right side, alongside existing "Spend response" card)
   - Title: "Organic momentum detected"
   - Logic: if organic rank improved ≥ X positions in the window AND there exist campaigns flagged high-spend / low-ROAS, surface a recommendation
   - Body: "Organic rank improved by N positions. Consider reducing spend on 2 low-ROAS campaigns to protect margin."
   - CTA button: "Review in Campaign Manager" → navigates to `campaigns` view (uses existing `handleNavigate` pattern in `Index.tsx`)
   - Lists 2 mock candidate campaigns with current spend, ROAS, suggested spend reduction %

### Analytics tab additions
3. **Competitor lag comparison row** added to existing correlation heatmap
   - Heatmap gains 2 extra rows: "Competitor A organic rank vs our rank" and "Competitor B sponsored rank vs our rank" at the same 0/7/14/21 day lags
   - Helps user see whether competitor keyword shifts predict their own bestseller movement

4. **Organic-vs-Paid Spend Efficiency card** (below scatter plot)
   - Small panel: "When organic rank is in top 5, paid contribution can drop to ~X% without rank loss"
   - Threshold slider: user picks organic rank threshold (1–10) → output shows recommended paid spend reduction band
   - Reuses the existing scenario-calculator pattern (conservative/base/aggressive) but inverted — savings instead of investment

### File changes
- **Edit** `src/views/BestsellerIntelligenceView.tsx` only
  - Add competitor mock data array (2 competitors × keyword ranks over time)
  - Add `CompetitorRankStrip` sub-component for Overview
  - Add `OrganicMomentumCard` sub-component with navigate-to-campaigns CTA (consume `useGuardrails().navigateTo`)
  - Extend correlation heatmap rows
  - Add spend-efficiency planner card

### Design adherence
- Tier color system: rank improvement green, decline red, stable grey (already defined)
- KPI context one-liner pattern on new cards
- No sparklines inside tables (arrow indicators only)
- Insufficient-data warning continues to apply (< 30 days)

