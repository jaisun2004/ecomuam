import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { ArrowRight, Zap, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

/* Same-platform reallocation */
const samePlatformShifts = [
  {
    platform: "Amazon", color: "#FF9900",
    from: { campaign: "Creatine — Keyword Target", roas: "2.1x", currentSpend: "₹1.8L" },
    to: { campaign: "Whey Protein — Sponsored", roas: "5.1x", currentSpend: "₹4.2L" },
    amount: "₹50K", projImpact: "+₹2.6L revenue, blended ROAS +0.4x",
  },
  {
    platform: "Flipkart", color: "#2F77FF",
    from: { campaign: "Creatine Retargeting", roas: "2.1x", currentSpend: "₹3.0L" },
    to: { campaign: "New Whey Brand Push", roas: "4.2x", currentSpend: "₹1.2L" },
    amount: "₹80K", projImpact: "+₹1.7L revenue, campaign ROAS → 4.5x",
  },
  {
    platform: "Blinkit", color: "#FDDC2B",
    from: { campaign: "Generic Protein Ads", roas: "2.8x", currentSpend: "₹1.5L" },
    to: { campaign: "Q-Commerce Launch Push", roas: "3.8x", currentSpend: "₹2.8L" },
    amount: "₹30K", projImpact: "+₹0.9L revenue, better geo-targeting",
  },
];

/* Cross-platform reallocation */
const crossPlatformShifts = [
  {
    from: { platform: "Flipkart", color: "#2F77FF", campaign: "Creatine Retargeting", roas: "2.1x", spend: "₹3.0L" },
    to: { platform: "Amazon", color: "#FF9900", campaign: "Whey Protein — Sponsored", roas: "5.1x", spend: "₹4.2L" },
    amount: "₹1L", projImpact: "Incremental revenue +₹3.1L, blended portfolio ROAS +0.5x",
    confidence: 92,
  },
  {
    from: { platform: "Flipkart", color: "#2F77FF", campaign: "Various underperformers", roas: "2.1x", spend: "₹2.2L" },
    to: { platform: "Instagram", color: "#E1306C", campaign: "BCAA Brand Awareness", roas: "4.4x", spend: "₹50K" },
    amount: "₹50K", projImpact: "Expand brand reach +180K impressions, ROAS 4.4x vs 2.1x",
    confidence: 85,
  },
  {
    from: { platform: "Zepto", color: "#833AB4", campaign: "Low-stock geo campaigns", roas: "1.8x", spend: "₹80K" },
    to: { platform: "Blinkit", color: "#FDDC2B", campaign: "Q-Commerce Launch Push", roas: "3.8x", spend: "₹2.8L" },
    amount: "₹40K", projImpact: "Better dark-store coverage + higher ROAS",
    confidence: 78,
  },
];

const platformSummary = [
  { platform: "Amazon", color: "#FF9900", spend: 7.8, roas: 5.1, optSpend: 8.8, optRoas: 5.4 },
  { platform: "Instagram", color: "#E1306C", spend: 4.1, roas: 4.4, optSpend: 4.6, optRoas: 4.5 },
  { platform: "Blinkit", color: "#FDDC2B", spend: 3.3, roas: 3.8, optSpend: 3.7, optRoas: 4.0 },
  { platform: "Flipkart", color: "#2F77FF", spend: 5.2, roas: 2.1, optSpend: 3.2, optRoas: 3.0 },
  { platform: "Zepto", color: "#833AB4", spend: 1.8, roas: 3.2, optSpend: 1.4, optRoas: 3.5 },
];

const chartData = platformSummary.map(p => ({
  name: p.platform,
  current: p.roas,
  optimised: p.optRoas,
}));

const BudgetOptimiserView: React.FC = () => {
  const [samePlatformApplied, setSamePlatformApplied] = useState<Record<number, boolean>>({});
  const [crossPlatformApplied, setCrossPlatformApplied] = useState<Record<number, boolean>>({});
  const [applyAll, setApplyAll] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Budget to Reallocate" value="₹3.5L" delta="From underperformers" deltaType="positive" sub="6 reallocation recommendations" accentColor="bg-primary" delay={0} />
        <KPICard title="Projected ROAS Gain" value="+0.8x" delta="After optimisation" deltaType="positive" sub="Blended across all platforms" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Revenue Uplift" value="+₹8.3L" delta="Monthly projection" deltaType="positive" sub="If all recommendations applied" accentColor="bg-sw-cyan" delay={0.1} />
        <KPICard title="Underperforming Campaigns" value="4" delta="ROAS < 2.5x for 5+ days" deltaType="negative" sub="Flagged for budget reduction" accentColor="bg-sw-red" delay={0.15} />
      </div>

      {/* ROAS Comparison Chart */}
      <PanelCard title="Current vs Optimised ROAS by Platform" badge="AI Recommendation" badgeColor="purple" delay={0.2}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
            <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
            <Bar dataKey="current" fill="hsl(228,90%,64%)" opacity={0.5} radius={[4, 4, 0, 0]} name="Current ROAS" />
            <Bar dataKey="optimised" fill="hsl(160,70%,48%)" opacity={0.8} radius={[4, 4, 0, 0]} name="Optimised ROAS" />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary/50 rounded-full" /> Current</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-green rounded-full" /> Optimised</span>
          </div>
          <button onClick={() => setApplyAll(true)}
            className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
              applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary text-foreground hover:bg-primary/80"
            }`}>
            {applyAll ? "✓ All Reallocations Applied" : "⚡ Apply All Recommendations"}
          </button>
        </div>
      </PanelCard>

      {/* Same Platform Shifts */}
      <PanelCard title="Same-Platform Budget Shifts" badge={`${samePlatformShifts.length} recommendations`} badgeColor="accent" delay={0.3}>
        <p className="text-[10px] text-muted-foreground mb-4">Move budget from low-performing to high-performing campaigns within the same platform</p>
        <div className="space-y-3">
          {samePlatformShifts.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-2 border border-subtle">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                <span className="text-sm text-foreground font-medium">{s.platform}</span>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green ml-auto">Shift {s.amount}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-3 rounded-xl bg-sw-red-dim/30 border border-sw-red/10">
                  <p className="text-[10px] text-muted-foreground mb-0.5">FROM</p>
                  <p className="text-xs text-foreground">{s.from.campaign}</p>
                  <p className="font-mono text-[10px] text-sw-red mt-1">ROAS {s.from.roas} · Spend {s.from.currentSpend}</p>
                </div>
                <ArrowRight size={16} className="text-sw-green flex-shrink-0" />
                <div className="flex-1 p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/10">
                  <p className="text-[10px] text-muted-foreground mb-0.5">TO</p>
                  <p className="text-xs text-foreground">{s.to.campaign}</p>
                  <p className="font-mono text-[10px] text-sw-green mt-1">ROAS {s.to.roas} · Spend {s.to.currentSpend}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-sw-green">💡 {s.projImpact}</p>
                <button onClick={() => setSamePlatformApplied(p => ({ ...p, [i]: true }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    samePlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"
                  }`}>
                  {samePlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Cross Platform Shifts */}
      <PanelCard title="Cross-Platform Budget Reallocation" badge={`${crossPlatformShifts.length} recommendations`} badgeColor="purple" delay={0.4}>
        <p className="text-[10px] text-muted-foreground mb-4">Move budget across platforms to maximize portfolio-level ROAS</p>
        <div className="space-y-3">
          {crossPlatformShifts.map((s, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-2 border border-subtle">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.from.color }} />
                  <span className="text-xs text-foreground">{s.from.platform}</span>
                </div>
                <ArrowRight size={14} className="text-primary" />
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.to.color }} />
                  <span className="text-xs text-foreground">{s.to.platform}</span>
                </div>
                <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green ml-auto">{s.amount}</span>
                <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-purple-dim text-sw-purple">{s.confidence}% confidence</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 p-2.5 rounded-xl bg-sw-red-dim/30 border border-sw-red/10">
                  <p className="text-xs text-foreground">{s.from.campaign}</p>
                  <p className="font-mono text-[10px] text-sw-red">ROAS {s.from.roas}</p>
                </div>
                <div className="flex-1 p-2.5 rounded-xl bg-sw-green-dim/30 border border-sw-green/10">
                  <p className="text-xs text-foreground">{s.to.campaign}</p>
                  <p className="font-mono text-[10px] text-sw-green">ROAS {s.to.roas}</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[10px] text-sw-green">💡 {s.projImpact}</p>
                <button onClick={() => setCrossPlatformApplied(p => ({ ...p, [i]: true }))}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                    crossPlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple/20 text-sw-purple hover:bg-sw-purple/30"
                  }`}>
                  {crossPlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};

export default BudgetOptimiserView;
