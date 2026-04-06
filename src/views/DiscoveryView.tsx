import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { Megaphone, ArrowRight, TrendingUp, ChevronDown, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";

const searchTrendData = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  volume: Math.round(40000 + Math.random() * 20000),
}));

const demandForecast = [
  { category: "Cream Biscuits", current: 85, forecast: 102 },
  { category: "Glucose", current: 42, forecast: 38 },
  { category: "Digestive", current: 55, forecast: 78 },
  { category: "Cookies", current: 30, forecast: 35 },
  { category: "Health & Fibre", current: 48, forecast: 62 },
];

const platformFilter = ["All Platforms", "Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"];
const platformColors: Record<string, string> = { Amazon: "#FF9900", Flipkart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4", Instamart: "#FC8019" };
const categoryFilter = ["All Categories", "Cream Biscuits", "Glucose", "Digestive", "Cookies", "Health & Fibre"];

const trendingKwsByCategory: Record<string, { kw: string; vol: string; wow: string; opp: string; oppColor: string; platform?: string }[]> = {
  "All Categories": [
    { kw: "butter biscuits online", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Blinkit" },
    { kw: "cream biscuits combo", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
    { kw: "sugar free biscuits", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Zepto" },
    { kw: "digestive biscuits fibre", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
    { kw: "choco chip cookies pack", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", platform: "Blinkit" },
    { kw: "glucose biscuits bulk", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Flipkart" },
    { kw: "biscuit gift pack", vol: "8.9K", wow: "-4%", opp: "LOW", oppColor: "text-muted-foreground bg-surface-3", platform: "Amazon" },
  ],
  "Cream Biscuits": [
    { kw: "cream biscuits combo", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", platform: "Amazon" },
    { kw: "bourbon cream biscuit", vol: "18.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
  ],
  Glucose: [
    { kw: "glucose biscuits bulk", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Flipkart" },
  ],
  Digestive: [
    { kw: "digestive biscuits fibre", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Amazon" },
  ],
  Cookies: [
    { kw: "choco chip cookies pack", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", platform: "Blinkit" },
  ],
  "Health & Fibre": [
    { kw: "sugar free biscuits", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", platform: "Zepto" },
  ],
};

// SoS data
const sosData = {
  yourSos: 28, sosChange: 2.4, topGainer: "Parle", topGainerGain: 3.1, leader: "Parle", leaderSos: 32,
};

const poachingIncidents = [
  { keyword: "britannia good day", competitor: "Sunfeast", platforms: ["Amazon", "Flipkart"], firstDetected: "Mar 12", severity: "High" },
  { keyword: "britannia biscuits", competitor: "Parle", platforms: ["Blinkit"], firstDetected: "Mar 14", severity: "Medium" },
  { keyword: "britannia bourbon", competitor: "ITC", platforms: ["Zepto", "Amazon"], firstDetected: "Mar 15", severity: "Low" },
];

const retailerIssues = [
  { platform: "Zepto", desc: "SoS on Zepto down 12% WoW for Brand Search terms", keywords: 8 },
  { platform: "Blinkit", desc: "Not appearing in top 10 on Blinkit for 8 category keywords", keywords: 8 },
];

// Competition rank improvements
const compRankImprovements = [
  { product: "Sunfeast Butter Cookies 200g", brand: "Sunfeast", platform: "Amazon", lastWeekSponsored: 8, thisWeekSponsored: 3, lastWeekOrganic: 12, thisWeekOrganic: 6 },
  { product: "Parle-G Gold 200g", brand: "Parle", platform: "Flipkart", lastWeekSponsored: 6, thisWeekSponsored: 2, lastWeekOrganic: 9, thisWeekOrganic: 4 },
  { product: "Unibic Butter Cookies 150g", brand: "Unibic", platform: "Blinkit", lastWeekSponsored: 14, thisWeekSponsored: 5, lastWeekOrganic: 18, thisWeekOrganic: 10 },
  { product: "McVities Digestive 200g", brand: "McVities", platform: "Amazon", lastWeekSponsored: 10, thisWeekSponsored: 4, lastWeekOrganic: 15, thisWeekOrganic: 7 },
  { product: "Sunfeast Dark Fantasy 75g", brand: "Sunfeast", platform: "Zepto", lastWeekSponsored: 12, thisWeekSponsored: 6, lastWeekOrganic: 20, thisWeekOrganic: 11 },
  { product: "Parle Hide & Seek 100g", brand: "Parle", platform: "Instamart", lastWeekSponsored: 9, thisWeekSponsored: 3, lastWeekOrganic: 14, thisWeekOrganic: 8 },
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
  { keyword: "britannia good day", competitor: "Sunfeast", platform: "Amazon", duration: 12, impact: "-3% SoS", status: "Active" },
  { keyword: "britannia biscuits", competitor: "Parle", platform: "Blinkit", duration: 5, impact: "-1% SoS", status: "Active" },
  { keyword: "britannia bourbon", competitor: "ITC", platform: "Flipkart", duration: 18, impact: "-2% SoS", status: "Resolved" },
];

/* ── Merged keyword + shelf coverage data with binary + avg rank ── */
const shelfCoverageData: Record<string, {
  kw: string;
  vol: string;
  wow: string;
  opp: string;
  oppColor: string;
  Amazon: { organic: boolean; sponsored: boolean; avgOrgRank: number | null; avgSponRank: number | null };
  Flipkart: { organic: boolean; sponsored: boolean; avgOrgRank: number | null; avgSponRank: number | null };
  Blinkit: { organic: boolean; sponsored: boolean; avgOrgRank: number | null; avgSponRank: number | null };
  Zepto: { organic: boolean; sponsored: boolean; avgOrgRank: number | null; avgSponRank: number | null };
  Instamart: { organic: boolean; sponsored: boolean; avgOrgRank: number | null; avgSponRank: number | null };
}[]> = {
  "All Categories": [
    { kw: "butter biscuits online", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", Amazon: { organic: true, sponsored: false, avgOrgRank: 4, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: true, avgOrgRank: null, avgSponRank: 3 }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
    { kw: "cream biscuits combo", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", Amazon: { organic: true, sponsored: true, avgOrgRank: 2, avgSponRank: 1 }, Flipkart: { organic: true, sponsored: false, avgOrgRank: 6, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
    { kw: "choco chip cookies pack", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", Amazon: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: true, avgOrgRank: null, avgSponRank: 5 }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
    { kw: "glucose biscuits bulk", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", Amazon: { organic: true, sponsored: true, avgOrgRank: 3, avgSponRank: 2 }, Flipkart: { organic: false, sponsored: true, avgOrgRank: null, avgSponRank: 4 }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: true, sponsored: false, avgOrgRank: 8, avgSponRank: null } },
    { kw: "sugar free biscuits", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", Amazon: { organic: true, sponsored: false, avgOrgRank: 5, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
    { kw: "digestive biscuits fibre", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", Amazon: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
    { kw: "biscuit gift pack", vol: "8.9K", wow: "-4%", opp: "LOW", oppColor: "text-muted-foreground bg-surface-3", Amazon: { organic: true, sponsored: true, avgOrgRank: 3, avgSponRank: 1 }, Flipkart: { organic: true, sponsored: false, avgOrgRank: 4, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
  ],
  "Cream Biscuits": [
    { kw: "cream biscuits combo", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim", Amazon: { organic: true, sponsored: true, avgOrgRank: 2, avgSponRank: 1 }, Flipkart: { organic: true, sponsored: false, avgOrgRank: 6, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
  ],
  Glucose: [
    { kw: "glucose biscuits bulk", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", Amazon: { organic: true, sponsored: true, avgOrgRank: 3, avgSponRank: 2 }, Flipkart: { organic: false, sponsored: true, avgOrgRank: null, avgSponRank: 4 }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: true, sponsored: false, avgOrgRank: 8, avgSponRank: null } },
  ],
  Digestive: [
    { kw: "digestive biscuits fibre", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", Amazon: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
  ],
  Cookies: [
    { kw: "choco chip cookies pack", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim", Amazon: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: true, avgOrgRank: null, avgSponRank: 5 }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
  ],
  "Health & Fibre": [
    { kw: "sugar free biscuits", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim", Amazon: { organic: true, sponsored: false, avgOrgRank: 5, avgSponRank: null }, Flipkart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Blinkit: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Zepto: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null }, Instamart: { organic: false, sponsored: false, avgOrgRank: null, avgSponRank: null } },
  ],
};

const DiscoveryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const g = useGuardrails();
  const [sosPlatformFilter, setSosPlatformFilter] = useState("All");
  const [showCompRankDetail, setShowCompRankDetail] = useState(false);

  const allPlatforms = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"] as const;
  const visiblePlatforms = selectedPlatform === "All Platforms"
    ? allPlatforms
    : allPlatforms.filter(p => p === selectedPlatform);

  const coverageRows = shelfCoverageData[selectedCategory] ?? shelfCoverageData["All Categories"];

  // Calculate overall share of shelf on generic keywords
  const totalSlots = coverageRows.length * visiblePlatforms.length;
  const presentSlots = coverageRows.reduce((acc, row) => acc + visiblePlatforms.filter(p => row[p].organic || row[p].sponsored).length, 0);
  const shareOfShelf = totalSlots > 0 ? Math.round((presentSlots / totalSlots) * 100) : 0;

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Trending Keywords" value="47" delta="▲ 12 new this week" deltaType="positive" <KPICard title="Trending Keywords" value="47" delta="▲ 12 new this week" deltaType="positive" sub="Good — early capture opportunity on rising search terms" accentColor="bg-sw-cyan" delay={0} /> accentColor="bg-sw-cyan" delay={0} />
        <KPICard title="Competition Rank Improved" value={String(compRankImprovements.length)} delta="▲ WoW rank gains" deltaType="negative" <KPICard title="Competition Rank Improved" value={String(compRankImprovements.length)} delta="▲ WoW rank gains" deltaType="negative" sub="Risk — competitors climbing on your core keywords" accentColor="bg-sw-red" delay={0.05} /> accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="New Keywords on Ad Manager" value="23" delta="▲ Detected this month" deltaType="positive" sub="AI-detected from ad platforms" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Overall Share of Shelf" value={`${shareOfShelf}%`} delta="▲ 3% vs last week" deltaType="positive" sub="Presence on generic keywords" accentColor="bg-sw-green" delay={0.15} />
      </div>

      {/* Competition Products Rank Improvement */}
      <PanelCard title="📈 Competition Products — Rank Improved WoW" badge={`${compRankImprovements.length} products`} badgeColor="red" delay={0.18}>
        <p className="text-[10px] text-muted-foreground mb-3">Competition products that improved their rank week-on-week. Click to see full details.</p>
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] text-foreground font-medium">{compRankImprovements.length} competitor products improved rank this week</span>
          <button onClick={() => setShowCompRankDetail(!showCompRankDetail)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium bg-sw-red/15 text-sw-red hover:bg-sw-red/25 transition-all">
            <TrendingUp size={12} />
            {showCompRankDetail ? "Hide Details" : "View All Products"}
          </button>
        </div>
        {showCompRankDetail && (
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-separate" style={{ borderSpacing: "0 2px" }}>
              <thead>
                <tr>
                  <th className="text-left py-2 pr-3 font-normal text-muted-foreground text-[10px]">Product</th>
                  <th className="text-left py-2 font-normal text-[10px] text-muted-foreground">Brand</th>
                  <th className="text-left py-2 font-normal text-[10px] text-muted-foreground">Platform</th>
                  <th className="text-center py-2 font-normal text-[10px] text-muted-foreground" colSpan={2}>Sponsored Rank</th>
                  <th className="text-center py-2 font-normal text-[10px] text-muted-foreground" colSpan={2}>Organic Rank</th>
                </tr>
                <tr>
                  <th colSpan={3} />
                  <th className="text-center py-1 font-normal text-[9px] text-muted-foreground">Last Wk</th>
                  <th className="text-center py-1 font-normal text-[9px] text-muted-foreground">This Wk</th>
                  <th className="text-center py-1 font-normal text-[9px] text-muted-foreground">Last Wk</th>
                  <th className="text-center py-1 font-normal text-[9px] text-muted-foreground">This Wk</th>
                </tr>
              </thead>
              <tbody>
                {compRankImprovements.map((p, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-surface-2/40" : ""}>
                    <td className="py-2 pr-3 text-[11px] text-foreground">{p.product}</td>
                    <td className="py-2 text-[10px] text-muted-foreground">{p.brand}</td>
                    <td className="py-2"><span className="font-mono text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: `${platformColors[p.platform] || "#888"}20`, color: platformColors[p.platform] || "#888" }}>{p.platform}</span></td>
                    <td className="py-2 text-center font-mono text-[10px] text-muted-foreground">#{p.lastWeekSponsored}</td>
                    <td className="py-2 text-center font-mono text-[10px] text-sw-green font-bold">#{p.thisWeekSponsored}</td>
                    <td className="py-2 text-center font-mono text-[10px] text-muted-foreground">#{p.lastWeekOrganic}</td>
                    <td className="py-2 text-center font-mono text-[10px] text-sw-green font-bold">#{p.thisWeekOrganic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </PanelCard>

      {/* MERGED: Keywords & Share of Shelf */}
      <PanelCard title="🔥 Keywords & Share of Shelf" badge={`${selectedCategory} · ${selectedPlatform}`} badgeColor="accent" delay={0.2}>
        {/* Filters */}
        <div className="flex items-center gap-3 mb-3">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px] h-8 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categoryFilter.map(c => (
                <SelectItem key={c} value={c} className="text-[11px]">{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[180px] h-8 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {platformFilter.map(p => (
                <SelectItem key={p} value={p} className="text-[11px]">{p}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs border-separate" style={{ borderSpacing: "0 2px" }}>
            <thead>
              <tr>
                <th className="text-left py-2 pr-3 font-normal text-muted-foreground text-[10px] w-40">Keyword</th>
                <th className="text-right py-2 font-normal text-[10px] text-muted-foreground w-16">Volume</th>
                <th className="text-right py-2 font-normal text-[10px] text-muted-foreground w-14">△ WoW</th>
                <th className="text-center py-2 font-normal text-[10px] text-muted-foreground w-16">Opportunity</th>
                {visiblePlatforms.map(p => (
                  <th key={p} className="text-center py-2 font-normal text-[9px] text-muted-foreground" colSpan={1}>
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platformColors[p] ?? "#888" }} />
                      <span>{p}</span>
                      <span className="text-[7px]">Org / Spon</span>
                    </div>
                  </th>
                ))}
                <th className="text-center py-2 font-normal text-[9px] text-muted-foreground">Avg Org Rank</th>
                <th className="text-center py-2 font-normal text-[9px] text-muted-foreground">Avg Spon Rank</th>
              </tr>
            </thead>
            <tbody>
              {coverageRows.map((row, i) => {
                // Compute avg ranks across visible platforms
                const orgRanks = visiblePlatforms.map(p => row[p].avgOrgRank).filter((r): r is number => r !== null);
                const sponRanks = visiblePlatforms.map(p => row[p].avgSponRank).filter((r): r is number => r !== null);
                const avgOrg = orgRanks.length > 0 ? (orgRanks.reduce((a, b) => a + b, 0) / orgRanks.length).toFixed(1) : "—";
                const avgSpon = sponRanks.length > 0 ? (sponRanks.reduce((a, b) => a + b, 0) / sponRanks.length).toFixed(1) : "—";

                return (
                <tr key={row.kw} className={i % 2 === 0 ? "bg-surface-2/40" : ""}>
                  <td className="py-2 pr-3 font-mono text-[10px] text-foreground truncate max-w-[140px]" title={row.kw}>{row.kw}</td>
                  <td className="py-2 text-right font-mono text-[10px] text-foreground">{row.vol}</td>
                  <td className={`py-2 text-right font-mono text-[10px] ${row.wow.startsWith("+") ? "text-sw-green" : "text-sw-red"}`}>{row.wow}</td>
                  <td className="py-2 text-center">
                    <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${row.oppColor}`}>{row.opp}</span>
                  </td>
                  {visiblePlatforms.map(p => {
                    const pd = row[p];
                    return (
                      <td key={p} className="py-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className={`font-mono text-[9px] ${pd.organic ? "text-sw-green" : "text-sw-red"}`}>{pd.organic ? "Y" : "N"}</span>
                          <span className="text-[8px] text-muted-foreground">/</span>
                          <span className={`font-mono text-[9px] ${pd.sponsored ? "text-sw-green" : "text-sw-red"}`}>{pd.sponsored ? "Y" : "N"}</span>
                        </div>
                      </td>
                    );
                  })}
                  <td className="py-2 text-center font-mono text-[10px] text-foreground">{avgOrg}</td>
                  <td className="py-2 text-center font-mono text-[10px] text-foreground">{avgSpon}</td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-subtle">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-mono text-sw-green">Y</span> = Present
          </span>
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="font-mono text-sw-red">N</span> = Not listed
          </span>
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
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="volume" stroke="hsl(187,92%,43%)" strokeWidth={2} dot={false} name="Search Volume" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Category Demand Forecast" badge="Current vs Projected" badgeColor="green" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={demandForecast}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="category" tick={{ fontSize: 10, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="current" fill="hsl(228,90%,64%)" opacity={0.5} radius={[4, 4, 0, 0]} name="Current" />
                <Bar dataKey="forecast" fill="hsl(160,70%,48%)" opacity={0.8} radius={[4, 4, 0, 0]} name="4-Week Forecast" />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-primary opacity-50" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-green" /> Forecast</span>
            </div>
          </PanelCard>

          <PanelCard title="Share of Search Over Time — 30 Days" badge="Multi-brand" badgeColor="accent" delay={0.2}>
            <div className="flex items-center gap-2 mb-3">
              <Select value={sosPlatformFilter} onValueChange={setSosPlatformFilter}>
                <SelectTrigger className="w-[200px] h-8 text-[11px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["All", "Blinkit", "Zepto", "Swiggy Instamart", "Amazon", "Flipkart"].map(p => (
                    <SelectItem key={p} value={p} className="text-[11px]">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={sosOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="you" stroke="#A78BFA" strokeWidth={2} dot={false} name="You" />
                <Line type="monotone" dataKey="rival1" stroke="#FF5C5C" strokeWidth={2} dot={false} name="Parle" />
                <Line type="monotone" dataKey="rival2" stroke="#FF8A80" strokeWidth={2} dot={false} name="Sunfeast" />
                <Line type="monotone" dataKey="rival3" stroke="#FFAB91" strokeWidth={2} dot={false} name="ITC" />
                <Line type="monotone" dataKey="categoryAvg" stroke="hsl(220,10%,46%)" strokeWidth={1} dot={false} strokeDasharray="5 5" name="Category Avg" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5C5C" }} /> Parle</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF8A80" }} /> Sunfeast</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-surface-3" /> Category Avg</span>
            </div>
          </PanelCard>

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
