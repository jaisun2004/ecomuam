import { useMemo, useState } from "react";
import { Download, Eye, AlertCircle, CheckCircle2, ChevronDown, ChevronRight, Check, X, Rocket, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { seedCreatives } from "./governance/mockData";
import { CreativeCheck, CreativeCheckItem, CreativeVerdict, CreativeState, PlacementSurface } from "./governance/types";
import DiffDrawer from "./governance/DiffDrawer";
import { exportToCsv } from "./governance/exportCsv";
import { useToast } from "@/hooks/use-toast";

const verdictClass: Record<CreativeVerdict, string> = {
  pass: "bg-success/10 text-success border-success/30",
  warning: "bg-warning/10 text-warning border-warning/30",
  blocked: "bg-destructive/10 text-destructive border-destructive/30",
};

const stateClass: Record<CreativeState, string> = {
  active: "bg-info/10 text-info",
  preflight: "bg-primary/10 text-primary",
};

const hasCriticalFail = (c: CreativeCheck) =>
  c.platformChecks.some(x => !x.pass && x.critical) || c.brandChecks.some(x => !x.pass && x.critical);

const ChecklistRow = ({ item }: { item: CreativeCheckItem }) => (
  <div className="flex items-start gap-2 text-[11px] py-1">
    {item.pass
      ? <Check className="h-3.5 w-3.5 text-success flex-shrink-0 mt-0.5" />
      : <X className={cn("h-3.5 w-3.5 flex-shrink-0 mt-0.5", item.critical ? "text-destructive" : "text-warning")} />}
    <div className="flex-1 min-w-0">
      <div className="font-medium">{item.label} {item.critical && !item.pass && <span className="text-[9px] font-mono text-destructive">CRITICAL</span>}</div>
      <div className="text-muted-foreground font-mono truncate">
        <span className="text-foreground/70">{item.required}</span>
        {" · "}
        <span className={cn(item.pass ? "text-success" : "text-destructive")}>{item.actual}</span>
      </div>
    </div>
  </div>
);

const GovernanceCreativeView = () => {
  const [checks, setChecks] = useState<CreativeCheck[]>(seedCreatives);
  const [tab, setTab] = useState<CreativeState>("active");
  const [publisher, setPublisher] = useState("all");
  const [surface, setSurface] = useState<string>("all");
  const [result, setResult] = useState<string>("all");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [diff, setDiff] = useState<CreativeCheck | null>(null);
  const [actioning, setActioning] = useState<{ c: CreativeCheck; type: "fix" | "waive" | "send_back" } | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const filtered = useMemo(() => checks.filter(c =>
    c.state === tab &&
    (publisher === "all" || c.publisher === publisher) &&
    (surface === "all" || c.surface === surface) &&
    (result === "all" || c.verdict === result)
  ), [checks, tab, publisher, surface, result]);

  const kpis = useMemo(() => {
    const list = checks.filter(c => c.state === tab);
    return {
      total: list.length,
      passing: list.filter(c => c.verdict === "pass").length,
      platformFails: list.filter(c => c.platformChecks.some(x => !x.pass)).length,
      brandFails: list.filter(c => c.brandChecks.some(x => !x.pass)).length,
      preflightBlockers: tab === "preflight" ? list.filter(c => hasCriticalFail(c)).length : 0,
    };
  }, [checks, tab]);

  // group by surface
  const grouped = useMemo(() => {
    const map: Record<string, CreativeCheck[]> = {};
    filtered.forEach(c => { (map[c.surface] ||= []).push(c); });
    return map;
  }, [filtered]);

  const remove = (id: string) => setChecks(cs => cs.filter(c => c.id !== id));

  const exportCsv = () => {
    exportToCsv("creative-compliance.csv", filtered, [
      { key: "publisher", label: "Publisher" }, { key: "surface", label: "Surface" },
      { key: "slot", label: "Slot" }, { key: "state", label: "State" },
      { key: "sku", label: "SKU" }, { key: "productName", label: "Product" },
      { key: "verdict", label: "Verdict" },
    ]);
    toast({ title: "Export ready", description: `${filtered.length} rows downloaded.` });
  };

  const surfaces: PlacementSurface[] = Array.from(new Set(seedCreatives.map(c => c.surface))) as PlacementSurface[];
  const publishers = Array.from(new Set(seedCreatives.map(c => c.publisher)));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Creative Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">Validate active and preflight creatives against platform specs and brand guidelines across placements.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export report</Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b">
        {(["active", "preflight"] as CreativeState[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize",
              tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t} creatives
            <span className="ml-2 text-[10px] font-mono text-muted-foreground">
              {checks.filter(c => c.state === t).length}
            </span>
          </button>
        ))}
      </div>

      {/* KPIs */}
      <div className={cn("grid gap-3", tab === "preflight" ? "grid-cols-5" : "grid-cols-4")}>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-[10px] font-mono uppercase text-muted-foreground">Total</div>
          <div className="font-mono text-2xl font-semibold mt-1">{kpis.total}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-[10px] font-mono uppercase text-success">Passing</div>
          <div className="font-mono text-2xl font-semibold mt-1">{kpis.passing}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-[10px] font-mono uppercase text-warning">Platform-spec fails</div>
          <div className="font-mono text-2xl font-semibold mt-1">{kpis.platformFails}</div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <div className="text-[10px] font-mono uppercase text-warning">Brand-guideline fails</div>
          <div className="font-mono text-2xl font-semibold mt-1">{kpis.brandFails}</div>
        </div>
        {tab === "preflight" && (
          <div className="rounded-xl border bg-card p-4">
            <div className="text-[10px] font-mono uppercase text-destructive">Preflight blockers</div>
            <div className="font-mono text-2xl font-semibold mt-1">{kpis.preflightBlockers}</div>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-xl border bg-card p-4 flex flex-wrap gap-3 items-end">
        <div className="min-w-[160px]">
          <Label className="text-xs">Publisher</Label>
          <Select value={publisher} onValueChange={setPublisher}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All publishers</SelectItem>
              {publishers.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[200px]">
          <Label className="text-xs">Surface</Label>
          <Select value={surface} onValueChange={setSurface}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All surfaces</SelectItem>
              {surfaces.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="min-w-[160px]">
          <Label className="text-xs">Result</Label>
          <Select value={result} onValueChange={setResult}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All results</SelectItem>
              <SelectItem value="pass">Pass</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="text-xs text-muted-foreground font-mono ml-auto">{filtered.length} creatives</div>
      </div>

      {/* Grouped cards */}
      {Object.entries(grouped).map(([surf, items]) => (
        <div key={surf} className="rounded-xl border bg-card shadow-card">
          <div className="px-5 py-3 border-b flex items-center justify-between">
            <div className="font-heading font-semibold text-sm">{surf}</div>
            <div className="text-[11px] text-muted-foreground">
              {items.length} creatives · {items.filter(i => i.verdict !== "pass").length} issues
            </div>
          </div>
          <div className="divide-y">
            {items.map(c => {
              const isExp = expanded[c.id];
              const blockedForLaunch = hasCriticalFail(c);
              return (
                <div key={c.id}>
                  <div className="px-5 py-4 grid grid-cols-12 gap-4">
                    {/* Left: thumb + meta */}
                    <div className="col-span-3 flex items-start gap-3 min-w-0">
                      <div className="h-16 w-20 rounded flex-shrink-0 flex items-end justify-start p-1" style={{ background: c.thumbColor }}>
                        <span className="text-[8px] font-mono text-white/80 bg-black/30 px-1 rounded">{c.publisher}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{c.productName}</div>
                        <div className="text-[11px] font-mono text-muted-foreground">{c.sku}</div>
                        <div className="flex gap-1 mt-1 flex-wrap">
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted">{c.slot}</span>
                          <span className={cn("text-[10px] font-mono uppercase px-1.5 py-0.5 rounded", stateClass[c.state])}>{c.state}</span>
                        </div>
                        {c.scheduledGoLive && (
                          <div className="text-[10px] font-mono text-muted-foreground mt-1">Go-live: {c.scheduledGoLive}</div>
                        )}
                      </div>
                    </div>

                    {/* Middle: platform + brand summary */}
                    <div className="col-span-4">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Platform guidelines</div>
                      <div className="text-[11px]">
                        <span className="text-success font-mono">{c.platformChecks.filter(x => x.pass).length} pass</span>
                        {" · "}
                        <span className={cn("font-mono", c.platformChecks.some(x => !x.pass) ? "text-destructive" : "text-muted-foreground")}>
                          {c.platformChecks.filter(x => !x.pass).length} fail
                        </span>
                      </div>
                      {c.platformChecks.filter(x => !x.pass).slice(0, 2).map((x, i) => (
                        <div key={i} className="text-[10px] text-destructive truncate mt-0.5">• {x.label}: {x.actual}</div>
                      ))}
                    </div>
                    <div className="col-span-3">
                      <div className="text-[10px] font-mono uppercase text-muted-foreground mb-1">Brand guidelines</div>
                      <div className="text-[11px]">
                        <span className="text-success font-mono">{c.brandChecks.filter(x => x.pass).length} pass</span>
                        {" · "}
                        <span className={cn("font-mono", c.brandChecks.some(x => !x.pass) ? "text-destructive" : "text-muted-foreground")}>
                          {c.brandChecks.filter(x => !x.pass).length} fail
                        </span>
                      </div>
                      {c.brandChecks.filter(x => !x.pass).slice(0, 2).map((x, i) => (
                        <div key={i} className="text-[10px] text-destructive truncate mt-0.5">• {x.label}: {x.actual}</div>
                      ))}
                    </div>

                    {/* Right: verdict + actions */}
                    <div className="col-span-2 flex flex-col items-end gap-2">
                      <span className={cn("text-[10px] font-mono uppercase px-2 py-1 rounded border", verdictClass[c.verdict])}>
                        {c.verdict}
                      </span>
                      <div className="flex gap-1">
                        <button onClick={() => setExpanded(e => ({ ...e, [c.id]: !e[c.id] }))} className="p-1.5 hover:bg-muted rounded" title="Details">
                          {isExp ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => setDiff(c)} className="p-1.5 hover:bg-muted rounded" title="View diff"><Eye className="h-3.5 w-3.5" /></button>
                        {tab === "active" ? (
                          <>
                            <button onClick={() => { setActioning({ c, type: "fix" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-info" title="Request fix"><AlertCircle className="h-3.5 w-3.5" /></button>
                            <button onClick={() => { setActioning({ c, type: "waive" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Waive"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => {
                                if (blockedForLaunch) return;
                                toast({ title: "Approved for launch", description: `${c.productName} · ${c.publisher}` });
                                remove(c.id);
                              }}
                              disabled={blockedForLaunch}
                              title={blockedForLaunch ? "Blocked: critical checks failing" : "Approve for launch"}
                              className={cn("p-1.5 rounded", blockedForLaunch ? "text-muted-foreground/40 cursor-not-allowed" : "hover:bg-success/10 text-success")}
                            >
                              <Rocket className="h-3.5 w-3.5" />
                            </button>
                            <button onClick={() => { setActioning({ c, type: "send_back" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-warning" title="Send back to design"><RotateCcw className="h-3.5 w-3.5" /></button>
                            <button onClick={() => { setActioning({ c, type: "waive" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Waive with note"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {isExp && (
                    <div className="px-5 pb-5 pt-1 grid grid-cols-2 gap-6 bg-muted/20 border-t">
                      <div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Platform guidelines</div>
                        <div className="divide-y">
                          {c.platformChecks.map((x, i) => <ChecklistRow key={i} item={x} />)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] font-mono uppercase text-muted-foreground mb-2">Brand guidelines</div>
                        <div className="divide-y">
                          {c.brandChecks.map((x, i) => <ChecklistRow key={i} item={x} />)}
                        </div>
                      </div>
                      <div className="col-span-2 grid grid-cols-3 gap-3 text-[11px] pt-2 border-t">
                        <div>
                          <div className="text-muted-foreground">Asset version</div>
                          <div className={cn("font-mono", c.mismatchTypes.includes("asset") && "text-destructive")}>
                            {c.servedAssetVersion} <span className="text-muted-foreground">/ {c.approvedAssetVersion}</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Landing page</div>
                          <div className={cn("font-mono truncate", c.mismatchTypes.includes("landing_page") && "text-destructive")}>
                            {c.servedLandingPage}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">CTA</div>
                          <div className={cn("font-mono", c.mismatchTypes.includes("cta") && "text-destructive")}>
                            {c.servedCTA} <span className="text-muted-foreground">/ {c.approvedCTA}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {diff && (
        <DiffDrawer
          open={!!diff}
          onOpenChange={(o) => !o && setDiff(null)}
          title={`${diff.productName} — ${diff.publisher}`}
          subtitle={`${diff.surface} · ${diff.slot}`}
          rows={[
            { field: "Asset version", approved: diff.approvedAssetVersion, live: diff.servedAssetVersion },
            { field: "Landing page", approved: diff.approvedLandingPage, live: diff.servedLandingPage },
            { field: "CTA", approved: diff.approvedCTA, live: diff.servedCTA },
            ...diff.platformChecks.filter(x => !x.pass).map(x => ({ field: `Platform · ${x.label}`, approved: x.required, live: x.actual })),
            ...diff.brandChecks.filter(x => !x.pass).map(x => ({ field: `Brand · ${x.label}`, approved: x.required, live: x.actual })),
          ]}
        />
      )}

      <Dialog open={!!actioning} onOpenChange={(o) => !o && setActioning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actioning?.type === "fix" ? "Request fix"
                : actioning?.type === "send_back" ? "Send back to design"
                : "Waive discrepancy"}
            </DialogTitle>
          </DialogHeader>
          {actioning && (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">{actioning.c.productName} · {actioning.c.publisher}</div>
                <div className="text-xs text-muted-foreground font-mono">{actioning.c.surface} · {actioning.c.slot}</div>
              </div>
              <div>
                <Label>
                  {actioning.type === "waive" ? "Reason for waiver"
                    : actioning.type === "send_back" ? "Design feedback"
                    : "Assignee / note"}
                </Label>
                <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActioning(null)}>Cancel</Button>
            <Button onClick={() => {
              if (!actioning) return;
              const titles = { fix: "Fix requested", waive: "Discrepancy waived", send_back: "Sent back to design" };
              toast({ title: titles[actioning.type], description: `${actioning.c.productName} on ${actioning.c.publisher}` });
              remove(actioning.c.id);
              setActioning(null);
            }} disabled={!note.trim()}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernanceCreativeView;
