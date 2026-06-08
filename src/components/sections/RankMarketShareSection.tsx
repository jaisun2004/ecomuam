import { useState } from "react";
import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import IndiaMap from "@/components/IndiaMap";
import { TrendingUp, Award, PieChart as PieIcon, BarChart3, Target, Shield } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart, Area,
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

const marketShareTrend = [
  { month: "Oct", you: 20, compA: 22, compB: 18 },
  { month: "Nov", you: 21, compA: 21, compB: 17 },
  { month: "Dec", you: 22, compA: 21, compB: 17 },
  { month: "Jan", you: 23, compA: 20, compB: 16 },
  { month: "Feb", you: 24, compA: 20, compB: 16 },
];

const rankActions: ActionItem[] = [
  { id: "1", severity: "critical", title: "Lost #1 rank on 3 high-volume keywords", description: "Competitor A overtook on 'organic shampoo', 'natural face wash', 'vitamin c'", metric: "3 keywords", action: "Reclaim" },
  { id: "2", severity: "warning", title: "Market share declining in Hair Care", description: "2% MoM decline over past quarter", metric: "-2% MoM", action: "Strategize" },
  { id: "3", severity: "info", title: "New market entry opportunity", description: "Lip care category growing 40% QoQ with low competition", metric: "+40% QoQ", action: "Explore" },
  { id: "4", severity: "success", title: "Body Lotion #1 across all platforms", description: "Achieved category leadership with 35% market share", metric: "#1", action: "Defend" },
];

const cityShareData = [
  { city: "Delhi NCR", share: 18, change: -2.4, issue: "Pricing" },
  { city: "Mumbai", share: 22, change: 1.2, issue: "" },
  { city: "Riyadh", share: 15, change: -0.8, issue: "Availability" },
  { city: "Doha", share: 20, change: 0.5, issue: "" },
  { city: "Khalifa City", share: 12, change: -1.5, issue: "Competition" },
  { city: "Jeddah", share: 19, change: 0.2, issue: "" },
];

const rankCampaignTriggers: CampaignTrigger[] = [
  {
    id: "rank-1", signal: "Lost #1 rank on 3 high-volume keywords",
    signalDetail: "Competitor A overtook on 'organic shampoo', 'natural face wash', 'vitamin c serum'",
    strategy: "Rank Recovery Campaign", campaignType: "Exact Match Sponsored + Display Retargeting",
    platforms: ["Instamart", "Instamart"],
    keywords: ["organic shampoo", "natural face wash", "vitamin c serum", "best face wash"],
    estimatedImpact: "Recover #1 rank on 2/3 keywords within 10 days", urgency: "critical" as const,
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
  {
    id: "rank-2", signal: "Market share declining 2% MoM in Hair Care",
    signalDetail: "Competitor gaining through aggressive promotions in Delhi NCR & Mumbai",
    strategy: "Market Share Defense", campaignType: "Category Ads + Deal of the Day",
    platforms: ["Instamart", "Instamart", "BigBasket"],
    keywords: ["hair care", "shampoo", "hair oil", "anti dandruff"],
    estimatedImpact: "Stabilize share loss and recover 1% within 30 days", urgency: "high" as const,
    icon: <Shield className="h-4 w-4 text-warning" />,
  },
];

const RankMarketShareSection = () => {
  const [deepDive, setDeepDive] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Rank & Market Share</h1>
          <p className="text-muted-foreground text-sm mt-1">Track category rankings and competitive positioning</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Market Share" value="24%" change={2} changeLabel="vs last quarter" icon={<PieIcon className="h-5 w-5" />} variant="primary" />
        <KPICard title="Avg Category Rank" value="#3.2" change={18} changeLabel="improved from #4.1" icon={<Award className="h-5 w-5" />} variant="success" />
        <KPICard title="#1 Ranked Categories" value="4/12" change={33} changeLabel="up from 3/12" icon={<TrendingUp className="h-5 w-5" />} />
        <KPICard title="Share Growth" value="+4%" change={4} changeLabel="last 6 months" icon={<BarChart3 className="h-5 w-5" />} variant="warning" />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={rankCampaignTriggers} title="Rank & Market Share Triggers" />

          {/* Market Share Pie + Category Rankings */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Current Market Share</h3>
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

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Category Rankings</h3>
              <div className="space-y-3">
                {[
                  { category: "Face Wash", rank: 2, change: 1, marketShare: 28 },
                  { category: "Shampoo", rank: 4, change: -1, marketShare: 18 },
                  { category: "Body Lotion", rank: 1, change: 2, marketShare: 35 },
                  { category: "Sunscreen", rank: 3, change: 0, marketShare: 22 },
                  { category: "Hair Oil", rank: 5, change: -2, marketShare: 14 },
                  { category: "Hand Cream", rank: 2, change: 1, marketShare: 26 },
                ].map((cat) => (
                  <div key={cat.category} className="flex items-center gap-3 text-sm">
                    <span className={`h-7 w-7 rounded-lg flex items-center justify-center text-xs font-bold ${
                      cat.rank === 1 ? "gradient-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                    }`}>#{cat.rank}</span>
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
          </div>

          <ActionableList items={rankActions} title="Strategic Actions" />
        </>
      ) : (
        <>
          {/* Deep Dive: India Map */}
          <IndiaMap />

          {/* City-level decomposition */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Market Share by City</h3>
              <p className="text-xs text-muted-foreground mb-4">Which cities are losing share?</p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {cityShareData.map((city, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border ${city.change < 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/30'}`}>
                    <p className="font-bold text-foreground text-sm">{city.city}</p>
                    <p className="text-xl font-bold text-foreground mt-1">{city.share}%</p>
                    <p className={`text-xs font-bold ${city.change < 0 ? 'text-destructive' : 'text-success'}`}>
                      {city.change > 0 ? '+' : ''}{city.change}%
                    </p>
                    {city.issue && (
                      <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold mt-1 inline-block">{city.issue}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Root Cause Diagnostic</h3>
              <p className="text-xs text-muted-foreground mb-4">Why did share drop in Delhi NCR?</p>
              <div className="flex flex-col items-center py-4">
                <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-5 py-2 text-center">
                  <p className="font-bold text-destructive text-sm">Share Loss: -2.4%</p>
                  <p className="text-xs text-muted-foreground">Delhi NCR, SKU-205</p>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Pricing", detail: "Comp A cut 15%", severity: "high" },
                    { label: "Availability", detail: "96% in-stock", severity: "low" },
                    { label: "Content", detail: "Score: 72/100", severity: "medium" },
                  ].map((node, idx) => (
                    <div key={idx} className="flex flex-col items-center">
                      <div className="w-px h-3 bg-border"></div>
                      <div className={`border rounded-lg px-3 py-2 text-center ${
                        node.severity === 'high' ? 'bg-destructive/5 border-destructive/30' :
                        node.severity === 'medium' ? 'bg-warning/5 border-warning/30' :
                        'bg-success/5 border-success/30'
                      }`}>
                        <p className="font-bold text-foreground text-xs">{node.label}</p>
                        <p className="text-[10px] text-muted-foreground">{node.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Trend charts */}
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
              <h3 className="font-heading font-semibold text-foreground mb-4">Market Share Trend (6M)</h3>
              <ResponsiveContainer width="100%" height={280}>
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
          </div>
        </>
      )}
    </div>
  );
};

export default RankMarketShareSection;
