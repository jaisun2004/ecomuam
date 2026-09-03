# UAM ECOM campaign creation — full build to spec

Builds the whole spec in one pass, on the existing 8-platform reference data (Blinkit, Zepto, Swiggy Instamart, BigBasket, Noon Minutes, Talabat Mart, Carrefour Now, Amazon AE) with mock in-memory config. Every unconfirmed threshold is marked as such in the UI, never stated as a platform rule.

## 1. Config and platform capability layer

A single reference layer everything else reads from, with `confirmed: true|false` on every value:

- `readiness_thresholds` — availability floor/target, rating, reviews, price gap, wallet runway. Each carries value, set_by, set_at, confirmed. Nothing hardcoded at a call site.
- `platform_capabilities` — `can_push_api` (Amazon AE only), city targeting on/off, match type support, bid unit (per click vs per 1,000 impressions), pays-full-bid flag, budget types allowed, max products, settling days, catalogue freshness limit.
- Unconfirmed values render the line "Threshold set by your team, not a platform rule." Values with no basis render no number at all.

## 2. Readiness check (per product, per city)

States: ready, warning, not_ready, unknown. Unknown behaves as a warning ("the check could not run") and never renders green.

- Blocks: not listed, out of stock in that city, missing from catalogue twice, city not served, missing image or title, no linked ad account.
- Warns: availability under floor/target, rating, reviews, price above cheapest offer, already ranking first organically, product already advertised on this platform, wallet runway under 3 days.
- No override control exists on a blocker — the card states the fact instead.
- Warnings are cleared with a reason picker (Stock is arriving, Brand defence, Client asked for it, Testing, Data looks wrong), logged with user and time. "Data looks wrong" flags the signal.
- Partial dark-store stock states it plainly: "Out of stock in 3 of 14 stores in Delhi. Targeting here is city-wide, so these cannot be excluded."
- The check is a result inside the Products step, never a stepper stage.

## 3. AI chat: the file card

The upload posts a file card into the transcript — no modal, no navigation. Card order:

1. **What we read** — receipt: rows, platforms, cities, products, per-currency totals, brand.
2. **The verdict** — "4 blockers · 7 warnings · 15 rows ready to go".
3. **Issues grouped by rule, not by row** — each group shows the rule in plain English, the affected row count, the offending values, and `Fix with AI` or `Needs you`. Blockers expanded, warnings collapsed.
4. **The sheet, collapsed** — `Show all N rows`, expands to a table with a status column, highlighted failing cells and an `Only rows with issues` toggle.
5. **Values tidied automatically** — one quiet line, never listed as findings.

### Blockers hold rows, not batches

File-level problems (wrong sheet, missing columns, will not open, zero rows) stop everything. Row-level failures hold only that row.

Seven distinct card states, each with its own copy and buttons: clean, warnings only, some rows held, every row held, will not parse, empty, some rows unreadable. Buttons: `Continue with N rows` (N always spelled out), `Fix with AI`, `Download sheet with notes`, `Upload a different file`. Never a disabled button with no route forward.

## 4. Fix with AI

A proposal screen. It never edits the sheet on its own.

- Opens by saying what it can and cannot fix, with counts.
- One row per proposal: current value → proposed value as a real control (dropdown of valid options, date picker, number), one line of provenance, a checkbox, plus Select all / Clear all.
- Only reference-backed fixes are proposed. Never an invented keyword, bid, product code or budget — those read `Needs you`.
- Apply posts a **new file card** with a `N cells changed` chip and re-runs checks. The old card stays in the transcript.
- Undo steps back one version; `Back to the file I uploaded` is separate.
- Typed instructions ("fix the city names", "drop the rows with blockers") route through the same proposal screen, never applied directly.

## 5. Held batches

Continuing with 80 of 100 saves the other 20 as a named held batch with its own link, carrying the original rows, findings, applied fixes and overrides. The confirmation names where they went.

- Opening a held batch **re-runs every check** (stock, cities, wallet, name availability) and shows what changed since it was held.
- Clear it two ways: fix in place, or upload a replacement sheet — matched on campaign name, with the match shown for confirmation before anything is replaced ("18 match, 2 are new").
- Budget splits with the batch and is stated in both places; reconciliation runs against the subset being pushed.
- Nothing expires and nothing is deleted without the user asking.

## 6. Manual entry — four steps

Stepper matching the Brand module: progress bar, numbered circles that tick, "Switch to AI-Guided" top right, fixed Previous/Next bar.

1. **Type** — platform, ad product, campaign name from the naming pattern with live preview and character count, dates, objective, KPI.
2. **Products** — readiness pill on every row *before* selection (`Ready in 6 of 11 cities`, `Not ready anywhere`, `Not checked on this platform`, `Data is stale`), sortable and filterable, freshness stamp in the header, over-limit counter.
3. **Targeting** — cities labelled with the platform's own name and the everyday name beneath; hidden entirely on Amazon AE. Keywords table with platform-specific match types, bid columns that always name their unit, a pays-full-bid note where it applies, and a `Paste keywords` control accepting `keyword:match type:bid;`.
4. **Budget** — platform-gated budget type toggle, locked currency symbol, end date required only for overall, wallet balance before and after.

A live check strip at the bottom of every step, same counts as the chat card. Next disabled while a blocker is open.

## 7. Copy existing

Right-side drawer over the dimmed page: search, platform and objective filters, tabs for Top, Platform, Objective, Geo, Recent. Cards render only the metrics that exist. Selection pre-fills the four steps with an amber banner listing what was cleared or re-checked. Cross-platform copies re-check everything and force product codes to be picked again. Multi-select up to 20 becomes a generated sheet on the review screen.

## 8. Review and push

- Names what will be created, where, cost per platform and in total, what cannot be undone, and what must be entered by hand.
- On a split batch, both halves at the top; held rows stay visible and greyed with their reason.
- **Per-platform action**, never one Push button: `Push 3 to Amazon AE, export 16 to enter by hand`, driven by `can_push_api`.
- Irreversible fields (budget that cannot be reduced) get their own confirmation naming the consequence.
- Every creation is explicit, attributed and logged. No automatic creation.
- After creation, a settling banner holding recommendations, with the period marked as a working figure.

## 9. Edge cases

All rows from the spec's table are implemented: empty catalogue, stale catalogue, over the product limit, every product blocked, reordered or extra columns, duplicate rows, duplicate campaign names, replacement sheets, wallet shortfalls, two currencies (two totals, never combined), bid below an unconfirmed floor, no comparable history (three candidate opening bids with ranges, or no number and the reason), name clashes, partial push failure.

## Not built

No automatic creation, no override on a blocker, no green from stale data, no buy box check, no rule against advertising a term you already rank first on, no dark store targeting control, no stated minimum budget, no confidence dots or scores anywhere, no estimated return per city, no success message for anything that did not reach the platform.

## Technical notes

- New: `src/lib/ecom-reference/config.ts` (thresholds + capabilities with confirmed flags), `src/lib/ecom-readiness/` (check engine and types), `src/lib/ecom-qc/sheet-run.ts` (rule-grouped findings, tidy classification, file-level vs row-level), `src/lib/ecom-qc/fix-proposals.ts`.
- New components: `EcomFileCard`, `EcomFixProposal`, `EcomSheetTable`, `EcomReadinessPill`, `EcomHeldBatchView`, `EcomStepper`.
- Reworked: `FlowAiView` (transcript of file cards), `FlowManualView` (four-step stepper), `FlowHistoryView` (drawer), `ReviewPushView` (split totals, per-platform push/export), `EcomCreateContext` (sheet runs, held batches, override log).
- `QcFinding` gains rule-grouped rows and a `tidy` severity; the existing rule catalog and explanations are reused as the source of the plain-English text.
- All state stays in-memory in `EcomCreateContext`; held batches persist for the session only.
