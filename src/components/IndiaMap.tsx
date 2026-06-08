import { useState } from "react";

interface RegionData {
  id: string;
  name: string;
  path: string;
  marketShare: number;
  availability: number;
  pricing: number;
  sos: number;
  competitionPoaching: number;
}

const regions: RegionData[] = [
  { id: "mh", name: "Maharashtra", path: "M155,280 L175,260 L200,265 L210,285 L195,310 L170,305 Z", marketShare: 82, availability: 94, pricing: 88, sos: 42, competitionPoaching: 15 },
  { id: "dl", name: "Mumbai", path: "M185,145 L200,135 L215,142 L212,158 L195,160 Z", marketShare: 75, availability: 91, pricing: 82, sos: 38, competitionPoaching: 22 },
  { id: "ka", name: "Karnataka", path: "M170,330 L195,320 L210,335 L200,360 L175,355 Z", marketShare: 68, availability: 88, pricing: 90, sos: 35, competitionPoaching: 18 },
  { id: "tn", name: "Tamil Nadu", path: "M195,360 L215,350 L230,365 L225,395 L200,390 Z", marketShare: 58, availability: 85, pricing: 78, sos: 30, competitionPoaching: 25 },
  { id: "gj", name: "Gujarat", path: "M120,220 L150,210 L160,230 L150,260 L125,255 Z", marketShare: 72, availability: 92, pricing: 85, sos: 40, competitionPoaching: 12 },
  { id: "rj", name: "Rajasthan", path: "M130,150 L175,140 L185,175 L170,210 L130,200 Z", marketShare: 45, availability: 78, pricing: 70, sos: 22, competitionPoaching: 30 },
  { id: "up", name: "Uttar Pradesh", path: "M195,155 L240,145 L260,170 L250,200 L205,195 Z", marketShare: 55, availability: 82, pricing: 75, sos: 28, competitionPoaching: 28 },
  { id: "wb", name: "West Bengal", path: "M270,210 L290,200 L298,225 L290,260 L272,250 Z", marketShare: 40, availability: 76, pricing: 72, sos: 20, competitionPoaching: 35 },
  { id: "mp", name: "Madhya Pradesh", path: "M165,215 L210,200 L240,215 L230,245 L175,250 Z", marketShare: 38, availability: 74, pricing: 68, sos: 18, competitionPoaching: 32 },
  { id: "ap", name: "Andhra Pradesh", path: "M200,310 L235,295 L255,315 L240,345 L210,340 Z", marketShare: 52, availability: 80, pricing: 82, sos: 32, competitionPoaching: 20 },
  { id: "kl", name: "Kerala", path: "M185,380 L198,370 L205,395 L195,415 L182,405 Z", marketShare: 62, availability: 90, pricing: 86, sos: 36, competitionPoaching: 14 },
  { id: "pb", name: "Punjab", path: "M165,110 L185,100 L195,115 L188,135 L170,132 Z", marketShare: 48, availability: 80, pricing: 74, sos: 24, competitionPoaching: 26 },
  { id: "hr", name: "Haryana", path: "M175,132 L195,125 L200,140 L192,155 L178,150 Z", marketShare: 50, availability: 83, pricing: 76, sos: 26, competitionPoaching: 24 },
  { id: "od", name: "Odisha", path: "M255,260 L278,250 L290,270 L280,295 L258,290 Z", marketShare: 35, availability: 70, pricing: 65, sos: 15, competitionPoaching: 38 },
  { id: "ts", name: "Telangana", path: "M200,290 L230,280 L245,295 L235,310 L205,305 Z", marketShare: 60, availability: 86, pricing: 84, sos: 34, competitionPoaching: 16 },
];

const getShareColor = (share: number): string => {
  if (share >= 75) return "hsl(142, 71%, 45%)";
  if (share >= 60) return "hsl(142, 71%, 55%)";
  if (share >= 50) return "hsl(38, 92%, 50%)";
  if (share >= 40) return "hsl(25, 95%, 53%)";
  return "hsl(0, 72%, 51%)";
};

const IndiaMap = () => {
  const [hoveredRegion, setHoveredRegion] = useState<RegionData | null>(null);

  return (
    <div className="rounded-xl border bg-card shadow-card p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="font-heading font-semibold text-foreground">India Market Share Map</h3>
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ background: "hsl(0, 72%, 51%)" }}></div> &lt;40%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ background: "hsl(25, 95%, 53%)" }}></div> 40-50%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ background: "hsl(38, 92%, 50%)" }}></div> 50-60%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ background: "hsl(142, 71%, 55%)" }}></div> 60-75%</div>
          <div className="flex items-center gap-1"><div className="w-3 h-2 rounded-sm" style={{ background: "hsl(142, 71%, 45%)" }}></div> 75%+</div>
        </div>
      </div>
      <p className="text-xs text-muted-foreground mb-4">Region-wise market share with instant KPI overlay</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 relative">
          <svg viewBox="100 80 220 360" className="w-full h-[420px]" style={{ maxHeight: "420px" }}>
            {/* India outline approximate */}
            <path
              d="M165,95 L195,88 L220,100 L250,110 L270,130 L285,155 L298,185 L305,220 L298,250 L290,280 L275,305 L260,325 L245,345 L230,365 L220,385 L210,400 L195,415 L182,410 L175,395 L180,370 L170,345 L160,320 L150,300 L140,270 L125,245 L115,220 L120,195 L130,170 L145,140 L155,115 Z"
              fill="hsl(260, 15%, 95%)"
              stroke="hsl(260, 15%, 85%)"
              strokeWidth="1"
            />
            {regions.map((region) => (
              <path
                key={region.id}
                d={region.path}
                fill={getShareColor(region.marketShare)}
                stroke="hsl(0, 0%, 100%)"
                strokeWidth="1.5"
                opacity={hoveredRegion?.id === region.id ? 1 : 0.8}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredRegion(region)}
                onMouseLeave={() => setHoveredRegion(null)}
                style={{ filter: hoveredRegion?.id === region.id ? "brightness(1.15) drop-shadow(0 2px 4px rgba(0,0,0,0.2))" : "none" }}
              />
            ))}
            {/* State labels */}
            {regions.map((r) => {
              const match = r.path.match(/M([\d.]+),([\d.]+)/);
              if (!match) return null;
              const x = parseFloat(match[1]) + 15;
              const y = parseFloat(match[2]) + 18;
              return (
                <text key={`label-${r.id}`} x={x} y={y} fontSize="7" fill="hsl(0,0%,100%)" fontWeight="bold" textAnchor="middle" pointerEvents="none">
                  {r.id.toUpperCase()}
                </text>
              );
            })}
          </svg>
        </div>

        {/* KPI Panel */}
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider mb-2">
              {hoveredRegion ? hoveredRegion.name : "Hover over a region"}
            </p>
            {hoveredRegion ? (
              <div className="space-y-3">
                <div className="text-center mb-4">
                  <p className="text-3xl font-bold" style={{ color: getShareColor(hoveredRegion.marketShare) }}>
                    {hoveredRegion.marketShare}%
                  </p>
                  <p className="text-xs text-muted-foreground">Market Share</p>
                </div>
                {[
                  { label: "Availability", value: `${hoveredRegion.availability}%`, good: hoveredRegion.availability >= 85 },
                  { label: "Pricing Index", value: `${hoveredRegion.pricing}%`, good: hoveredRegion.pricing >= 80 },
                  { label: "Share of Shelf", value: `${hoveredRegion.sos}%`, good: hoveredRegion.sos >= 30 },
                  { label: "Comp. Poaching", value: `${hoveredRegion.competitionPoaching}%`, good: hoveredRegion.competitionPoaching <= 20 },
                ].map((kpi, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    <span className={`text-sm font-bold ${kpi.good ? 'text-success' : 'text-destructive'}`}>{kpi.value}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Select a state to view instant KPIs</p>
            )}
          </div>

          {/* Top & Bottom performers */}
          <div className="rounded-lg border border-border p-4 bg-card">
            <p className="text-[10px] text-success uppercase font-bold tracking-wider mb-2">Top Performing</p>
            {regions.sort((a, b) => b.marketShare - a.marketShare).slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-foreground font-medium">{r.name}</span>
                <span className="font-bold text-success">{r.marketShare}%</span>
              </div>
            ))}
          </div>
          <div className="rounded-lg border border-border p-4 bg-card">
            <p className="text-[10px] text-destructive uppercase font-bold tracking-wider mb-2">Needs Attention</p>
            {[...regions].sort((a, b) => a.marketShare - b.marketShare).slice(0, 3).map((r, i) => (
              <div key={i} className="flex items-center justify-between py-1.5 text-xs">
                <span className="text-foreground font-medium">{r.name}</span>
                <span className="font-bold text-destructive">{r.marketShare}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IndiaMap;
