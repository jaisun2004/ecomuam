import { useState } from "react";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import { Target, Shield, Zap } from "lucide-react";

const AdOptimisationSection = () => {
  const [activeTab, setActiveTab] = useState<'planning' | 'creation' | 'reporting' | 'optimisation'>('reporting');
  const [selectedStrategy, setSelectedStrategy] = useState('Brand Defense');
  const [strategyBidMultipliers, setStrategyBidMultipliers] = useState<Record<string, Record<string, number>>>({
    'Brand Defense': {},
    'Conquesting': {},
    'Awareness': {}
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
      id: "ad-1",
      signal: "Low ROAS keywords detected — auto-pause recommended",
      signalDetail: "3 keywords running below 1.5x ROAS for 5+ days — burning budget without returns",
      strategy: "Budget Reallocation",
      campaignType: "Pause low performers, boost high ROAS keywords",
      platforms: ["Amazon", "Flipkart"],
      keywords: ["energy supplement", "health drink powder", "vitamin mix"],
      estimatedImpact: "Save ₹15K/week and redirect to 4x+ ROAS keywords",
      urgency: "high",
      icon: <Target className="h-4 w-4 text-warning" />,
    },
    {
      id: "ad-2",
      signal: "Competitor reduced ad spend on 'protein bar'",
      signalDetail: "Competitor B dropped sponsored visibility 60% this week — prime conquesting opportunity",
      strategy: "Opportunistic Conquesting",
      campaignType: "Exact Match + Category Targeting",
      platforms: ["Amazon", "Blinkit"],
      keywords: ["protein bar", "whey protein bar", "gym snack bar"],
      estimatedImpact: "+25% impression share on protein bar category",
      urgency: "critical",
      icon: <Zap className="h-4 w-4 text-destructive" />,
    },
  ];

  const tabs = [
    { id: 'planning', label: 'Planning' },
    { id: 'creation', label: 'Campaign Creation' },
    { id: 'reporting', label: 'Reporting' },
    { id: 'optimisation', label: 'Optimisation (Rules & AI)' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Ad Optimisation</h1>
        <p className="text-muted-foreground text-sm mt-1">Plan, create, report, and optimize your ad campaigns across platforms</p>
      </div>

      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit border border-border">
        {tabs.map((tab) => (
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

      <CampaignTriggerPanel triggers={adCampaignTriggers} title="Ad Intelligence Campaign Triggers" />

      {activeTab === 'planning' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
          <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Budget Planner</h3>
            <p className="text-xs text-muted-foreground mb-4">Forecasted ROAS based on spend allocation</p>
            <div className="space-y-6">
              <div className="p-5 bg-muted/30 rounded-lg border border-border">
                <div className="flex justify-between mb-4 items-center">
                  <span className="font-bold text-foreground text-sm uppercase tracking-wide">Total Monthly Budget</span>
                  <div className="flex items-center bg-card px-3 py-1.5 rounded-lg border border-border shadow-card">
                    <span className="text-muted-foreground mr-1">₹</span>
                    <input type="number" defaultValue={500000} className="font-bold text-foreground w-24 text-right outline-none bg-transparent" />
                  </div>
                </div>
                <input type="range" className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary mb-2" />
                <div className="flex justify-between text-xs text-muted-foreground font-medium">
                  <span>Min: ₹1L</span>
                  <span>Max: ₹10L</span>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "Forecasted Revenue", value: "₹18.5L", sub: "+12% vs last month", color: "border-l-primary" },
                  { label: "Forecasted ROAS", value: "3.7x", sub: "High Efficiency", color: "border-l-success" },
                  { label: "Est. Clicks", value: "45.2K", sub: "Based on avg CPC ₹11", color: "border-l-info" },
                ].map((item, i) => (
                  <div key={i} className={`p-4 bg-card border border-border rounded-xl shadow-card border-l-4 ${item.color} text-center`}>
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">{item.label}</p>
                    <p className="text-2xl font-bold text-foreground">{item.value}</p>
                    <p className="text-[10px] text-success font-bold mt-1">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Channel Allocation</h3>
            <p className="text-xs text-muted-foreground mb-4">Recommended split</p>
            <div className="space-y-4 py-2">
              {[
                { name: 'Amazon Ads', pct: 60, color: 'hsl(25, 95%, 53%)' },
                { name: 'Flipkart Ads', pct: 25, color: 'hsl(217, 91%, 60%)' },
                { name: 'Blinkit', pct: 10, color: 'hsl(38, 92%, 50%)' },
                { name: 'Zepto', pct: 5, color: 'hsl(270, 70%, 50%)' }
              ].map((channel, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-bold text-foreground">{channel.name}</span>
                    <span className="font-bold text-foreground">{channel.pct}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${channel.pct}%`, backgroundColor: channel.color }}></div>
                  </div>
                </div>
              ))}
              <div className="pt-4 mt-4 border-t border-border">
                <button className="w-full py-2.5 text-xs font-bold text-primary border-2 border-primary rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors">
                  Recalculate Split
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'creation' && (
        <div className="space-y-4 animate-fade-in">
          <div className="flex justify-end">
            <button className="px-4 py-2.5 gradient-primary text-primary-foreground rounded-lg font-bold shadow-card hover:opacity-90 transition-opacity flex items-center gap-2">
              <span>+</span> Create New Campaign
            </button>
          </div>
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4">Active Campaigns</h3>
            <table className="w-full text-left">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  <th className="p-3 text-xs font-bold text-muted-foreground uppercase">Campaign Name</th>
                  <th className="p-3 text-xs font-bold text-muted-foreground uppercase">Status</th>
                  <th className="p-3 text-xs font-bold text-muted-foreground uppercase">Budget</th>
                  <th className="p-3 text-xs font-bold text-muted-foreground uppercase">ROAS</th>
                  <th className="p-3 text-xs font-bold text-muted-foreground uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {[
                  { name: 'Summer Sale - Energy Drinks', status: 'Active', budget: '₹50,000', roas: '4.2x' },
                  { name: 'Competitor Conquesting - RedBull', status: 'Active', budget: '₹30,000', roas: '2.8x' },
                  { name: 'Brand Defense', status: 'Paused', budget: '₹20,000', roas: '5.1x' },
                ].map((c, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 text-sm font-medium text-foreground">{c.name}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${c.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-sm text-muted-foreground">{c.budget}</td>
                    <td className="p-3 text-sm font-bold text-foreground">{c.roas}</td>
                    <td className="p-3">
                      <button className="text-primary hover:text-primary/80 text-xs font-bold">Edit</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'reporting' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-4">Granular Performance Data</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-muted/50">
                  <tr>
                    {['Platform', 'Campaign', 'Keyword', 'SKU', 'City', 'Spend', 'ROAS'].map(h => (
                      <th key={h} className={`p-3 text-xs font-bold text-muted-foreground uppercase border-b border-border ${h === 'Spend' || h === 'ROAS' ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {[
                    { platform: 'Amazon', campaign: 'Summer Sale', keyword: 'energy drink', sku: 'SKU-101', city: 'Mumbai', spend: '₹5,000', roas: 4.2 },
                    { platform: 'Amazon', campaign: 'Summer Sale', keyword: 'energy drink', sku: 'SKU-101', city: 'Delhi', spend: '₹3,200', roas: 3.8 },
                    { platform: 'Flipkart', campaign: 'Brand Defense', keyword: 'my brand', sku: 'SKU-205', city: 'Bangalore', spend: '₹1,500', roas: 5.5 },
                    { platform: 'Blinkit', campaign: 'Impulse', keyword: 'refreshment', sku: 'SKU-300', city: 'Mumbai', spend: '₹800', roas: 2.1 },
                    { platform: 'Amazon', campaign: 'Conquesting', keyword: 'redbull', sku: 'SKU-101', city: 'Pune', spend: '₹2,100', roas: 1.8 },
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 text-sm text-foreground">{row.platform}</td>
                      <td className="p-3 text-sm text-foreground">{row.campaign}</td>
                      <td className="p-3 text-sm text-muted-foreground">{row.keyword}</td>
                      <td className="p-3 text-sm font-mono text-muted-foreground">{row.sku}</td>
                      <td className="p-3 text-sm text-foreground">{row.city}</td>
                      <td className="p-3 text-sm text-foreground font-mono text-right">{row.spend}</td>
                      <td className={`p-3 text-sm font-bold text-right ${row.roas >= 4 ? 'text-success' : row.roas < 2 ? 'text-destructive' : 'text-warning'}`}>{row.roas}x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'optimisation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 animate-fade-in">
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
            <button className="mt-4 w-full py-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm hover:bg-muted hover:text-foreground transition-colors">
              + Add New Rule
            </button>
          </div>

          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Day Parting Schedule</h3>
            <p className="text-xs text-muted-foreground mb-4">Optimize bids by time of day</p>
            <div className="mb-4 flex items-center gap-2">
              <span className="text-sm font-bold text-foreground">Strategy:</span>
              <select
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="border border-border rounded-lg px-3 py-1.5 text-sm text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="Brand Defense">Brand Defense</option>
                <option value="Conquesting">Conquesting</option>
                <option value="Awareness">Awareness</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[550px]">
                <div className="grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 mb-1">
                  <div className="w-10"></div>
                  {Array.from({ length: 24 }).map((_, i) => (
                    <div key={i} className="text-[9px] text-muted-foreground text-center font-mono">{i}</div>
                  ))}
                </div>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="grid grid-cols-[auto_repeat(24,1fr)] gap-0.5 mb-0.5 items-center">
                    <div className="text-[10px] font-bold text-muted-foreground w-10">{day}</div>
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const key = `${day}-${hour}`;
                      const multiplier = currentMultipliers[key] || 1.0;
                      return (
                        <div
                          key={hour}
                          onClick={() => toggleBid(day, hour)}
                          className={`h-5 rounded-sm transition-all cursor-pointer flex items-center justify-center text-[7px] font-bold text-foreground ${getBidColor(multiplier)}`}
                          title={`${day} ${hour}:00 - Bid: ${multiplier}x`}
                        >
                          {multiplier !== 1.0 && `${multiplier}x`}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6 mt-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-info/10 border border-info/20 rounded-sm"></div> Standard (1.0x)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-success border border-success/60 rounded-sm"></div> High (1.2x)</div>
              <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-destructive/20 border border-destructive/30 rounded-sm"></div> Low (0.5x)</div>
            </div>
            <p className="text-xs text-muted-foreground mt-2 italic">
              Click cells to toggle: Standard → High → Low → Standard.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdOptimisationSection;
