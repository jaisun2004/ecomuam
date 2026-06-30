import { useMemo, useState } from "react";
import { Download, Eye, PauseCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { seedViolations, seedPlans } from "./governance/mockData";
import { Severity, Violation, ViolationStatus } from "./governance/types";
import DiffDrawer, { DiffRow } from "./governance/DiffDrawer";
import { exportToCsv } from "./governance/exportCsv";
import { useToast } from "@/hooks/use-toast";

const severityClass: Record<Severity, string> = {
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
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

const GovernanceAuditView = () => {
  const [violations, setViolations] = useState<Violation[]>(seedViolations);
  const [platform, setPlatform] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [status, setStatus] = useState("all");
  const [diffOpen, setDiffOpen] = useState<Violation | null>(null);
  const [actioning, setActioning] = useState<{ v: Violation; type: "fix" | "waive" } | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const filtered = useMemo(() => violations.filter(v =>
    (platform === "all" || v.platform === platform) &&
    (severity === "all" || v.severity === severity) &&
    (status === "all" || v.status === status)
  ), [violations, platform, severity, status]);

  const updateStatus = (id: string, s: ViolationStatus, n?: string) => {
    setViolations(vs => vs.map(v => v.id === id ? { ...v, status: s, note: n ?? v.note } : v));
  };

  const openDiff = (v: Violation) => setDiffOpen(v);

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
      { key: "campaign", label: "Campaign" },
      { key: "platform", label: "Platform" },
      { key: "rule", label: "Rule" },
      { key: "field", label: "Field" },
      { key: "approved", label: "Approved" },
      { key: "live", label: "Live" },
      { key: "severity", label: "Severity" },
      { key: "status", label: "Status" },
      { key: "detectedAt", label: "Detected At" },
    ]);
    toast({ title: "Export ready", description: `${filtered.length} rows downloaded.` });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Campaign Audit</h1>
          <p className="text-sm text-muted-foreground mt-1">Live campaign configurations validated against approved media plans.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export audit report</Button>
      </div>

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
        <div className="text-xs text-muted-foreground font-mono ml-auto">{filtered.length} of {violations.length} violations</div>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Campaign", "Platform", "Rule", "Field", "Approved", "Live", "Severity", "Status", "Detected", "Actions"].map(h => (
                <th key={h} className="text-left px-3 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-muted/40">
                <td className="px-3 py-2.5 font-mono text-xs">{v.campaign}</td>
                <td className="px-3 py-2.5 text-xs">{v.platform}</td>
                <td className="px-3 py-2.5 text-xs">{v.rule}</td>
                <td className="px-3 py-2.5 text-xs">{v.field}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground max-w-[200px] truncate" title={v.approved}>{v.approved}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-destructive max-w-[200px] truncate" title={v.live}>{v.live}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded", severityClass[v.severity])}>{v.severity}</span>
                </td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded", statusClass[v.status])}>{statusLabel[v.status]}</span>
                </td>
                <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground whitespace-nowrap">{v.detectedAt}</td>
                <td className="px-3 py-2.5">
                  <div className="flex gap-1">
                    <button onClick={() => openDiff(v)} className="p-1.5 hover:bg-muted rounded" title="View diff"><Eye className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { updateStatus(v.id, "pause_requested"); toast({ title: "Pause requested", description: v.campaign }); }} className="p-1.5 hover:bg-muted rounded text-warning" title="Pause"><PauseCircle className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { setActioning({ v, type: "fix" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-info" title="Request fix"><AlertCircle className="h-3.5 w-3.5" /></button>
                    <button onClick={() => { setActioning({ v, type: "waive" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Waive"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
            <DialogTitle>{actioning?.type === "fix" ? "Request fix" : "Waive violation"}</DialogTitle>
          </DialogHeader>
          {actioning && (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">{actioning.v.campaign}</div>
                <div className="text-xs text-muted-foreground">{actioning.v.rule} — {actioning.v.field}</div>
              </div>
              <div>
                <Label>{actioning.type === "fix" ? "Assignee / note" : "Reason for waiver"}</Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder={actioning.type === "fix" ? "e.g. @ravi - update tracking macro by EOD" : "e.g. Brand team approved temporary landing page for 7 days"} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActioning(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!actioning) return;
              const s: ViolationStatus = actioning.type === "fix" ? "fix_requested" : "waived";
              updateStatus(actioning.v.id, s, note);
              toast({ title: actioning.type === "fix" ? "Fix requested" : "Violation waived", description: actioning.v.campaign });
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
