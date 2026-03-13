import React, { useState } from "react";

interface TopbarProps {
  active: string;
  onChange: (id: string) => void;
}

const timeRanges = ["7D", "30D", "90D"];

const platformFilters = [
  { name: "Amazon", color: "#FF9900" },
  { name: "Blinkit", color: "#FDDC2B" },
  { name: "Flipkart", color: "#2F77FF" },
];

const Topbar: React.FC<TopbarProps> = ({ active, onChange }) => {
  const [timeRange, setTimeRange] = useState("30D");

  return (
    <div className="sticky top-0 h-[60px] bg-background border-b border-subtle flex items-center justify-between px-6 z-40">
      {/* Brand + Tabs */}
      <div className="flex items-center gap-6">
        <h1 className="font-display font-bold text-lg">
          <span className="text-foreground">shelf</span>
          <span className="text-primary">wise</span>
        </h1>

        <div className="flex items-center bg-surface-2 rounded-full p-0.5">
          <button
            onClick={() => onChange("shelf")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              active === "shelf"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📦 Digital Shelf
          </button>
          <button
            onClick={() => onChange("campaigns")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              active === "campaigns"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            📣 Campaigns
          </button>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-4">
        {/* Time Range */}
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5">
          {timeRanges.map((t) => (
            <button
              key={t}
              onClick={() => setTimeRange(t)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
                timeRange === t
                  ? "bg-surface-3 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Platform pills */}
        <div className="flex items-center gap-1.5">
          {platformFilters.map((p) => (
            <div
              key={p.name}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-2 text-[11px] text-muted-foreground"
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
              {p.name}
            </div>
          ))}
          <div className="px-2.5 py-1 rounded-full bg-surface-2 text-[11px] text-primary">+3 more</div>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-sw-purple flex items-center justify-center">
          <span className="font-mono text-[10px] font-medium text-primary-foreground">AM</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
