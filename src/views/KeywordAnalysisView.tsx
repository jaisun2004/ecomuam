import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line } from "recharts";
import { Search, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";

const platformOptions = ["Amazon", "Flipkart", "Blinkit", "Zepto", "Instamart"];
const platformColors: Record<string, string> = { Amazon: "#FF9900", Flipkart: "#2F77FF", Blinkit: "#FDDC2B", Zepto: "#833AB4", Instamart: "#FC8019" };

interface KeywordRank {
  keyword: string;
  yourRank: number;
  yourPage: number;
  topCompetitor: string;
  compRank: number;
  searchVol: string;
  shareOfSearch: number;
  trend: "up" | "down" | "flat";
  action: string;
}

const keywordDataByPlatform: Record<string, KeywordRank[]> = {
  Amazon: [
    { keyword: "butter biscuits", yourRank: 3, yourPage: 1, topCompetitor: "Parle", compRank: 1, searchVol: "84K", shareOfSearch: 22, trend: "up", action: "Maintain" },
    { keyword: "cream biscuits", yourRank: 8, yourPage: 1, topCompetitor: "Sunfeast", compRank: 2, searchVol: "62K", shareOfSearch: 11, trend: "down", action: "Boost campaign" },
    { keyword: "glucose biscuits", yourRank: 14, yourPage: 2, topCompetitor: "Parle-G", compRank: 1, searchVol: "120K", shareOfSearch: 5, trend: "down", action: "New campaign needed" },
    { keyword: "digestive biscuits", yourRank: 2, yourPage: 1, topCompetitor: "McVities", compRank: 1, searchVol: "45K", shareOfSearch: 28, trend: "up", action: "Maintain" },
    { keyword: "choco chip cookies", yourRank: 5, yourPage: 1, topCompetitor: "Sunfeast Dark Fantasy", compRank: 1, searchVol: "38K", shareOfSearch: 15, trend: "flat", action: "Optimise bids" },
    { keyword: "biscuit combo pack", yourRank: 11, yourPage: 2, topCompetitor: "Britannia (Own)", compRank: 4, searchVol: "28K", shareOfSearch: 8, trend: "down", action: "Boost campaign" },
    { keyword: "sugar free biscuits", yourRank: 18, yourPage: 2, topCompetitor: "Unibic", compRank: 2, searchVol: "22K", shareOfSearch: 3, trend: "down", action: "New campaign needed" },
    { keyword: "kids biscuits", yourRank: 6, yourPage: 1, topCompetitor: "Parle", compRank: 1, searchVol: "31K", shareOfSearch: 14, trend: "up", action: "Maintain" },
  ],
  Flipkart: [
    { keyword: "butter biscuits", yourRank: 5, yourPage: 1, topCompetitor: "Sunfeast", compRank: 1, searchVol: "52K", shareOfSearch: 16, trend: "down", action: "Boost campaign" },
    { keyword: "cream biscuits", yourRank: 4, yourPage: 1, topCompetitor: "Parle", compRank: 2, searchVol: "41K", shareOfSearch: 18, trend: "up", action: "Maintain" },
    { keyword: "glucose biscuits", yourRank: 9, yourPage: 1, topCompetitor: "Parle-G", compRank: 1, searchVol: "88K", shareOfSearch: 9, trend: "flat", action: "Optimise bids" },
    { keyword: "digestive biscuits", yourRank: 3, yourPage: 1, topCompetitor: "McVities", compRank: 1, searchVol: "32K", shareOfSearch: 25, trend: "up", action: "Maintain" },
  ],
  Blinkit: [
    { keyword: "butter biscuits", yourRank: 2, yourPage: 1, topCompetitor: "Parle", compRank: 1, searchVol: "18K", shareOfSearch: 35, trend: "up", action: "Maintain" },
    { keyword: "cream biscuits", yourRank: 6, yourPage: 1, topCompetitor: "Sunfeast", compRank: 1, searchVol: "12K", shareOfSearch: 12, trend: "down", action: "Boost campaign" },
    { keyword: "digestive biscuits", yourRank: 1, yourPage: 1, topCompetitor: "McVities", compRank: 2, searchVol: "8K", shareOfSearch: 42, trend: "up", action: "Maintain" },
  ],
  Zepto: [
    { keyword: "butter biscuits", yourRank: 4, yourPage: 1, topCompetitor: "Parle", compRank: 1, searchVol: "14K", shareOfSearch: 20, trend: "flat", action: "Optimise bids" },
    { keyword: "glucose biscuits", yourRank: 12, yourPage: 2, topCompetitor: "Parle-G", compRank: 1, searchVol: "22K", shareOfSearch: 6, trend: "down", action: "New campaign needed" },
  ],
  Instamart: [
    { keyword: "butter biscuits", yourRank: 3, yourPage: 1, topCompetitor: "Sunfeast", compRank: 1, searchVol: "11K", shareOfSearch: 24, trend: "up", action: "Maintain" },
    { keyword: "cream biscuits", yourRank: 7, yourPage: 1, topCompetitor: "Parle", compRank: 2, searchVol: "9K", shareOfSearch: 10, trend: "down", action: "Boost campaign" },
  ],
};

const rankTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  butterBiscuits: Math.round(4 - Math.sin(i / 5) * 2 + Math.random()),
  creamBiscuits: Math.round(7 + Math.cos(i / 4) * 3 + Math.random()),
  glucoseBiscuits: Math.round(12 + Math.sin(i / 6) * 4 + Math.random()),
}));

const KeywordAnalysisView: React.FC = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("Amazon");
  const [tab, setTab] = useState("overview");
  const g = useGuardrails();

  const keywords = keywordDataByPlatform[selectedPlatform] || [];
  const page1Count = keywords.filter(k => k.yourPage === 1).length;
  const poorKeywords = keywords.filter(k => k.yourPage > 1);
  const avgSoS = keywords.length > 0 ? Math.round(keywords.reduce((a, k) => a + k.shareOfSearch, 0) / keywords.length) : 0;

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (
        <>
          {/* KPIs */}
          <div className="grid grid-cols-4 gap-4">
            <KPICard title="Tracked Keywords" value={String(keywords.length)} delta="Across selected platform" deltaType="neutral" sub={selectedPlatform} accentColor="bg-sw-cyan" delay={0} />
            <KPICard title="Page 1 Rankings" value={`${page1Count}/${keywords.length}`} delta={page1Count === keywords.length ? "All on page 1" : `${keywords.length - page1Count} need improvement`} deltaType={page1Count === keywords.length ? "positive" : "negative"} sub="First page visibility" accentColor="bg-sw-green" delay={0.05} />
            <KPICard title="Avg Share of Search" value={`${avgSoS}%`} delta="▲ 2% vs last week" deltaType="positive" sub="Across tracked keywords" accentColor="bg-sw-purple" delay={0.1} />
            <KPICard title="Campaign Actions Needed" value={String(poorKeywords.length)} delta={poorKeywords.length > 0 ? "Keywords not on page 1" : "All healthy"} deltaType={poorKeywords.length > 0 ? "negative" : "positive"} sub="Optimise for visibility" accentColor="bg-sw-amber" delay={0.15} />
          </div>

          {/* Platform filter */}
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
                  <th className="text-center py-2 font-normal">Your Rank</th>
                  <th className="text-center py-2 font-normal">Page</th>
                  <th className="text-left py-2 font-normal">Top Competitor</th>
                  <th className="text-center py-2 font-normal">Comp Rank</th>
                  <th className="text-right py-2 font-normal">Search Vol</th>
                  <th className="text-right py-2 font-normal">SoS %</th>
                  <th className="text-center py-2 font-normal">Trend</th>
                  <th className="text-right py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {keywords.map((k, i) => (
                  <tr key={k.keyword} className={`${i % 2 === 0 ? "bg-surface-2/50" : ""} ${k.yourPage > 1 ? "border-l-2 border-l-sw-red" : ""}`}>
                    <td className="py-2.5 font-mono text-[11px] text-foreground">{k.keyword}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono font-bold ${k.yourRank <= 5 ? "text-sw-green" : k.yourRank <= 10 ? "text-sw-amber" : "text-sw-red"}`}>
                        #{k.yourRank}
                      </span>
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${k.yourPage === 1 ? "bg-sw-green-dim text-sw-green" : "bg-sw-red/15 text-sw-red"}`}>
                        P{k.yourPage}
                      </span>
                    </td>
                    <td className="py-2.5 text-[11px] text-foreground">{k.topCompetitor}</td>
                    <td className="py-2.5 text-center font-mono text-foreground">#{k.compRank}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{k.searchVol}</td>
                    <td className="py-2.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <div className="w-12 h-1.5 bg-surface-3 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${k.shareOfSearch}%`, backgroundColor: k.shareOfSearch >= 20 ? "#2ECF8E" : k.shareOfSearch >= 10 ? "#F5A623" : "#FF5C5C" }} />
                        </div>
                        <span className="font-mono text-[10px] text-foreground">{k.shareOfSearch}%</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-center">
                      {k.trend === "up" && <TrendingUp size={12} className="text-sw-green mx-auto" />}
                      {k.trend === "down" && <span className="text-sw-red text-[10px]">▼</span>}
                      {k.trend === "flat" && <span className="text-muted-foreground text-[10px]">→</span>}
                    </td>
                    <td className="py-2.5 text-right">
                      {k.action === "Maintain" ? (
                        <span className="text-[10px] font-mono text-sw-green">{k.action}</span>
                      ) : (
                        <button
                          onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "keyword-boost", params: { keyword: k.keyword, platform: selectedPlatform } })}
                          className={`text-[10px] font-medium px-2 py-1 rounded-lg ${
                            k.action === "New campaign needed" ? "bg-sw-red/15 text-sw-red" : "bg-sw-amber/15 text-sw-amber"
                          }`}>
                          {k.action} →
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>

          {/* Poor keywords intervention panel */}
          {poorKeywords.length > 0 && (
            <PanelCard title="⚠ Keywords Not on Page 1 — Action Required" badge={`${poorKeywords.length} keywords`} badgeColor="red" delay={0.3}>
              <div className="space-y-2">
                {poorKeywords.map(k => (
                  <div key={k.keyword} className="flex items-center gap-3 p-3 rounded-xl bg-sw-red/5 border border-sw-red/20">
                    <AlertTriangle size={14} className="text-sw-red flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-[11px] font-medium text-foreground">"{k.keyword}" — Rank #{k.yourRank} (Page {k.yourPage})</p>
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
          {/* Rank trend over time */}
          <PanelCard title="Keyword Rank Trend — 30 Days" badge={selectedPlatform} badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={rankTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis reversed tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} label={{ value: "Rank (lower = better)", angle: -90, position: "insideLeft", fontSize: 9, fill: "#555A6E" }} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="butterBiscuits" stroke="#2ECF8E" strokeWidth={2} dot={false} name="butter biscuits" />
                <Line type="monotone" dataKey="creamBiscuits" stroke="#F5A623" strokeWidth={2} dot={false} name="cream biscuits" />
                <Line type="monotone" dataKey="glucoseBiscuits" stroke="#FF5C5C" strokeWidth={2} dot={false} name="glucose biscuits" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-green" /> butter biscuits</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-amber" /> cream biscuits</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-red" /> glucose biscuits</span>
            </div>
          </PanelCard>

          {/* Share of Search comparison */}
          <PanelCard title="Share of Search by Keyword" badge="Bar chart" badgeColor="green" delay={0.1}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={keywords.map(k => ({ keyword: k.keyword.length > 15 ? k.keyword.slice(0, 15) + "…" : k.keyword, sos: k.shareOfSearch }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal vertical={false} />
                <XAxis dataKey="keyword" tick={{ fontSize: 9, fill: "#888" }} axisLine={false} tickLine={false} angle={-20} textAnchor="end" height={50} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="sos" fill="hsl(228,90%,64%)" radius={[4, 4, 0, 0]} name="Share of Search %" />
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default KeywordAnalysisView;
