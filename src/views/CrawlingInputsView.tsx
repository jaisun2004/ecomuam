import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Link2, Unlink, Search } from "lucide-react";

interface TagInputProps {
  label: string;
  description: string;
  tags: string[];
  suggestions: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
}

const TagInput: React.FC<TagInputProps> = ({ label, description, tags, suggestions, onAdd, onRemove }) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = suggestions.filter(s => !tags.includes(s) && s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="rounded-xl border border-border bg-surface-1 p-4 space-y-3">
      <div>
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-[11px] text-muted-foreground">{description}</p>
      </div>
      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map(t => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
            {t}
            <button onClick={() => onRemove(t)} className="hover:text-destructive transition-colors"><X size={12} /></button>
          </span>
        ))}
        {tags.length === 0 && <span className="text-[11px] text-muted-foreground italic">No items selected</span>}
      </div>
      {/* Search + add */}
      <div className="relative">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5">
          <Search size={14} className="text-muted-foreground" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder={`Search or add ${label.toLowerCase()}…`}
            className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {search && (
            <button
              onClick={() => { onAdd(search); setSearch(""); }}
              className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80"
            >
              <Plus size={12} /> Add
            </button>
          )}
        </div>
        {open && filtered.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-surface-2 shadow-lg max-h-[160px] overflow-y-auto z-20">
            {filtered.slice(0, 8).map(s => (
              <button
                key={s}
                onClick={() => { onAdd(s); setSearch(""); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-surface-3 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const availableKeywords = [
  "whey protein", "creatine monohydrate", "pre workout", "BCAA", "mass gainer",
  "protein bar", "ashwagandha", "multivitamin", "electrolyte", "omega 3",
  "casein protein", "plant protein", "gym supplement", "weight loss", "fat burner",
];
const availableProducts = [
  "SKU-001", "SKU-002", "SKU-003", "SKU-004", "SKU-005",
  "SKU-010", "SKU-015", "SKU-020", "SKU-025", "SKU-030",
  "PROD-WP-100", "PROD-CR-200", "PROD-PW-300",
];
const availablePincodes = [
  "110001", "110020", "110045", "400001", "400050",
  "560001", "560034", "500001", "600001", "700001",
  "411001", "380001", "302001", "226001", "144001",
];
const availablePlatforms = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Swiggy Instamart", "JioMart", "BigBasket"];

const CrawlingInputsView: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>(["whey protein", "creatine monohydrate", "pre workout"]);
  const [products, setProducts] = useState<string[]>(["SKU-001", "SKU-002"]);
  const [pincodes, setPincodes] = useState<string[]>(["110001", "400001", "560001"]);
  const [platforms, setPlatforms] = useState<string[]>(["Amazon", "Flipkart", "Blinkit"]);
  const [linkToCampaign, setLinkToCampaign] = useState(false);

  const addTo = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (val: string) => {
    setter(prev => prev.includes(val) ? prev : [...prev, val]);
  };
  const removeFrom = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (val: string) => {
    setter(prev => prev.filter(v => v !== val));
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold text-foreground">Crawling Inputs</h1>
        <p className="text-xs text-muted-foreground mt-1">Define what data to crawl — keywords, products, locations, and platforms</p>
      </div>

      {/* Link toggle */}
      <div className="rounded-xl border border-border bg-surface-1 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {linkToCampaign ? <Link2 size={18} className="text-primary" /> : <Unlink size={18} className="text-muted-foreground" />}
          <div>
            <p className="text-sm font-medium text-foreground">Link crawling to campaign data</p>
            <p className="text-[11px] text-muted-foreground">
              {linkToCampaign
                ? "Crawling inputs will sync to the same granularity as your campaign data"
                : "Crawling inputs are managed independently"}
            </p>
          </div>
        </div>
        <button
          onClick={() => setLinkToCampaign(!linkToCampaign)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
            linkToCampaign ? "bg-primary" : "bg-surface-3"
          }`}
        >
          <span
            className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${
              linkToCampaign ? "translate-x-[22px]" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>

      {linkToCampaign && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border-l-[3px] border-l-primary bg-primary/5 border border-primary/10 p-4"
        >
          <p className="text-xs text-primary font-medium">Campaign data linked</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            All keywords, product codes, pincodes, and platforms from your active campaigns are automatically included in crawling inputs. You can still add additional values below.
          </p>
        </motion.div>
      )}

      {/* Input sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TagInput label="Keywords" description="Search terms to crawl across platforms" tags={keywords} suggestions={availableKeywords} onAdd={addTo(setKeywords)} onRemove={removeFrom(setKeywords)} />
        <TagInput label="Product Codes" description="SKU or product identifiers to track" tags={products} suggestions={availableProducts} onAdd={addTo(setProducts)} onRemove={removeFrom(setProducts)} />
        <TagInput label="Pincodes" description="Locations for dark store and quick commerce coverage" tags={pincodes} suggestions={availablePincodes} onAdd={addTo(setPincodes)} onRemove={removeFrom(setPincodes)} />
        <TagInput label="Platforms" description="Retail platforms to crawl" tags={platforms} suggestions={availablePlatforms} onAdd={addTo(setPlatforms)} onRemove={removeFrom(setPlatforms)} />
      </div>

      {/* Summary */}
      <div className="rounded-xl border border-border bg-surface-1 p-4 flex items-center gap-6">
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Crawl scope</p>
        <div className="flex items-center gap-4 text-xs">
          <span className="text-foreground font-mono">{keywords.length} <span className="text-muted-foreground">keywords</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground font-mono">{products.length} <span className="text-muted-foreground">products</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground font-mono">{pincodes.length} <span className="text-muted-foreground">pincodes</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground font-mono">{platforms.length} <span className="text-muted-foreground">platforms</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground font-mono">{keywords.length * products.length * pincodes.length * platforms.length} <span className="text-muted-foreground">total combinations</span></span>
        </div>
      </div>
    </motion.div>
  );
};

export default CrawlingInputsView;
