import { useState } from "react";
import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import { DollarSign, TrendingDown, TrendingUp, BarChart3, Target, Shield, X, Check, AlertTriangle } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const pricingActions = [
  { type: 'COMPETITIVE', title: 'Price Competitive', subtitle: 'Index < 98 vs. Market', skus: ['SKU-101 (Energy)', 'SKU-404 (Bar)'], recommendation: 'Increase Bids (+15%) to capture demand.', actionLabel: 'Boost Bids' },
  { type: 'UNCOMPETITIVE', title: 'Price Uncompetitive', subtitle: 'Index > 110 vs. Market', skus: ['SKU-300 (Tea)', 'SKU-505 (Mix)'], recommendation: 'Reduce Bids (-25%) to protect margin.', actionLabel: 'Reduce Spend' },
  { type: 'DEFENSIVE', title: 'Competitor Price Cut', subtitle: 'Comp A dropped >15%', skus: ['SKU-205 (Hydrate)'], recommendation: 'Trigger defensive ad placement.', actionLabel: 'Defend Now' }
];

const elasticityData: Record<string, { price: number; volume: number; confidence: number }[]> = {
  'SKU-101': [
    { price: -20, volume: 48, confidence: 5 }, { price: -15, volume: 32, confidence: 4 }, { price: -10, volume: 18, confidence: 3 },
    { price: -5, volume: 8, confidence: 2 }, { price: 0, volume: 0, confidence: 0 }, { price: 5, volume: -12, confidence: 3 },
    { price: 10, volume: -28, confidence: 5 }, { price: 15, volume: -45, confidence: 7 }, { price: 20, volume: -60, confidence: 9 },
  ],
  'SKU-205': [
    { price: -20, volume: 25, confidence: 6 }, { price: -15, volume: 18, confidence: 5 }, { price: -10, volume: 12, confidence: 4 },
    { price: -5, volume: 5, confidence: 2 }, { price: 0, volume: 0, confidence: 0 }, { price: 5, volume: -4, confidence: 2 },
    { price: 10, volume: -10, confidence: 4 }, { price: 15, volume: -18, confidence: 6 }, { price: 20, volume: -28, confidence: 8 },
  ]
};

const priceDistribution = [
  { range: "₹ 0-100", own: 12, competitor: 18 }, { range: "₹ 100-300", own: 28, competitor: 22 },
  { range: "₹ 300-500", own: 35, competitor: 30 }, { range: "₹ 500-1K", own: 18, competitor: 20 }, { range: "₹ 1K+", own: 7, competitor: 10 },
];

const priceTrend = [
  { date: "Jan", avgPrice: 342, competitorAvg: 355 }, { date: "Feb", avgPrice: 338, competitorAvg: 350 }, { date: "Mar", avgPrice: 345, competitorAvg: 348 },
];

const priceActionItems: ActionItem[] = [
  { id: "1", severity: "critical", title: "MAP violations on 14 SKUs", description: "Sellers undercutting minimum advertised price on Instamart", metric: "₹ 2.8L impact", action: "Enforce MAP" },
  { id: "2", severity: "critical", title: "Competitor undercut on top 5 SKUs", description: "Avg 12% lower pricing detected on Instamart", metric: "-12% avg", action: "Review" },
  { id: "3", severity: "warning", title: "Price erosion in Glucose Biscuits", description: "Consistent 5% MoM price drop across category", metric: "-5% MoM", action: "Analyze" },
  { id: "4", severity: "info", title: "Price premium opportunity", description: "8 SKUs priced 20% below category avg", metric: "+20% headroom", action: "Optimize" },
  { id: "5", severity: "success", title: "Price parity achieved", description: "All Biscuits SKUs now within 2% across platforms", metric: "±2%", action: "Monitor" },
];

const campaignTriggers: CampaignTrigger[] = [
  {
    id: "price-1", signal: "Competitor A slashed prices 15% on Hydration",
    signalDetail: "Comp A dropped prices on 4 hydration SKUs across Instamart & Instamart",
    strategy: "Defensive Brand Protection", campaignType: "Sponsored Brand + Video Ads",
    platforms: ["Instamart", "Instamart", "Blinkit"],
    keywords: ["electrolyte water", "hydration biscuits", "sports biscuits", "ORS biscuits"],
    estimatedImpact: "Protect ₹ 5.200g weekly revenue", urgency: "critical",
    icon: <Shield className="h-4 w-4 text-destructive" />,
  },
  {
    id: "price-2", signal: "Your SKUs 15% cheaper than competition",
    signalDetail: "Energy biscuits range priced significantly below market",
    strategy: "Price Advantage Amplification", campaignType: "Keyword Bidding + Display Ads",
    platforms: ["Instamart", "Instamart", "Zepto"],
    keywords: ["cheap energy biscuits", "affordable caffeine", "energy biscuits deal"],
    estimatedImpact: "+22% conversion rate, ₹ 4.8L incremental revenue", urgency: "high",
    icon: <Target className="h-4 w-4 text-warning" />,
  },
];

const ownSkuPricing = [
  { sku: "SKU-101 (Energy Biscuits)", platform: "Instamart", currentPrice: 199, competitorPrice: 175, margin: "32%", stock: "Healthy" },
  { sku: "SKU-101 (Energy Biscuits)", platform: "Instamart", currentPrice: 195, competitorPrice: 178, margin: "31%", stock: "Healthy" },
  { sku: "SKU-205 (Electrolyte)", platform: "Instamart", currentPrice: 159, competitorPrice: 122, margin: "28%", stock: "Low" },
  { sku: "SKU-205 (Electrolyte)", platform: "Instamart", currentPrice: 155, competitorPrice: 118, margin: "27%", stock: "Healthy" },
  { sku: "SKU-300 (Green Tea)", platform: "Instamart", currentPrice: 450, competitorPrice: 420, margin: "35%", stock: "Healthy" },
  { sku: "SKU-300 (Green Tea)", platform: "Blinkit", currentPrice: 460, competitorPrice: 430, margin: "34%", stock: "Low" },
  { sku: "SKU-404 (Protein Bar)", platform: "Instamart", currentPrice: 299, competitorPrice: 275, margin: "30%", stock: "Healthy" },
  { sku: "SKU-505 (Energy Mix)", platform: "Zepto", currentPrice: 189, competitorPrice: 165, margin: "25%", stock: "Healthy" },
];

const PricingSection = () => {
  const [deepDive, setDeepDive] = useState(false);
  const [selectedSku, setSelectedSku] = useState<'SKU-101' | 'SKU-205'>('SKU-101');
  const currentElasticity = elasticityData[selectedSku];
  const [priceReductionModal, setPriceReductionModal] = useState<typeof ownSkuPricing[0] | null>(null);
  const [priceReductionForm, setPriceReductionForm] = useState({ newPrice: "", reason: "competitor_match", effectiveDate: "immediate", platforms: [] as string[] });
  const [priceSubmitted, setPriceSubmitted] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Pricing Analysis</h1>
          <p className="text-muted-foreground text-sm mt-1">Track pricing trends, detect MAP violations, and trigger competitive campaigns</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Avg Selling Price" value="₹ 345" change={1.8} changeLabel="vs last month" icon={<DollarSign className="h-5 w-5" />} variant="primary" />
        <KPICard title="MAP Violations" value="14" change={-40} changeLabel="down from 23" icon={<TrendingDown className="h-5 w-5" />} variant="destructive" />
        <KPICard title="Price Competitiveness" value="87%" change={3} changeLabel="within 5% of competition" icon={<BarChart3 className="h-5 w-5" />} variant="success" />
        <KPICard title="Margin Opportunity" value="₹ 8.200g" change={12} changeLabel="monthly potential" icon={<TrendingUp className="h-5 w-5" />} variant="warning" />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={campaignTriggers} title="Pricing-Based Campaign Triggers" />

          {/* 3-Bucket Action System */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {pricingActions.map((item, idx) => (
              <div key={idx} className={`rounded-xl border p-5 flex flex-col justify-between shadow-card ${
                item.type === 'COMPETITIVE' ? 'bg-success/5 border-success/20' :
                item.type === 'UNCOMPETITIVE' ? 'bg-warning/5 border-warning/20' :
                'bg-destructive/5 border-destructive/20'
              }`}>
                <div>
                  <h3 className={`text-lg font-heading font-bold ${
                    item.type === 'COMPETITIVE' ? 'text-success' : item.type === 'UNCOMPETITIVE' ? 'text-warning' : 'text-destructive'
                  }`}>{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-3 font-medium">{item.subtitle}</p>
                  <div className="bg-card rounded-lg p-3 mb-3 border border-border shadow-card">
                    <p className="text-xs text-muted-foreground uppercase mb-1.5 font-bold tracking-wider">Affected SKUs</p>
                    {item.skus.map(sku => (
                      <p key={sku} className="text-sm text-foreground font-mono font-medium">• {sku}</p>
                    ))}
                  </div>
                  <p className="text-sm font-bold text-foreground">
                    Strategy: <span className="text-muted-foreground font-normal">{item.recommendation}</span>
                  </p>
                </div>
                <button className={`w-full py-2.5 rounded-lg font-bold text-sm uppercase transition-all mt-4 shadow-card ${
                  item.type === 'COMPETITIVE' ? 'bg-success hover:bg-success/90 text-success-foreground' :
                  item.type === 'UNCOMPETITIVE' ? 'bg-warning hover:bg-warning/90 text-warning-foreground' :
                  'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                }`}>
                  {item.actionLabel}
                </button>
              </div>
            ))}
          </div>

          <ActionableList items={priceActionItems} title="Pricing Actions" />

          {/* Price Reduction Trigger Table */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-heading font-semibold text-foreground">Quick Price Adjustment</h3>
              <span className="text-[10px] text-muted-foreground bg-muted px-2 py-1 rounded-full font-bold">Click "Reduce" to trigger</span>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Directly adjust your product pricing across platforms</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {["SKU", "Platform", "Your Price", "Comp. Price", "Gap", "Margin", "Stock", ""].map(h => (
                      <th key={h} className="p-2.5 font-bold text-muted-foreground uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ownSkuPricing.map((row, i) => {
                    const gap = row.currentPrice - row.competitorPrice;
                    const gapPct = ((gap / row.currentPrice) * 100).toFixed(1);
                    return (
                      <tr key={i} className="hover:bg-muted/30 transition-colors">
                        <td className="p-2.5 font-mono font-medium text-foreground">{row.sku}</td>
                        <td className="p-2.5 text-foreground">{row.platform}</td>
                        <td className="p-2.5 font-mono font-bold text-foreground">₹ {row.currentPrice}</td>
                        <td className="p-2.5 font-mono text-muted-foreground">₹ {row.competitorPrice}</td>
                        <td className={`p-2.5 font-bold ${gap > 20 ? 'text-destructive' : gap > 0 ? 'text-warning' : 'text-success'}`}>
                          {gap > 0 ? `+₹ ${gap} (${gapPct}%)` : `₹ ${gap}`}
                        </td>
                        <td className="p-2.5 text-foreground">{row.margin}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${row.stock === 'Healthy' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>{row.stock}</span>
                        </td>
                        <td className="p-2.5">
                          {gap > 0 && (
                            <button onClick={() => {
                              setPriceReductionModal(row);
                              setPriceReductionForm({ newPrice: String(row.competitorPrice - 1), reason: "competitor_match", effectiveDate: "immediate", platforms: [row.platform] });
                              setPriceSubmitted(false);
                            }} className="px-3 py-1 rounded-lg bg-destructive/10 text-destructive text-[10px] font-bold hover:bg-destructive/20 transition-colors">
                              Reduce ↓
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Price Reduction Modal */}
          {priceReductionModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={() => setPriceReductionModal(null)}>
              <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <div className="px-6 py-4 border-b border-border flex items-center justify-between">
                  <div>
                    <h2 className="font-heading font-bold text-foreground text-lg">Price Reduction</h2>
                    <p className="text-xs text-muted-foreground">{priceReductionModal.sku} on {priceReductionModal.platform}</p>
                  </div>
                  <button onClick={() => setPriceReductionModal(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                {!priceSubmitted ? (
                  <div className="p-6 space-y-5">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-muted/50 border border-border text-center">
                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Current</p>
                        <p className="text-lg font-bold text-foreground">₹ {priceReductionModal.currentPrice}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-center">
                        <p className="text-[10px] text-destructive uppercase font-bold">Competitor</p>
                        <p className="text-lg font-bold text-destructive">₹ {priceReductionModal.competitorPrice}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-success/5 border border-success/20 text-center">
                        <p className="text-[10px] text-success uppercase font-bold">New Price</p>
                        <input type="number" value={priceReductionForm.newPrice}
                          onChange={e => setPriceReductionForm({ ...priceReductionForm, newPrice: e.target.value })}
                          className="text-lg font-bold text-success w-full text-center bg-transparent outline-none" />
                      </div>
                    </div>

                    {/* Margin impact */}
                    <div className="p-3 rounded-lg bg-warning/5 border border-warning/20 flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-warning">Margin Impact</p>
                        <p className="text-xs text-foreground">
                          New margin: ~{Math.max(0, parseInt(priceReductionModal.margin) - Math.round((priceReductionModal.currentPrice - parseInt(priceReductionForm.newPrice || "0")) / priceReductionModal.currentPrice * 100))}% (from {priceReductionModal.margin})
                          • Revenue delta: ₹ {Math.abs(priceReductionModal.currentPrice - parseInt(priceReductionForm.newPrice || "0"))}/unit
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Reason</p>
                      <div className="flex gap-2">
                        {[{ id: "competitor_match", label: "Match Competitor" }, { id: "promotion", label: "Promotion" }, { id: "clearance", label: "Clearance" }].map(r => (
                          <button key={r.id} onClick={() => setPriceReductionForm({ ...priceReductionForm, reason: r.id })}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${priceReductionForm.reason === r.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                            {r.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Effective</p>
                      <div className="flex gap-2">
                        {[{ id: "immediate", label: "Immediately" }, { id: "scheduled", label: "Next 24 hrs" }].map(e => (
                          <button key={e.id} onClick={() => setPriceReductionForm({ ...priceReductionForm, effectiveDate: e.id })}
                            className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${priceReductionForm.effectiveDate === e.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                            {e.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button onClick={() => setPriceSubmitted(true)}
                      className="w-full py-3 bg-destructive text-destructive-foreground rounded-lg font-bold shadow-card hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2 text-sm">
                      <TrendingDown className="h-4 w-4" /> Confirm Price Reduction to ₹ {priceReductionForm.newPrice}
                    </button>
                  </div>
                ) : (
                  <div className="p-6 text-center space-y-4">
                    <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
                      <Check className="h-8 w-8 text-success" />
                    </div>
                    <h3 className="font-heading font-bold text-foreground text-lg">Price Updated!</h3>
                    <p className="text-sm text-muted-foreground">{priceReductionModal.sku} on {priceReductionModal.platform} updated from ₹ {priceReductionModal.currentPrice} → ₹ {priceReductionForm.newPrice}</p>
                    <button onClick={() => setPriceReductionModal(null)} className="w-full py-2.5 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted transition-colors">Close</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <>
          {/* Elasticity + Simulator */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading font-semibold text-foreground">Price Elasticity Curve</h3>
                  <p className="text-xs text-muted-foreground">Price changes vs sales volume (95% confidence)</p>
                </div>
                <div className="bg-muted rounded-lg p-1 flex gap-1 border border-border">
                  {['SKU-101', 'SKU-205'].map(sku => (
                    <button key={sku} onClick={() => setSelectedSku(sku as any)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${selectedSku === sku ? 'bg-card text-primary shadow-card' : 'text-muted-foreground hover:text-foreground'}`}>
                      {sku}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 w-full relative bg-muted/30 rounded-lg border border-border p-4">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <line x1="0" y1="50" x2="100" y2="50" stroke="hsl(260, 15%, 90%)" strokeWidth="0.5" strokeDasharray="2" />
                  <line x1="50" y1="0" x2="50" y2="100" stroke="hsl(260, 15%, 90%)" strokeWidth="0.5" strokeDasharray="2" />
                  <text x="5" y="5" fontSize="3" fill="hsl(260, 10%, 50%)" fontWeight="bold">+Vol</text>
                  <text x="5" y="95" fontSize="3" fill="hsl(260, 10%, 50%)" fontWeight="bold">-Vol</text>
                  <text x="90" y="48" fontSize="3" fill="hsl(260, 10%, 50%)" fontWeight="bold">+Price</text>
                  <text x="5" y="48" fontSize="3" fill="hsl(260, 10%, 50%)" fontWeight="bold">-Price</text>
                  <path
                    d={`M ${currentElasticity.map(d => { const x = ((d.price + 25) / 50) * 100; const y = 50 - ((d.volume + d.confidence) / 100) * 80; return `${x},${y}`; }).join(' L ')} L ${currentElasticity.slice().reverse().map(d => { const x = ((d.price + 25) / 50) * 100; const y = 50 - ((d.volume - d.confidence) / 100) * 80; return `${x},${y}`; }).join(' L ')} Z`}
                    fill="hsl(270, 70%, 50%, 0.1)" stroke="none" />
                  <path
                    d={`M ${currentElasticity.map(d => { const x = ((d.price + 25) / 50) * 100; const y = 50 - (d.volume / 100) * 80; return `${x},${y}`; }).join(' L ')}`}
                    fill="none" stroke="hsl(270, 70%, 50%)" strokeWidth="1.5" />
                  {currentElasticity.map((d, i) => {
                    const x = ((d.price + 25) / 50) * 100; const y = 50 - (d.volume / 100) * 80;
                    return <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="hsl(270, 70%, 50%)" strokeWidth="1" />;
                  })}
                </svg>
              </div>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Scenario Simulator</h3>
              <p className="text-xs text-muted-foreground mb-6">Project outcomes for {selectedSku}</p>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground font-medium">Proposed Price Change</span>
                    <span className="text-foreground font-bold">-10%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full relative">
                    <div className="w-[30%] bg-primary h-2 rounded-l-full"></div>
                    <div className="absolute top-1/2 left-[30%] w-4 h-4 bg-card border-2 border-primary rounded-full -translate-y-1/2 shadow cursor-pointer"></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1"><span>-20%</span><span>+20%</span></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted/50 p-3 rounded-lg text-center border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Est. Volume</p>
                    <p className="text-xl font-bold text-success">{selectedSku === 'SKU-101' ? '+18%' : '+12%'}</p>
                  </div>
                  <div className="bg-muted/50 p-3 rounded-lg text-center border border-border">
                    <p className="text-xs text-muted-foreground uppercase font-bold">Est. Margin</p>
                    <p className="text-xl font-bold text-destructive">-4%</p>
                  </div>
                </div>
                <button className="w-full py-2.5 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-sm font-bold">
                  Apply to Forecast
                </button>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Price Distribution: You vs Competitors</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={priceDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(260, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Legend />
                  <Bar dataKey="own" name="Your Brand" fill="hsl(270, 70%, 50%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="competitor" name="Competitors" fill="hsl(260, 15%, 82%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Competitive Price Index Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={priceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Legend />
                  <Line type="monotone" dataKey="avgPrice" name="Your Avg Price" stroke="hsl(270, 70%, 50%)" strokeWidth={2.5} />
                  <Line type="monotone" dataKey="competitorAvg" name="Competitor Avg" stroke="hsl(217, 91%, 60%)" strokeWidth={2} strokeDasharray="5 5" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PricingSection;
