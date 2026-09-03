/**
 * Config layer. Every value carries `confirmed`. An unconfirmed value is still shown,
 * but always with the line "Threshold set by your team, not a platform rule."
 * A value with no basis at all is `null` and renders as no number.
 */

export interface ThresholdDef {
  key: string;
  label: string;
  value: number | null;
  unit: string;
  set_by: string;
  set_at: string;
  confirmed: boolean;
  note?: string;
}

export const UNCONFIRMED_LINE = "Threshold set by your team, not a platform rule.";

export const READINESS_THRESHOLDS: Record<string, ThresholdDef> = {
  availability_floor: {
    key: "availability_floor",
    label: "Availability floor",
    value: 80,
    unit: "%",
    set_by: "Media ops",
    set_at: "2026-07-14",
    confirmed: false,
  },
  availability_target: {
    key: "availability_target",
    label: "Availability target",
    value: 90,
    unit: "%",
    set_by: "Media ops",
    set_at: "2026-07-14",
    confirmed: false,
  },
  rating_min: {
    key: "rating_min",
    label: "Minimum rating",
    value: 3.5,
    unit: "stars",
    set_by: "Borrowed from Amazon published guidance",
    set_at: "2026-05-02",
    confirmed: true,
  },
  reviews_min: {
    key: "reviews_min",
    label: "Minimum reviews",
    value: 15,
    unit: "reviews",
    set_by: "Borrowed from Amazon published guidance",
    set_at: "2026-05-02",
    confirmed: true,
  },
  price_gap_max: {
    key: "price_gap_max",
    label: "Price above cheapest competing offer",
    value: 10,
    unit: "%",
    set_by: "Media ops",
    set_at: "2026-07-14",
    confirmed: false,
  },
  wallet_runway_min: {
    key: "wallet_runway_min",
    label: "Wallet runway",
    value: 3,
    unit: "days",
    set_by: "Media ops",
    set_at: "2026-07-14",
    confirmed: false,
  },
};

export function threshold(key: string): ThresholdDef | undefined {
  return READINESS_THRESHOLDS[key];
}

export function thresholdText(key: string): string {
  const t = threshold(key);
  if (!t || t.value === null) return "No figure is set for this check.";
  return `${t.value}${t.unit === "%" ? "%" : ` ${t.unit}`}`;
}

export type BidUnit = "per_click" | "per_1000_impressions";
export type BudgetType = "daily" | "total";

export interface PlatformCapability {
  platform: string;
  /** Only one platform in this set has a public campaign-creation API. */
  can_push_api: boolean;
  city_targeting: boolean;
  /** Amazon AE targets a marketplace instead of cities. */
  marketplace_targeting: boolean;
  store_code_targeting: boolean;
  match_types_used: boolean;
  bid_unit: BidUnit;
  /** True where the winner pays their full bid rather than one increment above the runner-up. */
  pays_full_bid: boolean;
  budget_types: BudgetType[];
  /** null = the platform publishes no limit and we have not confirmed one. */
  max_products: number | null;
  max_products_confirmed: boolean;
  /** Days a new campaign settles before recommendations resume. A working figure. */
  settling_days: number;
  /** Hours after which catalogue and availability data is treated as stale. */
  freshness_limit_hours: number;
  /** Fields that cannot be changed downward once set on this platform. */
  irreversible_fields: string[];
}

const base = (platform: string, over: Partial<PlatformCapability> = {}): PlatformCapability => ({
  platform,
  can_push_api: false,
  city_targeting: true,
  marketplace_targeting: false,
  store_code_targeting: false,
  match_types_used: true,
  bid_unit: "per_click",
  pays_full_bid: false,
  budget_types: ["daily", "total"],
  max_products: null,
  max_products_confirmed: false,
  settling_days: 10,
  freshness_limit_hours: 24,
  irreversible_fields: [],
  ...over,
});

export const PLATFORM_CAPABILITIES: Record<string, PlatformCapability> = {
  Blinkit: base("Blinkit", {
    match_types_used: false,
    bid_unit: "per_1000_impressions",
    pays_full_bid: true,
    max_products: 200,
    max_products_confirmed: false,
    irreversible_fields: ["budget_value"],
  }),
  Zepto_app: base("Zepto_app", { budget_types: ["daily"], max_products: 150, max_products_confirmed: false }),
  Instamart_app: base("Instamart_app", { bid_unit: "per_1000_impressions" }),
  BigBasket: base("BigBasket"),
  noon_minutes_uae_app: base("noon_minutes_uae_app"),
  talabat_mart_uae: base("talabat_mart_uae", { irreversible_fields: ["budget_value"] }),
  carrefour_now_uae: base("carrefour_now_uae", { store_code_targeting: true }),
  amazonae: base("amazonae", {
    can_push_api: true,
    city_targeting: false,
    marketplace_targeting: true,
    settling_days: 14,
  }),
};

export function capabilityFor(platform: string): PlatformCapability {
  return PLATFORM_CAPABILITIES[platform] ?? base(platform);
}

export function bidUnitLabel(platform: string, symbol: string): string {
  return capabilityFor(platform).bid_unit === "per_1000_impressions"
    ? `Bid, ${symbol} per 1,000 impressions`
    : `Bid, ${symbol} per click`;
}

/** Catalogue freshness stamp. Mocked feed timestamp, shared by every screen. */
export const CATALOGUE_AS_OF = new Date(Date.now() - 5 * 60 * 60 * 1000);

export function isStale(platform: string, asOf: Date = CATALOGUE_AS_OF): boolean {
  const hours = (Date.now() - asOf.getTime()) / 36e5;
  return hours > capabilityFor(platform).freshness_limit_hours;
}

export function asOfLabel(asOf: Date = CATALOGUE_AS_OF): string {
  return asOf.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export const OVERRIDE_REASONS = [
  "Stock is arriving",
  "Brand defence",
  "Client asked for it",
  "Testing",
  "Data looks wrong",
] as const;
export type OverrideReason = (typeof OVERRIDE_REASONS)[number];

export const OBJECTIVES = ["Awareness", "Consideration", "Conversion", "Defence"] as const;
export const KPIS = ["ROAS", "ACoS", "Impressions", "Clicks", "Units sold", "Share of shelf"] as const;
