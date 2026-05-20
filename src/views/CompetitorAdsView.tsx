import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import DateRangeSubtitle from "@/components/DateRangeSubtitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line } from "recharts";
import { Eye, TrendingDown, TrendingUp, Megaphone, AlertTriangle, ArrowRight } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

const sovTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  you: Math.round(30 + Math.random() * 10),
  sunfeast: Math.round(35 + Math.random() * 12),
  parle: Math.round(15 + Math.random() * 8),
  unibic: Math.round(8 + Math.random() * 6),
}));

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const heatmapGrid = daysOfWeek.map(() => Array.from({ length: 24 }, () => Math.round(Math.random() * 100)));

const contestedKeywords = [
  { keyword: "butter beverages", yourPos: "#2", topComp: "Almarai", compBidIndex: "1.4x", overlap: 28, yourShare: "28%", action: "Raise bid" },
  { keyword: "cream beverages", yourPos: "#5", topComp: "Coca-Cola", compBidIndex: "1.6x", overlap: 30, yourShare: "18%", action: "Add to defence" },
  { keyword: "glucose beverages", yourPos: "#4", topComp: "Almarai", compBidIndex: "1.2x", overlap: 22, yourShare: "19%", action: "Monitor" },
  { keyword: "digestive beverages", yourPos: "#1", topComp: "Masafi", compBidIndex: "0.9x", overlap: 18, yourShare: "33%", action: "Monitor" },
  { keyword: "choco chip drinks", yourPos: "#6", topComp: "Coca-Cola Premium", compBidIndex: "1.8x", overlap: 25, yourShare: "12%", action: "Raise bid" },
];

const platformFilter = ["All Platforms", "Carrefour", "Noon", "Talabat", "Noon Minutes"];
const platformColors: Record<string, string> = { Carrefour: "#FF9900", Noon: "#2F77FF", Talabat: "#FDDC2B", Noon Minutes: "#833AB4" };

const keywordOptions = ["butter beverages", "cream beverages", "glucose beverages", "digestive beverages", "choco chip drinks"];

const competitorHourlyData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  sunfeast: Math.round(20 + Math.sin(h / 3) * 15 + (h >= 9 && h <= 21 ? 20 : 0)),
  parle: Math.round(15 + Math.cos(h / 4) * 10 + (h >= 10 && h <= 18 ? 15 : 0)),
  unibic: Math.round(10 + Math.sin(h / 5) * 8 + (h >= 8 && h <= 20 ? 10 : 0)),
}));

const competitorSpendTrend = [
  { week: "W1", sunfeast: 3.8, parle: 2.2, unibic: 1.1 },
  { week: "W2", sunfeast: 4.2, parle: 2.4, unibic: 1.3 },
  { week: "W3", sunfeast: 4.8, parle: 2.6, unibic: 1.2 },
  { week: "W4", sunfeast: 5.5, parle: 2.8, unibic: 1.5 },
];

const competitorAdProfiles = [
  { name: "Coca-Cola", color: "#FF5722", estSpend: "AED 5.5L/wk", platforms: ["Carrefour", "Noon", "Talabat"], topKeywords: ["butter beverages", "cream beverages", "dark fantasy"], keywordCount: 38, pattern: "Aggressive — increasing spend 40% MoM. Heavy day-parting 9AM–9PM.", budgetExhausted: false, sponsoredActive: true },
  { name: "Almarai", color: "#FF9800", estSpend: "AED 2.8L/wk", platforms: ["Carrefour", "Noon"], topKeywords: ["glucose beverages", "parle-g", "butter beverages"], keywordCount: 32, pattern: "Consistent — steady spend, focused on glucose category.", budgetExhausted: true, sponsoredActive: false },
  { name: "Rauch", color: "#4CAF50", estSpend: "AED 1.5L/wk", platforms: ["Carrefour", "Noon", "Noon Minutes"], topKeywords: ["drinks", "choco chip", "sugar free beverages"], keywordCount: 22, pattern: "Value play — aggressive on premium drinks segment.", budgetExhausted: false, sponsoredActive: true },
  { name: "Masafi", color: "#9C27B0", estSpend: "AED 1.8L/wk", platforms: ["Carrefour", "Talabat"], topKeywords: ["digestive beverages", "whole wheat beverages", "healthy beverages"], keywordCount: 18, pattern: "Health segment focus — targeting Aquafina directly.", budgetExhausted: true, sponsoredActive: false },
];

const budgetExhaustionByKeyword: Record<string, { competitor: string; platform: string; keyword: string; lastSeen: string; sponsoredRank: string; opportunity: string }[]> = {
  "butter beverages": [
    { competitor: "Almarai", platform: "Carrefour", keyword: "butter beverages", lastSeen: "2h ago", sponsoredRank: "Not visible since 2PM", opportunity: "Reduce your bid AED 18→AED 12, maintain position at lower cost" },
    { competitor: "Masafi", platform: "Talabat", keyword: "butter beverages", lastSeen: "4h ago", sponsoredRank: "Dropped from #2 to absent", opportunity: "Lower bid AED 22→AED 15, capture their traffic" },
  ],
  "cream beverages": [
    { competitor: "Rauch", platform: "Carrefour", keyword: "cream beverages", lastSeen: "1h ago", sponsoredRank: "Flickering #3–absent", opportunity: "Hold current bid, competitor running out mid-day" },
  ],
  "glucose beverages": [
    { competitor: "Almarai", platform: "Noon", keyword: "glucose beverages", lastSeen: "3h ago", sponsoredRank: "Absent since 4PM", opportunity: "Reduce bid AED 30→AED 20, save AED 8K/day" },
  ],
  "digestive beverages": [
    { competitor: "Masafi", platform: "Carrefour", keyword: "digestive beverages", lastSeen: "1h ago", sponsoredRank: "Flickering", opportunity: "Hold bid — Masafi running out mid-day" },
  ],
  "choco chip drinks": [
    { competitor: "Rauch", platform: "Noon", keyword: "choco chip drinks", lastSeen: "5h ago", sponsoredRank: "Absent", opportunity: "Reduce bid AED 20→AED 12" },
  ],
};

const keywordConquestOpps = [
  { keyword: "sunfeast dark fantasy", volume: "28K", competition: "Coca-Cola", compSoS: "62%", yourSoS: "0%", bidEst: "AED 18", projROAS: "4.2x" },
  { keyword: "parle g beverages", volume: "44K", competition: "Almarai", compSoS: "72%", yourSoS: "0%", bidEst: "AED 12", projROAS: "3.8x" },
  { keyword: "best butter drinks india", volume: "32K", competition: "Multiple", compSoS: "41%", yourSoS: "12%", bidEst: "AED 15", projROAS: "5.1x" },
  { keyword: "healthy beverages for kids", volume: "18K", competition: "Almarai", compSoS: "34%", yourSoS: "8%", bidEst: "AED 10", projROAS: "4.4x" },
];

const CompetitorAdsView: React.FC = () => {
  const [bidActions, setBidActions] = useState<Record<number, boolean>>({});
  const [conquestActions, setConquestActions] = useState<Record<number, boolean>>({});
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [selectedKeyword, setSelectedKeyword] = useState("butter beverages");
  const g = useGuardrails();
  const defenseBlocked = g.hasDefenseBlocked();
  const defenseActive = g.hasDefenseActive();
  const filteredProfiles = selectedPlatform === "All Platforms" ? competitorAdProfiles : competitorAdProfiles.filter(c => c.platforms.includes(selectedPlatform));
  const budgetAlerts = budgetExhaustionByKeyword[selectedKeyword] || [];
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
        {defenseBlocked && (
          <div className="rounded-xl p-4" style={{ backgroundColor: "rgba(245,166,35,0.10)", border: "1px solid rgba(245,166,35,0.25)", borderRadius: "8px" }}>
            <div className="flex items-center justify-between">
              <p className="text-xs text-foreground"><AlertTriangle size={12} className="inline mr-1" style={{ color: "#F5A623" }} /> Defense action queued — blocked by <strong>Availability threshold</strong>. Auto-fires when stock recovers.</p>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#F5A623" }}>Override manually</button>
                <button onClick={() => g.navigateTo("guardrails")} className="text-[11px] font-medium" style={{ color: "#4F7FFF" }}>View guardrail →</button>
              </div>
            </div>
          </div>
        )}

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
            <p className="font-mono text-sm font-bold text-foreground">Coca-Cola: ~1.4x</p>
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
          <KPICard title="Keyword Poaching Opps" value="6" delta="Competitor brand keywords" deltaType="positive" sub="Available for conquest campaigns" accentColor="bg-sw-purple" delay={0.1} />
          <KPICard title="Est. Competitor Spend" value="AED 11.6L/wk" delta="▲ 18% MoM" deltaType="negative" sub="Combined across 4 competitors" accentColor="bg-sw-amber" delay={0.15} />
        </div>

        <PanelCard title="Competitor Ad Profiles" badge="Real-time monitoring" badgeColor="red" delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[10px] text-muted-foreground">Platform</span>
            <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
              <SelectTrigger className="w-[160px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {platformFilter.map(p => (
                  <SelectItem key={p} value={p}>
                    <span className="flex items-center gap-1.5">
                      {p !== "All Platforms" && <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColors[p] }} />}
                      {p}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {filteredProfiles.map(c => (
              <div key={c.name} className="p-4 rounded-xl border border-subtle bg-surface-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />{c.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.budgetExhausted && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green">BUDGET EXHAUSTED</span>}
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
                  {c.topKeywords.map(kw => <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">"{kw}"</span>)}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <div className="grid grid-cols-2 gap-4">
          <PanelCard title="Budget Exhaustion — Bid Reduction Opps" badge={`${budgetAlerts.length} detected`} badgeColor="green" delay={0.3}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-muted-foreground">Keyword</span>
              <Select value={selectedKeyword} onValueChange={setSelectedKeyword}>
                <SelectTrigger className="w-[200px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {keywordOptions.map(kw => <SelectItem key={kw} value={kw}>"{kw}"</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {budgetAlerts.length === 0 ? (
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center"><p className="text-xs text-muted-foreground">No budget exhaustion detected for this keyword</p></div>
            ) : (
              <div className="space-y-2.5">
                {budgetAlerts.map((a, i) => (
                  <div key={i} className="p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-foreground font-medium">{a.competitor} — {a.platform}</span>
                      <span className="text-[9px] text-muted-foreground">{a.lastSeen}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{a.sponsoredRank}</p>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-[10px] text-sw-green">💡 {a.opportunity}</p>
                      <button onClick={() => setBidActions(p => ({ ...p, [i]: true }))}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${bidActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-green/20 text-sw-green hover:bg-sw-green/30"}`}>
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="sunfeast" fill="#FF5722" opacity={0.7} radius={[2, 2, 0, 0]} name="Coca-Cola" />
                <Bar dataKey="parle" fill="#FF9800" opacity={0.7} radius={[2, 2, 0, 0]} name="Almarai" />
                <Bar dataKey="unibic" fill="#4CAF50" opacity={0.7} radius={[2, 2, 0, 0]} name="Rauch" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5722" }} /> Coca-Cola</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF9800" }} /> Almarai</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#4CAF50" }} /> Rauch</span>
            </div>
          </PanelCard>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <PanelCard title="Competitor Ad Spend Trend — 4 Weeks" badge="Estimated" badgeColor="amber" delay={0.4}>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={competitorSpendTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="week" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
                <Line type="monotone" dataKey="sunfeast" stroke="#FF5722" strokeWidth={2} name="Coca-Cola" />
                <Line type="monotone" dataKey="parle" stroke="#FF9800" strokeWidth={2} name="Almarai" />
                <Line type="monotone" dataKey="unibic" stroke="#4CAF50" strokeWidth={2} name="Rauch" />
              </LineChart>
            </ResponsiveContainer>
            <div className="mt-3 p-3 rounded-xl bg-sw-amber-dim border border-sw-amber/20">
              <p className="text-[11px] text-foreground">⚠ Coca-Cola increasing spend 40% MoM — aggressive beverage category capture. Consider defensive bidding on top 5 keywords.</p>
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
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${conquestActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple-dim text-sw-purple hover:bg-sw-purple/20"}`}>
                    <Megaphone size={10} />
                    {conquestActions[i] ? "✓ Conquest Campaign Live" : "Launch Conquest Campaign"}
                  </button>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Share of Voice — 30 Days" badge="You vs Top 3 Competitors" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={sovTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} unit="%" />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="you" stroke="hsl(var(--sw-purple))" strokeWidth={2} dot={false} name="Your Brand" />
                <Line type="monotone" dataKey="sunfeast" stroke="#FF5722" strokeWidth={2} dot={false} name="Coca-Cola" />
                <Line type="monotone" dataKey="parle" stroke="#FF9800" strokeWidth={2} dot={false} name="Almarai" />
                <Line type="monotone" dataKey="unibic" stroke="#4CAF50" strokeWidth={2} dot={false} name="Rauch" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-purple" /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5722" }} /> Coca-Cola</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF9800" }} /> Almarai</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#4CAF50" }} /> Rauch</span>
            </div>
          </PanelCard>

          <PanelCard title="Estimated Competitor Activity Heatmap" badge="Days × Hours" badgeColor="red" delay={0.1}>
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="w-8" />
                  {Array.from({ length: 24 }, (_, h) => <span key={h} className="w-4 text-center text-[7px] font-mono text-muted-foreground">{h}</span>)}
                </div>
                {daysOfWeek.map((day, di) => (
                  <div key={day} className="flex items-center gap-1">
                    <span className="w-8 text-[9px] text-muted-foreground">{day}</span>
                    {heatmapGrid[di].map((val, hi) => (
                      <div key={hi} className="w-4 h-4 rounded-sm" style={{ backgroundColor: `rgba(255,92,92,${val / 120})` }} title={`${day} ${hi}:00 — Activity: ${val}%`} />
                    ))}
                  </div>
                ))}
              </div>
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
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full cursor-pointer ${k.action === "Raise bid" ? "bg-sw-green-dim text-sw-green" : k.action === "Add to defence" ? "bg-sw-amber-dim text-sw-amber" : "bg-surface-3 text-muted-foreground"}`}>{k.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>

          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-subtle bg-surface-1 p-5">
              <h3 className="text-sm font-medium text-foreground mb-1">Impression Share Lost</h3>
              <p className="font-mono text-2xl font-bold text-sw-red mt-2">18%</p>
              <p className="text-[10px] text-muted-foreground mt-1">Impression share lost to competitor bids in the last 7 days</p>
              <p className="text-[10px] text-sw-red mt-1">▲ 3% vs last 7 days</p>
            </div>
            <div className="rounded-xl border border-subtle bg-surface-1 p-5">
              <h3 className="text-sm font-medium text-foreground mb-1">Recoverable with Defence</h3>
              <p className="font-mono text-2xl font-bold text-sw-green mt-2">12%</p>
              <p className="text-[10px] text-muted-foreground mt-1">Estimated impression share recovery if defence campaigns are activated</p>
              <button onClick={() => g.navigateTo("campaigns", "defense-insight")} className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                Activate defence →
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorAdsView;
