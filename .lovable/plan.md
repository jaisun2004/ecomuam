# Data hand-over structure for a new brand (Digital Shelf)

Goal: give the brand's team an exact set of CSV files and columns to fill, so the Digital Shelf screens can later be populated with real numbers instead of the sample data. This step produces the templates and the written spec only — no screen is rewired yet.

Format: CSV, one file per data area, UTF-8, comma separated, first row = header exactly as written. That matches how the brand already exports.

## Screens covered

Availability, Pricing, Rank & Market Share, Keyword Analysis, Content Quality Score. Campaign, Governance, Reports and Config screens are out of scope for now.

## Files to be delivered

Three master files (fill once, update when things change):

1. `products.csv` — brand_name, product_name, pack_size, sub_category, platform, platform_product_code, our_product (yes/no), status (active/delisted)
2. `locations.csv` — platform, platform_city_name, city, state, pincode (blank if not used), dark_stores_total
3. `competitors.csv` — competitor_brand, sub_category, is_tracked

Five fact files (one row per day per combination; daily history, at least 90 days for the trend charts):

4. `availability_daily.csv` — date, platform, platform_product_code, city, pincode (blank if not used), dark_stores_listed, dark_stores_total, in_stock (yes/no), days_out_of_stock_last_30
5. `pricing_daily.csv` — date, platform, platform_product_code, city, currency, mrp, selling_price, discount_percent, competitor_brand (blank for own rows), is_own (yes/no)
6. `keyword_daily.csv` — date, platform, keyword, city (blank if national), search_volume_monthly, organic_rank, sponsored_rank (blank if none), match_type, our_share_of_search_percent, top_brand, top_brand_share_percent, platform_product_code (the product ranking, blank if none)
7. `content_audit.csv` — audit_date, platform, platform_product_code, title_score, hero_image_score, search_listing_score, page_content_score, competitor_aggression_score, title_current, title_issue, images_count, videos_count, rating, review_count
8. `market_share.csv` — date, platform, city, sub_category, brand, units_share_percent, value_share_percent (blank if not shared), sku_count, new_listing (yes/no)

## Rules the spec states plainly

- Never fill a cell with a guess or a zero. Leave it blank; a blank means "not measured" and the screen leaves that number out rather than showing a false one.
- Spend and ROAS columns are not requested anywhere; revenue is never shown in this product.
- Dates as YYYY-MM-DD. Percentages as plain numbers (12.5, not 12.5%). Money as plain numbers with a separate currency column.
- `platform` must match one of the platform names already used by the app; the spec lists them.
- `platform_product_code` is the join key everywhere; it must match a row in `products.csv` for that platform. City names must match `locations.csv` for that platform.
- One row per date per key combination; no weekly roll-ups, no totals rows, no merged headers.

## Deliverables

- `data-handover-spec.md` in Files — one short section per file: what it feeds, every column, example row, and the blank rule.
- A ZIP of eight blank CSV templates with headers and two example rows each, in Files.
- A one-page checklist at the top of the spec: what is mandatory to see the screens working at all (products, locations, availability_daily, pricing_daily) and what is optional to start.

## Notes

- Each file section names which screen and which panel it drives, so the brand can see what they lose if they skip a file.
- Coverage of signals the app can rank cities on is called out explicitly: availability is the only one available today; dark store coverage, share of search, organic rank and price index arrive through files 4, 6 and 5 above.
