import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { Sparkles, Megaphone } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const upcomingFestivals = [
  {
    name: "Holi Sale", date: "Mar 25 – Mar 28", daysAway: 15,
    recommendation: "Energy drinks see 35% uplift during festival sales. Pre-position stock on Blinkit & Zepto 3 days before.",
    campaigns: [
      { name: "Holi Energy Combo", type: "Sponsored Products", budget: "₹50K", duration: "4 days", keywords: ["holi energy drink", "festival drink deal"], targetROAS: "4.5x" },
      { name: "Quick Delivery Holi Push", type: "Banner + Sponsored", budget: "₹25K", duration: "3 days", keywords: ["holi drink delivery"], targetROAS: "3.8x" },
    ],
  },
  {
    name: "IPL Season", date: "Apr 1 – May 30", daysAway: 22,
    recommendation: "Energy drink searches spike 52% during IPL. Match day consumption peaks — perfect for Q-commerce push.",
    campaigns: [
      { name: "IPL Match Day Blitz", type: "Sponsored + Video", budget: "₹1.5L", duration: "60 days", keywords: ["ipl energy drink", "match day energy"], targetROAS: "5.2x" },
      { name: "IPL Weekend Q-Commerce", type: "Sponsored Listings", budget: "₹40K", duration: "8 weekends", keywords: ["quick energy delivery"], targetROAS: "3.5x" },
    ],
  },
  {
    name: "Summer Energy Push", date: "Apr 15 – Jun 15", daysAway: 36,
    recommendation: "Summer drives 28% more energy drink searches. Electrolyte variant opportunity.",
    campaigns: [
      { name: "Summer Cool Energy", type: "Sponsored Products", budget: "₹2L", duration: "60 days", keywords: ["summer energy drink", "electrolyte drink"], targetROAS: "4.8x" },
    ],
  },
];

const pastPerformance = [
  { festival: "Republic Day Sale", roas: "5.4x", spend: "₹1.8L", topPlatform: "Amazon" },
  { festival: "New Year Energy", roas: "4.1x", spend: "₹1.2L", topPlatform: "Blinkit" },
  { festival: "Diwali Mega Sale", roas: "6.8x", spend: "₹4.5L", topPlatform: "Amazon" },
];

const FestivalCampaignsView: React.FC<ViewProps> = ({ platform }) => {
  const [launchedCampaigns, setLaunchedCampaigns] = useState<Record<string, boolean>>({});

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Upcoming Festivals" value="3" delta="Next: Holi in 15 days" deltaType="positive" sub="Campaigns ready" accentColor="bg-sw-amber" delay={0} />
        <KPICard title="Pre-built Campaigns" value="5" delta="AI-optimised & pre-fed" deltaType="positive" sub="Across all festivals" accentColor="bg-primary" delay={0.05} />
        <KPICard title="Avg Festival ROAS" value="5.1x" delta="▲ Based on past" deltaType="positive" sub="Historical performance" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Platform" value={platform} delta="Campaigns targeted" deltaType="neutral" sub="Selected platform" accentColor="bg-sw-cyan" delay={0.15} />
      </motion.div>

      {/* Past Performance */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Past Festival Performance" badge="Benchmarks" badgeColor="green" delay={0}>
          <div className="grid grid-cols-3 gap-3">
            {pastPerformance.map((p) => (
              <div key={p.festival} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-xs text-foreground font-medium">{p.festival}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div><span className="text-muted-foreground">ROAS</span><p className="font-mono text-sw-green font-bold">{p.roas}</p></div>
                  <div><span className="text-muted-foreground">Spend</span><p className="font-mono text-foreground">{p.spend}</p></div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Upcoming Festivals */}
      {upcomingFestivals.map((festival, fi) => (
        <motion.div key={festival.name} variants={fadeUp}>
          <PanelCard title={festival.name} badge={`${festival.date} · ${festival.daysAway}d away`}
            badgeColor={festival.daysAway <= 20 ? "red" : "amber"} delay={0}>
            <div className="mb-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <p className="text-[11px] text-foreground flex items-center gap-1.5"><Sparkles size={12} className="text-primary" /> {festival.recommendation}</p>
            </div>
            <div className="space-y-3">
              {festival.campaigns.map((c, ci) => {
                const key = `${fi}-${ci}`;
                return (
                  <div key={key} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-foreground font-medium">{c.name}</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-surface-3 text-muted-foreground">{c.type}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-3 text-[10px] mb-3">
                      <div><span className="text-muted-foreground">Budget</span><p className="font-mono text-foreground">{c.budget}</p></div>
                      <div><span className="text-muted-foreground">Duration</span><p className="font-mono text-foreground">{c.duration}</p></div>
                      <div><span className="text-muted-foreground">Target ROAS</span><p className="font-mono text-sw-green">{c.targetROAS}</p></div>
                      <div><span className="text-muted-foreground">Keywords</span><p className="text-foreground">{c.keywords.length} pre-set</p></div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {c.keywords.map(kw => (
                        <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">"{kw}"</span>
                      ))}
                    </div>
                    <button onClick={() => setLaunchedCampaigns(p => ({ ...p, [key]: true }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                        launchedCampaigns[key] ? "bg-sw-green-dim text-sw-green" : "bg-primary text-primary-foreground hover:bg-primary/80"
                      }`}>
                      <Megaphone size={12} />
                      {launchedCampaigns[key] ? "✓ Campaign Scheduled!" : `Schedule for ${festival.date.split("–")[0].trim()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </PanelCard>
        </motion.div>
      ))}
    </motion.div>
  );
};

export default FestivalCampaignsView;
