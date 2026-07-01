import { useMemo, useState } from "react";
import { Download, Eye, PauseCircle, CheckCircle2, AlertCircle, ChevronDown, ChevronRight, TrendingUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { seedViolations, seedPlans, seedCompetitorBanners } from "./governance/mockData";
import { Severity, Violation, ViolationStatus, ViolationImpact, CompetitorBanner } from "./governance/types";
import DiffDrawer, { DiffRow } from "./governance/DiffDrawer";
import { exportToCsv } from "./governance/exportCsv";
import { useToast } from "@/hooks/use-toast";

const severityClass: Record<Severity, string> = {
  critical: "bg-destructive/10 text-destructive border-destructive/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  info: "bg-info/10 text-info border-info/30",
};

const severityBorder: Record<Severity, string> = {
  critical: "border-l-destructive",
  warning: "border-l-warning",
  info: "border-l-info",
};

const impactClass: Record<ViolationImpact, string> = {
  spend_at_risk: "bg-destructive/10 text-destructive",
  brand_risk: "bg-warning/10 text-warning",
  policy: "bg-info/10 text-info",
};

const impactLabel: Record<ViolationImpact, string> = {
  spend_at_risk: "Spend at risk",
  brand_risk: "Brand risk",
  policy: "Policy",
};

const statusLabel: Record<ViolationStatus, string> = {
  open: "Open", pause_requested: "Pause requested", fix_requested: "Fix requested",
  waived: "Waived", resolved: "Resolved",
};

const statusClass: Record<ViolationStatus, string> = {
  open: "bg-destructive/10 text-destructive",
  pause_requested: "bg-warning/10 text-warning",
  fix_requested: "bg-info/10 text-info",
  waived: "bg-muted text-muted-foreground",
  resolved: "bg-success/10 text-success",
};

// deterministic pseudo-random from string
const seedFrom = (s: string) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  return Math.abs(h);
};

const activePerf = (campaign: string, budget: number) => {
  const s = seedFrom(campaign);
  const spendMTD = Math.round(budget * (18 + (s % 12)));
  const roas = +(2 + ((s % 30) / 10)).toFixed(2);
  const ctr = +(0.6 + ((s % 25) / 10)).toFixed(2);
  const pacing = 60 + (s % 80); // 60-140
  const spark = Array.from({ length: 7 }, (_, i) => ({
    d: i,
    v: Math.max(1, Math.round(budget * (0.6 + (((s >> (i * 2)) & 0xf) / 15)))),
  }));
  return { spendMTD, roas, ctr, pacing, spark };
};

const verdictClass = (v: CompetitorBanner["positionalVerdict"]) =>
  v === "beating"
    ? "bg-success/10 text-success"
    : v === "behind"
    ? "bg-destructive/10 text-destructive"
    : "bg-muted text-muted-foreground";

const GovernanceAuditView = () => {
  const [violations, setViolations] = useState<Violation[]>(seedViolations);
  const [platform, setPlatform] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [diffOpen, setDiffOpen] = useState<Violation | null>(null);
  const [actioning, setActioning] = useState<{ v: Violation; type: "fix" | "waive" } | null>(null);
  const [note, setNote] = useState("");
  const [compPlatform, setCompPlatform] = useState("all");
  const [compSurface, setCompSurface] = useState("all");
  const [compOpen, setCompOpen] = useState(true);
  const { toast } = useToast();

  const filtered = useMemo(() => violations.filter(v =>
    (platform === "all" || v.platform === platform) &&
    (severity === "all" || v.severity === severity) &&
    (status === "all" || v.status === status)
  ), [violations, platform, severity, status]);

  const counts = useMemo(() => {
    const open = violations.filter(v => v.status === "open");
    return {
      critical: open.filter(v => v.severity === "critical").length,
      warning: open.filter(v => v.severity === "warning").length,
      info: open.filter(v => v.severity === "info").length,
    };
  }, [violations]);

  const categoryDist = useMemo(() => {
    const map: Record<string, number> = {};
    violations.filter(v => v.status === "open").forEach(v => {
      map[v.field] = (map[v.field] || 0) + 1;
    });
    const max = Math.max(1, ...Object.values(map));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ k, n, pct: n / max }));
  }, [violations]);

  const updateStatus = (id: string, s: ViolationStatus, n?: string) => {
    setViolations(vs => vs.map(v => v.id === id ? { ...v, status: s, note: n ?? v.note } : v));
  };

  const diffRows = (v: Violation): DiffRow[] => {
    const plan = seedPlans.find(p => p.campaign === v.campaign);
    const rows: DiffRow[] = [{ field: v.field, approved: v.approved, live: v.live }];
    if (plan) {
      rows.push(
        { field: "Objective", approved: plan.objective, live: plan.objective },
        { field: "Audience", approved: plan.audience, live: plan.audience },
        { field: "Geo", approved: plan.geo.join(", "), live: v.field === "Geo" ? v.live : plan.geo.join(", ") },
        { field: "Frequency cap", approved: plan.frequencyCap, live: v.field === "Frequency cap" ? v.live : plan.frequencyCap },
        { field: "Placements", approved: plan.placements.join(", "), live: v.field === "Placements" ? v.live : plan.placements.join(", ") },
        { field: "Tracking params", approved: plan.trackingParams, live: v.field === "Tracking params" ? v.live : plan.trackingParams },
      );
    }
    return rows;
  };

  const exportCsv = () => {
    exportToCsv("governance-audit.csv", filtered, [
      { key: "campaign", label: "Campaign" }, { key: "platform", label: "Platform" },
      { key: "rule", label: "Rule" }, { key: "field", label: "Field" },
      { key: "approved", label: "Approved" }, { key: "live", label: "Live" },
      { key: "severity", label: "Severity" }, { key: "impact", label: "Impact" },
      { key: "status", label: "Status" }, { key: "detectedAt", label: "Detected At" },
    ]);
    toast({ title: "Export ready", description: `${filtered.length} rows downloaded.` });
  };

  const breachByCampaign = useMemo(() => {
    const m: Record<string, { critical: number; total: number }> = {};
    violations.filter(v => v.status === "open").forEach(v => {
      m[v.campaign] ||= { critical: 0, total: 0 };
      m[v.campaign].total++;
      if (v.severity === "critical") m[v.campaign].critical++;
    });
    return m;
  }, [violations]);

  const competitors = useMemo(() => seedCompetitorBanners.filter(c =>
    (compPlatform === "all" || c.platform === compPlatform) &&
    (compSurface === "all" || c.surface === compSurface)
  ), [compPlatform, compSurface]);

  const compSummary = useMemo(() => ({
    beating: competitors.filter(c => c.positionalVerdict === "beating").length,
    behind: competitors.filter(c => c.positionalVerdict === "behind").length,
    absent: competitors.filter(c => c.positionalVerdict === "absent").length,
  }), [competitors]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Campaign Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Breaches, live campaign performance, and competitor banner watch.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export audit report</Button>
      </div>

      {/* Breach Summary */}
      <div className="grid grid-cols-4 gap-4">
        {(["critical", "warning", "info"] as Severity[]).map(s => (
          <button
            key={s}
            onClick={() => setSeverity(severity === s ? "all" : s)}
            className={cn(
              "rounded-xl border-2 bg-card p-4 shadow-card text-left transition",
              severityClass[s],
              severity === s ? "ring-2 ring-offset-1 ring-foreground/20" : "opacity-90 hover:opacity-100"
            )}
          >
            <div className="text-[11px] font-mono uppercase tracking-wider">{s}</div>
            <div className="font-mono text-3xl font-semibold mt-1">{counts[s]}</div>
            <div className="text-[11px] text-muted-foreground mt-1">open breaches</div>
          </button>
        ))}
        <div className="rounded-xl border bg-card p-4 shadow-card">
          <div className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground mb-2">Breach categories</div>
          <div className="space-y-1.5">
            {categoryDist.slice(0, 4).map(c => (
              <div key={c.k} className="flex items-center gap-2 text-[11px]">
                <div className="w-24 truncate">{c.k}</div>
                <div className="flex-1 h-1.5 bg-muted rounded"><div className="h-full rounded bg-primary" style={{ width: `${c.pct * 100}%` }} /></div>
                <div className="font-mono w-4 text-right">{c.n}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 shadow-card flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[160px]">
          <Label className="text-xs">Platform</Label>
          <Select value={platform} onValueChange={setPlatform}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {["Amazon", "Flipkart", "BlinkIt", "Zepto", "Instamart"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <Label className="text-xs">Severity</Label>
          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All severities</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="info">Info</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex-1 min-w-[160px]">
          <Label className="text-xs">Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="pause_requested">Pause requested</SelectItem>
              <SelectItem value="fix_requested">Fix requested</SelectItem>
              <SelectItem value="waived">Waived</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-muted-foreground font-mono ml-auto">{filtered.length} of {violations.length} breaches</div>
      </div>

      {/* Breaches table */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="px-5 py-3 border-b font-heading font-semibold text-sm">Breaches</div>
        <div className="divide-y">
          {filtered.map(v => (
            <div key={v.id} className={cn("grid grid-cols-12 gap-3 px-5 py-3 items-center border-l-4", severityBorder[v.severity])}>
              <div className="col-span-3">
                <div className="font-mono text-xs truncate" title={v.campaign}>{v.campaign}</div>
                <div className="text-[11px] text-muted-foreground">{v.platform}</div>
              </div>
              <div className="col-span-3">
                <div className="text-xs font-medium">{v.rule}</div>
                <div className="text-[11px] text-muted-foreground">{v.field}</div>
              </div>
              <div className="col-span-3 text-[11px] font-mono">
                <div className="text-muted-foreground truncate" title={v.approved}>✓ {v.approved}</div>
                <div className="text-destructive truncate" title={v.live}>✗ {v.live}</div>
              </div>
              <div className="col-span-1 flex flex-col gap-1">
                <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded text-center", severityClass[v.severity])}>{v.severity}</span>
                {v.impact && <span className={cn("text-[10px] font-mono px-1.5 py-0.5 rounded text-center", impactClass[v.impact])}>{impactLabel[v.impact]}</span>}
              </div>
              <div className="col-span-1">
                <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded", statusClass[v.status])}>{statusLabel[v.status]}</span>
              </div>
              <div className="col-span-1 flex gap-1 justify-end">
                <button onClick={() => setDiffOpen(v)} className="p-1.5 hover:bg-muted rounded" title="View diff"><Eye className="h-3.5 w-3.5" /></button>
                <button onClick={() => { updateStatus(v.id, "pause_requested"); toast({ title: "Pause requested", description: v.campaign }); }} className="p-1.5 hover:bg-muted rounded text-warning" title="Pause"><PauseCircle className="h-3.5 w-3.5" /></button>
                <button onClick={() => { setActioning({ v, type: "fix" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-info" title="Request fix"><AlertCircle className="h-3.5 w-3.5" /></button>
                <button onClick={() => { setActioning({ v, type: "waive" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Waive"><CheckCircle2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Campaign Performance */}
      <div className="rounded-xl border bg-card shadow-card">
        <div className="px-5 py-3 border-b flex items-center justify-between">
          <div className="font-heading font-semibold text-sm flex items-center gap-2"><TrendingUp className="h-4 w-4" /> Active Campaign Performance</div>
          <div className="text-[11px] text-muted-foreground">{seedPlans.length} live</div>
        </div>
        <div className="divide-y">
          {seedPlans.map(p => {
            const perf = activePerf(p.campaign, p.dailyBudget);
            const breach = breachByCampaign[p.campaign] || { critical: 0, total: 0 };
            const off = perf.pacing < 80 || perf.pacing > 120 || breach.critical > 0;
            return (
              <div key={p.id} className="grid grid-cols-12 gap-3 px-5 py-3 items-center">
                <div className="col-span-3">
                  <div className="font-mono text-xs truncate" title={p.campaign}>{p.campaign}</div>
                  <div className="text-[11px] text-muted-foreground">{p.platform} · {p.objective}</div>
                </div>
                <div className="col-span-1 text-xs">
                  <div className="text-muted-foreground text-[10px]">Spend MTD</div>
                  <div className="font-mono">₹{(perf.spendMTD / 1000).toFixed(1)}k</div>
                </div>
                <div className="col-span-1 text-xs">
                  <div className="text-muted-foreground text-[10px]">ROAS</div>
                  <div className="font-mono">{perf.roas}x</div>
                </div>
                <div className="col-span-1 text-xs">
                  <div className="text-muted-foreground text-[10px]">CTR</div>
                  <div className="font-mono">{perf.ctr}%</div>
                </div>
                <div className="col-span-2 text-xs">
                  <div className="text-muted-foreground text-[10px]">Pacing vs plan</div>
                  <div className={cn("font-mono font-semibold", off ? "text-destructive" : "text-success")}>{perf.pacing}%</div>
                </div>
                <div className="col-span-2 h-8">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={perf.spark}>
                      <Line type="monotone" dataKey="v" stroke={off ? "hsl(var(--destructive))" : "hsl(var(--primary))"} strokeWidth={1.5} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="col-span-2 flex gap-1 justify-end">
                  {breach.total > 0 ? (
                    <button
                      onClick={() => { setPlatform(p.platform); }}
                      className={cn("text-[10px] font-mono uppercase px-2 py-1 rounded", breach.critical > 0 ? "bg-destructive/10 text-destructive" : "bg-warning/10 text-warning")}
                    >
                      {breach.total} breach{breach.total > 1 ? "es" : ""}
                    </button>
                  ) : (
                    <span className="text-[10px] font-mono uppercase px-2 py-1 rounded bg-success/10 text-success">Clean</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Competition Analysis */}
      <div className="rounded-xl border bg-card shadow-card">
        <button onClick={() => setCompOpen(o => !o)} className="w-full px-5 py-3 border-b flex items-center justify-between hover:bg-muted/40">
          <div className="font-heading font-semibold text-sm flex items-center gap-2">
            {compOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            <Sparkles className="h-4 w-4" /> Competition Analysis · Banner Watch
          </div>
          <div className="text-[11px] text-muted-foreground">
            {compSummary.beating} beating · {compSummary.behind} behind · {compSummary.absent} absent
          </div>
        </button>
        {compOpen && (
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border p-3 bg-success/5">
                <div className="text-[10px] font-mono uppercase text-success">Surfaces leading</div>
                <div className="font-mono text-2xl font-semibold">{compSummary.beating}</div>
              </div>
              <div className="rounded-lg border p-3 bg-destructive/5">
                <div className="text-[10px] font-mono uppercase text-destructive">Surfaces trailing</div>
                <div className="font-mono text-2xl font-semibold">{compSummary.behind}</div>
              </div>
              <div className="rounded-lg border p-3 bg-muted/40">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">Surfaces absent</div>
                <div className="font-mono text-2xl font-semibold">{compSummary.absent}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 items-end">
              <div className="min-w-[160px]">
                <Label className="text-xs">Platform</Label>
                <Select value={compPlatform} onValueChange={setCompPlatform}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    {["Amazon", "Flipkart", "BlinkIt", "Zepto", "Instamart"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="min-w-[200px]">
                <Label className="text-xs">Surface</Label>
                <Select value={compSurface} onValueChange={setCompSurface}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All surfaces</SelectItem>
                    {Array.from(new Set(seedCompetitorBanners.map(b => b.surface))).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="rounded-lg border overflow-hidden">
              <div className="grid grid-cols-12 gap-3 bg-muted/60 px-4 py-2 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                <div className="col-span-3">Competitor · Creative</div>
                <div className="col-span-2">Platform · Surface</div>
                <div className="col-span-1">Slot</div>
                <div className="col-span-1">Days live</div>
                <div className="col-span-2">Comp SoV / Own SoV</div>
                <div className="col-span-2">Positional / Share</div>
                <div className="col-span-1 text-right">Action</div>
              </div>
              <div className="divide-y">
                {competitors.map(c => (
                  <div key={c.id} className="grid grid-cols-12 gap-3 px-4 py-3 items-center text-xs">
                    <div className="col-span-3 flex items-center gap-2 min-w-0">
                      <div className="h-8 w-12 rounded flex-shrink-0" style={{ background: c.thumbColor }} />
                      <div className="min-w-0">
                        <div className="font-medium truncate">{c.competitorBrand}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{c.competitor} · {c.headline}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div>{c.platform}</div>
                      <div className="text-[10px] text-muted-foreground">{c.surface}</div>
                    </div>
                    <div className="col-span-1 font-mono text-[11px]">{c.slot}</div>
                    <div className="col-span-1 font-mono">{c.daysLive}d</div>
                    <div className="col-span-2 font-mono">
                      <div>{c.shareOfVoice}% <span className="text-muted-foreground">comp</span></div>
                      <div className={cn(c.ownShareOfVoice && c.ownShareOfVoice >= c.shareOfVoice ? "text-success" : "text-destructive")}>
                        {c.ownShareOfVoice || 0}% <span className="text-muted-foreground">own</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex flex-col gap-1">
                      <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded w-fit", verdictClass(c.positionalVerdict))}>
                        Pos: {c.positionalVerdict}
                      </span>
                      <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded w-fit", verdictClass(c.shareVerdict))}>
                        Share: {c.shareVerdict}
                      </span>
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <Button size="sm" variant="outline" className="h-7 text-[10px]"
                        onClick={() => toast({ title: "Counter-banner planned", description: `${c.surface} · ${c.platform}` })}>
                        Counter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {diffOpen && (
        <DiffDrawer
          open={!!diffOpen}
          onOpenChange={(o) => !o && setDiffOpen(null)}
          title={diffOpen.campaign}
          subtitle={`${diffOpen.platform} · ${diffOpen.rule}`}
          rows={diffRows(diffOpen)}
        />
      )}

      <Dialog open={!!actioning} onOpenChange={(o) => !o && setActioning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actioning?.type === "fix" ? "Request fix" : "Waive breach"}</DialogTitle>
          </DialogHeader>
          {actioning && (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">{actioning.v.campaign}</div>
                <div className="text-xs text-muted-foreground">{actioning.v.rule} — {actioning.v.field}</div>
              </div>
              <div>
                <Label>{actioning.type === "fix" ? "Assignee / note" : "Reason for waiver"}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActioning(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!actioning) return;
              const s: ViolationStatus = actioning.type === "fix" ? "fix_requested" : "waived";
              updateStatus(actioning.v.id, s, note);
              toast({ title: actioning.type === "fix" ? "Fix requested" : "Breach waived", description: actioning.v.campaign });
              setActioning(null);
            }} disabled={!note.trim()}>
              {actioning?.type === "fix" ? "Send fix request" : "Confirm waiver"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernanceAuditView;
