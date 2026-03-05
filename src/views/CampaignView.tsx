import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";

const revenueData = [
  { day: "Mar 1", revenue: 180, spend: 40 },
  { day: "Mar 5", revenue: 195, spend: 42 },
  { day: "Mar 10", revenue: 210, spend: 45 },
  { day: "Mar 15", revenue: 230, spend: 48 },
  { day: "Mar 20", revenue: 245, spend: 50 },
  { day: "Mar 25", revenue: 258, spend: 52 },
  { day: "Mar 30", revenue: 270, spend: 55 },
];

const campaigns = [
  { name: "Whey Protein — Sponsored", platform: "Amazon", platformColor: "#FF9900", roas: "5.1x", revenue: "₹4.2L", spend: "₹82K", status: "LIVE", ai: true },
  { name: "Q-Commerce Launch Push", platform: "Blinkit", platformColor: "#FDDC2B", roas: "3.8x", revenue: "₹1.9L", spend: "₹50K", status: "LIVE", ai: true },
  { name: "Creatine Retargeting", platform: "Flipkart", platformColor: "#2F77FF", roas: "2.1x", revenue: "₹63K", spend: "₹30K", status: "PAUSED", ai: false, reason: "ROAS below 2.5x" },
  { name: "BCAA Brand Awareness", platform: "Instagram", platformColor: "#E1306C", roas: "4.4x", revenue: "₹2.2L", spend: "₹50K", status: "LIVE", ai: false },
  { name: "Pre-Workout New Users", platform: "Zepto", platformColor: "#833AB4", roas: "3.2x", revenue: "₹96K", spend: "₹30K", status: "LIVE", ai: true },
];

const platformROAS = [
  { name: "Amazon", roas: 5.1, color: "#FF9900" },
  { name: "Blinkit", roas: 3.8, color: "#FDDC2B" },
  { name: "Flipkart", roas: 2.1, color: "#2F77FF" },
  { name: "Zepto", roas: 3.2, color: "#833AB4" },
  { name: "Instagram", roas: 4.4, color: "#E1306C" },
];

const budgetAlloc = [
  { name: "Amazon Ads", pct: 38, spend: "₹7L", roas: "5.1x", dir: "↑", color: "#FF9900", roasColor: "text-sw-green" },
  { name: "Instagram/Meta", pct: 22, spend: "₹4.1L", roas: "4.4x", dir: "↑", color: "#E1306C", roasColor: "text-sw-green" },
  { name: "Blinkit Ads", pct: 18, spend: "₹3.3L", roas: "3.8x", dir: "→", color: "#FDDC2B", roasColor: "text-sw-amber" },
  { name: "Flipkart Ads", pct: 12, spend: "₹2.2L", roas: "2.1x", dir: "↓", color: "#2F77FF", roasColor: "text-sw-red" },
  { name: "Zepto Ads", pct: 10, spend: "₹1.8L", roas: "3.2x", dir: "→", color: "#833AB4", roasColor: "text-sw-amber" },
];

const keywords = [
  { kw: "whey protein 1kg", bid: "₹28", roas: "6.2x", imp: "142K", roasColor: "text-sw-green", action: "Raise bid", actionColor: "text-sw-green border-sw-green/30" },
  { kw: "protein powder", bid: "₹45", roas: "3.1x", imp: "498K", roasColor: "text-sw-amber", action: "Hold bid", actionColor: "text-muted-foreground border-subtle" },
  { kw: "creatine monohydrate", bid: "₹22", roas: "1.4x", imp: "87K", roasColor: "text-sw-red", action: "Lower bid", actionColor: "text-sw-red border-sw-red/30" },
  { kw: "bcaa supplement", bid: "₹18", roas: "5.8x", imp: "63K", roasColor: "text-sw-green", action: "Raise bid", actionColor: "text-sw-green border-sw-green/30" },
  { kw: "pre workout energy", bid: "₹35", roas: "4.7x", imp: "211K", roasColor: "text-sw-green", action: "Raise bid", actionColor: "text-sw-green border-sw-green/30" },
  { kw: "gym supplement india", bid: "₹12", roas: "1.8x", imp: "321K", roasColor: "text-sw-red", action: "Lower bid", actionColor: "text-sw-red border-sw-red/30" },
];

const copilotCards = [
  { impact: "HIGH IMPACT", emoji: "💰", text: "Shift ₹25,000 from Flipkart Creatine (ROAS 2.1x) to Amazon Whey Protein (ROAS 5.1x). Projected incremental revenue: +₹1.04L this week.", confidence: 91, action: "Apply Now" },
  { impact: "HIGH IMPACT", emoji: "🔍", text: "Add 8 new long-tail keywords to Amazon Whey campaign. 'whey protein for women 1kg' has 0% competition and 45K monthly searches.", confidence: 86, action: "Add Keywords" },
  { impact: "MED IMPACT", emoji: "⚡", text: "Pre-Workout trending +47% on Blinkit South Delhi. Launch 7-day burst campaign now before stock drops below 30%.", confidence: 78, action: "Launch Campaign" },
];

const CampaignView: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(0);
  const [bidStates, setBidStates] = useState<Record<number, string>>({});
  const [copilotStates, setCopilotStates] = useState<Record<number, boolean>>({});
  const [reallocApplied, setReallocApplied] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Ad Spend (30D)" value="₹18.4L" delta="▲ ₹2.1L vs last mo" deltaType="positive" sub="Across 6 platforms · 24 campaigns" accentColor="bg-primary" delay={0} />
        <KPICard title="Blended ROAS" value="4.2x" delta="▲ 0.6x MoM" deltaType="positive" sub="Target: 4.5x · 93% of goal" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="AI-Optimised Budget" value="67%" delta="▲ Auto-reallocated ₹3.4L" deltaType="positive" sub="From underperforming campaigns" accentColor="bg-sw-purple" delay={0.1} />
        <KPICard title="Attributed Revenue" value="₹77L" delta="▲ 18% MoM" deltaType="positive" sub="Across all ad-attributed orders" accentColor="bg-sw-cyan" delay={0.15} />
      </div>

      {/* Chart + Campaign cards */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Revenue vs Ad Spend — 30 Day Trend" badge="ROAS improving" badgeColor="green" className="col-span-2" delay={0.2}>
          <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-green rounded-full" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> Ad Spend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160,70%,48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160,70%,48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(228,90%,64%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(228,90%,64%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(160,70%,48%)" fill="url(#gRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="spend" stroke="hsl(228,90%,64%)" fill="url(#gSpend)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Active Campaigns" badge="AI managing 16" badgeColor="purple" delay={0.25}>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {campaigns.map((c, i) => (
              <div
                key={c.name}
                onClick={() => setSelectedCampaign(i)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedCampaign === i ? "border-primary bg-primary/5" : "border-subtle bg-surface-2 hover:border-border-visible"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground font-medium truncate">{c.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: c.platformColor + "22", color: c.platformColor }}>{c.platform}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                  <div><span className="text-muted-foreground">ROAS</span><p className="font-mono text-foreground">{c.roas}</p></div>
                  <div><span className="text-muted-foreground">Rev</span><p className="font-mono text-foreground">{c.revenue}</p></div>
                  <div><span className="text-muted-foreground">Spend</span><p className="font-mono text-foreground">{c.spend}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[10px] ${c.status === "LIVE" ? "text-sw-green" : "text-sw-amber"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "LIVE" ? "bg-sw-green animate-pulse" : "bg-sw-amber"}`} />
                    {c.status}
                  </span>
                  {c.reason && <span className="text-[9px] text-muted-foreground">— {c.reason}</span>}
                  {c.ai && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-sw-purple-dim text-sw-purple font-mono">⚡ AI Autopilot</span>}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Platform ROAS Comparison" delay={0.3}>
          <div className="space-y-3">
            {platformROAS.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-foreground w-20">{p.name}</span>
                <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.roas / 6) * 100}%`, backgroundColor: p.color }} />
                </div>
                <span className={`font-mono text-[11px] w-8 text-right ${p.roas >= 3.5 ? "text-sw-green" : p.roas >= 2.5 ? "text-sw-amber" : "text-sw-red"}`}>{p.roas}x</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-xl ${reallocApplied ? "bg-sw-green-dim border border-sw-green/20" : "bg-sw-purple-dim border border-sw-purple/20"}`}>
            <p className="text-[11px] text-foreground mb-2">💡 Shift ₹25K from Flipkart → Amazon. Projected ROAS improvement: +0.3x blended</p>
            <button onClick={() => setReallocApplied(true)} className={`text-[11px] font-medium px-3 py-1 rounded-lg ${reallocApplied ? "bg-sw-green/20 text-sw-green" : "bg-sw-purple/20 text-sw-purple hover:bg-sw-purple/30"}`}>
              {reallocApplied ? "✓ Applied!" : "Apply Reallocation →"}
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Budget Allocation vs Performance" badge="AI auto-balancing" badgeColor="purple" delay={0.35}>
          <div className="space-y-3">
            {budgetAlloc.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                    {b.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{b.pct}% · {b.spend}</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct * 2.5}%`, backgroundColor: b.color }} />
                </div>
                <p className={`font-mono text-[10px] mt-0.5 ${b.roasColor}`}>{b.roas} {b.dir}</p>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Keyword Bid Optimiser" badge="Amazon · Auto-bid ON" badgeColor="accent" delay={0.4}>
          <div className="space-y-2">
            {keywords.map((k, i) => (
              <div key={k.kw} className="flex items-center gap-2 py-1.5 border-b border-subtle last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground truncate font-mono">{k.kw}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{k.bid} · {k.imp} imp</p>
                </div>
                <span className={`font-mono text-[10px] ${k.roasColor}`}>{k.roas}</span>
                <button
                  onClick={() => setBidStates((p) => ({ ...p, [i]: k.action.includes("Raise") ? "↑ ₹34" : k.action.includes("Lower") ? "↓ ₹16" : "— ₹45" }))}
                  className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${
                    bidStates[i] ? "bg-sw-green-dim text-sw-green border-sw-green/20" : k.actionColor
                  }`}
                >
                  {bidStates[i] || k.action}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* AI Copilot */}
      <div className="opacity-0 animate-fade-slide-in" style={{ animationDelay: "0.45s" }}>
        <div className="rounded-2xl overflow-hidden border border-sw-purple/20">
          <div className="bg-gradient-to-r from-sw-purple/20 to-primary/20 px-6 py-4">
            <h3 className="font-display font-bold text-foreground">🧠 AI Campaign Copilot — 3 Recommendations Ready</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Updated 4 minutes ago</p>
          </div>
          <div className="bg-surface-1 p-5 grid grid-cols-3 gap-4">
            {copilotCards.map((c, i) => (
              <div key={i} className="bg-surface-2 rounded-xl border border-subtle p-4">
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${c.impact === "HIGH IMPACT" ? "bg-sw-green-dim text-sw-green" : "bg-sw-amber-dim text-sw-amber"}`}>{c.impact}</span>
                <p className="text-sm text-foreground mt-3">{c.emoji} {c.text}</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">Confidence: {c.confidence}%</p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => setCopilotStates((p) => ({ ...p, [i]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      copilotStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}
                  >
                    {copilotStates[i] ? "✓ Applied!" : c.action}
                  </button>
                  {!copilotStates[i] && <button className="px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground">Dismiss</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CampaignView;
