# AI Campaign Creator — recommendations, clearer QC, smarter chat handling

## 1. "Recommendation" button in the AI chat

Add a fourth chip next to Upload File / Download template / Use last month's plan.

Flow:
1. User clicks **Recommendation**. Assistant replies asking which SKUs to analyse.
2. A SKU picker appears in the chat (searchable multi-select over the product reference list, showing product name, code and platform). User can also type SKU codes/names directly in the composer.
3. Assistant returns recommendation cards per selected SKU, derived from Ecom Analytics signals already used elsewhere in the app: stock/OOS status, price vs competitor, keyword rank and search trend, current spend pacing and ACoS.
4. Each card shows: SKU, the signal that triggered it, the suggested action (budget, city, bid, keyword), expected impact, and a confidence indicator.
5. Each card has **Add as campaign row** — it appends a fully-formed batch row (platform, campaign name from the taxonomy builder, budget type/value, cities, product_id, targeting_details) into the current batch and re-runs QC, so the same Review & Push gate applies.

No new recommendation types beyond budget / city / keywords / bids, matching the Recommendations screen.

## 2. Remove "Download annotated file"

Drop the button and its handler from the QC panel footer. "Fix and re-upload" stays. Corrected-workbook download stays available from chat ("download corrected") and Review & Push.

## 3. QC panel: group by severity only

Replace the A–I lettered grouping with exactly two collapsible groups:
- **Blockers — must fix before push** (open by default)
- **Warnings — review before push**

Inside each group, findings stay sorted by row. The original catalog group is kept as a small grey label on the finding, not as a section.

## 4. "Show rule" — plain English, sourced from the workbook

Today the dialog falls back to a generic rationale. Change it to show, for that exact QC check from the uploaded workbook's rule catalog:
- **What we checked** — the check in one plain sentence.
- **What we found** — the offending value and where (row and column).
- **Why it matters** — business consequence, no jargon (for example: "Blinkit's system rejects broad match, so this campaign would fail to launch").
- **How to fix it** — the exact corrective action, and the suggested value when we can derive one.

Any rule missing a client-facing explanation gets one written; nothing generic or invented is shown.

## 5. Chat handling and edge cases

The assistant reacts to the QC outcome instead of waiting to be asked. After every QC run it posts a summary message chosen by state:

- **All rows clean (0 blockers, 0 warnings):** "All 19 rows passed every check. Nothing to fix — continue to Review & Push." Continue button enabled and highlighted.
- **Warnings only:** lists the top warning themes, says the batch can be pushed as-is, and offers "fix the warnings anyway".
- **Partial pass (for example 80 of 100 clean):** "80 rows are ready to push. 20 rows have blockers." Offers three explicit choices:
  - **Push the 80 clean rows now** — clean rows carry over to Review & Push with the failing rows deselected and logged.
  - **Fix the 20 with me** — walks findings one by one.
  - **Auto-fix what I can** — applies every deterministic fix, re-runs QC, then reports exactly how many were fixed and how many still need a human decision.
- **Nothing auto-fixable:** says so plainly and points to the specific manual choices needed (per finding).
- **Auto-fix run:** always reports counts before/after, so the user can audit.
- **Parse failure / empty sheet / wrong headers:** names the missing or misnamed columns and offers the template.
- **File too large or wrong type:** stated in chat, not only as a toast.
- **Re-upload:** compares against the previous run ("blockers went from 10 to 2").

The chat also accepts natural instructions already supported (fix, download corrected, template) plus "push the clean rows" and "explain row N".

## Technical notes

- `src/components/ecom/EcomQcPanel.tsx` — severity grouping, remove annotated download, richer rule dialog.
- `src/lib/ecom-qc/types.ts` / `rules.ts` — add `client_explanation` and `how_to_fix` to `RuleDef`, populated for all rules in the catalog.
- `src/lib/ecom-qc/engine.ts` — add `groupBySeverity`, plus helpers for clean-row/blocked-row partitioning.
- `src/pages/ecom/EcomCreateContext.tsx` — expose `cleanRows`/`blockedRows` and a `keepOnlyCleanRows()` action used by "push the clean rows".
- `src/pages/ecom/FlowAiView.tsx` — Recommendation chip, SKU picker component, recommendation cards, and the state-driven assistant messaging above.
- New `src/lib/ecom-qc/recommendations.ts` — SKU-to-recommendation generator over the existing mock analytics signals, returning rows in `BatchRow` shape.
