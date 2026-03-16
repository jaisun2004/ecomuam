import React, { useState, useEffect } from "react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { Gauge, ArrowRight, CheckCircle2, Shield, Zap, AlertTriangle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const urgentIssues = [
  { id: 1, tier: "T1" as const, desc: "Availability below 20% — 4 campaigns paused", source: "Availability", sourceId: "availability", target: "avail-dedup-banner" },
  { id: 2, tier: "T1" as const, desc: "Budget exhausted — Brand Search campaign", source: "Campaign Manager", sourceId: "campaigns", target: "campaign-conflict-banner" },
  { id: 3, tier: "T2" as const, desc: "Competitor bidding on 12 brand keywords", source: "Competitor Hub", sourceId: "competitors", target: "defense-insight" },
  { id: 4, tier: "T3" as const, desc: "Budget reallocation opportunity — shift ₹50K", source: "Budget Optimiser", sourceId: "budget" },
  { id: 5, tier: "T3" as const, desc: "Daypart budget shift projected +18% conversion", source: "Campaign Manager", sourceId: "campaigns", target: "campaign-digest" },
];

const approvalItems = [
  { id: 1, icon: "🔍", campaign: "BCAA Brand Awareness", desc: "Raise bid +20% on 6 keywords", confidence: 3 },
  { id: 2, icon: "📈", campaign: "Pre-Workout New Users", desc: "Expand keyword targeting — 8 new terms", confidence: 2 },
  { id: 3, icon: "💰", campaign: "Brand Search", desc: "Budget shift ₹15K to evening slots", confidence: 2 },
];

const systemRows = [
  { name: "Campaign Manager", id: "campaigns", status: "Active issue", dot: "#FF5C5C" },
  { name: "Availability", id: "availability", status: "Active issue", dot: "#FF5C5C" },
  { name: "Pricing", id: "pricing", status: "Clear", dot: "#2ECF8E" },
  { name: "Competitor Ads Hub", id: "competitors", status: "Warning", dot: "#F5A623" },
  { name: "Budget Optimiser", id: "budget", status: "Clear", dot: "#2ECF8E" },
  { name: "Festival Campaigns", id: "festival", status: "Clear", dot: "#2ECF8E" },
  { name: "Rule Engine", id: "guardrails", status: "Clear", dot: "#2ECF8E", extra: "Last run: 4 min ago" },
  { name: "Guardrails", id: "guardrails", status: "Warning", dot: "#F5A623", extra: "2 active locks" },
];

const tierStyle = (tier: string) => {
  if (tier === "T1") return { bg: "rgba(255,92,92,0.12)", color: "#FF5C5C" };
  if (tier === "T2") return { bg: "rgba(245,166,35,0.12)", color: "#F5A623" };
  return { bg: "rgba(46,207,142,0.12)", color: "#2ECF8E" };
};

const CentralCockpitView: React.FC = () => {
  const g = useGuardrails();
  const { toast } = useToast();
  const [now, setNow] = useState(new Date());
  const [approvedIds, setApprovedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const hasIssues = urgentIssues.length > 0;
  const visibleApprovals = approvalItems.filter(a => !approvedIds.has(a.id));

  const handleApprove = (id: number) => {
    setApprovedIds(prev => new Set(prev).add(id));
    const item = approvalItems.find(a => a.id === id);
    toast({
      title: "Action approved",
      description: `${item?.campaign} — ${item?.desc}`,
      action: <button onClick={() => setApprovedIds(prev => { const s = new Set(prev); s.delete(id); return s; })} className="text-xs font-medium" style={{ color: "#A78BFA" }}>Undo</button>,
      duration: 5000,
    });
  };

  const confidencePips = (level: number) => {
    const c = level >= 4 ? "#2ECF8E" : level === 3 ? "#F5A623" : "#555A6E";
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < level ? c : "#333" }}>●</span>
    ));
  };

  const dateStr = now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-5 pb-20 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
          <Gauge size={20} className="text-primary" /> Central Cockpit
        </h1>
        <div className="text-right">
          <p className="text-xs text-foreground font-mono">{dateStr} · {timeStr}</p>
          <p className="text-[10px] text-muted-foreground">Updated 4 min ago</p>
        </div>
      </div>

      {/* Card 1 — Urgent */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-subtle">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{
              backgroundColor: hasIssues ? "#FF5C5C" : "#2ECF8E",
              ...(hasIssues ? { animation: "pulse 2s infinite" } : {})
            }} />
            Urgent
          </h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{
            backgroundColor: hasIssues ? "rgba(255,92,92,0.12)" : "rgba(46,207,142,0.12)",
            color: hasIssues ? "#FF5C5C" : "#2ECF8E"
          }}>
            {urgentIssues.length}
          </span>
        </div>
        {urgentIssues.length === 0 ? (
          <div className="p-8 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-sw-green" />
              <span className="text-xs">All clear — no active issues</span>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">Last checked: just now</p>
          </div>
        ) : (
          <div className="divide-y divide-subtle/50">
            {urgentIssues.slice(0, 5).map(issue => {
              const ts = tierStyle(issue.tier);
              return (
                <div key={issue.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: ts.bg, color: ts.color }}>
                    {issue.tier}
                  </span>
                  <span className="text-[12px] text-foreground flex-1">{issue.desc}</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded flex-shrink-0" style={{ backgroundColor: "rgba(79,127,255,0.1)", color: "#8B8FA8" }}>
                    {issue.source}
                  </span>
                  <button onClick={() => g.navigateTo(issue.sourceId, issue.target)} className="text-[11px] font-medium flex items-center gap-1 flex-shrink-0" style={{ color: "#4F7FFF" }}>
                    → View
                  </button>
                </div>
              );
            })}
            {urgentIssues.length > 5 && (
              <div className="px-4 py-2">
                <button className="text-[11px] font-medium" style={{ color: "#4F7FFF" }}>View all {urgentIssues.length} issues →</button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Card 2 — Pending approval */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-subtle">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            Pending approval
          </h3>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{
            backgroundColor: "rgba(167,139,250,0.15)", color: "#A78BFA"
          }}>
            {visibleApprovals.length}
          </span>
        </div>
        {visibleApprovals.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle2 size={20} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-xs text-muted-foreground">Nothing pending — all insights are auto-approved or awaiting triggers</p>
          </div>
        ) : (
          <div className="divide-y divide-subtle/50">
            {visibleApprovals.slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <span className="text-sm flex-shrink-0">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-foreground">{item.campaign}</span>
                  <span className="text-[11px] text-muted-foreground ml-1">— {item.desc}</span>
                </div>
                <span className="text-[10px] flex gap-0.5 flex-shrink-0">{confidencePips(item.confidence)}</span>
                <button onClick={() => handleApprove(item.id)} className="px-2.5 py-1 rounded-lg text-[10px] font-medium text-white flex-shrink-0" style={{ backgroundColor: "#A78BFA" }}>
                  Approve
                </button>
                <button onClick={() => g.navigateTo("campaigns")} className="px-2 py-1 rounded-lg text-[10px] font-medium border flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8FA8" }}>
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card 3 — System health */}
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="p-4 border-b border-subtle">
          <h3 className="text-sm font-medium text-foreground">System health</h3>
        </div>
        <div className="divide-y divide-subtle/50">
          {systemRows.map((row, i) => (
            <div key={`${row.name}-${i}`} className="flex items-center justify-between px-4 py-2.5">
              <span className="text-xs text-foreground">{row.name}</span>
              <div className="flex items-center gap-3">
                {row.extra && <span className="text-[9px] font-mono text-muted-foreground">{row.extra}</span>}
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: row.dot }} />
                <span className="text-[10px] font-mono text-muted-foreground w-20">{row.status}</span>
                <button onClick={() => g.navigateTo(row.id)} className="text-muted-foreground hover:text-foreground flex-shrink-0">
                  <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CentralCockpitView;
