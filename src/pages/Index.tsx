import { useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";
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

export interface ViewProps {
  platform: string;
  isNational: boolean;
  timeRange: string;
  onNavigate: (view: string) => void;
}

const NATIONAL_PLATFORMS = ["Amazon", "Flipkart"];

const Index = () => {
  const [active, setActive] = useState("shelf");
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState("Amazon");
  const [timeRange, setTimeRange] = useState("30D");

  const sidebarWidth = sidebarExpanded ? 220 : 68;
  const isNational = NATIONAL_PLATFORMS.includes(selectedPlatform);
  const viewProps: ViewProps = { platform: selectedPlatform, isNational, timeRange, onNavigate: setActive };

  const renderView = () => {
    switch (active) {
      case "shelf": return <ShelfView {...viewProps} />;
      case "campaigns": return <CampaignView {...viewProps} />;
      case "discovery": return <DiscoveryView {...viewProps} />;
      case "reports": return <ReportsView {...viewProps} />;
      case "availability": return <AvailabilityView {...viewProps} />;
      case "pricing": return <PricingView {...viewProps} />;
      case "alerts": return <AlertsView {...viewProps} />;
      case "account": return <AccountView />;
      case "competitors": return <CompetitorAdsView {...viewProps} />;
      case "festival": return <FestivalCampaignsView {...viewProps} />;
      case "budget": return <BudgetOptimiserView {...viewProps} />;
      case "offline": return <OfflineAdsView {...viewProps} />;
      default: return <ShelfView {...viewProps} />;
    }
  };

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
          <Topbar
            active={active}
            onChange={setActive}
            selectedPlatform={selectedPlatform}
            onPlatformChange={setSelectedPlatform}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />
          <main className="p-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={active + selectedPlatform}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                {renderView()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
        <AIBar />
      </div>
    </TooltipProvider>
  );
};

export default Index;
