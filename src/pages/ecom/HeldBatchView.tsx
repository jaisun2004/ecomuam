import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Archive, RotateCcw, Trash2 } from "lucide-react";
import EcomSheetTable from "@/components/ecom/EcomSheetTable";
import { useEcomCreate } from "./EcomCreateContext";
import { groupByRule } from "@/lib/ecom-qc/sheet-run";

const HeldBatchView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-sw-amber-dim flex items-center justify-center">
          <Archive size={15} className="text-sw-amber" />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-foreground">Held batches</h1>
          <p className="text-[10px] text-muted-foreground">Rows parked with their findings intact. Reopening re-checks them against today's data.</p>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto space-y-4">
        {ec.held.length === 0 && (
          <p className="text-sm text-muted-foreground py-12 text-center">Nothing is parked right now.</p>
        )}
        {ec.held.map((h) => {
          const groups = groupByRule(h.result);
          return (
            <div key={h.id} className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono text-muted-foreground">
                  {h.fileName} · {h.rows.length} rows · parked {new Date(h.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                </span>
                {h.reopenedAt && <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">reopened before</span>}
                <div className="ml-auto flex items-center gap-2">
                  <button
                    onClick={() => { ec.reopenHeld(h.id); navigate("/ecom/campaigns/create/review"); }}
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
    </div>
  );
};

export default HeldBatchView;
