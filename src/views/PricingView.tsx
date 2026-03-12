import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { ArrowRight } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const skuOptions = ["Original 500ml", "Sugar Free 500ml", "Citrus 250ml", "Berry 350ml", "Shot 60ml"];

const priceHistoryBySku: Record<string, any[]> = {
  "Original 500ml": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    yours: 99,
    redBull: 125,
    monster: i >= 15 ? 109 : 119,
    sting: 50,
  })),
  "Sugar Free 500ml": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    yours: 119,
    redBull: i >= 10 ? 99 : 110,
    monster: 129,
    sting: 55,
  })),
  "Citrus 250ml": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    yours: 49,
    redBull: 55,
    monster: 59,
    sting: 25,
  })),
  "Berry 350ml": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    yours: 69,
    redBull: 75,
    monster: 79,
    sting: 35,
  })),
  "Shot 60ml": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    yours: 35,
    redBull: 45,
    monster: 40,
    sting: 20,
  })),
};

const competitorMatrix = [
  { brand: "EnergyMax (You)", you: true, price: "₹99", rating: "4.2★", reviews: "2,847", pos: "#3", sos: "18%", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "Red Bull 250ml", you: false, price: "₹125", rating: "4.5★", reviews: "44,102", pos: "#1", sos: "35%", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "Monster 500ml", you: false, price: "₹119", rating: "4.3★", reviews: "18,241", pos: "#2", sos: "22%", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "Sting 250ml", you: false, price: "₹50", rating: "4.0★", reviews: "28,710", pos: "#4", sos: "15%", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  { brand: "Hell Energy 500ml", you: false, price: "₹99", rating: "3.9★", reviews: "3,210", pos: "#5", sos: "6%", stock: "LOW STOCK", stockColor: "text-sw-amber bg-sw-amber-dim" },
];

const priceAlerts = [
  { sku: "Sugar Free 500ml", competitor: "Red Bull", yourPrice: "₹119", compPrice: "₹99", gap: "+20.2%", severity: "high" },
  { sku: "Shot 60ml", competitor: "Sting", yourPrice: "₹35", compPrice: "₹20", gap: "+75%", severity: "high" },
  { sku: "Citrus 250ml", competitor: "Red Bull", yourPrice: "₹49", compPrice: "₹55", gap: "-10.9%", severity: "low" },
];

const contentGapsBySku: Record<string, { label: string; you: number | string; them: number | string; youPct: number; color: string }[]> = {
  "Original 500ml": [
    { label: "Title Keywords", you: 6, them: 11, youPct: 55, color: "text-sw-amber" },
    { label: "Images Count", you: 5, them: 8, youPct: 63, color: "text-sw-amber" },
    { label: "A+ Content", you: "No", them: "Yes", youPct: 10, color: "text-sw-red" },
    { label: "Review Count", you: "2.8K", them: "44K", youPct: 6, color: "text-sw-red" },
  ],
  "Sugar Free 500ml": [
    { label: "Title Keywords", you: 4, them: 9, youPct: 44, color: "text-sw-red" },
    { label: "Images Count", you: 4, them: 7, youPct: 57, color: "text-sw-amber" },
    { label: "A+ Content", you: "No", them: "Yes", youPct: 10, color: "text-sw-red" },
    { label: "Review Count", you: "890", them: "18K", youPct: 5, color: "text-sw-red" },
  ],
  "Citrus 250ml": [
    { label: "Title Keywords", you: 5, them: 8, youPct: 63, color: "text-sw-amber" },
    { label: "Images Count", you: 6, them: 6, youPct: 100, color: "text-sw-green" },
    { label: "A+ Content", you: "Yes", them: "Yes", youPct: 100, color: "text-sw-green" },
    { label: "Review Count", you: "1.2K", them: "28K", youPct: 4, color: "text-sw-red" },
  ],
  "Berry 350ml": [
    { label: "Title Keywords", you: 7, them: 9, youPct: 78, color: "text-sw-green" },
    { label: "Images Count", you: 6, them: 7, youPct: 86, color: "text-sw-green" },
    { label: "A+ Content", you: "Yes", them: "Yes", youPct: 100, color: "text-sw-green" },
    { label: "Review Count", you: "3.4K", them: "15K", youPct: 23, color: "text-sw-red" },
  ],
  "Shot 60ml": [
    { label: "Title Keywords", you: 3, them: 10, youPct: 30, color: "text-sw-red" },
    { label: "Images Count", you: 3, them: 8, youPct: 38, color: "text-sw-red" },
    { label: "A+ Content", you: "No", them: "Yes", youPct: 10, color: "text-sw-red" },
    { label: "Review Count", you: "156", them: "12K", youPct: 1, color: "text-sw-red" },
  ],
};

const PricingView: React.FC<ViewProps> = ({ platform, onNavigate }) => {
  const [selectedSku, setSelectedSku] = useState("Original 500ml");

  const priceHistory = priceHistoryBySku[selectedSku] || priceHistoryBySku["Original 500ml"];
  const contentGaps = contentGapsBySku[selectedSku] || contentGapsBySku["Original 500ml"];

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Price Competitiveness" value="#3" delta="Behind Red Bull, Monster" deltaType="warning" sub={`${platform} · Energy Drinks`} accentColor="bg-sw-green" delay={0} />
        <KPICard title="Price Changes (24h)" value="3" delta="⚠ 1 affects your SKU" deltaType="warning" sub="Competitor moves today" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Avg Price Index" value="1.04x" delta="4% above market avg" deltaType="warning" sub={`vs competition on ${platform}`} accentColor="bg-primary" delay={0.1} />
        <KPICard title="Best Value Advantage" value="Original 500ml" delta="-20% vs Red Bull" deltaType="positive" sub="Strongest price position" accentColor="bg-sw-green" delay={0.15} />
      </motion.div>

      {/* Competitor Matrix */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Competitor Intelligence Matrix — ${platform}`} badge="Real-time" badgeColor="red" delay={0}>
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
              {competitorMatrix.map((r) => (
                <tr key={r.brand} className={r.you ? "bg-primary/5" : ""}>
                  <td className="py-3 text-foreground">
                    <span className="flex items-center gap-1.5">
                      {r.you && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">YOU</span>}
                      {r.brand}
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-foreground">{r.price}</td>
                  <td className="py-3 text-right font-mono text-sw-green">{r.rating}</td>
                  <td className="py-3 text-right font-mono text-foreground">{r.reviews}</td>
                  <td className="py-3 text-right font-mono text-foreground">{r.pos}</td>
                  <td className="py-3 text-right font-mono text-foreground">{r.sos}</td>
                  <td className="py-3 text-right"><span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${r.stockColor}`}>{r.stock}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>
      </motion.div>

      {/* Price Alerts + Price History */}
      <motion.div variants={fadeUp} className="grid grid-cols-2 gap-4">
        <PanelCard title="Active Price Alerts" badge={`${priceAlerts.length} alerts`} badgeColor="red" delay={0}>
          <div className="space-y-2">
            {priceAlerts.map((a, i) => (
              <div key={i} className={`p-3 rounded-xl border ${a.severity === "high" ? "bg-sw-red-dim/30 border-sw-red/20" : "bg-surface-2 border-subtle"}`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground font-medium">{a.sku}</span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${a.gap.startsWith("+") ? "bg-sw-red-dim text-sw-red" : "bg-sw-green-dim text-sw-green"}`}>{a.gap}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">{a.competitor}: {a.compPrice} vs your {a.yourPrice}</p>
              </div>
            ))}
          </div>
          <div className="mt-3 text-[10px]">
            <button onClick={() => onNavigate("campaigns")} className="text-primary hover:underline flex items-center gap-1">
              Launch value campaigns <ArrowRight size={10} />
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Price History — 30 Days" badge={selectedSku} badgeColor="accent" delay={0}>
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {skuOptions.map(s => (
              <button key={s} onClick={() => setSelectedSku(s)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${selectedSku === s ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(260,22%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="yours" stroke="hsl(268,78%,54%)" strokeWidth={2} dot={false} name="You" />
              <Line type="monotone" dataKey="redBull" stroke="hsl(0,76%,57%)" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Red Bull" />
              <Line type="monotone" dataKey="monster" stroke="hsl(160,70%,48%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Monster" />
              <Line type="monotone" dataKey="sting" stroke="hsl(38,92%,50%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name="Sting" />
            </LineChart>
          </ResponsiveContainer>
        </PanelCard>
      </motion.div>

      {/* Content Gap */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Content Gap vs Top Competitor — ${selectedSku}`} badge="Deep Dive" badgeColor="amber" delay={0}>
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {skuOptions.map(s => (
              <button key={s} onClick={() => setSelectedSku(s)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${selectedSku === s ? "bg-sw-amber/20 text-sw-amber" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                {s}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
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
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default PricingView;
