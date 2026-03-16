import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { ChevronDown, ChevronRight, Copy, Check } from "lucide-react";

const dimensions = ["Title", "Hero Image", "Search Listing", "Page Content", "Competitor Aggression"];

const skuData = [
  { sku: "Whey 1kg Chocolate", thumb: "🥤", title: 16, heroImage: 18, searchListing: 12, pageContent: 17, competitorAggression: 14, lastUpdated: "Mar 14", platform: "Amazon" },
  { sku: "Whey 500g Vanilla", thumb: "🥤", title: 14, heroImage: 15, searchListing: 8, pageContent: 13, competitorAggression: 16, lastUpdated: "Mar 12", platform: "Flipkart" },
  { sku: "Creatine 250g", thumb: "💊", title: 8, heroImage: 10, searchListing: 6, pageContent: 9, competitorAggression: 18, lastUpdated: "Mar 10", platform: "Amazon" },
  { sku: "Pre-Workout Citrus", thumb: "⚡", title: 17, heroImage: 12, searchListing: 14, pageContent: 16, competitorAggression: 10, lastUpdated: "Mar 15", platform: "Blinkit" },
  { sku: "BCAA Tropical", thumb: "🏋️", title: 19, heroImage: 17, searchListing: 16, pageContent: 18, competitorAggression: 12, lastUpdated: "Mar 13", platform: "Zepto" },
  { sku: "Multi-Vit 60ct", thumb: "💊", title: 11, heroImage: 9, searchListing: 10, pageContent: 11, competitorAggression: 15, lastUpdated: "Mar 11", platform: "Instamart" },
];

const getOverall = (s: typeof skuData[0]) => s.title + s.heroImage + s.searchListing + s.pageContent + s.competitorAggression;
const scoreColor = (score: number) => score >= 80 ? "#2ECF8E" : score >= 60 ? "#F5A623" : "#FF5C5C";
const scoreLabel = (score: number) => score >= 80 ? "Strong" : score >= 60 ? "Needs work" : "Critical";
const dimColor = (score: number) => score >= 16 ? "#2ECF8E" : score >= 12 ? "#F5A623" : "#FF5C5C";

const titleIssues: Record<string, { issues: string[]; suggested: string }> = {
  "Creatine 250g": { issues: ["Too short", "Missing keywords", "No size/variant"], suggested: "Creatine Monohydrate 250g Unflavoured | Micronized | 83 Servings | Lab Tested" },
  "Multi-Vit 60ct": { issues: ["Missing keywords", "No brand name"], suggested: "ShelfWise Multi-Vitamin 60 Tablets | 23 Essential Vitamins & Minerals | Daily Health" },
  "Whey 500g Vanilla": { issues: ["No size/variant"], suggested: "Whey Protein Isolate 500g Vanilla | 25g Protein/Serving | Zero Sugar | Lab Certified" },
};

const heroImageIssues: Record<string, string[]> = {
  "Creatine 250g": ["Low resolution", "No product focus", "No size callout visible"],
  "Multi-Vit 60ct": ["Busy background", "No size callout visible"],
  "Pre-Workout Citrus": ["No product focus"],
};

const searchKeywords: Record<string, { kw: string; rank: number }[]> = {
  "Creatine 250g": [{ kw: "creatine monohydrate", rank: 14 }, { kw: "creatine supplement", rank: 22 }, { kw: "creatine powder", rank: 8 }, { kw: "gym creatine", rank: 18 }, { kw: "creatine india", rank: 11 }],
  "Whey 500g Vanilla": [{ kw: "whey protein 500g", rank: 6 }, { kw: "protein powder vanilla", rank: 12 }, { kw: "whey isolate", rank: 15 }],
};

const competitorAggression = [
  { brand: "MuscleBlaze", changes: 18, level: "High", what: ["Titles", "Images"], keywords: ["whey protein", "creatine"], impact: "-2 rank" },
  { brand: "Optimum Nutrition", changes: 9, level: "Medium", what: ["Listings"], keywords: ["protein powder"], impact: "-1 rank" },
  { brand: "MyProtein", changes: 4, level: "Low", what: ["Titles"], keywords: ["bcaa supplement"], impact: "None" },
];

const scoreBuckets = [0, 0, 0, 1, 0, 1, 2, 1, 1, 0].map((count, i) => ({ bucket: `${i * 10}-${(i + 1) * 10}`, count }));

const ContentAuditView: React.FC = () => {
  const [tab, setTab] = useState("overview");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [sortKey, setSortKey] = useState<"score" | "title" | "heroImage" | "searchListing" | "pageContent" | "competitorAggression">("score");
  const [sortAsc, setSortAsc] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedFlags, setCopiedFlags] = useState<Record<string, boolean>>({});
  const g = useGuardrails();

  const filteredSkus = skuData
    .filter(s => platformFilter === "All" || s.platform === platformFilter)
    .filter(s => {
      const overall = getOverall(s);
      if (scoreFilter === "Critical") return overall < 60;
      if (scoreFilter === "Needs work") return overall >= 60 && overall < 80;
      if (scoreFilter === "Strong") return overall >= 80;
      return true;
    })
    .sort((a, b) => {
      const aVal = sortKey === "score" ? getOverall(a) : a[sortKey];
      const bVal = sortKey === "score" ? getOverall(b) : b[sortKey];
      return sortAsc ? aVal - bVal : bVal - aVal;
    });

  const avgScore = Math.round(skuData.reduce((s, d) => s + getOverall(d), 0) / skuData.length);
  const criticalCount = skuData.filter(s => getOverall(s) < 60).length;
  const competitorStronger = skuData.filter(s => s.competitorAggression >= 16).length;

  const radarData = dimensions.map((dim, i) => ({
    dimension: dim,
    you: Math.round(skuData.reduce((s, d) => s + [d.title, d.heroImage, d.searchListing, d.pageContent, d.competitorAggression][i], 0) / skuData.length),
    category: Math.round(12 + Math.random() * 4),
  }));

  const handleSort = (key: typeof sortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
  };

  const handleFlag = (sku: string) => {
    const brief = `Content improvement needed for ${sku}. Issues: ${(heroImageIssues[sku] || []).join(", ")}`;
    navigator.clipboard.writeText(brief);
    setCopiedFlags(p => ({ ...p, [sku]: true }));
    setTimeout(() => setCopiedFlags(p => ({ ...p, [sku]: false })), 2000);
  };

  const navigateToFix = (sku: typeof skuData[0]) => {
    const overall = getOverall(sku);
    const weakDims = dimensions.filter((_, i) => [sku.title, sku.heroImage, sku.searchListing, sku.pageContent, sku.competitorAggression][i] < 14);
    g.navigateWithContext("campaigns", "campaign-digest", {
      type: "content-audit",
      params: { sku: sku.sku, score: String(overall), issues: weakDims.join(",") }
    });
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Content Audit</h1>
        <p className="text-xs text-muted-foreground mt-1">Content quality scores across your SKU catalogue.</p>
      </div>

      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Avg Content Score" value={`${avgScore}/100`} delta={avgScore >= 80 ? "Strong" : avgScore >= 60 ? "Needs work" : "Critical"} deltaType={avgScore >= 70 ? "positive" : "negative"} sub="Across all SKUs" accentColor="bg-primary" delay={0} />
          <KPICard title="SKUs Below 60" value={String(criticalCount)} delta={criticalCount > 0 ? "Immediate action needed" : "All clear"} deltaType={criticalCount > 0 ? "negative" : "positive"} sub="Critical content quality" accentColor="bg-sw-red" delay={0.05} />
          <KPICard title="Competitor Content Stronger" value={String(competitorStronger)} delta="vs your listing" deltaType="negative" sub="Competitors optimising actively" accentColor="bg-sw-amber" delay={0.1} />
          <KPICard title="Last Full Audit" value="Mar 14" delta="" deltaType="positive" sub="Re-audit all →" accentColor="bg-sw-green" delay={0.15} />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            {["All", "Blinkit", "Zepto", "Instamart", "Amazon", "Flipkart"].map(p => (
              <button key={p} onClick={() => setPlatformFilter(p)} className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${platformFilter === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>{p}</button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            {["All", "Critical", "Needs work", "Strong"].map(f => (
              <button key={f} onClick={() => setScoreFilter(f)} className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${scoreFilter === f ? "bg-sw-amber/20 text-sw-amber" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>{f === "Critical" ? "Critical <60" : f === "Needs work" ? "Needs work 60-79" : f === "Strong" ? "Strong 80+" : f}</button>
            ))}
          </div>
        </div>

        {/* SKU table */}
        <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2.5 px-3 font-normal">SKU</th>
                  <th className="text-right py-2.5 px-2 font-normal cursor-pointer hover:text-foreground" onClick={() => handleSort("score")}>Score {sortKey === "score" ? (sortAsc ? "↑" : "↓") : ""}</th>
                  <th className="text-center py-2.5 px-2 font-normal cursor-pointer hover:text-foreground" onClick={() => handleSort("title")}>Title</th>
                  <th className="text-center py-2.5 px-2 font-normal cursor-pointer hover:text-foreground" onClick={() => handleSort("heroImage")}>Hero Img</th>
                  <th className="text-center py-2.5 px-2 font-normal cursor-pointer hover:text-foreground" onClick={() => handleSort("searchListing")}>Search</th>
                  <th className="text-center py-2.5 px-2 font-normal cursor-pointer hover:text-foreground" onClick={() => handleSort("pageContent")}>Page</th>
                  <th className="text-center py-2.5 px-2 font-normal cursor-pointer hover:text-foreground" onClick={() => handleSort("competitorAggression")}>Comp.</th>
                  <th className="text-right py-2.5 px-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredSkus.map((s, i) => {
                  const overall = getOverall(s);
                  const sc = scoreColor(overall);
                  return (
                    <tr key={s.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                      <td className="py-2.5 px-3 text-foreground flex items-center gap-2">
                        <span className="text-lg">{s.thumb}</span>
                        <span className="truncate max-w-[140px]">{s.sku}</span>
                      </td>
                      <td className="py-2.5 px-2 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-12 h-2 bg-surface-3 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${overall}%`, backgroundColor: sc }} />
                          </div>
                          <span className="font-mono text-[11px] w-8" style={{ color: sc }}>{overall}</span>
                        </div>
                      </td>
                      {[s.title, s.heroImage, s.searchListing, s.pageContent, s.competitorAggression].map((val, di) => (
                        <td key={di} className="py-2.5 px-2 text-center">
                          <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dimColor(val) + "20", color: dimColor(val) }}>{val}/20</span>
                        </td>
                      ))}
                      <td className="py-2.5 px-3 text-right">
                        <button onClick={() => navigateToFix(s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${overall < 60 ? "bg-sw-red/20 text-sw-red" : overall < 80 ? "bg-sw-amber/20 text-sw-amber" : "border border-subtle text-muted-foreground"}`}>
                          {overall < 60 ? "Fix now →" : overall < 80 ? "Improve →" : "View →"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </>) : (
        <div className="space-y-5">
          {/* Score distribution */}
          <PanelCard title="Score Distribution" badge="All SKUs" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "#555A6E" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="SKUs">
                  {scoreBuckets.map((entry, index) => {
                    const mid = index * 10 + 5;
                    return <rect key={index} fill={mid < 60 ? "#FF5C5C" : mid < 80 ? "#F5A623" : "#2ECF8E"} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>

          {/* Dimension breakdown radar */}
          <PanelCard title="Dimension Breakdown" badge="Avg across catalogue" badgeColor="purple" delay={0.1}>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="dimension" tick={{ fontSize: 10, fill: "hsl(228,25%,93%)" }} />
                <PolarRadiusAxis domain={[0, 20]} tick={{ fontSize: 8, fill: "#555A6E" }} />
                <Radar name="You" dataKey="you" stroke="#A78BFA" fill="#A78BFA" fillOpacity={0.3} strokeWidth={2} />
                <Radar name="Category Avg" dataKey="category" stroke="#555A6E" fill="transparent" strokeDasharray="5 5" strokeWidth={1} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
              </RadarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-surface-3" /> Category Avg</span>
            </div>
          </PanelCard>

          {/* Title quality */}
          <PanelCard title="Title Quality Detail" badge="Per SKU" badgeColor="amber" delay={0.2}>
            <div className="space-y-2">
              {Object.entries(titleIssues).map(([sku, data]) => {
                const open = expandedSections[`title-${sku}`];
                return (
                  <div key={sku} className="border border-subtle rounded-xl overflow-hidden">
                    <button onClick={() => setExpandedSections(p => ({ ...p, [`title-${sku}`]: !p[`title-${sku}`] }))} className="w-full flex items-center gap-3 p-3 hover:bg-surface-2 transition-colors">
                      {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                      <span className="text-xs text-foreground font-medium">{sku}</span>
                      <span className="font-mono text-[10px] text-sw-red">{skuData.find(s => s.sku === sku)?.title || 0}/20</span>
                      <div className="ml-auto flex items-center gap-1">
                        {data.issues.map(issue => (
                          <span key={issue} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-sw-red/10 text-sw-red">{issue}</span>
                        ))}
                      </div>
                    </button>
                    {open && (
                      <div className="p-3 border-t border-subtle bg-surface-2/30">
                        <p className="text-[10px] text-muted-foreground mb-1">Suggested title:</p>
                        <p className="text-xs text-foreground font-mono bg-surface-3 rounded-lg p-2">{data.suggested}</p>
                        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "content-audit", params: { sku, score: "0", issues: "Title" } })} className="text-[10px] font-medium mt-2 inline-block" style={{ color: "#4F7FFF" }}>
                          Apply in Campaign Manager →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </PanelCard>

          {/* Hero image quality */}
          <PanelCard title="Hero Image Quality Detail" badge="Per SKU" badgeColor="red" delay={0.3}>
            <div className="space-y-2">
              {Object.entries(heroImageIssues).map(([sku, issues]) => (
                <div key={sku} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-foreground font-medium">{sku}</span>
                    <span className="font-mono text-[10px] text-sw-red">{skuData.find(s => s.sku === sku)?.heroImage || 0}/20</span>
                  </div>
                  <div className="flex items-center gap-1 mb-2">
                    {issues.map(issue => (
                      <span key={issue} className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-sw-red/10 text-sw-red">{issue}</span>
                    ))}
                  </div>
                  <button onClick={() => handleFlag(sku)} className="text-[10px] font-medium flex items-center gap-1" style={{ color: "#4F7FFF" }}>
                    {copiedFlags[sku] ? <><Check size={10} /> Brief copied!</> : <><Copy size={10} /> Flag for content team →</>}
                  </button>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Search listing performance */}
          <PanelCard title="Search Listing Performance" badge="Per SKU" badgeColor="green" delay={0.4}>
            <div className="space-y-3">
              {Object.entries(searchKeywords).map(([sku, keywords]) => (
                <div key={sku} className="p-3 rounded-xl bg-surface-2 border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-foreground font-medium">{sku}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{skuData.find(s => s.sku === sku)?.searchListing || 0}/20</span>
                  </div>
                  <div className="space-y-1">
                    {keywords.map(kw => (
                      <div key={kw.kw} className="flex items-center gap-2 text-[10px]">
                        <span className="font-mono text-foreground flex-1">{kw.kw}</span>
                        <span className={`font-mono ${kw.rank <= 10 ? "text-sw-green" : "text-sw-red"}`}>Rank #{kw.rank}</span>
                        {kw.rank > 10 && <span className="font-mono text-[8px] px-1 py-0.5 rounded bg-sw-red/10 text-sw-red">Not in top 10</span>}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "search-listing", params: { sku, keywords: keywords.map(k => k.kw).join(",") } })} className="text-[10px] font-medium mt-2 inline-block" style={{ color: "#4F7FFF" }}>
                    Boost keyword bids →
                  </button>
                </div>
              ))}
            </div>
          </PanelCard>

          {/* Competitor content aggression */}
          <PanelCard title="Content Change Activity in Your Category" badge="Last 7 days" badgeColor="red" delay={0.5}>
            <p className="text-[10px] text-muted-foreground mb-3">Tracks how frequently competitors are updating titles, images, and listings. High aggression = they are actively optimising against you.</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Competitor</th>
                  <th className="text-right py-2 font-normal">Changes</th>
                  <th className="text-center py-2 font-normal">Level</th>
                  <th className="text-left py-2 font-normal">What</th>
                  <th className="text-left py-2 font-normal">Keywords</th>
                  <th className="text-right py-2 font-normal">Impact</th>
                  <th className="text-right py-2 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {competitorAggression.map((c, i) => (
                  <tr key={c.brand} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground font-medium">{c.brand}</td>
                    <td className="py-2.5 text-right font-mono text-foreground">{c.changes}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${c.level === "High" ? "bg-sw-red/15 text-sw-red" : c.level === "Medium" ? "bg-sw-amber/15 text-sw-amber" : "bg-surface-3 text-muted-foreground"}`}>{c.level}</span>
                    </td>
                    <td className="py-2.5">
                      <div className="flex gap-1">{c.what.map(w => <span key={w} className="font-mono text-[8px] px-1 py-0.5 rounded bg-surface-3 text-foreground">{w}</span>)}</div>
                    </td>
                    <td className="py-2.5 font-mono text-[10px] text-muted-foreground">{c.keywords.join(", ")}</td>
                    <td className="py-2.5 text-right font-mono text-sw-red">{c.impact}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "competitor-content", params: { competitor: c.brand } })} className="text-[10px] font-medium" style={{ color: "#4F7FFF" }}>Respond →</button>
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

export default ContentAuditView;
