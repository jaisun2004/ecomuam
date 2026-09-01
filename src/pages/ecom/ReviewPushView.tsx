import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, CheckCircle2, Rocket } from "lucide-react";
import EcomQcPanel from "@/components/ecom/EcomQcPanel";
import { useEcomCreate } from "./EcomCreateContext";
import { downloadAnnotated } from "./xlsx-utils";
import { BATCH_FIELDS, FIELD_LABELS, type BatchRow } from "@/lib/ecom-qc/types";
import { findingsForRow, isPushBlocked } from "@/lib/ecom-qc/engine";
import { toast } from "sonner";

const ReviewPushView: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ec = useEcomCreate();
  const [warnAck, setWarnAck] = useState(false);

  useEffect(() => {
    if (ec.rows.length === 0) navigate("/ecom/campaigns/create");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handler = () => toast.info("Re-upload from the AI flow to replace the batch.");
    window.addEventListener("ecom-reupload", handler);
    return () => window.removeEventListener("ecom-reupload", handler);
  }, []);

  if (ec.rows.length === 0) return null;

  const updateCell = (id: string, field: keyof BatchRow, value: string) => {
    const next = ec.rows.map((r) => (r.id === id ? { ...r, [field]: value } : r));
    ec.setRows(next);
  };

  const toggleRow = (id: string) => {
    const next = ec.rows.map((r) => (r.id === id ? { ...r, selected: !r.selected } : r));
    ec.setRows(next);
  };

  const selected = ec.rows.filter((r) => r.selected !== false);
  const deselected = ec.rows.length - selected.length;
  const blocked = isPushBlocked(ec.result) || (ec.result != null && ec.result.warnings > 0 && !warnAck);
  const fromCopy = params.get("from") === "copy";

  const push = () => {
    ec.setPushed(true);
    toast.success(`Pushed ${selected.length} campaigns — QC run recorded${deselected ? `, ${deselected} rows deselected (logged)` : ""}.`);
  };

  if (ec.pushed) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-center px-6">
        <CheckCircle2 size={48} className="text-sw-green mb-4" />
        <h1 className="font-display font-bold text-xl text-foreground">{selected.length} campaigns pushed</h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-md">
          The QC run id and every override/deselection were written to the audit record. Platforms will pick the campaigns up in the next sync.
        </p>
        <button onClick={() => { ec.reset(); navigate("/"); }} className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
          Back to Campaign Manager
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-subtle bg-surface-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display font-bold text-sm text-foreground">Review & Push</h1>
            <p className="text-[10px] text-muted-foreground">
              {ec.rows.length} rows{ec.fileName ? ` · ${ec.fileName}` : ""} · {selected.length} selected
            </p>
          </div>
        </div>
        <button
          onClick={push}
          disabled={blocked || selected.length === 0}
          title={isPushBlocked(ec.result) ? `Resolve ${ec.result?.blockers ?? 0} blockers to continue.` : undefined}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket size={13} /> Push {selected.length} campaigns
        </button>
      </div>

      <div className="p-4 max-w-[1400px] mx-auto space-y-4">
        {fromCopy && (
          <div className="rounded-xl border border-sw-amber/30 bg-sw-amber-dim px-4 py-3 text-xs text-sw-amber">
            Check these before you push: end dates were cleared, budgets carried over from history, and cities/SKUs revalidated against current reference data.
          </div>
        )}

        <EcomQcPanel
          result={ec.result}
          deepPending={ec.deepPending}
          onFix={ec.applyFix}
          onDownloadAnnotated={() => downloadAnnotated(ec.rows, ec.result)}
        />

        {ec.result && ec.result.warnings > 0 && ec.result.blockers === 0 && (
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={warnAck} onChange={(e) => setWarnAck(e.target.checked)} className="accent-primary" />
            I acknowledge {ec.result.warnings} warnings and want to proceed.
          </label>
        )}

        {/* Editable grid */}
        <div className="rounded-xl border border-subtle bg-surface-1 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-subtle bg-surface-2">
                <th className="px-2 py-2"></th>
                <th className="px-2 py-2 text-left text-muted-foreground font-mono">#</th>
                {BATCH_FIELDS.map((f) => (
                  <th key={f} className="px-2 py-2 text-left text-muted-foreground font-mono whitespace-nowrap">{FIELD_LABELS[f]}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {ec.rows.map((r) => {
                const rowFindings = findingsForRow(ec.result, r.row);
                const rowBlocked = rowFindings.some((f) => f.severity === "blocker");
                return (
                  <tr key={r.id} className={r.selected === false ? "opacity-40" : ""}>
                    <td className="px-2 py-1.5">
                      <input type="checkbox" checked={r.selected !== false} onChange={() => toggleRow(r.id)} className="accent-primary" />
                    </td>
                    <td className="px-2 py-1.5 font-mono text-muted-foreground">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${rowBlocked ? "bg-sw-red" : rowFindings.length ? "bg-sw-amber" : "bg-sw-green"}`} />
                      {r.row}
                    </td>
                    {BATCH_FIELDS.map((f) => {
                      const bad = rowFindings.some((x) => x.field === f);
                      return (
                        <td key={f} className="px-1 py-1 min-w-[110px]">
                          <input
                            value={String(r[f] ?? "")}
                            onChange={(e) => updateCell(r.id, f, e.target.value)}
                            className={`w-full bg-transparent border rounded px-1.5 py-1 text-[11px] font-mono outline-none ${
                              bad ? "border-sw-red/50 text-sw-red" : "border-transparent hover:border-subtle focus:border-primary/50 text-foreground"
                            }`}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground">Edits here re-run QC on Continue. Deselected rows are excluded from the push and logged — failing rows are never silently dropped.</p>
        <div className="flex justify-end pb-8">
          <button
            onClick={() => { ec.runLive(); ec.runDeep(); toast.success("QC re-run on edited rows."); }}
            className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-3 text-foreground hover:bg-surface-3/70"
          >
            Re-run QC
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewPushView;
