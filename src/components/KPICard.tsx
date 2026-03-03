import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: ReactNode;
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

const KPICard = ({ title, value, change, changeLabel, icon, variant = "default" }: KPICardProps) => {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <div className={cn(
      "rounded-xl border bg-card p-5 shadow-card transition-all duration-200 hover:shadow-card-md",
      variant === "primary" && "border-primary/20 bg-accent/50",
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className={cn(
          "h-10 w-10 rounded-lg flex items-center justify-center",
          variant === "default" && "bg-secondary text-secondary-foreground",
          variant === "primary" && "gradient-primary text-primary-foreground",
          variant === "success" && "bg-success/10 text-success",
          variant === "warning" && "bg-warning/10 text-warning",
          variant === "destructive" && "bg-destructive/10 text-destructive",
        )}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
            isPositive && "bg-success/10 text-success",
            isNegative && "bg-destructive/10 text-destructive",
            !isPositive && !isNegative && "bg-muted text-muted-foreground",
          )}>
            {isPositive ? <TrendingUp className="h-3 w-3" /> : isNegative ? <TrendingDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-heading font-bold text-foreground animate-count-up">{value}</p>
      <p className="text-sm text-muted-foreground mt-1">{title}</p>
      {changeLabel && <p className="text-xs text-muted-foreground mt-0.5">{changeLabel}</p>}
    </div>
  );
};

export default KPICard;
