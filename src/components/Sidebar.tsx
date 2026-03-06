import React from "react";
import { LayoutGrid, ShoppingCart, Search, BarChart2, Radio, User, Package, DollarSign } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const navItems = [
  { id: "shelf", icon: LayoutGrid, label: "Digital Shelf", notify: false },
  { id: "campaigns", icon: ShoppingCart, label: "Campaigns", notify: true },
  { id: "divider1", icon: null, label: "", notify: false },
  { id: "discovery", icon: Search, label: "Discovery", notify: false },
  { id: "reports", icon: BarChart2, label: "Reports", notify: false },
  { id: "availability", icon: Package, label: "Availability", notify: false },
  { id: "pricing", icon: DollarSign, label: "Pricing", notify: false },
  { id: "alerts", icon: Radio, label: "Alerts", notify: true },
];

interface SidebarProps {
  active: string;
  onChange: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onChange }) => {
  return (
    <div className="fixed left-0 top-0 bottom-0 w-[68px] bg-background border-r border-subtle flex flex-col items-center py-4 z-50">
      <div
        className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-6 accent-glow cursor-pointer"
        onClick={() => onChange("shelf")}
      >
        <span className="font-display font-bold text-primary-foreground text-sm">SW</span>
      </div>

      <div className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item) => {
          if (item.id.startsWith("divider")) {
            return <div key={item.id} className="w-8 h-px bg-surface-3 my-2" />;
          }
          const Icon = item.icon!;
          const isActive = active === item.id;
          return (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onChange(item.id)}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
                    isActive
                      ? "bg-primary/20 text-primary accent-glow"
                      : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
                  }`}
                >
                  <Icon size={20} />
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
      </div>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onChange("account")}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 ${
              active === "account"
                ? "bg-primary/20 text-primary"
                : "text-muted-foreground hover:bg-surface-3 hover:text-foreground"
            }`}
          >
            <User size={20} />
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
