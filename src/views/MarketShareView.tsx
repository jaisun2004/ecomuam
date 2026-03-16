import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, Legend } from "recharts";
import { ArrowRight, AlertCircle } from "lucide-react";

const platforms = ["Blinkit", "Zepto", "Swiggy Instamart", "Amazon", "Flipkart"];
const competitors = ["MuscleBlaze", "Optimum Nutrition", "MyProtein", "GNC", "Wellbeing Nutrition"];

const platformShareData = platforms.map(p => ({
  platform: p,
  you: Math.round(15 + Math.random() * 20),
  rival1: Math.round(10 + Math.random() * 20),
  rival2: Math.round(8 + Math.random() * 15),
  rival3: Math.round(5 + Math.random() * 12),
  others: Math.round(10 + Math.random() * 15),
}));

const subcategoryMovers = [
  { name: "Whey Protein", thisWeek: 28, lastWeek: 24, change: 4, leader: "MuscleBlaze" },
  { name: "Pre-Workout", thisWeek: 18, lastWeek: 22, change: -4, leader: "Optimum Nutrition" },
  { name: "Creatine", thisWeek: 31, lastWeek: 29, change: 2, leader: "You" },
  { name: "BCAA", thisWeek: 15, lastWeek: 14, change: 1, leader: "MyProtein" },
  { name: "Vitamins", thisWeek: 12, lastWeek: 15, change: -3, leader: "Wellbeing Nutrition" },
];

// Analytics data
const shareOverTime = Array.from({ length: 90 }, (_, i) => ({
  day: `Day ${i + 1}`,
  you: Math.round(22 + Math.sin(i / 10) * 5 + Math.random() * 3),
  rival1: Math.round(20 + Math.cos(i / 8) * 4 + Math.random() * 3),
  rival2: Math.round(15 + Math.sin(i / 12) * 3 + Math.random() * 2),
  rival3: Math.round(12 + Math.random() * 4),
  rival4: Math.round(8 + Math.random() * 3),
}));

const platformMatrix = platforms.map(p => ({
  platform: p,
  you: Math.round(15 + Math.random() * 20),
  ...Object.fromEntries(competitors.slice(0, 5).map(c => [c, Math.round(5 + Math.random() * 25)])),
}));

const velocityData = ["You", ...competitors.slice(0, 4)].map(brand => ({
  brand,
  change: brand === "You" ? 2.4 : Math.round((Math.random() * 8 - 3) * 10) / 10,
}));

const newEntrants = [
  { brand: "FitNutra", firstSeen: "Mar 2, 2026", platforms: ["Blinkit", "Zepto"], share: "1.2%", keywords: ["whey protein budget", "protein shake india", "gym supplement"] },
  { brand: "NutriEdge", firstSeen: "Mar 8, 2026", platforms: ["Amazon"], share: "0.8%", keywords: ["creatine monohydrate", "pre workout energy"] },
];

const MarketShareView: React.FC = () => {
  const [tab, setTab] = useState("overview");
  const g = useGuardrails();
  const [platformFilter, setPlatformFilter] = useState("All");

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Market Share</h1>
        <p className="text-xs text-muted-foreground mt-1">Your position in the category across platforms and subcategories.</p>
      </div>

      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Overall Category Share" value="22%" delta="▲ 1.4% vs last wk" deltaType="positive" sub="Across all platforms" accentColor="bg-primary" delay={0} />
          <KPICard title="Rank in Category" value="#2 of 8" delta="▲1 vs last week" deltaType="positive" sub="Behind MuscleBlaze at 26%" accentColor="bg-sw-green" delay={0.05} />
          <KPICard title="Fastest Growing Competitor" value="GNC" delta="+3.2% share gain" deltaType="negative" sub="Aggressive Q-commerce push" accentColor="bg-sw-red" delay={0.1} />
          <KPICard title="Platform Where You Lead" value="Flipkart" delta="Highest share: 31%" deltaType="positive" sub="2.1x vs nearest rival" accentColor="bg-sw-purple" delay={0.15} />
        </div>

        {/* Share by platform */}
        <PanelCard title="Share by Platform" badge="Stacked comparison" badgeColor="accent" delay={0.2}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformShareData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} vertical={true} />
              <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="platform" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} axisLine={false} tickLine={false} width={120} />
              <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="you" stackId="a" fill="#A78BFA" radius={[0, 0, 0, 0]} name="You" />
              <Bar dataKey="rival1" stackId="a" fill="#FF5C5C" name="MuscleBlaze" />
              <Bar dataKey="rival2" stackId="a" fill="#FF8A80" name="Optimum Nutrition" />
              <Bar dataKey="rival3" stackId="a" fill="#FFAB91" name="MyProtein" />
              <Bar dataKey="others" stackId="a" fill="rgba(85,90,110,0.4)" radius={[0, 4, 4, 0]} name="Others" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5C5C" }} /> MuscleBlaze</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF8A80" }} /> ON</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FFAB91" }} /> MyProtein</span>
          </div>
        </PanelCard>

        {/* Subcategory movers */}
        <PanelCard title="Subcategories to Watch" badge="WoW change" badgeColor="amber" delay={0.3}>
          <div className="space-y-2">
            {subcategoryMovers.map(s => (
              <div key={s.name} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-subtle">
                <span className="text-xs text-foreground flex-1">{s.name}</span>
                <span className="font-mono text-[10px] text-muted-foreground">{s.thisWeek}%</span>
                <span className="text-[9px] text-muted-foreground">vs {s.lastWeek}%</span>
                <span className={`font-mono text-[11px] w-12 text-right ${s.change > 0 ? "text-sw-green" : s.change < 0 ? "text-sw-red" : "text-muted-foreground"}`}>
                  {s.change > 0 ? "+" : ""}{s.change}%
                </span>
                <span className="text-[9px] text-muted-foreground">Leader: {s.leader}</span>
                <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "subcategory", params: { subcategory: s.name } })} className="text-[10px] font-medium flex-shrink-0" style={{ color: "#4F7FFF" }}>
                  View campaigns →
                </button>
              </div>
            ))}
          </div>
        </PanelCard>
      </>) : (
        <div className="space-y-5">
          {/* Share over time */}
          <PanelCard title="Market Share Over Time — 90 Days" badge="Multi-brand" badgeColor="accent" delay={0}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {["All", ...platforms].map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${platformFilter === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={shareOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} interval={14} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="you" stroke="#A78BFA" strokeWidth={2} dot={false} name="You" />
                <Line type="monotone" dataKey="rival1" stroke="#FF5C5C" strokeWidth={2} dot={false} name="MuscleBlaze" />
                <Line type="monotone" dataKey="rival2" stroke="#FF8A80" strokeWidth={2} dot={false} name="ON" />
                <Line type="monotone" dataKey="rival3" stroke="#FFAB91" strokeWidth={2} dot={false} name="MyProtein" />
                <Line type="monotone" dataKey="rival4" stroke="#555A6E" strokeWidth={1} dot={false} strokeDasharray="5 5" name="GNC" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5C5C" }} /> MuscleBlaze</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF8A80" }} /> ON</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FFAB91" }} /> MyProtein</span>
            </div>
          </PanelCard>

          {/* Platform share matrix */}
          <PanelCard title="Platform Share Matrix" badge="You vs 5 competitors" badgeColor="purple" delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-subtle">
                    <th className="text-left py-2 font-normal">Platform</th>
                    <th className="text-right py-2 font-normal" style={{ color: "#A78BFA" }}>You</th>
                    {competitors.slice(0, 5).map(c => (
                      <th key={c} className="text-right py-2 font-normal">{c.split(" ")[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {platformMatrix.map((row, i) => (
                    <tr key={row.platform} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                      <td className="py-2.5 text-foreground">{row.platform}</td>
                      <td className="py-2.5 text-right font-mono" style={{ color: "#A78BFA" }}>{row.you}%</td>
                      {competitors.slice(0, 5).map(c => {
                        const val = (row as any)[c] || 0;
                        const isMax = val > row.you && val >= Math.max(...competitors.slice(0, 5).map(cc => (row as any)[cc] || 0));
                        return <td key={c} className={`py-2.5 text-right font-mono ${isMax ? "text-sw-red" : "text-foreground"}`}>{val}%</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>

          {/* Share velocity */}
          <PanelCard title="Who Is Gaining Fastest" badge="WoW change" badgeColor="green" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="brand" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} formatter={(value: number) => `${value > 0 ? "+" : ""}${value}% share`} />
                <Bar dataKey="change" radius={[4, 4, 0, 0]} name="WoW Share Change">
                  {velocityData.map((entry, index) => (
                    <rect key={index} fill={entry.brand === "You" ? "#A78BFA" : entry.change > 0 ? "#FF5C5C" : "#555A6E"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>

          {/* New entrants */}
          <PanelCard title="New Competitors Detected" badge="Last 30 days" badgeColor="red" delay={0.3}>
            <div className="space-y-3">
              {newEntrants.map(e => (
                <div key={e.brand} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <AlertCircle size={14} className="text-sw-red" /> {e.brand}
                    </span>
                    <span className="text-[10px] text-muted-foreground">First seen: {e.firstSeen}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {e.platforms.map(p => (
                      <span key={p} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground">{p}</span>
                    ))}
                    <span className="font-mono text-[10px] text-muted-foreground ml-2">Est. share: {e.share}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {e.keywords.map(kw => (
                      <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{kw}</span>
                    ))}
                  </div>
                  <button onClick={() => g.navigateTo("discovery")} className="text-[10px] font-medium mt-2 inline-block" style={{ color: "#4F7FFF" }}>
                    Monitor keywords →
                  </button>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Quick commerce metrics */}
          <PanelCard title="Quick Commerce Performance" badge="Dark store & Q-commerce" badgeColor="amber" delay={0.4}>
            <p className="text-[10px] text-muted-foreground mb-3">Metrics specific to dark store and q-commerce platforms</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Dark Store Coverage</p>
                <p className="font-mono text-lg font-bold text-foreground mt-1">248 / 316</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">vs top competitor: 292 / 316</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Avg Delivery Slot Share</p>
                <p className="font-mono text-lg font-bold text-sw-green mt-1">34%</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">% of windows in top 3 results</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Platform Exclusivity Score</p>
                <p className="font-mono text-sm font-bold text-foreground mt-1">Rival A: 2.1x on Zepto only</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Where competitors dominate exclusively</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Impulse Category Rank</p>
                <p className="font-mono text-lg font-bold text-sw-amber mt-1">#4</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">In "frequently bought together" placements</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-3 italic">Q-commerce metrics estimated from platform auction signals and availability data.</p>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default MarketShareView;
