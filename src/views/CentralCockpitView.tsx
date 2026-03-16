import React, { useState } from "react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { Gauge, ArrowRight, Shield, AlertTriangle, Swords, TrendingUp, DollarSign, Clock, CheckCircle2 } from "lucide-react";
import ScreenTabs from "@/components/ScreenTabs";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const formatDate = () => {
  return new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
};

const feedItems = [
  { id: 1, time: "09:42 AM", screen: "Availability", screenColor: "hsl(var(--sw-red))", desc: "Stock < 20% detected for Creatine on Flipkart — Tier 1 hard stop fired", tier: "T1", tierColor: "#FF5C5C", tierBg: "rgba(255,92,92,0.12)", actionable: false, handled: true },
  { id: 2, time: "09:38 AM", screen: "Campaign Manager", screenColor: "hsl(var(--primary))", desc: "Defense bid increase queued for Whey Protein — Sponsored", tier: "T1", tierColor: "#FF5C5C", tierBg: "rgba(255,92,92,0.12)", actionable: false, handled: false },
  { id: 3, time: "09:15 AM", screen: "Competitor Hub", screenColor: "hsl(var(--sw-amber))", desc: "MuscleBlaze increased spend +45% MoM — defense action recommended", tier: "T2", tierColor: "#F5A623", tierBg: "rgba(245,166,35,0.12)", actionable: true, handled: false },
  { id: 4, time: "08:52 AM", screen: "Budget Optimiser", screenColor: "hsl(var(--sw-purple))", desc: "Budget reallocation opportunity: shift ₹50K from Creatine to Whey", tier: "T3", tierColor: "#2ECF8E", tierBg: "rgba(46,207,142,0.12)", actionable: true, handled: false },
  { id: 5, time: "08:30 AM", screen: "Campaign Manager", screenColor: "hsl(var(--primary))", desc: "Daypart budget shift for Q-Commerce Launch Push — +18% conversion projected", tier: "T3", tierColor: "#2ECF8E", tierBg: "rgba(46,207,142,0.12)", actionable: true, handled: false },
  { id: 6, time: "08:10 AM", screen: "Pricing", screenColor: "hsl(var(--sw-cyan))", desc: "MuscleBlaze undercut Creatine 250g by 14% on Amazon", tier: "Blocked", tierColor: "#555A6E", tierBg: "rgba(85,90,110,0.12)", actionable: false, handled: false },
];

const approvalItems = [
  { id: 1, campaign: "BCAA Brand Awareness", insight: "Bid optimisation", confidence: 3, metric: "+0.8x ROAS", screen: "campaigns" },
  { id: 2, campaign: "Pre-Workout New Users", insight: "Keyword expansion", confidence: 2, metric: "+12K Imp", screen: "campaigns" },
];

const screenStatuses = [
  { name: "Campaign Manager", id: "campaigns", status: "2 issues", dot: "#FF5C5C" },
  { name: "Availability", id: "availability", status: "Tier 1 active", dot: "#FF5C5C" },
  { name: "Pricing", id: "pricing", status: "Clear", dot: "#2ECF8E" },
  { name: "Competitor Ads Hub", id: "competitors", status: "1 issue", dot: "#F5A623" },
  { name: "Budget Optimiser", id: "budget", status: "Clear", dot: "#2ECF8E" },
  { name: "Festival Campaigns", id: "festival", status: "Clear", dot: "#2ECF8E" },
];

const quickStats = [
  { label: "Active Campaigns", value: "12", ring: "hsl(var(--sw-purple))", delta: null },
  { label: "Avg ROAS Today", value: "4.2x", ring: "hsl(var(--sw-green))", delta: "+0.3x vs yesterday" },
  { label: "Total Spend Today", value: "₹1.8L", ring: "hsl(var(--sw-amber))", delta: null },
  { label: "Pending Actions", value: "5", ring: "hsl(var(--sw-amber))", delta: null },
];

// Analytics mock data
const actionTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  applied: Math.floor(Math.random() * 8 + 2),
  blocked: Math.floor(Math.random() * 3),
  dismissed: Math.floor(Math.random() * 4),
}));

const screenActivity = [
  { name: "Campaign Mgr", actions: 42 },
  { name: "Availability", actions: 18 },
  { name: "Competitor Hub", actions: 24 },
  { name: "Budget Opt", actions: 15 },
  { name: "Pricing", actions: 9 },
  { name: "Festival", actions: 6 },
];

const CentralCockpitView: React.FC = () => {
  const g = useGuardrails();
  const [tab, setTab] = useState("overview");
  const [feedActions, setFeedActions] = useState<Record<number, boolean>>({});

  const hasIssues = g.hasActiveTier1();
  const tier1Count = g.hardStops.filter(r => r.enabled && r.lastTriggered).length;
  const tier2Count = g.strategicLocks.filter(l => l.enabled).length;

  const confidencePips = (level: number) => {
    const colors = level >= 4 ? "#2ECF8E" : level === 3 ? "#F5A623" : "#555A6E";
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < level ? colors : "#333" }}>●</span>
    ));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Gauge size={20} className="text-primary" /> Central Cockpit
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate()} · {getGreeting()} · {tier1Count > 0 ? `${tier1Count} Tier 1 stops active · ` : ""}{approvalItems.length + 3} actions need your approval
        </p>
      </div>

      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (
        <div className="grid grid-cols-12 gap-5">
          {/* Left column — 65% */}
          <div className="col-span-8 space-y-5">
            {/* Live Feed */}
            <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-subtle">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  Live feed
                  <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: hasIssues ? "#FF5C5C" : "#2ECF8E" }} />
                </h3>
              </div>
              <div className="divide-y divide-subtle/50">
                {feedItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 px-4 py-3" style={{ borderLeft: `3px solid ${item.tierColor}` }}>
                    <span className="font-mono text-[10px] text-muted-foreground flex-shrink-0 w-16">{item.time}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(79,127,255,0.1)", color: item.screenColor }}>
                      {item.screen}
                    </span>
                    <span className="text-[12px] text-foreground flex-1 min-w-0 truncate">{item.desc}</span>
                    <span className="font-mono text-[9px] uppercase px-2 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: item.tierBg, color: item.tierColor, letterSpacing: "0.08em" }}>
                      {item.tier}
                    </span>
                    {item.handled ? (
                      <span className="font-mono text-[9px] px-2 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(85,90,110,0.15)", color: "#8B8FA8" }}>
                        Handled
                      </span>
                    ) : item.actionable ? (
                      <button
                        onClick={() => setFeedActions(p => ({ ...p, [item.id]: true }))}
                        className="px-2 py-1 rounded-lg text-[10px] font-medium flex-shrink-0"
                        style={feedActions[item.id] ? { backgroundColor: "rgba(46,207,142,0.12)", color: "#2ECF8E" } : { backgroundColor: "rgba(167,139,250,0.15)", color: "#A78BFA" }}
                      >
                        {feedActions[item.id] ? "✓ Done" : "Act"}
                      </button>
                    ) : null}
                    <button onClick={() => g.navigateTo(item.screen === "Campaign Manager" ? "campaigns" : item.screen === "Availability" ? "availability" : item.screen === "Competitor Hub" ? "competitors" : item.screen === "Budget Optimiser" ? "budget" : "pricing")}
                      className="text-muted-foreground hover:text-foreground flex-shrink-0">
                      <ArrowRight size={12} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 border-t border-subtle">
                <span className="text-[9px] text-muted-foreground font-mono">Last refreshed: just now</span>
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
              <div className="p-4 flex items-center justify-between border-b border-subtle">
                <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                  Needs your approval
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#A78BFA" }}>
                    {approvalItems.length}
                  </span>
                </h3>
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                  Approve all safe
                </button>
              </div>
              {approvalItems.length === 0 ? (
                <div className="p-8 text-center">
                  <CheckCircle2 size={24} className="text-muted-foreground mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground">All clear — no pending approvals</p>
                </div>
              ) : (
                <div className="divide-y divide-subtle/50">
                  {approvalItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-foreground">{item.campaign}</span>
                        <span className="text-[11px] text-muted-foreground ml-2">· {item.insight}</span>
                      </div>
                      <span className="text-[10px] flex gap-0.5 flex-shrink-0">{confidencePips(item.confidence)}</span>
                      <span className="font-mono text-[11px] text-foreground flex-shrink-0">{item.metric}</span>
                      <button className="px-2 py-1 rounded-lg text-[10px] font-medium border flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8FA8" }}>
                        Review
                      </button>
                      <button onClick={() => g.navigateTo(item.screen)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column — 35% */}
          <div className="col-span-4 space-y-5">
            {/* System Status */}
            <div className="rounded-xl border border-subtle bg-surface-1 p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">System status</h3>
              <div className="space-y-2">
                {screenStatuses.map((s) => (
                  <div key={s.name} className="flex items-center justify-between py-1.5">
                    <span className="text-xs text-foreground">{s.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }} />
                      <span className="text-[10px] font-mono text-muted-foreground">{s.status}</span>
                      <button onClick={() => g.navigateTo(s.id)} className="text-muted-foreground hover:text-foreground">
                        <ArrowRight size={10} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              {quickStats.map((s) => (
                <div key={s.label} className="rounded-xl border border-subtle bg-surface-1 p-3">
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  <p className="font-mono text-lg font-bold text-foreground mt-1">{s.value}</p>
                  {s.delta && <p className="text-[9px] text-sw-green mt-0.5">{s.delta}</p>}
                </div>
              ))}
            </div>

            {/* Guardrail Health */}
            <div className="rounded-xl border border-subtle bg-surface-1 p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">Guardrail health</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Tier 1 rules active</span>
                  <span className="font-mono text-xs" style={{ color: tier1Count > 0 ? "#FF5C5C" : "#2ECF8E" }}>{tier1Count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Tier 2 locks active</span>
                  <span className="font-mono text-xs" style={{ color: tier2Count > 0 ? "#F5A623" : "#2ECF8E" }}>{tier2Count}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-foreground">Velocity limits</span>
                  <span className="font-mono text-xs text-sw-green">OK</span>
                </div>
              </div>
              <button onClick={() => g.navigateTo("guardrails")} className="text-[11px] font-medium mt-3 inline-block" style={{ color: "#4F7FFF" }}>
                Edit guardrails →
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Analytics tab */
        <div className="space-y-5">
          <PanelCard title="Action Volume — 30 Days" badge="Applied vs Blocked" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={actionTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="applied" fill="hsl(160,70%,48%)" radius={[4, 4, 0, 0]} name="Applied" />
                <Bar dataKey="blocked" fill="hsl(0,76%,57%)" radius={[4, 4, 0, 0]} name="Blocked" opacity={0.7} />
                <Bar dataKey="dismissed" fill="hsl(225,10%,30%)" radius={[4, 4, 0, 0]} name="Dismissed" opacity={0.5} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-green" /> Applied</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-red" /> Blocked</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-surface-3" /> Dismissed</span>
            </div>
          </PanelCard>

          <PanelCard title="Actions by Screen" badge="Last 30 days" badgeColor="purple" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={screenActivity} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} axisLine={false} tickLine={false} width={100} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="actions" fill="hsl(228,90%,64%)" radius={[0, 4, 4, 0]} name="Actions" />
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default CentralCockpitView;
