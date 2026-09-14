import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, Search } from "lucide-react";
import { HISTORICAL_CONFIG } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, currencySymbol, isInStock, platformDisplay, productName, stockExclusionLine } from "@/lib/ecom-reference/platforms";
import { capabilityFor, asOfLabel } from "@/lib/ecom-reference/config";
import { checkReadiness, summariseReadiness } from "@/lib/ecom-readiness";
import EcomReadinessPill from "@/components/ecom/EcomReadinessPill";
import EcomCityPicker from "@/components/ecom/EcomCityPicker";
import EcomStockNotice from "@/components/ecom/EcomStockNotice";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { useEcomCreate } from "@/pages/ecom/EcomCreateContext";

const MAX_COPIES = 20;
const DISPLAY_SPEND = [24800, 19600, 14200, 31800, 27600, 22400, 18900, 15600, 34200, 11800, 9600, 17400, 8200, 12600];
const DISPLAY_ROAS = [4.2, 3.8, 3.4, 4.6, 3.7, 4.1, 3.5, 4.4, 3.9, 3.2, 3.6, 4.0, 3.1, 3.7];

const runDates = (name: string) => {
  const match = name.match(/_(\d{4})(\d{2})(\d{2})_/);
  if (!match) return "—";
  const end = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  const start = new Date(end);
  start.setDate(start.getDate() - 29);
  const format = (date: Date) => date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  return `${format(start)} – ${format(end)}`;
};

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
    const oos = cap.city_targeting ? e.cities.filter((c) => !prods.some((p) => isInStock(p, c))) : [];
    const oosLines = oos.map((c) => stockExclusionLine(productName(prods[0] ?? "", h.platform), c, prods[0] ?? ""));
    return { h, e, prods, goneCities, notReady, warned, oos, oosLines };
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
          <button onClick={proceed} disabled={missingEndDate.length > 0}
            title={missingEndDate.length ? "A total budget needs an end date." : undefined}
            className="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
            Continue
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-3">
            {revalidated.map(({ h, e, prods, oos, oosLines }) => {
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
                    <EcomCityPicker platform={h.platform} value={e.cities} onChange={(c) => setEdit(h.name, { cities: c })} outOfStock={oos} />
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

                  <EcomStockNotice lines={oosLines} />
                </div>
              );
            })}
          </div>
        </div>
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
        <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
          <History size={15} className="text-muted-foreground" />
        </div>
        <h1 className="font-display font-bold text-sm text-foreground">Copy an existing campaign</h1>
        {selected.length > 0 && (
          <button onClick={() => setStage("edit")} className="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            Check {selected.length} campaign{selected.length > 1 ? "s" : ""}
          </button>
        )}
      </div>

      <div className="p-6 max-w-5xl mx-auto space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
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

        <div className="overflow-x-auto border-y border-subtle">
          <table className="w-full min-w-[1040px] text-[11px]">
            <thead>
              <tr className="border-b border-subtle bg-surface-2 text-muted-foreground">
                {['Campaign name', 'Platform', 'Dates it ran', 'SKUs targeted', 'Cities', 'Total spend', 'ROAS', 'Can be copied today'].map((label) => (
                  <th key={label} className="px-3 py-2 text-left font-medium">{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((h) => {
                const isSel = selected.includes(h.name);
                const cities = h.cities.split(",").map((c) => c.trim()).filter(Boolean);
                const prods = h.productIds.split(",").map((p) => p.trim()).filter(Boolean);
                const cap = capabilityFor(h.platform);
                const summary = prods.length
                  ? summariseReadiness({ name: productName(prods[0], h.platform), code: prods[0], platform: h.platform }, cap.city_targeting ? cities : [], h.name.split(" ")[0] ?? "brand")
                  : undefined;
                const index = HISTORICAL_CONFIG.indexOf(h);
                const symbol = currencySymbol(currencyFor(h.platform));
                const skuNames = prods.slice(0, 2).map((code) => productName(code, h.platform));
                return (
                  <tr key={h.name} onClick={() => toggle(h.name)} className={`border-b border-subtle last:border-b-0 cursor-pointer ${isSel ? "bg-primary/10" : "hover:bg-surface-2"}`}>
                    <td className="px-3 py-2.5 font-medium text-foreground max-w-56 truncate" title={h.name}>{h.name}</td>
                    <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{platformDisplay(h.platform)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{runDates(h.name)}</td>
                    <td className="px-3 py-2.5 text-muted-foreground max-w-48 truncate" title={skuNames.join(", ")}>{prods.length} · {skuNames.join(", ")}</td>
                    <td className="px-3 py-2.5 text-muted-foreground max-w-40 truncate" title={cities.join(", ")}>{cities.length} · {cities.slice(0, 2).join(", ")}</td>
                    <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">{symbol}{(DISPLAY_SPEND[index] ?? 12000).toLocaleString("en-IN")}</td>
                    <td className="px-3 py-2.5 font-mono text-foreground whitespace-nowrap">{(DISPLAY_ROAS[index] ?? 3.5).toFixed(1)}x</td>
                    <td className="px-3 py-2.5 text-foreground whitespace-nowrap">{summary?.state === "not_ready" ? "No" : "Yes"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-sm text-muted-foreground py-10 text-center">No past campaigns match that search.</p>}
        </div>
      </div>
    </div>
  );
};

const inputCls = "w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50";

export default FlowHistoryView;
