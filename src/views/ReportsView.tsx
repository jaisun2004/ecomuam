import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const plRows: Record<string, { rev: string; spend: string; returns: string; retColor: string; margin: string; mColor: string }> = {
  "7D": { rev: "₹24L", spend: "₹1.9L", returns: "6.8%", retColor: "text-sw-amber", margin: "39%", mColor: "text-sw-green font-bold" },
  "30D": { rev: "₹98L", spend: "₹7.8L", returns: "7.1%", retColor: "text-sw-amber", margin: "38%", mColor: "text-sw-green font-bold" },
  "90D": { rev: "₹2.8Cr", spend: "₹22L", returns: "6.9%", retColor: "text-sw-amber", margin: "40%", mColor: "text-sw-green font-bold" },
};

const kpisByTime: Record<string, { rev: string; revDelta: string; margin: string; marginDelta: string; returnRate: string; returnDelta: string }> = {
  "7D": { rev: "₹24L", revDelta: "▲ 12% WoW", margin: "39%", marginDelta: "▲ 2% vs last wk", returnRate: "6.8%", returnDelta: "▼ 0.4%" },
  "30D": { rev: "₹98L", revDelta: "▲ 18% MoM", margin: "38%", marginDelta: "▲ 3% vs last mo", returnRate: "7.1%", returnDelta: "▲ 0.8%" },
  "90D": { rev: "₹2.8Cr", revDelta: "▲ 22% QoQ", margin: "40%", marginDelta: "▲ 5% vs last qtr", returnRate: "6.9%", returnDelta: "▼ 0.3%" },
};

const skuPerformance = [
  { sku: "Original 500ml", rev: "₹38L", share: 39, trend: "+12%" },
  { sku: "Sugar Free 500ml", rev: "₹22L", share: 22, trend: "+28%" },
  { sku: "Berry 350ml", rev: "₹18L", share: 18, trend: "+45%" },
  { sku: "Citrus 250ml", rev: "₹10L", share: 10, trend: "-3%" },
  { sku: "Electrolyte 500ml", rev: "₹7L", share: 7, trend: "+8%" },
  { sku: "Shot 60ml", rev: "₹3L", share: 3, trend: "+61%" },
];

const reports = [
  { name: "Weekly Shelf Report", schedule: "Every Monday 8AM", to: "CEO + Marketing Head", status: "ACTIVE", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Daily ROAS Digest", schedule: "Every day 7AM", to: "E-commerce Manager", status: "ACTIVE", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Monthly P&L Report", schedule: "1st of month", to: "CFO + Brand Head", status: "SCHEDULED", sColor: "text-primary bg-primary/15" },
  { name: "Competitor Price Alert", schedule: "On trigger", to: "Trade Marketing Lead", status: "REAL-TIME", sColor: "text-sw-amber bg-sw-amber-dim" },
];

const ReportsView: React.FC<ViewProps> = ({ platform, timeRange }) => {
  const [reportAdded, setReportAdded] = useState(false);
  const kpis = kpisByTime[timeRange] || kpisByTime["30D"];
  const pl = plRows[timeRange] || plRows["30D"];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title={`Revenue (${timeRange})`} value={kpis.rev} delta={kpis.revDelta} deltaType="positive" sub={`${platform} · Energy Drinks`} accentColor="bg-primary" delay={0} />
        <KPICard title="Net Margin" value={kpis.margin} delta={kpis.marginDelta} deltaType="positive" sub="After ad spend, returns" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Return Rate" value={kpis.returnRate} delta={kpis.returnDelta} deltaType={kpis.returnDelta.includes("▲") ? "negative" : "positive"} sub="Monitor trend" accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="Scheduled Reports" value="12" delta="Next: Tomorrow 8AM" deltaType="neutral" sub="3 stakeholders" accentColor="bg-primary" delay={0.15} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <PanelCard title={`P&L Summary — ${platform} · ${timeRange}`} badge="Net Margin View" badgeColor="accent" className="col-span-2" delay={0}>
          <div className="grid grid-cols-4 gap-4 p-4 rounded-xl bg-surface-2 border border-subtle">
            <div><span className="text-[10px] text-muted-foreground">Revenue</span><p className="font-mono text-lg font-bold text-foreground">{pl.rev}</p></div>
            <div><span className="text-[10px] text-muted-foreground">Ad Spend</span><p className="font-mono text-lg font-bold text-foreground">{pl.spend}</p></div>
            <div><span className="text-[10px] text-muted-foreground">Returns</span><p className={`font-mono text-lg font-bold ${pl.retColor}`}>{pl.returns}</p></div>
            <div><span className="text-[10px] text-muted-foreground">Net Margin</span><p className={`font-mono text-lg font-bold ${pl.mColor}`}>{pl.margin}</p></div>
          </div>

          <h4 className="font-display font-bold text-sm text-foreground mt-6 mb-3">SKU Performance</h4>
          <div className="space-y-2">
            {skuPerformance.map((s) => (
              <div key={s.sku} className="flex items-center gap-3">
                <span className="text-xs text-foreground w-36">{s.sku}</span>
                <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full" style={{ width: `${s.share * 2.5}%` }} />
                </div>
                <span className="font-mono text-[11px] text-foreground w-14 text-right">{s.rev}</span>
                <span className={`font-mono text-[10px] w-10 text-right ${s.trend.startsWith("+") ? "text-sw-green" : "text-sw-red"}`}>{s.trend}</span>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Scheduled Reports" delay={0}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{reports.length} active</span>
            <button onClick={() => setReportAdded(true)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium ${reportAdded ? "bg-sw-green-dim text-sw-green" : "border border-primary/30 text-primary hover:bg-primary/10"}`}>
              {reportAdded ? "✓ Added" : "+ New"}
            </button>
          </div>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.name} className="bg-surface-2 rounded-xl border border-subtle p-3">
                <p className="text-xs text-foreground font-medium">{r.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.schedule} · {r.to}</p>
                <span className={`inline-block mt-1.5 font-mono text-[9px] px-2 py-0.5 rounded-full ${r.sColor}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default ReportsView;
