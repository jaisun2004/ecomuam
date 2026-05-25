import React, { useMemo, useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sparkles, Bell, AlertTriangle, Package, DollarSign, Eye,
  CheckCircle2, X, TrendingUp, TrendingDown, BarChart3, Target,
} from "lucide-react";
import { toast } from "sonner";
import {
  BarChart, Bar, LineChart, Line, ResponsiveContainer, XAxis, Tooltip as RTooltip,
} from "recharts";

type Platform = "Talabat" | "Talabat Pro" | "Noon" | "Noon Minutes" | "Carrefour";

const PLATFORM_TINT: Record<Platform, string> = {
  Talabat: "bg-sw-amber-dim text-sw-amber",
  "Talabat Pro": "bg-sw-purple-dim text-sw-purple",
  Noon: "bg-sw-cyan-dim text-sw-cyan",
  "Noon Minutes": "bg-primary/15 text-primary",
  Carrefour: "bg-sw-green-dim text-sw-green",
};

interface Warning {
  kind: "availability" | "pricing" | "sos";
  label: string;
  detail: string;
}

interface ChangeRow {
  field: string;
  current: string;
  recommended: string;
}

interface Reco {
  id: string;
  campaign: string;
  platform: Platform;
  sku: string;
  confidence: number; // 1-5
  headline: string;
  rationale: string;
  chart: { type: "bar" | "line"; data: { x: string; v: number }[]; color: string };
  changes: ChangeRow[];
  warnings: Warning[];
}

const MOCK: Reco[] = [
  {
    id: "r1",
    campaign: "Pepsi 1L — Hydration Hour Boost",
    platform: "Talabat",
    sku: "Pepsi 1L PET",
    confidence: 5,
    headline: "Raise bid by +12% on Pepsi 1L (Dubai Marina cluster)",
    rationale: "Coca-Cola dropped bid 18% over last 48h. ROAS headroom available without breaching ACoS target.",
    chart: {
      type: "bar",
      color: "hsl(var(--primary))",
      data: [
        { x: "T-6", v: 3.1 }, { x: "T-5", v: 3.4 }, { x: "T-4", v: 3.6 },
        { x: "T-3", v: 3.9 }, { x: "T-2", v: 4.2 }, { x: "T-1", v: 4.5 }, { x: "Now", v: 4.7 },
      ],
    },
    changes: [
      { field: "Bid (AED)", current: "2.40", recommended: "2.69" },
      { field: "Daily Budget (AED)", current: "850", recommended: "950" },
      { field: "Dayparting", current: "10:00 – 22:00", recommended: "09:00 – 23:00" },
      { field: "Target Keywords", current: "12", recommended: "15 (+ cola, soft drink 1L)" },
      { field: "Placement", current: "Search only", recommended: "Search + Category banner" },
    ],
    warnings: [
      { kind: "sos", label: "SoS 14%", detail: "Share of Shelf 14% on Talabat — below 20% threshold for Beverages category in Dubai." },
    ],
  },
  {
    id: "r2",
    campaign: "Pepsi 1.5L — Family Pack Defender",
    platform: "Noon",
    sku: "Pepsi 1.5L PET",
    confidence: 4,
    headline: "Pause bid hike — restock first",
    rationale: "3 dark stores are OOS for Pepsi 1.5L. Spending on impressions that won't convert. Resume after 48h restock.",
    chart: {
      type: "line",
      color: "hsl(var(--sw-red))",
      data: [
        { x: "Mon", v: 92 }, { x: "Tue", v: 88 }, { x: "Wed", v: 80 },
        { x: "Thu", v: 71 }, { x: "Fri", v: 64 }, { x: "Sat", v: 58 }, { x: "Sun", v: 52 },
      ],
    },
    changes: [
      { field: "Bid (AED)", current: "3.10", recommended: "0 (pause)" },
      { field: "Daily Budget (AED)", current: "1,200", recommended: "0" },
      { field: "Status", current: "Active", recommended: "Paused 48h" },
    ],
    warnings: [
      { kind: "availability", label: "3 stores OOS", detail: "Pepsi 1.5L out of stock at 3 dark stores: Downtown Dubai, Al Barsha, JLT." },
      { kind: "pricing", label: "+8% vs Coke", detail: "Pepsi 1.5L priced AED 5.50 vs Coca-Cola 1.5L at AED 5.10 on Noon — 8% gap." },
    ],
  },
  {
    id: "r3",
    campaign: "7UP 330ml — Quick Commerce Push",
    platform: "Noon Minutes",
    sku: "7UP 330ml Can",
    confidence: 5,
    headline: "Reallocate AED 320/day from generic 'soda' to '7up lemon'",
    rationale: "CPC on long-tail keyword 38% lower with 2.1x conversion. Saves ~AED 9.6k/month at constant volume.",
    chart: {
      type: "bar",
      color: "hsl(var(--sw-green))",
      data: [
        { x: "soda", v: 1.8 }, { x: "lime", v: 2.4 }, { x: "lemon", v: 3.8 }, { x: "7up", v: 4.1 },
      ],
    },
    changes: [
      { field: "Bid (AED)", current: "1.85", recommended: "1.40" },
      { field: "Keyword Allocation", current: "soda 60% / 7up 40%", recommended: "soda 20% / 7up lemon 80%" },
      { field: "Daily Budget (AED)", current: "780", recommended: "780 (re-mixed)" },
    ],
    warnings: [],
  },
  {
    id: "r4",
    campaign: "Mountain Dew 500ml — Carrefour Weekend",
    platform: "Carrefour",
    sku: "Mountain Dew 500ml",
    confidence: 3,
    headline: "Hold bid — auction softening, no action needed",
    rationale: "Competitor spend index dropped 22% WoW. Current ROAS 4.8x already exceeds target. Re-evaluate in 7d.",
    chart: {
      type: "line",
      color: "hsl(var(--sw-amber))",
      data: [
        { x: "W-4", v: 100 }, { x: "W-3", v: 96 }, { x: "W-2", v: 88 }, { x: "W-1", v: 78 },
      ],
    },
    changes: [
      { field: "Bid (AED)", current: "2.10", recommended: "2.10 (hold)" },
      { field: "Daily Budget (AED)", current: "640", recommended: "640" },
    ],
    warnings: [
      { kind: "pricing", label: "+5% vs Sprite", detail: "Mountain Dew 500ml priced AED 3.75 vs Sprite at AED 3.55 on Carrefour." },
    ],
  },
  {
    id: "r5",
    campaign: "Lay's Classic 150g — Snack Hour",
    platform: "Talabat Pro",
    sku: "Lay's Classic 150g",
    confidence: 4,
    headline: "Extend dayparting into 22:00 – 01:00 slot",
    rationale: "Late-night snack queries up 41% WoW. Zero PepsiCo presence in this slot. Competitor SoV ~0%.",
    chart: {
      type: "bar",
      color: "hsl(var(--sw-purple))",
      data: [
        { x: "18h", v: 24 }, { x: "20h", v: 38 }, { x: "22h", v: 52 }, { x: "00h", v: 61 }, { x: "02h", v: 18 },
      ],
    },
    changes: [
      { field: "Dayparting", current: "12:00 – 22:00", recommended: "12:00 – 01:00" },
      { field: "Bid (AED) — Late Slot", current: "—", recommended: "1.80" },
      { field: "Daily Budget (AED)", current: "520", recommended: "680" },
    ],
    warnings: [
      { kind: "sos", label: "SoS 18%", detail: "Share of Shelf 18% in late-night snack queries — below 25% target." },
    ],
  },
];

const WARN_META: Record<Warning["kind"], { icon: React.ElementType; cls: string; label: string }> = {
  availability: { icon: Package, cls: "text-sw-red bg-sw-red-dim border-sw-red/30", label: "Availability" },
  pricing: { icon: DollarSign, cls: "text-sw-amber bg-sw-amber-dim border-sw-amber/30", label: "Pricing Gap" },
  sos: { icon: BarChart3, cls: "text-sw-purple bg-sw-purple-dim border-sw-purple/30", label: "Share of Shelf" },
};

const ConfidenceDots: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex items-center gap-0.5">
    {[0, 1, 2, 3, 4].map(i => (
      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < n ? "bg-primary" : "bg-surface-3"}`} />
    ))}
  </span>
);

const TARGETS = [
  { key: "roas", label: "ROAS", current: 4.2, target: 3.5, unit: "x", higherIsBetter: true, note: "Above target — efficient spend" },
  { key: "acos", label: "ACoS", current: 22, target: 18, unit: "%", higherIsBetter: false, note: "Above target — trim low-CVR keywords" },
  { key: "spend", label: "Spend (MTD)", current: 684000, target: 900000, unit: "AED", higherIsBetter: true, note: "On pace — 76% of monthly budget" },
];

const fmtAED = (n: number) => `AED ${n.toLocaleString("en-AE")}`;

const RecommendationsView: React.FC = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [openChanges, setOpenChanges] = useState<string | null>(null);
  const [openWarn, setOpenWarn] = useState<{ recoId: string; warnIdx: number } | null>(null);

  const visible = useMemo(
    () => MOCK.filter(r => !dismissed.has(r.id) && !applied.has(r.id)),
    [dismissed, applied]
  );

  const activeReco = openChanges ? MOCK.find(r => r.id === openChanges) : null;
  const activeWarn = openWarn ? MOCK.find(r => r.id === openWarn.recoId)?.warnings[openWarn.warnIdx] : null;

  const scrollToFeed = () => {
    document.getElementById("reco-feed")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display font-bold text-2xl text-foreground">Recommendations</h1>
        <p className="text-sm text-muted-foreground mt-1">
          AI-generated campaign actions grounded in live shelf, price, and competitor signals
        </p>
      </header>

      {/* Section A — Top KPIs + Notification */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
        <KPICard title="Spend (MTD)" value="AED 6.84L" delta="+8% WoW" deltaType="neutral"
          sub="Across 42 active campaigns" accentColor="bg-sw-purple" delay={0} />
        <KPICard title="ROAS" value="4.2x" delta="vs 3.5x target" deltaType="positive"
          sub="Weighted avg, all platforms" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="ACoS" value="22%" delta="vs 18% target" deltaType="warning"
          sub="4pt above target — needs trim" accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="CTR" value="3.8%" delta="+0.4pt WoW" deltaType="positive"
          sub="Strongest on Noon Minutes" accentColor="bg-sw-cyan" delay={0.15} />

        <button
          onClick={scrollToFeed}
          className="relative text-left bg-gradient-to-br from-primary/15 via-primary/8 to-surface-1 border border-primary/40 rounded-2xl p-5 hover:border-primary/70 transition-all overflow-hidden opacity-0 animate-fade-slide-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-primary" />
          <span className="absolute top-3 right-3 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
          </span>
          <div className="flex items-center gap-2 mb-1">
            <Bell size={14} className="text-primary" />
            <p className="text-xs text-primary font-medium">New Recommendations</p>
          </div>
          <p className="font-display font-bold text-2xl text-foreground">{visible.length} <span className="text-sm font-normal text-muted-foreground">new</span></p>
          <p className="text-[11px] text-muted-foreground mt-1.5">Generated by AI since yesterday · click to review</p>
        </button>
      </div>

      {/* Section B — Target Pacing */}
      <PanelCard title="Target Pacing — Month to Date" badge="3 KPIs" badgeColor="accent" delay={0.25}>
        <div className="space-y-5">
          {TARGETS.map(t => {
            const pct = t.higherIsBetter
              ? Math.min(100, (t.current / t.target) * 100)
              : Math.min(100, (t.target / t.current) * 100);
            const met = t.higherIsBetter ? t.current >= t.target : t.current <= t.target;
            const statusCls = met ? "text-sw-green bg-sw-green-dim" : pct >= 70 ? "text-sw-amber bg-sw-amber-dim" : "text-sw-red bg-sw-red-dim";
            const statusLabel = met ? "Met" : pct >= 70 ? "At Risk" : "Behind";
            const fmtVal = (v: number) => t.unit === "AED" ? fmtAED(v) : `${v}${t.unit}`;
            return (
              <div key={t.key}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Target size={13} className="text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{t.label}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${statusCls}`}>{statusLabel}</span>
                  </div>
                  <span className="text-xs font-mono text-muted-foreground">
                    <span className="text-foreground font-semibold">{fmtVal(t.current)}</span> / target {fmtVal(t.target)}
                  </span>
                </div>
                <Progress value={pct} className="h-2" />
                <p className="text-[11px] text-muted-foreground mt-1.5">{t.note}</p>
              </div>
            );
          })}
        </div>
      </PanelCard>

      {/* Section C — Recommendations Feed */}
      <div id="reco-feed" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-semibold text-base text-foreground flex items-center gap-2">
            <Sparkles size={16} className="text-primary" /> AI Recommendations for Active Campaigns
          </h2>
          <span className="text-xs text-muted-foreground font-mono">{visible.length} pending</span>
        </div>

        {visible.length === 0 && (
          <div className="bg-surface-1 border border-subtle rounded-2xl p-10 text-center text-sm text-muted-foreground">
            All caught up — no pending recommendations.
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visible.map((r, i) => (
            <div
              key={r.id}
              className="bg-surface-1 border border-subtle rounded-2xl overflow-hidden opacity-0 animate-fade-slide-in"
              style={{ animationDelay: `${0.3 + i * 0.04}s` }}
            >
              <div className="px-4 py-3 border-b border-subtle flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{r.sku}</span>
                  </div>
                  <p className="font-display font-semibold text-sm text-foreground truncate">{r.campaign}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] bg-primary/15 text-primary border border-primary/30">
                    <Sparkles size={9} /> AI
                  </span>
                  <ConfidenceDots n={r.confidence} />
                </div>
              </div>

              <div className="px-4 py-3 space-y-3">
                <p className="text-sm font-medium text-foreground">{r.headline}</p>
                <p className="text-[12px] text-muted-foreground leading-relaxed">{r.rationale}</p>

                {/* Infographic */}
                <div className="bg-surface-2 rounded-lg p-2 h-[80px]">
                  <ResponsiveContainer width="100%" height="100%">
                    {r.chart.type === "bar" ? (
                      <BarChart data={r.chart.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <XAxis dataKey="x" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <RTooltip cursor={{ fill: "hsl(var(--surface-3))" }} contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Bar dataKey="v" fill={r.chart.color} radius={[3, 3, 0, 0]} />
                      </BarChart>
                    ) : (
                      <LineChart data={r.chart.data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                        <XAxis dataKey="x" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <RTooltip contentStyle={{ fontSize: 11, background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
                        <Line type="monotone" dataKey="v" stroke={r.chart.color} strokeWidth={2} dot={false} />
                      </LineChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Warnings */}
                {r.warnings.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <AlertTriangle size={10} className="text-sw-amber" /> E-commerce KPI Warnings
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {r.warnings.map((w, wi) => {
                        const WM = WARN_META[w.kind];
                        const WIcon = WM.icon;
                        return (
                          <div key={wi} className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] ${WM.cls}`}>
                            <WIcon size={11} />
                            <span className="font-medium">{WM.label}:</span>
                            <span className="font-mono">{w.label}</span>
                            <button
                              onClick={() => setOpenWarn({ recoId: r.id, warnIdx: wi })}
                              className="ml-1 px-1.5 py-0.5 rounded bg-background/60 hover:bg-background text-[10px] font-medium border border-current/20"
                            >
                              Alert
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="px-4 py-3 border-t border-subtle flex items-center gap-2 bg-surface-2">
                <Button size="sm" className="gap-1.5 flex-1" onClick={() => setOpenChanges(r.id)}>
                  <Eye size={13} /> View Changes
                </Button>
                <Button
                  size="sm" variant="outline" className="gap-1.5"
                  onClick={() => { setApplied(p => new Set(p).add(r.id)); toast.success("Recommendation applied"); }}
                >
                  <CheckCircle2 size={13} /> Apply
                </Button>
                <Button
                  size="sm" variant="ghost"
                  onClick={() => { setDismissed(p => new Set(p).add(r.id)); toast("Dismissed"); }}
                >
                  <X size={13} />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* View Changes Dialog */}
      <Dialog open={!!openChanges} onOpenChange={(o) => !o && setOpenChanges(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Sparkles size={16} className="text-primary" />
              Proposed Changes
            </DialogTitle>
          </DialogHeader>
          {activeReco && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${PLATFORM_TINT[activeReco.platform]}`}>{activeReco.platform}</span>
                <span className="text-sm font-medium text-foreground">{activeReco.campaign}</span>
              </div>
              <div className="rounded-xl border border-subtle overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-surface-2">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Field</th>
                      <th className="px-3 py-2 font-medium">Current</th>
                      <th className="px-3 py-2 font-medium">Recommended</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReco.changes.map((c, i) => {
                      const changed = c.current !== c.recommended;
                      return (
                        <tr key={i} className={`border-t border-subtle ${changed ? "bg-sw-amber-dim/40" : ""}`}>
                          <td className="px-3 py-2 text-foreground font-medium">{c.field}</td>
                          <td className="px-3 py-2 text-muted-foreground font-mono text-[12px]">{c.current}</td>
                          <td className="px-3 py-2 text-foreground font-mono text-[12px] flex items-center gap-1.5">
                            {changed && <TrendingUp size={11} className="text-sw-amber" />}
                            {c.recommended}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Confidence: <ConfidenceDots n={activeReco.confidence} /> · Generated by AI from live shelf + competitor signals
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenChanges(null)}>Cancel</Button>
            <Button
              onClick={() => {
                if (activeReco) {
                  setApplied(p => new Set(p).add(activeReco.id));
                  toast.success("Changes applied to campaign");
                }
                setOpenChanges(null);
              }}
            >
              Confirm & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Warning Alert Dialog */}
      <AlertDialog open={!!openWarn} onOpenChange={(o) => !o && setOpenWarn(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display flex items-center gap-2">
              <AlertTriangle size={16} className="text-sw-amber" />
              {activeWarn ? WARN_META[activeWarn.kind].label : ""} Alert
            </AlertDialogTitle>
            <AlertDialogDescription>
              {activeWarn?.detail}
            </AlertDialogDescription>
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
