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
  /** The workbook carries no limit behind this check, so it can only warn. */
  unconfirmed: boolean;
}

/** What is wrong, written as the failure and not as the rule that should hold. */
export const RULE_FAILURE: Record<string, string> = {
  "file.required_sheets_present": "A required sheet is missing from the workbook",
  "file.header_row_matches": "Header row does not match the template",
  "file.row_count_within_range": "Row count is outside the allowed range",
  "file.no_merged_cells": "batch_import contains merged cells",
  "file.no_html_or_script": "A cell contains HTML or script",
  "mandatory.sub_category_present": "sub_category is missing",
  "mandatory.platform_present": "platform is missing",
  "mandatory.campaign_name_present": "campaign_name is missing",
  "mandatory.budget_type_valid": "budget_type is not overall or daily",
  "mandatory.budget_value_positive": "budget_value is missing or not a positive number",
  "mandatory.cities_present": "cities is missing",
  "mandatory.product_id_present": "product_id is missing",
  "mandatory.targeting_present": "targeting_details is missing",
  "platform.canonical_name": "Platform name is not recognised",
  "platform.match_types_supported": "Match type is not supported on this platform",
  "platform.reference_data_available": "No reference data for this platform",
  "taxonomy.name_unique_in_upload": "Campaign name repeats inside this file",
  "taxonomy.name_not_numeric": "Campaign name is only numbers",
  "taxonomy.name_charset": "Campaign name uses characters the platform rejects",
  "taxonomy.name_length_cap": "Campaign name is longer than the platform allows",
  "taxonomy.no_active_duplicate_on_platform": "Campaign name may already be live on this platform",
  "budget.numeric": "Budget value is not a plain number",
  "budget.daily_above_floor": "Daily budget may be below the platform minimum",
  "budget.overall_requires_end_date": "Overall budget with no end_date",
  "budget.daily_without_end_date_runs_until_paused": "Daily budget with no end_date runs until paused",
  "budget.currency_matches_platform_geo": "Currency does not match the platform",
  "budget.within_brand_wallet": "Batch spend exceeds the brand wallet",
  "date.end_date_iso_or_blank": "end_date is not in YYYY-MM-DD format",
  "date.end_date_in_future": "end_date is in the past",
  "geo.city_in_platform_city_list": "City is not in city_list for this platform",
  "geo.platform_city_not_geographical": "City uses the geographical name, not the platform name",
  "geo.city_is_not_country": "A country is used where a city is expected",
  "geo.no_duplicate_city_in_row": "The same city repeats in one row",
  "product.exists_in_product_list": "Product is not in product_list for this platform",
  "product.code_format_matches_platform": "SKU code does not match the platform format",
  "product.no_duplicate_in_row": "The same product repeats in one row",
  "product.sku_cap_per_campaign": "More SKUs than the platform cap",
  "product.in_stock_in_targeted_cities": "SKU is out of stock in a targeted city",
  "targeting.segment_has_three_parts": "Targeting segment is not in the expected format",
  "targeting.match_type_enum": "Match type is not one of the accepted values",
  "targeting.bid_numeric_or_range": "Bid is not a number or a range",
  "targeting.bid_above_floor": "Bid may be below the platform minimum",
  "targeting.bid_range_supported": "Bid ranges are not supported on this platform",
  "targeting.bid_decimal_format": "Bid has too many decimal places",
  "targeting.keyword_min_length": "Keyword is shorter than 3 characters",
  "targeting.keyword_not_placeholder": "Keyword is a placeholder",
  "targeting.no_duplicate_keyword_in_row": "The same keyword repeats in one row",
  "targeting.keyword_cap_per_campaign": "More keywords than the platform cap",
  "targeting.no_duplicate_row_combination": "Two rows target the same thing",
};

/** These four have no limit in the workbook, so they warn and never hold a row. */
export const UNCONFIRMED_RULES = new Set([
  "platform.match_types_supported",
  "targeting.bid_above_floor",
  "budget.daily_above_floor",
  "taxonomy.no_active_duplicate_on_platform",
]);

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

export function verdict(
  run: SheetRun,
  unit: "row" | "campaign" = "row",
): { headline: string; detail: string; tone: "green" | "amber" | "red" } {
  const clean = run.cleanRows.length;
  const held = run.heldRows.length;
  const u = (count: number) => `${count} ${unit}${count === 1 ? "" : "s"}`;
  switch (run.state) {
    case "clean":
      return {
        headline: `${u(clean)} ready to push.`,
        detail: "Nothing needs fixing. Move to Review and push when you are ready.",
        tone: "green",
      };
    case "warnings_only":
      return {
        headline: `${u(clean)} ready to push, with ${run.result?.warnings ?? 0} thing${(run.result?.warnings ?? 0) === 1 ? "" : "s"} worth a look.`,
        detail: "None of these stop the push. Read them, then continue or fix them first.",
        tone: "amber",
      };
    case "partial":
      return {
        headline: `${u(clean)} ready, ${u(held)} held.`,
        detail: `The held ${unit}s stay visible and are never dropped. You can push the ready ones and come back to the rest.`,
        tone: "amber",
      };
    case "all_held":
      return {
        headline: `All ${u(run.rowsSeen)} held.`,
        detail: `Every ${unit} has something that must be settled before it can be pushed.`,
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

export function receiptLine(run: SheetRun, unit: "row" | "campaign" = "row"): string {
  const t = new Date(run.receivedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (unit === "campaign") {
    return `${run.rowsSeen} campaign${run.rowsSeen === 1 ? "" : "s"} · built ${t}`;
  }
  return `${run.fileName} · ${run.sizeKb.toFixed(0)} KB · received ${t} · ${run.rowsSeen} rows read`;
}
