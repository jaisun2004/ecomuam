# AI chat: creation only on the button, and findings grouped everywhere

## What changes on screen

**Nothing is created unless you press the button.** The "Campaign creation complete" card you saw after an upload came from the recommendation path, not from your file — it stayed on screen from an earlier run and looked like a fresh creation. That card is now cleared the moment a new file is uploaded, so it can never reappear next to a file that created nothing. Creation itself runs from one place only: the click on "Continue with the N rows ready". If the ready count is zero, nothing is created even if the click somehow arrives.

**No button when nothing is ready.** A card with 0 ready rows shows only "Download the N rows to fix" — the Continue button is not drawn at all.

**Findings are grouped everywhere.** Every findings list in the chat — the check card, the creation card, the recommendation confirmation — shows one line per check, with a row count on the right and the affected row numbers underneath. No repeated lines.

**One upload point, one card each.** The only way to send a file is "Upload File" in the chat bar. Every upload posts a new card and never touches the buttons on a card already on screen. Once "Continue with the N rows ready" is pressed, that card's buttons are replaced by "N campaigns created."; the findings and the sheet preview stay.

**Download beside Continue.** The check card carries "Download the N rows to fix" next to Continue, using the existing export that writes qc_status, qc_reason and how_to_fix. No second export is written.

## Technical notes

- `FlowAiView.handleFile`: clear `recoOutcomes`, `creatingRecos`, `cityRecos`, `planning` before registering the new run, so a stale confirmation card cannot sit beside a new upload.
- `continueClean(run)`: keep the existing `if (!cleanRows.length) return;` guard as the hard guard. Confirmed there is no creation call in any `useEffect`, on parse, or on render; the only other creation path is `createFromPlan`, reached from the plan card's button.
- Remove the `window.addEventListener("ecom-reupload", …)` listener in `FlowAiView` and the `CustomEvent("ecom-reupload", …)` file input in `EcomQcPanel.tsx` — that is the remaining second upload control.
- `heldLines`: today it keys on the first finding of each row, which loses the other checks a row fails. Rewrite it to expand every finding, key by `rule_key`, and return `{ rule_key, plain, count, rows[] }` — same shape the check card's `groupByRule` produces. Render the row numbers under each line (first five, then "and N more"), matching `EcomFileCard`.
- Creation card and the `recoOutcomes` card: replace the per-finding `map` over warnings (currently one `<p>` per finding per row) with the same grouped list.
- `EcomFileCard`: rename the held download button to "Download the N rows to fix"; the Continue button already renders only when `run.cleanRows.length > 0` — leave that condition, no other change.
