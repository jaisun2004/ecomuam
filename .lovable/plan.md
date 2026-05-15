## Goal
On `KeywordAnalysisView`, the action buttons in the **Keyword Rankings** table and the **Keyword Spend Efficiency — Campaign Actions** list currently call `g.navigateWithContext("campaigns", ...)`, sending the user to a different screen. Change them to open an in-place **Review Action** dialog where the user can inspect and edit the proposed change, then submit.

## Files
- `src/views/KeywordAnalysisView.tsx` — wire up dialog state + replace `onClick` handlers (no nav).
- `src/views/KeywordAnalysisView.tsx` — add a new local `ReviewActionDialog` component (kept in-file for cohesion with mock data).

No other views, routing, or contexts touched.

## Review Action Dialog — content
Built with shadcn `Dialog`. Header shows the recommendation type (e.g. "Reduce Spend", "Boost Campaign", "Restructure") with the matching tier color and the keyword in mono.

Body is grouped into 4 sections:

1. **Campaign(s)** — table of campaigns serving this keyword: Campaign Name · Platform · Current Daily Budget (editable input) · Status. For Rankings rows, derived from `campaignKeywordPerf` filtered by keyword + platform; for Spend Efficiency rows, from `keywordCampaignImpact` (multiple campaigns may apply).
2. **Keywords & Bids** — row(s) showing the keyword, current bid, suggested bid (from mock), and an editable "New Bid" input (₹). Includes match-type chip (Exact/Phrase/Broad — mocked).
3. **Products** — list of ASINs/SKUs targeted by the campaign(s) with title, image placeholder, current rank, and content score. Mocked alongside the dialog.
4. **Recommendation & Data Points** — the original `action` / `recommendation` string, plus supporting metrics (Spend, Clicks, CTR, ROAS, Organic Rank, SoS) pulled from the source row. A short "Why" line explains the rationale.

Footer: `Cancel` (ghost) and `Submit Action` (primary). Submit closes the dialog and shows a `useToast` success toast — no navigation, no real backend call (presentation-only, matches existing mock pattern).

## Behavior
- New state in `KeywordAnalysisView`: `const [reviewItem, setReviewItem] = useState<ReviewPayload | null>(null);`
- Each action button replaces its `g.navigateWithContext(...)` call with `setReviewItem({ source: "ranking" | "efficiency", keyword, platform, actionType, sourceRow })`.
- Dialog reads `reviewItem` to build the campaign/keyword/product/recommendation slices from the existing mock arrays + a small new `mockProductsByKeyword` lookup.
- Edits are stored in dialog-local state (bids per row, budgets per campaign). Submit consolidates them into the toast description ("Updated 2 bids · 1 budget for 'butter biscuits'").
- Closing the dialog (X, Cancel, or overlay) discards edits.

## Out of scope
- No changes to `Keywords Losing Rank & Share` (its "Defend This Keyword" already uses local state) or to `Keywords Not on Page 1` (still navigates — user only mentioned the two visuals).
- No design system / color token changes.
- No real persistence.