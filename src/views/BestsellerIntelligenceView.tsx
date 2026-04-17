import React, { useMemo, useState } from "react";
import ScreenTabs from "@/components/ScreenTabs";
import PanelCard from "@/components/sw/PanelCard";
import KPICard from "@/components/sw/KPICard";
import DateRangeSubtitle from "@/components/DateRangeSubtitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useDateRange } from "@/contexts/DateRangeContext";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  Cell,
  ScatterChart,
  Scatter,
  ReferenceLine,
  LabelList,
} from "recharts";
import { TrendingUp, TrendingDown, Minus, Target, Sparkles, AlertTriangle, Calendar, Zap, ArrowRight, Users, PiggyBank } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useGuardrails } from "@/contexts/GuardrailContext";

// ───────── Competitor mock data ─────────
const competitors = [
  { name: "Britannia Bourbon 150g", organicRank: 6, organicDelta: -2, sponsoredRank: 3, sponsoredDelta: 1 },
  { name: "Sunfeast Dark Fantasy", organicRank: 4, organicDelta: 1, sponsoredRank: 5, sponsoredDelta: -2 },
];

// Low-ROAS / high-spend candidate campaigns to recommend reductions on
const reductionCandidates = [
  { name: "Marie Gold — Generic Search", spend: "₹48k/wk", roas: "1.4x", reduction: "30%" },
  { name: "Good Day — Broad Match", spend: "₹62k/wk", roas: "1.7x", reduction: "20%" },
];

const platformOptions = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"];
const skuOptions = ["Good Day Butter 200g", "Marie Gold 250g", "NutriChoice Digestive", "50-50 Maska Chaska 120g"];
const presets = ["7D", "30D", "90D"] as const;
type Preset = (typeof presets)[number];

const presetDays: Record<Preset, number> = { "7D": 7, "30D": 30, "90D": 90 };

// ───────── data generators ─────────
const generateRankSeries = (days: number) => {
  const arr: { day: string; rank: number; volume: number; paidPct: number; organicPct: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const wave = Math.sin(i / 4) * 3;
    const rank = Math.max(1, Math.round(8 + wave + (Math.random() * 2 - 1)));
    const baseVol = 2400 + Math.cos(i / 5) * 600 + Math.random() * 400;
    const volume = Math.round(baseVol);
    const paidPct = Math.round(35 + Math.sin(i / 6) * 12 + Math.random() * 6);
    return arr; // placeholder unreachable — actual push below
  }
  return arr;
};

// proper data
const buildRankSeries = (days: number) => {
  const today = new Date();
  return Array.from({ length: days }, (_, idx) => {
    const i = days - 1 - idx;
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const wave = Math.sin(i / 4) * 3;
    const rank = Math.max(1, Math.round(8 + wave + (Math.random() * 1.5 - 0.75)));
    const volume = Math.round(2400 + Math.cos(i / 5) * 600 + Math.random() * 400);
    const paidPct = Math.round(38 + Math.sin(i / 6) * 12);
    return {
      day: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rank,
      volume,
      paidPct,
      organicPct: 100 - paidPct,
    };
  });
};

const lagData = [
  { lag: "0d", correlation: 0.18 },
  { lag: "7d", correlation: 0.42 },
  { lag: "14d", correlation: 0.76 },
  { lag: "21d", correlation: 0.51 },
];

const scatterWeekly = Array.from({ length: 18 }, (_, i) => {
  const organic = 4 + Math.round(Math.random() * 16);
  const bestseller = Math.max(1, Math.round(organic * 0.55 + (Math.random() * 4 - 2)));
  return { organic, bestseller, week: `W${i + 1}` };
});
// trend line (linear regression approx)
const meanX = scatterWeekly.reduce((a, p) => a + p.organic, 0) / scatterWeekly.length;
const meanY = scatterWeekly.reduce((a, p) => a + p.bestseller, 0) / scatterWeekly.length;
const num = scatterWeekly.reduce((a, p) => a + (p.organic - meanX) * (p.bestseller - meanY), 0);
const den = scatterWeekly.reduce((a, p) => a + (p.organic - meanX) ** 2, 0);
const slope = num / den;
const intercept = meanY - slope * meanX;
const trendLine = [
  { organic: 4, bestseller: Math.max(1, slope * 4 + intercept) },
  { organic: 20, bestseller: Math.max(1, slope * 20 + intercept) },
];

// ───────── helpers ─────────
const fmtDate = (offsetDays: number) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

const rankColor = (delta: number) => {
  // delta negative = rank improvement (lower = better)
  if (delta < -1) return "hsl(140, 60%, 42%)";
  if (delta > 1) return "hsl(0, 70%, 55%)";
  return "hsl(220, 8%, 55%)";
};

// ───────── Competitor Rank Strip ─────────
const CompetitorRankStrip: React.FC = () => {
  const renderDelta = (delta: number) => {
    const color = rankColor(delta);
    const Icon = delta < 0 ? TrendingUp : delta > 0 ? TrendingDown : Minus;
    return (
      <span className="inline-flex items-center gap-1 font-mono text-[11px]" style={{ color }}>
        <Icon size={12} />
        {delta === 0 ? "flat" : `${Math.abs(delta)} pos`}
      </span>
    );
  };
  return (
    <PanelCard title="Competitor Keyword Rank" badge="Top 2 rivals" badgeColor="accent" delay={0.18}>
      <p className="text-[11px] text-muted-foreground mb-3">
        Average organic and sponsored rank across your tracked keywords for the selected window.
      </p>
      <div className="space-y-2">
        {competitors.map((c) => (
          <div key={c.name} className="grid grid-cols-12 items-center gap-3 py-2.5 px-3 rounded-lg border border-border bg-surface-1">
            <div className="col-span-5 flex items-center gap-2">
              <Users size={13} className="text-muted-foreground" />
              <span className="text-[12px] font-medium text-foreground">{c.name}</span>
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Organic</span>
              <span className="font-mono text-[12px] font-semibold text-foreground">#{c.organicRank}</span>
              {renderDelta(c.organicDelta)}
            </div>
            <div className="col-span-3 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Sponsored</span>
              <span className="font-mono text-[12px] font-semibold text-foreground">#{c.sponsoredRank}</span>
              {renderDelta(c.sponsoredDelta)}
            </div>
            <div className="col-span-1 text-right">
              {c.organicDelta < 0 || c.sponsoredDelta < 0 ? (
                <TrendingUp size={14} className="inline text-sw-green" />
              ) : c.organicDelta > 0 || c.sponsoredDelta > 0 ? (
                <TrendingDown size={14} className="inline text-sw-red" />
              ) : (
                <Minus size={14} className="inline text-muted-foreground" />
              )}
            </div>
          </div>
        ))}
      </div>
    </PanelCard>
  );
};

// ───────── Organic Momentum / Campaign Linkage Card ─────────
const OrganicMomentumCard: React.FC<{ organicGain: number }> = ({ organicGain }) => {
  const { navigateTo } = useGuardrails();
  if (organicGain < 2) return null;
  return (
    <div
      className="rounded-2xl p-5 border opacity-0 animate-fade-slide-in"
      style={{ animationDelay: "0.25s", background: "hsl(140,60%,96%)", borderColor: "hsl(140,60%,75%)" }}
    >
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(140,60%,42%, 0.18)" }}>
          <PiggyBank size={18} className="text-sw-green" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Organic momentum detected</p>
          <p className="text-sm text-foreground">
            Organic rank improved by <span className="font-semibold text-sw-green">{organicGain} positions</span>.
            Consider reducing spend on {reductionCandidates.length} low-ROAS campaigns to protect margin without losing rank.
          </p>
          <div className="mt-3 space-y-1.5">
            {reductionCandidates.map((c) => (
              <div key={c.name} className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-white border border-sw-green/20">
                <div className="flex-1">
                  <p className="text-[12px] font-medium text-foreground">{c.name}</p>
                  <p className="text-[10px] font-mono text-muted-foreground">{c.spend} · ROAS {c.roas}</p>
                </div>
                <span className="text-[11px] font-mono font-semibold text-sw-green">↓ {c.reduction}</span>
              </div>
            ))}
          </div>
          <Button
            size="sm"
            variant="outline"
            className="mt-3 h-8 text-[12px] border-sw-green/40 text-sw-green hover:bg-sw-green/10"
            onClick={() => navigateTo("campaigns")}
          >
            Review in Campaign Manager <ArrowRight size={12} className="ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};

// ───────── Overview Tab ─────────
const OverviewTab: React.FC<{ platform: string; sku: string }> = ({ platform, sku }) => {
  const [localPreset, setLocalPreset] = useState<Preset>("30D");
  const days = presetDays[localPreset];
  const data = useMemo(() => buildRankSeries(days), [days, platform, sku]);

  const insufficient = days < 30;
  const startRank = data[0]?.rank ?? 0;
  const endRank = data[data.length - 1]?.rank ?? 0;
  const rankDelta = endRank - startRank;
  const rankImproved = rankDelta < 0;
  const rankColorVal = rankColor(rankDelta);

  // rank movement following a "spend increase event" — pretend at 60% point
  const eventIdx = Math.floor(data.length * 0.6);
  const preEventRank = data[eventIdx - 1]?.rank ?? endRank;
  const postEventRank = data[data.length - 1]?.rank ?? endRank;
  const moved = preEventRank - postEventRank;
  const movedDays = data.length - eventIdx;

  return (
    <div className="space-y-5">
      <p className="text-[12px] text-foreground/80">
        Bestseller rank for <span className="font-semibold">{sku}</span> on <span className="font-semibold">{platform}</span>
        {" "}is currently <span className="font-mono font-semibold">#{endRank}</span>,
        {rankImproved ? " up " : rankDelta === 0 ? " flat " : " down "}
        {Math.abs(rankDelta)} positions vs start of period.
      </p>

      {/* Filter row */}
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-muted-foreground">Time window:</span>
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5">
          {presets.map((p) => (
            <button
              key={p}
              onClick={() => setLocalPreset(p)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
                localPreset === p ? "bg-surface-3 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {insufficient && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-sw-amber-dim border border-sw-amber/30">
          <AlertTriangle size={14} className="text-sw-amber flex-shrink-0" />
          <p className="text-[12px] text-foreground">
            <span className="font-semibold">Insufficient data:</span> Bestseller correlation requires a minimum 30-day window.
            Showing partial trend only.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KPICard
          title="Current Bestseller Rank"
          value={`#${endRank}`}
          delta={`${rankDelta <= 0 ? "▲" : "▼"} ${Math.abs(rankDelta)} pos`}
          deltaType={rankImproved ? "positive" : rankDelta === 0 ? "neutral" : "negative"}
          sub={rankImproved ? "Climbing in category leaderboard" : rankDelta === 0 ? "Holding steady" : "Slipping vs competitors"}
          accentColor="bg-primary"
          delay={0}
        />
        <KPICard
          title="Avg Daily Volume"
          value={`${Math.round(data.reduce((a, d) => a + d.volume, 0) / data.length).toLocaleString()}`}
          delta={`${Math.round(data.reduce((a, d) => a + d.paidPct, 0) / data.length)}% paid`}
          deltaType="neutral"
          sub="Units moved per day across window"
          accentColor="bg-sw-cyan"
          delay={0.05}
        />
        <KPICard
          title="Best Day"
          value={`${Math.max(...data.map((d) => d.volume)).toLocaleString()}`}
          delta="Peak"
          deltaType="positive"
          sub={`Highest single-day volume in ${localPreset}`}
          accentColor="bg-sw-green"
          delay={0.1}
        />
      </div>

      <PanelCard title="Bestseller Rank vs Sales Volume" badge={`${data.length} days`} badgeColor="accent" delay={0.15}>
        {data.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground text-sm">
            No data available for this selection.
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data} margin={{ top: 20, right: 50, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} stroke="hsl(220,10%,46%)" interval={Math.ceil(data.length / 10)} />
                <YAxis
                  yAxisId="rank"
                  reversed
                  domain={[1, "dataMax + 2"]}
                  tick={{ fontSize: 10 }}
                  stroke="hsl(270,60%,42%)"
                  label={{ value: "Rank (#1 top)", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(270,60%,42%)" }}
                />
                <YAxis
                  yAxisId="vol"
                  orientation="right"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(195,70%,45%)"
                  label={{ value: "Volume", angle: 90, position: "insideRight", fontSize: 10, fill: "hsl(195,70%,45%)" }}
                />
                <RTooltip
                  contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,15%,88%)", borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number, name: string, item: any) => {
                    if (name === "volume") {
                      const paid = item?.payload?.paidPct ?? 0;
                      return [`${value.toLocaleString()} units · ${paid}% paid / ${100 - paid}% organic`, "Volume"];
                    }
                    if (name === "rank") return [`#${value}`, "Rank"];
                    return [value, name];
                  }}
                />
                <Bar yAxisId="vol" dataKey="volume" fill="hsl(195,70%,45%)" opacity={0.5} radius={[3, 3, 0, 0]} barSize={Math.max(4, 220 / data.length)}>
                  {data.length <= 10 && (
                    <LabelList
                      dataKey="paidPct"
                      position="top"
                      content={(props: any) => {
                        const { x, y, width, value } = props;
                        if (value == null) return null;
                        return (
                          <text x={x + width / 2} y={y - 4} textAnchor="middle" fontSize={9} fill="hsl(220,10%,46%)" fontFamily="monospace">
                            {value}%P
                          </text>
                        );
                      }}
                    />
                  )}
                </Bar>
                <Line
                  yAxisId="rank"
                  type="monotone"
                  dataKey="rank"
                  stroke={rankColorVal}
                  strokeWidth={2.2}
                  dot={{ r: 2.5, fill: rankColorVal }}
                  activeDot={{ r: 5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
        <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="w-3 h-0.5 rounded" style={{ background: rankColorVal }} />Bestseller rank (inverted)</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-2 rounded" style={{ background: "hsl(195,70%,45%)", opacity: 0.5 }} />Sales volume</div>
          <div className="text-foreground/60">%P = paid share of volume</div>
        </div>
      </PanelCard>

      <div
        className="rounded-2xl p-5 border opacity-0 animate-fade-slide-in flex items-start gap-4"
        style={{
          animationDelay: "0.2s",
          background: rankImproved ? "hsl(140,60%,96%)" : moved < 0 ? "hsl(0,70%,97%)" : "hsl(220,15%,97%)",
          borderColor: rankImproved ? "hsl(140,60%,75%)" : moved < 0 ? "hsl(0,70%,80%)" : "hsl(220,15%,85%)",
        }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: rankColorVal + "22" }}
        >
          {moved > 0 ? <TrendingUp size={18} style={{ color: rankColorVal }} /> : moved < 0 ? <TrendingDown size={18} style={{ color: rankColorVal }} /> : <Minus size={18} style={{ color: rankColorVal }} />}
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Spend response insight</p>
          <p className="text-sm text-foreground">
            Rank moved <span className="font-semibold" style={{ color: rankColorVal }}>{Math.abs(moved)} position{Math.abs(moved) === 1 ? "" : "s"} {moved > 0 ? "up" : moved < 0 ? "down" : ""}</span> in the {movedDays} days following the last detected spend increase.
          </p>
        </div>
      </div>

      <CompetitorRankStrip />
      <OrganicMomentumCard organicGain={Math.max(0, moved)} />
    </div>
  );
};

// ───────── Analytics Tab ─────────
const HeatmapCell: React.FC<{ value: number; isStrongest: boolean }> = ({ value, isStrongest }) => {
  const intensity = Math.min(1, Math.abs(value));
  const bg = `hsl(270, 60%, ${100 - intensity * 55}%)`;
  return (
    <div
      className="relative rounded-lg flex flex-col items-center justify-center h-20 transition-all"
      style={{
        background: bg,
        border: isStrongest ? "2px solid hsl(140, 60%, 42%)" : "1px solid hsl(220,15%,90%)",
        boxShadow: isStrongest ? "0 0 0 3px hsl(140, 60%, 42%, 0.15)" : "none",
      }}
    >
      <span className="font-mono text-lg font-bold" style={{ color: intensity > 0.5 ? "white" : "hsl(220,20%,15%)" }}>
        {value.toFixed(2)}
      </span>
      {isStrongest && (
        <span className="absolute -top-2 right-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-sw-green text-white">
          STRONGEST
        </span>
      )}
    </div>
  );
};

const AnalyticsTab: React.FC<{ platform: string; sku: string }> = ({ platform, sku }) => {
  const [targetRank, setTargetRank] = useState(3);
  const [organicThreshold, setOrganicThreshold] = useState(5);
  const strongest = lagData.reduce((m, d) => (d.correlation > m.correlation ? d : m), lagData[0]);
  const strongestLagDays = parseInt(strongest.lag);

  // scenarios: required volume range based on target rank
  const baseVolume = 2400;
  const rankFactor = Math.max(0.4, 1 - (targetRank - 1) * 0.12);
  const required = {
    conservative: Math.round(baseVolume / rankFactor * 1.15),
    base: Math.round(baseVolume / rankFactor),
    aggressive: Math.round(baseVolume / rankFactor * 0.85),
  };

  const startDate = fmtDate(0);
  const targetDate = fmtDate(strongestLagDays);

  return (
    <div className="space-y-5">
      <p className="text-[12px] text-foreground/80">
        Paid volume influences bestseller rank for <span className="font-semibold">{sku}</span> most strongly at a{" "}
        <span className="font-semibold">{strongest.lag}</span> lag (correlation {strongest.correlation.toFixed(2)}).
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <PanelCard title="Paid Volume → Rank Correlation by Lag" badge="14d strongest" badgeColor="green" delay={0}>
          {/* Header row with lag labels */}
          <div className="grid gap-3 mb-2" style={{ gridTemplateColumns: "180px repeat(4, 1fr)" }}>
            <div />
            {lagData.map((d) => (
              <p key={d.lag} className="text-center text-[10px] font-mono text-muted-foreground uppercase tracking-wider">{d.lag} lag</p>
            ))}
          </div>
          {/* Our paid volume row */}
          <div className="grid gap-3 mb-2 items-center" style={{ gridTemplateColumns: "180px repeat(4, 1fr)" }}>
            <p className="text-[11px] font-medium text-foreground">Our paid volume → rank</p>
            {lagData.map((d) => (
              <HeatmapCell key={d.lag} value={d.correlation} isStrongest={d.lag === strongest.lag} />
            ))}
          </div>
          {/* Competitor A organic */}
          <div className="grid gap-3 mb-2 items-center" style={{ gridTemplateColumns: "180px repeat(4, 1fr)" }}>
            <p className="text-[11px] font-medium text-foreground">Competitor A organic rank</p>
            {[0.22, 0.48, 0.61, 0.39].map((v, i) => (
              <HeatmapCell key={i} value={v} isStrongest={false} />
            ))}
          </div>
          {/* Competitor B sponsored */}
          <div className="grid gap-3 mb-2 items-center" style={{ gridTemplateColumns: "180px repeat(4, 1fr)" }}>
            <p className="text-[11px] font-medium text-foreground">Competitor B sponsored rank</p>
            {[0.31, 0.55, 0.44, 0.28].map((v, i) => (
              <HeatmapCell key={i} value={v} isStrongest={false} />
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Higher value = stronger relationship. Competitor rows show whether their keyword shifts predict your bestseller movement.
          </p>
        </PanelCard>

        <PanelCard title="Organic Rank vs Bestseller Rank (weekly)" badge={`${scatterWeekly.length} weeks`} badgeColor="accent" delay={0.05}>
          <div className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 20, bottom: 30, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,90%)" />
                <XAxis
                  type="number"
                  dataKey="organic"
                  name="Organic Rank"
                  tick={{ fontSize: 10 }}
                  stroke="hsl(220,10%,46%)"
                  label={{ value: "Organic Rank →", position: "insideBottom", offset: -10, fontSize: 10, fill: "hsl(220,10%,46%)" }}
                  domain={[0, 22]}
                />
                <YAxis
                  type="number"
                  dataKey="bestseller"
                  name="Bestseller Rank"
                  reversed
                  tick={{ fontSize: 10 }}
                  stroke="hsl(220,10%,46%)"
                  label={{ value: "Bestseller Rank ↑", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(220,10%,46%)" }}
                  domain={[1, "dataMax + 2"]}
                />
                <RTooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={{ background: "white", border: "1px solid hsl(220,15%,88%)", borderRadius: 8, fontSize: 11 }}
                  formatter={(value: number, name: string) => [`#${value}`, name]}
                />
                <Scatter data={scatterWeekly} fill="hsl(270,60%,42%)" />
                <Line
                  data={trendLine}
                  type="linear"
                  dataKey="bestseller"
                  stroke="hsl(140,60%,42%)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                  activeDot={false}
                  legendType="none"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[11px] text-muted-foreground mt-2">
            Each dot = 1 week. Trend line slope: {slope.toFixed(2)} → organic rank improvements predict bestseller gains.
          </p>
        </PanelCard>
      </div>

      <div
        className="rounded-2xl p-5 border opacity-0 animate-fade-slide-in flex items-start gap-4"
        style={{ animationDelay: "0.1s", background: "hsl(270,60%,97%)", borderColor: "hsl(270,60%,80%)" }}
      >
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "hsl(270,60%,42%, 0.15)" }}>
          <Sparkles size={18} className="text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Implication</p>
          <p className="text-sm text-foreground">
            Rank responds strongest at a <span className="font-semibold">{strongest.lag} lag</span>. To hit your target rank by{" "}
            <span className="font-semibold">{targetDate}</span>, start the paid push by{" "}
            <span className="font-semibold text-primary">{startDate}</span>.
          </p>
        </div>
      </div>

      <PanelCard title="Target Rank Planner" badge="Scenario" badgeColor="purple" delay={0.15}>
        <div className="flex items-center gap-4 mb-5">
          <div className="flex items-center gap-2">
            <Target size={14} className="text-primary" />
            <label htmlFor="target-rank" className="text-[12px] text-foreground font-medium">Target bestseller rank:</label>
          </div>
          <Select value={String(targetRank)} onValueChange={(v) => setTargetRank(Number(v))}>
            <SelectTrigger className="w-[120px] h-8 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 5, 7, 10].map((n) => (
                <SelectItem key={n} value={String(n)}>#{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-[11px] text-muted-foreground">Required daily volume range, by scenario:</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { key: "conservative", label: "Conservative", color: "hsl(195,70%,45%)", desc: "Lower risk, slower climb", val: required.conservative },
            { key: "base", label: "Base", color: "hsl(270,60%,42%)", desc: "Most likely required volume", val: required.base },
            { key: "aggressive", label: "Aggressive", color: "hsl(140,60%,42%)", desc: "Faster climb, higher spend", val: required.aggressive },
          ].map((s, i) => (
            <div
              key={s.key}
              className="rounded-xl p-4 border opacity-0 animate-fade-slide-in"
              style={{ animationDelay: `${0.2 + i * 0.05}s`, borderColor: s.color + "55", background: s.color + "0F" }}
            >
              <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
              <p className="font-display font-bold text-2xl text-foreground mt-1">
                {s.val.toLocaleString()} <span className="text-[11px] font-mono text-muted-foreground font-normal">units/day</span>
              </p>
              <p className="text-[11px] text-muted-foreground mt-1.5">{s.desc}</p>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                <Calendar size={10} />
                <span>Start by {startDate} → hit by {targetDate}</span>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Organic-vs-Paid Spend Efficiency */}
      {(() => {
        // savings band: stronger threshold (lower rank) → more savings possible
        const inverseFactor = Math.max(0.05, (11 - organicThreshold) / 10);
        const savings = {
          conservative: Math.round(15 * inverseFactor),
          base: Math.round(28 * inverseFactor),
          aggressive: Math.round(42 * inverseFactor),
        };
        return (
          <PanelCard title="Organic-vs-Paid Spend Efficiency" badge="Savings planner" badgeColor="green" delay={0.2}>
            <p className="text-[12px] text-foreground/80 mb-4">
              When organic rank is in <span className="font-semibold">top {organicThreshold}</span>, paid contribution can drop without losing bestseller position.
            </p>
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-2 min-w-[180px]">
                <Target size={14} className="text-sw-green" />
                <label className="text-[12px] text-foreground font-medium">Organic rank threshold:</label>
              </div>
              <div className="flex-1 max-w-xs">
                <Slider
                  value={[organicThreshold]}
                  onValueChange={(v) => setOrganicThreshold(v[0])}
                  min={1}
                  max={10}
                  step={1}
                />
              </div>
              <span className="font-mono text-[13px] font-semibold text-foreground min-w-[40px]">#{organicThreshold}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "conservative", label: "Conservative", color: "hsl(195,70%,45%)", desc: "Safe reduction, minimal rank risk", val: savings.conservative },
                { key: "base", label: "Base", color: "hsl(140,60%,42%)", desc: "Balanced spend cut", val: savings.base },
                { key: "aggressive", label: "Aggressive", color: "hsl(270,60%,42%)", desc: "Maximum savings, monitor closely", val: savings.aggressive },
              ].map((s, i) => (
                <div
                  key={s.key}
                  className="rounded-xl p-4 border opacity-0 animate-fade-slide-in"
                  style={{ animationDelay: `${0.25 + i * 0.05}s`, borderColor: s.color + "55", background: s.color + "0F" }}
                >
                  <p className="text-[11px] font-mono uppercase tracking-wider" style={{ color: s.color }}>{s.label}</p>
                  <p className="font-display font-bold text-2xl text-foreground mt-1">
                    ↓ {s.val}% <span className="text-[11px] font-mono text-muted-foreground font-normal">paid spend</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground mt-1.5">{s.desc}</p>
                </div>
              ))}
            </div>
          </PanelCard>
        );
      })()}
    </div>
  );
};

// ───────── Main view ─────────
const BestsellerIntelligenceView: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");
  const [platform, setPlatform] = useState(platformOptions[0]);
  const [sku, setSku] = useState(skuOptions[0]);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Bestseller Intelligence</h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Track bestseller rank movement and quantify how paid volume drives organic position over time.
          </p>
          <DateRangeSubtitle className="mt-1" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={sku} onValueChange={setSku}>
            <SelectTrigger className="w-[200px] h-8 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {skuOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger className="w-[140px] h-8 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {platformOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScreenTabs activeTab={activeTab} onTabChange={setActiveTab} tab1Label="Overview" tab2Label="Analytics" />

      {activeTab === "overview" ? (
        <OverviewTab platform={platform} sku={sku} />
      ) : (
        <AnalyticsTab platform={platform} sku={sku} />
      )}
    </div>
  );
};

export default BestsellerIntelligenceView;
