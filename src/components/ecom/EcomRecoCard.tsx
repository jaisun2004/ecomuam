import React, { useState } from "react";
import { Check, Info } from "lucide-react";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { recoKindLabel, type SkuRecommendation } from "@/lib/ecom-qc/recommendations";

interface Props {
  reco: SkuRecommendation;
  selected: boolean;
  onToggle: () => void;
  /** shown when the card is read-only, e.g. restated on review */
  readOnly?: boolean;
  onDismiss?: () => void;
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

  if (e.type === "cities") {
    return (
      <div className="space-y-1.5">
        {e.inStock.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] text-muted-foreground w-20">In stock</span>
            {e.inStock.map((c) => (
              <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-sw-green-dim text-sw-green">{c}</span>
            ))}
          </div>
        )}
        {e.oos.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center">
            <span className="text-[10px] text-muted-foreground w-20">Out of stock</span>
            {e.oos.map((c) => (
              <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-surface-3 text-muted-foreground">{c}</span>
            ))}
          </div>
        )}
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

  if (e.type === "price") {
    const scale = Math.max(e.ours, e.theirs) * 1.3;
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-24">Your pack</span>
          <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${(e.ours / scale) * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] text-foreground w-14 text-right">{e.symbol}{e.ours}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground w-24 truncate" title={e.competitor}>{e.competitor}</span>
          <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
            <div className="h-full bg-border-visible" style={{ width: `${(e.theirs / scale) * 100}%` }} />
          </div>
          <span className="font-mono text-[10px] text-muted-foreground w-14 text-right">{e.symbol}{e.theirs}</span>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 italic">{e.note}</p>
      </div>
    );
  }

  const scaleMax = Math.max(e.floor, e.suggested) * 1.6;
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-muted-foreground w-24">Platform floor</span>
        <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full bg-border-visible" style={{ width: `${(e.floor / scaleMax) * 100}%` }} />
        </div>
        <span className="font-mono text-[10px] text-muted-foreground w-12 text-right">{e.symbol}{e.floor}</span>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[10px] text-muted-foreground w-24">Opening bid</span>
        <div className="flex-1 h-2.5 rounded-full bg-surface-3 overflow-hidden">
          <div className="h-full bg-primary" style={{ width: `${(e.suggested / scaleMax) * 100}%` }} />
        </div>
        <span className="font-mono text-[10px] text-foreground w-12 text-right">{e.symbol}{e.suggested}</span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-1">Bid {e.unit}</p>
      <p className="text-[10px] text-muted-foreground mt-1.5 italic">{e.note}</p>
    </div>
  );
};


const EcomRecoCard: React.FC<Props> = ({ reco, selected, onToggle, readOnly, onDismiss }) => {
  const [why, setWhy] = useState(false);

  return (
    <div className={`px-4 py-3 ${selected ? "bg-primary/5" : ""}`}>
      <div className="flex items-start gap-3">
        {readOnly ? (
          <span className="mt-0.5 w-4 h-4 rounded border border-border-visible flex items-center justify-center flex-shrink-0 bg-primary border-primary">
            <Check size={11} className="text-primary-foreground" />
          </span>
        ) : (
          <button
            onClick={onToggle}
            className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary border-primary" : "border-border-visible"}`}
            aria-label="Keep this recommendation"
          >
            {selected && <Check size={11} className="text-primary-foreground" />}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${reco.klass === "observed" ? "bg-sw-green-dim text-sw-green" : "bg-primary/15 text-primary"}`}>
              {reco.klass === "observed" ? "Observed" : "Rule"}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground text-[10px]">{reco.provenance}</span>
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[10px]">{recoKindLabel(reco.kind)}</span>
            <span className="text-xs text-foreground font-medium truncate">{reco.sku.name}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{platformDisplay(reco.sku.platform)}</span>
            <span className="ml-auto flex items-center gap-2">
              <Dots n={reco.confidence} />
              <span className="font-mono text-[10px] text-muted-foreground">{reco.code}</span>
              <button onClick={() => setWhy((v) => !v)} className="text-muted-foreground hover:text-foreground" aria-label="Why this">
                <Info size={13} />
              </button>
            </span>
          </div>

          <p className="text-xs text-foreground mt-2">
            <span className="font-semibold">Recommended because</span> {reco.signal}
          </p>
          <p className="text-xs text-foreground mt-1">
            <span className="font-semibold">Do this.</span> {reco.action}
          </p>

          <div className="mt-2.5 rounded-lg border border-subtle bg-surface-2 p-3">
            <div className="flex items-baseline justify-between gap-2 mb-2">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">What we know today</p>
              <p className="text-[10px] text-muted-foreground">
                {reco.source} ·{" "}
                <span className={reco.stale ? "text-sw-amber" : ""}>
                  {reco.collectedDaysAgo === 0
                    ? "collected today"
                    : `collected ${reco.collectedDaysAgo} day${reco.collectedDaysAgo > 1 ? "s" : ""} ago`}
                </span>
              </p>
            </div>
            <Evidence reco={reco} />
            <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-subtle">{reco.grounding}</p>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
            {reco.changes.map((c) => (
              <div key={c.label} className="flex gap-2 min-w-0">
                <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0">{c.label}</span>
                <span className="text-[10px] text-foreground font-mono truncate" title={c.value}>{c.value || "—"}</span>
              </div>
            ))}
          </div>

          <p className="text-[10px] text-muted-foreground mt-2">
            What this aims at: {reco.impact} <span className="opacity-70">· {reco.basis}</span>
          </p>
          {reco.stale && (
            <p className="text-[10px] text-sw-amber mt-1">
              This signal is older than a day, so the confidence shown is one level lower.
            </p>
          )}

          {!readOnly && (
            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={onToggle}
                className="px-2 py-1 rounded-md border border-subtle text-[10px] text-foreground hover:bg-surface-3"
              >
                {selected ? "Keeping it" : "Apply to this campaign"}
              </button>
              <button
                onClick={onDismiss ?? onToggle}
                className="px-2 py-1 rounded-md border border-subtle text-[10px] text-muted-foreground hover:bg-surface-3"
              >
                Dismiss
              </button>
              <span className="text-[10px] text-muted-foreground">
                Dismissing hides it for 28 days and records who dismissed it.
              </span>
            </div>
          )}
          {readOnly && (
            <p className="text-[10px] text-muted-foreground mt-2">Kept. Applied to the plan when you push.</p>
          )}

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
