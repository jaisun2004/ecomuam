import React from "react";

interface KPICardProps {
  title: string;
  value: string;
  delta: string;
  deltaType: "positive" | "negative" | "neutral" | "warning";
  sub: string;
  accentColor: string; // tailwind color class for top border
  sparkline?: React.ReactNode;
  delay?: number;
}

const deltaColors = {
  positive: "text-sw-green bg-sw-green-dim",
  negative: "text-sw-red bg-sw-red-dim",
  neutral: "text-muted-foreground bg-surface-3",
  warning: "text-sw-amber bg-sw-amber-dim",
};

const KPICard: React.FC<KPICardProps> = ({ title, value, delta, deltaType, sub, accentColor, sparkline, delay = 0 }) => {
  return (
    <div
      className="bg-surface-1 border border-subtle rounded-2xl p-5 relative overflow-hidden opacity-0 animate-fade-slide-in"
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`absolute top-0 left-0 right-0 h-[2px] ${accentColor}`} />
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-muted-foreground mb-1">{title}</p>
          <p className="font-display font-bold text-2xl text-foreground">{value}</p>
          <span className={`inline-block mt-1.5 px-2 py-0.5 rounded-full font-mono text-[10px] ${deltaColors[deltaType]}`}>
            {delta}
          </span>
          <p className="text-[11px] text-muted-foreground mt-2">{sub}</p>
        </div>
        {sparkline && <div className="flex-shrink-0 ml-2">{sparkline}</div>}
      </div>
    </div>
  );
};

export default KPICard;
