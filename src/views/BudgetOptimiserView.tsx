import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, PieChart, Pie, Cell } from "recharts";
import { ArrowRight, ChevronDown, ChevronUp, X, Plus, Lightbulb, Wand2 } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface RuleTemplate {
  id: string;
  name: string;
  description: string;
  metrics: string[];
  action: string;
  actionTone: "red" | "amber" | "green" | "purple";
}

const RULE_TEMPLATES: RuleTemplate[] = [
  { id: "pause-low-roas", name: "Pause low-ROAS campaigns", description: "IF ROAS < 1.5x for 3 days → pause campaign", metrics: ["ROAS"], action: "Pause campaign", actionTone: "red" },
  { id: "bid-down-acos", name: "Bid down high ACoS keywords", description: "IF ACoS > 40% → reduce bid 20%", metrics: ["ACoS"], action: "Reduce bid -20%", actionTone: "amber" },
  { id: "boost-top", name: "Boost top performers", description: "IF ROAS > 5x AND budget util > 90% → increase budget 25%", metrics: ["ROAS", "Budget Util"], action: "Increase budget +25%", actionTone: "green" },
  { id: "throttle-pacing", name: "Throttle overpacing campaigns", description: "IF spend pacing > 120% by noon → cap remaining spend", metrics: ["Spend Pacing"], action: "Cap remaining spend", actionTone: "amber" },
  { id: "defend-rank", name: "Defend dropping rank", description: "IF organic rank drops ≥ 3 positions → raise sponsored bid 15%", metrics: ["Organic Rank"], action: "Raise bid +15%", actionTone: "purple" },
  { id: "cut-redundant", name: "Cut redundant paid", description: "IF organic rank ≤ 3 AND paid ROAS < 2.5x → reduce budget 30%", metrics: ["Organic Rank", "ROAS"], action: "Reduce budget -30%", actionTone: "red" },
];

const METRIC_OPTIONS = ["ROAS", "ACoS", "CPC", "CTR", "Conversion Rate", "Spend Pacing", "Budget Utilisation", "Organic Rank", "Sponsored Rank", "Impression Share"];
const OPERATOR_OPTIONS = [">", "<", "=", "between"];
const ACTION_OPTIONS = ["Pause campaign", "Reduce bid -20%", "Reduce bid -30%", "Increase budget +15%", "Increase budget +25%", "Send alert"];

const toneClasses: Record<string, string> = {
  red: "bg-sw-red-dim text-sw-red",
  amber: "bg-sw-amber-dim text-sw-amber",
  green: "bg-sw-green-dim text-sw-green",
  purple: "bg-sw-purple-dim text-sw-purple",
};

const budgetUtilData = [
  { name: "Parle-G 250g", ratio: 82, color: "hsl(160,70%,48%)" },
  { name: "Q-Commerce Push", ratio: 91, color: "hsl(38,92%,50%)" },
  { name: "Bourbon RT", ratio: 98, color: "hsl(0,76%,57%)" },
  { name: "Britannia Marie Brand", ratio: 67, color: "hsl(160,70%,48%)" },
  { name: "Marie Gold SP", ratio: 88, color: "hsl(38,92%,50%)" },
];

const wastedSpendData = [
  { name: "Efficient (>3x ROAS)", value: 65, color: "hsl(160,70%,48%)" },
  { name: "Moderate (2-3x)", value: 22, color: "hsl(38,92%,50%)" },
  { name: "Wasted (<2x)", value: 13, color: "hsl(0,76%,57%)" },
];

const samePlatformShifts = [
  {
    platform: "Instamart", color: "#FF9900",
    from: { campaign: "Lipton Ice Tea Peach — SP", roas: "2.1x", currentSpend: "₹ 1.200g" },
    to: { campaign: "Parle-G 120g — SP", roas: "5.1x", currentSpend: "₹ 3.8L" },
    amount: "₹ 40K", projImpact: "+1,200 conversions, blended ROAS +0.4x",
  },
  {
    platform: "Instamart", color: "#2F77FF",
    from: { campaign: "Sunfeast Retargeting", roas: "2.1x", currentSpend: "₹ 2.5L" },
    to: { campaign: "Bourbon Push", roas: "4.2x", currentSpend: "₹ 1.0L" },
    amount: "₹ 60K", projImpact: "+800 conversions, campaign ROAS → 4.5x",
  },
  {
    platform: "Blinkit", color: "#FDDC2B",
    from: { campaign: "Generic Biscuits Ads", roas: "2.8x", currentSpend: "₹ 1.200g" },
    to: { campaign: "Parle-G Q-Commerce Push", roas: "3.8x", currentSpend: "₹ 2.4L" },
    amount: "₹ 25K", projImpact: "+500 conversions, better geo-targeting",
  },
];

const crossPlatformShifts = [
  {
    from: { platform: "Instamart", color: "#2F77FF", campaign: "Sunfeast Retargeting", roas: "2.1x", spend: "₹ 2.5L" },
    to: { platform: "Instamart", color: "#FF9900", campaign: "Parle-G 250g — SP", roas: "5.1x", spend: "₹ 3.8L" },
    amount: "₹ 80K", projImpact: "Incremental conversions +2,100, blended portfolio ROAS +0.5x",
    confidence: 92,
  },
  {
    from: { platform: "Instamart", color: "#2F77FF", campaign: "Various underperformers", roas: "2.1x", spend: "₹ 1.8L" },
    to: { platform: "Instamart", color: "#E1306C", campaign: "Bourbon Brand Awareness", roas: "4.4x", spend: "₹ 40K" },
    amount: "₹ 40K", projImpact: "Expand brand reach +180K impressions, ROAS 4.4x vs 2.1x",
    confidence: 85,
  },
  {
    from: { platform: "Zepto", color: "#833AB4", campaign: "Low-stock geo campaigns", roas: "1.8x", spend: "₹ 60K" },
    to: { platform: "Blinkit", color: "#FDDC2B", campaign: "Parle-G Q-Commerce Push", roas: "3.8x", spend: "₹ 2.4L" },
    amount: "₹ 30K", projImpact: "Better dark-store coverage + higher ROAS",
    confidence: 78,
  },
];

const platformSummary = [
  { platform: "Instamart", color: "#FF9900", spend: 6.5, roas: 5.1, optSpend: 7.3, optRoas: 5.4 },
  { platform: "Instamart", color: "#E1306C", spend: 3.2, roas: 4.4, optSpend: 3.6, optRoas: 4.5 },
  { platform: "Blinkit", color: "#FDDC2B", spend: 2.8, roas: 3.8, optSpend: 3.1, optRoas: 4.0 },
  { platform: "Instamart", color: "#2F77FF", spend: 4.3, roas: 2.1, optSpend: 2.5, optRoas: 3.0 },
  { platform: "Zepto", color: "#833AB4", spend: 1.4, roas: 3.2, optSpend: 1.1, optRoas: 3.5 },
];

const chartData = platformSummary.map(p => ({ name: p.platform, current: p.roas, optimised: p.optRoas }));

interface CustomRule { id: string; metric: string; operator: string; threshold: string; action: string; }

const RuleEngine: React.FC = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    "pause-low-roas": true,
    "boost-top": true,
    "defend-rank": true,
  });
  const [metric, setMetric] = useState("ROAS");
  const [operator, setOperator] = useState("<");
  const [threshold, setThreshold] = useState("");
  const [action, setAction] = useState("Pause campaign");
  const [customRules, setCustomRules] = useState<CustomRule[]>([
    { id: "c1", metric: "CPC", operator: ">", threshold: "12", action: "Reduce bid -20%" },
  ]);

  const toggleRule = (id: string, name: string, next: boolean) => {
    setEnabled(p => ({ ...p, [id]: next }));
    toast({ title: next ? "Rule enabled" : "Rule disabled", description: name });
  };

  const addRule = () => {
    if (!threshold.trim()) {
      toast({ title: "Threshold required", description: "Enter a numeric threshold to add the rule." });
      return;
    }
    const newRule: CustomRule = { id: `c${Date.now()}`, metric, operator, threshold: threshold.trim(), action };
    setCustomRules(p => [...p, newRule]);
    setThreshold("");
    toast({ title: "Custom rule added", description: `IF ${metric} ${operator} ${newRule.threshold} → ${action}` });
  };

  const removeRule = (id: string) => setCustomRules(p => p.filter(r => r.id !== id));

  return (
    <div className="space-y-5">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">Rule Templates</p>
        <div className="grid grid-cols-2 gap-3">
          {RULE_TEMPLATES.map(rule => {
            const isOn = !!enabled[rule.id];
            return (
              <div key={rule.id} className={`p-3 rounded-xl border transition-colors ${isOn ? "bg-surface-2 border-primary/30" : "bg-surface-2 border-subtle"}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground">{rule.name}</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{rule.description}</p>
                  </div>
                  <Switch checked={isOn} onCheckedChange={(v) => toggleRule(rule.id, rule.name, v)} />
                </div>
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                  {rule.metrics.map(m => (
                    <span key={m} className="px-1.5 py-0.5 rounded-full bg-surface-3 text-[9px] font-mono text-muted-foreground">{m}</span>
                  ))}
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[9px] font-mono ${} ">
                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${toneClasses[rule.actionTone]}`}>{rule.action}</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-subtle pt-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">Custom Rule Builder</p>
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-3">
            <label className="text-[10px] text-muted-foreground">Metric</label>
            <Select value={metric} onValueChange={setMetric}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{METRIC_OPTIONS.map(m => <SelectItem key={m} value={m} className="text-xs">{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Operator</label>
            <Select value={operator} onValueChange={setOperator}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{OPERATOR_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Threshold</label>
            <Input value={threshold} onChange={(e) => setThreshold(e.target.value)} placeholder="e.g. 2.5" className="h-9 text-xs" />
          </div>
          <div className="col-span-3">
            <label className="text-[10px] text-muted-foreground">Action</label>
            <Select value={action} onValueChange={setAction}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{ACTION_OPTIONS.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <button onClick={addRule} className="w-full h-9 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-1">
              <Plus size={12} /> Add rule
            </button>
          </div>
        </div>

        {customRules.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-muted-foreground mb-2">Custom rules ({customRules.length})</p>
            <div className="flex flex-wrap gap-2">
              {customRules.map(r => (
                <span key={r.id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sw-purple-dim text-sw-purple text-[10px] font-mono">
                  IF {r.metric} {r.operator} {r.threshold} → {r.action}
                  <button onClick={() => removeRule(r.id)} className="hover:text-sw-red"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface StdRule {
  id: string;
  name: string;
  why: string;
  impact: string;
  tone: "red" | "amber" | "green" | "purple";
  defaultOn?: boolean;
}
const STD_RULES: StdRule[] = [
  { id: "no-comp", name: "No competition on keyword → reduce bid 20%", why: "Saves spend when there's no contested auction (SoV competitors = 0 for 3d).", impact: "Affects 8 keywords · ~₹ 1.4K/wk", tone: "amber", defaultOn: true },
  { id: "comp-oos", name: "3+ competitors OOS → reduce both budget −30% and bid −15%", why: "Demand drops when shelf is thin — capture cheaper conversions, don't overpay.", impact: "Affects 4 campaigns · ~₹ 2.1K/wk", tone: "red", defaultOn: true },
  { id: "own-oos", name: "Own SKU OOS in pincode → pause campaign there", why: "Stop wasted clicks routed to an unbuyable PDP.", impact: "Affects 3 pincode campaigns", tone: "red" },
];

// Shelf custom rule builder options
const SHELF_SIGNAL_OPTIONS = ["Competitors on keyword", "Competitors OOS", "Own SKU stock", "Own SoS", "Shelf rank", "Competitor price gap"];
const SHELF_OP_OPTIONS = ["=", "<", ">", "≤", "≥"];
const SHELF_VALUE_OPTIONS: Record<string, string[]> = {
  "Competitors on keyword": ["0", "1", "2", "3+"],
  "Competitors OOS": ["1", "2", "3", "4+"],
  "Own SKU stock": ["OOS", "Low", "In stock"],
  "Own SoS": ["10%", "20%", "30%", "40%"],
  "Shelf rank": ["1", "3", "5", "10"],
  "Competitor price gap": ["+5%", "+10%", "+15%", "−10%"],
};
const SHELF_ACTION_OPTIONS = ["Reduce bid −10%", "Reduce bid −20%", "Reduce budget −20%", "Reduce budget −30% & bid −15%", "Pause campaign", "Raise bid +15%", "Raise bid +25% (defensive)"];
const SHELF_SCOPE_OPTIONS = ["All platforms", "Blinkit", "Instamart", "Zepto", "Instamart"];

const ShelfMonitoringSection: React.FC = () => {
  const [on, setOn] = useState<Record<string, boolean>>(Object.fromEntries(STD_RULES.map(r => [r.id, !!r.defaultOn])));
  const [signal, setSignal] = useState(SHELF_SIGNAL_OPTIONS[0]);
  const [op, setOp] = useState(SHELF_OP_OPTIONS[0]);
  const [val, setVal] = useState(SHELF_VALUE_OPTIONS[SHELF_SIGNAL_OPTIONS[0]][0]);
  const [scope, setScope] = useState(SHELF_SCOPE_OPTIONS[0]);
  const [shelfAction, setShelfAction] = useState(SHELF_ACTION_OPTIONS[0]);
  const [customShelfRules, setCustomShelfRules] = useState<{ id: string; signal: string; op: string; val: string; scope: string; action: string }[]>([
    { id: "s1", signal: "Competitors OOS", op: "≥", val: "3", scope: "Blinkit", action: "Reduce budget −30% & bid −15%" },
  ]);

  const valueOpts = SHELF_VALUE_OPTIONS[signal] || ["0"];
  const addShelfRule = () => {
    const r = { id: `s${Date.now()}`, signal, op, val, scope, action: shelfAction };
    setCustomShelfRules(p => [...p, r]);
    toast({ title: "Shelf rule added", description: `IF ${signal} ${op} ${val} (${scope}) → ${shelfAction}` });
  };
  const removeShelfRule = (id: string) => setCustomShelfRules(p => p.filter(r => r.id !== id));

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">Shelf Monitoring KPI Rules</p>
        <div className="grid grid-cols-2 gap-3">
          {STD_RULES.map(r => {
            const isOn = on[r.id];
            return (
              <div key={r.id} className={`p-3 rounded-xl border transition-colors ${isOn ? "bg-surface-2 border-primary/30" : "bg-surface-2 border-subtle"}`}>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-medium text-foreground flex-1">{r.name}</p>
                  <Switch checked={isOn} onCheckedChange={(v) => { setOn(p => ({ ...p, [r.id]: v })); toast({ title: v ? "Rule enabled" : "Rule disabled", description: r.name }); }} />
                </div>
                <p className="text-[10px] text-muted-foreground mb-2">{r.why}</p>
                <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-mono ${toneClasses[r.tone]}`}>{r.impact}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-t border-subtle pt-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-3 font-medium">Build a Shelf Monitoring Rule</p>
        <div className="grid grid-cols-12 gap-2 items-end">
          <div className="col-span-3">
            <label className="text-[10px] text-muted-foreground">Signal</label>
            <Select value={signal} onValueChange={(v) => { setSignal(v); setVal(SHELF_VALUE_OPTIONS[v][0]); }}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SHELF_SIGNAL_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <label className="text-[10px] text-muted-foreground">Op</label>
            <Select value={op} onValueChange={setOp}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SHELF_OP_OPTIONS.map(o => <SelectItem key={o} value={o} className="text-xs">{o}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Value</label>
            <Select value={val} onValueChange={setVal}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{valueOpts.map(v => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-[10px] text-muted-foreground">Scope</label>
            <Select value={scope} onValueChange={setScope}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SHELF_SCOPE_OPTIONS.map(s => <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-3">
            <label className="text-[10px] text-muted-foreground">Action</label>
            <Select value={shelfAction} onValueChange={setShelfAction}>
              <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
              <SelectContent>{SHELF_ACTION_OPTIONS.map(a => <SelectItem key={a} value={a} className="text-xs">{a}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="col-span-1">
            <button onClick={addShelfRule} className="w-full h-9 rounded-md bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 inline-flex items-center justify-center gap-1">
              <Plus size={12} />
            </button>
          </div>
        </div>

        {customShelfRules.length > 0 && (
          <div className="mt-3">
            <p className="text-[10px] text-muted-foreground mb-2">Custom shelf rules ({customShelfRules.length})</p>
            <div className="flex flex-wrap gap-2">
              {customShelfRules.map(r => (
                <span key={r.id} className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-sw-amber-dim text-sw-amber text-[10px] font-mono">
                  IF {r.signal} {r.op} {r.val} ({r.scope}) → {r.action}
                  <button onClick={() => removeShelfRule(r.id)} className="hover:text-sw-red"><X size={10} /></button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface CampaignReco {
  id: string;
  campaign: string;
  platform: string;
  platformColor: string;
  change: string;
  changeTone: "red" | "amber" | "green" | "purple";
  reason: string;
}
const CAMPAIGN_RECOS: CampaignReco[] = [
  { id: "r1", campaign: "Parle-G 120g — Blinkit SP", platform: "Blinkit", platformColor: "#FF5A00", change: "↑ Budget +₹ 800/day", changeTone: "green", reason: "ROAS 4.2x vs goal 3.0x — capacity headroom on top-10 keywords." },
  { id: "r2", campaign: "Britannia Marie 150g — Instamart", platform: "Instamart", platformColor: "#0E4C92", change: "↓ Bid −12%", changeTone: "amber", reason: "CTR holding but CPC up 18% w/w — overpaying for same clicks." },
  { id: "r3", campaign: "Marie Gold 250g — Zepto Riyadh", platform: "Zepto", platformColor: "#E91E63", change: "Pause", changeTone: "red", reason: "Own SKU OOS in 5/6 dark stores in Riyadh — clicks wasted." },
  { id: "r4", campaign: "Bourbon — Instamart SP", platform: "Instamart", platformColor: "#FEEE00", change: "Shift ₹ 500 → Zepto", changeTone: "purple", reason: "National-tier saturated; Q-Comm ROAS 4.8x and under-funded." },
  { id: "r5", campaign: "Lipton Ice Tea Peach — Blinkit Mumbai", platform: "Blinkit", platformColor: "#FF5A00", change: "↑ Bid +15%, +Budget 20%", changeTone: "green", reason: "Britannia OOS in 3 Mumbai areas — capture defensive auctions now." },
  { id: "r6", campaign: "Tropicana OJ — Instamart Brand", platform: "Instamart", platformColor: "#0E4C92", change: "↑ Defensive Bid +25%", changeTone: "purple", reason: "Britannia entered top-10 on brand keywords — defend before rank entrenches." },
];
const tonePill: Record<string, string> = { red: "bg-sw-red-dim text-sw-red", amber: "bg-sw-amber-dim text-sw-amber", green: "bg-sw-green-dim text-sw-green", purple: "bg-sw-purple-dim text-sw-purple" };

const CampaignRecommendationsPanel: React.FC = () => {
  const [applied, setApplied] = useState<Record<string, "applied" | "dismissed" | undefined>>({});
  return (
    <PanelCard title="Campaign Recommendations" badge={`${CAMPAIGN_RECOS.length} suggestions`} badgeColor="accent" delay={0.36}>
      <p className="text-[10px] text-muted-foreground mb-3">Suggested campaign-level changes with a one-liner backing.</p>
      <div className="space-y-2">
        {CAMPAIGN_RECOS.map(r => {
          const st = applied[r.id];
          return (
            <div key={r.id} className="p-3 rounded-xl bg-surface-2 border border-subtle flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs text-foreground truncate">{r.campaign}</span>
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-surface-3 text-[9px] text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: r.platformColor }} />{r.platform}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono ${tonePill[r.changeTone]}`}>{r.change}</span>
                </div>
                <p className="text-[10px] text-muted-foreground flex items-start gap-1"><Lightbulb size={10} className="mt-0.5 flex-shrink-0 text-sw-amber" />{r.reason}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => { setApplied(p => ({ ...p, [r.id]: "applied" })); toast({ title: "Recommendation applied", description: r.campaign }); }}
                  disabled={!!st}
                  className={`px-2.5 py-1 rounded-lg text-[10px] font-medium ${st === "applied" ? "bg-sw-green-dim text-sw-green" : st === "dismissed" ? "bg-surface-3 text-muted-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}>
                  {st === "applied" ? "✓ Applied" : "Apply"}
                </button>
                <button onClick={() => setApplied(p => ({ ...p, [r.id]: "dismissed" }))}
                  disabled={!!st}
                  className="px-2 py-1 rounded-lg text-[10px] font-medium text-muted-foreground hover:bg-surface-3 disabled:opacity-50">
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </PanelCard>
  );
};

const BudgetOptimiserView: React.FC = () => {
  const [samePlatformApplied, setSamePlatformApplied] = useState<Record<number, boolean>>({});
  const [crossPlatformApplied, setCrossPlatformApplied] = useState<Record<number, boolean>>({});
  const [applyAll, setApplyAll] = useState(false);
  const [guardrailOpen, setGuardrailOpen] = useState(true);
  const g = useGuardrails();

  const guardrailStatuses = [
    { type: "Brand Search", tier1: false, tier2: false },
    { type: "Performance Max", tier1: true, tier2: false },
    { type: "Non-Brand", tier1: false, tier2: true },
    { type: "Retargeting", tier1: true, tier2: false },
    { type: "Festival", tier1: false, tier2: false },
  ];

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Optimisations carried out yesterday" value="12 actions" delta="Auto + manual" deltaType="positive" sub="Budget shifts applied across portfolio" accentColor="bg-primary" delay={0} />
          <KPICard title="ROAS increment from yesterday" value="+0.3x" delta="vs prior day" deltaType="positive" sub="Blended portfolio gain" accentColor="bg-sw-green" delay={0.05} />
          <KPICard title="Underperforming campaigns" value="7 campaigns" delta="Below brand avg 3.4x" deltaType="negative" sub="Click to review reduction candidates" accentColor="bg-sw-red" delay={0.1} />
          <KPICard title="Lowest avg ROAS platform" value="Instamart · 2.1x" delta="-1.3x vs brand avg" deltaType="negative" sub="Reallocation opportunity flagged" accentColor="bg-sw-amber" delay={0.15} />
        </div>

        <PanelCard title="Rule Engine" badge="Automation" badgeColor="purple" delay={0.18}>
          <p className="text-[11px] text-muted-foreground mb-4">Shelf monitoring KPI rules plus performance-driven templates and a custom builder. All apply bid / budget actions automatically across Blinkit, Instamart, Zepto and Instamart.</p>
          <div className="space-y-6">
            <ShelfMonitoringSection />
            <div className="border-t border-subtle pt-5">
              <RuleEngine />
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Current vs Optimised ROAS by Platform" badge="AI Recommendation" badgeColor="purple" delay={0.2}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 8, fontSize: 11 }} />
              <Bar dataKey="current" fill="hsl(228,90%,64%)" opacity={0.5} radius={[4, 4, 0, 0]} name="Current ROAS" />
              <Bar dataKey="optimised" fill="hsl(160,70%,48%)" opacity={0.8} radius={[4, 4, 0, 0]} name="Optimised ROAS" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary/50 rounded-full" /> Current</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-green rounded-full" /> Optimised</span>
            </div>
            <button onClick={() => setApplyAll(true)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary text-foreground hover:bg-primary/80"}`}>
              {applyAll ? "✓ All Reallocations Applied" : "⚡ Apply All Recommendations"}
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Same-Platform Budget Shifts" badge={`${samePlatformShifts.length} recommendations`} badgeColor="accent" delay={0.3}>
          <p className="text-[10px] text-muted-foreground mb-4">Move budget from low-performing to high-performing campaigns within the same platform</p>
          <div className="space-y-3">
            {samePlatformShifts.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-sm text-foreground font-medium">{s.platform}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green ml-auto">Shift {s.amount}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-3 rounded-xl bg-sw-red-dim/30 border border-sw-red/10">
                    <p className="text-[10px] text-muted-foreground mb-0.5">FROM</p>
                    <p className="text-xs text-foreground">{s.from.campaign}</p>
                    <p className="font-mono text-[10px] text-sw-red mt-1">ROAS {s.from.roas} · Spend {s.from.currentSpend}</p>
                  </div>
                  <ArrowRight size={16} className="text-sw-green flex-shrink-0" />
                  <div className="flex-1 p-3 rounded-xl bg-sw-green-dim/30 border border-sw-green/10">
                    <p className="text-[10px] text-muted-foreground mb-0.5">TO</p>
                    <p className="text-xs text-foreground">{s.to.campaign}</p>
                    <p className="font-mono text-[10px] text-sw-green mt-1">ROAS {s.to.roas} · Spend {s.to.currentSpend}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-sw-green">💡 {s.projImpact}</p>
                  <button onClick={() => setSamePlatformApplied(p => ({ ...p, [i]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${samePlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
                    {samePlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Cross-Platform Budget Reallocation" badge={`${crossPlatformShifts.length} recommendations`} badgeColor="purple" delay={0.4}>
          <p className="text-[10px] text-muted-foreground mb-4">Move budget across platforms to maximize portfolio-level ROAS</p>
          <div className="space-y-3">
            {crossPlatformShifts.map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.from.color }} />
                    <span className="text-xs text-foreground">{s.from.platform}</span>
                  </div>
                  <ArrowRight size={14} className="text-primary" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: s.to.color }} />
                    <span className="text-xs text-foreground">{s.to.platform}</span>
                  </div>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green ml-auto">{s.amount}</span>
                  <span className="font-mono text-[9px] px-1.5 py-0.5 rounded-full bg-sw-purple-dim text-sw-purple">{s.confidence}% confidence</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 p-2.5 rounded-xl bg-sw-red-dim/30 border border-sw-red/10">
                    <p className="text-xs text-foreground">{s.from.campaign}</p>
                    <p className="font-mono text-[10px] text-sw-red">ROAS {s.from.roas}</p>
                  </div>
                  <div className="flex-1 p-2.5 rounded-xl bg-sw-green-dim/30 border border-sw-green/10">
                    <p className="text-xs text-foreground">{s.to.campaign}</p>
                    <p className="font-mono text-[10px] text-sw-green">ROAS {s.to.roas}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] text-sw-green">💡 {s.projImpact}</p>
                  <button onClick={() => setCrossPlatformApplied(p => ({ ...p, [i]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-medium transition-all ${crossPlatformApplied[i] || applyAll ? "bg-sw-green-dim text-sw-green" : "bg-sw-purple/20 text-sw-purple hover:bg-sw-purple/30"}`}>
                    {crossPlatformApplied[i] || applyAll ? "✓ Applied" : "Apply Shift"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </PanelCard>

        <CampaignRecommendationsPanel />

        <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
          <button onClick={() => setGuardrailOpen(!guardrailOpen)} className="w-full p-4 flex items-center justify-between hover:bg-surface-2 transition-colors">
            <h3 className="text-sm font-medium text-foreground">Active guardrails</h3>
            {guardrailOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {guardrailOpen && (
            <div className="px-4 pb-4">
              <div className="space-y-2">
                {guardrailStatuses.map(gs => (
                  <div key={gs.type} className="flex items-center justify-between py-2 border-b border-subtle/50 last:border-b-0">
                    <span className="text-xs text-foreground">{gs.type}</span>
                    <div className="flex items-center gap-2">
                      {gs.tier1 ? <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "#FF5C5C" }}>🔴 Tier 1 active</span>
                        : gs.tier2 ? <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "#F5A623" }}>🟡 Tier 2 active</span>
                        : <span className="flex items-center gap-1 font-mono text-[9px]" style={{ color: "#2ECF8E" }}>🟢 Clear</span>}
                    </div>
                  </div>
                ))}
              </div>
              <button onClick={() => g.navigateTo("guardrails")} className="text-[11px] font-medium mt-3 inline-block" style={{ color: "#4F7FFF" }}>Edit guardrails →</button>
            </div>
          )}
        </div>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Budget Utilisation by Campaign" badge="Spend / Cap Ratio" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={budgetUtilData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={false} vertical={true} />
                <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} width={120} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="ratio" radius={[0, 4, 4, 0]} name="Utilisation %">
                  {budgetUtilData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Wasted Spend Analysis" badge="Efficiency Breakdown" badgeColor="red" delay={0.1}>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width={200} height={200}>
                <PieChart>
                  <Pie data={wastedSpendData} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2}>
                    {wastedSpendData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {wastedSpendData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="text-xs text-foreground">{d.name}</span>
                    <span className="font-mono text-xs text-muted-foreground">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </PanelCard>

          <div className="rounded-xl border border-subtle bg-surface-1 p-5">
            <h3 className="text-sm font-medium text-foreground mb-1">Budget Shift Impact Simulator</h3>
            <p className="text-[11px] text-muted-foreground mb-3">Estimate the ROAS impact of moving budget between campaigns (read-only)</p>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="text-[10px] text-muted-foreground">From Campaign</label><p className="text-xs text-foreground mt-1">Sunfeast Retargeting (2.1x ROAS)</p></div>
              <div><label className="text-[10px] text-muted-foreground">To Campaign</label><p className="text-xs text-foreground mt-1">Parle-G 120g — SP (5.1x ROAS)</p></div>
              <div><label className="text-[10px] text-muted-foreground">Amount</label><p className="text-xs text-foreground mt-1">₹ 40,000</p></div>
            </div>
            <div className="mt-3 p-3 rounded-xl bg-sw-green-dim border border-sw-green/20">
              <p className="text-[11px] text-foreground">Estimated impact: Blended ROAS +0.4x, incremental conversions +1,200</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetOptimiserView;
