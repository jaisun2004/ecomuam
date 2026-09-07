# Simplify campaign creation: cities by state, plain recommendations, working back navigation, campaign language

Applies to all three flows (AI chat, manual entry, copy existing). Reviewed against the product-sense tests (job, source, vocabulary, distinctness, configuration). The pm-comms skill is not present in this workspace, so only product-sense was used.

## 1. Where it runs: state first, then cities

- Replace the wall of city buttons with two searchable multi-select dropdowns: **State** (Emirate for UAE platforms), then **City**, filtered to the chosen states.
- Picking a state adds all its cities; every city can be unticked one by one. Chosen cities show as removable chips under the dropdowns, with "Clear all".
- Same control in the manual step "Where" and in the AI flow's recommendation and fix cards wherever a city list is edited. The copy flow shows the copied cities as the same chips so they can be removed or added to before review.
- Cities that have no stock for the chosen products show a small "out of stock" tag in the list; they stay selectable (signals do not block).

## 2. Recommendation cards, stripped to what a user would read

Keep: product name and platform, one line "Why" (the observed fact), one line "Do this", the evidence picture (city chips, rank bar, price bars), the source and collection time, and Apply / Dismiss.

Cut everywhere: the REC-xxxx code, the "Observed / Rule" pill, the provenance pill ("Platform limit", "Collected …"), the kind pill, the confidence dots, the info popover, the italic notes, the grounding line, the "What this aims at … Signal: …" line, the stale-signal paragraph, "Dismissing hides it for 28 days…", and "Recommendations from Ecom Analytics" header blurbs.

- **Remove the bid-floor recommendation entirely.** Platforms do not publish floor bids; nothing feeds it.
- Remaining recommendation types: price vs competing product, in-stock cities, keywords from rank and search demand. Each one already has a real data source.
- The section header becomes "3 suggestions" with the data-as-of time, nothing else.
- Old signals (more than 2 days) show only "collected 3 days ago" in amber. No explanatory sentence.

## 3. Fields that go

- **Objective** and **Primary measure** are removed from manual entry. Neither is asked by Blinkit, Zepto, Instamart, BigBasket or the UAE platforms when a campaign is created, and neither is a column in the file that goes to the platform. They were never sent anywhere.
- **"Pick a reason to run it anyway…"** is removed from the Check step and the review bar. Readiness is a signal: the pill stays visible ("Ready in 7 of 11 cities") but never blocks Continue or asks for a justification. The "Before you continue" box goes with it. Products that cannot run at all still cannot be ticked.

## 4. Back navigation that returns to where you were

Root cause: each flow keeps its draft in the screen itself, so going back from Review remounts the screen at step one. Fix in every flow:

- **Manual**: the draft (platform, type, brand, products, cities, budget, keywords, current step) lives in the shared create context. Coming back from Review lands on the Check step with everything filled. Clicking a completed step in the stepper opens that step (today "Platform" opens a blank screen). Browser back and the header arrow do the same as the Back button.
- **Copy existing**: the selected campaigns are kept in the shared context, keyed by campaign name (today selection is by list position, so changing the search changes what is ticked). Back from Review returns to the picker with the same campaigns ticked.
- **AI chat**: the transcript, uploaded runs, recommendations and review card live in the shared context. Leaving and returning shows the same conversation. The Escape-to-exit shortcut is removed. "Back to the check" on the review card stays.

## 5. Campaign language, not sheet language

Only the AI upload counts rows and can show a grid. Everything else counts campaigns.

- Review screen (manual, copy, AI recommendations): "1 campaign going out", "Send 1 campaign", "2 campaigns held". The "Show the full sheet" fold is replaced by a compact list of campaign cards (name, platform, cities, products, budget, end date) with inline edit. "Download this sheet" is shown only for the upload flow.
- Copy flow: the confirmation dialog and review line say "campaigns", never rows; no grid.
- AI chat: after a file upload it says rows; after Recommendation it says campaigns ("Add 2 campaigns", not "Add as campaign rows").
- Consent line: "I have read these N campaigns and I want them sent."
- Held items follow the same rule: "held campaigns" in manual/copy, "held rows" in upload.

## 6. Verification before hand-over

- Walk each flow end to end in the browser: manual (platform → products → where with state/city → budget → targeting → check → review → back → review → send), copy (pick two, change search, confirm ticks survive, review, back, review), AI (upload sample, fix, review, leave, return, recommendation for one SKU).
- Confirm no screen shows: REC codes, Observed/Rule pills, "Platform floor", "Pick a reason", Objective, Primary measure, sheet wording outside upload.
- Typecheck and build clean.

## Technical details

- `src/lib/ecom-reference/geo.ts` (new): `CITY_STATE` map for the 19 reference cities (Gujarat, Karnataka, Delhi, Haryana, Uttar Pradesh, Punjab, West Bengal, Rajasthan, Telangana; Dubai, Abu Dhabi) and `statesFor(platform)`, `citiesForState(platform, state)`.
- `src/components/ecom/EcomCityPicker.tsx` (new): two `Command`-based searchable multi-selects in `Popover`, chips with remove, clear all, optional stock tags. Used by `FlowManualView`, `FlowHistoryView`, `EcomFixProposal` (city fields).
- `src/lib/ecom-qc/recommendations.ts`: drop `bids` kind and `floor` evidence; remove `code`, `klass`, `provenance`, `grounding`, `impact`, `basis`, `glass`, `confidence`, `stale` text; keep `signal`, `action`, `evidence`, `source`, `collectedDaysAgo`, `changes`, `draft`, `step`.
- `src/components/ecom/EcomRecoCard.tsx`: rewrite to the reduced layout; `readOnly` shows a tick only.
- `src/lib/ecom-reference/config.ts`: remove `OBJECTIVES`, `KPIS`, `OVERRIDE_REASONS`; `EcomCreateContext` loses `addOverride`/`overrides`; review bar loses the overrides note.
- `src/pages/ecom/EcomCreateContext.tsx`: add `manualDraft` + `setManualDraft`, `copySelection` + `setCopySelection`, `chat` (messages, ui flags) + setters; `reset()` clears them; a `sourceCountsRows: boolean` helper (`source === "ai" && fileName` set).
- `src/pages/ecom/FlowManualView.tsx`: state from context; stepper `onGo` handles step 0 by clearing platform; remove Objective/KPI/override UI; `RecoPanel` header simplified.
- `src/pages/ecom/FlowHistoryView.tsx`: selection keyed by `h.name` in context; dialog copy uses "campaigns"; city chips via `EcomCityPicker` per copied campaign.
- `src/pages/ecom/FlowAiView.tsx`: transcript and flags from context; remove Escape handler; button copy "Add N campaigns".
- `src/pages/ecom/ReviewPushView.tsx`, `src/components/ecom/EcomReviewCard.tsx`, `src/components/ecom/EcomHeldList.tsx`: a `noun(count)` helper picks row/campaign from `sourceCountsRows`; campaign-card list component `EcomCampaignList` replaces the grid when not from upload; `Back` uses the flow route instead of `navigate(-1)` so restored drafts open.
