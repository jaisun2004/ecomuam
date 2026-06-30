import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { seedPlans } from "./governance/mockData";
import { ApprovedPlan } from "./governance/types";
import { useToast } from "@/hooks/use-toast";

const blank = (): ApprovedPlan => ({
  id: `p_${Date.now()}`, campaign: "", platform: "Amazon", objective: "Awareness",
  audience: "", geo: [], frequencyCap: "", placements: [], trackingParams: "",
  dailyBudget: 0, startDate: "", endDate: "", approvedBy: "", status: "draft",
});

const statusClass: Record<ApprovedPlan["status"], string> = {
  approved: "bg-success/10 text-success",
  draft: "bg-muted text-muted-foreground",
  expired: "bg-destructive/10 text-destructive",
};

const GovernancePlansView = () => {
  const [plans, setPlans] = useState<ApprovedPlan[]>(seedPlans);
  const [editing, setEditing] = useState<ApprovedPlan | null>(null);
  const { toast } = useToast();

  const save = () => {
    if (!editing) return;
    setPlans(ps => {
      const exists = ps.find(p => p.id === editing.id);
      return exists ? ps.map(p => p.id === editing.id ? editing : p) : [...ps, editing];
    });
    toast({ title: "Plan saved", description: editing.campaign });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Approved Media Plans</h1>
          <p className="text-sm text-muted-foreground mt-1">The source-of-truth media plan that live campaigns are audited against.</p>
        </div>
        <Button onClick={() => setEditing(blank())}><Plus className="h-4 w-4 mr-1" /> Add plan</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <tr>
              {["Campaign", "Platform", "Objective", "Audience", "Geo", "Freq cap", "Placements", "Tracking", "Daily ₹", "Window", "Approver", "Status", ""].map(h => (
                <th key={h} className="text-left px-3 py-2.5 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {plans.map(p => (
              <tr key={p.id} className="hover:bg-muted/40">
                <td className="px-3 py-2.5 font-mono text-xs">{p.campaign}</td>
                <td className="px-3 py-2.5 text-xs">{p.platform}</td>
                <td className="px-3 py-2.5 text-xs">{p.objective}</td>
                <td className="px-3 py-2.5 text-xs">{p.audience}</td>
                <td className="px-3 py-2.5 text-xs">{p.geo.join(", ")}</td>
                <td className="px-3 py-2.5 text-xs font-mono">{p.frequencyCap}</td>
                <td className="px-3 py-2.5 text-xs">{p.placements.join(", ")}</td>
                <td className="px-3 py-2.5 text-xs font-mono text-muted-foreground max-w-[180px] truncate" title={p.trackingParams}>{p.trackingParams}</td>
                <td className="px-3 py-2.5 text-xs font-mono">₹{p.dailyBudget.toLocaleString()}</td>
                <td className="px-3 py-2.5 text-xs font-mono">{p.startDate} → {p.endDate}</td>
                <td className="px-3 py-2.5 text-xs">{p.approvedBy}</td>
                <td className="px-3 py-2.5">
                  <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded", statusClass[p.status])}>{p.status}</span>
                </td>
                <td className="px-3 py-2.5 text-right whitespace-nowrap">
                  <button onClick={() => setEditing(p)} className="p-1.5 hover:bg-muted rounded"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setPlans(ps => ps.filter(x => x.id !== p.id))} className="p-1.5 hover:bg-muted rounded text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing && plans.find(p => p.id === editing.id) ? "Edit plan" : "New approved plan"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Campaign name</Label>
                <Input value={editing.campaign} onChange={(e) => setEditing({ ...editing, campaign: e.target.value })} />
              </div>
              <div>
                <Label>Platform</Label>
                <Select value={editing.platform} onValueChange={(v) => setEditing({ ...editing, platform: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Amazon", "Flipkart", "BlinkIt", "Zepto", "Instamart"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Objective</Label>
                <Select value={editing.objective} onValueChange={(v) => setEditing({ ...editing, objective: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Awareness", "Consideration", "Conversion"].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label>Audience</Label>
                <Input value={editing.audience} onChange={(e) => setEditing({ ...editing, audience: e.target.value })} />
              </div>
              <div>
                <Label>Geo (comma-separated cities)</Label>
                <Input value={editing.geo.join(", ")} onChange={(e) => setEditing({ ...editing, geo: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div>
                <Label>Frequency cap</Label>
                <Input value={editing.frequencyCap} onChange={(e) => setEditing({ ...editing, frequencyCap: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Placements (comma-separated)</Label>
                <Input value={editing.placements.join(", ")} onChange={(e) => setEditing({ ...editing, placements: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
              </div>
              <div className="col-span-2">
                <Label>Tracking params</Label>
                <Input value={editing.trackingParams} onChange={(e) => setEditing({ ...editing, trackingParams: e.target.value })} />
              </div>
              <div>
                <Label>Daily budget (₹)</Label>
                <Input type="number" value={editing.dailyBudget} onChange={(e) => setEditing({ ...editing, dailyBudget: Number(e.target.value) })} />
              </div>
              <div>
                <Label>Status</Label>
                <Select value={editing.status} onValueChange={(v: ApprovedPlan["status"]) => setEditing({ ...editing, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Start date</Label>
                <Input type="date" value={editing.startDate} onChange={(e) => setEditing({ ...editing, startDate: e.target.value })} />
              </div>
              <div>
                <Label>End date</Label>
                <Input type="date" value={editing.endDate} onChange={(e) => setEditing({ ...editing, endDate: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Approved by</Label>
                <Input value={editing.approvedBy} onChange={(e) => setEditing({ ...editing, approvedBy: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save plan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernancePlansView;
