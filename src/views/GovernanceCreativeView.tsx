import { useMemo, useState } from "react";
import { Download, Eye, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { seedCreatives } from "./governance/mockData";
import { CreativeCheck } from "./governance/types";
import DiffDrawer from "./governance/DiffDrawer";
import { exportToCsv } from "./governance/exportCsv";
import { useToast } from "@/hooks/use-toast";

const statusClass: Record<CreativeCheck["status"], string> = {
  ok: "bg-success/10 text-success",
  mismatch: "bg-warning/10 text-warning",
  missing: "bg-destructive/10 text-destructive",
};

const GovernanceCreativeView = () => {
  const [checks, setChecks] = useState<CreativeCheck[]>(seedCreatives);
  const [diff, setDiff] = useState<CreativeCheck | null>(null);
  const [actioning, setActioning] = useState<{ c: CreativeCheck; type: "fix" | "waive" } | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();

  const grouped = useMemo(() => {
    const map: Record<string, CreativeCheck[]> = {};
    checks.forEach(c => { (map[c.publisher] ||= []).push(c); });
    return map;
  }, [checks]);

  const counts = useMemo(() => ({
    asset: checks.filter(c => c.mismatchTypes.includes("asset")).length,
    landing_page: checks.filter(c => c.mismatchTypes.includes("landing_page")).length,
    cta: checks.filter(c => c.mismatchTypes.includes("cta")).length,
  }), [checks]);

  const maxBar = Math.max(counts.asset, counts.landing_page, counts.cta, 1);

  const exportCsv = () => {
    exportToCsv("creative-compliance.csv", checks, [
      { key: "publisher", label: "Publisher" },
      { key: "sku", label: "SKU" },
      { key: "productName", label: "Product" },
      { key: "approvedAssetVersion", label: "Approved asset" },
      { key: "servedAssetVersion", label: "Served asset" },
      { key: "approvedLandingPage", label: "Approved LP" },
      { key: "servedLandingPage", label: "Served LP" },
      { key: "approvedCTA", label: "Approved CTA" },
      { key: "servedCTA", label: "Served CTA" },
      { key: "status", label: "Status" },
    ]);
    toast({ title: "Export ready", description: `${checks.length} rows downloaded.` });
  };

  const remove = (id: string) => setChecks(cs => cs.filter(c => c.id !== id));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Creative Compliance</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit creative deployment across publishers vs approved assets, landing pages, and CTAs.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4 mr-1" /> Export report</Button>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-card">
        <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-3">Mismatches by type</div>
        <div className="space-y-2.5">
          {[
            { k: "asset" as const, label: "Asset / version" },
            { k: "landing_page" as const, label: "Landing page" },
            { k: "cta" as const, label: "CTA" },
          ].map(row => (
            <div key={row.k} className="flex items-center gap-3">
              <div className="w-32 text-xs">{row.label}</div>
              <div className="flex-1 h-5 bg-muted rounded">
                <div className="h-full rounded bg-warning" style={{ width: `${(counts[row.k] / maxBar) * 100}%` }} />
              </div>
              <div className="font-mono text-sm w-8 text-right">{counts[row.k]}</div>
            </div>
          ))}
        </div>
      </div>

      {Object.entries(grouped).map(([publisher, items]) => (
        <div key={publisher} className="rounded-xl border bg-card shadow-card">
          <div className="px-5 py-3.5 border-b flex items-center justify-between">
            <div className="font-heading font-semibold">{publisher}</div>
            <div className="text-xs text-muted-foreground">{items.length} creatives · {items.filter(i => i.status !== "ok").length} issues</div>
          </div>
          <div className="divide-y">
            {items.map(c => (
              <div key={c.id} className="px-5 py-4 grid grid-cols-12 gap-4 items-center">
                <div className="col-span-3">
                  <div className="text-sm font-medium">{c.productName}</div>
                  <div className="text-xs font-mono text-muted-foreground">{c.sku}</div>
                </div>
                <div className="col-span-2 text-xs">
                  <div className="text-muted-foreground">Asset</div>
                  <div className={cn("font-mono", c.mismatchTypes.includes("asset") && "text-destructive font-semibold")}>
                    {c.servedAssetVersion} <span className="text-muted-foreground">/ {c.approvedAssetVersion}</span>
                  </div>
                </div>
                <div className="col-span-3 text-xs min-w-0">
                  <div className="text-muted-foreground">Landing page</div>
                  <div className={cn("font-mono truncate", c.mismatchTypes.includes("landing_page") && "text-destructive font-semibold")} title={c.servedLandingPage}>
                    {c.servedLandingPage}
                  </div>
                </div>
                <div className="col-span-2 text-xs">
                  <div className="text-muted-foreground">CTA</div>
                  <div className={cn("font-mono", c.mismatchTypes.includes("cta") && "text-destructive font-semibold")}>
                    {c.servedCTA} <span className="text-muted-foreground">/ {c.approvedCTA}</span>
                  </div>
                </div>
                <div className="col-span-1 text-center">
                  <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded", statusClass[c.status])}>{c.status}</span>
                </div>
                <div className="col-span-1 flex gap-1 justify-end">
                  <button onClick={() => setDiff(c)} className="p-1.5 hover:bg-muted rounded" title="View diff"><Eye className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { setActioning({ c, type: "fix" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-info" title="Request fix"><AlertCircle className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { setActioning({ c, type: "waive" }); setNote(""); }} className="p-1.5 hover:bg-muted rounded text-muted-foreground" title="Waive"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {diff && (
        <DiffDrawer
          open={!!diff}
          onOpenChange={(o) => !o && setDiff(null)}
          title={`${diff.productName} — ${diff.publisher}`}
          subtitle={diff.sku}
          rows={[
            { field: "Asset version", approved: diff.approvedAssetVersion, live: diff.servedAssetVersion },
            { field: "Landing page", approved: diff.approvedLandingPage, live: diff.servedLandingPage },
            { field: "CTA", approved: diff.approvedCTA, live: diff.servedCTA },
          ]}
        />
      )}

      <Dialog open={!!actioning} onOpenChange={(o) => !o && setActioning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{actioning?.type === "fix" ? "Request fix" : "Waive discrepancy"}</DialogTitle>
          </DialogHeader>
          {actioning && (
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium">{actioning.c.productName} · {actioning.c.publisher}</div>
                <div className="text-xs text-muted-foreground font-mono">{actioning.c.sku}</div>
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
              toast({
                title: actioning.type === "fix" ? "Fix requested" : "Discrepancy waived",
                description: `${actioning.c.productName} on ${actioning.c.publisher}`,
              });
              remove(actioning.c.id);
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

export default GovernanceCreativeView;
