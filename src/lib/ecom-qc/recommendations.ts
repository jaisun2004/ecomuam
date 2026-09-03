import type { BatchRow } from "./types";
import { PRODUCT_LIST, CITY_LIST, type RefProduct } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, currencySymbol, getPlatform, isInStock, limitsFor } from "@/lib/ecom-reference/platforms";
import { asOfLabel } from "@/lib/ecom-reference/config";

export type RecoKind = "budget" | "city" | "keywords" | "bids";

/** Structured evidence so a card can be read as a picture, not a claim. */
export type RecoEvidence =
  | { type: "pacing"; deliveredPct: number; spend: number; target: number; symbol: string }
  | { type: "cities"; inStock: string[]; oos: string[] }
  | { type: "rank"; rank: number; scale: number; trend: number[]; trendPct: number; keywords: string[] }
  | { type: "bid"; from: number; to: number; acos: number; benchmark: number; unit: string; symbol: string };

export interface SkuRecommendation {
  id: string;
  kind: RecoKind;
  sku: RefProduct;
  signal: string;
  action: string;
  impact: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  /** the visual evidence behind the recommendation */
  evidence: RecoEvidence;
  /** exact campaign inputs this row would carry */
  changes: { label: string; value: string }[];
  /** which signal it came from and when it was measured */
  basis: string;
  /** threshold / observed pair for the glass-box popover */
  glass: { threshold: string; observed: string; freshness: string };
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
  const symbol = currencySymbol(currency);
  const asOf = asOfLabel();

  const mk = (
    kind: RecoKind,
    signal: string,
    action: string,
    impact: string,
    confidence: 1 | 2 | 3 | 4 | 5,
    evidence: RecoEvidence,
    basis: string,
    glass: { threshold: string; observed: string },
    draft: Partial<Omit<BatchRow, "id" | "row">>,
  ) => {
    const target = draft.campaign_name ?? kind;
    const full: Omit<BatchRow, "id" | "row"> = {
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
    };
    out.push({
      id: `${sku.code}-${kind}`,
      kind,
      sku,
      signal,
      action,
      impact,
      confidence,
      evidence,
      basis,
      glass: { ...glass, freshness: `Ecom Analytics, data as of ${asOf}` },
      changes: [
        { label: "Campaign name", value: full.campaign_name },
        { label: "Budget", value: `${full.budget_type === "daily" ? "Daily" : "Total"} ${symbol}${Number(full.budget_value).toLocaleString("en-IN")}` },
        { label: "Cities", value: full.cities || "marketplace" },
        { label: "Product", value: full.product_id },
        { label: "Keywords and bids", value: full.targeting_details },
      ],
      draft: full,
    });
  };

  // 1. Budget — pacing signal
  const pacing = 60 + (h % 55); // % of monthly target delivered
  const monthTarget = 60000 + (h % 12) * 5000;
  if (pacing < 100) {
    const daily = 2000 + (h % 8) * 500;
    mk(
      "budget",
      `Month-to-date spend is at ${pacing}% of the planned budget on ${platform}.`,
      `Run a daily-budget campaign at ${symbol}${daily.toLocaleString("en-IN")} to close the gap.`,
      `Could recover most of the remaining ${100 - pacing}% of planned delivery if it runs for the rest of the month. Not guaranteed — actual delivery depends on auction supply.`,
      pacing < 80 ? 4 : 3,
      {
        type: "pacing",
        deliveredPct: pacing,
        spend: Math.round((monthTarget * pacing) / 100),
        target: monthTarget,
        symbol,
      },
      "Signal: month-to-date spend pacing",
      { threshold: "Pacing should be at or above 100% of plan", observed: `${pacing}% delivered` },
      { budget_type: "daily", budget_value: String(daily) },
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
      "Keeps spend off cities that cannot fulfil the order today.",
      5,
      { type: "cities", inStock: inStockCities, oos: oosCities },
      "Signal: city-level stock availability",
      { threshold: "Only cities with stock should be targeted", observed: `${inStockCities.length} in stock, ${oosCities.length} out of stock` },
      { cities: inStockCities.slice(0, 4).join(", ") },
    );
  }

  // 3. Keywords — rank and search trend signal
  const rank = 4 + (h % 12);
  const trendPct = 5 + (h % 40);
  const trend = Array.from({ length: 8 }, (_, i) => 40 + ((h >> i) % 25) + Math.round((trendPct * i) / 8));
  mk(
    "keywords",
    `Organic rank ${rank} on "${kws[0]}"; searches up ${trendPct}% week on week.`,
    `Add ${kws.length} keywords built from the SKU title to defend the term.`,
    "Helps hold share of search on the terms driving most of this SKU's discovery.",
    rank > 8 ? 4 : 3,
    { type: "rank", rank, scale: 20, trend, trendPct, keywords: kws },
    "Signal: organic rank and search trend",
    { threshold: "Defend terms where organic rank is outside the top 5", observed: `Rank ${rank}, trend +${trendPct}%` },
    { targeting_details: targetingAt(minBid + 4) },
  );

  // 4. Bids — efficiency signal
  const acos = 12 + (h % 20);
  const benchmark = 22;
  const fromBid = Number((minBid + 4).toFixed(1));
  const bid = Number((minBid + (acos > benchmark ? 2 : 6)).toFixed(1));
  mk(
    "bids",
    `ACoS at ${acos}% against a ${benchmark}% category benchmark.`,
    `${acos > benchmark ? "Trim" : "Raise"} keyword bids from ${fromBid} to ${bid}.`,
    acos > benchmark
      ? "Aims to bring ACoS back toward the benchmark; impressions may fall."
      : "Aims to buy more impressions while efficiency allows; ACoS may rise.",
    acos > benchmark ? 4 : 3,
    { type: "bid", from: fromBid, to: bid, acos, benchmark, unit: def?.matchTypes.length ? "per click" : "per 1,000 impressions", symbol },
    "Signal: ACoS versus category benchmark",
    { threshold: `Category benchmark ACoS ${benchmark}%`, observed: `${acos}% ACoS` },
    { targeting_details: targetingAt(bid) },
  );

  return out;
}


export function recommendationsForSkus(skus: RefProduct[]): SkuRecommendation[] {
  return skus.flatMap(recommendationsForSku);
}
