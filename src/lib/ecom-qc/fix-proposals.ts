import type { BatchRow, QcFinding, QcResult } from "./types";
import { RULE_EXPLANATIONS } from "./explanations";
import { applySuggestion } from "./engine";
import { PLATFORMS, citiesFor, currencyFor, productsFor } from "@/lib/ecom-reference/platforms";

export type ProposalControl = "select" | "text" | "number" | "date";

export interface FixProposal {
  id: string;
  row: number;
  field: string;
  current: string;
  proposed: string;
  control: ProposalControl;
  options: string[];
  /** Where the suggested value came from. Never a guess. */
  source: string;
  explanation: string;
  finding: QcFinding;
}

function optionsFor(field: string, row: BatchRow | undefined): { control: ProposalControl; options: string[]; source: string } {
  switch (field) {
    case "platform":
      return { control: "select", options: PLATFORMS.map((p) => p.slug), source: "Platform list in the workbook" };
    case "cities":
      return {
        control: "select",
        options: row ? citiesFor(row.platform).map((c) => c.platformCity) : [],
        source: "City list for this platform in the workbook",
      };
    case "product_id":
      return {
        control: "select",
        options: row ? productsFor(row.platform).slice(0, 400).map((p) => p.code) : [],
        source: "Product list for this platform in the workbook",
      };
    case "currency":
      return {
        control: "select",
        options: row ? [currencyFor(row.platform) ?? ""].filter(Boolean) : [],
        source: "Currency is fixed by the platform",
      };
    case "budget_type":
      return { control: "select", options: ["daily", "total"], source: "Allowed budget types" };
    case "budget_value":
      return { control: "number", options: [], source: "Budget floor in config" };
    case "end_date":
      return { control: "date", options: [], source: "Date format required by the sheet" };
    default:
      return { control: "text", options: [], source: "Rule catalogue in the uploaded workbook" };
  }
}

/** Proposals are suggestions only. Nothing is applied until the user accepts. */
export function proposalsFor(result: QcResult | null, rows: BatchRow[]): FixProposal[] {
  const byRow = new Map(rows.map((r) => [r.row, r]));
  return (result?.findings ?? [])
    .filter((f) => f.suggestion && f.fixable_inline)
    .map((f, i) => {
      const row = byRow.get(f.row);
      const { control, options, source } = optionsFor(f.field, row);
      return {
        id: `fix-${f.rule_key}-${f.row}-${i}`,
        row: f.row,
        field: f.field,
        current: f.value || String(row?.[f.field as keyof BatchRow] ?? ""),
        proposed: f.suggestion!,
        control,
        options,
        source,
        explanation: RULE_EXPLANATIONS[f.rule_key]?.fix ?? f.message,
        finding: f,
      };
    });
}

/** Findings that need a human decision because no reference value can be derived. */
export function manualDecisions(result: QcResult | null): QcFinding[] {
  return (result?.findings ?? []).filter((f) => !(f.suggestion && f.fixable_inline));
}

/** Applies an accepted proposal, optionally with a value the user edited. */
export function applyProposal(rows: BatchRow[], proposal: FixProposal, value?: string): BatchRow[] {
  const finding = value ? { ...proposal.finding, suggestion: value } : proposal.finding;
  return rows.map((r) => (r.row === proposal.row ? applySuggestion(r, finding) : r));
}

export function applyProposals(rows: BatchRow[], proposals: FixProposal[]): BatchRow[] {
  let next = rows;
  for (const p of proposals) next = applyProposal(next, p);
  return next;
}
