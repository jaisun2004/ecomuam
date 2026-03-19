import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, ReferenceDot, BarChart, Bar } from "recharts";
import { Megaphone, TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

const priceIndexTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  yours: +(1.0 + Math.random() * 0.1).toFixed(2),
  categoryAvg: 1.0,
}));

const elasticityData = [
  { sku: "Good Day 200g", sensitivity: 0.82 },
  { sku: "Marie Gold 250g", sensitivity: 0.65 },
  { sku: "NutriChoice 100g", sensitivity: 0.91 },
  { sku: "Bourbon 150g", sensitivity: 0.48 },
  { sku: "50-50 120g", sensitivity: 0.35 },
];

const priceGapTable = [
  { sku: "Marie Gold 250g", yours: "₹35", lowest: "₹30", gap: "+16.7%", action: "Match Price" },
  { sku: "NutriChoice 100g", yours: "₹45", lowest: "₹40", gap: "+12.5%", action: "Match Price" },
  { sku: "Bourbon 150g", yours: "₹30", lowest: "₹28", gap: "+7.1%", action: "Monitor" },
  { sku: "50-50 120g", yours: "₹20", lowest: "₹18", gap: "+11.1%", action: "Monitor" },
  { sku: "Good Day 200g", yours: "₹40", lowest: "₹35", gap: "+14.3%", action: "Match Price" },
];

const skuOptions = ["Good Day 200g", "Marie Gold 250g", "NutriChoice 100g", "Bourbon 150g", "50-50 120g"];
const platformOptions = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"];
const platformColors: Record<string, string> = { Amazon: "#FF9900", Flipkart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4", Instamart: "#FC8019" };

const priceHistoryBySku: Record<string, any[]> = {
  "Good Day 200g": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, yours: 40, comp1: i >= 12 ? 35 : 38, comp2: i >= 18 ? 42 : 45, comp3: 32,
  })),
  "Marie Gold 250g": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, yours: 35, comp1: i >= 8 ? 30 : 32, comp2: 38, comp3: 28,
  })),
  "NutriChoice 100g": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, yours: 45, comp1: i >= 15 ? 40 : 42, comp2: 48, comp3: 38,
  })),
  "Bourbon 150g": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, yours: 30, comp1: i >= 10 ? 28 : 29, comp2: 32, comp3: 25,
  })),
  "50-50 120g": Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`, yours: 20, comp1: 18, comp2: 22, comp3: 15,
  })),
};

const competitorMatrixByPlatform: Record<string, any[]> = {
  Amazon: [
    { brand: "Britannia Good Day 200g", you: true, price: "₹40", priceColor: "text-primary", rating: "4.4★", ratingColor: "text-sw-green", reviews: "2,847", pos: "#3", posColor: "text-sw-green", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Sunfeast Butter 200g", you: false, price: "₹35 ↓", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "18,241", pos: "#1", posColor: "text-sw-red", sos: "41%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Parle-G Gold 200g", you: false, price: "₹25", priceColor: "text-sw-green", rating: "4.5★", ratingColor: "text-sw-green", reviews: "44,102", pos: "#2", posColor: "text-sw-amber", sos: "19%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Unibic Butter 200g", you: false, price: "₹45", priceColor: "text-sw-amber", rating: "4.1★", ratingColor: "text-sw-amber", reviews: "3,671", pos: "#5", posColor: "text-sw-amber", sos: "7%", sosColor: "text-muted-foreground", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  ],
  Flipkart: [
    { brand: "Britannia Good Day 200g", you: true, price: "₹42", priceColor: "text-primary", rating: "4.3★", ratingColor: "text-sw-green", reviews: "1,482", pos: "#4", posColor: "text-sw-amber", sos: "22%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Sunfeast Butter 200g", you: false, price: "₹36", priceColor: "text-sw-red", rating: "4.4★", ratingColor: "text-sw-green", reviews: "22,810", pos: "#1", posColor: "text-sw-red", sos: "38%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Parle-G Gold 200g", you: false, price: "₹26", priceColor: "text-sw-green", rating: "4.5★", ratingColor: "text-sw-green", reviews: "38,540", pos: "#2", posColor: "text-sw-amber", sos: "24%", sosColor: "text-sw-amber", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  ],
  Blinkit: [
    { brand: "Britannia Good Day 200g", you: true, price: "₹42", priceColor: "text-primary", rating: "4.2★", ratingColor: "text-sw-green", reviews: "342", pos: "#2", posColor: "text-sw-green", sos: "35%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Sunfeast Butter 200g", you: false, price: "₹38", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "1,820", pos: "#1", posColor: "text-sw-red", sos: "42%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  ],
  Zepto: [
    { brand: "Britannia Good Day 200g", you: true, price: "₹43", priceColor: "text-primary", rating: "4.1★", ratingColor: "text-sw-green", reviews: "218", pos: "#3", posColor: "text-sw-amber", sos: "28%", sosColor: "text-sw-green", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
    { brand: "Sunfeast Butter 200g", you: false, price: "₹38", priceColor: "text-sw-red", rating: "4.2★", ratingColor: "text-sw-green", reviews: "1,120", pos: "#1", posColor: "text-sw-red", sos: "45%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  ],
  Instamart: [
    { brand: "Britannia Good Day 200g", you: true, price: "₹44", priceColor: "text-primary", rating: "4.0★", ratingColor: "text-sw-amber", reviews: "156", pos: "#4", posColor: "text-sw-red", sos: "18%", sosColor: "text-sw-amber", stock: "LOW STOCK", stockColor: "text-sw-amber bg-sw-amber-dim" },
    { brand: "Sunfeast Butter 200g", you: false, price: "₹39", priceColor: "text-sw-red", rating: "4.3★", ratingColor: "text-sw-green", reviews: "2,410", pos: "#1", posColor: "text-sw-red", sos: "48%", sosColor: "text-sw-red", stock: "IN STOCK", stockColor: "text-sw-green bg-sw-green-dim" },
  ],
};

const compNamesBySku: Record<string, string[]> = {
  "Good Day 200g": ["Sunfeast", "Parle", "Unibic"],
  "Marie Gold 250g": ["Sunfeast", "Parle-G", "ITC"],
  "NutriChoice 100g": ["McVities", "Unibic", "Sunfeast"],
  "Bourbon 150g": ["Parle", "Sunfeast", "ITC"],
  "50-50 120g": ["Parle", "Sunfeast", "ITC"],
};

const priceAlerts = [
  { sku: "Marie Gold 250g", competitor: "Sunfeast", platform: "Amazon", yourPrice: "₹35", compPrice: "₹30", gap: "+16.7%", impact: "Conversion -22%", severity: "high" },
  { sku: "NutriChoice 100g", competitor: "McVities", platform: "Amazon", yourPrice: "₹45", compPrice: "₹40", gap: "+12.5%", impact: "Conversion -15%", severity: "high" },
  { sku: "Bourbon 150g", competitor: "Parle", platform: "Flipkart", yourPrice: "₹30", compPrice: "₹28", gap: "+7.1%", impact: "Conversion -6%", severity: "medium" },
  { sku: "50-50 120g", competitor: "Parle", platform: "Zepto", yourPrice: "₹20", compPrice: "₹18", gap: "+11.1%", impact: "Conversion -4%", severity: "low" },
];

const platformPricing = [
  { platform: "Amazon", color: "#FF9900", avgIndex: 0.96, skusBelowComp: 3, skusAboveComp: 2, parity: 1 },
  { platform: "Flipkart", color: "#2F77FF", avgIndex: 1.02, skusBelowComp: 2, skusAboveComp: 3, parity: 1 },
  { platform: "Blinkit", color: "#FDDC2B", avgIndex: 1.08, skusBelowComp: 1, skusAboveComp: 2, parity: 0 },
  { platform: "Zepto", color: "#833AB4", avgIndex: 1.05, skusBelowComp: 1, skusAboveComp: 2, parity: 0 },
  { platform: "Instamart", color: "#FC8019", avgIndex: 1.12, skusBelowComp: 0, skusAboveComp: 3, parity: 0 },
];

const priceAdvantageData = [
  { sku: "Good Day 200g", yourPrice: "₹40", compPrice: "₹45", competitor: "Unibic", platform: "Amazon", gap: "−12.5%", keywords: ["unibic butter cookies", "unibic biscuits", "premium butter cookies"], estCpc: "₹3.20", estRoas: "5.2x" },
  { sku: "Bourbon 150g", yourPrice: "₹30", compPrice: "₹34", competitor: "Sunfeast", platform: "Flipkart", gap: "−11.8%", keywords: ["sunfeast bourbon", "chocolate cream biscuits", "sunfeast dark fantasy"], estCpc: "₹2.80", estRoas: "4.6x" },
  { sku: "50-50 120g", yourPrice: "₹20", compPrice: "₹24", competitor: "Parle", platform: "Blinkit", gap: "−16.7%", keywords: ["parle krackjack", "salted biscuits online", "parle snack biscuits"], estCpc: "₹1.90", estRoas: "6.1x" },
];
const PricingView: React.FC = () => {
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [campaignStates, setCampaignStates] = useState<Record<number, boolean>>({});
  const [keywordCampaignStates, setKeywordCampaignStates] = useState<Record<number, boolean>>({});
  const [selectedSku, setSelectedSku] = useState("Good Day 200g");
  const [selectedPlatform, setSelectedPlatform] = useState("Amazon");

  const priceHistory = priceHistoryBySku[selectedSku] || priceHistoryBySku["Good Day 200g"];
  const competitorMatrix = competitorMatrixByPlatform[selectedPlatform] || competitorMatrixByPlatform["Amazon"];
  const compNames = compNamesBySku[selectedSku] || compNamesBySku["Good Day 200g"];
  

  const g = useGuardrails();
  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Price Competitiveness" value="#2" delta="Best value in category" deltaType="positive" sub="Across 6 tracked SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="Price Changes (24h)" value="7" delta="⚠ 2 affect your SKUs" deltaType="warning" sub="Competitor moves today" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Avg Price Index" value="1.04x" delta="4% above market avg" deltaType="warning" sub="Across all platforms" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Conversion at Risk" value="−18%" delta="From pricing gaps" deltaType="negative" sub="Conversion loss from overpricing" accentColor="bg-sw-red" delay={0.15} />
      </div>

      {/* Competitor Matrix with platform toggle */}
      <PanelCard title="Competitor Intelligence Matrix" badge="Real-time" badgeColor="red" delay={0.2}>
        <div className="flex items-center gap-2 mb-4">
          {platformOptions.map(p => (
            <button key={p} onClick={() => setSelectedPlatform(p)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                selectedPlatform === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
              }`}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: platformColors[p] }} />
              {p}
            </button>
          ))}
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
            {platformPricing.map((p) => (
              <div key={p.platform} className="p-3 bg-surface-2 rounded-xl border border-subtle">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2 text-xs text-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.platform}
                  </span>
                  <span className={`font-mono text-sm font-bold ${p.avgIndex <= 1 ? "text-sw-green" : p.avgIndex <= 1.05 ? "text-sw-amber" : "text-sw-red"}`}>
                    {p.avgIndex.toFixed(2)}x
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px]">
                  <span className="text-sw-green">{p.skusBelowComp} below comp</span>
                  <span className="text-muted-foreground">{p.parity} at parity</span>
                  <span className="text-sw-red">{p.skusAboveComp} above comp</span>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Price History with SKU toggle + Content Gap with SKU toggle */}
      <div className="grid grid-cols-2 gap-4">
        <PanelCard title="Price History — 30 Days" badge={`${selectedSku} · ${selectedPlatform}`} badgeColor="accent" delay={0.4}>
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            {skuOptions.map(s => (
              <button key={s} onClick={() => setSelectedSku(s)}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  selectedSku === s ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>
                {s}
              </button>
            ))}
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={priceHistory}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} interval={6} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Line type="monotone" dataKey="yours" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Your Price" />
              <Line type="monotone" dataKey="comp1" stroke="hsl(0,76%,57%)" strokeWidth={2} strokeDasharray="5 5" dot={false} name={compNames[0]} />
              <Line type="monotone" dataKey="comp2" stroke="hsl(38,92%,50%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name={compNames[1]} />
              <Line type="monotone" dataKey="comp3" stroke="hsl(160,70%,48%)" strokeWidth={1.5} strokeDasharray="3 3" dot={false} name={compNames[2]} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground flex-wrap">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> You</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-red rounded-full" /> {compNames[0]}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-amber rounded-full" /> {compNames[1]}</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-green rounded-full" /> {compNames[2]}</span>
          </div>
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
                  <span className="text-[10px] text-foreground">{item.keywords.map((kw, ki) => (
                    <span key={ki} className="inline-block font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground mr-1 mb-1">{kw}</span>
                  ))}</span>
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
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={priceIndexTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} domain={[0.8, 1.3]} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="yours" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Your Price Index" />
                <Line type="monotone" dataKey="categoryAvg" stroke="hsl(225,10%,46%)" strokeWidth={1} strokeDasharray="5 5" dot={false} name="Category Avg" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-primary" /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-surface-3" /> Category Avg</span>
            </div>
          </PanelCard>

          <PanelCard title="Price Elasticity by SKU" badge="Demand Sensitivity" badgeColor="amber" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={elasticityData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} domain={[0, 1]} />
                <YAxis type="category" dataKey="sku" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} axisLine={false} tickLine={false} width={80} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
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
