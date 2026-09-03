import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { BATCH_FIELDS, FIELD_LABELS, type BatchRow, type QcResult } from "@/lib/ecom-qc/types";
import { findingsForRow } from "@/lib/ecom-qc/engine";

interface Props {
  rows: BatchRow[];
  result: QcResult | null;
  title?: string;
  defaultOpen?: boolean;
  onlyRows?: number[];
}

/** The sheet exactly as read, collapsed by default. Held rows stay visible. */
const EcomSheetTable: React.FC<Props> = ({ rows, result, title, defaultOpen = false, onlyRows }) => {
  const [open, setOpen] = useState(defaultOpen);
  const list = onlyRows ? rows.filter((r) => onlyRows.includes(r.row)) : rows;

  return (
    <div className="rounded-lg border border-subtle overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center gap-2 px-3 py-2 bg-surface-2 hover:bg-surface-3 text-left">
        {open ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
        <span className="text-[11px] text-foreground">{title ?? "The sheet as we read it"}</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">{list.length} rows</span>
      </button>
      {open && (
        <div className="overflow-x-auto max-h-[320px]">
          <table className="w-full text-[10px]">
            <thead className="sticky top-0">
              <tr className="bg-surface-2 border-b border-subtle">
                <th className="px-2 py-1.5 text-left font-mono text-muted-foreground">#</th>
                {BATCH_FIELDS.map((f) => (
                  <th key={f} className="px-2 py-1.5 text-left font-mono text-muted-foreground whitespace-nowrap">
                    {FIELD_LABELS[f]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle">
              {list.map((r) => {
                const f = findingsForRow(result, r.row);
                const held = f.some((x) => x.severity === "blocker");
                return (
                  <tr key={r.id} className={held ? "bg-sw-red-dim/40" : ""}>
                    <td className="px-2 py-1 font-mono text-muted-foreground whitespace-nowrap">
                      <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${held ? "bg-sw-red" : f.length ? "bg-sw-amber" : "bg-sw-green"}`} />
                      {r.row}
                    </td>
                    {BATCH_FIELDS.map((field) => {
                      const bad = f.some((x) => x.field === field);
                      return (
                        <td
                          key={field}
                          className={`px-2 py-1 font-mono whitespace-nowrap max-w-[220px] truncate ${bad ? "text-sw-red" : "text-foreground"}`}
                          title={String(r[field] ?? "")}
                        >
                          {String(r[field] ?? "") || "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EcomSheetTable;
