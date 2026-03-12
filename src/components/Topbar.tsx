import React from "react";
import { ChevronDown, Calendar } from "lucide-react";

export const PLATFORMS = [
  { name: "Amazon", color: "#FF9900", isNational: true },
  { name: "Flipkart", color: "#2F77FF", isNational: true },
  { name: "Blinkit", color: "#FDDC2B", isNational: false },
  { name: "Zepto", color: "#833AB4", isNational: false },
  { name: "Instamart", color: "#FC8019", isNational: false },
];

const timeRanges = ["7D", "30D", "90D"];

const viewLabels: Record<string, string> = {
  shelf: "Command Centre",
  campaigns: "Campaign Manager",
  discovery: "Discovery",
  reports: "Reports",
  availability: "Availability",
  pricing: "Pricing",
  alerts: "Alerts",
  account: "Account",
  competitors: "Competitor Ads Hub",
  festival: "Festival Campaigns",
  budget: "Budget Optimiser",
  offline: "Offline Ads",
};

interface TopbarProps {
  active: string;
  onChange: (id: string) => void;
  selectedPlatform: string;
  onPlatformChange: (p: string) => void;
  timeRange: string;
  onTimeRangeChange: (t: string) => void;
}

const Topbar: React.FC<TopbarProps> = ({ active, onChange, selectedPlatform, onPlatformChange, timeRange, onTimeRangeChange }) => {
  return (
    <div className="sticky top-0 h-[56px] bg-background/80 backdrop-blur-xl border-b border-subtle flex items-center justify-between px-6 z-40">
      {/* Left: Breadcrumb + View Name */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Beverages</span>
          <ChevronDown size={12} className="text-muted-foreground" />
        </div>
        <div className="h-4 w-px bg-surface-3" />
        <h2 className="font-display font-bold text-sm text-foreground">{viewLabels[active] || "Dashboard"}</h2>
      </div>

      {/* Center: Platform selector */}
      <div className="flex items-center bg-surface-2 rounded-xl p-1 gap-0.5">
        {PLATFORMS.map((p) => (
          <button
            key={p.name}
            onClick={() => onPlatformChange(p.name)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
              selectedPlatform === p.name
                ? "bg-primary/20 text-primary shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
            {p.name}
          </button>
        ))}
      </div>

      {/* Right: Time + Avatar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center bg-surface-2 rounded-lg p-0.5">
          {timeRanges.map((t) => (
            <button
              key={t}
              onClick={() => onTimeRangeChange(t)}
              className={`px-3 py-1 rounded-md font-mono text-[11px] font-medium transition-all ${
                timeRange === t
                  ? "bg-primary/20 text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-surface-2 text-[11px] text-muted-foreground">
          <Calendar size={12} />
          <span>Mar 5 – Mar 12</span>
        </div>

        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
          <span className="font-mono text-[10px] font-medium text-primary-foreground">AM</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
