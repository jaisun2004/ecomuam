import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, ChevronRight, Download, Rocket } from "lucide-react";
import EcomSheetTable from "@/components/ecom/EcomSheetTable";
import EcomFixProposal from "@/components/ecom/EcomFixProposal";
import EcomRecoCard from "@/components/ecom/EcomRecoCard";
import { recommendationsForSku } from "@/lib/ecom-qc/recommendations";
import { PRODUCT_LIST } from "@/lib/ecom-reference/workbook-data";
import { useEcomCreate, type PushOutcome } from "@/pages/ecom/EcomCreateContext";
import { BATCH_FIELDS, FIELD_LABELS, type BatchRow } from "@/lib/ecom-qc/types";
import { findingsForRow, partitionRows } from "@/lib/ecom-qc/engine";
import { applyProposal, manualDecisions, proposalsFor, type FixProposal } from "@/lib/ecom-qc/fix-proposals";
import { asOfLabel, capabilityFor } from "@/lib/ecom-reference/config";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { downloadCorrected } from "./xlsx-utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import EcomCreatedScreen from "@/components/ecom/EcomCreatedScreen";
import EcomStockNotice from "@/components/ecom/EcomStockNotice";

const ReviewPushView: React.FC = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const ec = useEcomCreate();
  const [consent, setConsent] = useState(false);
  const [confirmIrreversible, setConfirmIrreversible] = useState(false);
  const [fixing, setFixing] = useState<FixProposal[] | null>(null);
  const [pushing, setPushing] = useState(false);

  useEffect(() => {
    if (ec.rows.length === 0) navigate("/ecom/campaigns/create");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { clean, blocked } = partitionRows(ec.rows, ec.result);
  const selected = clean.filter((r) => r.selected !== false);
  const fromCopy = params.get("from") === "copy" || ec.source === "copy";
  /** Only an uploaded sheet counts rows; manual and copied campaigns count campaigns. */
  const countsRows = ec.countsRows;
  const noun = (n: number) => (countsRows ? `row${n === 1 ? "" : "s"}` : `campaign${n === 1 ? "" : "s"}`);
  const backTo =
    ec.source === "copy" ? "/ecom/campaigns/create/copy"
      : ec.source === "manual" ? "/ecom/campaigns/create/manual"
        : ec.source === "ai" ? "/ecom/campaigns/create/ai"
          : "/ecom/campaigns/create";

  const byPlatform = useMemo(() => {
    const map = new Map<string, BatchRow[]>();
    for (const r of selected) {
      const list = map.get(r.platform) ?? [];
      list.push(r);
      map.set(r.platform, list);
    }
    return [...map.entries()].map(([platform, rows]) => ({ platform, rows, cap: capabilityFor(platform) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ec.rows, ec.result]);

  /** The same recommendation cards the earlier steps showed, restated for the products in this plan. */
  const planRecos = useMemo(() => {
    const codes = [...new Set(selected.map((r) => r.product_id).filter(Boolean))];
    return codes
      .map((c) => PRODUCT_LIST.find((p) => p.code === c))
      .filter((p): p is NonNullable<typeof p> => Boolean(p))
      .flatMap((p) => recommendationsForSku(p))
      .slice(0, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ec.rows, ec.result]);

  if (ec.rows.length === 0) return null;

  const irreversible = byPlatform.filter((g) => g.cap.irreversible_fields.length > 0);

  const updateCell = (id: string, field: keyof BatchRow, value: string) =>
    ec.setRows(ec.rows.map((r) => (r.id === id ? { ...r, [field]: value } : r)));

  const toggleRow = (id: string) =>
    ec.setRows(ec.rows.map((r) => (r.id === id ? { ...r, selected: !(r.selected !== false) } : r)));

  const openFixes = () => {
    const proposals = proposalsFor(ec.result, ec.rows);
    setFixing(proposals.length ? proposals : []);
  };

  const applyFixes = (accepted: { proposal: FixProposal; value: string }[]) => {
    let next = ec.rows;
    for (const a of accepted) next = applyProposal(next, a.proposal, a.value);
    ec.recheck(next);
    setFixing(null);
  };

  const outcomeFor = (g: { platform: string; rows: BatchRow[]; cap: ReturnType<typeof capabilityFor> }, forceOk = false): PushOutcome => {
    if (!g.cap.can_push_api) {
      return { platform: g.platform, mode: "export", rows: g.rows.length, status: "exported", detail: "" };
    }
    const failed = !forceOk && g.rows.length > 6;
    return {
      platform: g.platform,
      mode: "api",
      rows: g.rows.length,
      status: failed ? "failed" : "pushed",
      detail: failed ? `${platformDisplay(g.platform)} rejected the batch. Nothing was created there. Retry in smaller batches.` : "",
    };
  };

  const push = () => {
    if (pushing) return;
    setPushing(true);
    setTimeout(() => {
      ec.setOutcomes(byPlatform.map((g) => outcomeFor(g)));
      ec.setPushed(true);
      setPushing(false);
    }, 900);
  };

  /** Retrying a failed platform never touches one that already went out. */
  const retry = (platforms: string[]) => {
    ec.setOutcomes(
      ec.outcomes.map((o) => {
        if (!platforms.includes(o.platform)) return o;
        const g = byPlatform.find((x) => x.platform === o.platform);
        return g ? outcomeFor(g, true) : o;
      }),
    );
  };

  /* ── Outcome screen: the same one every flow lands on ── */
  if (ec.pushed) return <EcomCreatedScreen onRetry={retry} />;

  const canPush = selected.length > 0 && consent && (irreversible.length === 0 || confirmIrreversible);
  const allHeld = selected.length === 0 && blocked.length > 0;

  const budgetChips = (() => {
    const map = new Map<string, number>();
    for (const r of selected) {
      const cur = r.currency || "";
      map.set(cur, (map.get(cur) ?? 0) + (Number(r.budget_value) || 0));
    }
    return [...map.entries()].map(([cur, total]) => `${cur} ${total.toLocaleString()}`);
  })();

  const caveats = byPlatform.filter((g) => !g.cap.can_push_api || g.cap.irreversible_fields.length > 0);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
        <button onClick={() => navigate(backTo)} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="font-display font-bold text-sm text-foreground">Review and push</h1>
          <p className="text-[10px] text-muted-foreground">Nothing is created until you press send.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-2.5">
          {/* Summary strip */}
          <div className="rounded-xl border border-subtle bg-surface-1 px-4 py-3">
            <div className="flex flex-wrap items-center gap-1.5">
              {selected.length > 0 && <Chip tone="ok">{selected.length} {noun(selected.length)} going out</Chip>}
              {blocked.length > 0 && <Chip tone="bad">{blocked.length} held</Chip>}
              {byPlatform.map((g) => (
                <Chip key={g.platform}>{platformDisplay(g.platform)} · {g.rows.length}</Chip>
              ))}
              {budgetChips.map((b) => <Chip key={b} mono>{b}</Chip>)}
              <span className="ml-auto text-[10px] text-muted-foreground">Data as of {asOfLabel()}</span>
            </div>
            {caveats.length > 0 && (
              <ul className="mt-2 space-y-1">
                {caveats.map((g) => (
                  <li key={g.platform} className="text-[10px] text-sw-amber">
                    <span className="font-medium">{platformDisplay(g.platform)}</span>{" "}
                                        {g.cap.irreversible_fields.length > 0 && "budget cannot be lowered once live."}
                  </li>
                ))}
              </ul>
            )}
            {fromCopy && (
              <p className="mt-2 text-[10px] text-muted-foreground">
                From past campaigns — end dates cleared, budgets carried over, cities and products re-checked against today's data.
              </p>
            )}
          </div>

          {/* Held rows */}
          {blocked.length > 0 && (
            <Fold
              defaultOpen={allHeld}
              tone="bad"
              title={`${blocked.length} held ${noun(blocked.length)} — not sent, nothing dropped`}
              actions={
                <>
                  <button onClick={(e) => { e.stopPropagation(); openFixes(); }}
                    className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-primary/15 text-primary hover:bg-primary/25">
                    See proposed fixes
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      ec.holdRows(blocked, ec.result, ec.fileName ?? "batch", "Parked from review");
                      ec.keepOnlyCleanRows();
                    }}
                    className="px-2.5 py-1 rounded-md text-[10px] bg-surface-3 text-foreground hover:bg-surface-3/70"
                  >
                    Park for later
                  </button>
                </>
              }
            >
              {countsRows ? (
                <EcomSheetTable rows={ec.rows} result={ec.result} title="Held rows" onlyRows={blocked.map((r) => r.row)} defaultOpen />
              ) : (
                <CampaignList rows={blocked} />
              )}
            </Fold>
          )}

          {fixing && (
            <EcomFixProposal proposals={fixing} manual={manualDecisions(ec.result)} onApply={applyFixes} onCancel={() => setFixing(null)} />
          )}

          {/* Recommendations */}
          {planRecos.length > 0 && (
            <Fold title={`${planRecos.length} suggestion${planRecos.length > 1 ? "s" : ""} kept on this plan`}>
              <div className="divide-y divide-subtle -mx-4 -mb-3">
                {planRecos.map((r) => (
                  <EcomRecoCard key={r.id} reco={r} selected readOnly onToggle={() => {}} />
                ))}
              </div>
            </Fold>
          )}

          {/* Everything going out */}
          <Fold title={countsRows
            ? `Show the full sheet (${ec.rows.length} row${ec.rows.length > 1 ? "s" : ""})`
            : `Show all ${ec.rows.length} campaign${ec.rows.length > 1 ? "s" : ""}`}>
          {countsRows ? (
          <>
            <div className="-mx-4 overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="border-y border-subtle bg-surface-2">
                    <th className="px-2 py-2"></th>
                    <th className="px-2 py-2 text-left text-muted-foreground font-mono">#</th>
                    {BATCH_FIELDS.map((f) => (
                      <th key={f} className="px-2 py-2 text-left text-muted-foreground font-mono whitespace-nowrap">{FIELD_LABELS[f]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-subtle">
                  {ec.rows.map((r) => {
                    const rowFindings = findingsForRow(ec.result, r.row);
                    const rowBlocked = rowFindings.some((f) => f.severity === "blocker");
                    return (
                      <tr key={r.id} className={r.selected === false ? "opacity-40" : rowBlocked ? "bg-sw-red-dim/30" : ""}>
                        <td className="px-2 py-1.5">
                          <input type="checkbox" checked={r.selected !== false} disabled={rowBlocked} onChange={() => toggleRow(r.id)} className="accent-primary" />
                        </td>
                        <td className="px-2 py-1.5 font-mono text-muted-foreground">
                          <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1.5 ${rowBlocked ? "bg-sw-red" : rowFindings.length ? "bg-sw-amber" : "bg-sw-green"}`} />
                          {r.row}
                        </td>
                        {BATCH_FIELDS.map((f) => {
                          const bad = rowFindings.some((x) => x.field === f);
                          return (
                            <td key={f} className="px-1 py-1 min-w-[110px]">
                              <input
                                value={String(r[f] ?? "")}
                                onChange={(e) => updateCell(r.id, f, e.target.value)}
                                className={`w-full bg-transparent border rounded px-1.5 py-1 text-[11px] font-mono outline-none ${
                                  bad ? "border-sw-red/50 text-sw-red" : "border-transparent hover:border-subtle focus:border-primary/50 text-foreground"
                                }`}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-3 flex-wrap pt-3">
              <button onClick={() => ec.recheck()} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-surface-3 text-foreground hover:bg-surface-3/70">
                Check again after edits
              </button>
              <button onClick={() => downloadCorrected(ec.rows)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-surface-3 text-foreground hover:bg-surface-3/70">
                <Download size={12} /> Download this sheet
              </button>
            </div>
          </>
          ) : (
            <>
              <CampaignList rows={ec.rows} editable onChange={updateCell} onToggle={toggleRow} blockedRows={blocked.map((r) => r.row)} />
              <button onClick={() => ec.recheck()} className="mt-3 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-surface-3 text-foreground hover:bg-surface-3/70">
                Check again after edits
              </button>
            </>
          )}
          </Fold>
        </div>
      </div>

      {/* Sticky send bar */}
      <div className="border-t border-subtle bg-surface-1 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            {allHeld ? (
              <p className="text-[11px] text-muted-foreground">
                Everything here is held. Fix the blockers above, or park them for later.
              </p>
            ) : (
              <label className="flex items-start gap-2 text-[11px] text-foreground cursor-pointer">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-primary mt-0.5" />
                <span>
                  I have read the {selected.length} {noun(selected.length)} and I want {selected.length === 1 ? "it" : "them"} created.
                </span>
              </label>
            )}
            {irreversible.length > 0 && (
              <label className="flex items-start gap-2 text-[11px] text-sw-amber cursor-pointer">
                <input type="checkbox" checked={confirmIrreversible} onChange={(e) => setConfirmIrreversible(e.target.checked)} className="accent-primary mt-0.5" />
                <span>
                  On {irreversible.map((g) => platformDisplay(g.platform)).join(", ")} the budget cannot be lowered once live. I have checked the amounts.
                </span>
              </label>
            )}
          </div>
          <button
            onClick={push}
            disabled={!canPush || pushing}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <Rocket size={13} /> {pushing ? "Sending…" : allHeld ? "Nothing can be sent yet" : `Create ${selected.length} ${noun(selected.length)}`}
          </button>
        </div>
      </div>

      <Dialog open={fixing?.length === 0} onOpenChange={() => setFixing(null)}>
        <DialogContent className="bg-surface-1 border-border-visible">
          <DialogHeader>
            <DialogTitle className="text-sm">Nothing here can be filled in for you</DialogTitle>
            <DialogDescription className="text-[11px]">
              Every open point needs a decision. Edit the cells in the sheet, or park the rows and come back with the right values.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const CampaignList: React.FC<{
  rows: BatchRow[];
  editable?: boolean;
  blockedRows?: number[];
  onChange?: (id: string, field: keyof BatchRow, value: string) => void;
  onToggle?: (id: string) => void;
}> = ({ rows, editable, blockedRows = [], onChange, onToggle }) => (
  <div className="space-y-2">
    {rows.map((r) => {
      const isBlocked = blockedRows.includes(r.row);
      return (
        <div key={r.id} className={`rounded-lg border px-3 py-2.5 ${isBlocked ? "border-sw-red/30 bg-sw-red-dim/30" : "border-subtle bg-surface-2"}`}>
          <div className="flex items-center gap-2 flex-wrap">
            {editable && onToggle && (
              <input type="checkbox" checked={r.selected !== false} disabled={isBlocked} onChange={() => onToggle(r.id)} className="accent-primary" />
            )}
            <span className="text-xs font-medium text-foreground truncate">{r.campaign_name || "Unnamed campaign"}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{platformDisplay(r.platform)}</span>
            <span className="ml-auto font-mono text-[10px] text-muted-foreground">
              {r.budget_type === "daily" ? "Daily" : "Total"} {r.currency} {Number(r.budget_value || 0).toLocaleString()}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
            <CampaignField label="Cities" value={r.cities} onChange={editable && onChange ? (v) => onChange(r.id, "cities", v) : undefined} />
            <CampaignField label="Products" value={r.product_id} onChange={editable && onChange ? (v) => onChange(r.id, "product_id", v) : undefined} />
            <CampaignField label="Keywords" value={r.targeting_details} onChange={editable && onChange ? (v) => onChange(r.id, "targeting_details", v) : undefined} />
            <CampaignField label="End date" value={r.end_date} onChange={editable && onChange ? (v) => onChange(r.id, "end_date", v) : undefined} />
          </div>
        </div>
      );
    })}
  </div>
);

const CampaignField: React.FC<{ label: string; value: string; onChange?: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="flex gap-2 min-w-0 items-center">
    <span className="text-[10px] text-muted-foreground w-20 flex-shrink-0">{label}</span>
    {onChange ? (
      <input value={value ?? ""} onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent border border-transparent hover:border-subtle focus:border-primary/50 rounded px-1.5 py-1 text-[11px] font-mono text-foreground outline-none" />
    ) : (
      <span className="flex-1 min-w-0 text-[11px] font-mono text-foreground truncate" title={value}>{value || "—"}</span>
    )}
  </div>
);

const Chip: React.FC<{ children: React.ReactNode; tone?: "ok" | "bad"; mono?: boolean }> = ({ children, tone, mono }) => (
  <span
    className={`px-2 py-0.5 rounded-md text-[10px] border ${mono ? "font-mono" : ""} ${
      tone === "ok"
        ? "border-sw-green/30 bg-sw-green-dim text-sw-green"
        : tone === "bad"
        ? "border-sw-red/30 bg-sw-red-dim text-sw-red"
        : "border-subtle bg-surface-2 text-muted-foreground"
    }`}
  >
    {children}
  </span>
);

const Fold: React.FC<{
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  defaultOpen?: boolean;
  tone?: "bad";
}> = ({ title, children, actions, defaultOpen, tone }) => {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className={`rounded-xl border bg-surface-1 overflow-hidden ${tone === "bad" ? "border-sw-red/30" : "border-subtle"}`}>
      <div
        onClick={() => setOpen((o) => !o)}
        className={`w-full flex items-center gap-2 px-4 py-2.5 cursor-pointer select-none ${tone === "bad" ? "bg-sw-red-dim" : "hover:bg-surface-2"}`}
      >
        <ChevronRight size={13} className={`text-muted-foreground transition-transform ${open ? "rotate-90" : ""}`} />
        <span className={`text-[11px] font-medium flex-1 min-w-0 truncate ${tone === "bad" ? "text-sw-red" : "text-foreground"}`}>{title}</span>
        {actions}
      </div>
      {open && <div className="px-4 py-3 border-t border-subtle">{children}</div>}
    </div>
  );
};


export default ReviewPushView;
