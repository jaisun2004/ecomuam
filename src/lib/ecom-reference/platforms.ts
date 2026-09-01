import { CITY_LIST, PRODUCT_LIST, type RefCity, type RefProduct } from "./workbook-data";

export type Geo = "IN" | "UAE";
export type Currency = "INR" | "AED";
export type MatchType = "exact" | "phrase" | "broad";

export interface PlatformDef {
  slug: string;
  display: string;
  geo: Geo;
  currency: Currency;
  skuFormat: string;
  skuPattern: RegExp | null;
  matchTypes: MatchType[]; // empty = platform ignores match type
  supportsBidRange: boolean;
}

export const PLATFORMS: PlatformDef[] = [
  {
    slug: "Blinkit",
    display: "Blinkit",
    geo: "IN",
    currency: "INR",
    skuFormat: "6-digit numeric, e.g. 544531",
    skuPattern: /^\d{6}$/,
    matchTypes: [],
    supportsBidRange: true,
  },
  {
    slug: "Zepto_app",
    display: "Zepto",
    geo: "IN",
    currency: "INR",
    skuFormat: "UUID, e.g. a406d37d-6078-4644-a3da-06ed405cbb46",
    skuPattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
  {
    slug: "Instamart_app",
    display: "Swiggy Instamart",
    geo: "IN",
    currency: "INR",
    skuFormat: "10-char alphanumeric, optionally two joined by _",
    skuPattern: /^[A-Z0-9]{10}(_[A-Z0-9]{10})?$/i,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
  {
    slug: "BigBasket",
    display: "BigBasket",
    geo: "IN",
    currency: "INR",
    skuFormat: "Not present in the source export — confirm before enabling",
    skuPattern: null,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
  {
    slug: "noon_minutes_uae_app",
    display: "Noon Minutes",
    geo: "UAE",
    currency: "AED",
    skuFormat: "Z + 20 hex + Z-1, e.g. ZD09ED5BF1F00885F9AE5Z-1",
    skuPattern: /^Z[0-9A-F]{20}Z-\d+$/i,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
  {
    slug: "talabat_mart_uae",
    display: "Talabat Mart",
    geo: "UAE",
    currency: "AED",
    skuFormat: "24-char hex, or talabat_mart_uae_ + digits",
    skuPattern: /^([0-9a-f]{24}|talabat_mart_uae_\d+)$/i,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
  {
    slug: "carrefour_now_uae",
    display: "Carrefour Now",
    geo: "UAE",
    currency: "AED",
    skuFormat: "7-digit numeric, or carrefour_now_uae_ + digits",
    skuPattern: /^(\d{7}|carrefour_now_uae_\d+)$/i,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
  {
    slug: "amazonae",
    display: "Amazon AE",
    geo: "UAE",
    currency: "AED",
    skuFormat: "ASIN, or amazonae_ + lowercase ASIN",
    skuPattern: /^(B[0-9A-Z]{9}|amazonae_[0-9a-z]{10})$/i,
    matchTypes: ["exact", "phrase", "broad"],
    supportsBidRange: false,
  },
];

export const PLATFORM_SLUGS = PLATFORMS.map((p) => p.slug);

export const PLATFORM_ALIASES: Record<string, string> = {
  zepto: "Zepto_app",
  zepto_app: "Zepto_app",
  instamart: "Instamart_app",
  instamart_app: "Instamart_app",
  "swiggy instamart": "Instamart_app",
  blinkit: "Blinkit",
  bigbasket: "BigBasket",
  "big basket": "BigBasket",
  "noon minutes": "noon_minutes_uae_app",
  noon: "noon_minutes_uae_app",
  noon_minutes_uae_app: "noon_minutes_uae_app",
  talabat: "talabat_mart_uae",
  "talabat mart": "talabat_mart_uae",
  talabat_mart_uae: "talabat_mart_uae",
  carrefour: "carrefour_now_uae",
  "carrefour now": "carrefour_now_uae",
  carrefour_now_uae: "carrefour_now_uae",
  amazon: "amazonae",
  "amazon ae": "amazonae",
  amazonae: "amazonae",
};

export function getPlatform(slug: string): PlatformDef | undefined {
  return PLATFORMS.find((p) => p.slug === slug);
}

export function resolveAlias(raw: string): string | null {
  const key = String(raw || "").trim().toLowerCase();
  return PLATFORM_ALIASES[key] ?? null;
}

export function platformDisplay(slug: string): string {
  return getPlatform(slug)?.display ?? slug;
}

export function currencyFor(slug: string): Currency | null {
  return getPlatform(slug)?.currency ?? null;
}

export function currencySymbol(c: Currency | null): string {
  return c === "AED" ? "AED " : c === "INR" ? "₹" : "";
}

/** Limits that are NOT derivable from the source data. null = unconfirmed. */
export interface PlatformLimits {
  platform: string;
  bid_floor: number | null;
  daily_budget_floor: number | null;
  keyword_cap: number | null;
  sku_cap: number | null;
  name_length_cap: number | null;
  confirmed_at: string | null;
}

export const PLATFORM_LIMITS: Record<string, PlatformLimits> = Object.fromEntries(
  PLATFORMS.map((p) => [
    p.slug,
    {
      platform: p.slug,
      bid_floor: 1,
      daily_budget_floor: 100, // per qc_checks group E, customisable per platform
      keyword_cap: null,
      sku_cap: null,
      name_length_cap: null,
      confirmed_at: null,
    } as PlatformLimits,
  ]),
);

export function limitsFor(slug: string): PlatformLimits {
  return (
    PLATFORM_LIMITS[slug] ?? {
      platform: slug,
      bid_floor: null,
      daily_budget_floor: null,
      keyword_cap: null,
      sku_cap: null,
      name_length_cap: null,
      confirmed_at: null,
    }
  );
}

export const ACTION_TYPES = [
  "competition_oos",
  "defend_keyword",
  "keywords_losing_rank",
  "price_driven",
] as const;
export type ActionType = (typeof ACTION_TYPES)[number];

export function slugify(v: string): string {
  return String(v || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function buildCampaignName(opts: {
  brand: string;
  platform: string;
  target: string;
  action: string;
  date?: Date;
}): string {
  const d = opts.date ?? new Date();
  const stamp = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return [slugify(opts.brand), slugify(opts.platform), slugify(opts.target), slugify(opts.action), stamp, "mf"]
    .filter(Boolean)
    .join("_");
}

export function productsFor(platform: string): RefProduct[] {
  return PRODUCT_LIST.filter((p) => p.platform === platform);
}

export function citiesFor(platform: string): RefCity[] {
  return CITY_LIST.filter((c) => c.platform === platform);
}

/** Deterministic mocked availability, standing in for the live stock feed. */
export function isInStock(code: string, city: string): boolean {
  let h = 0;
  const s = `${code}|${city}`;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h % 100 > 22;
}

/** Deterministic mocked prepaid wallet balance per brand+platform. */
export function walletBalance(brand: string, platform: string): number {
  let h = 0;
  const s = `${brand}|${platform}`;
  for (let i = 0; i < s.length; i++) h = (h * 37 + s.charCodeAt(i)) >>> 0;
  return 25000 + (h % 40) * 1000;
}

export const KEYWORD_BLOCKLIST = [
  "string",
  "abc",
  "abcd",
  "test",
  "test-keyword",
  "testkeyword",
  "keyword",
  "keyword2",
  "asdf",
  "qwerty",
  "xyz",
  "demo",
  "sample",
  "na",
  "none",
  "null",
  "rahul",
  "amit",
  "john",
  "priya",
];

export interface CampaignTypeDef {
  id: string;
  title: string;
  description: string;
}

export const PLATFORM_CAMPAIGN_TYPES: { platform: string; geo: Geo; types: CampaignTypeDef[] }[] = [
  {
    platform: "Blinkit",
    geo: "IN",
    types: [
      { id: "pla", title: "Product Listing Ads", description: "Sponsored SKUs in search and category results." },
      { id: "banner", title: "Banner Ads", description: "Display placements on home and category pages." },
      { id: "defence", title: "Keyword Defence", description: "Protect your own brand terms from competitors." },
    ],
  },
  {
    platform: "Zepto_app",
    geo: "IN",
    types: [
      { id: "search", title: "Search Ads", description: "Sponsored SKUs against keyword queries." },
      { id: "display", title: "Display Ads", description: "Banner placements across the app." },
      { id: "takeover", title: "Category Takeover", description: "Own a category listing page." },
    ],
  },
  {
    platform: "Instamart_app",
    geo: "IN",
    types: [
      { id: "pla", title: "Product Listing Ads", description: "Sponsored SKUs in search results." },
      { id: "brand", title: "Brand Ads", description: "Brand-level placements on category pages." },
    ],
  },
  {
    platform: "BigBasket",
    geo: "IN",
    types: [
      { id: "sp", title: "Sponsored Products", description: "SKU-level ads in search and browse." },
      { id: "store", title: "Brand Store", description: "A hosted brand page with placements driving to it." },
    ],
  },
  {
    platform: "noon_minutes_uae_app",
    geo: "UAE",
    types: [
      { id: "sp", title: "Sponsored Products", description: "SKU ads against keywords." },
      { id: "display", title: "Display Banners", description: "Placements across the storefront." },
    ],
  },
  {
    platform: "talabat_mart_uae",
    geo: "UAE",
    types: [
      { id: "listing", title: "Sponsored Listings", description: "SKU ads in search and category." },
      { id: "banner", title: "Store Banners", description: "Placements inside the Mart storefront." },
    ],
  },
  {
    platform: "carrefour_now_uae",
    geo: "UAE",
    types: [
      { id: "sp", title: "Sponsored Products", description: "SKU ads at store level." },
      { id: "display", title: "Store Display", description: "Banner placements per dark store." },
    ],
  },
  {
    platform: "amazonae",
    geo: "UAE",
    types: [
      { id: "sp", title: "Sponsored Products", description: "ASIN-level keyword ads." },
      { id: "sb", title: "Sponsored Brands", description: "Brand headline ads." },
      { id: "sd", title: "Sponsored Display", description: "Retargeting and audience placements." },
    ],
  },
];
