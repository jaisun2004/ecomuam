import React from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import EcomSheetTable from "@/components/ecom/EcomSheetTable";
import { useEcomCreate } from "@/pages/ecom/EcomCreateContext";
import { groupByRule } from "@/lib/ecom-qc/sheet-run";

interface Props {
  /** called after the batch is reopened and re-checked */
  onReopen: (id: string) => void;
}

const EcomHeldList: React.FC<Props> = ({ onReopen }) => {
  const ec = useEcomCreate();

  if (ec.held.length === 0) {
    return <p className="text-sm text-muted-foreground py-12 text-center">Nothing is parked right now.</p>;
  }

  return (
    <div className="space-y-4">
      {ec.held.map((h) => {
        const groups = groupByRule(h.result);
        return (
          <div key={h.id} className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-muted-foreground">
                {h.fileName} · {h.rows.length} rows · parked{" "}
                {new Date(h.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </span>
              {h.reopenedAt && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">reopened before</span>}
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => { ec.reopenHeld(h.id); onReopen(h.id); }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <RotateCcw size={11} /> Reopen and re-check
                </button>
                <button onClick={() => ec.dropHeld(h.id)} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] bg-surface-3 text-muted-foreground hover:text-sw-red">
                  <Trash2 size={11} /> Discard
                </button>
              </div>
            </div>

            <div className="px-4 py-3 space-y-2">
              <p className="text-[11px] text-muted-foreground">{h.note}</p>
              {groups.length > 0 && (
                <ul className="space-y-1">
                  {groups.map((g) => (
                    <li key={g.rule_key} className="text-[11px]">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${g.severity === "blocker" ? "bg-sw-red" : "bg-sw-amber"}`} />
                      <span className="text-foreground">{g.plain}</span>
                      <span className="text-muted-foreground font-mono ml-1">· rows {g.rows.join(", ")}</span>
                    </li>
                  ))}
                </ul>
              )}
              {h.overrides.length > 0 && (
                <p className="text-[10px] text-muted-foreground">{h.overrides.length} accepted warnings are kept with this batch.</p>
              )}
              <EcomSheetTable rows={h.rows} result={h.result} title="Parked rows" />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default EcomHeldList;
