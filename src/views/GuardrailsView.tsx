import React, { useState, useEffect, useCallback } from "react";
import { useGuardrails, PermissionState } from "@/contexts/GuardrailContext";
import { Shield, AlertTriangle } from "lucide-react";
import ScreenTabs from "@/components/ScreenTabs";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";

const triggerHistory = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  triggers: Math.floor(Math.random() * 5),
}));

const blockAllowData = [
  { type: "Defense", blocked: 3, allowed: 12 },
  { type: "Opportunity", blocked: 1, allowed: 18 },
  { type: "Bid optimisation", blocked: 2, allowed: 22 },
  { type: "Daypart", blocked: 0, allowed: 8 },
  { type: "Budget shift", blocked: 4, allowed: 6 },
];

const insightTypes = ["Defense", "Opportunity", "Bid optimisation", "Daypart adjustment", "Budget shift"];
const campaignTypes = ["Brand Search", "Performance Max", "Non-Brand", "Retargeting", "Festival"];
const scopeOptions = ["All", "Brand", "Performance", "Custom"] as const;

const SavedIndicator: React.FC<{ show: boolean }> = ({ show }) => {
  if (!show) return null;
  return <span className="text-[11px] font-mono" style={{ color: "hsl(160,70%,48%)" }}>Saved ✓</span>;
};

const useSaveFlash = () => {
  const [saved, setSaved] = useState(false);
  const flash = useCallback(() => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }, []);
  return { saved, flash };
};

const GuardrailsView: React.FC = () => {
  const g = useGuardrails();
  const cardA = useSaveFlash();
  const cardB = useSaveFlash();
  const cardC = useSaveFlash();
  const cardD = useSaveFlash();
  const cardE = useSaveFlash();

  const cyclePermission = (current: PermissionState): PermissionState => {
    if (current === "allow") return "review";
    if (current === "review") return "block";
    return "allow";
  };

  const permColor = (s: PermissionState) => {
    if (s === "allow") return { bg: "rgba(46,207,142,0.15)", color: "#2ECF8E", label: "Allow" };
    if (s === "review") return { bg: "rgba(245,166,35,0.15)", color: "#F5A623", label: "Review" };
    return { bg: "rgba(255,92,92,0.15)", color: "#FF5C5C", label: "Block" };
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Shield size={20} className="text-primary" /> Campaign Guardrails
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Rules that govern all automated insight actions. Higher tiers always evaluate first.
        </p>
      </div>

      {/* Card A — Hard Stops */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #FF5C5C" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Hard Stops — Tier 1</h2>
            <SavedIndicator show={cardA.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Block ALL automated actions when triggered</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Rule name</th>
                  <th className="text-left py-2 font-normal">Trigger condition</th>
                  <th className="text-left py-2 font-normal">Scope</th>
                  <th className="text-center py-2 font-normal">Status</th>
                  <th className="text-right py-2 font-normal">Last triggered</th>
                  <th className="text-right py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {g.hardStops.map((rule) => (
                  <tr key={rule.id} className="border-b border-subtle/50">
                    <td className="py-3 text-foreground font-medium">{rule.name}</td>
                    <td className="py-3">
                      {rule.id === "hs4" ? (
                        <span className="text-muted-foreground italic">manual trigger</span>
                      ) : (
                        <input
                          className="px-2 py-1 rounded-md text-xs text-foreground border"
                          style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                          value={rule.condition}
                          onChange={(e) => { g.updateHardStop(rule.id, { condition: e.target.value }); cardA.flash(); }}
                        />
                      )}
                    </td>
                    <td className="py-3">
                      <select
                        className="px-2 py-1 rounded-md text-xs text-foreground border"
                        style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                        value={rule.scope}
                        onChange={(e) => { g.updateHardStop(rule.id, { scope: e.target.value as any }); cardA.flash(); }}
                      >
                        {scopeOptions.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="py-3 text-center">
                      {rule.id === "hs4" ? null : (
                        <button
                          onClick={() => { g.updateHardStop(rule.id, { enabled: !rule.enabled }); cardA.flash(); }}
                          className="w-10 h-5 rounded-full relative transition-colors"
                          style={{ backgroundColor: rule.enabled ? "hsl(228,90%,64%)" : "hsl(225,10%,30%)" }}
                        >
                          <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                            style={{ left: rule.enabled ? "22px" : "2px" }} />
                        </button>
                      )}
                    </td>
                    <td className="py-3 text-right text-muted-foreground font-mono text-[10px]">
                      {rule.lastTriggered || "—"}
                    </td>
                    <td className="py-3 text-right">
                      {rule.id === "hs4" && (
                        <button
                          onClick={() => { g.updateHardStop("hs4", { enabled: true, lastTriggered: "Just now" }); cardA.flash(); }}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white"
                          style={{ backgroundColor: "#FF5C5C" }}
                        >
                          ⚠ Trigger now
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Card B — Strategic Locks */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #F5A623" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Strategic Locks — Tier 2</h2>
            <SavedIndicator show={cardB.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Override automated insights for specific campaigns</p>
          <div className="space-y-3">
            {g.strategicLocks.map((lock) => (
              <div key={lock.id} className="p-4 rounded-xl bg-surface-2 border border-subtle flex items-center gap-4 flex-wrap">
                <span className="text-xs text-foreground font-medium min-w-[140px]">{lock.name}</span>
                <div className="flex-1 min-w-[200px]">
                  <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Campaigns</label>
                  <input
                    className="w-full mt-1 px-2 py-1 rounded-md text-xs text-foreground border"
                    style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                    value={lock.campaigns.join(", ")}
                    onChange={(e) => { g.updateStrategicLock(lock.id, { campaigns: e.target.value.split(", ") }); cardB.flash(); }}
                  />
                </div>
                <div className="min-w-[200px]">
                  <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Date range</label>
                  <div className="flex gap-1 mt-1">
                    <input type="date" className="px-2 py-1 rounded-md text-[10px] text-foreground border"
                      style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                      value={lock.dateRange.from}
                      onChange={(e) => { g.updateStrategicLock(lock.id, { dateRange: { ...lock.dateRange, from: e.target.value } }); cardB.flash(); }} />
                    <input type="date" className="px-2 py-1 rounded-md text-[10px] text-foreground border"
                      style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                      value={lock.dateRange.to}
                      onChange={(e) => { g.updateStrategicLock(lock.id, { dateRange: { ...lock.dateRange, to: e.target.value } }); cardB.flash(); }} />
                  </div>
                </div>
                {lock.budgetFloor !== undefined && (
                  <div className="min-w-[100px]">
                    <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Floor</label>
                    <input
                      className="w-full mt-1 px-2 py-1 rounded-md text-xs text-foreground border"
                      style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                      value={lock.budgetFloor}
                      onChange={(e) => { g.updateStrategicLock(lock.id, { budgetFloor: e.target.value }); cardB.flash(); }}
                    />
                  </div>
                )}
                <button
                  onClick={() => { g.updateStrategicLock(lock.id, { enabled: !lock.enabled }); cardB.flash(); }}
                  className="w-10 h-5 rounded-full relative transition-colors flex-shrink-0"
                  style={{ backgroundColor: lock.enabled ? "hsl(228,90%,64%)" : "hsl(225,10%,30%)" }}
                >
                  <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                    style={{ left: lock.enabled ? "22px" : "2px" }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card C — Action Permissions Matrix */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #2ECF8E" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Action Permissions — Tier 3</h2>
            <SavedIndicator show={cardC.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Which insight types can act on which campaign types</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-2 font-normal text-muted-foreground"></th>
                  {campaignTypes.map(c => (
                    <th key={c} className="text-center py-2 font-normal text-muted-foreground text-[10px] px-1">{c}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {insightTypes.map(insight => (
                  <tr key={insight} className="border-t border-subtle/50">
                    <td className="py-3 text-foreground font-medium pr-4 whitespace-nowrap">{insight}</td>
                    {campaignTypes.map(camp => {
                      const state = g.permissionMatrix[insight]?.[camp] || "allow";
                      const { bg, color, label } = permColor(state);
                      return (
                        <td key={camp} className="py-3 text-center px-1">
                          <button
                            onClick={() => {
                              g.updatePermission(insight, camp, cyclePermission(state));
                              cardC.flash();
                            }}
                            className="px-2 py-1 rounded font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-all hover:opacity-80"
                            style={{ backgroundColor: bg, color, letterSpacing: "0.08em" }}
                          >
                            {label}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Card D — Conflict Resolution */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #4F7FFF" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Conflict resolution mode</h2>
            <SavedIndicator show={cardD.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">What happens when a Tier 3 insight conflicts with an active Tier 1 block</p>
          <div className="grid grid-cols-3 gap-3">
            {([
              { mode: "hard_block" as const, title: "Hard block", desc: "Tier 1 wins, insight discarded" },
              { mode: "soft_queue" as const, title: "Soft queue", desc: "Insight queued, auto-fires when block clears" },
              { mode: "escalate" as const, title: "Escalate", desc: "Send notification, await manual approval" },
            ]).map(opt => (
              <button
                key={opt.mode}
                onClick={() => { g.setConflictMode(opt.mode); cardD.flash(); }}
                className="p-4 rounded-xl border-2 text-left transition-all"
                style={{
                  borderColor: g.conflictMode === opt.mode ? "#A78BFA" : "rgba(255,255,255,0.07)",
                  backgroundColor: g.conflictMode === opt.mode ? "rgba(167,139,250,0.08)" : "hsl(230,22%,8%)",
                }}
              >
                <p className="text-xs font-medium text-foreground mb-1">{opt.title}</p>
                <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
              </button>
            ))}
          </div>
          {g.conflictMode === "soft_queue" && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">Est. resolution time:</span>
              <input
                className="px-2 py-1 rounded-md text-xs text-foreground border w-28"
                style={{ background: "#1C1F27", borderColor: "rgba(255,255,255,0.1)" }}
                value={g.estResolutionTime}
                onChange={(e) => { g.setEstResolutionTime(e.target.value); cardD.flash(); }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Card E — Velocity Limits */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #A78BFA" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Change velocity limits</h2>
            <SavedIndicator show={cardE.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Prevent runaway automation</p>
          <div className="space-y-5">
            {/* Bid slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">Max bid change per action</span>
                <span className="font-mono text-xs text-foreground">±{g.velocityLimits.maxBidChangePct}%</span>
              </div>
              <input type="range" min={5} max={50} value={g.velocityLimits.maxBidChangePct}
                onChange={(e) => { g.updateVelocityLimits({ maxBidChangePct: +e.target.value }); cardE.flash(); }}
                className="w-full accent-primary" />
            </div>
            {/* Budget slider */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">Max budget change per action</span>
                <span className="font-mono text-xs text-foreground">±{g.velocityLimits.maxBudgetChangePct}%</span>
              </div>
              <input type="range" min={5} max={50} value={g.velocityLimits.maxBudgetChangePct}
                onChange={(e) => { g.updateVelocityLimits({ maxBudgetChangePct: +e.target.value }); cardE.flash(); }}
                className="w-full accent-primary" />
            </div>
            {/* Steppers */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Max actions per campaign per day</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerCampaignPerDay: Math.max(1, g.velocityLimits.maxActionsPerCampaignPerDay - 1) }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}>−</button>
                <span className="font-mono text-sm text-foreground w-6 text-center">{g.velocityLimits.maxActionsPerCampaignPerDay}</span>
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerCampaignPerDay: g.velocityLimits.maxActionsPerCampaignPerDay + 1 }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}>+</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Max actions across all campaigns per hour</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerHour: Math.max(1, g.velocityLimits.maxActionsPerHour - 1) }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}>−</button>
                <span className="font-mono text-sm text-foreground w-6 text-center">{g.velocityLimits.maxActionsPerHour}</span>
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerHour: g.velocityLimits.maxActionsPerHour + 1 }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}>+</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Cooling-off period after Tier 1 trigger</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { g.updateVelocityLimits({ coolingOffHours: Math.max(0.5, g.velocityLimits.coolingOffHours - 0.5) }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}>−</button>
                <span className="font-mono text-sm text-foreground w-12 text-center">{g.velocityLimits.coolingOffHours}h</span>
                <button onClick={() => { g.updateVelocityLimits({ coolingOffHours: g.velocityLimits.coolingOffHours + 0.5 }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}>+</button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => { g.resetVelocityDefaults(); cardE.flash(); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium border text-muted-foreground hover:text-foreground transition-all"
              style={{ borderColor: "rgba(255,255,255,0.12)", background: "transparent" }}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardrailsView;
