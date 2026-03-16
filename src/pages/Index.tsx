import { useState, useCallback, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AIBar from "@/components/AIBar";
import CentralCockpitView from "@/views/CentralCockpitView";
import CampaignView from "@/views/CampaignView";
import DiscoveryView from "@/views/DiscoveryView";
import ReportsView from "@/views/ReportsView";
import AvailabilityView from "@/views/AvailabilityView";
import PricingView from "@/views/PricingView";
import AlertsView from "@/views/AlertsView";
import AccountView from "@/views/AccountView";
import CompetitorAdsView from "@/views/CompetitorAdsView";
import FestivalCampaignsView from "@/views/FestivalCampaignsView";
import BudgetOptimiserView from "@/views/BudgetOptimiserView";
import OfflineAdsView from "@/views/OfflineAdsView";
import GuardrailsView from "@/views/GuardrailsView";
import MarketShareView from "@/views/MarketShareView";
import ContentAuditView from "@/views/ContentAuditView";
import { GuardrailProvider, useGuardrails } from "@/contexts/GuardrailContext";

const views: Record<string, React.FC> = {
  cockpit: CentralCockpitView,
  campaigns: CampaignView,
  discovery: DiscoveryView,
  reports: ReportsView,
  availability: AvailabilityView,
  pricing: PricingView,
  alerts: AlertsView,
  account: AccountView,
  competitors: CompetitorAdsView,
  festival: FestivalCampaignsView,
  budget: BudgetOptimiserView,
  offline: OfflineAdsView,
  guardrails: GuardrailsView,
  marketshare: MarketShareView,
  contentaudit: ContentAuditView,
};

const IndexInner = () => {
  const [active, setActive] = useState("cockpit");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const g = useGuardrails();

  const handleNavigate = useCallback((screen: string, target?: string) => {
    setActive(screen);
    if (target) {
      setScrollTarget(target);
      setTimeout(() => {
        // Try by ID first
        let el = document.getElementById(target);
        // Try by data-insight-type attribute
        if (!el && target === "defense-insight") {
          el = document.querySelector('[data-insight-type="defense"]') as HTMLElement;
        }
        // Fallback targets
        if (!el && target === "campaign-conflict-banner") {
          el = document.getElementById("campaign-digest");
        }
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.boxShadow = "0 0 0 2px #4F7FFF";
          el.style.transition = "box-shadow 1s";
          setTimeout(() => { el!.style.boxShadow = "none"; }, 1000);
        }
        setScrollTarget(null);
      }, 300);
    }
  }, []);

  useEffect(() => {
    g.setNavigateTo(handleNavigate);
  }, [handleNavigate]);

  const View = views[active] || CentralCockpitView;
  const sidebarWidth = sidebarExpanded ? 220 : 68;

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        active={active}
        onChange={setActive}
        expanded={sidebarExpanded}
        onToggleExpand={() => setSidebarExpanded(!sidebarExpanded)}
      />
      <div
        className="transition-all duration-300 ease-in-out"
        style={{ marginLeft: sidebarWidth }}
      >
        <Topbar active={active} onChange={setActive} />
        <main className="p-7">
          <View key={active} />
        </main>
      </div>
      <AIBar />
    </div>
  );
};

const Index = () => {
  return (
    <TooltipProvider>
      <GuardrailProvider>
        <IndexInner />
      </GuardrailProvider>
    </TooltipProvider>
  );
};

export default Index;
