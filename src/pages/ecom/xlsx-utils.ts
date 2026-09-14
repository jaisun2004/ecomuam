import * as XLSX from "xlsx";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { BATCH_FIELDS } from "@/lib/ecom-qc/types";
import { CITY_LIST, HISTORICAL_CONFIG, PRODUCT_LIST, SAMPLE_BATCH_ROWS } from "@/lib/ecom-reference/workbook-data";
import { RULES } from "@/lib/ecom-qc/rules";
import type { QcResult } from "@/lib/ecom-qc/types";

export const CANONICAL_HEADERS = [
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

/** Normalise verbose workbook headers ("end_date( leave blank if no date)") to canonical field names. */
export function normalizeHeader(h: string): string {
  return String(h || "")
    .toLowerCase()
    .replace(/\(.*?\)/g, "")
    .trim()
    .replace(/[\s-]+/g, "_");
}

let rowSeq = 0;
export function emptyRow(row: number): BatchRow {
  rowSeq += 1;
  return {
    id: `row-${Date.now()}-${rowSeq}`,
    row,
    sub_category: "",
    brand_name: "",
    platform: "",
    campaign_name: "",
    end_date: "",
    budget_type: "daily",
    budget_value: "",
    cities: "",
    product_id: "",
    targeting_details: "",
    currency: "",
    selected: true,
  };
}

export interface ParsedWorkbook {
  rows: BatchRow[];
  missingSheets: string[];
  headerMismatch: boolean;
}

export function parseWorkbook(file: File): Promise<ParsedWorkbook> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read the file."));
    reader.onload = () => {
      try {
        const wb = XLSX.read(reader.result, { type: "array" });
        const names = wb.SheetNames.map((n) => n.toLowerCase());
        const batchName = wb.SheetNames[names.indexOf("batch_import")] ?? wb.SheetNames[0];
        if (!batchName) return reject(new Error("No sheet found in the workbook."));
        const sheet = wb.Sheets[batchName];
        const raw: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
        if (raw.length === 0) return reject(new Error("The batch_import sheet is empty."));

        const headers = (raw[0] ?? []).map((h) => normalizeHeader(String(h)));
        const headerMismatch = CANONICAL_HEADERS.some((h) => !headers.includes(h));

        // Rows 2-3 (index 1-2) are format/example rows in the template — skip rows whose
        // sub_category cell is the literal "format"/"example" marker or that match header text.
        const body = raw.slice(1).filter((r) => {
          const first = String(r[0] ?? "").toLowerCase();
          const joined = r.join(" ").toLowerCase();
          if (!joined.trim()) return false;
          if (first.includes("format") || first.includes("example") || first.includes("text") && joined.includes("yyyy")) return false;
          return true;
        });

        const rows: BatchRow[] = body.map((r, i) => {
          const row = emptyRow(i + 1);
          CANONICAL_HEADERS.forEach((field) => {
            const idx = headers.indexOf(field);
            if (idx >= 0) (row as unknown as Record<string, unknown>)[field] = String(r[idx] ?? "").trim();
          });
          return row;
        });

        const missingSheets: string[] = [];
        // reference sheets are optional in uploads; bundled data is used instead
        resolve({ rows, missingSheets, headerMismatch });
      } catch (e) {
        reject(e instanceof Error ? e : new Error("Could not parse the workbook."));
      }
    };
    reader.readAsArrayBuffer(file);
  });
}

function sheetFromRows(rows: Record<string, string>[]): XLSX.WorkSheet {
  return XLSX.utils.json_to_sheet(rows, { header: CANONICAL_HEADERS });
}

/** Downloadable blank template carrying the two format/example rows from the source workbook. */
export function downloadTemplate() {
  const formatRow: Record<string, string> = {
    sub_category: "Format: text",
    brand_name: "text",
    platform: "text — canonical platform slug",
    campaign_name: "text",
    end_date: "YYYY-MM-DD (leave blank if no date)",
    budget_type: "daily | total",
    budget_value: "number",
    cities: "comma separated (all for pan india)",
    product_id: "comma separated codes",
    targeting_details: "keyword:match_type:bid; ...",
    currency: "derived from platform",
  };
  const exampleRow: Record<string, string> = {
    sub_category: "Example: Biscuits",
    brand_name: "Britannia",
    platform: "Blinkit",
    campaign_name: "britannia_blinkit_mumbai_defend_keyword_20260901_mf",
    end_date: "2026-09-30",
    budget_type: "daily",
    budget_value: "2000",
    cities: "Mumbai, Delhi NCR",
    product_id: "544531",
    targeting_details: "digestive biscuits:exact:12; marie biscuit:phrase:9",
    currency: "INR",
  };
  const samples = SAMPLE_BATCH_ROWS.map((s) => ({
    sub_category: s.subCategory,
    brand_name: s.brandName,
    platform: s.platform,
    campaign_name: s.campaignName,
    end_date: s.endDate,
    budget_type: s.budgetType,
    budget_value: s.budgetValue,
    cities: s.cities,
    product_id: s.productIds,
    targeting_details: s.targetingDetails,
    currency: s.currency,
  }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, sheetFromRows([formatRow, exampleRow, ...samples]), "batch_import");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(PRODUCT_LIST.map((p) => ({
    product_name: p.name,
    product_code: p.code,
    platform: p.platform,
  }))), "product_list");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(CITY_LIST.map((c) => ({
    platform: c.platform,
    platform_city: c.platformCity,
    geographical_city: c.geoCity,
  }))), "city_list");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(HISTORICAL_CONFIG.map((h) => ({
    platform: h.platform,
    campaign_name: h.name,
    budget_type: h.budgetType,
    budget_value: h.budgetValue,
    cities: h.cities,
    product_ids: h.productIds,
    targeting_details: h.targeting,
  }))), "historical_configuration");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(RULES.map((r) => ({
    rule_key: r.rule_key,
    group: r.group,
    severity: r.severity,
    when: r.when,
    title: r.title,
    rationale: r.rationale,
  }))), "qc_checks");
  XLSX.writeFile(wb, "campaign_batch_import_template.xlsx");
}

/** Workbook export of the current rows with a qc_status column per row. */
export function downloadAnnotated(rows: BatchRow[], result: QcResult | null) {
  const data = rows.map((r) => {
    const findings = result?.findings.filter((f) => f.row === r.row) ?? [];
    const blockers = findings.filter((f) => f.severity === "blocker");
    const status = blockers.length
      ? `BLOCKED — ${blockers.map((b) => b.rule_key).join("; ")}`
      : findings.length
        ? `WARNING — ${findings.map((w) => w.rule_key).join("; ")}`
        : "OK";
    const out: Record<string, string> = {};
    for (const f of BATCH_FIELDS) out[f] = String(r[f] ?? "");
    out.qc_status = status;
    return out;
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "batch_import");
  XLSX.writeFile(wb, "campaign_batch_import_annotated.xlsx");
}

const HOW_TO_FIX: Record<string, string> = {
  "budget.overall_requires_end_date": "Set end_date to a date after today, format YYYY-MM-DD.",
  "budget.daily_without_end_date_runs_until_paused": "Set end_date to a date after today, format YYYY-MM-DD.",
  "date.end_date_iso_or_blank": "Write the date as YYYY-MM-DD, for example 2026-09-30.",
  "date.end_date_in_future": "Set end_date to a date after today, format YYYY-MM-DD.",
  "taxonomy.name_unique_in_upload": "Rename one of them. Names must be unique inside an upload.",
  "mandatory.budget_value_positive": "Enter a positive number with no currency symbol, for example 2000.",
  "mandatory.budget_type_valid": "Use daily or overall.",
  "budget.numeric": "Enter a plain number with no commas or symbols, for example 2000.",
};

/** The exact replacement value, or where to find it. Actionable with the app closed. */
function howToFix(f: QcFinding, row: BatchRow | undefined): string {
  const platform = row?.platform ?? "";
  if (f.rule_key.startsWith("geo.")) {
    const match = CITY_LIST.find(
      (c) => c.platform === platform && c.geoCity.toLowerCase() === String(f.value).trim().toLowerCase(),
    );
    const named = match ? `Use ${match.platformCity}, ${platform}'s own name for ${f.value}. ` : "";
    return `${named}Valid ${platform} cities are on the city_list tab.`;
  }
  if (f.rule_key.startsWith("product.")) {
    const codes = PRODUCT_LIST.filter((p) => p.platform === platform).slice(0, 3).map((p) => p.code);
    return `Use a product code listed for ${platform} on the product_list tab${codes.length ? `, for example ${codes.join(", ")}` : ""}.`;
  }
  return HOW_TO_FIX[f.rule_key] ?? f.suggestion ?? RULE_EXPLANATIONS[f.rule_key]?.fix ?? "";
}

/**
 * The held rows only, in the batch_import shape, with three appended columns
 * so a planner can fix them in Excel and re-upload without reformatting.
 */
export function downloadHeldRows(rows: BatchRow[], result: QcResult | null) {
  const data = rows.map((r) => {
    const findings = (result?.findings ?? []).filter((f) => f.row === r.row);
    const blockers = findings.filter((f) => f.severity === "blocker");
    const shown = blockers.length ? blockers : findings;
    const out: Record<string, string> = {};
    for (const f of BATCH_FIELDS) out[f] = String(r[f] ?? "");
    out.qc_status = blockers.length ? "Blocker" : "Warning";
    out.qc_reason = shown.map((f) => f.message).join(" ");
    out.how_to_fix = shown.map((f) => howToFix(f, r)).filter(Boolean).join(" ");
    return out;
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    wb,
    XLSX.utils.json_to_sheet(data, { header: [...CANONICAL_HEADERS, "qc_status", "qc_reason", "how_to_fix"] }),
    "batch_import",
  );
  XLSX.writeFile(wb, "campaign_batch_import_held_rows.xlsx");
}

/** Corrected workbook download after chat-applied fixes. */
export function downloadCorrected(rows: BatchRow[]) {
  const data = rows.map((r) => {
    const out: Record<string, string> = {};
    for (const f of BATCH_FIELDS) out[f] = String(r[f] ?? "");
    return out;
  });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), "batch_import");
  XLSX.writeFile(wb, "campaign_batch_import_corrected.xlsx");
}
