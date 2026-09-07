import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Archive } from "lucide-react";
import EcomHeldList from "@/components/ecom/EcomHeldList";

const HeldBatchView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex items-center gap-3 px-4 py-3 border-b border-subtle bg-surface-1">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground" aria-label="Back">
          <ArrowLeft size={16} />
        </button>
        <div className="w-8 h-8 rounded-lg bg-sw-amber-dim flex items-center justify-center">
          <Archive size={15} className="text-sw-amber" />
        </div>
        <div>
          <h1 className="font-display font-bold text-sm text-foreground">Held batches</h1>
          <p className="text-[10px] text-muted-foreground">Rows parked with their findings intact. Reopening re-checks them against today's data.</p>
        </div>
      </div>

      <div className="p-4 max-w-4xl mx-auto">
        <EcomHeldList onReopen={() => navigate("/ecom/campaigns/create/review")} />
      </div>
    </div>
  );
};

export default HeldBatchView;
