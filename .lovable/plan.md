# AI chat upload flow — button clean-up

Six changes, all inside the AI chat upload flow. Nothing outside it changes.

## What changes on screen

**One upload point.** The "Upload a corrected file" control disappears from the check card, the held batch card and the created card. The Upload File button in the chat bar is the only way to send a file. A corrected file is simply another upload.

**Every upload adds a card, never edits one.** A new file posts a new card below. Cards already in the chat keep their own buttons and their own numbers, so "Continue with the N rows ready" can never vanish from under you and silently drop those rows.

**Download the held rows from where you see them.** Both the check card and the held batch card get a "Download the N rows" button, producing the same workbook the created card already produces (held rows only, in the batch_import shape, with the reason and the exact fix columns).

**No reopening from the held batch card.** The "Reopen and re-check" button goes, along with the review block it used to open in the chat. The review screen itself stays — other flows still use it.

**One click, then a settled card.** After "Continue with the N rows ready" or "Keep the N rows held for later" is pressed, that card's buttons are replaced by a single line:

- parked: "N rows parked. They are in Held batches."
- pushed: "N campaigns created."

The findings list and the sheet preview stay. This also removes the current bug where parking can be clicked again and again, making a duplicate held batch each time.

**The held batch card lists only its own reasons.** Today it shows findings from every row in the file. It will list only the reasons belonging to the parked rows, keeping the original row numbers.

## How it is built

- `EcomFileCard`: drop the `onReupload` file input; add an optional `onDownloadHeld` action shown when the run has held rows; add an optional `resolvedLine` — when present the whole action row is replaced by that one line.
- `FlowAiView`: hold a per-card map of `runId → { kind: "pushed" | "parked", count }`. Each card's Continue / Keep-held / Download act on that run's own rows and result rather than on the latest run and the shared row list, so older cards stay correct after a new upload. The `creation` interception in `handleFile` (and the `handleCorrection` path it feeds) is removed so every upload produces a new run card. The held-batches block no longer passes a reopen handler and no longer sets the review card. The created card loses its "Upload corrected file" label and keeps "Download the N rows" and "Go to Campaign Manager".
- `EcomHeldList`: drop the `onReopen` prop and the reopen button; add "Download the N rows" calling the existing `downloadHeldRows(h.rows, h.result)` — no second export is written; filter `groupByRule` input to findings whose row is one of the parked rows.
- `HeldBatchView`: stops passing a reopen handler.
