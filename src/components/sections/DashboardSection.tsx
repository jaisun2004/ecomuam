import { useState, useEffect } from "react";
import KPICard from "@/components/KPICard";
import {
  Box, DollarSign, Layers, TrendingUp, FileText, Megaphone, Lightbulb,
  AlertTriangle, MapPin, RefreshCw, ChevronRight, Activity, Bell, X, Rocket,
} from "lucide-react";

interface DashboardProps {
  onNavigate: (section: string) => void;
}

const sectionSummaries = [
  {
    id: "availability",
    label: "Availability",
    icon: Box,
    kpi: "91.3%",
    kpiLabel: "In-Stock Rate",
    change: 2.1,
    alerts: 3,
    status: "warning" as const,
    summary: "47 OOS SKUs, ₹ 12.4L daily revenue at risk",
  },
  {
    id: "pricing",
    label: "Pricing",
    icon: DollarSign,
    kpi: "87%",
    kpiLabel: "Price Competitiveness",
    change: 3,
    alerts: 2,
    status: "success" as const,
    summary: "14 MAP violations, ₹ 8.2L margin opportunity",
  },
  {
    id: "shelf",
    label: "Share of Shelf",
    icon: Layers,
    kpi: "38.2%",
    kpiLabel: "Overall SoS",
    change: 4.2,
    alerts: 1,
    status: "success" as const,
    summary: "Organic: 26%, Sponsored: 16%, 342 keywords tracked",
  },
  {
    id: "rank",
    label: "Rank & Market Share",
    icon: TrendingUp,
    kpi: "24%",
    kpiLabel: "Market Share",
    change: 2,
    alerts: 2,
    status: "warning" as const,
    summary: "Avg Rank #3.2, 4/12 categories at #1",
  },
  {
    id: "content",
    label: "Content Audit",
    icon: FileText,
    kpi: "68/100",
    kpiLabel: "Search Page Score",
    change: -5,
    alerts: 4,
    status: "destructive" as const,
    summary: "Avg Title Score 69, Avg Rating 3.95, 5.5K reviews",
  },
  {
    id: "ads",
    label: "Ad Optimisation",
    icon: Megaphone,
    kpi: "3.7x",
    kpiLabel: "Avg ROAS",
    change: 12,
    alerts: 1,
    status: "success" as const,
    summary: "₹ 5L monthly spend, 45.2K est. clicks",
  },
  {
    id: "category",
    label: "Category & NPD",
    icon: Lightbulb,
    kpi: "85/100",
    kpiLabel: "Top Opportunity",
    change: 0,
    alerts: 1,
    status: "primary" as const,
    summary: "Mango Chilli variant — high demand, low competition",
  },
];

const anomalies = [
  {
    id: 1, time: "12 min ago", severity: "critical" as const, location: "Delhi NCR", kpi: "Availability", brand: "FitCrunch", sku: "SKU-404 (Protein Bar)",
    detail: "OOS on Instamart & Instamart for 48+ hrs. ₹ 1.8L/day revenue loss.",
    investigation: {
      platforms: [
        { name: "Instamart", status: "Out of Stock", since: "2 days", lastPrice: "₹ 299", fulfillment: "FBA — warehouse empty" },
        { name: "Instamart", status: "Out of Stock", since: "2 days", lastPrice: "₹ 289", fulfillment: "Seller-fulfilled — no dispatch" },
        { name: "Blinkit", status: "In Stock", since: "—", lastPrice: "₹ 310", fulfillment: "Dark store: 42 units left" },
      ],
      rootCause: "Warehouse Delhi NCR-W3 ran out of stock. Replenishment PO raised but ETA is 5 days.",
      revenueImpact: "₹ 1.8L/day lost across Instamart + Instamart. Competitor B gaining +6% organic rank on 'protein bar'.",
      recommendation: "Redirect Blinkit inventory to FBA. Trigger 'Back in Stock' campaign on email/push for 12K waitlisted customers.",
    },
  },
  {
    id: 2, time: "34 min ago", severity: "critical" as const, location: "Mumbai", kpi: "Pricing", brand: "HydraMax", sku: "SKU-205 (Electrolyte)",
    detail: "Competitor A slashed price 18%. Market share at risk.",
    investigation: {
      platforms: [
        { name: "Instamart", status: "Competitor: ₹ 149 → ₹ 122", since: "6 hrs", lastPrice: "Your price: ₹ 159", fulfillment: "FBA" },
        { name: "Instamart", status: "Competitor: ₹ 145 → ₹ 118", since: "6 hrs", lastPrice: "Your price: ₹ 155", fulfillment: "Smart fulfillment" },
        { name: "Zepto", status: "Competitor: ₹ 155 → ₹ 130", since: "4 hrs", lastPrice: "Your price: ₹ 165", fulfillment: "Dark store" },
      ],
      rootCause: "Competitor A (ElectroFuel) launched a 7-day flash sale across all platforms, reducing Electrolyte 500ml by 18%.",
      revenueImpact: "Estimated 22% unit shift to competitor. ₹ 4.2L weekly revenue at risk in Mumbai.",
      recommendation: "Option 1: Match price at ₹ 125 (margin drops 8%). Option 2: Run bundled offer 'Buy 2 Get 1' to protect margin. Option 3: Increase ad spend on brand keywords to defend visibility.",
    },
  },
  {
    id: 3, time: "1 hr ago", severity: "warning" as const, location: "Riyadh", kpi: "Market Share", brand: "ZapDrink", sku: "SKU-101 (Energy)",
    detail: "Lost #1 organic rank on 'energy drink' to Competitor B.",
    investigation: {
      platforms: [
        { name: "Instamart", status: "Rank: #1 → #3", since: "18 hrs", lastPrice: "₹ 199", fulfillment: "FBA" },
        { name: "Blinkit", status: "Rank: #2 → #4", since: "12 hrs", lastPrice: "₹ 210", fulfillment: "Dark store" },
      ],
      rootCause: "Competitor B (BoltEnergy) launched a new variant with 50+ seeded reviews and aggressive sponsored placement on 'energy drink' keyword.",
      revenueImpact: "Organic traffic down 31% in last 24 hrs. Estimated ₹ 2.1L/week loss if rank not recovered.",
      recommendation: "Boost sponsored bid on 'energy drink' by 40%. Launch review generation campaign. Consider A+ content refresh with comparison charts.",
    },
  },
  {
    id: 4, time: "1.5 hrs ago", severity: "warning" as const, location: "Doha", kpi: "Content", brand: "FitCrunch", sku: "SKU-404 (Protein Bar)",
    detail: "Rating dropped to 3.2 — below 3.5 threshold. Conversion impact expected.",
    investigation: {
      platforms: [
        { name: "Instamart", status: "Rating: 3.8 → 3.2", since: "3 days", lastPrice: "₹ 299", fulfillment: "FBA" },
        { name: "Instamart", status: "Rating: 3.9 → 3.4", since: "2 days", lastPrice: "₹ 289", fulfillment: "Smart fulfillment" },
      ],
      rootCause: "Batch #FC-2024-Q1 had packaging defect — 14 negative reviews in 72 hrs mentioning 'broken seal' and 'stale taste'.",
      revenueImpact: "Conversion rate dropped 18% on Instamart. Below 3.5 triggers suppression from 'Recommended' placements.",
      recommendation: "Respond to all negative reviews within 24 hrs. Offer replacements. Escalate to QA team for batch recall. Request Instamart to flag reviews tied to defective batch.",
    },
  },
  {
    id: 5, time: "2 hrs ago", severity: "info" as const, location: "Khalifa City", kpi: "SoS", brand: "PureLeaf", sku: "SKU-300 (Green Tea)",
    detail: "Competitor reduced ad spend on 'green tea' — conquesting opportunity.",
    investigation: {
      platforms: [
        { name: "Instamart", status: "Comp ad share: 35% → 18%", since: "48 hrs", lastPrice: "₹ 450", fulfillment: "FBA" },
        { name: "Instamart", status: "Comp ad share: 28% → 12%", since: "24 hrs", lastPrice: "₹ 440", fulfillment: "Seller-fulfilled" },
      ],
      rootCause: "Competitor C (TeaVerde) paused campaigns — likely budget exhaustion or quarter-end cutback.",
      revenueImpact: "Opportunity to capture 15-20% additional SoS. Estimated ₹ 1.5L incremental revenue if acted within 48 hrs.",
      recommendation: "Increase bid on 'green tea', 'organic tea', 'healthy tea' by 25%. Activate conquesting campaign targeting TeaVerde branded keywords.",
    },
  },
  {
    id: 6, time: "3 hrs ago", severity: "warning" as const, location: "Jeddah", kpi: "Availability", brand: "ZapDrink", sku: "SKU-101 (Energy)",
    detail: "Low stock on Blinkit — 2-day inventory remaining.",
    investigation: {
      platforms: [
        { name: "Blinkit", status: "42 units left (2-day stock)", since: "Now", lastPrice: "₹ 210", fulfillment: "Dark store HYD-04" },
        { name: "Zepto", status: "In Stock — 180 units", since: "—", lastPrice: "₹ 215", fulfillment: "Dark store" },
        { name: "Instamart", status: "In Stock — healthy", since: "—", lastPrice: "₹ 199", fulfillment: "FBA" },
      ],
      rootCause: "Blinkit Jeddah dark store HYD-04 reorder trigger set too low. Demand spike from weekend sales not accounted for.",
      revenueImpact: "If OOS: ₹ 45K/day lost on Blinkit Jeddah. Competitor D currently #2 — will auto-promote to #1.",
      recommendation: "Emergency replenishment to HYD-04. Raise reorder threshold from 30 to 80 units. Notify Blinkit ops team.",
    },
  },
];

const DashboardSection = ({ onNavigate }: DashboardProps) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [expandedAnomaly, setExpandedAnomaly] = useState<number | null>(null);
  const [campaignModal, setCampaignModal] = useState<typeof anomalies[0] | null>(null);
  const [campaignLaunched, setCampaignLaunched] = useState(false);
  const [campaignForm, setCampaignForm] = useState({
    budget: "25000",
    duration: "7",
    platforms: ["Instamart", "Instamart"] as string[],
    bidStrategy: "aggressive",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 4 * 60 * 60 * 1000); // 4 hours
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setRefreshing(false);
    }, 1500);
  };

  const severityStyle = {
    critical: "border-l-destructive bg-destructive/5",
    warning: "border-l-warning bg-warning/5",
    info: "border-l-info bg-info/5",
  };

  const severityDot = {
    critical: "bg-destructive animate-pulse",
    warning: "bg-warning",
    info: "bg-info",
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">Real-time overview across all intelligence modules</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Last refreshed: {lastRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
          <button
            onClick={handleRefresh}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Top-level KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard title="In-Stock Rate" value="91.3%" change={2.1} changeLabel="vs last month" icon={<Box className="h-5 w-5" />} variant="primary" />
        <KPICard title="Price Competitiveness" value="87%" change={3} changeLabel="within 5% of comp" icon={<DollarSign className="h-5 w-5" />} variant="success" />
        <KPICard title="Market Share" value="24%" change={2} changeLabel="vs last quarter" icon={<TrendingUp className="h-5 w-5" />} variant="warning" />
        <KPICard title="Content Score" value="68/100" change={-5} changeLabel="search page avg" icon={<FileText className="h-5 w-5" />} variant="destructive" />
      </div>

      {/* Anomaly Notification Panel */}
      <div className="rounded-xl border bg-card shadow-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Bell className="h-4 w-4 text-destructive" />
            </div>
            <div>
              <h3 className="font-heading font-semibold text-foreground text-sm">Anomaly Alerts</h3>
              <p className="text-[10px] text-muted-foreground">Auto-refreshes every 4 hours • {anomalies.filter(a => a.severity === 'critical').length} critical</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-destructive animate-pulse"></span>
            <span className="text-xs text-destructive font-bold">LIVE</span>
          </div>
        </div>
        <div className="divide-y divide-border/50 max-h-[500px] overflow-y-auto">
          {anomalies.map((a) => (
            <div key={a.id} className={`border-l-4 transition-colors ${severityStyle[a.severity]}`}>
              <div className="px-5 py-3.5 flex items-start gap-3 hover:bg-muted/30 cursor-pointer">
                <div className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${severityDot[a.severity]}`}></div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-xs font-bold text-foreground">{a.kpi}</span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                      <MapPin className="h-2.5 w-2.5" /> {a.location}
                    </span>
                    <span className="text-[10px] text-muted-foreground">•</span>
                    <span className="text-[10px] text-muted-foreground font-mono">{a.sku}</span>
                  </div>
                  <p className="text-sm text-foreground">{a.detail}</p>
                  <span className="text-[10px] text-muted-foreground mt-1 block">{a.time}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedAnomaly(expandedAnomaly === a.id ? null : a.id);
                  }}
                  className="text-primary text-xs font-bold shrink-0 hover:underline flex items-center gap-1"
                >
                  {expandedAnomaly === a.id ? "Close" : "Investigate"}
                  <ChevronRight className={`h-3 w-3 transition-transform ${expandedAnomaly === a.id ? 'rotate-90' : ''}`} />
                </button>
              </div>

              {/* Investigation Panel */}
              {expandedAnomaly === a.id && (
                <div className="px-5 pb-4 pt-1 ml-5 border-t border-border/30 animate-fade-in">
                  {/* Platform Breakdown Table */}
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Platform Breakdown</p>
                  <div className="rounded-lg border border-border overflow-hidden mb-3">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-muted/50">
                          <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Platform</th>
                          <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Status</th>
                          <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Since</th>
                          <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Price</th>
                          <th className="text-left px-3 py-1.5 font-semibold text-muted-foreground">Fulfillment</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {a.investigation.platforms.map((p, i) => (
                          <tr key={i} className="hover:bg-muted/20">
                            <td className="px-3 py-1.5 font-medium text-foreground">{p.name}</td>
                            <td className="px-3 py-1.5 text-foreground">{p.status}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{p.since}</td>
                            <td className="px-3 py-1.5 text-foreground font-mono">{p.lastPrice}</td>
                            <td className="px-3 py-1.5 text-muted-foreground">{p.fulfillment}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Root Cause, Impact, Recommendation */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-3">
                      <p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">Root Cause</p>
                      <p className="text-xs text-foreground leading-relaxed">{a.investigation.rootCause}</p>
                    </div>
                    <div className="rounded-lg bg-warning/5 border border-warning/20 p-3">
                      <p className="text-[10px] font-bold text-warning uppercase tracking-wider mb-1">Revenue Impact</p>
                      <p className="text-xs text-foreground leading-relaxed">{a.investigation.revenueImpact}</p>
                    </div>
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">Recommended Action</p>
                      <p className="text-xs text-foreground leading-relaxed">{a.investigation.recommendation}</p>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => {
                        const kpiToSection: Record<string, string> = {
                          "Availability": "availability", "Pricing": "pricing", "Market Share": "rank",
                          "Content": "content", "SoS": "shelf", "Ads": "ads",
                        };
                        onNavigate(kpiToSection[a.kpi] || "availability");
                      }}
                      className="px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                    >
                      Go to {a.kpi} Module →
                    </button>
                    <button
                      onClick={() => { setCampaignModal(a); setCampaignLaunched(false); }}
                      className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors"
                    >
                      Launch Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Section Cards Grid — drill-down */}
      <div>
        <h3 className="font-heading font-semibold text-foreground mb-3">Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {sectionSummaries.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => onNavigate(section.id)}
                className="rounded-xl border bg-card shadow-card p-5 text-left hover:shadow-card-md hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    section.status === 'primary' ? 'gradient-primary text-primary-foreground' :
                    section.status === 'success' ? 'bg-success/10 text-success' :
                    section.status === 'warning' ? 'bg-warning/10 text-warning' :
                    'bg-destructive/10 text-destructive'
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {section.alerts > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-destructive/10 text-destructive">
                      {section.alerts} alerts
                    </span>
                  )}
                </div>
                <p className="text-2xl font-heading font-bold text-foreground">{section.kpi}</p>
                <p className="text-xs text-muted-foreground mb-1">{section.kpiLabel}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-2">{section.summary}</p>
                <div className="flex items-center gap-1 mt-3 text-primary text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                  Open Module <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
      {/* Campaign Modal */}
      {campaignModal && (
        <CampaignLaunchModal
          anomaly={campaignModal}
          form={campaignForm}
          setForm={setCampaignForm}
          launched={campaignLaunched}
          setLaunched={setCampaignLaunched}
          onClose={() => setCampaignModal(null)}
        />
      )}
    </div>
  );
};

/* Campaign Launch Modal */
const CampaignLaunchModal = ({
  anomaly, form, setForm, launched, setLaunched, onClose
}: {
  anomaly: typeof anomalies[0];
  form: { budget: string; duration: string; platforms: string[]; bidStrategy: string };
  setForm: (f: any) => void;
  launched: boolean;
  setLaunched: (v: boolean) => void;
  onClose: () => void;
}) => {
  const allPlatforms = ["Instamart", "Instamart", "Blinkit", "Zepto", "BigBasket"];
  const togglePlatform = (p: string) => {
    setForm({ ...form, platforms: form.platforms.includes(p) ? form.platforms.filter((x: string) => x !== p) : [...form.platforms, p] });
  };

  const kpiToStrategy: Record<string, { strategy: string; type: string; keywords: string[] }> = {
    Availability: { strategy: "Back in Stock Blitz", type: "Push Notification + Sponsored Display", keywords: ["back in stock", anomaly.brand.toLowerCase(), anomaly.sku.split('(')[1]?.replace(')', '').trim().toLowerCase() || "product"].filter(Boolean) },
    Pricing: { strategy: "Price Defense Campaign", type: "Sponsored Brand + Keyword Conquesting", keywords: ["best price " + anomaly.brand.toLowerCase(), "cheap " + (anomaly.sku.split('(')[1]?.replace(')', '').trim().toLowerCase() || "product"), "deal " + anomaly.brand.toLowerCase()] },
    "Market Share": { strategy: "Rank Recovery Assault", type: "Exact Match + Category Targeting", keywords: [anomaly.sku.split('(')[1]?.replace(')', '').trim().toLowerCase() || "product", "best " + (anomaly.sku.split('(')[1]?.replace(')', '').trim().toLowerCase() || "product"), anomaly.brand.toLowerCase() + " vs competitor"] },
    Content: { strategy: "Review Recovery Campaign", type: "Vine + Follow-Up Email", keywords: [anomaly.brand.toLowerCase(), anomaly.sku.split('(')[1]?.replace(')', '').trim().toLowerCase() || "product"] },
    SoS: { strategy: "Share Capture Blitz", type: "Sponsored Products + Display Ads", keywords: ["best " + (anomaly.sku.split('(')[1]?.replace(')', '').trim().toLowerCase() || "product"), anomaly.brand.toLowerCase()] },
  };

  const strat = kpiToStrategy[anomaly.kpi] || kpiToStrategy["Availability"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 animate-fade-in" onClick={onClose}>
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading font-bold text-foreground text-lg">Launch Campaign</h2>
            <p className="text-xs text-muted-foreground">{anomaly.kpi} response for {anomaly.brand} — {anomaly.location}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X className="h-4 w-4 text-muted-foreground" /></button>
        </div>

        {!launched ? (
          <div className="p-6 space-y-5">
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <p className="text-xs font-bold text-destructive uppercase tracking-wider mb-1">Anomaly Context</p>
              <p className="text-sm text-foreground">{anomaly.detail}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Strategy</p>
                <p className="text-sm font-bold text-foreground">{strat.strategy}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Campaign Type</p>
                <p className="text-sm font-bold text-foreground">{strat.type}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Target Keywords</p>
              <div className="flex flex-wrap gap-1.5">
                {strat.keywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{kw}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Platforms</p>
              <div className="flex flex-wrap gap-2">
                {allPlatforms.map(p => (
                  <button key={p} onClick={() => togglePlatform(p)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${form.platforms.includes(p) ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Daily Budget (₹ )</label>
                <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5 block">Duration (days)</label>
                <input type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-card text-foreground text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Bid Strategy</p>
              <div className="flex gap-2">
                {[{ id: "aggressive", label: "Aggressive" }, { id: "balanced", label: "Balanced" }, { id: "conservative", label: "Conservative" }].map(b => (
                  <button key={b.id} onClick={() => setForm({ ...form, bidStrategy: b.id })}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${form.bidStrategy === b.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/50'}`}>
                    {b.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-success/5 border border-success/20">
              <p className="text-[10px] text-success uppercase font-bold tracking-wider mb-1">Estimated Impact</p>
              <p className="text-sm font-bold text-foreground">₹ {(parseInt(form.budget) * parseInt(form.duration) * 3.7 / 1000).toFixed(1)}L projected revenue • {parseInt(form.duration)}-day campaign across {form.platforms.length} platforms</p>
            </div>
            <button onClick={() => setLaunched(true)}
              className="w-full py-3 gradient-primary text-primary-foreground rounded-lg font-bold shadow-card hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
              <Rocket className="h-4 w-4" /> Launch Campaign
            </button>
          </div>
        ) : (
          <div className="p-6 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto">
              <Rocket className="h-8 w-8 text-success" />
            </div>
            <h3 className="font-heading font-bold text-foreground text-lg">Campaign Launched!</h3>
            <p className="text-sm text-muted-foreground">{strat.strategy} is now live across {form.platforms.join(", ")} targeting {anomaly.brand} {anomaly.sku}.</p>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2 bg-muted/50 rounded-lg border border-border text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Budget</p>
                <p className="text-sm font-bold text-foreground">₹ {form.budget}/day</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg border border-border text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Duration</p>
                <p className="text-sm font-bold text-foreground">{form.duration} days</p>
              </div>
              <div className="p-2 bg-muted/50 rounded-lg border border-border text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Platforms</p>
                <p className="text-sm font-bold text-foreground">{form.platforms.length}</p>
              </div>
            </div>
            <button onClick={onClose} className="w-full py-2.5 border border-border rounded-lg text-sm font-bold text-foreground hover:bg-muted transition-colors">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSection;
