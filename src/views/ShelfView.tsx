import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import AlertItem from "@/components/sw/AlertItem";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const heatmapData = {
  skus: ["Whey 1kg", "Whey 500g", "Creatine", "BCAA", "Pre-Workout", "Multi-Vit"],
  platforms: [
    { name: "Amazon", color: "#FF9900", values: [97, 100, 72, 95, 54, 98] },
    { name: "Flipkart", color: "#2F77FF", values: [74, 92, 61, 88, 12, 78] },
    { name: "Blinkit", color: "#FDDC2B", values: [55, 38, null, null, null, 71] },
    { name: "Zepto", color: "#833AB4", values: [93, 77, null, null, null, 52] },
    { name: "Instamart", color: "#FC8019", values: [34, 9, null, null, null, 41] },
    { name: "Myntra", color: "#E1306C", values: [null, null, null, null, null, 96] },
  ],
};

const getCellColor = (v: number | null) => {
  if (v === null) return "bg-surface-3";
  if (v >= 80) return "bg-[rgba(35,209,139,0.8)]";
  if (v >= 60) return "bg-[rgba(35,209,139,0.45)]";
  if (v >= 40) return "bg-[rgba(245,158,11,0.5)]";
  if (v >= 20) return "bg-[rgba(240,82,82,0.4)]";
  return "bg-[rgba(240,82,82,0.7)]";
};

const searchData = [
  { kw: "protein powder", you: 28, comp: 41, status: "losing" },
  { kw: "whey protein 1kg", you: 44, comp: 31, status: "winning" },
  { kw: "creatine monohydrate", you: 19, comp: 38, status: "losing" },
  { kw: "pre workout supplement", you: 33, comp: 29, status: "winning" },
  { kw: "bcaa amino acids", you: 21, comp: 44, status: "losing" },
];

const pinCodes = [
  { pin: "110001", val: 98 }, { pin: "110003", val: 95 }, { pin: "110016", val: 61 },
  { pin: "110017", val: 88 }, { pin: "110025", val: 12 }, { pin: "110044", val: 55 },
  { pin: "110048", val: 8 }, { pin: "110051", val: 92 }, { pin: "110062", val: 44 },
  { pin: "110065", val: 96 }, { pin: "110067", val: 67 }, { pin: "110070", val: 23 },
  { pin: "122001", val: 91 }, { pin: "122002", val: 87 }, { pin: "122011", val: 53 },
  { pin: "122015", val: 18 }, { pin: "122017", val: 94 }, { pin: "122022", val: 71 },
];

const getPinColor = (v: number) => {
  if (v >= 80) return "border-sw-green text-sw-green bg-sw-green-dim";
  if (v >= 40) return "border-sw-amber text-sw-amber bg-sw-amber-dim";
  return "border-sw-red text-sw-red bg-sw-red-dim";
};

const contentSkus = [
  { emoji: "🥛", name: "Whey Protein 1kg Chocolate", platforms: "Amazon · Flipkart · Blinkit", score: 80, color: "hsl(160,70%,48%)" },
  { emoji: "💊", name: "Creatine Monohydrate 250g", platforms: "Amazon · Flipkart", score: 50, color: "hsl(38,92%,50%)" },
  { emoji: "⚡", name: "Pre-Workout Citrus 300g", platforms: "Amazon only", score: 20, color: "hsl(0,76%,57%)" },
  { emoji: "🔤", name: "BCAA 2:1:1 Tropical 450g", platforms: "Amazon · Flipkart · Zepto", score: 70, color: "hsl(160,70%,48%)" },
];

const pricingRows = [
  { sku: "Whey 1kg Choc", yours: "₹2,499", comp: "₹2,699", diff: "-7.4%", diffType: "green" as const, action: "Hold Price" },
  { sku: "Creatine 250g", yours: "₹799", comp: "₹699", diff: "+14.3%", diffType: "red" as const, action: "Match Price" },
  { sku: "BCAA Tropical", yours: "₹1,299", comp: "₹1,349", diff: "-3.7%", diffType: "green" as const, action: "Hold Price" },
  { sku: "Pre-Workout 300g", yours: "₹1,899", comp: "₹1,599", diff: "+18.8%", diffType: "red" as const, action: "Adjust ↓" },
  { sku: "Multi-Vit 60ct", yours: "₹649", comp: "₹659", diff: "-1.5%", diffType: "grey" as const, action: "Hold Price" },
];

const searchPositions = [
  { platform: "Amazon", rank: 3, pos: 5, color: "hsl(160,70%,48%)" },
  { platform: "Flipkart", rank: 8, pos: 35, color: "hsl(38,92%,50%)" },
  { platform: "Blinkit", rank: 6, pos: 28, color: "hsl(38,92%,50%)" },
  { platform: "Zepto", rank: 14, pos: 70, color: "hsl(0,76%,57%)" },
  { platform: "Instamart", rank: 18, pos: 85, color: "hsl(0,76%,57%)" },
];

const ProgressRing = ({ score, color, size = 48 }: { score: number; color: string; size?: number }) => {
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
        className="font-mono text-xs fill-foreground" fontSize={12}>{score}</text>
    </svg>
  );
};

const ShelfView: React.FC = () => {
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});

  const handleAction = (idx: number) => {
    setActionStates((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="space-y-6 pb-20">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Shelf Health Score" value="76 / 100" delta="▼ 3.2 vs last wk" deltaType="negative" sub="Avg across 6 platforms · 48 SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Events (30d)" value="14" delta="▲ 4 vs last wk" deltaType="negative" sub="₹8.4L estimated revenue lost" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Share of Search" value="28%" delta="▲ 1.8% MoM" deltaType="positive" sub="Protein powder category · Amazon" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Content Score Avg" value="62%" delta="⚠ 11 SKUs need update" deltaType="warning" sub="Title + Images + A+ content" accentColor="bg-sw-amber" delay={0.15} />
      </div>

      {/* Row 1: Heatmap (2col) + Share of Search (1col) */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Availability Heatmap — Platform × SKU" badge="3 OOS now" badgeColor="red" className="col-span-2" delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 text-muted-foreground font-normal w-24"></th>
                  {heatmapData.skus.map((s) => (
                    <th key={s} className="text-center py-2 text-muted-foreground font-normal px-1">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.platforms.map((p) => (
                  <tr key={p.name}>
                    <td className="py-1.5 pr-2">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                        <span className="text-foreground">{p.name}</span>
                      </span>
                    </td>
                    {p.values.map((v, i) => (
                      <td key={i} className="py-1.5 px-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className={`${getCellColor(v)} rounded-lg text-center py-2 font-mono text-[11px] cursor-default transition-transform hover:scale-105 ${v === null ? 'text-muted-foreground' : 'text-foreground'}`}>
                              {v === null ? "—" : `${v}%`}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="bg-surface-3 text-foreground border-border-visible text-xs">
                            {p.name} · {v === null ? "Not listed" : `${v}%`} · Click to see pin-code breakdown
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PanelCard>

        <PanelCard title="Share of Search" badge="Amazon · 30D" badgeColor="accent" delay={0.25}>
          <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-wide">Keyword → Your Brand vs Top Competitor</p>
          <div className="space-y-4">
            {searchData.map((s) => (
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
          <div className="flex items-center gap-4 mt-4 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> Your brand</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-sw-red/50 rounded-full" /> Top competitor</span>
          </div>
        </PanelCard>
      </div>

      {/* Row 2: Pin Codes + Content Health */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Q-Commerce Pin Code Coverage" badge="Blinkit · Delhi NCR" badgeColor="amber" delay={0.3}>
          <div className="grid grid-cols-6 gap-2">
            {pinCodes.map((p) => (
              <Tooltip key={p.pin}>
                <TooltipTrigger asChild>
                  <div className={`border rounded-lg p-1.5 text-center cursor-default transition-transform hover:scale-110 ${getPinColor(p.val)}`}>
                    <p className="font-mono text-[8px] opacity-70">{p.pin}</p>
                    <p className="font-mono text-xs font-medium">{p.val}%</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-surface-3 text-foreground border-border-visible text-xs">
                  Pin {p.pin} · {p.val}% availability
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sw-green" /> 80–100%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sw-amber" /> 40–79%</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sw-red" /> &lt;40%</span>
          </div>
        </PanelCard>

        <PanelCard title="Content Health Scores" badge="11 need fix" badgeColor="amber" delay={0.35}>
          <div className="space-y-4">
            {contentSkus.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div className="w-9 h-9 bg-surface-3 rounded-lg flex items-center justify-center text-lg">{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground truncate">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground">{s.platforms}</p>
                </div>
                <ProgressRing score={s.score} color={s.color} />
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Search Position Tracker" badge="Whey Protein 1kg" badgeColor="purple" delay={0.4}>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground mb-3">
            <span>→ Position 1 (Best)</span>
            <span>Position 20+ (Poor) →</span>
          </div>
          <div className="space-y-3">
            {searchPositions.map((s) => (
              <div key={s.platform} className="flex items-center gap-2">
                <span className="font-mono text-[11px] text-muted-foreground w-[60px] flex-shrink-0">{s.platform}</span>
                <div className="flex-1 h-6 bg-surface-3 rounded relative">
                  <div className="absolute left-0 top-0 bottom-0 w-[20%] bg-sw-green/10 rounded-l" />
                  <div
                    className="absolute top-0.5 bottom-0.5 w-7 rounded flex items-center justify-center font-mono text-[10px] text-foreground font-medium"
                    style={{ left: `${s.pos}%`, backgroundColor: s.color, transform: "translateX(-50%)" }}
                  >
                    #{s.rank}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground w-6 text-right">#{s.rank}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Row 3: Pricing (2col) + Live Feed (1col) */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Competitive Pricing Intelligence" badge="Live · auto-refresh 5m" badgeColor="accent" className="col-span-2" delay={0.45}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">SKU</th>
                <th className="text-left py-2 font-normal">Your MRP</th>
                <th className="text-left py-2 font-normal">Comp. #1</th>
                <th className="text-left py-2 font-normal">Diff</th>
                <th className="text-right py-2 font-normal">Action</th>
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
                      r.diffType === "green" ? "text-sw-green bg-sw-green-dim" :
                      r.diffType === "red" ? "text-sw-red bg-sw-red-dim" :
                      "text-muted-foreground bg-surface-3"
                    }`}>{r.diff}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => handleAction(i)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        actionStates[i]
                          ? "bg-sw-green-dim text-sw-green"
                          : r.diffType === "red"
                          ? "border border-sw-red/30 text-sw-red hover:bg-sw-red-dim"
                          : "border border-subtle text-muted-foreground hover:bg-surface-3"
                      }`}
                    >
                      {actionStates[i] ? "✓ Applied" : r.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>

        <PanelCard title="Live Intelligence Feed" badge="4 need action" badgeColor="red" delay={0.5}>
          <div className="space-y-3">
            <AlertItem severity="critical" icon="🚨" title="OOS on Instamart" detail="Whey 500g went out of stock in 6 Mumbai pin codes. Est. loss: ₹1.2L/day." meta="2m ago · Instamart" action="Alert Team" actionDone="✓ Team Notified" />
            <AlertItem severity="warning" icon="⚠️" title="Competitor price drop" detail="MuscleBlaze cut Creatine price by ₹100 on Amazon. 14% above market." meta="18m ago · Amazon" action="Review" actionDone="✓ Reviewed" />
            <AlertItem severity="success" icon="📈" title="Search rank improved" detail="'Whey Protein 1kg' moved from #7 to #3 on Amazon after content update." meta="1h ago · Amazon" action="View" />
            <AlertItem severity="info" icon="💡" title="Pre-Workout trending" detail="+47% search volume spike in 'pre workout' on Blinkit. Stock at 12%." meta="3h ago · Blinkit" action="Top-up →" />
          </div>
        </PanelCard>
      </div>
    </div>
  );
};

export default ShelfView;
