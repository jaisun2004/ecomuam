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
  CheckCircle2, X, Search, Layers, ChevronLeft, ChevronRight, Filter,
} from "lucide-react";
import { toast } from "sonner";

type Platform = "Talabat" | "Talabat Pro" | "Noon" | "Noon Minutes" | "Carrefour";
type RecoType = "Dayparting" | "Keyword Mix" | "Pause (OOS)" | "Creative" | "Pricing Action" | "Targeting";

const PLATFORMS: Platform[] = ["Talabat", "Talabat Pro", "Noon", "Noon Minutes", "Carrefour"];
const TYPES: RecoType[] = ["Dayparting", "Keyword Mix", "Pause (OOS)", "Creative", "Pricing Action", "Targeting"];

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
  type: RecoType;
  confidence: number;
  headline: string;
  rationale: string;
  estImpact: string;
  changes: ChangeRow[];
  warnings: Warning[];
  isNew?: boolean;
}

// ---- Mock generator: ~240 recommendations across PepsiCo SKUs / platforms ----
const SKUS = [
  "Pepsi 1L PET", "Pepsi 1.5L PET", "Pepsi 330ml Can", "Pepsi Black 1L",
  "7UP 330ml Can", "7UP 1L PET", "Mountain Dew 500ml", "Mirinda Orange 1L",
  "Lay's Classic 150g", "Lay's Salt & Vinegar 150g", "Doritos Nacho 150g",
  "Cheetos Crunchy 130g", "Quaker Oats 1kg", "Tropicana Orange 1L",
];

const HEADLINES: Record<RecoType, string[]> = {
  "Dayparting": [
    "Extend dayparting into 22:00 – 01:00 slot",
    "Shift spend out of 02:00 – 06:00 dead window",
    "Add 11:00 – 13:00 lunch peak slot",
  ],
  "Keyword Mix": [
    "Shift weight from generic 'soda' to branded long-tail",
    "Add 5 high-converting long-tail keywords",
    "Drop 3 low-CTR generic keywords",
  ],
  "Pause (OOS)": [
    "Pause campaign — 3 dark stores OOS",
    "Pause until restock confirmed (48h)",
  ],
  "Creative": [
    "Refresh creative — CTR decayed 28% in 14d",
    "Swap to value-pack creative for family slot",
  ],
  "Pricing Action": [
    "Reduce listed price 4% to close gap vs competitor",
    "Apply festival price tag — match category leader",
  ],
  "Targeting": [
    "Tighten audience to 'Repeat Buyer 30d'",
    "Add 'Late-Night Snackers' audience",
  ],
};

const RATIONALES: Record<RecoType, string> = {
  "Dayparting": "Query volume for this SKU peaks outside current schedule. Reallocating slots improves visibility at no extra spend.",
  "Keyword Mix": "Long-tail terms show 2.1x conversion at 38% lower CPC versus generic seed keywords.",
  "Pause (OOS)": "Inventory feed shows out-of-stock at multiple dark stores. Continued spend would waste impressions.",
  "Creative": "Creative fatigue detected — frequency above 6, CTR trending down 4 weeks in a row.",
  "Pricing Action": "Listed price gap vs nearest competitor exceeds 6%. Conversion drop correlates with the widening gap.",
  "Targeting": "Audience overlap analysis shows wasted reach. Tightening to high-intent cohort improves ROAS.",
};

function makeReco(i: number): Reco {
  const sku = SKUS[i % SKUS.length];
  const platform = PLATFORMS[i % PLATFORMS.length];
  const type = TYPES[i % TYPES.length];
  const heads = HEADLINES[type];
  const conf = 3 + ((i * 7) % 3); // 3..5
  const hasWarn = i % 4 === 0;
  const warn: Warning | null = !hasWarn ? null
    : i % 12 === 0 ? { kind: "availability", label: `${1 + (i % 4)} stores OOS`, detail: `${sku} OOS at ${1 + (i % 4)} dark stores on ${platform}.` }
    : i % 8 === 0 ? { kind: "pricing", label: `+${5 + (i % 5)}% vs comp`, detail: `${sku} priced ${5 + (i % 5)}% above nearest competitor on ${platform}.` }
    : { kind: "sos", label: `SoS ${10 + (i % 12)}%`, detail: `Share of Shelf ${10 + (i % 12)}% on ${platform} — below 20% threshold.` };

  let changes: ChangeRow[];
  switch (type) {
    case "Dayparting":
      changes = [{ field: "Schedule", current: "12:00 – 22:00", recommended: "12:00 – 01:00" }];
      break;
    case "Keyword Mix":
      changes = [
        { field: "Keyword Allocation", current: "generic 60% / branded 40%", recommended: "generic 25% / branded 75%" },
        { field: "Negative Keywords", current: "12", recommended: "18" },
      ];
      break;
    case "Pause (OOS)":
      changes = [{ field: "Status", current: "Active", recommended: "Paused 48h" }];
      break;
    case "Creative":
      changes = [{ field: "Creative Set", current: "v3 (run 47d)", recommended: "v4 (festival cut)" }];
      break;
    case "Pricing Action":
      changes = [{ field: "Listed Price (AED)", current: "5.50", recommended: "5.25" }];
      break;
    case "Targeting":
      changes = [{ field: "Audience", current: "Broad — Beverage Buyers", recommended: "Repeat Buyer 30d + Cart Abandoners" }];
      break;
  }

  return {
    id: `r${i + 1}`,
    campaign: `${sku.split(" ")[0]} — ${type} ${platform.split(" ")[0]} #${100 + i}`,
    platform, sku, type,
    confidence: conf,
    headline: heads[i % heads.length],
    rationale: RATIONALES[type],
    estImpact: type === "Pause (OOS)" ? `Save AED ${(2 + (i % 5)) * 1000}/wk wasted spend`
      : type === "Pricing Action" ? `+${4 + (i % 6)}% conversion lift expected`
      : type === "Creative" ? `+${15 + (i % 20)}% CTR projected`
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
  <span className="inline-flex items-center gap-0.5" title={`Confidence ${n}/5`}>
    {[0, 1, 2, 3, 4].map(i => (
      <span key={i} className={`w-1 h-1 rounded-full ${i < n ? "bg-primary" : "bg-surface-3"}`} />
    ))}
  </span>
);

const PACING = [
  { label: "ROAS", val: "4.2x", target: "3.5x", state: "ok" as const },
  { label: "ACoS", val: "22%", target: "18%", state: "warn" as const },
  { label: "Spend MTD", val: "AED 6.84L", target: "AED 9.0L", state: "ok" as const },
];
const stateCls = (s: "ok" | "warn") => s === "ok" ? "text-sw-green bg-sw-green-dim" : "text-sw-amber bg-sw-amber-dim";

const PAGE_SIZE = 25;

const RecommendationsView: React.FC = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openApply, setOpenApply] = useState<string[] | null>(null); // ids being applied
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

  // Group SKUs by platforms they appear on (within live pool)
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

  // Counts
  const crossCount = useMemo(() => livePool.filter(r => (skuPlatformCount.get(r.sku)?.size ?? 1) >= 2).length, [livePool, skuPlatformCount]);
  const singleCount = livePool.length - crossCount;
  const newCount = livePool.filter(r => r.isNew).length;

  // SKU grouping for cross-platform view
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
    <div className="grid grid-cols-[24px_72px_1fr_120px_90px_110px_180px] items-center gap-3 px-3 py-2 border-t border-subtle hover:bg-surface-2/50 text-[12px]">
      <Checkbox checked={selected.has(r.id)} onCheckedChange={() => toggleSel(r.id)} aria-label="Select" />
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono text-center ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{r.headline}</p>
        <p className="text-[10.5px] text-muted-foreground truncate">{r.campaign}</p>
      </div>
      <span className="text-[10.5px] text-muted-foreground truncate">{r.type}</span>
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
      <div className="flex items-center justify-end gap-1.5">
        <Button size="sm" variant="ghost" className="h-7 px-2 text-[11px]"
          onClick={() => { setDismissed(p => new Set(p).add(r.id)); toast("Dismissed"); }}>
          <X size={12} />
        </Button>
        <Button size="sm" className="h-7 px-2.5 text-[11px] gap-1"
          onClick={() => setOpenApply([r.id])}>
          <CheckCircle2 size={12} /> Apply
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI actions across {livePool.length} live campaigns. Triaged for scale.
          </p>
        </div>
      </header>

      {/* Focus strip */}
      <div className="bg-surface-1 border border-subtle rounded-2xl p-3 flex flex-wrap items-center gap-3 opacity-0 animate-fade-slide-in">
        <div className="flex items-center gap-2.5 pr-3 border-r border-subtle">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <Bell size={14} />
            {newCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
          </span>
          <div>
            <p className="font-display font-bold text-base leading-tight text-foreground">
              {newCount} <span className="text-[11px] font-normal text-muted-foreground">new since yesterday</span>
            </p>
            <p className="text-[10px] text-muted-foreground">Generated by AI from live signals</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-1.5 flex-1">
          {PACING.map(p => (
            <div key={p.label} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-2 border border-subtle">
              <span className="text-[10px] text-muted-foreground">{p.label}</span>
              <span className="text-[12px] font-mono font-semibold text-foreground">{p.val}</span>
              <span className={`text-[9.5px] px-1 py-0.5 rounded font-mono ${stateCls(p.state)}`}>vs {p.target}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs — segregated by SKU footprint */}
      <div className="flex items-center gap-1 border-b border-subtle">
        <button onClick={() => setTab("cross")}
          className={`px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            tab === "cross" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}>
          <Layers size={13} /> Cross-Platform SKUs
          <span className="ml-1 px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono">{crossCount}</span>
        </button>
        <button onClick={() => setTab("single")}
          className={`px-4 py-2 text-[12px] font-medium border-b-2 -mb-px transition-colors flex items-center gap-1.5 ${
            tab === "single" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
          }`}>
          Single-Platform SKUs
          <span className="ml-1 px-1.5 py-0.5 rounded bg-surface-2 text-[10px] font-mono">{singleCount}</span>
        </button>
      </div>

      {/* Filters bar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search SKU, campaign or action…" className="h-8 pl-8 text-[12px]" />
        </div>
        <Select value={platform} onValueChange={setPlatform}>
          <SelectTrigger className="h-8 w-[150px] text-[12px]"><SelectValue placeholder="Platform" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All platforms</SelectItem>
            {PLATFORMS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="h-8 w-[160px] text-[12px]"><SelectValue placeholder="Action type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All actions</SelectItem>
            {TYPES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="text-[11px] text-muted-foreground flex items-center gap-1">
          <Filter size={11} /> {filtered.length} match{filtered.length === 1 ? "" : "es"}
        </div>
        {selected.size > 0 && (
          <Button size="sm" className="h-8 text-[11px] gap-1.5 ml-auto"
            onClick={() => setOpenApply(Array.from(selected))}>
            <CheckCircle2 size={13} /> Apply {selected.size} selected
          </Button>
        )}
      </div>

      {/* List */}
      <div className="bg-surface-1 border border-subtle rounded-xl overflow-hidden">
        {/* Header row */}
        <div className="grid grid-cols-[24px_72px_1fr_120px_90px_110px_180px] items-center gap-3 px-3 py-2 bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
          <Checkbox
            checked={pageItems.length > 0 && pageItems.every(r => selected.has(r.id))}
            onCheckedChange={toggleAllPage} aria-label="Select page"
          />
          <span>Platform</span>
          <span>Recommendation</span>
          <span>Type</span>
          <span>Confidence</span>
          <span>KPI Risks</span>
          <span className="text-right">Action</span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">
            <CheckCircle2 size={20} className="mx-auto mb-2 text-sw-green" />
            No recommendations match your filters.
          </div>
        ) : tab === "cross" && groupedBySku ? (
          groupedBySku.map(([sku, items]) => {
            const platformsForSku = skuPlatformCount.get(sku)!;
            return (
              <div key={sku}>
                <div className="px-3 py-1.5 bg-surface-2/50 border-t border-subtle flex items-center gap-2">
                  <Sparkles size={11} className="text-primary" />
                  <span className="text-[11.5px] font-medium text-foreground">{sku}</span>
                  <span className="text-[10px] text-muted-foreground">
                    sold on {platformsForSku.size} platforms · {items.length} recommendation{items.length > 1 ? "s" : ""} on this page
                  </span>
                </div>
                {items.map(r => <RecoRow key={r.id} r={r} />)}
              </div>
            );
          })
        ) : (
          pageItems.map(r => <RecoRow key={r.id} r={r} />)
        )}

        {/* Pagination */}
        {filtered.length > PAGE_SIZE && (
          <div className="flex items-center justify-between px-3 py-2 border-t border-subtle bg-surface-2/30 text-[11px] text-muted-foreground">
            <span>Page {page} of {totalPages} · showing {pageItems.length} of {filtered.length}</span>
            <div className="flex items-center gap-1">
              <Button size="sm" variant="ghost" className="h-7 px-2" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                <ChevronLeft size={13} />
              </Button>
              <Button size="sm" variant="ghost" className="h-7 px-2" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                <ChevronRight size={13} />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Apply Confirmation Dialog — data view of what will happen */}
      <Dialog open={!!openApply} onOpenChange={(o) => !o && setOpenApply(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <CheckCircle2 size={16} className="text-primary" />
              Apply {applyTargets.length} recommendation{applyTargets.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              Review the exact data changes that will be pushed to your ad accounts. Nothing is sent until you confirm.
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
                      <tr key={ci} className="border-t border-subtle bg-sw-amber-dim/30">
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

      {/* KPI Risk Alert */}
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
