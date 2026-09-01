import React, { useState } from "react";
import { AlertTriangle, CheckCircle2, ChevronDown, ChevronRight, Download, Loader2, Upload, Wrench, Info } from "lucide-react";
import type { QcFinding, QcResult } from "@/lib/ecom-qc/types";
import { QC_GROUPS } from "@/lib/ecom-qc/types";
import { groupFindings } from "@/lib/ecom-qc/engine";
import { RULE_INDEX } from "@/lib/ecom-qc/rules";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";

interface Props {
  result: QcResult | null;
  deepPending?: boolean;
  onFix: (finding: QcFinding) => void;
  onDownloadAnnotated: () => void;
  onContinue?: () => void;
  continueLabel?: string;
}

const bandStyles: Record<string, string> = {
  green: "bg-sw-green-dim text-sw-green border border-sw-green/30",
  amber: "bg-sw-amber-dim text-sw-amber border border-sw-amber/30",
  red: "bg-sw-red-dim text-sw-red border border-sw-red/30",
};

const EcomQcPanel: React.FC<Props> = ({ result, deepPending, onFix, onDownloadAnnotated, onContinue, continueLabel = "Continue to Review" }) => {
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());
  const [ruleShown, setRuleShown] = useState<QcFinding | null>(null);

  if (!result) return null;

  const groups = groupFindings(result);
  const groupSet = new Set(groups.map((g) => g.group));
  const isOpen = (g: string, hasBlockers: boolean) => (openGroups.size === 0 ? hasBlockers : openGroups.has(g));
  const toggle = (g: string) => {
    setOpenGroups((prev) => {
      const base = prev.size === 0 ? new Set(groups.filter((x) => x.findings.some((f) => f.severity === "blocker")).map((x) => x.group)) : new Set(prev);
      if (base.has(g)) base.delete(g); else base.add(g);
      return base;
    });
  };

  return (
    <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-subtle bg-surface-2">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold ${bandStyles[result.band]}`}>
            QC {result.score}
          </span>
          <span className="text-[11px] text-muted-foreground">
            <span className={result.blockers ? "text-sw-red font-medium" : ""}>{result.blockers} blockers</span>
            {" · "}
            <span className={result.warnings ? "text-sw-amber font-medium" : ""}>{result.warnings} warnings</span>
            {" · "}{result.rows_checked} rows checked
          </span>
          {deepPending && (
            <span className="flex items-center gap-1.5 text-[11px] text-primary">
              <Loader2 size={12} className="animate-spin" /> Running deep checks (stock, wallet, duplicates)…
            </span>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-h-[340px] overflow-y-auto divide-y divide-subtle">
        {groups.length === 0 && !deepPending && (
          <div className="flex items-center gap-2 px-4 py-6 text-sm text-sw-green">
            <CheckCircle2 size={16} /> All checks passed — nothing blocking this batch.
          </div>
        )}
        {groups.map(({ group, findings }) => {
          const blockers = findings.filter((f) => f.severity === "blocker").length;
          const open = isOpen(group, blockers > 0);
          return (
            <div key={group}>
              <button onClick={() => toggle(group)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-surface-2 text-left">
                {open ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                <span className="text-xs font-medium text-foreground">{group}</span>
                <span className="ml-auto flex items-center gap-2">
                  {blockers > 0 && <span className="px-1.5 py-0.5 rounded bg-sw-red-dim text-sw-red text-[10px] font-mono">{blockers}</span>}
                  {findings.length - blockers > 0 && <span className="px-1.5 py-0.5 rounded bg-sw-amber-dim text-sw-amber text-[10px] font-mono">{findings.length - blockers}</span>}
                </span>
              </button>
              {open && (
                <div className="divide-y divide-subtle">
                  {findings.map((f, i) => (
                    <div key={`${f.rule_key}-${f.row}-${f.field}-${i}`} className="px-4 py-2.5 flex items-start gap-3 text-xs">
                      <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${f.severity === "blocker" ? "bg-sw-red" : "bg-sw-amber"}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] text-muted-foreground">{f.rule_key}</span>
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">
                            row {f.row} · {f.field}
                          </span>
                          {f.when === "deep" && <span className="text-[9px] px-1.5 py-0.5 rounded bg-primary/15 text-primary font-mono">deep</span>}
                        </div>
                        <p className="text-foreground mt-1">{f.message}</p>
                        {f.value && (
                          <p className="mt-0.5 font-mono text-[11px] text-sw-red break-all">“{f.value}”</p>
                        )}
                        {f.suggestion && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground">Suggestion: <span className="font-mono text-sw-green">{f.suggestion}</span></p>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {f.fixable_inline && f.suggestion && (
                          <button onClick={() => onFix(f)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-primary/15 text-primary hover:bg-primary/25">
                            <Wrench size={10} /> Fix inline
                          </button>
                        )}
                        <button onClick={() => setRuleShown(f)} className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium bg-surface-3 text-muted-foreground hover:text-foreground">
                          <Info size={10} /> Show rule
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {deepPending && QC_GROUPS.filter((g) => !groupSet.has(g)).length > 0 && (
          <div className="px-4 py-3 flex items-center gap-2 text-[11px] text-muted-foreground">
            <Loader2 size={12} className="animate-spin" /> Deep checks still running…
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-4 py-3 border-t border-subtle bg-surface-2 flex-wrap">
        <div className="flex items-center gap-2">
          <button onClick={onDownloadAnnotated} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-surface-3 text-foreground hover:bg-surface-3/70">
            <Download size={12} /> Download annotated file
          </button>
          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-surface-3 text-foreground hover:bg-surface-3/70 cursor-pointer">
            <Upload size={12} /> Fix and re-upload
            <input
              type="file"
              accept=".xlsx,.xlsm,.csv"
              className="hidden"
              onChange={(e) => {
                const ev = new CustomEvent("ecom-reupload", { detail: e.target.files?.[0] });
                window.dispatchEvent(ev);
                e.target.value = "";
              }}
            />
          </label>
        </div>
        {onContinue && (
          <button
            onClick={onContinue}
            disabled={result.blockers > 0}
            title={result.blockers > 0 ? `Resolve ${result.blockers} blockers to continue.` : undefined}
            className="px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {continueLabel}
          </button>
        )}
      </div>

      {/* Rule explainer */}
      <Dialog open={!!ruleShown} onOpenChange={() => setRuleShown(null)}>
        <DialogContent className="bg-surface-1 border-border-visible">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm">{ruleShown?.rule_key}</DialogTitle>
            <DialogDescription className="text-xs">
              {ruleShown && RULE_INDEX[ruleShown.rule_key]?.rationale
                ? RULE_INDEX[ruleShown.rule_key].rationale
                : ruleShown?.message}
            </DialogDescription>
          </DialogHeader>
          {ruleShown && (
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Group: {ruleShown.group}</p>
              <p>Severity: {ruleShown.severity} · Timing: {ruleShown.when}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EcomQcPanel;
