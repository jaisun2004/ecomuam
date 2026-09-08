# Data clean-up pass (no redesign)

Fix only the data defects listed in the uploaded brief. No layout, styling, component renaming, or new features. Every change is a literal value replacement, except one routing fix and the sidebar accessibility labels.

## 1. Duplicate platform names

Keep the number of slots, values, colours, percentages and order. Only the names change so each slot is unique, drawing from: Instamart, Blinkit, Zepto, Amazon India, Lulu, BigBasket.

- Header retailer chips → Instamart, Blinkit, Zepto
- Availability Platform Matrix columns → Instamart, Amazon India, Blinkit, Zepto, Lulu
- Availability Replenishment Heatmap columns → Blinkit, Instamart, Zepto, Amazon India
- Pricing Platform Price Index rows → Instamart 0.96x, Amazon India 1.02x, Blinkit 1.08x, Zepto 1.05x, Lulu 1.12x
- Campaign Manager Platform ROAS → Instamart 5.1x, Blinkit 3.8x, Amazon India 2.1x, Zepto 3.2x, Lulu 4.4x
- Campaign Manager Budget Allocation → Instamart Ads 38%, Amazon India Ads 22%, Blinkit Ads 18%, Lulu Ads 12%, Zepto Ads 10% (amounts unchanged)
- Budget Optimiser ROAS chart x-axis → Instamart, Amazon India, Blinkit, Lulu, Zepto
- Budget Optimiser rule text → "across Blinkit, Instamart, Zepto and Amazon India"
- Platform list → Instamart, BigBasket, Zepto, Blinkit, Amazon India, Lulu
- Filter list → All, Blinkit, Zepto, Amazon India, Instamart, Lulu; any other filter group repeating a platform gets unique options
- Budget Reallocation rows: row 1 → Amazon India → Instamart ₹ 80K; row 2 → Lulu → Instamart ₹ 40K; row 3 unchanged
- Campaign Manager recommendation → "Shift ₹ 25K from Amazon India → Instamart"

## 2. Corrupted amounts

Replace the twelve broken lakh strings across all screens (₹ 1.200g → ₹ 1.2L, ₹ 2.200g → ₹ 2.2L, ₹ 3.200g → ₹ 3.2L, ₹ 4.200g → ₹ 4.2L, ₹ 5.200g → ₹ 5.2L, ₹ 1.120g → ₹ 1.12L, ₹ 2.120g → ₹ 2.12L, ₹ 4.120g → ₹ 4.12L, ₹ 5.120g → ₹ 5.12L, ₹ 1.250g → ₹ 1.25L, ₹ 2.250g → ₹ 2.25L, ₹ 150g → ₹ 1.5L). These appear in about two dozen screens, including Availability, Pricing, Campaign Manager, Budget Optimiser, Market Share, Festival Campaigns and the planning views.

Campaign Manager → Today's actions → "Marie Gold Retargeting" uplift becomes +0.5x ROAS.

## 3. Wrong-category names

Apply the exact renames from the brief: Rauch products → Sunfeast equivalents, Lacnor → Unibic (including "Unibic — Choco Kiss 120g"), Britannia Zero 330ml → Britannia Good Day 150g, Tropicana OJ → Parle-G 250g, Creatine Retargeting → Marie Gold Retargeting, BCAA Brand Awareness → Bourbon Brand Awareness, Pre-Workout New Users → Britannia Marie New Users, Performance Max → Q-Commerce Always-On, "Sunfeast — Rauch Defensive" → "Sunfeast — Unibic Defensive", and the content-score sentence. Also "Delhi NCR Khalifa" → "Delhi NCR Gurugram"; Riyadh Olaya, Jeddah Al Hamra, Doha West Bay stay.

## 4. Two Central Cockpit panels do not open

Confirmed cause: the Keyword Analysis panel points at route id `shelf` and the Content Quality Score panel at `content`, neither of which exists in the screen registry. Point them at the existing `keywordanalysis` and `contentaudit` views. No new screens.

## 5. Duplicated rows

- Replenishment heatmap: the days shown are currently derived from product-name length, so equal-length names produce identical rows. Replace that with fixed per-product values, changing only Bourbon 250g (2d, 4d, 1d, 5d) and Sunfeast Orange 120g (4d, 2d, 3d, 1d). The other four rows keep the values they show today.
- Budget Optimiser: the single entry under "Custom shelf rules (1)" repeats the built-in "3+ competitors OOS" rule word for word. Delete the copy so the list shows its empty state and the counter reads (0); the built-in rule is untouched.


## 6. Name mismatches (Budget Optimiser only)

Bourbon RT → Bourbon Brand Awareness; Marie Gold SP → Marie Gold Retargeting; Britannia Marie Brand → Britannia Marie New Users.

## 7. Small cleanups

- Remove the stray characters at the bottom of Availability Analytics, Pricing Overview/Analytics, Campaign Manager Overview/Analytics and Budget Optimiser Overview/Analytics.
- Give all 22 sidebar icon buttons a title and aria-label; remove the red badge from any that do not navigate.
- Custom Rule Builder threshold defaults to 2.5.
- "IF CPC > 12" → "IF CPC > ₹12".
- Bourbon — Instamart SP card → Shift ₹ 50K → Zepto.

## Technical notes

- Edits are confined to mock/data constants and JSX literals in `src/views/*`, `src/components/sections/*`, `src/components/Topbar.tsx`, `src/components/Sidebar.tsx`, `src/views/governance/mockData.ts`.
- Currency replacements are done as exact string matches, verified with a repo-wide search for `\d+g"` afterwards to confirm none remain.
- Cockpit fix is a `routeId` value change only, matching the keys in `src/pages/Index.tsx`.
- Verification: typecheck plus a browser pass over Central Cockpit, Availability, Pricing, Campaign Manager and Budget Optimiser.
