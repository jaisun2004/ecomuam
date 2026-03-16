import React, { createContext, useContext, useState, useCallback } from "react";

// ─── Metric Catalogue ───
export type MetricKey =
  | "availability_pct"
  | "daily_spend_pct"
  | "daily_spend_inr"
  | "budget_remaining_inr"
  | "roas"
  | "cpc_inr"
  | "ctr_pct"
  | "impression_share_pct"
  | "conversion_rate_pct"
  | "acos_pct";

export type Operator =
  | "less_than"
  | "less_than_or_equal"
  | "greater_than"
  | "greater_than_or_equal"
  | "equals";

export interface MetricCondition {
  metric: MetricKey;
  operator: Operator;
  value: number;
  consecutive_days: number;
}

// ─── Action Primitives ───
export type ActionPrimitive =
  | "pause_campaign"
  | "start_campaign"
  | "increase_budget"
  | "decrease_budget"
  | "increase_bid"
  | "decrease_bid"
  | "add_keywords"
  | "remove_keywords"
  | "add_products"
  | "remove_products";

// ─── Campaign Scope ───
export type CampaignScope =
  | "all"
  | "brand_search"
  | "performance_max"
  | "non_brand"
  | "retargeting"
  | "festival"
  | "custom";

// ─── Shared label maps ───
export const METRIC_LABELS: Record<MetricKey, string> = {
  availability_pct: "Availability %",
  daily_spend_pct: "Daily spend (% of cap)",
  daily_spend_inr: "Daily spend (₹)",
  budget_remaining_inr: "Budget remaining (₹)",
  roas: "ROAS",
  cpc_inr: "CPC (₹)",
  ctr_pct: "CTR (%)",
  impression_share_pct: "Impression share (%)",
  conversion_rate_pct: "Conversion rate (%)",
  acos_pct: "ACoS (%)",
};

export const METRIC_UNITS: Record<MetricKey, string> = {
  availability_pct: "%",
  daily_spend_pct: "%",
  daily_spend_inr: "₹",
  budget_remaining_inr: "₹",
  roas: "x",
  cpc_inr: "₹",
  ctr_pct: "%",
  impression_share_pct: "%",
  conversion_rate_pct: "%",
  acos_pct: "%",
};

export const METRIC_RANGES: Record<MetricKey, { min: number; max: number; step: number }> = {
  availability_pct: { min: 0, max: 100, step: 1 },
  daily_spend_pct: { min: 0, max: 100, step: 1 },
  daily_spend_inr: { min: 0, max: 99999999, step: 1 },
  budget_remaining_inr: { min: 0, max: 99999999, step: 1 },
  roas: { min: 0, max: 50, step: 0.1 },
  cpc_inr: { min: 0, max: 9999, step: 0.01 },
  ctr_pct: { min: 0, max: 100, step: 0.01 },
  impression_share_pct: { min: 0, max: 100, step: 1 },
  conversion_rate_pct: { min: 0, max: 100, step: 0.01 },
  acos_pct: { min: 0, max: 100, step: 0.01 },
};

export const OPERATOR_LABELS: Record<Operator, string> = {
  less_than: "less than",
  less_than_or_equal: "less than or equal to",
  greater_than: "greater than",
  greater_than_or_equal: "greater than or equal to",
  equals: "equals",
};

export const SCOPE_LABELS: Record<CampaignScope, string> = {
  all: "All campaigns",
  brand_search: "Brand Search",
  performance_max: "Performance Max",
  non_brand: "Non-Brand",
  retargeting: "Retargeting",
  festival: "Festival",
  custom: "Specific campaigns",
};

export const ACTION_PRIMITIVES: { group: string; actions: { key: ActionPrimitive; label: string }[] }[] = [
  { group: "Campaign state", actions: [{ key: "pause_campaign", label: "Pause campaign" }, { key: "start_campaign", label: "Start campaign" }] },
  { group: "Budget", actions: [{ key: "increase_budget", label: "Increase budget" }, { key: "decrease_budget", label: "Decrease budget" }] },
  { group: "Bid", actions: [{ key: "increase_bid", label: "Increase bid" }, { key: "decrease_bid", label: "Decrease bid" }] },
  { group: "Keywords", actions: [{ key: "add_keywords", label: "Add keywords" }, { key: "remove_keywords", label: "Remove keywords" }] },
  { group: "Products", actions: [{ key: "add_products", label: "Add products" }, { key: "remove_products", label: "Remove products" }] },
];

export function formatCondition(c: MetricCondition): string {
  const dayLabel = c.consecutive_days === 1 ? "immediately" : `for ${c.consecutive_days} days`;
  return `${METRIC_LABELS[c.metric]} ${OPERATOR_LABELS[c.operator]} ${c.value}${METRIC_UNITS[c.metric]} ${dayLabel}`;
}

// ─── Hard Stop ───
export interface HardStopRule {
  id: string;
  name: string;
  condition: MetricCondition | null; // null for emergency kill switch
  scope: CampaignScope;
  campaign_ids?: string[];
  blocked_actions: ActionPrimitive[];
  enabled: boolean;
  last_triggered_at: number | null;
  is_emergency?: boolean;
}

// ─── Strategic Lock ───
export type LockTriggerType = "manual" | "scheduled" | "conditional";

export interface LockTriggerManual {
  type: "manual";
}
export interface LockTriggerScheduled {
  type: "scheduled";
  start_date: string; // ISO 8601
  end_date: string;
  repeat_annually: boolean;
}
export interface LockTriggerConditional {
  type: "conditional";
  activate_condition: MetricCondition;
  release_type: "manual" | "condition_clears" | "after_hours";
  release_hours: number | null;
}
export type LockTrigger = LockTriggerManual | LockTriggerScheduled | LockTriggerConditional;

export interface StrategicLock {
  id: string;
  name: string;
  reason: string;
  campaign_scope: CampaignScope;
  campaign_ids: string[];
  keyword_ids: string[];
  keyword_pattern: string | null;
  product_ids: string[];
  locked_actions: ActionPrimitive[];
  allow_manual_override: boolean;
  trigger: LockTrigger;
  enabled: boolean;
}

// ─── Other types (unchanged) ───
export type TierLevel = 1 | 2 | 3;
export type PermissionState = "allow" | "review" | "block";

export interface VelocityLimits {
  maxBidChangePct: number;
  maxBudgetChangePct: number;
  maxActionsPerCampaignPerDay: number;
  maxActionsPerHour: number;
  coolingOffHours: number;
}

export type ConflictMode = "hard_block" | "soft_queue" | "escalate";

export interface ActionOwnership {
  insightId: string;
  ownerScreen: string;
  campaignName: string;
  status: "active" | "blocked" | "queued";
  reason?: string;
}

export interface ContextFilter {
  type: string;
  params: Record<string, string>;
}

// ─── State interface ───
interface GuardrailState {
  hardStops: HardStopRule[];
  strategicLocks: StrategicLock[];
  permissionMatrix: Record<string, Record<string, PermissionState>>;
  conflictMode: ConflictMode;
  estResolutionTime: string;
  velocityLimits: VelocityLimits;
  actionOwnerships: ActionOwnership[];
  navigateTo: (screen: string, scrollTarget?: string) => void;
  setNavigateTo: (fn: (screen: string, scrollTarget?: string) => void) => void;
  contextFilter: ContextFilter | null;
  setContextFilter: (filter: ContextFilter | null) => void;
  navigateWithContext: (screen: string, scrollTarget?: string, context?: ContextFilter) => void;
  isBlocked: (insightType: string) => boolean;
  getOwner: (insightId: string) => ActionOwnership | undefined;
  isOwnedBy: (insightId: string, screen: string) => boolean;
  hasActiveTier1: () => boolean;
  hasActiveAvailabilityStop: () => boolean;
  hasDefenseBlocked: () => boolean;
  hasDefenseActive: () => boolean;
  updateHardStop: (id: string, updates: Partial<HardStopRule>) => void;
  addHardStop: (rule: HardStopRule) => void;
  updateStrategicLock: (id: string, updates: Partial<StrategicLock>) => void;
  addStrategicLock: (lock: StrategicLock) => void;
  updatePermission: (insight: string, campaign: string, state: PermissionState) => void;
  setConflictMode: (mode: ConflictMode) => void;
  setEstResolutionTime: (time: string) => void;
  updateVelocityLimits: (updates: Partial<VelocityLimits>) => void;
  resetVelocityDefaults: () => void;
}

// ─── Defaults ───
const defaultVelocity: VelocityLimits = {
  maxBidChangePct: 25,
  maxBudgetChangePct: 30,
  maxActionsPerCampaignPerDay: 3,
  maxActionsPerHour: 10,
  coolingOffHours: 2,
};

const insightTypes = ["Defense", "Opportunity", "Bid optimisation", "Daypart adjustment", "Budget shift"];
const campaignTypes = ["Brand Search", "Performance Max", "Non-Brand", "Retargeting", "Festival"];

const defaultPermissions: Record<string, Record<string, PermissionState>> = {};
insightTypes.forEach(i => {
  defaultPermissions[i] = {};
  campaignTypes.forEach(c => {
    defaultPermissions[i][c] = "allow";
  });
});
defaultPermissions["Defense"]["Retargeting"] = "review";
defaultPermissions["Budget shift"]["Festival"] = "block";

const defaultHardStops: HardStopRule[] = [
  {
    id: "hs1", name: "Availability threshold",
    condition: { metric: "availability_pct", operator: "less_than", value: 20, consecutive_days: 1 },
    scope: "all", blocked_actions: ["pause_campaign", "increase_budget", "increase_bid"],
    enabled: true, last_triggered_at: Date.now() - 7200000,
  },
  {
    id: "hs2", name: "Daily budget exhausted",
    condition: { metric: "daily_spend_pct", operator: "greater_than_or_equal", value: 100, consecutive_days: 1 },
    scope: "all", blocked_actions: ["increase_budget", "increase_bid"],
    enabled: true, last_triggered_at: Date.now() - 86400000,
  },
  {
    id: "hs3", name: "Brand safety flag",
    condition: { metric: "impression_share_pct", operator: "less_than", value: 10, consecutive_days: 1 },
    scope: "brand_search", blocked_actions: ["add_keywords", "increase_bid"],
    enabled: false, last_triggered_at: null,
  },
  {
    id: "hs4", name: "Emergency kill switch",
    condition: null, scope: "all",
    blocked_actions: ["pause_campaign"],
    enabled: false, last_triggered_at: null, is_emergency: true,
  },
];

const defaultStrategicLocks: StrategicLock[] = [
  {
    id: "sl1", name: "Manual pause", reason: "Team requested pause for creative refresh",
    campaign_scope: "custom", campaign_ids: ["creatine-retargeting"], keyword_ids: [], keyword_pattern: null, product_ids: [],
    locked_actions: ["pause_campaign", "increase_bid", "decrease_bid"],
    allow_manual_override: true,
    trigger: { type: "scheduled", start_date: "2026-03-10", end_date: "2026-03-20", repeat_annually: false },
    enabled: true,
  },
  {
    id: "sl2", name: "Seasonal/festival hold", reason: "Hold budgets for festival period",
    campaign_scope: "festival", campaign_ids: [], keyword_ids: [], keyword_pattern: null, product_ids: [],
    locked_actions: ["decrease_budget", "pause_campaign"],
    allow_manual_override: false,
    trigger: { type: "scheduled", start_date: "2026-03-25", end_date: "2026-04-05", repeat_annually: true },
    enabled: false,
  },
  {
    id: "sl3", name: "Budget pacing floor", reason: "Ensure minimum daily spend on protein campaigns",
    campaign_scope: "custom", campaign_ids: ["whey-protein-sponsored"], keyword_ids: [], keyword_pattern: null, product_ids: [],
    locked_actions: ["decrease_budget"],
    allow_manual_override: true,
    trigger: {
      type: "conditional",
      activate_condition: { metric: "daily_spend_pct", operator: "less_than", value: 50, consecutive_days: 2 },
      release_type: "condition_clears",
      release_hours: null,
    },
    enabled: true,
  },
];

const defaultOwnerships: ActionOwnership[] = [
  { insightId: "avail-pause", ownerScreen: "campaigns", campaignName: "Creatine Retargeting", status: "active", reason: "Tier 1: Availability < 20%" },
  { insightId: "defense-kw-whey", ownerScreen: "campaigns", campaignName: "Whey Protein — Sponsored", status: "active" },
  { insightId: "budget-shift-flipkart", ownerScreen: "budget", campaignName: "Creatine Retargeting", status: "active" },
];

const GuardrailContext = createContext<GuardrailState | null>(null);

export const useGuardrails = () => {
  const ctx = useContext(GuardrailContext);
  if (!ctx) throw new Error("useGuardrails must be used within GuardrailProvider");
  return ctx;
};

export const GuardrailProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hardStops, setHardStops] = useState(defaultHardStops);
  const [strategicLocks, setStrategicLocks] = useState(defaultStrategicLocks);
  const [permissionMatrix, setPermissionMatrix] = useState(defaultPermissions);
  const [conflictMode, setConflictModeState] = useState<ConflictMode>("soft_queue");
  const [estResolutionTime, setEstResolutionTime] = useState("~45 min");
  const [velocityLimits, setVelocityLimits] = useState(defaultVelocity);
  const [actionOwnerships] = useState(defaultOwnerships);
  const [navFn, setNavFn] = useState<(screen: string, scrollTarget?: string) => void>(() => () => {});
  const [contextFilter, setContextFilter] = useState<ContextFilter | null>(null);

  const navigateWithContext = useCallback((screen: string, scrollTarget?: string, context?: ContextFilter) => {
    if (context) setContextFilter(context);
    navFn(screen, scrollTarget);
  }, [navFn]);

  const updateHardStop = useCallback((id: string, updates: Partial<HardStopRule>) => {
    setHardStops(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  const addHardStop = useCallback((rule: HardStopRule) => {
    setHardStops(prev => [...prev, rule]);
  }, []);

  const updateStrategicLock = useCallback((id: string, updates: Partial<StrategicLock>) => {
    setStrategicLocks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const addStrategicLock = useCallback((lock: StrategicLock) => {
    setStrategicLocks(prev => [...prev, lock]);
  }, []);

  const updatePermission = useCallback((insight: string, campaign: string, state: PermissionState) => {
    setPermissionMatrix(prev => ({
      ...prev,
      [insight]: { ...prev[insight], [campaign]: state },
    }));
  }, []);

  const updateVelocityLimitsHandler = useCallback((updates: Partial<VelocityLimits>) => {
    setVelocityLimits(prev => ({ ...prev, ...updates }));
  }, []);

  const resetVelocityDefaults = useCallback(() => {
    setVelocityLimits(defaultVelocity);
  }, []);

  const hasActiveTier1 = useCallback(() => hardStops.some(r => r.enabled && r.last_triggered_at), [hardStops]);
  const hasActiveAvailabilityStop = useCallback(() => {
    const rule = hardStops.find(r => r.id === "hs1");
    return !!(rule?.enabled && rule.last_triggered_at);
  }, [hardStops]);
  const hasDefenseBlocked = useCallback(() => {
    return hasActiveTier1() && actionOwnerships.some(o => o.insightId === "defense-kw-whey" && o.status === "active");
  }, [hardStops, actionOwnerships]);
  const hasDefenseActive = useCallback(() => {
    return actionOwnerships.some(o => o.insightId === "defense-kw-whey" && o.status === "active") && !hasActiveTier1();
  }, [actionOwnerships, hardStops]);
  const isBlocked = useCallback((_insightType: string) => {
    if (!hasActiveTier1()) return false;
    return true;
  }, [hardStops]);
  const getOwner = useCallback((insightId: string) => actionOwnerships.find(o => o.insightId === insightId), [actionOwnerships]);
  const isOwnedBy = useCallback((insightId: string, screen: string) => {
    const owner = actionOwnerships.find(o => o.insightId === insightId);
    return owner?.ownerScreen === screen;
  }, [actionOwnerships]);

  const value: GuardrailState = {
    hardStops, strategicLocks, permissionMatrix, conflictMode, estResolutionTime, velocityLimits, actionOwnerships,
    navigateTo: navFn,
    setNavigateTo: (fn) => setNavFn(() => fn),
    contextFilter, setContextFilter, navigateWithContext,
    isBlocked, getOwner, isOwnedBy, hasActiveTier1, hasActiveAvailabilityStop, hasDefenseBlocked, hasDefenseActive,
    updateHardStop, addHardStop, updateStrategicLock, addStrategicLock, updatePermission,
    setConflictMode: setConflictModeState, setEstResolutionTime,
    updateVelocityLimits: updateVelocityLimitsHandler, resetVelocityDefaults,
  };

  return <GuardrailContext.Provider value={value}>{children}</GuardrailContext.Provider>;
};
