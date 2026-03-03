import KPICard from "@/components/KPICard";
import { Layers, Eye, Search, TrendingUp } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Legend, RadarChart, PolarGrid, PolarAngleAxis, Radar,
} from "recharts";

const sosTrend = [
  { date: "Week 1", organic: 22, sponsored: 15, total: 37 },
  { date: "Week 2", organic: 24, sponsored: 13, total: 37 },
  { date: "Week 3", organic: 20, sponsored: 18, total: 38 },
  { date: "Week 4", organic: 26, sponsored: 16, total: 42 },
];

const categoryShare = [
  { category: "Personal Care", you: 28, compA: 22, compB: 18, compC: 12 },
  { category: "Beverages", you: 35, compA: 20, compB: 15, compC: 10 },
  { category: "Snacks", you: 18, compA: 25, compB: 20, compC: 15 },
  { category: "Household", you: 22, compA: 18, compB: 22, compC: 16 },
];

const radarData = [
  { keyword: "Face Wash", you: 85, competitor: 72 },
  { keyword: "Shampoo", you: 68, competitor: 80 },
  { keyword: "Body Lotion", you: 92, competitor: 65 },
  { keyword: "Hand Cream", you: 55, competitor: 78 },
  { keyword: "Sunscreen", you: 78, competitor: 70 },
  { keyword: "Hair Oil", you: 70, competitor: 85 },
];

const topKeywords = [
  { keyword: "organic face wash", sos: 34, change: 5, position: 1 },
  { keyword: "natural shampoo", sos: 28, change: -3, position: 2 },
  { keyword: "moisturizing lotion", sos: 22, change: 8, position: 1 },
  { keyword: "vitamin c serum", sos: 18, change: 2, position: 3 },
  { keyword: "hair care combo", sos: 15, change: -1, position: 4 },
  { keyword: "anti dandruff", sos: 12, change: 6, position: 2 },
];

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

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 rounded-xl border bg-card shadow-card p-5">
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

        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Top Keywords</h3>
          <div className="space-y-3">
            {topKeywords.map((kw) => (
              <div key={kw.keyword} className="flex items-center gap-3 text-sm">
                <span className="h-6 w-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center">
                  {kw.position}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">{kw.keyword}</p>
                  <p className="text-xs text-muted-foreground">SoS: {kw.sos}%</p>
                </div>
                <span className={`text-xs font-bold ${kw.change > 0 ? "text-success" : "text-destructive"}`}>
                  {kw.change > 0 ? "+" : ""}{kw.change}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShelfSection;
