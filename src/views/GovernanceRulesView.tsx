import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { seedRules } from "./governance/mockData";
import { GovernanceRule, RuleAction, RuleCategory, Severity } from "./governance/types";
import { useToast } from "@/hooks/use-toast";

const severityClass: Record<Severity, string> = {
  critical: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

const blankRule = (): GovernanceRule => ({
  id: `r_${Date.now()}`, name: "", description: "", category: "setup",
  platforms: ["Amazon"], campaignTypes: ["All"], severity: "warning",
  enabled: true, actionOnViolation: "flag", config: {},
});

const GovernanceRulesView = () => {
  const [rules, setRules] = useState<GovernanceRule[]>(seedRules);
  const [editing, setEditing] = useState<GovernanceRule | null>(null);
  const { toast } = useToast();

  const save = () => {
    if (!editing) return;
    setRules(rs => {
      const exists = rs.find(r => r.id === editing.id);
      return exists ? rs.map(r => r.id === editing.id ? editing : r) : [...rs, editing];
    });
    toast({ title: "Rule saved", description: editing.name });
    setEditing(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-heading text-2xl font-semibold">Governance Rules</h1>
          <p className="text-sm text-muted-foreground mt-1">Define setup and creative compliance rules applied to live campaigns.</p>
        </div>
        <Button onClick={() => setEditing(blankRule())}><Plus className="h-4 w-4 mr-1" /> New rule</Button>
      </div>

      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/60 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left px-4 py-2.5">Rule</th>
              <th className="text-left px-4 py-2.5">Category</th>
              <th className="text-left px-4 py-2.5">Severity</th>
              <th className="text-left px-4 py-2.5">Action</th>
              <th className="text-left px-4 py-2.5">Platforms</th>
              <th className="text-center px-4 py-2.5">Enabled</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rules.map(r => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-4 py-3">
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.description}</div>
                </td>
                <td className="px-4 py-3 capitalize text-xs">{r.category}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-[10px] font-mono uppercase px-2 py-0.5 rounded", severityClass[r.severity])}>{r.severity}</span>
                </td>
                <td className="px-4 py-3 text-xs capitalize">{r.actionOnViolation.replace("_", " ")}</td>
                <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{r.platforms.join(", ")}</td>
                <td className="px-4 py-3 text-center">
                  <Switch checked={r.enabled} onCheckedChange={(v) => setRules(rs => rs.map(x => x.id === r.id ? { ...x, enabled: v } : x))} />
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={() => setEditing(r)} className="p-1.5 hover:bg-muted rounded"><Pencil className="h-3.5 w-3.5" /></button>
                  <button onClick={() => setRules(rs => rs.filter(x => x.id !== r.id))} className="p-1.5 hover:bg-muted rounded text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing && rules.find(r => r.id === editing.id) ? "Edit rule" : "New rule"}</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select value={editing.category} onValueChange={(v: RuleCategory) => setEditing({ ...editing, category: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="setup">Setup compliance</SelectItem>
                      <SelectItem value="creative">Creative compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Severity</Label>
                  <Select value={editing.severity} onValueChange={(v: Severity) => setEditing({ ...editing, severity: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Platforms (comma-separated)</Label>
                  <Input value={editing.platforms.join(", ")} onChange={(e) => setEditing({ ...editing, platforms: e.target.value.split(",").map(s => s.trim()).filter(Boolean) })} />
                </div>
                <div>
                  <Label>Action on violation</Label>
                  <Select value={editing.actionOnViolation} onValueChange={(v: RuleAction) => setEditing({ ...editing, actionOnViolation: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flag">Flag only</SelectItem>
                      <SelectItem value="review">Require review</SelectItem>
                      <SelectItem value="auto_pause">Auto-pause</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Configuration (key: value, one per line)</Label>
                <Textarea
                  rows={4}
                  value={Object.entries(editing.config).map(([k, v]) => `${k}: ${v}`).join("\n")}
                  onChange={(e) => {
                    const cfg: Record<string, string> = {};
                    e.target.value.split("\n").forEach(line => {
                      const [k, ...rest] = line.split(":");
                      if (k && rest.length) cfg[k.trim()] = rest.join(":").trim();
                    });
                    setEditing({ ...editing, config: cfg });
                  }}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing.enabled} onCheckedChange={(v) => setEditing({ ...editing, enabled: v })} />
                <Label>Enabled</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save}>Save rule</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GovernanceRulesView;
