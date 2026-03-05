import React from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";

const trendingKws = [
  { kw: "pre workout citrus", vol: "28.4K", wow: "+47%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
  { kw: "women protein shake", vol: "44.1K", wow: "+31%", opp: "HIGH", oppColor: "text-sw-green bg-sw-green-dim" },
  { kw: "electrolyte sachets", vol: "19.8K", wow: "+28%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
  { kw: "vegan protein bar", vol: "33.2K", wow: "+22%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
  { kw: "creatine gummies", vol: "11.7K", wow: "+61%", opp: "EMERGING", oppColor: "text-sw-purple bg-sw-purple-dim" },
  { kw: "whey isolate zero sugar", vol: "52.3K", wow: "+9%", opp: "MED", oppColor: "text-sw-amber bg-sw-amber-dim" },
  { kw: "gym supplement combo", vol: "8.9K", wow: "-4%", opp: "LOW", oppColor: "text-muted-foreground bg-surface-3" },
];

const forecasts = [
  { sku: "Whey 1kg Chocolate", delta: "+18%", color: "bg-primary", weeks: [60, 65, 72, 80] },
  { sku: "Pre-Workout Citrus", delta: "+47%", color: "bg-sw-cyan", weeks: [40, 55, 70, 90] },
  { sku: "Creatine Monohydrate", delta: "-8%", color: "bg-sw-amber", weeks: [75, 72, 68, 65] },
  { sku: "BCAA Tropical", delta: "+12%", color: "bg-sw-purple", weeks: [55, 58, 62, 66] },
];

const opportunities = [
  { emoji: "⚡", title: "Creatine Gummies", desc: "61% search growth, <3 sellers on Blinkit, 0 Q-commerce competitors in category", tags: ["BLINKIT GAP", "HIGH IMPACT"], gradient: "from-sw-cyan/20 to-sw-cyan/5" },
  { emoji: "👩", title: "Women's Protein", desc: "44K monthly searches, only 2 SKUs in portfolio targeting this segment explicitly", tags: ["CONTENT GAP", "HIGH IMPACT"], gradient: "from-sw-purple/20 to-sw-purple/5" },
  { emoji: "💧", title: "Electrolyte Sachets", desc: "Summer surge incoming. 28% WoW growth, no sponsored listings on Zepto yet", tags: ["SEASONAL", "ACT NOW"], gradient: "from-sw-amber/20 to-sw-amber/5" },
];

const DiscoveryView: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Trending Keywords" value="47" delta="▲ 12 new this week" deltaType="positive" sub="Across 6 platforms" accentColor="bg-sw-cyan" delay={0} />
        <KPICard title="Category Opportunities" value="9" delta="▲ High demand, low comp." deltaType="positive" sub="Ready to capture" accentColor="bg-sw-purple" delay={0.05} />
        <KPICard title="New Search Intents" value="23" delta="▲ Detected this month" deltaType="positive" sub="AI-detected from query logs" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Forecast Accuracy" value="91%" delta="▲ 4% vs last quarter" deltaType="positive" sub="SKU-level 4-week forecast" accentColor="bg-sw-amber" delay={0.15} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="🔥 Trending Keywords — This Week" badge="All Platforms" badgeColor="accent" delay={0.2}>
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
                  <td className="py-2.5 text-right">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${k.oppColor}`}>{k.opp}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>

        <PanelCard title="📈 4-Week Demand Forecast" badge="AI · 91% accuracy" badgeColor="green" delay={0.25}>
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
      </div>

      <PanelCard title="💡 Category White-Space Opportunities" badge="9 actionable" badgeColor="green" delay={0.3}>
        <div className="grid grid-cols-3 gap-4">
          {opportunities.map((o) => (
            <div key={o.title} className={`bg-gradient-to-br ${o.gradient} rounded-xl border border-subtle p-5`}>
              <p className="text-2xl mb-2">{o.emoji}</p>
              <h4 className="font-display font-bold text-foreground text-sm">{o.title}</h4>
              <p className="text-xs text-muted-foreground mt-1">{o.desc}</p>
              <div className="flex items-center gap-1.5 mt-3">
                {o.tags.map((t) => (
                  <span key={t} className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-surface-3 text-foreground">{t}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>
    </div>
  );
};

export default DiscoveryView;
