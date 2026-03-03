import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import { TrendingUp, Award, PieChart as PieIcon, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, ComposedChart, Area,
} from "recharts";

const rankTrend = [
  { date: "Jan", avgRank: 8.2, bestRank: 1, targetRank: 5 },
  { date: "Feb", avgRank: 6.8, bestRank: 1, targetRank: 5 },
  { date: "Mar", avgRank: 5.4, bestRank: 1, targetRank: 5 },
];

const marketShareData = [
  { name: "Your Brand", value: 24 },
  { name: "Competitor A", value: 20 },
  { name: "Competitor B", value: 16 },
  { name: "Competitor C", value: 12 },
  { name: "Others", value: 28 },
];

const PIE_COLORS = [
  "hsl(270, 70%, 50%)", "hsl(245, 58%, 51%)", "hsl(217, 91%, 60%)", "hsl(172, 66%, 50%)", "hsl(260, 15%, 82%)"
];

const categoryRanking = [
  { category: "Face Wash", rank: 2, change: 1, marketShare: 28 },
  { category: "Shampoo", rank: 4, change: -1, marketShare: 18 },
  { category: "Body Lotion", rank: 1, change: 2, marketShare: 35 },
  { category: "Sunscreen", rank: 3, change: 0, marketShare: 22 },
  { category: "Hair Oil", rank: 5, change: -2, marketShare: 14 },
  { category: "Hand Cream", rank: 2, change: 1, marketShare: 26 },
];

const marketShareTrend = [
  { month: "Oct", you: 20, compA: 22, compB: 18 },
  { month: "Nov", you: 21, compA: 21, compB: 17 },
  { month: "Dec", you: 22, compA: 21, compB: 17 },
  { month: "Jan", you: 23, compA: 20, compB: 16 },
  { month: "Feb", you: 24, compA: 20, compB: 16 },
];

const rankActions: ActionItem[] = [
  { id: "1", severity: "critical", title: "Lost #1 rank on 3 high-volume keywords", description: "Competitor A overtook on 'organic shampoo', 'natural face wash', 'vitamin c'", metric: "3 keywords", action: "Reclaim" },
  { id: "2", severity: "warning", title: "Market share declining in Hair Care", description: "2% MoM decline over past quarter, competitor gaining through promotions", metric: "-2% MoM", action: "Strategize" },
  { id: "3", severity: "info", title: "New market entry opportunity", description: "Lip care category growing 40% QoQ with low competition", metric: "+40% QoQ", action: "Explore" },
  { id: "4", severity: "success", title: "Body Lotion #1 across all platforms", description: "Achieved category leadership with 35% market share", metric: "#1", action: "Defend" },
];

const RankMarketShareSection = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Rank Analysis & Market Share</h1>
        <p className="text-muted-foreground text-sm mt-1">Track category rankings, market share trends, and competitive positioning</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Market Share" value="24%" change={2} changeLabel="vs last quarter" icon={<PieIcon className="h-5 w-5" />} variant="primary" />
        <KPICard title="Avg Category Rank" value="#3.2" change={18} changeLabel="improved from #4.1" icon={<Award className="h-5 w-5" />} variant="success" />
        <KPICard title="#1 Ranked Categories" value="4/12" change={33} changeLabel="up from 3/12" icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Market Share Growth" value="+4%" change={4} changeLabel="last 6 months" icon={<BarChart3 className="h-5 w-5" />} variant="warning" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Rank Improvement Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <ComposedChart data={rankTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
              <YAxis reversed tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" domain={[0, 10]} />
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
              <Legend />
              <Area type="monotone" dataKey="targetRank" name="Target" fill="hsl(142, 71%, 45%)" fillOpacity={0.1} stroke="hsl(142, 71%, 45%)" strokeDasharray="5 5" />
              <Line type="monotone" dataKey="avgRank" name="Avg Rank" stroke="hsl(270, 70%, 50%)" strokeWidth={2.5} dot={{ r: 5 }} />
              <Line type="monotone" dataKey="bestRank" name="Best Rank" stroke="hsl(245, 58%, 51%)" strokeWidth={2} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Current Market Share Split</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={marketShareData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={50} paddingAngle={2}>
                {marketShareData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 mt-2">
            {marketShareData.map((item, i) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: PIE_COLORS[i] }} />
                <span className="text-muted-foreground truncate">{item.name}</span>
                <span className="font-semibold text-foreground ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-1 rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Category Rankings</h3>
          <div className="space-y-3">
            {categoryRanking.map((cat) => (
              <div key={cat.category} className="flex items-center gap-3 text-sm">
                <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                  cat.rank === 1 ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}>
                  #{cat.rank}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground">{cat.category}</p>
                  <p className="text-xs text-muted-foreground">MS: {cat.marketShare}%</p>
                </div>
                <span className={`text-xs font-bold ${
                  cat.change > 0 ? "text-success" : cat.change < 0 ? "text-destructive" : "text-muted-foreground"
                }`}>
                  {cat.change > 0 ? `↑${cat.change}` : cat.change < 0 ? `↓${Math.abs(cat.change)}` : "—"}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-2">
          <div className="rounded-xl border bg-card shadow-card p-5 mb-4">
            <h3 className="font-heading font-semibold text-foreground mb-4">Market Share Trend (6 months)</h3>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={marketShareTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                <Legend />
                <Line type="monotone" dataKey="you" name="You" stroke="hsl(270, 70%, 50%)" strokeWidth={2.5} />
                <Line type="monotone" dataKey="compA" name="Comp A" stroke="hsl(0, 72%, 51%)" strokeWidth={1.5} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="compB" name="Comp B" stroke="hsl(217, 91%, 60%)" strokeWidth={1.5} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <ActionableList items={rankActions} title="Strategic Actions" />
        </div>
      </div>
    </div>
  );
};

export default RankMarketShareSection;
