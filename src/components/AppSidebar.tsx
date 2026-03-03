import { cn } from "@/lib/utils";
import {
  BarChart3,
  Box,
  DollarSign,
  Layers,
  TrendingUp,
  Activity,
  Settings,
  HelpCircle,
  LayoutDashboard,
  FileText,
  Megaphone,
  Lightbulb,
  PieChart,
} from "lucide-react";

interface SidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const navSections = [
  {
    label: "INTELLIGENCE",
    items: [
      { id: "availability", label: "Availability", icon: Box },
      { id: "pricing", label: "Pricing Analysis", icon: DollarSign },
      { id: "shelf", label: "Share of Shelf", icon: Layers },
      { id: "rank", label: "Rank & Market Share", icon: TrendingUp },
    ],
  },
  {
    label: "OPTIMISATION",
    items: [
      { id: "content", label: "Content Audit", icon: FileText },
      { id: "ads", label: "Ad Optimisation", icon: Megaphone },
      { id: "category", label: "Category & NPD", icon: Lightbulb },
    ],
  },
  {
    label: "OVERVIEW",
    items: [
      { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
      { id: "reports", label: "Reports", icon: BarChart3 },
    ],
  },
];

const AppSidebar = ({ activeSection, onSectionChange }: SidebarProps) => {
  return (
    <aside className="w-[240px] min-h-screen gradient-sidebar flex flex-col">
      <div className="px-5 py-5 flex items-center gap-2.5">
        <Activity className="h-7 w-7 text-sidebar-primary" />
        <span className="font-heading text-lg font-bold text-sidebar-primary-foreground tracking-tight">
          MarketLift AI
        </span>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-6">
        {navSections.map((section) => (
          <div key={section.label}>
            <p className="px-3 mb-2 text-[11px] font-semibold tracking-widest text-sidebar-muted uppercase">
              {section.label}
            </p>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                      isActive
                        ? "gradient-primary text-sidebar-primary-foreground shadow-card-md"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <Settings className="h-[18px] w-[18px]" />
          <span>Settings</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <HelpCircle className="h-[18px] w-[18px]" />
          <span>Help Center</span>
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;
