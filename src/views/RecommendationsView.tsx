import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
  Sparkles, Bell, AlertTriangle, Package, DollarSign, BarChart3,
  CheckCircle2, X, Search, ChevronLeft, ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type Platform = "Talabat" | "Talabat Pro" | "Noon" | "Noon Minutes" | "Carrefour";
type RecoType =
  | "Dayparting" | "Keyword Mix" | "Pause (OOS)" | "Creative"
  | "Pricing Action" | "Targeting"
  | "New City Campaign" | "Switch Off City" | "Budget Increase";

const PLATFORMS: Platform[] = ["Talabat", "Talabat Pro", "Noon", "Noon Minutes", "Carrefour"];
const TYPES: RecoType[] = [
  "New City Campaign", "Switch Off City", "Budget Increase",
  "Dayparting", "Keyword Mix", "Pause (OOS)", "Creative", "Pricing Action", "Targeting",
];

const CITIES = ["Dubai", "Abu Dhabi", "Sharjah", "Ajman", "Al Ain", "Ras Al Khaimah", "Fujairah"];

const PLATFORM_TINT: Record<Platform, string> = {
  Talabat: "bg-sw-amber-dim text-sw-amber",
  "Talabat Pro": "bg-sw-purple-dim text-sw-purple",
  Noon: "bg-sw-cyan-dim text-sw-cyan",
  "Noon Minutes": "bg-primary/15 text-primary",
  Carrefour: "bg-sw-green-dim text-sw-green",
};

interface Warning { kind: "availability" | "pricing" | "sos"; label: string; detail: string; }
interface ChangeRow { field: string; current: string; recommended: string; }

interface Reco {
  id: string;
  campaign: string;
  platform: Platform;
  sku: string;
  city?: string;
  type: RecoType;
  confidence: number;
  headline: string;
  rationale: string;
  estImpact: string;
  changes: ChangeRow[];
  warnings: Warning[];
  isNew?: boolean;
}

const SKUS = [
  "Pepsi 1L PET", "Pepsi 1.5L PET", "Pepsi 330ml Can", "Pepsi Black 1L",
  "7UP 330ml Can", "7UP 1L PET", "Mountain Dew 500ml", "Mirinda Orange 1L",
  "Lay's Classic 150g", "Lay's Salt & Vinegar 150g", "Doritos Nacho 150g",
  "Cheetos Crunchy 130g", "Quaker Oats 1kg", "Tropicana Orange 1L",
];

const HEADLINES: Record<RecoType, (i: number, sku: string, platform: Platform, city?: string) => string> = {
  "Dayparting": () => "Extend dayparting into the 22:00 – 01:00 slot",
  "Keyword Mix": () => "Shift weight from generic to branded long-tail",
  "Pause (OOS)": (_i, sku) => `Pause campaign — ${sku} OOS at dark stores`,
  "Creative": () => "Refresh creative — CTR decayed 28% in 14d",
  "Pricing Action": () => "Reduce listed price 4% to close competitor gap",
  "Targeting": () => "Tighten audience to 'Repeat Buyer 30d'",
  "New City Campaign": (_i, sku, platform, city) => `Launch new campaign in ${city} for ${sku.split(" ")[0]}`,
  "Switch Off City": (_i, _sku, _p, city) => `Switch off ${city} — sustained underperformance`,
  "Budget Increase": (i) => `Increase daily budget by +${15 + (i % 25)}%`,
};

const RATIONALES: Record<RecoType, string> = {
  "Dayparting": "Query volume peaks outside your current schedule. Reallocating slots improves visibility at no extra spend.",
  "Keyword Mix": "Long-tail terms show 2.1x conversion at 38% lower CPC versus generic seed keywords.",
  "Pause (OOS)": "Inventory feed shows out-of-stock at multiple dark stores. Continued spend wastes impressions.",
  "Creative": "Creative fatigue detected — frequency above 6, CTR trending down 4 weeks in a row.",
  "Pricing Action": "Listed price gap vs nearest competitor exceeds 6%. Conversion drop correlates with the widening gap.",
  "Targeting": "Audience overlap analysis shows wasted reach. A tighter high-intent cohort lifts ROAS.",
  "New City Campaign": "Strong organic demand signal in this city with no active campaign coverage. Search volume up 34% MoM.",
  "Switch Off City": "ROAS in this city has stayed below 1.8x for 21 days with no SoS recovery. Spend is better deployed elsewhere.",
  "Budget Increase": "Campaign is budget-capped before 14:00 daily. ROAS at 5.1x leaves clear headroom to scale.",
};

function makeReco(i: number): Reco {
  const sku = SKUS[i % SKUS.length];
  const platform = PLATFORMS[i % PLATFORMS.length];
  const type = TYPES[i % TYPES.length];
  const city = (type === "New City Campaign" || type === "Switch Off City") ? CITIES[i % CITIES.length] : undefined;
  const conf = 3 + ((i * 7) % 3);
  const hasWarn = i % 4 === 0;
  const warn: Warning | null = !hasWarn ? null
    : i % 12 === 0 ? { kind: "availability", label: `${1 + (i % 4)} stores OOS`, detail: `${sku} OOS at ${1 + (i % 4)} dark stores on ${platform}.` }
    : i % 8 === 0 ? { kind: "pricing", label: `+${5 + (i % 5)}% vs comp`, detail: `${sku} priced ${5 + (i % 5)}% above nearest competitor on ${platform}.` }
    : { kind: "sos", label: `SoS ${10 + (i % 12)}%`, detail: `Share of Shelf ${10 + (i % 12)}% on ${platform} — below 20% threshold.` };

  let changes: ChangeRow[];
  switch (type) {
    case "Dayparting":
      changes = [{ field: "Schedule", current: "12:00 – 22:00", recommended: "12:00 – 01:00" }]; break;
    case "Keyword Mix":
      changes = [
        { field: "Keyword Allocation", current: "generic 60% / branded 40%", recommended: "generic 25% / branded 75%" },
        { field: "Negative Keywords", current: "12", recommended: "18" },
      ]; break;
    case "Pause (OOS)":
      changes = [{ field: "Status", current: "Active", recommended: "Paused 48h" }]; break;
    case "Creative":
      changes = [{ field: "Creative Set", current: "v3 (run 47d)", recommended: "v4 (festival cut)" }]; break;
    case "Pricing Action":
      changes = [{ field: "Listed Price (AED)", current: "5.50", recommended: "5.25" }]; break;
    case "Targeting":
      changes = [{ field: "Audience", current: "Broad — Beverage Buyers", recommended: "Repeat Buyer 30d + Cart Abandoners" }]; break;
    case "New City Campaign":
      changes = [
        { field: "Status", current: "No campaign", recommended: `New campaign — ${city}` },
        { field: "Daily Budget (AED)", current: "—", recommended: `${250 + (i % 6) * 50}` },
        { field: "Geo Targeting", current: "—", recommended: `${city} (5 km radius)` },
      ]; break;
    case "Switch Off City":
      changes = [
        { field: "Geo: " + city, current: "Active", recommended: "Disabled" },
        { field: "Reallocated To", current: "—", recommended: "Top 3 cities pro-rata" },
      ]; break;
    case "Budget Increase": {
      const cur = 400 + (i % 8) * 75;
      const pct = 15 + (i % 25);
      changes = [
        { field: "Daily Budget (AED)", current: `${cur}`, recommended: `${Math.round(cur * (1 + pct / 100))}` },
        { field: "Pacing", current: "Capped 14:00", recommended: "Even — full day" },
      ]; break;
    }
  }

  return {
    id: `r${i + 1}`,
    campaign: city
      ? `${sku.split(" ")[0]} — ${type} ${city} #${100 + i}`
      : `${sku.split(" ")[0]} — ${type} ${platform.split(" ")[0]} #${100 + i}`,
    platform, sku, city, type,
    confidence: conf,
    headline: HEADLINES[type](i, sku, platform, city),
    rationale: RATIONALES[type],
    estImpact:
      type === "Pause (OOS)" ? `Save AED ${(2 + (i % 5)) * 1000}/wk wasted spend`
      : type === "Pricing Action" ? `+${4 + (i % 6)}% conversion lift expected`
      : type === "Creative" ? `+${15 + (i % 20)}% CTR projected`
      : type === "New City Campaign" ? `Capture est. ${800 + (i % 5) * 200} new orders/mo`
      : type === "Switch Off City" ? `Reclaim AED ${(3 + (i % 6)) * 1000}/wk for higher-ROAS cities`
      : type === "Budget Increase" ? `+${8 + (i % 14)}% incremental orders at current ROAS`
      : `+${5 + (i % 12)}% ROAS projected, no spend increase`,
    changes,
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

const PAGE_SIZE = 20;

const RecommendationsView: React.FC = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openApply, setOpenApply] = useState<string[] | null>(null);
  const [openWarn, setOpenWarn] = useState<{ recoId: string; warnIdx: number } | null>(null);

  const [tab, setTab] = useState<"cross" | "single">("cross");
  const [q, setQ] = useState("");
  const [platform, setPlatform] = useState<string>("all");
  const [type, setType] = useState<string>("all");
  const [page, setPage] = useState(1);

  const livePool = useMemo(
    () => MOCK.filter(r => !dismissed.has(r.id) && !applied.has(r.id)),
    [dismissed, applied]
  );

  const skuPlatformCount = useMemo(() => {
    const m = new Map<string, Set<Platform>>();
    livePool.forEach(r => {
      if (!m.has(r.sku)) m.set(r.sku, new Set());
      m.get(r.sku)!.add(r.platform);
    });
    return m;
  }, [livePool]);

  const tabFiltered = useMemo(() => livePool.filter(r => {
    const platforms = skuPlatformCount.get(r.sku)?.size ?? 1;
    return tab === "cross" ? platforms >= 2 : platforms < 2;
  }), [livePool, skuPlatformCount, tab]);

  const filtered = useMemo(() => tabFiltered.filter(r => {
    if (platform !== "all" && r.platform !== platform) return false;
    if (type !== "all" && r.type !== type) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!r.campaign.toLowerCase().includes(s) && !r.sku.toLowerCase().includes(s) && !r.headline.toLowerCase().includes(s)) return false;
    }
    return true;
  }), [tabFiltered, platform, type, q]);

  React.useEffect(() => { setPage(1); }, [tab, platform, type, q]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const crossCount = useMemo(() => livePool.filter(r => (skuPlatformCount.get(r.sku)?.size ?? 1) >= 2).length, [livePool, skuPlatformCount]);
  const singleCount = livePool.length - crossCount;
  const newCount = livePool.filter(r => r.isNew).length;

  const groupedBySku = useMemo(() => {
    if (tab !== "cross") return null;
    const groups = new Map<string, Reco[]>();
    pageItems.forEach(r => {
      if (!groups.has(r.sku)) groups.set(r.sku, []);
      groups.get(r.sku)!.push(r);
    });
    return Array.from(groups.entries());
  }, [pageItems, tab]);

  const toggleSel = (id: string) => setSelected(p => {
    const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n;
  });
  const toggleAllPage = () => {
    const allOn = pageItems.every(r => selected.has(r.id));
    setSelected(p => {
      const n = new Set(p);
      pageItems.forEach(r => allOn ? n.delete(r.id) : n.add(r.id));
      return n;
    });
  };

  const activeWarn = openWarn ? MOCK.find(r => r.id === openWarn.recoId)?.warnings[openWarn.warnIdx] : null;
  const applyTargets = openApply ? MOCK.filter(r => openApply.includes(r.id)) : [];

  const confirmApply = () => {
    if (!openApply) return;
    setApplied(p => { const n = new Set(p); openApply.forEach(id => n.add(id)); return n; });
    setSelected(p => { const n = new Set(p); openApply.forEach(id => n.delete(id)); return n; });
    toast.success(`${openApply.length} recommendation${openApply.length > 1 ? "s" : ""} applied`);
    setOpenApply(null);
  };

  const RecoRow: React.FC<{ r: Reco }> = ({ r }) => (
    <div className="group grid grid-cols-[20px_1fr_120px_64px_60px_140px] items-center gap-4 px-5 py-3 border-t border-subtle hover:bg-surface-2/40 transition-colors">
      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSel(r.id)} aria-label="Select" />
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-foreground truncate leading-tight">{r.headline}</p>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">
          <span className={`inline-block px-1.5 py-0 rounded text-[10px] font-mono mr-1.5 align-middle ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
          {r.campaign}
        </p>
      </div>
      <span className="text-[11px] text-muted-foreground truncate">{r.type}</span>
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
      <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
        <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground"
          onClick={() => { setDismissed(p => new Set(p).add(r.id)); toast("Dismissed"); }}
          title="Dismiss">
          <X size={13} />
        </Button>
        <Button size="sm" className="h-7 px-3 text-[11px] gap-1"
          onClick={() => setOpenApply([r.id])}>
          Apply
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Calm header with inline notification */}
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
        {selected.size > 0 && (
          <Button size="sm" className="h-8 text-[12px] gap-1.5" onClick={() => setOpenApply(Array.from(selected))}>
            <CheckCircle2 size={13} /> Apply {selected.size} selected
          </Button>
        )}
      </header>

      {/* Cleaner tabs */}
      <div className="flex items-center gap-6 border-b border-subtle">
        {([
          ["cross", "Cross-Platform SKUs", crossCount],
          ["single", "Single-Platform SKUs", singleCount],
        ] as const).map(([id, label, count]) => (
          <button key={id} onClick={() => setTab(id as any)}
            className={`pb-3 -mb-px border-b-2 transition-colors flex items-center gap-2 text-[13px] ${
              tab === id ? "border-primary text-foreground font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
            }`}>
            {label}
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${tab === id ? "bg-primary/10 text-primary" : "bg-surface-2 text-muted-foreground"}`}>{count}</span>
          </button>
        ))}
      </div>

      {/* Filter bar — single line, minimal */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search SKU, city or action…" className="h-9 pl-9 text-[13px]" />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-9 w-[150px] text-[12px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-9 w-[170px] text-[12px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All action types</SelectItem>
            {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <span className="text-[11px] text-muted-foreground ml-auto">
          {filtered.length} of {tabFiltered.length}
        </span>
      </div>

      {/* List card */}
      <div className="bg-surface-1 border border-subtle rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[20px_1fr_120px_64px_60px_140px] items-center gap-4 px-5 py-2.5 bg-surface-2/60 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Checkbox
            checked={pageItems.length > 0 && pageItems.every(r => selected.has(r.id))}
            onCheckedChange={toggleAllPage} aria-label="Select page"
          />
          <span>Recommendation</span>
          <span>Type</span>
          <span>Conf.</span>
          <span>Risks</span>
          <span />
        </div>

        {filtered.length === 0 ? (
          <div className="p-14 text-center text-sm text-muted-foreground">
            <CheckCircle2 size={22} className="mx-auto mb-2 text-sw-green" />
            No recommendations match your filters.
          </div>
        ) : tab === "cross" && groupedBySku ? (
          groupedBySku.map(([sku, items]) => {
            const platformsForSku = skuPlatformCount.get(sku)!;
            return (
              <div key={sku}>
                <div className="px-5 py-2 border-t border-subtle flex items-center gap-2">
                  <span className="text-[12px] font-medium text-foreground">{sku}</span>
                  <span className="text-[10.5px] text-muted-foreground">
                    · {platformsForSku.size} platforms · {items.length} action{items.length > 1 ? "s" : ""}
                  </span>
                </div>
                {items.map(r => <RecoRow key={r.id} r={r} />)}
              </div>
            );
          })
        ) : (
          pageItems.map(r => <RecoRow key={r.id} r={r} />)
        )}

        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-5 py-2.5 border-t border-subtle text-[11px] text-muted-foreground">
            <span>Page {page} of {totalPages}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={13} />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 w-7 p-0" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

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
                  <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
                  <span className="text-[12px] font-medium text-foreground">{r.campaign}</span>
                  <span className="ml-auto text-[10.5px] text-muted-foreground">{r.sku} · {r.type}</span>
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
