import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, CheckCircle2, Download, Rocket } from "lucide-react";
import EcomSheetTable from "@/components/ecom/EcomSheetTable";
import EcomFixProposal from "@/components/ecom/EcomFixProposal";
import { useEcomCreate, type PushOutcome } from "./EcomCreateContext";
import { BATCH_FIELDS, FIELD_LABELS, type BatchRow } from "@/lib/ecom-qc/types";
import { findingsForRow, partitionRows } from "@/lib/ecom-qc/engine";
import { applyProposal, manualDecisions, proposalsFor, type FixProposal } from "@/lib/ecom-qc/fix-proposals";
import { capabilityFor } from "@/lib/ecom-reference/config";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { downloadCorrected } from "./xlsx-utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

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

  if (ec.rows.length === 0) return null;

  const { clean, blocked } = partitionRows(ec.rows, ec.result);
  const selected = clean.filter((r) => r.selected !== false);
  const fromCopy = params.get("from") === "copy";

  const byPlatform = useMemo(() => {
    const map = new Map<string, BatchRow[]>();
    for (const r of selected) {
      const list = map.get(r.platform) ?? [];
      list.push(r);
      map.set(r.platform, list);
    }
    return [...map.entries()].map(([platform, rows]) => ({ platform, rows, cap: capabilityFor(platform) }));
  }, [selected]);

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

  const push = () => {
    setPushing(true);
    // Mocked delivery. A platform without a campaign API is exported, never reported as pushed.
    setTimeout(() => {
      const outcomes: PushOutcome[] = byPlatform.map((g) => {
        if (!g.cap.can_push_api) {
          return {
            platform: g.platform,
            mode: "export",
            rows: g.rows.length,
            status: "exported",
            detail: `${platformDisplay(g.platform)} has no campaign API. ${g.rows.length} rows were exported for upload in the platform console. Nothing is live yet.`,
          };
        }
        const failed = g.rows.length > 6;
        return {
          platform: g.platform,
          mode: "api",
          rows: g.rows.length,
          status: failed ? "failed" : "pushed",
          detail: failed
            ? `${platformDisplay(g.platform)} rejected the batch (rate limit on ${g.rows.length} campaigns). Nothing was created. Retry in smaller batches.`
            : `${g.rows.length} campaigns created on ${platformDisplay(g.platform)}.`,
        };
      });
      ec.setOutcomes(outcomes);
      ec.setPushed(true);
      setPushing(false);
    }, 900);
  };

  /* ── Outcome screen: only what actually happened ── */
  if (ec.pushed) {
    const anyPushed = ec.outcomes.some((o) => o.status === "pushed");
    const anyFailed = ec.outcomes.some((o) => o.status === "failed");
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
        <div className="max-w-xl w-full">
          <div className="flex items-center gap-2 mb-4">
            {anyFailed ? <AlertTriangle size={22} className="text-sw-amber" /> : <CheckCircle2 size={22} className="text-sw-green" />}
            <h1 className="font-display font-bold text-lg text-foreground">
              {anyFailed ? "Partly done" : anyPushed ? "Done" : "Exported, not live"}
            </h1>
          </div>
          <ul className="space-y-2">
            {ec.outcomes.map((o) => (
              <li key={o.platform} className={`rounded-lg border px-3 py-2.5 text-xs ${
                o.status === "failed" ? "border-sw-red/30 bg-sw-red-dim" : o.status === "exported" ? "border-subtle bg-surface-2" : "border-sw-green/30 bg-sw-green-dim"
              }`}>
                <p className="text-foreground font-medium">{platformDisplay(o.platform)}</p>
                <p className="text-muted-foreground mt-0.5">{o.detail}</p>
                {o.status === "exported" && (
                  <button onClick={() => downloadCorrected(byPlatform.find((g) => g.platform === o.platform)?.rows ?? [])}
                    className="mt-1.5 flex items-center gap-1 text-[11px] text-primary hover:underline">
                    <Download size={11} /> Download the file for {platformDisplay(o.platform)}
                  </button>
                )}
              </li>
            ))}
          </ul>
          {ec.held.length > 0 && (
            <p className="mt-3 text-[11px] text-sw-amber">
              {ec.held.reduce((n, h) => n + h.rows.length, 0)} rows are still parked in {ec.held.length} held batch{ec.held.length > 1 ? "es" : ""}.
            </p>
          )}
          <div className="flex gap-2 mt-6">
            <button onClick={() => { ec.reset(); navigate("/"); }} className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
              Back to Campaign Manager
            </button>
            {ec.held.length > 0 && (
              <button onClick={() => { ec.setPushed(false); navigate("/ecom/campaigns/create/held"); }} className="px-5 py-2.5 rounded-xl bg-surface-3 text-foreground text-sm hover:bg-surface-3/70">
                Open held batches
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const canPush = selected.length > 0 && consent && (irreversible.length === 0 || confirmIrreversible);

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="font-display font-bold text-sm text-foreground">Review and push</h1>
            <p className="text-[10px] text-muted-foreground">
              {selected.length} rows selected · {blocked.length} held · nothing is created until you press push
            </p>
          </div>
        </div>
        <button
          onClick={push}
          disabled={!canPush || pushing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket size={13} /> {pushing ? "Sending…" : `Send ${selected.length} rows`}
        </button>
      </div>

      <div className="p-4 max-w-[1400px] mx-auto space-y-4">
        {fromCopy && (
          <div className="rounded-xl border border-sw-amber/30 bg-sw-amber-dim px-4 py-3 text-xs text-sw-amber">
            These came from past campaigns. End dates were cleared, budgets carried over, and cities and products re-checked against today's data.
          </div>
        )}

        {/* What happens per platform */}
        <div className="rounded-xl border border-subtle bg-surface-1 p-4">
          <h2 className="font-display font-bold text-xs text-foreground mb-2">What happens on each platform</h2>
          <ul className="space-y-1.5">
            {byPlatform.map((g) => (
              <li key={g.platform} className="text-[11px] text-muted-foreground">
                <span className="text-foreground font-medium">{platformDisplay(g.platform)}</span> · {g.rows.length} rows ·{" "}
                {g.cap.can_push_api
                  ? "sent straight to the platform through its API."
                  : "no campaign API here, so we prepare a file for you to upload in the platform console. It will not be live until you do."}
              </li>
            ))}
            {byPlatform.length === 0 && <li className="text-[11px] text-muted-foreground">No rows are selected.</li>}
          </ul>
        </div>

        {/* Held rows stay visible */}
        {blocked.length > 0 && (
          <div className="rounded-xl border border-sw-red/30 bg-surface-1 overflow-hidden">
            <div className="px-4 py-2.5 bg-sw-red-dim flex items-center gap-2 flex-wrap">
              <AlertTriangle size={13} className="text-sw-red" />
              <span className="text-[11px] text-sw-red">
                {blocked.length} rows are held and will not be sent. They stay here — nothing is dropped.
              </span>
              <button onClick={openFixes} className="ml-auto px-2.5 py-1 rounded-md text-[10px] font-medium bg-primary/15 text-primary hover:bg-primary/25">
                See proposed fixes
              </button>
              <button
                onClick={() => {
                  ec.holdRows(blocked, ec.result, ec.fileName ?? "batch", "Parked from review");
                  ec.keepOnlyCleanRows();
                }}
                className="px-2.5 py-1 rounded-md text-[10px] bg-surface-3 text-foreground hover:bg-surface-3/70"
              >
                Park them for later
              </button>
            </div>
            <div className="p-3">
              <EcomSheetTable rows={ec.rows} result={ec.result} title="Held rows" onlyRows={blocked.map((r) => r.row)} defaultOpen />
            </div>
          </div>
        )}

        {fixing && (
          <EcomFixProposal proposals={fixing} manual={manualDecisions(ec.result)} onApply={applyFixes} onCancel={() => setFixing(null)} />
        )}

        {/* Editable grid */}
        <div className="rounded-xl border border-subtle bg-surface-1 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="border-b border-subtle bg-surface-2">
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

        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => ec.recheck()} className="px-4 py-2 rounded-lg text-xs font-medium bg-surface-3 text-foreground hover:bg-surface-3/70">
            Check again after edits
          </button>
          <button onClick={() => downloadCorrected(ec.rows)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs bg-surface-3 text-foreground hover:bg-surface-3/70">
            <Download size={12} /> Download this sheet
          </button>
        </div>

        {/* Consent */}
        <div className="rounded-xl border border-subtle bg-surface-1 p-4 space-y-2">
          <label className="flex items-start gap-2 text-xs text-foreground cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-primary mt-0.5" />
            <span>
              I have read the {selected.length} rows above and I want them sent. I understand rows going to platforms without an API are prepared as files, not created.
            </span>
          </label>
          {irreversible.length > 0 && (
            <label className="flex items-start gap-2 text-xs text-sw-amber cursor-pointer">
              <input type="checkbox" checked={confirmIrreversible} onChange={(e) => setConfirmIrreversible(e.target.checked)} className="accent-primary mt-0.5" />
              <span>
                On {irreversible.map((g) => platformDisplay(g.platform)).join(", ")} the budget cannot be lowered once live. I have checked the amounts.
              </span>
            </label>
          )}
          {ec.overrides.length > 0 && (
            <p className="text-[10px] text-muted-foreground">
              {ec.overrides.length} warning{ec.overrides.length > 1 ? "s were" : " was"} accepted with a reason, and each one is recorded with this batch.
            </p>
          )}
        </div>
        <div className="pb-10" />
      </div>

      <Dialog open={fixing?.length === 0} onOpenChange={() => setFixing(null)}>
        <DialogContent className="bg-surface-1 border-border-visible">
          <DialogHeader>
            <DialogTitle className="text-sm">Nothing here can be filled in for you</DialogTitle>
            <DialogDescription className="text-[11px]">
              Every open point needs a decision. Edit the cells in the grid, or park the rows and come back with the right values.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReviewPushView;
