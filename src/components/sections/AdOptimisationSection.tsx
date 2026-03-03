import { useState } from "react";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import KPICard from "@/components/KPICard";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import { Target, Shield, Zap, DollarSign, TrendingUp, BarChart3, Megaphone, X, Plus, Check, Sparkles, History, FileEdit, ChevronLeft, ArrowRight } from "lucide-react";

const AdOptimisationSection = () => {
  const [deepDive, setDeepDive] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('Brand Defense');
  const [strategyBidMultipliers, setStrategyBidMultipliers] = useState<Record<string, Record<string, number>>>({
    'Brand Defense': {}, 'Conquesting': {}, 'Awareness': {}
  });
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [ruleCreated, setRuleCreated] = useState(false);
  const [customRules, setCustomRules] = useState<{ name: string; metric: string; operator: string; value: string; action: string; actionValue: string; platforms: string[] }[]>([]);
  const [ruleForm, setRuleForm] = useState({
    name: "", metric: "ROAS", operator: "less_than", value: "", action: "pause_keyword", actionValue: "", platforms: ["Amazon"] as string[],
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
              <button onClick={() => setShowCampaignModal(true)} className="mt-4 w-full py-2.5 gradient-primary text-primary-foreground rounded-lg font-bold shadow-card hover:opacity-90 text-sm">
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
              {/* Custom rules */}
              {customRules.map((rule, i) => (
                <div key={`custom-${i}`} className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg shadow-card">
                  <div>
                    <p className="font-bold text-sm text-foreground">{rule.name}</p>
                    <p className="text-xs text-muted-foreground">If {rule.metric} {rule.operator === 'less_than' ? '<' : rule.operator === 'greater_than' ? '>' : '='} {rule.value} → <span className="text-primary font-medium">{rule.action.replace(/_/g, ' ')}{rule.actionValue ? ` ${rule.actionValue}` : ''}</span></p>
                  </div>
                  <div className="w-3 h-3 rounded-full bg-success"></div>
                </div>
              ))}
              <button onClick={() => { setShowRuleModal(true); setRuleCreated(false); setRuleForm({ name: "", metric: "ROAS", operator: "less_than", value: "", action: "pause_keyword", actionValue: "", platforms: ["Amazon"] }); }}
                className="mt-4 w-full py-2.5 border-2 border-dashed border-border rounded-lg text-muted-foreground text-sm hover:bg-muted transition-colors flex items-center justify-center gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Add New Rule
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
      {/* Rule Modal */}
      {showRuleModal && (
        <AddRuleModal
          form={ruleForm}
          setForm={setRuleForm}
          created={ruleCreated}
          setCreated={setRuleCreated}
          onClose={() => setShowRuleModal(false)}
          onSave={(rule) => setCustomRules([...customRules, rule])}
        />
      )}
      {/* Campaign Creator Modal */}
      {showCampaignModal && (
        <CampaignCreatorModal onClose={() => setShowCampaignModal(false)} />
      )}
    </div>
  );
};

/* Add Rule Modal */
const AddRuleModal = ({
  form, setForm, created, setCreated, onClose, onSave
}: {
  form: { name: string; metric: string; operator: string; value: string; action: string; actionValue: string; platforms: string[] };
  setForm: (f: any) => void;
  created: boolean;
  setCreated: (v: boolean) => void;
  onClose: () => void;
  onSave: (rule: typeof form) => void;
}) => {
  const allPlatforms = ["Amazon", "Flipkart", "Blinkit", "Zepto"];
  const metrics = ["ROAS", "CPC", "CTR", "Impressions", "Spend", "ACoS", "Conversion Rate"];
  const operators = [
    { id: "less_than", label: "Less than (<)" },
    { id: "greater_than", label: "Greater than (>)" },
    { id: "equals", label: "Equals (=)" },
  ];
  const actions = [
    { id: "pause_keyword", label: "Pause Keyword" },
    { id: "pause_campaign", label: "Pause Campaign" },
    { id: "increase_bid", label: "Increase Bid" },
    { id: "decrease_bid", label: "Decrease Bid" },
    { id: "increase_budget", label: "Increase Daily Budget" },
    { id: "send_alert", label: "Send Alert" },
  ];
  const togglePlatform = (p: string) => {
    setForm({ ...form, platforms: form.platforms.includes(p) ? form.platforms.filter((x: string) => x !== p) : [...form.platforms, p] });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-foreground text-lg">Create Custom Rule</h2>
            <p className="text-xs text-muted-foreground">Define automated optimization rules</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {!created ? (
          <div className="p-6 space-y-5">
            {/* Rule Name */}
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Rule Name</label>
              <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Pause Low Performers"
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            {/* Condition: IF */}
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">IF (Condition)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Metric</label>
                  <select value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {metrics.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Operator</label>
                  <select value={form.operator} onChange={e => setForm({ ...form, operator: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {operators.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Value</label>
                  <input type="text" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} placeholder="e.g. 1.5"
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              </div>
            </div>

            {/* Action: THEN */}
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-xs font-bold text-primary uppercase tracking-wider mb-3">THEN (Action)</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">Action</label>
                  <select value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}
                    className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {actions.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                  </select>
                </div>
                {(form.action === "increase_bid" || form.action === "decrease_bid" || form.action === "increase_budget") && (
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase font-bold mb-1 block">By (%)</label>
                    <input type="text" value={form.actionValue} onChange={e => setForm({ ...form, actionValue: e.target.value })} placeholder="e.g. 10%"
                      className="w-full px-2 py-2 rounded-lg border border-border bg-card text-foreground text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                )}
              </div>
            </div>

            {/* Platforms */}
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Apply To Platforms</p>
              <div className="flex flex-wrap gap-2">
                {allPlatforms.map(p => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${form.platforms.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 rounded-lg bg-muted/50 border border-border">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Rule Preview</p>
              <p className="text-sm text-foreground">
                <span className="font-bold text-primary">IF</span> {form.metric} {form.operator === 'less_than' ? '<' : form.operator === 'greater_than' ? '>' : '='} {form.value || '?'}{' '}
                <span className="font-bold text-primary">THEN</span> {actions.find(a => a.id === form.action)?.label}{form.actionValue ? ` by ${form.actionValue}` : ''}{' '}
                <span className="font-bold text-primary">ON</span> {form.platforms.join(', ')}
              </p>
            </div>

            <button onClick={() => { onSave(form); setCreated(true); }}
              disabled={!form.name || !form.value}
              className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-bold shadow-card hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
              <Plus className="h-4 w-4" /> Create Rule
            </button>
          </div>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Check className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-heading font-bold text-foreground text-lg">Rule Created!</h3>
            <p className="text-sm text-muted-foreground">"{form.name}" is now active and will auto-execute when conditions are met.</p>
            <button onClick={onClose} className="w-full py-2.5 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted transition-colors">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* Campaign Creator Modal */
const CampaignCreatorModal = ({ onClose }: { onClose: () => void }) => {
  const [step, setStep] = useState<'choose' | 'autonomous' | 'history' | 'manual'>('choose');
  const [campaignCreated, setCampaignCreated] = useState(false);
  const [manualForm, setManualForm] = useState({
    name: '', type: 'Sponsored Products', platforms: ['Amazon'] as string[],
    budget: '', duration: '7', keywords: '',
  });

  const allPlatforms = ["Amazon", "Flipkart", "Blinkit", "Zepto", "BigBasket"];

  const historicalCampaigns = [
    { name: 'Summer Sale - Energy Drinks', date: 'Jun 2025', roas: '4.2x', spend: '₹50K' },
    { name: 'Competitor Conquesting - RedBull', date: 'May 2025', roas: '2.8x', spend: '₹30K' },
    { name: 'Diwali Festival Push', date: 'Oct 2024', roas: '5.6x', spend: '₹1.2L' },
  ];

  const aiSuggestions = [
    { name: 'Stock Recovery Blitz', reason: 'Competitor X out of stock on 3 SKUs in Mumbai', platforms: ['Amazon', 'Blinkit'], budget: '₹25K', estRoas: '4.5x', keywords: ['energy drink', 'protein shake', 'health drink'] },
    { name: 'Price Advantage Campaign', reason: 'Your MRP is 12% lower than Competitor Y on Flipkart', platforms: ['Flipkart'], budget: '₹15K', estRoas: '3.8x', keywords: ['affordable energy', 'best price protein'] },
    { name: 'Weekend Warrior Push', reason: '40% higher conversions on weekends historically', platforms: ['Amazon', 'Zepto', 'Blinkit'], budget: '₹20K', estRoas: '5.1x', keywords: ['weekend deal', 'quick delivery drink'] },
  ];

  const togglePlatform = (p: string) => {
    setManualForm({ ...manualForm, platforms: manualForm.platforms.includes(p) ? manualForm.platforms.filter(x => x !== p) : [...manualForm.platforms, p] });
  };

  if (campaignCreated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
        <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4 p-8 text-center space-y-4" onClick={e => e.stopPropagation()}>
          <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h3 className="font-heading font-bold text-foreground text-lg">Campaign Created!</h3>
          <p className="text-sm text-muted-foreground">Your campaign is now live and will start delivering across selected platforms.</p>
          <button onClick={onClose} className="w-full py-2.5 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted transition-colors">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            {step !== 'choose' && (
              <button onClick={() => setStep('choose')} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <ChevronLeft className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
            <div>
              <h2 className="font-heading font-bold text-foreground text-lg">
                {step === 'choose' ? 'Autonomous Campaign Creator' : step === 'autonomous' ? 'AI-Recommended Campaigns' : step === 'history' ? 'Create from History' : 'Manual Campaign Setup'}
              </h2>
              <p className="text-xs text-muted-foreground">
                {step === 'choose' ? 'Choose your campaign creation method' : step === 'autonomous' ? 'AI has analyzed signals and recommends these' : step === 'history' ? 'Clone and customize a past campaign' : 'Configure everything yourself'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        <div className="p-6">
          {step === 'choose' && (
            <div className="grid grid-cols-3 gap-4">
              {[
                { id: 'autonomous' as const, icon: <Sparkles className="h-6 w-6" />, title: 'Autonomous AI', desc: 'AI recommends everything automatically', gradient: 'from-purple-500 to-blue-500' },
                { id: 'history' as const, icon: <History className="h-6 w-6" />, title: 'From History', desc: 'Use historical campaigns to create new campaigns', gradient: 'from-blue-500 to-cyan-500' },
                { id: 'manual' as const, icon: <FileEdit className="h-6 w-6" />, title: 'Manual Entry', desc: 'Configure everything yourself manually', gradient: 'from-slate-600 to-slate-800' },
              ].map(method => (
                <button key={method.id} onClick={() => setStep(method.id)}
                  className="p-6 rounded-xl border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all text-center group">
                  <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${method.gradient} flex items-center justify-center mx-auto mb-4 text-white shadow-lg`}>
                    {method.icon}
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-1">{method.title}</h3>
                  <p className="text-xs text-muted-foreground">{method.desc}</p>
                </button>
              ))}
            </div>
          )}

          {step === 'autonomous' && (
            <div className="space-y-4">
              {aiSuggestions.map((s, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 hover:border-primary/30 transition-all">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-bold text-foreground text-sm">{s.name}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.reason}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-bold">Est. {s.estRoas}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-3 text-xs">
                    <span className="text-muted-foreground">Platforms: <span className="text-foreground font-medium">{s.platforms.join(', ')}</span></span>
                    <span className="text-muted-foreground">Budget: <span className="text-foreground font-medium">{s.budget}</span></span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {s.keywords.map(k => <span key={k} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">{k}</span>)}
                  </div>
                  <button onClick={() => setCampaignCreated(true)}
                    className="mt-3 w-full py-2 gradient-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5">
                    <Zap className="h-3.5 w-3.5" /> Launch This Campaign
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 'history' && (
            <div className="space-y-3">
              {historicalCampaigns.map((c, i) => (
                <div key={i} className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between hover:border-primary/30 transition-all">
                  <div>
                    <h4 className="font-bold text-foreground text-sm">{c.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.date} • Spend: {c.spend} • ROAS: {c.roas}</p>
                  </div>
                  <button onClick={() => setCampaignCreated(true)}
                    className="px-4 py-2 gradient-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 flex items-center gap-1.5">
                    Clone <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {step === 'manual' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Campaign Name</label>
                  <input type="text" value={manualForm.name} onChange={e => setManualForm({ ...manualForm, name: e.target.value })} placeholder="e.g. Summer Push 2026"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Campaign Type</label>
                  <select value={manualForm.type} onChange={e => setManualForm({ ...manualForm, type: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {['Sponsored Products', 'Sponsored Brands', 'Display Ads', 'Keyword Conquesting', 'Category Targeting'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {allPlatforms.map(p => (
                    <button key={p} onClick={() => togglePlatform(p)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${manualForm.platforms.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Daily Budget (₹)</label>
                  <input type="number" value={manualForm.budget} onChange={e => setManualForm({ ...manualForm, budget: e.target.value })} placeholder="5000"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Duration (days)</label>
                  <select value={manualForm.duration} onChange={e => setManualForm({ ...manualForm, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                    {['7', '14', '30', '60', '90'].map(d => <option key={d} value={d}>{d} days</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Keywords (comma-separated)</label>
                <textarea value={manualForm.keywords} onChange={e => setManualForm({ ...manualForm, keywords: e.target.value })} placeholder="energy drink, protein bar, health supplement"
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20" />
              </div>

              <button onClick={() => setCampaignCreated(true)}
                disabled={!manualForm.name || !manualForm.budget}
                className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-bold shadow-card hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Plus className="h-4 w-4" /> Launch Campaign
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdOptimisationSection;
