# Autonomous Campaign Creator (ECOM)

A three-door campaign creation module — AI upload/chat, copy from history, manual forms — all converging on one shared QC engine and one Review & Push screen. Frontend-only build with mocked deep checks, matching the rest of this prototype.

Note on the workbook: the uploaded file did not arrive (only the modal screenshot is present). I will author the 63-rule catalog, `product_list`, `city_list` and the downloadable template from the spec's formats and the eight canonical platforms. When the real workbook lands, the rule catalog and reference tables are drop-in replaceable — they live in dedicated data files, not scattered in components.

## Routing

Real routes, added alongside the existing `/` app so nothing in the current view-switching breaks:

```text
/ecom/campaigns/create          -> entry modal over a dimmed campaigns backdrop
/ecom/campaigns/create/ai       -> Flow A
/ecom/campaigns/create/copy     -> Flow B
/ecom/campaigns/create/manual   -> Flow C
/ecom/campaigns/create/review   -> shared Review & Push
```

Campaign Manager gets a "Create campaign" button that navigates to the entry route. Back arrows and Escape return to the previous route.

## 1. Entry modal

Three horizontal cards — Autonomous AI (purple sparkle), From History (blue history), Manual Entry (grey document-pencil) — same radius, spacing and type scale as the existing modals in Campaign Manager. Close X top right; Escape and backdrop click dismiss back to Campaign Manager.

## 2. Flow A — Autonomous AI

- Welcome state: back arrow, sparkle avatar, "AI Campaign Creator" / "Conversational campaign setup", AI-Guided pill, Switch to Manual top right. Centred sparkle avatar, H1, two body lines, "Start Conversation" primary button.
- Conversation state: transcript replaces the welcome panel; header gains "Start Over". First assistant message is the fixed welcome copy. Quick-option chips: Upload File, Download template, Use last month's plan, Describe it instead. Text input with send button.
- Upload: drop anywhere on the transcript. `.xlsx`, `.xlsm`, `.csv`, 10 MB cap. Parsed in-browser (SheetJS) reading the `batch_import` sheet plus the four reference sheets.
- On upload: user-side message with file name, size, row count; assistant message "Checking N rows against 63 rules." with a progress indicator; live rules resolve instantly, deep rules stream in over a short simulated delay.
- Conversational fallback: slot-filling for the same ten fields, chips for enums, typeahead against `product_list` / `city_list`, materialised into `batch_import` rows and run through the identical gate.
- Chat repair: the user can ask the assistant to fix findings ("fix all bid floors", "map the platform aliases"). The assistant applies deterministic fixes to the in-memory sheet, posts a diff summary, re-runs QC, and offers the corrected workbook for download so the planner can audit before confirming.

## 3. QC engine

`src/lib/ecom-qc/` — one module, called by all three flows.

- Contract exactly as specified: `QcFinding` / `QcResult`, `Severity`, `When`.
- 63 rules across groups A–J, 40 blockers / 23 warnings, each with `rule_key`, group, severity, timing, message, suggestion and inline-fixability.
- Highest-value rules built first and tested hardest: `platform.canonical_name` (alias mapping for the five known duplicate identities), `product.code_format_matches_platform` (per-platform regex), `geo.platform_city_not_geographical`, `geo.city_is_not_country`, `targeting.keyword_not_placeholder` (blocklist incl. `string`, `abcd`, `test-keyword`), `targeting.bid_numeric_or_range`, `targeting.bid_above_floor`, `budget.numeric` (catches HTML in budget cells), `budget.overall_requires_end_date`, `budget.within_brand_wallet`, `taxonomy.name_charset`.
- `live` rules run synchronously in the browser. `deep` rules (stock, wallet, historical) run through a mocked async resolver that streams findings in, so a real edge function can replace it later without touching callers.
- Scoring: 100 base, −25 per blocker, −5 per warning, floored at 0; green >80, amber 60–80, red <60; any blocker forces red.
- Schema corrections applied: currency derived from platform and stored per row (never user-typed); match type enum is `exact | phrase | broad`, with per-platform support driven from config.
- Limits (bid floors, budget floors, keyword/SKU caps, name length) read from a `platformLimits` config seeded with nulls and `confirmed_at`. Unconfirmed limits emit "Limit not confirmed for this platform" warnings rather than passing silently.
- Runs persist to in-memory stores shaped like `ecom_qc_runs` / `ecom_qc_results`, and the run id is written into the push audit record.

## 4. `<EcomQcPanel />`

Shared by all three flows.

- Header: score chip with band colour, plus "N blockers · N warnings · N rows checked".
- Body: findings grouped A–J, collapsed by default with the blockers group expanded. Each row shows severity dot, rule key, row/field locator, plain message, offending value in monospace, and Fix inline / Show rule actions. Fix inline opens a single-cell editor pre-filled with valid options for enum/reference rules, re-runs QC for that row only, and animates the resolved finding out.
- Footer: Download annotated file (always on — exports the workbook with a `qc_status` column and amber/red cell fills carrying the rule key), Fix and re-upload (always on), Continue to Review (primary; disabled while any blocker is open, tooltip "Resolve N blockers to continue.").
- Warnings never block; the count carries to Review and into the audit record. No push with an open blocker, and no silent dropping of failing rows — partial pushes require explicit row deselection on Review, which is logged.

## 5. Review & Push

One screen for all flows: row table with per-row select, editable cells, the embedded QC panel, warning acknowledgement, and a Push button gated identically. Deselections and overrides are recorded on the audit entry with the QC run id.

## 6. Flow B — From History

Right-side drawer over the dimmed page, "Select a Campaign to Copy". Search field, All Platforms / All Objectives dropdowns, and Top / Platform / Objective / Geo / Recent tabs. Two-column card grid: name with overflow tooltip, amber Top Performer ribbon when qualifying, platform chip + action type + objective, Spend / ROAS / Conv strip, and a pin footer with two cities plus "+N more". Currency follows the platform; INR and AED totals are shown separately and never summed.

Selecting a card lands on Review pre-filled, with an amber "Check these before you push" banner covering: cleared `end_date`, carried-but-editable `budget_value` with source hint, SKUs tagged with live in/out-of-stock per city, cities revalidated against the current `city_list`, and a regenerated `campaign_name` with the old one struck through. A "Copy to another platform" control remaps the config and hard-flags what cannot carry across — SKU codes must be re-picked, unsupported match types are dropped, never silently carried. Multi-select up to 20 converts the selection into a generated batch and lands on the same Review screen.

## 7. Flow C — Manual Entry

"Create Campaign" header with a Manual pill, back arrow, and Switch to AI-Guided. A compact "Have many campaigns? Upload the batch import sheet instead" tile sits at the top, linking to Flow A's upload step.

Platform sections with "N Types" count badges and three-column type-card grids, in the exact India/UAE structure and card copy given in the brief (Blinkit 3, Zepto 3, Instamart 2, BigBasket 2, Noon Minutes 2, Talabat Mart 2, Carrefour Now 2, Amazon AE 3). The ad-product list is treated as unconfirmed and marked as needing a rate-card check before go-live.

Selecting a card opens the five-step single-campaign form: Basics (with live taxonomy preview and character counter), Products (platform-filtered SKU picker with stock badges and SKU cap), Geography (platform city as label, geographical city as grey helper text), Budget (type toggle, locked currency symbol, conditional required end date, wallet balance before/after), Targeting (keyword table with platform-gated match type, range-capable bids, bid floor helper text, and a bulk-paste control accepting `keyword:match_type:bid;`). A persistent QC strip at the bottom runs live rules on every change; Create campaign stays disabled while any blocker is open.

## Technical notes

- New: `src/lib/ecom-qc/` (types, rules A–J, engine, live/deep split, scoring, mock persistence), `src/lib/ecom-reference/` (canonical platforms, aliases, SKU regexes, platform limits, product_list, city_list, taxonomy builder), `src/components/ecom/EcomQcPanel.tsx`, and page components per flow under `src/pages/ecom/`.
- Sheet parsing/export via SheetJS (`xlsx`), which also generates the downloadable template and the annotated export.
- No backend: deep rules, wallet balances and stock feeds resolve from a mocked async layer behind the same interface an edge function would expose.
- Existing views, contexts and the current `/` app are untouched apart from the new "Create campaign" entry point in Campaign Manager.
