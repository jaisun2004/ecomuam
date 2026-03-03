import KPICard from "@/components/KPICard";
import { Layers, Eye, Search, TrendingUp } from "lucide-react";
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

const shareBreakdown = [
  { type: "Organic", value: 62, color: "hsl(270, 70%, 50%)" },
  { type: "Sponsored", value: 38, color: "hsl(245, 58%, 51%)" },
];

const categoryShare = [
  { category: "Personal Care", you: 28, compA: 22, compB: 18, compC: 12 },
  { category: "Beverages", you: 35, compA: 20, compB: 15, compC: 10 },
  { category: "Snacks", you: 18, compA: 25, compB: 20, compC: 15 },
  { category: "Household", you: 22, compA: 18, compB: 22, compC: 16 },
];

const RankRow = ({ items, label }: { items: typeof organicRanks; label: string }) => (
  <div className="rounded-xl border bg-card shadow-card p-5">
    <h3 className="font-heading font-semibold text-foreground mb-1">{label}</h3>
    <p className="text-xs text-muted-foreground mb-4">{label.includes("Organic") ? "Am I winning the organic shelf?" : "Paid visibility vs Competitors"}</p>
    <div className="space-y-3">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
            <span className="text-sm font-bold text-foreground">{item.brand}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-xs text-muted-foreground block">Rank</span>
              <span className="text-xl font-bold text-foreground">#{item.rank}</span>
            </div>
            <div className={`text-xs font-bold px-2 py-1 rounded-full ${
              item.change < 0 ? 'bg-destructive/10 text-destructive' :
              item.change > 0 ? 'bg-success/10 text-success' :
              'bg-muted text-muted-foreground'
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
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Share of Shelf</h1>
        <p className="text-muted-foreground text-sm mt-1">Measure digital shelf visibility across search results and category pages</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Share of Shelf" value="38.2%" change={4.2} changeLabel="vs last month" icon={<Layers className="h-5 w-5" />} variant="primary" />
        <KPICard title="Organic Visibility" value="26%" change={3} changeLabel="search impressions" icon={<Eye className="h-5 w-5" />} variant="success" />
        <KPICard title="Sponsored Share" value="16%" change={-2} changeLabel="ad placements" icon={<Search className="h-5 w-5" />} variant="warning" />
        <KPICard title="Keywords Tracked" value="342" change={8} changeLabel="active keywords" icon={<TrendingUp className="h-5 w-5" />} />
      </div>

      {/* Organic + Sponsored Rank Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RankRow items={organicRanks} label="Organic Rank Tracker" />
        <RankRow items={sponsoredRanks} label="Sponsored Rank Tracker" />
      </div>

      {/* Share Breakdown + Cannibalisation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Share Breakdown</h3>
          <p className="text-xs text-muted-foreground mb-4">Organic vs Sponsored Visibility</p>
          <div className="flex items-end justify-center gap-8 h-48 px-4">
            {shareBreakdown.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center">
                <div className="relative w-16 bg-muted rounded-t-lg overflow-hidden border border-border border-b-0" style={{ height: '140px' }}>
                  <div
                    className="absolute bottom-0 left-0 right-0 transition-all duration-500 rounded-t-lg"
                    style={{ height: `${item.value}%`, backgroundColor: item.color }}
                  ></div>
                </div>
                <span className="mt-2 text-xl font-bold text-foreground">{item.value}%</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold">{item.type}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Rank Cannibalisation Detector</h3>
          <p className="text-xs text-muted-foreground mb-4">Am I paying for clicks I own organically?</p>
          <div className="h-56 bg-muted/30 rounded-lg border border-border relative p-4">
            <svg className="w-full h-full overflow-visible">
              <path d="M0,80 Q100,20 200,40 T400,10" fill="none" stroke="hsl(270, 70%, 50%)" strokeWidth="3" />
              <text x="410" y="10" fill="hsl(270, 70%, 50%)" fontSize="11" fontWeight="bold">"Energy Drink" (Org)</text>
              <path d="M0,150 Q100,140 200,100 T400,120" fill="none" stroke="hsl(245, 58%, 51%)" strokeWidth="2" strokeDasharray="5,5" />
              <text x="410" y="120" fill="hsl(245, 58%, 51%)" fontSize="11" fontWeight="bold">"Hydration" (Paid)</text>
              <circle cx="200" cy="40" r="15" fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="2" />
              <text x="220" y="45" fill="hsl(0, 72%, 51%)" fontSize="10" fontWeight="bold">High Overlap</text>
            </svg>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="text-xs bg-card border border-border hover:bg-muted text-foreground px-4 py-2 rounded-lg transition-colors font-medium shadow-card">
              Reduce Bids on Overlapping Terms
            </button>
          </div>
        </div>
      </div>

      {/* Trend + Radar */}
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

      {/* Category Share */}
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
    </div>
  );
};

export default ShelfSection;
