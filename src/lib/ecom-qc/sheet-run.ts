import type { BatchRow, QcFinding, QcResult } from "./types";
import { RULE_INDEX } from "./rules";
import { RULE_EXPLANATIONS } from "./explanations";
import { partitionRows, runQc } from "./engine";
import { currencyFor, platformDisplay, resolveAlias } from "@/lib/ecom-reference/platforms";

export type SheetRunState =
  | "clean"
  | "warnings_only"
  | "partial"
  | "all_held"
  | "file_error"
  | "empty"
  | "wrong_shape";

export interface TidyEdit {
  row: number;
  field: string;
  from: string;
  to: string;
  note: string;
}

export interface RuleGroup {
  rule_key: string;
  title: string;
  severity: "blocker" | "warning";
  rows: number[];
  findings: QcFinding[];
  plain: string;
}

export interface SheetRun {
  id: string;
  label: string;
  parentId?: string;
  fileName: string;
  receivedAt: string;
  sizeKb: number;
  rowsSeen: number;
  rows: BatchRow[];
  result: QcResult | null;
  tidies: TidyEdit[];
  state: SheetRunState;
  error?: string;
  missingColumns: string[];
  cleanRows: number[];
  heldRows: number[];
}

const CANON_BUDGET = ["daily", "total"];

/** Quiet, reversible normalisation. Never changes meaning, always counted and listable. */
export function tidyRows(rows: BatchRow[]): { rows: BatchRow[]; tidies: TidyEdit[] } {
  const tidies: TidyEdit[] = [];
  const out = rows.map((r) => {
    const next = { ...r };
    const push = (field: string, from: string, to: string, note: string) => {
      if (from !== to) tidies.push({ row: r.row, field, from, to, note });
    };

    for (const f of ["sub_category", "brand_name", "campaign_name", "cities", "product_id", "targeting_details"] as const) {
      const trimmed = String(next[f] ?? "").replace(/\s+/g, " ").trim();
      push(f, String(next[f] ?? ""), trimmed, "Extra spaces removed");
      (next as Record<string, unknown>)[f] = trimmed;
    }

    const slug = resolveAlias(next.platform);
    if (slug && slug !== next.platform) {
      push("platform", next.platform, slug, `Recognised as ${platformDisplay(slug)}`);
      next.platform = slug;
    }

    const bt = String(next.budget_type ?? "").trim().toLowerCase();
    if (CANON_BUDGET.includes(bt) && bt !== next.budget_type) {
      push("budget_type", next.budget_type, bt, "Written in lower case");
      next.budget_type = bt;
    }

    const bv = String(next.budget_value ?? "").replace(/[,₹\s]|AED/gi, "");
    if (bv !== next.budget_value) {
      push("budget_value", next.budget_value, bv, "Currency symbol and separators removed");
      next.budget_value = bv;
    }

    const cur = currencyFor(next.platform);
    if (cur && next.currency.toUpperCase() !== cur) {
      push("currency", next.currency, cur, "Set from the platform");
      next.currency = cur;
    }

    return next;
  });
  return { rows: out, tidies };
}

let runSeq = 0;

export function buildRun(opts: {
  fileName: string;
  sizeKb: number;
  rows: BatchRow[];
  label?: string;
  parentId?: string;
  missingColumns?: string[];
  error?: string;
  errorState?: SheetRunState;
}): SheetRun {
  runSeq += 1;
  const id = `run-${Date.now()}-${runSeq}`;
  const base = {
    id,
    label: opts.label ?? "Original file",
    parentId: opts.parentId,
    fileName: opts.fileName,
    receivedAt: new Date().toISOString(),
    sizeKb: opts.sizeKb,
    missingColumns: opts.missingColumns ?? [],
  };

  if (opts.error) {
    return {
      ...base,
      rowsSeen: 0,
      rows: [],
      result: null,
      tidies: [],
      state: opts.errorState ?? "file_error",
      error: opts.error,
      cleanRows: [],
      heldRows: [],
    };
  }

  const { rows, tidies } = tidyRows(opts.rows);
  if (rows.length === 0) {
    return { ...base, rowsSeen: 0, rows: [], result: null, tidies, state: "empty", cleanRows: [], heldRows: [] };
  }

  const result = runQc({ rows, fileName: opts.fileName }, { depth: "all" });
  const { clean, blocked } = partitionRows(rows, result);
  const state: SheetRunState =
    blocked.length === 0 && result.warnings === 0
      ? "clean"
      : blocked.length === 0
        ? "warnings_only"
        : clean.length === 0
          ? "all_held"
          : "partial";

  return {
    ...base,
    rowsSeen: rows.length,
    rows,
    result,
    tidies,
    state,
    cleanRows: clean.map((r) => r.row),
    heldRows: blocked.map((r) => r.row),
  };
}

/** Re-scores an existing run after fixes, keeping the lineage. */
export function rerun(prev: SheetRun, rows: BatchRow[], label: string): SheetRun {
  return buildRun({
    fileName: prev.fileName,
    sizeKb: prev.sizeKb,
    rows,
    label,
    parentId: prev.id,
    missingColumns: prev.missingColumns,
  });
}

export function groupByRule(result: QcResult | null): RuleGroup[] {
  const map = new Map<string, QcFinding[]>();
  for (const f of result?.findings ?? []) {
    const list = map.get(f.rule_key) ?? [];
    list.push(f);
    map.set(f.rule_key, list);
  }
  return [...map.entries()]
    .map(([rule_key, findings]) => ({
      rule_key,
      title: RULE_INDEX[rule_key]?.title ?? findings[0].message,
      severity: findings[0].severity,
      rows: [...new Set(findings.map((f) => f.row))].sort((a, b) => a - b),
      findings,
      plain: RULE_EXPLANATIONS[rule_key]?.checked ?? findings[0].message,
    }))
    .sort((a, b) =>
      a.severity === b.severity ? b.findings.length - a.findings.length : a.severity === "blocker" ? -1 : 1,
    );
}

export function verdict(run: SheetRun): { headline: string; detail: string; tone: "green" | "amber" | "red" } {
  const clean = run.cleanRows.length;
  const held = run.heldRows.length;
  switch (run.state) {
    case "clean":
      return {
        headline: `All ${clean} rows are ready to push.`,
        detail: "Nothing needs fixing. Move to Review and push when you are ready.",
        tone: "green",
      };
    case "warnings_only":
      return {
        headline: `${clean} rows are ready to push, with ${run.result?.warnings ?? 0} things worth a look.`,
        detail: "None of these stop the push. Read them, then continue or fix them first.",
        tone: "amber",
      };
    case "partial":
      return {
        headline: `${clean} rows are ready. ${held} rows are held.`,
        detail: "The held rows stay visible and are never dropped. You can push the ready rows and come back to the rest.",
        tone: "amber",
      };
    case "all_held":
      return {
        headline: `All ${run.rowsSeen} rows are held.`,
        detail: "Every row has something that must be settled before it can be pushed.",
        tone: "red",
      };
    case "empty":
      return {
        headline: "The sheet has headers but no rows.",
        detail: "Add rows to batch_import, or start from the template.",
        tone: "red",
      };
    case "wrong_shape":
      return {
        headline: "This file is not in the shape we expect.",
        detail: run.error ?? "Columns are missing or renamed.",
        tone: "red",
      };
    default:
      return { headline: "The file could not be read.", detail: run.error ?? "", tone: "red" };
  }
}

export function receiptLine(run: SheetRun): string {
  const t = new Date(run.receivedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${run.fileName} · ${run.sizeKb.toFixed(0)} KB · received ${t} · ${run.rowsSeen} rows read`;
}
