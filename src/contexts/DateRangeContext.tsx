import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type TimePreset = "7D" | "30D" | "90D" | "custom";
export interface DateRange {
  from: Date;
  to: Date;
}

interface DateRangeContextValue {
  currentRange: DateRange;
  compareRange: DateRange | null;
  compareEnabled: boolean;
  timePreset: TimePreset;
  setTimePreset: (preset: TimePreset) => void;
  setCurrentRange: (range: DateRange) => void;
  setCompareRange: (range: DateRange | null) => void;
  setCompareEnabled: (enabled: boolean) => void;
}

const DateRangeContext = createContext<DateRangeContextValue | undefined>(undefined);

const daysBetween = (preset: TimePreset): number => {
  if (preset === "7D") return 7;
  if (preset === "30D") return 30;
  if (preset === "90D") return 90;
  return 30;
};

const computeRange = (preset: TimePreset): DateRange => {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - daysBetween(preset));
  return { from, to };
};

const computeCompare = (current: DateRange): DateRange => {
  const span = current.to.getTime() - current.from.getTime();
  const to = new Date(current.from.getTime() - 1);
  const from = new Date(to.getTime() - span);
  return { from, to };
};

export const DateRangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timePreset, setTimePresetState] = useState<TimePreset>("30D");
  const [currentRange, setCurrentRangeState] = useState<DateRange>(() => computeRange("30D"));
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [compareRange, setCompareRangeState] = useState<DateRange | null>(null);

  const setTimePreset = useCallback((preset: TimePreset) => {
    setTimePresetState(preset);
    if (preset !== "custom") {
      const range = computeRange(preset);
      setCurrentRangeState(range);
      setCompareRangeState((prev) => (compareEnabled ? computeCompare(range) : prev));
    }
  }, [compareEnabled]);

  const setCurrentRange = useCallback((range: DateRange) => {
    setCurrentRangeState(range);
    setTimePresetState("custom");
    setCompareRangeState((prev) => (compareEnabled ? computeCompare(range) : prev));
  }, [compareEnabled]);

  const setCompareRange = useCallback((range: DateRange | null) => {
    setCompareRangeState(range);
  }, []);

  const handleSetCompareEnabled = useCallback((enabled: boolean) => {
    setCompareEnabled(enabled);
    if (enabled) {
      setCompareRangeState(computeCompare(currentRange));
    } else {
      setCompareRangeState(null);
    }
  }, [currentRange]);

  const value = useMemo(() => ({
    currentRange,
    compareRange,
    compareEnabled,
    timePreset,
    setTimePreset,
    setCurrentRange,
    setCompareRange,
    setCompareEnabled: handleSetCompareEnabled,
  }), [currentRange, compareRange, compareEnabled, timePreset, setTimePreset, setCurrentRange, setCompareRange, handleSetCompareEnabled]);

  return <DateRangeContext.Provider value={value}>{children}</DateRangeContext.Provider>;
};

export const useDateRange = () => {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used within DateRangeProvider");
  return ctx;
};

export const formatRangeLabel = (range: DateRange): string => {
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(range.from)} – ${fmt(range.to)}`;
};
