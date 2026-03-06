import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";

const oosTimeline = [
  { day: "Mar 1", oos: 4 }, { day: "Mar 5", oos: 6 }, { day: "Mar 10", oos: 3 },
  { day: "Mar 15", oos: 8 }, { day: "Mar 20", oos: 5 }, { day: "Mar 25", oos: 11 }, { day: "Mar 30", oos: 14 },
];

const platformAvailability = [
  { name: "Amazon", overall: 86, color: "#FF9900", skus: [
    { sku: "Whey 1kg", avail: 97 }, { sku: "Whey 500g", avail: 100 }, { sku: "Creatine", avail: 72 },
    { sku: "BCAA", avail: 95 }, { sku: "Pre-Workout", avail: 54 }, { sku: "Multi-Vit", avail: 98 },
  ]},
  { name: "Flipkart", overall: 68, color: "#2F77FF", skus: [
    { sku: "Whey 1kg", avail: 74 }, { sku: "Whey 500g", avail: 92 }, { sku: "Creatine", avail: 61 },
    { sku: "BCAA", avail: 88 }, { sku: "Pre-Workout", avail: 12 }, { sku: "Multi-Vit", avail: 78 },
  ]},
  { name: "Blinkit", overall: 41, color: "#FDDC2B", skus: [
    { sku: "Whey 1kg", avail: 55 }, { sku: "Whey 500g", avail: 38 }, { sku: "Multi-Vit", avail: 71 },
  ]},
  { name: "Zepto", overall: 56, color: "#833AB4", skus: [
    { sku: "Whey 1kg", avail: 93 }, { sku: "Whey 500g", avail: 77 }, { sku: "Multi-Vit", avail: 52 },
  ]},
  { name: "Instamart", overall: 21, color: "#FC8019", skus: [
    { sku: "Whey 1kg", avail: 34 }, { sku: "Whey 500g", avail: 9 }, { sku: "Multi-Vit", avail: 41 },
  ]},
];

const revenueImpactData = [
  { sku: "Pre-Workout 300g", platform: "Flipkart", lostRevenue: "₹2.8L", daysOOS: 12, avgDailyLoss: "₹23K" },
  { sku: "Whey 500g", platform: "Instamart", lostRevenue: "₹1.9L", daysOOS: 8, avgDailyLoss: "₹24K" },
  { sku: "Whey 500g", platform: "Blinkit", lostRevenue: "₹1.4L", daysOOS: 6, avgDailyLoss: "₹23K" },
  { sku: "Multi-Vit 60ct", platform: "Zepto", lostRevenue: "₹0.8L", daysOOS: 4, avgDailyLoss: "₹20K" },
  { sku: "Creatine 250g", platform: "Flipkart", lostRevenue: "₹0.6L", daysOOS: 3, avgDailyLoss: "₹20K" },
];

const stockForecast = [
  { sku: "Pre-Workout 300g", platform: "Blinkit", currentStock: 12, daysToOOS: 2.3, trend: "critical" },
  { sku: "Multi-Vit 60ct", platform: "Zepto", currentStock: 28, daysToOOS: 5.1, trend: "warning" },
  { sku: "Whey 500g", platform: "Instamart", currentStock: 8, daysToOOS: 1.2, trend: "critical" },
  { sku: "Creatine 250g", platform: "Flipkart", currentStock: 34, daysToOOS: 7.8, trend: "ok" },
  { sku: "BCAA Tropical", platform: "Amazon", currentStock: 45, daysToOOS: 12.4, trend: "ok" },
];

const pincodeCoverage = [
  { region: "Delhi NCR", pincodes: 18, avgAvailability: 72, oosCount: 3 },
  { region: "Mumbai", pincodes: 12, avgAvailability: 68, oosCount: 4 },
  { region: "Bangalore", pincodes: 8, avgAvailability: 81, oosCount: 1 },
  { region: "Hyderabad", pincodes: 6, avgAvailability: 55, oosCount: 3 },
  { region: "Chennai", pincodes: 5, avgAvailability: 62, oosCount: 2 },
];

const AvailabilityView: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Availability" value="68%" delta="▼ 4% vs last wk" deltaType="negative" sub="Across 6 platforms · 48 SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Events (30d)" value="14" delta="▲ 4 vs last wk" deltaType="negative" sub="₹8.4L estimated revenue lost" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Avg Days to Restock" value="3.2d" delta="▼ 0.8d improved" deltaType="positive" sub="After supply chain optimization" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Revenue at Risk" value="₹4.2L" delta="Active stock-outs" deltaType="negative" sub="₹4.2L/day from current OOS" accentColor="bg-sw-amber" delay={0.15} />
      </div>

      {/* OOS Timeline + Platform Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="OOS Events Timeline" badge="30 Day Trend" badgeColor="red" className="col-span-2" delay={0.2}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={oosTimeline}>
              <defs>
                <linearGradient id="gOOS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0,76%,57%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0,76%,57%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="oos" stroke="hsl(0,76%,57%)" fill="url(#gOOS)" strokeWidth={2} name="OOS Events" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Platform Availability" badge="All Platforms" badgeColor="accent" delay={0.25}>
          <div className="space-y-3">
            {platformAvailability.map((p, i) => (
              <button key={p.name} onClick={() => setSelectedPlatform(i)}
                className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${selectedPlatform === i ? "bg-primary/10 border border-primary/20" : "hover:bg-surface-2"}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-foreground flex-1 text-left">{p.name}</span>
                <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${p.overall}%`,
                    backgroundColor: p.overall >= 70 ? "hsl(160,70%,48%)" : p.overall >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                  }} />
                </div>
                <span className={`font-mono text-[11px] w-10 text-right ${
                  p.overall >= 70 ? "text-sw-green" : p.overall >= 50 ? "text-sw-amber" : "text-sw-red"
                }`}>{p.overall}%</span>
              </button>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* SKU Breakdown for selected platform + Revenue Impact */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title={`SKU Availability — ${platformAvailability[selectedPlatform].name}`} badge="SKU Level" badgeColor="accent" delay={0.3}>
          <div className="space-y-2">
            {platformAvailability[selectedPlatform].skus.map((s) => (
              <div key={s.sku} className="flex items-center gap-3 p-2 bg-surface-2 rounded-xl border border-subtle">
                <span className="text-xs text-foreground flex-1">{s.sku}</span>
                <div className="w-32 h-2.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${s.avail}%`,
                    backgroundColor: s.avail >= 80 ? "hsl(160,70%,48%)" : s.avail >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                  }} />
                </div>
                <span className={`font-mono text-[11px] w-10 text-right ${
                  s.avail >= 80 ? "text-sw-green" : s.avail >= 50 ? "text-sw-amber" : "text-sw-red"
                }`}>{s.avail}%</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Revenue Impact — Stock-outs" badge="₹8.4L lost" badgeColor="red" delay={0.35}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">SKU</th>
                <th className="text-left py-2 font-normal">Platform</th>
                <th className="text-right py-2 font-normal">Lost Rev</th>
                <th className="text-right py-2 font-normal">Days OOS</th>
              </tr>
            </thead>
            <tbody>
              {revenueImpactData.map((r, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2 text-foreground">{r.sku}</td>
                  <td className="py-2 text-muted-foreground">{r.platform}</td>
                  <td className="py-2 text-right font-mono text-sw-red">{r.lostRevenue}</td>
                  <td className="py-2 text-right font-mono text-foreground">{r.daysOOS}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>
      </div>

      {/* Stock Forecast + Regional Coverage */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Stock-out Forecast" badge="AI Prediction" badgeColor="purple" delay={0.4}>
          <div className="space-y-2">
            {stockForecast.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                s.trend === "critical" ? "bg-sw-red-dim/50 border-sw-red/20" : s.trend === "warning" ? "bg-sw-amber-dim/50 border-sw-amber/20" : "bg-surface-2 border-subtle"
              }`}>
                <div className="flex-1">
                  <p className="text-xs text-foreground font-medium">{s.sku}</p>
                  <p className="text-[10px] text-muted-foreground">{s.platform} · Stock: {s.currentStock}%</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-bold ${
                    s.trend === "critical" ? "text-sw-red" : s.trend === "warning" ? "text-sw-amber" : "text-sw-green"
                  }`}>{s.daysToOOS}d</p>
                  <p className="text-[9px] text-muted-foreground">to stock-out</p>
                </div>
                <button onClick={() => setActionStates(p => ({ ...p, [i]: true }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    actionStates[i] ? "bg-sw-green-dim text-sw-green" :
                    s.trend === "critical" ? "bg-sw-red/20 text-sw-red hover:bg-sw-red/30" : "bg-surface-3 text-foreground hover:bg-primary/10"
                  }`}>
                  {actionStates[i] ? "✓ Ordered" : "Reorder"}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Regional Coverage — Q-Commerce" badge="5 regions" badgeColor="amber" delay={0.45}>
          <div className="space-y-2">
            {pincodeCoverage.map((r) => (
              <div key={r.region} className="flex items-center gap-3 p-3 bg-surface-2 rounded-xl border border-subtle">
                <div className="flex-1">
                  <p className="text-xs text-foreground font-medium">{r.region}</p>
                  <p className="text-[10px] text-muted-foreground">{r.pincodes} pincodes · {r.oosCount} OOS</p>
                </div>
                <div className="w-20 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${r.avgAvailability}%`,
                    backgroundColor: r.avgAvailability >= 70 ? "hsl(160,70%,48%)" : r.avgAvailability >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                  }} />
                </div>
                <span className={`font-mono text-[11px] w-10 text-right ${
                  r.avgAvailability >= 70 ? "text-sw-green" : r.avgAvailability >= 50 ? "text-sw-amber" : "text-sw-red"
                }`}>{r.avgAvailability}%</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
};

export default AvailabilityView;
