import React, { useState, useMemo } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, ReferenceLine } from "recharts";
import { AlertTriangle, Megaphone, MapPin, Store, Info } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useGuardrails } from "@/contexts/GuardrailContext";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const availScoreTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  score: Math.round(55 + Math.random() * 30),
}));

const oosProductsToday = [
  { sku: "50-50 Maska Chaska 120g", platform: "Flipkart", city: "Delhi NCR", since: "6h ago" },
  { sku: "Marie Gold 250g", platform: "Instamart", city: "Mumbai", since: "3h ago" },
  { sku: "Marie Gold 250g", platform: "Blinkit", city: "Delhi NCR", since: "1h ago" },
  { sku: "Milk Bikis 100g", platform: "Zepto", city: "Bangalore", since: "4h ago" },
  { sku: "NutriChoice Digestive", platform: "Flipkart", city: "Mumbai", since: "2h ago" },
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

const stockForecast = [
  { sku: "50-50 Maska Chaska 120g", platform: "Blinkit", currentStock: 12, daysToOOS: 2.3, trend: "critical" },
  { sku: "Milk Bikis 100g", platform: "Zepto", currentStock: 28, daysToOOS: 5.1, trend: "warning" },
  { sku: "Marie Gold 250g", platform: "Instamart", currentStock: 8, daysToOOS: 1.2, trend: "critical" },
  { sku: "NutriChoice Digestive", platform: "Flipkart", currentStock: 34, daysToOOS: 7.8, trend: "ok" },
  { sku: "Good Day Choco Chip", platform: "Amazon", currentStock: 45, daysToOOS: 12.4, trend: "ok" },
];

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

const competitionAvailability = [
  { competitor: "Sunfeast", platform: "Amazon", avail: 96, yourAvail: 86, gap: "+10%", topProduct: "Sunfeast Butter 200g", trend: "stable" },
  { competitor: "Sunfeast", platform: "Blinkit", avail: 88, yourAvail: 41, gap: "+47%", topProduct: "Sunfeast Cream 150g", trend: "improving" },
  { competitor: "Parle", platform: "Flipkart", avail: 92, yourAvail: 68, gap: "+24%", topProduct: "Parle-G Gold 200g", trend: "stable" },
  { competitor: "Parle", platform: "Zepto", avail: 78, yourAvail: 56, gap: "+22%", topProduct: "Parle Krackjack 120g", trend: "declining" },
  { competitor: "ITC", platform: "Instamart", avail: 72, yourAvail: 21, gap: "+51%", topProduct: "Sunfeast Dark Fantasy", trend: "improving" },
  { competitor: "Unibic", platform: "Amazon", avail: 84, yourAvail: 86, gap: "−2%", topProduct: "Unibic Butter 200g", trend: "stable" },
];

const AvailabilityView: React.FC = () => {
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [selectedCity, setSelectedCity] = useState(0);
  const [compCampaignStates, setCompCampaignStates] = useState<Record<number, boolean>>({});
  const g = useGuardrails();
  const dedupActive = g.hasActiveAvailabilityStop();

  const [tab, setTab] = useState("overview");

  const allSkus = ["Good Day Butter 200g", "Marie Gold 250g", "NutriChoice Digestive", "Good Day Choco Chip", "50-50 Maska Chaska", "Milk Bikis 100g"];

  // Stabilize heatmap data
  const heatmapData = useMemo(() => {
    const skus = ["Good Day Butter 200g", "Marie Gold 250g", "NutriChoice Digestive", "Good Day Choco Chip", "50-50 Maska Chaska", "Milk Bikis 100g"];
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return skus.map(sku => ({
      sku,
      values: days.map(day => ({
        day,
        value: Math.round(40 + Math.random() * 55),
      })),
    }));
  }, []);

  const [selectedCell, setSelectedCell] = useState<{ sku: string; day: string; value: number } | null>(null);

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
            <p className="text-[12px] mt-0.5" style={{ color: "hsl(220,10%,46%)" }}>
              A Tier 1 hard stop has been triggered in Campaign Manager for this availability signal.
            </p>
            <button onClick={() => g.navigateTo("campaigns", "campaign-conflict-banner")} className="text-[12px] font-medium mt-1.5 inline-block" style={{ color: "#4F7FFF" }}>
              View active Tier stops in Campaign Manager →
            </button>
          </div>
        </div>
      )}
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Overall Availability" value="68%" delta="▼ 4% vs last wk" deltaType="negative" <KPICard title="Overall Availability" value="68%" delta="▼ 4% vs last wk" deltaType="negative" sub="Dropped due to Flipkart OOS surge — needs attention" accentColor="bg-sw-green" delay={0} /> accentColor="bg-sw-green" delay={0} />
        <KPICard title="OOS Products Today" value={String(oosProductsToday.length)} delta="▲ 2 vs yesterday" deltaType="negative" <KPICard title="OOS Products Today" value={String(oosProductsToday.length)} delta="▲ 2 vs yesterday" deltaType="negative" sub="Stockout spike from delayed replenishment — critical" accentColor="bg-sw-red" delay={0.05} /> accentColor="bg-sw-red" delay={0.05} />
        <KPICard title="Darkstore Gaps" value="412" delta="Unlisted product-store pairs" deltaType="negative" <KPICard title="Darkstore Gaps" value="412" delta="Unlisted product-store pairs" deltaType="negative" sub="Listing gaps widening — lost discoverability in key cities" accentColor="bg-sw-amber" delay={0.1} /> accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="Ad Budget Wasted" value="₹2.8L/mo" delta="Ads running where not listed" deltaType="negative" sub="Click to pause OOS campaigns" accentColor="bg-sw-red" delay={0.15} />
      </div>

      {/* OOS Products Today */}
      <PanelCard title="OOS Products Today" badge={`${oosProductsToday.length} products`} badgeColor="red" delay={0.2}>
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left py-2 font-normal">Product</th>
              <th className="text-left py-2 font-normal">Platform</th>
              <th className="text-left py-2 font-normal">City</th>
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
                <td className="py-2.5 text-muted-foreground">
                  <span className="flex items-center gap-1"><MapPin size={10} />{item.city}</span>
                </td>
                <td className="py-2.5 text-right font-mono text-sw-red">{item.since}</td>
                <td className="py-2.5 text-right">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sw-red/15 text-sw-red hover:bg-sw-red/25">
                        Pause Campaigns →
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Pause campaigns for {item.sku}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will pause all active campaigns for <strong>{item.sku}</strong> on <strong>{item.platform}</strong> in <strong>{item.city}</strong>. OOS since {item.since}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "oos-bulk-off", params: { skus: item.sku, city: item.city } })}
                        >
                          Confirm Pause
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="mt-3 pt-3 border-t border-subtle">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="w-full px-3 py-2 rounded-lg text-[11px] font-medium bg-sw-red/15 text-sw-red hover:bg-sw-red/25 flex items-center justify-center gap-2">
                <AlertTriangle size={12} />
                Bulk Pause All OOS Campaigns ({oosProductsToday.length} products)
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Bulk pause all OOS campaigns?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will pause campaigns for {oosProductsToday.length} out-of-stock products across all platforms and cities:
                  <ul className="mt-2 space-y-1 list-disc pl-4">
                    {oosProductsToday.map((item, i) => (
                      <li key={i}>{item.sku} — {item.platform} ({item.city})</li>
                    ))}
                  </ul>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "oos-bulk-off", params: { skus: oosProductsToday.map(o => o.sku).join(",") } })}
                >
                  Confirm Bulk Pause
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </PanelCard>

      {/* Own SKU Availability — Platform Matrix */}
      <PanelCard title="Own SKU Availability — Platform Matrix" badge="Own Brand Only" badgeColor="accent" delay={0.25}>
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
                <th className="text-center py-2 font-normal">Avg</th>
              </tr>
            </thead>
            <tbody>
              {allSkus.map((sku, i) => {
                const vals = platformAvailability.map(p => {
                  const d = p.skus.find(s => s.sku === sku);
                  return d?.avail ?? null;
                });
                const validVals = vals.filter(v => v !== null) as number[];
                const avg = validVals.length > 0 ? Math.round(validVals.reduce((a, b) => a + b, 0) / validVals.length) : 0;
                return (
                  <tr key={sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground">{sku}</td>
                    {vals.map((avail, j) => (
                      <td key={j} className="py-2.5 text-center">
                        {avail !== null ? (
                          <span className={`font-mono text-[10px] ${avail >= 80 ? "text-sw-green" : avail >= 50 ? "text-sw-amber" : "text-sw-red"}`}>
                            {avail}%
                          </span>
                        ) : (
                          <span className="text-[9px] text-muted-foreground">—</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 text-center">
                      <span className={`font-mono text-[10px] font-bold ${avg >= 80 ? "text-sw-green" : avg >= 50 ? "text-sw-amber" : "text-sw-red"}`}>
                        {avg}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PanelCard>

      {/* Darkstore Listing Gaps */}
      <PanelCard title="Darkstore Listing Gaps" badge="Q-Commerce Coverage" badgeColor="amber" delay={0.28}>
        <div className="flex items-center gap-2 mb-4">
          <Select value={String(selectedCity)} onValueChange={(v) => setSelectedCity(Number(v))}>
            <SelectTrigger className="w-[220px] h-8 text-[11px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {darkstoreGaps.map((c, i) => (
                <SelectItem key={c.city} value={String(i)} className="text-[11px]">
                  {c.city} · {c.totalDarkstores} stores
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
                  actionStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"
                }`}>
                {actionStates[i] ? "✓ Actioned" : "Pre-order →"}
              </button>
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Competition Availability */}
      <PanelCard title="Competition Availability Comparison" badge="Competitive Intel" badgeColor="purple" delay={0.5}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-subtle">
                <th className="text-left py-2 font-normal">Competitor</th>
                <th className="text-left py-2 font-normal">Platform</th>
                <th className="text-center py-2 font-normal">Their Avail</th>
                <th className="text-center py-2 font-normal">Your Avail</th>
                <th className="text-center py-2 font-normal">Gap</th>
                <th className="text-left py-2 font-normal">Top Product</th>
                <th className="text-center py-2 font-normal">Trend</th>
                <th className="text-right py-2 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {competitionAvailability.map((row, i) => (
                <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground font-medium">{row.competitor}</td>
                  <td className="py-2.5 text-muted-foreground">{row.platform}</td>
                  <td className="py-2.5 text-center font-mono text-sw-green">{row.avail}%</td>
                  <td className="py-2.5 text-center font-mono text-foreground">{row.yourAvail}%</td>
                  <td className="py-2.5 text-center">
                    <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                      row.gap.startsWith("+") ? "bg-sw-red-dim text-sw-red" : "bg-sw-green-dim text-sw-green"
                    }`}>{row.gap}</span>
                  </td>
                  <td className="py-2.5 text-muted-foreground">{row.topProduct}</td>
                  <td className="py-2.5 text-center">
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                      row.trend === "improving" ? "bg-sw-green-dim text-sw-green" : row.trend === "declining" ? "bg-sw-red-dim text-sw-red" : "bg-surface-3 text-muted-foreground"
                    }`}>{row.trend}</span>
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => setCompCampaignStates(p => ({ ...p, [i]: true }))}
                      className={`text-[10px] font-medium px-2 py-1 rounded-lg ${
                        compCampaignStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/15 text-primary hover:bg-primary/25"
                      }`}>
                      {compCampaignStates[i] ? "✓ Tracked" : "Track Gap →"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
      </>) : (
        /* Analytics Tab */
        <div className="space-y-5">
          <PanelCard title="Availability Score Over Time" badge="30-day trend" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={availScoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} domain={[40, 100]} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13, color: "hsl(220,20%,15%)" }} />
                <ReferenceLine y={50} stroke="hsl(0,76%,57%)" strokeDasharray="4 4" label={{ value: "Critical", fill: "hsl(0,76%,57%)", fontSize: 9 }} />
                <Area type="monotone" dataKey="score" stroke="hsl(228,90%,64%)" fill="hsl(228,90%,64%)" fillOpacity={0.15} strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Availability by SKU Over Time" badge="Heatmap" badgeColor="accent" delay={0.1}>
            <div className="overflow-visible relative z-10">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground">
                    <th className="text-left py-2 font-normal w-40">SKU</th>
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                      <th key={d} className="text-center py-2 font-normal">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmapData.map((row) => (
                    <tr key={row.sku}>
                      <td className="py-1.5 text-foreground text-[10px]">{row.sku}</td>
                      {row.values.map((cell) => (
                        <td key={cell.day} className="py-1.5 text-center">
                          <button
                            onClick={() => setSelectedCell({ sku: row.sku, day: cell.day, value: cell.value })}
                            className="w-8 h-8 rounded-lg font-mono text-[9px] text-foreground transition-all hover:ring-2 hover:ring-primary/40"
                            style={{
                              backgroundColor: cell.value >= 80
                                ? "hsla(160,70%,48%,0.25)"
                                : cell.value >= 50
                                ? "hsla(38,92%,50%,0.25)"
                                : "hsla(0,76%,57%,0.25)"
                            }}
                          >
                            {cell.value}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {selectedCell && (
              <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/20 relative z-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-foreground">{selectedCell.sku} — {selectedCell.day}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">Availability: <span className="font-mono font-bold">{selectedCell.value}%</span></p>
                  </div>
                  <button onClick={() => setSelectedCell(null)} className="text-[10px] text-muted-foreground hover:text-foreground">✕ Close</button>
                </div>
              </div>
            )}
          </PanelCard>

          <PanelCard title="Platform-wise Availability Trend" badge="Line Chart" badgeColor="accent" delay={0.2}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={availScoreTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} domain={[0, 100]} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13, color: "hsl(220,20%,15%)" }} />
                <Line type="monotone" dataKey="score" stroke="#FF9900" strokeWidth={2} dot={false} name="Amazon" />
                <Line type="monotone" dataKey="score" stroke="#2F77FF" strokeWidth={2} dot={false} name="Flipkart" />
                <Line type="monotone" dataKey="score" stroke="#FDDC2B" strokeWidth={2} dot={false} name="Blinkit" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default AvailabilityView;
