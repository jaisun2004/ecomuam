import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { History, PenLine, Sparkles, X } from "lucide-react";
import { useEcomCreate } from "./EcomCreateContext";

const CampaignCreateEntry: React.FC = () => {
  const navigate = useNavigate();
  const { reset } = useEcomCreate();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") navigate("/"); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const cards = [
    { key: "ai", icon: Sparkles, label: "Autonomous AI", desc: "Chat or upload a batch sheet — AI validates and fixes it with you", cls: "text-sw-purple bg-sw-purple-dim" },
    { key: "copy", icon: History, label: "From History", desc: "Clone a past campaign configuration and adjust it", cls: "text-primary bg-primary/15" },
    { key: "manual", icon: PenLine, label: "Manual Entry", desc: "Fill a guided five-step form yourself", cls: "text-muted-foreground bg-surface-3" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => navigate("/")}>
      <div className="bg-surface-1 border border-border-visible rounded-2xl w-[760px] max-w-[92vw] shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-subtle">
          <div>
            <h1 className="font-display font-bold text-lg text-foreground">Autonomous Campaign Creator</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your campaign creation method</p>
          </div>
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Close">
            <X size={16} />
          </button>
        </div>
        <div className="p-6 grid grid-cols-3 gap-4">
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={() => { reset(); navigate(`/ecom/campaigns/create/${c.key}`); }}
              className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-subtle bg-surface-2 hover:border-primary/40 hover:bg-surface-3 transition-all"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${c.cls}`}>
                <c.icon size={24} />
              </div>
              <span className="font-display font-bold text-sm text-foreground">{c.label}</span>
              <span className="text-[11px] text-muted-foreground text-center leading-relaxed">{c.desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignCreateEntry;
