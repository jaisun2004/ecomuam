import React, { useState, useCallback } from "react";
import PanelCard from "@/components/sw/PanelCard";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { useToast } from "@/hooks/use-toast";
import { Target, ChevronRight, ChevronDown, GripVertical, Shield, Zap, AlertTriangle, CheckCircle2, Minus, Plus, X } from "lucide-react";

/* ── Types ── */
type GoalType = "ROAS" | "Market Share" | "Availability" | "SoS" | "Content Score";
type PhaseId = "prelaunch" | "live" | "optimise";
type CardStatus = "Auto-configured" | "Content gap" | "Shelf gap" | "Conditional";

interface CampaignCard {
  id: string;
  name: string;
  budget: string;
  platform: string;
  status: CardStatus;
  source: string;
}

interface StrategyDiff {
  type: "add" | "change" | "remove";
  desc: string;
  impact: string;
}

/* ── Mock campaign cards pulled from Discovery/Content signals ── */
const seedCards: Record<PhaseId, CampaignCard[]> = {
  prelaunch: [
    { id: "c1", name: "Brand Awareness — Good Day", budget: "₹25K", platform: "Amazon", status: "Auto-configured", source: "Discovery trending" },
    { id: "c2", name: "Content Fix — Marie Gold", budget: "₹8K", platform: "Flipkart", status: "Content gap", source: "Content Audit score 51" },
  ],
  live: [
    { id: "c3", name: "Shelf Gap — butter biscuits on Zepto", budget: "₹40K", platform: "Zepto", status: "Shelf gap", source: "Discovery shelf coverage" },
    { id: "c4", name: "Good Day Choco Chip Push", budget: "₹60K", platform: "Blinkit", status: "Auto-configured", source: "Trending +38%" },
    { id: "c5", name: "NutriChoice Digestive Restock", budget: "₹15K", platform: "Instamart", status: "Conditional", source: "Availability < 50%" },
    { id: "c6", name: "Cream Biscuit Category Capture", budget: "₹55K", platform: "Amazon", status: "Auto-configured", source: "Discovery opportunity" },
  ],
  optimise: [
    { id: "c7", name: "Bid Optimisation — 50-50 Maska", budget: "₹12K", platform: "Amazon", status: "Conditional", source: "ROAS below floor" },
    { id: "c8", name: "Daypart Shift — Good Day", budget: "₹18K", platform: "Flipkart", status: "Auto-configured", source: "Conversion pattern" },
  ],
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

const goalTypes: GoalType[] = ["ROAS", "Market Share", "Availability", "SoS", "Content Score"];
const goalUnits: Record<GoalType, string[]> = {
  ROAS: ["x"],
  "Market Share": ["%"],
  Availability: ["%"],
  SoS: ["%"],
  "Content Score": ["/100"],
};

const WarRoomView: React.FC = () => {
  const g = useGuardrails();
  const { toast } = useToast();

  /* Goal input */
  const [goalType, setGoalType] = useState<GoalType>("ROAS");
  const [goalValue, setGoalValue] = useState("5.0");
  const [goalDate, setGoalDate] = useState("2026-04-30");
  const [goalSet, setGoalSet] = useState(false);

  /* Phase canvas */
  const [phases, setPhases] = useState<Record<PhaseId, CampaignCard[]>>(seedCards);
  const [dragCard, setDragCard] = useState<{ card: CampaignCard; from: PhaseId } | null>(null);

  /* Right sidebar */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /* Progress */
  const currentProgress = 62; // mock

  const diffs: StrategyDiff[] = [
    { type: "add", desc: "Shelf gap campaign on Zepto", impact: "+₹40K budget" },
    { type: "change", desc: "Marie Gold content fix prioritised", impact: "₹8K reallocated" },
    { type: "remove", desc: "Low ROAS creatine campaign dropped", impact: "-₹30K saved" },
  ];

  const guardrailHealth = [
    { name: "Budget cap", ok: true },
    { name: "ROAS floor", ok: true },
    { name: "Velocity limit", ok: false },
    { name: "Availability threshold", ok: true },
  ];

  const handleSetGoal = () => {
    if (!goalValue || !goalDate) return;
    setGoalSet(true);
    toast({ title: "Goal set", description: `${goalType} target: ${goalValue}${goalUnits[goalType][0]} by ${goalDate}` });
  };

  const handleDrop = (targetPhase: PhaseId) => {
    if (!dragCard || dragCard.from === targetPhase) { setDragCard(null); return; }
    setPhases(prev => {
      const fromCards = prev[dragCard.from].filter(c => c.id !== dragCard.card.id);
      const toCards = [...prev[targetPhase], dragCard.card];
      return { ...prev, [dragCard.from]: fromCards, [targetPhase]: toCards };
    });
    toast({ title: "Card moved", description: `${dragCard.card.name} → ${phaseConfig[targetPhase].label}. Tier 2 lock dates updated.` });
    setDragCard(null);
  };

  const handleActivate = () => {
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
          <p className="text-xs text-muted-foreground mt-1">Set a goal, generate a phased campaign strategy, and activate.</p>
        </div>
        {goalSet && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[11px] px-3 py-1.5 rounded-lg bg-surface-3 text-foreground hover:bg-surface-2">
            {sidebarOpen ? "Hide" : "Show"} Strategy Panel
          </button>
        )}
      </div>

      {/* Step 1 — Goal Input */}
      {!goalSet ? (
        <div className="max-w-xl mx-auto">
          <PanelCard title="Define your goal" badge="Step 1" badgeColor="accent" delay={0.05}>
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Target value</label>
                  <div className="flex items-center gap-2">
                    <input value={goalValue} onChange={e => setGoalValue(e.target.value)}
                      className="flex-1 bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground font-mono" />
                    <span className="text-xs text-muted-foreground">{goalUnits[goalType][0]}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground block mb-1">Target date</label>
                  <input type="date" value={goalDate} onChange={e => setGoalDate(e.target.value)}
                    className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" />
                </div>
              </div>
              <button onClick={handleSetGoal} className="w-full px-4 py-2.5 rounded-xl text-sm font-medium bg-primary text-foreground hover:bg-primary/80 transition-all">
                Generate Strategy Canvas
              </button>
            </div>
          </PanelCard>
        </div>
      ) : (
        /* Step 2 — Phase Canvas */
        <div className={`flex gap-4 ${sidebarOpen ? "" : ""}`}>
          <div className={`flex-1 space-y-4 ${sidebarOpen ? "mr-80" : ""}`}>
            {/* Goal summary bar */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <Target size={16} className="text-primary flex-shrink-0" />
              <span className="text-sm text-foreground font-medium">{goalType}: {goalValue}{goalUnits[goalType][0]}</span>
              <span className="text-[11px] text-muted-foreground">by {goalDate}</span>
              <span className="ml-auto font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">{totalCards} campaigns</span>
              <button onClick={() => setGoalSet(false)} className="text-[10px] text-muted-foreground hover:text-foreground">Edit goal</button>
            </div>

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
              {(Object.keys(phaseConfig) as PhaseId[]).map(pid => (
                <div key={pid}
                  className="rounded-xl border border-subtle bg-surface-1 p-3 min-h-[300px]"
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(pid)}
                >
                  <div className="flex items-center gap-2 mb-3 pb-2 border-b border-subtle">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: phaseConfig[pid].color }} />
                    <span className="text-xs font-medium text-foreground">{phaseConfig[pid].label}</span>
                    <span className="ml-auto font-mono text-[9px] text-muted-foreground">{phases[pid].length} cards</span>
                  </div>
                  <div className="space-y-2">
                    {phases[pid].map(card => (
                      <div key={card.id}
                        draggable
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
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right sidebar */}
          {sidebarOpen && (
            <div className="fixed right-0 top-0 bottom-0 w-80 bg-surface-1 border-l border-subtle p-4 overflow-y-auto z-40 space-y-4 pt-20">
              <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>

              {/* Goal progress */}
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
                <p className="text-[10px] text-muted-foreground mt-1">{goalType}: {goalValue}{goalUnits[goalType][0]} by {goalDate}</p>
              </div>

              {/* Strategy diff */}
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

              {/* Guardrail health */}
              <div>
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">Guardrail Health</p>
                <div className="space-y-1">
                  {guardrailHealth.map(gh => (
                    <div key={gh.name} className="flex items-center justify-between py-1.5">
                      <span className="text-[11px] text-foreground">{gh.name}</span>
                      {gh.ok ? (
                        <CheckCircle2 size={12} className="text-sw-green" />
                      ) : (
                        <AlertTriangle size={12} className="text-sw-amber" />
                      )}
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
            {totalCards} campaigns · {Object.values(phases).flat().filter(c => c.status === "Auto-configured").length} auto-configured
          </div>
          <button onClick={handleActivate}
            className="px-6 py-2.5 rounded-xl text-sm font-medium bg-primary text-foreground hover:bg-primary/80 transition-all flex items-center gap-2">
            <Zap size={14} />
            Activate War Room
          </button>
        </div>
      )}
    </div>
  );
};

export default WarRoomView;
