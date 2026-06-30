export type Severity = "critical" | "warning" | "info";
export type RuleCategory = "setup" | "creative";
export type RuleAction = "flag" | "auto_pause" | "review";

export interface GovernanceRule {
  id: string;
  name: string;
  description: string;
  category: RuleCategory;
  platforms: string[];
  campaignTypes: string[];
  severity: Severity;
  enabled: boolean;
  actionOnViolation: RuleAction;
  config: Record<string, string>;
}

export interface ApprovedPlan {
  id: string;
  campaign: string;
  platform: string;
  objective: string;
  audience: string;
  geo: string[];
  frequencyCap: string;
  placements: string[];
  trackingParams: string;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  approvedBy: string;
  status: "approved" | "draft" | "expired";
}

export type ViolationStatus = "open" | "pause_requested" | "fix_requested" | "waived" | "resolved";

export interface Violation {
  id: string;
  campaign: string;
  platform: string;
  rule: string;
  field: string;
  approved: string;
  live: string;
  severity: Severity;
  status: ViolationStatus;
  detectedAt: string;
  note?: string;
}

export type CreativeStatus = "ok" | "mismatch" | "missing";

export interface CreativeCheck {
  id: string;
  publisher: string;
  sku: string;
  productName: string;
  approvedAssetVersion: string;
  servedAssetVersion: string;
  approvedLandingPage: string;
  servedLandingPage: string;
  approvedCTA: string;
  servedCTA: string;
  status: CreativeStatus;
  mismatchTypes: ("asset" | "landing_page" | "cta")[];
}
