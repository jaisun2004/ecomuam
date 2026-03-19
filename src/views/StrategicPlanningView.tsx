import React, { useState, useEffect, useRef } from "react";
import { Send, CheckCircle2, AlertTriangle, XCircle, Check, X, Sparkles, Eye, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useGuardrails } from "@/contexts/GuardrailContext";

/* ─── Developer toggles ─── */
const sellerPortalConnected = true;
const hasStrategicHistory = false;

/* ─── Types ─── */
type Gear = "cold-start" | "gear1" | "gear2" | "gear3";
type ColdStartPhase = "choice" | "q1" | "q2" | "q3" | "q4" | "done";
type Gear2Turn = "idle" | "input" | "intent" | "sku" | "insights" | "validation" | "scenarios" | "confirm";
type ObservationType = "Anomaly" | "Tension" | "Assumption challenge";
type Message = { role: "user" | "copilot"; content: string; widget?: React.ReactNode };
type Scenario = {
  id: string; name: string; desc: string; blinkitSplit: string; zeptoSplit: string; roasRange: string; risk: string;
  cities: { name: string; blinkitBudget: string; zeptoBudget: string }[];
  keywords: string[];
  competitorKeywords: string[];
  estImpressions: string;
};
type Recommendation = { id: string; priority: "P1" | "P2" | "P3"; text: string; reason: string; status: "pending" | "approved" | "dismissed" };
type InsightTier = "plan-breaking" | "plan-informing";
type Insight = { id: string; tier: InsightTier; text: string; resolved: boolean; deferred: boolean };

interface Observation {
  id: string;
  type: ObservationType;
  title: string;
  detail: string;
  rendered: boolean;
  resolved: boolean;
}

interface BrandContext {
  posture: string;
  categoryBelief: string;
  historicalFrustration: string;
  currentHypothesis: string;
  sessionReasoning: string[];
}

/* ─── Mock data ─── */
const mockSkus = [
  { name: "Good Day Butter", platform: "Blinkit", rank: 8, clickShare: "Low" as const, roas: 2.1, targetRoas: 3.0, competitorSlots: 4, brandSlots: 1 },
  { name: "Good Day Butter", platform: "Zepto", rank: 5, clickShare: "Medium" as const, roas: 2.8, targetRoas: 3.0, competitorSlots: 3, brandSlots: 2 },
  { name: "NutriChoice Digestive", platform: "Blinkit", rank: 12, clickShare: "Low" as const, roas: 1.9, targetRoas: 2.5, competitorSlots: 5, brandSlots: 0 },
  { name: "NutriChoice Digestive", platform: "Zepto", rank: 7, clickShare: "Medium" as const, roas: 2.4, targetRoas: 2.5, competitorSlots: 3, brandSlots: 2 },
];

const initialObservations: Observation[] = [
  { id: "obs1", type: "Anomaly", title: "Good Day Butter ROAS on Zepto spiked 42% last week", detail: "Spend remained flat but conversion rate jumped — possibly a competitor stockout drove organic traffic into your paid funnel.", rendered: false, resolved: false },
  { id: "obs2", type: "Tension", title: "NutriChoice Digestive rank is rising on Zepto but ROAS is falling", detail: "Organic rank improved from #10 to #7 over 3 weeks, but paid ROAS dropped from 2.8x to 2.4x in the same period. Paid may be cannibalising organic.", rendered: false, resolved: false },
  { id: "obs3", type: "Assumption challenge", title: "Your brand context says 'growth mode' — but Blinkit ad spend efficiency has declined 3 weeks straight", detail: "If growth is the priority, the declining efficiency on your primary platform may need addressing before scaling.", rendered: false, resolved: false },
  { id: "obs4", type: "Tension", title: "Good Day Cashew search volume on Zepto growing 18% WoW but you have zero presence", detail: "Competitor X launched a sponsored campaign on this keyword 5 days ago and is capturing 60% of click share. This is a gap, not a trend — the window may close.", rendered: false, resolved: false },
];

const defaultHistoryContext: BrandContext = {
  posture: "Growth mode — expanding category share on quick commerce",
  categoryBelief: "Impulse snacking on Q-commerce is under-indexed vs offline; 10-min delivery unlocks unplanned purchases",
  historicalFrustration: "Scaled Blinkit spend 3x last quarter — ROAS dropped but market share didn't move proportionally",
  currentHypothesis: "Reallocate budget toward Zepto where efficiency is higher, use Blinkit for defense only",
  sessionReasoning: [],
};

const initialRecommendations: Recommendation[] = [
  { id: "r1", priority: "P1", text: "Shift 15% budget from Blinkit to Zepto — ROAS is 33% higher on Zepto for Good Day Butter.", reason: "Zepto ROAS trending up for 2 consecutive weeks.", status: "pending" },
  { id: "r2", priority: "P2", text: "Pause NutriChoice Digestive on Blinkit — rank stalled at 12 with declining CTR.", reason: "3-week rank stagnation with below-target ROAS.", status: "pending" },
  { id: "r3", priority: "P2", text: "Increase bid on Good Day Butter keyword 'butter cookies' on Zepto by 20%.", reason: "Click share can move from Medium to High at current CPC levels.", status: "pending" },
  { id: "r4", priority: "P3", text: "Test challenger SKU 'Good Day Cashew' on Zepto with ₹50K weekly budget.", reason: "Category search volume growing 18% WoW, no existing presence.", status: "pending" },
];

const defaultInsights: Insight[] = [
  { id: "ins1", tier: "plan-breaking", text: "NutriChoice Digestive ROAS on Blinkit is below pause threshold (1.9x vs 1.5x trigger). Allocating more budget here contradicts your own guardrails.", resolved: false, deferred: false },
  { id: "ins2", tier: "plan-informing", text: "Good Day Butter has 3 days of dark store stock remaining on Blinkit — scaling spend may waste budget on out-of-stock impressions.", resolved: false, deferred: false },
  { id: "ins3", tier: "plan-informing", text: "A new competitor brand entered top 5 sponsored slots on Zepto for 'digestive biscuits' last week.", resolved: false, deferred: false },
];

const scenarios: Scenario[] = [
  {
    id: "A", name: "Aggressive", risk: "High", roasRange: "2.8x – 4.2x",
    desc: "Concentrate spend on Zepto where ROAS is strongest. Maximum growth potential, higher single-platform risk.",
    blinkitSplit: "₹30L", zeptoSplit: "₹70L",
    cities: [
      { name: "Delhi NCR", blinkitBudget: "₹10L", zeptoBudget: "₹25L" },
      { name: "Mumbai", blinkitBudget: "₹10L", zeptoBudget: "₹25L" },
      { name: "Bengaluru", blinkitBudget: "₹10L", zeptoBudget: "₹20L" },
    ],
    keywords: ["butter cookies", "digestive biscuits", "healthy snacks", "tea time biscuits"],
    competitorKeywords: ["britannia cookies", "mcvities digestive", "parle cookies"],
    estImpressions: "18L – 24L weekly",
  },
  {
    id: "B", name: "Balanced", risk: "Medium", roasRange: "2.5x – 3.5x",
    desc: "Even split across platforms with proportional SKU allocation. Moderate risk, diversified presence.",
    blinkitSplit: "₹50L", zeptoSplit: "₹50L",
    cities: [
      { name: "Delhi NCR", blinkitBudget: "₹18L", zeptoBudget: "₹18L" },
      { name: "Mumbai", blinkitBudget: "₹16L", zeptoBudget: "₹16L" },
      { name: "Bengaluru", blinkitBudget: "₹16L", zeptoBudget: "₹16L" },
    ],
    keywords: ["butter cookies", "digestive biscuits", "healthy snacks"],
    competitorKeywords: ["britannia cookies", "mcvities digestive"],
    estImpressions: "14L – 20L weekly",
  },
  {
    id: "C", name: "Defensive", risk: "Low", roasRange: "2.2x – 2.9x",
    desc: "Maintain current efficiency on Blinkit, test challenger SKUs on Zepto with ring-fenced budget.",
    blinkitSplit: "₹55L", zeptoSplit: "₹45L",
    cities: [
      { name: "Delhi NCR", blinkitBudget: "₹20L", zeptoBudget: "₹15L" },
      { name: "Mumbai", blinkitBudget: "₹20L", zeptoBudget: "₹15L" },
      { name: "Bengaluru", blinkitBudget: "₹15L", zeptoBudget: "₹15L" },
    ],
    keywords: ["butter cookies", "digestive biscuits"],
    competitorKeywords: ["britannia cookies"],
    estImpressions: "10L – 15L weekly",
  },
];

/* ─── Typing indicator ─── */
const TypingIndicator = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    <div className="flex gap-1">
      {[0, 1, 2].map(i => (
        <span key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
      ))}
    </div>
    <span className="text-xs text-muted-foreground ml-2">Thinking…</span>
  </div>
);

/* ─── Observation type badge ─── */
const ObsTypeBadge = ({ type }: { type: ObservationType }) => {
  const config = {
    "Anomaly": { icon: <Zap size={10} />, cls: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30" },
    "Tension": { icon: <AlertTriangle size={10} />, cls: "bg-[hsl(var(--destructive))]/15 text-[hsl(var(--destructive))] border-[hsl(var(--destructive))]/30" },
    "Assumption challenge": { icon: <Eye size={10} />, cls: "bg-[hsl(var(--info))]/15 text-[hsl(var(--info))] border-[hsl(var(--info))]/30" },
  }[type];
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.cls}`}>
      {config.icon} {type}
    </span>
  );
};

/* ─── Insight card ─── */
const InsightCard = ({ insight, onAction }: { insight: Insight; onAction: (id: string, action: "resolve" | "defer" | "tell-more") => void }) => {
  const isBreaking = insight.tier === "plan-breaking";
  if (insight.resolved || insight.deferred) return null;
  return (
    <div className={`rounded-lg p-3 space-y-2 border ${isBreaking ? "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30" : "bg-surface-2 border-border-visible"}`}>
      <Badge variant={isBreaking ? "destructive" : "outline"} className="text-[10px]">
        {isBreaking ? "Plan-breaking" : "Plan-informing"}
      </Badge>
      <p className="text-xs text-foreground">{insight.text}</p>
      <div className="flex gap-2">
        <button onClick={() => onAction(insight.id, "resolve")} className="text-[11px] text-[hsl(var(--success))] hover:underline flex items-center gap-1"><Check size={11} /> I know this</button>
        <button onClick={() => onAction(insight.id, "tell-more")} className="text-[11px] text-primary hover:underline">Tell me more</button>
        {!isBreaking && (
          <button onClick={() => onAction(insight.id, "defer")} className="text-[11px] text-muted-foreground hover:underline">Resolve later</button>
        )}
      </div>
    </div>
  );
};

/* ─── Validation cards ─── */
const ValidationCards = () => {
  const primary = mockSkus[0];
  const avgRoas = mockSkus.reduce((a, s) => a + s.roas, 0) / mockSkus.length;
  const avgTarget = mockSkus.reduce((a, s) => a + s.targetRoas, 0) / mockSkus.length;
  const gap = avgTarget - avgRoas;
  const maxComp = Math.max(...mockSkus.map(s => s.competitorSlots));
  const brandSlots = Math.max(...mockSkus.map(s => s.brandSlots));
  const pressure = maxComp > 3 ? "High" : maxComp > 2 ? "Medium" : "Low";
  const signals = [gap > 0.8 ? 1 : 0, primary.rank > 10 ? 1 : 0, maxComp >= 4 ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3 my-2">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-border-visible rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Organic Rank Signal</p>
          <p className="text-sm text-foreground">Rank #{primary.rank} · {primary.clickShare} click share</p>
        </div>
        <div className="bg-surface-2 border border-border-visible rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Paid Efficiency Gap</p>
          <p className="text-sm text-foreground">Current {avgRoas.toFixed(1)}x vs Target {avgTarget.toFixed(1)}x · <span className={gap > 0 ? "text-destructive" : "text-[hsl(var(--success))]"}>{gap > 0 ? `Gap -${gap.toFixed(1)}x` : "On target"}</span></p>
        </div>
        <div className="bg-surface-2 border border-border-visible rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Competitive Shelf</p>
          <p className="text-sm text-foreground">{maxComp} competitors vs {brandSlots} brand slots · {pressure} pressure</p>
        </div>
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        signals === 0 ? "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]" :
        signals === 1 ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]" :
        "bg-destructive/15 text-destructive"
      }`}>
        {signals === 0 ? <CheckCircle2 size={14} /> : signals === 1 ? <AlertTriangle size={14} /> : <XCircle size={14} />}
        {signals === 0 ? "Hypothesis valid — ready to generate scenarios." :
         signals === 1 ? "Proceed with caution — resolve flagged signal before scaling." :
         "Revise hypothesis — two or more signals contraindicate this plan."}
      </div>
    </div>
  );
};

/* ─── Detailed Action Plan after scenario selection ─── */
const ActionPlanDetail = ({ s }: { s: Scenario }) => {
  const campaignBreakdown = [
    { name: `GDB-BLK-MOR-WD`, sku: "Good Day Butter", platform: "Blinkit", city: "Delhi NCR", dayPart: "Morning", dayType: "Weekday", keywords: [{ kw: "butter cookies", bid: s.id === "A" ? "₹12" : s.id === "B" ? "₹10" : "₹8" }, { kw: "tea time biscuits", bid: s.id === "A" ? "₹9" : "₹7" }], budget: s.id === "A" ? "₹1.25L/wk" : s.id === "B" ? "₹1.5L/wk" : "₹1.8L/wk", estRoas: s.id === "A" ? "3.2x" : s.id === "B" ? "2.8x" : "2.4x", estImpr: "1.8L" },
    { name: `GDB-BLK-EVE-WD`, sku: "Good Day Butter", platform: "Blinkit", city: "Delhi NCR", dayPart: "Evening", dayType: "Weekday", keywords: [{ kw: "butter cookies", bid: s.id === "A" ? "₹14" : "₹11" }, { kw: "evening snacks", bid: "₹11" }], budget: s.id === "A" ? "₹1.5L/wk" : "₹1.2L/wk", estRoas: s.id === "A" ? "3.5x" : "2.9x", estImpr: "2.1L" },
    { name: `GDB-ZEP-MOR-WD`, sku: "Good Day Butter", platform: "Zepto", city: "Mumbai", dayPart: "Morning", dayType: "Weekday", keywords: [{ kw: "butter cookies", bid: "₹10" }, { kw: "britannia cookies", bid: "₹13" }], budget: s.id === "A" ? "₹2.5L/wk" : s.id === "B" ? "₹1.8L/wk" : "₹1.5L/wk", estRoas: s.id === "A" ? "4.0x" : "3.2x", estImpr: "3.2L" },
    { name: `GDB-ZEP-EVE-WE`, sku: "Good Day Butter", platform: "Zepto", city: "Mumbai", dayPart: "Evening", dayType: "Weekend", keywords: [{ kw: "sunfeast cookies", bid: "₹16" }, { kw: "parle cookies", bid: "₹14" }], budget: s.id === "A" ? "₹2L/wk" : "₹1.2L/wk", estRoas: s.id === "A" ? "2.8x" : "2.5x", estImpr: "2.0L" },
    { name: `NCD-BLK-MOR-WD`, sku: "NutriChoice Digestive", platform: "Blinkit", city: "Bengaluru", dayPart: "Morning", dayType: "Weekday", keywords: [{ kw: "digestive biscuits", bid: "₹9" }, { kw: "healthy snacks", bid: "₹7" }], budget: s.id === "A" ? "₹1L/wk" : "₹1.2L/wk", estRoas: "2.9x", estImpr: "1.4L" },
    { name: `NCD-ZEP-EVE-WE`, sku: "NutriChoice Digestive", platform: "Zepto", city: "Bengaluru", dayPart: "Evening", dayType: "Weekend", keywords: [{ kw: "digestive biscuits", bid: "₹11" }, { kw: "mcvities digestive", bid: "₹12" }], budget: s.id === "A" ? "₹1.75L/wk" : "₹1.3L/wk", estRoas: "3.4x", estImpr: "2.2L" },
  ];

  return (
    <div className="space-y-4 mt-3">
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3">
        <p className="text-xs font-semibold text-foreground mb-2">Action Plan — Scenario {s.id}: {s.name}</p>
        <div className="grid grid-cols-4 gap-3 text-[11px]">
          <div><span className="text-muted-foreground">Campaigns:</span> <span className="text-foreground font-medium">{campaignBreakdown.length}</span></div>
          <div><span className="text-muted-foreground">SKUs:</span> <span className="text-foreground font-medium">2</span></div>
          <div><span className="text-muted-foreground">Cities:</span> <span className="text-foreground font-medium">{s.cities.length}</span></div>
          <div><span className="text-muted-foreground">Est. ROAS:</span> <span className="text-foreground font-medium">{s.roasRange}</span></div>
        </div>
      </div>

      {/* City targeting */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">City Targeting</p>
        <div className="overflow-auto rounded border border-border-visible">
          <table className="w-full text-[11px]">
            <thead><tr className="bg-surface-3 text-muted-foreground">
              <th className="px-2 py-1 text-left">City</th>
              <th className="px-2 py-1 text-right">Blinkit ₹</th>
              <th className="px-2 py-1 text-right">Zepto ₹</th>
            </tr></thead>
            <tbody className="text-foreground">
              {s.cities.map(c => (
                <tr key={c.name} className="border-t border-border-visible">
                  <td className="px-2 py-1">{c.name}</td>
                  <td className="px-2 py-1 text-right">{c.blinkitBudget}</td>
                  <td className="px-2 py-1 text-right">{c.zeptoBudget}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign breakdown */}
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Campaign Breakdown</p>
        <div className="space-y-2">
          {campaignBreakdown.map((c, i) => (
            <div key={i} className="bg-surface-2 border border-border-visible rounded-lg p-2.5 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-foreground">{c.name}</span>
                <div className="flex gap-1">
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.dayPart === "Morning" ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]" : "bg-primary/15 text-primary"}`}>{c.dayPart}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.dayType === "Weekday" ? "bg-surface-3 text-foreground" : "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"}`}>{c.dayType}</span>
                </div>
              </div>
              <div className="grid grid-cols-5 gap-1 text-[10px]">
                <div><span className="text-muted-foreground">SKU:</span> <span className="text-foreground">{c.sku}</span></div>
                <div><span className="text-muted-foreground">Platform:</span> <span className="text-foreground">{c.platform}</span></div>
                <div><span className="text-muted-foreground">City:</span> <span className="text-foreground">{c.city}</span></div>
                <div><span className="text-muted-foreground">ROAS:</span> <span className="text-foreground">{c.estRoas}</span></div>
                <div><span className="text-muted-foreground">Impr:</span> <span className="text-foreground">{c.estImpr}</span></div>
              </div>
              <div className="flex flex-wrap gap-1">
                {c.keywords.map((k, j) => (
                  <span key={j} className="text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{k.kw} · {k.bid}</span>
                ))}
              </div>
              <div className="text-[10px] text-muted-foreground">Budget: {c.budget}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Keywords summary */}
      <div className="flex flex-wrap gap-3">
        <div className="flex-1 min-w-[140px]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Target Keywords</p>
          <div className="flex flex-wrap gap-1">
            {s.keywords.map(k => <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{k}</span>)}
          </div>
        </div>
        <div className="flex-1 min-w-[140px]">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Competitor Keywords</p>
          <div className="flex flex-wrap gap-1">
            {s.competitorKeywords.map(k => <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-destructive/10 text-destructive">{k}</span>)}
          </div>
        </div>
      </div>

      {/* Estimated totals */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-border-visible rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">Blinkit</p>
          <p className="text-sm font-semibold text-foreground">{s.blinkitSplit}</p>
        </div>
        <div className="bg-surface-2 border border-border-visible rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">Zepto</p>
          <p className="text-sm font-semibold text-foreground">{s.zeptoSplit}</p>
        </div>
        <div className="bg-surface-2 border border-border-visible rounded-lg p-2.5 text-center">
          <p className="text-[10px] text-muted-foreground">Est. Impressions</p>
          <p className="text-sm font-semibold text-foreground">{s.estImpressions}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── Scenario card ─── */
const ScenarioCard = ({ s, onSelect, selected }: { s: Scenario; onSelect: () => void; selected: boolean }) => (
  <div className={`bg-surface-2 border rounded-lg p-4 space-y-3 transition-colors ${selected ? "border-primary" : "border-border-visible"}`}>
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold text-foreground">Scenario {s.id}: {s.name}</h4>
      <Badge variant={s.risk === "High" ? "destructive" : s.risk === "Medium" ? "secondary" : "outline"} className="text-[10px]">{s.risk} risk</Badge>
    </div>
    <p className="text-xs text-muted-foreground">{s.desc}</p>

    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-foreground">
      <span>Blinkit: {s.blinkitSplit}</span>
      <span>Zepto: {s.zeptoSplit}</span>
      <span>Projected ROAS: {s.roasRange}</span>
      <span>Est. Impressions: {s.estImpressions}</span>
    </div>

    {!selected && (
      <button onClick={onSelect} className="mt-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
        Select this scenario →
      </button>
    )}

    {selected && <ActionPlanDetail s={s} />}
  </div>
);

/* ─── Scenario Selector (stateful wrapper) ─── */
const ScenarioSelector = ({ scenarios, onSelect }: { scenarios: Scenario[]; onSelect: (s: Scenario) => void }) => {
  const [selected, setSelected] = useState<string | null>(null);
  return (
    <div className="space-y-3 mt-2">
      {scenarios.map(s => (
        <ScenarioCard key={s.id} s={s} selected={selected === s.id} onSelect={() => { setSelected(s.id); onSelect(s); }} />
      ))}
    </div>
  );
};


const ExecutionPlan = ({ scenario, userGoal, userSkus, confidence }: { scenario: Scenario; userGoal: string; userSkus: string; confidence: number }) => {
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false]);
  const toggleCheck = (i: number) => setChecklist(prev => { const n = [...prev]; n[i] = !n[i]; return n; });

  return (
    <div className="space-y-6">
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-foreground flex items-center justify-between">
        <span><strong>Approved plan</strong> · {userGoal} · {userSkus} · Scenario {scenario.id} ({scenario.name})</span>
        <span className="font-semibold">Confidence {confidence}%</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* LEFT: Paid campaign track */}
        <div className="space-y-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Paid Campaign Track</h3>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">A. Campaign Structure</h4>
            <div className="overflow-auto rounded-lg border border-border-visible">
              <table className="w-full text-xs">
                <thead><tr className="bg-surface-2 text-muted-foreground">
                  <th className="px-3 py-2 text-left">#</th><th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-left">Platform</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Targeting</th><th className="px-3 py-2 text-right">Weekly ₹</th><th className="px-3 py-2 text-left">Owner</th>
                </tr></thead>
                <tbody className="text-foreground">
                  {[
                    { sku: "Good Day Butter", plat: "Blinkit", type: "Sponsored Product", tgt: "Keyword", budget: scenario.id === "A" ? "₹3,75,000 (Blinkit)" : scenario.id === "B" ? "₹6,25,000 (Blinkit)" : "₹6,87,500 (Blinkit)" },
                    { sku: "Good Day Butter", plat: "Zepto", type: "Sponsored Product", tgt: "Keyword", budget: scenario.id === "A" ? "₹8,75,000 (Zepto)" : scenario.id === "B" ? "₹6,25,000 (Zepto)" : "₹5,62,500 (Zepto)" },
                    { sku: "NutriChoice Digestive", plat: "Blinkit", type: "Sponsored Brand", tgt: "Category", budget: scenario.id === "A" ? "₹3,75,000 (Blinkit)" : scenario.id === "B" ? "₹6,25,000 (Blinkit)" : "₹6,87,500 (Blinkit)" },
                    { sku: "NutriChoice Digestive", plat: "Zepto", type: "Sponsored Brand", tgt: "Category", budget: scenario.id === "A" ? "₹8,75,000 (Zepto)" : scenario.id === "B" ? "₹6,25,000 (Zepto)" : "₹5,62,500 (Zepto)" },
                  ].map((r, i) => (
                    <tr key={i} className="border-t border-border-visible">
                      <td className="px-3 py-2 text-muted-foreground">{i + 1}</td>
                      <td className="px-3 py-2">{r.sku}</td><td className="px-3 py-2">{r.plat}</td><td className="px-3 py-2">{r.type}</td><td className="px-3 py-2">{r.tgt}</td><td className="px-3 py-2 text-right">{r.budget}</td><td className="px-3 py-2">Account Manager</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">B. ROAS Targets & Triggers</h4>
            <div className="overflow-auto rounded-lg border border-border-visible">
              <table className="w-full text-xs">
                <thead><tr className="bg-surface-2 text-muted-foreground">
                  <th className="px-3 py-2 text-left">Platform</th><th className="px-3 py-2 text-right">Current ROAS</th><th className="px-3 py-2 text-right">Target ROAS</th><th className="px-3 py-2 text-left">Scale Trigger</th><th className="px-3 py-2 text-left">Pause Trigger</th>
                </tr></thead>
                <tbody className="text-foreground">
                  <tr className="border-t border-border-visible"><td className="px-3 py-2">Blinkit</td><td className="px-3 py-2 text-right">2.0x</td><td className="px-3 py-2 text-right">3.0x</td><td className="px-3 py-2 text-muted-foreground">Scale 20% if ROAS exceeds target for 3 consecutive days</td><td className="px-3 py-2 text-muted-foreground">Pause if ROAS falls below 1.5x for 3 consecutive days</td></tr>
                  <tr className="border-t border-border-visible"><td className="px-3 py-2">Zepto</td><td className="px-3 py-2 text-right">2.6x</td><td className="px-3 py-2 text-right">3.0x</td><td className="px-3 py-2 text-muted-foreground">Scale 20% if ROAS exceeds target for 3 consecutive days</td><td className="px-3 py-2 text-muted-foreground">Pause if ROAS falls below 1.5x for 3 consecutive days</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">C. Weekly Optimisation Checklist <span className="text-muted-foreground font-normal">(Monday)</span></h4>
            <div className="space-y-2">
              {[
                "1. Review ROAS vs target per campaign — data auto-pulled",
                "2. Review competitive sponsored slot count for primary keywords",
                "3. Confirm campaigns are pacing against weekly allocation",
                ...(sellerPortalConnected ? [
                  "4. Review dark store inventory for advertised SKUs",
                  "5. Flag SKUs with less than 3 days stock and reduce bids",
                ] : []),
              ].map((task, i) => (
                <label key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-2 cursor-pointer transition-colors">
                  <Checkbox checked={checklist[i]} onCheckedChange={() => toggleCheck(i)} />
                  <span className={`text-xs ${checklist[i] ? "line-through text-muted-foreground" : "text-foreground"}`}>{task}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT: Organic rank track */}
        <div className="space-y-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Organic Rank Track</h3>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">A. Rank Movement Tracker</h4>
            <div className="overflow-auto rounded-lg border border-border-visible">
              <table className="w-full text-xs">
                <thead><tr className="bg-surface-2 text-muted-foreground">
                  <th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-left">Platform</th><th className="px-3 py-2 text-right">Current</th><th className="px-3 py-2 text-right">Target</th><th className="px-3 py-2 text-right">Est. Weeks</th><th className="px-3 py-2 text-left">Status</th>
                </tr></thead>
                <tbody className="text-foreground">
                  {[
                    { sku: "Good Day Butter", plat: "Blinkit", cur: 8, tgt: 3, weeks: 6, status: "At risk" },
                    { sku: "Good Day Butter", plat: "Zepto", cur: 5, tgt: 3, weeks: 3, status: "On track" },
                    { sku: "NutriChoice Digestive", plat: "Blinkit", cur: 12, tgt: 5, weeks: 10, status: "Stalled" },
                    { sku: "NutriChoice Digestive", plat: "Zepto", cur: 7, tgt: 5, weeks: 4, status: "On track" },
                  ].map((r, i) => (
                    <tr key={i} className="border-t border-border-visible">
                      <td className="px-3 py-2">{r.sku}</td><td className="px-3 py-2">{r.plat}</td>
                      <td className="px-3 py-2 text-right">#{r.cur}</td><td className="px-3 py-2 text-right">#{r.tgt}</td>
                      <td className="px-3 py-2 text-right">{r.weeks}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] ${
                          r.status === "On track" ? "border-[hsl(var(--success))] text-[hsl(var(--success))]" :
                          r.status === "At risk" ? "border-[hsl(var(--warning))] text-[hsl(var(--warning))]" :
                          "border-destructive text-destructive"
                        }`}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-surface-2 border border-border-visible rounded-lg px-4 py-3 text-xs text-muted-foreground">
            <strong className="text-foreground/70">B. Content Dependency Note</strong><br />
            Content briefs are managed under the quarterly organic process. No budget is allocated here.
          </div>

          <div className="bg-surface-1 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">C. Paid–Organic Interaction Rule</p>
            <p className="text-xs text-foreground">Do not reduce paid spend on a SKU until organic rank is sustained at position 5 or above for a minimum of 2 consecutive weeks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Brand Context Card (right panel) ─── */
const BrandContextCard = ({ context, building }: { context: BrandContext | null; building?: boolean }) => {
  if (!context && !building) return null;
  if (building && !context) {
    return (
      <div className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
        <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Strategic Context — Session 1</h4>
        <p className="text-xs text-muted-foreground italic">Context building as we go</p>
      </div>
    );
  }
  if (!context) return null;
  return (
    <div className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Strategic Context — Session 1</h4>
      <div className="space-y-1.5 text-xs">
        {context.posture && <div><span className="text-muted-foreground">Posture:</span> <span className="text-foreground">{context.posture}</span></div>}
        {context.categoryBelief && <div><span className="text-muted-foreground">Category belief:</span> <span className="text-foreground">{context.categoryBelief}</span></div>}
        {context.historicalFrustration && <div><span className="text-muted-foreground">What didn't work:</span> <span className="text-foreground">{context.historicalFrustration}</span></div>}
        {context.currentHypothesis && <div><span className="text-muted-foreground">Today's focus:</span> <span className="text-foreground">{context.currentHypothesis}</span></div>}
      </div>
      {context.sessionReasoning.length > 0 && (
        <div className="pt-2 border-t border-border-visible">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Session Reasoning</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {context.sessionReasoning.map((r, i) => (
              <p key={i} className="text-[11px] text-foreground/70">"{r}"</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
const StrategicPlanningView: React.FC = () => {
  const g = useGuardrails();
  const [gear, setGear] = useState<Gear>(hasStrategicHistory ? "gear1" : "cold-start");
  const [coldPhase, setColdPhase] = useState<ColdStartPhase>("choice");
  const [fastTrack, setFastTrack] = useState(false);
  const [gear2Turn, setGear2Turn] = useState<Gear2Turn>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [brandContext, setBrandContext] = useState<BrandContext | null>(hasStrategicHistory ? defaultHistoryContext : null);
  const [observations, setObservations] = useState<Observation[]>(initialObservations.map(o => ({ ...o })));
  const currentObsIndexRef = useRef(0);
  const [gear1Done, setGear1Done] = useState(false);
  const showBonusObsRef = useRef(false);
  const [insights, setInsights] = useState<Insight[]>(defaultInsights.map(i => ({ ...i })));
  const [confidence, setConfidence] = useState(100);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [userGoal, setUserGoal] = useState("");
  const [userSkus, setUserSkus] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const initRef = useRef(false);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  /* ─── Helpers ─── */
  const addCopilotMsg = (content: string, widget?: React.ReactNode, delay = 1200) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "copilot", content, widget }]);
    }, delay);
  };

  const addUserMsg = (content: string) => {
    setMessages(prev => [...prev, { role: "user", content }]);
  };

  const addToReasoning = (text: string) => {
    setBrandContext(prev => prev ? { ...prev, sessionReasoning: [...prev.sessionReasoning, text] } : prev);
  };

  const recalcConfidence = (ins: Insight[]) => {
    let score = 100;
    ins.forEach(i => {
      if (i.tier === "plan-breaking" && !i.resolved) score -= 15;
      if (i.tier === "plan-informing" && i.deferred) score -= 5;
    });
    setConfidence(Math.max(0, score));
  };

  /* ─── Cold start init ─── */
  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    if (hasStrategicHistory) {
      // Go straight to gear 1 observations
      showFirstObservation([]);
    } else {
      // Cold start — offer choice
      addCopilotMsg(
        "Before we dive in — do you want me to ask you a few quick questions to build context, or do you already have something specific in mind?\n\n\"Ask me questions\" — I'll walk you through four quick ones.\n\"I have something in mind\" — we'll jump straight in.",
        undefined, 800
      );
    }
  }, []);

  /* ─── Observation card (rendered inline) ─── */
  const ObservationCardInline = ({ obs }: { obs: Observation }) => (
    <div className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
      <ObsTypeBadge type={obs.type} />
      <p className="text-sm font-medium text-foreground">{obs.title}</p>
      <p className="text-xs text-muted-foreground">{obs.detail}</p>
      {!obs.resolved && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => handleObsAction(obs.id, "know")} className="text-[11px] px-2.5 py-1 rounded-md bg-surface-3 text-foreground hover:bg-muted transition-colors">I know this</button>
          <button onClick={() => handleObsAction(obs.id, "tell-more")} className="text-[11px] px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Tell me more</button>
          <button onClick={() => handleObsAction(obs.id, "surprise")} className="text-[11px] px-2.5 py-1 rounded-md bg-surface-3 text-muted-foreground hover:bg-muted transition-colors">Surprise me</button>
        </div>
      )}
    </div>
  );

  /* ─── Show first observation ─── */
  const showFirstObservation = (existingMsgs: Message[]) => {
    setGear("gear1");
    const obs = initialObservations[0];
    setObservations(prev => prev.map(o => o.id === obs.id ? { ...o, rendered: true } : o));
    currentObsIndexRef.current = 0;
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        role: "copilot",
        content: "I've been looking at the data. Here are a few things worth discussing before we start.",
        widget: <ObservationCardInline obs={obs} />
      }]);
    }, 1000);
  };

  /* ─── Handle observation actions ─── */
  const handleObsAction = (id: string, action: string) => {
    const obs = observations.find(o => o.id === id);
    if (!obs || obs.resolved) return;

    setObservations(prev => prev.map(o => o.id === id ? { ...o, resolved: true } : o));
    const nextIdx = currentObsIndexRef.current + 1;

    const getResponse = () => {
      if (action === "know") {
        addUserMsg(`I know this — "${obs.title}"`);
        addToReasoning(`Confirmed: ${obs.title}`);
        return null;
      }
      if (action === "tell-more") {
        addUserMsg(`Tell me more about "${obs.title}"`);
        addToReasoning(`Explored: ${obs.title}`);
        return obs.type === "Anomaly"
          ? "Looking deeper — the conversion rate spike correlates with a major competitor going OOS on 3 dark stores in South Delhi. This may be temporary. If it reverses, your ROAS will normalize. Consider locking in the gain with a 10% bid increase now."
          : obs.type === "Tension"
          ? "The rising organic rank suggests your content is working. But the falling paid ROAS means you may be bidding against yourself. Consider reducing bids by 15% on keywords where organic rank is top 5."
          : "The efficiency decline on Blinkit doesn't necessarily contradict growth — it could mean you've saturated easy wins. But scaling linearly will be wasteful.";
      }
      // surprise
      addUserMsg(`Surprise me on "${obs.title}"`);
      addToReasoning(`Copilot interpretation requested: ${obs.title}`);
      return obs.type === "Anomaly"
        ? "Here's my take — this ROAS spike is a gift, not a trend. The competitor will restock within days. Use this window to scale bids aggressively on Zepto. The cost of missing this window is higher than over-bidding for 48 hours."
        : obs.type === "Tension"
        ? "My read — this is good news disguised as a problem. Your organic rank is improving. The paid ROAS decline is a signal to start tapering paid spend, not a sign of failure."
        : "Counter-intuition — maybe Blinkit isn't a growth channel anymore, it's a defense channel. Use it to maintain shelf position while Zepto drives actual growth.";
    };

    const response = getResponse();

    const showNext = () => {
      // First 3 observations, then bonus 4th
      if (nextIdx < 3) {
        currentObsIndexRef.current = nextIdx;
        const nextObs = initialObservations[nextIdx];
        setObservations(prev => prev.map(o => o.id === nextObs.id ? { ...o, rendered: true } : o));
        addCopilotMsg(
          nextIdx === 1 ? "Noted. Here's the next observation:" : "And one more:",
          <ObservationCardInline obs={nextObs} />
        );
      } else if (nextIdx === 3 && !showBonusObsRef.current) {
        showBonusObsRef.current = true;
        const bonusObs = initialObservations[3];
        setObservations(prev => prev.map(o => o.id === bonusObs.id ? { ...o, rendered: true } : o));
        currentObsIndexRef.current = 3;
        addCopilotMsg(
          "I did notice something else before we get into your question.",
          <ObservationCardInline obs={bonusObs} />
        );
      } else {
        // Bonus resolved — open gear 2
        finishGear1();
      }
    };

    if (response && action !== "know") {
      addCopilotMsg(response);
      setTimeout(showNext, 2500);
    } else {
      showNext();
    }
  };

  const finishGear1 = () => {
    setGear1Done(true);
    addCopilotMsg("All observations reviewed. You're ready to dive in.", undefined, 1000);
    setTimeout(() => {
      setGear("gear2");
      setGear2Turn("idle");
    }, 2200);
  };

  /* ─── Handle cold start send ─── */
  const handleColdStartSend = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput("");
    addUserMsg(userMsg);

    if (coldPhase === "choice") {
      const lower = userMsg.toLowerCase();
      if (lower.includes("ask me") || lower.includes("questions") || lower.includes("build context")) {
        setColdPhase("q1");
        addCopilotMsg("Is this brand in growth mode, defense mode, or recovery mode right now?");
      } else {
        // Fast track — skip to gear 2
        setFastTrack(true);
        setBrandContext({ posture: "", categoryBelief: "", historicalFrustration: "", currentHypothesis: "", sessionReasoning: [userMsg] });
        addCopilotMsg("Go ahead — tell me what you're thinking.");
        setTimeout(() => {
          setGear("gear2");
          setGear2Turn("idle");
        }, 1500);
      }
      return;
    }

    const buildCtx = (field: keyof BrandContext, value: string) => {
      setBrandContext(prev => {
        if (!prev) return { posture: "", categoryBelief: "", historicalFrustration: "", currentHypothesis: "", sessionReasoning: [], [field]: value };
        return { ...prev, [field]: value };
      });
    };

    switch (coldPhase) {
      case "q1":
        buildCtx("posture", userMsg);
        setColdPhase("q2");
        addCopilotMsg("What do you believe about this category that your competitors haven't figured out yet?");
        break;
      case "q2":
        buildCtx("categoryBelief", userMsg);
        setColdPhase("q3");
        addCopilotMsg("What's one thing that's already been tried on this brand that didn't perform the way you expected?");
        break;
      case "q3":
        buildCtx("historicalFrustration", userMsg);
        setColdPhase("q4");
        addCopilotMsg("What did you come in today wanting to solve?");
        break;
      case "q4":
        buildCtx("currentHypothesis", userMsg);
        setColdPhase("done");
        addCopilotMsg("Got it. I've built your brand context. Let me show you what the data is saying.");
        setTimeout(() => showFirstObservation(messages), 2500);
        break;
    }
  };

  /* ─── Handle gear 2 send ─── */
  const handleGear2Send = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput("");
    addUserMsg(userMsg);
    addToReasoning(userMsg);

    // If fast-track and gear1 hasn't run yet, run gear 1 after first input
    if (fastTrack && !gear1Done && gear2Turn === "idle") {
      setUserGoal(userMsg);
      // Now show gear 1 observations before continuing
      addCopilotMsg("Noted. Before we go deeper, let me surface a few things from the data.");
      setTimeout(() => showFirstObservation(messages), 2000);
      // After gear1 completes, gear2Turn will be "idle" and user continues
      return;
    }

    switch (gear2Turn) {
      case "idle":
        setUserGoal(userMsg);
        setGear2Turn("intent");
        addCopilotMsg("What is this budget trying to solve?");
        break;
      case "intent":
        setUserGoal(prev => `${prev} · ${userMsg}`);
        setGear2Turn("sku");
        addCopilotMsg("Which SKUs and on which platforms — Blinkit, Zepto, or both?");
        break;
      case "sku":
        setUserSkus(userMsg);
        setGear2Turn("insights");
        addCopilotMsg("Before we validate, here are insights that could affect your plan:");
        break;
      case "confirm":
        if (userMsg.toLowerCase().includes("looks good") || userMsg.toLowerCase().includes("confirm") || userMsg.toLowerCase().includes("proceed") || userMsg.toLowerCase().includes("yes")) {
          addCopilotMsg("Plan submitted to the Approval Flow. Redirecting…");
          setTimeout(() => g.navigateTo?.("approvalflow"), 1500);
        } else {
          addCopilotMsg(`Noted — "${userMsg}". I've adjusted the scenario. Any further changes, or shall we proceed?`);
        }
        break;
    }
  };

  /* ─── Handle insight actions ─── */
  const handleInsightAction = (id: string, action: "resolve" | "defer" | "tell-more") => {
    if (action === "resolve") {
      const updated = insights.map(i => i.id === id ? { ...i, resolved: true } : i);
      setInsights(updated);
      recalcConfidence(updated);
      addUserMsg(`Resolved: "${insights.find(i => i.id === id)?.text.slice(0, 50)}…"`);
      checkInsightsComplete(updated);
    } else if (action === "defer") {
      const updated = insights.map(i => i.id === id ? { ...i, deferred: true } : i);
      setInsights(updated);
      recalcConfidence(updated);
      addUserMsg(`Deferred: "${insights.find(i => i.id === id)?.text.slice(0, 50)}…"`);
      checkInsightsComplete(updated);
    } else if (action === "tell-more") {
      addUserMsg("Tell me more about this insight");
      addCopilotMsg("This is connected to the ROAS efficiency gap on Blinkit. The guardrail threshold is 1.5x — NutriChoice is at 1.9x, which is above pause but below scale. Allocating fresh budget here may push ROAS lower if the underlying conversion rate doesn't improve. Resolution: confirm you're comfortable running at 1.9x or revise SKU allocation.");
    }
  };

  const checkInsightsComplete = (ins: Insight[]) => {
    const breakingUnresolved = ins.filter(i => i.tier === "plan-breaking" && !i.resolved);
    if (breakingUnresolved.length === 0) {
      const allHandled = ins.every(i => i.resolved || i.deferred);
      if (allHandled) {
        setTimeout(() => {
          setGear2Turn("validation");
          addCopilotMsg("All plan-breaking insights resolved. Here's the data validation:", <ValidationCards />);
          setTimeout(() => {
            setGear2Turn("scenarios");
            addCopilotMsg(
              "Based on your inputs, here are three scenarios. Select one to see the full action plan:",
              <ScenarioSelector scenarios={scenarios} onSelect={handleScenarioSelect} />,
              2000
            );
          }, 2500);
        }, 1500);
      }
    }
  };

  const handleScenarioSelect = (s: Scenario) => {
    setSelectedScenario(s);
    setGear2Turn("confirm");
    addUserMsg(`I'll go with Scenario ${s.id}: ${s.name}.`);
    addToReasoning(`Selected Scenario ${s.id}: ${s.name}`);
    addCopilotMsg("Review the action plan above. Type 'looks good' to send this plan to the Approval Flow, or suggest adjustments.");
  };

  /* ─── Recommendation handling ─── */
  const handleRecommendation = (id: string, action: "approved" | "dismissed") => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const pendingRecs = recommendations.filter(r => r.status === "pending");
  const approvedRecs = recommendations.filter(r => r.status === "approved");

  /* ─── Send handler router ─── */
  const handleSend = () => {
    if (gear === "cold-start") handleColdStartSend();
    else if (gear === "gear2") handleGear2Send();
  };

  const inputDisabled = typing || gear2Turn === "insights" || gear2Turn === "validation" || gear2Turn === "scenarios";
  const showInput = gear === "cold-start" || (gear === "gear2" && !inputDisabled);

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* ─── Main panel ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} className="text-primary" />
          <h1 className="text-lg font-display font-bold text-foreground">Strategic Planning</h1>
          {gear !== "gear3" && (
            <Badge variant="outline" className="text-[10px] ml-2">
              {gear === "cold-start" ? "Setup" : gear === "gear1" ? "Gear 1 — Ambient" : "Gear 2 — Explore"}
            </Badge>
          )}
        </div>

        {gear === "gear3" ? (
          <div className="flex-1 overflow-y-auto pr-1">
            <ExecutionPlan scenario={selectedScenario!} userGoal={userGoal} userSkus={userSkus} confidence={confidence} />
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "bg-surface-2 text-foreground border border-border-visible"
                  }`}>
                    <p className="text-sm whitespace-pre-line">{m.content}</p>
                    {m.widget && <div className="mt-2">{m.widget}</div>}
                  </div>
                </div>
              ))}
              {/* Live insight cards — rendered from state so they update on resolve/defer */}
              {gear === "gear2" && gear2Turn === "insights" && (
                <div className="flex justify-start">
                  <div className="max-w-[75%] space-y-3">
                    {insights.filter(i => !i.resolved && !i.deferred).map(ins => (
                      <InsightCard key={ins.id} insight={ins} onAction={handleInsightAction} />
                    ))}
                    {insights.every(i => i.resolved || i.deferred) && (
                      <p className="text-xs text-muted-foreground italic">All insights handled — generating validation…</p>
                    )}
                  </div>
                </div>
              )}
              {typing && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {showInput && (
              <div className="border-t border-border-visible pt-3">
                <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-4 py-2 border border-border-visible focus-within:border-primary/40 transition-colors">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder={
                      gear === "cold-start" && coldPhase === "choice" ? "Type your choice…" :
                      gear === "cold-start" ? "Answer however you like…" :
                      gear2Turn === "idle" ? "What would you like to explore or plan today?" :
                      "Type your response…"
                    }
                    className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                    disabled={typing}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || typing}
                    className="p-1.5 rounded-lg text-primary hover:bg-primary/10 transition-colors disabled:opacity-30"
                  >
                    <Send size={16} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── Right panel ─── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-l border-border-visible pl-5 overflow-y-auto gap-4">
        <BrandContextCard context={brandContext} building={fastTrack && !brandContext?.posture} />

        <div className="bg-surface-2 border border-border-visible rounded-lg p-3 text-center">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">Confidence Score</p>
          <p className={`text-3xl font-bold ${
            confidence >= 80 ? "text-[hsl(var(--success))]" :
            confidence >= 50 ? "text-[hsl(var(--warning))]" :
            "text-destructive"
          }`}>{confidence}%</p>
          {insights.some(i => i.deferred) && (
            <p className="text-[10px] text-muted-foreground mt-1">{insights.filter(i => i.deferred).length} insight(s) deferred — 72h resolution window</p>
          )}
        </div>

        <div>
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">AI Recommendations</h3>
          <div className="space-y-3">
            {pendingRecs.map(r => (
              <div key={r.id} className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
                <Badge variant={r.priority === "P1" ? "destructive" : r.priority === "P2" ? "secondary" : "outline"} className="text-[10px]">{r.priority}</Badge>
                <p className="text-xs text-foreground leading-relaxed">{r.text}</p>
                <p className="text-[11px] text-muted-foreground">{r.reason}</p>
                <div className="flex gap-2">
                  <button onClick={() => handleRecommendation(r.id, "approved")} className="flex items-center gap-1 text-[11px] text-[hsl(var(--success))] hover:underline"><Check size={12} /> Approve</button>
                  <button onClick={() => handleRecommendation(r.id, "dismissed")} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive hover:underline"><X size={12} /> Dismiss</button>
                </div>
              </div>
            ))}
            {pendingRecs.length === 0 && <p className="text-xs text-muted-foreground">No pending recommendations.</p>}
          </div>
        </div>

        {approvedRecs.length > 0 && (
          <div className="pt-3 border-t border-border-visible">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Approved Actions</h4>
            <div className="space-y-2">
              {approvedRecs.map(r => (
                <div key={r.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 size={12} className="text-[hsl(var(--success))] mt-0.5 flex-shrink-0" />
                  <span>{r.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategicPlanningView;
