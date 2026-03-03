import { useState, useEffect } from "react";
import KPICard from "@/components/KPICard";
import {
  Box, DollarSign, Layers, TrendingUp, FileText, Megaphone, Lightbulb,
  AlertTriangle, MapPin, RefreshCw, ChevronRight, Activity, Bell,
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
    summary: "47 OOS SKUs, ₹12.4L daily revenue at risk",
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
    summary: "14 MAP violations, ₹8.2L margin opportunity",
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
    summary: "₹5L monthly spend, 45.2K est. clicks",
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
  { id: 1, time: "12 min ago", severity: "critical" as const, location: "Mumbai", kpi: "Availability", brand: "FitCrunch", sku: "SKU-404 (Protein Bar)", detail: "OOS on Amazon & Flipkart for 48+ hrs. ₹1.8L/day revenue loss.", },
  { id: 2, time: "34 min ago", severity: "critical" as const, location: "Delhi NCR", kpi: "Pricing", brand: "HydraMax", sku: "SKU-205 (Electrolyte)", detail: "Competitor A slashed price 18%. Market share at risk.", },
  { id: 3, time: "1 hr ago", severity: "warning" as const, location: "Bangalore", kpi: "Market Share", brand: "ZapDrink", sku: "SKU-101 (Energy)", detail: "Lost #1 organic rank on 'energy drink' to Competitor B.", },
  { id: 4, time: "1.5 hrs ago", severity: "warning" as const, location: "Chennai", kpi: "Content", brand: "FitCrunch", sku: "SKU-404 (Protein Bar)", detail: "Rating dropped to 3.2 — below 3.5 threshold. Conversion impact expected.", },
  { id: 5, time: "2 hrs ago", severity: "info" as const, location: "Pune", kpi: "SoS", brand: "PureLeaf", sku: "SKU-300 (Green Tea)", detail: "Competitor reduced ad spend on 'green tea' — conquesting opportunity.", },
  { id: 6, time: "3 hrs ago", severity: "warning" as const, location: "Hyderabad", kpi: "Availability", brand: "ZapDrink", sku: "SKU-101 (Energy)", detail: "Low stock on Blinkit — 2-day inventory remaining.", },
];

const DashboardSection = ({ onNavigate }: DashboardProps) => {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);

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
        <div className="divide-y divide-border/50 max-h-[360px] overflow-y-auto">
          {anomalies.map((a) => (
            <div key={a.id} className={`px-5 py-3.5 border-l-4 hover:bg-muted/30 transition-colors cursor-pointer ${severityStyle[a.severity]}`}>
              <div className="flex items-start gap-3">
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
                    const kpiToSection: Record<string, string> = {
                      "Availability": "availability",
                      "Pricing": "pricing",
                      "Market Share": "rank",
                      "Content": "content",
                      "SoS": "shelf",
                      "Ads": "ads",
                    };
                    onNavigate(kpiToSection[a.kpi] || "availability");
                  }}
                  className="text-primary text-xs font-bold shrink-0 hover:underline"
                >Investigate</button>
              </div>
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
    </div>
  );
};

export default DashboardSection;
