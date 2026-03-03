import { useState } from "react";
import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import { DollarSign, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

const pricingActions = [
  {
    type: 'COMPETITIVE',
    title: 'Price Competitive',
    subtitle: 'Index < 98 vs. Market',
    skus: ['SKU-101 (Energy)', 'SKU-404 (Bar)'],
    recommendation: 'Increase Bids (+15%) to capture demand.',
    actionLabel: 'Boost Bids',
  },
  {
    type: 'UNCOMPETITIVE',
    title: 'Price Uncompetitive',
    subtitle: 'Index > 110 vs. Market',
    skus: ['SKU-300 (Tea)', 'SKU-505 (Mix)'],
    recommendation: 'Reduce Bids (-25%) to protect margin.',
    actionLabel: 'Reduce Spend',
  },
  {
    type: 'DEFENSIVE',
    title: 'Competitor Price Cut',
    subtitle: 'Comp A dropped >15%',
    skus: ['SKU-205 (Hydrate)'],
    recommendation: 'Trigger defensive ad placement.',
    actionLabel: 'Defend Now',
  }
];

const elasticityData: Record<string, { price: number; volume: number; confidence: number }[]> = {
  'SKU-101': [
    { price: -20, volume: 48, confidence: 5 },
    { price: -15, volume: 32, confidence: 4 },
    { price: -10, volume: 18, confidence: 3 },
    { price: -5, volume: 8, confidence: 2 },
    { price: 0, volume: 0, confidence: 0 },
    { price: 5, volume: -12, confidence: 3 },
    { price: 10, volume: -28, confidence: 5 },
    { price: 15, volume: -45, confidence: 7 },
    { price: 20, volume: -60, confidence: 9 },
  ],
  'SKU-205': [
    { price: -20, volume: 25, confidence: 6 },
    { price: -15, volume: 18, confidence: 5 },
    { price: -10, volume: 12, confidence: 4 },
    { price: -5, volume: 5, confidence: 2 },
    { price: 0, volume: 0, confidence: 0 },
    { price: 5, volume: -4, confidence: 2 },
    { price: 10, volume: -10, confidence: 4 },
    { price: 15, volume: -18, confidence: 6 },
    { price: 20, volume: -28, confidence: 8 },
  ]
};

const priceDistribution = [
  { range: "₹0-100", own: 12, competitor: 18 },
  { range: "₹100-300", own: 28, competitor: 22 },
  { range: "₹300-500", own: 35, competitor: 30 },
  { range: "₹500-1K", own: 18, competitor: 20 },
  { range: "₹1K+", own: 7, competitor: 10 },
];

const priceTrend = [
  { date: "Jan", avgPrice: 342, competitorAvg: 355 },
  { date: "Feb", avgPrice: 338, competitorAvg: 350 },
  { date: "Mar", avgPrice: 345, competitorAvg: 348 },
];

const priceActionItems: ActionItem[] = [
  { id: "1", severity: "critical", title: "MAP violations on 14 SKUs", description: "Sellers undercutting minimum advertised price on Amazon", metric: "₹2.8L impact", action: "Enforce MAP" },
  { id: "2", severity: "critical", title: "Competitor undercut on top 5 SKUs", description: "Avg 12% lower pricing detected on Flipkart for core products", metric: "-12% avg", action: "Review" },
  { id: "3", severity: "warning", title: "Price erosion in Personal Care", description: "Consistent 5% MoM price drop across category over 3 months", metric: "-5% MoM", action: "Analyze" },
  { id: "4", severity: "info", title: "Price premium opportunity", description: "8 SKUs priced 20% below category avg, room for margin improvement", metric: "+20% headroom", action: "Optimize" },
  { id: "5", severity: "success", title: "Price parity achieved", description: "All Beverages SKUs now within 2% across all platforms", metric: "±2%", action: "Monitor" },
];

const PricingSection = () => {
  const [selectedSku, setSelectedSku] = useState<'SKU-101' | 'SKU-205'>('SKU-101');
  const currentElasticity = elasticityData[selectedSku];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Pricing Analysis & Analytics</h1>
        <p className="text-muted-foreground text-sm mt-1">Track pricing trends, detect MAP violations, and optimize competitive pricing</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Avg Selling Price" value="₹345" change={1.8} changeLabel="vs last month" icon={<DollarSign className="h-5 w-5" />} variant="primary" />
        <KPICard title="MAP Violations" value="14" change={-40} changeLabel="down from 23" icon={<TrendingDown className="h-5 w-5" />} variant="destructive" />
        <KPICard title="Price Competitiveness" value="87%" change={3} changeLabel="within 5% of competition" icon={<BarChart3 className="h-5 w-5" />} variant="success" />
        <KPICard title="Margin Opportunity" value="₹8.2L" change={12} changeLabel="monthly potential" icon={<TrendingUp className="h-5 w-5" />} variant="warning" />
      </div>

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
                item.type === 'COMPETITIVE' ? 'text-success' :
                item.type === 'UNCOMPETITIVE' ? 'text-warning' :
                'text-destructive'
              }`}>{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4 font-medium">{item.subtitle}</p>
              <div className="bg-card rounded-lg p-3 mb-4 border border-border shadow-card">
                <p className="text-xs text-muted-foreground uppercase mb-2 font-bold tracking-wider">Affected SKUs</p>
                <ul className="space-y-1">
                  {item.skus.map(sku => (
                    <li key={sku} className="text-sm text-foreground font-mono font-medium">• {sku}</li>
                  ))}
                </ul>
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

      {/* Elasticity Curve + Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading font-semibold text-foreground">Price Elasticity Curve</h3>
              <p className="text-xs text-muted-foreground">Price changes vs sales volume (95% confidence)</p>
            </div>
            <div className="bg-muted rounded-lg p-1 flex gap-1 border border-border">
              {['SKU-101', 'SKU-205'].map(sku => (
                <button
                  key={sku}
                  onClick={() => setSelectedSku(sku as any)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${selectedSku === sku ? 'bg-card text-primary shadow-card' : 'text-muted-foreground hover:text-foreground'}`}
                >
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
                d={`
                  M ${currentElasticity.map(d => {
                    const x = ((d.price + 25) / 50) * 100;
                    const y = 50 - ((d.volume + d.confidence) / 100) * 80;
                    return `${x},${y}`;
                  }).join(' L ')}
                  L ${currentElasticity.slice().reverse().map(d => {
                    const x = ((d.price + 25) / 50) * 100;
                    const y = 50 - ((d.volume - d.confidence) / 100) * 80;
                    return `${x},${y}`;
                  }).join(' L ')}
                  Z
                `}
                fill="hsl(270, 70%, 50%, 0.1)"
                stroke="none"
              />
              <path
                d={`M ${currentElasticity.map(d => {
                  const x = ((d.price + 25) / 50) * 100;
                  const y = 50 - (d.volume / 100) * 80;
                  return `${x},${y}`;
                }).join(' L ')}`}
                fill="none"
                stroke="hsl(270, 70%, 50%)"
                strokeWidth="1.5"
              />
              {currentElasticity.map((d, i) => {
                const x = ((d.price + 25) / 50) * 100;
                const y = 50 - (d.volume / 100) * 80;
                return <circle key={i} cx={x} cy={y} r="1.5" fill="white" stroke="hsl(270, 70%, 50%)" strokeWidth="1" />;
              })}
            </svg>
            <div className="absolute bottom-2 right-2 text-xs bg-card/90 p-2 rounded-lg border border-border shadow-card backdrop-blur-sm">
              <span className="text-muted-foreground font-medium">Elasticity Coeff: </span>
              <span className={`font-bold ${selectedSku === 'SKU-101' ? 'text-destructive' : 'text-success'}`}>
                {selectedSku === 'SKU-101' ? '-2.4 (High)' : '-1.1 (Low)'}
              </span>
            </div>
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
                <div className="absolute top-1/2 left-[30%] w-4 h-4 bg-card border-2 border-primary rounded-full -translate-y-1/2 shadow cursor-pointer hover:scale-110 transition-transform"></div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mt-1 font-medium">
                <span>-20%</span>
                <span>+20%</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted/50 p-3 rounded-lg text-center border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Est. Volume</p>
                <p className={`text-xl font-bold ${selectedSku === 'SKU-101' ? 'text-success' : 'text-success'}`}>
                  {selectedSku === 'SKU-101' ? '+18%' : '+12%'}
                </p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg text-center border border-border">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Est. Margin</p>
                <p className="text-xl font-bold text-destructive">-4%</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground italic text-center">*Based on elasticity data for {selectedSku}</p>
            <button className="w-full py-2.5 border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors text-sm font-bold">
              Apply to Forecast
            </button>
          </div>
        </div>
      </div>

      {/* Charts Row */}
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

      {/* Actionables */}
      <ActionableList items={priceActionItems} title="Pricing Actions" />
    </div>
  );
};

export default PricingSection;
