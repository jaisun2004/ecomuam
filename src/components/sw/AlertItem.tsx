import React, { useState } from "react";

interface AlertItemProps {
  severity: "critical" | "warning" | "success" | "info";
  icon: string;
  title: string;
  detail: string;
  meta: string;
  action: string;
  actionDone?: string;
}

const borderColors = {
  critical: "border-l-sw-red",
  warning: "border-l-sw-amber",
  success: "border-l-sw-green",
  info: "border-l-primary",
};

const AlertItem: React.FC<AlertItemProps> = ({ severity, icon, title, detail, meta, action, actionDone }) => {
  const [done, setDone] = useState(false);

  return (
    <div className={`bg-surface-2 rounded-xl border border-subtle border-l-[3px] ${borderColors[severity]} p-4 flex items-start gap-3`}>
      <span className="text-lg flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{detail}</p>
        <p className="text-[10px] text-muted-foreground mt-1.5 font-mono">{meta}</p>
      </div>
      <button
        onClick={() => setDone(true)}
        className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
          done
            ? "bg-sw-green-dim text-sw-green"
            : "bg-surface-3 text-foreground hover:bg-primary/20 hover:text-primary"
        }`}
      >
        {done ? (actionDone || "✓ Done") : action}
      </button>
    </div>
  );
};

export default AlertItem;
