import React, { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, FileSpreadsheet, Info, Sparkles, Upload } from "lucide-react";
import EcomSheetTable from "./EcomSheetTable";
import { groupByRule, receiptLine, verdict, type SheetRun } from "@/lib/ecom-qc/sheet-run";
import { RULE_EXPLANATIONS } from "@/lib/ecom-qc/explanations";
import { RULE_INDEX } from "@/lib/ecom-qc/rules";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { QcFinding } from "@/lib/ecom-qc/types";

interface Props {
  run: SheetRun;
  isLatest: boolean;
  onFixWithAi?: () => void;
  onContinueClean?: () => void;
  onReupload?: () => void;
  onDownloadTemplate?: () => void;
  onHold?: () => void;
}

const toneCls: Record<string, string> = {
  green: "bg-sw-green-dim text-sw-green border-sw-green/30",
  amber: "bg-sw-amber-dim text-sw-amber border-sw-amber/30",
  red: "bg-sw-red-dim text-sw-red border-sw-red/30",
};

const EcomFileCard: React.FC<Props> = ({
  run, isLatest, onFixWithAi, onContinueClean, onReupload, onDownloadTemplate, onHold,
}) => {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [tidyOpen, setTidyOpen] = useState(false);
  const [shown, setShown] = useState<QcFinding | null>(null);
  const v = verdict(run);
  const groups = groupByRule(run.result);
  const failed = run.state === "file_error" || run.state === "empty" || run.state === "wrong_shape";

  const toggle = (k: string) =>
    setOpenGroups((prev) => {
      const n = new Set(prev);
      if (n.has(k)) n.delete(k); else n.add(k);
      return n;
    });

  const explain = shown ? RULE_EXPLANATIONS[shown.rule_key] : undefined;

  return (
    <div className={`rounded-xl border overflow-hidden ${isLatest ? "border-border-visible" : "border-subtle opacity-80"} bg-surface-1`}>
      {/* Receipt */}
      <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2 flex-wrap">
        <FileSpreadsheet size={13} className="text-muted-foreground" />
        <span className="text-[11px] font-mono text-muted-foreground">{receiptLine(run)}</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-muted-foreground">{run.label}</span>
      </div>

      {/* Verdict */}
      <div className="px-4 py-3">
        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${toneCls[v.tone]}`}>
          {run.state === "clean" ? "Ready" : run.state === "warnings_only" ? "Worth a look" : failed ? "Could not use this file" : "Some rows held"}
        </span>
        <p className="text-sm text-foreground mt-2">{v.headline}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{v.detail}</p>

        {failed && run.missingColumns.length > 0 && (
          <p className="mt-2 text-[11px] text-sw-red">
            Missing or renamed columns: <span className="font-mono">{run.missingColumns.join(", ")}</span>
          </p>
        )}
      </div>

      {/* Issues grouped by rule */}
      {groups.length > 0 && (
        <div className="border-t border-subtle divide-y divide-subtle">
          {groups.map((g) => {
            const open = openGroups.has(g.rule_key);
            return (
              <div key={g.rule_key}>
                <button onClick={() => toggle(g.rule_key)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-surface-2 text-left">
                  {open ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
                  <span className={`w-2 h-2 rounded-full ${g.severity === "blocker" ? "bg-sw-red" : "bg-sw-amber"}`} />
                  <span className="text-[11px] text-foreground">{g.plain}</span>
                  <span className="ml-auto font-mono text-[10px] text-muted-foreground">
                    {g.rows.length} row{g.rows.length > 1 ? "s" : ""}: {g.rows.slice(0, 6).join(", ")}{g.rows.length > 6 ? "…" : ""}
                  </span>
                </button>
                {open && (
                  <div className="divide-y divide-subtle bg-surface-2/40">
                    {g.findings.map((f, i) => (
                      <div key={`${f.row}-${f.field}-${i}`} className="px-8 py-2 flex items-start gap-2 text-[11px]">
                        <div className="flex-1 min-w-0">
                          <span className="font-mono text-[10px] text-muted-foreground">row {f.row} · {f.field}</span>
                          <p className="text-foreground">{f.message}</p>
                          {f.value && <p className="font-mono text-[10px] text-sw-red break-all">“{f.value}”</p>}
                        </div>
                        <button onClick={() => setShown(f)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] bg-surface-3 text-muted-foreground hover:text-foreground">
                          <Info size={10} /> Why
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tidy-ups */}
      {run.tidies.length > 0 && (
        <div className="px-4 py-2 border-t border-subtle">
          <button onClick={() => setTidyOpen(!tidyOpen)} className="text-[10px] text-muted-foreground hover:text-foreground">
            We tidied {run.tidies.length} small things (spacing, casing, currency) — {tidyOpen ? "hide" : "show"} the list
          </button>
          {tidyOpen && (
            <ul className="mt-1.5 space-y-0.5 max-h-[140px] overflow-y-auto">
              {run.tidies.map((t, i) => (
                <li key={i} className="font-mono text-[10px] text-muted-foreground">
                  row {t.row} · {t.field}: “{t.from}” → “{t.to}” ({t.note})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Sheet */}
      {run.rows.length > 0 && (
        <div className="px-4 py-3 border-t border-subtle">
          <EcomSheetTable rows={run.rows} result={run.result} />
        </div>
      )}

      {/* Actions */}
      {isLatest && (
        <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-t border-subtle bg-surface-2">
          {!failed && (run.result?.findings.length ?? 0) > 0 && onFixWithAi && (
            <button onClick={onFixWithAi} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/15 text-primary hover:bg-primary/25">
              <Sparkles size={12} /> Fix with AI
            </button>
          )}
          {!failed && run.cleanRows.length > 0 && onContinueClean && (
            <button onClick={onContinueClean} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              {run.heldRows.length ? `Continue with the ${run.cleanRows.length} ready rows` : `Continue with all ${run.cleanRows.length} rows`}
            </button>
          )}
          {run.heldRows.length > 0 && onHold && (
            <button onClick={onHold} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">
              <AlertTriangle size={12} /> Keep the {run.heldRows.length} held rows for later
            </button>
          )}
          {onReupload && (
            <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70 cursor-pointer">
              <Upload size={12} /> Upload a corrected file
              <input
                type="file"
                accept=".xlsx,.xlsm,.csv"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) window.dispatchEvent(new CustomEvent("ecom-reupload", { detail: f }));
                  e.target.value = "";
                }}
              />
            </label>
          )}
          {failed && onDownloadTemplate && (
            <button onClick={onDownloadTemplate} className="px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">
              Download the template
            </button>
          )}
        </div>
      )}

      {/* Why dialog */}
      <Dialog open={!!shown} onOpenChange={() => setShown(null)}>
        <DialogContent className="bg-surface-1 border-border-visible">
          <DialogHeader>
            <DialogTitle className="text-sm">{shown ? RULE_INDEX[shown.rule_key]?.title ?? shown.message : ""}</DialogTitle>
            <DialogDescription className="text-[11px]">
              {shown?.severity === "blocker" ? "This holds the row until it is settled." : "This does not stop the push."}
            </DialogDescription>
          </DialogHeader>
          {shown && (
            <div className="space-y-3 text-xs">
              <Block label="What we checked" body={explain?.checked ?? shown.message} />
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">What we found</p>
                <p className="text-foreground">{shown.message}</p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                  row {shown.row} · column {shown.field}{shown.value ? ` · “${shown.value}”` : ""}
                </p>
              </div>
              <Block label="Why it matters" body={explain?.why ?? "This check protects the batch from failing on push."} />
              <Block label="How to fix it" body={explain?.fix ?? "Correct the value in the sheet and upload it again."} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Block: React.FC<{ label: string; body: string }> = ({ label, body }) => (
  <div>
    <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</p>
    <p className="text-foreground">{body}</p>
  </div>
);

export default EcomFileCard;
