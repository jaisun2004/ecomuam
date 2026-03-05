import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import AIBar from "@/components/AIBar";
import ShelfView from "@/views/ShelfView";
import CampaignView from "@/views/CampaignView";
import DiscoveryView from "@/views/DiscoveryView";
import ReportsView from "@/views/ReportsView";
import CompetitorsView from "@/views/CompetitorsView";
import AlertsView from "@/views/AlertsView";
import AccountView from "@/views/AccountView";

const views: Record<string, React.FC> = {
  shelf: ShelfView,
  campaigns: CampaignView,
  discovery: DiscoveryView,
  reports: ReportsView,
  competitors: CompetitorsView,
  alerts: AlertsView,
  account: AccountView,
};

const Index = () => {
  const [active, setActive] = useState("shelf");

  const View = views[active] || ShelfView;

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-background">
        <Sidebar active={active} onChange={setActive} />
        <Topbar active={active} onChange={setActive} />
        <main className="ml-[68px] mt-[60px] p-7">
          <View key={active} />
        </main>
        <AIBar />
      </div>
    </TooltipProvider>
  );
};

export default Index;
