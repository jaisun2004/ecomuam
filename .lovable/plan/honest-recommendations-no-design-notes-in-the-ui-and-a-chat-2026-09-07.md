# Honest recommendations, no design notes in the UI, and a chat that never leaves the chat

## 1. Recommendations must not claim performance that does not exist yet

Right now a recommendation card says things like "spend so far ₹62,400, 96% delivered" and "ACoS 18% against a 22% benchmark" for a campaign that has not been created. That is not measurable at creation time, so it gets removed.

What each card is allowed to stand on, at creation time:

- **Stock by city** — which cities can actually fulfil this product today, and since when it went out of stock.
- **Organic rank and search demand** — where the product currently ranks on its own terms and whether searches are rising.
- **Price against the competing product** — our price versus the shelf, where we have it.
- **Platform rules** — bid floors, allowed match types, city naming, budget rules taken from the platform reference lists.

Pacing and efficiency are only shown when they belong to something that is already running:

- If the brand already has live campaigns on that platform, a pacing card may appear, clearly labelled **"from your live campaigns on Blinkit"**, never as a property of the new SKU campaign.
- If there is nothing live, no pacing card and no bid-efficiency card at all. In place of a number the card says plainly that there is no spend history for this product yet, and the bid suggestion is anchored to the platform floor and the current auction reference instead of a made-up ACoS.

Card wording changes to match:

- The block heading "What we measured" becomes **"What we know today"**.
- Every figure carries its source and the date it was collected, and the confidence dots drop by one level whenever a signal is older than the freshness threshold.
- No card promises a result. Suggested outcomes read as what the change is aimed at, not what it will deliver.

## 2. Strip the reference-note text out of the interface

Some sentences from the design references were written for the person reading the reference, not for the user, and they are being rendered in the product. These go:

- "…4% of the plan still unspent (shaded)" — the shading legend.
- "green = in stock · struck through = out of stock" — replaced by proper labels on the chips themselves.
- "Readiness is shown before you pick." on the manual Products step.

A sweep over the campaign creation screens removes any other sentence that describes the interface rather than talking to the user or about their data. Helper text about the user's plan, platform or data stays.

## 3. The AI flow stays in the conversation

Today, once the file is checked, the AI flow pushes the user out to a separate review page and a separate held-rows page. That breaks the promise of a conversation.

Change:

- The check result, the proposed fixes, the review-and-push summary and the created confirmation all become cards posted into the same transcript. The user scrolls back to see what happened.
- Review stays a commit surface even as a card: the row table is read only, behind a "Show all rows" disclosure. To change a value the user goes back up to the check card and uses Fix with AI.
- "Held rows" becomes a card in the transcript too, not a route jump.
- The one allowed exception stays: the full row table can open as its own screen with a back link that returns to the same conversation, unchanged.
- Manual entry and copy-from-history keep their own review screen, since those flows are not conversations. Only the AI path is affected.

## Technical notes

- `src/lib/ecom-qc/recommendations.ts` — drop the fabricated `pacing` and `bid`/ACoS evidence for un-launched SKUs; gate them behind an explicit "has live campaigns on this platform" flag in the mock signal layer, and add a `no_history` evidence variant. Bid suggestions derive from `limitsFor(platform).bid_floor` and the reference list, not from ACoS.
- `src/components/ecom/EcomRecoCard.tsx` — rename the evidence block, render the `no_history` state, attach source + as-of per figure, remove legend sentences, degrade confidence on stale data.
- `src/pages/ecom/FlowManualView.tsx` — remove the "Readiness is shown before you pick" note from the step purpose copy.
- `src/pages/ecom/FlowAiView.tsx` — render review, held rows and the created confirmation as transcript cards; remove `navigate("/ecom/campaigns/create/review")` and `.../held` from this flow. Reuse the existing review/held rendering by extracting it into card components shared with the routed views used by manual and history.
- Routes `/review` and `/held` remain for manual and copy flows; no route removals.
