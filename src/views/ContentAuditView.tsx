import React, { useState, useMemo } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { ChevronDown, ChevronRight, Copy, Check, X, AlertTriangle, ArrowRight, Download, Loader2, RefreshCw } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";

const dimensions = ["Title", "Hero Image", "Search Listing", "Page Content", "Competitor Aggression"];

export const skuData = [
  { id: "sku-001", sku: "Good Day Butter 200g", thumb: "🍪", title: 16, heroImage: 18, searchListing: 12, pageContent: 17, competitorAggression: 14, lastUpdated: "Mar 14", platform: "Amazon", category: "Cookies", priceParity: "match", availability: 96 },
  { id: "sku-002", sku: "Marie Gold 250g", thumb: "🍪", title: 14, heroImage: 15, searchListing: 8, pageContent: 13, competitorAggression: 16, lastUpdated: "Mar 12", platform: "Flipkart", category: "Glucose", priceParity: "above", availability: 88 },
  { id: "sku-003", sku: "50-50 Maska Chaska 120g", thumb: "🍘", title: 8, heroImage: 10, searchListing: 6, pageContent: 9, competitorAggression: 18, lastUpdated: "Mar 10", platform: "Amazon", category: "Cream", priceParity: "below", availability: 72 },
  { id: "sku-004", sku: "NutriChoice Digestive 100g", thumb: "🌾", title: 17, heroImage: 12, searchListing: 14, pageContent: 16, competitorAggression: 10, lastUpdated: "Mar 15", platform: "Blinkit", category: "Health", priceParity: "match", availability: 94 },
  { id: "sku-005", sku: "Bourbon Cream 150g", thumb: "🍫", title: 19, heroImage: 17, searchListing: 16, pageContent: 18, competitorAggression: 12, lastUpdated: "Mar 13", platform: "Zepto", category: "Cream", priceParity: "below", availability: 98 },
  { id: "sku-006", sku: "Milk Bikis 150g", thumb: "🥛", title: 11, heroImage: 9, searchListing: 10, pageContent: 11, competitorAggression: 15, lastUpdated: "Mar 11", platform: "Swiggy Instamart", category: "Kids", priceParity: "above", availability: 65 },
];

export const competitorScores: Record<string, Record<string, { title: number; heroImage: number; searchListing: number; pageContent: number; competitorAggression: number }>> = {
  "Sunfeast": {
    "sku-001": { title: 18, heroImage: 17, searchListing: 15, pageContent: 16, competitorAggression: 12 },
    "sku-002": { title: 16, heroImage: 14, searchListing: 12, pageContent: 15, competitorAggression: 14 },
    "sku-003": { title: 12, heroImage: 14, searchListing: 10, pageContent: 12, competitorAggression: 16 },
    "sku-004": { title: 15, heroImage: 16, searchListing: 13, pageContent: 14, competitorAggression: 11 },
    "sku-005": { title: 17, heroImage: 15, searchListing: 14, pageContent: 16, competitorAggression: 10 },
    "sku-006": { title: 14, heroImage: 13, searchListing: 11, pageContent: 13, competitorAggression: 13 },
  },
  "Parle": {
    "sku-001": { title: 19, heroImage: 19, searchListing: 17, pageContent: 18, competitorAggression: 10 },
    "sku-002": { title: 18, heroImage: 17, searchListing: 14, pageContent: 17, competitorAggression: 12 },
    "sku-003": { title: 14, heroImage: 16, searchListing: 12, pageContent: 14, competitorAggression: 14 },
    "sku-004": { title: 16, heroImage: 18, searchListing: 15, pageContent: 15, competitorAggression: 9 },
    "sku-005": { title: 18, heroImage: 16, searchListing: 15, pageContent: 17, competitorAggression: 8 },
    "sku-006": { title: 15, heroImage: 14, searchListing: 12, pageContent: 14, competitorAggression: 11 },
  },
};

const competitors = Object.keys(competitorScores);

export const getOverall = (s: typeof skuData[0]) => s.title + s.heroImage + s.searchListing + s.pageContent + s.competitorAggression;
const getCompOverall = (c: { title: number; heroImage: number; searchListing: number; pageContent: number; competitorAggression: number }) =>
  c.title + c.heroImage + c.searchListing + c.pageContent + c.competitorAggression;
const scoreColor = (score: number) => score >= 80 ? "#2ECF8E" : score >= 60 ? "#F5A623" : "#FF5C5C";
const dimColor = (score: number) => score >= 16 ? "#2ECF8E" : score >= 12 ? "#F5A623" : "#FF5C5C";


const FilterDropdown: React.FC<{
  label: string;
  value: string;
  options: { label: string; value: string }[];
  onChange: (v: string) => void;
}> = ({ label, value, options, onChange }) => {
  const [open, setOpen] = useState(false);
  const selected = options.find(o => o.value === value);
  return (
    <div className="relative" style={{ minWidth: 160 }}>
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md text-[12px] text-left" style={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", color: "hsl(220,20%,15%)" }}>
        <span className="truncate">{selected?.label || label}</span>
        <ChevronDown size={12} style={{ color: "hsl(220,10%,46%)" }} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-full z-50 overflow-y-auto" style={{ backgroundColor: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, maxHeight: 240 }}>
            {options.map(opt => (
              <button key={opt.value} onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left px-3 py-2 text-[12px] transition-colors"
                style={{ color: opt.value === value ? "hsl(220,20%,15%)" : "hsl(220,10%,46%)", backgroundColor: opt.value === value ? "hsl(220,14%,96%)" : "transparent" }}
                onMouseEnter={(e) => { (e.target as HTMLElement).style.backgroundColor = "hsl(220,14%,96%)"; }}
                onMouseLeave={(e) => { (e.target as HTMLElement).style.backgroundColor = opt.value === value ? "hsl(220,14%,96%)" : "transparent"; }}>
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const titleIssues: Record<string, { issues: string[]; suggested: string }> = {
  "50-50 Maska Chaska 120g": { issues: ["Too short", "Missing keywords", "No size/variant"], suggested: "Britannia 50-50 Maska Chaska 120g | Salted Butter Biscuits | Crunchy Snack | Family Pack" },
  "Milk Bikis 150g": { issues: ["Missing keywords", "No brand name"], suggested: "Britannia Milk Bikis 150g | Milk Cream Biscuits | Kids Favourite | Rich in Calcium" },
  "Marie Gold 250g": { issues: ["No size/variant"], suggested: "Britannia Marie Gold 250g | Lite Biscuits | 0% Trans Fat | Fibre Rich | Tea-time Snack" },
};

const heroImageIssues: Record<string, string[]> = {
  "50-50 Maska Chaska 120g": ["Low resolution", "No product focus", "No size callout visible"],
  "Milk Bikis 150g": ["Busy background", "No size callout visible"],
  "NutriChoice Digestive 100g": ["No product focus"],
};

const searchKeywords: Record<string, { kw: string; rank: number }[]> = {
  "50-50 Maska Chaska 120g": [{ kw: "salted biscuits", rank: 14 }, { kw: "butter biscuits", rank: 22 }, { kw: "cream biscuits", rank: 8 }, { kw: "maska chaska", rank: 18 }, { kw: "50-50 biscuit", rank: 11 }],
  "Marie Gold 250g": [{ kw: "marie biscuit", rank: 6 }, { kw: "glucose biscuits", rank: 12 }, { kw: "tea time biscuit", rank: 15 }],
};

const competitorAggression = [
  { brand: "Sunfeast", changes: 18, level: "High", what: ["Titles", "Images"], keywords: ["butter biscuits", "cream biscuits"], impact: "-2 rank" },
  { brand: "Parle", changes: 9, level: "Medium", what: ["Listings"], keywords: ["glucose biscuits"], impact: "-1 rank" },
  { brand: "ITC", changes: 4, level: "Low", what: ["Titles"], keywords: ["digestive biscuits"], impact: "None" },
];

const scoreBuckets = [0, 0, 0, 1, 0, 1, 2, 1, 1, 0].map((count, i) => ({ bucket: `${i * 10}-${(i + 1) * 10}`, count }));

// Cross-platform consistency data
const crossPlatformData = [
  { sku: "Good Day Butter 200g", amazon: 77, flipkart: 72, blinkit: 68, zepto: 55, instamart: 48, bestPlatform: "Amazon", gap: 29, issue: true },
  { sku: "Marie Gold 250g", amazon: 66, flipkart: 66, blinkit: 60, zepto: 58, instamart: 52, bestPlatform: "Amazon", gap: 14, issue: true },
  { sku: "50-50 Maska Chaska 120g", amazon: 51, flipkart: 48, blinkit: 42, zepto: 38, instamart: 35, bestPlatform: "Amazon", gap: 16, issue: true },
  { sku: "NutriChoice Digestive 100g", amazon: 69, flipkart: 68, blinkit: 66, zepto: 65, instamart: 64, bestPlatform: "Amazon", gap: 5, issue: false },
  { sku: "Bourbon Cream 150g", amazon: 82, flipkart: 80, blinkit: 78, zepto: 76, instamart: 74, bestPlatform: "Amazon", gap: 8, issue: false },
  { sku: "Milk Bikis 150g", amazon: 56, flipkart: 44, blinkit: 38, zepto: 32, instamart: 28, bestPlatform: "Amazon", gap: 28, issue: true },
];

// Category benchmark + campaign performance data
const benchmarkData = [
  { sku: "Good Day Butter 200g", yourScore: 77, categoryAvg: 68, compAvg: 74, campaign: "Good Day SP", campaignActive: true, roas: "4.8x", campaignStatus: "Strong" },
  { sku: "Marie Gold 250g", yourScore: 66, categoryAvg: 68, compAvg: 72, campaign: "Marie Range SP", campaignActive: true, roas: "2.9x", campaignStatus: "Underperforming" },
  { sku: "50-50 Maska Chaska 120g", yourScore: 51, categoryAvg: 68, compAvg: 70, campaign: "50-50 Launch", campaignActive: false, roas: "—", campaignStatus: "Paused" },
  { sku: "NutriChoice Digestive 100g", yourScore: 69, categoryAvg: 65, compAvg: 67, campaign: "NutriChoice Brand SP", campaignActive: true, roas: "5.4x", campaignStatus: "Strong" },
  { sku: "Bourbon Cream 150g", yourScore: 82, categoryAvg: 68, compAvg: 71, campaign: "Bourbon Premium SP", campaignActive: true, roas: "6.1x", campaignStatus: "Excellent" },
  { sku: "Milk Bikis 150g", yourScore: 56, categoryAvg: 68, compAvg: 66, campaign: "Milk Bikis Kids", campaignActive: true, roas: "1.6x", campaignStatus: "Poor — fix content first" },
];

type SortKey = "score" | "title" | "heroImage" | "searchListing" | "pageContent" | "competitorAggression" | "lastUpdated";

const LastAuditKPI: React.FC = () => {
  const [downloading, setDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    // Simulate LLM-generated audit report download
    setTimeout(() => {
      const reportContent = `CONTENT QUALITY AUDIT REPORT — March 14, 2026
=================================================

Generated by AI Content Auditor

EXECUTIVE SUMMARY
------------------
Overall Portfolio Score: ${Math.round(skuData.reduce((s, d) => s + getOverall(d), 0) / skuData.length)}/100
SKUs Audited: ${skuData.length}
Critical SKUs (Below 60): ${skuData.filter(s => getOverall(s) < 60).length}
SKUs Needing Work (60–79): ${skuData.filter(s => { const o = getOverall(s); return o >= 60 && o < 80; }).length}
Strong SKUs (80+): ${skuData.filter(s => getOverall(s) >= 80).length}

SKU-LEVEL RECOMMENDATIONS
--------------------------
${skuData.map(s => {
  const overall = getOverall(s);
  const issues: string[] = [];
  if (s.title < 14) issues.push("Title needs keyword enrichment — add category + benefit terms");
  if (s.heroImage < 14) issues.push("Hero image below benchmark — improve resolution, add product focus shot");
  if (s.searchListing < 12) issues.push("Search listing weak — optimize backend keywords and bullet points");
  if (s.pageContent < 14) issues.push("Page content thin — add A+ content module with lifestyle imagery");
  if (s.competitorAggression >= 16) issues.push("High competitor aggression detected — prioritize content refresh within 7 days");
  return `\n${s.sku} (${s.platform}) — Score: ${overall}/100
  ${issues.length > 0 ? issues.map(i => `  • ${i}`).join("\n") : "  ✓ No critical issues — maintain current quality"}`;
}).join("\n")}

COMPETITIVE LANDSCAPE
----------------------
${Object.entries(competitorScores).map(([comp, scores]) => {
  const avgComp = Math.round(Object.values(scores).reduce((s, d) => s + getCompOverall(d), 0) / Object.values(scores).length);
  return `${comp}: Avg score ${avgComp}/100`;
}).join("\n")}

PRIORITY ACTIONS (Next 7 Days)
-------------------------------
1. Fix hero images for SKUs scoring below 12/20 on Hero Image dimension
2. Enrich titles with missing keywords for SKUs below 14/20 on Title
3. Add A+ content to all SKUs currently without it
4. Monitor competitor content changes — ${competitorAggression.filter(c => c.level === "High").length} brands actively optimising

Report generated on ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
`;
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "content-audit-report-mar14.txt";
      a.click();
      URL.revokeObjectURL(url);
      setDownloading(false);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    }, 2000);
  };

  return (
    <div className="rounded-2xl border border-subtle bg-surface-1 p-5 animate-fade-in" style={{ animationDelay: "0.15s" }}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] text-muted-foreground font-medium tracking-wide uppercase">Last Full Audit</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green font-medium">Completed</span>
      </div>
      <div className="text-2xl font-bold font-mono text-foreground mb-1">Mar 14</div>
      <p className="text-[10px] text-muted-foreground mb-3">AI-generated recommendations</p>
      <button
        onClick={handleDownload}
        disabled={downloading}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all ${
          downloaded ? "bg-sw-green-dim text-sw-green" : downloading ? "bg-surface-3 text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary/20"
        }`}>
        {downloading ? <><Loader2 size={12} className="animate-spin" /> Generating report...</> :
         downloaded ? <><Check size={12} /> Downloaded</> :
         <><Download size={12} /> Download Audit Report</>}
      </button>
      <GenerateNewAuditButton />
    </div>
  );
};

const GenerateNewAuditButton: React.FC = () => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const lastAuditDate = new Date(2026, 2, 14); // Mar 14, 2026
  const today = new Date();
  const daysSinceLast = Math.floor((today.getTime() - lastAuditDate.getTime()) / (1000 * 60 * 60 * 24));
  const eligible = daysSinceLast >= 15;

  const handleGenerate = () => {
    setShowConfirm(false);
    setGenerating(true);
    setTimeout(() => {
      const reportContent = `FULL CONTENT QUALITY AUDIT REPORT — ${today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
=================================================

Generated by AI Content Auditor (New Audit)

EXECUTIVE SUMMARY
------------------
Overall Portfolio Score: ${Math.round(skuData.reduce((s, d) => s + getOverall(d), 0) / skuData.length)}/100
SKUs Audited: ${skuData.length}
Critical SKUs (Below 60): ${skuData.filter(s => getOverall(s) < 60).length}
SKUs Needing Work (60–79): ${skuData.filter(s => { const o = getOverall(s); return o >= 60 && o < 80; }).length}
Strong SKUs (80+): ${skuData.filter(s => getOverall(s) >= 80).length}

CHANGES SINCE LAST AUDIT (Mar 14)
-----------------------------------
• Average portfolio score: No significant change detected
• Competitor aggression: Sunfeast increased content updates by 22%
• New keyword opportunities identified for 3 SKUs
• Hero image compliance improved for NutriChoice Digestive

SKU-LEVEL RECOMMENDATIONS
--------------------------
${skuData.map(s => {
  const overall = getOverall(s);
  const issues: string[] = [];
  if (s.title < 14) issues.push("Title needs keyword enrichment — add category + benefit terms");
  if (s.heroImage < 14) issues.push("Hero image below benchmark — improve resolution, add product focus shot");
  if (s.searchListing < 12) issues.push("Search listing weak — optimize backend keywords and bullet points");
  if (s.pageContent < 14) issues.push("Page content thin — add A+ content module with lifestyle imagery");
  if (s.competitorAggression >= 16) issues.push("High competitor aggression detected — prioritize content refresh within 7 days");
  return `\n${s.sku} (${s.platform}) — Score: ${overall}/100
  ${issues.length > 0 ? issues.map(i => `  • ${i}`).join("\n") : "  ✓ No critical issues — maintain current quality"}`;
}).join("\n")}

COMPETITIVE LANDSCAPE
----------------------
${Object.entries(competitorScores).map(([comp, scores]) => {
  const avgComp = Math.round(Object.values(scores).reduce((s, d) => s + getCompOverall(d), 0) / Object.values(scores).length);
  return `${comp}: Avg score ${avgComp}/100`;
}).join("\n")}

PRIORITY ACTIONS (Next 7 Days)
-------------------------------
1. Fix hero images for SKUs scoring below 12/20 on Hero Image dimension
2. Enrich titles with missing keywords for SKUs below 14/20 on Title
3. Add A+ content to all SKUs currently without it
4. Monitor competitor content changes — ${competitorAggression.filter(c => c.level === "High").length} brands actively optimising

Report generated on ${today.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
`;
      const blob = new Blob([reportContent], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content-audit-report-${today.toLocaleDateString("en-IN", { day: "2-digit", month: "short" }).replace(" ", "").toLowerCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      setGenerating(false);
      setGenerated(true);
      setTimeout(() => setGenerated(false), 3000);
    }, 3000);
  };

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        disabled={generating}
        className={`w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-medium transition-all mt-2 ${
          generated ? "bg-sw-green-dim text-sw-green" : generating ? "bg-surface-3 text-muted-foreground" : "bg-accent/10 text-accent-foreground hover:bg-accent/20 border border-border-visible"
        }`}>
        {generating ? <><Loader2 size={12} className="animate-spin" /> Running new audit...</> :
         generated ? <><Check size={12} /> New Audit Generated</> :
         <><RefreshCw size={12} /> Generate New Audit Report</>}
      </button>

      <Dialog open={showConfirm} onOpenChange={setShowConfirm}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Generate New Full Audit</DialogTitle>
            <DialogDescription className="text-xs">
              {eligible
                ? `It has been ${daysSinceLast} days since the last audit (Mar 14). A new audit can be triggered.`
                : `Only ${daysSinceLast} days have passed since the last audit (Mar 14). A minimum of 15 days is required between audits.`}
            </DialogDescription>
          </DialogHeader>
          <div className={`rounded-lg p-3 text-xs ${eligible ? "bg-[hsl(var(--success))]/10 text-[hsl(var(--success))]" : "bg-destructive/10 text-destructive"}`}>
            {eligible
              ? `✓ Eligible — ${daysSinceLast} days since last report (minimum 15 days met)`
              : `✗ Not eligible — ${15 - daysSinceLast} more day(s) required`}
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:bg-surface-2 transition-colors">Cancel</button>
            </DialogClose>
            <button
              onClick={handleGenerate}
              disabled={!eligible}
              className={`px-4 py-2 rounded-lg text-xs font-medium transition-colors ${
                eligible ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-surface-3 text-muted-foreground cursor-not-allowed"
              }`}>
              {eligible ? "Trigger New Audit" : "Not Eligible Yet"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const ContentAuditView: React.FC = () => {
  const [tab, setTab] = useState("overview");
  const [platformFilter, setPlatformFilter] = useState("All");
  const [scoreFilter, setScoreFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [compareCompetitor, setCompareCompetitor] = useState("None");
  const [sortBy, setSortBy] = useState("score_asc");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
  const [copiedFlags, setCopiedFlags] = useState<Record<string, boolean>>({});
  const [heatmapBrand, setHeatmapBrand] = useState("You");
  const [autoGen, setAutoGen] = useState(false);
  const g = useGuardrails();

  const categories = useMemo(() => ["All", ...Array.from(new Set(skuData.map(s => s.category)))], []);

  const filteredSkus = useMemo(() => {
    let result = skuData
      .filter(s => platformFilter === "All" || s.platform === platformFilter)
      .filter(s => categoryFilter === "All" || s.category === categoryFilter)
      .filter(s => {
        const overall = getOverall(s);
        if (scoreFilter === "Critical") return overall < 60;
        if (scoreFilter === "NeedsWork") return overall >= 60 && overall < 80;
        if (scoreFilter === "Strong") return overall >= 80;
        return true;
      });

    const [key, dir] = sortBy.split("_");
    const asc = dir === "asc";
    result = [...result].sort((a, b) => {
      let aVal: number | string, bVal: number | string;
      switch (key) {
        case "score": aVal = getOverall(a); bVal = getOverall(b); break;
        case "title": aVal = a.title; bVal = b.title; break;
        case "heroImage": aVal = a.heroImage; bVal = b.heroImage; break;
        case "searchListing": aVal = a.searchListing; bVal = b.searchListing; break;
        case "pageContent": aVal = a.pageContent; bVal = b.pageContent; break;
        case "competitorAggression": aVal = a.competitorAggression; bVal = b.competitorAggression; break;
        case "lastUpdated": aVal = a.lastUpdated; bVal = b.lastUpdated; break;
        default: aVal = getOverall(a); bVal = getOverall(b);
      }
      if (typeof aVal === "string") return asc ? aVal.localeCompare(bVal as string) : (bVal as string).localeCompare(aVal);
      return asc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

    return result;
  }, [platformFilter, scoreFilter, categoryFilter, sortBy]);

  const avgScore = Math.round(skuData.reduce((s, d) => s + getOverall(d), 0) / skuData.length);
  const criticalCount = skuData.filter(s => getOverall(s) < 60).length;
  const competitorStronger = skuData.filter(s => s.competitorAggression >= 16).length;

  const radarData = dimensions.map((dim, i) => ({
    dimension: dim,
    you: Math.round(skuData.reduce((s, d) => s + [d.title, d.heroImage, d.searchListing, d.pageContent, d.competitorAggression][i], 0) / skuData.length),
    category: Math.round(12 + Math.random() * 4),
  }));

  const handleFlag = (sku: string) => {
    const brief = `Content improvement needed for ${sku}. Issues: ${(heroImageIssues[sku] || []).join(", ")}`;
    navigator.clipboard.writeText(brief);
    setCopiedFlags(p => ({ ...p, [sku]: true }));
    setTimeout(() => setCopiedFlags(p => ({ ...p, [sku]: false })), 2000);
  };

  const navigateToSkuDetail = (s: typeof skuData[0]) => {
    g.navigateWithContext("contentaudit", undefined, {
      type: "sku-detail",
      params: { skuId: s.id, competitor: compareCompetitor !== "None" ? compareCompetitor : "" }
    });
  };

  const isComparing = compareCompetitor !== "None";
  const compData = isComparing ? competitorScores[compareCompetitor] : null;

  const DimCell: React.FC<{ yours: number; theirs?: number }> = ({ yours, theirs }) => {
    if (!isComparing || theirs === undefined) {
      return (
        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: dimColor(yours) + "20", color: dimColor(yours) }}>{yours}/20</span>
      );
    }
    const gap = yours - theirs;
    const gapColor = gap > 0 ? "#2ECF8E" : gap < 0 ? "#FF5C5C" : "hsl(220,10%,46%)";
    return (
      <span className="font-mono text-[10px]" style={{ color: gapColor }}>
        {yours} <span style={{ color: "hsl(220,10%,46%)" }}>/</span> {theirs}
      </span>
    );
  };

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Content Quality Score</h1>
        <p className="text-xs text-muted-foreground mt-1">Content quality scores across your SKU catalogue.</p>
      </div>

      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Avg Content Score" value={`${avgScore}/100`} delta={avgScore >= 80 ? "Strong" : avgScore >= 60 ? "Needs work" : "Critical"} deltaType={avgScore >= 70 ? "positive" : "negative"} <KPICard title="Avg Content Score" value={`${avgScore}/100`} delta={avgScore >= 80 ? "Strong" : avgScore >= 60 ? "Needs work" : "Critical"} deltaType={avgScore >= 70 ? "positive" : "negative"} sub="Driven by image quality gaps on newer listings" accentColor="bg-primary" delay={0} /> accentColor="bg-primary" delay={0} />
          <KPICard title="SKUs Below 60" value={String(criticalCount)} delta={criticalCount > 0 ? "Immediate action needed" : "All clear"} deltaType={criticalCount > 0 ? "negative" : "positive"} <KPICard title="SKUs Below 60" value={String(criticalCount)} delta={criticalCount > 0 ? "Immediate action needed" : "All clear"} deltaType={criticalCount > 0 ? "negative" : "positive"} sub="Critical — poor content directly impacts conversion rate" accentColor="bg-sw-red" delay={0.05} /> accentColor="bg-sw-red" delay={0.05} />
          <KPICard title="Competitor Content Stronger" value={String(competitorStronger)} delta="vs your listing" deltaType="negative" <KPICard title="Competitor Content Stronger" value={String(competitorStronger)} delta="vs your listing" deltaType="negative" sub="Risk — competitors investing in A+ content aggressively" accentColor="bg-sw-amber" delay={0.1} /> accentColor="bg-sw-amber" delay={0.1} />
          <LastAuditKPI />
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <FilterDropdown label="Platform" value={platformFilter}
            options={[{ label: "All platforms", value: "All" }, { label: "Blinkit", value: "Blinkit" }, { label: "Zepto", value: "Zepto" }, { label: "Swiggy Instamart", value: "Swiggy Instamart" }, { label: "Amazon", value: "Amazon" }, { label: "Flipkart", value: "Flipkart" }]}
            onChange={setPlatformFilter} />
          <FilterDropdown label="Score range" value={scoreFilter}
            options={[{ label: "All scores", value: "All" }, { label: "Critical (0–59)", value: "Critical" }, { label: "Needs work (60–79)", value: "NeedsWork" }, { label: "Strong (80–100)", value: "Strong" }]}
            onChange={setScoreFilter} />
          <FilterDropdown label="Category" value={categoryFilter}
            options={categories.map(c => ({ label: c === "All" ? "All categories" : c, value: c }))} onChange={setCategoryFilter} />
          <FilterDropdown label="Compare with competitor" value={compareCompetitor}
            options={[{ label: "None", value: "None" }, ...competitors.map(c => ({ label: c, value: c }))]} onChange={setCompareCompetitor} />
          <FilterDropdown label="Sort by" value={sortBy}
            options={[
              { label: "Overall score (asc)", value: "score_asc" }, { label: "Overall score (desc)", value: "score_desc" },
              { label: "Title", value: "title_desc" }, { label: "Hero image", value: "heroImage_desc" },
              { label: "Search listing", value: "searchListing_desc" }, { label: "Availability", value: "availability_desc" },
              { label: "Last updated (newest)", value: "lastUpdated_desc" }, { label: "Last updated (oldest)", value: "lastUpdated_asc" },
            ]} onChange={setSortBy} />
        </div>

        {/* Comparison banner */}
        {isComparing && (
          <div className="rounded-lg px-4 py-3 flex items-center justify-between" style={{ backgroundColor: "rgba(79,127,255,0.08)", borderLeft: "3px solid #4F7FFF" }}>
            <div>
              <p className="text-[13px] font-medium" style={{ color: "hsl(220,20%,15%)" }}>Comparing your content scores against {compareCompetitor}</p>
              <p className="text-[11px]" style={{ color: "hsl(220,10%,46%)" }}>Comparison columns shown in table. Your score / Their score.</p>
            </div>
            <button onClick={() => setCompareCompetitor("None")} className="flex items-center gap-1 text-[11px]" style={{ color: "#4F7FFF" }}>
              Clear comparison <X size={12} />
            </button>
          </div>
        )}

        {/* Content Quality Scores — SKU Performance Table */}
        <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">SKU Content Performance</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Content scores with impression impact and stakeholder alerts</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2.5 px-3 font-normal">SKU</th>
                  <th className="text-right py-2.5 px-2 font-normal">Score</th>
                  <th className="text-center py-2.5 px-2 font-normal">Title</th>
                  <th className="text-center py-2.5 px-2 font-normal">Hero Img</th>
                  <th className="text-center py-2.5 px-2 font-normal">Search</th>
                  <th className="text-center py-2.5 px-2 font-normal">Price Parity</th>
                  <th className="text-center py-2.5 px-2 font-normal">Availability</th>
                  <th className="text-center py-2.5 px-2 font-normal">Imp. Change (14d)</th>
                  
                  <th className="text-right py-2.5 px-2 font-normal">Days Since Update</th>
                  <th className="text-center py-2.5 px-2 font-normal">Alert</th>
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
                      <td className="py-2.5 px-2 text-center"><DimCell yours={s.title} /></td>
                      <td className="py-2.5 px-2 text-center"><DimCell yours={s.heroImage} /></td>
                      <td className="py-2.5 px-2 text-center"><DimCell yours={s.searchListing} /></td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
                          s.priceParity === "match" ? "bg-sw-green-dim text-sw-green" :
                          s.priceParity === "below" ? "bg-primary/15 text-primary" :
                          "bg-sw-red/15 text-sw-red"
                        }`}>
                          {s.priceParity === "match" ? "✓ Match" : s.priceParity === "below" ? "↓ Below" : "↑ Above"}
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        <span className={`font-mono text-[10px] ${s.availability >= 90 ? "text-sw-green" : s.availability >= 70 ? "text-sw-amber" : "text-sw-red"}`}>
                          {s.availability}%
                        </span>
                      </td>
                      <td className="py-2.5 px-2 text-center">
                        {(() => {
                          const impChange = overall >= 80 ? Math.round(Math.random() * 8 + 2) : overall >= 60 ? Math.round(Math.random() * 6 - 3) : -Math.round(Math.random() * 12 + 3);
                          return (
                            <span className={`font-mono text-[10px] font-bold ${impChange > 0 ? "text-sw-green" : impChange < 0 ? "text-sw-red" : "text-muted-foreground"}`}>
                              {impChange > 0 ? "+" : ""}{impChange}%
                            </span>
                          );
                        })()}
                      </td>
                      <td className="py-2.5 px-2 text-right text-muted-foreground text-[10px] font-mono">{Math.round((Date.now() - new Date(`2026-${s.lastUpdated.replace("Mar ", "03-")}`).getTime()) / (1000 * 60 * 60 * 24))}d ago</td>
                      <td className="py-2.5 px-2 text-center">
                        {overall < 70 && (
                          <button onClick={() => {
                            const dims = [];
                            if (s.title < 14) dims.push("Title");
                            if (s.heroImage < 14) dims.push("Hero Image");
                            if (s.searchListing < 12) dims.push("Search Listing");
                            const aiContent = dims.map(d => `${d}: ${d === "Title" ? (titleIssues[s.sku]?.suggested || "Optimize title with category keywords") : d === "Hero Image" ? "Use high-res product-focused image with size callout" : "Add backend keywords and optimize bullet points"}`).join("\n");
                            const alertMsg = `Content Alert — ${s.sku}\nScore: ${overall}/100\nIssues: ${dims.join(", ")}\n\nAI Recommendations:\n${aiContent}`;
                            navigator.clipboard.writeText(alertMsg);
                            handleFlag(s.sku);
                          }} className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-sw-amber/15 text-sw-amber hover:bg-sw-amber/25 flex items-center gap-0.5 mx-auto">
                            <AlertTriangle size={8} /> Alert
                          </button>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button onClick={() => navigateToSkuDetail(s)} className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${overall < 60 ? "bg-sw-red/20 text-sw-red" : overall < 80 ? "bg-sw-amber/20 text-sw-amber" : "border border-subtle text-muted-foreground"}`}>
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

        {/* Cross-Platform Consistency Visual */}
        <PanelCard title="Cross-Platform Content Consistency" badge="Consistency check" badgeColor="amber" delay={0.3}>
          <p className="text-[10px] text-muted-foreground mb-3">If a product has a good content score on one platform, it should be replicated across all. Large gaps indicate inconsistency issues.</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-subtle">
                <th className="text-left py-2 font-normal">SKU</th>
                <th className="text-center py-2 font-normal">Amazon</th>
                <th className="text-center py-2 font-normal">Flipkart</th>
                <th className="text-center py-2 font-normal">Blinkit</th>
                <th className="text-center py-2 font-normal">Zepto</th>
                <th className="text-center py-2 font-normal">Instamart</th>
                <th className="text-center py-2 font-normal">Gap</th>
                <th className="text-center py-2 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {crossPlatformData.map((row, i) => (
                <tr key={row.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-2.5 text-foreground text-[11px] max-w-[130px] truncate">{row.sku}</td>
                  {[row.amazon, row.flipkart, row.blinkit, row.zepto, row.instamart].map((score, j) => (
                    <td key={j} className="py-2.5 text-center">
                      <span className="font-mono text-[10px]" style={{ color: scoreColor(score) }}>{score}</span>
                    </td>
                  ))}
                  <td className="py-2.5 text-center">
                    <span className={`font-mono text-[10px] font-bold ${row.gap > 20 ? "text-sw-red" : row.gap > 10 ? "text-sw-amber" : "text-sw-green"}`}>
                      {row.gap}pt
                    </span>
                  </td>
                  <td className="py-2.5 text-center">
                    {row.issue ? (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-red/15 text-sw-red">Inconsistent</span>
                    ) : (
                      <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-green-dim text-sw-green">Consistent</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-3 p-3 rounded-xl bg-sw-amber/5 border border-sw-amber/20">
            <p className="text-[10px] text-foreground flex items-center gap-1.5">
              <AlertTriangle size={11} className="text-sw-amber" />
              {crossPlatformData.filter(r => r.issue).length} SKUs have inconsistent content across platforms. Best practice: replicate the highest-scoring platform's content everywhere.
            </p>
          </div>
        </PanelCard>

        {/* Category Benchmark + Campaign Performance */}
        <PanelCard title="Category Benchmark & Campaign Performance" badge="Content vs Performance" badgeColor="purple" delay={0.35}>
          <p className="text-[10px] text-muted-foreground mb-3">Your content score vs category average and like-for-like competitors. Campaign performance shown alongside to correlate content quality with ad efficiency.</p>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground border-b border-subtle">
                <th className="text-left py-2 font-normal">SKU</th>
                <th className="text-center py-2 font-normal">Your Score</th>
                <th className="text-center py-2 font-normal">Cat. Avg</th>
                <th className="text-center py-2 font-normal">Comp. Avg</th>
                <th className="text-center py-2 font-normal">vs Category</th>
                <th className="text-left py-2 font-normal">Campaign</th>
                <th className="text-center py-2 font-normal">ROAS</th>
                <th className="text-center py-2 font-normal">Status</th>
                <th className="text-right py-2 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {benchmarkData.map((row, i) => {
                const vsCat = row.yourScore - row.categoryAvg;
                const vsComp = row.yourScore - row.compAvg;
                return (
                  <tr key={row.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 text-foreground text-[11px] max-w-[140px] truncate">{row.sku}</td>
                    <td className="py-2.5 text-center">
                      <span className="font-mono text-[11px] font-bold" style={{ color: scoreColor(row.yourScore) }}>{row.yourScore}</span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-[10px] text-muted-foreground">{row.categoryAvg}</td>
                    <td className="py-2.5 text-center font-mono text-[10px] text-muted-foreground">{row.compAvg}</td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono text-[10px] font-bold ${vsCat > 0 ? "text-sw-green" : vsCat < 0 ? "text-sw-red" : "text-muted-foreground"}`}>
                        {vsCat > 0 ? "+" : ""}{vsCat}
                      </span>
                    </td>
                    <td className="py-2.5 text-[10px] text-foreground">
                      <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${row.campaignActive ? "bg-sw-green" : "bg-muted-foreground"}`} />
                        {row.campaign}
                      </span>
                    </td>
                    <td className="py-2.5 text-center font-mono text-[10px]" style={{ color: row.roas !== "—" && parseFloat(row.roas) >= 4 ? "#2ECF8E" : row.roas !== "—" && parseFloat(row.roas) >= 2.5 ? "#F5A623" : "#FF5C5C" }}>
                      {row.roas}
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${
                        row.campaignStatus === "Excellent" || row.campaignStatus === "Strong" ? "bg-sw-green-dim text-sw-green" :
                        row.campaignStatus === "Underperforming" ? "bg-sw-amber/15 text-sw-amber" :
                        row.campaignStatus === "Paused" ? "bg-surface-3 text-muted-foreground" :
                        "bg-sw-red/15 text-sw-red"
                      }`}>{row.campaignStatus}</span>
                    </td>
                    <td className="py-2.5 text-right">
                      {row.yourScore < row.categoryAvg ? (
                        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "content-fix", params: { sku: row.sku } })}
                          className="text-[10px] font-medium px-2 py-1 rounded-lg bg-sw-red/15 text-sw-red">
                          Fix content →
                        </button>
                      ) : !row.campaignActive ? (
                        <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "launch-campaign", params: { sku: row.sku } })}
                          className="text-[10px] font-medium px-2 py-1 rounded-lg bg-primary/15 text-primary">
                          Launch campaign →
                        </button>
                      ) : (
                        <span className="text-[10px] font-mono text-sw-green">✓ Optimised</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="mt-3 p-3 rounded-xl bg-sw-purple-dim/30 border border-sw-purple/20">
            <p className="text-[10px] text-foreground">
              💡 SKUs with content score below category average show 40% lower ROAS on average. Fix content before increasing ad spend.
            </p>
          </div>
        </PanelCard>
      </>) : (
        <div className="space-y-5">
          {/* Score distribution — improved colors */}
          <PanelCard title="Score Distribution" badge="All SKUs" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={scoreBuckets}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="bucket" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} name="SKUs">
                  {scoreBuckets.map((_, index) => {
                    const mid = index * 10 + 5;
                    const fill = mid < 30 ? "#EF4444" : mid < 60 ? "#F97316" : mid < 80 ? "#EAB308" : "#22C55E";
                    return <rect key={index} fill={fill} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-3 mt-2 text-[9px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#EF4444" }} /> 0-29 Critical</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#F97316" }} /> 30-59 Poor</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#EAB308" }} /> 60-79 Fair</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#22C55E" }} /> 80+ Strong</span>
            </div>
          </PanelCard>

          {/* Competitor content aggression — moved up to second position */}
          <PanelCard title="Content Change Activity in Your Category" badge="Last 7 days" badgeColor="red" delay={0.1}>
            <p className="text-[10px] text-muted-foreground mb-3">Tracks how frequently competitors are updating titles, images, and listings.</p>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Competitor</th>
                  <th className="text-right py-2 font-normal">Changes</th>
                  <th className="text-center py-2 font-normal">Level</th>
                  <th className="text-left py-2 font-normal">What</th>
                  <th className="text-left py-2 font-normal">Keywords Added</th>
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
                    <td className="py-2.5">
                      <div className="flex gap-1">{c.keywords.map(kw => <span key={kw} className="font-mono text-[8px] px-1 py-0.5 rounded bg-sw-red/10 text-sw-red font-bold">{kw}</span>)}</div>
                    </td>
                    <td className="py-2.5 text-right font-mono text-sw-red">{c.impact}</td>
                    <td className="py-2.5 text-right">
                      <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "competitor-content", params: { competitor: c.brand } })} className="text-[10px] font-medium" style={{ color: "#4F7FFF" }}>Respond →</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>

          {/* Dimension breakdown with brand heatmap toggle */}
          <PanelCard title="Dimension Breakdown" badge="Avg across catalogue" badgeColor="purple" delay={0.15}>
            {(() => {
              const brandOptions = ["You", ...competitors];
              const heatmapDims = dimensions;
              const heatmapSkus = skuData.map(s => s.sku);
              return (
                <>
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-[10px] text-muted-foreground">Compare brand:</span>
                    {brandOptions.map(b => (
                      <button key={b} onClick={() => setHeatmapBrand(b)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${heatmapBrand === b ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                        {b}
                      </button>
                    ))}
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-muted-foreground border-b border-subtle">
                          <th className="text-left py-2 font-normal">SKU</th>
                          {heatmapDims.map(d => <th key={d} className="text-center py-2 font-normal text-[9px]">{d}</th>)}
                          <th className="text-center py-2 font-normal">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {skuData.map((s, i) => {
                          const dims = heatmapBrand === "You"
                            ? [s.title, s.heroImage, s.searchListing, s.pageContent, s.competitorAggression]
                            : (() => { const cd = competitorScores[heatmapBrand]?.[s.id]; return cd ? [cd.title, cd.heroImage, cd.searchListing, cd.pageContent, cd.competitorAggression] : [0, 0, 0, 0, 0]; })();
                          const total = dims.reduce((a, b) => a + b, 0);
                          return (
                            <tr key={s.sku} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                              <td className="py-2 text-foreground text-[10px] truncate max-w-[120px]">{s.sku}</td>
                              {dims.map((v, j) => (
                                <td key={j} className="py-2 text-center">
                                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded" style={{
                                    backgroundColor: `${dimColor(v)}15`,
                                    color: dimColor(v),
                                  }}>{v}</span>
                                </td>
                              ))}
                              <td className="py-2 text-center">
                                <span className="font-mono text-[10px] font-bold" style={{ color: scoreColor(total) }}>{total}</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </>
              );
            })()}
          </PanelCard>

          {/* Title quality - with auto-generate toggle */}
          <PanelCard title="Title Quality Detail" badge="Per SKU" badgeColor="amber" delay={0.2}>
            {(() => {
              return (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] text-muted-foreground">Auto-generate optimised titles</span>
                    <button onClick={() => setAutoGen(!autoGen)}
                      className={`relative w-11 h-6 rounded-full transition-colors ${autoGen ? "bg-primary" : "bg-surface-3"}`}>
                      <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${autoGen ? "translate-x-[22px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {autoGen && (
                    <div className="mb-3 p-2 rounded-lg bg-sw-green/10 border border-sw-green/20 text-[10px] text-sw-green">
                      ✓ Auto-generation enabled. AI will generate optimised titles for all SKUs below score threshold.
                    </div>
                  )}
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
                              <p className="text-[10px] text-muted-foreground mb-1">{autoGen ? "AI-generated title:" : "Suggested title:"}</p>
                              <p className="text-xs text-foreground font-mono bg-surface-3 rounded-lg p-2">{data.suggested}</p>
                              {autoGen ? (
                                <span className="text-[10px] text-sw-green mt-2 inline-block">✓ Will be auto-applied on next content sync</span>
                              ) : (
                                <button onClick={() => handleFlag(sku)} className="text-[10px] font-medium mt-2 inline-flex items-center gap-1" style={{ color: "#4F7FFF" }}>
                                  {copiedFlags[sku] ? <><Check size={10} /> Brief copied!</> : <><Copy size={10} /> Flag for content team →</>}
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              );
            })()}
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
        </div>
      )}
    </div>
  );
};

export default ContentAuditView;
