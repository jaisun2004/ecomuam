import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const keywordOptions = ["energy drink", "energy drink 500ml", "sugar free energy drink", "sports drink", "energy booster"];

const competitorHourlyData = Array.from({ length: 24 }, (_, h) => ({
  hour: `${h}:00`,
  redBull: Math.round(20 + Math.sin(h / 3) * 15 + (h >= 9 && h <= 21 ? 20 : 0)),
  monster: Math.round(15 + Math.cos(h / 4) * 10 + (h >= 10 && h <= 18 ? 15 : 0)),
  sting: Math.round(10 + Math.sin(h / 5) * 8 + (h >= 8 && h <= 20 ? 10 : 0)),
}));

const competitorAdProfiles = [
  {
    name: "Red Bull", color: "#1E3A8A",
    topKeywords: ["energy drink", "red bull", "energy booster"], keywordCount: 42,
    pattern: "Consistent — heavy brand keyword defense. Premium positioning. Peaks 9AM–9PM.",
    budgetExhausted: false, sponsoredActive: true,
  },
  {
    name: "Monster Energy", color: "#00B140",
    topKeywords: ["energy drink", "monster drink", "gym energy"], keywordCount: 35,
    pattern: "Aggressive — increasing activity on generic keywords. Heavy weekend push.",
    budgetExhausted: true, sponsoredActive: false,
  },
  {
    name: "Sting", color: "#FF6B00",
    topKeywords: ["energy drink cheap", "sting drink", "sports energy"], keywordCount: 28,
    pattern: "Value play — undercutting on price + heavy bid on price-sensitive keywords.",
    budgetExhausted: false, sponsoredActive: true,
  },
  {
    name: "Hell Energy", color: "#DC2626",
    topKeywords: ["energy drink 500ml", "hell energy", "premium energy"], keywordCount: 18,
    pattern: "Burst strategy — heavy weekend spend. Budget exhaustion mid-week.",
    budgetExhausted: true, sponsoredActive: false,
  },
];

const budgetExhaustionByKeyword: Record<string, { competitor: string; keyword: string; lastSeen: string; opportunity: string }[]> = {
  "energy drink": [
    { competitor: "Monster Energy", keyword: "energy drink", lastSeen: "2h ago", opportunity: "Reduce your bid ₹28→₹18, maintain position at lower cost" },
    { competitor: "Hell Energy", keyword: "energy drink 500ml", lastSeen: "4h ago", opportunity: "Lower bid ₹35→₹22, capture their traffic" },
  ],
  "energy drink 500ml": [
    { competitor: "Hell Energy", keyword: "energy drink 500ml", lastSeen: "3h ago", opportunity: "Lower bid, competitor out of budget" },
  ],
  "sugar free energy drink": [
    { competitor: "Monster Energy", keyword: "sugar free energy", lastSeen: "1h ago", opportunity: "Hold current bid, competitor flickering" },
  ],
  "sports drink": [],
  "energy booster": [
    { competitor: "Hell Energy", keyword: "energy booster", lastSeen: "5h ago", opportunity: "Reduce bid ₹25→₹15" },
  ],
};

const keywordConquestOpps = [
  { keyword: "red bull energy drink", volume: "32K", compSoS: "58%", yourSoS: "0%", bidEst: "₹22" },
  { keyword: "monster energy drink", volume: "28K", compSoS: "72%", yourSoS: "0%", bidEst: "₹35" },
  { keyword: "best energy drink india", volume: "44K", compSoS: "41%", yourSoS: "12%", bidEst: "₹28" },
  { keyword: "sting energy drink", volume: "18K", compSoS: "34%", yourSoS: "8%", bidEst: "₹15" },
];

const CompetitorAdsView: React.FC<ViewProps> = ({ platform }) => {
  const [selectedKeyword, setSelectedKeyword] = useState("energy drink");
  const budgetAlerts = budgetExhaustionByKeyword[selectedKeyword] || [];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Competitors Tracked" value="4" delta="Active monitoring" deltaType="positive" sub={`${platform} · Real-time`} accentColor="bg-sw-red" delay={0} />
        <KPICard title="Budget Exhaustions (24h)" value="3" delta="Bid reduction opportunity" deltaType="positive" sub="Competitors out of budget" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Keyword Conquest Opps" value="8" delta="Competitor brand keywords" deltaType="positive" sub="Available for capture" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Competitor Activity" value="HIGH" delta="▲ 22% MoM" deltaType="negative" sub="Increasing ad pressure" accentColor="bg-sw-amber" delay={0.15} />
      </motion.div>

      {/* Competitor Profiles */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Competitor Ad Profiles — ${platform}`} badge="Real-time" badgeColor="red" delay={0}>
          <div className="grid grid-cols-2 gap-3">
            {competitorAdProfiles.map((c) => (
              <div key={c.name} className="p-4 rounded-xl border border-subtle bg-surface-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                    {c.name}
                  </span>
                  <div className="flex items-center gap-2">
                    {c.budgetExhausted && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green">BUDGET EXHAUSTED</span>}
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${c.sponsoredActive ? "bg-sw-red-dim text-sw-red" : "bg-surface-3 text-muted-foreground"}`}>
                      {c.sponsoredActive ? "ADS ACTIVE" : "ADS PAUSED"}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px] mb-2">
                  <div><span className="text-muted-foreground">Keywords</span><p className="font-mono text-foreground">{c.keywordCount}</p></div>
                  <div><span className="text-muted-foreground">Top Keywords</span><p className="text-foreground">{c.topKeywords.slice(0, 2).join(", ")}</p></div>
                </div>
                <p className="text-[10px] text-muted-foreground">{c.pattern}</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Budget Exhaustion + Hourly Activity */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
        <PanelCard title="Budget Exhaustion — Bid Reduction Opps" badge={`${budgetAlerts.length} detected`} badgeColor="green" delay={0}>
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {keywordOptions.map(kw => (
              <button key={kw} onClick={() => setSelectedKeyword(kw)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${selectedKeyword === kw ? "bg-sw-green/20 text-sw-green" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                "{kw}"
              </button>
            ))}
          </div>
          {budgetAlerts.length === 0 ? (
            <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
              <p className="text-xs text-muted-foreground">No budget exhaustion detected for this keyword</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {budgetAlerts.map((a, i) => (
                <div key={i} className="p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/20">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-foreground font-medium">{a.competitor}</span>
                    <span className="text-[9px] text-muted-foreground">{a.lastSeen}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Keyword: <span className="font-mono text-foreground">"{a.keyword}"</span></p>
                  <p className="text-[10px] text-sw-green mt-1">💡 {a.opportunity}</p>
                </div>
              ))}
            </div>
          )}
        </PanelCard>

        <PanelCard title="Competitor Ad Activity — Hourly" badge="Today" badgeColor="accent" delay={0}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={competitorHourlyData.filter((_, i) => i % 2 === 0)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 8, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(260,22%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="redBull" fill="#1E3A8A" opacity={0.7} radius={[2, 2, 0, 0]} name="Red Bull" />
              <Bar dataKey="monster" fill="#00B140" opacity={0.7} radius={[2, 2, 0, 0]} name="Monster" />
              <Bar dataKey="sting" fill="#FF6B00" opacity={0.7} radius={[2, 2, 0, 0]} name="Sting" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#1E3A8A" }} /> Red Bull</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#00B140" }} /> Monster</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF6B00" }} /> Sting</span>
          </div>
        </PanelCard>
      </motion.div>

      {/* Keyword Conquest */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Keyword Conquest Opportunities" badge="Competitor brand keywords" badgeColor="primary" delay={0}>
          <p className="text-[10px] text-muted-foreground mb-3">Bid on competitor brand keywords to capture their branded traffic</p>
          <div className="grid grid-cols-2 gap-2">
            {keywordConquestOpps.map((k, i) => (
              <div key={i} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                <p className="font-mono text-[11px] text-foreground mb-1">"{k.keyword}"</p>
                <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                  <span>{k.volume} vol</span>
                  <span>Comp: <span className="text-sw-red font-mono">{k.compSoS}</span></span>
                  <span>You: <span className="text-primary font-mono">{k.yourSoS}</span></span>
                  <span>Bid: <span className="font-mono text-foreground">{k.bidEst}</span></span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default CompetitorAdsView;
