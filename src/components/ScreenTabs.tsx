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
            color: activeTab === tab.key ? "hsl(270,60%,42%)" : "hsl(220,10%,46%)",
            borderBottom: activeTab === tab.key ? "2px solid hsl(270,60%,42%)" : "2px solid transparent",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.key) e.currentTarget.style.color = "hsl(220,20%,15%)";
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.key) e.currentTarget.style.color = "hsl(220,10%,46%)";
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ScreenTabs;
