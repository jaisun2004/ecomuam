export type Severity = "critical" | "warning" | "info";
export type RuleCategory = "setup" | "creative";
export type RuleAction = "flag" | "auto_pause" | "review";

export type PlacementSurface =
  | "Homepage Hero"
  | "Homepage Carousel"
  | "Category Page Banner"
  | "Category Top Slot"
  | "Featured Banner"
  | "Search Top"
  | "Brand Shelf"
  | "PDP Cross-sell";

export type ViolationImpact = "spend_at_risk" | "brand_risk" | "policy";

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
  impact?: ViolationImpact;
}

export type CreativeStatus = "ok" | "mismatch" | "missing";
export type CreativeVerdict = "pass" | "warning" | "blocked";
export type CreativeState = "active" | "preflight";

export interface CreativeCheckItem {
  label: string;
  required: string;
  actual: string;
  pass: boolean;
  critical?: boolean;
}

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
  surface: PlacementSurface;
  slot: string;
  state: CreativeState;
  scheduledGoLive?: string;
  thumbColor: string;
  verdict: CreativeVerdict;
  platformChecks: CreativeCheckItem[];
  brandChecks: CreativeCheckItem[];
}

export interface CompetitorBanner {
  id: string;
  competitor: string;
  competitorBrand: string;
  platform: string;
  surface: PlacementSurface;
  slot: string;
  thumbColor: string;
  headline: string;
  shareOfVoice: number;
  estSpendIndex: number;
  daysLive: number;
  ownSlot?: string;
  ownShareOfVoice?: number;
  positionalVerdict: "beating" | "behind" | "absent";
  shareVerdict: "beating" | "behind" | "absent";
}
