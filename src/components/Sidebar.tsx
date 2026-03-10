import React from "react";
import { LayoutGrid, ShoppingCart, Search, BarChart2, Radio, User, Package, DollarSign, Eye, Zap, CalendarDays, FileText, Target, Tv } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navSections = [
  {
    label: "PLANNING",
    items: [
      { id: "shelf", icon: LayoutGrid, label: "Digital Shelf", notify: false },
      { id: "discovery", icon: Search, label: "Discovery", notify: false },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { id: "availability", icon: Package, label: "Availability", notify: false },
      { id: "pricing", icon: DollarSign, label: "Pricing", notify: false },
      { id: "competitors", icon: Eye, label: "Competitor Ads Hub", notify: true },
    ],
  },
  {
    label: "CAMPAIGNS",
    items: [
      { id: "campaigns", icon: ShoppingCart, label: "Campaign Manager", notify: true },
      { id: "festival", icon: CalendarDays, label: "Festival Campaigns", notify: false },
    ],
  },
  {
    label: "OPTIMISATION",
    items: [
      { id: "budget", icon: Zap, label: "Budget Optimiser", notify: false },
      { id: "offline", icon: Tv, label: "Offline Ads", notify: false },
    ],
  },
  {
    label: "REPORTS",
    items: [
      { id: "reports", icon: BarChart2, label: "Reports", notify: false },
      { id: "alerts", icon: Radio, label: "Alerts", notify: true },
    ],
  },
];

interface SidebarProps {
  active: string;
  onChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onChange }) => {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[68px] bg-background border-r border-subtle flex flex-col items-center py-4 z-50 overflow-y-auto">
      <div
        className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4 accent-glow cursor-pointer flex-shrink-0"
        onClick={() => onChange("shelf")}
      >
        <span className="font-display font-bold text-primary-foreground text-sm">SW</span>
      </div>

      <div className="flex-1 flex flex-col items-center gap-0.5">
        {navSections.map((section, si) => (
          <React.Fragment key={section.label}>
            {si > 0 && <div className="w-8 h-px bg-surface-3 my-1.5 flex-shrink-0" />}
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="text-[6px] font-mono text-muted-foreground tracking-widest uppercase mb-0.5 cursor-default">{section.label.slice(0, 3)}</span>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-surface-3 text-foreground border-border-visible text-xs">
                {section.label}
              </TooltipContent>
            </Tooltip>
            {section.items.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.id;
              return (
                <Tooltip key={item.id}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onChange(item.id)}
                      className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
                        isActive
                          ? "bg-primary/20 text-primary accent-glow"
                          : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                      }`}
                    >
                      <Icon size={18} />
                      {item.notify && (
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="bg-surface-3 text-foreground border-border-visible text-xs">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onChange("account")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              active === "account"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            <User size={18} />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-surface-3 text-foreground border-border-visible text-xs">
          Account
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default Sidebar;
