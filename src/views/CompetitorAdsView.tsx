import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line } from "recharts";
import { Eye, TrendingDown, TrendingUp, Megaphone, AlertTriangle, ArrowRight } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

/* SoV trend data */
const sovTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  you: Math.round(30 + Math.random() * 10),
  muscleBlaze: Math.round(35 + Math.random() * 12),
  on: Math.round(15 + Math.random() * 8),
  asItIs: Math.round(8 + Math.random() * 6),
}));

/* 7x24 heatmap */
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapGrid = daysOfWeek.map(day =>
  Array.from({ length: 24 }, (_, h) => Math.round(Math.random() * 100))
);

/* Top contested keywords */
const contestedKeywords = [
  { keyword: "whey protein 1kg", yourPos: "#3", topComp: "MuscleBlaze", compBidIndex: "1.4x", overlap: 28, yourShare: "28%", action: "Raise bid" },
  { keyword: "protein powder", yourPos: "#5", topComp: "MuscleBlaze", compBidIndex: "1.6x", overlap: 30, yourShare: "18%", action: "Add to defence" },
  { keyword: "creatine monohydrate", yourPos: "#4", topComp: "AS-IT-IS", compBidIndex: "1.2x", overlap: 22, yourShare: "19%", action: "Monitor" },
  { keyword: "pre workout", yourPos: "#2", topComp: "BigMuscles", compBidIndex: "0.9x", overlap: 18, yourShare: "33%", action: "Monitor" },
  { keyword: "bcaa supplement", yourPos: "#6", topComp: "MuscleBlaze", compBidIndex: "1.8x", overlap: 25, yourShare: "12%", action: "Raise bid" },
];

const platformFilter = ["All Platforms", "Amazon", "Flipkart", "Blinkit", "Zepto"];
const platformColors: Record<string, string> = { Amazon: "#FF9900", Flipkart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4" };

const keywordOptions = ["whey protein", "protein powder", "creatine monohydrate", "pre workout", "bcaa supplement"];

/* Competition ad activity by hour */
const competitorHourlyData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  muscleBlaze: Math.round(20 + Math.sin(h / 3) * 15 + (h >= 9 && h <= 21 ? 20 : 0)),
  on: Math.round(15 + Math.cos(h / 4) * 10 + (h >= 10 && h <= 18 ? 15 : 0)),
  asItIs: Math.round(10 + Math.sin(h / 5) * 8 + (h >= 8 && h <= 20 ? 10 : 0)),
}));

const competitorSpendTrend = [
  { week: "W1", muscleBlaze: 4.2, on: 2.8, asItIs: 1.5 },
  { week: "W2", muscleBlaze: 4.8, on: 2.6, asItIs: 1.8 },
  { week: "W3", muscleBlaze: 5.4, on: 3.1, asItIs: 1.6 },
  { week: "W4", muscleBlaze: 6.1, on: 2.9, asItIs: 2.0 },
];

const competitorAdProfiles = [
  {
    name: "MuscleBlaze", color: "#FF5722",
    estSpend: "₹6.1L/wk", platforms: ["Amazon", "Flipkart", "Blinkit"],
    topKeywords: ["whey protein", "protein powder", "creatine"], keywordCount: 42,
    pattern: "Aggressive — increasing spend 45% MoM. Heavy day-parting 9AM–9PM. Dominates Sponsored Products on Amazon.",
    budgetExhausted: false, sponsoredActive: true,
  },
  {
    name: "Optimum Nutrition", color: "#FF9800",
    estSpend: "₹2.9L/wk", platforms: ["Amazon", "Flipkart"],
    topKeywords: ["whey isolate", "gold standard", "protein"], keywordCount: 28,
    pattern: "Consistent — steady spend, focused on brand keywords. Premium positioning strategy.",
    budgetExhausted: true, sponsoredActive: false,
  },
  {
    name: "AS-IT-IS Nutrition", color: "#4CAF50",
    estSpend: "₹2.0L/wk", platforms: ["Amazon", "Flipkart", "Zepto"],
    topKeywords: ["whey protein", "creatine monohydrate", "bcaa"], keywordCount: 35,
    pattern: "Value play — aggressive bidding on generic keywords. Undercutting on price + ads combo.",
    budgetExhausted: false, sponsoredActive: true,
  },
  {
    name: "BigMuscles", color: "#9C27B0",
    estSpend: "₹1.2L/wk", platforms: ["Amazon", "Blinkit"],
    topKeywords: ["pre workout", "mass gainer", "whey protein"], keywordCount: 18,
    pattern: "Burst strategy — heavy spend around weekends. Budget exhaustion detected mid-week.",
    budgetExhausted: true, sponsoredActive: false,
  },
];

const budgetExhaustionByKeyword: Record<string, { competitor: string; platform: string; keyword: string; lastSeen: string; sponsoredRank: string; opportunity: string }[]> = {
  "whey protein": [
    { competitor: "Optimum Nutrition", platform: "Amazon", keyword: "whey protein 1kg", lastSeen: "2h ago", sponsoredRank: "Not visible since 2PM", opportunity: "Reduce your bid ₹28→₹18, maintain position at lower cost" },
    { competitor: "BigMuscles", platform: "Blinkit", keyword: "whey protein", lastSeen: "4h ago", sponsoredRank: "Dropped from #2 to absent", opportunity: "Lower bid ₹35→₹22, capture their traffic organically" },
  ],
  "protein powder": [
    { competitor: "AS-IT-IS", platform: "Amazon", keyword: "protein powder india", lastSeen: "1h ago", sponsoredRank: "Flickering #3–absent", opportunity: "Hold current bid, competitor running out mid-day" },
    { competitor: "MuscleBlaze", platform: "Flipkart", keyword: "best protein powder", lastSeen: "3h ago", sponsoredRank: "Absent since 4PM", opportunity: "Reduce bid ₹42→₹30, save ₹12K/day" },
  ],
  "creatine monohydrate": [
    { competitor: "AS-IT-IS", platform: "Amazon", keyword: "creatine monohydrate", lastSeen: "1h ago (intermittent)", sponsoredRank: "Flickering #3–absent", opportunity: "Hold current bid, competitor running out mid-day" },
  ],
  "pre workout": [
    { competitor: "BigMuscles", platform: "Blinkit", keyword: "pre workout", lastSeen: "4h ago", sponsoredRank: "Dropped from #2 to absent", opportunity: "Lower bid ₹35→₹22, capture their traffic organically" },
    { competitor: "ON", platform: "Amazon", keyword: "pre workout energy", lastSeen: "6h ago", sponsoredRank: "Not visible since morning", opportunity: "Lower bid ₹40→₹28" },
  ],
  "bcaa supplement": [
    { competitor: "Dymatize", platform: "Flipkart", keyword: "bcaa supplement", lastSeen: "5h ago", sponsoredRank: "Absent", opportunity: "Reduce bid ₹25→₹15" },
  ],
};

const keywordConquestOpps = [
  { keyword: "optimum nutrition whey", volume: "32K", competition: "ON", compSoS: "58%", yourSoS: "0%", bidEst: "₹22", projROAS: "4.8x" },
  { keyword: "muscleblaze whey protein", volume: "28K", competition: "MB", compSoS: "72%", yourSoS: "0%", bidEst: "₹35", projROAS: "3.2x" },
  { keyword: "best whey protein india", volume: "44K", competition: "Multiple", compSoS: "41%", yourSoS: "12%", bidEst: "₹28", projROAS: "5.1x" },
  { keyword: "gym supplements combo", volume: "18K", competition: "AS-IT-IS", compSoS: "34%", yourSoS: "8%", bidEst: "₹15", projROAS: "4.4x" },
];

const CompetitorAdsView: React.FC = () => {
  const [bidActions, setBidActions] = useState<Record<number, boolean>>({});
  const [conquestActions, setConquestActions] = useState<Record<number, boolean>>({});
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedKeyword, setSelectedKeyword] = useState("whey protein");

  const filteredProfiles = selectedPlatform === "All Platforms"
    ? competitorAdProfiles
    : competitorAdProfiles.filter(c => c.platforms.includes(selectedPlatform));

  const budgetAlerts = budgetExhaustionByKeyword[selectedKeyword] || [];

  const g = useGuardrails();
  const defenseBlocked = g.hasDefenseBlocked();
  const defenseActive = g.hasDefenseActive();

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (<>
      {/* Conflict alert banner — only when defense is BLOCKED */}
      {defenseBlocked && (
        <div className="rounded-xl p-4" style={{
          backgroundColor: "rgba(245,166,35,0.10)",
          border: "1px solid rgba(245,166,35,0.25)",
          borderRadius: "8px",
        }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-foreground">
                <AlertTriangle size={12} className="inline mr-1" style={{ color: "#F5A623" }} />
                Defense action queued — blocked by <strong>Availability threshold</strong>. Auto-fires when stock recovers above 20%. Est. {g.estResolutionTime}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#F5A623" }}>Override manually</button>
              <button onClick={() => g.navigateTo("guardrails")} className="text-[11px] font-medium" style={{ color: "#4F7FFF" }}>View guardrail →</button>
            </div>
          </div>
        </div>
      )}

      {/* Competitive summary bar */}
      <div className="grid grid-cols-4 gap-3">
        <div className="rounded-xl border border-subtle bg-surface-1 p-3">
          <p className="text-[10px] text-muted-foreground mb-1">Share of Voice</p>
          <div className="flex items-center gap-1 h-3 rounded-full overflow-hidden">
            <div className="h-full rounded-l-full" style={{ width: "34%", backgroundColor: "hsl(var(--sw-purple))" }} />
            <div className="h-full rounded-r-full" style={{ width: "66%", backgroundColor: "hsl(var(--sw-red))", opacity: 0.5 }} />
          </div>
          <p className="text-[10px] font-mono text-foreground mt-1">You 34% · Rivals 66%</p>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 p-3">
          <p className="text-[10px] text-muted-foreground mb-1">Competitor Spend Index</p>
          <p className="font-mono text-sm font-bold text-foreground">Rival A: ~1.4x</p>
          <p className="text-[9px] text-sw-red flex items-center gap-0.5"><TrendingUp size={9} /> spending more</p>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 p-3">
          <p className="text-[10px] text-muted-foreground mb-1">Keyword Overlap Score</p>
          <p className="font-mono text-sm font-bold text-sw-red">68% overlap</p>
          <p className="text-[9px] text-muted-foreground">&gt;60% = high competition</p>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 p-3">
          <p className="text-[10px] text-muted-foreground mb-1">Brand Defence Status</p>
          <p className="font-mono text-sm font-bold" style={{ color: defenseActive ? "#2ECF8E" : defenseBlocked ? "#F5A623" : "#2ECF8E" }}>
            {defenseActive ? "Active" : defenseBlocked ? "Queued" : "Clear"}
          </p>
          <button onClick={() => g.navigateTo("campaigns", "defense-insight")} className="text-[9px]" style={{ color: "#4F7FFF" }}>View in Campaign Manager →</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Competitors Tracked" value="4" delta="Active ad monitoring" deltaType="positive" sub="Real-time sponsored rank tracking" accentColor="bg-sw-red" delay={0} />
        <KPICard title="Budget Exhaustions (24h)" value="3" delta="Bid reduction opportunity" deltaType="positive" sub="Competitors out of budget today" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Keyword Poaching Opps" value="8" delta="Competitor brand keywords" deltaType="positive" sub="Available for conquest campaigns" accentColor="bg-sw-purple" delay={0.1} />
        <KPICard title="Est. Competitor Spend" value="₹12.2L/wk" delta="▲ 22% MoM" deltaType="negative" sub="Combined across 4 competitors" accentColor="bg-sw-amber" delay={0.15} />
      </div>

      {/* Competitor Ad Profiles with platform filter */}
      <PanelCard title="Competitor Ad Profiles" badge="Real-time monitoring" badgeColor="red" delay={0.2}>
        <div className="flex items-center gap-2 mb-4">
          {platformFilter.map(p => (
            <button key={p} onClick={() => setSelectedPlatform(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                selectedPlatform === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
              }`}>
              {p !== "All Platforms" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColors[p] }} />}
              {p}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredProfiles.map((c) => (
            <div key={c.name} className="p-4 rounded-xl border border-subtle bg-surface-2">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground font-medium flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  {c.name}
                </span>
                <div className="flex items-center gap-2">
                  {c.budgetExhausted && (
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green">BUDGET EXHAUSTED</span>
                  )}
                  {defenseActive && c.topKeywords.includes("whey protein") && (
                    <button onClick={() => g.navigateTo("campaigns", "defense-insight")}
                      className="font-mono text-[9px] px-1.5 py-0.5 rounded cursor-pointer" style={{ backgroundColor: "rgba(85,90,110,0.15)", color: "#8B8FA8" }}>
                      Defense active — Campaign Manager
                    </button>
                  )}
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${c.sponsoredActive ? "bg-sw-red-dim text-sw-red" : "bg-surface-3 text-muted-foreground"}`}>
                    {c.sponsoredActive ? "ADS ACTIVE" : "ADS PAUSED"}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-[10px] mb-2">
                <div><span className="text-muted-foreground">Est. Spend</span><p className="font-mono text-foreground">{c.estSpend}</p></div>
                <div><span className="text-muted-foreground">Keywords</span><p className="font-mono text-foreground">{c.keywordCount}</p></div>
                <div><span className="text-muted-foreground">Platforms</span><p className="text-foreground">{c.platforms.join(", ")}</p></div>
              </div>
              <p className="text-[10px] text-muted-foreground">{c.pattern}</p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                {c.topKeywords.map(kw => (
                  <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">"{kw}"</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Budget Exhaustion Alerts with keyword toggle + Hourly Activity */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Budget Exhaustion — Bid Reduction Opps" badge={`${budgetAlerts.length} detected`} badgeColor="green" delay={0.3}>
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {keywordOptions.map(kw => (
              <button key={kw} onClick={() => setSelectedKeyword(kw)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  selectedKeyword === kw ? "bg-sw-green/20 text-sw-green" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>
                "{kw}"
              </button>
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground mb-3">Competitors out of budget on "{selectedKeyword}" — reduce bids to save spend</p>
          {budgetAlerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
              <p className="text-xs text-muted-foreground">No budget exhaustion detected for this keyword right now</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {budgetAlerts.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-medium">{a.competitor} — {a.platform}</span>
                    <span className="text-[9px] text-muted-foreground">{a.lastSeen}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Keyword: <span className="font-mono text-foreground">"{a.keyword}"</span></p>
                  <p className="text-[10px] text-muted-foreground">{a.sponsoredRank}</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] text-sw-green">💡 {a.opportunity}</p>
                    <button onClick={() => setBidActions(p => ({ ...p, [i]: true }))}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                        bidActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-green/20 text-sw-green hover:bg-sw-green/30"
                      }`}>
                      {bidActions[i] ? "✓ Bid Reduced" : "Reduce Bid"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Competitor Ad Activity — Hourly Pattern" badge="Today" badgeColor="accent" delay={0.35}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={competitorHourlyData.filter((_, i) => i % 2 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="muscleBlaze" fill="#FF5722" opacity={0.7} radius={[2, 2, 0, 0]} name="MuscleBlaze" />
              <Bar dataKey="on" fill="#FF9800" opacity={0.7} radius={[2, 2, 0, 0]} name="ON" />
              <Bar dataKey="asItIs" fill="#4CAF50" opacity={0.7} radius={[2, 2, 0, 0]} name="AS-IT-IS" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5722" }} /> MuscleBlaze</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF9800" }} /> ON</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#4CAF50" }} /> AS-IT-IS</span>
          </div>
        </PanelCard>
      </div>

      {/* Spend Trend + Keyword Conquest */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Competitor Ad Spend Trend — 4 Weeks" badge="Estimated" badgeColor="amber" delay={0.4}>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={competitorSpendTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="muscleBlaze" stroke="#FF5722" strokeWidth={2} name="MuscleBlaze" />
              <Line type="monotone" dataKey="on" stroke="#FF9800" strokeWidth={2} name="ON" />
              <Line type="monotone" dataKey="asItIs" stroke="#4CAF50" strokeWidth={2} name="AS-IT-IS" />
            </LineChart>
          </ResponsiveContainer>
          <div className="mt-3 p-3 rounded-xl bg-sw-amber-dim border border-sw-amber/20">
            <p className="text-[11px] text-foreground">⚠ MuscleBlaze increasing spend 45% MoM — aggressive category capture strategy. Consider defensive bidding on top 5 keywords.</p>
          </div>
        </PanelCard>

        <PanelCard title="Keyword Conquest Opportunities" badge="Poach competitor keywords" badgeColor="purple" delay={0.45}>
          <p className="text-[10px] text-muted-foreground mb-3">Bid on competitor brand keywords to capture their branded traffic</p>
          <div className="space-y-2">
            {keywordConquestOpps.map((k, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[11px] text-foreground">"{k.keyword}"</span>
                  <span className="font-mono text-[9px] text-muted-foreground">{k.volume} vol</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-2">
                  <span>Comp SoS: <span className="text-sw-red font-mono">{k.compSoS}</span></span>
                  <span>You: <span className="text-primary font-mono">{k.yourSoS}</span></span>
                  <span>Bid: <span className="font-mono text-foreground">{k.bidEst}</span></span>
                  <span>Proj. ROAS: <span className="font-mono text-sw-green">{k.projROAS}</span></span>
                </div>
                <button onClick={() => setConquestActions(p => ({ ...p, [i]: true }))}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    conquestActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple-dim text-sw-purple hover:bg-sw-purple/20"
                  }`}>
                  <Megaphone size={10} />
                  {conquestActions[i] ? "✓ Conquest Campaign Live" : "Launch Conquest Campaign"}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
      </>) : (
        /* Analytics tab */
        <div className="space-y-5">
          <PanelCard title="Share of Voice — 30 Days" badge="You vs Top 3 Competitors" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={sovTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} unit="%" />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="you" stroke="hsl(var(--sw-purple))" strokeWidth={2} dot={false} name="Your Brand" />
                <Line type="monotone" dataKey="muscleBlaze" stroke="#FF5722" strokeWidth={2} dot={false} name="MuscleBlaze" />
                <Line type="monotone" dataKey="on" stroke="#FF9800" strokeWidth={2} dot={false} name="ON" />
                <Line type="monotone" dataKey="asItIs" stroke="#4CAF50" strokeWidth={2} dot={false} name="AS-IT-IS" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-purple" /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5722" }} /> MuscleBlaze</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF9800" }} /> ON</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#4CAF50" }} /> AS-IT-IS</span>
            </div>
          </PanelCard>

          <PanelCard title="Estimated Competitor Activity Heatmap" badge="Days × Hours" badgeColor="red" delay={0.1}>
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="w-8" />
                  {Array.from({ length: 24 }, (_, h) => (
                    <span key={h} className="w-4 text-center text-[7px] font-mono text-muted-foreground">{h}</span>
                  ))}
                </div>
                {daysOfWeek.map((day, di) => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="w-8 text-[9px] text-muted-foreground">{day}</span>
                    {heatmapGrid[di].map((val, hi) => (
                      <div key={hi} className="w-4 h-4 rounded-sm" style={{
                        backgroundColor: `rgba(255,92,92,${val / 120})`,
                      }} title={`${day} ${hi}:00 — Activity: ${val}%`} />
                    ))}
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground mt-2">Activity estimated from auction pressure signals. Not actual spend data.</p>
            </div>
          </PanelCard>

          <PanelCard title="Top Contested Keywords" badge="Sortable" badgeColor="amber" delay={0.2}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Keyword</th>
                  <th className="text-right py-2 font-normal">Your Pos</th>
                  <th className="text-left py-2 font-normal">Top Competitor</th>
                  <th className="text-right py-2 font-normal">Comp Bid Index</th>
                  <th className="text-right py-2 font-normal">Overlap Days</th>
                  <th className="text-right py-2 font-normal">Your Share</th>
                  <th className="text-right py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {contestedKeywords.map((k, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 font-mono text-foreground">"{k.keyword}"</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{k.yourPos}</td>
                    <td className="py-2.5 text-foreground">{k.topComp}</td>
                    <td className="py-2.5 text-right font-mono text-sw-red">{k.compBidIndex}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{k.overlap}/30</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{k.yourShare}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full cursor-pointer ${
                        k.action === "Raise bid" ? "bg-sw-green-dim text-sw-green" : k.action === "Add to defence" ? "bg-sw-amber-dim text-sw-amber" : "bg-surface-3 text-muted-foreground"
                      }`}>{k.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-subtle bg-surface-1 p-5">
              <h3 className="text-sm font-medium text-foreground mb-1">Revenue at Risk</h3>
              <p className="font-mono text-2xl font-bold text-sw-red mt-2">₹4.2L</p>
              <p className="text-[10px] text-muted-foreground mt-1">Estimated from impression share lost × historical conversion value</p>
              <p className="text-[10px] text-sw-red mt-1">▲ ₹0.8L vs last 7 days</p>
            </div>
            <div className="rounded-xl border border-subtle bg-surface-1 p-5">
              <h3 className="text-sm font-medium text-foreground mb-1">Recoverable with Defence</h3>
              <p className="font-mono text-2xl font-bold text-sw-green mt-2">₹3.1L</p>
              <p className="text-[10px] text-muted-foreground mt-1">Estimated recovery if defence campaigns are activated</p>
              <button onClick={() => g.navigateTo("campaigns", "defense-insight")} className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                Activate defence →
              </button>
            </div>
          </div>
          <p className="text-[9px] text-muted-foreground">Estimates based on historical ROAS and auction signal modelling.</p>
        </div>
      )}
    </div>
  );
};

export default CompetitorAdsView;
