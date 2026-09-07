# Simpler recommendations, no repeat triggers, and working QC buttons

## 1. One simple visual for every recommendation

Today each signal type draws its own custom graphic (stock chips, rank slider with sparkline, price bars). That is hard to read and hard to maintain.

Replace all of them with one shared, compact layout used by every recommendation, whatever the signal:
- A single line of plain fact (for example "In stock in 4 of 6 cities" or "Your pack ₹85, Parle ₹91").
- One horizontal bar showing the comparison where a comparison exists, otherwise small text-only chips.
- Source and collected date on one line.

No sparklines, no rank sliders, no per-type charts.

## 2. Nothing can be triggered twice

- A recommendation that has been applied (or dismissed) is marked as used and removed from the suggestion list, in all three flows.
- The same product and platform can only produce one campaign per session; asking again shows "already added" instead of a duplicate suggestion.
- The "Create N campaigns" / send action locks after the first press so a batch cannot be sent twice.

## 3. Recommendation-built and manual campaigns are not flagged

Campaigns built from recommendations are complete by construction, so they should never come back as blockers.
- Suppress structural blockers for recommendation-built campaigns; the engine fills what it knows.
- Where something genuinely cannot be inferred (end date), ask a plain clarifying question before creating: "No end date. This runs until someone pauses it. Continue, or set an end date?" — a warning, not a block.
- Same treatment in the manual flow: a missing end date is a warning with the same one-line explanation, not a hold.

## 4. Plain confirmation after creating

Once the user confirms, the outcome says only "N campaigns created for Blinkit / Instamart / Zepto". No mention of files, sheets, downloads, or exports anywhere in the outcome, in any flow.

## 5. Shorter "Why" in QC checks

Rewrite every check explanation to three short lines at most: what was checked, what is wrong, what to do. Remove restated field values, template talk and long paragraphs.

## 6. Fix the "Use last month's plan" buttons

- **Fix with AI**: currently does nothing when no proposal can be generated for the held items. It will always respond — either open the proposal panel or say clearly which items need a decision and why.
- **Continue with the 12 ready**: drop the long summary. Show a single confirm ("Create 12 campaigns?") and proceed.
- **Keep the 6 held for later**: park them, remove them from the active batch, and confirm in one line with a link to the held list.

All three behaviours are verified in the autonomous chat, copy-existing and manual flows.

## 7. Dashboard logo

Use the supplied Affle / "Insights Powered By mFilterIt" image as the sidebar brand mark (full logo when expanded, compact mark when collapsed) and as the browser tab icon.

## Technical notes

- `EcomRecoCard.tsx` collapses to one evidence renderer; `RecoEvidence` reduces to a single shape (label, ours, theirs/optional, unit) in `recommendations.ts`.
- Applied/dismissed recommendation ids move into `EcomCreateContext` so state survives navigation between steps and flows.
- Recommendation-sourced rows get a `source: "reco"` marker that the QC engine uses to downgrade structural blockers to warnings; end-date remains a warning everywhere.
- `EcomFileCard` action handlers (`onFixWithAi`, `onContinueClean`, `onHold`) get guaranteed feedback paths in `FlowAiView`; the continue path swaps its chat summary for a confirm dialog.
- `RULE_EXPLANATIONS` entries shortened; `EcomFileCard` Why dialog drops the repeated value block.
- Logo uploaded via the asset CLI, referenced from `Sidebar.tsx`, plus a square `public/favicon.png`.
