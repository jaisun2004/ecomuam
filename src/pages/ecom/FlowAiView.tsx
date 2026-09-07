import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Check, Download, FileSpreadsheet, Lightbulb, Loader2, PenLine, RotateCcw, Search, Send, Sparkles, Upload, X,
} from "lucide-react";
import EcomFileCard from "@/components/ecom/EcomFileCard";
import EcomRecoCard from "@/components/ecom/EcomRecoCard";
import EcomFixProposal from "@/components/ecom/EcomFixProposal";
import EcomReviewCard from "@/components/ecom/EcomReviewCard";
import EcomHeldList from "@/components/ecom/EcomHeldList";
import { useEcomCreate } from "./EcomCreateContext";
import { downloadCorrected, downloadTemplate, parseWorkbook, CANONICAL_HEADERS } from "./xlsx-utils";
import { SAMPLE_BATCH_ROWS } from "@/lib/ecom-reference/workbook-data";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { buildRun, rerun, type SheetRun } from "@/lib/ecom-qc/sheet-run";
import { applyProposal, manualDecisions, proposalsFor, type FixProposal } from "@/lib/ecom-qc/fix-proposals";
import { recommendationsForSku, searchSkus, type SkuRecommendation } from "@/lib/ecom-qc/recommendations";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import type { RefProduct } from "@/lib/ecom-reference/workbook-data";

interface Msg {
  role: "user" | "assistant";
  text: string;
  runId?: string;
}

const FIRST_MESSAGE =
  "Upload your campaign sheet and I'll check every row, or press Recommendation and I'll build campaigns for the products you pick.";

const MAX_MB = 10;

const n = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const FlowAiView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const started = ec.chat.started;
  const setStarted = (v: boolean) => ec.setChat((c) => ({ ...c, started: v }));
  const messages: Msg[] = ec.chat.messages.length ? ec.chat.messages : [{ role: "assistant", text: FIRST_MESSAGE }];
  const setMessages = (fn: (m: Msg[]) => Msg[]) => ec.setChat((c) => ({ ...c, messages: fn(c.messages.length ? c.messages : [{ role: "assistant", text: FIRST_MESSAGE }]) }));
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [fixing, setFixing] = useState<FixProposal[] | null>(null);
  const [skuPicker, setSkuPicker] = useState(false);
  const [skuQuery, setSkuQuery] = useState("");
  const [pickedSkus, setPickedSkus] = useState<RefProduct[]>([]);
  const [recos, setRecos] = useState<SkuRecommendation[] | null>(null);
  const reviewing = ec.chat.reviewing;
  const setReviewing = (v: boolean) => ec.setChat((c) => ({ ...c, reviewing: v }));
  const [showHeld, setShowHeld] = useState(false);
  const [chosenRecos, setChosenRecos] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const latest: SheetRun | null = ec.runs.length ? ec.runs[ec.runs.length - 1] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, ec.runs, recos, skuPicker, fixing, reviewing, showHeld]);

  useEffect(() => {
    const handler = (e: Event) => {
      const f = (e as CustomEvent<File>).detail;
      if (f) void handleFile(f);
    };
    window.addEventListener("ecom-reupload", handler);
    return () => window.removeEventListener("ecom-reupload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ec.runs]);

  const say = (text: string) => setMessages((m) => [...m, { role: "assistant", text }]);

  const registerRun = (run: SheetRun, previous: SheetRun | null, unit: "row" | "campaign" = "row") => {
    ec.addRun(run);
    ec.setFileName(unit === "row" ? run.fileName : null);
    ec.setSource("ai");
    ec.recheck(run.rows);

    if (run.state === "file_error" || run.state === "wrong_shape" || run.state === "empty") {
      setRecos(null);
      setReviewing(false);
      say(
        run.missingColumns.length
          ? `I couldn't use that file. These columns are missing or renamed: ${run.missingColumns.join(", ")}. The template has them in the right order — grab it below and try again.`
          : `I couldn't use that file. ${run.error ?? "It has no readable rows."} Nothing has changed here, so you can upload again whenever you like.`,
      );
      return;
    }

    const prevBlocked = previous?.heldRows.length ?? null;
    const compare =
      prevBlocked !== null ? ` Compared with the last version, held ${unit}s went from ${prevBlocked} to ${run.heldRows.length}.` : "";
    const fixHint = unit === "row" ? "" : "";

    if (run.state === "clean") {
      say(`All ${n(run.rowsSeen, unit)} passed the checks — nothing to fix.${compare} Continue when you are ready and I'll take you to review.`);
    } else if (run.state === "warnings_only") {
      say(
        `Nothing is held. ${n(run.result?.warnings ?? 0, "thing")} worth a look, but none of them stop the push.${compare} Say "fix" if you want me to propose changes anyway.`,
      );
    } else if (run.state === "partial") {
      say(
        `${n(run.cleanRows.length, unit)} ready, ${n(run.heldRows.length, unit)} held.${compare} You can continue with the ready ones, ask me to propose fixes, or park the held ones and come back.${fixHint}`,
      );
    } else {
      say(
        `Every ${unit} is held.${compare} Say "fix" and I'll show you what I would change and where each value comes from — I won't apply anything on my own.`,
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
      say("Nothing here has a safe value I can fill in. Open Why on a line to see what to change.");
      return;
    }
    setFixing(proposals);
    say(`${n(proposals.length, "change")} suggested. Accept, edit or skip any of them.`);

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
    if (!latest || !latest.heldRows.length) {
      say("There is nothing held right now.");
      return;
    }
    const unit = ec.countsRows ? "row" : "campaign";
    const heldRows = ec.rows.filter((r) => latest.heldRows.includes(r.row));
    ec.holdRows(heldRows, ec.result, latest.fileName, `Parked from ${latest.label}`);
    const { kept, dropped } = ec.keepOnlyCleanRows();
    setShowHeld(true);
    say(`Parked ${n(dropped, unit)}. ${n(kept, unit)} stay here. Reopen them any time from Held batches.`);
  };

  const continueClean = () => {
    if (!latest) return;
    const unit = ec.countsRows ? "row" : "campaign";
    const ready = latest.cleanRows.length;
    if (!window.confirm(`Create ${n(ready, unit === "row" ? "campaign" : unit)}?`)) return;
    if (latest.heldRows.length) holdRemaining();
    setShowHeld(false);
    setReviewing(true);
  };

  /* ── Recommendations ── */
  const openRecommendations = () => {
    setSkuPicker(true);
    setRecos(null);
    setPickedSkus([]);
    setMessages((m) => [
      ...m,
      { role: "user", text: "Recommendation" },
      { role: "assistant", text: "Which products should I look at? Search by name, code or platform and pick as many as you like." },
    ]);
  };

  const skuResults = useMemo(() => searchSkus(skuQuery, 40), [skuQuery]);

  const generateRecos = () => {
    if (!pickedSkus.length) return;
    const all = pickedSkus.flatMap((s) => recommendationsForSku(s));
    const list = all.filter((r) => !ec.usedRecos.includes(r.id));
    const alreadyDone = all.length - list.length;
    setSkuPicker(false);
    setMessages((m) => [...m, { role: "user", text: `Recommendations for ${pickedSkus.map((s) => s.name).join(", ")}.` }]);

    if (!list.length) {
      setRecos(null);
      say("Already added — every suggestion for those products has been used or dismissed.");
      return;
    }
    setRecos(list);
    setChosenRecos(new Set(list.map((r) => r.id)));
    say(
      `${n(list.length, "suggestion")} on price, cities and keywords.${alreadyDone ? ` ${alreadyDone} already used earlier, so they are not repeated.` : ""} Pick the ones you want.`,
    );
  };


  const acceptRecos = () => {
    const picked = (recos ?? []).filter((r) => chosenRecos.has(r.id));
    if (!picked.length) return;

    // One campaign per product and platform: suggestions on the same product are merged.
    const merged: BatchRow[] = [];
    const byKey = new Map<string, BatchRow>();
    picked.forEach((r) => {
      const d = r.draft as BatchRow;
      const key = `${d.platform}|${d.product_id}`;
      const existing = byKey.get(key);
      if (!existing) {
        const copy = { ...d } as BatchRow;
        byKey.set(key, copy);
        merged.push(copy);
        return;
      }
      const cities = new Set([...(existing.cities ?? "").split(";"), ...(d.cities ?? "").split(";")].map((c) => c.trim()).filter(Boolean));
      existing.cities = Array.from(cities).join(";");
      const kw = new Set([...(existing.targeting_details ?? "").split(";"), ...(d.targeting_details ?? "").split(";")].map((c) => c.trim()).filter(Boolean));
      existing.targeting_details = Array.from(kw).join("; ");
      existing.budget_value = String(Math.max(Number(existing.budget_value) || 0, Number(d.budget_value) || 0));
    });

    const next = [
      ...ec.rows,
      ...merged.map((d, i) => ({ ...d, id: `reco-${Date.now()}-${i}`, row: ec.rows.length + i + 1, origin: "reco" } as BatchRow)),
    ];
    setRecos(null);
    ec.markRecosUsed((recos ?? []).map((r) => r.id));
    setMessages((m) => [...m, { role: "user", text: `Create ${n(merged.length, "recommended campaign")}.` }]);

    registerRun(
      buildRun({ fileName: "Recommended campaigns", sizeKb: 0, rows: next, label: "Recommended campaigns", parentId: latest?.id }),
      latest,
      ec.fileName ? "row" : "campaign",
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
        : "Upload your campaign sheet, take the template, or press Recommendation and I'll build campaigns from your products.",
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
            Upload a campaign sheet or ask for recommendations by product. Everything is checked before anything is pushed, and nothing is created on your behalf.
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
              <button onClick={() => { setShowHeld((v) => !v); }} className="text-[11px] text-sw-amber hover:underline">
                {ec.held.length} held batch{ec.held.length > 1 ? "es" : ""}
              </button>
            )}
            <button
              onClick={() => {
                if (ec.rows.length && !window.confirm("Switch to manual entry? The rows in this chat stay here and you can come back to them.")) return;
                navigate("/ecom/campaigns/create/manual");
              }}
              className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
            >
              <PenLine size={12} /> Switch to manual entry
            </button>
            <button
              onClick={() => { ec.reset(); ec.setChat({ started: true, messages: [{ role: "assistant", text: FIRST_MESSAGE }], reviewing: false }); setRecos(null); setSkuPicker(false); setFixing(null); setShowHeld(false); }}
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
              unit={ec.countsRows ? "row" : "campaign"}
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
                  placeholder="Search products by name, code or platform…"
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
                {skuResults.length === 0 && <p className="px-4 py-4 text-xs text-muted-foreground">No products match that search.</p>}
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
              <div className="px-4 py-2.5 border-b border-subtle bg-surface-2">
                <p className="text-xs font-medium text-foreground">{recos.length} suggestion{recos.length > 1 ? "s" : ""}</p>
              </div>
              <div className="max-h-[440px] overflow-y-auto divide-y divide-subtle">
                {recos.map((r) => (
                  <EcomRecoCard
                    key={r.id}
                    reco={r}
                    selected={chosenRecos.has(r.id)}
                    onToggle={() =>
                      setChosenRecos((prev) => {
                        const n = new Set(prev);
                        if (n.has(r.id)) n.delete(r.id); else n.add(r.id);
                        return n;
                      })
                    }
                  />
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-subtle bg-surface-2">
                <span className="text-[11px] text-muted-foreground">{chosenRecos.size} selected</span>
                <button onClick={acceptRecos} disabled={!chosenRecos.size}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40">
                  Add {chosenRecos.size} campaign{chosenRecos.size === 1 ? "" : "s"}
                </button>
              </div>
            </div>
          )}

          {/* Held batches stay in the conversation */}
          {showHeld && (
            <div className="rounded-xl border border-sw-amber/30 bg-surface-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 flex items-center gap-2">
                <p className="text-xs font-medium text-foreground">Held batches</p>
                <span className="text-[10px] text-muted-foreground">Reopening re-checks them against today's data.</span>
                <button onClick={() => setShowHeld(false)} className="ml-auto text-muted-foreground hover:text-foreground" aria-label="Close">
                  <X size={13} />
                </button>
              </div>
              <div className="p-3">
                <EcomHeldList
                  onReopen={() => {
                    setShowHeld(false);
                    setReviewing(true);
                    say("Reopened those rows and checked them again. Here is the plan as it stands.");
                  }}
                />
              </div>
            </div>
          )}

          {/* Review is a card in the conversation, not another screen */}
          {reviewing && (
            <EcomReviewCard
              onBackToCheck={() => { setReviewing(false); say("Back to the check. Ask me to fix anything and we can come back to review."); }}
              onFixWithAi={() => { setReviewing(false); openFixes(); }}
              onDone={(summary) => say(summary)}
            />
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
              placeholder="Ask me to fix something, park what is held, or explain a check…"
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
