/**
 * Client-facing, plain-English explanations for every QC check in the
 * uploaded rule catalog. One entry per rule_key — nothing generic is shown.
 */
export interface RuleExplanation {
  /** What the check looks at, in one plain sentence. */
  checked: string;
  /** Business consequence of leaving it as is. */
  why: string;
  /** The exact corrective action. */
  fix: string;
}

export const RULE_EXPLANATIONS: Record<string, RuleExplanation> = {
  "file.required_sheets_present": {
    checked: "The workbook has every sheet we need: batch_import, product_list, city_list and historical_config.",
    why: "If a reference sheet is missing we cannot verify SKUs or cities, so bad rows would slip through unnoticed.",
    fix: "Re-download the template and copy your rows into it, keeping all sheets in place.",
  },
  "file.header_row_matches": {
    checked: "The first row of batch_import matches the expected column names, in the expected order.",
    why: "If columns are renamed or reordered, values land in the wrong fields and campaigns launch with the wrong settings.",
    fix: "Restore the template header row exactly; do not rename, delete or reorder columns.",
  },
  "file.row_count_within_range": {
    checked: "The sheet has between 1 and 1000 campaign rows.",
    why: "Very large batches part-push, which leaves half the plan live and half failed and hard to reconcile.",
    fix: "Split the plan into batches of 1000 rows or fewer and upload them one after another.",
  },
  "file.no_merged_cells": {
    checked: "No cells in batch_import are merged.",
    why: "Merged cells lose their values when the file is read, so rows arrive incomplete.",
    fix: "Unmerge every cell and repeat the value in each row.",
  },
  "file.no_html_or_script": {
    checked: "No cell contains HTML tags or script fragments.",
    why: "Markup pasted from a web page is rejected by the retailer and is a security risk.",
    fix: "Paste as plain text and remove anything inside angle brackets.",
  },

  "mandatory.sub_category_present": {
    checked: "Every row names a sub-category.",
    why: "Spend reporting rolls up by sub-category; a blank row disappears from the report.",
    fix: "Enter the sub-category this campaign belongs to, e.g. biscuits.",
  },
  "mandatory.platform_present": {
    checked: "Every row names the platform the campaign runs on.",
    why: "Without a platform there is nowhere to send the campaign, so the row cannot be pushed.",
    fix: "Set the platform to Blinkit, Instamart or Zepto.",
  },
  "mandatory.campaign_name_present": {
    checked: "Every row has a campaign name.",
    why: "The name is how spend is matched back to the plan; a blank name makes the spend untraceable.",
    fix: "Give the campaign a name that follows your naming convention.",
  },
  "mandatory.budget_type_valid": {
    checked: "budget_type is either overall or daily.",
    why: "Pacing works differently for the two types; anything else cannot be interpreted.",
    fix: "Set the value to exactly overall or daily.",
  },
  "mandatory.budget_value_positive": {
    checked: "budget_value is a number greater than zero.",
    why: "A campaign with a zero or blank budget goes live but never shows an ad.",
    fix: "Enter the budget as a plain number, without a currency symbol or commas.",
  },
  "mandatory.cities_present": {
    checked: "Every row lists at least one city.",
    why: "With no cities the campaign serves nowhere and spends nothing.",
    fix: "Add the cities exactly as they appear in the platform's city list.",
  },
  "mandatory.product_id_present": {
    checked: "Every row lists at least one product ID.",
    why: "There is nothing to advertise if no SKU is attached.",
    fix: "Add one or more product codes from the product list, separated by commas.",
  },
  "mandatory.targeting_present": {
    checked: "Keyword-served campaigns carry targeting details.",
    why: "Without keywords the campaign cannot appear in search results, so it will not deliver.",
    fix: "Add targeting as keyword:match_type:bid, separated by semicolons.",
  },

  "platform.canonical_name": {
    checked: "The platform name is one of the recognised platform names.",
    why: "A misspelt or unknown platform cannot be routed, so the row fails on push.",
    fix: "Use the exact platform name from the template's dropdown.",
  },
  "platform.match_types_supported": {
    checked: "The match types used in targeting are supported by this platform.",
    why: "The platform rejects unsupported match types, so the whole campaign fails to launch.",
    fix: "Switch the keyword to a match type this platform accepts (for example exact or phrase).",
  },
  "platform.reference_data_available": {
    checked: "We hold a product and city reference list for this platform.",
    why: "Without reference data we cannot confirm SKUs or cities are real, so errors would pass silently.",
    fix: "Use a platform covered by the reference sheets, or refresh the reference data.",
  },

  "taxonomy.name_unique_in_upload": {
    checked: "No two rows in this upload share the same campaign name.",
    why: "Duplicate names collide on push and spend cannot be attributed to the right campaign.",
    fix: "Rename one of the duplicates, for example by adding the city or date.",
  },
  "taxonomy.name_not_numeric": {
    checked: "The campaign name is not just a number.",
    why: "A purely numeric name is almost always a spreadsheet formatting accident and is unreadable in reports.",
    fix: "Give the campaign a descriptive name.",
  },
  "taxonomy.name_charset": {
    checked: "The campaign name uses lowercase letters, digits and underscores only.",
    why: "Spaces, apostrophes, slashes and pipes are rejected by several platform APIs.",
    fix: "Replace special characters and spaces with underscores.",
  },
  "taxonomy.name_length_cap": {
    checked: "The campaign name fits within this platform's name length limit.",
    why: "Longer names are truncated or rejected, which breaks reconciliation with the plan.",
    fix: "Shorten the name to fit the platform's limit.",
  },
  "taxonomy.no_active_duplicate_on_platform": {
    checked: "No live campaign on this platform already uses this name.",
    why: "The platform rejects the duplicate and the rest of the batch part-fails.",
    fix: "Rename the campaign, or pause the existing one first.",
  },

  "budget.numeric": {
    checked: "budget_value is a clean positive number with no symbol, comma or markup.",
    why: "Currency symbols and commas are not understood and the push is rejected.",
    fix: "Enter, for example, 15000 rather than ₹15,000.",
  },
  "budget.daily_above_floor": {
    checked: "The daily budget is at or above the platform's minimum.",
    why: "Below the minimum the campaign is accepted but never serves, so the plan silently under-delivers.",
    fix: "Raise the daily budget to the platform minimum or higher.",
  },
  "budget.overall_requires_end_date": {
    checked: "Rows with an overall budget also carry an end date.",
    why: "Without an end date there is no burn horizon, so pacing cannot be planned.",
    fix: "Add an end date in YYYY-MM-DD format.",
  },
  "budget.daily_without_end_date_runs_until_paused": {
    checked: "Daily-budget rows with no end date will run until someone pauses them.",
    why: "Usually intended, occasionally an oversight that keeps spending after the campaign period.",
    fix: "Add an end date if the campaign should stop on its own.",
  },
  "budget.currency_matches_platform_geo": {
    checked: "The currency matches the country the platform operates in.",
    why: "A mismatched currency mis-states spend in every report.",
    fix: "Set the currency to INR for Indian platforms.",
  },
  "budget.within_brand_wallet": {
    checked: "The total budget in this batch fits inside the prepaid wallet balance.",
    why: "Quick commerce is prepaid: once the wallet is empty the remaining campaigns fail to push.",
    fix: "Top up the wallet, or reduce budgets so the batch fits the balance.",
  },

  "date.end_date_iso_or_blank": {
    checked: "end_date is written as YYYY-MM-DD, or left blank.",
    why: "Other formats are misread — 03-04 could be March or April — and the campaign ends on the wrong day.",
    fix: "Rewrite the date as YYYY-MM-DD, e.g. 2026-09-30.",
  },
  "date.end_date_in_future": {
    checked: "end_date is later than today.",
    why: "A past end date launches a campaign that has already finished, so it never serves.",
    fix: "Set an end date in the future.",
  },

  "geo.city_in_platform_city_list": {
    checked: "Every city matches a city the platform actually serves.",
    why: "An unknown city is dropped without an error, so the campaign runs in fewer places than planned.",
    fix: "Use the city name exactly as it appears in the platform's city list.",
  },
  "geo.platform_city_not_geographical": {
    checked: "The city is the platform's own name for the area, not a general geographic name.",
    why: "Platforms use their own serviceable-area names; a general name will not match and is dropped.",
    fix: "Replace it with the platform city name from the city list.",
  },
  "geo.city_is_not_country": {
    checked: "The city field holds cities, not a country.",
    why: "A country cannot be targeted at city level, so the row will not resolve to any serviceable area.",
    fix: "List the individual cities you want to run in.",
  },
  "geo.no_duplicate_city_in_row": {
    checked: "No city is listed twice in the same row.",
    why: "Duplicates inflate the apparent reach and can double-count budget splits.",
    fix: "Remove the repeated city.",
  },

  "product.exists_in_product_list": {
    checked: "Every product code exists in this platform's product list.",
    why: "An unknown SKU cannot be advertised, so the campaign launches with nothing to show.",
    fix: "Use a product code from the product_list sheet for this platform.",
  },
  "product.code_format_matches_platform": {
    checked: "The product code follows this platform's ID format.",
    why: "A code in another platform's format is rejected on push.",
    fix: "Replace it with the correct code for this platform.",
  },
  "product.no_duplicate_in_row": {
    checked: "No product code is repeated in the same row.",
    why: "The same SKU twice does not increase delivery; it just makes the row harder to audit.",
    fix: "Remove the repeated code.",
  },
  "product.sku_cap_per_campaign": {
    checked: "The row stays within this platform's maximum number of SKUs per campaign.",
    why: "Above the cap the platform drops the extra SKUs without telling you which.",
    fix: "Split the SKUs across more than one campaign.",
  },
  "product.in_stock_in_targeted_cities": {
    checked: "The SKUs are in stock in the cities being targeted.",
    why: "Advertising an out-of-stock product spends budget on traffic that cannot convert.",
    fix: "Remove the out-of-stock city, or wait for replenishment before launching.",
  },

  "targeting.segment_has_three_parts": {
    checked: "Each targeting entry is written as keyword:match_type:bid.",
    why: "A malformed entry is discarded, so the campaign silently loses that keyword.",
    fix: "Write each entry as keyword:match_type:bid, separated by semicolons.",
  },
  "targeting.match_type_enum": {
    checked: "The match type is a recognised value such as exact, phrase or broad.",
    why: "An unrecognised match type is rejected and the campaign fails to launch.",
    fix: "Use one of the accepted match types for this platform.",
  },
  "targeting.bid_numeric_or_range": {
    checked: "The bid is a number, or a range where the platform allows one.",
    why: "A non-numeric bid cannot be applied, so the keyword does not enter the auction.",
    fix: "Enter the bid as a plain number, e.g. 12.5.",
  },
  "targeting.bid_above_floor": {
    checked: "The bid is at or above the platform's minimum bid.",
    why: "Below the floor the keyword never wins an impression, so the campaign under-delivers.",
    fix: "Raise the bid to the platform minimum or higher.",
  },
  "targeting.bid_range_supported": {
    checked: "Bid ranges are only used on platforms that accept them.",
    why: "On platforms that expect one number, a range is rejected and the keyword is lost.",
    fix: "Replace the range with a single bid value.",
  },
  "targeting.bid_decimal_format": {
    checked: "The bid uses a standard decimal format.",
    why: "Commas or extra decimal places are misread and can multiply the intended bid.",
    fix: "Use a dot as the decimal separator and at most two decimals.",
  },
  "targeting.keyword_min_length": {
    checked: "Keywords are long enough to be meaningful.",
    why: "One or two character keywords match almost nothing and waste setup time.",
    fix: "Use a real search term shoppers would type.",
  },
  "targeting.keyword_not_placeholder": {
    checked: "Keywords are not placeholders like test, tbd or xxx.",
    why: "Placeholders reach live campaigns and spend budget on traffic no shopper searches for.",
    fix: "Replace the placeholder with the intended keyword.",
  },
  "targeting.no_duplicate_keyword_in_row": {
    checked: "No keyword appears twice in the same row.",
    why: "Duplicates compete with each other and inflate the bid you actually pay.",
    fix: "Keep one entry per keyword, with the bid you want.",
  },
  "targeting.keyword_cap_per_campaign": {
    checked: "The row stays within this platform's maximum keywords per campaign.",
    why: "Above the cap the platform drops the extra keywords without saying which.",
    fix: "Split the keywords across more than one campaign.",
  },
  "targeting.no_duplicate_row_combination": {
    checked: "No two rows target the same platform, SKU set and keywords.",
    why: "Identical rows bid against each other, which raises your own cost per click.",
    fix: "Merge the duplicate rows, or differentiate them by city or keyword set.",
  },
};
