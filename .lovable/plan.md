# Simplify campaign creation: cities by state, plain recommendations, working back navigation, campaign language

Every point from the feedback is covered below, plus the problems found while walking all three flows (AI chat, manual entry, copy existing). Checked against the product-sense tests (job, source, vocabulary, distinctness, configuration, backend, copy). The pm-comms skill is not installed in this workspace, so only product-sense was applied.

## 1. Where it runs: state first, then cities

- Replace the wall of city buttons with two searchable multi-selects: **State** (Emirate for the UAE platforms), then **City**, filtered to the chosen states. Tick and untick anything.
- Choosing a state ticks all its cities; each city can still be unticked. Chosen cities appear as removable chips with "Clear all".
- The duplicated grey sub-label under each city ("Ahmedabad / Ahmedabad") goes. It only differs for a handful of records, and there it shows as "Gurugram (platform name: Gurgaon)".
- Cities with no stock for the chosen products carry a small "out of stock" tag but stay selectable. Signals inform, they do not block.
- Same control in manual "Where", in the copy flow (edit the copied cities before review), and wherever the AI fix cards edit a city list.
- Carrefour Now targets store codes, not cities, and Amazon AE targets the whole marketplace. Those two keep their current single-line message, no picker.

## 2. Recommendation cards, stripped

Keep only: product name and platform, one line of why, one line of what to do, the evidence picture (city chips, rank bar, price bars), source and collection time, Apply and Dismiss.

Cut everywhere: the REC-xxxx code, the "Observed / Rule" pill, the provenance pill, the kind pill, the confidence dots, the info popover, italic footnotes, the grounding sentence, "What this aims at … Signal: …", the stale paragraph, "Dismissing hides it for 28 days…", and the "Recommendations from Ecom Analytics / Built from what we know today…" header blurb.

- **The bid-floor recommendation is removed entirely.** These platforms do not publish a floor bid, so the number had no source.
- What remains: price against the competing pack, in-stock cities, keywords from organic rank and search demand. Each has a real crawl behind it.
- Section header becomes "3 suggestions" with the data time, nothing else.
- Data older than two days shows "collected 3 days ago" in amber and nothing more.

## 3. Fields and controls that go

- **Objective** and **Primary measure** are removed. Blinkit, Zepto, Instamart, BigBasket, Noon, Talabat, Carrefour and Amazon AE do not ask for them at campaign creation and they are not columns in the file that goes out, so nothing consumed them.
- **"Pick a reason to run it anyway…"** is removed, along with the "Before you continue" box and the footer line "Give a reason for each product with a warning". The readiness pill stays visible and never blocks Continue. Products that cannot run at all still cannot be ticked.
- The linked override list on the review bar ("2 warnings were accepted with a reason") goes with it.

## 4. Back navigation

Root cause: each flow keeps its draft inside the screen, so leaving and returning remounts it empty and drops the user at step one.

- **Manual**: the whole draft (platform, campaign type, brand, products, cities, budget, keywords, current step) moves into the shared create context. Returning from review lands on Check with everything intact. The stepper's first chip currently clears the platform and shows a blank screen; it will open the platform step with the current choice selected. Header arrow, footer Back and browser back all step back one, and only leave the flow from step one.
- **Copy existing**: selection is currently by list position, so typing in the search box silently changes which campaigns are ticked. Selection moves to the campaign name and into the context, so search, platform filter and returning from review all keep the same ticks.
- **AI chat**: the transcript, uploads, suggestions and review card move into the context so leaving and coming back shows the same conversation. The Escape-key exit is removed (it dumps the whole conversation with no warning). "Back to the check" stays.

## 5. Campaign language, not sheet language

Only the AI upload counts rows and shows a grid. Every other flow counts campaigns.

- Review: "1 campaign going out", "Send 1 campaign", "2 campaigns held". For manual and copy, the "Show the full sheet" grid is replaced by campaign cards (name, platform, cities, products, budget, end date) with inline edit. "Download this sheet" appears only for the upload flow.
- Copy flow: the differences dialog and review line say campaigns, never rows, and never show a grid.
- AI chat: rows after a file upload, campaigns after suggestions ("Add 2 campaigns").
- Consent line: "I have read these 3 campaigns and I want them sent."
- Held items follow the same rule: held campaigns in manual and copy, held rows in the upload flow.

## 6. Other problems found in the walk-through

- Copy flow: the readiness pill on a card is computed from the first product and first city only, but reads as if it covers the campaign. It will show the campaign-wide count ("ready in 8 of 11 cities").
- Copy flow: the picker caps at 20 silently. Ticking a 21st will say so.
- Copy flow lands straight on review with no chance to edit. A short edit step (cities, budget, end date) comes before review, since end dates are cleared on copy and a total budget without an end date cannot run.
- Manual: leaving the flow with a part-filled draft asks before discarding, the same as the AI-to-manual switch does today.
- Manual: the campaign name is rebuilt from the first city, so it changes silently when cities change. It will be shown once as an editable field.
- AI chat: after "Start Over" and after a failed upload the conversation keeps stale suggestion and review cards on screen; they are cleared with the run.
- Review: pressing send twice can fire two pushes; the button locks on first press.
- Review: a batch where every campaign is held currently shows an enabled-looking send button with "Send 0". It shows a single "Nothing can be sent yet" state with the held list open.
- Empty states are written for each case: no products for a platform, no cities matching the state filter, no past campaigns matching the search, no suggestions for the chosen products.

## 7. Verification before hand-over

- Walk each flow end to end in the browser: manual (platform → products → where with state and city → budget → targeting → check → review → back → review → send), copy (pick two, change the search, confirm the ticks survive, edit, review, back, review), AI (upload the sample, fix, review, leave, return, ask for suggestions on one product).
- Confirm no screen shows: REC codes, Observed/Rule pills, platform floor bids, "Pick a reason", Objective, Primary measure, or sheet wording outside the upload flow.
- Typecheck and build clean.

## Technical details

- `src/lib/ecom-reference/geo.ts` (new): `CITY_STATE` for the 19 reference cities (Gujarat, Karnataka, Delhi, Haryana, Uttar Pradesh, Punjab, West Bengal, Rajasthan, Telangana, Dubai, Abu Dhabi), plus `statesFor(platform)` and `citiesForState(platform, state)`.
- `src/components/ecom/EcomCityPicker.tsx` (new): two `Command`-in-`Popover` multi-selects, chips with remove, clear all, optional stock tags. Used by `FlowManualView`, the new copy edit step and `EcomFixProposal` city fields.
- `src/lib/ecom-qc/recommendations.ts`: drop the `bids` kind and `floor` evidence; drop `code`, `klass`, `provenance`, `grounding`, `impact`, `basis`, `glass`, `confidence`, `stale` copy; keep `signal`, `action`, `evidence`, `source`, `collectedDaysAgo`, `changes`, `draft`, `step`.
- `src/components/ecom/EcomRecoCard.tsx`: rewrite to the reduced layout; `readOnly` renders a tick only.
- `src/lib/ecom-reference/config.ts`: remove `OBJECTIVES`, `KPIS`, `OVERRIDE_REASONS`. `EcomCreateContext` loses `addOverride`/`overrides`; the review bar loses the overrides note.
- `src/pages/ecom/EcomCreateContext.tsx`: add `manualDraft`, `copySelection` (by campaign name), `chat` (messages and view flags), each with a setter; `reset()` clears them; add `countsRows = source === "ai" && !!fileName`.
- `src/pages/ecom/FlowManualView.tsx`: state from context; stepper `onGo(0)` opens the platform step instead of clearing it; Objective/KPI/override UI removed; editable campaign name; leave-guard; simplified suggestion header.
- `src/pages/ecom/FlowHistoryView.tsx`: selection keyed by name in context; campaign-wide readiness; 20-item message; new edit step before review; dialog copy in campaigns.
- `src/pages/ecom/FlowAiView.tsx`: transcript and flags from context; Escape handler removed; cards cleared on reset and on a failed upload; "Add N campaigns".
- `src/pages/ecom/ReviewPushView.tsx`, `src/components/ecom/EcomReviewCard.tsx`, `src/components/ecom/EcomHeldList.tsx`: a `noun(count)` helper picks row or campaign from `countsRows`; new `EcomCampaignList` replaces the grid when the batch did not come from a file; send button locks while pushing; all-held state; Back returns to the originating flow route rather than `navigate(-1)`.
