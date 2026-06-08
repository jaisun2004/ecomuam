import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import AlertItem from "@/components/sw/AlertItem";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DateRangeSubtitle from "@/components/DateRangeSubtitle";
import { Megaphone, ChevronDown, ChevronRight, MapPin, TrendingUp, TrendingDown, Shield, Swords, Eye, X } from "lucide-react";

/* ── mock data ── */
const heatmapData = {
  skus: ["Parle-G 250g", "Marie Gold 120g", "Bourbon 250g", "Britannia Marie 250g", "Hide & Seek 120g", "Sunfeast 150g"],
  platforms: [
    { name: "Instamart", color: "#FF9900", values: [97, 100, 72, 95, 54, 98] },
    { name: "Instamart", color: "#2F77FF", values: [74, 92, 61, 88, 12, 78] },
    { name: "Blinkit", color: "#FDDC2B", values: [55, 38, null, null, null, 71] },
    { name: "Zepto", color: "#833AB4", values: [93, 77, null, null, null, 52] },
    { name: "Blinkit", color: "#FC8019", values: [34, 9, null, null, null, 41] },
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

const platformsList = [
  { name: "Instamart", color: "#FF9900" },
  { name: "Instamart", color: "#2F77FF" },
  { name: "Blinkit", color: "#FDDC2B" },
  { name: "Zepto", color: "#833AB4" },
  { name: "Blinkit", color: "#FC8019" },
];

const searchDataByPlatform: Record<string, { kw: string; you: number; comp: number; compName: string; status: string; poaching?: boolean }[]> = {
  Instamart: [
    { kw: "butter biscuits", you: 28, comp: 41, compName: "Britannia", status: "losing" },
    { kw: "cream biscuits", you: 44, comp: 31, compName: "Britannia", status: "winning" },
    { kw: "glucose biscuits", you: 19, comp: 38, compName: "Britannia", status: "losing", poaching: true },
    { kw: "digestive biscuits", you: 33, comp: 29, compName: "Patanjali", status: "winning" },
    { kw: "kids biscuits", you: 21, comp: 44, compName: "Britannia", status: "losing", poaching: true },
  ],
  Blinkit: [
    { kw: "butter biscuits", you: 35, comp: 30, compName: "Britannia", status: "winning" },
    { kw: "cream biscuits", you: 41, comp: 22, compName: "Britannia", status: "winning" },
    { kw: "glucose biscuits", you: 8, comp: 51, compName: "Britannia", status: "losing", poaching: true },
    { kw: "digestive biscuits", you: 44, comp: 18, compName: "Patanjali", status: "winning" },
    { kw: "kids biscuits", you: 12, comp: 55, compName: "Britannia", status: "losing", poaching: true },
  ],
  Zepto: [
    { kw: "butter biscuits", you: 31, comp: 33, compName: "Britannia", status: "losing" },
    { kw: "cream biscuits", you: 39, comp: 28, compName: "Britannia", status: "winning" },
    { kw: "glucose biscuits", you: 22, comp: 35, compName: "Britannia", status: "losing" },
    { kw: "digestive biscuits", you: 27, comp: 40, compName: "Patanjali", status: "losing", poaching: true },
    { kw: "kids biscuits", you: 18, comp: 47, compName: "Britannia", status: "losing" },
  ],
};

/* Pincode data grouped by region with market share as main metric */
const regionPincodes: Record<string, { pin: string; marketShare: number; availability: number; priceIndex: number; sos: number; city: string }[]> = {
  "Mumbai": [
    { pin: "110001", marketShare: 42, availability: 98, priceIndex: 0.93, sos: 34, city: "New Mumbai" },
    { pin: "110003", marketShare: 38, availability: 95, priceIndex: 0.91, sos: 28, city: "New Mumbai" },
    { pin: "110016", marketShare: 22, availability: 61, priceIndex: 1.02, sos: 18, city: "South Mumbai" },
    { pin: "110017", marketShare: 35, availability: 88, priceIndex: 0.95, sos: 30, city: "South Mumbai" },
    { pin: "110025", marketShare: 8, availability: 12, priceIndex: 1.14, sos: 5, city: "East Mumbai" },
    { pin: "110044", marketShare: 19, availability: 55, priceIndex: 1.05, sos: 14, city: "West Mumbai" },
    { pin: "110048", marketShare: 5, availability: 8, priceIndex: 1.18, sos: 3, city: "South Mumbai" },
    { pin: "110051", marketShare: 37, availability: 92, priceIndex: 0.92, sos: 31, city: "North Mumbai" },
    { pin: "110062", marketShare: 16, availability: 44, priceIndex: 1.08, sos: 11, city: "West Mumbai" },
    { pin: "110065", marketShare: 40, availability: 96, priceIndex: 0.90, sos: 33, city: "South Mumbai" },
    { pin: "110067", marketShare: 24, availability: 67, priceIndex: 0.99, sos: 20, city: "West Mumbai" },
    { pin: "110070", marketShare: 10, availability: 23, priceIndex: 1.12, sos: 7, city: "South Mumbai" },
    { pin: "122001", marketShare: 36, availability: 91, priceIndex: 0.94, sos: 29, city: "Gurgaon" },
    { pin: "122002", marketShare: 33, availability: 87, priceIndex: 0.96, sos: 27, city: "Gurgaon" },
    { pin: "122011", marketShare: 18, availability: 53, priceIndex: 1.06, sos: 13, city: "Gurgaon" },
    { pin: "122015", marketShare: 7, availability: 18, priceIndex: 1.15, sos: 4, city: "Gurgaon" },
    { pin: "122017", marketShare: 38, availability: 94, priceIndex: 0.91, sos: 32, city: "Gurgaon" },
    { pin: "122022", marketShare: 26, availability: 71, priceIndex: 0.98, sos: 22, city: "Gurgaon" },
  ],
  "Delhi NCR": [
    { pin: "400001", marketShare: 44, availability: 96, priceIndex: 0.90, sos: 36, city: "South Delhi NCR" },
    { pin: "400050", marketShare: 38, availability: 88, priceIndex: 0.94, sos: 30, city: "Khalifa City" },
    { pin: "400070", marketShare: 21, availability: 52, priceIndex: 1.04, sos: 16, city: "Kurla" },
    { pin: "400076", marketShare: 12, availability: 34, priceIndex: 1.10, sos: 8, city: "Al Nahda" },
    { pin: "400092", marketShare: 31, availability: 78, priceIndex: 0.97, sos: 25, city: "Borivali" },
    { pin: "400607", marketShare: 28, availability: 72, priceIndex: 0.99, sos: 22, city: "Navi Delhi NCR" },
  ],
  "Riyadh": [
    { pin: "560001", marketShare: 46, availability: 97, priceIndex: 0.89, sos: 38, city: "MG Road" },
    { pin: "560034", marketShare: 40, availability: 91, priceIndex: 0.92, sos: 33, city: "Olaya" },
    { pin: "560066", marketShare: 25, availability: 64, priceIndex: 1.03, sos: 19, city: "Al Hamra" },
    { pin: "560095", marketShare: 18, availability: 48, priceIndex: 1.07, sos: 12, city: "Electronic City" },
    { pin: "560103", marketShare: 33, availability: 82, priceIndex: 0.95, sos: 27, city: "Al Malqa" },
  ],
};

const getShareColor = (v: number) => {
  if (v >= 35) return "border-sw-green text-sw-green bg-sw-green-dim";
  if (v >= 20) return "border-sw-amber text-sw-amber bg-sw-amber-dim";
  return "border-sw-red text-sw-red bg-sw-red-dim";
};

const contentSkus = [
  { emoji: "🍪", name: "Parle-G 120g", platforms: "Instamart · Instamart · Blinkit", score: 80, color: "hsl(160,70%,48%)" },
  { emoji: "🍘", name: "Hide & Seek Choco 120g", platforms: "Instamart · Instamart", score: 50, color: "hsl(38,92%,50%)" },
  { emoji: "🥛", name: "Sunfeast 150g", platforms: "Instamart only", score: 20, color: "hsl(0,76%,57%)" },
  { emoji: "🍫", name: "Bourbon 250g", platforms: "Instamart · Instamart · Zepto", score: 70, color: "hsl(160,70%,48%)" },
];

const pricingRows = [
  { sku: "Parle-G 120g", yours: "₹ 40", comp: "₹ 45", diff: "-11.1%", diffType: "green" as const, action: "Hold Price" },
  { sku: "Marie Gold 250g", yours: "₹ 35", comp: "₹ 30", diff: "+16.7%", diffType: "red" as const, action: "Match Price" },
  { sku: "Bourbon 120g", yours: "₹ 30", comp: "₹ 32", diff: "-6.3%", diffType: "green" as const, action: "Hold Price" },
  { sku: "Britannia Marie 250g", yours: "₹ 45", comp: "₹ 38", diff: "+18.4%", diffType: "red" as const, action: "Adjust ↓" },
  { sku: "Sunfeast 150g", yours: "₹ 25", comp: "₹ 25", diff: "0%", diffType: "grey" as const, action: "Hold Price" },
];

const searchPositions = [
  { platform: "Instamart", rank: 3, pos: 5, color: "hsl(160,70%,48%)" },
  { platform: "Instamart", rank: 8, pos: 35, color: "hsl(38,92%,50%)" },
  { platform: "Blinkit", rank: 6, pos: 28, color: "hsl(38,92%,50%)" },
  { platform: "Zepto", rank: 14, pos: 70, color: "hsl(0,76%,57%)" },
  { platform: "Blinkit", rank: 18, pos: 85, color: "hsl(0,76%,57%)" },
];

/* SoS retailer-level issues */
const sosRetailerIssues = [
  { platform: "Instamart", issue: "SoS dropped 12% WoW", type: "drop", kw: "butter biscuits", detail: "Competitor bid aggression detected — Britannia increased bids by 2.4x on 3 top keywords" },
  { platform: "Blinkit", issue: "0% SoS on 3 keywords", type: "missing", kw: "cream biscuits, glucose biscuits, kids biscuits", detail: "No active sponsored listings. Competitors capturing 100% of search traffic" },
  { platform: "Zepto", issue: "Poaching on digestive biscuits", type: "poaching", kw: "digestive biscuits", detail: "Patanjali bidding on your brand keyword. Capturing 40% of branded searches" },
];

const competitorAggression = [
  { competitor: "Britannia", platform: "Instamart", action: "Bid increase 2.4x", keywords: 5, impact: "SoS drop -8%", severity: "high" },
  { competitor: "Patanjali", platform: "Zepto", action: "Brand keyword poaching", keywords: 3, impact: "SoS drop -12%", severity: "high" },
  { competitor: "Britannia", platform: "Instamart", action: "New sponsored listings", keywords: 4, impact: "SoS drop -5%", severity: "medium" },
  { competitor: "Rauch", platform: "Blinkit", action: "Category ad blitz", keywords: 8, impact: "SoS drop -3%", severity: "low" },
];

const poachingKeywords = [
  { keyword: "britannia good day", poacher: "Britannia", platform: "Instamart", yourSoS: 62, theirSoS: 28, trend: "rising" },
  { keyword: "britannia bourbon", poacher: "Britannia", platform: "Instamart", yourSoS: 45, theirSoS: 38, trend: "rising" },
  { keyword: "britannia marie gold", poacher: "Britannia", platform: "Zepto", yourSoS: 55, theirSoS: 31, trend: "stable" },
  { keyword: "britannia nutrichoice", poacher: "Patanjali", platform: "Instamart", yourSoS: 71, theirSoS: 18, trend: "declining" },
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

/* Simple India Map SVG with region markers */
const IndiaMapView: React.FC<{
  regions: Record<string, { pin: string; marketShare: number }[]>;
  selectedRegion: string;
  onSelectRegion: (r: string) => void;
}> = ({ regions, selectedRegion, onSelectRegion }) => {
  const regionPositions: Record<string, { x: number; y: number }> = {
    "Mumbai": { x: 150, y: 95 },
    "Delhi NCR": { x: 105, y: 195 },
    "Riyadh": { x: 140, y: 280 },
  };

  const getRegionAvg = (r: string) => {
    const pins = regions[r];
    if (!pins?.length) return 0;
    return Math.round(pins.reduce((s, p) => s + p.marketShare, 0) / pins.length);
  };

  return (
    <svg viewBox="0 0 300 360" className="w-full h-full max-h-[280px]">
      {/* Simplified India outline */}
      <path
        d="M150,15 C165,12 180,18 192,25 C205,32 218,28 228,35 C238,42 245,55 248,68 C251,81 255,90 252,105 C249,120 255,130 258,145 C261,160 265,175 260,190 C255,205 250,215 245,228 C240,241 232,250 225,260 C218,270 212,278 205,288 C198,298 190,305 182,312 C174,319 168,325 160,330 C152,335 148,338 142,335 C136,332 130,325 125,318 C120,311 115,305 112,295 C109,285 105,278 100,268 C95,258 88,248 82,238 C76,228 72,218 68,208 C64,198 60,188 58,178 C56,168 55,158 56,148 C57,138 58,128 62,118 C66,108 72,98 78,88 C84,78 92,68 100,58 C108,48 118,38 128,28 C138,18 145,18 150,15Z"
        fill="hsl(var(--surface-2))"
        stroke="hsl(var(--border-visible))"
        strokeWidth="1"
        className="opacity-80"
      />
      {/* Kashmir region */}
      <path d="M135,15 C140,8 155,5 165,10 C175,15 185,12 190,18 C195,24 188,30 180,28 C172,26 160,30 150,25 C140,20 132,18 135,15Z"
        fill="hsl(var(--surface-3))" stroke="hsl(var(--border-visible))" strokeWidth="0.5" />
      
      {/* Region markers */}
      {Object.entries(regionPositions).map(([name, pos]) => {
        const avg = getRegionAvg(name);
        const isSelected = selectedRegion === name;
        const fillColor = avg >= 30 ? "hsl(var(--sw-green))" : avg >= 20 ? "hsl(var(--sw-amber))" : "hsl(var(--sw-red))";
        return (
          <g key={name} onClick={() => onSelectRegion(name)} className="cursor-pointer">
            {/* Pulse ring */}
            {isSelected && (
              <circle cx={pos.x} cy={pos.y} r={24} fill="none" stroke={fillColor} strokeWidth="1" opacity="0.4">
                <animate attributeName="r" from="18" to="28" dur="1.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.5" to="0" dur="1.5s" repeatCount="indefinite" />
              </circle>
            )}
            <circle cx={pos.x} cy={pos.y} r={isSelected ? 18 : 14} fill={fillColor} opacity={isSelected ? 0.3 : 0.15} />
            <circle cx={pos.x} cy={pos.y} r={isSelected ? 12 : 9} fill={fillColor} opacity={0.6} />
            <text x={pos.x} y={pos.y + 1} textAnchor="middle" dominantBaseline="central"
              className="font-mono font-bold fill-foreground" fontSize={isSelected ? 10 : 8}>{avg}%</text>
            <text x={pos.x} y={pos.y + (isSelected ? 28 : 22)} textAnchor="middle"
              className="fill-foreground font-body" fontSize={isSelected ? 9 : 7} fontWeight={isSelected ? 600 : 400}>{name}</text>
          </g>
        );
      })}
    </svg>
  );
};

const ShelfView: React.FC = () => {
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [sosPlatform, setSosPlatform] = useState("Instamart");
  const [campaignTriggered, setCampaignTriggered] = useState<Record<string, boolean>>({});
  const [selectedRegion, setSelectedRegion] = useState("Mumbai");
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [aggressionCampaigns, setAggressionCampaigns] = useState<Record<number, boolean>>({});
  const [poachingCampaigns, setPoachingCampaigns] = useState<Record<number, boolean>>({});

  const handleAction = (idx: number) => setActionStates((prev) => ({ ...prev, [idx]: true }));
  const triggerCampaign = (key: string) => setCampaignTriggered((p) => ({ ...p, [key]: true }));

  const currentSearchData = searchDataByPlatform[sosPlatform] || searchDataByPlatform.Instamart;
  const currentPins = regionPincodes[selectedRegion] || [];
  const selectedPinData = selectedPin ? currentPins.find(p => p.pin === selectedPin) : null;

  return (
    <div className="space-y-6 pb-20">
      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Shelf Health Score" value="76 / 100" delta="▼ 3.2 vs last wk" deltaType="negative" sub="Avg across 6 platforms · 48 SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Products Today" value="6" delta="▲ 2 vs yesterday" deltaType="negative" sub="Across all platforms" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Share of Search" value="28%" delta="▲ 1.8% MoM" deltaType="positive" sub="Biscuits category · Instamart" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Content Score Avg" value="62%" delta="⚠ 11 SKUs need update" deltaType="warning" sub="Title + Images + A+ content" accentColor="bg-sw-amber" delay={0.15} />
      </div>

      {/* ── LIVE INTELLIGENCE FEED (pushed to top) ── */}
      <PanelCard title="Live Intelligence Feed" badge="4 need action" badgeColor="red" delay={0.18}>
        <div className="grid grid-cols-2 gap-3">
          <AlertItem severity="critical" icon="🚨" title="OOS on Blinkit" detail="Marie Gold 250g went out of stock in 6 Delhi NCR pin codes." meta="2m ago · Blinkit" action="Alert Team" actionDone="✓ Team Notified" />
          <AlertItem severity="warning" icon="⚠️" title="Competitor price drop" detail="Britannia cut Dark Fantasy price by ₹ 5 on Instamart. 14% above market." meta="18m ago · Instamart" action="Review" actionDone="✓ Reviewed" />
          <AlertItem severity="success" icon="📈" title="Search rank improved" detail="'Parle-G 120g' moved from #7 to #3 on Instamart after content update." meta="1h ago · Instamart" action="View" />
          <AlertItem severity="info" icon="💡" title="Cream biscuits trending" detail="+47% search volume spike in 'cream biscuits' on Blinkit. Stock at 12%." meta="3h ago · Blinkit" action="Top-up →" />
        </div>
      </PanelCard>

      {/* Row 1: Heatmap (2col) + Share of Search with platform switcher + campaign triggers */}
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

        {/* Share of Search with platform switcher + campaign triggers */}
        <PanelCard title="Share of Search" badge={`${sosPlatform} · 30D`} badgeColor="accent" delay={0.25}>
          {/* Platform switcher */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-muted-foreground">Platform</span>
            <Select value={sosPlatform} onValueChange={setSosPlatform}>
              <SelectTrigger className="w-[160px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {platformsList.map(p => (
                  <SelectItem key={p.name} value={p.name}>
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />{p.name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <p className="text-[10px] text-muted-foreground mb-3 uppercase tracking-wide">Keyword → Your Brand vs Top Competitor</p>
          <div className="space-y-3">
            {currentSearchData.map((s) => (
              <div key={s.kw}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground flex items-center gap-1">
                    {s.kw}
                    {s.poaching && <Swords size={10} className="text-sw-red" />}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{s.you}% / {s.comp}%</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden mb-0.5">
                  <div className={`h-full rounded-full ${s.status === "winning" ? "bg-sw-green" : s.you >= 25 ? "bg-sw-amber" : "bg-sw-red"}`} style={{ width: `${s.you}%` }} />
                </div>
                <div className="h-1 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-sw-red/50" style={{ width: `${s.comp}%` }} />
                </div>
                {s.status === "losing" && (
                  <button
                    onClick={() => triggerCampaign(`sos-${sosPlatform}-${s.kw}`)}
                    className={`mt-1 flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                      campaignTriggered[`sos-${sosPlatform}-${s.kw}`]
                        ? "bg-sw-green-dim text-sw-green"
                        : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}>
                    <Megaphone size={9} />
                    {campaignTriggered[`sos-${sosPlatform}-${s.kw}`] ? "✓ Campaign Created" : `Boost "${s.kw}"`}
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> Your brand</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1 bg-sw-red/50 rounded-full" /> {currentSearchData[0]?.compName || "Competitor"}</span>
          </div>
        </PanelCard>
      </div>

      {/* Row 2: Map-based Pin Code Coverage + Content Health + Search Position */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Market Share — Pin Code Coverage" badge={`Q-Commerce · ${selectedRegion}`} badgeColor="amber" delay={0.3}>
          <div className="flex gap-3">
            {/* India Map */}
            <div className="w-1/2">
              <IndiaMapView
                regions={regionPincodes}
                selectedRegion={selectedRegion}
                onSelectRegion={setSelectedRegion}
              />
            </div>
            {/* Pincode grid for selected region */}
            <div className="w-1/2 space-y-2">
              <p className="text-[10px] text-muted-foreground font-mono uppercase">{selectedRegion} — {currentPins.length} pincodes</p>
              <div className="grid grid-cols-3 gap-1.5 max-h-[200px] overflow-y-auto pr-1">
                {currentPins.map((p) => (
                  <Tooltip key={p.pin}>
                    <TooltipTrigger asChild>
                      <div
                        onClick={() => setSelectedPin(selectedPin === p.pin ? null : p.pin)}
                        className={`border rounded-lg p-1 text-center cursor-pointer transition-all hover:scale-105 ${getShareColor(p.marketShare)} ${
                          selectedPin === p.pin ? "ring-1 ring-primary" : ""
                        }`}>
                        <p className="font-mono text-[7px] opacity-70">{p.pin}</p>
                        <p className="font-mono text-[10px] font-bold">{p.marketShare}%</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-surface-3 text-foreground border-border-visible text-xs">
                      {p.city} · Market Share: {p.marketShare}%
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
              {/* Selected pincode KPIs */}
              {selectedPinData && (
                <div className="bg-surface-2 rounded-xl border border-subtle p-2.5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] text-foreground font-semibold flex items-center gap-1">
                      <MapPin size={10} /> {selectedPinData.pin}
                    </span>
                    <span className="text-[9px] text-muted-foreground">{selectedPinData.city}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[9px]">
                    <div className="bg-surface-3 rounded-lg p-1.5">
                      <span className="text-muted-foreground">Market Share</span>
                      <p className="font-mono text-foreground font-bold">{selectedPinData.marketShare}%</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-1.5">
                      <span className="text-muted-foreground">Availability</span>
                      <p className="font-mono text-foreground font-bold">{selectedPinData.availability}%</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-1.5">
                      <span className="text-muted-foreground">Price Index</span>
                      <p className={`font-mono font-bold ${selectedPinData.priceIndex <= 1 ? "text-sw-green" : "text-sw-red"}`}>{selectedPinData.priceIndex.toFixed(2)}</p>
                    </div>
                    <div className="bg-surface-3 rounded-lg p-1.5">
                      <span className="text-muted-foreground">SoS</span>
                      <p className="font-mono text-foreground font-bold">{selectedPinData.sos}%</p>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 text-[9px] text-muted-foreground">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sw-green" /> ≥35%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sw-amber" /> 20–34%</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sw-red" /> &lt;20%</span>
              </div>
            </div>
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

        <PanelCard title="Search Position Tracker" badge="Cream Biscuits 200g" badgeColor="purple" delay={0.4}>
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
                  <div className="absolute top-0.5 bottom-0.5 w-7 rounded flex items-center justify-center font-mono text-[10px] text-foreground font-medium"
                    style={{ left: `${s.pos}%`, backgroundColor: s.color, transform: "translateX(-50%)" }}>
                    #{s.rank}
                  </div>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground w-6 text-right">#{s.rank}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Row 3: SoS Deep Analytics */}
      <div className="grid grid-cols-3 gap-4">
        {/* Retailer-Level SoS Issues */}
        <PanelCard title="SoS — Retailer Issues" badge="3 issues" badgeColor="red" delay={0.42}>
          <div className="space-y-2.5">
            {sosRetailerIssues.map((issue, i) => (
              <div key={i} className={`bg-surface-2 rounded-xl border p-3 ${
                issue.type === "drop" ? "border-sw-red/20" : issue.type === "poaching" ? "border-sw-purple/20" : "border-sw-amber/20"
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformsList.find(p => p.name === issue.platform)?.color }} />
                  <span className="text-xs text-foreground font-medium">{issue.platform}</span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                    issue.type === "drop" ? "bg-sw-red-dim text-sw-red" : issue.type === "poaching" ? "bg-sw-purple-dim text-sw-purple" : "bg-sw-amber-dim text-sw-amber"
                  }`}>{issue.type === "drop" ? "SOS DROP" : issue.type === "poaching" ? "POACHING" : "MISSING"}</span>
                </div>
                <p className="text-[11px] text-foreground">{issue.issue}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{issue.detail}</p>
                <button
                  onClick={() => triggerCampaign(`retailer-${i}`)}
                  className={`mt-2 flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    campaignTriggered[`retailer-${i}`] ? "bg-sw-green-dim text-sw-green" : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}>
                  <Megaphone size={10} />
                  {campaignTriggered[`retailer-${i}`] ? "✓ Campaign Created" : "Launch Counter Campaign"}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>

        {/* Competition Aggression Monitor */}
        <PanelCard title="Competition Aggression" badge="4 detected" badgeColor="red" delay={0.44}>
          <div className="space-y-2">
            {competitorAggression.map((a, i) => (
              <div key={i} className="bg-surface-2 rounded-xl border border-subtle p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground font-medium flex items-center gap-1.5">
                    <Swords size={11} className={a.severity === "high" ? "text-sw-red" : a.severity === "medium" ? "text-sw-amber" : "text-muted-foreground"} />
                    {a.competitor}
                  </span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                    a.severity === "high" ? "bg-sw-red-dim text-sw-red" : a.severity === "medium" ? "bg-sw-amber-dim text-sw-amber" : "bg-surface-3 text-muted-foreground"
                  }`}>{a.severity.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platformsList.find(p => p.name === a.platform)?.color }} />
                  {a.platform} · {a.action}
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[10px] text-muted-foreground">{a.keywords} keywords · {a.impact}</span>
                  <button
                    onClick={() => setAggressionCampaigns(p => ({ ...p, [i]: true }))}
                    className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                      aggressionCampaigns[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-red-dim text-sw-red hover:bg-sw-red/20"
                    }`}>
                    <Shield size={9} />
                    {aggressionCampaigns[i] ? "✓ Defended" : "Defend"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        {/* Brand Keyword Poaching */}
        <PanelCard title="Brand Keyword Poaching" badge="4 keywords" badgeColor="purple" delay={0.46}>
          <p className="text-[10px] text-muted-foreground mb-3">Competitors bidding on your brand keywords</p>
          <div className="space-y-2.5">
            {poachingKeywords.map((pk, i) => (
              <div key={i} className="bg-surface-2 rounded-xl border border-subtle p-3">
                <p className="font-mono text-[11px] text-foreground mb-1">"{pk.keyword}"</p>
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground mb-1.5">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platformsList.find(p => p.name === pk.platform)?.color }} />
                  {pk.platform} · Poacher: <span className="text-sw-red">{pk.poacher}</span>
                  {pk.trend === "rising" && <TrendingUp size={10} className="text-sw-red" />}
                  {pk.trend === "declining" && <TrendingDown size={10} className="text-sw-green" />}
                </div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-[9px] mb-0.5">
                      <span className="text-primary">You {pk.yourSoS}%</span>
                      <span className="text-sw-red">{pk.poacher} {pk.theirSoS}%</span>
                    </div>
                    <div className="h-1.5 bg-surface-3 rounded-full overflow-hidden flex">
                      <div className="h-full bg-primary rounded-l-full" style={{ width: `${pk.yourSoS}%` }} />
                      <div className="h-full bg-sw-red/60 rounded-r-full" style={{ width: `${pk.theirSoS}%` }} />
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setPoachingCampaigns(p => ({ ...p, [i]: true }))}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-medium transition-all ${
                    poachingCampaigns[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple-dim text-sw-purple hover:bg-sw-purple/20"
                  }`}>
                  <Megaphone size={9} />
                  {poachingCampaigns[i] ? "✓ Brand Defense Live" : "Launch Brand Defense"}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Row 4: Pricing (2col) */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Competitive Pricing Intelligence" badge="Live · auto-refresh 5m" badgeColor="accent" className="col-span-2" delay={0.5}>
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
                    <button onClick={() => handleAction(i)}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                        actionStates[i] ? "bg-sw-green-dim text-sw-green"
                        : r.diffType === "red" ? "border border-sw-red/30 text-sw-red hover:bg-sw-red-dim"
                        : "border border-subtle text-muted-foreground hover:bg-surface-3"
                      }`}>
                      {actionStates[i] ? "✓ Applied" : r.action}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </PanelCard>

        <PanelCard title="Content Health Breakdown" badge="By Platform" badgeColor="accent" delay={0.52}>
          <div className="space-y-3">
            {platformsList.slice(0, 4).map(p => {
              const score = p.name === "Instamart" ? 72 : p.name === "Instamart" ? 58 : p.name === "Blinkit" ? 45 : 38;
              const color = score >= 70 ? "hsl(160,70%,48%)" : score >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)";
              return (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                  <span className="text-xs text-foreground w-20">{p.name}</span>
                  <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${score}%`, backgroundColor: color }} />
                  </div>
                  <span className="font-mono text-[11px] text-foreground w-8 text-right">{score}%</span>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </div>
    </div>
  );
};

export default ShelfView;
