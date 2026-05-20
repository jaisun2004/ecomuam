import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import DateRangeSubtitle from "@/components/DateRangeSubtitle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";
import { Megaphone, TrendingDown, TrendingUp, AlertTriangle, Eye, Bell, ShieldAlert, Tag } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useGuardrails } from "@/contexts/GuardrailContext";

const skuOptions = ["Pepsi 1L", "7UP 1L", "Aquafina 500ml", "Mountain Dew 1L", "Lipton Ice Tea 320ml"];
const platformOptions = ["Carrefour", "Noon", "Talabat", "Noon Minutes", "Talabat"];
const platformColors: Record<string, string> = { Carrefour: "#FF9900", Noon: "#2F77FF", Talabat: "#FDDC2B", "Noon Minutes": "#833AB4", "Talabat Pro": "#FC8019" };

const skuGroupOptions = ["All SKUs", "Butter Range", "Cream Range", "Health Range", "Value Range"];

const priceHistoryBySku: Record<string, Record<string, any[]>> = {
  "Pepsi 1L": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 40, comp1: i >= 12 ? 35 : 38, comp2: i >= 18 ? 42 : 45, comp3: 32 })),
    "Carrefour": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 40, comp1: i >= 12 ? 35 : 38, comp2: i >= 18 ? 42 : 45, comp3: 32 })),
    "Noon": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 42, comp1: i >= 12 ? 36 : 39, comp2: i >= 18 ? 44 : 46, comp3: 33 })),
    "Talabat": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 42, comp1: i >= 10 ? 38 : 40, comp2: 44, comp3: 35 })),
    "Noon Minutes": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 43, comp1: i >= 15 ? 38 : 41, comp2: 45, comp3: 34 })),
    "Talabat Pro": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 44, comp1: i >= 8 ? 39 : 42, comp2: 46, comp3: 36 })),
  },
  "7UP 1L": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 35, comp1: i >= 8 ? 30 : 32, comp2: 38, comp3: 28 })),
    "Carrefour": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 35, comp1: i >= 8 ? 30 : 32, comp2: 38, comp3: 28 })),
    "Noon": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 36, comp1: i >= 8 ? 31 : 33, comp2: 39, comp3: 29 })),
    "Talabat": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 37, comp1: 32, comp2: 40, comp3: 30 })),
    "Noon Minutes": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 37, comp1: 33, comp2: 41, comp3: 30 })),
    "Talabat Pro": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 38, comp1: 34, comp2: 42, comp3: 31 })),
  },
  "Aquafina 500ml": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 45, comp1: i >= 15 ? 40 : 42, comp2: 48, comp3: 38 })),
    "Carrefour": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 45, comp1: i >= 15 ? 40 : 42, comp2: 48, comp3: 38 })),
    "Noon": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 46, comp1: 41, comp2: 49, comp3: 39 })),
    "Talabat": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 47, comp1: 42, comp2: 50, comp3: 40 })),
    "Noon Minutes": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 47, comp1: 43, comp2: 51, comp3: 40 })),
    "Talabat Pro": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 48, comp1: 44, comp2: 52, comp3: 41 })),
  },
  "Mountain Dew 1L": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 30, comp1: i >= 10 ? 28 : 29, comp2: 32, comp3: 25 })),
    "Carrefour": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 30, comp1: i >= 10 ? 28 : 29, comp2: 32, comp3: 25 })),
    "Noon": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 31, comp1: 29, comp2: 33, comp3: 26 })),
    "Talabat": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 32, comp1: 30, comp2: 34, comp3: 27 })),
    "Noon Minutes": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 32, comp1: 30, comp2: 34, comp3: 27 })),
    "Talabat Pro": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 33, comp1: 31, comp2: 35, comp3: 28 })),
  },
  "Lipton Ice Tea 320ml": {
    "All": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 20, comp1: 18, comp2: 22, comp3: 15 })),
    "Carrefour": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 20, comp1: 18, comp2: 22, comp3: 15 })),
    "Noon": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 21, comp1: 19, comp2: 23, comp3: 16 })),
    "Talabat": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 22, comp1: 20, comp2: 24, comp3: 17 })),
    "Noon Minutes": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 22, comp1: 20, comp2: 24, comp3: 17 })),
    "Talabat Pro": Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, yours: 23, comp1: 21, comp2: 25, comp3: 18 })),
  },
};

const compNamesBySku: Record<string, string[]> = {
  "Pepsi 1L": ["Coca-Cola", "Almarai", "Rauch"],
  "7UP 1L": ["Coca-Cola", "Almarai", "Lacnor"],
  "Aquafina 500ml": ["Masafi", "Rauch", "Coca-Cola"],
  "Mountain Dew 1L": ["Almarai", "Coca-Cola", "Lacnor"],
  "Lipton Ice Tea 320ml": ["Almarai", "Coca-Cola", "Lacnor"],
};

const competitorMatrixByGroup: Record<string, Record<string, any[]>> = {
  "All SKUs": {
    Carrefour: [
      { brand: "PepsiCo Pepsi 1L", you: true, price: "AED 40", priceColor: "text-primary", rating: "4.4★", ratingColor: "text-sw-green", reviews: "2,847", pos: "#3", posColor: "text-sw-green", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Coca-Cola 1L", you: false, price: "AED 35 ↓", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "18,241", pos: "#1", posColor: "text-sw-red", sos: "41%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Almarai Juice 1L", you: false, price: "AED 25", priceColor: "text-sw-green", rating: "4.5★", ratingColor: "text-sw-green", reviews: "44,102", pos: "#2", posColor: "text-sw-amber", sos: "19%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Rauch Multivit 1L", you: false, price: "AED 45", priceColor: "text-sw-amber", rating: "4.1★", ratingColor: "text-sw-amber", reviews: "3,671", pos: "#5", posColor: "text-sw-amber", sos: "7%", sosColor: "text-muted-foreground", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
    Noon: [
      { brand: "PepsiCo Pepsi 1L", you: true, price: "AED 42", priceColor: "text-primary", rating: "4.3★", ratingColor: "text-sw-green", reviews: "1,482", pos: "#4", posColor: "text-sw-amber", sos: "22%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Coca-Cola 1L", you: false, price: "AED 36", priceColor: "text-sw-red", rating: "4.4★", ratingColor: "text-sw-green", reviews: "22,810", pos: "#1", posColor: "text-sw-red", sos: "38%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
    Talabat: [
      { brand: "PepsiCo Pepsi 1L", you: true, price: "AED 42", priceColor: "text-primary", rating: "4.2★", ratingColor: "text-sw-green", reviews: "342", pos: "#2", posColor: "text-sw-green", sos: "35%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Coca-Cola 1L", you: false, price: "AED 38", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "1,820", pos: "#1", posColor: "text-sw-red", sos: "42%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
    "Noon Minutes": [
      { brand: "PepsiCo Pepsi 1L", you: true, price: "AED 43", priceColor: "text-primary", rating: "4.1★", ratingColor: "text-sw-green", reviews: "218", pos: "#3", posColor: "text-sw-amber", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
      { brand: "Coca-Cola 1L", you: false, price: "AED 38", priceColor: "text-sw-red", rating: "4.2★", ratingColor: "text-sw-green", reviews: "1,120", pos: "#1", posColor: "text-sw-red", sos: "45%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
    "Talabat Pro": [
      { brand: "PepsiCo Pepsi 1L", you: true, price: "AED 44", priceColor: "text-primary", rating: "4.0★", ratingColor: "text-sw-amber", reviews: "156", pos: "#4", posColor: "text-sw-red", sos: "18%", sosColor: "text-sw-amber", stock: "LOW STOCK", stockColor: "text-sw-amber bg-sw-amber-dim" },
      { brand: "Coca-Cola 1L", you: false, price: "AED 39", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "2,410", pos: "#1", posColor: "text-sw-red", sos: "48%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    ],
  },
};

const priceAlerts = [
  { sku: "7UP 1L", competitor: "Coca-Cola", platform: "Carrefour", yourPrice: "AED 35", compPrice: "AED 30", gap: "+16.7%", impact: "Conversion -22%", severity: "high" },
  { sku: "Aquafina 500ml", competitor: "Masafi", platform: "Carrefour", yourPrice: "AED 45", compPrice: "AED 40", gap: "+12.5%", impact: "Conversion -15%", severity: "high" },
  { sku: "Mountain Dew 1L", competitor: "Almarai", platform: "Noon", yourPrice: "AED 30", compPrice: "AED 28", gap: "+7.1%", impact: "Conversion -6%", severity: "medium" },
  { sku: "Lipton Ice Tea 320ml", competitor: "Almarai", platform: "Noon Minutes", yourPrice: "AED 20", compPrice: "AED 18", gap: "+11.1%", impact: "Conversion -4%", severity: "low" },
];

const platformPricing = [
  { platform: "Carrefour", color: "#FF9900", avgIndex: 0.96, skusBelowComp: 3, skusAboveComp: 2, parity: 1, needsAttention: false },
  { platform: "Noon", color: "#2F77FF", avgIndex: 1.02, skusBelowComp: 2, skusAboveComp: 3, parity: 1, needsAttention: true },
  { platform: "Talabat", color: "#FDDC2B", avgIndex: 1.08, skusBelowComp: 1, skusAboveComp: 2, parity: 0, needsAttention: true },
  { platform: "Noon Minutes", color: "#833AB4", avgIndex: 1.05, skusBelowComp: 1, skusAboveComp: 2, parity: 0, needsAttention: true },
  { platform: "Talabat", color: "#FC8019", avgIndex: 1.12, skusBelowComp: 0, skusAboveComp: 3, parity: 0, needsAttention: true },
];

const platformPricingDetail: Record<string, { sku: string; yourPrice: string; compPrice: string; parity: boolean; competitor: string }[]> = {
  Carrefour: [
    { sku: "Pepsi 1L", yourPrice: "AED 40", compPrice: "AED 35", parity: false, competitor: "Coca-Cola" },
    { sku: "7UP 1L", yourPrice: "AED 35", compPrice: "AED 30", parity: false, competitor: "Coca-Cola" },
    { sku: "Aquafina 500ml", yourPrice: "AED 45", compPrice: "AED 45", parity: true, competitor: "Masafi" },
    { sku: "Mountain Dew 1L", yourPrice: "AED 30", compPrice: "AED 32", parity: true, competitor: "Almarai" },
  ],
  Noon: [
    { sku: "Pepsi 1L", yourPrice: "AED 42", compPrice: "AED 36", parity: false, competitor: "Coca-Cola" },
    { sku: "7UP 1L", yourPrice: "AED 36", compPrice: "AED 31", parity: false, competitor: "Coca-Cola" },
    { sku: "Aquafina 500ml", yourPrice: "AED 46", compPrice: "AED 41", parity: false, competitor: "Masafi" },
  ],
  Talabat: [
    { sku: "Pepsi 1L", yourPrice: "AED 42", compPrice: "AED 38", parity: false, competitor: "Coca-Cola" },
    { sku: "Mountain Dew 1L", yourPrice: "AED 32", compPrice: "AED 30", parity: false, competitor: "Almarai" },
  ],
  "Noon Minutes": [
    { sku: "Pepsi 1L", yourPrice: "AED 43", compPrice: "AED 38", parity: false, competitor: "Coca-Cola" },
    { sku: "Lipton Ice Tea 320ml", yourPrice: "AED 22", compPrice: "AED 20", parity: false, competitor: "Almarai" },
  ],
  "Talabat Pro": [
    { sku: "Pepsi 1L", yourPrice: "AED 44", compPrice: "AED 39", parity: false, competitor: "Coca-Cola" },
    { sku: "7UP 1L", yourPrice: "AED 38", compPrice: "AED 34", parity: false, competitor: "Coca-Cola" },
    { sku: "Aquafina 500ml", yourPrice: "AED 48", compPrice: "AED 44", parity: false, competitor: "Masafi" },
  ],
};

const priceAdvantageData = [
  { sku: "Pepsi 1L", yourPrice: "AED 40", compPrice: "AED 45", competitor: "Rauch", platform: "Carrefour", gap: "−12.5%", keywords: ["unibic butter drinks", "unibic beverages", "premium butter drinks"], estCpc: "AED 3.20", estRoas: "5.2x" },
  { sku: "Mountain Dew 1L", yourPrice: "AED 30", compPrice: "AED 34", competitor: "Coca-Cola", platform: "Noon", gap: "−11.8%", keywords: ["sunfeast bourbon", "chocolate cream beverages", "sunfeast dark fantasy"], estCpc: "AED 2.80", estRoas: "4.6x" },
  { sku: "Lipton Ice Tea 320ml", yourPrice: "AED 20", compPrice: "AED 24", competitor: "Almarai", platform: "Talabat", gap: "−16.7%", keywords: ["parle krackjack", "salted beverages online", "parle snack beverages"], estCpc: "AED 1.90", estRoas: "6.1x" },
];

const priceIndexTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  yours: +(1.0 + Math.random() * 0.1).toFixed(2),
  categoryAvg: 1.0,
}));

const elasticityData = [
  { sku: "Pepsi 1L", sensitivity: 0.82 },
  { sku: "7UP 1L", sensitivity: 0.65 },
  { sku: "Aquafina 500ml", sensitivity: 0.91 },
  { sku: "Mountain Dew 1L", sensitivity: 0.48 },
  { sku: "Lipton Ice Tea 320ml", sensitivity: 0.35 },
];

const priceGapTable = [
  { sku: "7UP 1L", yours: "AED 35", lowest: "AED 30", gap: "+16.7%", action: "Match Price" },
  { sku: "Aquafina 500ml", yours: "AED 45", lowest: "AED 40", gap: "+12.5%", action: "Match Price" },
  { sku: "Mountain Dew 1L", yours: "AED 30", lowest: "AED 28", gap: "+7.1%", action: "Monitor" },
  { sku: "Lipton Ice Tea 320ml", yours: "AED 20", lowest: "AED 18", gap: "+11.1%", action: "Monitor" },
  { sku: "Pepsi 1L", yours: "AED 40", lowest: "AED 35", gap: "+14.3%", action: "Match Price" },
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

const PricingView: React.FC = () => {
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [campaignStates, setCampaignStates] = useState<Record<number, boolean>>({});
  const [keywordCampaignStates, setKeywordCampaignStates] = useState<Record<number, boolean>>({});
  const [selectedSku, setSelectedSku] = useState("Pepsi 1L");
  const [selectedPlatform, setSelectedPlatform] = useState("Carrefour");
  const [selectedSkuGroup, setSelectedSkuGroup] = useState("All SKUs");
  const [priceHistoryToggle, setPriceHistoryToggle] = useState<"sku" | "platform">("sku");
  const [priceHistoryPlatform, setPriceHistoryPlatform] = useState("All");
  const [showNeedAttention, setShowNeedAttention] = useState(false);
  const [viewThroughPlatform, setViewThroughPlatform] = useState<string | null>(null);
  const [alertTeamStates, setAlertTeamStates] = useState<Record<string, boolean>>({});
  const [analyticsSkuFilter, setAnalyticsSkuFilter] = useState("All SKUs");

  const compNames = compNamesBySku[selectedSku] || compNamesBySku["Pepsi 1L"];
  const competitorMatrix = (competitorMatrixByGroup["All SKUs"] || {})[selectedPlatform] || [];
  const priceHistory = (priceHistoryBySku[selectedSku] || priceHistoryBySku["Pepsi 1L"])[priceHistoryPlatform] || (priceHistoryBySku[selectedSku] || priceHistoryBySku["Pepsi 1L"])["All"];

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
          <button onClick={() => { setShowNeedAttention(true); setSelectedPlatform("Noon"); }}
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
        <PanelCard title="Active Price Alerts" badge={`${priceAlerts.length} alerts`} badgeColor="red" delay={0.3}>
          <div className="space-y-2">
            {priceAlerts.map((a, i) => (
              <div key={i} className={`p-3 rounded-xl border ${
                a.severity === "high" ? "bg-sw-red-dim/30 border-sw-red/20" : a.severity === "medium" ? "bg-sw-amber-dim/30 border-sw-amber/20" : "bg-surface-2 border-subtle"
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-foreground font-medium">{a.sku}</span>
                  <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                    a.severity === "high" ? "bg-sw-red-dim text-sw-red" : "bg-sw-amber-dim text-sw-amber"
                  }`}>{a.gap}</span>
                </div>
                <p className="text-[10px] text-muted-foreground">
                  {a.competitor} on {a.platform}: {a.compPrice} vs your {a.yourPrice} · {a.impact}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <button onClick={() => setActionStates(p => ({ ...p, [i]: true }))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      actionStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-red/20 text-sw-red hover:bg-sw-red/30"
                    }`}>
                    {actionStates[i] ? "✓ Price Matched" : "Match Price"}
                  </button>
                  <button onClick={() => setCampaignStates(p => ({ ...p, [i]: true }))}
                    className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      campaignStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}>
                    <Megaphone size={10} />
                    {campaignStates[i] ? "✓ Campaign Live" : "Value Campaign"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Platform Price Index" badge="vs Competition" badgeColor="accent" delay={0.35}>
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
                {/* View through detail */}
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
        </PanelCard>
      </div>

      {/* Price History with SKU + Platform toggle */}
      <div className="grid grid-cols-2 gap-4">
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
          <ResponsiveContainer width="100%" height={200}>
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

        <PanelCard title="Price Advantage — Keyword Attack" badge="Lower-Priced SKUs" badgeColor="green" delay={0.45}>
          <p className="text-[10px] text-muted-foreground mb-3">SKUs where you're priced lower than a like-for-like competitor. Target their branded keywords with campaigns.</p>
          <div className="space-y-2">
            {priceAdvantageData.map((item, i) => (
              <div key={i} className="p-3 rounded-xl border border-sw-green/20 bg-sw-green-dim/10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-foreground font-medium">{item.sku}</span>
                  <span className="font-mono text-[10px] text-sw-green px-1.5 py-0.5 rounded-full bg-sw-green-dim">{item.gap} cheaper</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-muted-foreground">You <span className="font-mono text-foreground">{item.yourPrice}</span> vs {item.competitor} <span className="font-mono text-sw-red">{item.compPrice}</span> on {item.platform}</span>
                </div>
                <div className="mb-2">
                  <span className="text-[10px] text-muted-foreground">Target keywords: </span>
                  {item.keywords.map((kw, ki) => (
                    <span key={ki} className="inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground mr-1 mb-1">{kw}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setKeywordCampaignStates(p => ({ ...p, [i]: true }))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      keywordCampaignStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}>
                    <Megaphone size={10} />
                    {keywordCampaignStates[i] ? "✓ Campaign Triggered" : "Attack Their Keywords"}
                  </button>
                  <span className="text-[9px] text-muted-foreground">Est. CPC: {item.estCpc} · Est. ROAS: {item.estRoas}</span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
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
    </div>
  );
};

export default PricingView;
