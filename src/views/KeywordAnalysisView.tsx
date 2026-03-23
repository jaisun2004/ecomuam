import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, ComposedChart, Area } from "recharts";
import { Search, AlertTriangle, TrendingUp, ArrowRight, DollarSign, Target, Shield } from "lucide-react";

const platformOptions = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"];
const platformColors: Record<string, string> = { Amazon: "#FF9900", Flipkart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4", Instamart: "#FC8019" };

interface KeywordRank {
  keyword: string;
  sponsoredRank: number;
  organicRank: number;
  topCompetitor: string;
  compRank: number;
  searchVol: string;
  searchVolNum: number;
  shareOfSearch: number;
  trend: "up" | "down" | "flat";
  action: string;
  canReduceSpend: boolean;
}

const keywordDataByPlatform: Record<string, KeywordRank[]> = {
  Amazon: [
    { keyword: "butter biscuits", sponsoredRank: 1, organicRank: 2, topCompetitor: "Parle", compRank: 3, searchVol: "84K", searchVolNum: 84, shareOfSearch: 22, trend: "up", action: "Reduce spend", canReduceSpend: true },
    { keyword: "cream biscuits", sponsoredRank: 3, organicRank: 8, topCompetitor: "Sunfeast", compRank: 2, searchVol: "62K", searchVolNum: 62, shareOfSearch: 11, trend: "down", action: "Boost campaign", canReduceSpend: false },
    { keyword: "glucose biscuits", sponsoredRank: 6, organicRank: 14, topCompetitor: "Parle-G", compRank: 1, searchVol: "120K", searchVolNum: 120, shareOfSearch: 5, trend: "down", action: "New campaign needed", canReduceSpend: false },
    { keyword: "digestive biscuits", sponsoredRank: 1, organicRank: 1, topCompetitor: "McVities", compRank: 2, searchVol: "45K", searchVolNum: 45, shareOfSearch: 28, trend: "up", action: "Reduce spend", canReduceSpend: true },
    { keyword: "choco chip cookies", sponsoredRank: 2, organicRank: 5, topCompetitor: "Sunfeast Dark Fantasy", compRank: 1, searchVol: "38K", searchVolNum: 38, shareOfSearch: 15, trend: "flat", action: "Optimise bids", canReduceSpend: false },
    { keyword: "biscuit combo pack", sponsoredRank: 4, organicRank: 11, topCompetitor: "Britannia (Own)", compRank: 4, searchVol: "28K", searchVolNum: 28, shareOfSearch: 8, trend: "down", action: "Boost campaign", canReduceSpend: false },
    { keyword: "sugar free biscuits", sponsoredRank: 8, organicRank: 18, topCompetitor: "Unibic", compRank: 2, searchVol: "22K", searchVolNum: 22, shareOfSearch: 3, trend: "down", action: "New campaign needed", canReduceSpend: false },
    { keyword: "kids biscuits", sponsoredRank: 2, organicRank: 3, topCompetitor: "Parle", compRank: 1, searchVol: "31K", searchVolNum: 31, shareOfSearch: 14, trend: "up", action: "Reduce spend", canReduceSpend: true },
  ],
  Flipkart: [
    { keyword: "butter biscuits", sponsoredRank: 2, organicRank: 5, topCompetitor: "Sunfeast", compRank: 1, searchVol: "52K", searchVolNum: 52, shareOfSearch: 16, trend: "down", action: "Boost campaign", canReduceSpend: false },
    { keyword: "cream biscuits", sponsoredRank: 1, organicRank: 2, topCompetitor: "Parle", compRank: 3, searchVol: "41K", searchVolNum: 41, shareOfSearch: 18, trend: "up", action: "Reduce spend", canReduceSpend: true },
    { keyword: "glucose biscuits", sponsoredRank: 4, organicRank: 9, topCompetitor: "Parle-G", compRank: 1, searchVol: "88K", searchVolNum: 88, shareOfSearch: 9, trend: "flat", action: "Optimise bids", canReduceSpend: false },
    { keyword: "digestive biscuits", sponsoredRank: 1, organicRank: 2, topCompetitor: "McVities", compRank: 1, searchVol: "32K", searchVolNum: 32, shareOfSearch: 25, trend: "up", action: "Reduce spend", canReduceSpend: true },
  ],
  Blinkit: [
    { keyword: "butter biscuits", sponsoredRank: 1, organicRank: 1, topCompetitor: "Parle", compRank: 2, searchVol: "18K", searchVolNum: 18, shareOfSearch: 35, trend: "up", action: "Reduce spend", canReduceSpend: true },
    { keyword: "cream biscuits", sponsoredRank: 3, organicRank: 6, topCompetitor: "Sunfeast", compRank: 1, searchVol: "12K", searchVolNum: 12, shareOfSearch: 12, trend: "down", action: "Boost campaign", canReduceSpend: false },
    { keyword: "digestive biscuits", sponsoredRank: 1, organicRank: 1, topCompetitor: "McVities", compRank: 2, searchVol: "8K", searchVolNum: 8, shareOfSearch: 42, trend: "up", action: "Reduce spend", canReduceSpend: true },
  ],
  Zepto: [
    { keyword: "butter biscuits", sponsoredRank: 2, organicRank: 4, topCompetitor: "Parle", compRank: 1, searchVol: "14K", searchVolNum: 14, shareOfSearch: 20, trend: "flat", action: "Optimise bids", canReduceSpend: false },
    { keyword: "glucose biscuits", sponsoredRank: 5, organicRank: 12, topCompetitor: "Parle-G", compRank: 1, searchVol: "22K", searchVolNum: 22, shareOfSearch: 6, trend: "down", action: "New campaign needed", canReduceSpend: false },
  ],
  Instamart: [
    { keyword: "butter biscuits", sponsoredRank: 1, organicRank: 2, topCompetitor: "Sunfeast", compRank: 1, searchVol: "11K", searchVolNum: 11, shareOfSearch: 24, trend: "up", action: "Reduce spend", canReduceSpend: true },
    { keyword: "cream biscuits", sponsoredRank: 3, organicRank: 7, topCompetitor: "Parle", compRank: 2, searchVol: "9K", searchVolNum: 9, shareOfSearch: 10, trend: "down", action: "Boost campaign", canReduceSpend: false },
  ],
};

const rankTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  butterBiscuits: Math.round(4 - Math.sin(i / 5) * 2 + Math.random()),
  creamBiscuits: Math.round(7 + Math.cos(i / 4) * 3 + Math.random()),
  glucoseBiscuits: Math.round(12 + Math.sin(i / 6) * 4 + Math.random()),
}));

const campaignKeywordPerf = [
  { keyword: "butter biscuits", campaign: "Butter Biscuits — SP", platform: "Amazon", spend: "₹42K", clicks: 3200, ctr: "2.8%", roas: "5.2x", rank: 2, action: "Reduce spend — organic rank strong" },
  { keyword: "cream biscuits", campaign: "Cream Range — SP", platform: "Amazon", spend: "₹38K", clicks: 2100, ctr: "1.9%", roas: "3.1x", rank: 8, action: "Increase bid — off page 1 organically" },
  { keyword: "glucose biscuits", campaign: "Glucose Category — SP", platform: "Amazon", spend: "₹28K", clicks: 1400, ctr: "1.2%", roas: "1.8x", rank: 14, action: "Restructure — poor ROAS, needs content fix first" },
  { keyword: "digestive biscuits", campaign: "NutriChoice — Brand SP", platform: "Amazon", spend: "₹55K", clicks: 4100, ctr: "3.4%", roas: "6.1x", rank: 1, action: "Reduce spend — #1 organically" },
  { keyword: "choco chip cookies", campaign: "Bourbon Choco — SP", platform: "Flipkart", spend: "₹31K", clicks: 2800, ctr: "2.2%", roas: "4.0x", rank: 5, action: "Hold — organic rank moderate" },
  { keyword: "sugar free biscuits", campaign: "NutriChoice SF — SP", platform: "Amazon", spend: "₹18K", clicks: 800, ctr: "0.9%", roas: "1.4x", rank: 18, action: "Pause — content score too low, fix listing first" },
];

const keywordCampaignImpact = [
  { keyword: "butter biscuits", activeCampaigns: 3, totalSpend: "₹1.2L", avgRoas: "5.0x", organicRank: 2, recommendation: "Cut 1 campaign — organic rank < 3, redundant sponsored spend" },
  { keyword: "cream biscuits", activeCampaigns: 2, totalSpend: "₹68K", avgRoas: "3.1x", organicRank: 8, recommendation: "Increase bid on best-performing campaign, pause the other" },
  { keyword: "glucose biscuits", activeCampaigns: 1, totalSpend: "₹28K", avgRoas: "1.8x", organicRank: 14, recommendation: "Fix content score (42/100) before spending more on ads" },
  { keyword: "digestive biscuits", activeCampaigns: 2, totalSpend: "₹85K", avgRoas: "6.1x", organicRank: 1, recommendation: "Reduce to 1 campaign — #1 organically, save ₹40K/mo" },
  { keyword: "kids biscuits", activeCampaigns: 1, totalSpend: "₹22K", avgRoas: "4.2x", organicRank: 3, recommendation: "Reduce spend gradually — organic rank strong at #3" },
];

// Keywords losing rank/share
const losingKeywords = [
  { keyword: "cream biscuits", yourProduct: "Good Day Butter 200g", lastWeekRank: 5, thisWeekRank: 8, sosLoss: "-4%", compProduct: "Sunfeast Cream Biscuit 200g", compRankChange: "3→2", reason: "Sunfeast increased bids by 40%" },
  { keyword: "glucose biscuits", yourProduct: "Marie Gold 250g", lastWeekRank: 10, thisWeekRank: 14, sosLoss: "-3%", compProduct: "Parle-G Gold 200g", compRankChange: "2→1", reason: "Parle launched new campaign + listing update" },
  { keyword: "sugar free biscuits", yourProduct: "NutriChoice Digestive 100g", lastWeekRank: 14, thisWeekRank: 18, sosLoss: "-2%", compProduct: "Unibic Sugar Free 150g", compRankChange: "3→2", reason: "Unibic improved content score to 84/100" },
  { keyword: "biscuit combo pack", yourProduct: "Good Day Choco Chip", lastWeekRank: 8, thisWeekRank: 11, sosLoss: "-3%", compProduct: "Sunfeast Variety Pack", compRankChange: "4→3", reason: "Sunfeast price cut by 15%" },
];

const KeywordAnalysisView: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("Amazon");
  const [tab, setTab] = useState("overview");
  const [defendStates, setDefendStates] = useState<Record<number, boolean>>({});
  const g = useGuardrails();

  const keywords = keywordDataByPlatform[selectedPlatform] || [];
  const page1Count = keywords.filter(k => k.organicRank <= 10).length;
  const poorKeywords = keywords.filter(k => k.organicRank > 10);
  const canReduceCount = keywords.filter(k => k.canReduceSpend).length;
  const avgSoS = keywords.length > 0 ? Math.round(keywords.reduce((a, k) => a + k.shareOfSearch, 0) / keywords.length) : 0;

  const combinedData = keywords.map(k => ({
    keyword: k.keyword.length > 12 ? k.keyword.slice(0, 12) + "…" : k.keyword,
    searchVol: k.searchVolNum,
    sos: k.shareOfSearch,
  }));

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (
        <>
          <div className="grid grid-cols-4 gap-4">
            <KPICard title="Tracked Keywords" value={String(keywords.length)} delta="Across selected platform" deltaType="neutral" sub={selectedPlatform} accentColor="bg-sw-cyan" delay={0} />
            <KPICard title="Page 1 (Organic)" value={`${page1Count}/${keywords.length}`} delta={page1Count === keywords.length ? "All on page 1" : `${keywords.length - page1Count} need improvement`} deltaType={page1Count === keywords.length ? "positive" : "negative"} sub="Organic rank ≤ 10" accentColor="bg-sw-green" delay={0.05} />
            <KPICard title="Avg Share of Search" value={`${avgSoS}%`} delta="▲ 2% vs last week" deltaType="positive" sub="Across tracked keywords" accentColor="bg-sw-purple" delay={0.1} />
            <KPICard title="Spend Reducible" value={String(canReduceCount)} delta="Organic rank < 3" deltaType="positive" sub="Keywords where ad spend can be cut" accentColor="bg-sw-green" delay={0.15} />
          </div>

          <div className="flex items-center gap-2">
            {platformOptions.map(p => (
              <button key={p} onClick={() => setSelectedPlatform(p)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  selectedPlatform === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platformColors[p] }} />
                {p}
              </button>
            ))}
          </div>

          {/* Keyword ranking table */}
          <PanelCard title={`Keyword Rankings — ${selectedPlatform}`} badge={`${keywords.length} keywords`} badgeColor="accent" delay={0.2}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Keyword</th>
                  <th className="text-center py-2 font-normal">Sponsored Rank</th>
                  <th className="text-center py-2 font-normal">Organic Rank</th>
                  <th className="text-left py-2 font-normal">Top Competitor</th>
                  <th className="text-center py-2 font-normal">Comp Rank</th>
                  <th className="text-center py-2 font-normal">Trend</th>
                  <th className="text-right py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k, i) => (
                  <tr key={k.keyword} className={`${i % 2 === 0 ? "bg-surface-2/50" : ""} ${k.canReduceSpend ? "border-l-2 border-l-sw-green" : k.organicRank > 10 ? "border-l-2 border-l-sw-red" : ""}`}>
                    <td className="py-2.5 font-mono text-[11px] text-foreground">{k.keyword}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono font-bold ${k.sponsoredRank <= 3 ? "text-sw-green" : k.sponsoredRank <= 5 ? "text-sw-amber" : "text-sw-red"}`}>#{k.sponsoredRank}</span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono font-bold ${k.organicRank <= 3 ? "text-sw-green" : k.organicRank <= 10 ? "text-sw-amber" : "text-sw-red"}`}>#{k.organicRank}</span>
                      {k.canReduceSpend && <span className="ml-1 font-mono text-[8px] px-1 py-0.5 rounded bg-sw-green-dim text-sw-green">💰 save</span>}
                    </td>
                    <td className="py-2.5 text-[11px] text-foreground">{k.topCompetitor}</td>
                    <td className="py-2.5 text-center font-mono text-foreground">#{k.compRank}</td>
                    <td className="py-2.5 text-center">
                      {k.trend === "up" && <TrendingUp size={12} className="text-sw-green mx-auto" />}
                      {k.trend === "down" && <span className="text-sw-red text-[10px]">▼</span>}
                      {k.trend === "flat" && <span className="text-muted-foreground text-[10px]">→</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      {k.canReduceSpend ? (
                        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "keyword-reduce", params: { keyword: k.keyword, platform: selectedPlatform } })}
                          className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sw-green/15 text-sw-green">Reduce spend →</button>
                      ) : (
                        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "keyword-boost", params: { keyword: k.keyword, platform: selectedPlatform } })}
                          className={`text-[10px] font-medium px-2 py-1 rounded-lg ${k.action === "New campaign needed" ? "bg-sw-red/15 text-sw-red" : "bg-sw-amber/15 text-sw-amber"}`}>
                          {k.action} →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/20">
              <p className="text-[11px] text-foreground flex items-center gap-1.5">
                <DollarSign size={12} className="text-sw-green" />
                <strong>{canReduceCount} keywords</strong> have organic rank &lt; 3 — sponsored spend can be reduced without losing visibility.
              </p>
            </div>
          </PanelCard>

          {/* Keywords Losing Rank & Share — replaces search vol visual */}
          <PanelCard title="⚠ Keywords Losing Rank & Share" badge={`${losingKeywords.length} keywords`} badgeColor="red" delay={0.25}>
            <p className="text-[10px] text-muted-foreground mb-3">Keywords where you're losing position and share. Competition products causing the drop are identified.</p>
            <div className="space-y-2.5">
              {losingKeywords.map((lk, i) => (
                <div key={lk.keyword} className="p-3 rounded-xl bg-sw-red/5 border border-sw-red/20">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[11px] text-foreground font-medium">"{lk.keyword}"</span>
                    <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full bg-sw-red-dim text-sw-red">{lk.sosLoss} SoS</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-[10px] mb-2">
                    <div>
                      <p className="text-muted-foreground">Your product: <span className="text-foreground">{lk.yourProduct}</span></p>
                      <p className="text-muted-foreground">Rank: <span className="font-mono text-sw-red">#{lk.lastWeekRank} → #{lk.thisWeekRank}</span></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Causing loss: <span className="text-foreground font-medium">{lk.compProduct}</span></p>
                      <p className="text-muted-foreground">Comp rank: <span className="font-mono text-sw-green">{lk.compRankChange}</span></p>
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground mb-2">Reason: {lk.reason}</p>
                  <button
                    onClick={() => setDefendStates(p => ({ ...p, [i]: true }))}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                      defendStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/10 text-primary hover:bg-primary/20"
                    }`}>
                    <Shield size={10} />
                    {defendStates[i] ? "✓ Defense Campaign Launched" : "Defend This Keyword"}
                  </button>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Poor keywords */}
          {poorKeywords.length > 0 && (
            <PanelCard title="⚠ Keywords Not on Page 1 — Action Required" badge={`${poorKeywords.length} keywords`} badgeColor="red" delay={0.3}>
              <div className="space-y-2">
                {poorKeywords.map(k => (
                  <div key={k.keyword} className="flex items-center gap-3 p-3 rounded-xl bg-sw-red/5 border border-sw-red/20">
                    <AlertTriangle size={14} className="text-sw-red flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-foreground">"{k.keyword}" — Sponsored #{k.sponsoredRank} · Organic #{k.organicRank}</p>
                      <p className="text-[9px] text-muted-foreground">{k.searchVol} monthly searches · {k.topCompetitor} at #{k.compRank} · Your SoS: {k.shareOfSearch}%</p>
                    </div>
                    <button
                      onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "keyword-boost", params: { keyword: k.keyword, platform: selectedPlatform } })}
                      className="text-[10px] font-medium px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                      Optimise Campaign <ArrowRight size={10} />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[9px] text-muted-foreground mt-3">Goal: Maximise ROAS and be visible on Page 1 for all tracked keywords.</p>
            </PanelCard>
          )}
        </>
      ) : (
        <div className="space-y-5">
          {/* Search Volume & SoS — moved to analytics */}
          <PanelCard title="Search Volume & Share of Search" badge={selectedPlatform} badgeColor="accent" delay={0}>
            <div className="flex items-center gap-2 mb-3">
              {platformOptions.map(p => (
                <button key={p} onClick={() => setSelectedPlatform(p)}
                  className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    selectedPlatform === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                  }`}>
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platformColors[p] }} />{p}
                </button>
              ))}
              <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "keyword-sos-action", params: { platform: selectedPlatform } })}
                className="ml-auto px-3 py-1 rounded-lg text-[10px] font-medium bg-primary/10 text-primary hover:bg-primary/20 flex items-center gap-1">
                <Target size={10} /> Action on Weak SoS
              </button>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={combinedData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
                <XAxis dataKey="keyword" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} angle={-15} textAnchor="end" height={45} />
                <YAxis yAxisId="left" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} label={{ value: "Search Vol (K)", angle: -90, position: "insideLeft", fontSize: 9, fill: "#555A6E" }} />
                <YAxis yAxisId="right" orientation="right" domain={[0, 50]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} label={{ value: "SoS %", angle: 90, position: "insideRight", fontSize: 9, fill: "#555A6E" }} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar yAxisId="left" dataKey="searchVol" fill="hsl(228,90%,64%)" opacity={0.4} radius={[4, 4, 0, 0]} name="Search Volume (K)" barSize={28} />
                <Line yAxisId="right" type="monotone" dataKey="sos" stroke="#2ECF8E" strokeWidth={2.5} dot={{ r: 4, fill: "#2ECF8E" }} name="Share of Search %" />
              </ComposedChart>
            </ResponsiveContainer>
          </PanelCard>

          {/* Rank trend */}
          <PanelCard title="Keyword Rank Trend — 30 Days" badge={selectedPlatform} badgeColor="accent" delay={0.1}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={rankTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis reversed tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="butterBiscuits" stroke="#2ECF8E" strokeWidth={2} dot={false} name="butter biscuits" />
                <Line type="monotone" dataKey="creamBiscuits" stroke="#F5A623" strokeWidth={2} dot={false} name="cream biscuits" />
                <Line type="monotone" dataKey="glucoseBiscuits" stroke="#FF5C5C" strokeWidth={2} dot={false} name="glucose biscuits" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>

          {/* Campaign-level keyword performance */}
          <PanelCard title="Keyword → Campaign Performance" badge="Actionable" badgeColor="green" delay={0.15}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Keyword</th>
                  <th className="text-left py-2 font-normal">Campaign</th>
                  <th className="text-right py-2 font-normal">Spend</th>
                  <th className="text-right py-2 font-normal">Clicks</th>
                  <th className="text-right py-2 font-normal">ROAS</th>
                  <th className="text-center py-2 font-normal">Organic</th>
                  <th className="text-left py-2 font-normal">Recommendation</th>
                </tr>
              </thead>
              <tbody>
                {campaignKeywordPerf.map((c, i) => (
                  <tr key={i} className={`${i % 2 === 0 ? "bg-surface-2/50" : ""} ${c.rank <= 3 ? "border-l-2 border-l-sw-green" : c.rank > 10 ? "border-l-2 border-l-sw-red" : ""}`}>
                    <td className="py-2.5 font-mono text-[10px] text-foreground">{c.keyword}</td>
                    <td className="py-2.5 text-[10px] text-foreground">{c.campaign}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{c.spend}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{c.clicks.toLocaleString()}</td>
                    <td className="py-2.5 text-right font-mono" style={{ color: parseFloat(c.roas) >= 4 ? "#2ECF8E" : parseFloat(c.roas) >= 2.5 ? "#F5A623" : "#FF5C5C" }}>{c.roas}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono font-bold ${c.rank <= 3 ? "text-sw-green" : c.rank <= 10 ? "text-sw-amber" : "text-sw-red"}`}>#{c.rank}</span>
                    </td>
                    <td className="py-2.5 text-[10px] text-muted-foreground max-w-[200px]">{c.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>

          {/* Keyword spend efficiency */}
          <PanelCard title="Keyword Spend Efficiency — Campaign Actions" badge="Optimise" badgeColor="purple" delay={0.2}>
            <div className="space-y-2.5">
              {keywordCampaignImpact.map((k, i) => (
                <div key={i} className={`p-3 rounded-xl border ${k.organicRank <= 3 ? "bg-sw-green-dim/20 border-sw-green/20" : k.organicRank <= 10 ? "bg-surface-2 border-subtle" : "bg-sw-red/5 border-sw-red/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-[11px] text-foreground font-medium">"{k.keyword}"</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-surface-3 text-muted-foreground">{k.activeCampaigns} campaigns</span>
                      <span className="font-mono text-[9px] text-foreground">{k.totalSpend}/mo</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mb-1.5">
                    <span>Avg ROAS: <span className="font-mono text-sw-green">{k.avgRoas}</span></span>
                    <span>Organic: <span className={`font-mono font-bold ${k.organicRank <= 3 ? "text-sw-green" : "text-sw-amber"}`}>#{k.organicRank}</span></span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-foreground flex items-center gap-1">
                      <Target size={10} className={k.organicRank <= 3 ? "text-sw-green" : "text-sw-amber"} />
                      {k.recommendation}
                    </p>
                    <button
                      onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: k.organicRank <= 3 ? "keyword-reduce" : "keyword-boost", params: { keyword: k.keyword } })}
                      className={`px-2 py-1 rounded-lg text-[10px] font-medium ${k.organicRank <= 3 ? "bg-sw-green/15 text-sw-green" : "bg-primary/15 text-primary"}`}>
                      {k.organicRank <= 3 ? "Reduce Spend →" : "Optimise →"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default KeywordAnalysisView;
