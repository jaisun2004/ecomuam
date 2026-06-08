import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sparkles, AlertTriangle, Package, DollarSign, BarChart3,
  CheckCircle2, X, Search, ChevronLeft, ChevronRight, ChevronDown,
  Wallet, MapPin, KeyRound, Gauge, Info, Target as TargetIcon,
  RefreshCw, History, ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";

type Platform = "Blinkit" | "Zepto" | "Instamart";
type RecoCategory = "Budget" | "City" | "Remove Keywords" | "Bid Changes";

const PLATFORMS: Platform[] = ["Blinkit", "Zepto", "Instamart"];
const CATEGORIES: RecoCategory[] = ["Budget", "City", "Remove Keywords", "Bid Changes"];

const CITIES = ["Mumbai", "Delhi NCR", "Bangalore", "Pune", "Hyderabad", "Chennai", "Kolkata"];

const PLATFORM_TINT: Record<Platform, string> = {
  Blinkit: "bg-sw-amber-dim text-sw-amber",
  Zepto: "bg-sw-purple-dim text-sw-purple",
  Instamart: "bg-sw-cyan-dim text-sw-cyan",
};

const CATEGORY_META: Record<RecoCategory, { icon: React.ElementType; tint: string; accent: string; desc: string }> = {
  "Budget":          { icon: Wallet,   tint: "bg-sw-green-dim text-sw-green",   accent: "border-sw-green/30",   desc: "Reallocate or scale daily spend on under/over-pacing campaigns" },
  "City":            { icon: MapPin,   tint: "bg-sw-cyan-dim text-sw-cyan",     accent: "border-sw-cyan/30",    desc: "Pause or expand existing campaigns to new pincodes / cities" },
  "Remove Keywords": { icon: KeyRound, tint: "bg-sw-amber-dim text-sw-amber",   accent: "border-sw-amber/30",   desc: "Prune wasted-spend, low-relevance or negative-intent keywords" },
  "Bid Changes":     { icon: Gauge,    tint: "bg-sw-purple-dim text-sw-purple", accent: "border-sw-purple/30",  desc: "Tune keyword / SKU bids based on rank, ROAS and conversion velocity" },
};

interface Warning { kind: "availability" | "pricing" | "sos"; label: string; detail: string; }
interface ChangeRow { field: string; current: string; recommended: string; }
interface Signal { label: string; value: string; }

interface Reco {
  id: string;
  category: RecoCategory;
  campaign: string;
  platform: Platform;
  sku: string;
  city?: string;
  confidence: number;
  headline: string;
  rationale: string;
  signals: Signal[];          // glass-box: the inputs driving this reco
  estImpact: string;
  changes: ChangeRow[];
  warnings: Warning[];
  isNew?: boolean;
}

const SKUS = [
  "Parle-G Gold 200g", "Parle-G Original 250g", "Hide & Seek Chocolate 200g",
  "Bourbon Cream 150g", "Good Day Cashew 200g", "Good Day Butter 150g",
  "Marie Gold 250g", "NutriChoice Digestive 250g", "Milk Bikis 150g",
  "Dark Fantasy Choco Fills 75g", "50-50 Maska Chaska 150g", "Krackjack 200g",
  "Monaco Classic 150g", "Oreo Vanilla 120g", "Treat Jim Jam 150g",
];

const KEYWORDS = ["glucose biscuits", "cream biscuits", "digestive biscuits", "marie biscuits", "chocolate biscuits 200g", "cookies pack", "tea time biscuits", "kids snack biscuits"];

function makeReco(i: number): Reco {
  const sku = SKUS[i % SKUS.length];
  const platform = PLATFORMS[i % PLATFORMS.length];
  const category = CATEGORIES[i % CATEGORIES.length];
  const city = (category === "City") ? CITIES[i % CITIES.length] : undefined;
  const conf = 3 + ((i * 7) % 3);
  const hasWarn = i % 4 === 0;
  const warn: Warning | null = !hasWarn ? null
    : i % 12 === 0 ? { kind: "availability", label: `${1 + (i % 4)} stores OOS`, detail: `${sku} OOS at ${1 + (i % 4)} dark stores on ${platform}.` }
    : i % 8 === 0 ? { kind: "pricing", label: `+${5 + (i % 5)}% vs comp`, detail: `${sku} priced ${5 + (i % 5)}% above nearest competitor on ${platform}.` }
    : { kind: "sos", label: `SoS ${10 + (i % 12)}%`, detail: `Share of Shelf ${10 + (i % 12)}% on ${platform} — below 20% threshold.` };

  let headline = "";
  let rationale = "";
  let signals: Signal[] = [];
  let changes: ChangeRow[] = [];
  let estImpact = "";

  switch (category) {
    case "Budget": {
      const cur = 400 + (i % 8) * 75;
      const pct = 15 + (i % 25);
      const isUp = i % 3 !== 0;
      headline = isUp
        ? `Increase daily budget by +${pct}% — campaign is capped before peak hours`
        : `Trim daily budget by -${pct}% — diminishing returns past 16:00`;
      rationale = isUp
        ? "Spend exhausts hours before the evening conversion peak. ROAS headroom suggests scaling is safe."
        : "Last 14 days show ROAS dropping below target after budget pacing reaches 80%. Trim to protect efficiency.";
      signals = [
        { label: "Pacing today",     value: isUp ? "100% by 13:42" : "92% by 16:10" },
        { label: "ROAS (14d)",       value: isUp ? "5.1x · target 3.5x" : "2.6x · target 3.5x" },
      ];
      changes = [
        { field: "Daily Budget (₹)", current: `${cur}`, recommended: `${Math.round(cur * (1 + (isUp ? 1 : -1) * pct / 100))}` },
        { field: "Pacing", current: isUp ? "Capped 13:42" : "Even", recommended: isUp ? "Even — full day" : "Even — protected" },
      ];
      estImpact = isUp
        ? `+${8 + (i % 14)}% incremental orders at current ROAS`
        : `Recover ₹ ${(2 + (i % 4)) * 800}/wk of inefficient spend`;
      break;
    }
    case "City": {
      const isSwitchOff = i % 2 === 0;
      headline = isSwitchOff
        ? `Switch off ${city} — sustained underperformance`
        : `Expand existing campaign into ${city} — strong unmet demand`;
      rationale = isSwitchOff
        ? `ROAS in ${city} stayed below 1.8x for 21 days with no SoS recovery. Spend is better deployed elsewhere.`
        : `${city} shows 34% MoM organic demand growth for this SKU on ${platform} with no active geo coverage.`;
      signals = [
        { label: `${city} ROAS (21d)`,  value: isSwitchOff ? "1.6x · target 3.5x" : "—" },
        { label: `${city} SoS`,         value: isSwitchOff ? "8% · benchmark 20%" : "Demand +34% MoM" },
        { label: "Spend last 21d",      value: isSwitchOff ? `₹ ${(3 + (i % 4)) * 1200}` : "₹ 0" },
      ];
      changes = isSwitchOff
        ? [
            { field: `Geo: ${city}`, current: "Active", recommended: "Disabled" },
            { field: "Reallocated to", current: "—", recommended: "Top 3 cities (pro-rata)" },
          ]
        : [
            { field: "Geo Targeting", current: city ? `Excludes ${city}` : "—", recommended: `${city} added (5 km radius)` },
            { field: "Daily Budget (₹)", current: `${300 + (i % 6) * 50}`, recommended: `${400 + (i % 6) * 50}` },
          ];
      estImpact = isSwitchOff
        ? `Reclaim ₹ ${(3 + (i % 6)) * 1000}/wk for higher-ROAS cities`
        : `Capture est. ${600 + (i % 5) * 200} new orders/mo`;
      break;
    }
    case "Remove Keywords": {
      const k1 = KEYWORDS[i % KEYWORDS.length];
      const k2 = KEYWORDS[(i + 3) % KEYWORDS.length];
      headline = `Remove ${1 + (i % 3) + 1} low-intent keywords draining spend`;
      rationale = "These keywords consume budget without converting. Search-term analysis confirms intent mismatch vs the SKU.";
      signals = [
        { label: `"${k1}"`,    value: `₹ ${120 + (i % 5) * 30} spend · 0 orders 30d` },
        { label: `"${k2}"`,    value: `CTR 0.4% · ROAS 0.3x` },
        { label: "Combined drag", value: `~₹ ${(2 + (i % 5)) * 600}/mo` },
      ];
      changes = [
        { field: "Keywords removed", current: "Active", recommended: `${k1}, ${k2}` },
        { field: "Negative list", current: `${10 + (i % 8)}`, recommended: `${12 + (i % 8)}` },
      ];
      estImpact = `Save ₹ ${(2 + (i % 5)) * 600}/mo · ROAS +${3 + (i % 4)}%`;
      break;
    }
    case "Bid Changes": {
      const cur = 1.2 + (i % 7) * 0.15;
      const isUp = i % 3 !== 0;
      const rec = isUp ? cur * (1 + (8 + (i % 12)) / 100) : cur * (1 - (8 + (i % 12)) / 100);
      headline = isUp
        ? `Raise bid on top SKU keywords — rank slipping outside top 3`
        : `Lower bid on saturated keywords — ROAS healthy but CPC inflated`;
      rationale = isUp
        ? "Lost auction share is correlated with rank drop from 2 → 5. A modest bid lift restores prime real estate."
        : "Win rate is high but CPC has crept above the efficient zone. A small bid trim preserves volume at better ROAS.";
      signals = [
        { label: "Avg rank (14d)",  value: isUp ? "2.1 → 4.6" : "1.3 (stable)" },
        { label: "Auction win %",   value: isUp ? "38% (was 71%)" : "84%" },
        { label: "CPC vs target",   value: isUp ? "₹ 0.9 / target 1.2" : `₹ ${cur.toFixed(2)} / target 1.0` },
      ];
      changes = [
        { field: "Keyword bid (₹)", current: cur.toFixed(2), recommended: rec.toFixed(2) },
        { field: "Bid strategy", current: "Manual CPC", recommended: isUp ? "Manual CPC (+lift)" : "Target ROAS 3.5x" },
      ];
      estImpact = isUp
        ? `Recover rank 2 · +${10 + (i % 8)}% impressions`
        : `Hold volume · ROAS +${4 + (i % 6)}%`;
      break;
    }
  }

  return {
    id: `r${i + 1}`,
    category,
    campaign: city
      ? `${sku.split(" ")[0]} — ${category} ${city} #${100 + i}`
      : `${sku.split(" ")[0]} — ${category} ${platform.split(" ")[0]} #${100 + i}`,
    platform, sku, city,
    confidence: conf,
    headline, rationale, signals, estImpact, changes,
    warnings: warn ? [warn] : [],
    isNew: i < 17,
  };
}

const MOCK: Reco[] = Array.from({ length: 240 }, (_, i) => makeReco(i));

const WARN_META: Record<Warning["kind"], { icon: React.ElementType; cls: string; label: string }> = {
  availability: { icon: Package, cls: "text-sw-red bg-sw-red-dim", label: "Availability" },
  pricing: { icon: DollarSign, cls: "text-sw-amber bg-sw-amber-dim", label: "Pricing Gap" },
  sos: { icon: BarChart3, cls: "text-sw-purple bg-sw-purple-dim", label: "Share of Shelf" },
};

const ConfidenceDots: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex items-center gap-[3px]" title={`Confidence ${n}/5`}>
    {[0, 1, 2, 3, 4].map(i => (
      <span key={i} className={`w-1 h-1 rounded-full ${i < n ? "bg-primary" : "bg-surface-3"}`} />
    ))}
  </span>
);

/* ===== Monthly target pacing ===== */
interface MonthTarget {
  key: string; label: string;
  current: number; target: number;
  unit: string; format: (n: number) => string;
  direction: "up" | "down"; // up = higher is better
}
const MONTH_TARGETS: MonthTarget[] = [
  { key: "spend",  label: "Spend (MTD)", current: 182_400, target: 900_000, unit: "₹", format: n => `₹ ${(n/1000).toFixed(0)}K`, direction: "up" },
  { key: "roas",   label: "ROAS",        current: 4.2,     target: 3.5,     unit: "x",   format: n => `${n.toFixed(1)}x`,            direction: "up" },
  { key: "acos",   label: "ACoS",        current: 22,      target: 18,      unit: "%",   format: n => `${n.toFixed(0)}%`,            direction: "down" },
  { key: "orders", label: "Orders (MTD)",current: 38_100,  target: 180_000, unit: "",    format: n => `${(n/1000).toFixed(1)}K`,     direction: "up" },
];

// June 8 → day 8 of 30
const MONTH_ELAPSED_PCT = 27;
const MONTH_DAY = 8;
const MONTH_DAYS_TOTAL = 30;
const MONTH_LABEL = "June";

const TargetCard: React.FC<{ t: MonthTarget }> = ({ t }) => {
  const pct = t.direction === "up"
    ? Math.min(100, (t.current / t.target) * 100)
    : Math.min(100, (t.target / t.current) * 100);
  const onPace = t.direction === "up" ? pct >= MONTH_ELAPSED_PCT : t.current <= t.target * 1.05;
  const met = t.direction === "up" ? t.current >= t.target : t.current <= t.target;
  const status = met ? "Met" : onPace ? "On Pace" : "Behind";
  const statusCls = met ? "text-sw-green bg-sw-green-dim"
                  : onPace ? "text-primary bg-primary/10"
                  : "text-sw-amber bg-sw-amber-dim";
  const barCls = met ? "[&>div]:bg-sw-green"
               : onPace ? "[&>div]:bg-primary"
               : "[&>div]:bg-sw-amber";
  return (
    <div className="p-4 rounded-xl border border-subtle bg-surface-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-mono">{t.label}</span>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${statusCls}`}>{status}</span>
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-xl font-display font-bold text-foreground tabular-nums">{t.format(t.current)}</span>
        <span className="text-[11px] text-muted-foreground">/ {t.format(t.target)}</span>
      </div>
      <Progress value={pct} className={`h-1.5 ${barCls}`} />
      <div className="flex items-center justify-between mt-1.5 text-[10.5px] text-muted-foreground">
        <span>{pct.toFixed(0)}% of target</span>
        <span>{MONTH_ELAPSED_PCT}% of month elapsed</span>
      </div>
    </div>
  );
};

/* ===== Approved Recommendations Log (Campaign → Keyword → City) ===== */
interface LogEntry {
  id: string;
  ts: number;          // applied time
  campaign: string;
  platform: Platform;
  keyword: string;
  city: string;
  category: RecoCategory;
  summary: string;     // short description of what was changed
  user: string;
}

const NOW = Date.now();
const m = (n: number) => NOW - n * 60_000;
const h = (n: number) => NOW - n * 3_600_000;
const d = (n: number) => NOW - n * 86_400_000;

const SEED_LOG: LogEntry[] = [
  // Pepsi 1L — Blinkit
  { id: "l1", ts: m(12),  campaign: "Pepsi — Brand Search Blinkit #102", platform: "Blinkit",  keyword: "cola drink",          city: "Mumbai",     category: "Bid Changes",     summary: "Raised bid ₹1.20 → ₹1.42 (+18%)", user: "AI Auto" },
  { id: "l2", ts: m(38),  campaign: "Pepsi — Brand Search Blinkit #102", platform: "Blinkit",  keyword: "cola drink",          city: "Delhi NCR",  category: "Budget",          summary: "Daily budget ₹400 → ₹520 (+30%)", user: "priya.s" },
  { id: "l3", ts: h(2),   campaign: "Pepsi — Brand Search Blinkit #102", platform: "Blinkit",  keyword: "diet pepsi",          city: "Mumbai",     category: "Remove Keywords", summary: "Removed 2 low-intent keywords", user: "AI Auto" },
  // Lay's — Zepto
  { id: "l4", ts: h(4),   campaign: "Lay's — Performance Zepto #117",    platform: "Zepto",    keyword: "midnight snack chips",city: "Bangalore",  category: "City",            summary: "Expanded geo into Bangalore (5 km)", user: "rohit.k" },
  { id: "l5", ts: h(6),   campaign: "Lay's — Performance Zepto #117",    platform: "Zepto",    keyword: "midnight snack chips",city: "Pune",       category: "Bid Changes",     summary: "Trimmed bid ₹2.10 → ₹1.85 (−12%)", user: "AI Auto" },
  // 7UP — Instamart
  { id: "l6", ts: h(20),  campaign: "7UP — Non-Brand Instamart #134",    platform: "Instamart",keyword: "lemon soda 500ml",    city: "Hyderabad",  category: "Budget",          summary: "Trimmed daily budget −15%", user: "priya.s" },
  { id: "l7", ts: d(1),   campaign: "7UP — Non-Brand Instamart #134",    platform: "Instamart",keyword: "fizzy juice",         city: "Hyderabad",  category: "Remove Keywords", summary: "Negative-keyworded 3 wasted terms", user: "AI Auto" },
  { id: "l8", ts: d(2),   campaign: "7UP — Non-Brand Instamart #134",    platform: "Instamart",keyword: "fizzy juice",         city: "Chennai",    category: "City",            summary: "Disabled Chennai geo (ROAS 1.6x)", user: "rohit.k" },
];

const formatRelative = (ts: number) => {
  const diff = Math.max(0, Date.now() - ts);
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hr ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
};

const CATEGORY_DOT: Record<RecoCategory, string> = {
  "Budget": "bg-sw-green",
  "City": "bg-sw-cyan",
  "Remove Keywords": "bg-sw-amber",
  "Bid Changes": "bg-sw-purple",
};

const PAGE_SIZE = 30;

// last refresh timestamp — used in header chip
const LAST_UPDATED_TS = m(4);

const RecommendationsView: React.FC = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openApply, setOpenApply] = useState<string[] | null>(null);
  const [openWarn, setOpenWarn] = useState<{ recoId: string; warnIdx: number } | null>(null);
  const [openGlass, setOpenGlass] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<RecoCategory>>(new Set(CATEGORIES));
  const [approvedLog, setApprovedLog] = useState<LogEntry[]>(SEED_LOG);
  const [logExpandedCampaigns, setLogExpandedCampaigns] = useState<Set<string>>(new Set([SEED_LOG[0].campaign]));
  const [logExpandedKeywords, setLogExpandedKeywords] = useState<Set<string>>(new Set());
  const [lastUpdated, setLastUpdated] = useState<number>(LAST_UPDATED_TS);

  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<string>("all");
  const [category, setCategory] = useState<string>("all");
  const [page, setPage] = useState<Record<RecoCategory, number>>({ "Budget": 1, "City": 1, "Remove Keywords": 1, "Bid Changes": 1 });

  const livePool = useMemo(
    () => MOCK.filter(r => !dismissed.has(r.id) && !applied.has(r.id)),
    [dismissed, applied]
  );

  const filtered = useMemo(() => livePool.filter(r => {
    if (platform !== "all" && r.platform !== platform) return false;
    if (category !== "all" && r.category !== category) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!r.campaign.toLowerCase().includes(s) && !r.sku.toLowerCase().includes(s) && !r.headline.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [livePool, platform, category, q]);

  const byCategory = useMemo(() => {
    const m: Record<RecoCategory, Reco[]> = { "Budget": [], "City": [], "Remove Keywords": [], "Bid Changes": [] };
    filtered.forEach(r => m[r.category].push(r));
    return m;
  }, [filtered]);

  const newCount = livePool.filter(r => r.isNew).length;

  const toggleSel = (id: string) => setSelected(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleCat = (c: RecoCategory) => setExpanded(p => {
    const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n;
  });

  const activeWarn = openWarn ? MOCK.find(r => r.id === openWarn.recoId)?.warnings[openWarn.warnIdx] : null;
  const applyTargets = openApply ? MOCK.filter(r => openApply.includes(r.id)) : [];
  const glassReco = openGlass ? MOCK.find(r => r.id === openGlass) : null;

  const confirmApply = () => {
    if (!openApply) return;
    const ids = openApply;
    const newEntries: LogEntry[] = ids.map(id => {
      const r = MOCK.find(x => x.id === id)!;
      const kw = (r.changes.find(c => c.field.toLowerCase().includes("keyword"))?.recommended)
        || r.signals.find(s => s.label.startsWith('"'))?.label.replace(/"/g, "")
        || r.sku;
      return {
        id: `log-${id}-${Date.now()}`,
        ts: Date.now(),
        campaign: r.campaign,
        platform: r.platform,
        keyword: kw,
        city: r.city || CITIES[Math.abs(id.charCodeAt(1)) % CITIES.length],
        category: r.category,
        summary: r.headline,
        user: "you",
      };
    });
    setApprovedLog(prev => [...newEntries, ...prev]);
    setLogExpandedCampaigns(prev => {
      const n = new Set(prev);
      newEntries.forEach(e => n.add(e.campaign));
      return n;
    });
    setApplied(p => { const n = new Set(p); ids.forEach(id => n.add(id)); return n; });
    setSelected(p => { const n = new Set(p); ids.forEach(id => n.delete(id)); return n; });
    toast.success(`${ids.length} recommendation${ids.length > 1 ? "s" : ""} applied · logged below`);
    setOpenApply(null);
  };

  const refreshRecos = () => {
    setLastUpdated(Date.now());
    toast.success("Checked for new recommendations");
  };

  // Group log: Campaign → Keyword → City
  const groupedLog = useMemo(() => {
    const byCampaign = new Map<string, { platform: Platform; keywords: Map<string, LogEntry[]> }>();
    [...approvedLog].sort((a, b) => b.ts - a.ts).forEach(e => {
      if (!byCampaign.has(e.campaign)) byCampaign.set(e.campaign, { platform: e.platform, keywords: new Map() });
      const c = byCampaign.get(e.campaign)!;
      if (!c.keywords.has(e.keyword)) c.keywords.set(e.keyword, []);
      c.keywords.get(e.keyword)!.push(e);
    });
    return byCampaign;
  }, [approvedLog]);

  const toggleLogCampaign = (k: string) => setLogExpandedCampaigns(p => {
    const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n;
  });
  const toggleLogKeyword = (k: string) => setLogExpandedKeywords(p => {
    const n = new Set(p); n.has(k) ? n.delete(k) : n.add(k); return n;
  });

  const RecoRow: React.FC<{ r: Reco }> = ({ r }) => (
    <div className="group grid grid-cols-[20px_1fr_120px_64px_60px_180px] items-center gap-4 px-5 py-2.5 border-t border-subtle hover:bg-surface-2/40 transition-colors">
      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSel(r.id)} aria-label="Select" />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate leading-tight">{r.headline}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          <span className={`inline-block px-1.5 py-0 rounded text-[10px] font-mono mr-1.5 align-middle ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
          {r.sku}{r.city ? ` · ${r.city}` : ""} · {r.campaign}
        </p>
      </div>
      <span className="text-[11px] text-sw-green truncate" title={r.estImpact}>{r.estImpact}</span>
      <ConfidenceDots n={r.confidence} />
      <div className="flex items-center gap-1">
        {r.warnings.map((w, wi) => {
          const WIcon = WARN_META[w.kind].icon;
          return (
            <button key={wi} onClick={() => setOpenWarn({ recoId: r.id, warnIdx: wi })}
              title={`${WARN_META[w.kind].label}: ${w.label}`}
              className={`inline-flex items-center justify-center h-5 w-5 rounded-full ${WARN_META[w.kind].cls} hover:opacity-80`}>
              <WIcon size={10} />
            </button>
          );
        })}
      </div>
      <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px] gap-1 text-muted-foreground"
          onClick={() => setOpenGlass(r.id)} title="Why this recommendation?">
          <Info size={12} /> Why
        </Button>
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"
          onClick={() => { setDismissed(p => new Set(p).add(r.id)); toast("Dismissed"); }}
          title="Dismiss">
          <X size={13} />
        </Button>
        <Button size="sm" className="h-7 px-3 text-[11px]"
          onClick={() => setOpenApply([r.id])}>
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Header */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Recommendations</h1>
          <p className="text-[13px] text-muted-foreground mt-1">
            {livePool.length} AI suggestions for active campaigns
            {newCount > 0 && (
              <span className="inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                </span>
                {newCount} new today
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full border border-subtle bg-surface-1 text-[11px] text-muted-foreground">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-sw-green opacity-60 animate-ping" />
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-sw-green" />
            </span>
            <span>Recommendations updated <span className="text-foreground font-medium">{formatRelative(lastUpdated)}</span></span>
            <button onClick={refreshRecos} className="ml-1 inline-flex items-center justify-center h-5 w-5 rounded hover:bg-surface-2 text-muted-foreground" title="Refresh now">
              <RefreshCw size={11} />
            </button>
          </div>
          {selected.size > 0 && (
            <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => setOpenApply(Array.from(selected))}>
              <CheckCircle2 size={13} /> Apply {selected.size} selected
            </Button>
          )}
        </div>
      </header>

      {/* Section A — Monthly Target Pacing */}
      <section className="rounded-2xl border border-subtle bg-surface-1 p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TargetIcon size={15} className="text-primary" />
            <h2 className="font-display font-semibold text-[14px] text-foreground">Monthly Target Pacing</h2>
            <span className="text-[11px] text-muted-foreground">— {MONTH_LABEL} performance vs end-of-month target</span>
          </div>
          <span className="text-[11px] text-muted-foreground font-mono">{MONTH_LABEL} {MONTH_DAY} · Day {MONTH_DAY} / {MONTH_DAYS_TOTAL} · {MONTH_ELAPSED_PCT}% elapsed</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {MONTH_TARGETS.map(t => <TargetCard key={t.key} t={t} />)}
        </div>
      </section>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search SKU, city, keyword…" className="h-9 pl-9 text-[13px]" />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-9 w-[150px] text-[12px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="h-9 w-[180px] text-[12px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {filtered.length} of {livePool.length}
        </span>
      </div>

      {/* Section B — Grouped by recommendation category (hierarchy) */}
      <div className="space-y-3">
        {CATEGORIES.map(cat => {
          const items = byCategory[cat];
          if (items.length === 0 && category !== "all" && category !== cat) return null;
          const meta = CATEGORY_META[cat];
          const Icon = meta.icon;
          const isOpen = expanded.has(cat);
          const p = page[cat] ?? 1;
          const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
          const pageItems = items.slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
          const allSelected = pageItems.length > 0 && pageItems.every(r => selected.has(r.id));

          return (
            <section key={cat} className={`bg-surface-1 border ${meta.accent} rounded-2xl overflow-hidden`}>
              <button
                onClick={() => toggleCat(cat)}
                className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-2/40 transition-colors text-left"
              >
                <ChevronDown size={15} className={`text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                <span className={`inline-flex items-center justify-center w-7 h-7 rounded-lg ${meta.tint}`}>
                  <Icon size={14} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display font-semibold text-[14px] text-foreground">{cat}</span>
                    <span className="text-[11px] text-muted-foreground">— {meta.desc}</span>
                  </div>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surface-2 text-muted-foreground">
                  {items.length} {items.length === 1 ? "action" : "actions"}
                </span>
                {items.some(r => selected.has(r.id)) && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">
                    {items.filter(r => selected.has(r.id)).length} selected
                  </span>
                )}
              </button>

              {isOpen && (
                items.length === 0 ? (
                  <div className="px-5 py-6 text-center text-[12px] text-muted-foreground border-t border-subtle">
                    <CheckCircle2 size={16} className="mx-auto mb-1.5 text-sw-green" />
                    No {cat.toLowerCase()} recommendations right now.
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-[20px_1fr_120px_64px_60px_180px] items-center gap-4 px-5 py-2 border-t border-subtle bg-surface-2/60 text-[10px] uppercase tracking-wider text-muted-foreground">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={() => setSelected(pp => {
                          const n = new Set(pp);
                          pageItems.forEach(r => allSelected ? n.delete(r.id) : n.add(r.id));
                          return n;
                        })}
                        aria-label="Select page"
                      />
                      <span>Recommendation</span>
                      <span>Est. Impact</span>
                      <span>Conf.</span>
                      <span>Risks</span>
                      <span />
                    </div>
                    {pageItems.map(r => <RecoRow key={r.id} r={r} />)}
                    {items.length > PAGE_SIZE && (
                      <div className="flex items-center justify-between px-5 py-2 border-t border-subtle text-[11px] text-muted-foreground">
                        <span>Page {p} of {totalPages} · showing {pageItems.length} of {items.length}</span>
                        <div className="flex items-center gap-1">
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={p === 1}
                            onClick={() => setPage(pp => ({ ...pp, [cat]: Math.max(1, p - 1) }))}>
                            <ChevronLeft size={13} />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={p >= totalPages}
                            onClick={() => setPage(pp => ({ ...pp, [cat]: Math.min(totalPages, p + 1) }))}>
                            <ChevronRight size={13} />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )
              )}
            </section>
          );
        })}
      </div>

      {/* Section C — Recently Approved Recommendations (Audit log: Campaign → Keyword → City) */}
      <section className="rounded-2xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="px-5 py-4 border-b border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardCheck size={15} className="text-sw-green" />
            <h2 className="font-display font-semibold text-[14px] text-foreground">Recently Approved Recommendations</h2>
            <span className="text-[11px] text-muted-foreground">— audit log of applied changes, grouped Campaign → Keyword → City</span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <History size={11} /> {approvedLog.length} entries
          </span>
        </div>

        {approvedLog.length === 0 ? (
          <div className="px-5 py-8 text-center text-[12px] text-muted-foreground">
            No recommendations applied yet. Apply one above and it will appear here.
          </div>
        ) : (
          <div className="divide-y divide-subtle">
            {Array.from(groupedLog.entries()).map(([campaign, c]) => {
              const isOpen = logExpandedCampaigns.has(campaign);
              const totalChanges = Array.from(c.keywords.values()).reduce((s, arr) => s + arr.length, 0);
              const lastTs = Math.max(...Array.from(c.keywords.values()).flat().map(e => e.ts));
              return (
                <div key={campaign}>
                  <button
                    onClick={() => toggleLogCampaign(campaign)}
                    className="w-full flex items-center gap-3 px-5 py-3 hover:bg-surface-2/40 transition-colors text-left"
                  >
                    <ChevronDown size={14} className={`text-muted-foreground transition-transform ${isOpen ? "" : "-rotate-90"}`} />
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${PLATFORM_TINT[c.platform]}`}>{c.platform}</span>
                    <span className="text-[13px] font-medium text-foreground truncate flex-1">{campaign}</span>
                    <span className="text-[10.5px] font-mono px-2 py-0.5 rounded bg-surface-2 text-muted-foreground">
                      {c.keywords.size} kw · {totalChanges} changes
                    </span>
                    <span className="text-[10.5px] text-muted-foreground w-20 text-right">{formatRelative(lastTs)}</span>
                  </button>

                  {isOpen && (
                    <div className="bg-surface-2/30 border-t border-subtle">
                      {Array.from(c.keywords.entries()).map(([kw, entries]) => {
                        const kwKey = `${campaign}::${kw}`;
                        const kwOpen = logExpandedKeywords.has(kwKey);
                        const byCity = new Map<string, LogEntry[]>();
                        entries.forEach(e => {
                          if (!byCity.has(e.city)) byCity.set(e.city, []);
                          byCity.get(e.city)!.push(e);
                        });
                        return (
                          <div key={kwKey} className="border-t border-subtle/60 first:border-t-0">
                            <button
                              onClick={() => toggleLogKeyword(kwKey)}
                              className="w-full flex items-center gap-3 pl-12 pr-5 py-2 hover:bg-surface-2/60 transition-colors text-left"
                            >
                              <ChevronDown size={12} className={`text-muted-foreground transition-transform ${kwOpen ? "" : "-rotate-90"}`} />
                              <KeyRound size={11} className="text-muted-foreground" />
                              <span className="text-[12px] text-foreground font-mono truncate flex-1">"{kw}"</span>
                              <span className="text-[10.5px] text-muted-foreground">
                                {byCity.size} {byCity.size === 1 ? "city" : "cities"} · {entries.length} action{entries.length > 1 ? "s" : ""}
                              </span>
                            </button>

                            {kwOpen && (
                              <div className="pl-[76px] pr-5 pb-2">
                                {Array.from(byCity.entries()).map(([city, cityEntries]) => (
                                  <div key={city} className="mt-1.5">
                                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1">
                                      <MapPin size={10} />
                                      <span className="font-medium text-foreground">{city}</span>
                                      <span>· {cityEntries.length} change{cityEntries.length > 1 ? "s" : ""}</span>
                                    </div>
                                    <ul className="space-y-1">
                                      {cityEntries.map(e => (
                                        <li key={e.id} className="flex items-start gap-2 text-[11.5px] pl-4 border-l-2 border-subtle py-1">
                                          <span className={`mt-1 inline-block h-1.5 w-1.5 rounded-full shrink-0 ${CATEGORY_DOT[e.category]}`} />
                                          <div className="flex-1 min-w-0">
                                            <p className="text-foreground truncate">{e.summary}</p>
                                            <p className="text-[10.5px] text-muted-foreground mt-0.5">
                                              <span className="font-mono">{e.category}</span> · by <span className="text-foreground">{e.user}</span> · {formatRelative(e.ts)}
                                            </p>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>


      {/* Apply Confirmation */}
      <Dialog open={!!openApply} onOpenChange={(o) => !o && setOpenApply(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Apply {applyTargets.length} recommendation{applyTargets.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              Review the exact changes that will be pushed to your ad accounts. Nothing is sent until you confirm.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            {applyTargets.map(r => (
              <div key={r.id} className="border border-subtle rounded-lg overflow-hidden">
                <div className="px-3 py-2 bg-surface-2 flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${CATEGORY_META[r.category].tint}`}>{r.category}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
                  <span className="text-[12px] font-medium text-foreground">{r.campaign}</span>
                  <span className="ml-auto text-[10.5px] text-muted-foreground">{r.sku}</span>
                </div>
                <div className="px-3 py-2 text-[11.5px] text-muted-foreground border-b border-subtle bg-surface-1">
                  <span className="text-foreground font-medium">Why: </span>{r.rationale}
                </div>
                <table className="w-full text-[12px]">
                  <thead className="text-[10px] uppercase tracking-wider text-muted-foreground bg-surface-2/40">
                    <tr>
                      <th className="text-left px-3 py-1.5 w-1/3">Field</th>
                      <th className="text-left px-3 py-1.5">Current</th>
                      <th className="text-left px-3 py-1.5">After Apply</th>
                    </tr>
                  </thead>
                  <tbody>
                    {r.changes.map((c, ci) => (
                      <tr key={ci} className="border-t border-subtle bg-sw-amber-dim/20">
                        <td className="px-3 py-1.5 text-muted-foreground">{c.field}</td>
                        <td className="px-3 py-1.5 font-mono text-muted-foreground line-through">{c.current}</td>
                        <td className="px-3 py-1.5 font-mono text-foreground font-medium">{c.recommended}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="px-3 py-1.5 bg-surface-1 border-t border-subtle text-[11px] text-sw-green flex items-center gap-1.5">
                  <Sparkles size={11} /> {r.estImpact}
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="mt-2">
            <Button variant="ghost" onClick={() => setOpenApply(null)}>Cancel</Button>
            <Button onClick={confirmApply} className="gap-1.5">
              <CheckCircle2 size={13} /> Confirm & Push to ad accounts
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Glass Box — Why this recommendation */}
      <Dialog open={!!openGlass} onOpenChange={(o) => !o && setOpenGlass(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Info size={16} className="text-primary" />
              Why this recommendation
            </DialogTitle>
            <DialogDescription>
              Transparent view of the signals the model used to generate this action.
            </DialogDescription>
          </DialogHeader>
          {glassReco && (
            <div className="space-y-4 mt-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${CATEGORY_META[glassReco.category].tint}`}>{glassReco.category}</span>
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${PLATFORM_TINT[glassReco.platform]}`}>{glassReco.platform}</span>
                <span className="text-[12px] text-foreground font-medium">{glassReco.sku}</span>
                {glassReco.city && <span className="text-[11px] text-muted-foreground">· {glassReco.city}</span>}
                <span className="ml-auto"><ConfidenceDots n={glassReco.confidence} /></span>
              </div>
              <p className="text-[13px] text-foreground">{glassReco.headline}</p>
              <p className="text-[12px] text-muted-foreground">{glassReco.rationale}</p>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono mb-2">Signals used</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {glassReco.signals.map((s, si) => (
                    <div key={si} className="p-2.5 rounded-lg border border-subtle bg-surface-2/40">
                      <p className="text-[10.5px] text-muted-foreground truncate" title={s.label}>{s.label}</p>
                      <p className="text-[12px] font-mono text-foreground mt-0.5">{s.value}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-[11px] text-sw-green flex items-center gap-1.5 px-3 py-2 rounded-lg bg-sw-green-dim/40">
                <Sparkles size={11} /> Expected outcome: {glassReco.estImpact}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpenGlass(null)}>Close</Button>
            {glassReco && (
              <Button onClick={() => { setOpenGlass(null); setOpenApply([glassReco.id]); }} className="gap-1.5">
                <CheckCircle2 size={13} /> Review & Apply
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!openWarn} onOpenChange={(o) => !o && setOpenWarn(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle size={16} className="text-sw-amber" />
              {activeWarn ? WARN_META[activeWarn.kind].label : ""} Alert
            </AlertDialogTitle>
            <AlertDialogDescription>{activeWarn?.detail}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            <AlertDialogAction onClick={() => toast.success("Alert routed to ops team")}>
              Acknowledge & Route
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default RecommendationsView;
