# Clearer recommendations, flow switching, and a one-step-at-a-time manual entry

## 1. Make recommendations readable instead of claim-like

Today each recommendation is three lines of prose ("MTD pacing at 63% of target", "Recovers roughly 37% of the monthly delivery shortfall"), which reads as an unsupported claim. Rework each card into an evidence-first layout:

- **Header row**: kind chip (Budget / City / Keywords / Bid changes), SKU name, platform, and a 5-dot confidence indicator.
- **Evidence block (the "what we saw")**: shown as a small visual, not a sentence.
  - Budget → a pacing bar: spend delivered vs. month target, with the gap shaded and both numbers labelled.
  - City → a city chip grid, in-stock cities in green, out-of-stock in grey with a strikethrough, so the recommendation is self-evident.
  - Keywords → a rank marker on a 1–20 scale plus a small search-trend sparkline, and the keywords listed as chips.
  - Bid changes → a bid before → after bar with the ACoS value against the category benchmark line.
- **What changes**: the exact field values the row will carry (budget type/value, cities, keyword:bid list), rendered as labelled key–value pairs so the user sees the actual campaign inputs, not a claim.
- **Expected impact**: reframed as a bounded, hedged statement tied to the evidence, with a "based on" line naming the signal and its as-of date. No hard promises.
- **Why this** popover: threshold used, observed value, data freshness — same glass-box pattern used elsewhere in the app.

Selection, "Add as campaign rows" and the QC re-run behaviour stay exactly as they are.

## 2. Switch between AI and Manual at any time

- AI chat header gets a **Switch to manual entry** action. It carries the current platform/rows context where one exists and navigates to the manual flow.
- Manual entry header gets a **Switch to AI guided** action, returning to the AI chat with whatever has already been filled in kept as a draft row.
- Both switches confirm first when there is unsaved work, so nothing is silently lost.

## 3. Manual entry: one screen per step

Currently every completed step stays rendered (`step >= n`), so the page grows into a long scroll. Change to a true wizard:

- Show only the current step's panel; the stepper stays pinned at the top for navigation back to any completed step.
- Steps stay as they are: Platform → Products → Where → Budget and timing → Targeting → Check.
- Each step gets a short heading and one-line purpose, centred at a comfortable reading width.
- A sticky footer bar holds Back / Continue plus a compact context line (platform, currency, data as-of).
- The **Check** step becomes the only summary screen: it lists everything chosen from earlier steps, with an edit link per section that jumps back to that step.
- Continue is disabled until that step's own requirements are met, with the reason shown inline.

## Technical notes

- `src/lib/ecom-qc/recommendations.ts` — extend `SkuRecommendation` with structured evidence (pacing numbers, city lists with stock flags, rank/trend series, bid before/after, ACoS vs benchmark) instead of only prose strings. Generator logic and values stay deterministic and unchanged.
- New `src/components/ecom/EcomRecoCard.tsx` — the visual card, including the small bar/sparkline/chip primitives.
- `src/pages/ecom/FlowAiView.tsx` — render the new card, add the "Switch to manual entry" header action.
- `src/pages/ecom/FlowManualView.tsx` — one-step-at-a-time rendering, sticky footer, summary Check step, "Switch to AI guided" header action.
- No backend or data-source changes; all signals remain the existing mock Ecom Analytics feed.
