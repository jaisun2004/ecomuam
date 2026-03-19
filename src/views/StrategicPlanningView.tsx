import React, { useState, useEffect, useRef } from "react";
import { Send, CheckCircle2, AlertTriangle, XCircle, Check, X, Sparkles, Eye, Zap, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

/* ─── Developer toggles ─── */
const sellerPortalConnected = true;
const hasStrategicHistory = false;

/* ─── Types ─── */
type Gear = "cold-start" | "gear1" | "gear2" | "gear3";
type ColdStartTurn = 0 | 1 | 2 | 3 | 4;
type Gear2Turn = "idle" | "input" | "intent" | "sku" | "insights" | "validation" | "scenarios" | "confirm";
type ObservationType = "Anomaly" | "Tension" | "Assumption challenge";
type Message = { role: "user" | "copilot"; content: string; widget?: React.ReactNode };
type Scenario = { id: string; name: string; desc: string; blinkitSplit: string; zeptoSplit: string; roasRange: string; risk: string };
type Recommendation = { id: string; priority: "P1" | "P2" | "P3"; text: string; reason: string; status: "pending" | "approved" | "dismissed" };
type InsightTier = "plan-breaking" | "plan-informing";
type Insight = { id: string; tier: InsightTier; text: string; resolved: boolean; deferred: boolean };

interface Observation {
  id: string;
  type: ObservationType;
  title: string;
  detail: string;
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

const defaultObservations: Observation[] = [
  { id: "obs1", type: "Anomaly", title: "Good Day Butter ROAS on Zepto spiked 42% last week", detail: "Spend remained flat but conversion rate jumped — possibly a competitor stockout drove organic traffic into your paid funnel.", resolved: false },
  { id: "obs2", type: "Tension", title: "NutriChoice Digestive rank is rising on Zepto but ROAS is falling", detail: "Organic rank improved from #10 to #7 over 3 weeks, but paid ROAS dropped from 2.8x to 2.4x in the same period. Paid may be cannibalising organic.", resolved: false },
  { id: "obs3", type: "Assumption challenge", title: "Your brand context says 'growth mode' — but Blinkit ad spend efficiency has declined 3 weeks straight", detail: "If growth is the priority, the declining efficiency on your primary platform may need addressing before scaling.", resolved: false },
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
  { id: "A", name: "Aggressive", desc: "Concentrate spend on Zepto where ROAS is strongest. Maximum growth potential, higher single-platform risk.", blinkitSplit: "₹30L", zeptoSplit: "₹70L", roasRange: "2.8x – 4.2x", risk: "High" },
  { id: "B", name: "Balanced", desc: "Even split across platforms with proportional SKU allocation. Moderate risk, diversified presence.", blinkitSplit: "₹50L", zeptoSplit: "₹50L", roasRange: "2.5x – 3.5x", risk: "Medium" },
  { id: "C", name: "Defensive", desc: "Maintain current efficiency on Blinkit, test challenger SKUs on Zepto with ring-fenced budget.", blinkitSplit: "₹55L", zeptoSplit: "₹45L", roasRange: "2.2x – 2.9x", risk: "Low" },
];

const coldStartQuestions = [
  "Before we look at the data, I need to understand the brand. Four quick questions — answer however you like.",
  "Is this brand in growth mode, defense mode, or recovery mode right now?",
  "What do you believe about this category that your competitors haven't figured out yet?",
  "What's one thing that's already been tried on this brand that didn't perform the way you expected?",
  "What did you come in today wanting to solve?",
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
  return (
    <div className={`rounded-lg p-3 space-y-2 border ${isBreaking ? "bg-[hsl(var(--warning))]/10 border-[hsl(var(--warning))]/30" : "bg-surface-2 border-border-visible"}`}>
      <div className="flex items-center gap-2">
        <Badge variant={isBreaking ? "destructive" : "outline"} className="text-[10px]">
          {isBreaking ? "Plan-breaking" : "Plan-informing"}
        </Badge>
      </div>
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

/* ─── Scenario card ─── */
const ScenarioCard = ({ s, onSelect }: { s: Scenario; onSelect: () => void }) => (
  <div className="bg-surface-2 border border-border-visible rounded-lg p-4 space-y-2">
    <div className="flex items-center justify-between">
      <h4 className="text-sm font-semibold text-foreground">Scenario {s.id}: {s.name}</h4>
      <Badge variant={s.risk === "High" ? "destructive" : s.risk === "Medium" ? "secondary" : "outline"} className="text-[10px]">{s.risk} risk</Badge>
    </div>
    <p className="text-xs text-muted-foreground">{s.desc}</p>
    <div className="flex gap-4 text-xs text-foreground">
      <span>Blinkit: {s.blinkitSplit}</span>
      <span>Zepto: {s.zeptoSplit}</span>
      <span>Projected ROAS: {s.roasRange}</span>
    </div>
    <button onClick={onSelect} className="mt-1 text-xs font-medium text-primary hover:text-primary/80 transition-colors">
      Select this scenario →
    </button>
  </div>
);

/* ─── Execution plan (Gear 3) ─── */
const ExecutionPlan = ({ scenario, userGoal, userSkus, confidence }: { scenario: Scenario; userGoal: string; userSkus: string; confidence: number }) => {
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false]);
  const toggleCheck = (i: number) => setChecklist(prev => { const n = [...prev]; n[i] = !n[i]; return n; });

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-foreground flex items-center justify-between">
        <span><strong>Approved plan</strong> · {userGoal} · {userSkus} · Scenario {scenario.id} ({scenario.name})</span>
        <span className="font-semibold">Confidence {confidence}%</span>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* LEFT: Paid campaign track */}
        <div className="space-y-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Paid Campaign Track</h3>

          {/* Campaign structure */}
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

          {/* ROAS targets */}
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

          {/* Weekly checklist */}
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
            Rank improvement depends on content quality and listing completeness. Content briefs are managed under the quarterly organic process. This plan does not allocate budget to content.
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
const BrandContextCard = ({ context }: { context: BrandContext | null }) => {
  if (!context) return null;
  return (
    <div className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
      <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Strategic Context — Session 1</h4>
      <div className="space-y-1.5 text-xs">
        <div><span className="text-muted-foreground">Posture:</span> <span className="text-foreground">{context.posture}</span></div>
        <div><span className="text-muted-foreground">Category belief:</span> <span className="text-foreground">{context.categoryBelief}</span></div>
        <div><span className="text-muted-foreground">What didn't work:</span> <span className="text-foreground">{context.historicalFrustration}</span></div>
        <div><span className="text-muted-foreground">Today's focus:</span> <span className="text-foreground">{context.currentHypothesis}</span></div>
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
  /* ─── State ─── */
  const [gear, setGear] = useState<Gear>(hasStrategicHistory ? "gear1" : "cold-start");
  const [coldTurn, setColdTurn] = useState<ColdStartTurn>(0);
  const [gear2Turn, setGear2Turn] = useState<Gear2Turn>("idle");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [brandContext, setBrandContext] = useState<BrandContext | null>(hasStrategicHistory ? defaultHistoryContext : null);
  const [observations, setObservations] = useState<Observation[]>(defaultObservations);
  const [currentObsIndex, setCurrentObsIndex] = useState(0);
  const [insights, setInsights] = useState<Insight[]>(defaultInsights);
  const [confidence, setConfidence] = useState(100);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [userGoal, setUserGoal] = useState("");
  const [userSkus, setUserSkus] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  /* ─── Helpers ─── */
  const addCopilotMessage = (content: string, widget?: React.ReactNode, delay = 1200) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "copilot", content, widget }]);
    }, delay);
  };

  const addUserMessage = (content: string) => {
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
    if (gear === "cold-start" && coldTurn === 0 && messages.length === 0) {
      addCopilotMessage(coldStartQuestions[0], undefined, 800);
      setTimeout(() => {
        setTyping(true);
        setTimeout(() => {
          setTyping(false);
          setMessages(prev => [...prev, { role: "copilot", content: coldStartQuestions[1] }]);
          setColdTurn(1);
        }, 1000);
      }, 2200);
    }
  }, []);

  /* ─── Gear 1 init ─── */
  useEffect(() => {
    if (gear === "gear1" && messages.length === 0 && hasStrategicHistory) {
      showGear1Observations();
    }
  }, [gear]);

  const showGear1Observations = () => {
    const obs = observations[0];
    if (!obs) return;
    addCopilotMessage(
      "I've been looking at the data. Here are a few things worth discussing before we start.",
      <div className="space-y-3 mt-2">
        <ObservationCard obs={obs} onAction={handleObservationAction} />
      </div>,
      800
    );
  };

  const transitionToGear1 = () => {
    setGear("gear1");
    setMessages([]);
    setTimeout(() => {
      const obs = observations[0];
      if (!obs) return;
      addCopilotMessage(
        "I've been looking at the data. Here are a few things worth discussing before we start.",
        <div className="space-y-3 mt-2">
          <ObservationCard obs={obs} onAction={handleObservationAction} />
        </div>,
        800
      );
    }, 300);
  };

  /* ─── Observation card ─── */
  const ObservationCard = ({ obs, onAction }: { obs: Observation; onAction: (id: string, action: string) => void }) => (
    <div className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
      <ObsTypeBadge type={obs.type} />
      <p className="text-sm font-medium text-foreground">{obs.title}</p>
      <p className="text-xs text-muted-foreground">{obs.detail}</p>
      {!obs.resolved && (
        <div className="flex gap-2 pt-1">
          <button onClick={() => onAction(obs.id, "know")} className="text-[11px] px-2.5 py-1 rounded-md bg-surface-3 text-foreground hover:bg-muted transition-colors">I know this</button>
          <button onClick={() => onAction(obs.id, "tell-more")} className="text-[11px] px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors">Tell me more</button>
          <button onClick={() => onAction(obs.id, "surprise")} className="text-[11px] px-2.5 py-1 rounded-md bg-surface-3 text-muted-foreground hover:bg-muted transition-colors">Surprise me</button>
        </div>
      )}
    </div>
  );

  /* ─── Handle observation actions ─── */
  const handleObservationAction = (id: string, action: string) => {
    const obs = observations.find(o => o.id === id);
    if (!obs) return;

    setObservations(prev => prev.map(o => o.id === id ? { ...o, resolved: true } : o));
    const nextIdx = currentObsIndex + 1;

    if (action === "know") {
      addUserMessage(`I know this — "${obs.title}"`);
      addToReasoning(`Confirmed: ${obs.title}`);
      if (nextIdx < observations.length) {
        setCurrentObsIndex(nextIdx);
        const nextObs = observations[nextIdx];
        addCopilotMessage("Noted. Here's the next observation:", <div className="mt-2"><ObservationCard obs={nextObs} onAction={handleObservationAction} /></div>);
      } else {
        finishGear1();
      }
    } else if (action === "tell-more") {
      addUserMessage(`Tell me more about "${obs.title}"`);
      addToReasoning(`Explored: ${obs.title}`);
      addCopilotMessage(
        obs.type === "Anomaly"
          ? "Looking deeper — the conversion rate spike correlates with a major competitor going OOS on 3 dark stores in South Delhi. This may be temporary. If it reverses, your ROAS will normalize. Consider locking in the gain with a 10% bid increase now."
          : obs.type === "Tension"
          ? "The rising organic rank suggests your content is working. But the falling paid ROAS means you may be bidding against yourself — paid impressions are going to users who would have found you organically. Consider reducing bids by 15% on keywords where organic rank is top 5."
          : "The efficiency decline on Blinkit doesn't necessarily contradict growth — it could mean you've saturated easy wins and need to shift to a different campaign type or targeting method. But it does mean scaling linearly will be wasteful.",
        undefined
      );
      setTimeout(() => {
        if (nextIdx < observations.length) {
          setCurrentObsIndex(nextIdx);
          const nextObs = observations[nextIdx];
          addCopilotMessage("Moving on — next observation:", <div className="mt-2"><ObservationCard obs={nextObs} onAction={handleObservationAction} /></div>, 2000);
        } else {
          setTimeout(() => finishGear1(), 2000);
        }
      }, 1500);
    } else if (action === "surprise") {
      addUserMessage(`Surprise me on "${obs.title}"`);
      addToReasoning(`Copilot interpretation requested: ${obs.title}`);
      addCopilotMessage(
        obs.type === "Anomaly"
          ? "Here's my take — this ROAS spike is a gift, not a trend. The competitor will restock within days. Use this window to scale bids aggressively on Zepto and capture market share while the shelf is open. The cost of missing this window is higher than the cost of over-bidding for 48 hours."
          : obs.type === "Tension"
          ? "My read — this is actually good news disguised as a problem. Your organic rank is improving, which means content is landing. The paid ROAS decline is a signal to start tapering paid spend on Zepto for NutriChoice, not a sign of failure. You're graduating from paid to organic."
          : "Counter-intuition — maybe Blinkit isn't a growth channel anymore, it's a defense channel. Use it to maintain shelf position while Zepto drives actual growth. This reframes your budget split entirely."
      );
      setTimeout(() => {
        if (nextIdx < observations.length) {
          setCurrentObsIndex(nextIdx);
          const nextObs = observations[nextIdx];
          addCopilotMessage("Next:", <div className="mt-2"><ObservationCard obs={nextObs} onAction={handleObservationAction} /></div>, 2000);
        } else {
          setTimeout(() => finishGear1(), 2000);
        }
      }, 1500);
    }
  };

  const finishGear1 = () => {
    addCopilotMessage("All observations reviewed. You're ready to dive in.", undefined, 1500);
    setTimeout(() => {
      setGear("gear2");
      setGear2Turn("idle");
    }, 2800);
  };

  /* ─── Handle cold start ─── */
  const handleColdStartSend = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput("");
    addUserMessage(userMsg);

    const answers: Partial<BrandContext> = {};

    switch (coldTurn) {
      case 1:
        answers.posture = userMsg;
        setColdTurn(2);
        addCopilotMessage(coldStartQuestions[2]);
        break;
      case 2:
        answers.categoryBelief = userMsg;
        setColdTurn(3);
        addCopilotMessage(coldStartQuestions[3]);
        break;
      case 3:
        answers.historicalFrustration = userMsg;
        setColdTurn(4);
        addCopilotMessage(coldStartQuestions[4]);
        break;
      case 4: {
        answers.currentHypothesis = userMsg;
        // Build brand context from all messages
        const userMsgs = [...messages.filter(m => m.role === "user").map(m => m.content), userMsg];
        const ctx: BrandContext = {
          posture: userMsgs[0] || "",
          categoryBelief: userMsgs[1] || "",
          historicalFrustration: userMsgs[2] || "",
          currentHypothesis: userMsgs[3] || userMsg,
          sessionReasoning: [],
        };
        setBrandContext(ctx);
        addCopilotMessage("Got it. I've built your brand context. Let me show you what the data is saying.");
        setTimeout(() => transitionToGear1(), 2500);
        break;
      }
    }

    setBrandContext(prev => {
      if (coldTurn === 4) return prev; // already set above
      if (!prev) {
        return { posture: "", categoryBelief: "", historicalFrustration: "", currentHypothesis: "", sessionReasoning: [], ...answers };
      }
      return { ...prev, ...answers };
    });
  };

  /* ─── Handle gear 2 send ─── */
  const handleGear2Send = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput("");
    addUserMessage(userMsg);
    addToReasoning(userMsg);

    switch (gear2Turn) {
      case "idle":
        setUserGoal(userMsg);
        setGear2Turn("intent");
        addCopilotMessage("What is this budget trying to solve?");
        break;
      case "intent":
        setUserGoal(prev => `${prev} · ${userMsg}`);
        setGear2Turn("sku");
        addCopilotMessage("Which SKUs and on which platforms — Blinkit, Zepto, or both?");
        break;
      case "sku":
        setUserSkus(userMsg);
        setGear2Turn("insights");
        // Show insights
        addCopilotMessage(
          "Before we validate, here are insights that could affect your plan:",
          <div className="space-y-3 mt-2">
            {defaultInsights.map(ins => (
              <InsightCard key={ins.id} insight={ins} onAction={handleInsightAction} />
            ))}
          </div>
        );
        break;
      case "confirm":
        if (userMsg.toLowerCase().includes("looks good") || userMsg.toLowerCase().includes("confirm") || userMsg.toLowerCase().includes("proceed") || userMsg.toLowerCase().includes("yes")) {
          addCopilotMessage("Building your execution action plan…");
          setTimeout(() => setGear("gear3"), 1400);
        } else {
          addCopilotMessage(`Noted — "${userMsg}". I've adjusted the scenario. Any further changes, or shall we proceed?`);
        }
        break;
      default:
        break;
    }
  };

  /* ─── Handle insight actions ─── */
  const handleInsightAction = (id: string, action: "resolve" | "defer" | "tell-more") => {
    if (action === "resolve") {
      const updated = insights.map(i => i.id === id ? { ...i, resolved: true } : i);
      setInsights(updated);
      recalcConfidence(updated);
      addUserMessage(`Resolved: "${insights.find(i => i.id === id)?.text.slice(0, 50)}…"`);
      checkInsightsComplete(updated);
    } else if (action === "defer") {
      const updated = insights.map(i => i.id === id ? { ...i, deferred: true } : i);
      setInsights(updated);
      recalcConfidence(updated);
      addUserMessage(`Deferred: "${insights.find(i => i.id === id)?.text.slice(0, 50)}…"`);
      checkInsightsComplete(updated);
    } else if (action === "tell-more") {
      addUserMessage(`Tell me more about this insight`);
      addCopilotMessage("This is connected to the ROAS efficiency gap on Blinkit. The guardrail threshold is 1.5x — NutriChoice is at 1.9x, which is above pause but below scale. Allocating fresh budget here may push ROAS lower if the underlying conversion rate doesn't improve. Resolution: confirm you're comfortable running at 1.9x or revise SKU allocation.");
    }
  };

  const checkInsightsComplete = (ins: Insight[]) => {
    const breakingUnresolved = ins.filter(i => i.tier === "plan-breaking" && !i.resolved);
    if (breakingUnresolved.length === 0) {
      const allHandled = ins.every(i => i.resolved || i.deferred || i.tier === "plan-informing");
      if (allHandled || ins.filter(i => !i.resolved && !i.deferred).length === 0) {
        setTimeout(() => {
          setGear2Turn("validation");
          addCopilotMessage(
            "All plan-breaking insights resolved. Here's the data validation:",
            <ValidationCards />
          );
          setTimeout(() => {
            setGear2Turn("scenarios");
            addCopilotMessage(
              "Based on your inputs, here are three scenarios:",
              <div className="space-y-3 mt-2">
                {scenarios.map(s => (
                  <ScenarioCard key={s.id} s={s} onSelect={() => handleScenarioSelect(s)} />
                ))}
              </div>,
              2000
            );
          }, 2500);
        }, 1500);
      }
    }
  };

  /* ─── Handle scenario select ─── */
  const handleScenarioSelect = (s: Scenario) => {
    setSelectedScenario(s);
    setGear2Turn("confirm");
    addUserMessage(`I'll go with Scenario ${s.id}: ${s.name}.`);
    addToReasoning(`Selected Scenario ${s.id}: ${s.name}`);
    addCopilotMessage("Any adjustments before I build the action plan? Type them or say 'looks good' to proceed.");
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
  const showInput = gear !== "gear3" && gear !== "gear1";
  const showInputGear1 = false; // Gear 1 uses buttons only

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
            {/* Chat thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[75%] rounded-xl px-4 py-3 ${
                    m.role === "user"
                      ? "bg-primary/15 text-foreground"
                      : "bg-surface-2 text-foreground border border-border-visible"
                  }`}>
                    <p className="text-sm">{m.content}</p>
                    {m.widget && <div className="mt-2">{m.widget}</div>}
                  </div>
                </div>
              ))}
              {typing && <TypingIndicator />}
              <div ref={chatEndRef} />
            </div>

            {/* Input — only in cold-start and gear 2 */}
            {(gear === "cold-start" || (gear === "gear2" && !inputDisabled)) && (
              <div className="border-t border-border-visible pt-3">
                <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-4 py-2 border border-border-visible focus-within:border-primary/40 transition-colors">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSend()}
                    placeholder={
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
        {/* Brand context card */}
        <BrandContextCard context={brandContext} />

        {/* Confidence score */}
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

        {/* AI recommendation queue */}
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
