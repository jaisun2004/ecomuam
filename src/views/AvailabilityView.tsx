import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { AlertTriangle, Megaphone, MapPin, Store } from "lucide-react";

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

/* Darkstore listing gaps by city */
const darkstoreGaps = [
  {
    city: "Delhi NCR", totalDarkstores: 142,
    products: [
      { sku: "Whey 1kg", listed: 98, unlisted: 44, coverage: 69, campaignsRunning: true, wastingBudget: true },
      { sku: "Whey 500g", listed: 72, unlisted: 70, coverage: 51, campaignsRunning: true, wastingBudget: true },
      { sku: "Pre-Workout", listed: 34, unlisted: 108, coverage: 24, campaignsRunning: true, wastingBudget: true },
      { sku: "Creatine", listed: 88, unlisted: 54, coverage: 62, campaignsRunning: false, wastingBudget: false },
      { sku: "BCAA", listed: 45, unlisted: 97, coverage: 32, campaignsRunning: true, wastingBudget: true },
      { sku: "Multi-Vit", listed: 110, unlisted: 32, coverage: 77, campaignsRunning: false, wastingBudget: false },
    ],
  },
  {
    city: "Mumbai", totalDarkstores: 98,
    products: [
      { sku: "Whey 1kg", listed: 82, unlisted: 16, coverage: 84, campaignsRunning: true, wastingBudget: false },
      { sku: "Whey 500g", listed: 55, unlisted: 43, coverage: 56, campaignsRunning: true, wastingBudget: true },
      { sku: "Pre-Workout", listed: 18, unlisted: 80, coverage: 18, campaignsRunning: true, wastingBudget: true },
      { sku: "Creatine", listed: 61, unlisted: 37, coverage: 62, campaignsRunning: false, wastingBudget: false },
      { sku: "BCAA", listed: 30, unlisted: 68, coverage: 31, campaignsRunning: true, wastingBudget: true },
      { sku: "Multi-Vit", listed: 75, unlisted: 23, coverage: 77, campaignsRunning: false, wastingBudget: false },
    ],
  },
  {
    city: "Bangalore", totalDarkstores: 76,
    products: [
      { sku: "Whey 1kg", listed: 68, unlisted: 8, coverage: 89, campaignsRunning: true, wastingBudget: false },
      { sku: "Whey 500g", listed: 42, unlisted: 34, coverage: 55, campaignsRunning: true, wastingBudget: true },
      { sku: "Pre-Workout", listed: 22, unlisted: 54, coverage: 29, campaignsRunning: false, wastingBudget: false },
      { sku: "Creatine", listed: 55, unlisted: 21, coverage: 72, campaignsRunning: false, wastingBudget: false },
    ],
  },
];

const adWasteAlerts = darkstoreGaps.flatMap(city =>
  city.products
    .filter(p => p.wastingBudget)
    .map(p => ({
      city: city.city,
      sku: p.sku,
      coverage: p.coverage,
      unlisted: p.unlisted,
      totalDarkstores: city.totalDarkstores,
      wastedSpend: `₹${Math.round(p.unlisted * 0.12)}K/day`,
    }))
).slice(0, 6);

const AvailabilityView: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [selectedCity, setSelectedCity] = useState(0);
  const [adPauseStates, setAdPauseStates] = useState<Record<number, boolean>>({});

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Availability" value="68%" delta="▼ 4% vs last wk" deltaType="negative" sub="Across 6 platforms · 48 SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Events (30d)" value="14" delta="▲ 4 vs last wk" deltaType="negative" sub="₹8.4L estimated revenue lost" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Darkstore Gaps" value="412" delta="Unlisted product-store pairs" deltaType="negative" sub="Across 3 cities · Q-Commerce" accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="Ad Budget Wasted" value="₹2.8L/mo" delta="Ads running where not listed" deltaType="negative" sub="Pause campaigns in unlisted areas" accentColor="bg-sw-red" delay={0.15} />
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

      {/* Darkstore Listing Gaps — NEW */}
      <PanelCard title="Darkstore Listing Gaps" badge="Q-Commerce Coverage" badgeColor="amber" delay={0.28}>
        <div className="flex items-center gap-2 mb-4">
          {darkstoreGaps.map((c, i) => (
            <button key={c.city} onClick={() => setSelectedCity(i)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                selectedCity === i ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
              }`}>
              <MapPin size={10} className="inline mr-1" />{c.city} · {c.totalDarkstores} stores
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Product</th>
                <th className="text-right py-2 font-normal">Listed</th>
                <th className="text-right py-2 font-normal">Unlisted</th>
                <th className="text-right py-2 font-normal">Coverage</th>
                <th className="text-center py-2 font-normal">Ads Running?</th>
                <th className="text-center py-2 font-normal">Issue</th>
              </tr>
            </thead>
            <tbody>
              {darkstoreGaps[selectedCity].products.map((p, i) => (
                <tr key={p.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground flex items-center gap-1.5">
                    <Store size={12} className="text-muted-foreground" /> {p.sku}
                  </td>
                  <td className="py-2.5 text-right font-mono text-sw-green">{p.listed}</td>
                  <td className="py-2.5 text-right font-mono text-sw-red">{p.unlisted}</td>
                  <td className="py-2.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${p.coverage}%`,
                          backgroundColor: p.coverage >= 70 ? "hsl(160,70%,48%)" : p.coverage >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                        }} />
                      </div>
                      <span className={`font-mono text-[11px] ${
                        p.coverage >= 70 ? "text-sw-green" : p.coverage >= 50 ? "text-sw-amber" : "text-sw-red"
                      }`}>{p.coverage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                      p.campaignsRunning ? "bg-sw-green-dim text-sw-green" : "bg-surface-3 text-muted-foreground"
                    }`}>{p.campaignsRunning ? "YES" : "NO"}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    {p.wastingBudget ? (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-red-dim text-sw-red flex items-center gap-0.5 justify-center">
                        <AlertTriangle size={9} /> WASTING BUDGET
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-sw-red-dim border border-sw-red/20">
          <p className="text-[11px] text-foreground">⚠ {darkstoreGaps[selectedCity].products.filter(p => p.wastingBudget).length} products have campaigns running in areas where they're not listed on darkstores. Estimated budget waste: ₹{Math.round(darkstoreGaps[selectedCity].products.filter(p => p.wastingBudget).reduce((s, p) => s + p.unlisted * 0.12, 0))}K/day</p>
        </div>
      </PanelCard>

      {/* Ad Waste Alerts */}
      <PanelCard title="Ad Budget Waste — Campaigns in Unlisted Areas" badge={`${adWasteAlerts.length} alerts`} badgeColor="red" delay={0.32}>
        <p className="text-[10px] text-muted-foreground mb-3">Campaigns running in cities/pincodes where products are not listed on enough darkstores. Pause or geo-restrict these campaigns.</p>
        <div className="grid grid-cols-2 gap-3">
          {adWasteAlerts.map((a, i) => (
            <div key={i} className="p-3 rounded-xl bg-sw-red-dim/30 border border-sw-red/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground font-medium">{a.sku} — {a.city}</span>
                <span className="font-mono text-[9px] text-sw-red">{a.wastedSpend} wasted</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Only {a.coverage}% coverage ({a.unlisted}/{a.totalDarkstores} stores unlisted)</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => setAdPauseStates(p => ({ ...p, [i]: true }))}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    adPauseStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-red/20 text-sw-red hover:bg-sw-red/30"
                  }`}>
                  {adPauseStates[i] ? "✓ Campaign Geo-Restricted" : "Pause Ads in Unlisted Areas"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* SKU Breakdown + Revenue Impact */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title={`SKU Availability — ${platformAvailability[selectedPlatform].name}`} badge="SKU Level" badgeColor="accent" delay={0.35}>
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

        <PanelCard title="Revenue Impact — Stock-outs" badge="₹8.4L lost" badgeColor="red" delay={0.4}>
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

      {/* Stock Forecast */}
      <PanelCard title="Stock-out Forecast" badge="AI Prediction" badgeColor="purple" delay={0.45}>
        <div className="grid grid-cols-2 gap-2">
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
    </div>
  );
};

export default AvailabilityView;
