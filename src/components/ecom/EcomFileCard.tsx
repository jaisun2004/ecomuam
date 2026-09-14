import React, { useState } from "react";
import { FileSpreadsheet } from "lucide-react";
import EcomSheetTable from "./EcomSheetTable";
import { groupByRule, receiptLine, verdict, type RuleGroup, type SheetRun } from "@/lib/ecom-qc/sheet-run";

interface Props {
  run: SheetRun;
  isLatest: boolean;
  onContinueClean?: () => void;
  onDownloadHeld?: () => void;
  onDownloadTemplate?: () => void;
  /** Once this card has been actioned, one line replaces its buttons. */
  resolvedLine?: string;
  unit?: "row" | "campaign";
}

const toneCls: Record<string, string> = {
  green: "bg-sw-green-dim text-sw-green border-sw-green/30",
  amber: "bg-sw-amber-dim text-sw-amber border-sw-amber/30",
  red: "bg-sw-red-dim text-sw-red border-sw-red/30",
};

const rowsLine = (rows: number[], unit: "row" | "campaign") => {
  if (unit !== "row") return "";
  const shown = rows.slice(0, 5);
  const rest = rows.length - shown.length;
  return `Rows ${shown.join(", ")}${rest > 0 ? ` and ${rest} more` : ""}`;
};

const EcomFileCard: React.FC<Props> = ({
  run, isLatest, onContinueClean, onReupload, onDownloadTemplate, onHold, unit = "row",
}) => {
  const u = (count: number) => `${count} ${unit}${count === 1 ? "" : "s"}`;
  const [tidyOpen, setTidyOpen] = useState(false);
  const v = verdict(run, unit);
  const groups = groupByRule(run.result);
  const failed = run.state === "file_error" || run.state === "empty" || run.state === "wrong_shape";

  const blockerGroups = groups.filter((g) => g.severity === "blocker");
  const warningGroups = groups.filter((g) => g.severity === "warning");
  const sumRows = (list: RuleGroup[]) => list.reduce((total, g) => total + g.rows.length, 0);
  const blockerRows = sumRows(blockerGroups);
  const warningRows = sumRows(warningGroups);


  return (
    <div className={`rounded-xl border overflow-hidden ${isLatest ? "border-border-visible" : "border-subtle opacity-80"} bg-surface-1`}>
      {/* Receipt */}
      <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2 flex-wrap">
        <FileSpreadsheet size={13} className="text-muted-foreground" />
        <span className="text-[11px] font-mono text-muted-foreground">{receiptLine(run, unit)}</span>
        <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-surface-3 text-muted-foreground">{run.label}</span>
      </div>

      {/* Verdict */}
      <div className="px-4 py-3">
        <span className={`inline-block px-2 py-0.5 rounded-full border text-[10px] font-medium ${toneCls[v.tone]}`}>
          {run.state === "clean" ? "Ready" : run.state === "warnings_only" ? "Worth a look" : failed ? "Could not use this file" : unit === "campaign" ? "Some campaigns held" : "Some rows held"}
        </span>
        <p className="text-sm text-foreground mt-2">{v.headline}</p>
        <p className="text-[11px] text-muted-foreground mt-1">{v.detail}</p>

        {failed && run.missingColumns.length > 0 && (
          <p className="mt-2 text-[11px] text-sw-red">
            Missing or renamed columns: <span className="font-mono">{run.missingColumns.join(", ")}</span>
          </p>
        )}
      </div>

      {/* Counts */}
      {groups.length > 0 && (
        <div className="px-4 pb-3 flex items-center gap-6 text-[11px] text-muted-foreground">
          <span>{blockerRows} blocker{blockerRows === 1 ? "" : "s"}</span>
          <span>{warningRows} warning{warningRows === 1 ? "" : "s"}</span>
          <span>{u(run.cleanRows.length)} ready</span>
        </div>
      )}

      {/* Two buckets, one line per rule */}
      {groups.length > 0 && (
        <div className="border-t border-subtle">
          {([
            { key: "blocker", label: "Blockers", list: blockerGroups, border: "border-l-2 border-l-sw-red" },
            { key: "warning", label: "Warnings", list: warningGroups, border: "border-l-2 border-l-sw-amber" },
          ] as const).map((bucket) =>
            bucket.list.length === 0 ? null : (
              <div key={bucket.key} className={`${bucket.border} px-4 py-3 border-t border-subtle first:border-t-0`}>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{bucket.label}</p>
                <ul className="mt-2 space-y-2.5">
                  {bucket.list.map((g) => (
                    <li key={g.rule_key}>
                      <div className="flex items-baseline gap-3">
                        <span className="text-[11px] text-foreground flex-1">
                          {g.plain}
                          {g.unconfirmed ? ". The limit is unconfirmed" : ""}
                        </span>
                        <span className="font-mono text-[10px] text-muted-foreground">{u(g.rows.length)}</span>
                      </div>
                      {unit === "row" && (
                        <p className="font-mono text-[10px] text-muted-foreground mt-0.5">{rowsLine(g.rows, unit)}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ),
          )}
        </div>
      )}


      {/* Tidy-ups */}
      {run.tidies.length > 0 && (
        <div className="px-4 py-2 border-t border-subtle">
          <button onClick={() => setTidyOpen(!tidyOpen)} className="text-[10px] text-muted-foreground hover:text-foreground">
            We tidied {run.tidies.length} small thing{run.tidies.length === 1 ? "" : "s"} (spacing, casing, currency) — {tidyOpen ? "hide" : "show"} the list
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
      {run.rows.length > 0 && unit === "row" && (
        <div className="px-4 py-3 border-t border-subtle">
          <EcomSheetTable rows={run.rows} result={run.result} />
        </div>
      )}

      {run.rows.length > 0 && unit === "campaign" && (
        <div className="px-4 py-3 border-t border-subtle space-y-1.5">
          {run.rows.map((r) => (
            <div key={r.id} className="flex items-center gap-2 text-[11px]">
              <span className="font-mono text-foreground truncate">{r.campaign_name}</span>
              <span className="text-muted-foreground">· {r.platform}</span>
              <span className="ml-auto text-muted-foreground">{r.budget_type} {r.budget_value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Actions */}
      {isLatest && (
        <div className="flex items-center gap-2 flex-wrap px-4 py-3 border-t border-subtle bg-surface-2">
          {!failed && run.cleanRows.length > 0 && onContinueClean && (
            <button onClick={onContinueClean} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              {run.heldRows.length ? `Continue with the ${u(run.cleanRows.length)} ready` : `Continue with all ${u(run.cleanRows.length)}`}
            </button>
          )}
          {run.heldRows.length > 0 && onHold && (
            <button onClick={onHold} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">
              <AlertTriangle size={12} /> Keep the {u(run.heldRows.length)} held for later
            </button>
          )}
          {onReupload && unit === "row" && (
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
    </div>
  );
};

export default EcomFileCard;
