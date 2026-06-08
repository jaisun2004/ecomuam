import React from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ReferenceDot } from "recharts";

const matrixRows = [
  { brand: "Your Brand Whey 1kg", you: true, price: "₹ 2,499", priceColor: "text-primary", rating: "4.4★", ratingColor: "text-sw-green", reviews: "2,847", pos: "#3", posColor: "text-sw-green", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "MuscleBlaze Whey 1kg", you: false, price: "₹ 2,199 ↓", priceColor: "text-sw-red", rating: "4.5★", ratingColor: "text-sw-green", reviews: "18,241", pos: "#1", posColor: "text-sw-red", sos: "41%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "Optimum Nutrition 1kg", you: false, price: "₹ 3,499", priceColor: "text-sw-amber", rating: "4.6★", ratingColor: "text-sw-green", reviews: "44,102", pos: "#2", posColor: "text-sw-amber", sos: "19%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "AS-IT-IS Nutrition 1kg", you: false, price: "₹ 1,899", priceColor: "text-sw-green", rating: "4.1★", ratingColor: "text-sw-amber", reviews: "9,671", pos: "#5", posColor: "text-sw-amber", sos: "7%", sosColor: "text-muted-foreground", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "Dymatize ISO 100", you: false, price: "₹ 4,199", priceColor: "text-sw-amber", rating: "4.5★", ratingColor: "text-sw-green", reviews: "6,210", pos: "#4", posColor: "text-sw-amber", sos: "5%", sosColor: "text-muted-foreground", stock: "LOW STOCK", stockColor: "text-sw-amber bg-sw-amber-dim" },
];

const contentGaps = [
  { label: "Title Keywords", you: 6, them: 11, youPct: 55, color: "text-sw-amber" },
  { label: "Images Count", you: 7, them: 6, youPct: 58, color: "text-sw-green" },
  { label: "A+ Content", you: "No", them: "Yes", youPct: 10, color: "text-sw-red" },
  { label: "Review Count", you: "2.8K", them: "18K", youPct: 15, color: "text-sw-red" },
];

const priceHistory = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  yours: 2499,
  comp: i >= 12 ? 2199 : 2299,
}));

const CompetitorsView: React.FC = () => {
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Competitors Tracked" value="18" delta="+3 new detected" deltaType="positive" sub="Across all categories & platforms" accentColor="bg-sw-red" delay={0} />
        <KPICard title="Price Changes (24h)" value="7" delta="⚠ 2 affect your SKUs" deltaType="warning" sub="Competitor moves today" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Share of Voice" value="22%" delta="▲ 1.4% this week" deltaType="positive" sub="Sponsored + organic combined" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Your Price Position" value="#2" delta="Best value in category" deltaType="positive" sub="Across 6 tracked SKUs" accentColor="bg-sw-green" delay={0.15} />
      </div>

      <PanelCard title="Competitor Intelligence Matrix — Whey Protein 1kg · Instamart" badge="Real-time" badgeColor="red" delay={0.2}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Brand / SKU</th>
                <th className="text-right py-2 font-normal">Price</th>
                <th className="text-right py-2 font-normal">Rating</th>
                <th className="text-right py-2 font-normal">Reviews</th>
                <th className="text-right py-2 font-normal">Position</th>
                <th className="text-right py-2 font-normal">SoS</th>
                <th className="text-right py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {matrixRows.map((r) => (
                <tr key={r.brand} className={r.you ? "bg-primary/5" : ""}>
                  <td className="py-3 text-foreground">
                    <span className="flex items-center gap-1.5">
                      {r.you && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">YOU</span>}
                      {r.brand}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-mono ${r.priceColor}`}>{r.price}</td>
                  <td className={`py-3 text-right font-mono ${r.ratingColor}`}>{r.rating}</td>
                  <td className="py-3 text-right font-mono text-foreground">{r.reviews}</td>
                  <td className={`py-3 text-right font-mono ${r.posColor}`}>{r.pos}</td>
                  <td className={`py-3 text-right font-mono ${r.sosColor}`}>{r.sos}</td>
                  <td className="py-3 text-right"><span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${r.stockColor}`}>{r.stock}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Content Gap vs MuscleBlaze" badge="Instamart" badgeColor="amber" delay={0.3}>
          <div className="space-y-4">
            {contentGaps.map((g) => (
              <div key={g.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{g.label}</span>
                  <span className={`font-mono text-[10px] ${g.color}`}>You {g.you} / Them {g.them}</span>
                </div>
                <div className="h-2.5 bg-surface-3 rounded-full overflow-hidden flex">
                  <div className="h-full bg-primary rounded-l-full" style={{ width: `${g.youPct}%` }} />
                  <div className="h-full bg-sw-red/40 rounded-r-full" style={{ width: `${100 - g.youPct}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 rounded-xl bg-sw-red-dim border border-sw-red/20">
            <p className="text-[11px] text-foreground">🔴 Priority fix: Add A+ Content — A+ content improves conversion by 5–10%. MuscleBlaze has it, you don't.</p>
          </div>
        </PanelCard>

        <PanelCard title="Price History — 30 Days" badge="Whey 1kg · Instamart" badgeColor="accent" delay={0.35}>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} interval={6} />
              <YAxis domain={[2000, 2700]} tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="yours" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Your Price" />
              <Line type="monotone" dataKey="comp" stroke="hsl(0,76%,57%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name="MuscleBlaze" />
              <ReferenceDot x="Mar 13" y={2199} r={5} fill="hsl(0,76%,57%)" stroke="none" />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> Your price</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-red rounded-full" /> MuscleBlaze</span>
          </div>
          <div className="mt-3 p-3 rounded-xl bg-sw-amber-dim border border-sw-amber/20">
            <p className="text-[11px] text-foreground">⚠ 14.3% price gap — action recommended. MuscleBlaze cut price on Mar 12. Conversion rate dropped 8% since then.</p>
          </div>
        </PanelCard>
      </div>
    </div>
  );
};

export default CompetitorsView;
