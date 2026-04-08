import React from "react";
import { useDateRange } from "@/contexts/DateRangeContext";

const ComparisonLegend: React.FC = () => {
  const { compareEnabled, dateLabel, compareDateLabel } = useDateRange();
  if (!compareEnabled) return null;
  return (
    <div className="flex items-center gap-4 mt-2 pt-2 border-t border-subtle text-[9px] text-muted-foreground">
      <span className="flex items-center gap-1.5">
        <span className="w-6 h-0.5 bg-foreground rounded-full" />
        Current ({dateLabel})
      </span>
      <span className="flex items-center gap-1.5">
        <span className="w-6 h-0.5 bg-muted-foreground rounded-full opacity-40" style={{ backgroundImage: "repeating-linear-gradient(90deg, currentColor 0 3px, transparent 3px 6px)" }} />
        Comparison ({compareDateLabel})
      </span>
    </div>
  );
};

export default ComparisonLegend;
