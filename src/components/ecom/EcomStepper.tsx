import React from "react";
import { Check } from "lucide-react";

interface Props {
  steps: string[];
  current: number;
  onGo?: (i: number) => void;
}

/** The same stepper shape the Brand flow uses: numbered, back-navigable, never skipping ahead. */
const EcomStepper: React.FC<Props> = ({ steps, current, onGo }) => (
  <div className="flex items-center gap-2 flex-wrap">
    {steps.map((s, i) => {
      const done = i < current;
      const active = i === current;
      return (
        <React.Fragment key={s}>
          <button
            onClick={() => (done || active) && onGo?.(i)}
            disabled={!done && !active}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] border transition-colors ${
              active
                ? "border-primary bg-primary/15 text-primary"
                : done
                  ? "border-sw-green/30 bg-sw-green-dim text-sw-green"
                  : "border-subtle bg-surface-2 text-muted-foreground"
            }`}
          >
            <span className="w-4 h-4 rounded-full bg-surface-1/60 flex items-center justify-center font-mono text-[9px]">
              {done ? <Check size={9} /> : i + 1}
            </span>
            {s}
          </button>
          {i < steps.length - 1 && <span className="w-4 h-px bg-border" />}
        </React.Fragment>
      );
    })}
  </div>
);

export default EcomStepper;
