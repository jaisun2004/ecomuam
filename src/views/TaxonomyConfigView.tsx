import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Copy, Check, ChevronUp, ChevronDown } from "lucide-react";

interface TaxonomySegment {
  id: string;
  label: string;
  enabled: boolean;
}

const availableSegments: TaxonomySegment[] = [
  { id: "platform", label: "Platform", enabled: true },
  { id: "objective", label: "Objective", enabled: true },
  { id: "sku_name", label: "SKU Name (Manufacturer)", enabled: true },
  { id: "month_year", label: "Month & Year", enabled: true },
  { id: "city", label: "City", enabled: false },
  { id: "custom", label: "Custom Value", enabled: false },
];

const sampleValues: Record<string, string> = {
  platform: "Instamart",
  objective: "Conversion",
  sku_name: "GoodDay_Butter_200g",
  month_year: "Mar2026",
  city: "Mumbai",
  custom: "Wave1",
};

const TaxonomyConfigView: React.FC = () => {
  const [segments, setSegments] = useState<TaxonomySegment[]>(availableSegments);
  const [separator, setSeparator] = useState("_");
  const [prefix, setPrefix] = useState("SW");
  const [copied, setCopied] = useState(false);

  const activeSegments = segments.filter(s => s.enabled);

  const generatedName = [prefix, ...activeSegments.map(s => sampleValues[s.id] || "Value")].join(separator);

  const toggleSegment = (id: string) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, enabled: !s.enabled } : s));
  };

  const moveSegment = (index: number, dir: -1 | 1) => {
    const newSegments = [...segments];
    const targetIndex = index + dir;
    if (targetIndex < 0 || targetIndex >= newSegments.length) return;
    [newSegments[index], newSegments[targetIndex]] = [newSegments[targetIndex], newSegments[index]];
    setSegments(newSegments);
  };

  const removeSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const addCustomSegment = () => {
    const newId = `custom_${Date.now()}`;
    setSegments(prev => [...prev, { id: newId, label: "Custom Value", enabled: true }]);
    sampleValues[newId] = "CustomVal";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedName);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Campaign Taxonomy</h1>
          <p className="text-xs text-muted-foreground mt-1">Define the sequence of segments for auto-generated campaign names</p>
        </div>
      </div>

      {/* Preview */}
      <div className="rounded-xl border border-border bg-surface-1 p-4">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-2">Generated name preview</p>
        <div className="flex items-center gap-3">
          <code className="flex-1 text-sm font-mono text-primary bg-primary/10 rounded-lg px-4 py-2.5 border border-primary/20">
            {generatedName}
          </code>
          <button onClick={handleCopy} className="p-2 rounded-lg bg-surface-2 hover:bg-surface-3 text-muted-foreground hover:text-foreground transition-colors">
            {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
        </div>
        <p className="text-[9px] text-muted-foreground mt-2">
          Sequence: {prefix} → {activeSegments.map(s => s.label).join(` ${separator} `)}
        </p>
      </div>

      {/* Config row */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 block">Prefix</label>
          <input
            value={prefix}
            onChange={e => setPrefix(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="w-32">
          <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest mb-1 block">Separator</label>
          <select
            value={separator}
            onChange={e => setSeparator(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-1 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="_">Underscore ( _ )</option>
            <option value="-">Dash ( - )</option>
            <option value=".">Dot ( . )</option>
            <option value="/">Slash ( / )</option>
          </select>
        </div>
      </div>

      {/* Segments — Sequence ordering */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Segment sequence</p>
            <p className="text-[9px] text-muted-foreground mt-0.5">Toggle segments on/off and reorder using arrows. The sequence determines naming order.</p>
          </div>
          <button onClick={addCustomSegment} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
            <Plus size={14} /> Add custom segment
          </button>
        </div>
        <div className="space-y-2">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-all ${
                seg.enabled ? "border-primary/20 bg-surface-1" : "border-border bg-surface-2 opacity-60"
              }`}
            >
              {/* Position */}
              <span className="font-mono text-[10px] text-muted-foreground w-5 text-center flex-shrink-0">
                {seg.enabled ? `${activeSegments.indexOf(seg) + 1}` : "—"}
              </span>

              {/* Reorder arrows */}
              <div className="flex flex-col gap-0.5 flex-shrink-0">
                <button onClick={() => moveSegment(i, -1)} disabled={i === 0}
                  className="p-0.5 rounded hover:bg-surface-3 text-muted-foreground disabled:opacity-30">
                  <ChevronUp size={12} />
                </button>
                <button onClick={() => moveSegment(i, 1)} disabled={i === segments.length - 1}
                  className="p-0.5 rounded hover:bg-surface-3 text-muted-foreground disabled:opacity-30">
                  <ChevronDown size={12} />
                </button>
              </div>

              <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0" />

              {/* Toggle */}
              <button onClick={() => toggleSegment(seg.id)}
                className={`w-8 h-4 rounded-full flex-shrink-0 transition-all relative ${seg.enabled ? "bg-primary" : "bg-surface-3"}`}>
                <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all ${seg.enabled ? "left-4" : "left-0.5"}`} />
              </button>

              <span className="text-xs font-medium text-foreground w-40 flex-shrink-0">{seg.label}</span>

              {/* Sample value preview */}
              <span className="flex-1 font-mono text-[10px] text-muted-foreground truncate">
                e.g. {sampleValues[seg.id] || "Value"}
              </span>

              {/* Delete custom segments */}
              {seg.id.startsWith("custom") && (
                <button onClick={() => removeSegment(seg.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 size={14} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TaxonomyConfigView;
