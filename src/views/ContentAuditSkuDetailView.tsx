import React, { useState } from "react";
import { useGuardrails, type ContextFilter } from "@/contexts/GuardrailContext";
import { skuData, getOverall, competitorScores } from "@/views/ContentAuditView";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";

// Mock data for detail page
const titleChecks = [
  { label: "Title length optimal (60–80 chars)", pass: true, pts: 0 },
  { label: "Brand name present", pass: true, pts: 0 },
  { label: "Product category keyword present", pass: false, pts: 3 },
  { label: "Size or variant mentioned", pass: false, pts: 2 },
  { label: "Key benefit mentioned", pass: true, pts: 0 },
  { label: "Not keyword stuffed", pass: true, pts: 0 },
  { label: "Readable (no special character overload)", pass: true, pts: 0 },
];

const heroChecks = [
  { label: "Image resolution sufficient", pass: true, pts: 0 },
  { label: "Product in focus and centered", pass: false, pts: 3 },
  { label: "Clean or white background", pass: false, pts: 2 },
  { label: "Size callout or key info visible", pass: false, pts: 2 },
  { label: "No prohibited text overlay", pass: true, pts: 0 },
  { label: "Image matches title claims", pass: true, pts: 0 },
];

const pageChecks = [
  { label: "Minimum 5 bullet points present", pass: true, pts: 0 },
  { label: "All bullets ≥10 words", pass: false, pts: 2 },
  { label: "Key ingredients or specs mentioned", pass: true, pts: 0 },
  { label: "Usage instructions present", pass: false, pts: 2 },
  { label: "Size/weight/variant clearly stated", pass: true, pts: 0 },
  { label: "Brand story or USP section present", pass: false, pts: 3 },
  { label: "A+ or enhanced content present", pass: true, pts: 0 },
];

const searchKeywordsMock = [
  { kw: "creatine monohydrate", yourRank: 14, compRank: 8, impressionShare: 12, issue: "Not in top 10" },
  { kw: "creatine supplement", yourRank: 22, compRank: 5, impressionShare: 4, issue: "Below competitor" },
  { kw: "creatine powder", yourRank: 8, compRank: 12, impressionShare: 22, issue: null },
  { kw: "gym creatine", yourRank: 18, compRank: 15, impressionShare: 8, issue: "Not in top 10" },
  { kw: "creatine india", yourRank: 11, compRank: 9, impressionShare: 14, issue: "Below competitor" },
];

const aggressionData = [
  { brand: "MuscleBlaze", changes7d: 8, changes30d: 24, what: ["Titles", "Images"], keywords: ["creatine", "pre-workout"], impact: "-2 rank" },
  { brand: "Optimum Nutrition", changes7d: 3, changes30d: 12, what: ["Listings"], keywords: ["creatine supplement"], impact: "-1 rank" },
];

// Score trend (30 days mock)
const generateTrendData = (baseScore: number) =>
  Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    yours: Math.max(0, Math.min(100, baseScore + Math.floor(Math.random() * 8) - 4)),
    competitor: Math.max(0, Math.min(100, baseScore + 10 + Math.floor(Math.random() * 8) - 4)),
  }));

const scoreColor = (s: number) => s >= 80 ? "#2ECF8E" : s >= 60 ? "#F5A623" : "#FF5C5C";

const ScoreRing: React.FC<{ score: number; size?: number; label?: string }> = ({ score, size = 56, label }) => {
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = scoreColor(score);
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(220,13%,91%)" strokeWidth={4} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={4}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" transform={`rotate(-90 ${size / 2} ${size / 2})`} />
        <text x={size / 2} y={size / 2} textAnchor="middle" dy="0.35em" fill={color} fontSize={14} fontWeight={600} fontFamily="var(--font-mono)">
          {score}
        </text>
      </svg>
      {label && <span className="text-[11px] mt-1" style={{ color: "hsl(220,10%,46%)" }}>{label}</span>}
    </div>
  );
};

const CheckRow: React.FC<{ check: { label: string; pass: boolean; pts: number } }> = ({ check }) => (
  <div className="flex items-center gap-2 py-1.5">
    <span style={{ color: check.pass ? "#2ECF8E" : "#FF5C5C" }}>{check.pass ? "✓" : "✗"}</span>
    <span className="text-[12px] flex-1" style={{ color: check.pass ? "hsl(220,10%,46%)" : "hsl(220,20%,15%)" }}>{check.label}</span>
    {!check.pass && <span className="text-[10px] font-mono" style={{ color: "hsl(220,10%,46%)" }}>costs {check.pts} pts</span>}
  </div>
);

interface ContentAuditSkuDetailViewProps {
  skuId: string;
  competitor?: string;
  onBack: () => void;
}

const ContentAuditSkuDetailView: React.FC<ContentAuditSkuDetailViewProps> = ({ skuId, competitor, onBack }) => {
  const g = useGuardrails();
  const [copiedHero, setCopiedHero] = useState(false);
  const [copiedPage, setCopiedPage] = useState(false);
  const [platformFilter, setPlatformFilter] = useState("All");

  const sku = skuData.find(s => s.id === skuId);
  if (!sku) return <div className="p-8 text-center text-muted-foreground">SKU not found</div>;

  const overall = getOverall(sku);
  const isComparing = !!competitor && competitor !== "";
  const compScores = isComparing ? competitorScores[competitor]?.[skuId] : null;
  const compOverall = compScores ? compScores.title + compScores.heroImage + compScores.searchListing + compScores.pageContent + compScores.competitorAggression : 0;

  const trendData = generateTrendData(overall);

  const weakDims = ["Title", "Hero Image", "Search Listing", "Page Content", "Competitor Aggression"]
    .filter((_, i) => [sku.title, sku.heroImage, sku.searchListing, sku.pageContent, sku.competitorAggression][i] < 14);

  const handleCopy = (type: string) => {
    const brief = `SKU: ${sku.sku} · ${type} score: ${type === "Hero image" ? sku.heroImage : sku.pageContent}/20 · Issues: needs improvement`;
    navigator.clipboard.writeText(brief);
    if (type === "Hero image") { setCopiedHero(true); setTimeout(() => setCopiedHero(false), 2000); }
    else { setCopiedPage(true); setTimeout(() => setCopiedPage(false), 2000); }
  };

  const platforms = ["All", "Blinkit", "Zepto", "Swiggy Instamart", "Amazon", "Flipkart"];

  return (
    <div className="space-y-6 pb-20 max-w-4xl">
      {/* Back button */}
      <button onClick={onBack} className="flex items-center gap-1.5 text-[12px]" style={{ color: "#4F7FFF" }}>
        <ArrowLeft size={14} /> Back to Content Audit
      </button>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-[60px] h-[60px] rounded-xl bg-surface-2 flex items-center justify-center text-2xl">{sku.thumb}</div>
          <div>
            <h1 className="text-xl font-bold" style={{ color: "hsl(220,20%,15%)" }}>{sku.sku}</h1>
            <p className="font-mono text-[12px]" style={{ color: "hsl(220,10%,46%)" }}>{sku.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <ScoreRing score={overall} />
          {isComparing && compScores && <ScoreRing score={compOverall} size={44} label={`vs ${competitor}`} />}
          <div className="text-right">
            <p className="text-[10px]" style={{ color: "hsl(220,10%,46%)" }}>Last audited: {sku.lastUpdated}</p>
            <button className="text-[11px] px-2 py-1 rounded-lg border mt-1" style={{ borderColor: "hsl(220,13%,91%)", color: "hsl(220,10%,46%)" }}>
              Re-audit this SKU
            </button>
          </div>
        </div>
      </div>

      {/* Score trend chart */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4">
        <h3 className="text-sm font-medium mb-3" style={{ color: "hsl(220,20%,15%)" }}>Score trend — last 30 days</h3>
        <div className="flex items-center gap-2 mb-3">
          {platforms.map(p => (
            <button key={p} onClick={() => setPlatformFilter(p)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${platformFilter === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>
              {p}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={4} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
            <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
            <Line type="monotone" dataKey="yours" stroke="#A78BFA" strokeWidth={2} dot={false} name="Your score" />
            {isComparing && <Line type="monotone" dataKey="competitor" stroke="#FF5C5C" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name={competitor} />}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Dimension 1 — Title quality */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4" style={{ borderLeft: "3px solid #4F7FFF" }}>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-medium" style={{ color: "hsl(220,20%,15%)" }}>Title quality</h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${scoreColor(sku.title * 5)}20`, color: scoreColor(sku.title * 5) }}>{sku.title}/20</span>
        </div>
        <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)" }}>
          <p className="text-[12px]" style={{ color: "hsl(220,20%,15%)" }}>{sku.sku} — Premium Grade Supplement</p>
          <p className="text-[10px] mt-1" style={{ color: sku.sku.length >= 60 && sku.sku.length <= 80 ? "#2ECF8E" : "#F5A623" }}>{sku.sku.length} chars</p>
        </div>
        <div className="mb-3">{titleChecks.map((c, i) => <CheckRow key={i} check={c} />)}</div>
        {isComparing && compScores && (
          <div className="rounded-lg p-3 mt-3" style={{ backgroundColor: "rgba(255,92,92,0.05)", border: "1px solid rgba(255,92,92,0.1)" }}>
            <p className="text-[10px] font-medium mb-1" style={{ color: "#FF5C5C" }}>Competitor title ({competitor})</p>
            <p className="text-[12px]" style={{ color: "hsl(220,10%,46%)" }}>{competitor} — Premium {sku.sku} Alternative</p>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block" style={{ backgroundColor: "rgba(245,166,35,0.15)", color: "#F5A623" }}>
              They pass {Math.max(0, compScores.title - sku.title)} more checks
            </span>
          </div>
        )}
        <div className="rounded-lg p-3 mt-3" style={{ border: "1px dashed hsl(220,13%,85%)" }}>
          <p className="text-[10px] font-mono mb-1" style={{ color: "hsl(220,10%,46%)" }}>Suggested title</p>
          <p className="text-[12px]" style={{ color: "hsl(220,20%,15%)" }}>{sku.sku} | Micronized | Premium Grade | Lab Tested</p>
          <p className="text-[10px] mt-1" style={{ color: "hsl(220,10%,46%)" }}>Why: adds size variant and category keyword</p>
        </div>
        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "content-audit", params: { sku: sku.id, issues: "title" } })}
          className="text-[11px] font-medium mt-3 inline-block" style={{ color: "#4F7FFF" }}>
          Boost search bids while you fix this →
        </button>
      </div>

      {/* Dimension 2 — Hero image quality */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4" style={{ borderLeft: "3px solid #4F7FFF" }}>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-medium" style={{ color: "hsl(220,20%,15%)" }}>Hero image quality</h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${scoreColor(sku.heroImage * 5)}20`, color: scoreColor(sku.heroImage * 5) }}>{sku.heroImage}/20</span>
        </div>
        <div className="flex items-center gap-4 mb-3">
          <div className="w-[120px] h-[120px] rounded-xl bg-surface-2 flex items-center justify-center text-4xl">{sku.thumb}</div>
          {isComparing && (
            <div className="w-[120px] h-[120px] rounded-xl bg-surface-2 flex items-center justify-center text-4xl opacity-70 border" style={{ borderColor: "rgba(255,92,92,0.2)" }}>
              {sku.thumb}
            </div>
          )}
        </div>
        <div className="mb-3">{heroChecks.map((c, i) => <CheckRow key={i} check={c} />)}</div>
        <button onClick={() => handleCopy("Hero image")} className="text-[11px] font-medium flex items-center gap-1" style={{ color: "#4F7FFF" }}>
          {copiedHero ? <><Check size={10} /> Brief copied!</> : <><Copy size={10} /> Flag for content team</>}
        </button>
      </div>

      {/* Dimension 3 — Search listing performance */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4" style={{ borderLeft: "3px solid #4F7FFF" }}>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-medium" style={{ color: "hsl(220,20%,15%)" }}>Search listing performance</h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${scoreColor(sku.searchListing * 5)}20`, color: scoreColor(sku.searchListing * 5) }}>{sku.searchListing}/20</span>
        </div>
        <table className="w-full text-xs mb-3">
          <thead>
            <tr className="text-muted-foreground border-b border-subtle">
              <th className="text-left py-2 font-normal">Keyword</th>
              <th className="text-right py-2 font-normal">Your rank</th>
              {isComparing && <th className="text-right py-2 font-normal">{competitor} rank</th>}
              <th className="text-right py-2 font-normal">Imp. share</th>
              <th className="text-right py-2 font-normal">Issue</th>
            </tr>
          </thead>
          <tbody>
            {searchKeywordsMock.map(kw => (
              <tr key={kw.kw} className="border-b border-subtle/30">
                <td className="py-2 font-mono text-foreground">{kw.kw}</td>
                <td className="py-2 text-right font-mono" style={{ color: kw.yourRank <= 10 ? "#2ECF8E" : "#FF5C5C" }}>#{kw.yourRank}</td>
                {isComparing && <td className="py-2 text-right font-mono" style={{ color: "hsl(220,10%,46%)" }}>#{kw.compRank}</td>}
                <td className="py-2 text-right font-mono" style={{ color: "hsl(220,10%,46%)" }}>{kw.impressionShare}%</td>
                <td className="py-2 text-right">
                  {kw.issue && <span className="font-mono text-[8px] px-1.5 py-0.5 rounded bg-sw-red/10 text-sw-red">{kw.issue}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] mb-3" style={{ color: "hsl(220,10%,46%)" }}>
          Appearing in top 10 on {searchKeywordsMock.filter(k => k.yourRank <= 10).length} of {searchKeywordsMock.length} key keywords = {sku.searchListing}/20
        </p>
        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "search-listing", params: { sku: sku.id, keywords: searchKeywordsMock.map(k => k.kw).join(",") } })}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
          Boost keyword bids →
        </button>
      </div>

      {/* Dimension 4 — Product page content */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4" style={{ borderLeft: "3px solid #4F7FFF" }}>
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-sm font-medium" style={{ color: "hsl(220,20%,15%)" }}>Product page content</h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${scoreColor(sku.pageContent * 5)}20`, color: scoreColor(sku.pageContent * 5) }}>{sku.pageContent}/20</span>
        </div>
        <div className="mb-3">{pageChecks.map((c, i) => <CheckRow key={i} check={c} />)}</div>
        {isComparing && compScores && (
          <div className="rounded-lg p-3 mt-2" style={{ backgroundColor: "rgba(255,92,92,0.05)", border: "1px solid rgba(255,92,92,0.1)" }}>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: "rgba(245,166,35,0.15)", color: "#F5A623" }}>
              {competitor} has {Math.max(0, compScores.pageContent - sku.pageContent)} items you're missing
            </span>
          </div>
        )}
        <button onClick={() => handleCopy("Page content")} className="text-[11px] font-medium flex items-center gap-1 mt-3" style={{ color: "#4F7FFF" }}>
          {copiedPage ? <><Check size={10} /> Brief copied!</> : <><Copy size={10} /> Flag for content team</>}
        </button>
      </div>

      {/* Dimension 5 — Competitor content aggression */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4" style={{ borderLeft: "3px solid #F5A623" }}>
        <div className="flex items-center gap-3 mb-1">
          <h3 className="text-sm font-medium" style={{ color: "hsl(220,20%,15%)" }}>Competitor content aggression</h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: `${scoreColor(sku.competitorAggression * 5)}20`, color: scoreColor(sku.competitorAggression * 5) }}>{sku.competitorAggression}/20</span>
        </div>
        <p className="text-[11px] mb-3" style={{ color: "hsl(220,10%,46%)" }}>
          How actively competitors are updating content in this category. High aggression + low your update frequency = low score.
        </p>
        <span className="font-mono text-[11px] px-2.5 py-1 rounded-full mb-3 inline-block" style={{
          backgroundColor: sku.competitorAggression < 12 ? "rgba(255,92,92,0.15)" : sku.competitorAggression < 16 ? "rgba(245,166,35,0.15)" : "rgba(46,207,142,0.15)",
          color: sku.competitorAggression < 12 ? "#FF5C5C" : sku.competitorAggression < 16 ? "#F5A623" : "#2ECF8E",
        }}>
          {sku.competitorAggression < 12 ? "High" : sku.competitorAggression < 16 ? "Medium" : "Low"} aggression
        </span>
        <table className="w-full text-xs mt-3">
          <thead>
            <tr className="text-muted-foreground border-b border-subtle">
              <th className="text-left py-2 font-normal">Competitor</th>
              <th className="text-right py-2 font-normal">7d</th>
              <th className="text-right py-2 font-normal">30d</th>
              <th className="text-left py-2 font-normal">What</th>
              <th className="text-left py-2 font-normal">Keywords</th>
              <th className="text-right py-2 font-normal">Impact</th>
            </tr>
          </thead>
          <tbody>
            {aggressionData.map(c => (
              <tr key={c.brand} className="border-b border-subtle/30">
                <td className="py-2 text-foreground font-medium">{c.brand}</td>
                <td className="py-2 text-right font-mono" style={{ color: "hsl(220,20%,15%)" }}>{c.changes7d}</td>
                <td className="py-2 text-right font-mono" style={{ color: "hsl(220,10%,46%)" }}>{c.changes30d}</td>
                <td className="py-2"><div className="flex gap-1">{c.what.map(w => <span key={w} className="font-mono text-[8px] px-1 py-0.5 rounded bg-surface-3 text-foreground">{w}</span>)}</div></td>
                <td className="py-2 font-mono text-[10px]" style={{ color: "hsl(220,10%,46%)" }}>{c.keywords.join(", ")}</td>
                <td className="py-2 text-right font-mono text-sw-red">{c.impact}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[11px] mt-3" style={{ color: "hsl(220,10%,46%)" }}>
          Score is {sku.competitorAggression}/20. {sku.competitorAggression < 14 ? "High competitor activity + low your update frequency = points lost here." : "Moderate competitor activity — maintain current pace."}
        </p>
        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "competitor-content", params: { competitor: aggressionData[0]?.brand || "", sku: sku.id } })}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white mt-3" style={{ backgroundColor: "#F5A623" }}>
          Defensive bid response →
        </button>
      </div>

      {/* Bottom — Campaign Manager card */}
      <div className="rounded-xl border border-subtle bg-surface-1 p-4" style={{ borderLeft: "3px solid #4F7FFF" }}>
        <h3 className="text-sm font-medium mb-2" style={{ color: "hsl(220,20%,15%)" }}>Recommended Campaign Manager action</h3>
        <p className="text-[12px] mb-2" style={{ color: "hsl(220,10%,46%)" }}>
          Content score {overall}/100. Main gaps: {weakDims.slice(0, 2).join(", ") || "none"}.
          Recommended: increase search bids on this SKU to defend visibility while content is being fixed.
        </p>
        <div className="flex items-center gap-1 mb-3">
          <span className="text-[10px]" style={{ color: "hsl(220,10%,46%)" }}>Confidence:</span>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ color: i < 4 ? "#2ECF8E" : "#333" }}>●</span>
          ))}
        </div>
        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", {
          type: "content-audit",
          params: { sku: sku.id, score: String(overall), issues: weakDims.join(",") }
        })}
          className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
          View in Campaign Manager →
        </button>
      </div>
    </div>
  );
};

export default ContentAuditSkuDetailView;
