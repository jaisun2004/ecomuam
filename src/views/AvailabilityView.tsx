import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { MapPin, Store, ArrowRight } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const oosTimeline = [
  { day: "Mar 1", oos: 4 }, { day: "Mar 5", oos: 6 }, { day: "Mar 10", oos: 3 },
  { day: "Mar 15", oos: 8 }, { day: "Mar 20", oos: 5 }, { day: "Mar 25", oos: 11 }, { day: "Mar 30", oos: 14 },
];

const skuAvailability = [
  { sku: "Original 500ml", avail: 86 },
  { sku: "Sugar Free 500ml", avail: 42 },
  { sku: "Citrus 250ml", avail: 71 },
  { sku: "Berry 350ml", avail: 95 },
  { sku: "Electrolyte 500ml", avail: 54 },
  { sku: "Shot 60ml", avail: 98 },
];

const stockForecast = [
  { sku: "Sugar Free 500ml", currentStock: 12, daysToOOS: 2.3, trend: "critical" },
  { sku: "Electrolyte 500ml", currentStock: 28, daysToOOS: 5.1, trend: "warning" },
  { sku: "Citrus 250ml", currentStock: 35, daysToOOS: 7.8, trend: "ok" },
  { sku: "Berry 350ml", currentStock: 68, daysToOOS: 18.4, trend: "ok" },
];

/* Darkstore data for Q-commerce */
const darkstoreGaps = [
  { city: "Delhi NCR", totalDarkstores: 142, products: [
    { sku: "Original 500ml", listed: 98, unlisted: 44, coverage: 69 },
    { sku: "Sugar Free 500ml", listed: 72, unlisted: 70, coverage: 51 },
    { sku: "Citrus 250ml", listed: 34, unlisted: 108, coverage: 24 },
    { sku: "Berry 350ml", listed: 110, unlisted: 32, coverage: 77 },
  ]},
  { city: "Mumbai", totalDarkstores: 98, products: [
    { sku: "Original 500ml", listed: 82, unlisted: 16, coverage: 84 },
    { sku: "Sugar Free 500ml", listed: 55, unlisted: 43, coverage: 56 },
    { sku: "Citrus 250ml", listed: 18, unlisted: 80, coverage: 18 },
  ]},
  { city: "Bangalore", totalDarkstores: 76, products: [
    { sku: "Original 500ml", listed: 68, unlisted: 8, coverage: 89 },
    { sku: "Sugar Free 500ml", listed: 42, unlisted: 34, coverage: 55 },
  ]},
];

/* Competition comparison */
const competitorAvail = [
  { brand: "EnergyMax (You)", avgAvail: 74, oosEvents: 14 },
  { brand: "Red Bull", avgAvail: 92, oosEvents: 3 },
  { brand: "Monster", avgAvail: 78, oosEvents: 11 },
  { brand: "Sting", avgAvail: 85, oosEvents: 6 },
  { brand: "Hell Energy", avgAvail: 45, oosEvents: 22 },
];

const AvailabilityView: React.FC<ViewProps> = ({ platform, isNational, onNavigate }) => {
  const [selectedCity, setSelectedCity] = useState(0);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Availability" value="74%" delta="▼ 4% vs last wk" deltaType="negative" sub={`${platform} · 6 SKUs`} accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Events (30d)" value="14" delta="▲ 4 vs last wk" deltaType="negative" sub="Critical stock alerts" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Stock-out Forecast" value="2 SKUs" delta="At risk in 3 days" deltaType="negative" sub="AI prediction" accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="vs Competition" value="#3" delta="Behind Red Bull, Sting" deltaType="warning" sub="Availability ranking" accentColor="bg-primary" delay={0.15} />
      </motion.div>

      {/* OOS Timeline + SKU Breakdown */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <PanelCard title="OOS Events Timeline" badge="30 Day Trend" badgeColor="red" className="col-span-2" delay={0}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={oosTimeline}>
              <defs>
                <linearGradient id="gOOS" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0,76%,57%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0,76%,57%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(260,22%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="oos" stroke="hsl(0,76%,57%)" fill="url(#gOOS)" strokeWidth={2} name="OOS Events" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title={`SKU Availability — ${platform}`} badge="SKU Level" badgeColor="accent" delay={0}>
          <div className="space-y-2">
            {skuAvailability.map((s) => (
              <div key={s.sku} className="flex items-center gap-3 p-2 bg-surface-2 rounded-xl border border-subtle">
                <span className="text-xs text-foreground flex-1">{s.sku}</span>
                <div className="w-24 h-2.5 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${s.avail}%`,
                    backgroundColor: s.avail >= 80 ? "hsl(160,70%,48%)" : s.avail >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                  }} />
                </div>
                <span className={`font-mono text-[11px] w-10 text-right ${s.avail >= 80 ? "text-sw-green" : s.avail >= 50 ? "text-sw-amber" : "text-sw-red"}`}>{s.avail}%</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Competition Comparison */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Availability vs Competition — ${platform}`} badge="Benchmark" badgeColor="accent" delay={0}>
          <div className="grid grid-cols-5 gap-3">
            {competitorAvail.map((c) => (
              <div key={c.brand} className={`p-3 rounded-xl border ${c.brand.includes("You") ? "border-primary/30 bg-primary/5" : "border-subtle bg-surface-2"}`}>
                <p className="text-xs text-foreground font-medium mb-2">{c.brand}</p>
                <p className={`font-mono text-xl font-bold ${c.avgAvail >= 80 ? "text-sw-green" : c.avgAvail >= 60 ? "text-sw-amber" : "text-sw-red"}`}>{c.avgAvail}%</p>
                <p className="text-[10px] text-muted-foreground mt-1">{c.oosEvents} OOS events</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Q-commerce: Darkstore gaps / National: Stock forecast */}
      {!isNational ? (
        <motion.div variants={fadeUp}>
          <PanelCard title="Darkstore Listing Gaps" badge="Q-Commerce Coverage" badgeColor="amber" delay={0}>
            <div className="flex items-center gap-2 mb-4">
              {darkstoreGaps.map((c, i) => (
                <button key={c.city} onClick={() => setSelectedCity(i)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${selectedCity === i ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                  <MapPin size={10} className="inline mr-1" />{c.city} · {c.totalDarkstores} stores
                </button>
              ))}
            </div>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 font-normal">Product</th>
                  <th className="text-right py-2 font-normal">Listed</th>
                  <th className="text-right py-2 font-normal">Unlisted</th>
                  <th className="text-right py-2 font-normal">Coverage</th>
                </tr>
              </thead>
              <tbody>
                {darkstoreGaps[selectedCity].products.map((p, i) => (
                  <tr key={p.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground flex items-center gap-1.5"><Store size={12} className="text-muted-foreground" /> {p.sku}</td>
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
                        <span className={`font-mono text-[11px] ${p.coverage >= 70 ? "text-sw-green" : p.coverage >= 50 ? "text-sw-amber" : "text-sw-red"}`}>{p.coverage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 text-[10px]">
              <button onClick={() => onNavigate("campaigns")} className="text-primary hover:underline flex items-center gap-1">
                Manage campaign geo-targeting <ArrowRight size={10} />
              </button>
            </div>
          </PanelCard>
        </motion.div>
      ) : null}

      {/* Stock Forecast */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Stock-out Forecast" badge="AI Prediction" badgeColor="primary" delay={0}>
          <div className="grid grid-cols-2 gap-2">
            {stockForecast.map((s, i) => (
              <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
                s.trend === "critical" ? "bg-sw-red-dim/50 border-sw-red/20" : s.trend === "warning" ? "bg-sw-amber-dim/50 border-sw-amber/20" : "bg-surface-2 border-subtle"
              }`}>
                <div className="flex-1">
                  <p className="text-xs text-foreground font-medium">{s.sku}</p>
                  <p className="text-[10px] text-muted-foreground">Stock: {s.currentStock}%</p>
                </div>
                <div className="text-right">
                  <p className={`font-mono text-sm font-bold ${s.trend === "critical" ? "text-sw-red" : s.trend === "warning" ? "text-sw-amber" : "text-sw-green"}`}>{s.daysToOOS}d</p>
                  <p className="text-[9px] text-muted-foreground">to stock-out</p>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default AvailabilityView;
