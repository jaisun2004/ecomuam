import React, { useState } from "react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { Gauge, RefreshCw, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const urgentIssues = [
  { id: 1, tier: "T1" as const, desc: "Availability below 20% — 4 campaigns paused", source: "Availability", sourceId: "availability", target: "avail-dedup-banner" },
  { id: 2, tier: "T1" as const, desc: "Budget exhausted — Good Day Brand Search campaign", source: "Campaign Mgr", sourceId: "campaigns", target: "campaign-conflict-banner" },
  { id: 3, tier: "T2" as const, desc: "Competitor bidding on 12 brand keywords", source: "Competitor Hub", sourceId: "competitors", target: "defense-insight" },
  { id: 4, tier: "T3" as const, desc: "Budget reallocation opportunity — shift ₹50K", source: "Budget Opt.", sourceId: "budget", confidence: 4 },
  { id: 5, tier: "T3" as const, desc: "Daypart budget shift projected +18% conversion", source: "Campaign Mgr", sourceId: "campaigns", target: "campaign-digest", confidence: 4 },
  { id: 6, tier: "T3" as const, desc: "New keyword opportunities detected — 8 terms", source: "Discovery", sourceId: "discovery", confidence: 3 },
];

const kpiData = [
  { label: "Brand SoV", value: "48%", delta: "+2%", positive: true },
  { label: "Content Score", value: "74/100", delta: "-5%", positive: false },
  { label: "ROAS", value: "4.2x", delta: "+0.3x", positive: true },
  { label: "Availability", value: "68%", delta: "-4%", positive: false },
];

const potentialFlags = [
  { id: 1, desc: "Availability at 28% — threshold fires at 20%", source: "Availability", sourceId: "availability" },
  { id: 2, desc: "Competitor activity up 40% WoW on brand keywords", source: "Competitor Hub", sourceId: "competitors" },
  { id: 3, desc: "Seasonal lock activates in 2 days", source: "Guardrails", sourceId: "guardrails" },
  { id: 4, desc: "ROAS declining 3 consecutive days — not yet below floor", source: "Campaign Mgr", sourceId: "campaigns" },
  { id: 5, desc: "Rule Engine fired but velocity limit blocked action", source: "Guardrails", sourceId: "guardrails" },
];

const systemRows = [
  { name: "Campaign Manager", id: "campaigns", status: "Active", dot: "#FF5C5C" },
  { name: "Availability", id: "availability", status: "Active", dot: "#FF5C5C" },
  { name: "Pricing", id: "pricing", status: "Clear", dot: "#2ECF8E" },
  { name: "Competitor Ads Hub", id: "competitors", status: "Warning", dot: "#F5A623" },
  { name: "Budget Optimiser", id: "budget", status: "Clear", dot: "#2ECF8E" },
  { name: "Festival Campaigns", id: "festival", status: "Clear", dot: "#2ECF8E" },
  { name: "Rule Engine", id: "guardrails", status: "Clear", dot: "#2ECF8E" },
  { name: "Guardrails", id: "guardrails", status: "Warning", dot: "#F5A623" },
];

const tierBorder = (tier: string) => {
  if (tier === "T1") return "#FF5C5C";
  if (tier === "T2") return "#F5A623";
  if (tier === "pending") return "#4F7FFF";
  return "#2ECF8E";
};

const CentralCockpitView: React.FC = () => {
  const g = useGuardrails();
  const { toast } = useToast();
  const [approvedIds, setApprovedIds] = useState<Set<number>>(new Set());

  const visibleItems = urgentIssues
    .filter(i => !approvedIds.has(i.id))
    .sort((a, b) => {
      const tierOrder: Record<string, number> = { T1: 0, T2: 1, T3: 3 };
      const aOrder = a.confidence && a.confidence >= 3 ? 2 : tierOrder[a.tier];
      const bOrder = b.confidence && b.confidence >= 3 ? 2 : tierOrder[b.tier];
      return aOrder - bOrder;
    });

  const approvableItems = urgentIssues.filter(i => i.tier === "T3" && i.confidence && i.confidence >= 4 && !approvedIds.has(i.id));
  const hasUrgentOrPending = visibleItems.length > 0;

  const handleApprove = (id: number) => {
    setApprovedIds(prev => new Set(prev).add(id));
    const item = urgentIssues.find(a => a.id === id);
    toast({
      title: "Action approved",
      description: item?.desc || "",
      action: <button onClick={() => setApprovedIds(prev => { const s = new Set(prev); s.delete(id); return s; })} className="text-xs font-medium" style={{ color: "#A78BFA" }}>Undo</button>,
      duration: 5000,
    });
  };

  const handleBatchApprove = () => {
    const ids = approvableItems.map(i => i.id);
    setApprovedIds(prev => { const s = new Set(prev); ids.forEach(id => s.add(id)); return s; });
    toast({
      title: `${ids.length} actions approved`,
      description: "All high-confidence actions applied",
      action: <button onClick={() => setApprovedIds(prev => { const s = new Set(prev); ids.forEach(id => s.delete(id)); return s; })} className="text-xs font-medium" style={{ color: "#A78BFA" }}>Undo all</button>,
      duration: 5000,
    });
  };

  const confidencePips = (level: number) => {
    const c = level >= 4 ? "#2ECF8E" : level === 3 ? "#F5A623" : "hsl(220,10%,46%)";
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < level ? c : "hsl(220,13%,91%)" }}>●</span>
    ));
  };

  const clearCount = systemRows.filter(r => r.dot === "#2ECF8E").length;

  return (
    <div className="space-y-5 pb-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Gauge size={20} className="text-primary" /> Central Cockpit
        </h1>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-[11px]">Updated 4 min ago</span>
          <RefreshCw size={13} className="cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-4 gap-3">
        {kpiData.map(kpi => (
          <div key={kpi.label} className="rounded-xl border border-subtle bg-surface-1 p-4">
            <p className="text-[10px] text-muted-foreground mb-1">{kpi.label}</p>
            <p className="font-display font-bold text-xl text-foreground">{kpi.value}</p>
            <span className={`inline-block mt-1 font-mono text-[10px] px-1.5 py-0.5 rounded-full ${
              kpi.positive ? "bg-sw-green-dim text-sw-green" : "bg-sw-red-dim text-sw-red"
            }`}>{kpi.delta}</span>
          </div>
        ))}
      </div>

      {/* All clear state */}
      {!hasUrgentOrPending && potentialFlags.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-3 h-3 rounded-full mb-4" style={{ backgroundColor: "#2ECF8E" }} />
          <p className="text-base font-medium text-foreground">All clear</p>
          <p className="text-[13px] mt-1 text-muted-foreground">No issues · No pending approvals</p>
        </div>
      ) : (
        /* Three-column grid */
        <div className="grid grid-cols-3 gap-4" style={{ minHeight: 340 }}>
          {/* Alerts column */}
          <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Alerts ({visibleItems.length})</h3>
              {approvableItems.length >= 2 && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                      Approve all safe ({approvableItems.length})
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Approve {approvableItems.length} safe actions?</AlertDialogTitle>
                      <AlertDialogDescription>
                        The following high-confidence actions will be approved:
                        <ul className="mt-2 space-y-1 list-disc pl-4">
                          {approvableItems.map(item => (
                            <li key={item.id}>{item.desc}</li>
                          ))}
                        </ul>
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleBatchApprove} className="bg-primary text-primary-foreground">Confirm Approve All</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-subtle/50">
              {visibleItems.map(item => {
                const isApprovable = item.confidence && item.confidence >= 3;
                const borderColor = isApprovable ? "#4F7FFF" : tierBorder(item.tier);
                return (
                  <div key={item.id} className="px-4 py-3" style={{ borderLeft: `3px solid ${borderColor}` }}>
                    <div className="flex items-start gap-2">
                      <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5" style={{
                        backgroundColor: `${borderColor}15`,
                        color: borderColor,
                      }}>
                        {item.tier}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] text-foreground leading-tight">{item.desc}</p>
                        <p className="text-[10px] text-muted-foreground mt-1">{item.source}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 justify-end">
                      {isApprovable ? (
                        <>
                          <span className="text-[10px] flex gap-0.5">{confidencePips(item.confidence!)}</span>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button className="px-2 py-1 rounded-lg text-[10px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                                Approve
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Approve this action?</AlertDialogTitle>
                                <AlertDialogDescription>{item.desc}</AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleApprove(item.id)} className="bg-primary text-primary-foreground">Confirm</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          <button onClick={() => g.navigateTo(item.sourceId, item.target)} className="px-2 py-1 rounded-lg text-[10px] font-medium border border-border text-muted-foreground">
                            Review
                          </button>
                        </>
                      ) : (
                        <button onClick={() => g.navigateTo(item.sourceId, item.target)} className="text-[11px] font-medium" style={{ color: "#4F7FFF" }}>
                          Act →
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Watching column */}
          <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-subtle">
              <h3 className="text-sm font-medium text-foreground">Watching ({potentialFlags.length})</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">Leading indicators to monitor</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-subtle/50">
              {potentialFlags.map(flag => (
                <div key={flag.id} className="px-4 py-3 flex items-start gap-3" style={{ borderLeft: "3px solid #4F7FFF" }}>
                  <span className="w-2 h-2 rounded-full bg-primary/60 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-foreground leading-tight">{flag.desc}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{flag.source}</p>
                  </div>
                  <button onClick={() => g.navigateTo(flag.sourceId)} className="text-[10px] flex-shrink-0 text-muted-foreground hover:text-foreground">
                    View →
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* System Health column */}
          <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden flex flex-col">
            <div className="px-4 py-3 border-b border-subtle">
              <h3 className="text-sm font-medium text-foreground">System Health</h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">{clearCount}/{systemRows.length} modules clear</p>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-subtle/50">
              {systemRows.map((row, i) => (
                <div key={`${row.name}-${i}`} className="flex items-center justify-between px-4 py-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.dot }} />
                    <span className="text-xs text-foreground">{row.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-muted-foreground">{row.status}</span>
                    <button onClick={() => g.navigateTo(row.id)} className="flex-shrink-0 text-muted-foreground hover:text-foreground">
                      <ArrowRight size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CentralCockpitView;
