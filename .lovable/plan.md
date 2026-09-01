# Autonomous Campaign Creator (ECOM)

Three creation doors — AI upload/chat, copy from history, manual forms — all converging on one shared QC engine and one Review & Push screen. Frontend-only, with deep checks mocked behind an async interface.

## What the uploaded workbook changes

The workbook is now the source of truth for rules and reference data. It differs from the written brief in ways the build must follow:

- Sheets present: `qc_checks`, `batch_import`, `product_list`, `city_list`, `historical_configuration`. There is no `notes` and no `qc_examples` sheet.
- `qc_checks` carries 35 checks in nine groups (A. File and structure, B. Mandatory fields, C. Platform identity, D. Taxonomy, E. Budget, F. Dates, G. Cities and geography, H. Products, I. Targeting details), each tagged Block the Flow / Warning / Handling. Not 63 rules, and no J group. The engine implements exactly these, plus the high-value rules the brief calls out that the sheet does not encode: canonical platform slug + alias mapping, per-platform SKU code regex, platform-city vs geographical-city, city-is-not-a-country, keyword placeholder blocklist, bid floor, in-stock-in-targeted-cities, and wallet headroom. Final catalog is ~48 rules; the panel shows real counts, never a hardcoded 63.
- `batch_import` has 11 columns, not 10 — it already carries `Currency`. Headers are verbose in the sheet (`end_date( leave blank if no date)`, `cities(all to be mentioned for pan india)`, `product_id(refer to product_code sheet for your product ids)`). The parser normalises these to canonical field names and accepts both forms. Currency stays derived from platform and read-only in the UI; a mismatch between the sheet's `Currency` and the platform geo is a blocker.
- Platform values in the data are already the canonical slugs: `Blinkit`, `Zepto_app`, `Instamart_app`, `BigBasket`, `noon_minutes_uae_app`, `talabat_mart_uae`, `carrefour_now_uae`, `amazonae`. `BigBasket` appears in `city_list` only and has no products — SKU rules emit "reference data unavailable for this platform" warnings there rather than false blockers.
- `product_list` (63 rows), `city_list` (29 rows) and `historical_configuration` (16 rows) are extracted verbatim into typed reference modules and seed the app: `product_list` drives the SKU picker and code checks, `city_list` drives the geography picker with `Platform_city` as label and `Geographical_city` as helper text, `historical_configuration` seeds Flow B's campaign cards.
- Rows 1–2 of `batch_import` are the format/example rows; the parser skips them and the shipped template reproduces them.

## Routing

Real routes added alongside the existing `/` app so current view-switching is untouched:

```text
/ecom/campaigns/create          -> entry modal over a dimmed campaigns backdrop
/ecom/campaigns/create/ai       -> Flow A
/ecom/campaigns/create/copy     -> Flow B
/ecom/campaigns/create/manual   -> Flow C
/ecom/campaigns/create/review   -> shared Review & Push
```

Campaign Manager gets a "Create campaign" entry point. Back arrows and Escape return to the previous route.

## 1. Entry modal

Three horizontal cards — Autonomous AI (purple sparkle), From History (blue history), Manual Entry (grey document-pencil) — matching the reference screenshot's radius, spacing and typography. Close X top right; Escape and backdrop click dismiss.

## 2. Flow A — Autonomous AI

- Welcome state: back arrow, sparkle avatar, "AI Campaign Creator" / "Conversational campaign setup", AI-Guided pill, Switch to Manual top right. Centred avatar, H1, two body lines, "Start Conversation" button.
- Conversation state: transcript with a "Start Over" header action. Fixed first assistant message. Chips: Upload File, Download template, Use last month's plan, Describe it instead. Text input with send.
- Upload: drop anywhere on the transcript. `.xlsx`, `.xlsm`, `.csv`, 10 MB cap. Parsed in-browser with SheetJS, reading `batch_import` plus the reference sheets when the uploaded file carries them (otherwise the bundled reference data is used).
- On upload: user-side message with file name, size and row count; assistant message "Checking N rows against M rules."; live findings render instantly, deep findings stream in with spinners on their groups.
- Conversational fallback: slot-filling the same fields, chips for enums, typeahead against `product_list` / `city_list`, materialised into `batch_import` rows and run through the identical gate.
- Chat repair: the user can ask the assistant to fix findings ("fix the bid floors", "map the platform aliases", "clear the past end dates"). Deterministic fixes are applied to the in-memory sheet, a per-cell diff summary is posted, QC re-runs, and the corrected workbook is offered for download so the planner can audit before confirming. Submit stays enabled on warnings only and disabled while any blocker is open.

## 3. QC engine

`src/lib/ecom-qc/` — one module, called by all three flows.

- Contract exactly as specified: `Severity`, `When`, `QcFinding`, `QcResult`.
- Rules registered declaratively per group with `rule_key`, group, severity, timing, message builder, suggestion builder and inline-fixability, so the catalog is auditable against `qc_checks`.
- `live` rules run synchronously in the browser. `deep` rules (stock, wallet, duplicate-against-live-campaigns) resolve through a mocked async layer behind the interface an edge function would expose.
- Scoring: 100 base, −25 per blocker, −5 per warning, floored at 0; green >80, amber 60–80, red <60; any blocker forces red.
- Match type enum is `exact | phrase | broad`, gated per platform from config; Blinkit hides the control. Currency derived from platform and stored per row.
- Bid floors, daily budget floors (seeded at 100 per the sheet), keyword caps, SKU caps and name-length caps live in a `platformLimits` config with `confirmed_at`; unconfirmed limits emit "Limit not confirmed for this platform" warnings.
- Runs persist to in-memory stores shaped like `ecom_qc_runs` / `ecom_qc_results`; the run id is written into the push audit record.

## 4. `<EcomQcPanel />`

- Header: score chip with band colour and "N blockers · N warnings · N rows checked".
- Body: findings grouped A–I, collapsed by default with the blockers group expanded. Each row: severity dot, rule key, row/field locator, plain message, offending value in monospace, Fix inline and Show rule. Fix inline opens a single-cell editor pre-filled with valid options from the enum or reference list, re-runs QC for that row only, and animates the resolved finding out.
- Footer: Download annotated file (always on — workbook export with a `qc_status` column and amber/red cell fills carrying the rule key), Fix and re-upload (always on), Continue to Review (disabled while blockers remain, tooltip "Resolve N blockers to continue.").
- Warnings never block; the count carries to Review and the audit record. No push with an open blocker, no silent dropping of failing rows — partial pushes require explicit, logged row deselection.

## 5. Review & Push

One screen for all flows: per-row select, editable cells, embedded QC panel, warning acknowledgement, and a Push button gated identically. Deselections and overrides recorded with the QC run id.

## 6. Flow B — From History

Right-side drawer, "Select a Campaign to Copy", seeded from `historical_configuration`. Search, All Platforms / All Objectives filters, and Top / Platform / Objective / Geo / Recent tabs. Two-column cards: name with overflow tooltip, amber Top Performer ribbon when qualifying, platform chip + action type + objective, Spend / ROAS / Conv strip, pin footer with two cities plus "+N more". Currency follows platform; INR and AED totals shown separately, never summed.

Selecting a card lands on Review pre-filled with an amber "Check these before you push" banner: cleared `end_date`, carried-but-editable `budget_value` with source hint, SKUs tagged in/out-of-stock per city, cities revalidated against the current `city_list`, and a regenerated `campaign_name` with the old one struck through. "Copy to another platform" remaps and hard-flags what cannot carry — SKU codes must be re-picked, unsupported match types dropped. Multi-select up to 20 generates a batch and lands on the same Review screen.

## 7. Flow C — Manual Entry

"Create Campaign" header with a Manual pill, back arrow, Switch to AI-Guided, and a compact "Have many campaigns? Upload the batch import sheet instead" tile linking to Flow A.

Platform sections with "N Types" badges and three-column type-card grids, using the exact India/UAE structure and copy from the brief (Blinkit 3, Zepto 3, Instamart 2, BigBasket 2, Noon Minutes 2, Talabat Mart 2, Carrefour Now 2, Amazon AE 3), marked as pending rate-card confirmation.

Selecting a card opens the five-step form: Basics (live taxonomy preview, character counter), Products (platform-filtered SKU picker from `product_list`, stock badges, SKU cap), Geography (`Platform_city` label with `Geographical_city` helper text), Budget (type toggle, locked currency, conditional required end date, wallet balance before/after), Targeting (keyword table with platform-gated match type, range bids where supported, bid floor helper text, bulk paste of `keyword:match_type:bid;`). A persistent QC strip runs live rules on every change; Create campaign disabled while any blocker is open.

## Technical notes

- New: `src/lib/ecom-qc/` (types, rule groups A–I, engine, live/deep split, scoring, mock persistence), `src/lib/ecom-reference/` (canonical platforms + aliases, SKU regexes, platform limits, product_list, city_list, historical_configuration, taxonomy builder), `src/components/ecom/EcomQcPanel.tsx`, page components under `src/pages/ecom/`.
- SheetJS (`xlsx`) for parsing, the downloadable template and the annotated export.
- Reference data extracted from the workbook into typed TS modules at build time; no binary is committed.
- `roadmap.md` created at build start to track the flow-by-flow sequence.
- Existing views, contexts and the current `/` app untouched apart from the new entry point.
