import { Search, Bell, Calendar, ChevronDown, Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TopBar = () => {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-5 shrink-0">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
          <span>All Platforms</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
          <span>All Categories</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium cursor-pointer hover:bg-accent transition-colors">
          <Calendar className="h-3.5 w-3.5" />
          <span>Last 30 days</span>
          <ChevronDown className="h-3.5 w-3.5" />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            placeholder="Search products, brands..."
            className="h-9 w-56 rounded-lg border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all"
          />
        </div>
        <button className="relative h-9 w-9 rounded-lg border border-input flex items-center justify-center hover:bg-accent transition-colors">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
            3
          </span>
        </button>
        <div className="h-9 w-9 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-sm font-bold cursor-pointer">
          PM
        </div>
      </div>
    </header>
  );
};

export default TopBar;
