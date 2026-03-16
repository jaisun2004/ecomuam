import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { Megaphone, ArrowRight } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";

const searchTrendData = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  volume: Math.round(40000 + Math.random() * 20000),
}));

const demandForecast = [
  { category: "Protein", current: 85, forecast: 102 },
  { category: "Creatine", current: 42, forecast: 38 },
  { category: "Pre-Workout", current: 55, forecast: 78 },
  { category: "BCAA", current: 30, forecast: 35 },
  { category: "Vitamins", current: 48, forecast: 62 },
];

const platformFilter = ["All Platforms", "Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"];
const platformColors: Record<string, string> = { Amazon: "#FF9900", Flipkart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4", Instamart: "#FC8019" };
const categoryFilter = ["All Categories", "Protein", "Creatine", "Pre-Workout", "BCAA", "Vitamins"];

const trendingKwsByCategory: Record<string, { kw: string; vol: string; wow: string; opp: string; oppColor: string; platform?: string }[]> = {
  "All Categories": [
    { kw: "pre workout citrus", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Blinkit" },
    { kw: "women protein shake", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
    { kw: "electrolyte sachets", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Zepto" },
    { kw: "vegan protein bar", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
    { kw: "creatine gummies", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", platform: "Blinkit" },
    { kw: "whey isolate zero sugar", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Flipkart" },
    { kw: "gym supplement combo", vol: "8.9K", wow: "-4%", opp: "LOW", oppColor: "text-muted-foreground bg-surface-3", platform: "Amazon" },
  ],
  Protein: [
    { kw: "women protein shake", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
    { kw: "vegan protein bar", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
    { kw: "whey isolate zero sugar", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Flipkart" },
    { kw: "whey protein 2kg value pack", vol: "38.7K", wow: "+14%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
  ],
  Creatine: [
    { kw: "creatine gummies", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", platform: "Blinkit" },
    { kw: "creatine for women", vol: "8.2K", wow: "+42%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
    { kw: "creatine hcl", vol: "6.1K", wow: "+18%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Flipkart" },
  ],
  "Pre-Workout": [
    { kw: "pre workout citrus", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Blinkit" },
    { kw: "pre workout caffeine free", vol: "12.3K", wow: "+35%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", platform: "Amazon" },
    { kw: "pre workout pump formula", vol: "9.8K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
  ],
  BCAA: [
    { kw: "bcaa intra workout", vol: "15.2K", wow: "+19%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
    { kw: "eaa supplement", vol: "22.8K", wow: "+33%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Flipkart" },
  ],
  Vitamins: [
    { kw: "electrolyte sachets", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Zepto" },
    { kw: "ashwagandha ksm 66", vol: "41.2K", wow: "+52%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
    { kw: "daily multivitamin men", vol: "28.9K", wow: "+11%", opp: "LOW", oppColor: "text-muted-foreground bg-surface-3", platform: "Amazon" },
  ],
};

const opportunities = [
  { emoji: "⚡", title: "Creatine Gummies", desc: "61% search growth, <3 sellers on Blinkit, 0 Q-commerce competitors in category", tags: ["BLINKIT GAP", "HIGH IMPACT"], gradient: "from-sw-cyan/20 to-sw-cyan/5" },
  { emoji: "👩", title: "Women's Protein", desc: "44K monthly searches, only 2 SKUs in portfolio targeting this segment explicitly", tags: ["CONTENT GAP", "HIGH IMPACT"], gradient: "from-sw-purple/20 to-sw-purple/5" },
  { emoji: "💧", title: "Electrolyte Sachets", desc: "Summer surge incoming. 28% WoW growth, no sponsored listings on Zepto yet", tags: ["SEASONAL", "ACT NOW"], gradient: "from-sw-amber/20 to-sw-amber/5" },
];

// SoS data
const sosData = {
  yourSos: 28, sosChange: 2.4, topGainer: "MuscleBlaze", topGainerGain: 3.1, leader: "MuscleBlaze", leaderSos: 32,
};

const poachingIncidents = [
  { keyword: "shelfwise whey protein", competitor: "MuscleBlaze", platforms: ["Amazon", "Flipkart"], firstDetected: "Mar 12", severity: "High" },
  { keyword: "shelfwise creatine", competitor: "GNC", platforms: ["Blinkit"], firstDetected: "Mar 14", severity: "Medium" },
  { keyword: "shelfwise bcaa", competitor: "MyProtein", platforms: ["Zepto", "Amazon"], firstDetected: "Mar 15", severity: "Low" },
];

const retailerIssues = [
  { platform: "Zepto", desc: "SoS on Zepto down 12% WoW for Brand Search terms", keywords: 8 },
  { platform: "Blinkit", desc: "Not appearing in top 10 on Blinkit for 8 category keywords", keywords: 8 },
];

// SoS analytics data
const sosOverTime = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  you: Math.round(26 + Math.sin(i / 5) * 4 + Math.random() * 2),
  rival1: Math.round(30 + Math.cos(i / 6) * 3 + Math.random() * 2),
  rival2: Math.round(18 + Math.sin(i / 8) * 3 + Math.random() * 2),
  rival3: Math.round(12 + Math.random() * 3),
  categoryAvg: Math.round(20 + Math.random() * 2),
}));

const sosRetailerHeatmap = ["Blinkit", "Zepto", "Instamart", "Amazon", "Flipkart"].map(r => ({
  retailer: r,
  weeks: Array.from({ length: 8 }, () => Math.round(15 + Math.random() * 25)),
}));

const poachingHistory = [
  { keyword: "shelfwise whey", competitor: "MuscleBlaze", platform: "Amazon", duration: 12, impact: "-3% SoS", status: "Active" },
  { keyword: "shelfwise creatine", competitor: "GNC", platform: "Blinkit", duration: 5, impact: "-1% SoS", status: "Active" },
  { keyword: "shelfwise protein", competitor: "ON", platform: "Flipkart", duration: 18, impact: "-2% SoS", status: "Resolved" },
];

const shelfCoverageData: Record<string, {
  kw: string;
  Amazon: "sponsored" | "organic" | "none";
  Flipkart: "sponsored" | "organic" | "none";
  Blinkit: "sponsored" | "organic" | "none";
  Zepto: "sponsored" | "organic" | "none";
  Instamart: "sponsored" | "organic" | "none";
}[]> = {
  "All Categories": [
    { kw: "pre workout citrus", Amazon: "organic", Flipkart: "none", Blinkit: "sponsored", Zepto: "none", Instamart: "none" },
    { kw: "women protein shake", Amazon: "sponsored", Flipkart: "organic", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "creatine gummies", Amazon: "none", Flipkart: "none", Blinkit: "none", Zepto: "sponsored", Instamart: "none" },
    { kw: "whey isolate zero sugar", Amazon: "sponsored", Flipkart: "sponsored", Blinkit: "none", Zepto: "none", Instamart: "organic" },
    { kw: "electrolyte sachets", Amazon: "organic", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "vegan protein bar", Amazon: "none", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "gym supplement combo", Amazon: "sponsored", Flipkart: "organic", Blinkit: "none", Zepto: "none", Instamart: "none" },
  ],
  Protein: [
    { kw: "women protein shake", Amazon: "sponsored", Flipkart: "organic", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "vegan protein bar", Amazon: "none", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "whey isolate zero sugar", Amazon: "sponsored", Flipkart: "sponsored", Blinkit: "none", Zepto: "none", Instamart: "organic" },
    { kw: "whey protein 2kg value pack", Amazon: "sponsored", Flipkart: "sponsored", Blinkit: "organic", Zepto: "none", Instamart: "none" },
  ],
  Creatine: [
    { kw: "creatine gummies", Amazon: "none", Flipkart: "none", Blinkit: "none", Zepto: "sponsored", Instamart: "none" },
    { kw: "creatine for women", Amazon: "organic", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "creatine hcl", Amazon: "sponsored", Flipkart: "organic", Blinkit: "none", Zepto: "none", Instamart: "none" },
  ],
  "Pre-Workout": [
    { kw: "pre workout citrus", Amazon: "organic", Flipkart: "none", Blinkit: "sponsored", Zepto: "none", Instamart: "none" },
    { kw: "pre workout caffeine free", Amazon: "none", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "pre workout pump formula", Amazon: "organic", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
  ],
  BCAA: [
    { kw: "bcaa intra workout", Amazon: "sponsored", Flipkart: "organic", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "eaa supplement", Amazon: "organic", Flipkart: "sponsored", Blinkit: "none", Zepto: "none", Instamart: "none" },
  ],
  Vitamins: [
    { kw: "electrolyte sachets", Amazon: "organic", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
    { kw: "ashwagandha ksm 66", Amazon: "sponsored", Flipkart: "sponsored", Blinkit: "none", Zepto: "organic", Instamart: "none" },
    { kw: "daily multivitamin men", Amazon: "sponsored", Flipkart: "none", Blinkit: "none", Zepto: "none", Instamart: "none" },
  ],
};

const DiscoveryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [campaignActions, setCampaignActions] = useState<Record<number, boolean>>({});
  const g = useGuardrails();
  const [sosPlatformFilter, setSosPlatformFilter] = useState("All");

  const trendingKws = (trendingKwsByCategory[selectedCategory] || trendingKwsByCategory["All Categories"])
    .filter(k => selectedPlatform === "All Platforms" || k.platform === selectedPlatform);

  const allPlatforms = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"] as const;
  const visiblePlatforms = selectedPlatform === "All Platforms"
    ? allPlatforms
    : allPlatforms.filter(p => p === selectedPlatform);

  const coverageRows = shelfCoverageData[selectedCategory] ?? shelfCoverageData["All Categories"];

  const coverageStatusConfig = {
    sponsored: { color: "#2ECF8E", label: "Sponsored", bg: "rgba(46,207,142,0.15)" },
    organic: { color: "#F5A623", label: "Organic only", bg: "rgba(245,166,35,0.12)" },
    none: { color: "#FF5C5C", label: "Not listed", bg: "rgba(255,92,92,0.10)" },
  } as const;

  const missingCount = coverageRows.reduce((acc, row) => acc + visiblePlatforms.filter(p => row[p] === "none").length, 0);
  const sponsoredCount = coverageRows.reduce((acc, row) => acc + visiblePlatforms.filter(p => row[p] === "sponsored").length, 0);
  const totalApplicable = coverageRows.length * visiblePlatforms.length;
  const coveragePct = totalApplicable > 0 ? Math.round((sponsoredCount / totalApplicable) * 100) : 0;

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Trending Keywords" value="47" delta="▲ 12 new this week" deltaType="positive" sub="Across 6 platforms" accentColor="bg-sw-cyan" delay={0} />
        <KPICard title="Category Opportunities" value="9" delta="▲ High demand, low comp." deltaType="positive" sub="Ready to capture" accentColor="bg-sw-purple" delay={0.05} />
        <KPICard title="New Search Intents" value="23" delta="▲ Detected this month" deltaType="positive" sub="AI-detected from query logs" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Shelf coverage" value={`${coveragePct}%`} delta="▲ 3% vs last week" deltaType="positive" sub="Keywords with paid placement" accentColor="bg-sw-green" delay={0.15} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="🔥 Trending Keywords" badge={selectedCategory} badgeColor="accent" delay={0.2}>
          {/* Filters */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <div className="flex items-center gap-1 flex-wrap">
              {categoryFilter.map(c => (
                <button key={c} onClick={() => setSelectedCategory(c)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    selectedCategory === c ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {platformFilter.map(p => (
              <button key={p} onClick={() => setSelectedPlatform(p)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${
                  selectedPlatform === p ? "bg-sw-amber/20 text-sw-amber" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>
                {p !== "All Platforms" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platformColors[p] }} />}
                {p}
              </button>
            ))}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Keyword</th>
                <th className="text-right py-2 font-normal">Volume</th>
                <th className="text-right py-2 font-normal">△ WoW</th>
                <th className="text-right py-2 font-normal">Opportunity</th>
              </tr>
            </thead>
            <tbody>
              {trendingKws.length === 0 ? (
                <tr><td colSpan={4} className="py-4 text-center text-muted-foreground">No keywords match current filters</td></tr>
              ) : (
                trendingKws.map((k, i) => (
                  <tr key={k.kw} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground font-mono text-[11px]">{k.kw}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{k.vol}</td>
                    <td className={`py-2.5 text-right font-mono ${k.wow.startsWith("+") ? "text-sw-green" : "text-sw-red"}`}>{k.wow}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${k.oppColor}`}>{k.opp}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </PanelCard>

        <PanelCard title="📈 4-Week Demand Forecast" badge={`${selectedCategory} · 91% accuracy`} badgeColor="green" delay={0.25}>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {categoryFilter.map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  selectedCategory === c ? "bg-sw-green/20 text-sw-green" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-5">
            {forecasts.map((f) => (
              <div key={f.sku}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground">{f.sku}</span>
                  <span className={`font-mono text-[11px] ${f.delta.startsWith("+") ? "text-sw-green" : "text-sw-amber"}`}>{f.delta}</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {f.weeks.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className={`w-full ${f.color} rounded-sm`} style={{ height: `${w * 0.32}px`, opacity: 0.3 + (i * 0.23) }} />
                      <span className="text-[8px] text-muted-foreground font-mono">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      <PanelCard title="💡 Category White-Space Opportunities" badge="9 actionable" badgeColor="green" delay={0.3}>
        <div className="grid grid-cols-3 gap-4">
          {opportunities.map((o, i) => (
            <div key={o.title} className={`bg-gradient-to-br ${o.gradient} rounded-xl border border-subtle p-5`}>
              <p className="text-2xl mb-2">{o.emoji}</p>
              <h4 className="font-display font-bold text-foreground text-sm">{o.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {o.tags.map((t) => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface-3 text-foreground">{t}</span>
                ))}
              </div>
              <button onClick={() => setCampaignActions(p => ({ ...p, [i]: true }))}
                className={`mt-3 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  campaignActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}>
                <Megaphone size={10} />
                {campaignActions[i] ? "✓ Campaign Created" : "Create Campaign"}
              </button>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* SoS summary strip */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border border-subtle bg-surface-1 p-4">
          <p className="text-[10px] text-muted-foreground">Your SoS This Week</p>
          <p className="font-mono text-lg font-bold text-foreground mt-1">{sosData.yourSos}%</p>
          <p className="text-[9px] text-sw-green mt-0.5">▲ {sosData.sosChange}% vs last wk</p>
          <button onClick={() => setTab("analytics")} className="text-[10px] mt-1 inline-block" style={{ color: "#4F7FFF" }}>→ See full analytics</button>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 p-4">
          <p className="text-[10px] text-muted-foreground">SoS Change WoW</p>
          <p className="font-mono text-lg font-bold text-sw-green mt-1">+{sosData.sosChange}%</p>
          <button onClick={() => setTab("analytics")} className="text-[10px] mt-1 inline-block" style={{ color: "#4F7FFF" }}>→ See full analytics</button>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 p-4">
          <p className="text-[10px] text-muted-foreground">Top Gaining Competitor</p>
          <p className="font-mono text-sm font-bold text-sw-red mt-1">{sosData.topGainer}</p>
          <p className="text-[9px] text-muted-foreground mt-0.5">Gained +{sosData.topGainerGain}% SoS</p>
          <button onClick={() => setTab("analytics")} className="text-[10px] mt-1 inline-block" style={{ color: "#4F7FFF" }}>→ See full analytics</button>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 p-4">
          <p className="text-[10px] text-muted-foreground">Category SoS Leader</p>
          <p className="font-mono text-sm font-bold text-foreground mt-1">{sosData.leader}: {sosData.leaderSos}%</p>
          <button onClick={() => setTab("analytics")} className="text-[10px] mt-1 inline-block" style={{ color: "#4F7FFF" }}>→ See full analytics</button>
        </div>
      </div>

      {/* Brand keyword poaching */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #FF5C5C" }}>
        <div className="p-4 border-b border-subtle">
          <h3 className="text-sm font-medium text-foreground">Brand keyword poaching</h3>
        </div>
        {poachingIncidents.length === 0 ? (
          <div className="p-6 text-center text-xs text-muted-foreground">No poaching detected in last 7 days ✓</div>
        ) : (
          <div className="divide-y divide-subtle/50">
            {poachingIncidents.map((p, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="font-mono text-[11px] text-foreground flex-1">{p.keyword}</span>
                <span className="text-[10px] text-muted-foreground">{p.competitor}</span>
                <div className="flex gap-1">
                  {p.platforms.map(pl => (
                    <span key={pl} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground">{pl}</span>
                  ))}
                </div>
                <span className="text-[9px] text-muted-foreground">{p.firstDetected}</span>
                <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${p.severity === "High" ? "bg-sw-red/15 text-sw-red" : p.severity === "Medium" ? "bg-sw-amber/15 text-sw-amber" : "bg-surface-3 text-muted-foreground"}`}>{p.severity}</span>
                <button onClick={() => g.navigateWithContext("campaigns", "defense-insight", { type: "defense", params: { keyword: p.keyword, competitor: p.competitor } })} className="px-2 py-1 rounded-lg text-[10px] font-medium text-white flex-shrink-0" style={{ backgroundColor: "#A78BFA" }}>
                  Defend →
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Retailer visibility issues */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #F5A623" }}>
        <div className="p-4 border-b border-subtle">
          <h3 className="text-sm font-medium text-foreground">Retailer visibility issues</h3>
        </div>
        <div className="divide-y divide-subtle/50">
          {retailerIssues.map((r, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3">
              <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground flex-shrink-0">{r.platform}</span>
              <span className="text-[12px] text-foreground flex-1">{r.desc}</span>
              <span className="text-[10px] text-muted-foreground">{r.keywords} keywords</span>
              <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "sos-retailer", params: { platform: r.platform } })} className="text-[10px] font-medium flex-shrink-0" style={{ color: "#4F7FFF" }}>
                Fix visibility →
              </button>
            </div>
          ))}
        </div>
      </div>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Search Volume Trend — 30 Days" badge="All Categories" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={searchTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="volume" stroke="hsl(187,92%,43%)" strokeWidth={2} dot={false} name="Search Volume" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Category Demand Forecast" badge="Current vs Projected" badgeColor="green" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="current" fill="hsl(228,90%,64%)" opacity={0.5} radius={[4, 4, 0, 0]} name="Current" />
                <Bar dataKey="forecast" fill="hsl(160,70%,48%)" opacity={0.8} radius={[4, 4, 0, 0]} name="4-Week Forecast" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-primary opacity-50" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-green" /> Forecast</span>
            </div>
          </PanelCard>

          {/* SoS over time */}
          <PanelCard title="Share of Search Over Time — 30 Days" badge="Multi-brand" badgeColor="accent" delay={0.2}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {["All", "Blinkit", "Zepto", "Swiggy Instamart", "Amazon", "Flipkart"].map(p => (
                <button key={p} onClick={() => setSosPlatformFilter(p)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${sosPlatformFilter === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={sosOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="you" stroke="#A78BFA" strokeWidth={2} dot={false} name="You" />
                <Line type="monotone" dataKey="rival1" stroke="#FF5C5C" strokeWidth={2} dot={false} name="MuscleBlaze" />
                <Line type="monotone" dataKey="rival2" stroke="#FF8A80" strokeWidth={2} dot={false} name="ON" />
                <Line type="monotone" dataKey="rival3" stroke="#FFAB91" strokeWidth={2} dot={false} name="MyProtein" />
                <Line type="monotone" dataKey="categoryAvg" stroke="#555A6E" strokeWidth={1} dot={false} strokeDasharray="5 5" name="Category Avg" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5C5C" }} /> MuscleBlaze</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF8A80" }} /> ON</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-surface-3" /> Category Avg</span>
            </div>
          </PanelCard>

          {/* SoS by retailer heatmap */}
          <PanelCard title="SoS by Retailer — Weekly" badge="Heatmap" badgeColor="green" delay={0.3}>
            <div className="overflow-x-auto">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0" />
                  {Array.from({ length: 8 }, (_, i) => (
                    <span key={i} className="text-[8px] font-mono text-muted-foreground w-10 text-center flex-shrink-0">W{i + 1}</span>
                  ))}
                </div>
                {sosRetailerHeatmap.map(row => (
                  <div key={row.retailer} className="flex items-center gap-1">
                    <span className="text-[10px] text-foreground w-24 flex-shrink-0">{row.retailer}</span>
                    {row.weeks.map((val, wi) => (
                      <div key={wi} className="w-10 h-6 rounded-sm flex items-center justify-center flex-shrink-0" style={{
                        backgroundColor: val >= 30 ? "rgba(46,207,142,0.5)" : val >= 20 ? "rgba(245,166,35,0.4)" : "rgba(255,92,92,0.4)"
                      }}>
                        <span className="font-mono text-[8px] text-foreground">{val}%</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>

          {/* Poaching history */}
          <PanelCard title="Brand Keyword Poaching History" badge="Sortable" badgeColor="red" delay={0.4}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Keyword</th>
                  <th className="text-left py-2 font-normal">Competitor</th>
                  <th className="text-left py-2 font-normal">Platform</th>
                  <th className="text-right py-2 font-normal">Duration</th>
                  <th className="text-right py-2 font-normal">Impact</th>
                  <th className="text-center py-2 font-normal">Status</th>
                  <th className="text-right py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {poachingHistory.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 font-mono text-foreground">{p.keyword}</td>
                    <td className="py-2.5 text-foreground">{p.competitor}</td>
                    <td className="py-2.5"><span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground">{p.platform}</span></td>
                    <td className="py-2.5 text-right font-mono text-foreground">{p.duration}d</td>
                    <td className="py-2.5 text-right font-mono text-sw-red">{p.impact}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${p.status === "Active" ? "bg-sw-red/15 text-sw-red" : "bg-sw-green/15 text-sw-green"}`}>{p.status}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      {p.status === "Active" ? (
                        <button onClick={() => g.navigateWithContext("campaigns", "defense-insight", { type: "defense", params: { keyword: p.keyword } })} className="text-[10px] font-medium" style={{ color: "#4F7FFF" }}>Defense active</button>
                      ) : (
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green/15 text-sw-green">Resolved</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default DiscoveryView;
