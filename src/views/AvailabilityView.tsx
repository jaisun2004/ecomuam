import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, ReferenceLine } from "recharts";
import { AlertTriangle, Megaphone, MapPin, Store, Info } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

const availScoreTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  score: Math.round(55 + Math.random() * 30),
}));

const skuHeatmapData = ["Good Day Butter 200g", "Marie Gold 250g", "NutriChoice Digestive", "Good Day Choco Chip", "50-50 Maska Chaska", "Milk Bikis 100g"].map(sku => ({
  sku,
  days: Array.from({ length: 30 }, () => Math.round(Math.random() * 100)),
}));
const oosTimeline = [
  { day: "Mar 1", oos: 4 }, { day: "Mar 5", oos: 6 }, { day: "Mar 10", oos: 3 },
  { day: "Mar 15", oos: 8 }, { day: "Mar 20", oos: 5 }, { day: "Mar 25", oos: 11 }, { day: "Mar 30", oos: 14 },
];

const platformAvailability = [
  { name: "Amazon", overall: 86, color: "#FF9900", skus: [
    { sku: "Good Day Butter 200g", avail: 97 }, { sku: "Marie Gold 250g", avail: 100 }, { sku: "NutriChoice Digestive", avail: 72 },
    { sku: "Good Day Choco Chip", avail: 95 }, { sku: "50-50 Maska Chaska", avail: 54 }, { sku: "Milk Bikis 100g", avail: 98 },
  ]},
  { name: "Flipkart", overall: 68, color: "#2F77FF", skus: [
    { sku: "Good Day Butter 200g", avail: 74 }, { sku: "Marie Gold 250g", avail: 92 }, { sku: "NutriChoice Digestive", avail: 61 },
    { sku: "Good Day Choco Chip", avail: 88 }, { sku: "50-50 Maska Chaska", avail: 12 }, { sku: "Milk Bikis 100g", avail: 78 },
  ]},
  { name: "Blinkit", overall: 41, color: "#FDDC2B", skus: [
    { sku: "Good Day Butter 200g", avail: 55 }, { sku: "Marie Gold 250g", avail: 38 }, { sku: "Milk Bikis 100g", avail: 71 },
  ]},
  { name: "Zepto", overall: 56, color: "#833AB4", skus: [
    { sku: "Good Day Butter 200g", avail: 93 }, { sku: "Marie Gold 250g", avail: 77 }, { sku: "Milk Bikis 100g", avail: 52 },
  ]},
  { name: "Instamart", overall: 21, color: "#FC8019", skus: [
    { sku: "Good Day Butter 200g", avail: 34 }, { sku: "Marie Gold 250g", avail: 9 }, { sku: "Milk Bikis 100g", avail: 41 },
  ]},
];

/* OOS products today */
const oosProductsToday = [
  { sku: "50-50 Maska Chaska 120g", platform: "Flipkart", since: "6h ago" },
  { sku: "Marie Gold 250g", platform: "Instamart", since: "3h ago" },
  { sku: "Marie Gold 250g", platform: "Blinkit", since: "1h ago" },
  { sku: "Milk Bikis 100g", platform: "Zepto", since: "4h ago" },
  { sku: "NutriChoice Digestive", platform: "Flipkart", since: "2h ago" },
];

const stockForecast = [
  { sku: "50-50 Maska Chaska 120g", platform: "Blinkit", currentStock: 12, daysToOOS: 2.3, trend: "critical" },
  { sku: "Milk Bikis 100g", platform: "Zepto", currentStock: 28, daysToOOS: 5.1, trend: "warning" },
  { sku: "Marie Gold 250g", platform: "Instamart", currentStock: 8, daysToOOS: 1.2, trend: "critical" },
  { sku: "NutriChoice Digestive", platform: "Flipkart", currentStock: 34, daysToOOS: 7.8, trend: "ok" },
  { sku: "Good Day Choco Chip", platform: "Amazon", currentStock: 45, daysToOOS: 12.4, trend: "ok" },
];

/* Darkstore listing gaps by city */
const darkstoreGaps = [
  {
    city: "Delhi NCR", totalDarkstores: 142,
    products: [
      { sku: "Good Day Butter 200g", listed: 98, unlisted: 44, coverage: 69, campaignsRunning: true, wastingBudget: true },
      { sku: "Marie Gold 250g", listed: 72, unlisted: 70, coverage: 51, campaignsRunning: true, wastingBudget: true },
      { sku: "50-50 Maska Chaska", listed: 34, unlisted: 108, coverage: 24, campaignsRunning: true, wastingBudget: true },
      { sku: "NutriChoice Digestive", listed: 88, unlisted: 54, coverage: 62, campaignsRunning: false, wastingBudget: false },
      { sku: "Good Day Choco Chip", listed: 45, unlisted: 97, coverage: 32, campaignsRunning: true, wastingBudget: true },
      { sku: "Milk Bikis 100g", listed: 110, unlisted: 32, coverage: 77, campaignsRunning: false, wastingBudget: false },
    ],
  },
  {
    city: "Mumbai", totalDarkstores: 98,
    products: [
      { sku: "Good Day Butter 200g", listed: 82, unlisted: 16, coverage: 84, campaignsRunning: true, wastingBudget: false },
      { sku: "Marie Gold 250g", listed: 55, unlisted: 43, coverage: 56, campaignsRunning: true, wastingBudget: true },
      { sku: "50-50 Maska Chaska", listed: 18, unlisted: 80, coverage: 18, campaignsRunning: true, wastingBudget: true },
      { sku: "NutriChoice Digestive", listed: 61, unlisted: 37, coverage: 62, campaignsRunning: false, wastingBudget: false },
      { sku: "Good Day Choco Chip", listed: 30, unlisted: 68, coverage: 31, campaignsRunning: true, wastingBudget: true },
      { sku: "Milk Bikis 100g", listed: 75, unlisted: 23, coverage: 77, campaignsRunning: false, wastingBudget: false },
    ],
  },
  {
    city: "Bangalore", totalDarkstores: 76,
    products: [
      { sku: "Good Day Butter 200g", listed: 68, unlisted: 8, coverage: 89, campaignsRunning: true, wastingBudget: false },
      { sku: "Marie Gold 250g", listed: 42, unlisted: 34, coverage: 55, campaignsRunning: true, wastingBudget: true },
      { sku: "50-50 Maska Chaska", listed: 22, unlisted: 54, coverage: 29, campaignsRunning: false, wastingBudget: false },
      { sku: "NutriChoice Digestive", listed: 55, unlisted: 21, coverage: 72, campaignsRunning: false, wastingBudget: false },
    ],
  },
];

const adWasteAlerts = darkstoreGaps.flatMap(city =>
  city.products
    .filter(p => p.wastingBudget)
    .map(p => ({
      city: city.city,
      sku: p.sku,
      coverage: p.coverage,
      unlisted: p.unlisted,
      totalDarkstores: city.totalDarkstores,
      wastedSpend: `₹${Math.round(p.unlisted * 0.12)}K/day`,
    }))
).slice(0, 6);

const AvailabilityView: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState(0);
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [selectedCity, setSelectedCity] = useState(0);
  const [adPauseStates, setAdPauseStates] = useState<Record<number, boolean>>({});
  const g = useGuardrails();
  const dedupActive = g.hasActiveAvailabilityStop();

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
      {dedupActive && (
        <div id="avail-dedup-banner" className="rounded-xl p-4 flex items-start gap-3" style={{
          borderLeft: "3px solid #4F7FFF",
          backgroundColor: "rgba(79,127,255,0.08)",
          border: "1px solid rgba(79,127,255,0.2)",
          borderRadius: "8px",
        }}>
          <Info size={16} style={{ color: "#4F7FFF", marginTop: 2, flexShrink: 0 }} />
          <div>
            <p className="text-[13px] font-medium text-foreground">Campaign action already in progress</p>
            <p className="text-[12px] mt-0.5" style={{ color: "#8B8FA8" }}>
              A Tier 1 hard stop has been triggered in Campaign Manager for this availability signal. 2 campaigns are currently paused or flagged.
            </p>
            <button onClick={() => g.navigateTo("campaigns", "campaign-conflict-banner")} className="text-[12px] font-medium mt-1.5 inline-block" style={{ color: "#4F7FFF" }}>
              View active Tier stops in Campaign Manager →
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Availability" value="68%" delta="▼ 4% vs last wk" deltaType="negative" sub="Across 5 platforms · 6 SKUs" accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Products Today" value={String(oosProductsToday.length)} delta="▲ 2 vs yesterday" deltaType="negative" sub="Products currently out of stock" accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Darkstore Gaps" value="412" delta="Unlisted product-store pairs" deltaType="negative" sub="Across 3 cities · Q-Commerce" accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="Ad Budget Wasted" value="₹2.8L/mo" delta="Ads running where not listed" deltaType="negative" sub="Click to pause OOS campaigns" accentColor="bg-sw-red" delay={0.15} onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "oos-bulk-off", params: { skus: oosProductsToday.map(o => o.sku).join(",") } })} />
      </div>

      {/* OOS Products Today + Platform Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="OOS Products Today" badge={`${oosProductsToday.length} products`} badgeColor="red" className="col-span-2" delay={0.2}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Product</th>
                <th className="text-left py-2 font-normal">Platform</th>
                <th className="text-right py-2 font-normal">Since</th>
                <th className="text-right py-2 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {oosProductsToday.map((item, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-sw-red flex-shrink-0" />
                    {item.sku}
                  </td>
                  <td className="py-2.5 text-muted-foreground">{item.platform}</td>
                  <td className="py-2.5 text-right font-mono text-sw-red">{item.since}</td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "oos-bulk-off", params: { skus: item.sku } })}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sw-red/15 text-sw-red hover:bg-sw-red/25">
                      Pause Campaigns →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 pt-3 border-t border-subtle">
            <button
              onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "oos-bulk-off", params: { skus: oosProductsToday.map(o => o.sku).join(",") } })}
              className="w-full px-3 py-2 rounded-lg text-[11px] font-medium bg-sw-red/15 text-sw-red hover:bg-sw-red/25 flex items-center justify-center gap-2">
              <AlertTriangle size={12} />
              Bulk Pause All OOS Campaigns ({oosProductsToday.length} products)
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Platform Availability" badge="All Platforms" badgeColor="accent" delay={0.25}>
          <div className="space-y-3">
            {platformAvailability.map((p, i) => (
              <button key={p.name} onClick={() => setSelectedPlatform(i)}
                className={`w-full flex items-center gap-2 p-2 rounded-xl transition-all ${selectedPlatform === i ? "bg-primary/10 border border-primary/20" : "hover:bg-surface-2"}`}>
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-foreground flex-1 text-left">{p.name}</span>
                <div className="w-24 h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{
                    width: `${p.overall}%`,
                    backgroundColor: p.overall >= 70 ? "hsl(160,70%,48%)" : p.overall >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                  }} />
                </div>
                <span className={`font-mono text-[11px] w-10 text-right ${
                  p.overall >= 70 ? "text-sw-green" : p.overall >= 50 ? "text-sw-amber" : "text-sw-red"
                }`}>{p.overall}%</span>
              </button>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* SKU Availability — Platform Level View */}
      <PanelCard title="SKU Availability — Platform View" badge="All SKUs across platforms" badgeColor="accent" delay={0.28}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-subtle">
                <th className="text-left py-2 font-normal">SKU</th>
                {platformAvailability.map(p => (
                  <th key={p.name} className="text-center py-2 font-normal">
                    <span className="flex items-center gap-1 justify-center">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {["Good Day Butter 200g", "Marie Gold 250g", "NutriChoice Digestive", "Good Day Choco Chip", "50-50 Maska Chaska", "Milk Bikis 100g"].map((sku, i) => (
                <tr key={sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground">{sku}</td>
                  {platformAvailability.map(p => {
                    const skuData = p.skus.find(s => s.sku === sku);
                    const avail = skuData?.avail ?? null;
                    return (
                      <td key={p.name} className="py-2.5 text-center">
                        {avail !== null ? (
                          <span className={`font-mono text-[10px] ${avail >= 80 ? "text-sw-green" : avail >= 50 ? "text-sw-amber" : "text-sw-red"}`}>
                            {avail}%
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {/* Darkstore Listing Gaps */}
      <PanelCard title="Darkstore Listing Gaps" badge="Q-Commerce Coverage" badgeColor="amber" delay={0.28}>
        <div className="flex items-center gap-2 mb-4">
          {darkstoreGaps.map((c, i) => (
            <button key={c.city} onClick={() => setSelectedCity(i)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                selectedCity === i ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
              }`}>
              <MapPin size={10} className="inline mr-1" />{c.city} · {c.totalDarkstores} stores
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Product</th>
                <th className="text-right py-2 font-normal">Listed</th>
                <th className="text-right py-2 font-normal">Unlisted</th>
                <th className="text-right py-2 font-normal">Coverage</th>
                <th className="text-center py-2 font-normal">Ads Running?</th>
                <th className="text-center py-2 font-normal">Issue</th>
              </tr>
            </thead>
            <tbody>
              {darkstoreGaps[selectedCity].products.map((p, i) => (
                <tr key={p.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground flex items-center gap-1.5">
                    <Store size={12} className="text-muted-foreground" /> {p.sku}
                  </td>
                  <td className="py-2.5 text-right font-mono text-sw-green">{p.listed}</td>
                  <td className="py-2.5 text-right font-mono text-sw-red">{p.unlisted}</td>
                  <td className="py-2.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <div className="w-16 h-2 bg-surface-3 rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${p.coverage}%`,
                          backgroundColor: p.coverage >= 70 ? "hsl(160,70%,48%)" : p.coverage >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                        }} />
                      </div>
                      <span className={`font-mono text-[11px] ${
                        p.coverage >= 70 ? "text-sw-green" : p.coverage >= 50 ? "text-sw-amber" : "text-sw-red"
                      }`}>{p.coverage}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-center">
                    <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                      p.campaignsRunning ? "bg-sw-green-dim text-sw-green" : "bg-surface-3 text-muted-foreground"
                    }`}>{p.campaignsRunning ? "YES" : "NO"}</span>
                  </td>
                  <td className="py-2.5 text-center">
                    {p.wastingBudget ? (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-red-dim text-sw-red flex items-center gap-0.5 justify-center">
                        <AlertTriangle size={9} /> WASTING BUDGET
                      </span>
                    ) : (
                      <span className="text-[9px] text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-xl bg-sw-red-dim border border-sw-red/20">
          <p className="text-[11px] text-foreground">⚠ {darkstoreGaps[selectedCity].products.filter(p => p.wastingBudget).length} products have campaigns running in areas where they're not listed on darkstores. Estimated budget waste: ₹{Math.round(darkstoreGaps[selectedCity].products.filter(p => p.wastingBudget).reduce((s, p) => s + p.unlisted * 0.12, 0))}K/day</p>
        </div>
      </PanelCard>

      {/* Ad Waste Alerts */}
      <PanelCard title="Ad Budget Waste — Campaigns in Unlisted Areas" badge={`${adWasteAlerts.length} alerts`} badgeColor="red" delay={0.32}>
        <p className="text-[10px] text-muted-foreground mb-3">Campaigns running in cities/pincodes where products are not listed on enough darkstores. Pause or geo-restrict these campaigns.</p>
        <div className="grid grid-cols-2 gap-3">
          {adWasteAlerts.map((a, i) => (
            <div key={i} className="p-3 rounded-xl bg-sw-red-dim/30 border border-sw-red/20">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground font-medium">{a.sku} — {a.city}</span>
                <span className="font-mono text-[9px] text-sw-red">{a.wastedSpend} wasted</span>
              </div>
              <p className="text-[10px] text-muted-foreground">Only {a.coverage}% coverage ({a.unlisted}/{a.totalDarkstores} stores unlisted)</p>
              <div className="flex items-center gap-2 mt-2">
                {dedupActive ? (
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(85,90,110,0.15)", color: "#8B8FA8" }}>
                    Campaign action in progress — Campaign Manager
                  </span>
                ) : (
                  <button onClick={() => setAdPauseStates(p => ({ ...p, [i]: true }))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      adPauseStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-sw-red/20 text-sw-red hover:bg-sw-red/30"
                    }`}>
                    {adPauseStates[i] ? "✓ Campaign Geo-Restricted" : "Pause Ads in Unlisted Areas"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* SKU Breakdown */}
      <PanelCard title={`SKU Availability — ${platformAvailability[selectedPlatform].name}`} badge="SKU Level" badgeColor="accent" delay={0.35}>
        <div className="space-y-2">
          {platformAvailability[selectedPlatform].skus.map((s) => (
            <div key={s.sku} className="flex items-center gap-3 p-2 bg-surface-2 rounded-xl border border-subtle">
              <span className="text-xs text-foreground flex-1">{s.sku}</span>
              <div className="w-32 h-2.5 bg-surface-3 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{
                  width: `${s.avail}%`,
                  backgroundColor: s.avail >= 80 ? "hsl(160,70%,48%)" : s.avail >= 50 ? "hsl(38,92%,50%)" : "hsl(0,76%,57%)"
                }} />
              </div>
              <span className={`font-mono text-[11px] w-10 text-right ${
                s.avail >= 80 ? "text-sw-green" : s.avail >= 50 ? "text-sw-amber" : "text-sw-red"
              }`}>{s.avail}%</span>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Stock Forecast */}
      <PanelCard title="Stock-out Forecast" badge="AI Prediction" badgeColor="purple" delay={0.45}>
        <div className="grid grid-cols-2 gap-2">
          {stockForecast.map((s, i) => (
            <div key={i} className={`flex items-center gap-3 p-3 rounded-xl border ${
              s.trend === "critical" ? "bg-sw-red-dim/50 border-sw-red/20" : s.trend === "warning" ? "bg-sw-amber-dim/50 border-sw-amber/20" : "bg-surface-2 border-subtle"
            }`}>
              <div className="flex-1">
                <p className="text-xs text-foreground font-medium">{s.sku}</p>
                <p className="text-[10px] text-muted-foreground">{s.platform} · Stock: {s.currentStock}%</p>
              </div>
              <div className="text-right">
                <p className={`font-mono text-sm font-bold ${
                  s.trend === "critical" ? "text-sw-red" : s.trend === "warning" ? "text-sw-amber" : "text-sw-green"
                }`}>{s.daysToOOS}d</p>
                <p className="text-[9px] text-muted-foreground">to stock-out</p>
              </div>
              <button onClick={() => setActionStates(p => ({ ...p, [i]: true }))}
                className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                  actionStates[i] ? "bg-sw-green-dim text-sw-green" :
                  s.trend === "critical" ? "bg-sw-red/20 text-sw-red hover:bg-sw-red/30" : "bg-surface-3 text-foreground hover:bg-primary/10"
                }`}>
                {actionStates[i] ? "✓ Ordered" : "Reorder"}
              </button>
            </div>
          ))}
        </div>
      </PanelCard>
      </>) : (
        /* Analytics tab */
        <AvailabilityAnalytics g={g} />
      )}
    </div>
  );
};

const AvailabilityAnalytics: React.FC<{ g: ReturnType<typeof useGuardrails> }> = ({ g }) => {
  const [selectedCell, setSelectedCell] = useState<{ sku: string; day: number; value: number } | null>(null);

  const skuNames = ["Good Day Butter 200g", "Marie Gold 250g", "NutriChoice Digestive", "Good Day Choco Chip", "50-50 Maska Chaska", "Milk Bikis 100g"];
  const heatmapData = skuNames.map(sku => ({
    sku,
    days: Array.from({ length: 30 }, () => Math.round(Math.random() * 100)),
  }));

  const cellColor = (val: number) => {
    if (val <= 20) return "rgba(255,92,92,0.7)";
    if (val <= 50) return "rgba(245,166,35,0.5)";
    return "rgba(46,207,142,0.5)";
  };

  const affectedCampaigns = ["Good Day — Sponsored", "Q-Commerce Biscuit Push"];
  const tier2Locks = ["Manual pause — NutriChoice Retargeting"];

  return (
    <div className="space-y-5">
      <PanelCard title="Availability by SKU Over Time" badge="30 Days" badgeColor="red" delay={0}>
        <div className="relative">
          <div className="overflow-x-auto">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                <span className="text-[10px] text-muted-foreground w-32 flex-shrink-0" />
                {Array.from({ length: 30 }, (_, i) => (
                  <span key={i} className="text-[7px] font-mono text-muted-foreground w-4 text-center flex-shrink-0">{i + 1}</span>
                ))}
              </div>
              {heatmapData.map((row) => (
                <div key={row.sku} className="flex items-center gap-1">
                  <span className="text-[10px] text-foreground w-32 flex-shrink-0 truncate">{row.sku}</span>
                  <div className="flex gap-px">
                    {row.days.map((val, di) => (
                      <div
                        key={di}
                        className={`w-4 h-4 rounded-sm ${val <= 50 ? "cursor-pointer hover:ring-1 hover:ring-primary" : ""}`}
                        style={{ backgroundColor: cellColor(val) }}
                        title={`${row.sku} · Mar ${di + 1} · ${val}%`}
                        onClick={() => {
                          if (val <= 50) setSelectedCell({ sku: row.sku, day: di + 1, value: val });
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3 mt-3 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(255,92,92,0.7)" }} /> 0-20%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(245,166,35,0.5)" }} /> 20-50%</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "rgba(46,207,142,0.5)" }} /> 50-100%</span>
              <span className="text-[9px] text-muted-foreground ml-2">Click red/amber cells for actions</span>
            </div>
          </div>

          {selectedCell && (
            <div className="absolute top-0 right-0 w-80 bg-surface-1 border border-subtle rounded-xl shadow-xl z-10 overflow-hidden">
              <div className="p-4 border-b border-subtle flex items-center justify-between">
                <h4 className="text-sm font-medium text-foreground">Action for {selectedCell.sku} — Mar {selectedCell.day}</h4>
                <button onClick={() => setSelectedCell(null)} className="text-muted-foreground hover:text-foreground">✕</button>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <p className="text-[10px] text-muted-foreground">Availability</p>
                  <p className="font-mono text-lg font-bold" style={{ color: selectedCell.value <= 20 ? "#FF5C5C" : "#F5A623" }}>{selectedCell.value}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Affected Campaigns</p>
                  {affectedCampaigns.map(c => (
                    <p key={c} className="text-xs text-foreground">• {c}</p>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Active Tier 2 Locks</p>
                  {tier2Locks.map(l => (
                    <p key={l} className="text-xs text-sw-amber">• {l}</p>
                  ))}
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground mb-1">Recommended Action</p>
                  <p className="text-xs text-foreground">Pause campaigns in low-stock areas or reduce bids to conserve budget.</p>
                </div>
                <button
                  onClick={() => {
                    g.navigateWithContext("campaigns", "campaign-digest", {
                      type: "availability",
                      params: { sku: selectedCell.sku }
                    });
                    setSelectedCell(null);
                  }}
                  className="w-full px-3 py-2 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#4F7FFF" }}>
                  View in Campaign Manager →
                </button>
              </div>
            </div>
          )}
        </div>
      </PanelCard>

      <PanelCard title="Availability Score — 30 Days" badge="Trend" badgeColor="accent" delay={0.1}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={availScoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
            <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
            <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
            <ReferenceLine y={20} stroke="hsl(0,76%,57%)" strokeDasharray="5 5" label={{ value: "20% threshold", fill: "hsl(0,76%,57%)", fontSize: 9 }} />
            <Line type="monotone" dataKey="score" stroke="hsl(228,90%,64%)" strokeWidth={2} dot={false} name="Availability %" />
          </LineChart>
        </ResponsiveContainer>
      </PanelCard>

      <div className="rounded-xl border border-subtle bg-surface-1 p-5">
        <h3 className="text-sm font-medium text-foreground mb-1">Stockout Summary</h3>
        <p className="text-[11px] text-muted-foreground mb-3">Out-of-stock impact in the last 30 days</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
            <p className="font-mono text-2xl font-bold text-sw-amber">33</p>
            <p className="text-[10px] text-muted-foreground mt-1">Total OOS Days</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-center">
            <p className="font-mono text-2xl font-bold text-sw-red">{oosProductsToday.length}</p>
            <p className="text-[10px] text-muted-foreground mt-1">Products OOS Today</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityView;
