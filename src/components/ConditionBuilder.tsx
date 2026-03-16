import React from "react";
import {
  MetricCondition, MetricKey, Operator,
  METRIC_LABELS, METRIC_UNITS, METRIC_RANGES, OPERATOR_LABELS,
} from "@/contexts/GuardrailContext";

const ALL_METRICS = Object.keys(METRIC_LABELS) as MetricKey[];
const ALL_OPERATORS = Object.keys(OPERATOR_LABELS) as Operator[];

interface ConditionBuilderProps {
  value: MetricCondition;
  onChange: (c: MetricCondition) => void;
  compact?: boolean;
}

const selectStyle: React.CSSProperties = {
  background: "hsl(230,22%,8%)",
  borderColor: "rgba(255,255,255,0.12)",
};

const ConditionBuilder: React.FC<ConditionBuilderProps> = ({ value, onChange, compact }) => {
  const range = METRIC_RANGES[value.metric];

  return (
    <div className={`flex items-center gap-2 flex-wrap ${compact ? "text-[11px]" : "text-xs"}`}>
      {/* Metric */}
      <select
        className="px-2 py-1.5 rounded-lg border text-foreground font-medium"
        style={selectStyle}
        value={value.metric}
        onChange={(e) => onChange({ ...value, metric: e.target.value as MetricKey, value: 0 })}
      >
        {ALL_METRICS.map(m => (
          <option key={m} value={m}>{METRIC_LABELS[m]}</option>
        ))}
      </select>

      {/* Operator */}
      <select
        className="px-2 py-1.5 rounded-lg border text-foreground"
        style={selectStyle}
        value={value.operator}
        onChange={(e) => onChange({ ...value, operator: e.target.value as Operator })}
      >
        {ALL_OPERATORS.map(o => (
          <option key={o} value={o}>{OPERATOR_LABELS[o]}</option>
        ))}
      </select>

      {/* Value */}
      <div className="flex items-center gap-1">
        <input
          type="number"
          className="w-20 px-2 py-1.5 rounded-lg border text-foreground font-mono text-right"
          style={selectStyle}
          min={range.min}
          max={range.max}
          step={range.step}
          value={value.value}
          onChange={(e) => {
            let v = parseFloat(e.target.value) || 0;
            v = Math.max(range.min, Math.min(range.max, v));
            onChange({ ...value, value: v });
          }}
        />
        <span className="text-muted-foreground font-mono">{METRIC_UNITS[value.metric]}</span>
      </div>

      {/* Consecutive days */}
      <span className="text-muted-foreground ml-1">for</span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onChange({ ...value, consecutive_days: Math.max(1, value.consecutive_days - 1) })}
          className="w-6 h-6 rounded border text-foreground flex items-center justify-center hover:bg-muted/30"
          style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}
        >−</button>
        <span className="font-mono text-foreground w-5 text-center">{value.consecutive_days}</span>
        <button
          onClick={() => onChange({ ...value, consecutive_days: Math.min(30, value.consecutive_days + 1) })}
          className="w-6 h-6 rounded border text-foreground flex items-center justify-center hover:bg-muted/30"
          style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}
        >+</button>
      </div>
      <span className="text-muted-foreground">
        {value.consecutive_days === 1 ? "(trigger immediately)" : "days in a row"}
      </span>
    </div>
  );
};

export default ConditionBuilder;
