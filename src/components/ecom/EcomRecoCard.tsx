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

/** One fixed layout for every signal: three text lines, no charts. */
const Evidence: React.FC<{ reco: SkuRecommendation }> = ({ reco }) => {
  const { label, left, right, takeaway, tags } = reco.evidence;
  const shown = (tags ?? []).slice(0, 3);
  const more = (tags?.length ?? 0) - shown.length;

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[10px] uppercase tracking-wide text-muted-foreground w-14 flex-shrink-0">{label}</span>
        <span className="font-mono text-[11px] text-foreground">{left}</span>
        {right && <span className="font-mono text-[11px] text-foreground">· {right}</span>}
        <span className="ml-auto text-[10px] text-muted-foreground">{takeaway}</span>
      </div>

      {shown.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {shown.map((t) => (
            <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-surface-3 text-muted-foreground">{t}</span>
          ))}
          {more > 0 && <span className="text-[10px] text-muted-foreground">and {more} more</span>}
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
