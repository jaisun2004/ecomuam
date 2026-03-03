import { useState } from "react";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import KPICard from "@/components/KPICard";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import { Target, Shield, Zap, DollarSign, TrendingUp, BarChart3, Megaphone } from "lucide-react";

const AdOptimisationSection = () => {
  const [deepDive, setDeepDive] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('Brand Defense');
  const [strategyBidMultipliers, setStrategyBidMultipliers] = useState<Record<string, Record<string, number>>>({
    'Brand Defense': {}, 'Conquesting': {}, 'Awareness': {}
  });

  const currentMultipliers = strategyBidMultipliers[selectedStrategy] || {};

  const toggleBid = (day: string, hour: number) => {
    const key = `${day}-${hour}`;
    const current = currentMultipliers[key] || 1.0;
    let next = 1.0;
    if (current === 1.0) next = 1.2;
    else if (current === 1.2) next = 0.5;
    else next = 1.0;
    setStrategyBidMultipliers({
      ...strategyBidMultipliers,
      [selectedStrategy]: { ...currentMultipliers, [key]: next }
    });
  };

  const getBidColor = (multiplier: number) => {
    if (multiplier > 1.0) return 'bg-success hover:bg-success/80';
    if (multiplier < 1.0) return 'bg-destructive/20 hover:bg-destructive/30';
    return 'bg-info/10 hover:bg-info/20';
  };

  const adCampaignTriggers: CampaignTrigger[] = [
    {
      id: "ad-1", signal: "Low ROAS keywords — auto-pause recommended",
      signalDetail: "3 keywords running below 1.5x ROAS for 5+ days",
      strategy: "Budget Reallocation", campaignType: "Pause low performers, boost high ROAS",
      platforms: ["Amazon", "Flipkart"],
      keywords: ["energy supplement", "health drink powder", "vitamin mix"],
      estimatedImpact: "Save ₹15K/week and redirect to 4x+ ROAS keywords", urgency: "high",
      icon: <Target className="h-4 w-4 text-warning" />,
    },
    {
      id: "ad-2", signal: "Competitor reduced ad spend on 'protein bar'",
      signalDetail: "Competitor B dropped sponsored visibility 60% this week",
      strategy: "Opportunistic Conquesting", campaignType: "Exact Match + Category Targeting",
      platforms: ["Amazon", "Blinkit"],
      keywords: ["protein bar", "whey protein bar", "gym snack bar"],
      estimatedImpact: "+25% impression share on protein bar category", urgency: "critical",
      icon: <Zap className="h-4 w-4 text-destructive" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Ad Optimisation</h1>
          <p className="text-muted-foreground text-sm mt-1">Plan, report, and optimize ad campaigns across platforms</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Avg ROAS" value="3.7x" change={12} changeLabel="vs last month" icon={<TrendingUp className="h-5 w-5" />} variant="success" />
        <KPICard title="Monthly Spend" value="₹5L" change={-5} changeLabel="optimized down" icon={<DollarSign className="h-5 w-5" />} variant="primary" />
        <KPICard title="Active Campaigns" value="8" change={2} changeLabel="across platforms" icon={<Megaphone className="h-5 w-5" />} />
        <KPICard title="Est. Clicks" value="45.2K" change={8} changeLabel="this month" icon={<BarChart3 className="h-5 w-5" />} variant="warning" />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={adCampaignTriggers} title="Ad Intelligence Campaign Triggers" />

          {/* Active Campaigns + Rule Engine */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Active Campaigns</h3>
              <div className="space-y-3">
                {[
                  { name: 'Summer Sale - Energy Drinks', status: 'Active', budget: '₹50,000', roas: '4.2x' },
                  { name: 'Competitor Conquesting - RedBull', status: 'Active', budget: '₹30,000', roas: '2.8x' },
                  { name: 'Brand Defense', status: 'Paused', budget: '₹20,000', roas: '5.1x' },
                ].map((c, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                    <div>
                      <p className="font-bold text-sm text-foreground">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.budget} • ROAS: {c.roas}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{c.status}</span>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2.5 gradient-primary text-primary-foreground rounded-lg font-bold shadow-card hover:opacity-90 text-sm">
                + Create New Campaign
              </button>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Rule Engine</h3>
              <p className="text-xs text-muted-foreground mb-4">Automated optimization rules</p>
              <div className="space-y-3">
                {[
                  { name: 'Low ROAS Pause', condition: 'If ROAS < 1.5 for 3 days', action: 'Pause Keyword', status: 'Active' },
                  { name: 'High Performer Boost', condition: 'If ROAS > 4.0', action: 'Increase Bid 10%', status: 'Active' },
                  { name: 'Inventory Protection', condition: 'If Stock < 5 days', action: 'Pause Campaign', status: 'Inactive' },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-card border border-border rounded-lg shadow-card">
                    <div>
                      <p className="font-bold text-sm text-foreground">{rule.name}</p>
                      <p className="text-xs text-muted-foreground">{rule.condition} → <span className="text-primary font-medium">{rule.action}</span></p>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${rule.status === 'Active' ? 'bg-success' : 'bg-muted-foreground/30'}`}></div>
                  </div>
                ))}
              </div>
              <button className="mt-4 w-full py-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm hover:bg-muted transition-colors">
                + Add New Rule
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Deep Dive: Budget Planner + Day Parting + Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Budget Planner</h3>
              <p className="text-xs text-muted-foreground mb-4">Forecasted ROAS based on spend allocation</p>
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <div className="flex justify-between mb-3 items-center">
                    <span className="font-bold text-foreground text-sm">Total Monthly Budget</span>
                    <div className="flex items-center bg-card px-3 py-1.5 rounded-lg border border-border shadow-card">
                      <span className="text-muted-foreground mr-1">₹</span>
                      <input type="number" defaultValue={500000} className="font-bold text-foreground w-24 text-right outline-none bg-transparent" />
                    </div>
                  </div>
                  <input type="range" className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Forecasted Revenue", value: "₹18.5L", color: "border-l-primary" },
                    { label: "Forecasted ROAS", value: "3.7x", color: "border-l-success" },
                    { label: "Est. Clicks", value: "45.2K", color: "border-l-info" },
                  ].map((item, i) => (
                    <div key={i} className={`p-3 bg-card border border-border rounded-xl shadow-card border-l-4 ${item.color} text-center`}>
                      <p className="text-xs text-muted-foreground font-bold uppercase mb-1">{item.label}</p>
                      <p className="text-xl font-bold text-foreground">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Channel Allocation</h3>
              <p className="text-xs text-muted-foreground mb-4">Recommended split</p>
              <div className="space-y-3">
                {[
                  { name: 'Amazon Ads', pct: 60, color: 'hsl(25, 95%, 53%)' },
                  { name: 'Flipkart Ads', pct: 25, color: 'hsl(217, 91%, 60%)' },
                  { name: 'Blinkit', pct: 10, color: 'hsl(38, 92%, 50%)' },
                  { name: 'Zepto', pct: 5, color: 'hsl(270, 70%, 50%)' }
                ].map((ch, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-bold text-foreground">{ch.name}</span>
                      <span className="font-bold text-foreground">{ch.pct}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${ch.pct}%`, backgroundColor: ch.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Day Parting + Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Day Parting Schedule</h3>
              <p className="text-xs text-muted-foreground mb-3">Click cells to toggle bid multipliers</p>
              <div className="mb-3 flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Strategy:</span>
                <select value={selectedStrategy} onChange={(e) => setSelectedStrategy(e.target.value)}
                  className="border border-border rounded-lg px-2 py-1 text-xs text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-ring/30">
                  <option value="Brand Defense">Brand Defense</option>
                  <option value="Conquesting">Conquesting</option>
                  <option value="Awareness">Awareness</option>
                </select>
              </div>
              <div className="overflow-x-auto">
                <div className="min-w-[500px]">
                  <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 mb-1">
                    <div className="w-8"></div>
                    {Array.from({ length: 24 }).map((_, i) => (
                      <div key={i} className="text-[8px] text-muted-foreground text-center font-mono">{i}</div>
                    ))}
                  </div>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                    <div key={day} className="grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 mb-0.5 items-center">
                      <div className="text-[9px] font-bold text-muted-foreground w-8">{day}</div>
                      {Array.from({ length: 24 }).map((_, hour) => {
                        const key = `${day}-${hour}`;
                        const multiplier = currentMultipliers[key] || 1.0;
                        return (
                          <div key={hour} onClick={() => toggleBid(day, hour)}
                            className={`h-4 rounded-sm transition-all cursor-pointer flex items-center justify-center text-[6px] font-bold text-foreground ${getBidColor(multiplier)}`}
                            title={`${day} ${hour}:00 - Bid: ${multiplier}x`}>
                            {multiplier !== 1.0 && `${multiplier}x`}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-info/10 rounded-sm"></div> 1.0x</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-success rounded-sm"></div> 1.2x</div>
                <div className="flex items-center gap-1"><div className="w-2.5 h-2.5 bg-destructive/20 rounded-sm"></div> 0.5x</div>
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Granular Performance</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-muted/50 border-b border-border">
                    <tr>
                      {['Platform', 'Keyword', 'City', 'Spend', 'ROAS'].map(h => (
                        <th key={h} className="p-2.5 font-bold text-muted-foreground uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {[
                      { platform: 'Amazon', keyword: 'energy drink', city: 'Mumbai', spend: '₹5K', roas: 4.2 },
                      { platform: 'Amazon', keyword: 'energy drink', city: 'Delhi', spend: '₹3.2K', roas: 3.8 },
                      { platform: 'Flipkart', keyword: 'my brand', city: 'Bangalore', spend: '₹1.5K', roas: 5.5 },
                      { platform: 'Blinkit', keyword: 'refreshment', city: 'Mumbai', spend: '₹800', roas: 2.1 },
                      { platform: 'Amazon', keyword: 'redbull', city: 'Pune', spend: '₹2.1K', roas: 1.8 },
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 text-foreground">{row.platform}</td>
                        <td className="p-2.5 text-muted-foreground">{row.keyword}</td>
                        <td className="p-2.5 text-foreground">{row.city}</td>
                        <td className="p-2.5 text-foreground font-mono">{row.spend}</td>
                        <td className={`p-2.5 font-bold ${row.roas >= 4 ? 'text-success' : row.roas < 2 ? 'text-destructive' : 'text-warning'}`}>{row.roas}x</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdOptimisationSection;
