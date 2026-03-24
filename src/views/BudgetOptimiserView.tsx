import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, PieChart, Pie, Cell } from "recharts";
import { ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

const budgetUtilData = [
  { name: "Good Day Butter", ratio: 82, color: "hsl(160,70%,48%)" },
  { name: "Q-Commerce Push", ratio: 91, color: "hsl(38,92%,50%)" },
  { name: "Bourbon Cream RT", ratio: 98, color: "hsl(0,76%,57%)" },
  { name: "NutriChoice Brand", ratio: 67, color: "hsl(160,70%,48%)" },
  { name: "Marie Gold SP", ratio: 88, color: "hsl(38,92%,50%)" },
];

const wastedSpendData = [
  { name: "Efficient (>3x ROAS)", value: 65, color: "hsl(160,70%,48%)" },
  { name: "Moderate (2-3x)", value: 22, color: "hsl(38,92%,50%)" },
  { name: "Wasted (<2x)", value: 13, color: "hsl(0,76%,57%)" },
];

const samePlatformShifts = [
  {
    platform: "Amazon", color: "#FF9900",
    from: { campaign: "50-50 Maska Chaska — SP", roas: "2.1x", currentSpend: "₹1.2L" },
    to: { campaign: "Good Day Butter — SP", roas: "5.1x", currentSpend: "₹3.8L" },
    amount: "₹40K", projImpact: "+1,200 conversions, blended ROAS +0.4x",
  },
  {
    platform: "Flipkart", color: "#2F77FF",
    from: { campaign: "Milk Bikis Retargeting", roas: "2.1x", currentSpend: "₹2.5L" },
    to: { campaign: "Bourbon Cream Push", roas: "4.2x", currentSpend: "₹1.0L" },
    amount: "₹60K", projImpact: "+800 conversions, campaign ROAS → 4.5x",
  },
  {
    platform: "Blinkit", color: "#FDDC2B",
    from: { campaign: "Generic Biscuit Ads", roas: "2.8x", currentSpend: "₹1.2L" },
    to: { campaign: "Good Day Q-Commerce Push", roas: "3.8x", currentSpend: "₹2.4L" },
    amount: "₹25K", projImpact: "+500 conversions, better geo-targeting",
  },
];

const crossPlatformShifts = [
  {
    from: { platform: "Flipkart", color: "#2F77FF", campaign: "Milk Bikis Retargeting", roas: "2.1x", spend: "₹2.5L" },
    to: { platform: "Amazon", color: "#FF9900", campaign: "Good Day Butter — SP", roas: "5.1x", spend: "₹3.8L" },
    amount: "₹80K", projImpact: "Incremental conversions +2,100, blended portfolio ROAS +0.5x",
    confidence: 92,
  },
  {
    from: { platform: "Flipkart", color: "#2F77FF", campaign: "Various underperformers", roas: "2.1x", spend: "₹1.8L" },
    to: { platform: "Instagram", color: "#E1306C", campaign: "Bourbon Brand Awareness", roas: "4.4x", spend: "₹40K" },
    amount: "₹40K", projImpact: "Expand brand reach +180K impressions, ROAS 4.4x vs 2.1x",
    confidence: 85,
  },
  {
    from: { platform: "Zepto", color: "#833AB4", campaign: "Low-stock geo campaigns", roas: "1.8x", spend: "₹60K" },
    to: { platform: "Blinkit", color: "#FDDC2B", campaign: "Good Day Q-Commerce Push", roas: "3.8x", spend: "₹2.4L" },
    amount: "₹30K", projImpact: "Better dark-store coverage + higher ROAS",
    confidence: 78,
  },
];

const platformSummary = [
  { platform: "Amazon", color: "#FF9900", spend: 6.5, roas: 5.1, optSpend: 7.3, optRoas: 5.4 },
  { platform: "Instagram", color: "#E1306C", spend: 3.2, roas: 4.4, optSpend: 3.6, optRoas: 4.5 },
  { platform: "Blinkit", color: "#FDDC2B", spend: 2.8, roas: 3.8, optSpend: 3.1, optRoas: 4.0 },
  { platform: "Flipkart", color: "#2F77FF", spend: 4.3, roas: 2.1, optSpend: 2.5, optRoas: 3.0 },
  { platform: "Zepto", color: "#833AB4", spend: 1.4, roas: 3.2, optSpend: 1.1, optRoas: 3.5 },
];

const chartData = platformSummary.map(p => ({ name: p.platform, current: p.roas, optimised: p.optRoas }));

const BudgetOptimiserView: React.FC = () => {
  const [samePlatformApplied, setSamePlatformApplied] = useState<Record<number, boolean>>({});
  const [crossPlatformApplied, setCrossPlatformApplied] = useState<Record<number, boolean>>({});
  const [applyAll, setApplyAll] = useState(false);
  const [guardrailOpen, setGuardrailOpen] = useState(true);
  const g = useGuardrails();

  const guardrailStatuses = [
    { type: "Brand Search", tier1: false, tier2: false },
    { type: "Performance Max", tier1: true, tier2: false },
    { type: "Non-Brand", tier1: false, tier2: true },
    { type: "Retargeting", tier1: true, tier2: false },
    { type: "Festival", tier1: false, tier2: false },
  ];

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Budget to Reallocate" value="₹2.8L" delta="From underperformers" deltaType="positive" sub="6 reallocation recommendations" accentColor="bg-primary" delay={0} />
          <KPICard title="Projected ROAS Gain" value="+0.8x" delta="After optimisation" deltaType="positive" sub="Blended across all platforms" accentColor="bg-sw-green" delay={0.05} />
          <KPICard title="Conversion Uplift" value="+4,600" delta="Monthly projection" deltaType="positive" sub="If all recommendations applied" accentColor="bg-sw-cyan" delay={0.1} />
          <KPICard title="Underperforming Campaigns" value="4" delta="ROAS < 2.5x for 5+ days" deltaType="negative" sub="Flagged for budget reduction" accentColor="bg-sw-red" delay={0.15} />
        </div>

        <PanelCard title="Current vs Optimised ROAS by Platform" badge="AI Recommendation" badgeColor="purple" delay={0.2}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
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
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary text-foreground hover:bg-primary/80"}`}>
              {applyAll ? "✓ All Reallocations Applied" : "⚡ Apply All Recommendations"}
            </button>
          </div>
        </PanelCard>

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
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${samePlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
                    {samePlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

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
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${crossPlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple/20 text-sw-purple hover:bg-sw-purple/30"}`}>
                    {crossPlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
          <button onClick={() => setGuardrailOpen(!guardrailOpen)} className="w-full p-4 flex items-center justify-between hover:bg-surface-2 transition-colors">
            <h3 className="text-sm font-medium text-foreground">Active guardrails</h3>
            {guardrailOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {guardrailOpen && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {guardrailStatuses.map(gs => (
                  <div key={gs.type} className="flex items-center justify-between py-2 border-b border-subtle/50 last:border-b-0">
                    <span className="text-xs text-foreground">{gs.type}</span>
                    <div className="flex items-center gap-2">
                      {gs.tier1 ? <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "#FF5C5C" }}>🔴 Tier 1 active</span>
                        : gs.tier2 ? <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "#F5A623" }}>🟡 Tier 2 active</span>
                        : <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "#2ECF8E" }}>🟢 Clear</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => g.navigateTo("guardrails")} className="text-[11px] font-medium mt-3 inline-block" style={{ color: "#4F7FFF" }}>Edit guardrails →</button>
            </div>
          )}
        </div>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Budget Utilisation by Campaign" badge="Spend / Cap Ratio" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetUtilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={false} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} width={120} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="ratio" radius={[0, 4, 4, 0]} name="Utilisation %">
                  {budgetUtilData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Wasted Spend Analysis" badge="Efficiency Breakdown" badgeColor="red" delay={0.1}>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={wastedSpendData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {wastedSpendData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {wastedSpendData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-foreground">{d.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>

          <div className="rounded-xl border border-subtle bg-surface-1 p-5">
            <h3 className="text-sm font-medium text-foreground mb-1">Budget Shift Impact Simulator</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Estimate the ROAS impact of moving budget between campaigns (read-only)</p>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-[10px] text-muted-foreground">From Campaign</label><p className="text-xs text-foreground mt-1">Milk Bikis Retargeting (2.1x ROAS)</p></div>
              <div><label className="text-[10px] text-muted-foreground">To Campaign</label><p className="text-xs text-foreground mt-1">Good Day Butter — SP (5.1x ROAS)</p></div>
              <div><label className="text-[10px] text-muted-foreground">Amount</label><p className="text-xs text-foreground mt-1">₹40,000</p></div>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-sw-green-dim border border-sw-green/20">
              <p className="text-[11px] text-foreground">Estimated impact: Blended ROAS +0.4x, incremental conversions +1,200</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOptimiserView;
