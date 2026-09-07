import type { BatchRow } from "./types";
import { PRODUCT_LIST, CITY_LIST, type RefProduct } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, currencySymbol, getPlatform, isInStock, limitsFor } from "@/lib/ecom-reference/platforms";
import { asOfLabel } from "@/lib/ecom-reference/config";

export type RecoKind = "price" | "city" | "keywords" | "bids";

/** Which step of the campaign spine this recommendation can be acted on. */
export type RecoStep = "products" | "targeting" | "budget";

/** Structured evidence so a card can be read as a picture, not a claim. */
export type RecoEvidence =
  | { type: "cities"; inStock: string[]; oos: string[] }
  | { type: "rank"; rank: number; scale: number; trend: number[]; trendPct: number; keywords: string[] }
  | { type: "floor"; floor: number; suggested: number; unit: string; symbol: string; note: string }
  | { type: "price"; ours: number; theirs: number; competitor: string; symbol: string; note: string };

export interface SkuRecommendation {
  id: string;
  /** short reference code the user can quote back */
  code: string;
  /** measured from data, or a threshold your team set */
  klass: "observed" | "rule";
  /** where it came from: a collection time, or a platform limit */
  provenance: string;
  /** the step this card belongs to */
  step: RecoStep;
  kind: RecoKind;
  sku: RefProduct;
  signal: string;
  action: string;
  impact: string;
  /** where the number came from, and that nothing is estimated */
  grounding: string;
  confidence: 1 | 2 | 3 | 4 | 5;
  /** the visual evidence behind the recommendation */
  evidence: RecoEvidence;
  /** exact campaign inputs this row would carry */
  changes: { label: string; value: string }[];
  /** which signal it came from and when it was measured */
  basis: string;
  /** where the numbers came from and how old they are */
  source: string;
  collectedDaysAgo: number;
  stale: boolean;
  /** threshold / observed pair for the glass-box popover */
  glass: { threshold: string; observed: string; freshness: string };
  /** the batch row this recommendation would create */
  draft: Omit<BatchRow, "id" | "row">;
}

/** A dismissal is recorded, not silently dropped, and hides the card for 28 days. */
export interface RecoDismissal {
  code: string;
  at: string;
  until: string;
}

export function dismissFor28Days(code: string): RecoDismissal {
  const now = new Date();
  const until = new Date(now.getTime() + 28 * 24 * 3600 * 1000);
  return { code, at: now.toISOString(), until: until.toISOString() };
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
 * Deterministic pre-launch signal generator standing in for the Ecom Analytics
 * feed. At creation time a SKU campaign has no performance of its own, so the
 * only signals used here are ones that exist before anything runs: stock by
 * city, organic rank and search demand, and the platform's own rules. Spend
 * pacing is only ever shown when the brand already has live campaigns on that
 * platform, and it is labelled as such.
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
  /** Does the brand already run campaigns on this platform? Only then is pacing real. */
  const hasLiveCampaigns = h % 3 === 0;

  const mk = (
    kind: RecoKind,
    signal: string,
    action: string,
    impact: string,
    baseConfidence: 1 | 2 | 3 | 4 | 5,
    evidence: RecoEvidence,
    basis: string,
    source: string,
    collectedDaysAgo: number,
    glass: { threshold: string; observed: string },
    draft: Partial<Omit<BatchRow, "id" | "row">>,
  ) => {
    const target = draft.campaign_name ?? kind;
    const stale = collectedDaysAgo > 2;
    const confidence = (stale ? Math.max(baseConfidence - 1, 1) : baseConfidence) as 1 | 2 | 3 | 4 | 5;
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
      source,
      collectedDaysAgo,
      stale,
      glass: {
        ...glass,
        freshness: `${source}, collected ${collectedDaysAgo === 0 ? "today" : `${collectedDaysAgo} day${collectedDaysAgo > 1 ? "s" : ""} ago`} (as of ${asOf})`,
      },
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

  // 1. Budget — only where the brand already spends on this platform.
  if (hasLiveCampaigns) {
    const pacing = 60 + (h % 35); // % of this month's plan delivered by the live campaigns
    const monthTarget = 60000 + (h % 12) * 5000;
    const daily = 2000 + (h % 8) * 500;
    mk(
      "budget",
      `Your live campaigns on ${platform} have delivered ${pacing}% of this month's plan.`,
      `Open this new campaign on a daily budget of ${symbol}${daily.toLocaleString("en-IN")} to use the rest of the plan.`,
      `Aimed at putting the unspent ${100 - pacing}% of the plan to work. Delivery depends on auction supply.`,
      pacing < 80 ? 4 : 3,
      {
        type: "pacing",
        deliveredPct: pacing,
        spend: Math.round((monthTarget * pacing) / 100),
        target: monthTarget,
        symbol,
        scope: `From your live campaigns on ${platform} — not from this SKU, which has not run yet.`,
      },
      "Signal: month-to-date spend on your live campaigns",
      "Platform billing feed",
      h % 2,
      { threshold: "Plan should be fully delivered by month end", observed: `${pacing}% delivered so far` },
      { budget_type: "daily", budget_value: String(daily) },
    );
  }

  // 2. City — stock availability, known before launch.
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
      "Store availability crawl",
      0,
      { threshold: "Only cities with stock should be targeted", observed: `${inStockCities.length} in stock, ${oosCities.length} out of stock` },
      { cities: inStockCities.slice(0, 4).join(", ") },
    );
  }

  // 3. Keywords — organic rank and search demand, both measurable before launch.
  const rank = 4 + (h % 12);
  const trendPct = 5 + (h % 40);
  const trend = Array.from({ length: 8 }, (_, i) => 40 + ((h >> i) % 25) + Math.round((trendPct * i) / 8));
  mk(
    "keywords",
    `Organic rank ${rank} on "${kws[0]}"; searches up ${trendPct}% over eight weeks.`,
    `Add ${kws.length} keywords built from the SKU title to defend the term.`,
    "Aimed at holding share of search on the terms driving this SKU's discovery.",
    rank > 8 ? 4 : 3,
    { type: "rank", rank, scale: 20, trend, trendPct, keywords: kws },
    "Signal: organic rank and search demand",
    "Keyword rank crawl",
    (h >> 3) % 4,
    { threshold: "Defend terms where organic rank is outside the top 5", observed: `Rank ${rank}, searches +${trendPct}%` },
    { targeting_details: targetingAt(minBid + 4) },
  );

  // 4. Opening bid — anchored to the published floor, never to invented efficiency.
  const opening = Number((minBid * 1.2).toFixed(1));
  mk(
    "bids",
    `The bid floor on ${platform} is ${symbol}${minBid}.`,
    `Open at ${symbol}${opening} so the campaign clears the floor from day one.`,
    "Aimed at entering the auction reliably. There is nothing to optimise against until it has run.",
    4,
    {
      type: "floor",
      floor: minBid,
      suggested: opening,
      unit: def?.matchTypes.length ? "per click" : "per 1,000 impressions",
      symbol,
      note: "This product has no spend history, so no efficiency figure is shown. The opening bid comes from the platform's published floor.",
    },
    "Signal: published platform bid floor",
    "Platform reference list",
    0,
    { threshold: `Bids below ${symbol}${minBid} never enter the auction`, observed: `Opening bid ${symbol}${opening}` },
    { targeting_details: targetingAt(opening) },
  );

  return out;
}


export function recommendationsForSkus(skus: RefProduct[]): SkuRecommendation[] {
  return skus.flatMap(recommendationsForSku);
}
