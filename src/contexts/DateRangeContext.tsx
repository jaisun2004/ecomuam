import React, { createContext, useContext, useState, useCallback } from "react";
import { subDays, format } from "date-fns";

interface DateRange {
  from?: Date;
  to?: Date;
}

interface DateRangeContextType {
  currentRange: DateRange;
  setCurrentRange: (r: DateRange) => void;
  compareRange: DateRange;
  setCompareRange: (r: DateRange) => void;
  compareEnabled: boolean;
  setCompareEnabled: (v: boolean) => void;
  timePreset: string;
  setTimePreset: (v: string) => void;
  dateLabel: string;
  compareDateLabel: string;
}

const getPresetRange = (preset: string): DateRange => {
  const today = new Date();
  const days = preset === "7D" ? 7 : preset === "30D" ? 30 : 90;
  return { from: subDays(today, days), to: today };
};

const DateRangeContext = createContext<DateRangeContextType | null>(null);

export const DateRangeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [timePreset, setTimePresetState] = useState("30D");
  const [currentRange, setCurrentRange] = useState<DateRange>(getPresetRange("30D"));
  const [compareRange, setCompareRange] = useState<DateRange>({
    from: subDays(new Date(), 60),
    to: subDays(new Date(), 31),
  });
  const [compareEnabled, setCompareEnabled] = useState(false);

  const setTimePreset = useCallback((preset: string) => {
    setTimePresetState(preset);
    setCurrentRange(getPresetRange(preset));
  }, []);

  const dateLabel = currentRange.from && currentRange.to
    ? `${format(currentRange.from, "MMM d")} – ${format(currentRange.to, "MMM d")}`
    : "";

  const compareDateLabel = compareRange.from && compareRange.to
    ? `${format(compareRange.from, "MMM d")} – ${format(compareRange.to, "MMM d")}`
    : "";

  return (
    <DateRangeContext.Provider value={{
      currentRange, setCurrentRange,
      compareRange, setCompareRange,
      compareEnabled, setCompareEnabled,
      timePreset, setTimePreset,
      dateLabel, compareDateLabel,
    }}>
      {children}
    </DateRangeContext.Provider>
  );
};

export const useDateRange = () => {
  const ctx = useContext(DateRangeContext);
  if (!ctx) throw new Error("useDateRange must be used within DateRangeProvider");
  return ctx;
};
