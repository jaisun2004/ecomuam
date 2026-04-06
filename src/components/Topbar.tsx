import React, { useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, GitCompare } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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
  const [compareEnabled, setCompareEnabled] = useState(false);
  const [currentRange, setCurrentRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(2026, 2, 7),
    to: new Date(2026, 3, 6),
  });
  const [compareRange, setCompareRange] = useState<{ from?: Date; to?: Date }>({
    from: new Date(2026, 1, 5),
    to: new Date(2026, 2, 6),
  });

  return (
    <div className="sticky top-0 bg-background border-b border-subtle flex items-center justify-between px-6 z-40 min-h-[60px] py-2">
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
      <div className="flex items-center gap-3">
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

        {/* Compare toggle */}
        <button
          onClick={() => setCompareEnabled(!compareEnabled)}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
            compareEnabled
              ? "bg-primary/15 text-primary border border-primary/30"
              : "bg-surface-2 text-muted-foreground hover:text-foreground"
          }`}
        >
          <GitCompare size={12} />
          Compare
        </button>

        {/* Date range selectors (visible when compare enabled) */}
        {compareEnabled && (
          <div className="flex items-center gap-1.5">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 px-2 border-primary/30 text-foreground">
                  <CalendarIcon size={10} />
                  {currentRange.from && currentRange.to
                    ? `${format(currentRange.from, "MMM d")} – ${format(currentRange.to, "MMM d")}`
                    : "Current"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={currentRange as any}
                  onSelect={(range: any) => range && setCurrentRange(range)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>

            <span className="text-[10px] text-muted-foreground">vs</span>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 text-[10px] gap-1 px-2 border-dashed text-muted-foreground">
                  <CalendarIcon size={10} />
                  {compareRange.from && compareRange.to
                    ? `${format(compareRange.from, "MMM d")} – ${format(compareRange.to, "MMM d")}`
                    : "Compare"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="range"
                  selected={compareRange as any}
                  onSelect={(range: any) => range && setCompareRange(range)}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}

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
