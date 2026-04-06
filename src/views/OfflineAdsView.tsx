import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { Tv, CheckCircle2, MapPin, Megaphone } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";

const channelPerformance = [
  { channel: "Kirana Partnerships", roi: 3.5, reach: 380 },
  { channel: "Metro/Transit", roi: 2.6, reach: 1800 },
  { channel: "School Events", roi: 4.2, reach: 150 },
  { channel: "Radio Sponsorships", roi: 3.8, reach: 600 },
];

const onlineHealthSummary = {
  overallROAS: "4.2x",
  budgetUtilisation: "94%",
  allKPIsHealthy: true,
  impression: "Strong online coverage — all KPIs within target range",
  recommendation: "Online ad performance is optimised. Consider offline advertising to drive incremental brand awareness and kirana/retail distribution that online can't capture.",
};

const offlineChannels = [
  {
    channel: "Kirana Partnerships",
    type: "In-store Display + Sampling",
    cities: ["Delhi NCR", "Mumbai", "Bangalore", "Hyderabad"],
    estReach: "3.8L households/mo",
    estCost: "₹4.5L/mo",
    projImpact: "+18% brand recall, +12% repeat purchase",
    roi: "3.5x (blended online+offline)",
    rationale: "65% of biscuit purchases happen in kirana stores. Direct shelf visibility and sampling converts at 15%.",
  },
  {
    channel: "Metro/Transit Ads",
    type: "Delhi Metro + Mumbai Local",
    cities: ["Delhi NCR", "Mumbai"],
    estReach: "18L daily commuters",
    estCost: "₹7L/mo",
    projImpact: "+20% brand search volume, +10% online sales",
    roi: "2.6x (attributed via search lift)",
    rationale: "Transit ads drive measurable search lift within 48 hours. Tea-time biscuit positioning resonates with commuter demographic.",
  },
  {
    channel: "School & College Events",
    type: "Sampling + Sponsorships",
    cities: ["Pan-India (top 8 cities)"],
    estReach: "50K direct + 1.5M social reach",
    estCost: "₹3L/quarter",
    projImpact: "+30% social mentions, +20% new customer acquisition (Kids segment)",
    roi: "4.2x (tracked via promo codes)",
    rationale: "Kids biscuit segment (Milk Bikis, Good Day) directly benefits from school sampling. Parents drive repeat purchase.",
  },
  {
    channel: "Radio Sponsorships",
    type: "Morning Shows + Drive Time",
    cities: ["Digital — Pan-India"],
    estReach: "6L daily listeners",
    estCost: "₹1.8L/mo",
    projImpact: "+8% direct traffic, high recall rate",
    roi: "3.8x (promo code tracked)",
    rationale: "Radio listeners in Tier 2-3 cities have high biscuit purchase frequency. Low competition in biscuit radio ads.",
  },
];

const cityWiseOpps = [
  { city: "Delhi NCR", onlineShare: "34%", offlinePotential: "HIGH", channels: ["Kirana Partnerships", "Metro Ads"], estUplift: "+₹10L/mo" },
  { city: "Mumbai", onlineShare: "28%", offlinePotential: "HIGH", channels: ["Kirana Partnerships", "Local Train Ads"], estUplift: "+₹8L/mo" },
  { city: "Bangalore", onlineShare: "22%", offlinePotential: "MEDIUM", channels: ["Kirana Partnerships", "Tech Park Ads"], estUplift: "+₹5L/mo" },
  { city: "Hyderabad", onlineShare: "15%", offlinePotential: "MEDIUM", channels: ["Kirana Partnerships", "Mall Activations"], estUplift: "+₹3L/mo" },
  { city: "Chennai", onlineShare: "12%", offlinePotential: "LOW", channels: ["Kirana Partnerships"], estUplift: "+₹2L/mo" },
];

const OfflineAdsView: React.FC = () => {
  const [channelActions, setChannelActions] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Online ROAS" value="4.2x" delta="All KPIs healthy ✓" deltaType="positive" <KPICard title="Online ROAS" value="4.2x" delta="All KPIs healthy ✓" deltaType="positive" sub="Healthy — online channels performing well" accentColor="bg-sw-green" delay={0} /> accentColor="bg-sw-green" delay={0} />
          <KPICard title="Offline Opportunity" value="₹28L/mo" delta="Incremental potential" deltaType="positive" <KPICard title="Offline Opportunity" value="₹28L/mo" delta="Incremental potential" deltaType="positive" sub="Good — large untapped offline revenue potential" accentColor="bg-sw-purple" delay={0.05} /> accentColor="bg-sw-purple" delay={0.05} />
          <KPICard title="Est. Blended ROI" value="3.5x" delta="Online + Offline combined" deltaType="positive" sub="Based on attribution modeling" accentColor="bg-sw-cyan" delay={0.1} />
          <KPICard title="Cities to Target" value="5" delta="Based on online penetration" deltaType="positive" sub="Highest offline potential" accentColor="bg-sw-amber" delay={0.15} />
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-r from-sw-green/10 to-primary/10 border border-sw-green/20">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-sw-green" />
            <h3 className="font-display font-bold text-foreground">Online Ads — All Systems Healthy</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-2">{onlineHealthSummary.impression}</p>
          <p className="text-xs text-foreground bg-surface-2 rounded-xl p-3 border border-subtle">💡 {onlineHealthSummary.recommendation}</p>
        </div>

        <PanelCard title="Offline Advertising Recommendations" badge="AI-suggested" badgeColor="purple" delay={0.25}>
          <div className="grid grid-cols-2 gap-4">
            {offlineChannels.map((ch, i) => (
              <div key={ch.channel} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-foreground font-medium flex items-center gap-2"><Tv size={14} className="text-sw-purple" />{ch.channel}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-purple-dim text-sw-purple">{ch.type}</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-[10px] mb-3">
                  <div><span className="text-muted-foreground">Reach</span><p className="font-mono text-foreground">{ch.estReach}</p></div>
                  <div><span className="text-muted-foreground">Est. Cost</span><p className="font-mono text-foreground">{ch.estCost}</p></div>
                  <div><span className="text-muted-foreground">Impact</span><p className="text-sw-green text-[10px]">{ch.projImpact}</p></div>
                  <div><span className="text-muted-foreground">ROI</span><p className="font-mono text-sw-green font-bold">{ch.roi}</p></div>
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{ch.rationale}</p>
                <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                  {ch.cities.map(c => <span key={c} className="text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground flex items-center gap-0.5"><MapPin size={8} />{c}</span>)}
                </div>
                <button onClick={() => setChannelActions(p => ({ ...p, [i]: true }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${channelActions[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple/20 text-sw-purple hover:bg-sw-purple/30"}`}>
                  <Megaphone size={12} />{channelActions[i] ? "✓ Added to Plan" : "Add to Media Plan"}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="City-wise Offline Potential" badge="Based on online gaps" badgeColor="amber" delay={0.35}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">City</th>
                <th className="text-right py-2 font-normal">Online Share</th>
                <th className="text-right py-2 font-normal">Offline Potential</th>
                <th className="text-left py-2 font-normal pl-4">Recommended Channels</th>
                <th className="text-right py-2 font-normal">Est. Uplift</th>
              </tr>
            </thead>
            <tbody>
              {cityWiseOpps.map((c, i) => (
                <tr key={c.city} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-3 text-foreground flex items-center gap-1.5"><MapPin size={11} className="text-muted-foreground" />{c.city}</td>
                  <td className="py-3 text-right font-mono text-foreground">{c.onlineShare}</td>
                  <td className="py-3 text-right">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${c.offlinePotential === "HIGH" ? "bg-sw-green-dim text-sw-green" : c.offlinePotential === "MEDIUM" ? "bg-sw-amber-dim text-sw-amber" : "bg-surface-3 text-muted-foreground"}`}>{c.offlinePotential}</span>
                  </td>
                  <td className="py-3 pl-4 text-muted-foreground">{c.channels.join(", ")}</td>
                  <td className="py-3 text-right font-mono text-sw-green">{c.estUplift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Offline Channel Performance" badge="ROI Comparison" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={channelPerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="channel" tick={{ fontSize: 9, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="roi" fill="hsl(var(--sw-purple))" radius={[4, 4, 0, 0]} name="ROI (x)" />
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-subtle bg-surface-1 p-5">
              <h3 className="text-sm font-medium text-foreground mb-2">Estimated ROI Summary</h3>
              <div className="space-y-2">
                {channelPerformance.map(c => (
                  <div key={c.channel} className="flex items-center justify-between py-1.5 border-b border-subtle/50 last:border-b-0">
                    <span className="text-xs text-foreground">{c.channel}</span>
                    <span className="font-mono text-xs text-sw-green">{c.roi}x</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-subtle bg-surface-1 p-5">
              <h3 className="text-sm font-medium text-foreground mb-2">Reach Estimates (K)</h3>
              <div className="space-y-2">
                {channelPerformance.map(c => (
                  <div key={c.channel} className="flex items-center justify-between py-1.5 border-b border-subtle/50 last:border-b-0">
                    <span className="text-xs text-foreground">{c.channel}</span>
                    <span className="font-mono text-xs text-foreground">{c.reach}K/mo</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfflineAdsView;
