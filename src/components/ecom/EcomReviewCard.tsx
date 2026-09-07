import React, { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Rocket } from "lucide-react";
import EcomSheetTable from "@/components/ecom/EcomSheetTable";
import { useEcomCreate, type PushOutcome } from "@/pages/ecom/EcomCreateContext";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { partitionRows } from "@/lib/ecom-qc/engine";
import { capabilityFor } from "@/lib/ecom-reference/config";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { downloadCorrected } from "@/pages/ecom/xlsx-utils";

interface Props {
  /** go back up the conversation to the check card */
  onBackToCheck: () => void;
  onFixWithAi: () => void;
  onDone: (summary: string) => void;
}

/**
 * Review is a commit card inside the conversation. The rows are read only here.
 * To change a value the user goes back to the check card and uses Fix with AI.
 */
const EcomReviewCard: React.FC<Props> = ({ onBackToCheck, onFixWithAi, onDone }) => {
  const ec = useEcomCreate();
  const [consent, setConsent] = useState(false);
  const [confirmIrreversible, setConfirmIrreversible] = useState(false);
  const [pushing, setPushing] = useState(false);
  const [showRows, setShowRows] = useState(false);

  const { clean, blocked } = partitionRows(ec.rows, ec.result);
  const selected = clean.filter((r) => r.selected !== false);
  const noun = (n: number) => (ec.countsRows ? `row${n === 1 ? "" : "s"}` : `campaign${n === 1 ? "" : "s"}`);

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

  const irreversible = byPlatform.filter((g) => g.cap.irreversible_fields.length > 0);
  const canPush = selected.length > 0 && consent && (irreversible.length === 0 || confirmIrreversible);

  const push = () => {
    if (pushing) return;
    setPushing(true);
    setTimeout(() => {
      const outcomes: PushOutcome[] = byPlatform.map((g) => {
        if (!g.cap.can_push_api) {
          return {
            platform: g.platform,
            mode: "export",
            rows: g.rows.length,
            status: "exported",
            detail: `${g.rows.length} campaigns created for ${platformDisplay(g.platform)}. This platform takes new campaigns by file upload — upload the file in the platform console to set them live.`,
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
      const created = outcomes.filter((o) => o.status === "pushed").reduce((n, o) => n + o.rows, 0);
      const exported = outcomes.filter((o) => o.status === "exported").reduce((n, o) => n + o.rows, 0);
      const failedRows = outcomes.filter((o) => o.status === "failed").reduce((n, o) => n + o.rows, 0);
      onDone(
        [
          created ? `${created} campaigns are live.` : "",
          exported ? `${exported} campaigns are created as files — upload each file in the platform console to set them live.` : "",
          failedRows ? `${failedRows} rows were rejected and nothing was created for them.` : "",
        ]
          .filter(Boolean)
          .join(" "),
      );
    }, 900);
  };

  /* ── After the push: only what actually happened ── */
  if (ec.pushed) {
    const anyFailed = ec.outcomes.some((o) => o.status === "failed");
    const anyPushed = ec.outcomes.some((o) => o.status === "pushed");
    return (
      <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2">
          {anyFailed ? <AlertTriangle size={14} className="text-sw-amber" /> : <CheckCircle2 size={14} className="text-sw-green" />}
          <p className="text-xs font-medium text-foreground">
            {anyFailed ? "Partly done" : "Campaigns created"}
          </p>
        </div>
        <ul className="p-3 space-y-2">
          {ec.outcomes.map((o) => (
            <li
              key={o.platform}
              className={`rounded-lg border px-3 py-2 text-[11px] ${
                o.status === "failed"
                  ? "border-sw-red/30 bg-sw-red-dim"
                  : o.status === "exported"
                    ? "border-subtle bg-surface-2"
                    : "border-sw-green/30 bg-sw-green-dim"
              }`}
            >
              <p className="text-foreground font-medium">{platformDisplay(o.platform)}</p>
              <p className="text-muted-foreground mt-0.5">{o.detail}</p>
              {o.status === "exported" && (
                <button
                  onClick={() => downloadCorrected(byPlatform.find((g) => g.platform === o.platform)?.rows ?? [])}
                  className="mt-1.5 flex items-center gap-1 text-[11px] text-primary hover:underline"
                >
                  <Download size={11} /> Download the file for {platformDisplay(o.platform)}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
      <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2 flex-wrap">
        <p className="text-xs font-medium text-foreground">Review and push</p>
        <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px]">Nothing is created yet</span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          {selected.length} {noun(selected.length)} going · {blocked.length} held
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1.5">What happens on each platform</p>
          <ul className="space-y-1">
            {byPlatform.map((g) => (
              <li key={g.platform} className="text-[11px] text-muted-foreground">
                <span className="text-foreground font-medium">{platformDisplay(g.platform)}</span> · {g.rows.length} {noun(g.rows.length)} ·{" "}
                {g.cap.can_push_api
                  ? "created straight on the platform."
                  : "created as a file — upload it in the platform console to set them live."}
              </li>
            ))}
            {byPlatform.length === 0 && <li className="text-[11px] text-muted-foreground">Nothing is selected.</li>}
          </ul>
        </div>

        <button
          onClick={() => setShowRows((v) => !v)}
          className="w-full text-left px-3 py-2 rounded-lg border border-subtle bg-surface-2 text-[11px] text-foreground hover:border-primary/40"
        >
          {showRows ? "Hide them" : `Show all ${ec.rows.length} ${noun(ec.rows.length)}, read only`}
        </button>
        {showRows && <EcomSheetTable rows={ec.rows} result={ec.result} title="As they will be sent" defaultOpen />}

        {blocked.length > 0 && (
          <div className="rounded-lg border border-sw-red/30 bg-sw-red-dim px-3 py-2.5">
            <p className="text-[11px] text-sw-red">
              {blocked.length} {noun(blocked.length)} are held and will not be sent. They keep their budget and stay in the plan.
            </p>
            <div className="flex gap-2 mt-2">
              <button onClick={onFixWithAi} className="px-2.5 py-1 rounded-md text-[10px] font-medium bg-primary/15 text-primary hover:bg-primary/25">
                Fix them now instead
              </button>
              <button
                onClick={() => downloadCorrected(blocked)}
                className="px-2.5 py-1 rounded-md text-[10px] bg-surface-3 text-foreground hover:bg-surface-3/70"
              >
                Download the {blocked.length} {noun(blocked.length)}
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <label className="flex items-start gap-2 text-[11px] text-foreground cursor-pointer">
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="accent-primary mt-0.5" />
            <span>
              I have read these {selected.length} {noun(selected.length)} and I want them sent. Campaigns for platforms that take file uploads go live once I upload the file in their console.
            </span>
          </label>
          {irreversible.length > 0 && (
            <label className="flex items-start gap-2 text-[11px] text-sw-amber cursor-pointer">
              <input
                type="checkbox"
                checked={confirmIrreversible}
                onChange={(e) => setConfirmIrreversible(e.target.checked)}
                className="accent-primary mt-0.5"
              />
              <span>
                On {irreversible.map((g) => platformDisplay(g.platform)).join(", ")} the budget cannot be lowered once live. I have checked the amounts.
              </span>
            </label>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 px-4 py-3 border-t border-subtle bg-surface-2 flex-wrap">
        <button
          onClick={push}
          disabled={!canPush || pushing}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Rocket size={13} /> {pushing ? "Sending…" : `Create ${selected.length} campaigns`}
        </button>
        <button onClick={onBackToCheck} className="px-4 py-2 rounded-lg text-xs bg-surface-3 text-foreground hover:bg-surface-3/70">
          Back to the check
        </button>
        <button
          onClick={() => downloadCorrected(ec.rows)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs bg-surface-3 text-foreground hover:bg-surface-3/70"
        >
          <Download size={12} /> Download this sheet
        </button>
        <span className="ml-auto text-[10px] text-muted-foreground">Logged against your name.</span>
      </div>
    </div>
  );
};

export default EcomReviewCard;
