import type { BatchRow } from "./types";
import { PRODUCT_LIST, CITY_LIST, type RefProduct } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, getPlatform, isInStock, limitsFor } from "@/lib/ecom-reference/platforms";

export type RecoKind = "budget" | "city" | "keywords" | "bids";

export interface SkuRecommendation {
  id: string;
  kind: RecoKind;
  sku: RefProduct;
  signal: string;
  action: string;
  impact: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  /** the batch row this recommendation would create */
  draft: Omit<BatchRow, "id" | "row">;
}

const KIND_LABEL: Record<RecoKind, string> = {
  budget: "Budget",
  city: "City",
  keywords: "Keywords",
  bids: "Bid changes",
};

export function recoKindLabel(k: RecoKind): string {
  return KIND_LABEL[k];
}

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function keywordSeed(sku: RefProduct): string[] {
  const words = sku.name
    .toLowerCase()
    .replace(/[^a-z0-9 ]+/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
  const base = words.slice(0, 2).join(" ") || "biscuits";
  return [base, `${words[0] ?? "brand"} online`, `buy ${base}`];
}

/** Search the product reference list for the SKU picker. */
export function searchSkus(q: string, limit = 40): RefProduct[] {
  const s = q.trim().toLowerCase();
  const pool = s
    ? PRODUCT_LIST.filter((p) => p.name.toLowerCase().includes(s) || p.code.includes(s) || p.platform.toLowerCase().includes(s))
    : PRODUCT_LIST;
  return pool.slice(0, limit);
}

export function findSku(token: string): RefProduct | undefined {
  const s = token.trim().toLowerCase();
  return PRODUCT_LIST.find((p) => p.code === s || p.name.toLowerCase() === s) ??
    PRODUCT_LIST.find((p) => p.name.toLowerCase().includes(s) && s.length > 3);
}

/**
 * Deterministic recommendation generator standing in for the Ecom Analytics
 * feed: stock, price vs competition, keyword rank and pacing signals.
 */
export function recommendationsForSku(sku: RefProduct): SkuRecommendation[] {
  const h = hash(`${sku.code}|${sku.platform}`);
  const platform = sku.platform;
  const cities = citiesFor(platform).map((c) => c.platformCity);
  const fallbackCities = CITY_LIST.filter((c) => c.platform === platform).map((c) => c.platformCity);
  const pool = cities.length ? cities : fallbackCities;
  const currency = currencyFor(platform) ?? "INR";
  const limits = limitsFor(platform);
  const brand = sku.name.split(/[ _]/)[0] || "brand";
  const kws = keywordSeed(sku);
  const inStockCities = pool.filter((c) => isInStock(sku.code, c));
  const oosCities = pool.filter((c) => !isInStock(sku.code, c));
  const minBid = Math.max(limits.bid_floor ?? 1, 1);
  const def = getPlatform(platform);
  const matchType = def?.matchTypes[0] ?? null;
  const targetingAt = (bidValue: number) =>
    kws
      .map((k) => (matchType ? `${k}:${matchType}:${bidValue.toFixed(1)}` : `${k}:${bidValue.toFixed(1)}`))
      .join("; ");

  const out: SkuRecommendation[] = [];

  const mk = (
    kind: RecoKind,
    signal: string,
    action: string,
    impact: string,
    confidence: 1 | 2 | 3 | 4 | 5,
    draft: Partial<Omit<BatchRow, "id" | "row">>,
  ) => {
    const target = draft.campaign_name ?? kind;
    out.push({
      id: `${sku.code}-${kind}`,
      kind,
      sku,
      signal,
      action,
      impact,
      confidence,
      draft: {
        sub_category: "biscuits",
        brand_name: brand,
        platform,
        campaign_name: buildCampaignName({ brand, platform, target: sku.code, action: target }),
        end_date: "",
        budget_type: "daily",
        budget_value: "2000",
        cities: (inStockCities.length ? inStockCities : pool).slice(0, 4).join(", "),
        product_id: sku.code,
        targeting_details: targetingAt(minBid + 4),
        currency,
        selected: true,
        ...draft,
      },
    });
  };

  // 1. Budget — pacing signal
  const pacing = 60 + (h % 55); // % of monthly target delivered
  if (pacing < 100) {
    mk(
      "budget",
      `MTD pacing at ${pacing}% of target on ${platform} — spend is behind plan.`,
      `Run a daily-budget campaign at ${(2000 + (h % 8) * 500).toLocaleString("en-IN")} to close the gap.`,
      `Recovers roughly ${100 - pacing}% of the monthly delivery shortfall.`,
      pacing < 80 ? 4 : 3,
      { budget_type: "daily", budget_value: String(2000 + (h % 8) * 500) },
    );
  }

  // 2. City — stock and demand signal
  if (inStockCities.length) {
    mk(
      "city",
      oosCities.length
        ? `In stock in ${inStockCities.length} cities, out of stock in ${oosCities.length}.`
        : `In stock across all ${inStockCities.length} serviceable cities.`,
      `Target only the in-stock cities: ${inStockCities.slice(0, 4).join(", ")}.`,
      "Stops budget going to cities that cannot fulfil the order.",
      5,
      { cities: inStockCities.slice(0, 4).join(", ") },
    );
  }

  // 3. Keywords — rank and search trend signal
  const rank = 4 + (h % 12);
  mk(
    "keywords",
    `Organic rank ${rank} on "${kws[0]}"; search volume up ${5 + (h % 40)}% week on week.`,
    `Add ${kws.length} keywords built from the SKU title to defend the term.`,
    `Protects share of search on the terms driving most of the SKU's discovery.`,
    rank > 8 ? 4 : 3,
    { targeting_details: targetingAt(minBid + 4) },
  );

  // 4. Bids — price advantage / ACoS signal
  const acos = 12 + (h % 20);
  const bid = Number((minBid + (acos > 22 ? 2 : 6)).toFixed(1));
  mk(
    "bids",
    `ACoS at ${acos}% — ${acos > 22 ? "above" : "below"} the category benchmark.`,
    `${acos > 22 ? "Trim" : "Raise"} keyword bids to ${bid} to ${acos > 22 ? "protect efficiency" : "capture more impressions"}.`,
    acos > 22 ? "Brings ACoS back toward the benchmark." : "Adds impression share while efficiency allows.",
    acos > 22 ? 4 : 3,
    { targeting_details: targetingAt(bid) },
  );

  return out;
}

export function recommendationsForSkus(skus: RefProduct[]): SkuRecommendation[] {
  return skus.flatMap(recommendationsForSku);
}
