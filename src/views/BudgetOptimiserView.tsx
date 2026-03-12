import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { ArrowRight } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const samePlatformShifts = [
  {
    from: { campaign: "Sugar Free — Keyword Target", roas: "2.1x", currentSpend: "₹1.8L" },
    to: { campaign: "EnergyMax — Sponsored Products", roas: "5.1x", currentSpend: "₹4.2L" },
    amount: "₹50K", projImpact: "+₹2.6L revenue, blended ROAS +0.4x",
  },
  {
    from: { campaign: "Generic Energy Ads", roas: "2.8x", currentSpend: "₹1.5L" },
    to: { campaign: "Berry Variant Launch", roas: "4.4x", currentSpend: "₹50K" },
    amount: "₹30K", projImpact: "+₹0.9L revenue, better targeting",
  },
];

const crossPlatformShifts = [
  {
    fromPlatform: "Flipkart", fromCampaign: "Sugar Free Retargeting", fromRoas: "2.1x",
    toPlatform: "Amazon", toCampaign: "EnergyMax Sponsored", toRoas: "5.1x",
    amount: "₹1L", confidence: 92,
  },
  {
    fromPlatform: "Zepto", fromCampaign: "Low-stock geo campaigns", fromRoas: "1.8x",
    toPlatform: "Blinkit", toCampaign: "Q-Commerce Launch Push", toRoas: "3.8x",
    amount: "₹40K", confidence: 78,
  },
];

const platformSummary = [
  { platform: "Amazon", color: "#FF9900", current: 5.1, optimised: 5.4 },
  { platform: "Blinkit", color: "#FDDC2B", current: 3.8, optimised: 4.0 },
  { platform: "Flipkart", color: "#2F77FF", current: 2.1, optimised: 3.0 },
  { platform: "Zepto", color: "#833AB4", current: 3.2, optimised: 3.5 },
  { platform: "Instamart", color: "#FC8019", current: 2.8, optimised: 3.2 },
];

const BudgetOptimiserView: React.FC<ViewProps> = ({ platform }) => {
  const [samePlatformApplied, setSamePlatformApplied] = useState<Record<number, boolean>>({});
  const [crossPlatformApplied, setCrossPlatformApplied] = useState<Record<number, boolean>>({});
  const [applyAll, setApplyAll] = useState(false);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Budget to Reallocate" value="₹2.2L" delta="From underperformers" deltaType="positive" sub={`${platform} focus`} accentColor="bg-primary" delay={0} />
        <KPICard title="Projected ROAS Gain" value="+0.8x" delta="After optimisation" deltaType="positive" sub="Blended improvement" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Revenue Uplift" value="+₹5.1L" delta="Monthly projection" deltaType="positive" sub="If all applied" accentColor="bg-sw-cyan" delay={0.1} />
        <KPICard title="Underperforming" value="3" delta="ROAS < 2.5x for 5+ days" deltaType="negative" sub="Flagged for reduction" accentColor="bg-sw-red" delay={0.15} />
      </motion.div>

      {/* ROAS Comparison */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Current vs Optimised ROAS" badge="AI Recommendation" badgeColor="primary" delay={0}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformSummary}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="platform" tick={{ fontSize: 10, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(260,22%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="current" fill="hsl(268,78%,54%)" opacity={0.5} radius={[4, 4, 0, 0]} name="Current ROAS" />
              <Bar dataKey="optimised" fill="hsl(160,70%,48%)" opacity={0.8} radius={[4, 4, 0, 0]} name="Optimised ROAS" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary/50 rounded-full" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-green rounded-full" /> Optimised</span>
            </div>
            <button onClick={() => setApplyAll(true)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}>
              {applyAll ? "✓ All Applied" : "⚡ Apply All"}
            </button>
          </div>
        </PanelCard>
      </motion.div>

      {/* Same Platform Shifts */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Same-Platform Shifts — ${platform}`} badge={`${samePlatformShifts.length} recommendations`} badgeColor="accent" delay={0}>
          <div className="space-y-3">
            {samePlatformShifts.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-xl bg-sw-red-dim/30 border border-sw-red/10">
                    <p className="text-[10px] text-muted-foreground mb-0.5">FROM</p>
                    <p className="text-xs text-foreground">{s.from.campaign}</p>
                    <p className="font-mono text-[10px] text-sw-red mt-1">ROAS {s.from.roas}</p>
                  </div>
                  <ArrowRight size={16} className="text-sw-green flex-shrink-0" />
                  <div className="flex-1 p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/10">
                    <p className="text-[10px] text-muted-foreground mb-0.5">TO</p>
                    <p className="text-xs text-foreground">{s.to.campaign}</p>
                    <p className="font-mono text-[10px] text-sw-green mt-1">ROAS {s.to.roas}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">Shift {s.amount}</span>
                    <p className="text-[10px] text-sw-green">💡 {s.projImpact}</p>
                  </div>
                  <button onClick={() => setSamePlatformApplied(p => ({ ...p, [i]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${samePlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
                    {samePlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Cross Platform Shifts */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Cross-Platform Reallocation" badge={`${crossPlatformShifts.length} recommendations`} badgeColor="primary" delay={0}>
          <div className="space-y-3">
            {crossPlatformShifts.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-foreground">{s.fromPlatform}</span>
                  <ArrowRight size={14} className="text-primary" />
                  <span className="text-xs text-foreground">{s.toPlatform}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green ml-auto">{s.amount}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-primary/15 text-primary">{s.confidence}% confidence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-2.5 rounded-xl bg-sw-red-dim/30 border border-sw-red/10">
                    <p className="text-xs text-foreground">{s.fromCampaign}</p>
                    <p className="font-mono text-[10px] text-sw-red">ROAS {s.fromRoas}</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl bg-sw-green-dim/30 border border-sw-green/10">
                    <p className="text-xs text-foreground">{s.toCampaign}</p>
                    <p className="font-mono text-[10px] text-sw-green">ROAS {s.toRoas}</p>
                  </div>
                </div>
                <div className="flex justify-end mt-3">
                  <button onClick={() => setCrossPlatformApplied(p => ({ ...p, [i]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${crossPlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
                    {crossPlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default BudgetOptimiserView;
