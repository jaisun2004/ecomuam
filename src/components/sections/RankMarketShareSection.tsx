import { useState } from "react";
import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
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
  { id: "2", severity: "warning", title: "Market share declining in Hair Care", description: "2% MoM decline over past quarter, competitor gaining through promotions", metric: "-2% MoM", action: "Strategize" },
  { id: "3", severity: "info", title: "New market entry opportunity", description: "Lip care category growing 40% QoQ with low competition", metric: "+40% QoQ", action: "Explore" },
  { id: "4", severity: "success", title: "Body Lotion #1 across all platforms", description: "Achieved category leadership with 35% market share", metric: "#1", action: "Defend" },
];

const cityShareData = [
  { city: "Mumbai", share: 18, change: -2.4, issue: "Pricing" },
  { city: "Delhi NCR", share: 22, change: 1.2, issue: "" },
  { city: "Bangalore", share: 15, change: -0.8, issue: "Availability" },
  { city: "Chennai", share: 20, change: 0.5, issue: "" },
  { city: "Pune", share: 12, change: -1.5, issue: "Competition" },
  { city: "Hyderabad", share: 19, change: 0.2, issue: "" },
];

const rankCampaignTriggers: CampaignTrigger[] = [
  {
    id: "rank-1",
    signal: "Lost #1 rank on 3 high-volume keywords",
    signalDetail: "Competitor A overtook on 'organic shampoo', 'natural face wash', 'vitamin c serum' — likely due to price cuts + ad spend increase",
    strategy: "Rank Recovery Campaign",
    campaignType: "Exact Match Sponsored + Display Retargeting",
    platforms: ["Amazon", "Flipkart"],
    keywords: ["organic shampoo", "natural face wash", "vitamin c serum", "best face wash"],
    estimatedImpact: "Recover #1 rank on 2/3 keywords within 10 days",
    urgency: "critical" as const,
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
  {
    id: "rank-2",
    signal: "Market share declining 2% MoM in Hair Care",
    signalDetail: "Competitor gaining through aggressive promotions and bundling in Mumbai & Delhi",
    strategy: "Market Share Defense",
    campaignType: "Category Ads + Deal of the Day",
    platforms: ["Amazon", "Flipkart", "BigBasket"],
    keywords: ["hair care", "shampoo", "hair oil", "anti dandruff"],
    estimatedImpact: "Stabilize share loss and recover 1% within 30 days",
    urgency: "high" as const,
    icon: <Shield className="h-4 w-4 text-warning" />,
  },
];

const RankMarketShareSection = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'where' | 'who' | 'why' | 'synthesis'>('overview');

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'where', label: 'WHERE did I lose?' },
    { id: 'who', label: 'WHO took it?' },
    { id: 'why', label: 'WHY (Root Cause)?' },
    { id: 'synthesis', label: 'Synthesis' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Rank Analysis & Market Share</h1>
        <p className="text-muted-foreground text-sm mt-1">Track category rankings, market share trends, and competitive positioning</p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit border border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id
                ? 'bg-card text-primary shadow-card'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          <CampaignTriggerPanel triggers={rankCampaignTriggers} title="Rank & Market Share Campaign Triggers" />

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
          </div>
        </>
      )}

      {activeTab === 'where' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Market Share by City</h3>
            <p className="text-xs text-muted-foreground mb-4">Which cities are losing share right now?</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {cityShareData.map((city, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${city.change < 0 ? 'border-destructive/30 bg-destructive/5' : 'border-border bg-muted/30'}`}>
                  <p className="font-bold text-foreground text-sm">{city.city}</p>
                  <p className="text-2xl font-bold text-foreground mt-1">{city.share}%</p>
                  <p className={`text-xs font-bold ${city.change < 0 ? 'text-destructive' : 'text-success'}`}>
                    {city.change > 0 ? '+' : ''}{city.change}%
                  </p>
                  {city.issue && (
                    <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-bold mt-1 inline-block">
                      {city.issue}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">SKU-Level Decomposition</h3>
            <p className="text-xs text-muted-foreground mb-4">Which SKU is driving the loss?</p>
            <div className="space-y-3">
              {[
                { sku: "SKU-101 (Energy)", change: "+0.2%", positive: true },
                { sku: "SKU-205 (Hydrate)", change: "-1.8%", positive: false },
                { sku: "SKU-300 (Tea)", change: "0.0%", positive: null },
              ].map((item, idx) => (
                <div key={idx} className={`flex justify-between items-center p-3 bg-muted/30 rounded-lg border-l-4 ${
                  item.positive ? 'border-success' : item.positive === false ? 'border-destructive' : 'border-muted-foreground'
                } border border-border`}>
                  <span className="text-xs text-foreground font-bold">{item.sku}</span>
                  <span className={`text-xs font-bold ${item.positive ? 'text-success' : item.positive === false ? 'text-destructive' : 'text-muted-foreground'}`}>{item.change}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 p-3 bg-info/5 rounded-lg border border-info/20">
              <p className="text-[10px] text-info uppercase font-bold tracking-wider">Insight</p>
              <p className="text-sm text-foreground mt-1">
                Share loss is concentrated in <span className="font-bold">Mumbai</span> on <span className="font-bold">SKU-205</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'who' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Competitor Share Movement</h3>
            <p className="text-xs text-muted-foreground mb-4">Which competitor is growing at my expense?</p>
            <div className="h-64 bg-muted/30 rounded-lg border border-border overflow-hidden relative">
              <svg viewBox="0 0 100 50" className="w-full h-full" preserveAspectRatio="none">
                <path d="M0,50 L0,30 Q25,25 50,28 T100,20 L100,50 Z" fill="hsl(270, 70%, 50%)" opacity="0.6" />
                <path d="M0,30 Q25,25 50,28 T100,20 L100,0 L0,0 Z" fill="hsl(260, 15%, 82%)" opacity="0.3" />
                <path d="M0,20 Q40,25 60,15 T100,5 L100,0 L0,0 Z" fill="hsl(0, 72%, 51%)" opacity="0.7" />
              </svg>
              <div className="absolute top-2 right-4 text-xs font-bold text-destructive bg-card/80 px-2 py-1 rounded-lg shadow-card">Comp A (+2.4%)</div>
              <div className="absolute bottom-4 right-4 text-xs font-bold text-primary bg-card/80 px-2 py-1 rounded-lg shadow-card">Me (-0.8%)</div>
            </div>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Pricing Aggression Detector</h3>
            <p className="text-xs text-muted-foreground mb-4">Did a price cut cause this share shift?</p>
            <div className="space-y-4">
              {[
                { week: "Week 1", pct: 10, highlight: false },
                { week: "Week 2", pct: 10, highlight: false },
                { week: "Week 3", pct: 40, highlight: true, label: "Comp A Price Cut -15%" },
                { week: "Today", pct: 45, highlight: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 relative">
                  <div className={`w-14 text-xs font-medium ${item.week === 'Today' ? 'text-foreground font-bold' : 'text-muted-foreground'}`}>{item.week}</div>
                  <div className="flex-1 h-2.5 bg-muted rounded-full relative">
                    <div className={`h-full rounded-full ${item.highlight ? 'bg-destructive' : 'bg-muted-foreground/40'}`} style={{ width: `${item.pct}%` }}></div>
                    {item.label && (
                      <span className="absolute -top-6 left-[20%] text-[10px] bg-destructive/10 text-destructive border border-destructive/20 px-2 py-0.5 rounded-full font-bold whitespace-nowrap">
                        {item.label}
                      </span>
                    )}
                  </div>
                </div>
              ))}
              <button className="w-full mt-4 py-2.5 gradient-primary text-primary-foreground text-sm rounded-lg font-bold shadow-card hover:opacity-90 transition-opacity">
                Model Response in Pricing Simulator
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'why' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Root Cause Diagnostic</h3>
            <p className="text-xs text-muted-foreground mb-4">Why did share drop in Mumbai?</p>
            <div className="flex flex-col items-center py-6">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-6 py-3 text-center">
                <p className="font-bold text-destructive text-sm">Share Loss: -2.4%</p>
                <p className="text-xs text-muted-foreground">Mumbai, SKU-205</p>
              </div>
              <div className="w-px h-6 bg-border"></div>
              <div className="grid grid-cols-3 gap-8">
                {[
                  { label: "Pricing", detail: "Comp A cut 15%", severity: "high" },
                  { label: "Availability", detail: "96% in-stock", severity: "low" },
                  { label: "Content", detail: "Score: 72/100", severity: "medium" },
                ].map((node, idx) => (
                  <div key={idx} className="flex flex-col items-center">
                    <div className="w-px h-4 bg-border"></div>
                    <div className={`border rounded-lg px-4 py-3 text-center ${
                      node.severity === 'high' ? 'bg-destructive/5 border-destructive/30' :
                      node.severity === 'medium' ? 'bg-warning/5 border-warning/30' :
                      'bg-success/5 border-success/30'
                    }`}>
                      <p className="font-bold text-foreground text-sm">{node.label}</p>
                      <p className="text-xs text-muted-foreground">{node.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Market Share Trend Context</h3>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={marketShareTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Legend />
                  <Line type="monotone" dataKey="you" name="You" stroke="hsl(270, 70%, 50%)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="compA" name="Comp A" stroke="hsl(0, 72%, 51%)" strokeWidth={1.5} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Category Context</h3>
              <div className="flex flex-col items-center justify-center h-full gap-6 py-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Category Growth</p>
                  <p className="text-3xl font-bold text-success">+5.2%</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">My Growth</p>
                  <p className="text-3xl font-bold text-destructive">-0.8%</p>
                </div>
                <p className="text-xs text-muted-foreground text-center px-4 bg-muted/50 p-3 rounded-lg border border-border">
                  You are underperforming the category. This is a share loss problem, not a category slowdown.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'synthesis' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Share Recovery Prioritisation</h3>
            <p className="text-xs text-muted-foreground mb-4">Where to focus first?</p>
            <div className="h-64 bg-muted/30 rounded-lg border border-border relative">
              <div className="absolute inset-0 flex items-center justify-center p-2">
                <div className="w-[95%] h-[95%] grid grid-cols-2 grid-rows-2 gap-1">
                  <div className="bg-destructive/5 border border-destructive/20 p-3 rounded-lg relative group hover:bg-destructive/10 cursor-pointer transition-colors">
                    <span className="text-[10px] text-destructive font-bold">HIGH LOSS / EASY FIX</span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full px-2">
                      <p className="text-foreground font-bold text-sm">Mumbai / Pricing</p>
                      <p className="text-xs text-destructive font-bold">Risk: ₹12L</p>
                    </div>
                  </div>
                  <div className="bg-warning/5 border border-warning/20 p-3 rounded-lg relative">
                    <span className="text-[10px] text-warning font-bold">HIGH LOSS / HARD FIX</span>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
                      <p className="text-muted-foreground text-xs font-medium">NCR / Availability</p>
                    </div>
                  </div>
                  <div className="bg-info/5 border border-info/20 p-3 rounded-lg">
                    <span className="text-[10px] text-info font-bold">LOW LOSS / EASY FIX</span>
                  </div>
                  <div className="bg-muted border border-border p-3 rounded-lg">
                    <span className="text-[10px] text-muted-foreground font-bold">LOW LOSS / HARD FIX</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Ad Optimisation Handoff</h3>
            <p className="text-xs text-muted-foreground mb-4">Automated Response Brief</p>
            <div className="space-y-4">
              <div className="p-4 bg-card border-l-4 border-l-destructive rounded-lg border border-border shadow-card">
                <h4 className="text-sm font-bold text-foreground">1. Defensive Pricing Ad Strategy</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Trigger defensive sponsored placement on SKU-205 in Mumbai to counter Comp A pricing.
                </p>
                <button className="mt-3 text-xs gradient-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:opacity-90 transition-opacity shadow-card">
                  Activate Campaign
                </button>
              </div>
              <div className="p-4 bg-card border-l-4 border-l-warning rounded-lg border border-border shadow-card">
                <h4 className="text-sm font-bold text-foreground">2. Geo-Targeted Awareness</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Launch DSP campaign in Mumbai targeting lapsed users of SKU-205.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankMarketShareSection;
