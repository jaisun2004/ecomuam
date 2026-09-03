import { capabilityFor, isStale, CATALOGUE_AS_OF, threshold, UNCONFIRMED_LINE } from "@/lib/ecom-reference/config";
import { citiesFor, isInStock, productsFor, walletBalance } from "@/lib/ecom-reference/platforms";
import type { RefProduct } from "@/lib/ecom-reference/workbook-data";

export type Readiness = "ready" | "warning" | "not_ready" | "unknown";

export interface ReadinessFinding {
  signal_key: string;
  severity: "block" | "warn" | "unknown";
  message: string;
  observed_value: string;
  threshold: string | null;
  threshold_confirmed: boolean;
}

export interface ReadinessCheck {
  product_id: string;
  platform: string;
  city: string | null;
  state: Readiness;
  findings: ReadinessFinding[];
  data_as_of: string;
  is_stale: boolean;
  override?: { reason: string; user_id: string; at: string };
}

/* ── deterministic mocked signals, standing in for the live feeds ── */

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 33 + s.charCodeAt(i)) >>> 0;
  return h;
}

export interface ProductSignals {
  listed: boolean;
  missing_twice: boolean;
  has_image_and_title: boolean;
  availability_pct: number;
  stores_total: number;
  stores_oos: number;
  rating: number | null;
  reviews: number | null;
  price_gap_pct: number | null;
  ranks_first: boolean;
  already_advertised: boolean;
}

export function signalsFor(code: string, platform: string, city: string | null): ProductSignals {
  const h = hash(`${code}|${platform}|${city ?? "-"}`);
  const storesTotal = 6 + (h % 12);
  const inStock = city ? isInStock(code, city) : true;
  const oos = inStock ? (h >> 3) % Math.max(1, Math.floor(storesTotal / 3)) : storesTotal;
  return {
    listed: h % 37 !== 0,
    missing_twice: h % 101 === 0,
    has_image_and_title: h % 53 !== 0,
    availability_pct: Math.round(((storesTotal - oos) / storesTotal) * 100),
    stores_total: storesTotal,
    stores_oos: oos,
    rating: h % 43 === 0 ? null : Math.round((28 + ((h >> 5) % 22)) / 10 * 10) / 10,
    reviews: h % 47 === 0 ? null : (h >> 7) % 240,
    price_gap_pct: h % 41 === 0 ? null : ((h >> 9) % 34) - 12,
    ranks_first: h % 17 === 0,
    already_advertised: h % 23 === 0,
  };
}

function thr(key: string): { text: string | null; confirmed: boolean; value: number | null } {
  const t = threshold(key);
  if (!t) return { text: null, confirmed: false, value: null };
  return {
    text: t.value === null ? null : `${t.value}${t.unit === "%" ? "%" : ` ${t.unit}`}`,
    confirmed: t.confirmed,
    value: t.value,
  };
}

export function hasAdAccount(brand: string, platform: string): boolean {
  return hash(`${brand}|${platform}|acct`) % 29 !== 0;
}

/** One product, one city (city is null where the platform has no city targeting). */
export function checkReadiness(opts: {
  code: string;
  platform: string;
  city: string | null;
  brand?: string;
}): ReadinessCheck {
  const { code, platform, city, brand = "Britannia" } = opts;
  const findings: ReadinessFinding[] = [];
  const stale = isStale(platform);
  const cap = capabilityFor(platform);
  const s = signalsFor(code, platform, city);

  const known = productsFor(platform).some((p) => p.code === code);
  const cityServed = !city || !cap.city_targeting || citiesFor(platform).some((c) => c.platformCity === city);

  const block = (signal_key: string, message: string, observed_value: string) =>
    findings.push({ signal_key, severity: "block", message, observed_value, threshold: null, threshold_confirmed: true });

  const warn = (signal_key: string, message: string, observed_value: string, key?: string) => {
    const t = key ? thr(key) : { text: null, confirmed: true };
    findings.push({
      signal_key,
      severity: "warn",
      message,
      observed_value,
      threshold: t.text,
      threshold_confirmed: t.confirmed,
    });
  };

  if (!known || !s.listed) block("not_listed", "This product is not listed on this platform.", code);
  if (s.missing_twice) block("missing_twice", "Missing from the catalogue on two runs in a row.", code);
  if (!cityServed) block("city_not_served", `${platform} does not serve this city.`, city ?? "-");
  if (!s.has_image_and_title) block("missing_content", "The listing has no image or no title.", code);
  if (!hasAdAccount(brand, platform)) block("no_ad_account", `No linked ad account for ${brand} on this platform.`, brand);
  if (city && cap.city_targeting && s.availability_pct === 0)
    block("out_of_stock", `Out of stock across every store in ${city}.`, "0% available");

  if (stale) {
    findings.push({
      signal_key: "stale_data",
      severity: "unknown",
      message: "Availability data is past its freshness limit, so this check could not run.",
      observed_value: CATALOGUE_AS_OF.toISOString(),
      threshold: `${cap.freshness_limit_hours}h`,
      threshold_confirmed: false,
    });
  } else if (s.availability_pct > 0) {
    const floor = thr("availability_floor");
    const target = thr("availability_target");
    if (floor.value !== null && s.availability_pct < floor.value)
      warn("availability_below_floor", "Availability is below the floor your team set.", `${s.availability_pct}%`, "availability_floor");
    else if (target.value !== null && s.availability_pct < target.value)
      warn("availability_below_target", "Availability is below target.", `${s.availability_pct}%`, "availability_target");
  }

  const rMin = thr("rating_min");
  if (s.rating === null)
    findings.push({
      signal_key: "rating_unknown",
      severity: "unknown",
      message: "No rating could be read for this product.",
      observed_value: "unknown",
      threshold: rMin.text,
      threshold_confirmed: rMin.confirmed,
    });
  else if (rMin.value !== null && s.rating < rMin.value)
    warn("rating_low", "Rating is below the figure in config.", `${s.rating} stars`, "rating_min");

  const revMin = thr("reviews_min");
  if (s.reviews !== null && revMin.value !== null && s.reviews < revMin.value)
    warn("reviews_low", "Fewer reviews than the figure in config.", `${s.reviews} reviews`, "reviews_min");

  const gapMax = thr("price_gap_max");
  if (s.price_gap_pct !== null && gapMax.value !== null && s.price_gap_pct > gapMax.value)
    warn("price_above_market", "Priced above the cheapest competing offer.", `+${s.price_gap_pct}%`, "price_gap_max");

  if (s.ranks_first)
    warn("ranks_first", "You already rank first organically on a term in this set. Defending it is still a valid reason to advertise.", "rank 1");

  if (s.already_advertised)
    warn("already_advertised", "This product is already live in another campaign on this platform.", "1 live campaign");

  const runway = thr("wallet_runway_min");
  const wallet = walletBalance(brand, platform);
  const burn = 1200 + (hash(`${brand}|${platform}|burn`) % 9000);
  const days = wallet / burn;
  if (runway.value !== null && days < runway.value)
    warn("wallet_runway", "The wallet runs out sooner than the runway your team set.", `${days.toFixed(1)} days`, "wallet_runway_min");

  if (city && cap.city_targeting && s.stores_oos > 0 && s.availability_pct > 0)
    warn(
      "partial_store_stock",
      `Out of stock in ${s.stores_oos} of ${s.stores_total} stores in ${city}. Targeting here is city-wide, so these cannot be excluded. Accept the reduced reach, or drop ${city}.`,
      `${s.stores_oos}/${s.stores_total} stores`,
    );

  const hasBlock = findings.some((f) => f.severity === "block");
  const hasUnknown = findings.some((f) => f.severity === "unknown");
  const hasWarn = findings.some((f) => f.severity === "warn");
  const state: Readiness = hasBlock ? "not_ready" : hasUnknown ? "unknown" : hasWarn ? "warning" : "ready";

  return {
    product_id: code,
    platform,
    city,
    state,
    findings,
    data_as_of: CATALOGUE_AS_OF.toISOString(),
    is_stale: stale,
  };
}

export interface ProductReadinessSummary {
  product: RefProduct;
  checks: ReadinessCheck[];
  readyCities: string[];
  warningCities: string[];
  blockedCities: string[];
  unknownCities: string[];
  totalCities: number;
  state: Readiness;
  is_stale: boolean;
  pill: string;
}

/** Rolls the per-city checks into the pill shown in the product picker, before selection. */
export function summariseReadiness(product: RefProduct, cities: string[], brand?: string): ProductReadinessSummary {
  const cap = capabilityFor(product.platform);
  const list = cap.city_targeting ? cities : [null];
  const checks = list.map((c) => checkReadiness({ code: product.code, platform: product.platform, city: c, brand }));

  const bucket = (st: Readiness) =>
    checks.filter((c) => c.state === st).map((c) => c.city ?? "Marketplace");

  const readyCities = bucket("ready");
  const warningCities = bucket("warning");
  const blockedCities = bucket("not_ready");
  const unknownCities = bucket("unknown");
  const total = checks.length;
  const workable = readyCities.length + warningCities.length;
  const stale = checks.some((c) => c.is_stale);

  const state: Readiness = stale
    ? "unknown"
    : workable === 0
      ? "not_ready"
      : warningCities.length || blockedCities.length
        ? "warning"
        : "ready";

  const pill = stale
    ? "Data is stale"
    : total === 0
      ? "Not checked on this platform"
      : workable === 0
        ? "Not ready anywhere"
        : !cap.city_targeting
          ? workable > 0
            ? "Ready on this marketplace"
            : "Not ready"
          : `Ready in ${workable} of ${total} cities`;

  return {
    product,
    checks,
    readyCities,
    warningCities,
    blockedCities,
    unknownCities,
    totalCities: total,
    state,
    is_stale: stale,
    pill,
  };
}

export const READINESS_TONE: Record<Readiness, string> = {
  ready: "bg-sw-green-dim text-sw-green border-sw-green/30",
  warning: "bg-sw-amber-dim text-sw-amber border-sw-amber/30",
  not_ready: "bg-sw-red-dim text-sw-red border-sw-red/30",
  unknown: "bg-surface-3 text-muted-foreground border-subtle",
};

export const UNCONFIRMED_NOTE = UNCONFIRMED_LINE;
