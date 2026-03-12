import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import AlertItem from "@/components/sw/AlertItem";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { MapPin, TrendingUp, TrendingDown, Swords, ArrowRight } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

/* ── Energy Drinks data ── */
const skuNames = ["Original 500ml", "Sugar Free 500ml", "Citrus 250ml", "Berry 350ml", "Electrolyte 500ml", "Shot 60ml"];

const platformAvail: Record<string, (number | null)[]> = {
  Amazon:    [97, 100, 72, 95, 54, 98],
  Flipkart:  [74, 92, 61, 88, 12, 78],
  Blinkit:   [55, 38, null, null, null, 71],
  Zepto:     [93, 77, null, null, null, 52],
  Instamart: [34,  9, null, null, null, 41],
};

const getCellColor = (v: number | null) => {
  if (v === null) return "bg-surface-3";
  if (v >= 80) return "bg-[rgba(35,209,139,0.8)]";
  if (v >= 60) return "bg-[rgba(35,209,139,0.45)]";
  if (v >= 40) return "bg-[rgba(245,158,11,0.5)]";
  if (v >= 20) return "bg-[rgba(240,82,82,0.4)]";
  return "bg-[rgba(240,82,82,0.7)]";
};

const searchDataByPlatform: Record<string, { kw: string; you: number; comp: number; compName: string; status: string }[]> = {
  Amazon: [
    { kw: "energy drink", you: 28, comp: 41, compName: "Red Bull", status: "losing" },
    { kw: "energy drink 500ml", you: 44, comp: 31, compName: "Monster", status: "winning" },
    { kw: "sugar free energy drink", you: 19, comp: 38, compName: "Red Bull", status: "losing" },
    { kw: "sports energy drink", you: 33, comp: 29, compName: "Sting", status: "winning" },
    { kw: "energy booster drink", you: 21, comp: 44, compName: "Monster", status: "losing" },
  ],
  Flipkart: [
    { kw: "energy drink", you: 22, comp: 48, compName: "Red Bull", status: "losing" },
    { kw: "energy drink 500ml", you: 38, comp: 35, compName: "Monster", status: "winning" },
    { kw: "sugar free energy drink", you: 14, comp: 42, compName: "Hell Energy", status: "losing" },
    { kw: "sports energy drink", you: 29, comp: 33, compName: "Sting", status: "losing" },
    { kw: "energy booster drink", you: 31, comp: 28, compName: "Monster", status: "winning" },
  ],
  Blinkit: [
    { kw: "energy drink", you: 35, comp: 30, compName: "Red Bull", status: "winning" },
    { kw: "energy drink 500ml", you: 41, comp: 22, compName: "Monster", status: "winning" },
    { kw: "sugar free energy drink", you: 8, comp: 51, compName: "Red Bull", status: "losing" },
    { kw: "sports energy drink", you: 44, comp: 18, compName: "Sting", status: "winning" },
  ],
  Zepto: [
    { kw: "energy drink", you: 31, comp: 33, compName: "Red Bull", status: "losing" },
    { kw: "energy drink 500ml", you: 39, comp: 28, compName: "Monster", status: "winning" },
    { kw: "sugar free energy drink", you: 22, comp: 35, compName: "Hell Energy", status: "losing" },
  ],
  Instamart: [
    { kw: "energy drink", you: 25, comp: 38, compName: "Red Bull", status: "losing" },
    { kw: "energy drink 500ml", you: 33, comp: 41, compName: "Monster", status: "losing" },
    { kw: "sports energy drink", you: 40, comp: 22, compName: "Sting", status: "winning" },
  ],
};

/* City data for Q-commerce only */
const cityData = [
  { city: "Delhi NCR", marketShare: 34, availability: 78, priceIndex: 0.95, sos: 29 },
  { city: "Mumbai", marketShare: 28, availability: 72, priceIndex: 0.98, sos: 24 },
  { city: "Bangalore", marketShare: 22, availability: 65, priceIndex: 1.03, sos: 19 },
  { city: "Hyderabad", marketShare: 15, availability: 48, priceIndex: 1.08, sos: 12 },
  { city: "Chennai", marketShare: 12, availability: 42, priceIndex: 1.10, sos: 8 },
];

const contentSkus = [
  { name: "EnergyMax Original 500ml", score: 80, color: "hsl(160,70%,48%)" },
  { name: "EnergyMax Sugar Free 500ml", score: 50, color: "hsl(38,92%,50%)" },
  { name: "EnergyMax Citrus 250ml", score: 20, color: "hsl(0,76%,57%)" },
  { name: "EnergyMax Berry 350ml", score: 70, color: "hsl(160,70%,48%)" },
];

const pricingRows = [
  { sku: "Original 500ml", yours: "₹99", comp: "₹125", diff: "-20.8%", diffType: "green" as const },
  { sku: "Sugar Free 500ml", yours: "₹119", comp: "₹99", diff: "+20.2%", diffType: "red" as const },
  { sku: "Citrus 250ml", yours: "₹49", comp: "₹45", diff: "+8.9%", diffType: "red" as const },
  { sku: "Berry 350ml", yours: "₹69", comp: "₹75", diff: "-8.0%", diffType: "green" as const },
  { sku: "Shot 60ml", yours: "₹35", comp: "₹30", diff: "+16.7%", diffType: "red" as const },
];

const ProgressRing = ({ score, color, size = 44 }: { score: number; color: string; size?: number }) => {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (score / 100) * c;
  return (
    <svg width={size} height={size} className="flex-shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--surface-3))" strokeWidth={4} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
        strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`} />
      <text x={size / 2} y={size / 2} textAnchor="middle" dominantBaseline="central"
        className="font-mono text-xs fill-foreground" fontSize={11}>{score}</text>
    </svg>
  );
};

const ShelfView: React.FC<ViewProps> = ({ platform, isNational, onNavigate }) => {
  const currentSearchData = searchDataByPlatform[platform] || searchDataByPlatform.Amazon;
  const availValues = platformAvail[platform] || platformAvail.Amazon;
  const getShareColor = (v: number) => {
    if (v >= 30) return "text-sw-green";
    if (v >= 20) return "text-sw-amber";
    return "text-sw-red";
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      {/* KPI Row */}
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Shelf Health Score" value="76 / 100" delta="▼ 3.2 vs last wk" deltaType="negative" sub={`${platform} · 6 SKUs`} accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Events (30d)" value="14" delta="▲ 4 vs last wk" deltaType="negative" sub="Critical stock alerts" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Share of Search" value="28%" delta="▲ 1.8% MoM" deltaType="positive" sub={`Energy drink category · ${platform}`} accentColor="bg-primary" delay={0.1} />
        <KPICard title="Content Score Avg" value="62%" delta="⚠ 4 SKUs need update" deltaType="warning" sub="Title + Images + A+ content" accentColor="bg-sw-amber" delay={0.15} />
      </motion.div>

      {/* Live Intelligence Feed */}
      <motion.div variants={fadeUp}>
        <PanelCard title="Live Intelligence Feed" badge="4 need action" badgeColor="red" delay={0}>
          <div className="grid grid-cols-2 gap-3">
            <AlertItem severity="critical" icon="🚨" title={`OOS on ${platform}`} detail="EnergyMax Sugar Free went out of stock. Critical availability drop." meta={`2m ago · ${platform}`} action="View Details" />
            <AlertItem severity="warning" icon="⚠️" title="Competitor price drop" detail="Red Bull cut 500ml price by ₹10 on this platform." meta={`18m ago · ${platform}`} action="View Pricing" />
            <AlertItem severity="success" icon="📈" title="Search rank improved" detail="'energy drink 500ml' moved from #7 to #3 after content update." meta={`1h ago · ${platform}`} action="View" />
            <AlertItem severity="info" icon="💡" title="Berry variant trending" detail="+47% search volume spike in 'berry energy drink'." meta={`3h ago · ${platform}`} action="View Discovery" />
          </div>
        </PanelCard>
      </motion.div>

      {/* Availability Heatmap + Share of Search */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <PanelCard title={`Availability — ${platform}`} badge={`${availValues.filter(v => v !== null && v < 50).length} low stock`} badgeColor="red" className="col-span-2" delay={0}>
          <div className="space-y-2">
            {skuNames.map((sku, i) => {
              const v = availValues[i];
              return (
                <div key={sku} className="flex items-center gap-3">
                  <span className="text-xs text-foreground w-36">{sku}</span>
                  {v === null ? (
                    <span className="text-[10px] text-muted-foreground">Not listed</span>
                  ) : (
                    <>
                      <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${v}%`,
                          backgroundColor: v >= 80 ? "hsl(160,70%,48%)" : v >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                        }} />
                      </div>
                      <span className={`font-mono text-[11px] w-10 text-right ${v >= 80 ? "text-sw-green" : v >= 50 ? "text-sw-amber" : "text-sw-red"}`}>{v}%</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 text-[10px] text-muted-foreground">
            <button onClick={() => onNavigate("availability")} className="text-primary hover:underline flex items-center gap-1">
              Deep dive into availability <ArrowRight size={10} />
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Share of Search" badge={`${platform} · 30D`} badgeColor="accent" delay={0}>
          <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-wide">Keyword → Your Brand vs Top Competitor</p>
          <div className="space-y-3">
            {currentSearchData.map((s) => (
              <div key={s.kw}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground">{s.kw}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{s.you}% / {s.comp}%</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden mb-0.5">
                  <div className={`h-full rounded-full ${s.status === "winning" ? "bg-sw-green" : s.you >= 25 ? "bg-sw-amber" : "bg-sw-red"}`} style={{ width: `${s.you}%` }} />
                </div>
                <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-sw-red/50" style={{ width: `${s.comp}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> EnergyMax</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-sw-red/50 rounded-full" /> {currentSearchData[0]?.compName || "Competitor"}</span>
          </div>
        </PanelCard>
      </motion.div>

      {/* City data for Q-commerce OR National summary */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        {!isNational ? (
          <PanelCard title={`City Performance — ${platform}`} badge="Q-Commerce" badgeColor="amber" className="col-span-2" delay={0}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground">
                  <th className="text-left py-2 font-normal">City</th>
                  <th className="text-right py-2 font-normal">Market Share</th>
                  <th className="text-right py-2 font-normal">Availability</th>
                  <th className="text-right py-2 font-normal">Price Index</th>
                  <th className="text-right py-2 font-normal">SoS</th>
                </tr>
              </thead>
              <tbody>
                {cityData.map((c, i) => (
                  <tr key={c.city} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground flex items-center gap-1.5"><MapPin size={11} className="text-muted-foreground" />{c.city}</td>
                    <td className={`py-2.5 text-right font-mono ${getShareColor(c.marketShare)}`}>{c.marketShare}%</td>
                    <td className={`py-2.5 text-right font-mono ${c.availability >= 70 ? "text-sw-green" : c.availability >= 50 ? "text-sw-amber" : "text-sw-red"}`}>{c.availability}%</td>
                    <td className={`py-2.5 text-right font-mono ${c.priceIndex <= 1 ? "text-sw-green" : "text-sw-red"}`}>{c.priceIndex.toFixed(2)}</td>
                    <td className={`py-2.5 text-right font-mono ${getShareColor(c.sos)}`}>{c.sos}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>
        ) : (
          <PanelCard title={`National Overview — ${platform}`} badge="Marketplace" badgeColor="accent" className="col-span-2" delay={0}>
            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
                <p className="text-xs text-muted-foreground mb-1">Avg Search Rank</p>
                <p className="font-mono text-2xl font-bold text-foreground">#4</p>
                <p className="text-[10px] text-sw-green mt-1">▲ 2 positions vs last wk</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
                <p className="text-xs text-muted-foreground mb-1">Buy Box Win Rate</p>
                <p className="font-mono text-2xl font-bold text-foreground">72%</p>
                <p className="text-[10px] text-sw-amber mt-1">▼ 3% vs last wk</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
                <p className="text-xs text-muted-foreground mb-1">Category Market Share</p>
                <p className="font-mono text-2xl font-bold text-foreground">18%</p>
                <p className="text-[10px] text-sw-green mt-1">▲ 1.2% MoM</p>
              </div>
            </div>
          </PanelCard>
        )}

        <PanelCard title="Content Health Scores" badge="4 need fix" badgeColor="amber" delay={0}>
          <div className="space-y-4">
            {contentSkus.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{s.name}</p>
                </div>
                <ProgressRing score={s.score} color={s.color} />
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Pricing snapshot */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Competitive Pricing — ${platform}`} badge="Live · auto-refresh" badgeColor="accent" delay={0}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">SKU</th>
                <th className="text-left py-2 font-normal">Your MRP</th>
                <th className="text-left py-2 font-normal">Comp. #1</th>
                <th className="text-left py-2 font-normal">Diff</th>
              </tr>
            </thead>
            <tbody>
              {pricingRows.map((r, i) => (
                <tr key={r.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground">{r.sku}</td>
                  <td className="py-2.5 font-mono text-foreground">{r.yours}</td>
                  <td className="py-2.5 font-mono text-muted-foreground">{r.comp}</td>
                  <td className="py-2.5">
                    <span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${
                      r.diffType === "green" ? "text-sw-green bg-sw-green-dim" : "text-sw-red bg-sw-red-dim"
                    }`}>{r.diff}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 text-[10px]">
            <button onClick={() => onNavigate("pricing")} className="text-primary hover:underline flex items-center gap-1">
              Deep dive into pricing <ArrowRight size={10} />
            </button>
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default ShelfView;
