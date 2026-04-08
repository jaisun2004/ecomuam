import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import PanelCard from "@/components/sw/PanelCard";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Line, ComposedChart, Cell } from "recharts";
import { X } from "lucide-react";
import { useDateRange } from "@/contexts/DateRangeContext";
import ComparisonLegend from "@/components/ComparisonLegend";

/* ── Sub-category health data — Biscuits ── */
const healthData = [
  { sub: "Butter Cookies", skuCount: 128, brandCount: 22, avgDiscount: 14, availability: 94 },
  { sub: "Glucose", skuCount: 96, brandCount: 18, avgDiscount: 18, availability: 91 },
  { sub: "Cream Biscuits", skuCount: 72, brandCount: 15, avgDiscount: 22, availability: 82 },
  { sub: "Digestive / Health", skuCount: 54, brandCount: 12, avgDiscount: 10, availability: 88 },
  { sub: "Wafers", skuCount: 38, brandCount: 9, avgDiscount: 25, availability: 72 },
  { sub: "Kids Biscuits", skuCount: 45, brandCount: 11, avgDiscount: 20, availability: 78 },
  { sub: "Premium Cookies", skuCount: 32, brandCount: 8, avgDiscount: 8, availability: 96 },
  { sub: "Rusk", skuCount: 28, brandCount: 7, avgDiscount: 15, availability: 68 },
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
  "Butter Cookies": { Budget: 22, Mid: 48, Premium: 38, Luxury: 8 },
  Glucose: { Budget: 35, Mid: 42, Premium: 12, Luxury: 0 },
  "Cream Biscuits": { Budget: 18, Mid: 32, Premium: 14, Luxury: 0 },
  "Digestive / Health": { Budget: 5, Mid: 22, Premium: 18, Luxury: 4 },
  Wafers: { Budget: 8, Mid: 18, Premium: 8, Luxury: 0 },
  "Kids Biscuits": { Budget: 12, Mid: 22, Premium: 6, Luxury: 0 },
  "Premium Cookies": { Budget: 0, Mid: 8, Premium: 16, Luxury: 6 },
  Rusk: { Budget: 10, Mid: 14, Premium: 2, Luxury: 0 },
};

/* ── Brand activity scatter — Biscuits ── */
const brandActivityData = [
  { brand: "Britannia", skuCount: 52, activity: 88, adSpend: "₹12.4L", roas: "4.8x", availability: 94, contentScore: 82 },
  { brand: "Parle", skuCount: 68, activity: 45, adSpend: "₹8.2L", roas: "3.2x", availability: 91, contentScore: 68 },
  { brand: "Sunfeast", skuCount: 42, activity: 82, adSpend: "₹10.1L", roas: "4.2x", availability: 88, contentScore: 76 },
  { brand: "Unibic", skuCount: 18, activity: 90, adSpend: "₹5.6L", roas: "5.1x", availability: 86, contentScore: 84 },
  { brand: "McVities", skuCount: 14, activity: 72, adSpend: "₹4.2L", roas: "3.8x", availability: 82, contentScore: 79 },
  { brand: "Anmol", skuCount: 38, activity: 25, adSpend: "₹2.1L", roas: "2.4x", availability: 72, contentScore: 52 },
  { brand: "Priyagold", skuCount: 45, activity: 30, adSpend: "₹3.0L", roas: "2.8x", availability: 78, contentScore: 58 },
  { brand: "Cremica", skuCount: 12, activity: 85, adSpend: "₹3.8L", roas: "4.5x", availability: 90, contentScore: 81 },
  { brand: "Karachi Bakery", skuCount: 8, activity: 78, adSpend: "₹2.2L", roas: "5.4x", availability: 62, contentScore: 88 },
  { brand: "Mrs. Fields", skuCount: 6, activity: 92, adSpend: "₹1.8L", roas: "5.8x", availability: 58, contentScore: 90 },
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

/* ── Discount stress ── */
const discountStressData = healthData.map(h => ({
  sub: h.sub,
  sponsoredDiscount: Math.round(h.avgDiscount * 1.4),
  nonSponsoredDiscount: h.avgDiscount,
  availability: h.availability,
}));

/* ── Opportunity matrix (no VFM — use ad participation vs growth potential) ── */
const opportunityData = healthData.map(h => ({
  sub: h.sub,
  growthPotential: Math.round(40 + Math.random() * 50),
  adParticipation: Math.round(30 + Math.random() * 60),
  skuCount: h.skuCount,
}));

const CategoryAssortmentView: React.FC = () => {
  const [selectedBrand, setSelectedBrand] = useState<typeof brandActivityData[0] | null>(null);

  const tooltipStyle = {
    contentStyle: { backgroundColor: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 },
    labelStyle: { color: "hsl(var(--foreground))" },
    itemStyle: { color: "hsl(var(--muted-foreground))" },
  };

  const yourBrand = brandActivityData.find(b => b.brand === "Britannia")!;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">Category Assortment</h1>
        <p className="text-xs text-muted-foreground mt-1">Assortment health, white space, and opportunity signals across biscuit sub-categories</p>
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
                <th className="text-center py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Flags</th>
              </tr>
            </thead>
            <tbody>
              {healthData.map((row, i) => {
                const flags = [row.skuCount < 40 ? 1 : 0, row.brandCount < 10 ? 1 : 0, row.avgDiscount > 20 ? 1 : 0, row.availability < 75 ? 1 : 0].reduce((a, b) => a + b, 0);
                return (
                  <tr key={row.sub} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-surface-2/30" : ""}`}>
                    <td className="py-2.5 pr-4 font-medium text-foreground">{row.sub}</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.skuCount, [40, 60])} ${ragBg(row.skuCount, [40, 60])} rounded`}>{row.skuCount}</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.brandCount, [10, 15])} ${ragBg(row.brandCount, [10, 15])} rounded`}>{row.brandCount}</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${row.avgDiscount <= 15 ? "text-green-400 bg-green-400/10" : row.avgDiscount <= 22 ? "text-amber-400 bg-amber-400/10" : "text-red-400 bg-red-400/10"} rounded`}>{row.avgDiscount}%</td>
                    <td className={`py-2.5 px-3 text-center font-mono ${ragColor(row.availability, [75, 85])} ${ragBg(row.availability, [75, 85])} rounded`}>{row.availability}%</td>
                    <td className="py-2.5 px-3 text-center">
                      {flags >= 3 ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-400/15 text-red-400 border border-red-400/20">Priority</span>
                        : flags >= 1 ? <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-400/15 text-amber-400 border border-amber-400/20">Watch</span>
                        : <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-400/15 text-green-400 border border-green-400/20">Healthy</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PanelCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Price Band Coverage */}
        <PanelCard title="Price band coverage" badge="White space" badgeColor="accent" delay={0.1}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Sub-category</th>
                  {priceBands.map(b => <th key={b} className="text-center py-2 px-2 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{b}</th>)}
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
                          {count === 0 ? <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-dashed border-red-400/30 bg-red-400/5 text-[10px] text-red-400 font-mono">—</span>
                            : <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg font-mono text-[11px] ${count >= 20 ? "bg-green-400/10 text-green-400" : count >= 10 ? "bg-amber-400/10 text-amber-400" : "bg-surface-3 text-muted-foreground"}`}>{count}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 pt-3 border-t border-border">
            <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded border border-dashed border-red-400/30 bg-red-400/5 inline-block" /> Empty = white space opportunity</span>
          </p>
        </PanelCard>

        {/* Brand Activity vs Shelf Space — clickable */}
        <PanelCard title="Brand activity vs shelf space" badge="Click bars for details" badgeColor="accent" delay={0.15}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={brandActivityData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={false} vertical={true} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="brand" tick={{ fontSize: 10, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="skuCount" name="SKU Count" fill="hsl(var(--primary))" fillOpacity={0.7} radius={[0, 4, 4, 0]} barSize={10} onClick={(data: any) => setSelectedBrand(data)} cursor="pointer" />
              <Bar dataKey="activity" name="Activity Score" fill="hsl(142 71% 45%)" fillOpacity={0.7} radius={[0, 4, 4, 0]} barSize={10} onClick={(data: any) => setSelectedBrand(data)} cursor="pointer" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-1.5 rounded-full bg-primary opacity-70" />SKU Count</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "hsl(142 71% 45%)" }} />Activity Score</span>
          </div>
        </PanelCard>

        {/* Brand detail overlay */}
        {selectedBrand && (
          <div className="lg:col-span-2">
            <PanelCard title={`${selectedBrand.brand} vs You (Britannia)`} badge="Comparison" badgeColor="accent" delay={0.05}>
              <button onClick={() => setSelectedBrand(null)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"><X size={14} /></button>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 pr-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Metric</th>
                      <th className="text-center py-2 px-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{selectedBrand.brand}</th>
                      <th className="text-center py-2 px-4 text-[10px] font-mono text-primary uppercase tracking-widest">Britannia (You)</th>
                      <th className="text-center py-2 px-4 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Delta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { label: "SKU Count", them: selectedBrand.skuCount, you: yourBrand.skuCount },
                      { label: "Activity Score", them: selectedBrand.activity, you: yourBrand.activity },
                      { label: "Ad Spend", them: selectedBrand.adSpend, you: yourBrand.adSpend, isStr: true },
                      { label: "ROAS", them: selectedBrand.roas, you: yourBrand.roas, isStr: true },
                      { label: "Availability %", them: selectedBrand.availability, you: yourBrand.availability },
                      { label: "Content Score", them: selectedBrand.contentScore, you: yourBrand.contentScore },
                    ].map((row, i) => {
                      const delta = row.isStr ? "—" : (row.you as number) - (row.them as number);
                      const deltaColor = typeof delta === "number" ? (delta > 0 ? "text-sw-green" : delta < 0 ? "text-sw-red" : "text-muted-foreground") : "text-muted-foreground";
                      return (
                        <tr key={row.label} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-surface-2/30" : ""}`}>
                          <td className="py-2 pr-4 font-medium text-foreground">{row.label}</td>
                          <td className="py-2 px-4 text-center font-mono text-foreground">{row.them}</td>
                          <td className="py-2 px-4 text-center font-mono text-primary font-bold">{row.you}</td>
                          <td className={`py-2 px-4 text-center font-mono ${deltaColor}`}>{typeof delta === "number" ? `${delta > 0 ? "+" : ""}${delta}` : delta}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </PanelCard>
          </div>
        )}

        {/* Discount Stress vs Availability */}
        <PanelCard title="Discount stress vs availability" badge="Margin risk" badgeColor="accent" delay={0.2}>
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={discountStressData} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
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

        {/* Opportunity Priority Matrix — no VFM */}
        <PanelCard title="Opportunity priority matrix" badge="Growth" badgeColor="accent" delay={0.25}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={opportunityData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={false} vertical={true} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="sub" tick={{ fontSize: 9, fill: "hsl(var(--foreground))" }} axisLine={false} tickLine={false} width={110} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="growthPotential" name="Growth Potential" radius={[0, 4, 4, 0]} barSize={10}>
                {opportunityData.map((entry, i) => {
                  const isHighGrowth = entry.growthPotential >= 70;
                  return <Cell key={i} fill={isHighGrowth ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"} fillOpacity={0.7} />;
                })}
              </Bar>
              <Bar dataKey="adParticipation" name="Ad Participation %" radius={[0, 4, 4, 0]} barSize={10}>
                {opportunityData.map((entry, i) => {
                  const isHighAd = entry.adParticipation >= 60;
                  return <Cell key={i} fill={isHighAd ? "hsl(var(--destructive))" : "hsl(var(--muted-foreground))"} fillOpacity={0.5} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2 pt-2 border-t border-border">
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-1.5 rounded-full bg-primary opacity-70" />Growth Potential</span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="w-3 h-1.5 rounded-full bg-destructive opacity-50" />Ad Participation</span>
          </div>
        </PanelCard>
      </div>
    </motion.div>
  );
};

export default CategoryAssortmentView;
