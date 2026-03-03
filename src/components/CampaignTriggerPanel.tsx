import { useState } from "react";
import { Zap, ChevronDown, ChevronUp, Rocket, Target, Shield, TrendingUp } from "lucide-react";

export interface CampaignTrigger {
  id: string;
  signal: string;
  signalDetail: string;
  strategy: string;
  campaignType: string;
  platforms: string[];
  keywords: string[];
  estimatedImpact: string;
  urgency: "critical" | "high" | "medium";
  icon: React.ReactNode;
}

interface CampaignTriggerPanelProps {
  triggers: CampaignTrigger[];
  title?: string;
}

const urgencyStyles = {
  critical: "border-destructive/30 bg-destructive/5",
  high: "border-warning/30 bg-warning/5",
  medium: "border-info/30 bg-info/5",
};

const urgencyBadge = {
  critical: "bg-destructive/10 text-destructive",
  high: "bg-warning/10 text-warning",
  medium: "bg-info/10 text-info",
};

const CampaignTriggerPanel = ({ triggers, title = "Auto-Campaign Triggers" }: CampaignTriggerPanelProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [launched, setLaunched] = useState<Set<string>>(new Set());

  const handleLaunch = (id: string) => {
    setLaunched(prev => new Set(prev).add(id));
  };

  return (
    <div className="rounded-xl border bg-card shadow-card p-5">
      <div className="flex items-center gap-2 mb-1">
        <Zap className="h-5 w-5 text-primary" />
        <h3 className="font-heading font-semibold text-foreground">{title}</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        AI-detected opportunities to auto-trigger campaigns on ecommerce & qcom platforms
      </p>

      <div className="space-y-3">
        {triggers.map((trigger) => {
          const isExpanded = expanded === trigger.id;
          const isLaunched = launched.has(trigger.id);

          return (
            <div
              key={trigger.id}
              className={`rounded-lg border p-4 transition-all ${urgencyStyles[trigger.urgency]}`}
            >
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : trigger.id)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-0.5">{trigger.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-foreground">{trigger.signal}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${urgencyBadge[trigger.urgency]}`}>
                        {trigger.urgency}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{trigger.signalDetail}</p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                )}
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-3 animate-fade-in">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-card/80 p-3 rounded-lg border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Strategy</p>
                      <p className="text-sm font-bold text-foreground">{trigger.strategy}</p>
                    </div>
                    <div className="bg-card/80 p-3 rounded-lg border border-border">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Campaign Type</p>
                      <p className="text-sm font-bold text-foreground">{trigger.campaignType}</p>
                    </div>
                  </div>

                  <div className="bg-card/80 p-3 rounded-lg border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Target Platforms</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trigger.platforms.map((p, i) => (
                        <span key={i} className="px-2 py-0.5 bg-primary/10 text-primary text-xs font-bold rounded-full">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card/80 p-3 rounded-lg border border-border">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Target Keywords</p>
                    <div className="flex flex-wrap gap-1.5">
                      {trigger.keywords.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-accent text-accent-foreground text-xs font-medium rounded-full">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Est. Impact: </span>
                      <span className="text-sm font-bold text-success">{trigger.estimatedImpact}</span>
                    </div>
                    {isLaunched ? (
                      <span className="px-4 py-2 bg-success/10 text-success text-xs font-bold rounded-lg flex items-center gap-1.5">
                        <Rocket className="h-3.5 w-3.5" /> Campaign Launched
                      </span>
                    ) : (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleLaunch(trigger.id); }}
                        className="px-4 py-2 gradient-primary text-primary-foreground text-xs font-bold rounded-lg shadow-card hover:opacity-90 transition-opacity flex items-center gap-1.5"
                      >
                        <Rocket className="h-3.5 w-3.5" /> Launch Campaign
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CampaignTriggerPanel;
