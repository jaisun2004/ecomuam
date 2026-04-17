import { useState } from "react";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import KPICard from "@/components/KPICard";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import { Target, Zap, Lightbulb, TrendingUp, BarChart3 } from "lucide-react";

const categoryTriggers: CampaignTrigger[] = [
  {
    id: "cat-1", signal: "Whitespace detected: Mango Chilli variant",
    signalDetail: "High demand (45K monthly searches) with only 2 niche competitors",
    strategy: "New Product Launch Blitz", campaignType: "Sponsored Product + Video Ads + Display",
    platforms: ["Amazon", "Flipkart", "Blinkit", "Zepto"],
    keywords: ["mango chilli drink", "spicy mango", "tangy fruit drink", "new energy drink"],
    estimatedImpact: "Capture 15% category share in first 30 days", urgency: "high",
    icon: <Zap className="h-4 w-4 text-warning" />,
  },
  {
    id: "cat-2", signal: "Competitor delisted Cola 1.5L variant",
    signalDetail: "Competitor A removed their Cola 1.5L — opportunity to capture search traffic",
    strategy: "Competitor Delist Capture", campaignType: "Keyword Targeting on competitor brand terms",
    platforms: ["Amazon", "Flipkart"],
    keywords: ["cola 1.5l", "large cola bottle", "party cola", "cola family pack"],
    estimatedImpact: "+₹2.8L revenue from competitor's abandoned traffic", urgency: "critical",
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
];

const flavorOpportunities = [
  { label: 'Mango Chilli', demand: 85, competition: 20, potential: 'High' as const },
  { label: 'Blueberry Mint', demand: 78, competition: 35, potential: 'High' as const },
  { label: 'Spicy Guava', demand: 65, competition: 60, potential: 'Medium' as const },
  { label: 'Classic Lemon', demand: 95, competition: 90, potential: 'Low' as const },
];

const packSizeOpportunities = [
  { label: 'Multipack (6x250ml)', growth: 12.5 },
  { label: 'Party Pack (2L)', growth: 8.2 },
  { label: 'On-the-go (200ml)', growth: -2.0 },
];

const CategoryRecommendationSection = () => {
  const [deepDive, setDeepDive] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Category & NPD</h1>
          <p className="text-muted-foreground text-sm mt-1">Identify whitespace opportunities and optimize assortment</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <KPICard title="Top Opportunity Score" value="85/100" change={0} changeLabel="Mango Chilli variant" icon={<Lightbulb className="h-5 w-5" />} variant="primary" />
        <KPICard title="Category Growth" value="+12%" change={12} changeLabel="QoQ avg" icon={<TrendingUp className="h-5 w-5" />} variant="success" />
        <KPICard title="Whitespace Gaps" value="4" change={0} changeLabel="actionable opportunities" icon={<BarChart3 className="h-5 w-5" />} variant="warning" />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={categoryTriggers} title="Category & NPD Triggers" />

          {/* Hero Opportunity Card */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Top NPD Opportunity: 'Mango Chilli' Variant</h3>
            <p className="text-xs text-muted-foreground mb-4">High Demand, Low Competition Space</p>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="w-full md:w-1/3 bg-muted/30 p-4 rounded-lg border border-border text-center shadow-card">
                <div className="text-4xl font-bold text-success mb-1">85/100</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Opportunity Score</div>
                <div className="mt-4 space-y-2 text-left text-sm">
                  {[
                    { label: "Search Volume", value: "High", color: "text-foreground" },
                    { label: "Competitor Density", value: "Low", color: "text-success" },
                    { label: "Avg. Category Price", value: "₹110", color: "text-foreground" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <span className={`font-bold ${item.color}`}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Gap in market for <span className="text-foreground font-bold">Spicy/Tangy Fruit Blends</span>.
                  "Mango Chilli" saw <span className="text-success font-bold">+45%</span> search growth QoQ with only 2 niche competitors.
                </p>
                <div className="p-3 bg-info/5 border border-info/20 rounded-lg">
                  <h5 className="text-xs font-bold text-info uppercase mb-1">Recommended Action</h5>
                  <p className="text-xs text-foreground">Launch at ₹50 price point to capture early adopters.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Flavor Gap */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Flavor Gap Analysis</h3>
            <p className="text-xs text-muted-foreground mb-4">Demand vs Competition</p>
            <div className="space-y-3">
              {flavorOpportunities.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-sm text-foreground w-1/3 font-medium">{item.label}</span>
                  <div className="flex-1 mx-2 h-2 bg-muted rounded-full overflow-hidden flex">
                    <div className="bg-success h-full" style={{ width: `${item.demand}%` }} title="Demand"></div>
                    <div className="bg-destructive h-full" style={{ width: `${item.competition}%` }} title="Competition"></div>
                  </div>
                  <span className={`text-xs font-bold w-12 text-right ${
                    item.potential === 'High' ? 'text-success' : item.potential === 'Medium' ? 'text-warning' : 'text-muted-foreground'
                  }`}>{item.potential}</span>
                </div>
              ))}
              <div className="flex justify-center gap-4 mt-2 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-success rounded-full"></div> Demand</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 bg-destructive rounded-full"></div> Competition</div>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Deep Dive: Pack Size + Variant Rationalization */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Pack Size Trends</h3>
              <p className="text-xs text-muted-foreground mb-4">YoY Growth Rate %</p>
              <div className="space-y-4">
                {packSizeOpportunities.map((item, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-foreground font-medium">{item.label}</span>
                      <span className={`font-bold ${item.growth > 0 ? 'text-success' : 'text-destructive'}`}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
                      </span>
                    </div>
                    <div className="h-3 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${item.growth > 0 ? 'bg-success' : 'bg-destructive'}`}
                        style={{ width: `${Math.min(Math.abs(item.growth) * 5, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Variant Rationalisation</h3>
              <p className="text-xs text-muted-foreground mb-4">Candidates for delisting</p>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase bg-muted/50">
                    <th className="p-3 font-bold">Variant</th>
                    <th className="p-3 text-center font-bold">Sales Vol</th>
                    <th className="p-3 text-center font-bold">Margin</th>
                    <th className="p-3 text-center font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-border/50">
                  {[
                    { variant: 'Cola 1.5L', vol: 'Low', volColor: 'text-destructive', margin: '12%', marginColor: 'text-warning', rec: 'Delist', recColor: 'bg-destructive/10 text-destructive' },
                    { variant: 'Lemon 200ml', vol: 'Med', volColor: 'text-warning', margin: '5%', marginColor: 'text-destructive', rec: 'Reprice', recColor: 'bg-warning/10 text-warning' },
                    { variant: 'Energy 500ml', vol: 'High', volColor: 'text-success', margin: '28%', marginColor: 'text-success', rec: 'Scale', recColor: 'bg-success/10 text-success' },
                  ].map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-foreground font-medium">{item.variant}</td>
                      <td className={`p-3 text-center font-bold ${item.volColor}`}>{item.vol}</td>
                      <td className={`p-3 text-center ${item.marginColor}`}>{item.margin}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${item.recColor}`}>{item.rec}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CategoryRecommendationSection;
