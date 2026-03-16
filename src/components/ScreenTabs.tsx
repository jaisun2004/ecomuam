import React from "react";

interface ScreenTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  tab1Label?: string;
  tab2Label?: string;
}

const ScreenTabs: React.FC<ScreenTabsProps> = ({
  activeTab,
  onTabChange,
  tab1Label = "Overview",
  tab2Label = "Analytics",
}) => {
  return (
    <div className="flex items-center gap-6 mb-6 border-b border-subtle">
      {[
        { key: "overview", label: tab1Label },
        { key: "analytics", label: tab2Label },
      ].map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          className="pb-2.5 text-[13px] font-medium transition-colors relative"
          style={{
            color: activeTab === tab.key ? "hsl(228,25%,93%)" : "hsl(225,10%,30%)",
            borderBottom: activeTab === tab.key ? "2px solid hsl(228,90%,64%)" : "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.key) e.currentTarget.style.color = "hsl(225,10%,46%)";
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.key) e.currentTarget.style.color = "hsl(225,10%,30%)";
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ScreenTabs;
