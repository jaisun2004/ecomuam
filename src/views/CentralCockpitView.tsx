import React, { useState, useMemo } from "react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import {
  Gauge,
  RefreshCw,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Search,
  Megaphone,
  Package,
  Tag,
  Target,
  Sparkles,
  BarChart3,
  ShieldAlert,
} from "lucide-react";

type Severity = "critical" | "warning" | "ok";

type KpiFlag = {
  label: string;
  value: string;
  delta?: string;
  severity: Severity;
  note?: string;
};

type ScreenFlag = {
  id: string;
  desc: string;
  severity: Severity;
  target?: string;
};

type ScreenPanel = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  routeId: string;
  kpis: KpiFlag[];
  flags: ScreenFlag[];
};

type CampaignFlag = {
  id: string;
  campaign: string;
  platform: string;
  severity: Severity;
  issues: string[];
  metric: string;
  routeId: string;
  target?: string;
};

const PANELS: ScreenPanel[] = [
  {
    id: "availability",
    name: "Availability",
    icon: Package,
    routeId: "availability",
    kpis: [
      { label: "In-Stock %", value: "68%", delta: "-4%", severity: "critical", note: "Below 75% floor" },
      { label: "OOS SKUs", value: "14", delta: "+5", severity: "critical" },
      { label: "Dark Stores Affected", value: "37", severity: "warning" },
    ],
    flags: [
      { id: "a1", desc: "Parle-G 250g — OOS on Blinkit (Mumbai, Pune)", severity: "critical", target: "avail-dedup-banner" },
      { id: "a2", desc: "Hide & Seek 120g — Low stock on Zepto Bangalore", severity: "warning" },
      { id: "a3", desc: "4 campaigns auto-paused due to availability < 20%", severity: "critical" },
    ],
  },
  {
    id: "campaigns",
    name: "Campaign Manager",
    icon: Megaphone,
    routeId: "campaigns",
    kpis: [
      { label: "ROAS", value: "4.2x", delta: "+0.3x", severity: "ok" },
      { label: "Spend Pacing", value: "112%", delta: "+12%", severity: "warning", note: "Overpacing vs plan" },
      { label: "Active Campaigns", value: "48", severity: "ok" },
    ],
    flags: [
      { id: "c1", desc: "Budget exhausted — Parle-G Brand Search", severity: "critical", target: "campaign-conflict-banner" },
      { id: "c2", desc: "Daypart shift projected +18% conversion", severity: "warning", target: "campaign-digest" },
    ],
  },
  {
    id: "budget",
    name: "Budget Optimiser",
    icon: BarChart3,
    routeId: "budget",
    kpis: [
      { label: "Reallocation Opp.", value: "₹ 50K", severity: "warning" },
      { label: "Wasted Spend (7d)", value: "₹ 18K", delta: "+₹4K", severity: "warning" },
      { label: "Guardrail Status", value: "Green", severity: "ok" },
    ],
    flags: [
      { id: "b1", desc: "Shift ₹ 50K from Hide & Seek Blinkit → Parle-G Zepto", severity: "warning" },
    ],
  },
  {
    id: "competitors",
    name: "Competitor Ads",
    icon: Target,
    routeId: "competitors",
    kpis: [
      { label: "Share of Voice", value: "48%", delta: "+2%", severity: "ok" },
      { label: "Competitor Spend Index", value: "1.4x", delta: "+0.3x", severity: "warning" },
      { label: "Brand Defense", value: "12 kws", severity: "critical" },
    ],
    flags: [
      { id: "co1", desc: "Britannia bidding on 12 of our brand keywords", severity: "critical", target: "defense-insight" },
      { id: "co2", desc: "Competitor activity up 40% WoW", severity: "warning" },
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    icon: Tag,
    routeId: "pricing",
    kpis: [
      { label: "Price Index vs Comp", value: "1.08", severity: "warning", note: "8% above shelf" },
      { label: "SKUs Off-Match", value: "6", severity: "warning" },
      { label: "Margin Health", value: "Stable", severity: "ok" },
    ],
    flags: [
      { id: "p1", desc: "Parle-G 250g priced 12% above Britannia Tiger on Blinkit", severity: "warning" },
    ],
  },
  {
    id: "shelf",
    name: "Share of Shelf",
    icon: Search,
    routeId: "shelf",
    kpis: [
      { label: "Share of Shelf", value: "32%", delta: "-3%", severity: "warning" },
      { label: "Avg Rank (Top kws)", value: "4.8", delta: "+0.6", severity: "warning" },
      { label: "New Keywords", value: "8", severity: "ok" },
    ],
    flags: [
      { id: "s1", desc: "Rank dropped on 'glucose biscuit' (3 → 7) on Zepto", severity: "warning" },
    ],
  },
  {
    id: "content",
    name: "Content Audit",
    icon: Sparkles,
    routeId: "content",
    kpis: [
      { label: "Content Score", value: "74/100", delta: "-5", severity: "warning" },
      { label: "SKUs Below 70", value: "11", severity: "warning" },
      { label: "Missing A+ Content", value: "5", severity: "warning" },
    ],
    flags: [
      { id: "ct1", desc: "Hide & Seek 120g — title missing pack size on Instamart", severity: "warning" },
    ],
  },
  {
    id: "guardrails",
    name: "Guardrails",
    icon: ShieldAlert,
    routeId: "guardrails",
    kpis: [
      { label: "Active Rules", value: "23", severity: "ok" },
      { label: "Blocks Last 24h", value: "4", severity: "warning" },
      { label: "Seasonal Lock", value: "2d", severity: "warning", note: "Activates soon" },
    ],
    flags: [
      { id: "g1", desc: "Rule Engine fired, velocity limit blocked action", severity: "warning" },
      { id: "g2", desc: "Seasonal lock activates in 2 days", severity: "warning" },
    ],
  },
];

const CAMPAIGN_FLAGS: CampaignFlag[] = [
  {
    id: "cf1",
    campaign: "Parle-G — Brand Defense Blinkit",
    platform: "Blinkit",
    severity: "critical",
    issues: ["Budget exhausted", "Competitor bid intrusion"],
    metric: "ROAS 5.1x · Spend ₹ 1.2L / ₹ 1.2L",
    routeId: "campaigns",
  },
  {
    id: "cf2",
    campaign: "Hide & Seek 120g — Always-On Zepto",
    platform: "Zepto",
    severity: "critical",
    issues: ["Underpacing", "Low bids"],
    metric: "ROAS 2.8x · Spend ₹ 38K / ₹ 75K",
    routeId: "campaigns",
  },
  {
    id: "cf3",
    campaign: "Parle-G 250g — Category Push Instamart",
    platform: "Instamart",
    severity: "warning",
    issues: ["OOS risk (3 cities)"],
    metric: "ROAS 3.6x · Spend ₹ 22K / ₹ 40K",
    routeId: "campaigns",
  },
  {
    id: "cf4",
    campaign: "Krackjack — Discovery BigBasket",
    platform: "BigBasket",
    severity: "warning",
    issues: ["Wasted spend on 14 keywords"],
    metric: "ROAS 2.1x · Spend ₹ 31K / ₹ 50K",
    routeId: "campaigns",
  },
  {
    id: "cf5",
    campaign: "Hide & Seek Fab — Brand Awareness Blinkit",
    platform: "Blinkit",
    severity: "warning",
    issues: ["Weak geo (Delhi NCR)", "CTR drop"],
    metric: "ROAS 3.2x · Spend ₹ 18K / ₹ 30K",
    routeId: "campaigns",
  },
];

const sevColor = (s: Severity) =>
  s === "critical" ? "#FF5C5C" : s === "warning" ? "#F5A623" : "#2ECF8E";

const sevLabel = (s: Severity) =>
  s === "critical" ? "Critical" : s === "warning" ? "Watch" : "OK";

const CentralCockpitView: React.FC = () => {
  const g = useGuardrails();
  const [expanded, setExpanded] = useState<Set<string>>(
    new Set(PANELS.filter(p => p.flags.some(f => f.severity === "critical")).map(p => p.id))
  );
  const [filter, setFilter] = useState<"all" | "critical" | "warning">("all");

  const toggle = (id: string) =>
    setExpanded(prev => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });

  const summary = useMemo(() => {
    let critical = 0,
      warning = 0,
      ok = 0;
    PANELS.forEach(p => {
      const top = p.kpis.find(k => k.severity === "critical")
        ? "critical"
        : p.kpis.find(k => k.severity === "warning") || p.flags.length
        ? "warning"
        : "ok";
      if (top === "critical") critical++;
      else if (top === "warning") warning++;
      else ok++;
    });
    const campCrit = CAMPAIGN_FLAGS.filter(c => c.severity === "critical").length;
    const campWarn = CAMPAIGN_FLAGS.filter(c => c.severity === "warning").length;
    return { critical, warning, ok, campCrit, campWarn };
  }, []);

  const filteredPanels = PANELS.filter(p => {
    if (filter === "all") return true;
    const has = p.flags.some(f => f.severity === filter) || p.kpis.some(k => k.severity === filter);
    return has;
  });

  const filteredCampaigns = CAMPAIGN_FLAGS.filter(c => filter === "all" || c.severity === filter);

  return (
    <div className="space-y-6 pb-20 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Gauge size={20} className="text-primary" /> Central Cockpit
          </h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            KPIs and flags at a glance — click any area to drill in
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-[11px]">Updated 4 min ago</span>
          <RefreshCw size={13} className="cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <SummaryTile
          label="Critical"
          value={summary.critical}
          color="#FF5C5C"
          active={filter === "critical"}
          onClick={() => setFilter(filter === "critical" ? "all" : "critical")}
        />
        <SummaryTile
          label="Watch"
          value={summary.warning}
          color="#F5A623"
          active={filter === "warning"}
          onClick={() => setFilter(filter === "warning" ? "all" : "warning")}
        />
        <SummaryTile label="Clear" value={summary.ok} color="#2ECF8E" />
        <SummaryTile
          label="Flagged Campaigns"
          value={summary.campCrit + summary.campWarn}
          color="#4F7FFF"
          sub={`${summary.campCrit} critical · ${summary.campWarn} watch`}
        />
      </div>

      {filter !== "all" && (
        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-muted-foreground">Filtering: {sevLabel(filter)} only</span>
          <button onClick={() => setFilter("all")} className="text-[11px] font-medium" style={{ color: "#4F7FFF" }}>
            Clear filter
          </button>
        </div>
      )}

      {/* Area panels */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-sm font-semibold text-foreground">KPIs & Flags</h2>
          <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {filteredPanels.length} of {PANELS.length}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredPanels.map(p => {
            const Icon = p.icon;
            const worst: Severity = p.flags.some(f => f.severity === "critical") || p.kpis.some(k => k.severity === "critical")
              ? "critical"
              : p.flags.some(f => f.severity === "warning") || p.kpis.some(k => k.severity === "warning")
              ? "warning"
              : "ok";
            const isOpen = expanded.has(p.id);
            const flagCount = p.flags.length;
            return (
              <div
                key={p.id}
                className="rounded-xl border border-subtle bg-surface-1 overflow-hidden"
                style={{ borderLeft: `3px solid ${sevColor(worst)}` }}
              >
                <button
                  onClick={() => g.navigateTo(p.routeId)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
                >
                  <Icon size={16} className="text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-foreground truncate">{p.name}</span>
                      <span
                        className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ backgroundColor: `${sevColor(worst)}15`, color: sevColor(worst) }}
                      >
                        {sevLabel(worst)}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {flagCount > 0 ? `${flagCount} flag${flagCount > 1 ? "s" : ""}` : "No flags"} · {p.kpis.length} KPIs
                    </p>
                  </div>
                  <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
                </button>

                {/* KPIs */}
                <div className="px-4 pb-3 grid grid-cols-3 gap-2">
                  {p.kpis.map(k => (
                    <div
                      key={k.label}
                      className="rounded-lg border border-subtle px-2 py-2"
                      style={{ borderColor: k.severity !== "ok" ? `${sevColor(k.severity)}40` : undefined }}
                    >
                      <div className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sevColor(k.severity) }} />
                        <p className="text-[10px] text-muted-foreground truncate">{k.label}</p>
                      </div>
                      <p className="text-[13px] font-semibold text-foreground mt-1 font-mono">{k.value}</p>
                      {k.delta && (
                        <p
                          className="text-[10px] font-mono flex items-center gap-0.5"
                          style={{ color: k.delta.startsWith("-") ? "#FF5C5C" : "#2ECF8E" }}
                        >
                          {k.delta.startsWith("-") ? <TrendingDown size={9} /> : <TrendingUp size={9} />}
                          {k.delta}
                        </p>
                      )}
                      {k.note && <p className="text-[9px] text-muted-foreground mt-0.5 truncate">{k.note}</p>}
                    </div>
                  ))}
                </div>

                {/* Flags expand */}
                {flagCount > 0 && (
                  <>
                    <button
                      onClick={() => toggle(p.id)}
                      className="w-full px-4 py-2 border-t border-subtle/60 flex items-center justify-between text-[11px] text-muted-foreground hover:bg-muted/30"
                    >
                      <span className="flex items-center gap-1.5">
                        <AlertTriangle size={11} style={{ color: sevColor(worst) }} />
                        View flags
                      </span>
                      {isOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                    </button>
                    {isOpen && (
                      <div className="divide-y divide-subtle/50 border-t border-subtle/60">
                        {p.flags.map(f => (
                          <div key={f.id} className="px-4 py-2.5 flex items-center gap-2">
                            <span
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{ backgroundColor: sevColor(f.severity) }}
                            />
                            <span className="text-[12px] flex-1" style={{ color: "hsl(220,20%,15%)" }}>
                              {f.desc}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Campaign-level flags */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-foreground">Campaign-Level Flags</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Campaigns with active issues — jump straight into Campaign Manager
            </p>
          </div>
          <button
            onClick={() => g.navigateTo("campaigns")}
            className="text-[11px] font-medium flex items-center gap-1"
            style={{ color: "#4F7FFF" }}
          >
            Open Campaign Manager <ArrowRight size={11} />
          </button>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden divide-y divide-subtle/50">
          {filteredCampaigns.length === 0 ? (
            <div className="px-4 py-6 text-center text-[12px] text-muted-foreground">No campaign flags at this filter</div>
          ) : (
            filteredCampaigns.map(c => (
              <div
                key={c.id}
                className="px-4 py-3 flex items-center gap-3"
                style={{ borderLeft: `3px solid ${sevColor(c.severity)}` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-semibold text-foreground truncate">{c.campaign}</span>
                    <span
                      className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: `${sevColor(c.severity)}15`, color: sevColor(c.severity) }}
                    >
                      {sevLabel(c.severity)}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-subtle text-muted-foreground">
                      {c.platform}
                    </span>
                  </div>
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">{c.metric}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {c.issues.map(iss => (
                      <span
                        key={iss}
                        className="text-[10px] px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: `${sevColor(c.severity)}12`, color: sevColor(c.severity) }}
                      >
                        {iss}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => g.navigateTo(c.routeId, c.target)}
                  className="text-[11px] font-medium flex items-center gap-1 flex-shrink-0"
                  style={{ color: "#4F7FFF" }}
                >
                  Act <ArrowRight size={11} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const SummaryTile: React.FC<{
  label: string;
  value: number;
  color: string;
  sub?: string;
  active?: boolean;
  onClick?: () => void;
}> = ({ label, value, color, sub, active, onClick }) => (
  <button
    onClick={onClick}
    disabled={!onClick}
    className={`rounded-xl border bg-surface-1 px-4 py-3 text-left transition-all ${
      onClick ? "hover:border-foreground/30 cursor-pointer" : "cursor-default"
    } ${active ? "ring-2 ring-offset-1" : ""}`}
    style={{
      borderColor: active ? color : undefined,
      ["--tw-ring-color" as any]: active ? color : undefined,
    }}
  >
    <div className="flex items-center gap-2">
      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
      <p className="text-[11px] text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-bold font-mono mt-1" style={{ color }}>
      {value}
    </p>
    {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
  </button>
);

export default CentralCockpitView;
