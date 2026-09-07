import React from "react";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Download, RotateCcw } from "lucide-react";
import { useEcomCreate } from "@/pages/ecom/EcomCreateContext";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import { downloadCorrected } from "@/pages/ecom/xlsx-utils";

interface Props {
  /** retry only the platforms that failed */
  onRetry?: (platforms: string[]) => void;
}

const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;

/** The one confirmation screen every flow lands on after a push. */
const EcomCreatedScreen: React.FC<Props> = ({ onRetry }) => {
  const navigate = useNavigate();
  const ec = useEcomCreate();

  const outcomes = ec.outcomes;
  const created = outcomes.filter((o) => o.status !== "failed").reduce((n, o) => n + o.rows, 0);
  const failed = outcomes.filter((o) => o.status === "failed");
  const heldRows = ec.held.flatMap((h) => h.rows);
  const heldBudget = heldRows.reduce((n, r) => n + (Number(r.budget_value) || 0), 0);
  const heldCurrency = heldRows[0]?.currency ?? "";
  const noEndDate = ec.rows.filter((r) => r.selected !== false && !r.end_date).length;

  const resumeDate = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  })();

  const heading = failed.length
    ? `${plural(created, "campaign")} created · ${plural(failed.reduce((n, o) => n + o.rows, 0), "campaign")} not created`
    : `${plural(created, "campaign")} created`;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 py-10">
      <div className="max-w-xl w-full">
        <div className="flex items-center gap-2 mb-4">
          {failed.length ? <AlertTriangle size={22} className="text-sw-amber" /> : <CheckCircle2 size={22} className="text-sw-green" />}
          <h1 className="font-display font-bold text-lg text-foreground">{heading}</h1>
        </div>

        <ul className="space-y-2">
          {outcomes.map((o) => (
            <li
              key={o.platform}
              className={`rounded-lg border px-3 py-2.5 text-xs flex items-center gap-3 ${
                o.status === "failed" ? "border-sw-red/30 bg-sw-red-dim" : o.status === "exported" ? "border-subtle bg-surface-2" : "border-sw-green/30 bg-sw-green-dim"
              }`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-foreground font-medium">{platformDisplay(o.platform)}</p>
                <p className="text-muted-foreground mt-0.5">
                  {o.status === "failed"
                    ? `${plural(o.rows, "campaign")} not created. ${o.detail}`
                    : o.status === "exported"
                      ? `${plural(o.rows, "campaign")} · file ready to download`
                      : `${plural(o.rows, "campaign")} · pushed over the API`}
                </p>
              </div>
              {o.status === "exported" && (
                <button
                  onClick={() => downloadCorrected(ec.rows.filter((r) => r.platform === o.platform))}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] bg-surface-3 text-foreground hover:bg-surface-3/70 flex-shrink-0"
                >
                  <Download size={11} /> Download
                </button>
              )}
              {o.status === "failed" && onRetry && (
                <button
                  onClick={() => onRetry([o.platform])}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] bg-primary/15 text-primary hover:bg-primary/25 flex-shrink-0"
                >
                  <RotateCcw size={11} /> Retry
                </button>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-1">
          {heldRows.length > 0 && (
            <p className="text-[11px] text-sw-amber">
              {plural(heldRows.length, "campaign")} held, {heldCurrency} {heldBudget.toLocaleString()} not committed ·{" "}
              {ec.held.map((h) => h.fileName).join(", ")}{" "}
              <button onClick={() => navigate("/ecom/campaigns/create/held")} className="underline hover:text-foreground">
                Open held batches
              </button>
            </p>
          )}
          {noEndDate > 0 && (
            <p className="text-[11px] text-muted-foreground">
              No end date set. {noEndDate === 1 ? "This campaign runs" : "These campaigns run"} until you pause {noEndDate === 1 ? "it" : "them"}.
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">Recommendations pause until {resumeDate}.</p>
        </div>

        <button
          onClick={() => { ec.reset(); navigate("/"); }}
          className="mt-6 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
        >
          Go to Campaign Manager
        </button>
      </div>
    </div>
  );
};

export default EcomCreatedScreen;
