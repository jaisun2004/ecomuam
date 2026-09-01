import { RULES } from "./rules";
import type { BatchRow, QcContext, QcFinding, QcResult, RuleDef, Severity, When } from "./types";

function emit(rule: RuleDef, partials: Omit<QcFinding, "rule_key" | "group" | "severity" | "when">[]): QcFinding[] {
  return partials.map((p) => ({
    ...p,
    rule_key: rule.rule_key,
    group: rule.group,
    severity: rule.severity,
    when: rule.when,
  }));
}

export interface RunOptions {
  /** "live" runs only instant rules, "all" also runs the simulated deep rules. */
  depth?: "live" | "all";
  ruleKeys?: string[];
}

export function runQc(ctx: QcContext, opts: RunOptions = {}): QcResult {
  const depth = opts.depth ?? "all";
  const findings: QcFinding[] = [];

  const active = RULES.filter(
    (r) => (depth === "all" || r.when === "live") && (!opts.ruleKeys || opts.ruleKeys.includes(r.rule_key)),
  );

  for (const rule of active) {
    try {
      if (rule.batch) {
        const res = rule.batch(ctx);
        if (res?.length) findings.push(...emit(rule, res));
      }
      if (rule.row) {
        for (const row of ctx.rows) {
          const res = rule.row(row, ctx);
          if (res?.length) findings.push(...emit(rule, res));
        }
      }
    } catch {
      // a rule that throws must never take the batch down
    }
  }

  findings.sort((a, b) => a.row - b.row || (a.severity === b.severity ? 0 : a.severity === "blocker" ? -1 : 1));

  const blockers = findings.filter((x) => x.severity === "blocker").length;
  const warnings = findings.length - blockers;
  const score = scoreOf(blockers, warnings, ctx.rows.length);

  return {
    score,
    band: score >= 90 && blockers === 0 ? "green" : blockers === 0 ? "amber" : score >= 60 ? "amber" : "red",
    blockers,
    warnings,
    rows_checked: ctx.rows.length,
    findings,
    ran_at: new Date().toISOString(),
  };
}

export function scoreOf(blockers: number, warnings: number, rows: number): number {
  const base = Math.max(rows, 1);
  const penalty = (blockers * 6 + warnings * 1.5) / base;
  return Math.max(0, Math.min(100, Math.round(100 - penalty * 10)));
}

/** Findings for one row, used by the inline row editor. */
export function findingsForRow(result: QcResult | null, row: number): QcFinding[] {
  return result?.findings.filter((x) => x.row === row) ?? [];
}

export function blockersForRow(result: QcResult | null, row: number): QcFinding[] {
  return findingsForRow(result, row).filter((x) => x.severity === "blocker");
}

export function groupFindings(result: QcResult | null): { group: string; findings: QcFinding[] }[] {
  const map = new Map<string, QcFinding[]>();
  for (const x of result?.findings ?? []) {
    const list = map.get(x.group) ?? [];
    list.push(x);
    map.set(x.group, list);
  }
  return [...map.entries()].map(([group, f]) => ({ group, findings: f })).sort((a, b) => a.group.localeCompare(b.group));
}

export function countsBySeverity(findings: QcFinding[]): Record<Severity, number> {
  return {
    blocker: findings.filter((f) => f.severity === "blocker").length,
    warning: findings.filter((f) => f.severity === "warning").length,
  };
}

export function countsByWhen(findings: QcFinding[]): Record<When, number> {
  return {
    live: findings.filter((f) => f.when === "live").length,
    deep: findings.filter((f) => f.when === "deep").length,
  };
}

/** Apply a finding's suggestion to the row it belongs to. Returns a new row. */
export function applySuggestion(row: BatchRow, finding: QcFinding): BatchRow {
  if (!finding.suggestion || !finding.fixable_inline) return row;
  const field = finding.field as keyof BatchRow;
  const current = String(row[field] ?? "");
  let next: string;

  if (finding.field === "cities" || finding.field === "product_id") {
    next = current
      .split(",")
      .map((s) => (s.trim().toLowerCase() === finding.value.trim().toLowerCase() ? finding.suggestion! : s.trim()))
      .filter(Boolean)
      .join(", ");
  } else if (finding.field === "targeting_details") {
    next = current
      .split(";")
      .map((seg) => {
        const parts = seg.split(":").map((s) => s.trim());
        const replaced = parts.map((p) => (p.toLowerCase() === finding.value.trim().toLowerCase() ? finding.suggestion! : p));
        return replaced.join(":");
      })
      .join("; ");
  } else {
    next = finding.suggestion;
  }

  return { ...row, [field]: next } as BatchRow;
}

export function applyAllFixable(rows: BatchRow[], result: QcResult): BatchRow[] {
  let next = [...rows];
  for (const finding of result.findings) {
    if (!finding.fixable_inline || !finding.suggestion) continue;
    const idx = next.findIndex((r) => r.row === finding.row);
    if (idx === -1) continue;
    next[idx] = applySuggestion(next[idx], finding);
  }
  return next;
}

export function isPushBlocked(result: QcResult | null): boolean {
  return !result || result.blockers > 0;
}
