# Add Flipkart as a platform across the app

Flipkart shows up everywhere other platforms appear. It is a national marketplace, so its campaigns target at country level (like Amazon India). Until real data arrives, it gets sample numbers in the same style as the other platforms.

## What changes for you

- **Platform filters and pills**: Flipkart can be picked on every screen that has a platform selector.
- **Digital Shelf** (Availability, Pricing, Rank & Market Share, Keywords, Content Quality, Shelf, Discovery, Bestseller, Category screens): Flipkart rows, bars and lines appear with sample values. Like other national platforms, it rolls up to national numbers instead of city or pincode detail.
- **Campaigns** (Campaign Manager, reports, optimisation, budget optimiser, day parting, guardrails, approvals, war room, competitor ads, festival campaigns): Flipkart campaigns and spend/ROAS appear with sample values. No revenue anywhere.
- **Campaign creation**: Flipkart is selectable in Manual, Copy Existing and AI Chat. The review popup labels targeting as COUNTRY with "All of India". The download template's product and city tabs include Flipkart rows, and checks accept Flipkart product codes.
- **Configs** (Crawling inputs, Taxonomy, Manual data entry, Account connected platforms): Flipkart listed as a platform.
- **Colour**: Flipkart uses its existing blue brand colour in charts and badges.

## Technical details

- `platforms.ts`: new `PlatformDef` { slug "Flipkart", display "Flipkart", geo IN, INR, skuFormat "FSN, 16-char alphanumeric", pattern `/^[A-Z0-9]{16}$/i`, all match types }, aliases (flipkart, fk), campaign types (Product Listing Ads, Display Ads).
- `config.ts`: capability with `city_targeting: false`, `marketplace_targeting: true`.
- `workbook-data.ts`: Flipkart product_list rows (same biscuit SKUs with FSN codes) and a single national city_list entry; historical config rows.
- `CampaignCreateModal.tsx`: add Flipkart to MODAL_PLATFORMS as country/INR.
- Each view's local platform arrays and mock datasets get a Flipkart entry; charts use the existing `flipkart` colour token. Totals recomputed where a view shows a sum so numbers still add up.
- Keep existing constraints: no Lulu, no social platforms, spend never generated where a view shows only measured spend.
