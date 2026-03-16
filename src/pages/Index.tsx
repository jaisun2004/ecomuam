import { useState, useCallback, useEffect } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AIBar from "@/components/AIBar";
import ShelfView from "@/views/ShelfView";
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
import { GuardrailProvider, useGuardrails } from "@/contexts/GuardrailContext";

const views: Record<string, React.FC> = {
  shelf: ShelfView,
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
};

const IndexInner = () => {
  const [active, setActive] = useState("shelf");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [scrollTarget, setScrollTarget] = useState<string | null>(null);
  const g = useGuardrails();

  const handleNavigate = useCallback((screen: string, target?: string) => {
    setActive(screen);
    if (target) {
      setScrollTarget(target);
      setTimeout(() => {
        const el = document.getElementById(target);
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "center" });
          el.style.boxShadow = "0 0 0 2px #4F7FFF";
          el.style.transition = "box-shadow 1s";
          setTimeout(() => { el.style.boxShadow = "none"; }, 1000);
        }
        setScrollTarget(null);
      }, 300);
    }
  }, []);

  useEffect(() => {
    g.setNavigateTo(handleNavigate);
  }, [handleNavigate]);

  const View = views[active] || ShelfView;
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

const Index = () => (
  <TooltipProvider>
    <GuardrailProvider>
      <IndexInner />
    </GuardrailProvider>
  </TooltipProvider>
);

export default Index;
