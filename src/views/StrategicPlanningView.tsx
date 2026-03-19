import React, { useState, useEffect, useRef } from "react";
import { Send, CheckCircle2, AlertTriangle, XCircle, ChevronDown, ChevronUp, Check, X, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

/* ─── Toggle: seller portal connectivity ─── */
const sellerPortalConnected = true;

/* ─── Mock data ─── */
const mockSkus = [
  { name: "Good Day Butter", platform: "Blinkit", rank: 8, clickShare: "Low", roas: 2.1, targetRoas: 3.0, competitorSlots: 4 },
  { name: "Good Day Butter", platform: "Zepto", rank: 5, clickShare: "Medium", roas: 2.8, targetRoas: 3.0, competitorSlots: 3 },
  { name: "NutriChoice Digestive", platform: "Blinkit", rank: 12, clickShare: "Low", roas: 1.9, targetRoas: 2.5, competitorSlots: 5 },
  { name: "NutriChoice Digestive", platform: "Zepto", rank: 7, clickShare: "Medium", roas: 2.4, targetRoas: 2.5, competitorSlots: 3 },
];

const initialRecommendations = [
  { id: "r1", priority: "P1" as const, text: "Shift 15% budget from Blinkit to Zepto — ROAS is 33% higher on Zepto for Good Day Butter.", reason: "Zepto ROAS trending up for 2 consecutive weeks.", status: "pending" as const },
  { id: "r2", priority: "P2" as const, text: "Pause NutriChoice Digestive on Blinkit — rank stalled at 12 with declining CTR.", reason: "3-week rank stagnation with below-target ROAS.", status: "pending" as const },
  { id: "r3", priority: "P2" as const, text: "Increase bid on Good Day Butter keyword 'butter cookies' on Zepto by 20%.", reason: "Click share can move from Medium to High at current CPC levels.", status: "pending" as const },
  { id: "r4", priority: "P3" as const, text: "Test challenger SKU 'Good Day Cashew' on Zepto with ₹50K weekly budget.", reason: "Category search volume growing 18% WoW, no existing presence.", status: "pending" as const },
];

type ChatStep = "goal" | "objective" | "skus" | "validation" | "scenarios" | "confirm" | "execution";
type Message = { role: "user" | "system"; content: string; widget?: React.ReactNode };
type Scenario = { id: string; name: string; desc: string; blinkitSplit: string; zeptoSplit: string; roasRange: string; risk: string };
type Recommendation = { id: string; priority: "P1" | "P2" | "P3"; text: string; reason: string; status: "pending" | "approved" | "dismissed" };

const scenarios: Scenario[] = [
  { id: "A", name: "Aggressive", desc: "Concentrate spend on top-performing SKU-platform pair. Higher risk, higher upside.", blinkitSplit: "₹30L", zeptoSplit: "₹70L", roasRange: "2.8x – 4.2x", risk: "High" },
  { id: "B", name: "Balanced", desc: "Even split across platforms with proportional SKU allocation. Moderate risk.", blinkitSplit: "₹50L", zeptoSplit: "₹50L", roasRange: "2.5x – 3.5x", risk: "Medium" },
  { id: "C", name: "Defensive", desc: "Maintain current efficiency, test challenger SKUs with ring-fenced budget.", blinkitSplit: "₹55L", zeptoSplit: "₹45L", roasRange: "2.2x – 2.9x", risk: "Low" },
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

/* ─── Validation cards ─── */
const ValidationCards = ({ skuData }: { skuData: typeof mockSkus }) => {
  const primary = skuData[0];
  const avgRoas = skuData.reduce((a, s) => a + s.roas, 0) / skuData.length;
  const avgTarget = skuData.reduce((a, s) => a + s.targetRoas, 0) / skuData.length;
  const gap = avgTarget - avgRoas;
  const totalCompetitors = Math.max(...skuData.map(s => s.competitorSlots));
  const signals = [gap > 0.8 ? 1 : 0, primary.rank > 10 ? 1 : 0, totalCompetitors >= 4 ? 1 : 0].reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-3 my-2">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-surface-2 border border-border-visible rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Organic Rank Signal</p>
          <p className="text-sm text-foreground">Rank #{primary.rank} · {primary.clickShare} click share</p>
        </div>
        <div className="bg-surface-2 border border-border-visible rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Paid Efficiency Gap</p>
          <p className="text-sm text-foreground">Current {avgRoas.toFixed(1)}x vs Target {avgTarget.toFixed(1)}x · <span className="text-destructive">Gap {gap.toFixed(1)}x</span></p>
        </div>
        <div className="bg-surface-2 border border-border-visible rounded-lg p-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Competitive Shelf</p>
          <p className="text-sm text-foreground">{totalCompetitors} competitors in top 5 sponsored slots</p>
        </div>
      </div>
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        signals === 0 ? "bg-[hsl(var(--sw-green-dim))] text-[hsl(var(--sw-green))]" :
        signals === 1 ? "bg-[hsl(var(--sw-amber-dim))] text-[hsl(var(--sw-amber))]" :
        "bg-destructive/15 text-destructive"
      }`}>
        {signals === 0 ? <CheckCircle2 size={14} /> : signals === 1 ? <AlertTriangle size={14} /> : <XCircle size={14} />}
        {signals === 0 ? "Your hypothesis is valid. Ready to generate scenarios." :
         signals === 1 ? "One signal needs attention — proceed with caution." :
         "Two or more signals are weak — consider revising before proceeding."}
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

/* ─── Execution plan ─── */
const ExecutionPlan = ({ scenario, userGoal, userSkus }: { scenario: Scenario; userGoal: string; userSkus: string }) => {
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false, false, false]);
  const toggleCheck = (i: number) => setChecklist(prev => { const n = [...prev]; n[i] = !n[i]; return n; });

  return (
    <div className="space-y-6">
      {/* Summary banner */}
      <div className="bg-primary/10 border border-primary/20 rounded-lg px-4 py-3 text-sm text-foreground">
        <strong>Approved plan:</strong> {userGoal} · {userSkus} · Scenario {scenario.id} ({scenario.name}) selected
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* LEFT: Paid campaign track */}
        <div className="space-y-5">
          <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Paid Campaign Track</h3>

          {/* Campaign structure */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Campaign Structure</h4>
            <div className="overflow-auto rounded-lg border border-border-visible">
              <table className="w-full text-xs">
                <thead><tr className="bg-surface-2 text-muted-foreground">
                  <th className="px-3 py-2 text-left">SKU</th><th className="px-3 py-2 text-left">Platform</th><th className="px-3 py-2 text-left">Type</th><th className="px-3 py-2 text-left">Targeting</th><th className="px-3 py-2 text-right">Weekly ₹</th><th className="px-3 py-2 text-left">Owner</th>
                </tr></thead>
                <tbody className="text-foreground">
                  <tr className="border-t border-border-visible"><td className="px-3 py-2">Good Day Butter</td><td className="px-3 py-2">Blinkit</td><td className="px-3 py-2">Sponsored Product</td><td className="px-3 py-2">Keyword</td><td className="px-3 py-2 text-right">₹{scenario.id === "A" ? "3,75,000" : scenario.id === "B" ? "6,25,000" : "6,87,500"}</td><td className="px-3 py-2">Account Manager</td></tr>
                  <tr className="border-t border-border-visible"><td className="px-3 py-2">Good Day Butter</td><td className="px-3 py-2">Zepto</td><td className="px-3 py-2">Sponsored Product</td><td className="px-3 py-2">Keyword</td><td className="px-3 py-2 text-right">₹{scenario.id === "A" ? "8,75,000" : scenario.id === "B" ? "6,25,000" : "5,62,500"}</td><td className="px-3 py-2">Account Manager</td></tr>
                  <tr className="border-t border-border-visible"><td className="px-3 py-2">NutriChoice Digestive</td><td className="px-3 py-2">Blinkit</td><td className="px-3 py-2">Sponsored Brand</td><td className="px-3 py-2">Category</td><td className="px-3 py-2 text-right">₹{scenario.id === "A" ? "3,75,000" : scenario.id === "B" ? "6,25,000" : "6,87,500"}</td><td className="px-3 py-2">Account Manager</td></tr>
                  <tr className="border-t border-border-visible"><td className="px-3 py-2">NutriChoice Digestive</td><td className="px-3 py-2">Zepto</td><td className="px-3 py-2">Sponsored Brand</td><td className="px-3 py-2">Category</td><td className="px-3 py-2 text-right">₹{scenario.id === "A" ? "8,75,000" : scenario.id === "B" ? "6,25,000" : "5,62,500"}</td><td className="px-3 py-2">Account Manager</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* ROAS targets */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">ROAS Targets & Triggers</h4>
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
            <h4 className="text-sm font-semibold text-foreground mb-2">Weekly Optimisation Checklist <span className="text-muted-foreground font-normal">(Monday)</span></h4>
            <div className="space-y-2">
              {[
                "Review ROAS vs target — auto-pulled from integrated ad managers",
                "Review competitive sponsored slots for primary keywords",
                "Confirm campaigns are pacing against weekly allocation",
                ...(sellerPortalConnected ? [
                  "Review dark store inventory for advertised SKUs",
                  "Flag SKUs with less than 3 days stock and reduce bids",
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

          {/* Rank movement */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Rank Movement Tracker</h4>
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
                      <td className="px-3 py-2">{r.sku}</td>
                      <td className="px-3 py-2">{r.plat}</td>
                      <td className="px-3 py-2 text-right">#{r.cur}</td>
                      <td className="px-3 py-2 text-right">#{r.tgt}</td>
                      <td className="px-3 py-2 text-right">{r.weeks}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`text-[10px] ${
                          r.status === "On track" ? "border-[hsl(var(--sw-green))] text-[hsl(var(--sw-green))]" :
                          r.status === "At risk" ? "border-[hsl(var(--sw-amber))] text-[hsl(var(--sw-amber))]" :
                          "border-destructive text-destructive"
                        }`}>{r.status}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Dependency note */}
          <div className="bg-surface-2 border border-border-visible rounded-lg px-4 py-3 text-xs text-muted-foreground">
            Rank improvement depends on content quality and listing completeness. Content briefs are managed under the quarterly organic process. This plan does not allocate budget to content.
          </div>

          {/* Paid-organic interaction rule */}
          <div className="bg-surface-1 border border-primary/20 rounded-lg px-4 py-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Paid–Organic Interaction Rule</p>
            <p className="text-xs text-foreground">Do not reduce paid spend on a SKU until organic rank is sustained at position 5 or above for a minimum of 2 consecutive weeks.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ─── */
const StrategicPlanningView: React.FC = () => {
  const [step, setStep] = useState<ChatStep>("goal");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [userGoal, setUserGoal] = useState("");
  const [userSkus, setUserSkus] = useState("");
  const [recommendations, setRecommendations] = useState<Recommendation[]>(initialRecommendations);
  const [executionMode, setExecutionMode] = useState(false);
  const [chatCollapsed, setChatCollapsed] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const addSystemMessage = (content: string, widget?: React.ReactNode) => {
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: "system", content, widget }]);
    }, 1200);
  };

  const handleSend = () => {
    if (!input.trim() || typing) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);

    switch (step) {
      case "goal":
        setUserGoal(userMsg);
        setStep("objective");
        addSystemMessage("What is this budget trying to solve? For example: acquire new customers, defend your shelf position, push a specific SKU into organic rank, or test a new city.");
        break;
      case "objective":
        setUserGoal(prev => `${prev} · ${userMsg}`);
        setStep("skus");
        addSystemMessage("Which SKUs should this apply to, and on which platforms — Blinkit, Zepto, or both?");
        break;
      case "skus":
        setUserSkus(userMsg);
        setStep("validation");
        addSystemMessage(
          "Here's what the data says about your hypothesis:",
          <ValidationCards skuData={mockSkus} />
        );
        setTimeout(() => {
          setStep("scenarios");
          addSystemMessage(
            "Based on your inputs, here are three scenarios:",
            <div className="space-y-3 my-2">
              {scenarios.map(s => (
                <ScenarioCard key={s.id} s={s} onSelect={() => handleScenarioSelect(s)} />
              ))}
            </div>
          );
        }, 2600);
        break;
      case "confirm":
        if (userMsg.toLowerCase().includes("looks good") || userMsg.toLowerCase().includes("confirm") || userMsg.toLowerCase().includes("proceed") || userMsg.toLowerCase().includes("yes")) {
          addSystemMessage("Generating your execution action plan…");
          setTimeout(() => setExecutionMode(true), 1400);
        } else {
          addSystemMessage(`Noted — "${userMsg}". I've adjusted the scenario. Any further changes, or shall we proceed?`);
        }
        break;
      default:
        break;
    }
  };

  const handleScenarioSelect = (s: Scenario) => {
    setSelectedScenario(s);
    setStep("confirm");
    setMessages(prev => [...prev, { role: "user", content: `I'll go with Scenario ${s.id}: ${s.name}.` }]);
    addSystemMessage("Any adjustments before we generate the action plan? Type them here or say 'looks good' to proceed.");
  };

  const handleRecommendation = (id: string, action: "approved" | "dismissed") => {
    setRecommendations(prev => prev.map(r => r.id === id ? { ...r, status: action } : r));
  };

  const pendingRecs = recommendations.filter(r => r.status === "pending");
  const approvedRecs = recommendations.filter(r => r.status === "approved");

  return (
    <div className="flex gap-5 h-[calc(100vh-120px)]">
      {/* ─── Main panel ─── */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles size={20} className="text-primary" />
          <h1 className="text-lg font-display font-bold text-foreground">Strategic Planning</h1>
        </div>

        {executionMode ? (
          <div className="flex-1 overflow-y-auto pr-1">
            {/* Collapsed chat history */}
            <button
              onClick={() => setChatCollapsed(!chatCollapsed)}
              className="w-full flex items-center justify-between bg-surface-2 border border-border-visible rounded-lg px-4 py-2 mb-4 text-left hover:bg-surface-3 transition-colors"
            >
              <span className="text-xs text-muted-foreground">Conversation history ({messages.length} messages)</span>
              {chatCollapsed ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronUp size={14} className="text-muted-foreground" />}
            </button>
            {!chatCollapsed && (
              <div className="bg-surface-1 border border-border-visible rounded-lg p-4 mb-4 max-h-60 overflow-y-auto space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`text-xs ${m.role === "user" ? "text-primary" : "text-muted-foreground"}`}>
                    <span className="font-semibold">{m.role === "user" ? "You" : "Planner"}:</span> {m.content}
                  </div>
                ))}
              </div>
            )}
            <ExecutionPlan scenario={selectedScenario!} userGoal={userGoal} userSkus={userSkus} />
          </div>
        ) : (
          <>
            {/* Chat thread */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 pb-4">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">Start by describing your planning objective below.</p>
                </div>
              )}
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

            {/* Input */}
            <div className="border-t border-border-visible pt-3">
              <div className="flex items-center gap-2 bg-surface-2 rounded-xl px-4 py-2 border border-border-visible focus-within:border-primary/40 transition-colors">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSend()}
                  placeholder={step === "goal" ? "What would you like to plan today?" : "Type your response…"}
                  className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
                  disabled={typing || step === "validation" || step === "scenarios"}
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
          </>
        )}
      </div>

      {/* ─── Right panel: AI recommendations ─── */}
      <div className="w-[300px] flex-shrink-0 flex flex-col border-l border-border-visible pl-5 overflow-y-auto">
        <h3 className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">AI Recommendations</h3>

        <div className="space-y-3 flex-1">
          {pendingRecs.map(r => (
            <div key={r.id} className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={r.priority === "P1" ? "destructive" : r.priority === "P2" ? "secondary" : "outline"} className="text-[10px]">{r.priority}</Badge>
              </div>
              <p className="text-xs text-foreground leading-relaxed">{r.text}</p>
              <p className="text-[11px] text-muted-foreground">{r.reason}</p>
              <div className="flex gap-2">
                <button onClick={() => handleRecommendation(r.id, "approved")} className="flex items-center gap-1 text-[11px] text-[hsl(var(--sw-green))] hover:underline"><Check size={12} /> Approve</button>
                <button onClick={() => handleRecommendation(r.id, "dismissed")} className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive hover:underline"><X size={12} /> Dismiss</button>
              </div>
            </div>
          ))}
          {pendingRecs.length === 0 && <p className="text-xs text-muted-foreground">No pending recommendations.</p>}
        </div>

        {approvedRecs.length > 0 && (
          <div className="mt-4 pt-3 border-t border-border-visible">
            <h4 className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">Approved Actions</h4>
            <div className="space-y-2">
              {approvedRecs.map(r => (
                <div key={r.id} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 size={12} className="text-[hsl(var(--sw-green))] mt-0.5 flex-shrink-0" />
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
