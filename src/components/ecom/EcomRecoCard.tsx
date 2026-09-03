import React, { useState } from "react";
import { Check, Info } from "lucide-react";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { recoKindLabel, type SkuRecommendation } from "@/lib/ecom-qc/recommendations";

interface Props {
  reco: SkuRecommendation;
  selected: boolean;
  onToggle: () => void;
}

const Dots: React.FC<{ n: number }> = ({ n }) => (
  <span className="flex items-center gap-0.5" title={`Confidence ${n} of 5`}>
    {[1, 2, 3, 4, 5].map((i) => (
      <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= n ? "bg-primary" : "bg-border-visible"}`} />
    ))}
  </span>
);

const Sparkline: React.FC<{ values: number[] }> = ({ values }) => {
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const span = Math.max(max - min, 1);
  const pts = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / span) * 24}`)
    .join(" ");
  return (
    <svg viewBox="0 0 100 28" preserveAspectRatio="none" className="w-24 h-7">
      <polyline points={pts} fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

const Evidence: React.FC<{ reco: SkuRecommendation }> = ({ reco }) => {
  const e = reco.evidence;

  if (e.type === "pacing") {
    return (
      <div>
        <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
          <span>Spend so far {e.symbol}{e.spend.toLocaleString("en-IN")}</span>
          <span>Plan for the month {e.symbol}{e.target.toLocaleString("en-IN")}</span>
        </div>
        <div className="h-3 rounded-full bg-surface-3 overflow-hidden flex">
          <div className="h-full bg-primary" style={{ width: `${Math.min(e.deliveredPct, 100)}%` }} />
          <div className="h-full bg-sw-amber/30" style={{ width: `${Math.max(100 - e.deliveredPct, 0)}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          <span className="text-foreground font-medium">{e.deliveredPct}% delivered</span> · {100 - e.deliveredPct}% of the plan still unspent (shaded)
        </p>
      </div>
    );
  }

  if (e.type === "cities") {
    return (
      <div className="flex flex-wrap gap-1">
        {e.inStock.map((c) => (
          <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-sw-green-dim text-sw-green">{c}</span>
        ))}
        {e.oos.map((c) => (
          <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-surface-3 text-muted-foreground line-through">{c}</span>
        ))}
        <span className="text-[10px] text-muted-foreground self-center ml-1">
          green = in stock · struck through = out of stock
        </span>
      </div>
    );
  }

  if (e.type === "rank") {
    const pct = Math.min(e.rank / e.scale, 1) * 100;
    return (
      <div className="flex items-end gap-4">
        <div className="flex-1 min-w-0">
          <div className="relative h-3 rounded-full bg-gradient-to-r from-sw-green-dim to-surface-3">
            <span
              className="absolute -top-0.5 w-4 h-4 rounded-full border-2 border-surface-1 bg-primary"
              style={{ left: `calc(${pct}% - 8px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>Rank 1</span>
            <span className="text-foreground font-medium">Now rank {e.rank}</span>
            <span>{e.scale}+</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {e.keywords.map((k) => (
              <span key={k} className="px-1.5 py-0.5 rounded text-[10px] bg-surface-3 text-foreground font-mono">{k}</span>
            ))}
          </div>
        </div>
        <div className="text-right">
          <Sparkline values={e.trend} />
          <p className="text-[10px] text-muted-foreground">searches +{e.trendPct}% / 8 wks</p>
        </div>
      </div>
    );
  }

  const worse = e.acos > e.benchmark;
  const scaleMax = Math.max(e.from, e.to) * 1.4;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-8">Now</span>
          <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full bg-border-visible" style={{ width: `${(e.from / scaleMax) * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground w-10 text-right">{e.symbol}{e.from}</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-muted-foreground w-8">New</span>
          <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${(e.to / scaleMax) * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] text-foreground w-10 text-right">{e.symbol}{e.to}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">Bid {e.unit}</p>
      </div>
      <div>
        <div className="relative h-3 rounded-full bg-surface-3">
          <span className="absolute inset-y-0 w-px bg-foreground/40" style={{ left: `${(e.benchmark / 40) * 100}%` }} />
          <span
            className={`absolute -top-0.5 w-4 h-4 rounded-full border-2 border-surface-1 ${worse ? "bg-sw-red" : "bg-sw-green"}`}
            style={{ left: `calc(${Math.min((e.acos / 40) * 100, 100)}% - 8px)` }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          ACoS <span className={worse ? "text-sw-red" : "text-sw-green"}>{e.acos}%</span> · benchmark {e.benchmark}%
        </p>
      </div>
    </div>
  );
};

const EcomRecoCard: React.FC<Props> = ({ reco, selected, onToggle }) => {
  const [why, setWhy] = useState(false);

  return (
    <div className={`px-4 py-3 ${selected ? "bg-primary/5" : ""}`}>
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary border-primary" : "border-border-visible"}`}
          aria-label="Toggle recommendation"
        >
          {selected && <Check size={11} className="text-primary-foreground" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-medium">{recoKindLabel(reco.kind)}</span>
            <span className="text-xs text-foreground font-medium truncate">{reco.sku.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{platformDisplay(reco.sku.platform)}</span>
            <span className="ml-auto flex items-center gap-2">
              <Dots n={reco.confidence} />
              <button onClick={() => setWhy((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label="Why this">
                <Info size={13} />
              </button>
            </span>
          </div>

          <div className="mt-2.5 rounded-lg border border-subtle bg-surface-2 p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-2">What we measured</p>
            <Evidence reco={reco} />
          </div>

          <p className="text-xs text-foreground mt-2.5 font-medium">{reco.action}</p>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {reco.changes.map((c) => (
              <div key={c.label} className="flex gap-2 min-w-0">
                <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0">{c.label}</span>
                <span className="text-[10px] text-foreground font-mono truncate" title={c.value}>{c.value || "—"}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground mt-2">
            What it could do: {reco.impact} <span className="opacity-70">· {reco.basis}</span>
          </p>

          {why && (
            <div className="mt-2 rounded-lg border border-subtle bg-surface-2 p-3 space-y-1">
              <p className="text-[10px] text-muted-foreground">Threshold used: <span className="text-foreground">{reco.glass.threshold}</span></p>
              <p className="text-[10px] text-muted-foreground">What we observed: <span className="text-foreground">{reco.glass.observed}</span></p>
              <p className="text-[10px] text-muted-foreground">Source: {reco.glass.freshness}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EcomRecoCard;
