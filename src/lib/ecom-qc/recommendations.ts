import type { BatchRow } from "./types";
import { PRODUCT_LIST, CITY_LIST, type RefProduct } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, currencySymbol, getPlatform, isInStock } from "@/lib/ecom-reference/platforms";

export type RecoKind = "price" | "city" | "keywords";

/** Which step of the campaign spine this suggestion can be acted on. */
export type RecoStep = "products" | "cities" | "targeting" | "budget";

/**
 * One evidence shape for every signal: a plain fact, an optional pair of bars
 * when there is something to compare, and optional chips for named items.
 */
export interface RecoEvidence {
  fact: string;
  bars?: { label: string; value: number; display: string }[];
  chips?: string[];
}


export interface SkuRecommendation {
  id: string;
  step: RecoStep;
  kind: RecoKind;
  sku: RefProduct;
  /** the observed fact, in one line */
  signal: string;
  /** what to do about it, in one line */
  action: string;
  evidence: RecoEvidence;
  /** exact campaign inputs this suggestion would set */
  changes: { label: string; value: string }[];
  /** where the numbers came from */
  source: string;
  collectedDaysAgo: number;
  /** the batch row this suggestion would create */
  draft: Omit<BatchRow, "id" | "row">;
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

export function collectedLabel(daysAgo: number): string {
  if (daysAgo === 0) return "collected today";
  return `collected ${daysAgo} day${daysAgo > 1 ? "s" : ""} ago`;
}

/**
 * Deterministic pre-launch signal generator standing in for the Ecom Analytics
 * feed. A campaign that has not run has no performance, so the only signals
 * used here exist before launch: stock by city, shelf price against the
 * competing pack, and organic rank with search demand.
 */
export function recommendationsForSku(sku: RefProduct): SkuRecommendation[] {
  const h = hash(`${sku.code}|${sku.platform}`);
  const platform = sku.platform;
  const cities = citiesFor(platform).map((c) => c.platformCity);
  const fallbackCities = CITY_LIST.filter((c) => c.platform === platform).map((c) => c.platformCity);
  const pool = cities.length ? cities : fallbackCities;
  const currency = currencyFor(platform) ?? "INR";
  const brand = sku.name.split(/[ _]/)[0] || "brand";
  const kws = keywordSeed(sku);
  const inStockCities = pool.filter((c) => isInStock(sku.code, c));
  const oosCities = pool.filter((c) => !isInStock(sku.code, c));
  const def = getPlatform(platform);
  const matchType = def?.matchTypes[0] ?? null;
  const bid = 5 + (h % 6);
  const targeting = kws
    .map((k) => (matchType ? `${k}:${matchType}:${bid.toFixed(1)}` : `${k}:${bid.toFixed(1)}`))
    .join("; ");

  const out: SkuRecommendation[] = [];
  const symbol = currencySymbol(currency);

  const mk = (
    kind: RecoKind,
    step: RecoStep,
    signal: string,
    action: string,
    evidence: RecoEvidence,
    source: string,
    collectedDaysAgo: number,
    draft: Partial<Omit<BatchRow, "id" | "row">>,
  ) => {
    const full: Omit<BatchRow, "id" | "row"> = {
      sub_category: "biscuits",
      brand_name: brand,
      platform,
      campaign_name: buildCampaignName({ brand, platform, target: sku.code, action: draft.campaign_name ?? kind }),
      end_date: "",
      budget_type: "daily",
      budget_value: "2000",
      cities: (inStockCities.length ? inStockCities : pool).slice(0, 4).join(", "),
      product_id: sku.code,
      targeting_details: targeting,
      currency,
      selected: true,
      ...draft,
    };
    out.push({
      id: `${sku.code}-${kind}`,
      step,
      kind,
      sku,
      signal,
      action,
      evidence,
      source,
      collectedDaysAgo,
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

  // 1. Price against the competing pack on the shelf today.
  {
    const ours = 40 + (h % 60);
    const theirs = ours + ((h % 7) - 3) * 2;
    const competitor = ["Britannia", "Parle", "Unibic", "Anmol"][h % 4];
    const cheaper = ours < theirs;
    mk(
      "price",
      "products",
      cheaper
        ? `You are ${symbol}${theirs - ours} cheaper than ${competitor} on the shelf today.`
        : `${competitor} is ${symbol}${ours - theirs} cheaper than you on the shelf today.`,
      cheaper
        ? "Run the campaign while the price gap is in your favour."
        : "Close the price gap before spending, or the click lands on a dearer pack.",
      {
        fact: `Your pack ${symbol}${ours} · ${competitor} ${symbol}${theirs}`,
        bars: [
          { label: "Your pack", value: ours, display: `${symbol}${ours}` },
          { label: competitor, value: theirs, display: `${symbol}${theirs}` },
        ],
      },
      "Shelf price crawl",
      h % 2,
      {},
    );
  }

  // 2. Stock by city, known before launch.
  if (inStockCities.length) {
    mk(
      "city",
      "cities",
      oosCities.length
        ? `In stock in ${inStockCities.length} cities, out of stock in ${oosCities.length}.`
        : `In stock across all ${inStockCities.length} serviceable cities.`,
      `Target only the in-stock cities: ${inStockCities.slice(0, 4).join(", ")}.`,
      {
        fact: `In stock in ${inStockCities.length} of ${inStockCities.length + oosCities.length} cities`,
        bars: [
          { label: "In stock", value: inStockCities.length, display: String(inStockCities.length) },
          { label: "Out of stock", value: oosCities.length, display: String(oosCities.length) },
        ],
        chips: inStockCities.slice(0, 6),
      },
      "Store availability crawl",
      0,
      { cities: inStockCities.slice(0, 4).join(", ") },
    );
  }

  // 3. Organic rank and search demand, both measurable before launch.
  const rank = 4 + (h % 12);
  const trendPct = 5 + (h % 40);
  mk(
    "keywords",
    "targeting",
    `Organic rank ${rank} on "${kws[0]}"; searches up ${trendPct}% over eight weeks.`,
    `Add ${kws.length} keywords built from the product title.`,
    { fact: `Rank ${rank} on "${kws[0]}" · searches up ${trendPct}% in 8 weeks`, chips: kws },
    "Keyword rank crawl",
    (h >> 3) % 4,
    { targeting_details: targeting },
  );


  return out;
}

export function recommendationsForSkus(skus: RefProduct[]): SkuRecommendation[] {
  return skus.flatMap(recommendationsForSku);
}
