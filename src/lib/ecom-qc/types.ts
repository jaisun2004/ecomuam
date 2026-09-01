export type Severity = "blocker" | "warning";
export type When = "live" | "deep";

export interface QcFinding {
  rule_key: string; // e.g. "product.code_format_matches_platform"
  group: string; // "H. Products"
  severity: Severity;
  when: When;
  row: number; // 1-indexed row in batch_import
  field: string; // column name
  value: string; // the offending value, verbatim
  message: string; // one plain sentence
  suggestion?: string; // what to change it to, when derivable
  fixable_inline: boolean;
}

export interface QcResult {
  score: number; // 0-100
  band: "green" | "amber" | "red";
  blockers: number;
  warnings: number;
  rows_checked: number;
  findings: QcFinding[];
  ran_at: string;
}

/** Canonical in-memory shape of one batch_import row. */
export interface BatchRow {
  id: string;
  row: number;
  sub_category: string;
  brand_name: string;
  platform: string;
  campaign_name: string;
  end_date: string;
  budget_type: string;
  budget_value: string;
  cities: string;
  product_id: string;
  targeting_details: string;
  currency: string;
  selected?: boolean;
}

export const BATCH_FIELDS: (keyof BatchRow)[] = [
  "sub_category",
  "brand_name",
  "platform",
  "campaign_name",
  "end_date",
  "budget_type",
  "budget_value",
  "cities",
  "product_id",
  "targeting_details",
  "currency",
];

export const FIELD_LABELS: Record<string, string> = {
  sub_category: "sub_category",
  brand_name: "brand_name",
  platform: "platform",
  campaign_name: "campaign_name",
  end_date: "end_date",
  budget_type: "budget_type",
  budget_value: "budget_value",
  cities: "cities",
  product_id: "product_id",
  targeting_details: "targeting_details",
  currency: "currency",
  workbook: "workbook",
};

export interface QcContext {
  rows: BatchRow[];
  fileName?: string;
  /** header issues detected at parse time (group A) */
  structural?: { missingSheets: string[]; headerMismatch: boolean; rowCount: number };
}

export interface RuleDef {
  rule_key: string;
  group: string;
  severity: Severity;
  when: When;
  title: string;
  rationale: string;
  /** returns findings for a single row (row-scoped rules) */
  row?: (row: BatchRow, ctx: QcContext) => Omit<QcFinding, "rule_key" | "group" | "severity" | "when">[] | null;
  /** returns findings for the whole batch (cross-row rules) */
  batch?: (ctx: QcContext) => Omit<QcFinding, "rule_key" | "group" | "severity" | "when">[] | null;
}

export const QC_GROUPS = [
  "A. File and structure",
  "B. Mandatory fields",
  "C. Platform identity",
  "D. Taxonomy",
  "E. Budget",
  "F. Dates",
  "G. Cities and geography",
  "H. Products",
  "I. Targeting details",
] as const;
