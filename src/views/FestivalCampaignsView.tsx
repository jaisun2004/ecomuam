import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { CalendarDays, Megaphone, TrendingUp, Sparkles } from "lucide-react";

const upcomingFestivals = [
  {
    name: "Holi Sale", date: "Mar 25 – Mar 28", daysAway: 15,
    recommendation: "Protein supplements see 35% uplift during festival sales. Pre-position stock on Blinkit & Zepto 3 days before.",
    campaigns: [
      { name: "Holi Fitness Combo", platform: "Amazon", type: "Sponsored Products", budget: "₹50K", duration: "4 days", keywords: ["holi sale protein", "festival fitness deal", "whey protein offer"], targetROAS: "4.5x", projRevenue: "₹2.2L" },
      { name: "Quick Delivery Holi Push", platform: "Blinkit", type: "Banner + Sponsored", budget: "₹25K", duration: "3 days", keywords: ["holi protein delivery", "same day whey"], targetROAS: "3.8x", projRevenue: "₹95K" },
    ],
  },
  {
    name: "IPL Season", date: "Apr 1 – May 30", daysAway: 22,
    recommendation: "Sports nutrition searches spike 52% during IPL. 'Pre-workout' and 'energy supplement' keywords surge especially on match days.",
    campaigns: [
      { name: "IPL Match Day Blitz", platform: "Amazon", type: "Sponsored Products + Video", budget: "₹1.5L", duration: "60 days", keywords: ["ipl fitness", "cricket workout", "sports nutrition india", "pre workout energy"], targetROAS: "5.2x", projRevenue: "₹7.8L" },
      { name: "IPL Weekend Q-Commerce", platform: "Zepto", type: "Sponsored Listings", budget: "₹40K", duration: "8 weekends", keywords: ["quick protein delivery", "match day energy"], targetROAS: "3.5x", projRevenue: "₹1.4L" },
      { name: "IPL Instagram Reels", platform: "Instagram", type: "Reels + Story Ads", budget: "₹80K", duration: "60 days", keywords: ["fitness motivation", "gym transformation", "protein shake"], targetROAS: "4.0x", projRevenue: "₹3.2L" },
    ],
  },
  {
    name: "Summer Fitness Push", date: "Apr 15 – Jun 15", daysAway: 36,
    recommendation: "Summer gym membership sign-ups drive 28% more protein searches. Women's protein segment grows 45% in Apr–Jun.",
    campaigns: [
      { name: "Summer Body Campaign", platform: "Amazon", type: "Sponsored Products", budget: "₹2L", duration: "60 days", keywords: ["summer body protein", "lean whey", "women protein shake"], targetROAS: "4.8x", projRevenue: "₹9.6L" },
      { name: "Summer Hydration + Fitness", platform: "Flipkart", type: "Sponsored + Display", budget: "₹1L", duration: "45 days", keywords: ["electrolyte supplement", "summer fitness"], targetROAS: "3.6x", projRevenue: "₹3.6L" },
    ],
  },
  {
    name: "Independence Day Sale", date: "Aug 10 – Aug 16", daysAway: 153,
    recommendation: "Major marketplace sales event. Historically our ROAS peaks at 6.2x during freedom sales. Stock up 2 weeks before.",
    campaigns: [
      { name: "Freedom Fitness Mega Sale", platform: "Amazon", type: "Lightning Deal + Sponsored", budget: "₹3L", duration: "7 days", keywords: ["independence day sale", "freedom sale protein", "15 august offer"], targetROAS: "6.2x", projRevenue: "₹18.6L" },
      { name: "Flipkart Freedom Sale", platform: "Flipkart", type: "Top Deal + Sponsored", budget: "₹2L", duration: "7 days", keywords: ["flipkart sale whey", "independence offer"], targetROAS: "5.8x", projRevenue: "₹11.6L" },
    ],
  },
];

const pastPerformance = [
  { festival: "Republic Day Sale", roas: "5.4x", spend: "₹1.8L", revenue: "₹9.7L", topPlatform: "Amazon" },
  { festival: "New Year Fitness", roas: "4.1x", spend: "₹1.2L", revenue: "₹4.9L", topPlatform: "Blinkit" },
  { festival: "Diwali Mega Sale", roas: "6.8x", spend: "₹4.5L", revenue: "₹30.6L", topPlatform: "Amazon" },
  { festival: "Navratri Health Week", roas: "3.9x", spend: "₹0.8L", revenue: "₹3.1L", topPlatform: "Flipkart" },
];

const FestivalCampaignsView: React.FC = () => {
  const [launchedCampaigns, setLaunchedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedFestival, setExpandedFestival] = useState<number>(0);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Upcoming Festivals" value="4" delta="Next: Holi in 15 days" deltaType="positive" sub="Campaigns ready to deploy" accentColor="bg-sw-amber" delay={0} />
        <KPICard title="Pre-built Campaigns" value="9" delta="AI-optimised & pre-fed" deltaType="positive" sub="Across all festivals" accentColor="bg-sw-purple" delay={0.05} />
        <KPICard title="Avg Festival ROAS" value="5.1x" delta="▲ Based on past festivals" deltaType="positive" sub="Historical performance" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Est. Revenue Potential" value="₹66L" delta="From all planned festivals" deltaType="positive" sub="If all campaigns deployed" accentColor="bg-sw-cyan" delay={0.15} />
      </div>

      {/* Past Performance */}
      <PanelCard title="Past Festival Performance" badge="Benchmarks" badgeColor="green" delay={0.2}>
        <div className="grid grid-cols-4 gap-3">
          {pastPerformance.map((p) => (
            <div key={p.festival} className="p-3 rounded-xl bg-surface-2 border border-subtle">
              <p className="text-xs text-foreground font-medium">{p.festival}</p>
              <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                <div><span className="text-muted-foreground">ROAS</span><p className="font-mono text-sw-green font-bold">{p.roas}</p></div>
                <div><span className="text-muted-foreground">Revenue</span><p className="font-mono text-foreground">{p.revenue}</p></div>
                <div><span className="text-muted-foreground">Spend</span><p className="font-mono text-foreground">{p.spend}</p></div>
                <div><span className="text-muted-foreground">Top Platform</span><p className="text-foreground">{p.topPlatform}</p></div>
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Upcoming Festival Campaigns */}
      {upcomingFestivals.map((festival, fi) => (
        <PanelCard key={festival.name} title={`${festival.name}`} badge={`${festival.date} · ${festival.daysAway}d away`}
          badgeColor={festival.daysAway <= 20 ? "red" : festival.daysAway <= 60 ? "amber" : "accent"} delay={0.25 + fi * 0.05}>
          <div className="mb-3 p-3 rounded-xl bg-sw-purple-dim/30 border border-sw-purple/20">
            <p className="text-[11px] text-foreground flex items-center gap-1.5"><Sparkles size={12} className="text-sw-purple" /> {festival.recommendation}</p>
          </div>
          <div className="grid grid-cols-1 gap-3">
            {festival.campaigns.map((c, ci) => {
              const key = `${fi}-${ci}`;
              return (
                <div key={key} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-foreground font-medium">{c.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{c.platform}</span>
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-surface-3 text-muted-foreground">{c.type}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-3 text-[10px] mb-3">
                    <div><span className="text-muted-foreground">Budget</span><p className="font-mono text-foreground">{c.budget}</p></div>
                    <div><span className="text-muted-foreground">Duration</span><p className="font-mono text-foreground">{c.duration}</p></div>
                    <div><span className="text-muted-foreground">Target ROAS</span><p className="font-mono text-sw-green">{c.targetROAS}</p></div>
                    <div><span className="text-muted-foreground">Proj. Revenue</span><p className="font-mono text-foreground">{c.projRevenue}</p></div>
                    <div><span className="text-muted-foreground">Keywords</span><p className="text-foreground">{c.keywords.length} pre-set</p></div>
                  </div>
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                    {c.keywords.map(kw => (
                      <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">"{kw}"</span>
                    ))}
                  </div>
                  <button onClick={() => setLaunchedCampaigns(p => ({ ...p, [key]: true }))}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      launchedCampaigns[key] ? "bg-sw-green-dim text-sw-green" : "bg-primary text-foreground hover:bg-primary/80"
                    }`}>
                    <Megaphone size={12} />
                    {launchedCampaigns[key] ? "✓ Campaign Scheduled!" : `Schedule for ${festival.date.split("–")[0].trim()}`}
                  </button>
                </div>
              );
            })}
          </div>
        </PanelCard>
      ))}
    </div>
  );
};

export default FestivalCampaignsView;
