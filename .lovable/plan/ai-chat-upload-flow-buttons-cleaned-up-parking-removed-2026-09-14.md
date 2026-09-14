# AI chat upload flow — buttons cleaned up, parking removed

## What changes on screen

**Parking is gone.** No "Keep the N rows held for later", no Held batches card in the chat, no Held batches screen, no link to it from the created screen. A row that can't be created is simply shown on its card with the reason, downloaded, fixed in Excel and uploaded again. This removes the duplicate-parked-batch bug outright, along with the reopen-and-re-check path.

Rows still get blocked and still show as not created — only the parked list disappears.

**One upload point.** "Upload a corrected file" disappears from the check card and the created card. The Upload File button in the chat bar is the only way to send a file. A corrected file is just another upload.

**Every upload adds a card, never edits one.** A new file posts a new card below. Cards already in the chat keep their own buttons and their own numbers, so "Continue with the N rows ready" can never vanish from under you and silently drop those rows.

**Download from the card you are looking at.** The check card gets a "Download the N rows" button producing the same workbook the created card already produces: the blocked rows only, in the batch_import shape, with the plain reason and the exact fix columns.

**One click, then the card settles.** After "Continue with the N rows ready" is pressed, that card's buttons are replaced by one line: "N campaigns created." The findings list and the sheet preview stay. Only the buttons go.

## How it is built

- `EcomFileCard`: remove the `onReupload` file input and the `onHold` button; add optional `onDownloadHeld` shown when the run has blocked rows; add optional `resolvedLine` which replaces the whole action row when set.
- `FlowAiView`: keep a per-card map of `runId → { count }` for cards already actioned. Continue and Download act on that run's own rows and result rather than the latest run and the shared row list, so older cards stay correct after a new upload. Delete `holdRemaining`, the `showHeld` block, the `EcomHeldList` usage and the `handleCorrection` interception in `handleFile`, so every upload produces a new card. The created card keeps "Download the N rows" and "Go to Campaign Manager" and loses "Upload corrected file".
- Delete `EcomHeldList.tsx` and `HeldBatchView.tsx`; remove the `/ecom/campaigns/create/held` route from `App.tsx`.
- `EcomCreatedScreen`: remove the held-batches summary line and its "Open held batches" link.
- `EcomCreateContext`: remove `held`, `holdRows`, `reopenHeld`, `dropHeld`, the `HeldBatch`/`OverrideEntry` state and their references.
- `EcomReviewCard` / `ReviewPushView`: drop the "park them for later" wording; blocked rows are still counted and shown.
- Downloads keep using the existing `downloadHeldRows` export — no second export is written.
