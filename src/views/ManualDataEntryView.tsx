import React, { useMemo, useRef, useState } from "react";
import PanelCard from "@/components/sw/PanelCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Download, Plus, Search, Upload, FileDown, X } from "lucide-react";
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

const VALUE_MODES = ["Absolute", "Percentage"] as const;

const CAMPAIGN_ISSUES = [
  "Underpacing",
  "Overpacing",
  "Low SoS",
  "Budget Finished",
  "High ACoS",
  "Low ROAS",
  "OOS Risk",
  "Competitor Pressure",
  "Other",
] as const;

type Customer = typeof CUSTOMERS[number];
type Platform = typeof PLATFORMS[number];
type ChangeType = typeof CHANGE_TYPES[number];
type ValueMode = typeof VALUE_MODES[number];
type CampaignIssue = typeof CAMPAIGN_ISSUES[number];

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

const KEYWORDS: Record<string, string[]> = {
  "Good Day SP – Mumbai": ["butter cookies", "good day", "cashew cookies", "premium biscuits"],
  "Bourbon SB – Delhi NCR": ["bourbon", "chocolate biscuits", "cream biscuits"],
  "Marie Gold National SP": ["marie gold", "marie biscuit", "tea time biscuits"],
  "Good Day Cookies – Bangalore": ["good day", "butter cookies", "cashew cookies"],
  "Milk Bikis SP – National": ["milk bikis", "kids biscuits", "milk biscuits"],
  "Bourbon Combo – Metro": ["bourbon combo", "chocolate biscuits"],
  "Tiger Glucose SP – Hyderabad": ["tiger glucose", "glucose biscuits", "energy biscuits"],
  "Dark Fantasy SP – National": ["dark fantasy", "choco fills", "premium cookies"],
  "Marie Light SB – Mumbai": ["marie light", "diet biscuits", "sugar free"],
  "Bounce Cream SP – Delhi NCR": ["bounce", "cream biscuits", "sandwich biscuits"],
  "Farmlite SB – Bangalore": ["farmlite", "digestive biscuits", "oats biscuits"],
  "Dark Fantasy Choco Fills – Metro": ["dark fantasy", "choco fills", "molten chocolate"],
  "Choco Chip SP – Mumbai": ["choco chip", "chocolate cookies", "unibic cookies"],
  "Cashew Cookies SB – National": ["cashew cookies", "nut cookies", "premium cookies"],
  "Butter Cookies SP – Bangalore": ["butter cookies", "danish butter", "cheap cookies"],
  "Anzac Cookies – Delhi NCR": ["anzac", "oats cookies", "healthy cookies"],
  "Glucose SP – National": ["glucose biscuits", "energy biscuits", "sugar biscuits"],
  "Marie SP – Kolkata": ["marie biscuit", "tea biscuit"],
  "Cream Biscuits SB – Chennai": ["cream biscuits", "sandwich biscuits"],
  "Butter Bite SP – Metro": ["butter bite", "butter cookies"],
};

const NEW_KEYWORD = "New Keyword";

interface Entry {
  id: string;
  ts: string;
  customer: Customer;
  platform: Platform;
  campaign: string;
  changeType: ChangeType;
  valueMode: ValueMode | "—";
  value: string;
  keyword: string;
  issue: CampaignIssue;
  why: string;
}

const seed: Entry[] = [
  { id: "e1", ts: "2026-06-30 14:22", customer: "Britannia", platform: "Blinkit", campaign: "Good Day SP – Mumbai", changeType: "Bid Increase", valueMode: "Absolute", value: "4.50", keyword: "butter cookies", issue: "Low SoS", why: "Losing top-slot to Parle-G on 'butter cookies' keyword" },
  { id: "e2", ts: "2026-06-30 12:05", customer: "Sunfeast", platform: "Zepto", campaign: "Dark Fantasy Choco Fills – Metro", changeType: "Budget Increase", valueMode: "Percentage", value: "25%", keyword: "—", issue: "Underpacing", why: "Weekend pacing under 60%, ROAS 4.8x" },
  { id: "e3", ts: "2026-06-29 18:41", customer: "Unibic", platform: "Instamart", campaign: "Butter Cookies SP – Bangalore", changeType: "Keyword Removed", valueMode: "—", value: "cheap cookies", keyword: "cheap cookies", issue: "High ACoS", why: "Irrelevant traffic, ACoS 82%" },
  { id: "e4", ts: "2026-06-29 10:12", customer: "Britannia", platform: "Instamart", campaign: "Milk Bikis SP – National", changeType: "Campaign Paused", valueMode: "—", value: "—", keyword: "—", issue: "OOS Risk", why: "OOS in 6 dark stores, avoiding wasted spend" },
  { id: "e5", ts: "2026-06-28 16:30", customer: "Anmol", platform: "Blinkit", campaign: "Glucose SP – National", changeType: "City Added", valueMode: "—", value: "Pune", keyword: "—", issue: "Other", why: "New distributor onboarded, extending coverage" },
];

const typeTone = (t: ChangeType): string => {
  if (t.includes("Increase") || t === "Campaign Resumed" || t === "Keyword Added" || t === "City Added") return "bg-emerald-500/15 text-emerald-700 border-emerald-500/30";
  if (t.includes("Decrease") || t === "Campaign Paused" || t === "Keyword Removed" || t === "City Removed") return "bg-rose-500/15 text-rose-700 border-rose-500/30";
  return "bg-amber-500/15 text-amber-700 border-amber-500/30";
};

const noValue = (t: ChangeType) => t === "Campaign Paused" || t === "Campaign Resumed";
const isNumericChange = (t: ChangeType) => t === "Bid Increase" || t === "Bid Decrease" || t === "Budget Increase" || t === "Budget Decrease";
const usesKeyword = (t: ChangeType) => t === "Bid Increase" || t === "Bid Decrease" || t === "Keyword Added" || t === "Keyword Removed";

const now = () => {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const CSV_COLUMNS = ["Timestamp", "Customer", "Platform", "Campaign", "Change Type", "Value Mode", "Value", "Keyword", "Campaign Issue", "Why"] as const;

const escapeCell = (v: string) => /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;

const buildCsv = (rows: Entry[]): string => {
  const header = CSV_COLUMNS.join(",");
  const body = rows.map((e) => [e.ts, e.customer, e.platform, e.campaign, e.changeType, e.valueMode, e.value, e.keyword, e.issue, e.why].map(escapeCell).join(",")).join("\n");
  return rows.length ? `${header}\n${body}` : header;
};

const downloadCsv = (filename: string, csv: string) => {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
};

const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  const src = text.replace(/\r\n?/g, "\n");
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else { inQuotes = false; }
      } else field += c;
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ",") { cur.push(field); field = ""; }
      else if (c === "\n") { cur.push(field); rows.push(cur); cur = []; field = ""; }
      else field += c;
    }
  }
  if (field.length > 0 || cur.length > 0) { cur.push(field); rows.push(cur); }
  return rows.filter((r) => r.some((f) => f.trim() !== ""));
};

const dateOf = (ts: string): string => (ts || "").slice(0, 10);

const ManualDataEntryView: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>(seed);
  const [customer, setCustomer] = useState<Customer | "">("");
  const [platform, setPlatform] = useState<Platform | "">("");
  const [campaign, setCampaign] = useState<string>("");
  const [changeType, setChangeType] = useState<ChangeType | "">("");
  const [valueMode, setValueMode] = useState<ValueMode | "">("");
  const [value, setValue] = useState("");
  const [keyword, setKeyword] = useState<string>("");
  const [issue, setIssue] = useState<CampaignIssue | "">("");
  const [why, setWhy] = useState("");

  const [q, setQ] = useState("");
  const [fCustomer, setFCustomer] = useState<string>("all");
  const [fPlatform, setFPlatform] = useState<string>("all");
  const [fType, setFType] = useState<string>("all");
  const [fIssue, setFIssue] = useState<string>("all");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");

  const [importErrors, setImportErrors] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const campaignOptions = useMemo(() => {
    if (!customer || !platform) return [];
    return CAMPAIGNS[customer][platform] || [];
  }, [customer, platform]);

  const reset = () => {
    setCustomer(""); setPlatform(""); setCampaign(""); setChangeType(""); setValueMode(""); setValue(""); setKeyword(""); setIssue(""); setWhy("");
  };

  const submit = () => {
    if (!customer || !platform || !campaign || !changeType || !issue || !why.trim()) {
      toast({ title: "Missing fields", description: "Customer, platform, campaign, change type, campaign issue and why are required." });
      return;
    }
    const ct = changeType as ChangeType;
    if (usesKeyword(ct) && !keyword) {
      toast({ title: "Keyword required", description: "Please select a keyword for this change." });
      return;
    }
    if (!noValue(ct)) {
      // For Keyword Removed, value is auto-derived from keyword.
      const needsValueInput = !(ct === "Keyword Removed");
      if (needsValueInput && !value.trim()) {
        toast({ title: "Value required", description: ct === "Keyword Added" ? "Enter the new keyword text." : "Please enter the value for this change." });
        return;
      }
      if (isNumericChange(ct) && !valueMode) {
        toast({ title: "Value type required", description: "Choose Absolute or Percentage." });
        return;
      }
    }
    const mode: ValueMode | "—" = noValue(ct) ? "—" : (isNumericChange(ct) ? (valueMode as ValueMode) : "—");
    let displayValue: string;
    if (noValue(ct)) displayValue = "—";
    else if (ct === "Keyword Removed") displayValue = keyword;
    else if (isNumericChange(ct) && mode === "Percentage") displayValue = `${value.trim()}%`;
    else displayValue = value.trim();

    const keywordOut = usesKeyword(ct) ? keyword : "—";

    const e: Entry = {
      id: `e${Date.now()}`,
      ts: now(),
      customer: customer as Customer,
      platform: platform as Platform,
      campaign,
      changeType: ct,
      valueMode: mode,
      value: displayValue,
      keyword: keywordOut,
      issue: issue as CampaignIssue,
      why: why.trim(),
    };
    setEntries((prev) => [e, ...prev]);
    toast({ title: "Change logged", description: `${e.changeType} on ${e.campaign}` });
    reset();
  };

  const filtered = useMemo(() => {
    return entries.filter((e) => {
      const d = dateOf(e.ts);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      if (fCustomer !== "all" && e.customer !== fCustomer) return false;
      if (fPlatform !== "all" && e.platform !== fPlatform) return false;
      if (fType !== "all" && e.changeType !== fType) return false;
      if (fIssue !== "all" && e.issue !== fIssue) return false;
      if (q.trim()) {
        const s = q.toLowerCase();
        if (!(`${e.campaign} ${e.why} ${e.value} ${e.issue}`.toLowerCase().includes(s))) return false;
      }
      return true;
    });
  }, [entries, q, fCustomer, fPlatform, fType, fIssue, fromDate, toDate]);

  const downloadTemplate = () => {
    const example: Entry = {
      id: "example",
      ts: now(),
      customer: "Britannia",
      platform: "Blinkit",
      campaign: "Good Day SP – Mumbai",
      changeType: "Bid Increase",
      valueMode: "Absolute",
      value: "4.50",
      keyword: "butter cookies",
      issue: "Low SoS",
      why: "Example row — replace or delete before importing",
    };
    downloadCsv(`manual-data-entry-template-${Date.now()}.csv`, buildCsv([example]));
  };

  const exportLog = () => {
    downloadCsv(`manual-data-entry-${Date.now()}.csv`, buildCsv(filtered));
  };

  const handleImportClick = () => fileRef.current?.click();

  const handleFile = async (file: File) => {
    setImportErrors([]);
    const text = await file.text();
    const rows = parseCsv(text);
    if (rows.length === 0) {
      toast({ title: "Import failed", description: "File is empty." });
      return;
    }
    const headerRow = rows[0].map((h) => h.trim());
    const norm = headerRow.map((h) => h.toLowerCase());
    const required = CSV_COLUMNS.map((c) => c.toLowerCase());
    const missing = required.filter((r) => !norm.includes(r));
    if (missing.length > 0) {
      toast({ title: "Import failed", description: `Missing columns: ${missing.join(", ")}` });
      return;
    }
    const idx = Object.fromEntries(required.map((r) => [r, norm.indexOf(r)])) as Record<string, number>;

    const valid: Entry[] = [];
    const errors: string[] = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const get = (k: string) => (r[idx[k]] ?? "").trim();
      const rowNum = i + 1;
      const cust = get("customer");
      const plat = get("platform");
      const camp = get("campaign");
      const ct = get("change type");
      const vm = get("value mode");
      const val = get("value");
      const kw = get("keyword");
      const iss = get("campaign issue");
      const wh = get("why");
      const ts = get("timestamp");

      if (!(CUSTOMERS as readonly string[]).includes(cust)) { errors.push(`Row ${rowNum}: invalid Customer "${cust}"`); continue; }
      if (!(PLATFORMS as readonly string[]).includes(plat)) { errors.push(`Row ${rowNum}: invalid Platform "${plat}"`); continue; }
      if (!(CHANGE_TYPES as readonly string[]).includes(ct)) { errors.push(`Row ${rowNum}: invalid Change Type "${ct}"`); continue; }
      const camps = CAMPAIGNS[cust as Customer][plat as Platform] || [];
      if (!camps.includes(camp)) { errors.push(`Row ${rowNum}: Campaign "${camp}" not valid for ${cust}/${plat}`); continue; }
      if (!(CAMPAIGN_ISSUES as readonly string[]).includes(iss)) { errors.push(`Row ${rowNum}: invalid Campaign Issue "${iss}"`); continue; }
      if (!wh) { errors.push(`Row ${rowNum}: Why is required`); continue; }
      const isNoVal = noValue(ct as ChangeType);
      const isNum = isNumericChange(ct as ChangeType);
      const usesKw = usesKeyword(ct as ChangeType);
      if (!isNoVal && !val) { errors.push(`Row ${rowNum}: Value required for ${ct}`); continue; }
      let mode: ValueMode | "—" = "—";
      if (!isNoVal && isNum) {
        if (!(VALUE_MODES as readonly string[]).includes(vm)) { errors.push(`Row ${rowNum}: Value Mode must be Absolute or Percentage for ${ct}`); continue; }
        mode = vm as ValueMode;
      }
      if (usesKw) {
        if (!kw) { errors.push(`Row ${rowNum}: Keyword required for ${ct}`); continue; }
        const camp_kws = KEYWORDS[camp] || [];
        if (ct === "Keyword Added") {
          if (kw !== NEW_KEYWORD) { errors.push(`Row ${rowNum}: Keyword for "Keyword Added" must be "${NEW_KEYWORD}"`); continue; }
        } else {
          if (!camp_kws.includes(kw)) { errors.push(`Row ${rowNum}: Keyword "${kw}" not valid for campaign "${camp}"`); continue; }
        }
      }

      valid.push({
        id: `imp${Date.now()}-${i}`,
        ts: ts || now(),
        customer: cust as Customer,
        platform: plat as Platform,
        campaign: camp,
        changeType: ct as ChangeType,
        valueMode: mode,
        value: isNoVal ? "—" : val,
        keyword: usesKw ? kw : "—",
        issue: iss as CampaignIssue,
        why: wh.slice(0, 300),
      });
    }

    if (valid.length > 0) setEntries((prev) => [...valid, ...prev]);
    setImportErrors(errors);
    toast({
      title: `Imported ${valid.length} row${valid.length === 1 ? "" : "s"}`,
      description: errors.length > 0 ? `${errors.length} skipped — see details below.` : "All rows imported successfully.",
    });
    if (fileRef.current) fileRef.current.value = "";
  };

  const ct = changeType as ChangeType;
  const showValueMode = true;
  const valueModeDisabled = !changeType || !isNumericChange(ct);
  const showKeyword = !!changeType && usesKeyword(ct);
  const keywordOptions = useMemo(() => {
    if (!showKeyword || !campaign) return [] as string[];
    if (ct === "Keyword Added") return [NEW_KEYWORD];
    return KEYWORDS[campaign] || [];
  }, [showKeyword, campaign, ct]);
  const keywordDisabled = !showKeyword || !campaign;
  // Value is disabled for Campaign Paused/Resumed AND for Keyword Removed (auto = keyword).
  // For Keyword Added, Value is only enabled once "New Keyword" is chosen.
  const valueDisabled =
    !changeType
    || noValue(ct)
    || ct === "Keyword Removed"
    || (ct === "Keyword Added" && keyword !== NEW_KEYWORD);

  const valuePlaceholder = (): string => {
    if (!changeType) return "Value";
    if (ct === "Bid Increase" || ct === "Bid Decrease") return valueMode === "Percentage" ? "e.g. 15" : "e.g. 4.50";
    if (ct === "Budget Increase" || ct === "Budget Decrease") return valueMode === "Percentage" ? "e.g. 25" : "e.g. 5000";
    if (ct === "Keyword Added") return keyword === NEW_KEYWORD ? "Enter new keyword" : "Pick keyword first";
    if (ct === "Keyword Removed") return keyword || "Pick keyword";
    if (ct === "City Added" || ct === "City Removed") return "e.g. Pune";
    if (ct === "Schedule Changed") return "e.g. 8:00–11:00 PM";
    return "—";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Manual Data Entry</h1>
          <p className="text-sm text-muted-foreground mt-1">Log manual changes made to quick commerce campaigns</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <FileDown size={14} className="mr-1.5" /> Download template
          </Button>
          <Button variant="outline" size="sm" onClick={handleImportClick}>
            <Upload size={14} className="mr-1.5" /> Import CSV
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
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
            <Select value={campaign} onValueChange={(v) => { setCampaign(v); setKeyword(""); }} disabled={!customer || !platform}>
              <SelectTrigger className="mt-1"><SelectValue placeholder={!customer || !platform ? "Pick customer & platform" : "Select campaign"} /></SelectTrigger>
              <SelectContent>{campaignOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Change type</label>
            <Select value={changeType} onValueChange={(v) => { setChangeType(v as ChangeType); setValueMode(""); setValue(""); setKeyword(""); }}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{CHANGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Campaign issue</label>
            <Select value={issue} onValueChange={(v) => setIssue(v as CampaignIssue)}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{CAMPAIGN_ISSUES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Keyword</label>
            <Select
              value={keyword}
              onValueChange={(v) => { setKeyword(v); if (ct === "Keyword Added" && v !== NEW_KEYWORD) setValue(""); }}
              disabled={keywordDisabled}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder={!showKeyword ? "N/A" : (!campaign ? "Pick campaign" : "Select")} />
              </SelectTrigger>
              <SelectContent>{keywordOptions.map((k) => <SelectItem key={k} value={k}>{k}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Value type</label>
            <Select value={valueMode} onValueChange={(v) => setValueMode(v as ValueMode)} disabled={valueModeDisabled}>
              <SelectTrigger className="mt-1"><SelectValue placeholder="Absolute / %" /></SelectTrigger>
              <SelectContent>{VALUE_MODES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="lg:col-span-1">
            <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">Value</label>
            <Input
              className="mt-1"
              value={valueDisabled ? "" : value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={valuePlaceholder()}
              disabled={valueDisabled}
            />
          </div>
          <div className={showValueMode ? "lg:col-span-3" : "lg:col-span-3"}>
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

      {importErrors.length > 0 && (
        <div className="rounded-md border border-rose-500/30 bg-rose-500/10 p-3">
          <div className="flex items-start justify-between gap-2">
            <div className="text-sm font-medium text-rose-700">Import issues ({importErrors.length})</div>
            <button className="text-rose-700 hover:opacity-70" onClick={() => setImportErrors([])} aria-label="Dismiss">
              <X size={14} />
            </button>
          </div>
          <ul className="mt-2 text-xs font-mono text-rose-700 space-y-0.5">
            {importErrors.slice(0, 10).map((e, i) => <li key={i}>• {e}</li>)}
            {importErrors.length > 10 && <li className="opacity-70">+{importErrors.length - 10} more</li>}
          </ul>
        </div>
      )}

      <PanelCard title={`Change log (${filtered.length})`}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] font-mono text-muted-foreground uppercase">From</label>
            <Input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="h-9 w-[140px]" />
            <label className="text-[11px] font-mono text-muted-foreground uppercase ml-1">To</label>
            <Input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="h-9 w-[140px]" />
            {(fromDate || toDate) && (
              <button
                className="text-[11px] text-muted-foreground hover:text-foreground underline"
                onClick={() => { setFromDate(""); setToDate(""); }}
              >
                Clear
              </button>
            )}
          </div>
          <div className="relative flex-1 min-w-[220px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search campaign, value, why, issue…" className="pl-8 h-9" />
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
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All change types</SelectItem>
              {CHANGE_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={fIssue} onValueChange={setFIssue}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All issues</SelectItem>
              {CAMPAIGN_ISSUES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={exportLog} className="ml-auto">
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
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
                <th className="p-2">Value type</th>
                <th className="p-2">Value</th>
                <th className="p-2">Issue</th>
                <th className="p-2">Why</th>
                <th className="p-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={10} className="p-6 text-center text-muted-foreground">No entries match your filters.</td></tr>
              ) : filtered.map((e) => (
                <tr key={e.id} className="border-t border-border hover:bg-muted/30">
                  <td className="p-2 font-mono text-xs text-muted-foreground whitespace-nowrap">{e.ts}</td>
                  <td className="p-2">{e.customer}</td>
                  <td className="p-2">{e.platform}</td>
                  <td className="p-2">{e.campaign}</td>
                  <td className="p-2"><Badge variant="outline" className={`${typeTone(e.changeType)} border`}>{e.changeType}</Badge></td>
                  <td className="p-2 font-mono text-xs text-muted-foreground">{e.valueMode}</td>
                  <td className="p-2 font-mono">{e.value}</td>
                  <td className="p-2"><Badge variant="outline">{e.issue}</Badge></td>
                  <td className="p-2 max-w-[280px] text-muted-foreground">{e.why}</td>
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
