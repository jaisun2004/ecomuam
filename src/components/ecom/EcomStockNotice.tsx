import React, { useState } from "react";

interface Props {
  /** one line per excluded city, already worded */
  lines: string[];
  /** compact one-liner with a link back to where it can be changed */
  summary?: { onSeeWhy: () => void };
}

/**
 * The single way an excluded city is shown. Amber, never blocking.
 * Two lines are shown, the rest fold behind "and N more".
 */
const EcomStockNotice: React.FC<Props> = ({ lines, summary }) => {
  const [open, setOpen] = useState(false);
  if (!lines.length) return null;

  if (summary) {
    return (
      <p className="text-[11px] text-sw-amber">
        {lines.length} {lines.length === 1 ? "city" : "cities"} excluded.{" "}
        <button onClick={summary.onSeeWhy} className="underline hover:text-foreground">See why</button>
      </p>
    );
  }

  const shown = open ? lines : lines.slice(0, 2);
  return (
    <div className="space-y-1">
      {shown.map((l) => (
        <p key={l} className="text-[11px] text-sw-amber">{l}</p>
      ))}
      {lines.length > 2 && (
        <button onClick={() => setOpen((v) => !v)} className="text-[10px] text-sw-amber underline hover:text-foreground">
          {open ? "Show fewer" : `and ${lines.length - 2} more`}
        </button>
      )}
    </div>
  );
};

export default EcomStockNotice;
