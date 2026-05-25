import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sparkles, Bell, AlertTriangle, Package, DollarSign, BarChart3,
  CheckCircle2, X, ChevronDown, ChevronRight,
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

interface ChangeRow { field: string; current: string; recommended: string; }

interface Reco {
  id: string;
  campaign: string;
  platform: Platform;
  sku: string;
  confidence: number;
  headline: string;
  rationale: string;
  chart: { type: "bar" | "line"; data: { x: string; v: number }[]; color: string };
  changes: ChangeRow[];
  warnings: Warning[];
}

const MOCK: Reco[] = [
  {
    id: "r1", campaign: "Pepsi 1L — Hydration Hour Boost", platform: "Talabat", sku: "Pepsi 1L PET", confidence: 5,
    headline: "Raise bid by +12% on Pepsi 1L (Dubai Marina cluster)",
    rationale: "Coca-Cola dropped bid 18% over last 48h. ROAS headroom available without breaching ACoS target.",
    chart: { type: "bar", color: "hsl(var(--primary))", data: [
      { x: "T-6", v: 3.1 }, { x: "T-5", v: 3.4 }, { x: "T-4", v: 3.6 },
      { x: "T-3", v: 3.9 }, { x: "T-2", v: 4.2 }, { x: "T-1", v: 4.5 }, { x: "Now", v: 4.7 },
    ]},
    changes: [
      { field: "Bid (AED)", current: "2.40", recommended: "2.69" },
      { field: "Daily Budget (AED)", current: "850", recommended: "950" },
      { field: "Dayparting", current: "10:00 – 22:00", recommended: "09:00 – 23:00" },
    ],
    warnings: [{ kind: "sos", label: "SoS 14%", detail: "Share of Shelf 14% on Talabat — below 20% threshold." }],
  },
  {
    id: "r2", campaign: "Pepsi 1.5L — Family Pack Defender", platform: "Noon", sku: "Pepsi 1.5L PET", confidence: 4,
    headline: "Pause bid hike — restock first",
    rationale: "3 dark stores are OOS for Pepsi 1.5L. Spending on impressions that won't convert. Resume after 48h restock.",
    chart: { type: "line", color: "hsl(var(--sw-red))", data: [
      { x: "Mon", v: 92 }, { x: "Tue", v: 88 }, { x: "Wed", v: 80 },
      { x: "Thu", v: 71 }, { x: "Fri", v: 64 }, { x: "Sat", v: 58 }, { x: "Sun", v: 52 },
    ]},
    changes: [
      { field: "Bid (AED)", current: "3.10", recommended: "0 (pause)" },
      { field: "Status", current: "Active", recommended: "Paused 48h" },
    ],
    warnings: [
      { kind: "availability", label: "3 stores OOS", detail: "Pepsi 1.5L out of stock at 3 dark stores: Downtown Dubai, Al Barsha, JLT." },
      { kind: "pricing", label: "+8% vs Coke", detail: "Pepsi 1.5L AED 5.50 vs Coca-Cola 1.5L AED 5.10 on Noon — 8% gap." },
    ],
  },
  {
    id: "r3", campaign: "7UP 330ml — Quick Commerce Push", platform: "Noon Minutes", sku: "7UP 330ml Can", confidence: 5,
    headline: "Reallocate AED 320/day from 'soda' to '7up lemon'",
    rationale: "CPC on long-tail keyword 38% lower with 2.1x conversion. Saves ~AED 9.6k/month at constant volume.",
    chart: { type: "bar", color: "hsl(var(--sw-green))", data: [
      { x: "soda", v: 1.8 }, { x: "lime", v: 2.4 }, { x: "lemon", v: 3.8 }, { x: "7up", v: 4.1 },
    ]},
    changes: [
      { field: "Bid (AED)", current: "1.85", recommended: "1.40" },
      { field: "Keyword Allocation", current: "soda 60% / 7up 40%", recommended: "soda 20% / 7up lemon 80%" },
    ],
    warnings: [],
  },
  {
    id: "r4", campaign: "Mountain Dew 500ml — Carrefour Weekend", platform: "Carrefour", sku: "Mountain Dew 500ml", confidence: 3,
    headline: "Hold bid — auction softening, no action needed",
    rationale: "Competitor spend index dropped 22% WoW. Current ROAS 4.8x already exceeds target. Re-evaluate in 7d.",
    chart: { type: "line", color: "hsl(var(--sw-amber))", data: [
      { x: "W-4", v: 100 }, { x: "W-3", v: 96 }, { x: "W-2", v: 88 }, { x: "W-1", v: 78 },
    ]},
    changes: [{ field: "Bid (AED)", current: "2.10", recommended: "2.10 (hold)" }],
    warnings: [{ kind: "pricing", label: "+5% vs Sprite", detail: "Mountain Dew 500ml AED 3.75 vs Sprite AED 3.55 on Carrefour." }],
  },
  {
    id: "r5", campaign: "Lay's Classic 150g — Snack Hour", platform: "Talabat Pro", sku: "Lay's Classic 150g", confidence: 4,
    headline: "Extend dayparting into 22:00 – 01:00 slot",
    rationale: "Late-night snack queries up 41% WoW. Zero PepsiCo presence in this slot. Competitor SoV ~0%.",
    chart: { type: "bar", color: "hsl(var(--sw-purple))", data: [
      { x: "18h", v: 24 }, { x: "20h", v: 38 }, { x: "22h", v: 52 }, { x: "00h", v: 61 }, { x: "02h", v: 18 },
    ]},
    changes: [
      { field: "Dayparting", current: "12:00 – 22:00", recommended: "12:00 – 01:00" },
      { field: "Daily Budget (AED)", current: "520", recommended: "680" },
    ],
    warnings: [{ kind: "sos", label: "SoS 18%", detail: "Share of Shelf 18% in late-night snack queries — below 25% target." }],
  },
];

const WARN_META: Record<Warning["kind"], { icon: React.ElementType; cls: string; label: string }> = {
  availability: { icon: Package, cls: "text-sw-red bg-sw-red-dim", label: "Availability" },
  pricing: { icon: DollarSign, cls: "text-sw-amber bg-sw-amber-dim", label: "Pricing Gap" },
  sos: { icon: BarChart3, cls: "text-sw-purple bg-sw-purple-dim", label: "Share of Shelf" },
};

const ConfidenceDots: React.FC<{ n: number }> = ({ n }) => (
  <span className="inline-flex items-center gap-0.5" title={`Confidence ${n}/5`}>
    {[0, 1, 2, 3, 4].map(i => (
      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i < n ? "bg-primary" : "bg-surface-3"}`} />
    ))}
  </span>
);

const PACING = [
  { label: "ROAS", val: "4.2x", target: "3.5x", state: "ok" as const },
  { label: "ACoS", val: "22%", target: "18%", state: "warn" as const },
  { label: "Spend MTD", val: "AED 6.84L", target: "AED 9.0L", state: "ok" as const },
];

const stateCls = (s: "ok" | "warn" | "bad") =>
  s === "ok" ? "text-sw-green bg-sw-green-dim"
  : s === "warn" ? "text-sw-amber bg-sw-amber-dim"
  : "text-sw-red bg-sw-red-dim";

const RecommendationsView: React.FC = () => {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<string | null>("r1");
  const [openWarn, setOpenWarn] = useState<{ recoId: string; warnIdx: number } | null>(null);

  const visible = useMemo(
    () => MOCK.filter(r => !dismissed.has(r.id) && !applied.has(r.id)),
    [dismissed, applied]
  );

  const activeWarn = openWarn ? MOCK.find(r => r.id === openWarn.recoId)?.warnings[openWarn.warnIdx] : null;

  return (
    <div className="space-y-5 max-w-5xl">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI actions for your active campaigns — review one at a time.
          </p>
        </div>
      </header>

      {/* Compact focus strip: notification + pacing chips in one row */}
      <div className="bg-surface-1 border border-subtle rounded-2xl p-4 flex flex-wrap items-center gap-4 opacity-0 animate-fade-slide-in">
        <div className="flex items-center gap-3 pr-4 border-r border-subtle">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Bell size={16} />
            {visible.length > 0 && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
              </span>
            )}
          </span>
          <div>
            <p className="font-display font-bold text-lg leading-tight text-foreground">
              {visible.length} <span className="text-xs font-normal text-muted-foreground">new since yesterday</span>
            </p>
            <p className="text-[11px] text-muted-foreground">Generated by AI from live signals</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 flex-1">
          {PACING.map(p => (
            <div key={p.label} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-2 border border-subtle">
              <span className="text-[11px] text-muted-foreground">{p.label}</span>
              <span className="text-sm font-mono font-semibold text-foreground">{p.val}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${stateCls(p.state)}`}>
                vs {p.target}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Single-column recommendation list */}
      <div className="space-y-2">
        {visible.length === 0 && (
          <div className="bg-surface-1 border border-subtle rounded-2xl p-10 text-center text-sm text-muted-foreground">
            <CheckCircle2 size={20} className="mx-auto mb-2 text-sw-green" />
            All caught up — no pending recommendations.
          </div>
        )}

        {visible.map((r, i) => {
          const isOpen = expanded === r.id;
          return (
            <div
              key={r.id}
              className="bg-surface-1 border border-subtle rounded-xl overflow-hidden opacity-0 animate-fade-slide-in"
              style={{ animationDelay: `${0.05 + i * 0.03}s` }}
            >
              {/* Collapsed row */}
              <button
                onClick={() => setExpanded(isOpen ? null : r.id)}
                className="w-full px-4 py-3 flex items-center gap-3 text-left hover:bg-surface-2 transition-colors"
              >
                {isOpen ? <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" /> : <ChevronRight size={16} className="text-muted-foreground flex-shrink-0" />}
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono flex-shrink-0 ${PLATFORM_TINT[r.platform]}`}>{r.platform}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-foreground truncate">{r.headline}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{r.campaign}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {r.warnings.map((w, wi) => {
                    const WIcon = WARN_META[w.kind].icon;
                    return (
                      <span key={wi} title={WARN_META[w.kind].label} className={`inline-flex items-center justify-center h-6 w-6 rounded-full ${WARN_META[w.kind].cls}`}>
                        <WIcon size={11} />
                      </span>
                    );
                  })}
                  <ConfidenceDots n={r.confidence} />
                </div>
              </button>

              {/* Expanded detail */}
              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-subtle bg-surface-2/30">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
                    {/* Rationale + chart */}
                    <div className="md:col-span-2 space-y-3">
                      <p className="text-[12px] text-muted-foreground leading-relaxed flex items-start gap-1.5">
                        <Sparkles size={11} className="text-primary mt-0.5 flex-shrink-0" />
                        {r.rationale}
                      </p>
                      <div className="bg-surface-1 border border-subtle rounded-lg p-2 h-[90px]">
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

                      {/* Inline changes */}
                      <div className="rounded-lg border border-subtle overflow-hidden bg-surface-1">
                        <div className="px-3 py-1.5 bg-surface-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                          Proposed changes
                        </div>
                        <table className="w-full text-[12px]">
                          <tbody>
                            {r.changes.map((c, ci) => (
                              <tr key={ci} className="border-t border-subtle first:border-t-0">
                                <td className="px-3 py-1.5 text-muted-foreground w-1/3">{c.field}</td>
                                <td className="px-3 py-1.5 font-mono text-muted-foreground line-through">{c.current}</td>
                                <td className="px-3 py-1.5 font-mono text-foreground font-medium">→ {c.recommended}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Warnings + actions */}
                    <div className="space-y-3">
                      {r.warnings.length > 0 && (
                        <div className="space-y-1.5">
                          <p className="text-[10px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                            <AlertTriangle size={10} className="text-sw-amber" /> Linked KPI risks
                          </p>
                          {r.warnings.map((w, wi) => {
                            const WM = WARN_META[w.kind];
                            const WIcon = WM.icon;
                            return (
                              <button
                                key={wi}
                                onClick={() => setOpenWarn({ recoId: r.id, warnIdx: wi })}
                                className={`w-full text-left flex items-center gap-2 px-2.5 py-2 rounded-lg ${WM.cls} hover:opacity-80 transition-opacity`}
                              >
                                <WIcon size={12} />
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-medium">{WM.label}</p>
                                  <p className="text-[10px] font-mono opacity-80 truncate">{w.label}</p>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5 pt-1">
                        <Button
                          size="sm"
                          onClick={() => { setApplied(p => new Set(p).add(r.id)); toast.success("Recommendation applied"); }}
                          className="gap-1.5"
                        >
                          <CheckCircle2 size={13} /> Apply
                        </Button>
                        <Button
                          size="sm" variant="ghost"
                          onClick={() => { setDismissed(p => new Set(p).add(r.id)); toast("Dismissed"); }}
                          className="gap-1.5 text-muted-foreground"
                        >
                          <X size={13} /> Dismiss
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Warning Alert Dialog */}
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
