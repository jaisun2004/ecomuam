import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, PenLine, Search, Sparkles, X } from "lucide-react";
import EcomStepper from "@/components/ecom/EcomStepper";
import EcomReadinessPill from "@/components/ecom/EcomReadinessPill";
import EcomRecoCard from "@/components/ecom/EcomRecoCard";
import EcomCityPicker from "@/components/ecom/EcomCityPicker";
import { recommendationsForSku, type RecoStep } from "@/lib/ecom-qc/recommendations";
import {
  PLATFORM_CAMPAIGN_TYPES, buildCampaignName, citiesFor, currencyFor, currencySymbol,
  isInStock, limitsFor, platformDisplay, productsFor, walletBalance,
} from "@/lib/ecom-reference/platforms";
import { UNCONFIRMED_LINE, asOfLabel, bidUnitLabel, capabilityFor } from "@/lib/ecom-reference/config";
import { summariseReadiness } from "@/lib/ecom-readiness";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { EMPTY_MANUAL_DRAFT, useEcomCreate } from "./EcomCreateContext";

const STEPS = ["Platform", "Products", "Where", "Budget and timing", "Targeting", "Check"];

const PURPOSE = [
  "Pick where the campaign runs and what kind of campaign it is.",
  "Name the brand and choose the products.",
  "Choose the cities this campaign should run in.",
  "Set how much it spends and for how long.",
  "Add the keywords and what you are willing to bid.",
  "Everything you chose, in one place, before it goes to review.",
];

const FlowManualView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const d = ec.manualDraft;
  const set = <K extends keyof typeof d>(k: K, v: (typeof d)[K]) => ec.setManualDraft((p) => ({ ...p, [k]: v }));
  const [productQuery, setProductQuery] = useState("");

  const step = d.step;
  const setStep = (n: number) => ec.setManualDraft((p) => ({ ...p, step: n }));
  const platform = d.platform;

  const cap = platform ? capabilityFor(platform) : null;
  const limits = platform ? limitsFor(platform) : null;
  const currency = platform ? currencyFor(platform) : null;
  const symbol = currencySymbol(currency);
  const cityNames = useMemo(() => (platform ? citiesFor(platform).map((c) => c.platformCity) : []), [platform]);

  const summaries = useMemo(
    () => (platform ? productsFor(platform).slice(0, 30).map((p) => summariseReadiness(p, cityNames, d.brand || "Britannia")) : []),
    [platform, cityNames, d.brand],
  );

  const autoName = useMemo(
    () => (platform && d.brand ? buildCampaignName({ brand: d.brand, platform, target: d.cities[0] ?? "pan_india", action: d.typeId ?? "campaign" }) : ""),
    [platform, d.brand, d.cities, d.typeId],
  );
  const campaignName = d.nameEdited && d.campaignName ? d.campaignName : autoName;

  const chosenSummaries = summaries.filter((s) => d.skus.includes(s.product.code));

  /** Cities where no chosen product is in stock — tagged in the picker, never blocked. */
  const oosCities = useMemo(
    () => (d.skus.length ? cityNames.filter((c) => !d.skus.some((code) => isInStock(code, c))) : []),
    [d.skus, cityNames],
  );

  const recos = useMemo(
    () => chosenSummaries.flatMap((s) => recommendationsForSku(s.product)).filter((r) => !d.dismissed.includes(r.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [d.skus.join(","), d.dismissed.join(",")],
  );

  const RecoPanel: React.FC<{ forStep: RecoStep }> = ({ forStep }) => {
    const list = recos.filter((r) => r.step === forStep);
    if (!list.length) return null;
    return (
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-subtle flex items-center justify-between">
          <p className="text-xs font-medium text-foreground">{list.length} suggestion{list.length > 1 ? "s" : ""}</p>
          <p className="text-[10px] text-muted-foreground">Data as of {asOfLabel()}</p>
        </div>
        <div className="divide-y divide-subtle">
          {list.map((r) => (
            <EcomRecoCard
              key={r.id}
              reco={r}
              selected={false}
              onToggle={() => {
                if (r.evidence.type === "cities") set("cities", r.evidence.inStock.slice(0, 4));
                if (r.kind === "keywords") set("keywords", r.draft.targeting_details);
                ec.setManualDraft((p) => ({ ...p, dismissed: [...p.dismissed, r.id] }));
              }}
              onDismiss={() => ec.setManualDraft((p) => ({ ...p, dismissed: [...p.dismissed, r.id] }))}
            />
          ))}
        </div>
      </div>
    );
  };

  const blockedSkus = chosenSummaries.filter((s) => s.state === "not_ready");
  const warnedSkus = chosenSummaries.filter((s) => s.state === "warning" || s.state === "unknown");

  const hasDraft = !!(d.brand || d.skus.length || d.budgetValue || d.cities.length);

  const leaveFlow = () => {
    if (hasDraft && !window.confirm("Leave this campaign? What you have filled in will be discarded.")) return;
    ec.setManualDraft(EMPTY_MANUAL_DRAFT);
    navigate("/ecom/campaigns/create");
  };

  const toAi = () => {
    if (hasDraft && !window.confirm("Switch to AI guided? What you have filled in here will not be carried over.")) return;
    navigate("/ecom/campaigns/create/ai");
  };

  const create = () => {
    if (!platform) return;
    const row: BatchRow = {
      id: `manual-${Date.now()}`, row: 1,
      sub_category: d.subCategory, brand_name: d.brand, platform,
      campaign_name: campaignName, end_date: d.endDate, budget_type: d.budgetType,
      budget_value: d.budgetValue,
      cities: cap?.city_targeting ? d.cities.join(", ") : "marketplace",
      product_id: d.skus.join(", "),
      targeting_details: d.keywords, currency: currency ?? "", selected: true,
    };
    ec.setSource("manual");
    ec.setFileName(null);
    ec.recheck([row]);
    navigate("/ecom/campaigns/create/review");
  };

  /* ── Step 0: platform and campaign type ── */
  if (step === 0 || !platform) {
    return (
      <div className="min-h-screen bg-background">
        <ManualHeader onBack={leaveFlow} onAi={toAi} />
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div>
            <EcomStepper steps={STEPS} current={0} onGo={setStep} />
            <p className="text-xs text-muted-foreground mt-3">{PURPOSE[0]}</p>
          </div>
          {PLATFORM_CAMPAIGN_TYPES.map((p) => (
            <div key={p.platform}>
              <div className="flex items-center gap-2 mb-2.5">
                <h2 className="font-display font-bold text-sm text-foreground">{platformDisplay(p.platform)}</h2>
                <span className="text-[10px] text-muted-foreground">{p.geo === "IN" ? "India · INR" : "UAE · AED"}</span>
                {!capabilityFor(p.platform).can_push_api && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">Campaigns go live once the file is uploaded in the console</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {p.types.map((t) => {
                  const on = platform === p.platform && d.typeId === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() =>
                        ec.setManualDraft((prev) => ({
                          ...prev,
                          platform: p.platform,
                          typeId: t.id,
                          step: 1,
                          cities: prev.platform === p.platform ? prev.cities : [],
                          skus: prev.platform === p.platform ? prev.skus : [],
                        }))
                      }
                      className={`text-left p-4 rounded-xl border transition-all ${on ? "border-primary bg-primary/10" : "border-subtle bg-surface-2 hover:border-primary/40 hover:bg-surface-3"}`}
                    >
                      <p className="font-medium text-sm text-foreground">{t.title}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">{t.description}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const wallet = walletBalance(d.brand || "brand", platform);
  const after = wallet - (Number(d.budgetValue) || 0);
  const typeTitle = PLATFORM_CAMPAIGN_TYPES.find((p) => p.platform === platform)?.types.find((t) => t.id === d.typeId)?.title ?? "";

  const productResults = summaries.filter(
    (s) => !productQuery || s.product.name.toLowerCase().includes(productQuery.toLowerCase()) || s.product.code.includes(productQuery),
  );

  /* what blocks Continue on the current step */
  const blockReason = (() => {
    if (step === 1) {
      if (!d.brand.trim()) return "Enter the brand name.";
      if (!d.skus.length) return "Pick at least one product.";
      if (blockedSkus.length) return "Remove the products that cannot run.";
    }
    if (step === 2 && cap?.city_targeting && !d.cities.length) return "Pick at least one city.";
    if (step === 3) {
      if (!d.budgetValue) return "Enter a budget.";
      if (d.budgetType === "total" && !d.endDate) return "A total budget needs an end date.";
    }
    if (step === 4 && !d.keywords.trim()) return "Add at least one keyword and bid.";
    if (step === 5 && blockedSkus.length) return "Remove the products that cannot run.";
    return null;
  })();

  const back = () => setStep(step - 1);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <ManualHeader onBack={back} onAi={toAi} />

      <div className="px-4 py-4 border-b border-subtle bg-surface-1">
        <div className="max-w-2xl mx-auto">
          <EcomStepper steps={STEPS} current={step} onGo={setStep} />
          <h2 className="font-display font-bold text-base text-foreground mt-3">{STEPS[step]}</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{PURPOSE[step]}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-28">
        <div className="max-w-2xl mx-auto space-y-5">
          {step === 1 && (
            <>
              <Section title="Basics">
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Brand name">
                    <input value={d.brand} onChange={(e) => set("brand", e.target.value)} placeholder="e.g. Britannia" className={inputCls} />
                  </Field>
                  <Field label="Sub-category">
                    <input value={d.subCategory} onChange={(e) => set("subCategory", e.target.value)} className={inputCls} />
                  </Field>
                </div>
                <div className="mt-3">
                  <Field label="Campaign name">
                    <input
                      value={campaignName}
                      onChange={(e) => ec.setManualDraft((p) => ({ ...p, campaignName: e.target.value, nameEdited: true }))}
                      placeholder="Filled in for you once you name the brand"
                      className={`${inputCls} font-mono text-[12px]`}
                    />
                  </Field>
                  {d.nameEdited && (
                    <button onClick={() => ec.setManualDraft((p) => ({ ...p, nameEdited: false, campaignName: "" }))}
                      className="mt-1 text-[10px] text-primary hover:underline">
                      Use the standard name again
                    </button>
                  )}
                </div>
              </Section>

              <Section title="Products">
                <div className="relative mb-2">
                  <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input value={productQuery} onChange={(e) => setProductQuery(e.target.value)} placeholder="Search products by name or code…"
                    className={`${inputCls} pl-8`} />
                </div>
                {d.skus.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {d.skus.map((code) => (
                      <span key={code} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] bg-primary/10 text-primary border border-primary/30">
                        {summaries.find((s) => s.product.code === code)?.product.name ?? code}
                        <button onClick={() => set("skus", d.skus.filter((x) => x !== code))} aria-label={`Remove ${code}`}>
                          <X size={10} />
                        </button>
                      </span>
                    ))}
                    <button onClick={() => set("skus", [])} className="text-[10px] text-muted-foreground hover:text-foreground underline">Clear all</button>
                  </div>
                )}
                <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                  {productResults.map((s) => {
                    const on = d.skus.includes(s.product.code);
                    const unusable = s.state === "not_ready";
                    return (
                      <div key={s.product.code} className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border ${on ? "border-primary bg-primary/10" : "border-subtle bg-surface-2"}`}>
                        <input type="checkbox" checked={on} disabled={unusable}
                          onChange={() => set("skus", on ? d.skus.filter((x) => x !== s.product.code) : [...d.skus, s.product.code])}
                          className="accent-primary" />
                        <span className={`flex-1 min-w-0 text-xs truncate ${unusable ? "text-muted-foreground line-through" : "text-foreground"}`}>{s.product.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{s.product.code}</span>
                        <EcomReadinessPill summary={s} />
                      </div>
                    );
                  })}
                  {summaries.length === 0 && (
                    <p className="text-[11px] text-sw-amber">No product list for this platform, so readiness could not be checked. Nothing here is shown as ready.</p>
                  )}
                  {summaries.length > 0 && productResults.length === 0 && (
                    <p className="text-[11px] text-muted-foreground">No product matches that search.</p>
                  )}
                </div>
                {limits?.sku_cap == null && (
                  <p className="mt-2 text-[10px] text-muted-foreground">
                    No product cap is published for this platform, so we are not enforcing one. {UNCONFIRMED_LINE}
                  </p>
                )}
              </Section>

              <RecoPanel forStep="products" />
            </>
          )}

          {step === 2 && (
            <>
              <Section title="Where it runs">
                {cap?.city_targeting ? (
                  <>
                    <EcomCityPicker platform={platform} value={d.cities} onChange={(c) => set("cities", c)} outOfStock={oosCities} />
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      Targeting is city-wide. Individual dark stores cannot be included or excluded, so a city with partial stock still runs everywhere in that city.
                    </p>
                  </>
                ) : cap?.store_code_targeting ? (
                  <p className="text-[11px] text-muted-foreground">
                    {platformDisplay(platform)} targets store codes, not cities. The store list comes from the platform console.
                  </p>
                ) : (
                  <p className="text-[11px] text-muted-foreground">
                    {platformDisplay(platform)} targets the whole marketplace. There is no city control here, so nothing to choose.
                  </p>
                )}
              </Section>
              <RecoPanel forStep="cities" />
            </>
          )}

          {step === 3 && (
            <Section title="Budget and timing">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Budget type">
                  <select value={d.budgetType} onChange={(e) => set("budgetType", e.target.value)} className={inputCls}>
                    {(cap?.budget_types ?? ["daily", "total"]).map((b) => (
                      <option key={b} value={b}>{b === "daily" ? "Daily" : "Total"}</option>
                    ))}
                  </select>
                </Field>
                <Field label={`Budget (${currency})`}>
                  <input value={d.budgetValue} onChange={(e) => set("budgetValue", e.target.value.replace(/[^0-9]/g, ""))} className={inputCls} />
                </Field>
                <Field label={d.budgetType === "total" ? "End date (required for a total budget)" : "End date (optional)"}>
                  <input type="date" value={d.endDate} onChange={(e) => set("endDate", e.target.value)} className={inputCls} />
                </Field>
              </div>
              <p className="mt-2 text-[11px] font-mono text-muted-foreground">
                Wallet {symbol}{wallet.toLocaleString()} → after this campaign{" "}
                <span className={after < 0 ? "text-sw-red" : "text-sw-green"}>{symbol}{after.toLocaleString()}</span>
              </p>
              {cap?.irreversible_fields.includes("budget_value") && (
                <p className="mt-1 text-[10px] text-sw-amber">
                  On {platformDisplay(platform)} the budget cannot be lowered once the campaign is live. You would have to pause and rebuild it.
                </p>
              )}
            </Section>
          )}

          {step === 4 && (
            <>
              <Section title="Targeting">
                <Field label={cap?.match_types_used ? "Keywords — keyword:match_type:bid, separated by ;" : "Keywords — keyword:bid, separated by ;"}>
                  <textarea value={d.keywords} onChange={(e) => set("keywords", e.target.value)} rows={4}
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
              <RecoPanel forStep="targeting" />
            </>
          )}

          {step === 5 && (
            <Section title="What you chose">
              <div className="divide-y divide-subtle">
                <SummaryRow label="Platform" value={`${platformDisplay(platform)} · ${typeTitle}`} onEdit={() => setStep(0)} />
                <SummaryRow label="Brand" value={`${d.brand || "—"} · ${d.subCategory}`} onEdit={() => setStep(1)} />
                <SummaryRow label="Campaign name" value={campaignName || "—"} mono onEdit={() => setStep(1)} />
                <SummaryRow label="Products" value={d.skus.length ? d.skus.join(", ") : "—"} mono onEdit={() => setStep(1)} />
                <SummaryRow
                  label="Where"
                  value={cap?.city_targeting ? (d.cities.length ? d.cities.join(", ") : "—") : "Whole marketplace"}
                  onEdit={() => setStep(2)}
                />
                <SummaryRow
                  label="Budget"
                  value={`${d.budgetType === "daily" ? "Daily" : "Total"} ${symbol}${Number(d.budgetValue || 0).toLocaleString()}${d.endDate ? ` · ends ${d.endDate}` : ""}`}
                  onEdit={() => setStep(3)}
                />
                <SummaryRow label="Keywords" value={d.keywords || "—"} mono onEdit={() => setStep(4)} />
              </div>
              {warnedSkus.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {warnedSkus.map((s) => (
                    <div key={s.product.code} className="flex items-center gap-2">
                      <span className="text-[11px] text-foreground flex-1 min-w-0 truncate">{s.product.name}</span>
                      <EcomReadinessPill summary={s} compact />
                    </div>
                  ))}
                </div>
              )}
            </Section>
          )}
        </div>
      </div>

      {/* Sticky footer */}
      <div className="border-t border-subtle bg-surface-1 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <p className="text-[10px] text-muted-foreground flex-1 min-w-0 truncate">
            {platformDisplay(platform)} · {typeTitle} · {currency} · data as of {asOfLabel()}
            {blockReason && <span className="text-sw-amber"> · {blockReason}</span>}
          </p>
          <button onClick={back} className="px-4 py-2 rounded-lg text-xs font-medium border border-subtle bg-surface-2 text-foreground hover:bg-surface-3">
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!!blockReason} title={blockReason ?? undefined}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
              Continue
            </button>
          ) : (
            <button onClick={create} disabled={!!blockReason} title={blockReason ?? undefined}
              className="px-5 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed">
              Check and review
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const inputCls = "w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50";

const ManualHeader: React.FC<{ onBack: () => void; onAi: () => void }> = ({ onBack, onAi }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
    <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
      <ArrowLeft size={16} />
    </button>
    <div className="w-8 h-8 rounded-lg bg-surface-3 flex items-center justify-center">
      <PenLine size={15} className="text-muted-foreground" />
    </div>
    <h1 className="font-display font-bold text-sm text-foreground">Manual Campaign Entry</h1>
    <button onClick={onAi} className="ml-auto flex items-center gap-1.5 text-[11px] text-sw-purple hover:underline">
      <Sparkles size={12} /> Switch to AI guided
    </button>
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

const SummaryRow: React.FC<{ label: string; value: string; mono?: boolean; onEdit: () => void }> = ({ label, value, mono, onEdit }) => (
  <div className="flex items-start gap-3 py-2">
    <span className="text-[10px] uppercase tracking-wide text-muted-foreground w-28 flex-shrink-0 pt-0.5">{label}</span>
    <span className={`flex-1 min-w-0 text-xs text-foreground break-words ${mono ? "font-mono text-[11px]" : ""}`}>{value}</span>
    <button onClick={onEdit} className="text-[10px] text-primary hover:underline flex-shrink-0">Edit</button>
  </div>
);

export default FlowManualView;
