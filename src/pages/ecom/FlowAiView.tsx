import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, Download, FileSpreadsheet, Lightbulb, Loader2, RotateCcw, Search, Send, Sparkles, Upload, X,
} from "lucide-react";
import EcomFileCard from "@/components/ecom/EcomFileCard";
import EcomFixProposal from "@/components/ecom/EcomFixProposal";
import { useEcomCreate } from "./EcomCreateContext";
import { downloadCorrected, downloadTemplate, parseWorkbook, CANONICAL_HEADERS } from "./xlsx-utils";
import { SAMPLE_BATCH_ROWS } from "@/lib/ecom-reference/workbook-data";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { buildRun, rerun, type SheetRun } from "@/lib/ecom-qc/sheet-run";
import { applyProposal, manualDecisions, proposalsFor, type FixProposal } from "@/lib/ecom-qc/fix-proposals";
import { recoKindLabel, recommendationsForSku, searchSkus, type SkuRecommendation } from "@/lib/ecom-qc/recommendations";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import type { RefProduct } from "@/lib/ecom-reference/workbook-data";

interface Msg {
  role: "user" | "assistant";
  text: string;
  runId?: string;
}

const FIRST_MESSAGE =
  "Upload your batch import sheet and I'll read every row against the checks in your workbook, or press Recommendation and I'll build campaigns for the SKUs you pick.";

const MAX_MB = 10;

const FlowAiView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: FIRST_MESSAGE }]);
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fixing, setFixing] = useState<FixProposal[] | null>(null);
  const [skuPicker, setSkuPicker] = useState(false);
  const [skuQuery, setSkuQuery] = useState("");
  const [pickedSkus, setPickedSkus] = useState<RefProduct[]>([]);
  const [recos, setRecos] = useState<SkuRecommendation[] | null>(null);
  const [chosenRecos, setChosenRecos] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const latest: SheetRun | null = ec.runs.length ? ec.runs[ec.runs.length - 1] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ec.runs, recos, skuPicker, fixing]);

  useEffect(() => {
    const handler = (e: Event) => {
      const f = (e as CustomEvent<File>).detail;
      if (f) void handleFile(f);
    };
    window.addEventListener("ecom-reupload", handler);
    return () => window.removeEventListener("ecom-reupload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ec.runs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") navigate("/ecom/campaigns/create"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const say = (text: string) => setMessages((m) => [...m, { role: "assistant", text }]);

  const registerRun = (run: SheetRun, previous: SheetRun | null) => {
    ec.addRun(run);
    ec.setFileName(run.fileName);
    ec.setSource("ai");
    ec.recheck(run.rows);

    if (run.state === "file_error" || run.state === "wrong_shape" || run.state === "empty") {
      say(
        run.missingColumns.length
          ? `I couldn't use that file. These columns are missing or renamed: ${run.missingColumns.join(", ")}. The template has them in the right order — grab it below and try again.`
          : `I couldn't use that file. ${run.error ?? "It has no readable rows."} Nothing has changed here, so you can upload again whenever you like.`,
      );
      return;
    }

    const prevBlocked = previous?.heldRows.length ?? null;
    const compare =
      prevBlocked !== null ? ` Compared with the last version, held rows went from ${prevBlocked} to ${run.heldRows.length}.` : "";

    if (run.state === "clean") {
      say(`All ${run.rowsSeen} rows are clean — nothing to fix.${compare} Continue when you are ready and I'll take you to review.`);
    } else if (run.state === "warnings_only") {
      say(
        `No rows are held. ${run.result?.warnings ?? 0} things are worth a look, but none of them stop the push.${compare} Say "fix" if you want me to propose changes anyway.`,
      );
    } else if (run.state === "partial") {
      say(
        `${run.cleanRows.length} rows are ready. ${run.heldRows.length} rows are held on rows ${run.heldRows.slice(0, 8).join(", ")}${run.heldRows.length > 8 ? "…" : ""}.${compare} You can continue with the ready ones, ask me to propose fixes, or park the held rows and come back.`,
      );
    } else {
      say(
        `Every row is held.${compare} Say "fix" and I'll show you what I would change and where each value comes from — I won't apply anything on my own.`,
      );
    }
  };

  const handleFile = async (file: File) => {
    const sizeKb = file.size / 1024;
    const prev = ec.runs.length ? ec.runs[ec.runs.length - 1] : null;
    setMessages((m) => [...m, { role: "user", text: `Uploaded ${file.name}.` }]);

    if (file.size > MAX_MB * 1024 * 1024) {
      say(`That file is ${(sizeKb / 1024).toFixed(1)} MB and the limit here is ${MAX_MB} MB. Split it into two sheets and upload them one after the other.`);
      return;
    }
    if (!/\.(xlsx|xlsm|csv)$/i.test(file.name)) {
      say("I can only read .xlsx, .xlsm or .csv files. Save your sheet in one of those formats and upload it again.");
      return;
    }

    setParsing(true);
    try {
      const parsed = await parseWorkbook(file);
      const missing = parsed.headerMismatch
        ? CANONICAL_HEADERS.filter((h) => !parsed.rows.some((r) => String((r as unknown as Record<string, unknown>)[h] ?? "") !== ""))
        : [];
      const run = buildRun({
        fileName: file.name,
        sizeKb,
        rows: parsed.rows,
        label: prev ? `Re-upload ${ec.runs.length + 1}` : "Original file",
        parentId: prev?.id,
        missingColumns: missing,
        error: parsed.headerMismatch && parsed.rows.length === 0 ? "The columns do not match the template." : undefined,
        errorState: parsed.headerMismatch && parsed.rows.length === 0 ? "wrong_shape" : undefined,
      });
      registerRun(run, prev);
    } catch (err) {
      const run = buildRun({
        fileName: file.name,
        sizeKb,
        rows: [],
        error: err instanceof Error ? err.message : "The file could not be read.",
      });
      registerRun(run, prev);
    }
    setParsing(false);
  };

  const useSamplePlan = () => {
    const rows: BatchRow[] = SAMPLE_BATCH_ROWS.map((s, i) => ({
      id: `sample-${i}`, row: i + 1,
      sub_category: s.subCategory, brand_name: s.brandName, platform: s.platform,
      campaign_name: s.campaignName, end_date: s.endDate, budget_type: s.budgetType,
      budget_value: s.budgetValue, cities: s.cities, product_id: s.productIds,
      targeting_details: s.targetingDetails, currency: s.currency, selected: true,
    }));
    setMessages((m) => [...m, { role: "user", text: "Use last month's plan." }]);
    registerRun(buildRun({ fileName: "last_months_plan.xlsx", sizeKb: 24, rows, label: "Last month's plan" }), latest);
  };

  /* ── Fix with AI: proposals only ── */
  const openFixes = () => {
    const proposals = proposalsFor(ec.result, ec.rows);
    if (!proposals.length) {
      say("There is nothing here I can propose a value for. What is left needs your decision — open Why on a row to see exactly what to change.");
      return;
    }
    setFixing(proposals);
    say(`Here is what I would change — ${proposals.length} suggestions, each with the list it came from. Accept, edit or skip any of them.`);
  };

  const applyFixes = (accepted: { proposal: FixProposal; value: string }[]) => {
    let next = ec.rows;
    for (const a of accepted) next = applyProposal(next, a.proposal, a.value);
    const prev = latest;
    const run = rerun(
      prev ?? buildRun({ fileName: ec.fileName ?? "batch", sizeKb: 0, rows: next }),
      next,
      `After fixes ${ec.runs.length + 1}`,
    );
    setFixing(null);
    setMessages((m) => [...m, { role: "user", text: `Apply ${accepted.length} changes.` }]);
    registerRun(run, prev);
  };

  const holdRemaining = () => {
    if (!latest) return;
    const heldRows = ec.rows.filter((r) => latest.heldRows.includes(r.row));
    ec.holdRows(heldRows, ec.result, latest.fileName, `Parked from ${latest.label}`);
    const { kept, dropped } = ec.keepOnlyCleanRows();
    say(`Parked ${dropped} held rows with their findings and any overrides. ${kept} rows stay in this batch. You can reopen the parked rows from Held batches at any time — they are not deleted.`);
  };

  const continueClean = () => {
    if (latest && latest.heldRows.length) holdRemaining();
    navigate("/ecom/campaigns/create/review");
  };

  /* ── Recommendations ── */
  const openRecommendations = () => {
    setSkuPicker(true);
    setRecos(null);
    setPickedSkus([]);
    setMessages((m) => [
      ...m,
      { role: "user", text: "Recommendation" },
      { role: "assistant", text: "Which SKUs should I look at? Search by product name, code or platform and pick as many as you like." },
    ]);
  };

  const skuResults = useMemo(() => searchSkus(skuQuery, 40), [skuQuery]);

  const generateRecos = () => {
    if (!pickedSkus.length) return;
    const list = pickedSkus.flatMap((s) => recommendationsForSku(s));
    setRecos(list);
    setChosenRecos(new Set(list.map((r) => r.id)));
    setSkuPicker(false);
    setMessages((m) => [
      ...m,
      { role: "user", text: `Recommendations for ${pickedSkus.map((s) => s.name).join(", ")}.` },
      { role: "assistant", text: `${list.length} recommendations across ${pickedSkus.length} SKU${pickedSkus.length > 1 ? "s" : ""}, covering budget, cities, keywords and bids. Pick the ones you want and I'll turn them into rows and check them.` },
    ]);
  };

  const acceptRecos = () => {
    const picked = (recos ?? []).filter((r) => chosenRecos.has(r.id));
    if (!picked.length) return;
    const next = [
      ...ec.rows,
      ...picked.map((r, i) => ({ ...r.draft, id: `reco-${Date.now()}-${i}`, row: ec.rows.length + i + 1 } as BatchRow)),
    ];
    setRecos(null);
    setMessages((m) => [...m, { role: "user", text: `Create ${picked.length} recommended campaign${picked.length > 1 ? "s" : ""}.` }]);
    registerRun(
      buildRun({ fileName: ec.fileName ?? "recommendations", sizeKb: latest?.sizeKb ?? 0, rows: next, label: "With recommendations", parentId: latest?.id }),
      latest,
    );
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text }]);

    if (/recommend/i.test(text)) return openRecommendations();
    if (/template/i.test(text)) { downloadTemplate(); return say("Downloaded the template with the format and example rows."); }
    if (/download|corrected|export/i.test(text) && ec.rows.length) {
      downloadCorrected(ec.rows);
      return say("Downloaded the sheet as it stands now, so you can compare it with the original.");
    }
    if (/push .*(clean|ready)|only .*(clean|ready)/i.test(text) && ec.result) return continueClean();
    if (/park|hold|later/i.test(text) && latest?.heldRows.length) return holdRemaining();
    if (/fix|repair|correct/i.test(text)) return openFixes();
    if (/explain row (\d+)/i.exec(text)) {
      const n = Number(/explain row (\d+)/i.exec(text)![1]);
      const f = (ec.result?.findings ?? []).filter((x) => x.row === n);
      return say(
        f.length
          ? `Row ${n}: ${f.map((x) => `${x.field} — ${x.message}`).join(" ")}`
          : `Row ${n} has nothing open against it.`,
      );
    }
    say(
      ec.rows.length
        ? 'I can propose fixes ("fix"), park held rows ("park them"), download the sheet as it stands, or take the ready rows to review.'
        : "Upload your batch sheet, take the template, or press Recommendation and I'll build rows from your SKUs.",
    );
  };

  const chips = [
    { label: "Recommendation", icon: Lightbulb, onClick: openRecommendations },
    { label: "Upload File", icon: Upload, onClick: () => fileRef.current?.click() },
    { label: "Download template", icon: Download, onClick: downloadTemplate },
    { label: "Use last month's plan", icon: FileSpreadsheet, onClick: useSamplePlan },
  ];

  if (!started) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header onBack={() => navigate("/ecom/campaigns/create")} />
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-sw-purple-dim flex items-center justify-center mb-5">
            <Sparkles size={28} className="text-sw-purple" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">AI Campaign Creator</h1>
          <p className="text-sm text-muted-foreground mt-3 max-w-md leading-relaxed">
            Upload a batch sheet or ask for recommendations by SKU. Every row is checked before anything is pushed, and nothing is created on your behalf.
          </p>
          <button onClick={() => setStarted(true)} className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
            Start Conversation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        onBack={() => navigate("/ecom/campaigns/create")}
        right={
          <div className="flex items-center gap-3">
            {ec.held.length > 0 && (
              <button onClick={() => navigate("/ecom/campaigns/create/held")} className="text-[11px] text-sw-amber hover:underline">
                {ec.held.length} held batch{ec.held.length > 1 ? "es" : ""}
              </button>
            )}
            <button
              onClick={() => { ec.reset(); setMessages([{ role: "assistant", text: FIRST_MESSAGE }]); setRecos(null); setSkuPicker(false); setFixing(null); }}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <RotateCcw size={12} /> Start Over
            </button>
          </div>
        }
      />

      <div
        className={`flex-1 overflow-y-auto px-4 py-6 ${dragOver ? "outline-dashed outline-2 outline-primary" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) void handleFile(f); }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-primary text-primary-foreground" : "max-w-[85%] px-4 py-2.5 text-foreground"}>
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}

          {parsing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-4">
              <Loader2 size={13} className="animate-spin" /> Reading the sheet…
            </div>
          )}

          {/* Upload lineage — every version stays */}
          {ec.runs.map((run, i) => (
            <EcomFileCard
              key={run.id}
              run={run}
              isLatest={i === ec.runs.length - 1 && !fixing}
              onFixWithAi={openFixes}
              onContinueClean={continueClean}
              onHold={holdRemaining}
              onReupload={() => fileRef.current?.click()}
              onDownloadTemplate={downloadTemplate}
            />
          ))}

          {fixing && (
            <EcomFixProposal
              proposals={fixing}
              manual={manualDecisions(ec.result)}
              onApply={applyFixes}
              onCancel={() => { setFixing(null); say("Left everything as it was."); }}
            />
          )}

          {/* SKU picker */}
          {skuPicker && (
            <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-2.5 border-b border-subtle bg-surface-2">
                <Search size={13} className="text-muted-foreground" />
                <input
                  autoFocus
                  value={skuQuery}
                  onChange={(e) => setSkuQuery(e.target.value)}
                  placeholder="Search SKU by name, code or platform…"
                  className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
                />
                <button onClick={() => setSkuPicker(false)} className="text-muted-foreground hover:text-foreground" aria-label="Close">
                  <X size={13} />
                </button>
              </div>
              <div className="max-h-[240px] overflow-y-auto divide-y divide-subtle">
                {skuResults.map((p) => {
                  const on = pickedSkus.some((s) => s.code === p.code && s.platform === p.platform);
                  return (
                    <button
                      key={`${p.platform}-${p.code}`}
                      onClick={() => setPickedSkus((prev) => (on ? prev.filter((s) => !(s.code === p.code && s.platform === p.platform)) : [...prev, p]))}
                      className="w-full flex items-center gap-3 px-4 py-2 text-left hover:bg-surface-2"
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center ${on ? "bg-primary border-primary" : "border-border-visible"}`}>
                        {on && <Check size={11} className="text-primary-foreground" />}
                      </span>
                      <span className="flex-1 min-w-0 text-xs text-foreground truncate">{p.name}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">{p.code}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{platformDisplay(p.platform)}</span>
                    </button>
                  );
                })}
                {skuResults.length === 0 && <p className="px-4 py-4 text-xs text-muted-foreground">No SKUs match that search.</p>}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-subtle bg-surface-2">
                <span className="text-[11px] text-muted-foreground">{pickedSkus.length} selected</span>
                <button onClick={generateRecos} disabled={!pickedSkus.length}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
                  Get recommendations
                </button>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recos && recos.length > 0 && (
            <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 text-xs font-medium text-foreground">
                Recommendations from Ecom Analytics
              </div>
              <div className="max-h-[360px] overflow-y-auto divide-y divide-subtle">
                {recos.map((r) => {
                  const on = chosenRecos.has(r.id);
                  return (
                    <div key={r.id} className="px-4 py-3 flex items-start gap-3">
                      <button
                        onClick={() => setChosenRecos((prev) => { const n = new Set(prev); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); return n; })}
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${on ? "bg-primary border-primary" : "border-border-visible"}`}
                        aria-label="Toggle recommendation"
                      >
                        {on && <Check size={11} className="text-primary-foreground" />}
                      </button>
                      <div className="flex-1 min-w-0 text-xs">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-primary/15 text-primary text-[10px] font-medium">{recoKindLabel(r.kind)}</span>
                          <span className="text-foreground font-medium truncate">{r.sku.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-surface-3 text-muted-foreground">{platformDisplay(r.sku.platform)}</span>
                        </div>
                        <p className="text-muted-foreground mt-1">What we saw: {r.signal}</p>
                        <p className="text-foreground mt-0.5">{r.action}</p>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">{r.impact}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-subtle bg-surface-2">
                <span className="text-[11px] text-muted-foreground">{chosenRecos.size} selected</span>
                <button onClick={acceptRecos} disabled={!chosenRecos.size}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
                  Add as campaign rows
                </button>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-subtle bg-surface-1 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            {chips.map((c) => (
              <button key={c.label} onClick={c.onClick}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] bg-surface-2 border border-subtle text-foreground hover:border-primary/40">
                <c.icon size={12} /> {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me to fix something, park held rows, or explain row 4…"
              className="flex-1 bg-surface-2 border border-subtle rounded-xl px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary/50"
            />
            <button onClick={send} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Send">
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".xlsx,.xlsm,.csv"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleFile(f); e.target.value = ""; }}
      />
    </div>
  );
};

const Header: React.FC<{ onBack: () => void; right?: React.ReactNode }> = ({ onBack, right }) => (
  <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
    <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
      <ArrowLeft size={16} />
    </button>
    <div className="w-8 h-8 rounded-lg bg-sw-purple-dim flex items-center justify-center">
      <Sparkles size={15} className="text-sw-purple" />
    </div>
    <h1 className="font-display font-bold text-sm text-foreground">AI Campaign Creator</h1>
    <div className="ml-auto">{right}</div>
  </div>
);

export default FlowAiView;
