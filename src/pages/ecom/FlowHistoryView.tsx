import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, MapPin, Search } from "lucide-react";
import { HISTORICAL_CONFIG } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, currencySymbol, platformDisplay } from "@/lib/ecom-reference/platforms";
import { capabilityFor, asOfLabel } from "@/lib/ecom-reference/config";
import { checkReadiness, summariseReadiness } from "@/lib/ecom-readiness";
import EcomReadinessPill from "@/components/ecom/EcomReadinessPill";
import EcomCityPicker from "@/components/ecom/EcomCityPicker";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { useEcomCreate } from "./EcomCreateContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const MAX_COPIES = 20;

interface Edited {
  cities: string[];
  budgetType: string;
  budgetValue: string;
  endDate: string;
}

const FlowHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [confirming, setConfirming] = useState(false);
  const [stage, setStage] = useState<"pick" | "edit">("pick");
  const [edits, setEdits] = useState<Record<string, Edited>>({});
  const [capNotice, setCapNotice] = useState(false);

  const selected = ec.copySelection;
  const platforms = useMemo(() => [...new Set(HISTORICAL_CONFIG.map((h) => h.platform))], []);
  const filtered = HISTORICAL_CONFIG.filter(
    (h) => (platform === "all" || h.platform === platform) && h.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (name: string) => {
    if (selected.includes(name)) {
      ec.setCopySelection(selected.filter((n) => n !== name));
      setCapNotice(false);
      return;
    }
    if (selected.length >= MAX_COPIES) {
      setCapNotice(true);
      return;
    }
    ec.setCopySelection([...selected, name]);
  };

  const chosen = HISTORICAL_CONFIG.filter((h) => selected.includes(h.name));

  const editFor = (name: string): Edited => {
    const h = HISTORICAL_CONFIG.find((x) => x.name === name)!;
    return (
      edits[name] ?? {
        cities: h.cities.split(",").map((c) => c.trim()).filter(Boolean),
        budgetType: h.budgetType,
        budgetValue: String(h.budgetValue),
        endDate: "",
      }
    );
  };
  const setEdit = (name: string, patch: Partial<Edited>) =>
    setEdits((prev) => ({ ...prev, [name]: { ...editFor(name), ...patch } }));

  /** Every copied campaign is re-checked against today's data before it is offered. */
  const revalidated = chosen.map((h) => {
    const e = editFor(h.name);
    const prods = h.productIds.split(",").map((p) => p.trim()).filter(Boolean);
    const cap = capabilityFor(h.platform);
    const valid = citiesFor(h.platform);
    const goneCities = e.cities.filter(
      (c) => !valid.some((v) => v.platformCity.toLowerCase() === c.toLowerCase() || v.geoCity.toLowerCase() === c.toLowerCase()),
    );
    const checks = prods.flatMap((p) =>
      (cap.city_targeting ? e.cities : [null]).map((c) => checkReadiness({ code: p, platform: h.platform, city: c })),
    );
    const notReady = checks.filter((c) => c.state === "not_ready");
    const warned = checks.filter((c) => c.state === "warning" || c.state === "unknown");
    return { h, e, prods, goneCities, notReady, warned };
  });

  const missingEndDate = revalidated.filter((r) => r.e.budgetType === "total" && !r.e.endDate);

  const proceed = () => {
    const rows: BatchRow[] = revalidated.map(({ h, e }, i) => ({
      id: `hist-${i}`, row: i + 1,
      sub_category: "Biscuits",
      brand_name: h.name.split(" ")[0] ?? "",
      platform: h.platform,
      campaign_name: buildCampaignName({ brand: h.name.split(" ")[0] ?? "brand", platform: h.platform, target: e.cities[0] ?? "", action: "copy" }),
      end_date: e.endDate,
      budget_type: e.budgetType,
      budget_value: e.budgetValue,
      cities: e.cities.join(", "),
      product_id: h.productIds,
      targeting_details: h.targeting,
      currency: currencyFor(h.platform) ?? "",
      selected: true,
      origin: "copy" as const,
    }));
    ec.setFileName(null);
    ec.setSource("copy");
    ec.recheck(rows);
    setConfirming(false);
    navigate("/ecom/campaigns/create/review?from=copy");
  };

  /* ── Stage 2: edit the copies before review ── */
  if (stage === "edit") {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
          <button onClick={() => setStage("pick")} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display font-bold text-sm text-foreground">
              Check {chosen.length} campaign{chosen.length > 1 ? "s" : ""} before review
            </h1>
            <p className="text-[10px] text-muted-foreground">End dates are cleared on a copy. Cities and budgets can be changed here.</p>
          </div>
          <button onClick={() => setConfirming(true)} disabled={missingEndDate.length > 0}
            title={missingEndDate.length ? "A total budget needs an end date." : undefined}
            className="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
            Continue to review
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {revalidated.map(({ h, e, prods, notReady }) => {
              const cap = capabilityFor(h.platform);
              const symbol = currencySymbol(currencyFor(h.platform));
              const summary = summariseReadiness(
                { name: h.name, code: prods[0] ?? "", platform: h.platform },
                cap.city_targeting ? e.cities : [],
                h.name.split(" ")[0] ?? "brand",
              );
              return (
                <div key={h.name} className="rounded-xl border border-subtle bg-surface-1 p-4 space-y-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-sm text-foreground">{h.name}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-surface-3 text-muted-foreground">{platformDisplay(h.platform)}</span>
                    <span className="text-[10px] text-muted-foreground">{prods.length} {prods.length === 1 ? "product" : "products"}</span>
                    <span className="ml-auto"><EcomReadinessPill summary={summary} /></span>
                  </div>

                  {cap.city_targeting ? (
                    <EcomCityPicker platform={h.platform} value={e.cities} onChange={(c) => setEdit(h.name, { cities: c })} />
                  ) : (
                    <p className="text-[11px] text-muted-foreground">{platformDisplay(h.platform)} does not target cities.</p>
                  )}

                  <div className="grid grid-cols-3 gap-3">
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Budget type</span>
                      <select value={e.budgetType} onChange={(ev) => setEdit(h.name, { budgetType: ev.target.value })} className={inputCls}>
                        {cap.budget_types.map((b) => <option key={b} value={b}>{b === "daily" ? "Daily" : "Total"}</option>)}
                      </select>
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1">Budget ({symbol})</span>
                      <input value={e.budgetValue} onChange={(ev) => setEdit(h.name, { budgetValue: ev.target.value.replace(/[^0-9]/g, "") })} className={inputCls} />
                    </label>
                    <label className="block">
                      <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1">
                        End date {e.budgetType === "total" ? "(required)" : "(optional)"}
                      </span>
                      <input type="date" value={e.endDate} onChange={(ev) => setEdit(h.name, { endDate: ev.target.value })} className={inputCls} />
                    </label>
                  </div>

                  {notReady.length > 0 && (
                    <p className="text-[11px] text-sw-amber">{notReady.length} {notReady.length === 1 ? "city" : "cities"} cannot run today for the chosen products.</p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <ConfirmDialog open={confirming} onOpenChange={setConfirming} revalidated={revalidated} onProceed={proceed} />
      </div>
    );
  }

  /* ── Stage 1: pick the campaigns to copy ── */
  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
        <button onClick={() => navigate("/ecom/campaigns/create")} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
          <History size={15} className="text-primary" />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-foreground">Copy an existing campaign</h1>
          <p className="text-[10px] text-muted-foreground">Up to {MAX_COPIES} at a time · checked against today's data, as of {asOfLabel()}</p>
        </div>
        {selected.length > 0 && (
          <button onClick={() => setStage("edit")} className="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            Check {selected.length} campaign{selected.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-b border-subtle bg-surface-1 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns…"
            className="bg-surface-2 border border-subtle rounded-lg pl-8 pr-3 py-2 text-xs text-foreground w-64 outline-none focus:border-primary/50" />
        </div>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-xs text-foreground">
          <option value="all">All platforms</option>
          {platforms.map((p) => <option key={p} value={p}>{platformDisplay(p)}</option>)}
        </select>
        {selected.length > 0 && (
          <span className="text-[11px] text-muted-foreground">
            {selected.length} selected
            <button onClick={() => ec.setCopySelection([])} className="ml-2 underline hover:text-foreground">Clear</button>
          </span>
        )}
        {capNotice && <span className="text-[11px] text-sw-amber">You can copy {MAX_COPIES} campaigns at a time. Untick one to add another.</span>}
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 max-w-5xl">
        {filtered.map((h) => {
          const isSel = selected.includes(h.name);
          const cities = h.cities.split(",").map((c) => c.trim()).filter(Boolean);
          const prods = h.productIds.split(",").map((p) => p.trim()).filter(Boolean);
          const cap = capabilityFor(h.platform);
          const summary = prods.length
            ? summariseReadiness({ name: h.name, code: prods[0], platform: h.platform }, cap.city_targeting ? cities : [], h.name.split(" ")[0] ?? "brand")
            : undefined;
          return (
            <button key={h.name} onClick={() => toggle(h.name)}
              className={`text-left p-4 rounded-xl border transition-all ${isSel ? "border-primary bg-primary/10" : "border-subtle bg-surface-2 hover:border-primary/30"}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-display font-bold text-sm text-foreground truncate" title={h.name}>{h.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-3 text-muted-foreground flex-shrink-0">{platformDisplay(h.platform)}</span>
              </div>
              <div className="flex gap-3 text-[10px] font-mono text-muted-foreground mt-2">
                <span>{h.budgetType} · {h.budgetValue}</span>
                <span>{prods.length} {prods.length === 1 ? "product" : "products"}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                <MapPin size={10} />
                <span className="truncate">{cities.slice(0, 2).join(", ")}{cities.length > 2 ? ` +${cities.length - 2} more` : ""}</span>
              </div>
              {summary && <div className="mt-2"><EcomReadinessPill summary={summary} /></div>}
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-2 py-10 text-center">No past campaigns match that search.</p>}
      </div>
    </div>
  );
};

const inputCls = "w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50";

const ConfirmDialog: React.FC<{
  open: boolean;
  onOpenChange: (v: boolean) => void;
  revalidated: { h: { name: string }; e: Edited; prods: string[]; goneCities: string[]; notReady: unknown[]; warned: unknown[] }[];
  onProceed: () => void;
}> = ({ open, onOpenChange, revalidated, onProceed }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="bg-surface-1 border-border-visible max-w-lg">
      <DialogHeader>
        <DialogTitle className="text-sm">What changed since these last ran</DialogTitle>
        <DialogDescription className="text-[11px]">
          Copies are never sent as they were. Confirm each point below, then these campaigns go through the same checks as any other.
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-3 max-h-[300px] overflow-y-auto text-xs">
        {revalidated.map(({ h, e, goneCities, notReady, warned, prods }) => (
          <div key={h.name} className="rounded-lg border border-subtle p-3">
            <p className="text-foreground font-medium">{h.name}</p>
            <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
              <li>{e.endDate ? `Ends ${e.endDate}.` : "No end date set."}</li>
              <li>Budget {e.budgetType} {e.budgetValue}.</li>
              {goneCities.length > 0 && <li className="text-sw-amber">{goneCities.length} city name{goneCities.length > 1 ? "s are" : " is"} no longer in the list: {goneCities.join(", ")}.</li>}
              {notReady.length > 0 && <li className="text-sw-red">{notReady.length} {notReady.length === 1 ? "city" : "cities"} cannot run today for the chosen products.</li>}
              {warned.length > 0 && <li className="text-sw-amber">{warned.length} {warned.length === 1 ? "city needs" : "cities need"} a look.</li>}
              {goneCities.length === 0 && notReady.length === 0 && warned.length === 0 && <li>All {prods.length} {prods.length === 1 ? "product still looks" : "products still look"} fine.</li>}
            </ul>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={() => onOpenChange(false)} className="px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">Back</button>
        <button onClick={onProceed} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
          I have read this — continue to review
        </button>
      </div>
    </DialogContent>
  </Dialog>
);

export default FlowHistoryView;
