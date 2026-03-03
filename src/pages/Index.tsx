import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import TopBar from "@/components/TopBar";
import AvailabilitySection from "@/components/sections/AvailabilitySection";
import PricingSection from "@/components/sections/PricingSection";
import ShelfSection from "@/components/sections/ShelfSection";
import RankMarketShareSection from "@/components/sections/RankMarketShareSection";

const sectionComponents: Record<string, React.FC> = {
  availability: AvailabilitySection,
  pricing: PricingSection,
  shelf: ShelfSection,
  rank: RankMarketShareSection,
};

const Index = () => {
  const [activeSection, setActiveSection] = useState("availability");
  const SectionComponent = sectionComponents[activeSection] || AvailabilitySection;

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar activeSection={activeSection} onSectionChange={setActiveSection} />
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-auto p-6">
          <SectionComponent />
        </main>
      </div>
    </div>
  );
};

export default Index;
