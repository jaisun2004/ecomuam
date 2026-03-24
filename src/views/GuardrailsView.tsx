import React, { useState, useCallback } from "react";
import {
  useGuardrails, PermissionState,
  HardStopRule, StrategicLock, MetricCondition,
  ActionPrimitive, CampaignScope, LockTrigger,
  formatCondition, ACTION_PRIMITIVES, SCOPE_LABELS,
  METRIC_LABELS,
} from "@/contexts/GuardrailContext";
import { Shield, X, ChevronRight, Pencil, AlertTriangle } from "lucide-react";
import ScreenTabs from "@/components/ScreenTabs";
import ConditionBuilder from "@/components/ConditionBuilder";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, BarChart, Bar } from "recharts";
import { useToast } from "@/hooks/use-toast";

// ─── Analytics mock data ───
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

// ─── Mock campaign list for "custom" scope ───
const MOCK_CAMPAIGNS = [
  { id: "creatine-retargeting", name: "Creatine Retargeting" },
  { id: "whey-protein-sponsored", name: "Whey Protein — Sponsored" },
  { id: "brand-search-main", name: "Brand Search — Main" },
  { id: "perf-max-protein", name: "Performance Max — Protein" },
  { id: "festival-diwali", name: "Diwali Campaign" },
];

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

// ─── Action primitive toggles ───
const ActionToggles: React.FC<{
  selected: ActionPrimitive[];
  onChange: (actions: ActionPrimitive[]) => void;
}> = ({ selected, onChange }) => {
  const allKeys = ACTION_PRIMITIVES.flatMap(g => g.actions.map(a => a.key));
  const allSelected = allKeys.every(k => selected.includes(k));

  const toggle = (key: ActionPrimitive) => {
    if (selected.includes(key)) {
      onChange(selected.filter(k => k !== key));
    } else {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-2 cursor-pointer text-xs">
        <input
          type="checkbox"
          checked={allSelected}
          onChange={() => onChange(allSelected ? [] : allKeys)}
          className="accent-primary"
        />
        <span className="text-foreground font-medium">Block all</span>
      </label>
      {ACTION_PRIMITIVES.map(group => (
        <div key={group.group}>
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">{group.group}</p>
          <div className="flex flex-wrap gap-2">
            {group.actions.map(a => (
              <label key={a.key} className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={selected.includes(a.key)}
                  onChange={() => toggle(a.key)}
                  className="accent-primary"
                />
                <span className="text-foreground">{a.label}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── Scope selector ───
const ScopeSelector: React.FC<{
  value: CampaignScope;
  campaignIds: string[];
  onChange: (scope: CampaignScope, ids: string[]) => void;
}> = ({ value, campaignIds, onChange }) => {
  const allScopes = Object.keys(SCOPE_LABELS) as CampaignScope[];
  return (
    <div className="space-y-2">
      <select
        className="px-2 py-1.5 rounded-lg border text-xs text-foreground"
        style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
        value={value}
        onChange={(e) => onChange(e.target.value as CampaignScope, value === "custom" ? campaignIds : [])}
      >
        {allScopes.map(s => (
          <option key={s} value={s}>{SCOPE_LABELS[s]}</option>
        ))}
      </select>
      {value === "custom" && (
        <div className="flex flex-wrap gap-2 mt-2">
          {MOCK_CAMPAIGNS.map(c => (
            <label key={c.id} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={campaignIds.includes(c.id)}
                onChange={() => {
                  const ids = campaignIds.includes(c.id)
                    ? campaignIds.filter(id => id !== c.id)
                    : [...campaignIds, c.id];
                  onChange("custom", ids);
                }}
                className="accent-primary"
              />
              <span className="text-foreground">{c.name}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Compact blocked actions chips ───
const BlockedActionsChips: React.FC<{ actions: ActionPrimitive[] }> = ({ actions }) => {
  const groupColors: Record<string, string> = {
    "Campaign state": "rgba(79,127,255,0.15)",
    Budget: "rgba(245,166,35,0.15)",
    Bid: "rgba(167,139,250,0.15)",
    Keywords: "rgba(46,207,142,0.15)",
    Products: "rgba(255,92,92,0.15)",
  };
  const groupTextColors: Record<string, string> = {
    "Campaign state": "#4F7FFF",
    Budget: "#F5A623",
    Bid: "#A78BFA",
    Keywords: "#2ECF8E",
    Products: "#FF5C5C",
  };
  return (
    <div className="flex flex-wrap gap-1">
      {ACTION_PRIMITIVES.flatMap(g =>
        g.actions.filter(a => actions.includes(a.key)).map(a => (
          <span
            key={a.key}
            className="px-1.5 py-0.5 rounded text-[9px] font-medium"
            style={{ backgroundColor: groupColors[g.group], color: groupTextColors[g.group] }}
          >
            {a.label}
          </span>
        ))
      )}
    </div>
  );
};

// ─── Format timestamp helper ───
function formatTimestamp(ts: number | null): string {
  if (!ts) return "—";
  const diff = Date.now() - ts;
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(ts).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Hard Stop Edit Panel ───
const HardStopEditPanel: React.FC<{
  rule: HardStopRule;
  onSave: (r: HardStopRule) => void;
  onClose: () => void;
}> = ({ rule, onSave, onClose }) => {
  const [draft, setDraft] = useState<HardStopRule>({ ...rule });
  const [step, setStep] = useState(1);

  const canSave = draft.name.trim().length > 0 && draft.blocked_actions.length > 0 && (draft.condition !== null);

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-surface-1 border-l border-subtle h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-1 border-b border-subtle p-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-medium text-foreground">Edit Hard Stop</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-6">
          {/* Steps indicator */}
          <div className="flex gap-2 text-[10px]">
            {["Name & Scope", "Condition", "Blocked Actions", "Review"].map((label, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`px-3 py-1 rounded-full border transition-all ${step === i + 1
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-subtle text-muted-foreground"
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
                <input
                  className="w-full mt-1 px-3 py-2 rounded-lg border text-xs text-foreground"
                  style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
                  maxLength={60}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
                <p className="text-[9px] text-muted-foreground mt-1">{draft.name.length}/60</p>
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Scope</label>
                <ScopeSelector
                  value={draft.scope}
                  campaignIds={draft.campaign_ids || []}
                  onChange={(scope, ids) => setDraft({ ...draft, scope, campaign_ids: ids })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Trigger condition</label>
              {draft.condition && (
                <ConditionBuilder
                  value={draft.condition}
                  onChange={(c) => setDraft({ ...draft, condition: c })}
                />
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
                When this condition is met, block these actions:
              </label>
              <ActionToggles
                selected={draft.blocked_actions}
                onChange={(actions) => setDraft({ ...draft, blocked_actions: actions })}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Review</label>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-xs text-foreground leading-relaxed">
                {draft.condition ? (
                  <>
                    When <span className="font-medium text-primary">{formatCondition(draft.condition)}</span>,
                    block <span className="font-medium">{draft.blocked_actions.length} action(s)</span> on{" "}
                    <span className="font-medium">{SCOPE_LABELS[draft.scope]}</span> campaigns.
                  </>
                ) : "No condition set."}
              </div>
              <BlockedActionsChips actions={draft.blocked_actions} />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-surface-1 border-t border-subtle p-4 flex items-center justify-between">
          <div className="flex gap-2">
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-subtle text-muted-foreground hover:text-foreground">
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
                Next <ChevronRight size={12} className="inline" />
              </button>
            ) : (
              <button
                onClick={() => { if (canSave) onSave(draft); }}
                disabled={!canSave}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-40"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Strategic Lock Edit Panel ───
const LockEditPanel: React.FC<{
  lock: StrategicLock;
  onSave: (l: StrategicLock) => void;
  onClose: () => void;
}> = ({ lock, onSave, onClose }) => {
  const [draft, setDraft] = useState<StrategicLock>({ ...lock });
  const [step, setStep] = useState(1);

  const canSave = draft.name.trim().length > 0 && draft.locked_actions.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg bg-surface-1 border-l border-subtle h-full overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-surface-1 border-b border-subtle p-4 flex items-center justify-between z-10">
          <h3 className="text-sm font-medium text-foreground">Edit Strategic Lock</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
        </div>

        <div className="p-5 space-y-6">
          <div className="flex gap-2 text-[10px]">
            {["Name & Scope", "Actions", "Trigger", "Review"].map((label, i) => (
              <button
                key={i}
                onClick={() => setStep(i + 1)}
                className={`px-3 py-1 rounded-full border transition-all ${step === i + 1
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-subtle text-muted-foreground"
                }`}
              >
                {i + 1}. {label}
              </button>
            ))}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Name</label>
                <input
                  className="w-full mt-1 px-3 py-2 rounded-lg border text-xs text-foreground"
                  style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
                  maxLength={60}
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Reason (optional)</label>
                <input
                  className="w-full mt-1 px-3 py-2 rounded-lg border text-xs text-foreground"
                  style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
                  maxLength={120}
                  value={draft.reason}
                  onChange={(e) => setDraft({ ...draft, reason: e.target.value })}
                  placeholder="e.g. Hold for creative refresh"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Scope</label>
                <ScopeSelector
                  value={draft.campaign_scope}
                  campaignIds={draft.campaign_ids}
                  onChange={(scope, ids) => setDraft({ ...draft, campaign_scope: scope, campaign_ids: ids })}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Locked actions</label>
              <ActionToggles
                selected={draft.locked_actions}
                onChange={(actions) => setDraft({ ...draft, locked_actions: actions })}
              />
              <div className="mt-4 pt-4 border-t border-subtle">
                <label className="flex items-center gap-2 cursor-pointer text-xs">
                  <input
                    type="checkbox"
                    checked={draft.allow_manual_override}
                    onChange={() => setDraft({ ...draft, allow_manual_override: !draft.allow_manual_override })}
                    className="accent-primary"
                  />
                  <span className="text-foreground">Allow team members to perform these actions manually (only automation is blocked)</span>
                </label>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Trigger type</label>
              <div className="grid grid-cols-3 gap-3">
                {(["manual", "scheduled", "conditional"] as const).map(t => (
                  <button
                    key={t}
                    onClick={() => {
                      if (t === "manual") setDraft({ ...draft, trigger: { type: "manual" } });
                      else if (t === "scheduled") setDraft({ ...draft, trigger: { type: "scheduled", start_date: new Date().toISOString().split("T")[0], end_date: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0], repeat_annually: false } });
                      else setDraft({ ...draft, trigger: { type: "conditional", activate_condition: { metric: "availability_pct", operator: "less_than", value: 20, consecutive_days: 1 }, release_type: "condition_clears", release_hours: null } });
                    }}
                    className="p-3 rounded-xl border-2 text-left transition-all"
                    style={{
                      borderColor: draft.trigger.type === t ? "hsl(var(--primary))" : "hsl(220,13%,91%)",
                      backgroundColor: draft.trigger.type === t ? "hsl(var(--primary) / 0.08)" : "hsl(0,0%,100%)",
                    }}
                  >
                    <p className="text-xs font-medium text-foreground capitalize">{t}</p>
                    <p className="text-[9px] text-muted-foreground mt-0.5">
                      {t === "manual" && "Always active, enable/disable manually"}
                      {t === "scheduled" && "Active during date range"}
                      {t === "conditional" && "Activated by metric condition"}
                    </p>
                  </button>
                ))}
              </div>

              {draft.trigger.type === "scheduled" && (
                <div className="space-y-3 mt-4">
                  <div className="flex gap-3">
                    <div>
                      <label className="text-[9px] text-muted-foreground uppercase tracking-wider">Start</label>
                      <input
                        type="date"
                        className="w-full mt-1 px-2 py-1.5 rounded-lg border text-xs text-foreground"
                        style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
                        value={draft.trigger.start_date}
                        onChange={(e) => setDraft({ ...draft, trigger: { ...draft.trigger as any, start_date: e.target.value } })}
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-muted-foreground uppercase tracking-wider">End</label>
                      <input
                        type="date"
                        className="w-full mt-1 px-2 py-1.5 rounded-lg border text-xs text-foreground"
                        style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
                        value={draft.trigger.end_date}
                        onChange={(e) => setDraft({ ...draft, trigger: { ...draft.trigger as any, end_date: e.target.value } })}
                      />
                    </div>
                  </div>
                  <label className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(draft.trigger as any).repeat_annually}
                      onChange={() => setDraft({ ...draft, trigger: { ...draft.trigger as any, repeat_annually: !(draft.trigger as any).repeat_annually } })}
                      className="accent-primary"
                    />
                    <span className="text-foreground">Repeat annually</span>
                  </label>
                </div>
              )}

              {draft.trigger.type === "conditional" && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Activation condition</label>
                    <ConditionBuilder
                      value={(draft.trigger as any).activate_condition}
                      onChange={(c) => setDraft({ ...draft, trigger: { ...draft.trigger as any, activate_condition: c } })}
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-2 block">Release when</label>
                    <div className="space-y-2">
                      {([
                        { value: "condition_clears", label: "When condition clears" },
                        { value: "manual", label: "Manually" },
                        { value: "after_hours", label: "After N hours" },
                      ] as const).map(opt => (
                        <label key={opt.value} className="flex items-center gap-2 text-xs cursor-pointer">
                          <input
                            type="radio"
                            name="release_type"
                            checked={(draft.trigger as any).release_type === opt.value}
                            onChange={() => setDraft({ ...draft, trigger: { ...draft.trigger as any, release_type: opt.value, release_hours: opt.value === "after_hours" ? 24 : null } })}
                            className="accent-primary"
                          />
                          <span className="text-foreground">{opt.label}</span>
                        </label>
                      ))}
                      {(draft.trigger as any).release_type === "after_hours" && (
                        <div className="flex items-center gap-2 ml-6">
                          <input
                            type="number"
                            min={1}
                            max={720}
                            className="w-16 px-2 py-1 rounded-lg border text-xs text-foreground font-mono"
                            style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
                            value={(draft.trigger as any).release_hours || 24}
                            onChange={(e) => setDraft({ ...draft, trigger: { ...draft.trigger as any, release_hours: parseInt(e.target.value) || 24 } })}
                          />
                          <span className="text-muted-foreground text-xs">hours</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Review</label>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle text-xs text-foreground leading-relaxed space-y-2">
                <p><span className="font-medium">{draft.name}</span>{draft.reason ? ` — ${draft.reason}` : ""}</p>
                <p>
                  Lock <span className="font-medium">{draft.locked_actions.length} action(s)</span> on{" "}
                  <span className="font-medium">{SCOPE_LABELS[draft.campaign_scope]}</span> campaigns.
                </p>
                <p>
                  Trigger: <span className="font-medium capitalize">{draft.trigger.type}</span>
                  {draft.trigger.type === "scheduled" && ` (${draft.trigger.start_date} → ${draft.trigger.end_date})`}
                  {draft.trigger.type === "conditional" && ` — ${formatCondition(draft.trigger.activate_condition)}`}
                </p>
                <p>Manual override: <span className="font-medium">{draft.allow_manual_override ? "Yes" : "No"}</span></p>
              </div>
              <BlockedActionsChips actions={draft.locked_actions} />
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-surface-1 border-t border-subtle p-4 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button onClick={() => setStep(step - 1)} className="px-3 py-1.5 rounded-lg text-xs border border-subtle text-muted-foreground hover:text-foreground">
                Back
              </button>
            )}
          </div>
          <div className="flex gap-2">
            {step < 4 ? (
              <button onClick={() => setStep(step + 1)} className="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground">
                Next <ChevronRight size={12} className="inline" />
              </button>
            ) : (
              <button
                onClick={() => { if (canSave) onSave(draft); }}
                disabled={!canSave}
                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground disabled:opacity-40"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Main View ───
const GuardrailsView: React.FC = () => {
  const g = useGuardrails();
  const { toast } = useToast();
  const cardA = useSaveFlash();
  const cardB = useSaveFlash();
  const cardC = useSaveFlash();
  const cardD = useSaveFlash();
  const cardE = useSaveFlash();

  const [editingHardStop, setEditingHardStop] = useState<HardStopRule | null>(null);
  const [editingLock, setEditingLock] = useState<StrategicLock | null>(null);
  const [confirmKill, setConfirmKill] = useState(false);

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

  const [tab, setTab] = useState("overview");

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

      <ScreenTabs activeTab={tab} onTabChange={setTab} />
      {tab === "overview" ? (<>

      {/* Card A — Hard Stops */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #FF5C5C" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Hard Stops — Tier 1</h2>
            <SavedIndicator show={cardA.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Block specified automated actions when triggered</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Rule name</th>
                  <th className="text-left py-2 font-normal">Trigger condition</th>
                  <th className="text-left py-2 font-normal">Scope</th>
                  <th className="text-left py-2 font-normal">Blocked actions</th>
                  <th className="text-center py-2 font-normal">Status</th>
                  <th className="text-right py-2 font-normal">Last triggered</th>
                  <th className="text-right py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {g.hardStops.map((rule) => (
                  <tr key={rule.id} className="border-b border-subtle/50">
                    <td className="py-3 text-foreground font-medium max-w-[140px]">{rule.name}</td>
                    <td className="py-3 max-w-[240px]">
                      {rule.is_emergency ? (
                        <span className="text-muted-foreground italic text-[10px]">Manual trigger only</span>
                      ) : rule.condition ? (
                        <span className="text-[10px] text-foreground font-mono leading-snug">
                          {formatCondition(rule.condition)}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-muted/20 text-muted-foreground">
                        {SCOPE_LABELS[rule.scope]}
                      </span>
                    </td>
                    <td className="py-3 max-w-[200px]">
                      {!rule.is_emergency && <BlockedActionsChips actions={rule.blocked_actions} />}
                    </td>
                    <td className="py-3 text-center">
                      {!rule.is_emergency && (
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
                      {formatTimestamp(rule.last_triggered_at)}
                    </td>
                    <td className="py-3 text-right">
                      {rule.is_emergency ? (
                        <button
                          onClick={() => setConfirmKill(true)}
                          className="px-3 py-1.5 rounded-lg text-[10px] font-medium text-white"
                          style={{ backgroundColor: "#FF5C5C" }}
                        >
                          ⚠ Trigger now
                        </button>
                      ) : (
                        <button
                          onClick={() => setEditingHardStop(rule)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Pencil size={13} />
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

      {/* Emergency kill switch confirm dialog */}
      {confirmKill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setConfirmKill(false)}>
          <div className="absolute inset-0 bg-black/50" />
          <div className="relative bg-surface-1 border border-subtle rounded-xl p-6 max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle size={20} className="text-destructive" />
              <h3 className="text-sm font-medium text-foreground">Emergency Kill Switch</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-5">
              This will pause ALL campaigns immediately. Are you sure?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmKill(false)}
                className="px-4 py-1.5 rounded-lg text-xs border border-subtle text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  g.updateHardStop("hs4", { enabled: true, last_triggered_at: Date.now() });
                  setConfirmKill(false);
                  cardA.flash();
                  toast({ title: "Emergency kill switch triggered", description: "All campaigns paused." });
                }}
                className="px-4 py-1.5 rounded-lg text-xs font-medium text-white"
                style={{ backgroundColor: "#FF5C5C" }}
              >
                Confirm — Pause all
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Card B — Strategic Locks */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden" style={{ borderLeft: "3px solid #F5A623" }}>
        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-sm font-medium text-foreground">Strategic Locks — Tier 2</h2>
            <SavedIndicator show={cardB.saved} />
          </div>
          <p className="text-[11px] text-muted-foreground mb-4">Override automated insights for specific campaigns</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Lock name</th>
                  <th className="text-left py-2 font-normal">Scope</th>
                  <th className="text-left py-2 font-normal">Locked actions</th>
                  <th className="text-left py-2 font-normal">Trigger</th>
                  <th className="text-center py-2 font-normal">Override</th>
                  <th className="text-center py-2 font-normal">Status</th>
                  <th className="text-right py-2 font-normal"></th>
                </tr>
              </thead>
              <tbody>
                {g.strategicLocks.map((lock) => (
                  <tr key={lock.id} className="border-b border-subtle/50">
                    <td className="py-3 text-foreground font-medium max-w-[140px]">
                      <div>{lock.name}</div>
                      {lock.reason && <div className="text-[9px] text-muted-foreground mt-0.5">{lock.reason}</div>}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-medium bg-muted/20 text-muted-foreground">
                        {SCOPE_LABELS[lock.campaign_scope]}
                      </span>
                    </td>
                    <td className="py-3 max-w-[200px]">
                      <BlockedActionsChips actions={lock.locked_actions} />
                    </td>
                    <td className="py-3 text-[10px]">
                      {lock.trigger.type === "manual" && <span className="text-muted-foreground">Manual</span>}
                      {lock.trigger.type === "scheduled" && (
                        <span className="text-foreground font-mono">{lock.trigger.start_date} → {lock.trigger.end_date}</span>
                      )}
                      {lock.trigger.type === "conditional" && (
                        <span className="text-foreground font-mono text-[9px]">{formatCondition(lock.trigger.activate_condition)}</span>
                      )}
                    </td>
                    <td className="py-3 text-center">
                      <span className={`text-[9px] font-medium ${lock.allow_manual_override ? "text-sw-green" : "text-muted-foreground"}`}>
                        {lock.allow_manual_override ? "Yes" : "No"}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <button
                        onClick={() => { g.updateStrategicLock(lock.id, { enabled: !lock.enabled }); cardB.flash(); }}
                        className="w-10 h-5 rounded-full relative transition-colors"
                        style={{ backgroundColor: lock.enabled ? "hsl(228,90%,64%)" : "hsl(225,10%,30%)" }}
                      >
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all"
                          style={{ left: lock.enabled ? "22px" : "2px" }} />
                      </button>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => setEditingLock(lock)} className="text-muted-foreground hover:text-foreground">
                        <Pencil size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  borderColor: g.conflictMode === opt.mode ? "hsl(var(--primary))" : "hsl(220,13%,91%)",
                  backgroundColor: g.conflictMode === opt.mode ? "hsl(var(--primary) / 0.08)" : "hsl(0,0%,100%)",
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
                style={{ background: "hsl(0,0%,100%)", borderColor: "hsl(220,13%,91%)" }}
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
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">Max bid change per action</span>
                <span className="font-mono text-xs text-foreground">±{g.velocityLimits.maxBidChangePct}%</span>
              </div>
              <input type="range" min={5} max={50} value={g.velocityLimits.maxBidChangePct}
                onChange={(e) => { g.updateVelocityLimits({ maxBidChangePct: +e.target.value }); cardE.flash(); }}
                className="w-full accent-primary" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-foreground">Max budget change per action</span>
                <span className="font-mono text-xs text-foreground">±{g.velocityLimits.maxBudgetChangePct}%</span>
              </div>
              <input type="range" min={5} max={50} value={g.velocityLimits.maxBudgetChangePct}
                onChange={(e) => { g.updateVelocityLimits({ maxBudgetChangePct: +e.target.value }); cardE.flash(); }}
                className="w-full accent-primary" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Max actions per campaign per day</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerCampaignPerDay: Math.max(1, g.velocityLimits.maxActionsPerCampaignPerDay - 1) }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}>−</button>
                <span className="font-mono text-sm text-foreground w-6 text-center">{g.velocityLimits.maxActionsPerCampaignPerDay}</span>
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerCampaignPerDay: g.velocityLimits.maxActionsPerCampaignPerDay + 1 }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}>+</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Max actions across all campaigns per hour</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerHour: Math.max(1, g.velocityLimits.maxActionsPerHour - 1) }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}>−</button>
                <span className="font-mono text-sm text-foreground w-6 text-center">{g.velocityLimits.maxActionsPerHour}</span>
                <button onClick={() => { g.updateVelocityLimits({ maxActionsPerHour: g.velocityLimits.maxActionsPerHour + 1 }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}>+</button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-foreground">Cooling-off period after Tier 1 trigger</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { g.updateVelocityLimits({ coolingOffHours: Math.max(0.5, g.velocityLimits.coolingOffHours - 0.5) }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}>−</button>
                <span className="font-mono text-sm text-foreground w-12 text-center">{g.velocityLimits.coolingOffHours}h</span>
                <button onClick={() => { g.updateVelocityLimits({ coolingOffHours: g.velocityLimits.coolingOffHours + 0.5 }); cardE.flash(); }}
                  className="w-7 h-7 rounded-lg border text-foreground text-sm flex items-center justify-center"
                  style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}>+</button>
              </div>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button onClick={() => { g.resetVelocityDefaults(); cardE.flash(); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium border text-muted-foreground hover:text-foreground transition-all"
              style={{ borderColor: "hsl(220,13%,91%)", background: "transparent" }}
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </div>
      </>) : (
        <div className="space-y-5">
          <PanelCard title="Rule Trigger History — 30 Days" badge="Timeline" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={triggerHistory}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="triggers" stroke="hsl(0,76%,57%)" strokeWidth={2} dot={false} name="Triggers" />
              </LineChart>
            </ResponsiveContainer>
          </PanelCard>

          <PanelCard title="Action Block/Allow Ratio" badge="By Insight Type" badgeColor="red" delay={0.1}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={blockAllowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="type" tick={{ fontSize: 9, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Bar dataKey="allowed" fill="hsl(160,70%,48%)" radius={[4, 4, 0, 0]} name="Allowed" />
                <Bar dataKey="blocked" fill="hsl(0,76%,57%)" radius={[4, 4, 0, 0]} name="Blocked" opacity={0.7} />
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-green" /> Allowed</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-red" /> Blocked</span>
            </div>
          </PanelCard>
        </div>
      )}

      {/* Slide-over panels */}
      {editingHardStop && (
        <HardStopEditPanel
          rule={editingHardStop}
          onSave={(r) => { g.updateHardStop(r.id, r); setEditingHardStop(null); cardA.flash(); }}
          onClose={() => setEditingHardStop(null)}
        />
      )}
      {editingLock && (
        <LockEditPanel
          lock={editingLock}
          onSave={(l) => { g.updateStrategicLock(l.id, l); setEditingLock(null); cardB.flash(); }}
          onClose={() => setEditingLock(null)}
        />
      )}
    </div>
  );
};

export default GuardrailsView;
