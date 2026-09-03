import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, Upload } from "lucide-react";
import EcomStepper from "@/components/ecom/EcomStepper";
import EcomReadinessPill from "@/components/ecom/EcomReadinessPill";
import {
  PLATFORM_CAMPAIGN_TYPES, buildCampaignName, citiesFor, currencyFor, currencySymbol,
  limitsFor, platformDisplay, productsFor, walletBalance,
} from "@/lib/ecom-reference/platforms";
import { OBJECTIVES, KPIS, OVERRIDE_REASONS, UNCONFIRMED_LINE, asOfLabel, bidUnitLabel, capabilityFor } from "@/lib/ecom-reference/config";
import { summariseReadiness } from "@/lib/ecom-readiness";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { useEcomCreate } from "./EcomCreateContext";

const STEPS = ["Platform", "Products", "Where", "Budget and timing", "Targeting", "Check"];

const FlowManualView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [step, setStep] = useState(0);
  const [platform, setPlatform] = useState<string | null>(null);
  const [typeId, setTypeId] = useState<string | null>(null);

  const [brand, setBrand] = useState("");
  const [subCategory, setSubCategory] = useState("Biscuits");
  const [objective, setObjective] = useState<string>(OBJECTIVES[2]);
  const [kpi, setKpi] = useState<string>(KPIS[0]);
  const [budgetType, setBudgetType] = useState("daily");
  const [budgetValue, setBudgetValue] = useState("");
  const [endDate, setEndDate] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [skus, setSkus] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");
  const [overrides, setOverrides] = useState<Record<string, string>>({});

  const cap = platform ? capabilityFor(platform) : null;
  const limits = platform ? limitsFor(platform) : null;
  const currency = platform ? currencyFor(platform) : null;
  const symbol = currencySymbol(currency);
  const cityNames = useMemo(() => (platform ? citiesFor(platform).map((c) => c.platformCity) : []), [platform]);

  const summaries = useMemo(
    () => (platform ? productsFor(platform).slice(0, 30).map((p) => summariseReadiness(p, cityNames, brand || "Britannia")) : []),
    [platform, cityNames, brand],
  );

  const namePreview = useMemo(
    () => (platform && brand ? buildCampaignName({ brand, platform, target: cities[0] ?? "pan_india", action: typeId ?? "campaign" }) : ""),
    [platform, brand, cities, typeId],
  );

  const toggleIn = (list: string[], v: string, set: (x: string[]) => void) =>
    set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const chosenSummaries = summaries.filter((s) => skus.includes(s.product.code));
  const warnedSkus = chosenSummaries.filter((s) => s.state === "warning" || s.state === "unknown");
  const blockedSkus = chosenSummaries.filter((s) => s.state === "not_ready");
  const needsOverride = warnedSkus.filter((s) => !overrides[s.product.code]);

  const create = () => {
    if (!platform) return;
    for (const s of warnedSkus) {
      if (overrides[s.product.code]) ec.addOverride(1, `${s.product.code} readiness`, overrides[s.product.code]);
    }
    const row: BatchRow = {
      id: `manual-${Date.now()}`, row: 1,
      sub_category: subCategory, brand_name: brand, platform,
      campaign_name: namePreview, end_date: endDate, budget_type: budgetType,
      budget_value: budgetValue,
      cities: cap?.city_targeting ? cities.join(", ") : "marketplace",
      product_id: skus.join(", "),
      targeting_details: keywords, currency: currency ?? "", selected: true,
    };
    ec.setSource("manual");
    ec.setFileName(null);
    ec.recheck([row]);
    navigate("/ecom/campaigns/create/review");
  };

  /* ── Platform and campaign type ── */
  if (!platform) {
    return (
      <div className="min-h-screen bg-background">
        <ManualHeader onBack={() => navigate("/ecom/campaigns/create")} />
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <button onClick={() => navigate("/ecom/campaigns/create/ai")}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-subtle bg-surface-2 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30">
            <Upload size={13} /> Many campaigns at once? Upload the batch sheet instead
          </button>
          {PLATFORM_CAMPAIGN_TYPES.map((p) => (
            <div key={p.platform}>
              <div className="flex items-center gap-2 mb-2.5">
                <h2 className="font-display font-bold text-sm text-foreground">{platformDisplay(p.platform)}</h2>
                <span className="text-[10px] text-muted-foreground">{p.geo === "IN" ? "India · INR" : "UAE · AED"}</span>
                {!capabilityFor(p.platform).can_push_api && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">Export only — no campaign API</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {p.types.map((t) => (
                  <button key={t.id} onClick={() => { setPlatform(p.platform); setTypeId(t.id); setStep(1); setCities([]); setSkus([]); }}
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

  const wallet = walletBalance(brand || "brand", platform);
  const after = wallet - (Number(budgetValue) || 0);

  return (
    <div className="min-h-screen bg-background">
      <ManualHeader onBack={() => (step > 1 ? setStep(step - 1) : setPlatform(null))} />
      <div className="p-6 max-w-3xl mx-auto space-y-5">
        <EcomStepper steps={STEPS} current={step} onGo={setStep} />
        <p className="text-xs text-muted-foreground">
          {platformDisplay(platform)} · {PLATFORM_CAMPAIGN_TYPES.find((p) => p.platform === platform)?.types.find((t) => t.id === typeId)?.title} ·{" "}
          {currency} · data as of {asOfLabel()}
        </p>

        {step >= 1 && (
          <Section title="Basics">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Brand name">
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Britannia" className={inputCls} />
              </Field>
              <Field label="Sub-category">
                <input value={subCategory} onChange={(e) => setSubCategory(e.target.value)} className={inputCls} />
              </Field>
              <Field label="Objective">
                <select value={objective} onChange={(e) => setObjective(e.target.value)} className={inputCls}>
                  {OBJECTIVES.map((o) => <option key={o}>{o}</option>)}
                </select>
              </Field>
              <Field label="Primary measure">
                <select value={kpi} onChange={(e) => setKpi(e.target.value)} className={inputCls}>
                  {KPIS.map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
            </div>
            {namePreview && (
              <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                Campaign name: <span className="text-primary">{namePreview}</span> ({namePreview.length} characters)
              </p>
            )}
          </Section>
        )}

        {step >= 1 && (
          <Section title="Products — readiness is shown before you pick">
            <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
              {summaries.map((s) => {
                const on = skus.includes(s.product.code);
                const unusable = s.state === "not_ready";
                return (
                  <div key={s.product.code} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${on ? "border-primary bg-primary/10" : "border-subtle bg-surface-2"}`}>
                    <input type="checkbox" checked={on} disabled={unusable} onChange={() => toggleIn(skus, s.product.code, setSkus)} className="accent-primary" />
                    <span className={`flex-1 min-w-0 text-xs truncate ${unusable ? "text-muted-foreground line-through" : "text-foreground"}`}>{s.product.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{s.product.code}</span>
                    <EcomReadinessPill summary={s} />
                  </div>
                );
              })}
              {summaries.length === 0 && (
                <p className="text-[11px] text-sw-amber">No product list for this platform, so readiness could not be checked. Nothing here is shown as ready.</p>
              )}
            </div>
            {limits?.sku_cap == null && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                No product cap is published for this platform, so we are not enforcing one. {UNCONFIRMED_LINE}
              </p>
            )}
          </Section>
        )}

        {step >= 2 && (
          <Section title="Where it runs">
            {cap?.city_targeting ? (
              <>
                <div className="flex flex-wrap gap-2">
                  {citiesFor(platform).map((c) => (
                    <button key={c.platformCity} onClick={() => toggleIn(cities, c.platformCity, setCities)}
                      className={`px-2.5 py-1.5 rounded-lg text-[11px] border ${cities.includes(c.platformCity) ? "border-primary bg-primary/15 text-primary" : "border-subtle bg-surface-2 text-foreground hover:border-primary/30"}`}>
                      {c.platformCity}
                      <span className="block text-[9px] text-muted-foreground">{c.geoCity}</span>
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-[10px] text-muted-foreground">
                  Targeting is city-wide. Individual dark stores cannot be included or excluded, so a city with partial stock still runs everywhere in that city.
                </p>
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                {platformDisplay(platform)} targets the whole marketplace. There is no city control here, so nothing to choose.
              </p>
            )}
          </Section>
        )}

        {step >= 3 && (
          <Section title="Budget and timing">
            <div className="grid grid-cols-3 gap-3">
              <Field label="Budget type">
                <select value={budgetType} onChange={(e) => setBudgetType(e.target.value)} className={inputCls}>
                  {(cap?.budget_types ?? ["daily", "total"]).map((b) => (
                    <option key={b} value={b}>{b === "daily" ? "Daily" : "Total"}</option>
                  ))}
                </select>
              </Field>
              <Field label={`Budget (${currency})`}>
                <input value={budgetValue} onChange={(e) => setBudgetValue(e.target.value.replace(/[^0-9]/g, ""))} className={inputCls} />
              </Field>
              <Field label={budgetType === "total" ? "End date (required for a total budget)" : "End date (optional)"}>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
              </Field>
            </div>
            <p className="mt-2 text-[11px] font-mono text-muted-foreground">
              Wallet {symbol}{wallet.toLocaleString()} → after this campaign {" "}
              <span className={after < 0 ? "text-sw-red" : "text-sw-green"}>{symbol}{after.toLocaleString()}</span>
            </p>
            {cap?.irreversible_fields.includes("budget_value") && (
              <p className="mt-1 text-[10px] text-sw-amber">
                On {platformDisplay(platform)} the budget cannot be lowered once the campaign is live. You would have to pause and rebuild it.
              </p>
            )}
          </Section>
        )}

        {step >= 4 && (
          <Section title="Targeting">
            <Field label={cap?.match_types_used ? "Keywords — keyword:match_type:bid, separated by ;" : "Keywords — keyword:bid, separated by ;"}>
              <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={3}
                placeholder={cap?.match_types_used ? "digestive biscuits:exact:12; marie biscuit:phrase:9" : "digestive biscuits:12; marie biscuit:9"}
                className={`${inputCls} font-mono`} />
            </Field>
            <p className="mt-1.5 text-[10px] text-muted-foreground">
              {bidUnitLabel(platform, symbol)}.{" "}
              {cap?.pays_full_bid
                ? "On this platform the winner pays their full bid, so raising a bid raises what you actually pay."
                : "You pay one increment above the next bid, not your full bid."}{" "}
              {cap?.match_types_used ? "Match types: exact, phrase, broad." : `${platformDisplay(platform)} does not use match types.`}
            </p>
          </Section>
        )}

        {step >= 5 && (
          <Section title="Before you continue">
            {blockedSkus.length > 0 && (
              <p className="text-[11px] text-sw-red mb-2">
                {blockedSkus.length} selected product{blockedSkus.length > 1 ? "s" : ""} cannot run at all. Remove them to continue.
              </p>
            )}
            {warnedSkus.length === 0 ? (
              <p className="text-[11px] text-muted-foreground">Nothing needs a reason from you.</p>
            ) : (
              <div className="space-y-2">
                {warnedSkus.map((s) => (
                  <div key={s.product.code} className="flex items-center gap-2">
                    <span className="text-[11px] text-foreground flex-1 min-w-0 truncate">{s.product.name}</span>
                    <EcomReadinessPill summary={s} compact />
                    <select
                      value={overrides[s.product.code] ?? ""}
                      onChange={(e) => setOverrides((o) => ({ ...o, [s.product.code]: e.target.value }))}
                      className="bg-surface-2 border border-subtle rounded-lg px-2 py-1 text-[11px] text-foreground"
                    >
                      <option value="">Pick a reason to run it anyway…</option>
                      {OVERRIDE_REASONS.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}

        <div className="flex justify-end gap-2 pb-10">
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              Continue
            </button>
          ) : (
            <button
              onClick={create}
              disabled={!brand || !skus.length || !budgetValue || blockedSkus.length > 0 || needsOverride.length > 0}
              title={
                blockedSkus.length
                  ? "Remove the products that cannot run."
                  : needsOverride.length
                    ? "Give a reason for each product with a warning."
                    : undefined
              }
              className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Check and review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const inputCls = "w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50";

const ManualHeader: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
    <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
      <ArrowLeft size={16} />
    </button>
    <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
      <PenLine size={15} className="text-muted-foreground" />
    </div>
    <h1 className="font-display font-bold text-sm text-foreground">Manual Campaign Entry</h1>
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-subtle bg-surface-1 p-4">
    <h2 className="font-display font-bold text-xs text-foreground mb-3">{title}</h2>
    {children}
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label className="block">
    <span className="block text-[10px] uppercase tracking-wide text-muted-foreground mb-1">{label}</span>
    {children}
  </label>
);

export default FlowManualView;
