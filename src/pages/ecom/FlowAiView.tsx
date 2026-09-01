import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, Download, FileSpreadsheet, Lightbulb, Loader2, RotateCcw, Search, Send, Sparkles, Upload, X } from "lucide-react";
import EcomQcPanel from "@/components/ecom/EcomQcPanel";
import { useEcomCreate } from "./EcomCreateContext";
import { downloadCorrected, downloadTemplate, parseWorkbook } from "./xlsx-utils";
import { SAMPLE_BATCH_ROWS } from "@/lib/ecom-reference/workbook-data";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { fixableCount, partitionRows } from "@/lib/ecom-qc/engine";
import { recoKindLabel, recommendationsForSku, searchSkus, type SkuRecommendation } from "@/lib/ecom-qc/recommendations";
import { platformDisplay } from "@/lib/ecom-reference/platforms";
import type { RefProduct } from "@/lib/ecom-reference/workbook-data";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  text: string;
  file?: { name: string; size: string; rows: number };
}

const FIRST_MESSAGE =
  "Hi! I'm your AI campaign assistant. Upload a batch import sheet and I'll check every row against the QC rule catalog, or hit Recommendation and I'll build campaigns for the SKUs you pick using Ecom Analytics signals.";

const FlowAiView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: FIRST_MESSAGE }]);
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [qcShown, setQcShown] = useState(false);
  const [skuPicker, setSkuPicker] = useState(false);
  const [skuQuery, setSkuQuery] = useState("");
  const [pickedSkus, setPickedSkus] = useState<RefProduct[]>([]);
  const [recos, setRecos] = useState<SkuRecommendation[] | null>(null);
  const [chosenRecos, setChosenRecos] = useState<Set<string>>(new Set());
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, qcShown, ec.deepPending, recos, skuPicker]);

  useEffect(() => {
    const handler = (e: Event) => {
      const f = (e as CustomEvent<File>).detail;
      if (f) handleFile(f);
    };
    window.addEventListener("ecom-reupload", handler);
    return () => window.removeEventListener("ecom-reupload", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") navigate("/ecom/campaigns/create"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  /* ── QC verdict messaging (edge cases) ── */
  const verdictKey = useRef<string>("");
  useEffect(() => {
    const r = ec.result;
    if (!r || !qcShown || ec.deepPending) return;
    const key = `${ec.rows.length}|${r.blockers}|${r.warnings}|${r.score}`;
    if (verdictKey.current === key) return;
    verdictKey.current = key;

    const { clean, blocked } = partitionRows(ec.rows, r);
    const fixable = fixableCount(r);
    let text: string;
    if (r.blockers === 0 && r.warnings === 0) {
      text = `All ${ec.rows.length} rows passed every QC check — score ${r.score}/100. Nothing to fix. Continue to Review & Push whenever you're ready.`;
    } else if (r.blockers === 0) {
      text = `No blockers — all ${ec.rows.length} rows can be pushed. ${r.warnings} warnings are worth a quick look (they won't stop the push). Say "fix" and I'll clean the ones with a safe suggestion, or continue to Review & Push.`;
    } else if (clean.length > 0) {
      text = `${clean.length} of ${ec.rows.length} rows are clean and ready to push. ${blocked.length} rows are blocked by ${r.blockers} findings${fixable ? `, and ${fixable} of them I can fix automatically — just say "fix the blockers"` : ""}. You can also say "push the clean rows" and I'll drop the ${blocked.length} blocked rows so you can re-upload them corrected later.`;
    } else {
      text = `Every row is blocked — ${r.blockers} blocking findings across ${ec.rows.length} rows.${fixable ? ` ${fixable} have a safe automatic fix; say "fix the blockers" and I'll apply them and re-run QC.` : " These need a manual decision — open a finding and use Show rule to see exactly what to change, then re-upload."}`;
    }
    setMessages((m) => [...m, { role: "assistant", text }]);
  }, [ec.result, ec.deepPending, ec.rows, qcShown]);

  const runChecks = (rows: BatchRow[], fileName?: string) => {
    ec.setRows(rows);
    if (fileName) ec.setFileName(fileName);
    setQcShown(true);
    verdictKey.current = "";
    setTimeout(() => { ec.runLive(); ec.runDeep(); }, 50);
  };

  const handleFile = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error("File exceeds the 10 MB cap."); return; }
    setParsing(true);
    try {
      const parsed = await parseWorkbook(file);
      if (parsed.rows.length === 0) { toast.error("No campaign rows found in batch_import."); setParsing(false); return; }
      setMessages((m) => [
        ...m,
        { role: "user", text: "Uploaded a batch file.", file: { name: file.name, size: `${(file.size / 1024).toFixed(0)} KB`, rows: parsed.rows.length } },
        { role: "assistant", text: `Checking ${parsed.rows.length} rows against the QC rule catalog. Live checks are instant — deep checks (stock, wallet, duplicates) are running.` },
      ]);
      runChecks(parsed.rows, file.name);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not parse the file.");
      setMessages((m) => [...m, { role: "assistant", text: "I couldn't parse that file. Please use the template format — you can download it below." }]);
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
    setMessages((m) => [
      ...m,
      { role: "user", text: "Use last month's plan." },
      { role: "assistant", text: `Loaded ${rows.length} rows from last month's plan. Running QC now.` },
    ]);
    runChecks(rows, "last_months_plan.xlsx");
  };

  /* ── Recommendation flow ── */
  const openRecommendations = () => {
    setSkuPicker(true);
    setRecos(null);
    setPickedSkus([]);
    setMessages((m) => [
      ...m,
      { role: "user", text: "Recommendation" },
      { role: "assistant", text: "Which SKUs should I look at? Search by product name, SKU code or platform and pick as many as you like — I'll pull the latest Ecom Analytics signals (pacing, stock, rank, ACoS) for each one." },
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
      { role: "assistant", text: `Here are ${list.length} recommendations across ${pickedSkus.length} SKU${pickedSkus.length > 1 ? "s" : ""}, grouped by budget, city, keywords and bid changes. Pick the ones you want and I'll turn them into batch rows and run QC on them.` },
    ]);
  };

  const acceptRecos = () => {
    const picked = (recos ?? []).filter((r) => chosenRecos.has(r.id));
    if (!picked.length) return;
    ec.addRows(picked.map((r) => r.draft));
    setRecos(null);
    setQcShown(true);
    verdictKey.current = "";
    setMessages((m) => [
      ...m,
      { role: "user", text: `Create ${picked.length} recommended campaign${picked.length > 1 ? "s" : ""}.` },
      { role: "assistant", text: `Added ${picked.length} rows built from those recommendations and re-ran QC on the whole batch.` },
    ]);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", text }];
    if (/recommend/i.test(text)) {
      setInput("");
      setMessages(next);
      openRecommendations();
      return;
    }
    if (/push .*clean|only .*clean|drop .*blocked/i.test(text) && ec.result) {
      const { kept, dropped } = ec.keepOnlyCleanRows();
      next.push({
        role: "assistant",
        text: dropped > 0
          ? `Kept the ${kept} clean rows and dropped ${dropped} blocked rows. You can push these now and re-upload the corrected rows as a second batch.`
          : "Nothing to drop — every row is already clean.",
      });
    } else if (/fix|repair|correct|clean/i.test(text) && ec.result) {
      const before = ec.result.blockers;
      const n = ec.applyAllFixes();
      next.push({
        role: "assistant",
        text: n > 0
          ? `Applied ${n} deterministic fixes (values swapped to the suggested valid ones) and re-ran QC on all ${ec.rows.length} rows. ${before ? "Anything still blocking needs a manual choice — open it and use Show rule." : ""} Download the corrected workbook if you want to audit the changes cell by cell.`
          : "There's nothing I can fix automatically right now — the open findings need a manual choice. Use “Fix inline” on a finding, or open Show rule to see exactly what to change.",
      });
    } else if (/download|export|corrected/i.test(text) && ec.rows.length) {
      downloadCorrected(ec.rows);
      next.push({ role: "assistant", text: "Downloaded the corrected workbook so you can audit every change cell by cell." });
    } else if (/template/i.test(text)) {
      downloadTemplate();
      next.push({ role: "assistant", text: "Here's the batch import template with the format and example rows included." });
    } else {
      next.push({
        role: "assistant",
        text: ec.rows.length
          ? "I can fix findings deterministically — try “fix the blockers” — or push only the clean rows with “push the clean rows”. When only warnings remain, continue to Review & Push."
          : "Upload your batch import sheet (or grab the template) and I'll validate every row. You can also hit Recommendation and I'll build campaigns for the SKUs you choose.",
      });
    }
    setMessages(next);
  };

  const chips = [
    { label: "Recommendation", icon: Lightbulb, onClick: openRecommendations },
    { label: "Upload File", icon: Upload, onClick: () => fileRef.current?.click() },
    { label: "Download template", icon: Download, onClick: downloadTemplate },
    { label: "Use last month's plan", icon: FileSpreadsheet, onClick: useSamplePlan },
  ];

  /* ── Welcome state ── */
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
            Upload a batch import sheet or ask for recommendations by SKU. I'll validate every row against the QC rules and help you fix what fails — before anything goes live.
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-6 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
          >
            Start Conversation
          </button>
        </div>
      </div>
    );
  }

  /* ── Conversation state ── */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header
        onBack={() => navigate("/ecom/campaigns/create")}
        right={
          <button
            onClick={() => { ec.reset(); setMessages([{ role: "assistant", text: FIRST_MESSAGE }]); setQcShown(false); setRecos(null); setSkuPicker(false); verdictKey.current = ""; }}
            className="flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <RotateCcw size={12} /> Start Over
          </button>
        }
      />
      <div
        className={`flex-1 overflow-y-auto px-4 py-6 ${dragOver ? "outline-dashed outline-2 outline-primary" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
      >
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={m.role === "user" ? "max-w-[80%] rounded-2xl rounded-br-sm px-4 py-2.5 bg-primary text-primary-foreground" : "max-w-[80%] px-4 py-2.5 text-foreground"}>
                {m.file && (
                  <div className="flex items-center gap-2 mb-1.5 text-[11px] font-mono opacity-90">
                    <FileSpreadsheet size={13} /> {m.file.name} · {m.file.size} · {m.file.rows} rows
                  </div>
                )}
                <p className="text-sm leading-relaxed">{m.text}</p>
              </div>
            </div>
          ))}

          {parsing && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground px-4">
              <Loader2 size={13} className="animate-spin" /> Parsing workbook…
            </div>
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
                      onClick={() =>
                        setPickedSkus((prev) =>
                          on ? prev.filter((s) => !(s.code === p.code && s.platform === p.platform)) : [...prev, p],
                        )
                      }
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
                <button
                  onClick={generateRecos}
                  disabled={!pickedSkus.length}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  Get recommendations
                </button>
              </div>
            </div>
          )}

          {/* Recommendations */}
          {recos && recos.length > 0 && (
            <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
              <div className="px-4 py-2.5 border-b border-subtle bg-surface-2 text-xs font-medium text-foreground">
                Ecom Analytics recommendations
              </div>
              <div className="max-h-[360px] overflow-y-auto divide-y divide-subtle">
                {recos.map((r) => {
                  const on = chosenRecos.has(r.id);
                  return (
                    <div key={r.id} className="px-4 py-3 flex items-start gap-3">
                      <button
                        onClick={() =>
                          setChosenRecos((prev) => {
                            const n = new Set(prev);
                            if (n.has(r.id)) n.delete(r.id); else n.add(r.id);
                            return n;
                          })
                        }
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
                          <span className="ml-auto flex items-center gap-0.5" title={`Confidence ${r.confidence}/5`}>
                            {[1, 2, 3, 4, 5].map((d) => (
                              <span key={d} className={`w-1.5 h-1.5 rounded-full ${d <= r.confidence ? "bg-sw-green" : "bg-surface-3"}`} />
                            ))}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1">Signal: {r.signal}</p>
                        <p className="text-foreground mt-0.5">{r.action}</p>
                        <p className="text-muted-foreground mt-0.5 text-[11px]">Expected: {r.impact}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-subtle bg-surface-2">
                <span className="text-[11px] text-muted-foreground">{chosenRecos.size} selected</span>
                <button
                  onClick={acceptRecos}
                  disabled={!chosenRecos.size}
                  className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40"
                >
                  Create these campaigns
                </button>
              </div>
            </div>
          )}

          {qcShown && (
            <EcomQcPanel
              result={ec.result}
              deepPending={ec.deepPending}
              onFix={ec.applyFix}
              onContinue={() => { ec.setSource("ai"); navigate("/ecom/campaigns/create/review"); }}
            />
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Composer */}
      <div className="border-t border-subtle bg-surface-1 px-4 py-3">
        <div className="max-w-3xl mx-auto space-y-2.5">
          <div className="flex gap-2 flex-wrap">
            {chips.map((c) => (
              <button key={c.label} onClick={c.onClick} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium bg-surface-3 text-foreground hover:bg-primary/15 hover:text-primary transition-all">
                <c.icon size={12} /> {c.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask me to fix findings, push only the clean rows, or recommend campaigns…"
              className="flex-1 bg-surface-2 border border-subtle rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <button onClick={send} className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90" aria-label="Send">
              <Send size={16} />
            </button>
          </div>
        </div>
        <input ref={fileRef} type="file" accept=".xlsx,.xlsm,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
      </div>
    </div>
  );
};

export const Header: React.FC<{ onBack: () => void; right?: React.ReactNode }> = ({ onBack, right }) => {
  const navigate = useNavigate();
  return (
  <div className="flex items-center justify-between px-4 py-3 border-b border-subtle bg-surface-1">
    <div className="flex items-center gap-3">
      <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
        <ArrowLeft size={16} />
      </button>
      <div className="w-8 h-8 rounded-lg bg-sw-purple-dim flex items-center justify-center">
        <Sparkles size={15} className="text-sw-purple" />
      </div>
      <div>
        <div className="flex items-center gap-2">
          <h1 className="font-display font-bold text-sm text-foreground">AI Campaign Creator</h1>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-sw-purple-dim text-sw-purple">AI-Guided</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Conversational campaign setup</p>
      </div>
    </div>
    <div className="flex items-center gap-3">
      {right}
      <button onClick={() => navigate("/ecom/campaigns/create/manual")} className="text-[11px] text-primary hover:underline">
        Switch to Manual
      </button>
    </div>
  </div>
  );
};

export default FlowAiView;
