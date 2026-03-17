import React, { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, GripVertical, Copy, Check } from "lucide-react";

interface TaxonomySegment {
  id: string;
  label: string;
  options: string[];
  selectedOption: string;
}

const defaultSegments: TaxonomySegment[] = [
  { id: "platform", label: "Platform", options: ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"], selectedOption: "Amazon" },
  { id: "objective", label: "Objective", options: ["Awareness", "Conversion", "Retargeting", "Defense", "Launch"], selectedOption: "Awareness" },
  { id: "category", label: "Category", options: ["Protein", "Creatine", "Pre-Workout", "BCAA", "Vitamins"], selectedOption: "Protein" },
  { id: "audience", label: "Audience", options: ["All", "New Buyers", "Repeat", "Lapsed", "High-LTV"], selectedOption: "All" },
  { id: "geo", label: "Geography", options: ["National", "North", "South", "East", "West", "Metro"], selectedOption: "National" },
];

const TaxonomyConfigView: React.FC = () => {
  const [segments, setSegments] = useState<TaxonomySegment[]>(defaultSegments);
  const [separator, setSeparator] = useState("_");
  const [prefix, setPrefix] = useState("SW");
  const [copied, setCopied] = useState(false);

  const generatedName = [prefix, ...segments.map(s => s.selectedOption)].join(separator);

  const updateSegmentOption = (id: string, option: string) => {
    setSegments(prev => prev.map(s => s.id === id ? { ...s, selectedOption: option } : s));
  };

  const removeSegment = (id: string) => {
    setSegments(prev => prev.filter(s => s.id !== id));
  };

  const addSegment = () => {
    const newId = `custom_${Date.now()}`;
    setSegments(prev => [...prev, { id: newId, label: "Custom", options: ["Option A", "Option B"], selectedOption: "Option A" }]);
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
          <p className="text-xs text-muted-foreground mt-1">Define naming conventions for auto-generated campaign names</p>
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

      {/* Segments */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Taxonomy segments</p>
          <button onClick={addSegment} className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors">
            <Plus size={14} /> Add segment
          </button>
        </div>
        <div className="space-y-2">
          {segments.map((seg, i) => (
            <motion.div
              key={seg.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-1 p-3"
            >
              <GripVertical size={14} className="text-muted-foreground/40 flex-shrink-0" />
              <span className="text-xs font-medium text-foreground w-24 flex-shrink-0">{seg.label}</span>
              <select
                value={seg.selectedOption}
                onChange={e => updateSegmentOption(seg.id, e.target.value)}
                className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {seg.options.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
              <button onClick={() => removeSegment(seg.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default TaxonomyConfigView;
