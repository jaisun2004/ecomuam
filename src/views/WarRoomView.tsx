import React, { useState, useCallback } from "react";
import PanelCard from "@/components/sw/PanelCard";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { useToast } from "@/hooks/use-toast";
import { Target, ChevronRight, ChevronDown, GripVertical, Shield, Zap, AlertTriangle, CheckCircle2, Minus, Plus, X, Lock, Info, RefreshCw } from "lucide-react";

/* ── Types ── */
type GoalType = "Increase ROAS" | "Increase Market Share" | "Increase Availability" | "Increase SoS" | "Increase Content Score";
type InputMode = "percentage" | "absolute";
type PhaseId = "prelaunch" | "live" | "optimise";
type CardStatus = "Auto-configured" | "Content gap" | "Shelf gap" | "Conditional";

interface SkuOption {
  id: string;
  name: string;
  contentScore: number;
  availability: number;
  platform: string;
}

interface CampaignCard {
  id: string;
  name: string;
  budget: string;
  platform: string;
  status: CardStatus;
  source: string;
  skuId?: string;
  warning?: string;
  alternatives?: { skuId: string; name: string; contentScore: number; availability: number }[];
}

interface StrategyDiff {
  type: "add" | "change" | "remove";
  desc: string;
  impact: string;
}

/* ── Biscuits SKU catalogue ── */
const skuCatalogue: SkuOption[] = [
  { id: "sku-gd200", name: "Good Day Butter 200g", contentScore: 82, availability: 96, platform: "Amazon" },
  { id: "sku-gd100", name: "Good Day Butter 100g", contentScore: 78, availability: 91, platform: "Flipkart" },
  { id: "sku-mg250", name: "Marie Gold 250g", contentScore: 45, availability: 42, platform: "Amazon" },
  { id: "sku-5050", name: "50-50 Maska Chaska 120g", contentScore: 38, availability: 55, platform: "Blinkit" },
  { id: "sku-nc", name: "NutriChoice Digestive 100g", contentScore: 88, availability: 94, platform: "Zepto" },
  { id: "sku-mf", name: "Milk Bikis 150g", contentScore: 72, availability: 89, platform: "Instamart" },
  { id: "sku-treat", name: "Good Day Choco Chip 75g", contentScore: 91, availability: 97, platform: "Blinkit" },
  { id: "sku-bourbon", name: "Bourbon Cream 150g", contentScore: 65, availability: 80, platform: "Amazon" },
  { id: "sku-jim", name: "Jim Jam Cream 100g", contentScore: 52, availability: 68, platform: "Flipkart" },
  { id: "sku-tiger", name: "Tiger Glucose 250g", contentScore: 34, availability: 38, platform: "Zepto" },
];

/* ── Seed campaign cards per phase ── */
const buildCards = (selectedSkus: string[]): Record<PhaseId, CampaignCard[]> => {
  const selected = skuCatalogue.filter(s => selectedSkus.includes(s.id));
  const prelaunch: CampaignCard[] = [];
  const live: CampaignCard[] = [];
  const optimise: CampaignCard[] = [];

  selected.forEach(sku => {
    const hasContentIssue = sku.contentScore < 60;
    const hasAvailIssue = sku.availability < 70;
    const alternatives = skuCatalogue
      .filter(s => s.id !== sku.id && s.contentScore >= 70 && s.availability >= 80)
      .slice(0, 3)
      .map(s => ({ skuId: s.id, name: s.name, contentScore: s.contentScore, availability: s.availability }));

    if (hasContentIssue || hasAvailIssue) {
      prelaunch.push({
        id: `fix-${sku.id}`,
        name: `Content/Availability Fix — ${sku.name}`,
        budget: "₹5K",
        platform: sku.platform,
        status: hasContentIssue ? "Content gap" : "Shelf gap",
        source: hasContentIssue ? `Content score: ${sku.contentScore}/100` : `Availability: ${sku.availability}%`,
        skuId: sku.id,
        warning: hasContentIssue
          ? `⚠ ${sku.name} has a content score of ${sku.contentScore}/100. Fix content before going live for best results.`
          : `⚠ ${sku.name} has only ${sku.availability}% availability. Ensure stock before launch.`,
        alternatives,
      });
    }

    live.push({
      id: `live-${sku.id}`,
      name: `Boost — ${sku.name}`,
      budget: "₹30K",
      platform: sku.platform,
      status: (hasContentIssue || hasAvailIssue) ? "Conditional" : "Auto-configured",
      source: hasContentIssue || hasAvailIssue ? "Requires pre-launch clearance" : "Discovery trending",
      skuId: sku.id,
      warning: (hasContentIssue || hasAvailIssue)
        ? `This campaign is conditional on pre-launch phase clearance for ${sku.name}.`
        : undefined,
      alternatives: (hasContentIssue || hasAvailIssue) ? alternatives : undefined,
    });
  });

  if (selected.length > 0) {
    optimise.push({
      id: "opt-bid",
      name: "Bid Optimisation — Top SKUs",
      budget: "₹10K",
      platform: "Multi-platform",
      status: "Auto-configured",
      source: "ROAS optimisation",
    });
    optimise.push({
      id: "opt-daypart",
      name: "Daypart Shift — Peak Hours",
      budget: "₹8K",
      platform: "Multi-platform",
      status: "Conditional",
      source: "Conversion pattern analysis",
    });
  }

  return { prelaunch, live, optimise };
};

const phaseConfig: Record<PhaseId, { label: string; pct: number; color: string }> = {
  prelaunch: { label: "Pre-launch", pct: 20, color: "#4F7FFF" },
  live: { label: "Live", pct: 60, color: "#2ECF8E" },
  optimise: { label: "Optimise", pct: 20, color: "#F5A623" },
};

const statusChipColor: Record<CardStatus, string> = {
  "Auto-configured": "#2ECF8E",
  "Content gap": "#F5A623",
  "Shelf gap": "#FF5C5C",
  "Conditional": "#A78BFA",
};

const goalTypes: GoalType[] = ["Increase ROAS", "Increase Market Share", "Increase Availability", "Increase SoS", "Increase Content Score"];

const WarRoomView: React.FC = () => {
  const g = useGuardrails();
  const { toast } = useToast();

  /* Goal input */
  const [goalType, setGoalType] = useState<GoalType>("Increase ROAS");
  const [inputMode, setInputMode] = useState<InputMode>("percentage");
  const [goalValue, setGoalValue] = useState("15");
  const [budgetAlloc, setBudgetAlloc] = useState("50000");
  const [goalDate, setGoalDate] = useState("2026-04-30");
  const [goalSet, setGoalSet] = useState(false);

  /* SKU selection */
  const [selectedSkus, setSelectedSkus] = useState<string[]>([]);
  const toggleSku = (id: string) => {
    setSelectedSkus(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  /* Phase canvas */
  const [phases, setPhases] = useState<Record<PhaseId, CampaignCard[]>>({ prelaunch: [], live: [], optimise: [] });
  const [dragCard, setDragCard] = useState<{ card: CampaignCard; from: PhaseId } | null>(null);

  /* Pre-launch gate */
  const [prelaunchCleared, setPrelaunchCleared] = useState(false);
  const prelaunchHasIssues = phases.prelaunch.some(c => c.status === "Content gap" || c.status === "Shelf gap");

  /* Right sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const currentProgress = 62;

  const diffs: StrategyDiff[] = [
    { type: "add", desc: "Shelf gap fix for Marie Gold on Amazon", impact: "+₹5K budget" },
    { type: "change", desc: "50-50 content fix prioritised in pre-launch", impact: "₹5K reallocated" },
    { type: "remove", desc: "Low-availability Tiger Glucose campaign deferred", impact: "−₹30K deferred" },
  ];

  const guardrailHealth = [
    { name: "Budget cap", ok: true },
    { name: "ROAS floor", ok: true },
    { name: "Velocity limit", ok: false },
    { name: "Availability threshold", ok: true },
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
    const unit = inputMode === "percentage" ? "%" : " (absolute)";
    toast({ title: "Strategy generated", description: `${goalType}: +${goalValue}${unit} by ${goalDate} · ₹${Number(budgetAlloc).toLocaleString()} budget · ${selectedSkus.length} SKUs` });
  };

  const handleDrop = (targetPhase: PhaseId) => {
    if (!dragCard || dragCard.from === targetPhase) { setDragCard(null); return; }

    // Prevent moving TO live if pre-launch not cleared
    if (targetPhase === "live" && !prelaunchCleared && prelaunchHasIssues) {
      toast({ title: "Pre-launch not cleared", description: "Resolve all content and availability issues before moving cards to Live." });
      setDragCard(null);
      return;
    }

    setPhases(prev => {
      const fromCards = prev[dragCard.from].filter(c => c.id !== dragCard.card.id);
      const toCards = [...prev[targetPhase], dragCard.card];
      return { ...prev, [dragCard.from]: fromCards, [targetPhase]: toCards };
    });
    toast({ title: "Card moved", description: `${dragCard.card.name} → ${phaseConfig[targetPhase].label}. Tier 2 lock dates updated.` });
    setDragCard(null);
  };

  const handleClearPrelaunch = () => {
    setPrelaunchCleared(true);
    toast({ title: "Pre-launch cleared ✓", description: "Live phase is now unlocked. Campaigns can go live." });
  };

  const handleSwapSku = (cardId: string, phase: PhaseId, altSkuId: string) => {
    const altSku = skuCatalogue.find(s => s.id === altSkuId);
    if (!altSku) return;
    setPhases(prev => ({
      ...prev,
      [phase]: prev[phase].map(c => {
        if (c.id !== cardId) return c;
        return {
          ...c,
          name: c.name.replace(/—.*/, `— ${altSku.name}`),
          skuId: altSku.id,
          platform: altSku.platform,
          status: (altSku.contentScore >= 60 && altSku.availability >= 70) ? "Auto-configured" : c.status,
          warning: (altSku.contentScore >= 60 && altSku.availability >= 70) ? undefined : c.warning,
          source: (altSku.contentScore >= 60 && altSku.availability >= 70) ? "Alternative SKU (healthy)" : c.source,
          alternatives: c.alternatives?.filter(a => a.skuId !== altSkuId),
        };
      }),
    }));
    toast({ title: "SKU swapped", description: `Replaced with ${altSku.name} (Content: ${altSku.contentScore}, Avail: ${altSku.availability}%)` });
  };

  const handleActivate = () => {
    if (!prelaunchCleared && prelaunchHasIssues) {
      toast({ title: "Cannot activate", description: "Clear pre-launch phase first." });
      return;
    }
    toast({ title: "War Room Activated", description: "All campaigns wired to Campaign Manager, constraints to Guardrails, goal card added to Cockpit." });
    g.navigateTo("campaigns", "campaign-digest");
  };

  const totalCards = Object.values(phases).flat().length;

  return (
    <div className="pb-20">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Target size={20} className="text-primary" /> War Room
          </h1>
          <p className="text-xs text-muted-foreground mt-1">Set an incremental goal, select SKUs, and generate a phased campaign strategy.</p>
        </div>
        {goalSet && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-3 text-foreground hover:bg-surface-2">
            {sidebarOpen ? "Hide" : "Show"} Strategy Panel
          </button>
        )}
      </div>

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

              {/* Input mode toggle */}
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Increment type</label>
                <div className="flex gap-2">
                  <button onClick={() => setInputMode("percentage")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${inputMode === "percentage" ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>
                    % Increase
                  </button>
                  <button onClick={() => setInputMode("absolute")}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${inputMode === "absolute" ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>
                    Absolute Value
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
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
                  <label className="text-[11px] text-muted-foreground block mb-1">Campaign budget (₹)</label>
                  <input value={budgetAlloc} onChange={e => setBudgetAlloc(e.target.value)}
                    className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground font-mono" placeholder="50000" />
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Target date</label>
                  <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)}
                    className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" />
                </div>
              </div>
            </div>
          </PanelCard>

          {/* SKU Selection */}
          <PanelCard title="Select SKUs for boost" badge={`${selectedSkus.length} selected`} badgeColor={selectedSkus.length > 0 ? "green" : "accent"} delay={0.1}>
            <div className="grid grid-cols-2 gap-2">
              {skuCatalogue.map(sku => {
                const isSelected = selectedSkus.includes(sku.id);
                const hasIssue = sku.contentScore < 60 || sku.availability < 70;
                return (
                  <button key={sku.id} onClick={() => toggleSku(sku.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      isSelected ? "border-primary/40 bg-primary/10" : "border-subtle bg-surface-2 hover:bg-surface-3"
                    }`}>
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
            {selectedSkus.some(id => {
              const s = skuCatalogue.find(sk => sk.id === id);
              return s && (s.contentScore < 60 || s.availability < 70);
            }) && (
              <div className="mt-3 p-3 rounded-xl bg-sw-amber/10 border border-sw-amber/20 text-[11px] text-sw-amber flex items-start gap-2">
                <Info size={14} className="flex-shrink-0 mt-0.5" />
                <span>Some selected SKUs have poor content scores or availability. The strategy canvas will suggest alternatives and require pre-launch fixes before going live.</span>
              </div>
            )}
          </PanelCard>

          <button onClick={handleSetGoal}
            disabled={selectedSkus.length === 0}
            className={`w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              selectedSkus.length > 0 ? "bg-primary text-primary-foreground hover:bg-primary/80" : "bg-surface-3 text-muted-foreground cursor-not-allowed"
            }`}>
            Generate Strategy Canvas
          </button>
        </div>
      ) : (
        /* Step 2 — Phase Canvas */
        <div className="flex gap-4">
          <div className={`flex-1 space-y-4 ${sidebarOpen ? "mr-80" : ""}`}>
            {/* Goal summary bar */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Target size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm text-foreground font-medium">{goalType}: +{goalValue}{inputMode === "percentage" ? "%" : ""}</span>
              <span className="text-[11px] text-muted-foreground">Budget: ₹{Number(budgetAlloc).toLocaleString()} · by {goalDate}</span>
              <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">{totalCards} campaigns · {selectedSkus.length} SKUs</span>
              <button onClick={() => { setGoalSet(false); setPrelaunchCleared(false); }} className="text-[10px] text-muted-foreground hover:text-foreground">Edit goal</button>
            </div>

            {/* Pre-launch gate banner */}
            {prelaunchHasIssues && !prelaunchCleared && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-sw-red/10 border border-sw-red/20">
                <Lock size={16} className="text-sw-red flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-[11px] font-medium text-sw-red">Pre-launch gate: LOCKED</p>
                  <p className="text-[10px] text-muted-foreground">Resolve content/availability issues or swap SKUs before campaigns can go live.</p>
                </div>
                <button onClick={handleClearPrelaunch}
                  className="text-[10px] px-3 py-1.5 rounded-lg bg-sw-red/20 text-sw-red hover:bg-sw-red/30 font-medium">
                  Override & Clear
                </button>
              </div>
            )}
            {prelaunchCleared && (
              <div className="flex items-center gap-3 p-2 rounded-xl bg-sw-green/10 border border-sw-green/20">
                <CheckCircle2 size={14} className="text-sw-green" />
                <span className="text-[11px] text-sw-green font-medium">Pre-launch cleared — Live phase unlocked</span>
              </div>
            )}

            {/* Phase timeline bar */}
            <div className="flex h-8 rounded-xl overflow-hidden border border-subtle">
              {(Object.keys(phaseConfig) as PhaseId[]).map(pid => (
                <div key={pid} className="flex items-center justify-center" style={{ width: `${phaseConfig[pid].pct}%`, backgroundColor: `${phaseConfig[pid].color}20` }}>
                  <span className="text-[9px] font-mono text-foreground">{phaseConfig[pid].label} · {phaseConfig[pid].pct}%</span>
                </div>
              ))}
            </div>

            {/* 3-column canvas */}
            <div className="grid grid-cols-3 gap-4">
              {(Object.keys(phaseConfig) as PhaseId[]).map(pid => {
                const isLocked = pid === "live" && !prelaunchCleared && prelaunchHasIssues;
                return (
                  <div key={pid}
                    className={`rounded-xl border bg-surface-1 p-3 min-h-[300px] ${isLocked ? "border-sw-red/30 opacity-70" : "border-subtle"}`}
                    onDragOver={e => { if (!isLocked) e.preventDefault(); }}
                    onDrop={() => handleDrop(pid)}
                  >
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phaseConfig[pid].color }} />
                      <span className="text-xs font-medium text-foreground">{phaseConfig[pid].label}</span>
                      {isLocked && <Lock size={10} className="text-sw-red" />}
                      {pid === "prelaunch" && <span className="text-[8px] font-mono text-sw-amber ml-auto">HARD STOP</span>}
                      <span className="ml-auto font-mono text-[9px] text-muted-foreground">{phases[pid].length}</span>
                    </div>
                    <div className="space-y-2">
                      {phases[pid].map(card => (
                        <div key={card.id}
                          draggable={!isLocked}
                          onDragStart={() => setDragCard({ card, from: pid })}
                          className="p-3 rounded-xl bg-surface-2 border border-subtle cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all"
                        >
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <GripVertical size={10} className="text-muted-foreground" />
                            <span className="text-[11px] text-foreground font-medium flex-1 truncate">{card.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[9px] mb-1.5">
                            <span className="font-mono text-foreground">{card.budget}</span>
                            <span className="px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{card.platform}</span>
                          </div>
                          <span className="font-mono text-[8px] px-1.5 py-0.5 rounded-full" style={{
                            backgroundColor: `${statusChipColor[card.status]}15`,
                            color: statusChipColor[card.status],
                          }}>
                            {card.status}
                          </span>
                          <p className="text-[9px] text-muted-foreground mt-1">{card.source}</p>

                          {/* Warning + alternatives */}
                          {card.warning && (
                            <div className="mt-2 p-2 rounded-lg bg-sw-amber/10 border border-sw-amber/20">
                              <p className="text-[9px] text-sw-amber">{card.warning}</p>
                              {card.alternatives && card.alternatives.length > 0 && (
                                <div className="mt-1.5 space-y-1">
                                  <p className="text-[8px] text-muted-foreground font-mono uppercase">Suggested alternatives:</p>
                                  {card.alternatives.map(alt => (
                                    <button key={alt.skuId}
                                      onClick={() => handleSwapSku(card.id, pid, alt.skuId)}
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
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>

              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Goal Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{
                      width: `${currentProgress}%`,
                      backgroundColor: currentProgress >= 80 ? "#2ECF8E" : currentProgress >= 50 ? "#F5A623" : "#FF5C5C"
                    }} />
                  </div>
                  <span className="font-mono text-sm font-bold text-foreground">{currentProgress}%</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{goalType}: +{goalValue}{inputMode === "percentage" ? "%" : ""} by {goalDate}</p>
              </div>

              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Strategy Diff</p>
                <div className="space-y-1.5">
                  {diffs.map((d, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-surface-2 border border-subtle">
                      {d.type === "add" && <Plus size={10} className="text-sw-green mt-0.5 flex-shrink-0" />}
                      {d.type === "change" && <Zap size={10} className="text-sw-amber mt-0.5 flex-shrink-0" />}
                      {d.type === "remove" && <Minus size={10} className="text-sw-red mt-0.5 flex-shrink-0" />}
                      <div className="flex-1">
                        <p className="text-[11px] text-foreground">{d.desc}</p>
                        <p className="text-[9px] font-mono text-muted-foreground">{d.impact}</p>
                      </div>
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

      {/* Sticky footer */}
      {goalSet && (
        <div className="fixed bottom-0 left-[68px] right-0 bg-surface-1 border-t border-subtle p-4 z-50 flex items-center justify-between">
          <div className="text-[11px] text-muted-foreground">
            {totalCards} campaigns · {selectedSkus.length} SKUs · Budget: ₹{Number(budgetAlloc).toLocaleString()}
            {prelaunchHasIssues && !prelaunchCleared && <span className="text-sw-red ml-2">· Pre-launch gate: LOCKED</span>}
          </div>
          <button onClick={handleActivate}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              prelaunchHasIssues && !prelaunchCleared
                ? "bg-surface-3 text-muted-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/80"
            }`}>
            <Zap size={14} />
            Activate War Room
          </button>
        </div>
      )}
    </div>
  );
};

export default WarRoomView;
