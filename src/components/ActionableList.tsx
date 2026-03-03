import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, CheckCircle2, XCircle, Clock } from "lucide-react";

export interface ActionItem {
  id: string;
  severity: "critical" | "warning" | "info" | "success";
  title: string;
  description: string;
  metric?: string;
  action?: string;
}

interface ActionableListProps {
  items: ActionItem[];
  title?: string;
}

const severityConfig = {
  critical: {
    icon: XCircle,
    bg: "bg-destructive/8",
    border: "border-destructive/20",
    iconColor: "text-destructive",
    badge: "bg-destructive/10 text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-warning/8",
    border: "border-warning/20",
    iconColor: "text-warning",
    badge: "bg-warning/10 text-warning",
  },
  info: {
    icon: Clock,
    bg: "bg-info/8",
    border: "border-info/20",
    iconColor: "text-info",
    badge: "bg-info/10 text-info",
  },
  success: {
    icon: CheckCircle2,
    bg: "bg-success/8",
    border: "border-success/20",
    iconColor: "text-success",
    badge: "bg-success/10 text-success",
  },
};

const ActionableList = ({ items, title }: ActionableListProps) => {
  return (
    <div className="rounded-xl border bg-card shadow-card">
      {title && (
        <div className="px-5 py-4 border-b">
          <h3 className="font-heading font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="divide-y divide-border">
        {items.map((item) => {
          const config = severityConfig[item.severity];
          const Icon = config.icon;
          return (
            <div key={item.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-muted/50 transition-colors group">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
                <Icon className={cn("h-4 w-4", config.iconColor)} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              </div>
              {item.metric && (
                <span className={cn("text-xs font-semibold px-2 py-1 rounded-full shrink-0", config.badge)}>
                  {item.metric}
                </span>
              )}
              {item.action && (
                <button className="flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  {item.action} <ArrowRight className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ActionableList;
