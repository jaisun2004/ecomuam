import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, MapPin, Search } from "lucide-react";
import { HISTORICAL_CONFIG } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, platformDisplay } from "@/lib/ecom-reference/platforms";
import { capabilityFor, asOfLabel } from "@/lib/ecom-reference/config";
import { checkReadiness } from "@/lib/ecom-readiness";
import EcomReadinessPill from "@/components/ecom/EcomReadinessPill";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { useEcomCreate } from "./EcomCreateContext";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const FlowHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [confirming, setConfirming] = useState(false);

  const platforms = useMemo(() => [...new Set(HISTORICAL_CONFIG.map((h) => h.platform))], []);
  const filtered = HISTORICAL_CONFIG.filter(
    (h) => (platform === "all" || h.platform === platform) && h.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (i: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < 20) next.add(i);
      return next;
    });

  const chosen = filtered.filter((_, i) => selected.has(i));

  /** Every copied campaign is re-checked against today's data before it is offered. */
  const revalidated = chosen.map((h) => {
    const cities = h.cities.split(",").map((c) => c.trim()).filter(Boolean);
    const prods = h.productIds.split(",").map((p) => p.trim()).filter(Boolean);
    const cap = capabilityFor(h.platform);
    const valid = citiesFor(h.platform);
    const goneCities = cities.filter(
      (c) => !valid.some((v) => v.platformCity.toLowerCase() === c.toLowerCase() || v.geoCity.toLowerCase() === c.toLowerCase()),
    );
    const checks = prods.flatMap((p) =>
      (cap.city_targeting ? cities : [null]).map((c) => checkReadiness({ code: p, platform: h.platform, city: c })),
    );
    const notReady = checks.filter((c) => c.state === "not_ready");
    const warned = checks.filter((c) => c.state === "warning" || c.state === "unknown");
    return { h, cities, prods, goneCities, checks, notReady, warned };
  });

  const proceed = () => {
    const rows: BatchRow[] = revalidated.map(({ h }, i) => ({
      id: `hist-${i}`, row: i + 1,
      sub_category: "Biscuits",
      brand_name: h.name.split(" ")[0] ?? "",
      platform: h.platform,
      campaign_name: buildCampaignName({ brand: h.name.split(" ")[0] ?? "brand", platform: h.platform, target: h.cities.split(",")[0]?.trim() ?? "", action: "copy" }),
      end_date: "",
      budget_type: h.budgetType,
      budget_value: String(h.budgetValue),
      cities: h.cities,
      product_id: h.productIds,
      targeting_details: h.targeting,
      currency: currencyFor(h.platform) ?? "",
      selected: true,
    }));
    ec.setFileName(null);
    ec.setSource("copy");
    ec.recheck(rows);
    setConfirming(false);
    navigate("/ecom/campaigns/create/review?from=copy");
  };

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
          <p className="text-[10px] text-muted-foreground">Up to 20 at a time · checked against today's data, as of {asOfLabel()}</p>
        </div>
        {selected.size > 0 && (
          <button onClick={() => setConfirming(true)} className="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            Review {selected.size} cop{selected.size > 1 ? "ies" : "y"}
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
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 max-w-5xl">
        {filtered.map((h, i) => {
          const isSel = selected.has(i);
          const cities = h.cities.split(",").map((c) => c.trim()).filter(Boolean);
          const prods = h.productIds.split(",").map((p) => p.trim()).filter(Boolean);
          const cap = capabilityFor(h.platform);
          const firstCheck = prods.length
            ? checkReadiness({ code: prods[0], platform: h.platform, city: cap.city_targeting ? cities[0] ?? null : null })
            : undefined;
          return (
            <button key={i} onClick={() => toggle(i)}
              className={`text-left p-4 rounded-xl border transition-all ${isSel ? "border-primary bg-primary/10" : "border-subtle bg-surface-2 hover:border-primary/30"}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="font-display font-bold text-sm text-foreground truncate" title={h.name}>{h.name}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-3 text-muted-foreground flex-shrink-0">{platformDisplay(h.platform)}</span>
              </div>
              <div className="flex gap-3 text-[10px] font-mono text-muted-foreground mt-2">
                <span>{h.budgetType} · {h.budgetValue}</span>
                <span>{prods.length} SKUs</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                <MapPin size={10} />
                <span className="truncate">{cities.slice(0, 2).join(", ")}{cities.length > 2 ? ` +${cities.length - 2} more` : ""}</span>
              </div>
              {firstCheck && <div className="mt-2"><EcomReadinessPill check={firstCheck} /></div>}
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-2 py-10 text-center">No past campaigns match that search.</p>}
      </div>

      {/* Confirm what has changed since the original ran */}
      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent className="bg-surface-1 border-border-visible max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">What changed since these last ran</DialogTitle>
            <DialogDescription className="text-[11px]">
              Copies are never pushed as they were. Confirm each point below, then the batch goes through the same checks as any other.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[300px] overflow-y-auto text-xs">
            {revalidated.map(({ h, goneCities, notReady, warned, prods }) => (
              <div key={h.name} className="rounded-lg border border-subtle p-3">
                <p className="text-foreground font-medium">{h.name}</p>
                <ul className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                  <li>End date cleared — set a new one before pushing.</li>
                  <li>Budget carried over as {h.budgetType} {h.budgetValue}.</li>
                  {goneCities.length > 0 && <li className="text-sw-amber">{goneCities.length} city name{goneCities.length > 1 ? "s are" : " is"} no longer in the list: {goneCities.join(", ")}.</li>}
                  {notReady.length > 0 && <li className="text-sw-red">{notReady.length} product-city pairs cannot run today.</li>}
                  {warned.length > 0 && <li className="text-sw-amber">{warned.length} product-city pairs need a look.</li>}
                  {goneCities.length === 0 && notReady.length === 0 && warned.length === 0 && <li>All {prods.length} products still look fine.</li>}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setConfirming(false)} className="px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">Back</button>
            <button onClick={proceed} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              I have read this — continue to review
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FlowHistoryView;
