import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Megaphone } from "lucide-react";

/** Platforms the app can launch on, and how they target. */
export const MODAL_PLATFORMS: { name: string; slug: string; mode: TargetingMode; currency: "INR" | "AED" }[] = [
  { name: "Blinkit", slug: "Blinkit", mode: "city", currency: "INR" },
  { name: "Zepto", slug: "Zepto_app", mode: "city", currency: "INR" },
  { name: "Instamart", slug: "Instamart_app", mode: "city", currency: "INR" },
  { name: "BigBasket", slug: "BigBasket", mode: "city", currency: "INR" },
  { name: "Noon Minutes", slug: "noon_minutes_uae_app", mode: "city", currency: "AED" },
  { name: "Talabat Mart", slug: "talabat_mart_uae", mode: "city", currency: "AED" },
  { name: "Carrefour Now", slug: "carrefour_now_uae", mode: "city", currency: "AED" },
  { name: "Amazon India", slug: "amazonin", mode: "country", currency: "INR" },
  { name: "Amazon AE", slug: "amazonae", mode: "country", currency: "AED" },
];

export type TargetingMode = "city" | "country";

export const MATCH_TYPES = ["Exact", "Phrase", "Broad"] as const;
export type MatchType = (typeof MATCH_TYPES)[number];

export interface CampaignPrefill {
  reviewTitle?: string;
  campaignName?: string;
  platform?: string;
  sku?: string;
  targetingMode?: TargetingMode;
  cities?: string[];
  countries?: string[];
  keywords?: string[];
  bids?: number[];
  dailyBudget?: number;
  duration?: string;
  contextLine?: string;
}

export interface CampaignDraft {
  campaignName: string;
  platform: string;
  sku: string;
  targetingMode: TargetingMode;
  locations: string[];
  keywords: { kw: string; matchType: MatchType; bid: number }[];
  dailyBudget: number | "";
  duration: string;
}

function platformOf(name: string) {
  return MODAL_PLATFORMS.find((p) => p.name === name || p.slug === name);
}

const label = "text-[10px] text-muted-foreground uppercase tracking-wide mb-1";
const field = "w-full px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-xs";
const readOnlyText = "text-xs text-foreground font-mono py-1";
const warn = "text-[10px] text-sw-amber mt-1";

const CampaignCreateModal: React.FC<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: CampaignPrefill;
  onConfirm: (draft: CampaignDraft) => void;
}> = ({ open, onOpenChange, prefill, onConfirm }) => {
  const initial = React.useCallback((): CampaignDraft => {
    const platform = prefill?.platform ?? "";
    const mode = platformOf(platform)?.mode ?? prefill?.targetingMode ?? "city";
    const kws = prefill?.keywords ?? [];
    const locations = mode === "country" ? prefill?.countries ?? [] : prefill?.cities ?? [];
    return {
      campaignName: prefill?.campaignName ?? "",
      platform,
      sku: prefill?.sku ?? "",
      targetingMode: mode,
      locations: [...locations],
      keywords: kws.map((kw, i) => ({ kw, matchType: "Exact" as MatchType, bid: prefill?.bids?.[i] ?? 0 })),
      dailyBudget: prefill?.dailyBudget ?? 1000,
      duration: prefill?.duration ?? "",
    };
  }, [prefill]);

  const [draft, setDraft] = React.useState<CampaignDraft>(initial);
  const [newKw, setNewKw] = React.useState("");

  React.useEffect(() => {
    if (open) {
      setDraft(initial());
      setNewKw("");
    }
  }, [open, initial]);

  const update = (patch: Partial<CampaignDraft>) => setDraft((d) => ({ ...d, ...patch }));

  const platformMeta = platformOf(draft.platform);
  const currency = platformMeta?.currency ?? "INR";
  const budgetNum = typeof draft.dailyBudget === "number" ? draft.dailyBudget : 0;
  const budgetWarning =
    draft.dailyBudget === "" ? "No daily budget set." : currency === "INR" && budgetNum < 1000 ? "Below the Rs 1,000 minimum used on Indian platforms" : "";

  const isCountry = draft.targetingMode === "country";
  const fallbackChip = isCountry ? "All countries" : "All cities";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-sm">{prefill?.reviewTitle ?? "Review Price-Win Campaign"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 text-xs">
          {prefill?.contextLine ? (
            <div className="p-3 rounded-lg bg-surface-2 border border-subtle">
              <p className="text-foreground">{prefill.contextLine}</p>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <div className={label}>Campaign name</div>
              <input value={draft.campaignName} onChange={(e) => update({ campaignName: e.target.value })} className={field} />
              {!draft.campaignName.trim() && <p className={warn}>No campaign name set.</p>}
            </div>
            <div>
              <div className={label}>Platform</div>
              <p className={readOnlyText}>{platformMeta?.name ?? draft.platform ?? "—"}</p>
            </div>

            <div>
              <div className={label}>Product / SKU</div>
              <p className={readOnlyText}>{draft.sku.trim() ? draft.sku : "—"}</p>
            </div>

            <div>
              <div className={label}>Daily budget ({currency === "AED" ? "AED" : "₹"})</div>
              <input
                type="number"
                value={draft.dailyBudget}
                onChange={(e) => update({ dailyBudget: e.target.value === "" ? "" : parseFloat(e.target.value) || 0 })}
                className={field}
              />
              {budgetWarning && <p className={warn}>{budgetWarning}</p>}
            </div>

            <div>
              <div className={label}>Duration</div>
              <input value={draft.duration} onChange={(e) => update({ duration: e.target.value })} className={field} />
              {!draft.duration.trim() && <p className={warn}>No duration set. The campaign runs until paused.</p>}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-surface-2 border border-subtle">
            <div className={label}>{isCountry ? "Country" : "Cities"}</div>
            <div className="flex flex-wrap gap-1.5">
              {draft.locations.length === 0 ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] border bg-surface-3 text-foreground border-subtle">{fallbackChip}</span>
              ) : (
                draft.locations.map((loc) => (
                  <span
                    key={loc}
                    className="px-2 py-0.5 rounded-full text-[10px] border bg-primary/15 text-primary border-primary/30 inline-flex items-center gap-1"
                  >
                    {loc}
                    <button
                      onClick={() => update({ locations: draft.locations.filter((x) => x !== loc) })}
                      className="hover:text-sw-red"
                      aria-label={`Remove ${loc}`}
                    >
                      ×
                    </button>
                  </span>
                ))
              )}
            </div>
          </div>

          <div>
            <div className={label}>Keywords &amp; bids ({currency === "AED" ? "AED" : "₹"} CPC)</div>
            <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
              {draft.keywords.map((k, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    value={k.kw}
                    onChange={(e) => {
                      const next = [...draft.keywords];
                      next[idx] = { ...next[idx], kw: e.target.value };
                      update({ keywords: next });
                    }}
                    className="flex-1 px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-[11px]"
                  />
                  <Select
                    value={k.matchType}
                    onValueChange={(v) => {
                      const next = [...draft.keywords];
                      next[idx] = { ...next[idx], matchType: v as MatchType };
                      update({ keywords: next });
                    }}
                  >
                    <SelectTrigger className="h-7 w-24 text-[11px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MATCH_TYPES.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <input
                    type="number"
                    step="0.1"
                    value={k.bid}
                    onChange={(e) => {
                      const next = [...draft.keywords];
                      next[idx] = { ...next[idx], bid: parseFloat(e.target.value) || 0 };
                      update({ keywords: next });
                    }}
                    className="w-20 px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-[11px]"
                  />
                  <button
                    onClick={() => update({ keywords: draft.keywords.filter((_, i) => i !== idx) })}
                    className="text-muted-foreground hover:text-sw-red text-xs px-1"
                    aria-label="Remove keyword"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            {draft.keywords.length === 0 && <p className={warn}>No keywords added.</p>}
            <div className="flex items-center gap-2 mt-2">
              <input
                value={newKw}
                onChange={(e) => setNewKw(e.target.value)}
                placeholder="Add keyword"
                className="flex-1 px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground font-mono text-[11px]"
              />
              <button
                onClick={() => {
                  if (!newKw.trim()) return;
                  update({ keywords: [...draft.keywords, { kw: newKw.trim(), matchType: "Exact", bid: 0 }] });
                  setNewKw("");
                }}
                className="px-2 py-1 rounded-md bg-surface-3 border border-subtle text-foreground text-[11px] hover:bg-surface-2"
              >
                + Add
              </button>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <button onClick={() => onOpenChange(false)} className="px-3 py-1.5 rounded-lg text-xs bg-surface-3 text-foreground hover:bg-surface-2">
              Cancel
            </button>
            <button
              onClick={() => onConfirm(draft)}
              className="px-3 py-1.5 rounded-lg text-xs bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center gap-1"
            >
              <Megaphone size={12} /> Confirm &amp; Launch
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CampaignCreateModal;
