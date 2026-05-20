import React, { useState, useCallback } from "react";
import PanelCard from "@/components/sw/PanelCard";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { useToast } from "@/hooks/use-toast";
import { Target, ChevronRight, ChevronDown, GripVertical, Shield, Zap, AlertTriangle, CheckCircle2, Minus, Plus, X, Lock, Info, RefreshCw, Send, MessageSquare, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

/* ── Types ── */
type GoalType = "Increase ROAS" | "Increase Market Share" | "Increase Availability" | "Increase SoS" | "Increase Content Score";
type InputMode = "percentage" | "absolute";
type PhaseId = "prelaunch" | "live" | "optimise";
type CardStatus = "Auto-configured" | "Content gap" | "Shelf gap" | "Conditional";

interface SkuOption { id: string; name: string; contentScore: number; availability: number; platform: string; }
interface CampaignCard { id: string; name: string; budget: string; platform: string; status: CardStatus; source: string; skuId?: string; warning?: string; alternatives?: { skuId: string; name: string; contentScore: number; availability: number }[]; }
interface StrategyDiff { type: "add" | "change" | "remove"; desc: string; impact: string; }
interface RuleCondition { metric: string; direction: "increases" | "decreases"; threshold: string; unit: "%" | "abs"; }
interface RuleAction { action: string; value: string; }
interface Rule { id: string; conditions: RuleCondition[]; actions: RuleAction[]; enabled: boolean; }

/* ── Beverages SKU catalogue ── */
const skuCatalogue: SkuOption[] = [
  { id: "sku-gd200", name: "Pepsi 1L", contentScore: 82, availability: 96, platform: "Carrefour" },
  { id: "sku-gd100", name: "Pepsi 1L 100g", contentScore: 78, availability: 91, platform: "Noon" },
  { id: "sku-mg250", name: "7UP 1L", contentScore: 45, availability: 42, platform: "Carrefour" },
  { id: "sku-5050", name: "Lipton Ice Tea Peach 320ml", contentScore: 38, availability: 55, platform: "Talabat" },
  { id: "sku-nc", name: "Aquafina 1.5L", contentScore: 88, availability: 94, platform: "Noon Minutes" },
  { id: "sku-mf", name: "Mirinda 150g", contentScore: 72, availability: 89, platform: "Talabat" },
  { id: "sku-treat", name: "Mirinda Orange 1L 75g", contentScore: 91, availability: 97, platform: "Talabat" },
  { id: "sku-bourbon", name: "Mountain Dew 1L", contentScore: 65, availability: 80, platform: "Carrefour" },
  { id: "sku-jim", name: "Jim Jam Cream 100g", contentScore: 52, availability: 68, platform: "Noon" },
  { id: "sku-tiger", name: "Tiger Glucose 250g", contentScore: 34, availability: 38, platform: "Noon Minutes" },
];

const buildCards = (selectedSkus: string[]): Record<PhaseId, CampaignCard[]> => {
  const selected = skuCatalogue.filter(s => selectedSkus.includes(s.id));
  const prelaunch: CampaignCard[] = [];
  const live: CampaignCard[] = [];
  const optimise: CampaignCard[] = [];
  selected.forEach(sku => {
    const hasContentIssue = sku.contentScore < 60;
    const hasAvailIssue = sku.availability < 70;
    const alternatives = skuCatalogue.filter(s => s.id !== sku.id && s.contentScore >= 70 && s.availability >= 80).slice(0, 3).map(s => ({ skuId: s.id, name: s.name, contentScore: s.contentScore, availability: s.availability }));
    if (hasContentIssue || hasAvailIssue) {
      prelaunch.push({ id: `fix-${sku.id}`, name: `Content/Availability Fix — ${sku.name}`, budget: "AED 5K", platform: sku.platform, status: hasContentIssue ? "Content gap" : "Shelf gap", source: hasContentIssue ? `Content score: ${sku.contentScore}/100` : `Availability: ${sku.availability}%`, skuId: sku.id, warning: hasContentIssue ? `⚠ ${sku.name} has content score ${sku.contentScore}/100.` : `⚠ ${sku.name} has ${sku.availability}% availability.`, alternatives });
    }
    live.push({ id: `live-${sku.id}`, name: `Boost — ${sku.name}`, budget: "AED 30K", platform: sku.platform, status: (hasContentIssue || hasAvailIssue) ? "Conditional" : "Auto-configured", source: (hasContentIssue || hasAvailIssue) ? "Requires pre-launch clearance" : "Discovery trending", skuId: sku.id, warning: (hasContentIssue || hasAvailIssue) ? `Conditional on pre-launch clearance.` : undefined, alternatives: (hasContentIssue || hasAvailIssue) ? alternatives : undefined });
  });
  // Optimise cards are specific to the campaigns being created
  selected.forEach(sku => {
    optimise.push({ id: `opt-bid-${sku.id}`, name: `Bid Optimisation — ${sku.name}`, budget: "AED 10K", platform: sku.platform, status: "Auto-configured", source: `ROAS optimisation for ${sku.name} campaign` });
  });
  if (selected.length > 1) {
    optimise.push({ id: "opt-daypart", name: `Daypart Shift — ${selected.map(s => s.name.split(" ")[0]).join(" & ")} Campaigns`, budget: "AED 8K", platform: selected.map(s => s.platform).filter((v, i, a) => a.indexOf(v) === i).join(", "), status: "Conditional", source: "Conversion pattern analysis across selected campaigns" });
  }
  return { prelaunch, live, optimise };
};

const phaseConfig: Record<PhaseId, { label: string; pct: number; color: string }> = {
  prelaunch: { label: "Pre-launch", pct: 20, color: "#4F7FFF" },
  live: { label: "Live", pct: 60, color: "#2ECF8E" },
  optimise: { label: "Optimise", pct: 20, color: "#F5A623" },
};

const statusChipColor: Record<CardStatus, string> = { "Auto-configured": "#2ECF8E", "Content gap": "#F5A623", "Shelf gap": "#FF5C5C", "Conditional": "#A78BFA" };
const goalTypes: GoalType[] = ["Increase ROAS", "Increase Market Share", "Increase Availability", "Increase SoS", "Increase Content Score"];

const ruleMetrics = ["ROAS", "CTR", "CPC", "Impressions", "Clicks", "Spend", "Availability", "Content Score", "SoS %", "Conversion Rate"];
const ruleActions = ["Increase bid by", "Decrease bid by", "Pause campaign", "Increase budget by", "Decrease budget by", "Add keyword", "Remove keyword", "Change daypart"];

const WarRoomView: React.FC = () => {
  const g = useGuardrails();
  const { toast } = useToast();

  const [goalType, setGoalType] = useState<GoalType>("Increase ROAS");
  const [inputMode, setInputMode] = useState<InputMode>("percentage");
  const [goalValue, setGoalValue] = useState("15");
  const [budgetAlloc, setBudgetAlloc] = useState("50000");
  const [goalDate, setGoalDate] = useState("2026-04-30");
  const [goalSet, setGoalSet] = useState(false);
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const [phases, setPhases] = useState<Record<PhaseId, CampaignCard[]>>({ prelaunch: [], live: [], optimise: [] });
  const [dragCard, setDragCard] = useState<{ card: CampaignCard; from: PhaseId } | null>(null);
  const [prelaunchCleared, setPrelaunchCleared] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showBudgetSplit, setShowBudgetSplit] = useState(false);

  // Rule flow
  const [rules, setRules] = useState<Rule[]>([
    { id: "r1", conditions: [{ metric: "ROAS", direction: "decreases", threshold: "3.0", unit: "abs" }], actions: [{ action: "Decrease bid by", value: "10%" }], enabled: true },
    { id: "r2", conditions: [{ metric: "CTR", direction: "increases", threshold: "20", unit: "%" }], actions: [{ action: "Increase budget by", value: "15%" }], enabled: true },
  ]);
  const [showRuleBuilder, setShowRuleBuilder] = useState(false);

  // Chat prompt — multi-step flow
  const [showChat, setShowChat] = useState(false);
  type ChatStep = "goal" | "sku-select" | "details" | "generating" | "done";
  const [chatStep, setChatStep] = useState<ChatStep>("goal");
  const [chatMessages, setChatMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatSkuSelection, setChatSkuSelection] = useState<string[]>([]);
  const [chatParsedGoal, setChatParsedGoal] = useState("");

  const toggleSku = (id: string) => setSelectedSkus(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const prelaunchHasIssues = phases.prelaunch.some(c => c.status === "Content gap" || c.status === "Shelf gap");
  const currentProgress = 62;
  const totalCards = Object.values(phases).flat().length;

  const diffs: StrategyDiff[] = [
    { type: "add", desc: "Shelf gap fix for 7UP on Carrefour", impact: "+AED 5K budget" },
    { type: "change", desc: "Lipton Ice Tea content fix prioritised in pre-launch", impact: "AED 5K reallocated" },
    { type: "remove", desc: "Low-availability Tiger Glucose campaign deferred", impact: "−AED 30K deferred" },
  ];

  const guardrailHealth = [
    { name: "Budget cap", ok: true },
    { name: "ROAS floor", ok: true },
    { name: "Velocity limit", ok: false },
    { name: "Availability threshold", ok: true },
  ];

  const budgetSplitData = [
    { phase: "Pre-launch", amount: "AED 10,000", pct: "20%", rationale: "Content fixes for 7UP (AED 5K) + Availability fix for Lipton Ice Tea (AED 5K)" },
    { phase: "Live", amount: "AED 30,000", pct: "60%", rationale: "Pepsi Boost (AED 15K) + Aquafina Boost (AED 15K) — highest ROAS products" },
    { phase: "Optimise", amount: "AED 10,000", pct: "20%", rationale: "Bid optimisation (AED 6K) + Daypart shift (AED 4K) based on conversion patterns" },
  ];

  const handleSetGoal = () => {
    if (!goalValue || !goalDate || selectedSkus.length === 0) {
      toast({ title: "Missing inputs", description: "Select at least one SKU and set a target value." });
      return;
    }
    const generatedPhases = buildCards(selectedSkus);
    setPhases(generatedPhases);
    setGoalSet(true);
    setPrelaunchCleared(false);
    setShowBudgetSplit(false);
    const unit = inputMode === "percentage" ? "%" : " (absolute)";
    toast({ title: "Strategy generated", description: `${goalType}: +${goalValue}${unit} by ${goalDate} · ${selectedSkus.length} SKUs` });
  };

  const handleDrop = (targetPhase: PhaseId) => {
    if (!dragCard || dragCard.from === targetPhase) { setDragCard(null); return; }
    if (targetPhase === "live" && !prelaunchCleared && prelaunchHasIssues) {
      toast({ title: "Pre-launch not cleared", description: "Resolve issues before moving cards to Live." });
      setDragCard(null);
      return;
    }
    setPhases(prev => {
      const fromCards = prev[dragCard.from].filter(c => c.id !== dragCard.card.id);
      const toCards = [...prev[targetPhase], dragCard.card];
      return { ...prev, [dragCard.from]: fromCards, [targetPhase]: toCards };
    });
    toast({ title: "Card moved", description: `${dragCard.card.name} → ${phaseConfig[targetPhase].label}` });
    setDragCard(null);
  };

  const handleClearPrelaunch = () => { setPrelaunchCleared(true); toast({ title: "Pre-launch cleared ✓" }); };

  const handleSwapSku = (cardId: string, phase: PhaseId, altSkuId: string) => {
    const altSku = skuCatalogue.find(s => s.id === altSkuId);
    if (!altSku) return;
    setPhases(prev => ({
      ...prev,
      [phase]: prev[phase].map(c => {
        if (c.id !== cardId) return c;
        return { ...c, name: c.name.replace(/—.*/, `— ${altSku.name}`), skuId: altSku.id, platform: altSku.platform, status: (altSku.contentScore >= 60 && altSku.availability >= 70) ? "Auto-configured" : c.status, warning: (altSku.contentScore >= 60 && altSku.availability >= 70) ? undefined : c.warning, source: (altSku.contentScore >= 60 && altSku.availability >= 70) ? "Alternative SKU (healthy)" : c.source, alternatives: c.alternatives?.filter(a => a.skuId !== altSkuId) };
      }),
    }));
    toast({ title: "SKU swapped", description: `Replaced with ${altSku.name}` });
  };

  const handleActivate = () => {
    if (!prelaunchCleared && prelaunchHasIssues) { toast({ title: "Cannot activate", description: "Clear pre-launch first." }); return; }
    toast({ title: "War Room Activated", description: "Campaigns wired to Campaign Manager, constraints to Guardrails." });
    g.navigateTo("campaigns", "campaign-digest");
  };

  const addRule = () => {
    setRules(prev => [...prev, { id: `r${Date.now()}`, conditions: [{ metric: "ROAS", direction: "decreases", threshold: "2.0", unit: "abs" }], actions: [{ action: "Pause campaign", value: "" }], enabled: true }]);
  };

  const updateRuleCondition = (ruleId: string, idx: number, field: keyof RuleCondition, value: string) => {
    setRules(prev => prev.map(r => r.id !== ruleId ? r : { ...r, conditions: r.conditions.map((c, i) => i !== idx ? c : { ...c, [field]: value }) }));
  };

  const updateRuleAction = (ruleId: string, idx: number, field: keyof RuleAction, value: string) => {
    setRules(prev => prev.map(r => r.id !== ruleId ? r : { ...r, actions: r.actions.map((a, i) => i !== idx ? a : { ...a, [field]: value }) }));
  };

  const resetChat = () => {
    setChatStep("goal");
    setChatMessages([]);
    setChatInput("");
    setChatSkuSelection([]);
    setChatParsedGoal("");
  };

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: "user", text: userMsg }]);
    setChatInput("");

    if (chatStep === "goal") {
      setChatParsedGoal(userMsg);
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: "ai", text: `Great! I understand your goal: "${userMsg}".\n\nNow select the SKUs you want to include in this strategy:` }]);
        setChatStep("sku-select");
      }, 600);
    } else if (chatStep === "details") {
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: "ai", text: `Perfect. Generating your strategy canvas now...\n\n• Goal: ${chatParsedGoal}\n• SKUs: ${chatSkuSelection.map(id => skuCatalogue.find(s => s.id === id)?.name).join(", ")}\n• Additional: ${userMsg}\n• Rule engine: ${rules.filter(r => r.enabled).length} active rules applied` }]);
        setChatStep("generating");
        setTimeout(() => {
          setSelectedSkus(chatSkuSelection);
          setGoalValue("15");
          setGoalDate("2026-04-30");
          const generatedPhases = buildCards(chatSkuSelection);
          setPhases(generatedPhases);
          setGoalSet(true);
          setPrelaunchCleared(false);
          setShowBudgetSplit(false);
          setChatStep("done");
          setChatMessages(prev => [...prev, { role: "ai", text: "✅ Strategy canvas generated! Close this dialog to view your phased campaign strategy." }]);
        }, 1500);
      }, 600);
    }
  };

  const handleChatSkuConfirm = () => {
    if (chatSkuSelection.length === 0) {
      toast({ title: "Select at least one SKU" });
      return;
    }
    const names = chatSkuSelection.map(id => skuCatalogue.find(s => s.id === id)?.name).join(", ");
    setChatMessages(prev => [
      ...prev,
      { role: "user", text: `Selected: ${names}` },
      { role: "ai", text: `Got it — ${chatSkuSelection.length} SKU(s) selected.\n\nAnything else to add? (budget preference, timeline, specific platform focus, etc.) Or just type "go" to generate.` },
    ]);
    setChatStep("details");
  };

  const toggleChatSku = (id: string) => {
    setChatSkuSelection(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Target size={20} className="text-primary" /> War Room
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Set goals, configure rules, and generate phased campaign strategies.</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => { resetChat(); setShowChat(true); }} className="flex items-center gap-1.5 text-[11px] px-3 py-1.5 rounded-lg bg-primary/15 text-primary hover:bg-primary/25">
            <MessageSquare size={13} /> Chat to Strategy
          </button>
          <button onClick={() => setShowRuleBuilder(!showRuleBuilder)} className={`text-[11px] px-3 py-1.5 rounded-lg ${showRuleBuilder ? "bg-sw-amber/15 text-sw-amber" : "bg-surface-3 text-foreground hover:bg-surface-2"}`}>
            <Shield size={13} className="inline mr-1" /> Rule Engine
          </button>
          {goalSet && (
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-3 text-foreground hover:bg-surface-2">
              {sidebarOpen ? "Hide" : "Show"} Strategy Panel
            </button>
          )}
        </div>
      </div>

      {/* Chat to Strategy Dialog */}
      <Dialog open={showChat} onOpenChange={(open) => { setShowChat(open); if (!open && chatStep === "done") { /* keep generated state */ } }}>
        <DialogContent className="sm:max-w-[640px] max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <MessageSquare size={16} className="text-primary" /> Chat to Strategy Canvas
              <span className="ml-auto text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                {chatStep === "goal" && "Step 1: Define Goal"}
                {chatStep === "sku-select" && "Step 2: Select SKUs"}
                {chatStep === "details" && "Step 3: Add Details"}
                {chatStep === "generating" && "Generating…"}
                {chatStep === "done" && "Complete ✓"}
              </span>
            </DialogTitle>
          </DialogHeader>

          {/* Messages */}
          <div className="flex-1 space-y-3 max-h-[350px] overflow-y-auto py-3">
            {chatMessages.length === 0 && (
              <p className="text-[11px] text-muted-foreground italic">Describe your goal — e.g. "I want to increase ROAS by 20% for Pepsi products in 2 weeks"</p>
            )}
            {chatMessages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-xl p-3 text-[11px] whitespace-pre-line ${m.role === "user" ? "bg-primary/15 text-primary" : "bg-muted text-foreground border border-border"}`}>
                  {m.text}
                </div>
              </div>
            ))}

            {/* SKU picker inline */}
            {chatStep === "sku-select" && (
              <div className="rounded-xl border border-border bg-muted/50 p-3 space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Select SKUs for strategy</p>
                <div className="grid grid-cols-2 gap-1.5 max-h-[200px] overflow-y-auto">
                  {skuCatalogue.map(sku => {
                    const selected = chatSkuSelection.includes(sku.id);
                    return (
                      <button key={sku.id} onClick={() => toggleChatSku(sku.id)}
                        className={`text-left p-2 rounded-lg border text-[11px] transition-all ${selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-background text-foreground hover:bg-muted"}`}>
                        <p className="font-medium truncate">{sku.name}</p>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          Content: {sku.contentScore}/100 · Avail: {sku.availability}% · {sku.platform}
                        </p>
                      </button>
                    );
                  })}
                </div>
                <button onClick={handleChatSkuConfirm}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium mt-2">
                  Confirm {chatSkuSelection.length} SKU{chatSkuSelection.length !== 1 ? "s" : ""} →
                </button>
              </div>
            )}
          </div>

          {/* Input — hidden during sku-select and generating/done */}
          {(chatStep === "goal" || chatStep === "details") && (
            <div className="flex gap-2 pt-2 border-t border-border">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === "Enter" && handleChatSend()}
                className="flex-1 bg-muted border border-border rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder={chatStep === "goal" ? "Describe your goal…" : "Add details or type 'go' to generate…"} />
              <button onClick={handleChatSend} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm"><Send size={14} /></button>
            </div>
          )}

          {chatStep === "done" && (
            <div className="pt-2 border-t border-border">
              <button onClick={() => setShowChat(false)} className="w-full py-2 rounded-lg bg-primary text-primary-foreground text-xs font-medium">
                View Strategy Canvas →
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Rule Engine */}
      {showRuleBuilder && (
        <PanelCard title="Rule Engine" badge={`${rules.filter(r => r.enabled).length} active`} badgeColor="amber" delay={0.05}>
          <p className="text-[10px] text-muted-foreground mb-3">Set IF/THEN rules to automate metric-driven campaign actions.</p>
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className={`rounded-xl border p-3 space-y-2 ${rule.enabled ? "border-subtle bg-surface-2/50" : "border-subtle/50 bg-surface-2/20 opacity-60"}`}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono text-sw-amber uppercase tracking-wider">IF</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setRules(prev => prev.map(r => r.id === rule.id ? { ...r, enabled: !r.enabled } : r))}
                      className={`px-2 py-0.5 rounded text-[9px] font-mono ${rule.enabled ? "bg-sw-green-dim text-sw-green" : "bg-surface-3 text-muted-foreground"}`}>
                      {rule.enabled ? "ON" : "OFF"}
                    </button>
                    <button onClick={() => setRules(prev => prev.filter(r => r.id !== rule.id))} className="text-muted-foreground hover:text-destructive"><X size={12} /></button>
                  </div>
                </div>
                {rule.conditions.map((cond, ci) => (
                  <div key={ci} className="flex items-center gap-2 flex-wrap">
                    <select value={cond.metric} onChange={e => updateRuleCondition(rule.id, ci, "metric", e.target.value)}
                      className="bg-surface-3 border border-subtle rounded-lg px-2 py-1.5 text-[11px] text-foreground">
                      {ruleMetrics.map(m => <option key={m}>{m}</option>)}
                    </select>
                    <button onClick={() => updateRuleCondition(rule.id, ci, "direction", cond.direction === "increases" ? "decreases" : "increases")}
                      className={`flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium border border-subtle ${cond.direction === "increases" ? "bg-sw-green/10 text-sw-green" : "bg-sw-red/10 text-sw-red"}`}>
                      {cond.direction === "increases" ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                      {cond.direction}
                    </button>
                    <span className="text-[10px] text-muted-foreground">by</span>
                    <input value={cond.threshold} onChange={e => updateRuleCondition(rule.id, ci, "threshold", e.target.value)}
                      className="w-16 bg-surface-3 border border-subtle rounded-lg px-2 py-1.5 text-[11px] text-foreground font-mono" />
                    <select value={cond.unit} onChange={e => updateRuleCondition(rule.id, ci, "unit", e.target.value as "%" | "abs")}
                      className="bg-surface-3 border border-subtle rounded-lg px-2 py-1.5 text-[11px] text-foreground">
                      <option value="%">%</option>
                      <option value="abs">absolute</option>
                    </select>
                  </div>
                ))}
                <span className="text-[10px] font-mono text-primary uppercase tracking-wider">THEN</span>
                {rule.actions.map((act, ai) => (
                  <div key={ai} className="flex items-center gap-2 flex-wrap">
                    <select value={act.action} onChange={e => updateRuleAction(rule.id, ai, "action", e.target.value)}
                      className="bg-surface-3 border border-subtle rounded-lg px-2 py-1.5 text-[11px] text-foreground">
                      {ruleActions.map(a => <option key={a}>{a}</option>)}
                    </select>
                    {!act.action.includes("Pause") && (
                      <input value={act.value} onChange={e => updateRuleAction(rule.id, ai, "value", e.target.value)}
                        className="w-20 bg-surface-3 border border-subtle rounded-lg px-2 py-1.5 text-[11px] text-foreground font-mono" placeholder="10%" />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <button onClick={addRule} className="mt-3 flex items-center gap-1.5 text-[11px] text-primary hover:text-primary/80">
            <Plus size={12} /> Add Rule
          </button>
        </PanelCard>
      )}

      {/* Step 1 — Goal + SKU Input */}
      {!goalSet ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <PanelCard title="Define your incremental goal" badge="Step 1" badgeColor="accent" delay={0.05}>
            <div className="space-y-4">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Goal type</label>
                <div className="flex gap-2 flex-wrap">
                  {goalTypes.map(gt => (
                    <button key={gt} onClick={() => setGoalType(gt)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${goalType === gt ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                      {gt}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Increment type</label>
                <div className="flex gap-2">
                  <button onClick={() => { setInputMode("percentage"); setShowBudgetSplit(false); }}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${inputMode === "percentage" ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>
                    % Increase
                  </button>
                  <button onClick={() => setInputMode("absolute")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${inputMode === "absolute" ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>
                    Absolute Value
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">
                    {inputMode === "percentage" ? "% Increase" : "Absolute increase"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input value={goalValue} onChange={e => setGoalValue(e.target.value)}
                      className="flex-1 bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground font-mono" placeholder={inputMode === "percentage" ? "15" : "2.0"} />
                    <span className="text-xs text-muted-foreground">{inputMode === "percentage" ? "%" : "units"}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Target date</label>
                  <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)}
                    className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" />
                </div>
              </div>

              {/* Campaign budget — only for absolute mode */}
              {inputMode === "absolute" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-[11px] text-muted-foreground block mb-1">Campaign budget (AED )</label>
                    <input value={budgetAlloc} onChange={e => setBudgetAlloc(e.target.value)}
                      className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground font-mono" placeholder="50000" />
                  </div>
                  {budgetAlloc && Number(budgetAlloc) > 0 && (
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-[10px] font-mono text-primary uppercase tracking-wider">Budget Split Recommendation</p>
                        <button onClick={() => setShowBudgetSplit(!showBudgetSplit)} className="text-[10px] text-primary hover:underline">
                          {showBudgetSplit ? "Hide details" : "Show details"}
                        </button>
                      </div>
                      <div className="flex h-6 rounded-lg overflow-hidden">
                        <div className="flex items-center justify-center text-[8px] font-mono text-foreground" style={{ width: "20%", backgroundColor: "#4F7FFF30" }}>Pre 20%</div>
                        <div className="flex items-center justify-center text-[8px] font-mono text-foreground" style={{ width: "60%", backgroundColor: "#2ECF8E30" }}>Live 60%</div>
                        <div className="flex items-center justify-center text-[8px] font-mono text-foreground" style={{ width: "20%", backgroundColor: "#F5A62330" }}>Opt 20%</div>
                      </div>
                      {showBudgetSplit && (
                        <div className="space-y-2 mt-2">
                          {budgetSplitData.map((bs, i) => (
                            <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-surface-2 border border-subtle">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-medium text-foreground">{bs.phase}</span>
                                  <span className="font-mono text-[10px] text-primary">{bs.amount}</span>
                                  <span className="font-mono text-[9px] text-muted-foreground">({bs.pct})</span>
                                </div>
                                <p className="text-[10px] text-muted-foreground mt-0.5">{bs.rationale}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </PanelCard>

          <PanelCard title="Select SKUs for boost" badge={`${selectedSkus.length} selected`} badgeColor={selectedSkus.length > 0 ? "green" : "accent"} delay={0.1}>
            <div className="grid grid-cols-2 gap-2">
              {skuCatalogue.map(sku => {
                const isSelected = selectedSkus.includes(sku.id);
                const hasIssue = sku.contentScore < 60 || sku.availability < 70;
                return (
                  <button key={sku.id} onClick={() => toggleSku(sku.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${isSelected ? "border-primary/40 bg-primary/10" : "border-subtle bg-surface-2 hover:bg-surface-3"}`}>
                    <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${isSelected ? "border-primary bg-primary/20" : "border-subtle"}`}>
                      {isSelected && <CheckCircle2 size={12} className="text-primary" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-medium text-foreground truncate">{sku.name}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{sku.platform}</span>
                        <span className={`font-mono text-[9px] ${sku.contentScore >= 60 ? "text-sw-green" : "text-sw-red"}`}>CS:{sku.contentScore}</span>
                        <span className={`font-mono text-[9px] ${sku.availability >= 70 ? "text-sw-green" : "text-sw-red"}`}>AV:{sku.availability}%</span>
                      </div>
                    </div>
                    {hasIssue && <AlertTriangle size={12} className="text-sw-amber flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          </PanelCard>

          <button onClick={handleSetGoal} disabled={selectedSkus.length === 0}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${selectedSkus.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/80" : "bg-surface-3 text-muted-foreground cursor-not-allowed"}`}>
            Generate Strategy Canvas
          </button>
        </div>
      ) : (
        /* Step 2 — Phase Canvas */
        <div className="flex gap-4">
          <div className={`flex-1 space-y-4 ${sidebarOpen ? "mr-80" : ""}`}>
            <div className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Target size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm text-foreground font-medium">{goalType}: +{goalValue}{inputMode === "percentage" ? "%" : ""}</span>
              <span className="text-[11px] text-muted-foreground">
                {inputMode === "absolute" ? `Budget: AED ${Number(budgetAlloc).toLocaleString()} · ` : ""}by {goalDate}
              </span>
              <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">{totalCards} campaigns · {selectedSkus.length} SKUs</span>
              <button onClick={() => { setGoalSet(false); setPrelaunchCleared(false); }} className="text-[10px] text-muted-foreground hover:text-foreground">Edit goal</button>
            </div>

            {prelaunchHasIssues && !prelaunchCleared && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-sw-red/10 border border-sw-red/20">
                <Lock size={16} className="text-sw-red flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-sw-red">Pre-launch gate: LOCKED</p>
                  <p className="text-[10px] text-muted-foreground">Resolve issues or swap SKUs before going live.</p>
                </div>
                <button onClick={handleClearPrelaunch} className="text-[10px] px-3 py-1.5 rounded-lg bg-sw-red/20 text-sw-red hover:bg-sw-red/30 font-medium">Override & Clear</button>
              </div>
            )}
            {prelaunchCleared && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-sw-green/10 border border-sw-green/20">
                <CheckCircle2 size={14} className="text-sw-green" />
                <span className="text-[11px] text-sw-green font-medium">Pre-launch cleared — Live phase unlocked</span>
              </div>
            )}

            <div className="flex h-8 rounded-xl overflow-hidden border border-subtle">
              {(Object.keys(phaseConfig) as PhaseId[]).map(pid => (
                <div key={pid} className="flex items-center justify-center" style={{ width: `${phaseConfig[pid].pct}%`, backgroundColor: `${phaseConfig[pid].color}20` }}>
                  <span className="text-[9px] font-mono text-foreground">{phaseConfig[pid].label} · {phaseConfig[pid].pct}%</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(phaseConfig) as PhaseId[]).map(pid => {
                const isLocked = pid === "live" && !prelaunchCleared && prelaunchHasIssues;
                return (
                  <div key={pid} className={`rounded-xl border bg-surface-1 p-3 min-h-[300px] ${isLocked ? "border-sw-red/30 opacity-70" : "border-subtle"}`}
                    onDragOver={e => { if (!isLocked) e.preventDefault(); }} onDrop={() => handleDrop(pid)}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phaseConfig[pid].color }} />
                      <span className="text-xs font-medium text-foreground">{phaseConfig[pid].label}</span>
                      {isLocked && <Lock size={10} className="text-sw-red" />}
                      {pid === "prelaunch" && <span className="text-[8px] font-mono text-sw-amber ml-auto">HARD STOP</span>}
                      <span className="ml-auto font-mono text-[9px] text-muted-foreground">{phases[pid].length}</span>
                    </div>
                    <div className="space-y-2">
                      {phases[pid].map(card => (
                        <div key={card.id} draggable={!isLocked} onDragStart={() => setDragCard({ card, from: pid })}
                          className="p-3 rounded-xl bg-surface-2 border border-subtle cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <GripVertical size={10} className="text-muted-foreground" />
                            <span className="text-[11px] text-foreground font-medium flex-1 truncate">{card.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] mb-1.5">
                            <span className="font-mono text-foreground">{card.budget}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{card.platform}</span>
                          </div>
                          <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${statusChipColor[card.status]}15`, color: statusChipColor[card.status] }}>
                            {card.status}
                          </span>
                          <p className="text-[9px] text-muted-foreground mt-1">{card.source}</p>
                          {card.warning && (
                            <div className="mt-2 p-2 rounded-lg bg-sw-amber/10 border border-sw-amber/20">
                              <p className="text-[9px] text-sw-amber">{card.warning}</p>
                              {card.alternatives && card.alternatives.length > 0 && (
                                <div className="mt-1.5 space-y-1">
                                  <p className="text-[8px] text-muted-foreground font-mono uppercase">Suggested alternatives:</p>
                                  {card.alternatives.map(alt => (
                                    <button key={alt.skuId} onClick={() => handleSwapSku(card.id, pid, alt.skuId)}
                                      className="w-full flex items-center gap-2 p-1.5 rounded-lg bg-surface-3 hover:bg-primary/10 text-left transition-all">
                                      <RefreshCw size={8} className="text-primary flex-shrink-0" />
                                      <span className="text-[9px] text-foreground flex-1 truncate">{alt.name}</span>
                                      <span className="text-[8px] font-mono text-sw-green">CS:{alt.contentScore} AV:{alt.availability}%</span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right sidebar */}
          {sidebarOpen && (
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-surface-1 border-l border-subtle p-4 overflow-y-auto z-40 space-y-4 pt-20">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"><X size={14} /></button>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Goal Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${currentProgress}%`, backgroundColor: currentProgress >= 80 ? "#2ECF8E" : currentProgress >= 50 ? "#F5A623" : "#FF5C5C" }} />
                  </div>
                  <span className="font-mono text-sm font-bold text-foreground">{currentProgress}%</span>
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Strategy Diff</p>
                <div className="space-y-1.5">
                  {diffs.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-2 border border-subtle">
                      {d.type === "add" && <Plus size={10} className="text-sw-green mt-0.5 flex-shrink-0" />}
                      {d.type === "change" && <Zap size={10} className="text-sw-amber mt-0.5 flex-shrink-0" />}
                      {d.type === "remove" && <Minus size={10} className="text-sw-red mt-0.5 flex-shrink-0" />}
                      <div className="flex-1"><p className="text-[11px] text-foreground">{d.desc}</p><p className="text-[9px] font-mono text-muted-foreground">{d.impact}</p></div>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Active Rules</p>
                <div className="space-y-1">
                  {rules.filter(r => r.enabled).map(r => (
                    <div key={r.id} className="p-2 rounded-lg bg-surface-2 border border-subtle">
                      <p className="text-[10px] text-foreground">IF {r.conditions.map(c => `${c.metric} ${c.direction} ${c.threshold}${c.unit}`).join(" AND ")}</p>
                      <p className="text-[10px] text-primary">THEN {r.actions.map(a => `${a.action} ${a.value}`).join(", ")}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Guardrail Health</p>
                <div className="space-y-1">
                  {guardrailHealth.map(gh => (
                    <div key={gh.name} className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] text-foreground">{gh.name}</span>
                      {gh.ok ? <CheckCircle2 size={12} className="text-sw-green" /> : <AlertTriangle size={12} className="text-sw-amber" />}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {goalSet && (
        <div className="fixed bottom-0 left-[68px] right-0 bg-surface-1 border-t border-subtle p-4 z-50 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            {totalCards} campaigns · {selectedSkus.length} SKUs
            {inputMode === "absolute" && ` · Budget: AED ${Number(budgetAlloc).toLocaleString()}`}
            {prelaunchHasIssues && !prelaunchCleared && <span className="text-sw-red ml-2">· Pre-launch gate: LOCKED</span>}
          </div>
          <button onClick={handleActivate}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${prelaunchHasIssues && !prelaunchCleared ? "bg-surface-3 text-muted-foreground cursor-not-allowed" : "bg-primary text-primary-foreground hover:bg-primary/80"}`}>
            <Zap size={14} /> Activate War Room
          </button>
        </div>
      )}
    </div>
  );
};

export default WarRoomView;
