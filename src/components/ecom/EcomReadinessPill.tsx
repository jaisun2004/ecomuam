import React from "react";
import { Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { READINESS_TONE, type ProductReadinessSummary, type ReadinessCheck } from "@/lib/ecom-readiness";
import { UNCONFIRMED_LINE, asOfLabel } from "@/lib/ecom-reference/config";

interface Props {
  summary?: ProductReadinessSummary;
  check?: ReadinessCheck;
  compact?: boolean;
}

/** Readiness is always shown before selection, never as a bare colour. */
const EcomReadinessPill: React.FC<Props> = ({ summary, check, compact }) => {
  const state = summary?.state ?? check?.state ?? "unknown";
  const label = summary?.pill ?? (check ? stateLabel(check) : "Not checked");
  const findings = summary ? summary.checks.flatMap((c) => c.findings) : (check?.findings ?? []);
  const asOf = summary?.checks[0]?.data_as_of ?? check?.data_as_of;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-medium ${READINESS_TONE[state]}`}
          onClick={(e) => e.stopPropagation()}
        >
          {label}
          {!compact && <Info size={10} className="opacity-70" />}
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[340px] bg-surface-1 border-border-visible p-3">
        <p className="text-[11px] font-medium text-foreground mb-2">What we checked</p>
        {findings.length === 0 && (
          <p className="text-[11px] text-muted-foreground">Everything we check came back clear.</p>
        )}
        <ul className="space-y-2 max-h-[260px] overflow-y-auto">
          {dedupe(findings).map((f, i) => (
            <li key={`${f.signal_key}-${i}`} className="text-[11px]">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 align-middle ${
                  f.severity === "block" ? "bg-sw-red" : f.severity === "warn" ? "bg-sw-amber" : "bg-muted-foreground"
                }`}
              />
              <span className="text-foreground">{f.message}</span>
              <span className="block ml-3 text-muted-foreground font-mono text-[10px]">
                seen: {f.observed_value}
                {f.threshold ? ` · limit: ${f.threshold}` : ""}
              </span>
              {f.threshold && !f.threshold_confirmed && (
                <span className="block ml-3 text-[10px] text-muted-foreground italic">{UNCONFIRMED_LINE}</span>
              )}
            </li>
          ))}
        </ul>
        {summary && summary.blockedCities.length > 0 && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Not usable in: {summary.blockedCities.join(", ")}
          </p>
        )}
        <p className="mt-2 pt-2 border-t border-subtle text-[10px] text-muted-foreground">
          Data as of {asOf ? asOfLabel(new Date(asOf)) : "unknown"}.
        </p>
      </PopoverContent>
    </Popover>
  );
};

function stateLabel(c: ReadinessCheck): string {
  if (c.is_stale) return "Data is stale";
  if (c.state === "ready") return "Ready";
  if (c.state === "warning") return `${c.findings.length} to review`;
  if (c.state === "not_ready") return "Not ready";
  return "Not checked";
}

function dedupe<T extends { signal_key: string; message: string }>(list: T[]): T[] {
  const seen = new Set<string>();
  return list.filter((f) => {
    const k = `${f.signal_key}|${f.message}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export default EcomReadinessPill;
