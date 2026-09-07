# No performance claims before a campaign exists, and the rest of the prototype folded in

## 1. Nothing in campaign creation may show performance

A campaign that has not run has no spend, no delivery, no return. Every figure of that kind comes out of the creation screens:

- The spend-pacing card on recommendations goes away completely — including the "from your live campaigns on Blinkit" version. Borrowed spend from other campaigns is still performance, and it reads as if it belongs to the SKU being created.
- No modelled ROAS band, no ACoS target framing, no "expected return" anywhere in the create flow. ROAS/ACoS stay only as an objective/KPI the user picks, never as a predicted value.
- What a recommendation may stand on, and nothing else:
  - stock by city and by store, with the date it went out
  - organic rank on the product's own terms, and whether search demand is rising
  - price against the competing product where we have it
  - platform rules: bid floors, allowed match types, city naming, budget rules, targeting level
  - the user's own plan: budget set, cities picked, wallet balance
- Where a bid needs a number, it is anchored to the platform's published floor and the current auction range, with a plain line saying there is no spend history for this product yet.
- Every figure keeps its source and collection date; a signal older than the freshness threshold drops one confidence dot.
- Outcome lines describe intent ("aimed at"), never a result.

## 2. Recommendation cards adopt the prototype's shape

Each card carries: a reference code, whether it is **Observed** (measured) or a **Rule** (threshold your team set), its provenance chip (collection time, or "Platform limit"), a title, "Recommended because" (what was seen), "Do this" (the change), and a grounding line saying where the number came from and that nothing is estimated. Apply / Dismiss on each, with dismissal recorded and hidden for 28 days.

The same recommendation appears on the step where it can be acted on, and is restated on review before anything is created — identical wording and identical count in both places, whichever way the user came in.

## 3. Narrator text from the reference sheets stays out

Lines written to explain the design to a reader, not to the user, are removed wherever they appear: "Readiness is not a step, it runs inside Products", "There is no Continue on this state", "Per-city ROAS is deliberately not shown", "the same three cards appear whether you came in through AI, a copy, or this form", shading legends, and similar. Helper text about the user's own data, plan or platform stays.

## 4. What else from the prototype is worth building

Adopting:

- **Per-city budget allocation** on the budget step: each city as a card with its stock, demand, organic rank and competing-brand count, its rupee share and % of plan, an expandable "Why this amount" showing demand × availability as a share of selected cities, and a per-platform split with keyword bids and the platform's floor/typical range. A reconciliation line proving the city amounts add up to the plan.
- **Held-back city callout** where a recommendation parks money (out of stock since a date), stating the amount held and that it re-checks on restock.
- **Readiness by city** as a per-SKU drill-down with three states — eligible, eligible with a warning, ineligible with no override — reached from Products and returning to it.
- **Copy flow differences screen**: which fields carried over and which need a choice (products delisted, city no longer served, bid below today's range). What the old campaign recorded is shown as history, clearly not a forecast of the new one.
- **Every-row-blocked state**: no Continue at all, only the real ways out (fix, hold, or drop), plus the "wrong sheet" state where the upload is not a campaign sheet.
- **Held batches**: named, dated, showing the uncommitted amount, reopened and re-checked against today, or dropped.
- **Push rules on review**: per-platform API vs export, no single Push button when platforms differ, wallet balance cap (a plan can exceed it, a push cannot), and the irreversible-budget warning for platforms that only allow increases.
- **Completion screen** that says exactly what was pushed over an API, what was exported, and what stayed held.

Not adopting: the modelled ROAS band, per-city return figures, and any card that predicts a result.

## Technical notes

- `src/lib/ecom-qc/recommendations.ts` — drop the `pacing` evidence variant and the `hasLiveCampaigns` gate; keep `cities`, `rank`, `floor`, add a `price` variant. Extend `SkuRecommendation` with `code`, `klass: "observed" | "rule"`, `provenance`, `grounding`, `step`, and `dismissedUntil`.
- `src/components/ecom/EcomRecoCard.tsx` — restructure to the header (code, class pill, provenance) + "Recommended because" / "Do this" / grounding body, with Apply and Dismiss actions.
- `src/pages/ecom/FlowManualView.tsx` — budget step rebuilt as per-city cards with the why-expansion and platform split; recommendations rendered on their owning step.
- `src/pages/ecom/ReviewPushView.tsx` and `src/components/ecom/EcomReviewCard.tsx` — restate the same cards with the same count; keep push/wallet/irreversible rules.
- New `src/lib/ecom-plan/allocation.ts` for the demand × availability split and reconciliation.
- Sweep `src/pages/ecom/*`, `src/components/ecom/*` for narrator copy; strip any ROAS/ACoS prediction strings.
