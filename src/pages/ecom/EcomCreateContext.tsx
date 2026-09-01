import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { BatchRow, QcFinding, QcResult } from "@/lib/ecom-qc/types";
import { applyAllFixable, applySuggestion, partitionRows, runQc } from "@/lib/ecom-qc/engine";

export type FlowSource = "ai" | "copy" | "manual" | null;

interface EcomCreateState {
  rows: BatchRow[];
  setRows: (rows: BatchRow[]) => void;
  fileName: string | null;
  setFileName: (n: string | null) => void;
  source: FlowSource;
  setSource: (s: FlowSource) => void;
  result: QcResult | null;
  deepPending: boolean;
  runLive: () => void;
  runDeep: () => void;
  applyFix: (finding: QcFinding) => void;
  applyAllFixes: () => number;
  addRows: (rows: Omit<BatchRow, "id" | "row">[]) => void;
  /** Drops every row that still has a blocking finding. Returns counts. */
  keepOnlyCleanRows: () => { kept: number; dropped: number };
  pushed: boolean;
  setPushed: (p: boolean) => void;
  reset: () => void;
}

const Ctx = createContext<EcomCreateState | null>(null);

export const EcomCreateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [rows, setRowsState] = useState<BatchRow[]>([]);
  const [fileName, setFileName] = useState<string | null>(null);
  const [source, setSource] = useState<FlowSource>(null);
  const [result, setResult] = useState<QcResult | null>(null);
  const [deepPending, setDeepPending] = useState(false);
  const [pushed, setPushed] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ctxOf = useCallback(
    (r: BatchRow[]) => ({ rows: r, fileName: fileName ?? undefined }),
    [fileName],
  );

  const runLive = useCallback(() => {
    setResult((prev) => {
      void prev;
      return runQc(ctxOf(rowsRef.current), { depth: "live" });
    });
  }, [ctxOf]);

  const runDeep = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDeepPending(true);
    timer.current = setTimeout(() => {
      setResult(runQc(ctxOf(rowsRef.current), { depth: "all" }));
      setDeepPending(false);
    }, 1400);
  }, [ctxOf]);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const setRows = useCallback((r: BatchRow[]) => {
    rowsRef.current = r;
    setRowsState(r);
  }, []);

  const applyFix = useCallback(
    (finding: QcFinding) => {
      const next = rowsRef.current.map((r) => (r.row === finding.row ? applySuggestion(r, finding) : r));
      setRows(next);
      setResult(runQc(ctxOf(next), { depth: "all" }));
    },
    [ctxOf, setRows],
  );

  const applyAllFixes = useCallback(() => {
    if (!result) return 0;
    const fixable = result.findings.filter((f) => f.fixable_inline && f.suggestion).length;
    const next = applyAllFixable(rowsRef.current, result);
    setRows(next);
    setResult(runQc(ctxOf(next), { depth: "all" }));
    return fixable;
  }, [result, ctxOf, setRows]);

  const addRows = useCallback(
    (incoming: Omit<BatchRow, "id" | "row">[]) => {
      const base = rowsRef.current;
      const next = [
        ...base,
        ...incoming.map((r, i) => ({ ...r, id: `reco-${Date.now()}-${i}`, row: base.length + i + 1 } as BatchRow)),
      ];
      setRows(next);
      setResult(runQc(ctxOf(next), { depth: "all" }));
    },
    [ctxOf, setRows],
  );

  const keepOnlyCleanRows = useCallback(() => {
    const { clean, blocked } = partitionRows(rowsRef.current, result);
    const renumbered = clean.map((r, i) => ({ ...r, row: i + 1 }));
    setRows(renumbered);
    setResult(runQc(ctxOf(renumbered), { depth: "all" }));
    return { kept: renumbered.length, dropped: blocked.length };
  }, [ctxOf, result, setRows]);

  const reset = useCallback(() => {
    setRows([]);
    setFileName(null);
    setSource(null);
    setResult(null);
    setDeepPending(false);
    setPushed(false);
  }, [setRows]);

  const value = useMemo(
    () => ({
      rows, setRows, fileName, setFileName, source, setSource, result, deepPending,
      runLive, runDeep, applyFix, applyAllFixes, addRows, keepOnlyCleanRows, pushed, setPushed, reset,
    }),
    [rows, setRows, fileName, source, result, deepPending, runLive, runDeep, applyFix, applyAllFixes, addRows, keepOnlyCleanRows, pushed, reset],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useEcomCreate(): EcomCreateState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEcomCreate must be used inside EcomCreateProvider");
  return v;
}
