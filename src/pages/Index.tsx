import { useState } from "react";
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
};

const Index = () => {
  const [active, setActive] = useState("shelf");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const View = views[active] || ShelfView;
  const sidebarWidth = sidebarExpanded ? 220 : 68;

  return (
    <TooltipProvider>
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
          <main className="mt-[60px] p-7">
            <View key={active} />
          </main>
        </div>
        <AIBar />
      </div>
    </TooltipProvider>
  );
};

export default Index;
