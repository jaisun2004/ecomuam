# Make the review screen short instead of a long scroll

Today the review step stacks four full-height blocks one under the other: what happens on each platform, the recommendations, the held rows table, and the whole editable sheet — plus consent at the very bottom. On a normal batch that is several screens of scrolling before you can press send, and it looks the same whether you came from manual entry or from copying past campaigns.

## What changes

One compact screen that fits without scrolling in the normal case.

**A single summary strip at the top**
Rows going out, rows held, platforms involved, and total budget — as short chips, not paragraphs. The per-platform lines stay but as one line each, and only for platforms that need a caveat (no API, budget cannot be lowered later).

**Everything else collapses**
Each block becomes a closed row you can open:
- "3 held rows" — closed by default, with the fix and park buttons on the row itself
- "5 recommendations kept" — closed by default
- "Show the full sheet (12 rows)" — closed by default; opening it reveals the editable grid exactly as it is today

Nothing is removed; it is just folded away. A block opens automatically only when it blocks the send (for example every row is held).

**Send stays reachable**
Consent and the send button move into a sticky bar pinned to the bottom, so they are visible whatever is open.

**Same treatment for the copy flow**
The amber "these came from past campaigns" note becomes one line inside the summary strip rather than its own banner, so the copy route lands on the same compact screen as manual.

## Technical notes

- Only `src/pages/ecom/ReviewPushView.tsx` changes; the held list, sheet table, fix proposal and recommendation card components are reused as-is inside collapsible sections (shadcn `Collapsible`).
- Local `open` state per section; default closed except when `blocked.length === selected.length` (nothing can be sent) or a fix proposal is active.
- The consent checkboxes, irreversible-budget confirmation and push logic keep their current behaviour and wording; they just move into the sticky footer.
- No changes to QC, readiness or recommendation logic.
