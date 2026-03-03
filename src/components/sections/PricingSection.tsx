import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import { DollarSign, TrendingDown, TrendingUp, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, LineChart, Line, Legend, Cell,
} from "recharts";

const priceDistribution = [
  { range: "₹0-100", own: 12, competitor: 18 },
  { range: "₹100-300", own: 28, competitor: 22 },
  { range: "₹300-500", own: 35, competitor: 30 },
  { range: "₹500-1K", own: 18, competitor: 20 },
  { range: "₹1K+", own: 7, competitor: 10 },
];

const priceTrend = [
  { date: "Jan", avgPrice: 342, competitorAvg: 355, mapViolation: 2 },
  { date: "Feb", avgPrice: 338, competitorAvg: 350, mapViolation: 5 },
  { date: "Mar", avgPrice: 345, competitorAvg: 348, mapViolation: 1 },
];

const priceActions: ActionItem[] = [
  { id: "1", severity: "critical", title: "MAP violations on 14 SKUs", description: "Sellers undercutting minimum advertised price on Amazon", metric: "₹2.8L impact", action: "Enforce MAP" },
  { id: "2", severity: "critical", title: "Competitor undercut on top 5 SKUs", description: "Avg 12% lower pricing detected on Flipkart for core products", metric: "-12% avg", action: "Review" },
  { id: "3", severity: "warning", title: "Price erosion in Personal Care", description: "Consistent 5% MoM price drop across category over 3 months", metric: "-5% MoM", action: "Analyze" },
  { id: "4", severity: "info", title: "Price premium opportunity", description: "8 SKUs priced 20% below category avg, room for margin improvement", metric: "+20% headroom", action: "Optimize" },
  { id: "5", severity: "success", title: "Price parity achieved", description: "All Beverages SKUs now within 2% across all platforms", metric: "±2%", action: "Monitor" },
];

const competitorPriceMap = [
  { sku: "SKU-A", own: 299, competitor: 279, gap: -7 },
  { sku: "SKU-B", own: 499, competitor: 520, gap: 4 },
  { sku: "SKU-C", own: 189, competitor: 169, gap: -11 },
  { sku: "SKU-D", own: 749, competitor: 749, gap: 0 },
  { sku: "SKU-E", own: 399, competitor: 365, gap: -9 },
  { sku: "SKU-F", own: 599, competitor: 620, gap: 4 },
];

const PricingSection = () => {
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
          <h3 className="font-heading font-semibold text-foreground mb-4">Price Trend & MAP Violations</h3>
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

      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2">
          <ActionableList items={priceActions} title="Pricing Actions" />
        </div>
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-4">Competitive Price Gap</h3>
          <div className="space-y-3">
            {competitorPriceMap.map((item) => (
              <div key={item.sku} className="flex items-center justify-between text-sm">
                <span className="font-medium text-foreground w-16">{item.sku}</span>
                <span className="text-muted-foreground">₹{item.own} vs ₹{item.competitor}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  item.gap < 0 ? "bg-destructive/10 text-destructive" : item.gap > 0 ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
                }`}>
                  {item.gap > 0 ? "+" : ""}{item.gap}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingSection;
