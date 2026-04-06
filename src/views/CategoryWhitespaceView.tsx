import React, { useState } from "react";
import PanelCard from "@/components/sw/PanelCard";
import KPICard from "@/components/sw/KPICard";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { Megaphone } from "lucide-react";

const opportunities = [
  { emoji: "🍪", title: "Sugar-Free Biscuits", desc: "42% search growth, <3 sellers on Blinkit, 0 Q-commerce competitors in sugar-free category. High demand from health-conscious buyers.", tags: ["BLINKIT GAP", "HIGH IMPACT"], gradient: "from-sw-cyan/20 to-sw-cyan/5" },
  { emoji: "👩", title: "Protein Biscuits for Women", desc: "28K monthly searches, only 1 SKU in portfolio targeting this segment. Growing health snacking trend.", tags: ["CONTENT GAP", "HIGH IMPACT"], gradient: "from-sw-purple/20 to-sw-purple/5" },
  { emoji: "🌾", title: "Multigrain Snack Packs", desc: "Summer travel surge incoming. 35% WoW growth in multigrain snack searches, no sponsored listings on Zepto yet.", tags: ["SEASONAL", "ACT NOW"], gradient: "from-sw-amber/20 to-sw-amber/5" },
  { emoji: "🍫", title: "Dark Chocolate Cookies", desc: "Premium segment with 55% margins. Only Dark Fantasy dominates — room for Britannia Good Day Choco variant.", tags: ["PREMIUM", "HIGH MARGIN"], gradient: "from-sw-green/20 to-sw-green/5" },
  { emoji: "🧒", title: "Kids' Biscuit Combos", desc: "Back-to-school demand rising 22% MoM. Milk Bikis + Jim Jam combo packs have zero competition on quick commerce.", tags: ["Q-COMMERCE", "SEASONAL"], gradient: "from-sw-cyan/20 to-sw-cyan/5" },
  { emoji: "🏷️", title: "Value Packs (₹10–₹20 range)", desc: "Budget segment has 3x volume of premium. Tiger Glucose 5-pack not listed on any Q-commerce platform.", tags: ["VOLUME PLAY", "QUICK WIN"], gradient: "from-sw-purple/20 to-sw-purple/5" },
];

const whitespaceBySub = [
  { sub: "Cream Biscuits", gap: "No organic cream biscuit in market", platforms: ["Blinkit", "Zepto"], searchVol: "18K", competition: "Low" },
  { sub: "Digestive", gap: "No oat-based digestive variant", platforms: ["Amazon", "Flipkart"], searchVol: "12K", competition: "Medium" },
  { sub: "Cookies", gap: "No eggless premium cookie at <₹100", platforms: ["Amazon", "Instamart"], searchVol: "22K", competition: "Low" },
  { sub: "Glucose", gap: "No fortified glucose biscuit", platforms: ["Blinkit", "Zepto", "Instamart"], searchVol: "45K", competition: "Very Low" },
  { sub: "Health & Fibre", gap: "No gluten-free option available", platforms: ["Amazon", "Flipkart"], searchVol: "8K", competition: "None" },
];

const CategoryWhitespaceView: React.FC = () => {
  const [campaignActions, setCampaignActions] = useState<Record<number, boolean>>({});
  const g = useGuardrails();

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="White-space Opportunities" value={String(opportunities.length)} delta="▲ 2 new this week" deltaType="positive" sub="Good — new gaps opening from competitor exits" accentColor="bg-sw-cyan" delay={0} />
        <KPICard title="Sub-category Gaps" value={String(whitespaceBySub.length)} delta="Across 5 sub-categories" deltaType="neutral" sub="Moderate — product line expansion recommended" accentColor="bg-sw-purple" delay={0.05} />
        <KPICard title="Total Addressable Search" value="105K" delta="Monthly searches in gap areas" deltaType="positive" sub="Large — high uncontested demand volume available" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Avg Competition" value="Low" delta="Most gaps have <3 sellers" deltaType="positive" sub="Favorable — low barriers to entry in gap areas" accentColor="bg-sw-amber" delay={0.15} />
      </div>

      <PanelCard title="💡 Category White-Space Opportunities" badge={`${opportunities.length} actionable`} badgeColor="green" delay={0.2}>
        <div className="grid grid-cols-3 gap-4">
          {opportunities.map((o, i) => (
            <div key={o.title} className={`bg-gradient-to-br ${o.gradient} rounded-xl border border-subtle p-5`}>
              <p className="text-2xl mb-2">{o.emoji}</p>
              <h4 className="font-display font-bold text-foreground text-sm">{o.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
              <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                {o.tags.map(t => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface-3 text-foreground">{t}</span>
                ))}
              </div>
              <button onClick={() => setCampaignActions(p => ({ ...p, [i]: true }))}
                className={`mt-3 flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${
                  campaignActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/10 text-primary hover:bg-primary/20"
                }`}>
                <Megaphone size={10} />
                {campaignActions[i] ? "✓ Campaign Created" : "Create Campaign"}
              </button>
            </div>
          ))}
        </div>
      </PanelCard>

      <PanelCard title="Sub-category Gap Analysis" badge="Product-level" badgeColor="accent" delay={0.3}>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground border-b border-subtle">
              <th className="text-left py-2 font-normal">Sub-category</th>
              <th className="text-left py-2 font-normal">Gap Identified</th>
              <th className="text-left py-2 font-normal">Platforms</th>
              <th className="text-right py-2 font-normal">Search Vol</th>
              <th className="text-center py-2 font-normal">Competition</th>
            </tr>
          </thead>
          <tbody>
            {whitespaceBySub.map((w, i) => (
              <tr key={w.sub} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                <td className="py-2.5 font-medium text-foreground">{w.sub}</td>
                <td className="py-2.5 text-foreground">{w.gap}</td>
                <td className="py-2.5">
                  <div className="flex gap-1">
                    {w.platforms.map(p => (
                      <span key={p} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground">{p}</span>
                    ))}
                  </div>
                </td>
                <td className="py-2.5 text-right font-mono text-foreground">{w.searchVol}</td>
                <td className="py-2.5 text-center">
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${
                    w.competition === "None" || w.competition === "Very Low" ? "bg-sw-green-dim text-sw-green" :
                    w.competition === "Low" ? "bg-sw-green-dim text-sw-green" :
                    "bg-sw-amber-dim text-sw-amber"
                  }`}>{w.competition}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </PanelCard>
    </div>
  );
};

export default CategoryWhitespaceView;
