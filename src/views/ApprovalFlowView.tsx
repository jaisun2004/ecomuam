import React, { useState } from "react";
import { CheckCircle2, AlertTriangle, Clock, Send, ChevronDown, ChevronRight, Shield, Zap, Target, ArrowRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useGuardrails } from "@/contexts/GuardrailContext";

type ApprovalStatus = "pending" | "approved" | "rejected" | "escalated";

interface PlanSubmission {
  id: string;
  scenarioName: string;
  scenarioType: "Aggressive" | "Balanced" | "Defensive";
  submittedBy: string;
  submittedAt: string;
  totalBudget: string;
  blinkitSplit: string;
  zeptoSplit: string;
  roasRange: string;
  estImpressions: string;
  confidence: number;
  status: ApprovalStatus;
  campaigns: {
    name: string;
    sku: string;
    platform: string;
    type: string;
    city: string;
    dayPart: "Morning" | "Evening";
    dayType: "Weekday" | "Weekend";
    keywords: { keyword: string; bid: string; matchType: string }[];
    budget: string;
    estRoas: string;
    estImpressions: string;
  }[];
  cities: { name: string; blinkitBudget: string; zeptoBudget: string }[];
}

const mockSubmissions: PlanSubmission[] = [
  {
    id: "plan-001",
    scenarioName: "Aggressive",
    scenarioType: "Aggressive",
    submittedBy: "Brand Manager",
    submittedAt: "Mar 19, 2026 · 10:45 AM",
    totalBudget: "AED 1,00,00,000",
    blinkitSplit: "AED 30L",
    zeptoSplit: "AED 70L",
    roasRange: "2.8x – 4.2x",
    estImpressions: "18L – 24L weekly",
    confidence: 85,
    status: "pending",
    campaigns: [
      { name: "GDB-BLK-MOR-WD-KW", sku: "Pepsi 1L", platform: "Talabat", type: "Sponsored Product", city: "Dubai", dayPart: "Morning", dayType: "Weekday", keywords: [{ keyword: "butter drinks", bid: "AED 12", matchType: "Exact" }, { keyword: "tea time beverages", bid: "AED 9", matchType: "Phrase" }], budget: "AED 1,25,000/wk", estRoas: "3.2x", estImpressions: "1.8L" },
      { name: "GDB-BLK-EVE-WD-KW", sku: "Pepsi 1L", platform: "Talabat", type: "Sponsored Product", city: "Dubai", dayPart: "Evening", dayType: "Weekday", keywords: [{ keyword: "butter drinks", bid: "AED 14", matchType: "Exact" }, { keyword: "evening snacks", bid: "AED 11", matchType: "Broad" }], budget: "AED 1,50,000/wk", estRoas: "3.5x", estImpressions: "2.1L" },
      { name: "GDB-BLK-MOR-WE-KW", sku: "Pepsi 1L", platform: "Talabat", type: "Sponsored Product", city: "Dubai", dayPart: "Morning", dayType: "Weekend", keywords: [{ keyword: "butter drinks", bid: "AED 15", matchType: "Exact" }], budget: "AED 1,00,000/wk", estRoas: "3.8x", estImpressions: "1.5L" },
      { name: "GDB-ZEP-MOR-WD-KW", sku: "Pepsi 1L", platform: "Noon Minutes", type: "Sponsored Product", city: "Dubai", dayPart: "Morning", dayType: "Weekday", keywords: [{ keyword: "butter drinks", bid: "AED 10", matchType: "Exact" }, { keyword: "beverage online", bid: "AED 8", matchType: "Phrase" }, { keyword: "britannia drinks", bid: "AED 13", matchType: "Exact" }], budget: "AED 2,50,000/wk", estRoas: "4.0x", estImpressions: "3.2L" },
      { name: "GDB-ZEP-EVE-WD-KW", sku: "Pepsi 1L", platform: "Noon Minutes", type: "Sponsored Product", city: "Abu Dhabi", dayPart: "Evening", dayType: "Weekday", keywords: [{ keyword: "butter drinks", bid: "AED 11", matchType: "Exact" }, { keyword: "mcvities digestive", bid: "AED 14", matchType: "Exact" }], budget: "AED 2,25,000/wk", estRoas: "3.6x", estImpressions: "2.8L" },
      { name: "NCD-BLK-MOR-WD-CAT", sku: "Aquafina 1.5L", platform: "Talabat", type: "Sponsored Brand", city: "Bengaluru", dayPart: "Morning", dayType: "Weekday", keywords: [{ keyword: "digestive beverages", bid: "AED 9", matchType: "Exact" }, { keyword: "healthy snacks", bid: "AED 7", matchType: "Phrase" }], budget: "AED 1,00,000/wk", estRoas: "2.9x", estImpressions: "1.4L" },
      { name: "NCD-ZEP-EVE-WE-CAT", sku: "Aquafina 1.5L", platform: "Noon Minutes", type: "Sponsored Brand", city: "Bengaluru", dayPart: "Evening", dayType: "Weekend", keywords: [{ keyword: "digestive beverages", bid: "AED 11", matchType: "Exact" }, { keyword: "parle drinks", bid: "AED 12", matchType: "Exact" }], budget: "AED 1,75,000/wk", estRoas: "3.4x", estImpressions: "2.2L" },
      { name: "GDB-ZEP-MOR-WE-COMP", sku: "Pepsi 1L", platform: "Noon Minutes", type: "Sponsored Product", city: "Abu Dhabi", dayPart: "Morning", dayType: "Weekend", keywords: [{ keyword: "sunfeast drinks", bid: "AED 16", matchType: "Exact" }, { keyword: "parle drinks", bid: "AED 14", matchType: "Exact" }], budget: "AED 2,00,000/wk", estRoas: "2.8x", estImpressions: "2.0L" },
    ],
    cities: [
      { name: "Dubai", blinkitBudget: "AED 10L", zeptoBudget: "AED 25L" },
      { name: "Abu Dhabi", blinkitBudget: "AED 10L", zeptoBudget: "AED 25L" },
      { name: "Bengaluru", blinkitBudget: "AED 10L", zeptoBudget: "AED 20L" },
    ],
  },
];

const statusConfig: Record<ApprovalStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Pending Approval", color: "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))] border-[hsl(var(--warning))]/30", icon: <Clock size={12} /> },
  approved: { label: "Approved", color: "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))] border-[hsl(var(--success))]/30", icon: <CheckCircle2 size={12} /> },
  rejected: { label: "Rejected", color: "bg-destructive/15 text-destructive border-destructive/30", icon: <AlertTriangle size={12} /> },
  escalated: { label: "Escalated", color: "bg-primary/15 text-primary border-primary/30", icon: <Send size={12} /> },
};

const ApprovalFlowView: React.FC = () => {
  const [plans, setPlans] = useState<PlanSubmission[]>(mockSubmissions);
  const [expandedPlan, setExpandedPlan] = useState<string | null>("plan-001");
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({ campaigns: true, cities: true });
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [filterDayPart, setFilterDayPart] = useState<string>("All");
  const [filterDayType, setFilterDayType] = useState<string>("All");
  const g = useGuardrails();

  const toggleSection = (s: string) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));

  const handleApprove = (planId: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: "approved" as ApprovalStatus } : p));
    setAlertTriggered(true);
  };

  const handleReject = (planId: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: "rejected" as ApprovalStatus } : p));
  };

  const handleEscalate = (planId: string) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, status: "escalated" as ApprovalStatus } : p));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield size={20} className="text-primary" />
          <h1 className="text-lg font-display font-bold text-foreground">Plan Approval Flow</h1>
          <Badge variant="outline" className="text-[10px]">{plans.filter(p => p.status === "pending").length} pending</Badge>
        </div>
      </div>

      {alertTriggered && (
        <div className="bg-[hsl(var(--success))]/10 border border-[hsl(var(--success))]/30 rounded-lg px-4 py-3 flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={16} className="text-[hsl(var(--success))]" />
          <div>
            <p className="text-sm font-medium text-foreground">Plan approved — Campaign execution alert triggered</p>
            <p className="text-xs text-muted-foreground">8 campaigns queued for creation. Navigate to Campaign Manager to view execution status.</p>
          </div>
          <button
            onClick={() => g.navigateTo?.("campaigns")}
            className="ml-auto flex items-center gap-1 text-xs text-primary hover:underline"
          >
            Go to Campaigns <ArrowRight size={12} />
          </button>
        </div>
      )}

      {plans.map(plan => {
        const isExpanded = expandedPlan === plan.id;
        const sc = statusConfig[plan.status];
        const filteredCampaigns = plan.campaigns.filter(c =>
          (filterDayPart === "All" || c.dayPart === filterDayPart) &&
          (filterDayType === "All" || c.dayType === filterDayType)
        );

        return (
          <div key={plan.id} className="bg-surface-1 border border-border-visible rounded-xl overflow-hidden">
            {/* Header */}
            <button onClick={() => setExpandedPlan(isExpanded ? null : plan.id)} className="w-full flex items-center justify-between px-5 py-4 hover:bg-surface-2 transition-colors">
              <div className="flex items-center gap-3">
                {isExpanded ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                <div className="text-left">
                  <p className="text-sm font-semibold text-foreground">Scenario: {plan.scenarioName}</p>
                  <p className="text-[11px] text-muted-foreground">Submitted by {plan.submittedBy} · {plan.submittedAt}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2.5 py-1 rounded-full border ${sc.color}`}>
                  {sc.icon} {sc.label}
                </span>
                <span className="text-xs text-muted-foreground">Budget: {plan.totalBudget}</span>
              </div>
            </button>

            {isExpanded && (
              <div className="px-5 pb-5 space-y-5 border-t border-border-visible pt-4">
                {/* Summary metrics */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    { label: "Total Budget", value: plan.totalBudget },
                    { label: "Talabat", value: plan.blinkitSplit },
                    { label: "Noon Minutes", value: plan.zeptoSplit },
                    { label: "Est. ROAS", value: plan.roasRange },
                    { label: "Est. Impressions", value: plan.estImpressions },
                  ].map(m => (
                    <div key={m.label} className="bg-surface-2 rounded-lg p-3">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{m.label}</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Confidence */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Confidence</span>
                    <span className={`text-lg font-bold ${plan.confidence >= 80 ? "text-[hsl(var(--success))]" : plan.confidence >= 50 ? "text-[hsl(var(--warning))]" : "text-destructive"}`}>
                      {plan.confidence}%
                    </span>
                  </div>
                  <div className="flex-1 h-2 bg-surface-3 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${plan.confidence >= 80 ? "bg-[hsl(var(--success))]" : plan.confidence >= 50 ? "bg-[hsl(var(--warning))]" : "bg-destructive"}`} style={{ width: `${plan.confidence}%` }} />
                  </div>
                </div>

                {/* City targeting */}
                <div>
                  <button onClick={() => toggleSection("cities")} className="flex items-center gap-2 mb-2">
                    {expandedSections.cities ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">City Targeting</span>
                  </button>
                  {expandedSections.cities && (
                    <div className="overflow-auto rounded-lg border border-border-visible">
                      <table className="w-full text-xs">
                        <thead><tr className="bg-surface-2 text-muted-foreground">
                          <th className="px-3 py-2 text-left">City</th>
                          <th className="px-3 py-2 text-right">Talabat Budget</th>
                          <th className="px-3 py-2 text-right">Noon Minutes Budget</th>
                        </tr></thead>
                        <tbody className="text-foreground">
                          {plan.cities.map(c => (
                            <tr key={c.name} className="border-t border-border-visible">
                              <td className="px-3 py-2">{c.name}</td>
                              <td className="px-3 py-2 text-right">{c.blinkitBudget}</td>
                              <td className="px-3 py-2 text-right">{c.zeptoBudget}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Campaigns */}
                <div>
                  <button onClick={() => toggleSection("campaigns")} className="flex items-center gap-2 mb-2">
                    {expandedSections.campaigns ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Campaign Breakdown ({plan.campaigns.length} campaigns)</span>
                  </button>
                  {expandedSections.campaigns && (
                    <>
                      {/* Filters */}
                      <div className="flex gap-3 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Day Part:</span>
                          <Select value={filterDayPart} onValueChange={setFilterDayPart}>
                            <SelectTrigger className="w-[120px] h-7 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["All", "Morning", "Evening"].map(v => (
                                <SelectItem key={v} value={v} className="text-[10px]">{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-muted-foreground">Day Type:</span>
                          <Select value={filterDayType} onValueChange={setFilterDayType}>
                            <SelectTrigger className="w-[120px] h-7 text-[10px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {["All", "Weekday", "Weekend"].map(v => (
                                <SelectItem key={v} value={v} className="text-[10px]">{v}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {filteredCampaigns.map((c, i) => (
                          <div key={i} className="bg-surface-2 border border-border-visible rounded-lg p-3 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold text-foreground">{c.name}</p>
                                <Badge variant="outline" className="text-[9px]">{c.type}</Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.dayPart === "Morning" ? "bg-[hsl(var(--warning))]/15 text-[hsl(var(--warning))]" : "bg-primary/15 text-primary"}`}>{c.dayPart}</span>
                                <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${c.dayType === "Weekday" ? "bg-surface-3 text-foreground" : "bg-[hsl(var(--success))]/15 text-[hsl(var(--success))]"}`}>{c.dayType}</span>
                              </div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 text-[11px]">
                              <div><span className="text-muted-foreground">SKU:</span> <span className="text-foreground">{c.sku}</span></div>
                              <div><span className="text-muted-foreground">Platform:</span> <span className="text-foreground">{c.platform}</span></div>
                              <div><span className="text-muted-foreground">City:</span> <span className="text-foreground">{c.city}</span></div>
                              <div><span className="text-muted-foreground">Budget:</span> <span className="text-foreground">{c.budget}</span></div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-[11px]">
                              <div><span className="text-muted-foreground">Est. ROAS:</span> <span className="text-foreground font-medium">{c.estRoas}</span></div>
                              <div><span className="text-muted-foreground">Est. Impressions:</span> <span className="text-foreground font-medium">{c.estImpressions}</span></div>
                            </div>
                            {/* Keywords with bids */}
                            <div>
                              <p className="text-[10px] text-muted-foreground mb-1">Keywords & Bids</p>
                              <div className="overflow-auto rounded border border-border-visible">
                                <table className="w-full text-[10px]">
                                  <thead><tr className="bg-surface-3 text-muted-foreground">
                                    <th className="px-2 py-1 text-left">Keyword</th>
                                    <th className="px-2 py-1 text-right">Bid</th>
                                    <th className="px-2 py-1 text-left">Match</th>
                                  </tr></thead>
                                  <tbody className="text-foreground">
                                    {c.keywords.map((kw, j) => (
                                      <tr key={j} className="border-t border-border-visible">
                                        <td className="px-2 py-1">{kw.keyword}</td>
                                        <td className="px-2 py-1 text-right font-mono">{kw.bid}</td>
                                        <td className="px-2 py-1">{kw.matchType}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Action buttons */}
                {plan.status === "pending" && (
                  <div className="flex items-center gap-3 pt-3 border-t border-border-visible">
                    <button onClick={() => handleApprove(plan.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-[hsl(var(--success))] text-white hover:bg-[hsl(var(--success))]/90 transition-colors">
                      <CheckCircle2 size={14} /> Approve & Execute
                    </button>
                    <button onClick={() => handleReject(plan.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
                      <AlertTriangle size={14} /> Reject
                    </button>
                    <button onClick={() => handleEscalate(plan.id)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                      <Send size={14} /> Escalate
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ApprovalFlowView;