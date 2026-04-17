import React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange as DRPickerRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { useDateRange, formatRangeLabel, TimePreset } from "@/contexts/DateRangeContext";
import { cn } from "@/lib/utils";

interface TopbarProps {
  active: string;
  onChange: (id: string) => void;
}

const presets: TimePreset[] = ["7D", "30D", "90D"];

const platformFilters = [
  { name: "Amazon", color: "#FF9900" },
  { name: "Blinkit", color: "#FDDC2B" },
  { name: "Flipkart", color: "#2F77FF" },
];

const Topbar: React.FC<TopbarProps> = ({ active, onChange }) => {
  const {
    currentRange,
    compareRange,
    compareEnabled,
    timePreset,
    setTimePreset,
    setCurrentRange,
    setCompareRange,
    setCompareEnabled,
  } = useDateRange();

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
      <div className="flex items-center gap-3">
        {/* Preset pills */}
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5">
          {presets.map((t) => (
            <button
              key={t}
              onClick={() => setTimePreset(t)}
              className={`px-2.5 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
                timePreset === t
                  ? "bg-surface-3 text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Primary date range */}
        <Popover>
          <PopoverTrigger asChild>
            <button
              className={cn(
                "flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-surface-2 border border-subtle text-[11px] font-mono text-foreground hover:bg-surface-3 transition-colors",
                timePreset === "custom" && "border-primary/40"
              )}
            >
              <CalendarIcon className="h-3 w-3 text-muted-foreground" />
              {formatRangeLabel(currentRange)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="range"
              selected={{ from: currentRange.from, to: currentRange.to } as DRPickerRange}
              onSelect={(r) => {
                if (r?.from && r?.to) setCurrentRange({ from: r.from, to: r.to });
              }}
              numberOfMonths={2}
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>

        {/* Compare toggle */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground">Compare</span>
          <Switch checked={compareEnabled} onCheckedChange={setCompareEnabled} />
        </div>

        {/* Secondary compare range */}
        {compareEnabled && compareRange && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="flex items-center gap-1.5 h-8 px-2.5 rounded-lg bg-surface-2 border border-dashed border-primary/40 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors">
                <CalendarIcon className="h-3 w-3" />
                vs {formatRangeLabel(compareRange)}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="range"
                selected={{ from: compareRange.from, to: compareRange.to } as DRPickerRange}
                onSelect={(r) => {
                  if (r?.from && r?.to) setCompareRange({ from: r.from, to: r.to });
                }}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
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
