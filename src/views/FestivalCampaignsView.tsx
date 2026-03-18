import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { Megaphone, Sparkles } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, AreaChart, Area } from "recharts";

const festivalComparison = [
  { festival: "Diwali", spend: 380, roas: 6.2, conversions: 2400 },
  { festival: "Republic Day", spend: 150, roas: 5.1, conversions: 1000 },
  { festival: "New Year", spend: 100, roas: 3.8, conversions: 650 },
];

const rampUpData = Array.from({ length: 14 }, (_, i) => ({
  day: `D-${14 - i}`,
  diwali: Math.round(20 + (i * i * 2)),
  republicDay: Math.round(15 + (i * i * 1.2)),
}));

const categoryShareData = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  festival: Math.round(30 + Math.random() * 20),
  nonFestival: Math.round(50 + Math.random() * 15),
}));

const upcomingFestivals = [
  {
    name: "Holi Sale", date: "Mar 25 – Mar 28", daysAway: 15,
    recommendation: "Biscuit gift packs see 40% uplift during Holi. Pre-position combo packs on Blinkit & Zepto 3 days before.",
    campaigns: [
      { name: "Holi Biscuit Combo", platform: "Amazon", type: "Sponsored Products", budget: "₹40K", duration: "4 days", keywords: ["holi sale biscuits", "festival gift pack", "biscuit combo offer"], targetROAS: "4.5x" },
      { name: "Quick Delivery Holi Push", platform: "Blinkit", type: "Banner + Sponsored", budget: "₹20K", duration: "3 days", keywords: ["holi biscuit delivery", "same day biscuits"], targetROAS: "3.8x" },
    ],
  },
  {
    name: "IPL Season", date: "Apr 1 – May 30", daysAway: 22,
    recommendation: "Snack searches spike 45% during IPL. 'Party biscuits' and 'snack combo' keywords surge on match days.",
    campaigns: [
      { name: "IPL Match Day Snacks", platform: "Amazon", type: "Sponsored Products + Video", budget: "₹1.2L", duration: "60 days", keywords: ["ipl snacks", "cricket party biscuits", "match day munchies"], targetROAS: "5.0x" },
      { name: "IPL Q-Commerce Push", platform: "Zepto", type: "Sponsored Listings", budget: "₹35K", duration: "8 weekends", keywords: ["quick snack delivery", "match day biscuits"], targetROAS: "3.5x" },
    ],
  },
  {
    name: "Summer Refreshment", date: "Apr 15 – Jun 15", daysAway: 36,
    recommendation: "Light biscuits and cream variants see 25% higher searches. Marie Gold and NutriChoice are category leaders in summer.",
    campaigns: [
      { name: "Summer Light Biscuits", platform: "Amazon", type: "Sponsored Products", budget: "₹1.5L", duration: "60 days", keywords: ["light biscuits", "healthy snacks summer", "digestive biscuits"], targetROAS: "4.5x" },
      { name: "Summer Kids Favourites", platform: "Flipkart", type: "Sponsored + Display", budget: "₹80K", duration: "45 days", keywords: ["kids biscuits", "summer snacks kids"], targetROAS: "3.8x" },
    ],
  },
  {
    name: "Independence Day Sale", date: "Aug 10 – Aug 16", daysAway: 153,
    recommendation: "Major marketplace sales event. Historically ROAS peaks at 5.8x during freedom sales. Stock up 2 weeks before.",
    campaigns: [
      { name: "Freedom Sale Mega Pack", platform: "Amazon", type: "Lightning Deal + Sponsored", budget: "₹2.5L", duration: "7 days", keywords: ["independence day sale", "freedom sale biscuits", "15 august offer"], targetROAS: "5.8x" },
      { name: "Flipkart Freedom Sale", platform: "Flipkart", type: "Top Deal + Sponsored", budget: "₹1.5L", duration: "7 days", keywords: ["flipkart sale biscuits", "independence offer"], targetROAS: "5.2x" },
    ],
  },
];

const pastPerformance = [
  { festival: "Republic Day Sale", roas: "5.1x", spend: "₹1.5L", topPlatform: "Amazon", conversions: "1,000" },
  { festival: "New Year Snack Fest", roas: "3.8x", spend: "₹1.0L", topPlatform: "Blinkit", conversions: "650" },
  { festival: "Diwali Mega Sale", roas: "6.2x", spend: "₹3.8L", topPlatform: "Amazon", conversions: "2,400" },
  { festival: "Navratri Snack Week", roas: "3.5x", spend: "₹0.6L", topPlatform: "Flipkart", conversions: "420" },
];

const FestivalCampaignsView: React.FC = () => {
  const [launchedCampaigns, setLaunchedCampaigns] = useState<Record<string, boolean>>({});
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Upcoming Festivals" value="4" delta="Next: Holi in 15 days" deltaType="positive" sub="Campaigns ready to deploy" accentColor="bg-sw-amber" delay={0} />
          <KPICard title="Pre-built Campaigns" value="8" delta="AI-optimised & pre-fed" deltaType="positive" sub="Across all festivals" accentColor="bg-sw-purple" delay={0.05} />
          <KPICard title="Avg Festival ROAS" value="4.8x" delta="▲ Based on past festivals" deltaType="positive" sub="Historical performance" accentColor="bg-sw-green" delay={0.1} />
          <KPICard title="Total Planned Spend" value="₹9.6L" delta="Across all festivals" deltaType="positive" sub="If all campaigns deployed" accentColor="bg-sw-cyan" delay={0.15} />
        </div>

        <PanelCard title="Past Festival Performance" badge="Benchmarks" badgeColor="green" delay={0.2}>
          <div className="grid grid-cols-4 gap-3">
            {pastPerformance.map(p => (
              <div key={p.festival} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-xs text-foreground font-medium">{p.festival}</p>
                <div className="grid grid-cols-2 gap-2 mt-2 text-[10px]">
                  <div><span className="text-muted-foreground">ROAS</span><p className="font-mono text-sw-green font-bold">{p.roas}</p></div>
                  <div><span className="text-muted-foreground">Conversions</span><p className="font-mono text-foreground">{p.conversions}</p></div>
                  <div><span className="text-muted-foreground">Spend</span><p className="font-mono text-foreground">{p.spend}</p></div>
                  <div><span className="text-muted-foreground">Top Platform</span><p className="text-foreground">{p.topPlatform}</p></div>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        {upcomingFestivals.map((festival, fi) => (
          <PanelCard key={festival.name} title={festival.name} badge={`${festival.date} · ${festival.daysAway}d away`}
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
                    <div className="grid grid-cols-4 gap-3 text-[10px] mb-3">
                      <div><span className="text-muted-foreground">Budget</span><p className="font-mono text-foreground">{c.budget}</p></div>
                      <div><span className="text-muted-foreground">Duration</span><p className="font-mono text-foreground">{c.duration}</p></div>
                      <div><span className="text-muted-foreground">Target ROAS</span><p className="font-mono text-sw-green">{c.targetROAS}</p></div>
                      <div><span className="text-muted-foreground">Keywords</span><p className="text-foreground">{c.keywords.length} pre-set</p></div>
                    </div>
                    <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                      {c.keywords.map(kw => <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">"{kw}"</span>)}
                    </div>
                    <button onClick={() => setLaunchedCampaigns(p => ({ ...p, [key]: true }))}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${launchedCampaigns[key] ? "bg-sw-green-dim text-sw-green" : "bg-primary text-foreground hover:bg-primary/80"}`}>
                      <Megaphone size={12} />
                      {launchedCampaigns[key] ? "✓ Campaign Scheduled!" : `Schedule for ${festival.date.split("–")[0].trim()}`}
                    </button>
                  </div>
                );
              })}
            </div>
          </PanelCard>
        ))}
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Festival Performance Comparison" badge="Last 3 Festivals" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={festivalComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="festival" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="spend" fill="hsl(38,92%,50%)" opacity={0.6} radius={[4, 4, 0, 0]} name="Spend (₹K)" />
                <Bar dataKey="conversions" fill="hsl(160,70%,48%)" opacity={0.8} radius={[4, 4, 0, 0]} name="Conversions" />
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Pre-Festival Ramp-Up Timeline" badge="14 Days Before" badgeColor="amber" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={rampUpData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="diwali" stroke="hsl(38,92%,50%)" strokeWidth={2} dot={false} name="Diwali" />
                <Line type="monotone" dataKey="republicDay" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Republic Day" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Category Share — Festival vs Non-Festival" badge="30 Days" badgeColor="purple" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={categoryShareData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Area type="monotone" dataKey="festival" stackId="1" fill="hsl(var(--sw-amber))" stroke="hsl(38,92%,50%)" fillOpacity={0.3} name="Festival Period" />
                <Area type="monotone" dataKey="nonFestival" stackId="1" fill="hsl(var(--primary))" stroke="hsl(228,90%,64%)" fillOpacity={0.2} name="Non-Festival" />
              </AreaChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default FestivalCampaignsView;
