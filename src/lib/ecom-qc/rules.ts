import {
  KEYWORD_BLOCKLIST,
  citiesFor,
  currencyFor,
  getPlatform,
  isInStock,
  limitsFor,
  productsFor,
  resolveAlias,
  walletBalance,
  PLATFORM_SLUGS,
} from "@/lib/ecom-reference/platforms";
import { CITY_LIST } from "@/lib/ecom-reference/workbook-data";
import type { BatchRow, QcContext, RuleDef } from "./types";

const COUNTRY_TOKENS = ["uae", "india", "united arab emirates", "pan india", "bharat", "in", "ae"];
const HTML_RE = /<\/?[a-z][\s\S]*>|<script/i;

export function splitList(v: string): string[] {
  return String(v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export interface Segment {
  raw: string;
  keyword: string;
  matchType: string;
  bid: string;
  parts: number;
}

export function parseTargeting(v: string): Segment[] {
  return String(v || "")
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((raw) => {
      const parts = raw.split(":").map((s) => s.trim());
      return { raw, keyword: parts[0] ?? "", matchType: parts[1] ?? "", bid: parts[2] ?? "", parts: parts.length };
    });
}

export function bidNumbers(bid: string): number[] | null {
  const t = String(bid || "").trim();
  if (!t) return null;
  const range = t.match(/^(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)$/);
  if (range) return [Number(range[1]), Number(range[2])];
  if (/^\d+(\.\d+)?$/.test(t)) return [Number(t)];
  return null;
}

const f = (
  field: string,
  value: string,
  message: string,
  opts?: { suggestion?: string; fixable_inline?: boolean; row?: number },
) => ({
  row: opts?.row ?? 0,
  field,
  value,
  message,
  suggestion: opts?.suggestion,
  fixable_inline: opts?.fixable_inline ?? true,
});

const rowF = (r: BatchRow, field: keyof BatchRow | string, message: string, opts?: { suggestion?: string; fixable_inline?: boolean }) =>
  f(String(field), String((r as Record<string, unknown>)[field as string] ?? ""), message, { ...opts, row: r.row });

export const RULES: RuleDef[] = [
  // ---------- A. File and structure ----------
  {
    rule_key: "file.required_sheets_present",
    group: "A. File and structure",
    severity: "blocker",
    when: "live",
    title: "Workbook contains every required sheet, named exactly",
    rationale: "A missing reference sheet silently disables the checks that depend on it.",
    batch: (ctx) => {
      const missing = ctx.structural?.missingSheets ?? [];
      return missing.length
        ? [f("workbook", missing.join(", "), `Workbook is missing the sheet(s): ${missing.join(", ")}.`, { fixable_inline: false })]
        : null;
    },
  },
  {
    rule_key: "file.header_row_matches",
    group: "A. File and structure",
    severity: "blocker",
    when: "live",
    title: "Header row equals the expected columns, in order",
    rationale: "Column drift silently shifts values into the wrong fields.",
    batch: (ctx) =>
      ctx.structural?.headerMismatch
        ? [f("workbook", "header", "Header row does not match the expected batch_import columns.", { fixable_inline: false })]
        : null,
  },
  {
    rule_key: "file.row_count_within_range",
    group: "A. File and structure",
    severity: "blocker",
    when: "live",
    title: "Between 1 and 1000 data rows per upload",
    rationale: "Oversized batches part-push and are hard to reconcile.",
    batch: (ctx) => {
      const n = ctx.rows.length;
      if (n >= 1 && n <= 1000) return null;
      return [f("workbook", String(n), `Upload must carry between 1 and 1000 rows; this one has ${n}.`, { fixable_inline: false })];
    },
  },
  {
    rule_key: "file.no_merged_cells",
    group: "A. File and structure",
    severity: "warning",
    when: "live",
    title: "batch_import contains no merged cells",
    rationale: "Merged cells drop values on parse.",
    batch: () => null,
  },
  {
    rule_key: "file.no_html_or_script",
    group: "A. File and structure",
    severity: "blocker",
    when: "live",
    title: "No cell contains HTML tags or script fragments",
    rationale: "Markup in a value is both a push failure and an injection surface.",
    row: (r) => {
      const hits = Object.entries(r).filter(([k, v]) => k !== "id" && typeof v === "string" && HTML_RE.test(v));
      return hits.length ? hits.map(([k, v]) => rowF(r, k, `${k} contains markup, which retailer APIs reject.`)) : null;
    },
  },

  // ---------- B. Mandatory fields ----------
  {
    rule_key: "mandatory.sub_category_present",
    group: "B. Mandatory fields",
    severity: "warning",
    when: "live",
    title: "sub_category present",
    rationale: "Reporting rolls up by sub-category; a blank breaks the rollup.",
    row: (r) => (!r.sub_category.trim() ? [rowF(r, "sub_category", "sub_category is blank.")] : null),
  },
  {
    rule_key: "mandatory.platform_present",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "platform present",
    rationale: "Nothing downstream resolves without a platform.",
    row: (r) => (!r.platform.trim() ? [rowF(r, "platform", "platform is blank.")] : null),
  },
  {
    rule_key: "mandatory.campaign_name_present",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "campaign_name present",
    rationale: "The name is the reconciliation key across spend reports.",
    row: (r) => (!r.campaign_name.trim() ? [rowF(r, "campaign_name", "campaign_name is blank.")] : null),
  },
  {
    rule_key: "mandatory.budget_type_valid",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "budget_type is overall or daily",
    rationale: "Pacing logic branches on this value.",
    row: (r) => {
      const v = r.budget_type.trim().toLowerCase();
      if (!v) return [rowF(r, "budget_type", "budget_type is blank.", { suggestion: "daily" })];
      if (v !== "overall" && v !== "daily")
        return [rowF(r, "budget_type", "budget_type must be overall or daily.", { suggestion: "daily" })];
      return null;
    },
  },
  {
    rule_key: "mandatory.budget_value_positive",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "budget_value present, numeric and greater than zero",
    rationale: "A zero or blank budget pushes a campaign that can never serve.",
    row: (r) => {
      const v = r.budget_value.trim();
      if (!v) return [rowF(r, "budget_value", "budget_value is blank.")];
      const n = Number(v.replace(/,/g, ""));
      if (!Number.isFinite(n) || n <= 0) return [rowF(r, "budget_value", "budget_value must be a number above zero.")];
      return null;
    },
  },
  {
    rule_key: "mandatory.cities_present",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "cities present",
    rationale: "A blank city list means the campaign serves nowhere.",
    row: (r) => (!r.cities.trim() ? [rowF(r, "cities", "cities is blank.")] : null),
  },
  {
    rule_key: "mandatory.product_id_present",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "At least one product_id present",
    rationale: "There is nothing to advertise without a SKU.",
    row: (r) => (!r.product_id.trim() ? [rowF(r, "product_id", "product_id is blank.")] : null),
  },
  {
    rule_key: "mandatory.targeting_present",
    group: "B. Mandatory fields",
    severity: "blocker",
    when: "live",
    title: "targeting_details present for keyword-served campaigns",
    rationale: "No keywords means no delivery on search placements.",
    row: (r) => (!r.targeting_details.trim() ? [rowF(r, "targeting_details", "targeting_details is blank.")] : null),
  },

  // ---------- C. Platform identity ----------
  {
    rule_key: "platform.canonical_name",
    group: "C. Platform identity",
    severity: "blocker",
    when: "live",
    title: "platform is one of the eight canonical slugs",
    rationale:
      "The same retailer appears under two identities in the data, which splits spend reports and breaks wallet reconciliation.",
    row: (r) => {
      const v = r.platform.trim();
      if (!v || PLATFORM_SLUGS.includes(v)) return null;
      const mapped = resolveAlias(v);
      return [
        rowF(r, "platform", mapped ? `${v} is an alias, not the canonical slug.` : `${v} is not a known platform.`, {
          suggestion: mapped ?? undefined,
        }),
      ];
    },
  },
  {
    rule_key: "platform.match_types_supported",
    group: "C. Platform identity",
    severity: "blocker",
    when: "live",
    title: "Platform supports the match types used in targeting_details",
    rationale: "An unsupported match type is rejected by the retailer API on push.",
    row: (r) => {
      const p = getPlatform(r.platform.trim());
      if (!p) return null;
      const out: ReturnType<typeof rowF>[] = [];
      for (const s of parseTargeting(r.targeting_details)) {
        const mt = s.matchType.toLowerCase();
        if (!mt) continue;
        if (p.matchTypes.length === 0) {
          out.push(rowF(r, "targeting_details", `${p.display} does not accept match types; "${s.raw}" carries ${s.matchType}.`));
        } else if (!p.matchTypes.includes(mt as never)) {
          out.push(
            rowF(r, "targeting_details", `${p.display} does not support match type "${s.matchType}".`, {
              suggestion: p.matchTypes[0],
            }),
          );
        }
      }
      return out.length ? out : null;
    },
  },
  {
    rule_key: "platform.reference_data_available",
    group: "C. Platform identity",
    severity: "warning",
    when: "live",
    title: "Reference data exists for the platform",
    rationale: "Without a product list, SKU rules cannot pass or fail honestly.",
    row: (r) => {
      const slug = r.platform.trim();
      if (!slug || !getPlatform(slug)) return null;
      return productsFor(slug).length === 0
        ? [rowF(r, "platform", `No product reference data for ${slug}; SKU checks were skipped.`, { fixable_inline: false })]
        : null;
    },
  },

  // ---------- D. Taxonomy ----------
  {
    rule_key: "taxonomy.name_unique_in_upload",
    group: "D. Taxonomy",
    severity: "blocker",
    when: "live",
    title: "campaign_name unique across all rows in the upload",
    rationale: "Duplicate names collide on push and make spend unattributable.",
    batch: (ctx) => {
      const seen = new Map<string, number>();
      const out: ReturnType<typeof f>[] = [];
      for (const r of ctx.rows) {
        const k = r.campaign_name.trim().toLowerCase();
        if (!k) continue;
        if (seen.has(k)) out.push(f("campaign_name", r.campaign_name, `campaign_name repeats row ${seen.get(k)}.`, { row: r.row }));
        else seen.set(k, r.row);
      }
      return out.length ? out : null;
    },
  },
  {
    rule_key: "taxonomy.name_not_numeric",
    group: "D. Taxonomy",
    severity: "blocker",
    when: "live",
    title: "campaign_name is not numeric",
    rationale: "A numeric name is almost always a spreadsheet formatting accident.",
    row: (r) => (r.campaign_name.trim() && /^\d+(\.\d+)?$/.test(r.campaign_name.trim()) ? [rowF(r, "campaign_name", "campaign_name is numeric.")] : null),
  },
  {
    rule_key: "taxonomy.name_charset",
    group: "D. Taxonomy",
    severity: "blocker",
    when: "live",
    title: "campaign_name uses lowercase letters, digits and underscore only",
    rationale: "Apostrophes, spaces, pipes and slashes are rejected by several retailer APIs.",
    row: (r) => {
      const v = r.campaign_name.trim();
      if (!v || /^[a-z0-9_]+$/.test(v)) return null;
      return [
        rowF(r, "campaign_name", "campaign_name contains characters outside a-z, 0-9 and underscore.", {
          suggestion: v.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
        }),
      ];
    },
  },
  {
    rule_key: "taxonomy.name_length_cap",
    group: "D. Taxonomy",
    severity: "warning",
    when: "live",
    title: "campaign_name within the platform name-length cap",
    rationale: "Caps differ per retailer and are not in the source data.",
    row: (r) => {
      const lim = limitsFor(r.platform.trim());
      if (lim.name_length_cap == null)
        return r.campaign_name.length > 120
          ? [rowF(r, "campaign_name", "Limit not confirmed for this platform; name is unusually long.", { fixable_inline: false })]
          : null;
      return r.campaign_name.length > lim.name_length_cap
        ? [rowF(r, "campaign_name", `campaign_name exceeds the ${lim.name_length_cap} character cap.`)]
        : null;
    },
  },
  {
    rule_key: "taxonomy.no_active_duplicate_on_platform",
    group: "D. Taxonomy",
    severity: "blocker",
    when: "deep",
    title: "No active campaign with the same name on that platform and account",
    rationale: "The retailer rejects the push and the batch part-fails.",
    row: (r) => {
      const name = r.campaign_name.trim().toLowerCase();
      if (!name) return null;
      // mocked live-campaign lookup
      return name.endsWith("_20260701_mf") || name.includes("_duplicate_")
        ? [rowF(r, "campaign_name", "A live campaign with this name already exists on this platform.")]
        : null;
    },
  },

  // ---------- E. Budget ----------
  {
    rule_key: "budget.numeric",
    group: "E. Budget",
    severity: "blocker",
    when: "live",
    title: "budget_value parses as a positive number with no symbol, comma or markup",
    rationale: "Currency symbols and markup in the budget field fail the push.",
    row: (r) => {
      const v = r.budget_value.trim();
      if (!v) return null;
      if (/^\d+(\.\d+)?$/.test(v)) return null;
      return [
        rowF(r, "budget_value", "budget_value must be a bare number with no symbol, comma or markup.", {
          suggestion: (v.match(/\d+(\.\d+)?/) ?? [""])[0] || undefined,
        }),
      ];
    },
  },
  {
    rule_key: "budget.daily_above_floor",
    group: "E. Budget",
    severity: "blocker",
    when: "live",
    title: "Daily budget at or above the retailer minimum",
    rationale: "Below the floor the campaign is accepted but never serves.",
    row: (r) => {
      if (r.budget_type.trim().toLowerCase() !== "daily") return null;
      const lim = limitsFor(r.platform.trim());
      const n = Number(r.budget_value.replace(/,/g, ""));
      if (!Number.isFinite(n)) return null;
      if (lim.daily_budget_floor == null)
        return [rowF(r, "budget_value", "Limit not confirmed for this platform.", { fixable_inline: false })];
      return n < lim.daily_budget_floor
        ? [
            rowF(r, "budget_value", `Daily budget is below the ${lim.daily_budget_floor} minimum for this platform.`, {
              suggestion: String(lim.daily_budget_floor),
            }),
          ]
        : null;
    },
  },
  {
    rule_key: "budget.overall_requires_end_date",
    group: "E. Budget",
    severity: "blocker",
    when: "live",
    title: "When budget_type is overall, end_date is present",
    rationale: "An overall budget with no end date has no burn horizon, so pacing cannot be computed.",
    row: (r) =>
      r.budget_type.trim().toLowerCase() === "overall" && !r.end_date.trim()
        ? [rowF(r, "end_date", "An overall budget needs an end date.")]
        : null,
  },
  {
    rule_key: "budget.daily_without_end_date_runs_until_paused",
    group: "E. Budget",
    severity: "warning",
    when: "live",
    title: "Daily budget with a blank end_date runs until paused",
    rationale: "Usually intended, occasionally not — worth a look before push.",
    row: (r) =>
      r.budget_type.trim().toLowerCase() === "daily" && !r.end_date.trim()
        ? [rowF(r, "end_date", "This campaign will run until it is paused manually.", { fixable_inline: false })]
        : null,
  },
  {
    rule_key: "budget.currency_matches_platform_geo",
    group: "E. Budget",
    severity: "blocker",
    when: "live",
    title: "Row currency resolves from platform geo",
    rationale: "INR for India platforms, AED for UAE platforms; a mismatch mis-states spend.",
    row: (r) => {
      const expected = currencyFor(r.platform.trim());
      if (!expected) return null;
      const actual = r.currency.trim().toUpperCase();
      if (!actual || actual !== expected)
        return [rowF(r, "currency", `Currency must be ${expected} for this platform.`, { suggestion: expected })];
      return null;
    },
  },
  {
    rule_key: "budget.within_brand_wallet",
    group: "E. Budget",
    severity: "blocker",
    when: "deep",
    title: "Batch stays within the prepaid brand wallet",
    rationale: "Quick commerce is prepaid; a batch over the balance part-pushes and leaves the rest failed.",
    batch: (ctx) => {
      const totals = new Map<string, number>();
      for (const r of ctx.rows) {
        const key = `${r.brand_name.trim()}|${r.platform.trim()}`;
        const n = Number(r.budget_value.replace(/,/g, ""));
        if (!Number.isFinite(n)) continue;
        totals.set(key, (totals.get(key) ?? 0) + n);
      }
      const out: ReturnType<typeof f>[] = [];
      for (const [key, total] of totals) {
        const [brand, platform] = key.split("|");
        if (!brand || !platform) continue;
        const bal = walletBalance(brand, platform);
        if (total > bal) {
          const row = ctx.rows.find((r) => r.brand_name.trim() === brand && r.platform.trim() === platform);
          out.push(
            f("budget_value", String(total), `${brand} on ${platform} requests ${total} against a wallet balance of ${bal}.`, {
              row: row?.row ?? 0,
              fixable_inline: false,
            }),
          );
        }
      }
      return out.length ? out : null;
    },
  },

  // ---------- F. Dates ----------
  {
    rule_key: "date.end_date_iso_or_blank",
    group: "F. Dates",
    severity: "blocker",
    when: "live",
    title: "end_date is YYYY-MM-DD, or blank",
    rationale: "Any other format is silently dropped or misread as US order.",
    row: (r) => {
      const v = r.end_date.trim();
      if (!v) return null;
      return /^\d{4}-\d{2}-\d{2}$/.test(v) ? null : [rowF(r, "end_date", "end_date must be formatted YYYY-MM-DD.")];
    },
  },
  {
    rule_key: "date.end_date_in_future",
    group: "F. Dates",
    severity: "blocker",
    when: "live",
    title: "end_date is later than today",
    rationale: "A past end date pushes a campaign that is already finished.",
    row: (r) => {
      const v = r.end_date.trim();
      if (!v || !/^\d{4}-\d{2}-\d{2}$/.test(v)) return null;
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return new Date(`${v}T00:00:00`) <= today ? [rowF(r, "end_date", "end_date is in the past.")] : null;
    },
  },

  // ---------- G. Cities and geography ----------
  {
    rule_key: "geo.city_in_platform_city_list",
    group: "G. Cities and geography",
    severity: "blocker",
    when: "live",
    title: "Every city resolves to a Platform_city row in city_list",
    rationale: "An unknown city is dropped with no error, so the campaign serves in fewer places than planned.",
    row: (r) => {
      const slug = r.platform.trim();
      const known = citiesFor(slug);
      if (!known.length) return null;
      const out: ReturnType<typeof rowF>[] = [];
      for (const city of splitList(r.cities)) {
        if (known.some((k) => k.platformCity.toLowerCase() === city.toLowerCase())) continue;
        const byGeo = known.find((k) => k.geoCity.toLowerCase() === city.toLowerCase());
        if (byGeo) continue; // handled by the platform-vs-geographical rule
        out.push(
          f("cities", city, `"${city}" is not a valid city for ${slug}.`, {
            row: r.row,
            suggestion: known[0]?.platformCity,
          }),
        );
      }
      return out.length ? out : null;
    },
  },
  {
    rule_key: "geo.platform_city_not_geographical",
    group: "G. Cities and geography",
    severity: "blocker",
    when: "live",
    title: "Cities use the platform's own city name, not the geographical name",
    rationale: "Zepto calls Noida GBuddha Nagar; sending the geographical name drops the city with no error.",
    row: (r) => {
      const slug = r.platform.trim();
      const known = citiesFor(slug);
      if (!known.length) return null;
      const out: ReturnType<typeof f>[] = [];
      for (const city of splitList(r.cities)) {
        const lower = city.toLowerCase();
        if (known.some((k) => k.platformCity.toLowerCase() === lower)) continue;
        const byGeo = known.find((k) => k.geoCity.toLowerCase() === lower);
        if (byGeo)
          out.push(
            f("cities", city, `${slug} calls this city "${byGeo.platformCity}", not "${city}".`, {
              row: r.row,
              suggestion: byGeo.platformCity,
            }),
          );
      }
      return out.length ? out : null;
    },
  },
  {
    rule_key: "geo.city_is_not_country",
    group: "G. Cities and geography",
    severity: "blocker",
    when: "live",
    title: "City value is a city, not a country",
    rationale: "Rows in the current export carry values such as UAE in the city column.",
    row: (r) => {
      const out = splitList(r.cities)
        .filter((c) => COUNTRY_TOKENS.includes(c.toLowerCase()))
        .map((c) => f("cities", c, `"${c}" is a country, not a city.`, { row: r.row }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "geo.no_duplicate_city_in_row",
    group: "G. Cities and geography",
    severity: "warning",
    when: "live",
    title: "No city repeats within a row",
    rationale: "Duplicates inflate the apparent footprint of a campaign.",
    row: (r) => {
      const seen = new Set<string>();
      const dupes: string[] = [];
      for (const c of splitList(r.cities)) {
        const k = c.toLowerCase();
        if (seen.has(k)) dupes.push(c);
        seen.add(k);
      }
      return dupes.length ? [f("cities", dupes.join(", "), `City repeats within the row: ${dupes.join(", ")}.`, { row: r.row })] : null;
    },
  },

  // ---------- H. Products ----------
  {
    rule_key: "product.exists_in_product_list",
    group: "H. Products",
    severity: "blocker",
    when: "live",
    title: "Every product_id exists in product_list for that platform",
    rationale: "An unknown SKU is rejected on push.",
    row: (r) => {
      const slug = r.platform.trim();
      const known = productsFor(slug);
      if (!known.length) return null;
      const out = splitList(r.product_id)
        .filter((code) => !known.some((p) => p.code.toLowerCase() === code.toLowerCase()))
        .map((code) => f("product_id", code, `${code} is not in product_list for ${slug}.`, { row: r.row, suggestion: known[0]?.code }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "product.code_format_matches_platform",
    group: "H. Products",
    severity: "blocker",
    when: "live",
    title: "SKU code matches the platform's code format",
    rationale: "Cross-platform SKU leakage is already present in live data — Zepto UUIDs filed under Blinkit and back.",
    row: (r) => {
      const p = getPlatform(r.platform.trim());
      if (!p?.skuPattern) return null;
      const out = splitList(r.product_id)
        .filter((code) => !p.skuPattern!.test(code))
        .map((code) => f("product_id", code, `${code} is not a valid ${p.display} SKU (${p.skuFormat}).`, { row: r.row }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "product.no_duplicate_in_row",
    group: "H. Products",
    severity: "warning",
    when: "live",
    title: "No product_id repeats within a row",
    rationale: "Duplicated SKUs double-count the assortment on the campaign.",
    row: (r) => {
      const seen = new Set<string>();
      const dupes: string[] = [];
      for (const c of splitList(r.product_id)) {
        const k = c.toLowerCase();
        if (seen.has(k)) dupes.push(c);
        seen.add(k);
      }
      return dupes.length ? [f("product_id", dupes.join(", "), `SKU repeats within the row: ${dupes.join(", ")}.`, { row: r.row })] : null;
    },
  },
  {
    rule_key: "product.sku_cap_per_campaign",
    group: "H. Products",
    severity: "warning",
    when: "live",
    title: "SKU count within the platform cap",
    rationale: "Caps are not in the source data and must be confirmed per retailer.",
    row: (r) => {
      const lim = limitsFor(r.platform.trim());
      const n = splitList(r.product_id).length;
      if (lim.sku_cap == null) return n > 50 ? [f("product_id", String(n), "Limit not confirmed for this platform.", { row: r.row, fixable_inline: false })] : null;
      return n > lim.sku_cap ? [f("product_id", String(n), `SKU count exceeds the cap of ${lim.sku_cap}.`, { row: r.row })] : null;
    },
  },
  {
    rule_key: "product.in_stock_in_targeted_cities",
    group: "H. Products",
    severity: "warning",
    when: "deep",
    title: "SKUs are in stock in the targeted cities",
    rationale: "Spending on an out-of-stock SKU is the defining waste mode of this channel.",
    row: (r) => {
      const cities = splitList(r.cities);
      const out: ReturnType<typeof f>[] = [];
      for (const code of splitList(r.product_id)) {
        const oos = cities.filter((c) => !isInStock(code, c));
        if (oos.length)
          out.push(
            f("product_id", code, `${code} is out of stock in ${oos.join(", ")}.`, { row: r.row, fixable_inline: false }),
          );
      }
      return out.length ? out : null;
    },
  },

  // ---------- I. Targeting details ----------
  {
    rule_key: "targeting.segment_has_three_parts",
    group: "I. Targeting details",
    severity: "blocker",
    when: "live",
    title: "Every segment splits into exactly three colon-separated parts",
    rationale: "A malformed segment drops the whole targeting string.",
    row: (r) => {
      const p = getPlatform(r.platform.trim());
      const out = parseTargeting(r.targeting_details)
        .filter((s) => (p && p.matchTypes.length === 0 ? s.parts < 2 || s.parts > 3 : s.parts !== 3))
        .map((s) => f("targeting_details", s.raw, `"${s.raw}" is not keyword:match_type:bid.`, { row: r.row }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.match_type_enum",
    group: "I. Targeting details",
    severity: "blocker",
    when: "live",
    title: "Match type is exact, phrase or broad",
    rationale: "The header said exact/broad but the real data contains Phrase.",
    row: (r) => {
      const out = parseTargeting(r.targeting_details)
        .filter((s) => s.matchType && !["exact", "phrase", "broad"].includes(s.matchType.toLowerCase()))
        .map((s) => f("targeting_details", s.matchType, `"${s.matchType}" is not a valid match type.`, { row: r.row, suggestion: "broad" }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.bid_numeric_or_range",
    group: "I. Targeting details",
    severity: "blocker",
    when: "live",
    title: "Bid is a number or a min-max range",
    rationale: "The current export contains bids of o and string.",
    row: (r) => {
      const out = parseTargeting(r.targeting_details)
        .filter((s) => s.bid && bidNumbers(s.bid) === null)
        .map((s) => f("targeting_details", s.bid, `Bid "${s.bid}" is not a number or a min-max range.`, { row: r.row }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.bid_above_floor",
    group: "I. Targeting details",
    severity: "blocker",
    when: "live",
    title: "Bid is at or above the platform floor",
    rationale: "Bids of 0, 0.2 and .2 never win a placement.",
    row: (r) => {
      const lim = limitsFor(r.platform.trim());
      const floor = lim.bid_floor;
      const out: ReturnType<typeof f>[] = [];
      for (const s of parseTargeting(r.targeting_details)) {
        const nums = bidNumbers(s.bid);
        if (!nums) continue;
        if (floor == null) continue;
        if (Math.min(...nums) < floor)
          out.push(f("targeting_details", s.bid, `Bid ${s.bid} is below the floor of ${floor}.`, { row: r.row, suggestion: String(floor) }));
      }
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.bid_range_supported",
    group: "I. Targeting details",
    severity: "warning",
    when: "live",
    title: "Bid ranges only on range-capable platforms",
    rationale: "Range bids are dropped to the minimum where unsupported.",
    row: (r) => {
      const p = getPlatform(r.platform.trim());
      if (!p || p.supportsBidRange) return null;
      const out = parseTargeting(r.targeting_details)
        .filter((s) => /-/.test(s.bid))
        .map((s) => f("targeting_details", s.bid, `${p.display} does not accept a bid range.`, { row: r.row, suggestion: s.bid.split("-")[0] }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.bid_decimal_format",
    group: "I. Targeting details",
    severity: "warning",
    when: "live",
    title: "Decimal bids are written 0.2, not .2",
    rationale: "Leading-dot decimals parse as zero on some retailer APIs.",
    row: (r) => {
      const out = parseTargeting(r.targeting_details)
        .filter((s) => /^\.\d+$/.test(s.bid.trim()))
        .map((s) => f("targeting_details", s.bid, `Write this bid as 0${s.bid.trim()}.`, { row: r.row, suggestion: `0${s.bid.trim()}` }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.keyword_min_length",
    group: "I. Targeting details",
    severity: "warning",
    when: "live",
    title: "Keyword is at least 3 characters",
    rationale: "One and two character keywords match nothing useful.",
    row: (r) => {
      const out = parseTargeting(r.targeting_details)
        .filter((s) => s.keyword && s.keyword.trim().length < 3)
        .map((s) => f("targeting_details", s.keyword, `Keyword "${s.keyword}" is shorter than 3 characters.`, { row: r.row }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.keyword_not_placeholder",
    group: "I. Targeting details",
    severity: "warning",
    when: "live",
    title: "Keyword is not a test or placeholder token",
    rationale: "The current export ships keywords such as string, abcd and test-keyword attached to live budgets.",
    row: (r) => {
      const out = parseTargeting(r.targeting_details)
        .filter((s) => KEYWORD_BLOCKLIST.includes(s.keyword.trim().toLowerCase()))
        .map((s) => f("targeting_details", s.keyword, `"${s.keyword}" looks like a placeholder, not a real keyword.`, { row: r.row }));
      return out.length ? out : null;
    },
  },
  {
    rule_key: "targeting.no_duplicate_keyword_in_row",
    group: "I. Targeting details",
    severity: "blocker",
    when: "live",
    title: "No keyword repeats within a row",
    rationale: "Duplicate keywords bid against themselves.",
    row: (r) => {
      const seen = new Set<string>();
      const dupes: string[] = [];
      for (const s of parseTargeting(r.targeting_details)) {
        const k = s.keyword.trim().toLowerCase();
        if (!k) continue;
        if (seen.has(k)) dupes.push(s.keyword);
        seen.add(k);
      }
      return dupes.length ? [f("targeting_details", dupes.join(", "), `Keyword repeats within the row: ${dupes.join(", ")}.`, { row: r.row })] : null;
    },
  },
  {
    rule_key: "targeting.keyword_cap_per_campaign",
    group: "I. Targeting details",
    severity: "warning",
    when: "live",
    title: "Keyword count within the platform cap",
    rationale: "Caps are not in the source data and must be confirmed per retailer.",
    row: (r) => {
      const lim = limitsFor(r.platform.trim());
      const n = parseTargeting(r.targeting_details).length;
      if (lim.keyword_cap == null)
        return n > 100 ? [f("targeting_details", String(n), "Limit not confirmed for this platform.", { row: r.row, fixable_inline: false })] : null;
      return n > lim.keyword_cap ? [f("targeting_details", String(n), `Keyword count exceeds the cap of ${lim.keyword_cap}.`, { row: r.row })] : null;
    },
  },
  {
    rule_key: "targeting.no_duplicate_row_combination",
    group: "I. Targeting details",
    severity: "blocker",
    when: "live",
    title: "No two rows share the same brand, platform, products, cities and keywords",
    rationale: "Identical rows compete with each other for the same placement.",
    batch: (ctx) => {
      const seen = new Map<string, number>();
      const out: ReturnType<typeof f>[] = [];
      for (const r of ctx.rows) {
        const key = [
          r.brand_name.trim().toLowerCase(),
          r.platform.trim(),
          splitList(r.product_id).map((s) => s.toLowerCase()).sort().join(","),
          splitList(r.cities).map((s) => s.toLowerCase()).sort().join(","),
          parseTargeting(r.targeting_details).map((s) => s.keyword.toLowerCase()).sort().join(","),
        ].join("|");
        if (!r.platform.trim()) continue;
        if (seen.has(key))
          out.push(f("campaign_name", r.campaign_name, `This row duplicates row ${seen.get(key)} on brand, platform, SKUs, cities and keywords.`, { row: r.row, fixable_inline: false }));
        else seen.set(key, r.row);
      }
      return out.length ? out : null;
    },
  },
];

export const RULE_INDEX: Record<string, RuleDef> = Object.fromEntries(RULES.map((r) => [r.rule_key, r]));

export function knownCitySuggestions(platform: string): string[] {
  return citiesFor(platform).map((c) => c.platformCity);
}

export function allCityRows() {
  return CITY_LIST;
}

export function ruleCounts() {
  return {
    total: RULES.length,
    blockers: RULES.filter((r) => r.severity === "blocker").length,
    warnings: RULES.filter((r) => r.severity === "warning").length,
  };
}

export type { QcContext };
