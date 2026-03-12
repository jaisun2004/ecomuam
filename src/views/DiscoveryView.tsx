import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ArrowRight } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const categoryFilter = ["All", "Energy Drinks", "Sports Drinks", "Electrolytes", "Shots"];

const trendingKwsByCategory: Record<string, { kw: string; vol: string; wow: string; opp: string; oppColor: string }[]> = {
  All: [
    { kw: "sugar free energy drink", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
    { kw: "energy drink 500ml", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
    { kw: "energy drink for gym", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
    { kw: "natural energy drink", vol: "19.8K", wow: "+28%", opp: "EMERGING", oppColor: "text-primary bg-primary/15" },
    { kw: "energy shot 60ml", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-primary bg-primary/15" },
    { kw: "electrolyte energy drink", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
  ],
  "Energy Drinks": [
    { kw: "sugar free energy drink", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
    { kw: "energy drink 500ml", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
    { kw: "energy drink for gym", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
    { kw: "berry energy drink", vol: "15.8K", wow: "+42%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
  ],
  "Sports Drinks": [
    { kw: "sports drink india", vol: "22.1K", wow: "+18%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
    { kw: "isotonic sports drink", vol: "8.4K", wow: "+35%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
  ],
  Electrolytes: [
    { kw: "electrolyte energy drink", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
    { kw: "electrolyte sachets", vol: "19.8K", wow: "+28%", opp: "EMERGING", oppColor: "text-primary bg-primary/15" },
  ],
  Shots: [
    { kw: "energy shot 60ml", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-primary bg-primary/15" },
    { kw: "caffeine shot india", vol: "6.2K", wow: "+44%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
  ],
};

const forecasts = [
  { sku: "Original 500ml", delta: "+18%", color: "bg-primary", weeks: [60, 65, 72, 80] },
  { sku: "Sugar Free 500ml", delta: "+12%", color: "bg-sw-green", weeks: [50, 54, 58, 62] },
  { sku: "Berry 350ml", delta: "+47%", color: "bg-sw-cyan", weeks: [40, 55, 70, 90] },
  { sku: "Shot 60ml", delta: "+61%", color: "bg-sw-amber", weeks: [25, 40, 58, 78] },
];

const competitorComparison = [
  { brand: "EnergyMax (You)", share: 18, trend: "+2.4%", color: "bg-primary" },
  { brand: "Red Bull", share: 35, trend: "+0.8%", color: "bg-sw-red" },
  { brand: "Monster", share: 22, trend: "-1.2%", color: "bg-sw-green" },
  { brand: "Sting", share: 15, trend: "+3.1%", color: "bg-sw-amber" },
  { brand: "Hell Energy", share: 6, trend: "+5.2%", color: "bg-sw-cyan" },
];

const opportunities = [
  { emoji: "⚡", title: "Energy Shots (60ml)", desc: "61% search growth, <3 sellers on Q-commerce. Huge whitespace.", tags: ["Q-COMMERCE GAP", "HIGH IMPACT"] },
  { emoji: "🏋️", title: "Gym Energy Drinks", desc: "28K monthly searches, only 2 SKUs targeting this segment.", tags: ["CONTENT GAP", "HIGH IMPACT"] },
  { emoji: "☀️", title: "Natural/Sugar Free", desc: "44K searches, 31% growth. Health-conscious consumers shifting.", tags: ["SEASONAL", "ACT NOW"] },
];

const DiscoveryView: React.FC<ViewProps> = ({ platform, onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState("All");

  const trendingKws = trendingKwsByCategory[selectedCategory] || trendingKwsByCategory.All;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Trending Keywords" value="47" delta="▲ 12 new this week" deltaType="positive" sub={`${platform} · Energy Drinks`} accentColor="bg-sw-cyan" delay={0} />
        <KPICard title="Category Opportunities" value="9" delta="▲ High demand, low comp." deltaType="positive" sub="Ready to capture" accentColor="bg-primary" delay={0.05} />
        <KPICard title="New Search Intents" value="23" delta="▲ Detected this month" deltaType="positive" sub="AI-detected from query logs" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Forecast Accuracy" value="91%" delta="▲ 4% vs last quarter" deltaType="positive" sub="SKU-level 4-week forecast" accentColor="bg-sw-amber" delay={0.15} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
        <PanelCard title={`🔥 Trending Keywords — ${platform}`} badge={selectedCategory} badgeColor="accent" delay={0}>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {categoryFilter.map(c => (
              <button key={c} onClick={() => setSelectedCategory(c)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${selectedCategory === c ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Keyword</th>
                <th className="text-right py-2 font-normal">Volume</th>
                <th className="text-right py-2 font-normal">△ WoW</th>
                <th className="text-right py-2 font-normal">Opportunity</th>
              </tr>
            </thead>
            <tbody>
              {trendingKws.map((k, i) => (
                <tr key={k.kw} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground font-mono text-[11px]">{k.kw}</td>
                  <td className="py-2.5 text-right font-mono text-foreground">{k.vol}</td>
                  <td className={`py-2.5 text-right font-mono ${k.wow.startsWith("+") ? "text-sw-green" : "text-sw-red"}`}>{k.wow}</td>
                  <td className="py-2.5 text-right"><span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${k.oppColor}`}>{k.opp}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>

        <PanelCard title="📈 4-Week Demand Forecast" badge="91% accuracy" badgeColor="green" delay={0}>
          <div className="space-y-5">
            {forecasts.map((f) => (
              <div key={f.sku}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground">{f.sku}</span>
                  <span className={`font-mono text-[11px] ${f.delta.startsWith("+") ? "text-sw-green" : "text-sw-amber"}`}>{f.delta}</span>
                </div>
                <div className="flex items-end gap-1 h-8">
                  {f.weeks.map((w, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                      <div className={`w-full ${f.color} rounded-sm`} style={{ height: `${w * 0.32}px`, opacity: 0.3 + (i * 0.23) }} />
                      <span className="text-[8px] text-muted-foreground font-mono">W{i + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Competition Deep Dive */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Category Market Share — ${platform}`} badge="Energy Drinks" badgeColor="accent" delay={0}>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              {competitorComparison.map((c) => (
                <div key={c.brand} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-32">{c.brand}</span>
                  <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full ${c.color} rounded-full`} style={{ width: `${c.share * 2}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-foreground w-8 text-right">{c.share}%</span>
                  <span className={`font-mono text-[10px] ${c.trend.startsWith("+") ? "text-sw-green" : "text-sw-red"}`}>{c.trend}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <h4 className="text-xs font-display font-bold text-foreground">Key Insights</h4>
              <div className="space-y-2 text-[11px] text-muted-foreground">
                <p>• Red Bull dominates at 35% but growth slowing (+0.8%)</p>
                <p>• Monster losing share (-1.2%) — opportunity to capture</p>
                <p>• Sting growing fast (+3.1%) in Q-commerce channels</p>
                <p>• Hell Energy emerging as threat in premium segment (+5.2%)</p>
                <p>• Your growth at +2.4% — outpacing market leader</p>
              </div>
              <button onClick={() => onNavigate("competitors")} className="text-primary text-[11px] hover:underline flex items-center gap-1">
                View competitor ad strategies <ArrowRight size={10} />
              </button>
            </div>
          </div>
        </PanelCard>
      </motion.div>

      {/* Opportunities */}
      <motion.div variants={fadeUp}>
        <PanelCard title="💡 Category White-Space Opportunities" badge="3 actionable" badgeColor="green" delay={0}>
          <div className="grid grid-cols-3 gap-4">
            {opportunities.map((o) => (
              <div key={o.title} className="rounded-xl border border-subtle p-5 bg-surface-2">
                <p className="text-2xl mb-2">{o.emoji}</p>
                <h4 className="font-display font-bold text-foreground text-sm">{o.title}</h4>
                <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {o.tags.map((t) => (
                    <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface-3 text-foreground">{t}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default DiscoveryView;
