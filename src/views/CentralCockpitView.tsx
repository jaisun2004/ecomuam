import React, { useState } from "react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { Gauge, RefreshCw, ArrowRight, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// ─── Mock data ───
const urgentIssues = [
  { id: 1, tier: "T1" as const, desc: "Availability below 20% — 4 campaigns paused", source: "Availability", sourceId: "availability", target: "avail-dedup-banner" },
  { id: 2, tier: "T1" as const, desc: "Budget exhausted — Brand Search campaign", source: "Campaign Mgr", sourceId: "campaigns", target: "campaign-conflict-banner" },
  { id: 3, tier: "T2" as const, desc: "Competitor bidding on 12 brand keywords", source: "Competitor Hub", sourceId: "competitors", target: "defense-insight" },
  { id: 4, tier: "T3" as const, desc: "Budget reallocation opportunity — shift ₹50K", source: "Budget Opt.", sourceId: "budget", confidence: 4 },
  { id: 5, tier: "T3" as const, desc: "Daypart budget shift projected +18% conversion", source: "Campaign Mgr", sourceId: "campaigns", target: "campaign-digest", confidence: 4 },
  { id: 6, tier: "T3" as const, desc: "New keyword opportunities detected — 8 terms", source: "Discovery", sourceId: "discovery", confidence: 3 },
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
  const [healthOpen, setHealthOpen] = useState(false);

  // Determine state
  const hasIssues = urgentIssues.length > 0;
  const hasPendingApprovals = urgentIssues.some(i => i.confidence && i.confidence >= 3 && !approvedIds.has(i.id));
  const hasUrgentOrPending = hasIssues || hasPendingApprovals;

  // Build unified list: T1 → T2 → pending approvals (blue) → T3
  const visibleItems = urgentIssues
    .filter(i => !approvedIds.has(i.id))
    .sort((a, b) => {
      const tierOrder = { T1: 0, T2: 1, T3: 3 };
      const aOrder = a.confidence && a.confidence >= 3 ? 2 : tierOrder[a.tier];
      const bOrder = b.confidence && b.confidence >= 3 ? 2 : tierOrder[b.tier];
      return aOrder - bOrder;
    })
    .slice(0, 8);

  // Batch approve: ≥2 approvable T3 high-confidence items
  const approvableItems = urgentIssues.filter(i => i.tier === "T3" && i.confidence && i.confidence >= 4 && !approvedIds.has(i.id));
  const showBatchApprove = approvableItems.length >= 2;

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
    const c = level >= 4 ? "#2ECF8E" : level === 3 ? "#F5A623" : "#555A6E";
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < level ? c : "#333" }}>●</span>
    ));
  };

  const clearCount = systemRows.filter(r => r.dot === "#2ECF8E").length;

  return (
    <div className="space-y-5 pb-20 max-w-3xl">
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

      {!hasUrgentOrPending ? (
        /* ─── ALL CLEAR STATE ─── */
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-3 h-3 rounded-full mb-4" style={{ backgroundColor: "#2ECF8E" }} />
          <p className="text-base font-medium" style={{ color: "#E8EAF0" }}>All clear</p>
          <p className="text-[13px] mt-1" style={{ color: "#555A6E" }}>No issues · No pending approvals</p>
          <p className="text-[11px] mt-1" style={{ color: "#555A6E" }}>Last checked {new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</p>
        </div>
      ) : (
        /* ─── ISSUES PRESENT STATE ─── */
        <div className="space-y-0">
          {/* Batch approve bar */}
          {showBatchApprove && (
            <div className="mb-3">
              <button onClick={handleBatchApprove} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                Approve all safe ({approvableItems.length} actions)
              </button>
            </div>
          )}

          {/* Unified ranked list */}
          <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden divide-y divide-subtle/50">
            {visibleItems.map(item => {
              const isApprovable = item.confidence && item.confidence >= 3;
              const borderColor = isApprovable ? "#4F7FFF" : tierBorder(item.tier);
              return (
                <div key={item.id} className="flex items-center gap-3 px-4" style={{ height: 48, borderLeft: `3px solid ${borderColor}` }}>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded flex-shrink-0" style={{
                    backgroundColor: `${borderColor}15`,
                    color: borderColor,
                  }}>
                    {item.tier}
                  </span>
                  <span className="text-[13px] flex-1 truncate" style={{ color: "#E8EAF0" }}>{item.desc}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded flex-shrink-0" style={{ color: "#555A6E" }}>
                    {item.source}
                  </span>
                  {isApprovable ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-[10px] flex gap-0.5">{confidencePips(item.confidence!)}</span>
                      <button onClick={() => handleApprove(item.id)} className="px-2 py-1 rounded-lg text-[10px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
                        Approve
                      </button>
                      <button onClick={() => g.navigateTo(item.sourceId, item.target)} className="px-2 py-1 rounded-lg text-[10px] font-medium border" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8FA8" }}>
                        Review
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => g.navigateTo(item.sourceId, item.target)} className="text-[11px] font-medium flex-shrink-0" style={{ color: "#4F7FFF" }}>
                      Act →
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {urgentIssues.length > 8 && (
            <p className="text-[11px] font-medium mt-2" style={{ color: "#4F7FFF" }}>{urgentIssues.length - 8} more items →</p>
          )}
        </div>
      )}

      {/* ─── POTENTIAL FLAGS (WATCHING) ─── */}
      {potentialFlags.length > 0 && (
        <div className="mt-6">
          <p className="font-mono text-[10px] uppercase tracking-wider mb-1" style={{ color: "#555A6E" }}>Watching</p>
          <p className="text-[12px] mb-3" style={{ color: "#555A6E" }}>Not urgent — leading indicators to monitor</p>
          <div className="space-y-0 rounded-xl border border-subtle bg-surface-1 overflow-hidden divide-y divide-subtle/50">
            {potentialFlags.slice(0, 5).map(flag => (
              <div key={flag.id} className="flex items-center gap-3 px-4" style={{ height: 44, borderLeft: "3px solid #4F7FFF" }}>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(79,127,255,0.1)", color: "#4F7FFF" }}>
                  Watch
                </span>
                <span className="text-[13px] flex-1 truncate" style={{ color: "#8B8FA8" }}>{flag.desc}</span>
                <span className="text-[10px] font-mono flex-shrink-0" style={{ color: "#555A6E" }}>{flag.source}</span>
                <button onClick={() => g.navigateTo(flag.sourceId)} className="text-[11px] flex-shrink-0" style={{ color: "#555A6E" }}>
                  → View
                </button>
              </div>
            ))}
          </div>
          {potentialFlags.length > 5 && (
            <p className="text-[11px] font-medium mt-2" style={{ color: "#4F7FFF" }}>View all signals →</p>
          )}
        </div>
      )}

      {/* ─── SYSTEM HEALTH (COLLAPSED) ─── */}
      <div className="mt-4">
        <button onClick={() => setHealthOpen(!healthOpen)} className="flex items-center gap-1.5 text-[12px]" style={{ color: "#555A6E" }}>
          {clearCount}/{systemRows.length} screens clear
          {healthOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
        {healthOpen && (
          <div className="mt-2 rounded-xl border border-subtle bg-surface-1 overflow-hidden divide-y divide-subtle/50">
            {systemRows.map((row, i) => (
              <div key={`${row.name}-${i}`} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-xs" style={{ color: "#E8EAF0" }}>{row.name}</span>
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.dot }} />
                  <span className="text-[10px] font-mono w-16" style={{ color: "#555A6E" }}>{row.status}</span>
                  <button onClick={() => g.navigateTo(row.id)} className="flex-shrink-0" style={{ color: "#555A6E" }}>
                    <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CentralCockpitView;
