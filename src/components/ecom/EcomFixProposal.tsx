import React, { useMemo, useState } from "react";
import { Check, HelpCircle, X } from "lucide-react";
import type { FixProposal } from "@/lib/ecom-qc/fix-proposals";
import type { QcFinding } from "@/lib/ecom-qc/types";
import { RULE_EXPLANATIONS } from "@/lib/ecom-qc/explanations";

interface Props {
  proposals: FixProposal[];
  manual: QcFinding[];
  onApply: (accepted: { proposal: FixProposal; value: string }[]) => void;
  onCancel: () => void;
}

/**
 * Proposals only. Nothing is written until the user accepts, and every suggested value
 * names where it came from.
 */
const EcomFixProposal: React.FC<Props> = ({ proposals, manual, onApply, onCancel }) => {
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [values, setValues] = useState<Record<string, string>>({});

  const accepted = useMemo(
    () => proposals.filter((p) => !skipped.has(p.id)).map((p) => ({ proposal: p, value: values[p.id] ?? p.proposed })),
    [proposals, skipped, values],
  );

  return (
    <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-subtle bg-surface-2">
        <p className="text-xs font-medium text-foreground">Proposed changes — nothing is applied until you say so</p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          {proposals.length} suggestions drawn from the reference lists in your workbook. Edit any value before accepting.
        </p>
      </div>

      <div className="max-h-[340px] overflow-y-auto divide-y divide-subtle">
        {proposals.map((p) => {
          const off = skipped.has(p.id);
          const val = values[p.id] ?? p.proposed;
          return (
            <div key={p.id} className={`px-4 py-3 text-xs ${off ? "opacity-45" : ""}`}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">
                  row {p.row} · {p.field}
                </span>
                <span className="text-muted-foreground">{p.explanation}</span>
              </div>
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="font-mono text-[11px] text-sw-red line-through break-all">{p.current || "empty"}</span>
                <span className="text-muted-foreground">→</span>
                {p.control === "select" && p.options.length > 0 ? (
                  <select
                    value={val}
                    onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                    className="bg-surface-2 border border-subtle rounded px-2 py-1 text-[11px] font-mono text-foreground max-w-[260px]"
                  >
                    {[val, ...p.options.filter((o) => o !== val)].map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={p.control === "number" ? "number" : p.control === "date" ? "date" : "text"}
                    value={val}
                    onChange={(e) => setValues((v) => ({ ...v, [p.id]: e.target.value }))}
                    className="bg-surface-2 border border-subtle rounded px-2 py-1 text-[11px] font-mono text-foreground min-w-[180px]"
                  />
                )}
                <button
                  onClick={() =>
                    setSkipped((s) => {
                      const n = new Set(s);
                      if (n.has(p.id)) n.delete(p.id); else n.add(p.id);
                      return n;
                    })
                  }
                  className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-[10px] bg-surface-3 text-muted-foreground hover:text-foreground"
                >
                  {off ? <><Check size={10} /> Include</> : <><X size={10} /> Skip</>}
                </button>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Source: {p.source}</p>
            </div>
          );
        })}

        {manual.length > 0 && (
          <div className="px-4 py-3">
            <p className="flex items-center gap-1.5 text-[11px] font-medium text-foreground">
              <HelpCircle size={12} /> {manual.length} need a decision from you
            </p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              There is no reference value we can safely put here, so we are not guessing.
            </p>
            <ul className="mt-2 space-y-1.5">
              {manual.slice(0, 12).map((m, i) => (
                <li key={`${m.rule_key}-${m.row}-${i}`} className="text-[11px]">
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground mr-1.5">
                    row {m.row} · {m.field}
                  </span>
                  <span className="text-foreground">{RULE_EXPLANATIONS[m.rule_key]?.fix ?? m.message}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-subtle bg-surface-2">
        <span className="text-[10px] text-muted-foreground">{accepted.length} of {proposals.length} will be applied</span>
        <div className="flex items-center gap-2">
          <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">
            Cancel
          </button>
          <button
            onClick={() => onApply(accepted)}
            disabled={accepted.length === 0}
            className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
          >
            Apply {accepted.length} and re-check
          </button>
        </div>
      </div>
    </div>
  );
};

export default EcomFixProposal;
