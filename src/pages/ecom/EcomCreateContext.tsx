import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { BatchRow, QcFinding, QcResult } from "@/lib/ecom-qc/types";
import { applyAllFixable, applySuggestion, partitionRows, runQc } from "@/lib/ecom-qc/engine";
import type { SheetRun } from "@/lib/ecom-qc/sheet-run";

export type FlowSource = "ai" | "copy" | "manual" | null;

export interface HeldBatch {
  id: string;
  createdAt: string;
  fileName: string;
  note: string;
  rows: BatchRow[];
  result: QcResult | null;
  overrides: OverrideEntry[];
  reopenedAt?: string;
}

export interface OverrideEntry {
  id: string;
  row: number;
  signal: string;
  reason: string;
  at: string;
}

export interface PushOutcome {
  platform: string;
  mode: "api" | "export";
  rows: number;
  status: "pushed" | "exported" | "failed";
  detail: string;
}

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
  recheck: (rows?: BatchRow[]) => void;
  applyFix: (finding: QcFinding) => void;
  applyAllFixes: () => number;
  addRows: (rows: Omit<BatchRow, "id" | "row">[]) => void;
  keepOnlyCleanRows: () => { kept: number; dropped: number };

  /** Upload lineage. Every version stays; nothing is overwritten. */
  runs: SheetRun[];
  addRun: (run: SheetRun) => void;
  clearRuns: () => void;

  /** Rows parked for later, with their findings and overrides intact. */
  held: HeldBatch[];
  holdRows: (rows: BatchRow[], result: QcResult | null, fileName: string, note: string) => string;
  reopenHeld: (id: string) => void;
  dropHeld: (id: string) => void;

  overrides: OverrideEntry[];
  addOverride: (row: number, signal: string, reason: string) => void;

  pushed: boolean;
  setPushed: (p: boolean) => void;
  outcomes: PushOutcome[];
  setOutcomes: (o: PushOutcome[]) => void;
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
  const [runs, setRuns] = useState<SheetRun[]>([]);
  const [held, setHeld] = useState<HeldBatch[]>([]);
  const [overrides, setOverrides] = useState<OverrideEntry[]>([]);
  const [outcomes, setOutcomes] = useState<PushOutcome[]>([]);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const rowsRef = useRef(rows);
  rowsRef.current = rows;

  const ctxOf = useCallback((r: BatchRow[]) => ({ rows: r, fileName: fileName ?? undefined }), [fileName]);

  const setRows = useCallback((r: BatchRow[]) => {
    rowsRef.current = r;
    setRowsState(r);
  }, []);

  const runLive = useCallback(() => {
    setResult(runQc(ctxOf(rowsRef.current), { depth: "live" }));
  }, [ctxOf]);

  const runDeep = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setDeepPending(true);
    timer.current = setTimeout(() => {
      setResult(runQc(ctxOf(rowsRef.current), { depth: "all" }));
      setDeepPending(false);
    }, 1200);
  }, [ctxOf]);

  const recheck = useCallback(
    (r?: BatchRow[]) => {
      const target = r ?? rowsRef.current;
      if (r) setRows(r);
      setResult(runQc(ctxOf(target), { depth: "all" }));
    },
    [ctxOf, setRows],
  );

  const applyFix = useCallback(
    (finding: QcFinding) => {
      const next = rowsRef.current.map((r) => (r.row === finding.row ? applySuggestion(r, finding) : r));
      recheck(next);
    },
    [recheck],
  );

  const applyAllFixes = useCallback(() => {
    if (!result) return 0;
    const fixable = result.findings.filter((f) => f.fixable_inline && f.suggestion).length;
    recheck(applyAllFixable(rowsRef.current, result));
    return fixable;
  }, [result, recheck]);

  const addRows = useCallback(
    (incoming: Omit<BatchRow, "id" | "row">[]) => {
      const base = rowsRef.current;
      const next = [
        ...base,
        ...incoming.map((r, i) => ({ ...r, id: `add-${Date.now()}-${i}`, row: base.length + i + 1 } as BatchRow)),
      ];
      recheck(next);
    },
    [recheck],
  );

  const keepOnlyCleanRows = useCallback(() => {
    const { clean, blocked } = partitionRows(rowsRef.current, result);
    const renumbered = clean.map((r, i) => ({ ...r, row: i + 1 }));
    recheck(renumbered);
    return { kept: renumbered.length, dropped: blocked.length };
  }, [result, recheck]);

  const addRun = useCallback((run: SheetRun) => setRuns((prev) => [...prev, run]), []);
  const clearRuns = useCallback(() => setRuns([]), []);

  const holdRows = useCallback(
    (heldRows: BatchRow[], res: QcResult | null, file: string, note: string) => {
      const id = `held-${Date.now()}`;
      setHeld((prev) => [
        ...prev,
        {
          id,
          createdAt: new Date().toISOString(),
          fileName: file,
          note,
          rows: heldRows,
          result: res,
          overrides: [],
        },
      ]);
      return id;
    },
    [],
  );

  const reopenHeld = useCallback(
    (id: string) => {
      const batch = held.find((h) => h.id === id);
      if (!batch) return;
      const renumbered = batch.rows.map((r, i) => ({ ...r, row: i + 1 }));
      setFileName(batch.fileName);
      recheck(renumbered);
      setHeld((prev) => prev.map((h) => (h.id === id ? { ...h, reopenedAt: new Date().toISOString() } : h)));
    },
    [held, recheck],
  );

  const dropHeld = useCallback((id: string) => setHeld((prev) => prev.filter((h) => h.id !== id)), []);

  const addOverride = useCallback((row: number, signal: string, reason: string) => {
    setOverrides((prev) => [...prev, { id: `ovr-${Date.now()}-${row}`, row, signal, reason, at: new Date().toISOString() }]);
  }, []);

  const reset = useCallback(() => {
    setRows([]);
    setFileName(null);
    setSource(null);
    setResult(null);
    setDeepPending(false);
    setPushed(false);
    setRuns([]);
    setOverrides([]);
    setOutcomes([]);
  }, [setRows]);

  const value = useMemo(
    () => ({
      rows, setRows, fileName, setFileName, source, setSource, result, deepPending,
      runLive, runDeep, recheck, applyFix, applyAllFixes, addRows, keepOnlyCleanRows,
      runs, addRun, clearRuns, held, holdRows, reopenHeld, dropHeld,
      overrides, addOverride, pushed, setPushed, outcomes, setOutcomes, reset,
    }),
    [
      rows, setRows, fileName, source, result, deepPending, runLive, runDeep, recheck, applyFix,
      applyAllFixes, addRows, keepOnlyCleanRows, runs, addRun, clearRuns, held, holdRows, reopenHeld,
      dropHeld, overrides, addOverride, pushed, outcomes, reset,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useEcomCreate(): EcomCreateState {
  const v = useContext(Ctx);
  if (!v) throw new Error("useEcomCreate must be used inside EcomCreateProvider");
  return v;
}
