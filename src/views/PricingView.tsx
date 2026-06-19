import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import DateRangeSubtitle from "@/components/DateRangeSubtitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";
import { Megaphone, TrendingDown, TrendingUp, AlertTriangle, Eye, Bell, ShieldAlert, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useGuardrails } from "@/contexts/GuardrailContext";

const skuOptions = ["Parle-G 250g", "Marie Gold 120g", "Britannia Marie 250g", "Bourbon 250g", "Hide & Seek 120g"];
const platformOptions = ["Instamart", "Blinkit", "Zepto"];
const platformColors: Record<string, string> = { Instamart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4" };

const skuGroupOptions = ["All SKUs", "Butter Range", "Cream Range", "Health Range", "Value Range"];

const priceHistoryBySku: Record<string, Record<string, any[]>> = {
  "Parle-G 120g": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 40, comp1: i >= 12 ? 35 : 38, comp2: i >= 18 ? 42 : 45, comp3: 32 })),
    "Instamart": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 42, comp1: i >= 12 ? 36 : 39, comp2: i >= 18 ? 44 : 46, comp3: 33 })),
    "Blinkit": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 42, comp1: i >= 10 ? 38 : 40, comp2: 44, comp3: 35 })),
    "Zepto": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 44, comp1: i >= 8 ? 39 : 42, comp2: 46, comp3: 36 })),
  },
  "Marie Gold 250g": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 35, comp1: i >= 8 ? 30 : 32, comp2: 38, comp3: 28 })),
    "Instamart": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 36, comp1: i >= 8 ? 31 : 33, comp2: 39, comp3: 29 })),
    "Blinkit": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 37, comp1: 32, comp2: 40, comp3: 30 })),
    "Zepto": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 38, comp1: 34, comp2: 42, comp3: 31 })),
  },
  "Britannia Marie 250g": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 45, comp1: i >= 15 ? 40 : 42, comp2: 48, comp3: 38 })),
    "Instamart": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 46, comp1: 41, comp2: 49, comp3: 39 })),
    "Blinkit": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 47, comp1: 42, comp2: 50, comp3: 40 })),
    "Zepto": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 48, comp1: 44, comp2: 52, comp3: 41 })),
  },
  "Bourbon 120g": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 30, comp1: i >= 10 ? 28 : 29, comp2: 32, comp3: 25 })),
    "Instamart": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 31, comp1: 29, comp2: 33, comp3: 26 })),
    "Blinkit": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 32, comp1: 30, comp2: 34, comp3: 27 })),
    "Zepto": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 33, comp1: 31, comp2: 35, comp3: 28 })),
  },
  "Hide & Seek 120g": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 20, comp1: 18, comp2: 22, comp3: 15 })),
    "Instamart": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 21, comp1: 19, comp2: 23, comp3: 16 })),
    "Blinkit": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 22, comp1: 20, comp2: 24, comp3: 17 })),
    "Zepto": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 23, comp1: 21, comp2: 25, comp3: 18 })),
  },
};

const compNamesBySku: Record<string, string[]> = {
  "Parle-G 250g": ["Britannia", "Britannia", "Rauch"],
  "Marie Gold 120g": ["Britannia", "Britannia", "Lacnor"],
  "Britannia Marie 250g": ["Patanjali", "Rauch", "Britannia"],
  "Bourbon 250g": ["Britannia", "Britannia", "Lacnor"],
  "Hide & Seek 120g": ["Britannia", "Britannia", "Lacnor"],
};

const competitorMatrixByGroup: Record<string, Record<string, any[]>> = {
  "All SKUs": {
    Instamart: [
      { brand: "Parle Parle-G 120g", you: true, price: "₹ 40", priceColor: "text-primary", rating: "4.4★", ratingColor: "text-sw-green", reviews: "2,847", pos: "#3", posColor: "text-sw-green", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Britannia 250g", you: false, price: "₹ 35 ↓", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "18,241", pos: "#1", posColor: "text-sw-red", sos: "41%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Britannia Cookies 120g", you: false, price: "₹ 25", priceColor: "text-sw-green", rating: "4.5★", ratingColor: "text-sw-green", reviews: "44,102", pos: "#2", posColor: "text-sw-amber", sos: "19%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Rauch Multivit 250g", you: false, price: "₹ 45", priceColor: "text-sw-amber", rating: "4.1★", ratingColor: "text-sw-amber", reviews: "3,671", pos: "#5", posColor: "text-sw-amber", sos: "7%", sosColor: "text-muted-foreground", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
    Blinkit: [
      { brand: "Parle Parle-G 120g", you: true, price: "₹ 42", priceColor: "text-primary", rating: "4.2★", ratingColor: "text-sw-green", reviews: "342", pos: "#2", posColor: "text-sw-green", sos: "35%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Britannia 250g", you: false, price: "₹ 38", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "1,820", pos: "#1", posColor: "text-sw-red", sos: "42%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
    Zepto: [
      { brand: "Parle Parle-G 120g", you: true, price: "₹ 43", priceColor: "text-primary", rating: "4.1★", ratingColor: "text-sw-green", reviews: "218", pos: "#3", posColor: "text-sw-amber", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Britannia 250g", you: false, price: "₹ 38", priceColor: "text-sw-red", rating: "4.2★", ratingColor: "text-sw-green", reviews: "1,120", pos: "#1", posColor: "text-sw-red", sos: "45%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
  },
};

const priceAlerts = [
  { sku: "Marie Gold 120g", competitor: "Britannia", platform: "Instamart", yourPrice: "₹ 35", compPrice: "₹ 30", gap: "+16.7%", impact: "Conversion -22%", severity: "high" },
  { sku: "Britannia Marie 250g", competitor: "Patanjali", platform: "Instamart", yourPrice: "₹ 45", compPrice: "₹ 40", gap: "+12.5%", impact: "Conversion -15%", severity: "high" },
  { sku: "Bourbon 250g", competitor: "Britannia", platform: "Instamart", yourPrice: "₹ 30", compPrice: "₹ 28", gap: "+7.1%", impact: "Conversion -6%", severity: "medium" },
  { sku: "Hide & Seek 120g", competitor: "Britannia", platform: "Zepto", yourPrice: "₹ 20", compPrice: "₹ 18", gap: "+11.1%", impact: "Conversion -4%", severity: "low" },
];

const platformPricing = [
  { platform: "Instamart", color: "#FF9900", avgIndex: 0.96, skusBelowComp: 3, skusAboveComp: 2, parity: 1, needsAttention: false },
  { platform: "Instamart", color: "#2F77FF", avgIndex: 1.02, skusBelowComp: 2, skusAboveComp: 3, parity: 1, needsAttention: true },
  { platform: "Blinkit", color: "#FDDC2B", avgIndex: 1.08, skusBelowComp: 1, skusAboveComp: 2, parity: 0, needsAttention: true },
  { platform: "Zepto", color: "#833AB4", avgIndex: 1.05, skusBelowComp: 1, skusAboveComp: 2, parity: 0, needsAttention: true },
  { platform: "Blinkit", color: "#FC8019", avgIndex: 1.12, skusBelowComp: 0, skusAboveComp: 3, parity: 0, needsAttention: true },
];

const platformPricingDetail: Record<string, { sku: string; yourPrice: string; compPrice: string; parity: boolean; competitor: string }[]> = {
  Instamart: [
    { sku: "Parle-G 120g", yourPrice: "₹ 40", compPrice: "₹ 35", parity: false, competitor: "Britannia" },
    { sku: "Marie Gold 250g", yourPrice: "₹ 35", compPrice: "₹ 30", parity: false, competitor: "Britannia" },
    { sku: "Britannia Marie 250g", yourPrice: "₹ 45", compPrice: "₹ 45", parity: true, competitor: "Patanjali" },
    { sku: "Bourbon 120g", yourPrice: "₹ 30", compPrice: "₹ 32", parity: true, competitor: "Britannia" },
  ],
  Blinkit: [
    { sku: "Parle-G 250g", yourPrice: "₹ 42", compPrice: "₹ 38", parity: false, competitor: "Britannia" },
    { sku: "Bourbon 120g", yourPrice: "₹ 32", compPrice: "₹ 30", parity: false, competitor: "Britannia" },
  ],
  Zepto: [
    { sku: "Parle-G 250g", yourPrice: "₹ 43", compPrice: "₹ 38", parity: false, competitor: "Britannia" },
    { sku: "Hide & Seek 120g", yourPrice: "₹ 22", compPrice: "₹ 20", parity: false, competitor: "Britannia" },
  ],
};

const priceAdvantageData = [
  { sku: "Parle-G 120g", yourPrice: "₹ 40", compPrice: "₹ 45", competitor: "Rauch", platform: "Instamart", gap: "−12.5%", keywords: ["unibic butter biscuits", "unibic biscuits", "premium butter biscuits"], estCpc: "₹ 3.20", estRoas: "5.2x" },
  { sku: "Bourbon 250g", yourPrice: "₹ 30", compPrice: "₹ 34", competitor: "Britannia", platform: "Instamart", gap: "−11.8%", keywords: ["sunfeast bourbon", "chocolate cream biscuits", "sunfeast dark fantasy"], estCpc: "₹ 2.80", estRoas: "4.6x" },
  { sku: "Hide & Seek 120g", yourPrice: "₹ 20", compPrice: "₹ 24", competitor: "Britannia", platform: "Blinkit", gap: "−16.7%", keywords: ["parle krackjack", "salted biscuits online", "parle snack biscuits"], estCpc: "₹ 1.90", estRoas: "6.1x" },
];

const priceIndexTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  yours: +(1.0 + Math.random() * 0.1).toFixed(2),
  categoryAvg: 1.0,
}));

const elasticityData = [
  { sku: "Parle-G 120g", sensitivity: 0.82 },
  { sku: "Marie Gold 250g", sensitivity: 0.65 },
  { sku: "Britannia Marie 250g", sensitivity: 0.91 },
  { sku: "Bourbon 120g", sensitivity: 0.48 },
  { sku: "Hide & Seek 120g", sensitivity: 0.35 },
];

const priceGapTable = [
  { sku: "Marie Gold 250g", yours: "₹ 35", lowest: "₹ 30", gap: "+16.7%", action: "Match Price" },
  { sku: "Britannia Marie 250g", yours: "₹ 45", lowest: "₹ 40", gap: "+12.5%", action: "Match Price" },
  { sku: "Bourbon 120g", yours: "₹ 30", lowest: "₹ 28", gap: "+7.1%", action: "Monitor" },
  { sku: "Hide & Seek 120g", yours: "₹ 20", lowest: "₹ 18", gap: "+11.1%", action: "Monitor" },
  { sku: "Parle-G 250g", yours: "₹ 40", lowest: "₹ 35", gap: "+14.3%", action: "Match Price" },
];

// Price index trend by SKU for analytics filter
const priceIndexBySku: Record<string, any[]> = {
  "All SKUs": priceIndexTrend,
  ...Object.fromEntries(skuOptions.map(sku => [
    sku,
    Array.from({ length: 30 }, (_, i) => ({
      day: `Mar ${i + 1}`,
      yours: +(0.95 + Math.random() * 0.15).toFixed(2),
      categoryAvg: 1.0,
    })),
  ])),
};

const PLACEMENT_OPTIONS = ["Search Top", "Category", "Brand Shelf", "Home Carousel", "Product Page"];

type CampaignDraft = {
  campaignName: string;
  campaignType: string;
  platform: string;
  sku: string;
  budget: number;
  duration: string;
  isNational: boolean;
  cities: string;
  excludedPlacements: string[];
  keywords: { kw: string; bid: number }[];
};

const CampaignReviewForm: React.FC<{
  source: any;
  onCancel: () => void;
  onConfirm: (draft: CampaignDraft) => void;
}> = ({ source, onCancel, onConfirm }) => {
  const parseNum = (s: string) => parseFloat(String(s).replace(/[^0-9.]/g, "")) || 0;
  const [draft, setDraft] = React.useState<CampaignDraft>({
    campaignName: source.campaignName,
    campaignType: source.campaignType,
    platform: source.platform,
    sku: source.sku,
    budget: parseNum(source.budget),
    duration: source.duration,
    isNational: true,
    cities: source.cities,
    excludedPlacements: [],
    keywords: source.keywords.map((kw: string) => ({ kw, bid: parseNum(source.bid) })),
  });
  const [newKw, setNewKw] = React.useState("");

  const update = (patch: Partial<CampaignDraft>) => setDraft(d => ({ ...d, ...patch }));

  return (
    <div className="space-y-3 text-xs">
      <div className="p-3 rounded-lg bg-sw-green-dim/40 border border-sw-green/20">
        <p className="text-foreground">{source.insight}</p>
        <div className="flex gap-4 mt-2 font-mono text-[11px]">
          <span>You: <span className="text-sw-green">{source.ownPrice}</span></span>
          <span>{source.competitor}: <span className="text-muted-foreground">{source.compPrice}</span></span>
          <span className="ml-auto px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green">{source.delta}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Campaign name</div>
          <div className="text-foreground font-mono">{draft.campaignName}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Platform · SKU</div>
          <div className="text-foreground font-mono">{draft.platform} · {draft.sku}</div>
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Daily budget (₹)</div>
          <input
            type="number"
            value={draft.budget}
            onChange={(e) => update({ budget: parseFloat(e.target.value) || 0 })}
            className="w-full px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-xs"
          />
        </div>
        <div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Duration</div>
          <input
            value={draft.duration}
            onChange={(e) => update({ duration: e.target.value })}
            className="w-full px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-xs"
          />
        </div>
      </div>

      <div className="p-2 rounded-lg bg-surface-2 border border-subtle">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={draft.isNational}
            onChange={(e) => update({ isNational: e.target.checked })}
            className="accent-primary"
          />
          <span className="text-foreground">Run as national campaign</span>
        </label>
        {!draft.isNational && (
          <div className="mt-2">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Cities</div>
            <input
              value={draft.cities}
              onChange={(e) => update({ cities: e.target.value })}
              className="w-full px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-xs"
            />
          </div>
        )}
      </div>

      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Exclude placements</div>
        <div className="flex flex-wrap gap-1.5">
          {PLACEMENT_OPTIONS.map(p => {
            const excluded = draft.excludedPlacements.includes(p);
            return (
              <button
                key={p}
                onClick={() => update({
                  excludedPlacements: excluded
                    ? draft.excludedPlacements.filter(x => x !== p)
                    : [...draft.excludedPlacements, p],
                })}
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono border transition-colors ${
                  excluded
                    ? "bg-sw-red-dim text-sw-red border-sw-red/30 line-through"
                    : "bg-surface-3 text-foreground border-subtle hover:bg-surface-2"
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Keywords & bids (₹ CPC)</div>
        <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
          {draft.keywords.map((k, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <input
                value={k.kw}
                onChange={(e) => {
                  const next = [...draft.keywords];
                  next[idx] = { ...next[idx], kw: e.target.value };
                  update({ keywords: next });
                }}
                className="flex-1 px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-[11px]"
              />
              <input
                type="number"
                step="0.1"
                value={k.bid}
                onChange={(e) => {
                  const next = [...draft.keywords];
                  next[idx] = { ...next[idx], bid: parseFloat(e.target.value) || 0 };
                  update({ keywords: next });
                }}
                className="w-20 px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-[11px]"
              />
              <button
                onClick={() => update({ keywords: draft.keywords.filter((_, i) => i !== idx) })}
                className="text-muted-foreground hover:text-sw-red text-xs px-1"
                aria-label="Remove keyword"
              >
                ×
              </button>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2 mt-2">
          <input
            value={newKw}
            onChange={(e) => setNewKw(e.target.value)}
            placeholder="Add keyword"
            className="flex-1 px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-[11px]"
          />
          <button
            onClick={() => {
              if (!newKw.trim()) return;
              update({ keywords: [...draft.keywords, { kw: newKw.trim(), bid: parseNum(source.bid) }] });
              setNewKw("");
            }}
            className="px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground text-[11px] hover:bg-surface-2"
          >
            + Add
          </button>
        </div>
      </div>

      <DialogFooter className="gap-2">
        <button
          onClick={onCancel}
          className="px-3 py-1.5 rounded-lg text-xs bg-surface-3 text-foreground hover:bg-surface-2">
          Cancel
        </button>
        <button
          onClick={() => onConfirm(draft)}
          className="px-3 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1">
          <Megaphone size={12} /> Confirm & Launch
        </button>
      </DialogFooter>
    </div>
  );
};

  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [campaignStates, setCampaignStates] = useState<Record<number, boolean>>({});
  const [keywordCampaignStates, setKeywordCampaignStates] = useState<Record<number, boolean>>({});
  const [openCampaign, setOpenCampaign] = useState<any | null>(null);
  const [selectedSku, setSelectedSku] = useState("Parle-G 120g");
  const [selectedPlatform, setSelectedPlatform] = useState("Instamart");
  const [selectedSkuGroup, setSelectedSkuGroup] = useState("All SKUs");
  const [priceHistoryToggle, setPriceHistoryToggle] = useState<"sku" | "platform">("sku");
  const [priceHistoryPlatform, setPriceHistoryPlatform] = useState("All");
  const [showNeedAttention, setShowNeedAttention] = useState(false);
  const [viewThroughPlatform, setViewThroughPlatform] = useState<string | null>(null);
  const [alertTeamStates, setAlertTeamStates] = useState<Record<string, boolean>>({});
  const [analyticsSkuFilter, setAnalyticsSkuFilter] = useState("All SKUs");
  const [ppiMode, setPpiMode] = useState<"competitors" | "own">("competitors");
  const [ppiSku, setPpiSku] = useState(skuOptions[0]);

  const compNames = compNamesBySku[selectedSku] || compNamesBySku["Parle-G 250g"];
  const competitorMatrix = (competitorMatrixByGroup["All SKUs"] || {})[selectedPlatform] || [];
  const priceHistory = (priceHistoryBySku[selectedSku] || priceHistoryBySku["Parle-G 120g"])[priceHistoryPlatform] || (priceHistoryBySku[selectedSku] || priceHistoryBySku["Parle-G 250g"])["All"];

  const filteredPlatformPricing = showNeedAttention ? platformPricing.filter(p => p.needsAttention) : platformPricing;

  const g = useGuardrails();
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <DateRangeSubtitle />
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Price Competitiveness" value="#2" delta="Best value in category" deltaType="positive" sub="Across 6 tracked SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="Price Changes (24h)" value="7" delta="⚠ 2 affect your SKUs" deltaType="warning" sub="Competitor moves today" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Avg Price Index" value="1.04x" delta="4% above market avg" deltaType="warning" sub="Across all platforms" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Conversion at Risk" value="−18%" delta="From pricing gaps" deltaType="negative" sub="Conversion loss from overpricing" accentColor="bg-sw-red" delay={0.15} />
      </div>

      {/* Competitor Matrix with SKU Group + Platform filters + Need Attention button */}
      <PanelCard title="Competitor Intelligence Matrix" badge="Real-time" badgeColor="red" delay={0.2}>
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="text-[10px] text-muted-foreground">SKU Group</span>
          <Select value={selectedSkuGroup} onValueChange={setSelectedSkuGroup}>
            <SelectTrigger className="w-[160px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {skuGroupOptions.map(sg => <SelectItem key={sg} value={sg}>{sg}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2 mb-4">
          <span className="text-[10px] text-muted-foreground">Platform</span>
          <Select value={selectedPlatform} onValueChange={setSelectedPlatform}>
            <SelectTrigger className="w-[160px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {platformOptions.map(p => (
                <SelectItem key={p} value={p}>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColors[p] }} />{p}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button onClick={() => { setShowNeedAttention(true); setSelectedPlatform("Instamart"); }}
            className="ml-auto px-3 py-1.5 rounded-lg text-[10px] font-medium bg-sw-red/15 text-sw-red hover:bg-sw-red/25 flex items-center gap-1">
            <AlertTriangle size={10} /> Need Attention
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Brand / SKU</th>
                <th className="text-right py-2 font-normal">Price</th>
                <th className="text-right py-2 font-normal">Rating</th>
                <th className="text-right py-2 font-normal">Reviews</th>
                <th className="text-right py-2 font-normal">Position</th>
                <th className="text-right py-2 font-normal">SoS</th>
                <th className="text-right py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {competitorMatrix.map((r: any) => (
                <tr key={r.brand} className={r.you ? "bg-primary/5" : ""}>
                  <td className="py-3 text-foreground">
                    <span className="flex items-center gap-1.5">
                      {r.you && <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">YOU</span>}
                      {r.brand}
                    </span>
                  </td>
                  <td className={`py-3 text-right font-mono ${r.priceColor}`}>{r.price}</td>
                  <td className={`py-3 text-right font-mono ${r.ratingColor}`}>{r.rating}</td>
                  <td className="py-3 text-right font-mono text-foreground">{r.reviews}</td>
                  <td className={`py-3 text-right font-mono ${r.posColor}`}>{r.pos}</td>
                  <td className={`py-3 text-right font-mono ${r.sosColor}`}>{r.sos}</td>
                  <td className="py-3 text-right"><span className={`font-mono text-[10px] px-2 py-0.5 rounded-full ${r.stockColor}`}>{r.stock}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {/* Price Alerts + Platform Pricing Index */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Price-Driven Campaign Opportunities" badge="Own product cheaper" badgeColor="green" delay={0.3}>
          <p className="text-[10px] text-muted-foreground mb-3">Only SKUs where your price beats competition — ready to convert into a price-win campaign.</p>
          <div className="space-y-2">
            {[
              {
                insight: "Parle-G 120g is 12% cheaper than Britannia on Zepto",
                delta: "−12%",
                platform: "Zepto",
                sku: "Parle-G 120g",
                ownPrice: "₹38",
                compPrice: "₹43",
                competitor: "Britannia Tiger 120g",
                campaignName: "PriceWin_ParleG120_Zepto",
                campaignType: "Sponsored Product — Price Win",
                keywords: ["glucose biscuit", "parle g", "cheap biscuit", "tea time biscuit"],
                budget: "₹2,500/day",
                bid: "₹6.50 CPC",
                duration: "14 days",
                placements: "Search Top + Category",
                cities: "Bengaluru, Hyderabad, Mumbai",
              },
              {
                insight: "Marie Gold 250g is 9% cheaper than Britannia Marie on Blinkit",
                delta: "−9%",
                platform: "Blinkit",
                sku: "Marie Gold 250g",
                ownPrice: "₹32",
                compPrice: "₹35",
                competitor: "Britannia Marie 250g",
                campaignName: "PriceWin_MarieGold250_Blinkit",
                campaignType: "Sponsored Product — Price Win",
                keywords: ["marie biscuit", "marie gold", "tea biscuit"],
                budget: "₹2,000/day",
                bid: "₹5.80 CPC",
                duration: "10 days",
                placements: "Search Top + Brand Shelf",
                cities: "Delhi NCR, Pune",
              },
              {
                insight: "Bourbon 120g is 7% cheaper than Hide & Seek on Instamart",
                delta: "−7%",
                platform: "Instamart",
                sku: "Bourbon 120g",
                ownPrice: "₹28",
                compPrice: "₹30",
                competitor: "Hide & Seek 120g",
                campaignName: "PriceWin_Bourbon120_Instamart",
                campaignType: "Sponsored Product — Price Win",
                keywords: ["chocolate biscuit", "bourbon", "cream biscuit"],
                budget: "₹1,800/day",
                bid: "₹5.20 CPC",
                duration: "7 days",
                placements: "Category Top",
                cities: "Mumbai, Chennai",
              },
            ].map((row, i) => {
              const done = !!campaignStates[i];
              return (
                <div key={i} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                  <div className="flex items-start gap-2 mb-2">
                    <Megaphone size={12} className="text-sw-green mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-foreground flex-1">{row.insight}</p>
                    <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green flex-shrink-0">{row.delta}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">{row.platform} · {row.sku}</span>
                    <button
                      onClick={() => setOpenCampaign({ ...row, _index: i })}
                      disabled={done}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-medium inline-flex items-center gap-1 ${done ? "bg-sw-green-dim text-sw-green" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                      <Megaphone size={10} /> {done ? "✓ Triggered" : "Launch Price-Win Campaign"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </PanelCard>


        <PanelCard title="Platform Price Index" badge={ppiMode === "competitors" ? "vs Competition" : "Own SKU × Platforms"} badgeColor="accent" delay={0.35}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="inline-flex rounded-lg bg-surface-3 p-0.5">
              <button onClick={() => setPpiMode("competitors")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${ppiMode === "competitors" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Competitors
              </button>
              <button onClick={() => setPpiMode("own")}
                className={`px-2.5 py-1 rounded-md text-[10px] font-medium ${ppiMode === "own" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}>
                Own SKU × Platforms
              </button>
            </div>
            {ppiMode === "own" && (
              <Select value={ppiSku} onValueChange={setPpiSku}>
                <SelectTrigger className="w-[180px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {skuOptions.map(s => <SelectItem key={s} value={s} className="text-[11px]">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
          </div>

          {ppiMode === "competitors" ? (
            <div className="space-y-3">
              {filteredPlatformPricing.map((p) => (
                <div key={p.platform} className="p-3 bg-surface-2 rounded-xl border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="flex items-center gap-2 text-xs text-foreground">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.platform}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-sm font-bold ${p.avgIndex <= 1 ? "text-sw-green" : p.avgIndex <= 1.05 ? "text-sw-amber" : "text-sw-red"}`}>
                        {p.avgIndex.toFixed(2)}x
                      </span>
                      <button onClick={() => setViewThroughPlatform(viewThroughPlatform === p.platform ? null : p.platform)}
                        className="px-2 py-0.5 rounded text-[9px] font-medium bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-0.5">
                        <Eye size={9} /> View
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px]">
                    <span className="text-sw-green">{p.skusBelowComp} below comp</span>
                    <span className="text-muted-foreground">{p.parity} at parity</span>
                    <span className="text-sw-red">{p.skusAboveComp} above comp</span>
                  </div>
                  {viewThroughPlatform === p.platform && platformPricingDetail[p.platform] && (
                    <div className="mt-3 pt-3 border-t border-subtle">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left py-1 font-normal">SKU</th>
                            <th className="text-right py-1 font-normal">You</th>
                            <th className="text-right py-1 font-normal">Comp</th>
                            <th className="text-center py-1 font-normal">Parity</th>
                            <th className="text-right py-1 font-normal">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {platformPricingDetail[p.platform].map((row, ri) => (
                            <tr key={ri}>
                              <td className="py-1 text-foreground">{row.sku}</td>
                              <td className="py-1 text-right font-mono text-foreground">{row.yourPrice}</td>
                              <td className="py-1 text-right font-mono text-sw-red">{row.compPrice}</td>
                              <td className="py-1 text-center">
                                {row.parity ? (
                                  <span className="font-mono text-[8px] px-1 py-0.5 rounded-full bg-sw-green-dim text-sw-green">✓</span>
                                ) : (
                                  <span className="font-mono text-[8px] px-1 py-0.5 rounded-full bg-sw-red/15 text-sw-red">✗</span>
                                )}
                              </td>
                              <td className="py-1 text-right">
                                {!row.parity && (
                                  <button
                                    onClick={() => setAlertTeamStates(pr => ({ ...pr, [`${p.platform}-${ri}`]: true }))}
                                    className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${
                                      alertTeamStates[`${p.platform}-${ri}`] ? "bg-sw-green-dim text-sw-green" : "bg-sw-amber/15 text-sw-amber hover:bg-sw-amber/25"
                                    }`}>
                                    <Bell size={8} />
                                    {alertTeamStates[`${p.platform}-${ri}`] ? "✓ Alerted" : "Alert Team"}
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            (() => {
              const plats = ["Blinkit", "Instamart", "Zepto", "Instamart"];
              const base = priceHistoryBySku[ppiSku]?.["All"] ?? [];
              const data = base.map((row: any, i: number) => ({
                day: row.day,
                Blinkit: row.yours,
                Instamart: row.yours - 1 + (i % 3),
                "Zepto": row.yours + 2 - (i % 4),
              }));
              const latest: any = data[data.length - 1] || {};
              const prev: any = data[data.length - 8] || latest;
              const prices = plats.map(p => Number(latest[p] ?? 0));
              const minP = Math.min(...prices);
              const maxP = Math.max(...prices);
              return (
                <>
                  <p className="text-[10px] text-muted-foreground mb-2">{ppiSku} — price across 4 platforms over 30 days.</p>
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={data}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} interval={5} />
                      <YAxis tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
                      <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
                      {plats.map(p => (
                        <Line key={p} type="monotone" dataKey={p} stroke={platformColors[p] || "#888"} strokeWidth={2} dot={false} name={p} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="mt-3 pt-3 border-t border-subtle">
                    <p className="text-[10px] text-muted-foreground mb-1.5">Current prices · 7-day change</p>
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="text-muted-foreground">
                          <th className="text-left py-1 font-normal">Platform</th>
                          <th className="text-right py-1 font-normal">Price (₹)</th>
                          <th className="text-right py-1 font-normal">Δ 7d</th>
                          <th className="text-right py-1 font-normal">vs Min</th>
                        </tr>
                      </thead>
                      <tbody>
                        {plats.map(p => {
                          const cur = Number(latest[p] ?? 0);
                          const pr = Number(prev[p] ?? cur);
                          const delta = cur - pr;
                          return (
                            <tr key={p} className="border-t border-subtle/50">
                              <td className="py-1.5 text-foreground">
                                <span className="inline-flex items-center gap-1.5">
                                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColors[p] || "#888" }} />{p}
                                </span>
                              </td>
                              <td className={`py-1.5 text-right font-mono ${cur === minP ? "text-sw-green font-bold" : cur === maxP ? "text-sw-red" : "text-foreground"}`}>{cur.toFixed(2)}</td>
                              <td className={`py-1.5 text-right font-mono ${delta < 0 ? "text-sw-green" : delta > 0 ? "text-sw-red" : "text-muted-foreground"}`}>{delta === 0 ? "0" : `${delta > 0 ? "+" : ""}${delta.toFixed(2)}`}</td>
                              <td className="py-1.5 text-right font-mono text-muted-foreground">{cur === minP ? "—" : `+${(cur - minP).toFixed(2)}`}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()
          )}
        </PanelCard>
      </div>

      {/* Price History */}
      <PanelCard title="Price History — 30 Days" badge={`${selectedSku} · ${priceHistoryPlatform === "All" ? "All Platforms" : priceHistoryPlatform}`} badgeColor="accent" delay={0.4}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] text-muted-foreground">Toggle:</span>
          <button onClick={() => setPriceHistoryToggle("sku")} className={`px-2 py-1 rounded text-[10px] font-medium ${priceHistoryToggle === "sku" ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>SKU</button>
          <button onClick={() => setPriceHistoryToggle("platform")} className={`px-2 py-1 rounded text-[10px] font-medium ${priceHistoryToggle === "platform" ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>Platform</button>
        </div>
        {priceHistoryToggle === "sku" ? (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-muted-foreground">SKU</span>
            <Select value={selectedSku} onValueChange={setSelectedSku}>
              <SelectTrigger className="w-[180px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {skuOptions.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] text-muted-foreground">Platform</span>
            <Select value={priceHistoryPlatform} onValueChange={setPriceHistoryPlatform}>
              <SelectTrigger className="w-[160px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["All", ...platformOptions].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={priceHistory}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
            <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} interval={6} />
            <YAxis tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
            <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
            <Line type="monotone" dataKey="yours" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Your Price" />
            <Line type="monotone" dataKey="comp1" stroke="hsl(0,76%,57%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name={compNames[0]} />
            <Line type="monotone" dataKey="comp2" stroke="hsl(38,92%,50%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name={compNames[1]} />
            <Line type="monotone" dataKey="comp3" stroke="hsl(160,70%,48%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name={compNames[2]} />
          </LineChart>
        </ResponsiveContainer>
      </PanelCard>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Price Index Trend — 30 Days" badge="You vs Category Avg" badgeColor="accent" delay={0}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[10px] text-muted-foreground">Filter SKU</span>
              <Select value={analyticsSkuFilter} onValueChange={setAnalyticsSkuFilter}>
                <SelectTrigger className="w-[180px] h-8 text-[11px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["All SKUs", ...skuOptions].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={priceIndexBySku[analyticsSkuFilter] || priceIndexTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} domain={[0.8, 1.3]} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="yours" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Your Price Index" />
                <Line type="monotone" dataKey="categoryAvg" stroke="hsl(225,10%,46%)" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Category Avg" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Price Elasticity by SKU" badge="Demand Sensitivity" badgeColor="amber" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={elasticityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={false} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <YAxis type="category" dataKey="sku" tick={{ fontSize: 10, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} width={80} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="sensitivity" fill="hsl(38,92%,50%)" radius={[0, 4, 4, 0]} name="Elasticity" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-muted-foreground mt-2">Higher values = more sensitive to price changes</p>
          </PanelCard>

          <PanelCard title="Competitor Price Gap" badge="Action Required" badgeColor="red" delay={0.2}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">SKU</th>
                  <th className="text-right py-2 font-normal">Your Price</th>
                  <th className="text-right py-2 font-normal">Lowest Competitor</th>
                  <th className="text-right py-2 font-normal">Gap</th>
                  <th className="text-right py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {priceGapTable.map((r, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground">{r.sku}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{r.yours}</td>
                    <td className="py-2.5 text-right font-mono text-sw-red">{r.lowest}</td>
                    <td className="py-2.5 text-right font-mono text-sw-red">{r.gap}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${r.action === "Match Price" ? "bg-sw-red-dim text-sw-red" : "bg-surface-3 text-muted-foreground"}`}>{r.action}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>
        </div>
      )}

      <Dialog open={!!openCampaign} onOpenChange={(o) => !o && setOpenCampaign(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Review Price-Win Campaign</DialogTitle>
          </DialogHeader>
          {openCampaign && (
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-lg bg-sw-green-dim/40 border border-sw-green/20">
                <p className="text-foreground">{openCampaign.insight}</p>
                <div className="flex gap-4 mt-2 font-mono text-[11px]">
                  <span>You: <span className="text-sw-green">{openCampaign.ownPrice}</span></span>
                  <span>{openCampaign.competitor}: <span className="text-muted-foreground">{openCampaign.compPrice}</span></span>
                  <span className="ml-auto px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green">{openCampaign.delta}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {[
                  ["Campaign name", openCampaign.campaignName],
                  ["Type", openCampaign.campaignType],
                  ["Platform", openCampaign.platform],
                  ["SKU", openCampaign.sku],
                  ["Daily budget", openCampaign.budget],
                  ["Default bid", openCampaign.bid],
                  ["Duration", openCampaign.duration],
                  ["Placements", openCampaign.placements],
                  ["Cities", openCampaign.cities],
                ].map(([k, v]) => (
                  <div key={k as string}>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{k}</div>
                    <div className="text-foreground font-mono">{v}</div>
                  </div>
                ))}
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">Target keywords</div>
                <div className="flex flex-wrap gap-1">
                  {openCampaign.keywords.map((kw: string) => (
                    <span key={kw} className="px-2 py-0.5 rounded-full bg-surface-3 text-[10px] font-mono">{kw}</span>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <button
              onClick={() => setOpenCampaign(null)}
              className="px-3 py-1.5 rounded-lg text-xs bg-surface-3 text-foreground hover:bg-surface-2">
              Cancel
            </button>
            <button
              onClick={() => {
                if (openCampaign?._index != null) {
                  setCampaignStates(p => ({ ...p, [openCampaign._index]: true }));
                }
                toast({ title: "Campaign launched", description: openCampaign?.campaignName });
                setOpenCampaign(null);
              }}
              className="px-3 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1">
              <Megaphone size={12} /> Confirm & Launch
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PricingView;
