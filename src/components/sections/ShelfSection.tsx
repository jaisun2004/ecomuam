import { useState } from "react";
import KPICard from "@/components/KPICard";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import { Layers, Eye, Search, TrendingUp, Target, Shield } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, BarChart, Bar,
} from "recharts";

const sosTrend = [
  { date: "Week 1", organic: 22, sponsored: 15, total: 37 },
  { date: "Week 2", organic: 24, sponsored: 13, total: 37 },
  { date: "Week 3", organic: 20, sponsored: 18, total: 38 },
  { date: "Week 4", organic: 26, sponsored: 16, total: 42 },
];

const radarData = [
  { keyword: "Face Wash", you: 85, competitor: 72 },
  { keyword: "Shampoo", you: 68, competitor: 80 },
  { keyword: "Body Lotion", you: 92, competitor: 65 },
  { keyword: "Hand Cream", you: 55, competitor: 78 },
  { keyword: "Sunscreen", you: 78, competitor: 70 },
  { keyword: "Hair Oil", you: 70, competitor: 85 },
];

const organicRanks = [
  { brand: "Your Brand", rank: 1, change: 2, color: "hsl(270, 70%, 50%)" },
  { brand: "Competitor A", rank: 2, change: -1, color: "hsl(0, 72%, 51%)" },
  { brand: "Competitor B", rank: 3, change: 0, color: "hsl(217, 91%, 60%)" },
  { brand: "Competitor C", rank: 5, change: 1, color: "hsl(172, 66%, 50%)" },
];

const sponsoredRanks = [
  { brand: "Your Brand", rank: 2, change: -1, color: "hsl(270, 70%, 50%)" },
  { brand: "Competitor A", rank: 1, change: 1, color: "hsl(0, 72%, 51%)" },
  { brand: "Competitor B", rank: 3, change: 0, color: "hsl(217, 91%, 60%)" },
  { brand: "Competitor C", rank: 4, change: 2, color: "hsl(172, 66%, 50%)" },
];

const categoryShare = [
  { category: "Personal Care", you: 28, compA: 22, compB: 18, compC: 12 },
  { category: "Beverages", you: 35, compA: 20, compB: 15, compC: 10 },
  { category: "Snacks", you: 18, compA: 25, compB: 20, compC: 15 },
  { category: "Household", you: 22, compA: 18, compB: 22, compC: 16 },
];

const campaignTriggers: CampaignTrigger[] = [
  {
    id: "shelf-1", signal: "Lost #1 organic rank on 'Face Wash'",
    signalDetail: "Competitor A overtook your organic position with aggressive SEO + sponsored ads",
    strategy: "Rank Recovery Blitz", campaignType: "Sponsored Product Ads (exact match)",
    platforms: ["Amazon", "Flipkart"],
    keywords: ["face wash", "face cleanser", "best face wash", "face wash for oily skin"],
    estimatedImpact: "Recover #1 rank in 5-7 days", urgency: "critical",
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
  {
    id: "shelf-2", signal: "Competitor reducing ad spend on Shampoo",
    signalDetail: "Competitor B sponsored visibility dropped 40% this week",
    strategy: "Ad Gap Exploitation", campaignType: "Category Targeting + Sponsored Display",
    platforms: ["Amazon", "Blinkit", "BigBasket"],
    keywords: ["shampoo", "anti dandruff shampoo", "hair care", "natural shampoo"],
    estimatedImpact: "+8% shelf share in Shampoo", urgency: "high",
    icon: <Shield className="h-4 w-4 text-warning" />,
  },
];

const RankRow = ({ items, label }: { items: typeof organicRanks; label: string }) => (
  <div className="rounded-xl border bg-card shadow-card p-5">
    <h3 className="font-heading font-semibold text-foreground mb-1">{label}</h3>
    <p className="text-xs text-muted-foreground mb-3">{label.includes("Organic") ? "Organic shelf position" : "Paid visibility vs Competitors"}</p>
    <div className="space-y-2.5">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm font-bold text-foreground">{item.brand}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-foreground">#{item.rank}</span>
            <div className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              item.change < 0 ? 'bg-destructive/10 text-destructive' :
              item.change > 0 ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'
            }`}>
              {item.change > 0 ? '▲' : item.change < 0 ? '▼' : '−'} {Math.abs(item.change)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const ShelfSection = () => {
  const [deepDive, setDeepDive] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Share of Shelf</h1>
          <p className="text-muted-foreground text-sm mt-1">Digital shelf visibility and campaign triggers to reclaim positions</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall SoS" value="38.2%" change={4.2} changeLabel="vs last month" icon={<Layers className="h-5 w-5" />} variant="primary" />
        <KPICard title="Organic Visibility" value="26%" change={3} changeLabel="search impressions" icon={<Eye className="h-5 w-5" />} variant="success" />
        <KPICard title="Sponsored Share" value="16%" change={-2} changeLabel="ad placements" icon={<Search className="h-5 w-5" />} variant="warning" />
        <KPICard title="Keywords Tracked" value="342" change={8} changeLabel="active keywords" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={campaignTriggers} title="Shelf-Based Campaign Triggers" />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <RankRow items={organicRanks} label="Organic Rank Tracker" />
            <RankRow items={sponsoredRanks} label="Sponsored Rank Tracker" />
          </div>

          {/* Cannibalisation Detector */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Rank Cannibalisation Detector</h3>
            <p className="text-xs text-muted-foreground mb-4">Am I paying for clicks I own organically?</p>
            <div className="h-48 bg-muted/30 rounded-lg border border-border relative p-4">
              <svg className="w-full h-full overflow-visible">
                <path d="M0,80 Q100,20 200,40 T400,10" fill="none" stroke="hsl(270, 70%, 50%)" strokeWidth="3" />
                <text x="410" y="10" fill="hsl(270, 70%, 50%)" fontSize="11" fontWeight="bold">"Energy Drink" (Org)</text>
                <path d="M0,150 Q100,140 200,100 T400,120" fill="none" stroke="hsl(245, 58%, 51%)" strokeWidth="2" strokeDasharray="5,5" />
                <text x="410" y="120" fill="hsl(245, 58%, 51%)" fontSize="11" fontWeight="bold">"Hydration" (Paid)</text>
                <circle cx="200" cy="40" r="15" fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="2" />
                <text x="220" y="45" fill="hsl(0, 72%, 51%)" fontSize="10" fontWeight="bold">High Overlap</text>
              </svg>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Deep Dive */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Share of Shelf Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={sosTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Legend />
                  <Area type="monotone" dataKey="organic" name="Organic" stackId="1" fill="hsl(270, 70%, 50%)" fillOpacity={0.6} stroke="hsl(270, 70%, 50%)" />
                  <Area type="monotone" dataKey="sponsored" name="Sponsored" stackId="1" fill="hsl(245, 58%, 51%)" fillOpacity={0.4} stroke="hsl(245, 58%, 51%)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Keyword Visibility: You vs Competition</h3>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(260, 15%, 88%)" />
                  <PolarAngleAxis dataKey="keyword" tick={{ fontSize: 10 }} stroke="hsl(260, 10%, 50%)" />
                  <Radar name="You" dataKey="you" stroke="hsl(270, 70%, 50%)" fill="hsl(270, 70%, 50%)" fillOpacity={0.3} />
                  <Radar name="Top Competitor" dataKey="competitor" stroke="hsl(0, 72%, 51%)" fill="hsl(0, 72%, 51%)" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4">Category-wise Share of Shelf</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryShare}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} stroke="hsl(260, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                <Legend />
                <Bar dataKey="you" name="You" fill="hsl(270, 70%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compA" name="Comp A" fill="hsl(217, 91%, 60%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compB" name="Comp B" fill="hsl(172, 66%, 50%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="compC" name="Comp C" fill="hsl(260, 15%, 82%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  );
};

export default ShelfSection;
