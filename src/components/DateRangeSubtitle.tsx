import React from "react";
import { useDateRange, formatRangeLabel } from "@/contexts/DateRangeContext";

const DateRangeSubtitle: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { currentRange, compareRange, compareEnabled } = useDateRange();
  return (
    <p className={`text-[11px] text-muted-foreground font-mono ${className}`}>
      Showing: {formatRangeLabel(currentRange)}
      {compareEnabled && compareRange && (
        <> · vs <span className="text-primary">{formatRangeLabel(compareRange)}</span></>
      )}
    </p>
  );
};

export default DateRangeSubtitle;
