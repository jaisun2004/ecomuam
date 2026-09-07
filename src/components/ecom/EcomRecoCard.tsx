import React from "react";
import { Check } from "lucide-react";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { collectedLabel, type SkuRecommendation } from "@/lib/ecom-qc/recommendations";

interface Props {
  reco: SkuRecommendation;
  selected: boolean;
  onToggle: () => void;
  /** shown when the card is read-only, e.g. restated on review */
  readOnly?: boolean;
  onDismiss?: () => void;
}

/** One layout for every signal: a fact, an optional pair of bars, optional chips. */
const Evidence: React.FC<{ reco: SkuRecommendation }> = ({ reco }) => {
  const { fact, bars, chips } = reco.evidence;
  const scale = bars?.length ? Math.max(...bars.map((b) => b.value), 1) : 1;

  return (
    <div className="space-y-2">
      <p className="text-[11px] text-foreground">{fact}</p>

      {bars && bars.length > 0 && (
        <div className="space-y-1">
          {bars.map((b, i) => (
            <div key={b.label} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-24 truncate" title={b.label}>{b.label}</span>
              <div className="flex-1 h-2 rounded-full bg-surface-3 overflow-hidden">
                <div
                  className={`h-full ${i === 0 ? "bg-primary" : "bg-border-visible"}`}
                  style={{ width: `${(b.value / scale) * 100}%` }}
                />
              </div>
              <span className="font-mono text-[10px] text-foreground w-12 text-right">{b.display}</span>
            </div>
          ))}
        </div>
      )}

      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {chips.map((c) => (
            <span key={c} className="px-1.5 py-0.5 rounded text-[10px] bg-surface-3 text-muted-foreground">{c}</span>
          ))}
        </div>
      )}
    </div>
  );
};

const EcomRecoCard: React.FC<Props> = ({ reco, selected, onToggle, readOnly, onDismiss }) => (
  <div className={`px-4 py-3 ${selected && !readOnly ? "bg-primary/5" : ""}`}>
    <div className="flex items-start gap-3">
      {readOnly ? (
        <span className="mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 bg-primary">
          <Check size={11} className="text-primary-foreground" />
        </span>
      ) : (
        <button
          onClick={onToggle}
          className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${selected ? "bg-primary border-primary" : "border-border-visible"}`}
          aria-label="Keep this suggestion"
        >
          {selected && <Check size={11} className="text-primary-foreground" />}
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-foreground font-medium truncate">{reco.sku.name}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{platformDisplay(reco.sku.platform)}</span>
        </div>

        <p className="text-xs text-foreground mt-2">{reco.signal}</p>
        <p className="text-xs text-foreground mt-1"><span className="font-semibold">Do this.</span> {reco.action}</p>

        <div className="mt-2.5 rounded-lg border border-subtle bg-surface-2 p-3">
          <Evidence reco={reco} />
          <p className={`mt-2 text-[10px] ${reco.collectedDaysAgo > 2 ? "text-sw-amber" : "text-muted-foreground"}`}>
            {reco.source} · {collectedLabel(reco.collectedDaysAgo)}
          </p>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
          {reco.changes.map((c) => (
            <div key={c.label} className="flex gap-2 min-w-0">
              <span className="text-[10px] text-muted-foreground w-24 flex-shrink-0">{c.label}</span>
              <span className="text-[10px] text-foreground font-mono truncate" title={c.value}>{c.value || "—"}</span>
            </div>
          ))}
        </div>

        {!readOnly && (
          <div className="mt-2 flex items-center gap-2">
            <button onClick={onToggle} className="px-2 py-1 rounded-md border border-subtle text-[10px] text-foreground hover:bg-surface-3">
              {selected ? "Selected" : "Select"}
            </button>
            <button onClick={onDismiss ?? onToggle} className="px-2 py-1 rounded-md border border-subtle text-[10px] text-muted-foreground hover:bg-surface-3">
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  </div>
);

export default EcomRecoCard;
