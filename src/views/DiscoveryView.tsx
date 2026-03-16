import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { Megaphone } from "lucide-react";
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

const forecastsByCategory: Record<string, { sku: string; delta: string; color: string; weeks: number[] }[]> = {
  "All Categories": [
    { sku: "Whey 1kg Chocolate", delta: "+18%", color: "bg-primary", weeks: [60, 65, 72, 80] },
    { sku: "Pre-Workout Citrus", delta: "+47%", color: "bg-sw-cyan", weeks: [40, 55, 70, 90] },
    { sku: "Creatine Monohydrate", delta: "-8%", color: "bg-sw-amber", weeks: [75, 72, 68, 65] },
    { sku: "BCAA Tropical", delta: "+12%", color: "bg-sw-purple", weeks: [55, 58, 62, 66] },
  ],
  Protein: [
    { sku: "Whey 1kg Chocolate", delta: "+18%", color: "bg-primary", weeks: [60, 65, 72, 80] },
    { sku: "Whey 500g Vanilla", delta: "+12%", color: "bg-sw-green", weeks: [50, 54, 58, 62] },
    { sku: "Whey Isolate 1kg", delta: "+24%", color: "bg-sw-cyan", weeks: [35, 42, 50, 60] },
  ],
  Creatine: [
    { sku: "Creatine Monohydrate", delta: "-8%", color: "bg-sw-amber", weeks: [75, 72, 68, 65] },
    { sku: "Creatine HCL 120caps", delta: "+15%", color: "bg-sw-green", weeks: [30, 35, 40, 48] },
  ],
  "Pre-Workout": [
    { sku: "Pre-Workout Citrus", delta: "+47%", color: "bg-sw-cyan", weeks: [40, 55, 70, 90] },
    { sku: "Pre-Workout Berry", delta: "+22%", color: "bg-sw-purple", weeks: [45, 50, 58, 65] },
  ],
  BCAA: [
    { sku: "BCAA Tropical", delta: "+12%", color: "bg-sw-purple", weeks: [55, 58, 62, 66] },
    { sku: "EAA Lemon", delta: "+28%", color: "bg-sw-green", weeks: [30, 38, 48, 58] },
  ],
  Vitamins: [
    { sku: "Multi-Vit 60ct", delta: "+5%", color: "bg-sw-amber", weeks: [60, 62, 63, 65] },
    { sku: "Ashwagandha 120caps", delta: "+38%", color: "bg-sw-green", weeks: [25, 35, 48, 62] },
  ],
};

const opportunities = [
  { emoji: "⚡", title: "Creatine Gummies", desc: "61% search growth, <3 sellers on Blinkit, 0 Q-commerce competitors in category", tags: ["BLINKIT GAP", "HIGH IMPACT"], gradient: "from-sw-cyan/20 to-sw-cyan/5" },
  { emoji: "👩", title: "Women's Protein", desc: "44K monthly searches, only 2 SKUs in portfolio targeting this segment explicitly", tags: ["CONTENT GAP", "HIGH IMPACT"], gradient: "from-sw-purple/20 to-sw-purple/5" },
  { emoji: "💧", title: "Electrolyte Sachets", desc: "Summer surge incoming. 28% WoW growth, no sponsored listings on Zepto yet", tags: ["SEASONAL", "ACT NOW"], gradient: "from-sw-amber/20 to-sw-amber/5" },
];

const DiscoveryView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [campaignActions, setCampaignActions] = useState<Record<number, boolean>>({});

  const trendingKws = (trendingKwsByCategory[selectedCategory] || trendingKwsByCategory["All Categories"])
    .filter(k => selectedPlatform === "All Platforms" || k.platform === selectedPlatform);

  const forecasts = forecastsByCategory[selectedCategory] || forecastsByCategory["All Categories"];

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Trending Keywords" value="47" delta="▲ 12 new this week" deltaType="positive" sub="Across 6 platforms" accentColor="bg-sw-cyan" delay={0} />
        <KPICard title="Category Opportunities" value="9" delta="▲ High demand, low comp." deltaType="positive" sub="Ready to capture" accentColor="bg-sw-purple" delay={0.05} />
        <KPICard title="New Search Intents" value="23" delta="▲ Detected this month" deltaType="positive" sub="AI-detected from query logs" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Forecast Accuracy" value="91%" delta="▲ 4% vs last quarter" deltaType="positive" sub="SKU-level 4-week forecast" accentColor="bg-sw-amber" delay={0.15} />
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
    </div>
  );
};

export default DiscoveryView;
