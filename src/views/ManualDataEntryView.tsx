import React, { useMemo, useState } from "react";
import PanelCard from "@/components/sw/PanelCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, Plus, Search } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CUSTOMERS = ["Britannia", "Sunfeast", "Unibic", "Anmol"] as const;
const PLATFORMS = ["Blinkit", "Instamart", "Zepto"] as const;

const CHANGE_TYPES = [
  "Bid Increase",
  "Bid Decrease",
  "Budget Increase",
  "Budget Decrease",
  "Keyword Added",
  "Keyword Removed",
  "Campaign Paused",
  "Campaign Resumed",
  "City Added",
  "City Removed",
  "Schedule Changed",
] as const;

type Customer = typeof CUSTOMERS[number];
type Platform = typeof PLATFORMS[number];
type ChangeType = typeof CHANGE_TYPES[number];

const CAMPAIGNS: Record<Customer, Record<Platform, string[]>> = {
  Britannia: {
    Blinkit: ["Good Day SP – Mumbai", "Bourbon SB – Delhi NCR", "Marie Gold National SP"],
    Instamart: ["Good Day Cookies – Bangalore", "Milk Bikis SP – National"],
    Zepto: ["Bourbon Combo – Metro", "Tiger Glucose SP – Hyderabad"],
  },
  Sunfeast: {
    Blinkit: ["Dark Fantasy SP – National", "Marie Light SB – Mumbai"],
    Instamart: ["Bounce Cream SP – Delhi NCR", "Farmlite SB – Bangalore"],
    Zepto: ["Dark Fantasy Choco Fills – Metro"],
  },
  Unibic: {
    Blinkit: ["Choco Chip SP – Mumbai", "Cashew Cookies SB – National"],
    Instamart: ["Butter Cookies SP – Bangalore"],
    Zepto: ["Anzac Cookies – Delhi NCR"],
  },
  Anmol: {
    Blinkit: ["Glucose SP – National", "Marie SP – Kolkata"],
    Instamart: ["Cream Biscuits SB – Chennai"],
    Zepto: ["Butter Bite SP – Metro"],
  },
};

interface Entry {
  id: string;
  ts: string;
  customer: Customer;
  platform: Platform;
  campaign: string;
  changeType: ChangeType;
  value: string;
  why: string;
}

const seed: Entry[] = [
  { id: "e1", ts: "2026-06-30 14:22", customer: "Britannia", platform: "Blinkit", campaign: "Good Day SP – Mumbai", changeType: "Bid Increase", value: "+₹4.50", why: "Losing top-slot to Parle-G on 'butter cookies' keyword" },
  { id: "e2", ts: "2026-06-30 12:05", customer: "Sunfeast", platform: "Zepto", campaign: "Dark Fantasy Choco Fills – Metro", changeType: "Budget Increase", value: "+25%", why: "Weekend pacing under 60%, ROAS 4.8x" },
  { id: "e3", ts: "2026-06-29 18:41", customer: "Unibic", platform: "Instamart", campaign: "Butter Cookies SP – Bangalore", changeType: "Keyword Removed", value: "cheap cookies", why: "Irrelevant traffic, ACoS 82%" },
  { id: "e4", ts: "2026-06-29 10:12", customer: "Britannia", platform: "Instamart", campaign: "Milk Bikis SP – National", changeType: "Campaign Paused", value: "—", why: "OOS in 6 dark stores, avoiding wasted spend" },
  { id: "e5", ts: "2026-06-28 16:30", customer: "Anmol", platform: "Blinkit", campaign: "Glucose SP – National", changeType: "City Added", value: "Pune", why: "New distributor onboarded, extending coverage" },
];

const typeTone = (t: ChangeType): string => {
  if (t.includes("Increase") || t === "Campaign Resumed" || t === "Keyword Added" || t === "City Added") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  if (t.includes("Decrease") || t === "Campaign Paused" || t === "Keyword Removed" || t === "City Removed") return "bg-rose-500/15 text-rose-700 border-rose-500/30";
  return "bg-amber-500/15 text-amber-700 border-amber-500/30";
};

const needsNumericValue = (t: ChangeType) => t === "Bid Increase" || t === "Bid Decrease" || t === "Budget Increase" || t === "Budget Decrease";
const noValue = (t: ChangeType) => t === "Campaign Paused" || t === "Campaign Resumed";

const now = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const ManualDataEntryView: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>(seed);
  const [customer, setCustomer] = useState<Customer | "">("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [campaign, setCampaign] = useState<string>("");
  const [changeType, setChangeType] = useState<ChangeType | "">("");
  const [value, setValue] = useState("");
  const [why, setWhy] = useState("");

  const [q, setQ] = useState("");
  const [fCustomer, setFCustomer] = useState<string>("all");
  const [fPlatform, setFPlatform] = useState<string>("all");
  const [fType, setFType] = useState<string>("all");

  const campaignOptions = useMemo(() => {
    if (!customer || !platform) return [];
    return CAMPAIGNS[customer][platform] || [];
  }, [customer, platform]);

  const reset = () => {
    setCustomer(""); setPlatform(""); setCampaign(""); setChangeType(""); setValue(""); setWhy("");
  };

  const submit = () => {
    if (!customer || !platform || !campaign || !changeType || !why.trim()) {
      toast({ title: "Missing fields", description: "Customer, platform, campaign, change type and why are required." });
      return;
    }
    if (!noValue(changeType as ChangeType) && !value.trim()) {
      toast({ title: "Value required", description: "Please enter the value for this change." });
      return;
    }
    const e: Entry = {
      id: `e${Date.now()}`,
      ts: now(),
      customer: customer as Customer,
      platform: platform as Platform,
      campaign,
      changeType: changeType as ChangeType,
      value: noValue(changeType as ChangeType) ? "—" : value.trim(),
      why: why.trim(),
    };
    setEntries((prev) => [e, ...prev]);
    toast({ title: "Change logged", description: `${e.changeType} on ${e.campaign}` });
    reset();
  };

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      if (fCustomer !== "all" && e.customer !== fCustomer) return false;
      if (fPlatform !== "all" && e.platform !== fPlatform) return false;
      if (fType !== "all" && e.changeType !== fType) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        if (!(`${e.campaign} ${e.why} ${e.value}`.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [entries, q, fCustomer, fPlatform, fType]);

  const exportCsv = () => {
    const header = ["Timestamp", "Customer", "Platform", "Campaign", "Change Type", "Value", "Why"];
    const rows = filtered.map((e) => [e.ts, e.customer, e.platform, e.campaign, e.changeType, e.value, e.why]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `manual-data-entry-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  const valuePlaceholder = (): string => {
    if (!changeType) return "Value";
    if (changeType === "Bid Increase" || changeType === "Bid Decrease") return "e.g. +₹4.50 or -15%";
    if (changeType === "Budget Increase" || changeType === "Budget Decrease") return "e.g. +25% or +₹5,000";
    if (changeType === "Keyword Added" || changeType === "Keyword Removed") return "e.g. butter cookies";
    if (changeType === "City Added" || changeType === "City Removed") return "e.g. Pune";
    if (changeType === "Schedule Changed") return "e.g. 8:00–11:00 PM";
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Manual Data Entry</h1>
          <p className="text-sm text-muted-foreground mt-1">Log manual changes made to quick commerce campaigns</p>
        </div>
        <Button variant="outline" size="sm" onClick={exportCsv}>
          <Download size={14} className="mr-1.5" /> Export CSV
        </Button>
      </div>

      <PanelCard title="New change">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Customer</label>
            <Select value={customer} onValueChange={(v) => { setCustomer(v as Customer); setCampaign(""); }}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{CUSTOMERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Platform</label>
            <Select value={platform} onValueChange={(v) => { setPlatform(v as Platform); setCampaign(""); }}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-2">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Campaign</label>
            <Select value={campaign} onValueChange={setCampaign} disabled={!customer || !platform}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={!customer || !platform ? "Pick customer & platform" : "Select campaign"} /></SelectTrigger>
              <SelectContent>{campaignOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Change type</label>
            <Select value={changeType} onValueChange={(v) => setChangeType(v as ChangeType)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{CHANGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Value</label>
            <Input
              className="mt-1"
              value={noValue(changeType as ChangeType) ? "" : value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={valuePlaceholder()}
              disabled={!changeType || noValue(changeType as ChangeType)}
            />
          </div>
          <div className="lg:col-span-5">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Why</label>
            <Textarea
              className="mt-1 min-h-[68px]"
              value={why}
              onChange={(e) => setWhy(e.target.value.slice(0, 300))}
              placeholder="Reason for this change (max 300 chars)"
            />
            <div className="text-[10px] font-mono text-muted-foreground mt-1">{why.length}/300</div>
          </div>
          <div className="lg:col-span-1 flex items-end">
            <Button className="w-full" onClick={submit}>
              <Plus size={14} className="mr-1.5" /> Add
            </Button>
          </div>
        </div>
      </PanelCard>

      <PanelCard title={`Change log (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaign, value, why…" className="pl-8 h-9" />
          </div>
          <Select value={fCustomer} onValueChange={setFCustomer}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All customers</SelectItem>
              {CUSTOMERS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fPlatform} onValueChange={setFPlatform}>
            <SelectTrigger className="h-9 w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {PLATFORMS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fType} onValueChange={setFType}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All change types</SelectItem>
              {CHANGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50">
              <tr className="text-left text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                <th className="p-2">Timestamp</th>
                <th className="p-2">Customer</th>
                <th className="p-2">Platform</th>
                <th className="p-2">Campaign</th>
                <th className="p-2">Change type</th>
                <th className="p-2">Value</th>
                <th className="p-2">Why</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No entries match your filters.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{e.ts}</td>
                  <td className="p-2">{e.customer}</td>
                  <td className="p-2">{e.platform}</td>
                  <td className="p-2">{e.campaign}</td>
                  <td className="p-2"><Badge variant="outline" className={`${typeTone(e.changeType)} border`}>{e.changeType}</Badge></td>
                  <td className="p-2 font-mono">{e.value}</td>
                  <td className="p-2 max-w-[320px] text-muted-foreground">{e.why}</td>
                  <td className="p-2">
                    <button
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => setEntries((prev) => prev.filter((x) => x.id !== e.id))}
                      aria-label="Delete entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </div>
  );
};

export default ManualDataEntryView;
