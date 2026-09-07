# Fewer dialogs, one clear "created" screen, plainer stock wording

Six fixes across the three creation flows (AI chat, copy existing, manual) and the upload flow.

## 1. Remove two pop-ups

- Drop the "Create 1 campaign?" pop-up when continuing with all ready campaigns in the AI chat — act directly.
- Drop the no-end-date confirmation. Instead the fact appears once, on the created screen: "No end date set. This campaign runs until you pause it."
- Only two pop-ups remain anywhere: budget that cannot be lowered once live, and a push the wallet does not cover.

## 2. One full "created" screen for every flow

After sending, every flow lands on the same full screen (no chat bubble, no toast, no auto-redirect), in this order:

- Heading: "{n} campaigns created"
- One row per platform: either "Pushed over the API" or "File ready to download" with the download control
- Held count, uncommitted budget, batch name and link, when there are any
- Any line moved off a deleted pop-up (for example the no-end-date line)
- "Recommendations pause until {launch date + 14 days}"
- One button: "Go to Campaign Manager"

Partial failure: the heading names both outcomes, failed platforms can be retried, and a failed file never undoes a completed push.

## 3. Copy existing matches the other steps

Both copy screens use the same page container as Products, Targeting and Budget: same max width, centring, padding, card width, header and footer.

## 4. Plain stock wording

Everywhere a city is excluded (products step, cities table, copy "what changed", review summary), the line reads:

"Noida is not included. Farmlite Digestive has been out of stock there since 29 Aug."

Always product, city, date. Correct singular/plural. Amber, never red. Never disables Continue. When there are several, show two then "and {n} more", expandable.

Only three things still stop creation: product delisted, no linked ad account, wallet short.

## 5. No repeated sentences

The full sentence appears only on the screen where the user can act on it. On review it collapses to one line: "1 city excluded. See why." linking back.

## 6. Manual entry loses the Check step

Anything Check shows that Review and push lacks moves into Review and push first, then the Check step and its route are removed. Budget goes straight to Review and push. The stepper shows four steps.

## 7. One fixed way to show any signal

Drop the bars and per-insight graphics. Every recommendation, whatever the signal, shows the same three lines of text:

```text
Price   Your pack Rs 85  ·  Parle Rs 91          you are Rs 6 cheaper
Stock   In stock 4 of 6 cities                   Noida, Pune out
Search  Rank 7 on "digestive biscuit"            searches up 22% in 8 weeks
```

- Line 1: a label, the two values being compared, and the plain takeaway on the right.
- Line 2 (only when it helps): up to three named items as small tags, then "and 3 more".
- Line 3: source and collected date.

Same layout for price, stock, rank — nothing to redesign per insight type. `RecoEvidence` becomes `{ label, left, right?, takeaway, tags?[] }` and `EcomRecoCard` renders exactly that.

### Prompt for this change

```text
In src/lib/ecom-qc/recommendations.ts replace RecoEvidence with:
{ label: string; left: string; right?: string; takeaway: string; tags?: string[] }
Update the three generators (price, city, keywords) to fill it. Remove bars/chips.

In src/components/ecom/EcomRecoCard.tsx delete the bar renderer. Render:
row 1: label (muted, w-16) · left · right (mono) · takeaway (right-aligned, muted)
row 2: tags as small chips, max 3, then "and N more"
row 3: source · collected date (amber if older than 2 days)
No charts, no per-kind branching.
```

## Technical notes

- `FlowAiView`: remove `window.confirm` in `continueClean`; created state renders the shared outcome screen.
- New shared outcome component used by `ReviewPushView`, `EcomReviewCard` (AI/upload) so all flows land on the same screen.
- Stock lines need an "out of stock since" date: extend the mocked availability helper in `ecom-reference/platforms.ts` to return a deterministic date alongside the boolean, and use it in `EcomCityPicker`, `FlowManualView`, `FlowHistoryView` and the review summary.
- `FlowManualView`: `STEPS` drops "Check"; its step-5 content merges into Review and push.
- No new dependencies, no styling refactors beyond the copy-screen container alignment.

