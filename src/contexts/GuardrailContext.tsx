import React, { createContext, useContext, useState, useCallback } from "react";

export type TierLevel = 1 | 2 | 3;

export interface HardStopRule {
  id: string;
  name: string;
  condition: string;
  scope: "All" | "Brand" | "Performance" | "Custom";
  enabled: boolean;
  lastTriggered: string | null;
}

export interface StrategicLock {
  id: string;
  name: string;
  campaigns: string[];
  dateRange: { from: string; to: string };
  enabled: boolean;
  budgetFloor?: string;
}

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

interface GuardrailState {
  hardStops: HardStopRule[];
  strategicLocks: StrategicLock[];
  permissionMatrix: Record<string, Record<string, PermissionState>>;
  conflictMode: ConflictMode;
  estResolutionTime: string;
  velocityLimits: VelocityLimits;
  actionOwnerships: ActionOwnership[];
  // Navigation
  navigateTo: (screen: string, scrollTarget?: string) => void;
  setNavigateTo: (fn: (screen: string, scrollTarget?: string) => void) => void;
  // Context filter for Campaign Manager
  contextFilter: ContextFilter | null;
  setContextFilter: (filter: ContextFilter | null) => void;
  navigateWithContext: (screen: string, scrollTarget?: string, context?: ContextFilter) => void;
  // Helpers
  isBlocked: (insightType: string) => boolean;
  getOwner: (insightId: string) => ActionOwnership | undefined;
  isOwnedBy: (insightId: string, screen: string) => boolean;
  hasActiveTier1: () => boolean;
  hasActiveAvailabilityStop: () => boolean;
  hasDefenseBlocked: () => boolean;
  hasDefenseActive: () => boolean;
  // Mutators
  updateHardStop: (id: string, updates: Partial<HardStopRule>) => void;
  updateStrategicLock: (id: string, updates: Partial<StrategicLock>) => void;
  updatePermission: (insight: string, campaign: string, state: PermissionState) => void;
  setConflictMode: (mode: ConflictMode) => void;
  setEstResolutionTime: (time: string) => void;
  updateVelocityLimits: (updates: Partial<VelocityLimits>) => void;
  resetVelocityDefaults: () => void;
}

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
  { id: "hs1", name: "Availability threshold", condition: "stock < 20%", scope: "All", enabled: true, lastTriggered: "2 hours ago" },
  { id: "hs2", name: "Daily budget exhausted", condition: "spend = 100% cap", scope: "All", enabled: true, lastTriggered: "Yesterday, 6:42 PM" },
  { id: "hs3", name: "Brand safety flag", condition: "policy violation detected", scope: "Brand", enabled: false, lastTriggered: null },
  { id: "hs4", name: "Emergency kill switch", condition: "manual trigger", scope: "All", enabled: false, lastTriggered: null },
];

const defaultStrategicLocks: StrategicLock[] = [
  { id: "sl1", name: "Manual pause", campaigns: ["Creatine Retargeting"], dateRange: { from: "2026-03-10", to: "2026-03-20" }, enabled: true },
  { id: "sl2", name: "Seasonal/festival hold", campaigns: ["Festival Campaigns"], dateRange: { from: "2026-03-25", to: "2026-04-05" }, enabled: false },
  { id: "sl3", name: "Budget pacing floor", campaigns: ["Whey Protein — Sponsored"], dateRange: { from: "2026-03-01", to: "2026-03-31" }, enabled: true, budgetFloor: "₹5,000" },
];

const defaultOwnerships: ActionOwnership[] = [
  { insightId: "avail-pause", ownerScreen: "campaigns", campaignName: "Creatine Retargeting", status: "active", reason: "Tier 1: stock < 20%" },
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

  const updateStrategicLock = useCallback((id: string, updates: Partial<StrategicLock>) => {
    setStrategicLocks(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
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

  const hasActiveTier1 = useCallback(() => hardStops.some(r => r.enabled && r.lastTriggered), [hardStops]);
  const hasActiveAvailabilityStop = useCallback(() => {
    const rule = hardStops.find(r => r.id === "hs1");
    return !!(rule?.enabled && rule.lastTriggered);
  }, [hardStops]);
  const hasDefenseBlocked = useCallback(() => {
    return hasActiveTier1() && actionOwnerships.some(o => o.insightId === "defense-kw-whey" && o.status === "active");
  }, [hardStops, actionOwnerships]);
  const hasDefenseActive = useCallback(() => {
    return actionOwnerships.some(o => o.insightId === "defense-kw-whey" && o.status === "active") && !hasActiveTier1();
  }, [actionOwnerships, hardStops]);
  const isBlocked = useCallback((insightType: string) => {
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
    updateHardStop, updateStrategicLock, updatePermission,
    setConflictMode: setConflictModeState, setEstResolutionTime,
    updateVelocityLimits: updateVelocityLimitsHandler, resetVelocityDefaults,
  };

  return <GuardrailContext.Provider value={value}>{children}</GuardrailContext.Provider>;
};
