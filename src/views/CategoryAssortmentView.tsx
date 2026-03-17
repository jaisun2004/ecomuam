import React, { useState } from "react";
import { motion } from "framer-motion";
import PanelCard from "@/components/sw/PanelCard";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Line, ComposedChart, Cell, ZAxis } from "recharts";

/* ── Sub-category health data ── */
const healthData = [
  { sub: "Whey Protein", skuCount: 142, brandCount: 28, avgDiscount: 18, availability: 92, vfm: 74 },
  { sub: "Creatine", skuCount: 58, brandCount: 14, avgDiscount: 12, availability: 88, vfm: 81 },
  { sub: "Pre-Workout", skuCount: 45, brandCount: 11, avgDiscount: 22, availability: 76, vfm: 62 },
  { sub: "BCAA", skuCount: 37, brandCount: 9, avgDiscount: 25, availability: 68, vfm: 55 },
  { sub: "Mass Gainer", skuCount: 64, brandCount: 16, avgDiscount: 30, availability: 71, vfm: 48 },
  { sub: "Protein Bars", skuCount: 89, brandCount: 22, avgDiscount: 15, availability: 94, vfm: 79 },
  { sub: "Vitamins", skuCount: 112, brandCount: 31, avgDiscount: 10, availability: 96, vfm: 85 },
  { sub: "Plant Protein", skuCount: 33, brandCount: 8, avgDiscount: 20, availability: 62, vfm: 58 },
];

const ragColor = (val: number, thresholds: [number, number]) => {
  if (val >= thresholds[1]) return "text-green-400";
  if (val >= thresholds[0]) return "text-amber-400";
  return "text-red-400";
};
const ragBg = (val: number, thresholds: [number, number]) => {
  if (val >= thresholds[1]) return "bg-green-400/10";
  if (val >= thresholds[0]) return "bg-amber-400/10";
  return "bg-red-400/10";
};

/* ── Price band heatmap ── */
const priceBands = ["Budget", "Mid", "Premium", "Luxury"] as const;
const priceBandData: Record<string, Record<string, number>> = {
  "Whey Protein": { Budget: 18, Mid: 52, Premium: 45, Luxury: 12 },
  Creatine: { Budget: 8, Mid: 24, Premium: 16, Luxury: 0 },
  "Pre-Workout": { Budget: 5, Mid: 18, Premium: 14, Luxury: 0 },
  BCAA: { Budget: 4, Mid: 15, Premium: 10, Luxury: 0 },
  "Mass Gainer": { Budget: 12, Mid: 28, Premium: 14, Luxury: 0 },
  "Protein Bars": { Budget: 22, Mid: 38, Premium: 18, Luxury: 4 },
  Vitamins: { Budget: 30, Mid: 42, Premium: 24, Luxury: 8 },
  "Plant Protein": { Budget: 3, Mid: 12, Premium: 10, Luxury: 0 },
};

/* ── Brand activity scatter ── */
const brandActivityData = [
  { brand: "MuscleBlaze", skuCount: 45, activity: 88 },
  { brand: "Optimum Nutrition", skuCount: 32, activity: 75 },
  { brand: "MyProtein", skuCount: 28, activity: 82 },
  { brand: "HealthKart", skuCount: 52, activity: 40 },
  { brand: "Avvatar", skuCount: 18, activity: 90 },
  { brand: "AS-IT-IS", skuCount: 38, activity: 35 },
  { brand: "GNC", skuCount: 22, activity: 55 },
  { brand: "Nakpro", skuCount: 15, activity: 70 },
  { brand: "Bigmuscles", skuCount: 30, activity: 25 },
  { brand: "Oziva", skuCount: 12, activity: 85 },
  { brand: "Wellcore", skuCount: 8, activity: 92 },
  { brand: "Fast&Up", skuCount: 14, activity: 78 },
];

const getBrandQuadrant = (skuCount: number, activity: number) => {
  if (skuCount >= 25 && activity < 50) return "zombie";
  if (skuCount < 25 && activity >= 70) return "expand";
  if (skuCount >= 25 && activity >= 50) return "strong";
  return "neutral";
};

const quadrantColors: Record<string, string> = {
  zombie: "hsl(var(--destructive))",
  expand: "hsl(var(--primary))",
  strong: "hsl(142 71% 45%)",
  neutral: "hsl(var(--muted-foreground))",
};

/* ── Discount stress data ── */
const discountStressData = healthData.map(h => ({
  sub: h.sub,
  sponsoredDiscount: Math.round(h.avgDiscount * 1.4),
  nonSponsoredDiscount: h.avgDiscount,
  availability: h.availability,
}));

/* ── Opportunity matrix ── */
const opportunityData = healthData.map(h => ({
  sub: h.sub,
  vfm: h.vfm,
  adParticipation: Math.round(30 + Math.random() * 60),
  skuCount: h.skuCount,
}));

/* ── Component ── */
const CategoryAssortmentView: React.FC = () => {
  const [selectedSub, setSelectedSub] = useState<string | null>(null);

  const tooltipStyle = {
    contentStyle: { backgroundColor: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 },
    labelStyle: { color: "hsl(var(--foreground))" },
    itemStyle: { color: "hsl(var(--muted-foreground))" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">Category Assortment</h1>
        <p className="text-xs text-muted-foreground mt-1">Assortment health, white space, and opportunity signals across sub-categories</p>
      </div>

      {/* Visual 1 — Category Health Scorecard */}
      <PanelCard title="Category health scorecard" badge="Weekly review" badgeColor="accent" delay={0.05}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Sub-category</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">SKUs</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Brands</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Avg discount %</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Availability</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">VFM index</th>
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Flags</th>
              </tr>
            </thead>
            <tbody>
              {healthData.map((row, i) => {
                const flags = [
                  row.skuCount < 40 ? 1 : 0,
                  row.brandCount < 10 ? 1 : 0,
                  row.avgDiscount > 20 ? 1 : 0,
                  row.availability < 75 ? 1 : 0,
                  row.vfm < 60 ? 1 : 0,
                ].reduce((a, b) => a + b, 0);

                return (
                  <tr key={row.sub} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-surface-2/30" : ""}`}>
                    <td className="py-2.5 pr-4 font-medium text-foreground">{row.sub}</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.skuCount, [40, 60])} ${ragBg(row.skuCount, [40, 60])} rounded`}>{row.skuCount}</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.brandCount, [10, 15])} ${ragBg(row.brandCount, [10, 15])} rounded`}>{row.brandCount}</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${row.avgDiscount <= 15 ? "text-green-400 bg-green-400/10" : row.avgDiscount <= 22 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10"} rounded`}>{row.avgDiscount}%</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.availability, [75, 85])} ${ragBg(row.availability, [75, 85])} rounded`}>{row.availability}%</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.vfm, [60, 75])} ${ragBg(row.vfm, [60, 75])} rounded`}>{row.vfm}</td>
                    <td className="py-2.5 px-3 text-center">
                      {flags >= 3 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-400/15 text-red-400 border border-red-400/20">Priority</span>
                      ) : flags >= 1 ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-400/15 text-amber-400 border border-amber-400/20">Watch</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-400/15 text-green-400 border border-green-400/20">Healthy</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Visual 2 — Price Band Coverage */}
        <PanelCard title="Price band coverage" badge="White space" badgeColor="accent" delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Sub-category</th>
                  {priceBands.map(b => (
                    <th key={b} className="text-center py-2 px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{b}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(priceBandData).map(([sub, bands], i) => (
                  <tr key={sub} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-surface-2/30" : ""}`}>
                    <td className="py-2.5 pr-3 font-medium text-foreground">{sub}</td>
                    {priceBands.map(b => {
                      const count = bands[b] ?? 0;
                      return (
                        <td key={b} className="py-2.5 px-2 text-center">
                          {count === 0 ? (
                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-red-400/30 bg-red-400/5 text-[10px] text-red-400 font-mono">—</span>
                          ) : (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono text-[11px] ${
                              count >= 20 ? "bg-green-400/10 text-green-400" : count >= 10 ? "bg-amber-400/10 text-amber-400" : "bg-surface-3 text-muted-foreground"
                            }`}>{count}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border">
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded border border-dashed border-red-400/30 bg-red-400/5 inline-block" /> Empty cells = white space — recruit sellers for these price points</span>
          </p>
        </PanelCard>

        {/* Visual 3 — Brand Activity vs Shelf Space */}
        <PanelCard title="Brand activity vs shelf space" badge="Quadrant" badgeColor="accent" delay={0.15}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="skuCount" name="SKU count" type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "SKU count →", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="activity" name="Activity" type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Activity ↑", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip {...tooltipStyle} formatter={(val: number, name: string) => [val, name === "skuCount" ? "SKUs" : "Activity"]} labelFormatter={(_, payload) => payload?.[0]?.payload?.brand ?? ""} />
              <Scatter data={brandActivityData}>
                {brandActivityData.map((entry, i) => (
                  <Cell key={i} fill={quadrantColors[getBrandQuadrant(entry.skuCount, entry.activity)]} fillOpacity={0.85} r={6} />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: quadrantColors.zombie }} />Zombie brands</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: quadrantColors.expand }} />Range expansion</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: quadrantColors.strong }} />Strong performers</span>
          </div>
        </PanelCard>

        {/* Visual 4 — Discount Stress vs Availability */}
        <PanelCard title="Discount stress vs availability" badge="Margin risk" badgeColor="accent" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={discountStressData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="sub" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} angle={-30} textAnchor="end" height={50} />
              <YAxis yAxisId="left" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Discount %", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis yAxisId="right" orientation="right" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Availability %", angle: 90, position: "insideRight", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip {...tooltipStyle} />
              <Bar yAxisId="left" dataKey="sponsoredDiscount" name="Sponsored disc %" fill="hsl(var(--destructive))" fillOpacity={0.7} radius={[4, 4, 0, 0]} barSize={14} />
              <Bar yAxisId="left" dataKey="nonSponsoredDiscount" name="Non-sponsored disc %" fill="hsl(var(--primary))" fillOpacity={0.5} radius={[4, 4, 0, 0]} barSize={14} />
              <Line yAxisId="right" dataKey="availability" name="Availability %" stroke="hsl(142 71% 45%)" strokeWidth={2} dot={{ r: 3 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </PanelCard>

        {/* Visual 5 — Opportunity Priority Matrix */}
        <PanelCard title="Opportunity priority matrix" badge="Growth" badgeColor="accent" delay={0.25}>
          <ResponsiveContainer width="100%" height={260}>
            <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="vfm" name="VFM Index" type="number" domain={[40, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "VFM Index →", position: "bottom", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis dataKey="adParticipation" name="Ad participation %" type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} label={{ value: "Ad participation ↑", angle: -90, position: "insideLeft", fontSize: 10, fill: "hsl(var(--muted-foreground))" }} />
              <ZAxis dataKey="skuCount" range={[40, 400]} name="SKU count" />
              <Tooltip {...tooltipStyle} formatter={(val: number, name: string) => [val, name]} labelFormatter={(_, payload) => payload?.[0]?.payload?.sub ?? ""} />
              <Scatter data={opportunityData}>
                {opportunityData.map((entry, i) => {
                  const isHighVfmLowAd = entry.vfm >= 70 && entry.adParticipation < 50;
                  const isLowVfmHighAd = entry.vfm < 60 && entry.adParticipation >= 60;
                  const color = isHighVfmLowAd ? "hsl(var(--primary))" : isLowVfmHighAd ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))";
                  return <Cell key={i} fill={color} fillOpacity={0.8} />;
                })}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-primary" />High VFM, low ads — ad adoption opp.</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-2 h-2 rounded-full bg-destructive" />High ads, low VFM — curation needed</span>
          </div>
        </PanelCard>
      </div>
    </motion.div>
  );
};

export default CategoryAssortmentView;
