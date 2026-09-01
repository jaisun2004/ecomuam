import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, History, MapPin, Search } from "lucide-react";
import { HISTORICAL_CONFIG } from "@/lib/ecom-reference/workbook-data";
import { buildCampaignName, citiesFor, currencyFor, isInStock, platformDisplay, productsFor } from "@/lib/ecom-reference/platforms";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { useEcomCreate } from "./EcomCreateContext";

const FlowHistoryView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const platforms = useMemo(() => [...new Set(HISTORICAL_CONFIG.map((h) => h.platform))], []);
  const filtered = HISTORICAL_CONFIG.filter((h) =>
    (platform === "all" || h.platform === platform) &&
    h.name.toLowerCase().includes(search.toLowerCase()),
  );

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else if (next.size < 20) next.add(i);
      return next;
    });
  };

  const proceed = () => {
    const chosen = filtered.filter((_, i) => selected.has(i));
    if (!chosen.length) return;
    const rows: BatchRow[] = chosen.map((h, i) => {
      const firstCity = h.cities.split(",")[0]?.trim() ?? "";
      return {
        id: `hist-${i}`, row: i + 1,
        sub_category: "Biscuits",
        brand_name: h.name.split(" ")[0] ?? "",
        platform: h.platform,
        campaign_name: buildCampaignName({ brand: h.name.split(" ")[0] ?? "brand", platform: h.platform, target: firstCity, action: "copy" }),
        end_date: "", // cleared deliberately — must be re-confirmed
        budget_type: h.budgetType,
        budget_value: String(h.budgetValue),
        cities: h.cities,
        product_id: h.productIds,
        targeting_details: h.targeting,
        currency: currencyFor(h.platform) ?? "",
        selected: true,
      };
    });
    ec.setRows(rows);
    ec.setFileName(null);
    ec.setSource("copy");
    ec.runLive(); ec.runDeep();
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
          <h1 className="font-display font-bold text-sm text-foreground">Select a Campaign to Copy</h1>
          <p className="text-[10px] text-muted-foreground">Up to 20 campaigns — they land together on Review & Push</p>
        </div>
        {selected.size > 0 && (
          <button onClick={proceed} className="ml-auto px-4 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            Copy {selected.size} campaign{selected.size > 1 ? "s" : ""} →
          </button>
        )}
      </div>

      <div className="px-4 py-3 border-b border-subtle bg-surface-1 flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search campaigns…"
            className="bg-surface-2 border border-subtle rounded-lg pl-8 pr-3 py-2 text-xs text-foreground w-64 outline-none focus:border-primary/50" />
        </div>
        <select value={platform} onChange={(e) => setPlatform(e.target.value)}
          className="bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-xs text-foreground">
          <option value="all">All Platforms</option>
          {platforms.map((p) => <option key={p} value={p}>{platformDisplay(p)}</option>)}
        </select>
      </div>

      <div className="p-4 grid grid-cols-2 gap-3 max-w-5xl">
        {filtered.map((h, i) => {
          const isSel = selected.has(i);
          const cities = h.cities.split(",").map((c) => c.trim()).filter(Boolean);
          const prods = h.productIds.split(",").map((p) => p.trim()).filter(Boolean);
          const validCities = citiesFor(h.platform);
          const cityOk = cities.filter((c) => validCities.some((v) => v.platformCity.toLowerCase() === c.toLowerCase() || v.geoCity.toLowerCase() === c.toLowerCase())).length;
          const inStock = prods.filter((p) => isInStock(p, cities[0] ?? "")).length;
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
                <span className={inStock < prods.length ? "text-sw-amber" : ""}>{inStock}/{prods.length} in stock</span>
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-[10px] text-muted-foreground">
                <MapPin size={10} />
                <span className="truncate">
                  {cities.slice(0, 2).join(", ")}{cities.length > 2 ? ` +${cities.length - 2} more` : ""}
                </span>
                {cityOk < cities.length && <span className="text-sw-amber font-mono">· {cities.length - cityOk} cities to revalidate</span>}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <p className="text-sm text-muted-foreground col-span-2 py-10 text-center">No historical campaigns match.</p>}
      </div>

      {selected.size > 0 && (
        <div className="sticky bottom-0 px-4 py-3 bg-surface-1 border-t border-subtle flex items-center justify-between">
          <p className="text-[11px] text-sw-amber">Check these before you push: end dates are cleared, budgets carried over, and cities/SKUs revalidated against current reference data.</p>
          <button onClick={proceed} className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
            Continue to Review →
          </button>
        </div>
      )}
    </div>
  );
};

export default FlowHistoryView;
