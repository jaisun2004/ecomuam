import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, FileSpreadsheet, Loader2, RotateCcw, Send, Sparkles, Upload } from "lucide-react";
import EcomQcPanel from "@/components/ecom/EcomQcPanel";
import { useEcomCreate } from "./EcomCreateContext";
import { downloadAnnotated, downloadCorrected, downloadTemplate, parseWorkbook } from "./xlsx-utils";
import { SAMPLE_BATCH_ROWS } from "@/lib/ecom-reference/workbook-data";
import type { BatchRow } from "@/lib/ecom-qc/types";
import { toast } from "sonner";

interface Msg {
  role: "user" | "assistant";
  text: string;
  file?: { name: string; size: string; rows: number };
}

const FIRST_MESSAGE =
  "Hi! I'm your AI campaign assistant. Upload a batch import sheet and I'll check every row against the QC rule catalog — or describe your plan and I'll build the rows with you.";

const FlowAiView: React.FC = () => {
  const navigate = useNavigate();
  const ec = useEcomCreate();
  const [started, setStarted] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ role: "assistant", text: FIRST_MESSAGE }]);
  const [input, setInput] = useState("");
  const [parsing, setParsing] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [qcShown, setQcShown] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, qcShown, ec.deepPending]);

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

  const runChecks = (rows: BatchRow[], fileName?: string) => {
    ec.setRows(rows);
    if (fileName) ec.setFileName(fileName);
    setQcShown(true);
    // live checks immediately, deep checks stream in
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

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const next: Msg[] = [...messages, { role: "user", text }];
    // chat repair intent
    if (/fix|repair|correct|clean/i.test(text) && ec.result) {
      const n = ec.applyAllFixes();
      next.push({
        role: "assistant",
        text: n > 0
          ? `Applied ${n} deterministic fixes to the sheet (values swapped to the suggested valid ones) and re-ran QC. Download the corrected workbook to audit the changes, or keep chatting.`
          : "There's nothing I can fix automatically right now — the open findings need a manual choice. Use “Fix inline” on a finding or edit the sheet.",
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
          ? "I can fix findings deterministically — try “fix the blockers” — or open a finding and use Fix inline. When only warnings remain, continue to Review & Push."
          : "Upload your batch import sheet (or grab the template) and I'll validate every row. You can also describe your plan in plain language.",
      });
    }
    setMessages(next);
  };

  const chips = [
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
            Upload a batch import sheet or describe your plan. I'll validate every row against the QC rules and help you fix what fails — before anything goes live.
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
            onClick={() => { ec.reset(); setMessages([{ role: "assistant", text: FIRST_MESSAGE }]); setQcShown(false); }}
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

          {qcShown && (
            <EcomQcPanel
              result={ec.result}
              deepPending={ec.deepPending}
              onFix={ec.applyFix}
              onDownloadAnnotated={() => downloadAnnotated(ec.rows, ec.result)}
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
              placeholder="Ask me to fix findings, or describe your campaign…"
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
      <button onClick={() => (window.location.href = "/ecom/campaigns/create/manual")} className="text-[11px] text-primary hover:underline">
        Switch to Manual
      </button>
    </div>
  </div>
);

export default FlowAiView;
