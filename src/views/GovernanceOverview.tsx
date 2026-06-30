import { ShieldCheck, FileSpreadsheet, AlertTriangle, TrendingUp } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { seedRules, seedPlans, seedViolations, seedCreatives } from "./governance/mockData";
import { cn } from "@/lib/utils";

const trend = [
  { d: "Mon", score: 88 }, { d: "Tue", score: 90 }, { d: "Wed", score: 86 },
  { d: "Thu", score: 91 }, { d: "Fri", score: 89 }, { d: "Sat", score: 93 }, { d: "Sun", score: 92 },
];

const severityColor: Record<string, string> = {
  critical: "text-destructive bg-destructive/10",
  warning: "text-warning bg-warning/10",
  info: "text-info bg-info/10",
};

const GovernanceOverview = () => {
  const openViolations = seedViolations.filter(v => v.status === "open");
  const critical = openViolations.filter(v => v.severity === "critical").length;
  const warning = openViolations.filter(v => v.severity === "warning").length;
  const info = openViolations.filter(v => v.severity === "info").length;
  const compliance = Math.round(((seedPlans.length * 5 - openViolations.length) / (seedPlans.length * 5)) * 100);

  const creativeIssues = seedCreatives.filter(c => c.status !== "ok").slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-semibold">Governance Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Campaign setup compliance, creative deployment audits, and rule-based violations.
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><ShieldCheck className="h-4 w-4" /> Active rules</div>
          <div className="font-mono text-3xl font-semibold mt-2">{seedRules.filter(r => r.enabled).length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">of {seedRules.length} configured</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><FileSpreadsheet className="h-4 w-4" /> Approved plans</div>
          <div className="font-mono text-3xl font-semibold mt-2">{seedPlans.length}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{seedPlans.filter(p => p.status === "approved").length} live this period</div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><AlertTriangle className="h-4 w-4" /> Open violations</div>
          <div className="font-mono text-3xl font-semibold mt-2">{openViolations.length}</div>
          <div className="flex gap-2 text-[11px] mt-1.5">
            <span className="px-1.5 py-0.5 rounded bg-destructive/10 text-destructive font-medium">{critical} critical</span>
            <span className="px-1.5 py-0.5 rounded bg-warning/10 text-warning font-medium">{warning} warn</span>
            <span className="px-1.5 py-0.5 rounded bg-info/10 text-info font-medium">{info} info</span>
          </div>
        </div>
        <div className="rounded-xl border bg-card p-5 shadow-card">
          <div className="flex items-center gap-2 text-muted-foreground text-xs"><TrendingUp className="h-4 w-4" /> Compliance score (7d)</div>
          <div className="flex items-end gap-3 mt-2">
            <div className="font-mono text-3xl font-semibold">{compliance}%</div>
            <div className="flex-1 h-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trend}>
                  <XAxis dataKey="d" hide />
                  <Tooltip cursor={false} contentStyle={{ fontSize: 11 }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card shadow-card">
          <div className="px-5 py-3.5 border-b font-heading font-semibold">Recent violations</div>
          <div className="divide-y">
            {openViolations.slice(0, 5).map(v => (
              <div key={v.id} className="px-5 py-3 flex items-center gap-3">
                <span className={cn("text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded", severityColor[v.severity])}>
                  {v.severity}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{v.campaign}</div>
                  <div className="text-xs text-muted-foreground truncate">{v.rule} — {v.field}</div>
                </div>
                <span className="text-[11px] font-mono text-muted-foreground">{v.platform}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card shadow-card">
          <div className="px-5 py-3.5 border-b font-heading font-semibold">Creative discrepancies</div>
          <div className="divide-y">
            {creativeIssues.map(c => (
              <div key={c.id} className="px-5 py-3 flex items-center gap-3">
                <span className={cn(
                  "text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded",
                  c.status === "missing" ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning"
                )}>{c.status}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{c.productName} <span className="font-mono text-muted-foreground">· {c.sku}</span></div>
                  <div className="text-xs text-muted-foreground truncate">{c.publisher} — {c.mismatchTypes.join(", ")}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovernanceOverview;
