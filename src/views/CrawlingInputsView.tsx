import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Plus, Link2, Unlink, Search, Eye, AlertCircle } from "lucide-react";

interface TagInputProps {
  label: string;
  description: string;
  tags: string[];
  suggestions: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  disabled?: boolean;
  campaignValues?: { value: string; volume?: string | null }[];
  showCampaignPull?: boolean;
  onPullCampaignValues?: () => void;
  showVolume?: boolean;
}

const TagInput = React.forwardRef<HTMLDivElement, TagInputProps>(({ label, description, tags, suggestions, onAdd, onRemove, disabled, campaignValues, showCampaignPull, onPullCampaignValues, showVolume }, ref) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [showCampValues, setShowCampValues] = useState(false);

  const filtered = suggestions.filter(s => !tags.includes(s) && s.toLowerCase().includes(search.toLowerCase()));

  return (
    <div ref={ref} className={`rounded-xl border bg-surface-1 p-4 space-y-3 ${disabled ? "opacity-50 pointer-events-none" : ""} border-border`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-foreground">{label}</p>
          <p className="text-[11px] text-muted-foreground">{description}</p>
        </div>
        {showCampaignPull && !disabled && (
          <button onClick={() => setShowCampValues(!showCampValues)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20">
            <Eye size={11} /> Campaign values
          </button>
        )}
      </div>

      {/* Campaign values overlay */}
      {showCampValues && campaignValues && (
        <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider">Values from campaigns</p>
            <button onClick={onPullCampaignValues} className="text-[10px] px-2 py-1 rounded-lg bg-primary/20 text-primary hover:bg-primary/30">Pull all</button>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {campaignValues.map(cv => (
              <button key={cv.value} onClick={() => onAdd(cv.value)}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] border transition-all ${tags.includes(cv.value) ? "border-primary/30 bg-primary/10 text-primary" : "border-subtle bg-surface-2 text-foreground hover:bg-surface-3"}`}>
                {cv.value}
                {showVolume && cv.volume && <span className="font-mono text-[8px] text-muted-foreground ml-1">{cv.volume}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Selected tags */}
      <div className="flex flex-wrap gap-1.5 min-h-[32px]">
        {tags.map(t => {
          const campVal = campaignValues?.find(cv => cv.value === t);
          return (
            <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-medium border border-primary/20">
              {t}
              {showVolume && campVal?.volume && <span className="font-mono text-[8px] text-muted-foreground">({campVal.volume})</span>}
              {showVolume && !campVal?.volume && <span className="font-mono text-[8px] text-muted-foreground">(NA)</span>}
              <button onClick={() => onRemove(t)} className="hover:text-destructive transition-colors"><X size={12} /></button>
            </span>
          );
        })}
        {tags.length === 0 && <span className="text-[11px] text-muted-foreground italic">No items selected</span>}
      </div>

      {/* Search + add */}
      {!disabled && (
        <div className="relative">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-1.5">
            <Search size={14} className="text-muted-foreground" />
            <input value={search} onChange={e => { setSearch(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)}
              placeholder={`Search or add ${label.toLowerCase()}…`}
              className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
            {search && (
              <button onClick={() => { onAdd(search); setSearch(""); }} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80">
                <Plus size={12} /> Add
              </button>
            )}
          </div>
          {open && filtered.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 rounded-lg border border-border bg-surface-2 shadow-lg max-h-[160px] overflow-y-auto z-20">
              {filtered.slice(0, 8).map(s => (
                <button key={s} onClick={() => { onAdd(s); setSearch(""); setOpen(false); }}
                  className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-surface-3 transition-colors">{s}</button>
              ))}
            </div>
          )}
        </div>
      )}

      {disabled && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <AlertCircle size={12} />
          Custom inputs disabled — values synced from campaigns
        </div>
      )}
    </div>
  );
});
TagInput.displayName = "TagInput";

const availableKeywords = ["butter biscuits", "cream biscuits", "glucose biscuits", "digestive biscuits", "choco chip cookies", "biscuit combo", "health biscuits", "kids biscuits", "premium cookies", "rusk online"];
const availableProducts = ["SKU-GD200", "SKU-GD100", "SKU-MG250", "SKU-5050", "SKU-NC100", "SKU-MF150", "SKU-TREAT75", "SKU-BOURBON", "SKU-JIM100", "SKU-TIGER250"];
const availablePincodes = ["110001", "110020", "110045", "400001", "400050", "560001", "560034", "500001", "600001", "700001", "411001", "380001", "302001", "226001", "144001"];
const availablePlatforms = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Swiggy Instamart", "JioMart", "BigBasket"];

const campaignKeywords = [
  { value: "butter biscuits", volume: "142K" },
  { value: "cream biscuits", volume: "498K" },
  { value: "glucose biscuits", volume: "87K" },
  { value: "digestive biscuits", volume: "63K" },
  { value: "choco chip cookies", volume: "211K" },
  { value: "biscuit combo", volume: null },
  { value: "healthy snacks", volume: "321K" },
];

const campaignProducts = [
  { value: "SKU-GD200", volume: null },
  { value: "SKU-GD100", volume: null },
  { value: "SKU-MG250", volume: null },
  { value: "SKU-NC100", volume: null },
  { value: "SKU-BOURBON", volume: null },
];

const campaignPincodes = [
  { value: "110001", volume: null },
  { value: "400001", volume: null },
  { value: "560001", volume: null },
  { value: "500001", volume: null },
];

const campaignPlatforms = [
  { value: "Amazon", volume: null },
  { value: "Flipkart", volume: null },
  { value: "Blinkit", volume: null },
  { value: "Zepto", volume: null },
];

const CrawlingInputsView: React.FC = () => {
  const [keywords, setKeywords] = useState<string[]>(["butter biscuits", "cream biscuits", "glucose biscuits"]);
  const [products, setProducts] = useState<string[]>(["SKU-GD200", "SKU-MG250"]);
  const [pincodes, setPincodes] = useState<string[]>(["110001", "400001", "560001"]);
  const [platforms, setPlatforms] = useState<string[]>(["Amazon", "Flipkart", "Blinkit"]);
  const [linkToCampaign, setLinkToCampaign] = useState(false);
  const [crawlsPerDay, setCrawlsPerDay] = useState(3);

  const addTo = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (val: string) => {
    setter(prev => prev.includes(val) ? prev : [...prev, val]);
  };
  const removeFrom = (setter: React.Dispatch<React.SetStateAction<string[]>>) => (val: string) => {
    setter(prev => prev.filter(v => v !== val));
  };
  const pullAll = (setter: React.Dispatch<React.SetStateAction<string[]>>, values: { value: string }[]) => () => {
    setter(prev => [...new Set([...prev, ...values.map(v => v.value)])]);
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
              {linkToCampaign ? "Crawling inputs synced from campaigns — custom inputs disabled" : "Crawling inputs managed independently"}
            </p>
          </div>
        </div>
        <button onClick={() => setLinkToCampaign(!linkToCampaign)}
          className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${linkToCampaign ? "bg-primary" : "bg-surface-3"}`}>
          <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-200 ${linkToCampaign ? "translate-x-[22px]" : "translate-x-0.5"}`} />
        </button>
      </div>

      {linkToCampaign && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
          className="rounded-xl border-l-[3px] border-l-primary bg-primary/5 border border-primary/10 p-4">
          <p className="text-xs text-primary font-medium">Campaign data linked</p>
          <p className="text-[11px] text-muted-foreground mt-1">All inputs are synced from active campaigns. Custom inputs are disabled. Toggle off to add custom values.</p>
        </motion.div>
      )}

      {/* Crawls per day */}
      <div className="rounded-xl border border-border bg-surface-1 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Crawls per day</p>
            <p className="text-[11px] text-muted-foreground">Number of crawl cycles per day (2–6)</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCrawlsPerDay(Math.max(2, crawlsPerDay - 1))}
              className="w-8 h-8 rounded-lg bg-surface-3 text-foreground flex items-center justify-center hover:bg-surface-2 text-sm font-bold">−</button>
            <span className="font-mono text-lg font-bold text-foreground w-8 text-center">{crawlsPerDay}</span>
            <button onClick={() => setCrawlsPerDay(Math.min(6, crawlsPerDay + 1))}
              className="w-8 h-8 rounded-lg bg-surface-3 text-foreground flex items-center justify-center hover:bg-surface-2 text-sm font-bold">+</button>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          {[2, 3, 4, 5, 6].map(n => (
            <button key={n} onClick={() => setCrawlsPerDay(n)}
              className={`flex-1 py-1 rounded text-[10px] font-mono transition-all ${crawlsPerDay === n ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
              {n}x
            </button>
          ))}
        </div>
      </div>

      {/* Input sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TagInput label="Keywords" description="Search terms to crawl" tags={keywords} suggestions={availableKeywords}
          onAdd={addTo(setKeywords)} onRemove={removeFrom(setKeywords)} disabled={linkToCampaign}
          showCampaignPull={!linkToCampaign} campaignValues={campaignKeywords} onPullCampaignValues={pullAll(setKeywords, campaignKeywords)} showVolume={true} />
        <TagInput label="Product Codes" description="SKU identifiers to track" tags={products} suggestions={availableProducts}
          onAdd={addTo(setProducts)} onRemove={removeFrom(setProducts)} disabled={linkToCampaign}
          showCampaignPull={!linkToCampaign} campaignValues={campaignProducts} onPullCampaignValues={pullAll(setProducts, campaignProducts)} />
        <TagInput label="Pincodes" description="Locations for dark store coverage" tags={pincodes} suggestions={availablePincodes}
          onAdd={addTo(setPincodes)} onRemove={removeFrom(setPincodes)} disabled={linkToCampaign}
          showCampaignPull={!linkToCampaign} campaignValues={campaignPincodes} onPullCampaignValues={pullAll(setPincodes, campaignPincodes)} />
        <TagInput label="Platforms" description="Retail platforms to crawl" tags={platforms} suggestions={availablePlatforms}
          onAdd={addTo(setPlatforms)} onRemove={removeFrom(setPlatforms)} disabled={linkToCampaign}
          showCampaignPull={!linkToCampaign} campaignValues={campaignPlatforms} onPullCampaignValues={pullAll(setPlatforms, campaignPlatforms)} />
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
          <span className="text-foreground font-mono">{crawlsPerDay}x <span className="text-muted-foreground">/day</span></span>
          <span className="text-muted-foreground">·</span>
          <span className="text-foreground font-mono">{keywords.length * products.length * pincodes.length * platforms.length} <span className="text-muted-foreground">total combinations</span></span>
        </div>
      </div>
    </motion.div>
  );
};

export default CrawlingInputsView;
