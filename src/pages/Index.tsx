import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import DashboardSection from "@/components/sections/DashboardSection";
import AvailabilitySection from "@/components/sections/AvailabilitySection";
import PricingSection from "@/components/sections/PricingSection";
import ShelfSection from "@/components/sections/ShelfSection";
import RankMarketShareSection from "@/components/sections/RankMarketShareSection";
import ContentAuditSection from "@/components/sections/ContentAuditSection";
import AdOptimisationSection from "@/components/sections/AdOptimisationSection";
import CategoryRecommendationSection from "@/components/sections/CategoryRecommendationSection";

const sectionComponents: Record<string, React.FC<any>> = {
  availability: AvailabilitySection,
  pricing: PricingSection,
  shelf: ShelfSection,
  rank: RankMarketShareSection,
  content: ContentAuditSection,
  ads: AdOptimisationSection,
  category: CategoryRecommendationSection,
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("dashboard");

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          {activeSection === "dashboard" ? (
            <DashboardSection onNavigate={setActiveSection} />
          ) : (
            (() => {
              const SectionComponent = sectionComponents[activeSection];
              return SectionComponent ? <SectionComponent /> : <DashboardSection onNavigate={setActiveSection} />;
            })()
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
