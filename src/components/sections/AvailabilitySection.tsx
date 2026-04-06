import { useState } from "react";
import KPICard from "@/components/KPICard";
import ActionableList, { ActionItem } from "@/components/ActionableList";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import DeepDiveToggle from "@/components/DeepDiveToggle";
import { Box, PackageCheck, PackageX, AlertTriangle, Target, Shield, TrendingUp } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from "recharts";

const availTrend = [
  { date: "Feb 1", inStock: 92, oos: 8 },
  { date: "Feb 8", inStock: 88, oos: 12 },
  { date: "Feb 15", inStock: 85, oos: 15 },
  { date: "Feb 22", inStock: 90, oos: 10 },
  { date: "Mar 1", inStock: 93, oos: 7 },
];

const platformBreakdown = [
  { name: "Amazon", value: 94 },
  { name: "Flipkart", value: 88 },
  { name: "Blinkit", value: 76 },
  { name: "BigBasket", value: 91 },
];

const PIE_COLORS = [
  "hsl(270, 70%, 50%)", "hsl(245, 58%, 51%)", "hsl(217, 91%, 60%)", "hsl(142, 71%, 45%)"
];

const oosHeatmapData = [
  { sku: "SKU-101 (Energy)", retailers: [{ name: "Amazon", status: "ok" }, { name: "Flipkart", status: "ok" }, { name: "Blinkit", status: "critical" }, { name: "Zepto", status: "warning" }] },
  { sku: "SKU-205 (Hydrate)", retailers: [{ name: "Amazon", status: "critical" }, { name: "Flipkart", status: "warning" }, { name: "Blinkit", status: "ok" }, { name: "Zepto", status: "ok" }] },
  { sku: "SKU-300 (Tea)", retailers: [{ name: "Amazon", status: "ok" }, { name: "Flipkart", status: "ok" }, { name: "Blinkit", status: "ok" }, { name: "Zepto", status: "ok" }] },
  { sku: "SKU-404 (Bar)", retailers: [{ name: "Amazon", status: "warning" }, { name: "Flipkart", status: "critical" }, { name: "Blinkit", status: "critical" }, { name: "Zepto", status: "warning" }] },
  { sku: "SKU-505 (Mix)", retailers: [{ name: "Amazon", status: "ok" }, { name: "Flipkart", status: "ok" }, { name: "Blinkit", status: "warning" }, { name: "Zepto", status: "ok" }] },
];

const lostRevenueData = [
  { retailer: "Blinkit (NCR)", value: 2400000 },
  { retailer: "Amazon (Mumbai)", value: 1800000 },
  { retailer: "Flipkart (Delhi)", value: 1200000 },
  { retailer: "Zepto (Bangalore)", value: 600000 },
];

const actionItems: ActionItem[] = [
  { id: "1", severity: "critical", title: "12 SKUs out of stock on Amazon", description: "Critical SKUs including bestsellers have 0 inventory since 2 days", metric: "₹4.2L/day loss", action: "View SKUs" },
  { id: "2", severity: "critical", title: "8 SKUs suppressed on Flipkart", description: "Listing suppressed due to pricing violation or quality issues", metric: "8 SKUs", action: "Fix Now" },
  { id: "3", severity: "warning", title: "Low stock alert: 23 SKUs", description: "Inventory below 7-day threshold on Amazon and BigBasket", metric: "23 SKUs", action: "Replenish" },
  { id: "4", severity: "warning", title: "Seller hijacking detected", description: "3 unauthorized sellers found on 5 product listings", metric: "5 ASINs", action: "Investigate" },
  { id: "5", severity: "info", title: "New variant availability opportunity", description: "Competitor out of stock on 500ml variant across platforms", action: "Capitalize" },
  { id: "6", severity: "success", title: "Stock recovered: Premium Range", description: "All 15 premium SKUs back in stock after restock action", metric: "100%", action: "Details" },
];

const campaignTriggers: CampaignTrigger[] = [
  {
    id: "avail-1", signal: "Competitor OOS on Energy Drinks",
    signalDetail: "RedBull & Monster out of stock on Blinkit NCR & Zepto Mumbai for 48+ hours",
    strategy: "Competitor OOS Conquesting", campaignType: "Sponsored Product + Banner Ad",
    platforms: ["Blinkit", "Zepto", "Amazon"],
    keywords: ["energy drink", "caffeine drink", "gym drink", "pre workout drink"],
    estimatedImpact: "+₹8.5L revenue capture in 7 days", urgency: "critical",
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
  {
    id: "avail-2", signal: "Your SKU-404 back in stock",
    signalDetail: "Protein Bar range restored across all platforms after 5 days OOS",
    strategy: "Restock Awareness Blitz", campaignType: "Search + Display Ads",
    platforms: ["Amazon", "Flipkart", "BigBasket"],
    keywords: ["protein bar", "healthy snack", "gym snack", "energy bar"],
    estimatedImpact: "Recover ₹3.2L lost demand in 3 days", urgency: "high",
    icon: <TrendingUp className="h-4 w-4 text-warning" />,
  },
];

const AvailabilitySection = () => {
  const [deepDive, setDeepDive] = useState(false);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Availability</h1>
          <p className="text-muted-foreground text-sm mt-1">Monitor stock health and auto-trigger campaigns on competitor weaknesses</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="In-Stock Rate" value="91.3%" change={2.1} <KPICard title="In-Stock Rate" value="91.3%" change={2.1} changeLabel="Improving — replenishment cycles tightening" icon={<PackageCheck className="h-5 w-5" />} variant="primary" /> icon={<PackageCheck className="h-5 w-5" />} variant="primary" />
        <KPICard title="OOS SKUs" value="47" change={-15} <KPICard title="OOS SKUs" value="47" change={-15} changeLabel="Good — fewer stockouts than last period" icon={<PackageX className="h-5 w-5" />} variant="destructive" /> icon={<PackageX className="h-5 w-5" />} variant="destructive" />
        <KPICard title="Revenue at Risk" value="₹12.4L" change={-8} <KPICard title="Revenue at Risk" value="₹12.4L" change={-8} changeLabel="Reducing — fewer OOS events lowering revenue impact" icon={<AlertTriangle className="h-5 w-5" />} variant="warning" /> icon={<AlertTriangle className="h-5 w-5" />} variant="warning" />
        <KPICard title="Active SKUs" value="1,284" change={3.5} <KPICard title="Active SKUs" value="1,284" change={3.5} changeLabel="Growing — new listings expanding platform coverage" icon={<Box className="h-5 w-5" />} /> icon={<Box className="h-5 w-5" />} />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={campaignTriggers} title="Availability-Based Campaign Triggers" />

          {/* OOS Heatmap */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">OOS Heatmap</h3>
            <p className="text-xs text-muted-foreground mb-4">Which SKUs are out of stock at which retailers?</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="p-3 text-xs text-muted-foreground font-bold border-b border-border uppercase tracking-wider">SKU</th>
                    {oosHeatmapData[0].retailers.map((r, i) => (
                      <th key={i} className="p-3 text-xs text-muted-foreground font-bold border-b border-border text-center uppercase tracking-wider">{r.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {oosHeatmapData.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/50 transition-colors">
                      <td className="p-3 text-sm font-mono text-foreground font-medium">{row.sku}</td>
                      {row.retailers.map((r, j) => (
                        <td key={j} className="p-3 text-center">
                          <div className={`h-4 w-4 rounded-sm mx-auto ${
                            r.status === 'ok' ? 'bg-success' :
                            r.status === 'warning' ? 'bg-warning' : 'bg-destructive animate-pulse'
                          }`} title={r.status}></div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <ActionableList items={actionItems} title="Priority Actions" />
        </>
      ) : (
        <>
          {/* Deep Dive Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Stock Availability Trend</h3>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={availTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, border: "1px solid hsl(260, 15%, 90%)", fontSize: 13 }} />
                  <Legend />
                  <Line type="monotone" dataKey="inStock" name="In-Stock %" stroke="hsl(270, 70%, 50%)" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="oos" name="OOS %" stroke="hsl(0, 72%, 51%)" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Lost Revenue Estimator</h3>
              <p className="text-xs text-muted-foreground mb-4">Revenue lost to OOS</p>
              <div className="text-center mb-4">
                <p className="text-3xl font-bold text-destructive">₹66,00,000</p>
                <p className="text-xs text-muted-foreground">Total Est. Loss (4W)</p>
              </div>
              <div className="space-y-2">
                {lostRevenueData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 bg-muted/50 rounded-lg border border-border">
                    <span className="text-xs text-foreground font-medium">{item.retailer}</span>
                    <span className="text-xs font-bold text-destructive">-₹{item.value.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Restock Lag Indicator</h3>
              <p className="text-xs text-muted-foreground mb-4">Avg. days/hours to recover stock</p>
              <div className="space-y-4">
                {[
                  { retailer: "Blinkit (NCR)", time: "4 hours", pct: 80, color: "bg-destructive" },
                  { retailer: "Amazon", time: "1.2 days", pct: 20, color: "bg-success" },
                  { retailer: "Zepto", time: "2 hours", pct: 50, color: "bg-warning" },
                  { retailer: "Flipkart", time: "6 hours", pct: 65, color: "bg-warning" },
                ].map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center">
                    <span className="text-xs text-foreground font-medium w-28">{item.retailer}</span>
                    <div className="flex items-center gap-2 flex-1">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div className={`h-full ${item.color} rounded-full`} style={{ width: `${item.pct}%` }}></div>
                      </div>
                      <span className={`text-xs font-bold ${item.pct > 60 ? 'text-destructive' : item.pct > 40 ? 'text-warning' : 'text-success'}`}>{item.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-4">Platform Availability</h3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={platformBreakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} innerRadius={45} paddingAngle={3}>
                    {platformBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {platformBreakdown.map((p, i) => (
                  <div key={p.name} className="flex items-center gap-2 text-xs">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{p.name}</span>
                    <span className="font-semibold text-foreground ml-auto">{p.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AvailabilitySection;
