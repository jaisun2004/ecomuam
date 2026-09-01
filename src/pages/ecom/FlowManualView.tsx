import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, Sparkles, Upload } from "lucide-react";
import { PLATFORM_CAMPAIGN_TYPES, buildCampaignName, citiesFor, currencyFor, limitsFor, platformDisplay, productsFor, walletBalance } from "@/lib/ecom-reference/platforms";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { useEcomCreate } from "./EcomCreateContext";
import { toast } from "sonner";

const FlowManualView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [platform, setPlatform] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);

  // form state
  const [brand, setBrand] = useState("");
  const [subCategory, setSubCategory] = useState("Biscuits");
  const [budgetType, setBudgetType] = useState("daily");
  const [budgetValue, setBudgetValue] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [skus, setSkus] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");

  const limits = platform ? limitsFor(platform) : null;
  const currency = platform ? currencyFor(platform) : null;
  const namePreview = useMemo(
    () => (platform && brand ? buildCampaignName({ brand, platform, target: cities[0] ?? "pan_india", action: typeId ?? "campaign" }) : ""),
    [platform, brand, cities, typeId],
  );

  const pickType = (p: string, t: string) => {
    setPlatform(p); setTypeId(t);
    setCities([]); setSkus([]);
  };

  const toggleIn = (list: string[], v: string, set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const create = () => {
    if (!platform) return;
    const row: BatchRow = {
      id: `manual-${Date.now()}`, row: 1,
      sub_category: subCategory, brand_name: brand, platform,
      campaign_name: namePreview, end_date: endDate, budget_type: budgetType,
      budget_value: budgetValue, cities: cities.join(", "), product_id: skus.join(", "),
      targeting_details: keywords, currency: currency ?? "", selected: true,
    };
    ec.setRows([row]);
    ec.setSource("manual");
    ec.setFileName(null);
    ec.runLive(); ec.runDeep();
    navigate("/ecom/campaigns/create/review");
  };

  /* ── Platform / type picker ── */
  if (!platform) {
    return (
      <div className="min-h-screen bg-background">
        <ManualHeader onBack={() => navigate("/ecom/campaigns/create")} />
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigate("/ecom/campaigns/create/ai")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-subtle bg-surface-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30">
            <Upload size={13} /> Have many campaigns? Upload the batch import sheet instead
          </button>
          {PLATFORM_CAMPAIGN_TYPES.map((p) => (
            <div key={p.platform}>
              <div className="flex items-center gap-2 mb-2.5">
                <h2 className="font-display font-bold text-sm text-foreground">{platformDisplay(p.platform)}</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-surface-3 text-muted-foreground">{p.types.length} Types</span>
                <span className="text-[10px] text-muted-foreground">{p.geo === "IN" ? "India · INR" : "UAE · AED"}</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {p.types.map((t) => (
                  <button key={t.id} onClick={() => pickType(p.platform, t.id)}
                    className="text-left p-4 rounded-xl border border-subtle bg-surface-2 hover:border-primary/40 hover:bg-surface-3 transition-all">
                    <p className="font-medium text-sm text-foreground">{t.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{t.description}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  /* ── Five-step form ── */
  const wallet = walletBalance(brand || "brand", platform);
  const after = wallet - (Number(budgetValue) || 0);

  return (
    <div className="min-h-screen bg-background">
      <ManualHeader onBack={() => setPlatform(null)} />
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <p className="text-xs text-muted-foreground">
          {platformDisplay(platform)} · {PLATFORM_CAMPAIGN_TYPES.find((p) => p.platform === platform)?.types.find((t) => t.id === typeId)?.title} · {currency}
        </p>

        {/* 1. Basics */}
        <Section n={1} title="Basics">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Brand name">
              <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Britannia"
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" />
            </Field>
            <Field label="Sub-category">
              <input value={subCategory} onChange={(e) => setSubCategory(e.target.value)}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" />
            </Field>
          </div>
          {namePreview && (
            <p className="mt-2 text-[11px] font-mono text-muted-foreground">
              Campaign name: <span className="text-primary">{namePreview}</span> ({namePreview.length} chars)
            </p>
          )}
        </Section>

        {/* 2. Products */}
        <Section n={2} title="Products">
          {productsFor(platform).length === 0 ? (
            <p className="text-[11px] text-sw-amber">Reference data unavailable for this platform — SKU codes will be validated as a warning, not a blocker.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {productsFor(platform).slice(0, 24).map((p) => (
                <button key={p.code} onClick={() => toggleIn(skus, p.code, setSkus)}
                  className={`px-2.5 py-1.5 rounded-lg text-[11px] font-mono border ${skus.includes(p.code) ? "border-primary bg-primary/15 text-primary" : "border-subtle bg-surface-2 text-foreground hover:border-primary/30"}`}
                  title={p.name}>
                  {p.name} · {p.code.slice(0, 10)}{p.code.length > 10 ? "…" : ""}
                </button>
              ))}
            </div>
          )}
          {limits?.sku_cap == null && <p className="mt-2 text-[10px] text-sw-amber">Limit not confirmed for this platform — SKU cap unchecked.</p>}
        </Section>

        {/* 3. Geography */}
        <Section n={3} title="Geography">
          <div className="flex flex-wrap gap-2">
            {citiesFor(platform).map((c) => (
              <button key={c.platformCity} onClick={() => toggleIn(cities, c.platformCity, setCities)}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] border ${cities.includes(c.platformCity) ? "border-primary bg-primary/15 text-primary" : "border-subtle bg-surface-2 text-foreground hover:border-primary/30"}`}
                title={`Geographical city: ${c.geoCity}`}>
                {c.platformCity}
                <span className="block text-[9px] text-muted-foreground">{c.geoCity}</span>
              </button>
            ))}
          </div>
        </Section>

        {/* 4. Budget */}
        <Section n={4} title="Budget">
          <div className="grid grid-cols-3 gap-3">
            <Field label="Budget type">
              <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                <option value="daily">Daily</option>
                <option value="total">Total</option>
              </select>
            </Field>
            <Field label={`Budget value (${currency ?? ""} — locked)`}>
              <input value={budgetValue} onChange={(e) => setBudgetValue(e.target.value.replace(/[^0-9]/g, ""))} placeholder={limits?.daily_budget_floor ? `min ${limits.daily_budget_floor}` : "amount"}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" />
            </Field>
            <Field label={budgetType === "total" ? "End date (required)" : "End date (optional)"}>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50" />
            </Field>
          </div>
          <p className="mt-2 text-[11px] font-mono text-muted-foreground">
            Wallet: {currency} {wallet.toLocaleString()} → after: <span className={after < 0 ? "text-sw-red" : "text-sw-green"}>{currency} {after.toLocaleString()}</span>
          </p>
        </Section>

        {/* 5. Targeting */}
        <Section n={5} title="Targeting">
          <Field label="Keywords — keyword:match_type:bid; separated">
            <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3}
              placeholder="digestive biscuits:exact:12; marie biscuit:phrase:9"
              className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm font-mono text-foreground outline-none focus:border-primary/50" />
          </Field>
          <p className="mt-1.5 text-[10px] text-muted-foreground">
            {limits?.bid_floor != null ? `Bid floor: ${limits.bid_floor}` : "Bid floor not confirmed for this platform."}
            {PLATFORM_CAMPAIGN_TYPES && platform === "Blinkit" ? " Blinkit ignores match types." : " Match types: exact | phrase | broad."}
          </p>
        </Section>

        <div className="flex justify-end gap-2 pb-10">
          <button onClick={() => setPlatform(null)} className="px-4 py-2 rounded-lg text-xs bg-surface-3 text-foreground">Back</button>
          <button
            onClick={() => {
              if (!brand.trim()) { toast.error("Brand name is required."); return; }
              if (!budgetValue) { toast.error("Budget value is required."); return; }
              create();
            }}
            className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Create campaign → Review
          </button>
        </div>
      </div>
    </div>
  );
};

const ManualHeader: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const navigate = useNavigate();
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-subtle bg-surface-1">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
          <PenLine size={15} className="text-muted-foreground" />
        </div>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-sm text-foreground">Create Campaign</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-surface-3 text-muted-foreground">Manual</span>
        </div>
      </div>
      <button onClick={() => navigate("/ecom/campaigns/create/ai")} className="flex items-center gap-1.5 text-[11px] text-primary hover:underline">
        <Sparkles size={12} /> Switch to AI-Guided
      </button>
    </div>
  );
};

const Section: React.FC<{ n: number; title: string; children: React.ReactNode }> = ({ n, title, children }) => (
  <div className="rounded-xl border border-subtle bg-surface-1 p-4">
    <h3 className="font-display font-bold text-sm text-foreground mb-3">
      <span className="text-primary font-mono mr-2">{n}.</span>{title}
    </h3>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="text-[11px] text-muted-foreground block mb-1">{label}</label>
    {children}
  </div>
);

export default FlowManualView;
