import React, { useState } from "react";
import { LayoutGrid, ShoppingCart, Search, BarChart2, Radio, User, Package, DollarSign, Eye, Zap, CalendarDays, FileText, Target, Tv, ChevronLeft, ChevronRight, PanelLeftClose, PanelLeft, Shield, Gauge, PieChart, FileCheck, Settings, Database, LayoutList, MapPin, Lightbulb, KeyRound, ClipboardCheck, Trophy, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const cockpitItem = { id: "cockpit", icon: Gauge, label: "Central Cockpit", notify: false };

const navSections = [
  {
    label: "INSIGHTS",
    items: [
      { id: "availability", icon: Package, label: "Availability", notify: false },
      { id: "pricing", icon: DollarSign, label: "Pricing", notify: false },
      { id: "keywordanalysis", icon: KeyRound, label: "Keyword Analysis", notify: false },
      { id: "contentaudit", icon: FileCheck, label: "Content Quality Score", notify: false },
    ],
  },
  {
    label: "CAMPAIGNS",
    items: [
      { id: "campaigns", icon: ShoppingCart, label: "Campaign Manager", notify: true },
    ],
  },
  {
    label: "OPTIMISATION",
    items: [
      { id: "recommendations", icon: Sparkles, label: "Recommendations", notify: true },
      { id: "budget", icon: Zap, label: "Budget Optimiser", notify: false },
    ],
  },
  {
    label: "CONFIGURATIONS",
    items: [
      { id: "guardrails", icon: Shield, label: "Guardrails", notify: false },
      { id: "taxonomy", icon: Settings, label: "Taxonomy Config", notify: false },
      { id: "crawling", icon: Database, label: "Crawling Inputs", notify: false },
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
  expanded: boolean;
  onToggleExpand: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ active, onChange, expanded, onToggleExpand }) => {
  const renderItem = (item: typeof cockpitItem, isCockpit = false) => {
    const Icon = item.icon;
    const isActive = active === item.id;

    if (expanded) {
      return (
        <button
          key={item.id}
          onClick={() => onChange(item.id)}
          className={`relative flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 flex-shrink-0 text-left ${
            isActive
              ? "bg-white/20 text-white"
              : "text-white/60 hover:bg-white/10 hover:text-white"
          }`}
        >
          <Icon size={16} className="flex-shrink-0" />
          <span className={`text-[12px] font-medium truncate ${isCockpit && !isActive ? "text-white/80" : ""}`}>{item.label}</span>
          {item.notify && (
            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-destructive" />
          )}
        </button>
      );
    }

    return (
      <Tooltip key={item.id}>
        <TooltipTrigger asChild>
          <button
            onClick={() => onChange(item.id)}
            className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 ${
              isActive
                ? "bg-white/20 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Icon size={18} />
            {item.notify && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-destructive" />
            )}
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="bg-popover text-popover-foreground border text-xs">
          {item.label}
        </TooltipContent>
      </Tooltip>
    );
  };

  return (
    <div
      className={`fixed left-0 top-0 bottom-0 bg-sidebar border-r border-sidebar-border flex flex-col py-4 z-50 overflow-y-auto overflow-x-hidden transition-all duration-300 ease-in-out ${
        expanded ? "w-[220px]" : "w-[68px]"
      }`}
    >
      <div className={`flex items-center mb-4 flex-shrink-0 ${expanded ? "px-4 justify-between" : "justify-center"}`}>
        <div
          className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center cursor-pointer flex-shrink-0"
          onClick={() => onChange("cockpit")}
        >
          <span className="font-display font-bold text-white text-sm">SW</span>
        </div>
        {expanded && (
          <span className="font-display font-bold text-white text-sm ml-2 flex-1 truncate">
            shelf<span className="text-white/70">wise</span>
          </span>
        )}
        <button
          onClick={onToggleExpand}
          className={`p-1.5 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all flex-shrink-0 ${
            expanded ? "" : "mt-2"
          }`}
        >
          {expanded ? <PanelLeftClose size={16} /> : <PanelLeft size={16} />}
        </button>
      </div>

      <div className={`flex-1 flex flex-col gap-0.5 ${expanded ? "px-3" : "items-center"}`}>
        {renderItem(cockpitItem, true)}
        <div className={`h-px bg-white/10 flex-shrink-0 ${expanded ? "my-2" : "w-8 my-1.5"}`} />

        {navSections.map((section, si) => (
          <React.Fragment key={section.label}>
            {si > 0 && (
              <div className={`h-px bg-white/10 flex-shrink-0 ${expanded ? "my-2" : "w-8 my-1.5"}`} />
            )}
            {expanded ? (
              <p className="text-[10px] font-mono text-white/40 tracking-widest uppercase px-2 py-1.5 flex-shrink-0">
                {section.label}
              </p>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-[6px] font-mono text-white/40 tracking-widest uppercase mb-0.5 cursor-default">
                    {section.label.slice(0, 3)}
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-surface-3 text-foreground border-border-visible text-xs">
                  {section.label}
                </TooltipContent>
              </Tooltip>
            )}
            {section.items.map((item) => renderItem(item))}
          </React.Fragment>
        ))}
      </div>

      {expanded ? (
        <div className="px-3 pt-2 flex-shrink-0">
          <div className="h-px bg-white/10 mb-2" />
          <button
            onClick={() => onChange("account")}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 ${
              active === "account"
                ? "bg-white/20 text-white"
                : "text-white/60 hover:bg-white/10 hover:text-white"
            }`}
          >
            <User size={16} />
            <span className="text-[12px] font-medium">Account</span>
          </button>
        </div>
      ) : (
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onChange("account")}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 flex-shrink-0 self-center ${
                active === "account"
                  ? "bg-white/20 text-white"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              <User size={18} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" className="bg-surface-3 text-foreground border-border-visible text-xs">
            Account
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default Sidebar;
