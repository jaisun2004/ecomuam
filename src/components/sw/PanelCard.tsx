import React from "react";

interface PanelCardProps {
  title: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const badgeColors: Record<string, string> = {
  red: "text-sw-red bg-sw-red-dim",
  green: "text-sw-green bg-sw-green-dim",
  amber: "text-sw-amber bg-sw-amber-dim",
  accent: "text-primary bg-primary/15",
  purple: "text-sw-purple bg-sw-purple-dim",
  cyan: "text-sw-cyan bg-sw-cyan-dim",
  grey: "text-muted-foreground bg-surface-3",
};

const PanelCard: React.FC<PanelCardProps> = ({ title, badge, badgeColor = "accent", children, className = "", delay = 0 }) => {
  return (
    <div
      className={`bg-surface-1 border border-subtle rounded-2xl overflow-hidden opacity-0 animate-fade-slide-in ${className}`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className="px-5 py-4 border-b border-subtle flex items-center justify-between">
        <h3 className="font-display font-semibold text-sm text-foreground">{title}</h3>
        {badge && (
          <span className={`px-2 py-0.5 rounded-full font-mono text-[10px] ${badgeColors[badgeColor] || badgeColors.accent}`}>
            {badge}
          </span>
        )}
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default PanelCard;
