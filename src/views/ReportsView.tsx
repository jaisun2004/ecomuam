import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";

const timeRangeOptions = ["7D", "30D", "90D"];

const plRowsByTime: Record<string, { platform: string; color: string; rev: string; spend: string; returns: string; retColor: string; margin: string; mColor: string }[]> = {
  "7D": [
    { platform: "Amazon", color: "#FF9900", rev: "₹24L", spend: "₹1.9L", returns: "6.8%", retColor: "text-sw-amber", margin: "39%", mColor: "text-sw-green font-bold" },
    { platform: "Flipkart", color: "#2F77FF", rev: "₹13L", spend: "₹1.3L", returns: "9.1%", retColor: "text-sw-red", margin: "29%", mColor: "text-sw-amber font-bold" },
    { platform: "Blinkit", color: "#FDDC2B", rev: "₹9L", spend: "₹0.7L", returns: "2.0%", retColor: "text-sw-green", margin: "43%", mColor: "text-sw-green font-bold" },
    { platform: "Zepto", color: "#833AB4", rev: "₹6L", spend: "₹0.4L", returns: "1.7%", retColor: "text-sw-green", margin: "45%", mColor: "text-sw-green font-bold" },
    { platform: "Direct/D2C", color: "#4F6EF7", rev: "₹6L", spend: "₹0.5L", returns: "1.1%", retColor: "text-sw-green", margin: "52%", mColor: "text-sw-green font-bold" },
  ],
  "30D": [
    { platform: "Amazon", color: "#FF9900", rev: "₹98L", spend: "₹7.8L", returns: "7.1%", retColor: "text-sw-amber", margin: "38%", mColor: "text-sw-green font-bold" },
    { platform: "Flipkart", color: "#2F77FF", rev: "₹54L", spend: "₹5.2L", returns: "9.4%", retColor: "text-sw-red", margin: "28%", mColor: "text-sw-amber font-bold" },
    { platform: "Blinkit", color: "#FDDC2B", rev: "₹38L", spend: "₹2.9L", returns: "2.1%", retColor: "text-sw-green", margin: "42%", mColor: "text-sw-green font-bold" },
    { platform: "Zepto", color: "#833AB4", rev: "₹24L", spend: "₹1.8L", returns: "1.8%", retColor: "text-sw-green", margin: "44%", mColor: "text-sw-green font-bold" },
    { platform: "Direct/D2C", color: "#4F6EF7", rev: "₹26L", spend: "₹2.3L", returns: "1.2%", retColor: "text-sw-green", margin: "51%", mColor: "text-sw-green font-bold" },
  ],
  "90D": [
    { platform: "Amazon", color: "#FF9900", rev: "₹2.8Cr", spend: "₹22L", returns: "6.9%", retColor: "text-sw-amber", margin: "40%", mColor: "text-sw-green font-bold" },
    { platform: "Flipkart", color: "#2F77FF", rev: "₹1.5Cr", spend: "₹14L", returns: "9.2%", retColor: "text-sw-red", margin: "30%", mColor: "text-sw-amber font-bold" },
    { platform: "Blinkit", color: "#FDDC2B", rev: "₹1.1Cr", spend: "₹8L", returns: "2.0%", retColor: "text-sw-green", margin: "44%", mColor: "text-sw-green font-bold" },
    { platform: "Zepto", color: "#833AB4", rev: "₹68L", spend: "₹5L", returns: "1.6%", retColor: "text-sw-green", margin: "46%", mColor: "text-sw-green font-bold" },
    { platform: "Direct/D2C", color: "#4F6EF7", rev: "₹74L", spend: "₹6L", returns: "1.0%", retColor: "text-sw-green", margin: "53%", mColor: "text-sw-green font-bold" },
  ],
};

const kpisByTime: Record<string, { rev: string; revDelta: string; margin: string; marginDelta: string; returnRate: string; returnDelta: string }> = {
  "7D": { rev: "₹58L", revDelta: "▲ 12% WoW", margin: "36%", marginDelta: "▲ 2% vs last wk", returnRate: "5.8%", returnDelta: "▼ 0.4%" },
  "30D": { rev: "₹2.4Cr", revDelta: "▲ 18% MoM", margin: "34%", marginDelta: "▲ 3% vs last mo", returnRate: "6.2%", returnDelta: "▲ 0.8% — investigate" },
  "90D": { rev: "₹7.0Cr", revDelta: "▲ 22% QoQ", margin: "37%", marginDelta: "▲ 5% vs last qtr", returnRate: "5.9%", returnDelta: "▼ 0.3%" },
};

const reports = [
  { name: "Weekly Shelf Report", schedule: "Every Monday 8AM", to: "CEO + Marketing Head", status: "ACTIVE", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Daily ROAS Digest", schedule: "Every day 7AM", to: "E-commerce Manager", status: "ACTIVE", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Monthly P&L Report", schedule: "1st of month", to: "CFO + Brand Head", status: "1st of month", sColor: "text-primary bg-primary/15" },
  { name: "Competitor Price Alert", schedule: "On trigger", to: "Trade Marketing Lead", status: "REAL-TIME", sColor: "text-sw-amber bg-sw-amber-dim" },
];

const ReportsView: React.FC = () => {
  const [planAdded, setPlanAdded] = useState(false);
  const [timeRange, setTimeRange] = useState("30D");
  const [reportAdded, setReportAdded] = useState(false);

  const plRows = plRowsByTime[timeRange];
  const kpis = kpisByTime[timeRange];

  const [tab, setTab] = useState("overview");

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} tab1Label="Summary" tab2Label="Raw Data" />
      {tab === "overview" ? (<>
      {/* Time range toggle */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">Time Range:</span>
        {timeRangeOptions.map(t => (
          <button key={t} onClick={() => setTimeRange(t)}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              timeRange === t ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
            }`}>
            {t}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title={`Total Revenue (${timeRange})`} value={kpis.rev} delta={kpis.revDelta} deltaType="positive" sub="Across all platforms" accentColor="bg-primary" delay={0} />
        <KPICard title="Net Contribution Margin" value={kpis.margin} delta={kpis.marginDelta} deltaType="positive" sub="After ad spend, returns, fees" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Return Rate" value={kpis.returnRate} delta={kpis.returnDelta} deltaType={kpis.returnDelta.includes("▲") ? "negative" : "positive"} sub="Amazon return rate rising" accentColor="bg-sw-amber" delay={0.1} />
        <KPICard title="Scheduled Reports" value="12" delta="Next: Tomorrow 8AM" deltaType="neutral" sub="3 stakeholders · Weekly" accentColor="bg-sw-purple" delay={0.15} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PanelCard title={`Revenue Breakdown by Platform — ${timeRange} P&L`} badge="Net Margin View" badgeColor="accent" className="col-span-2" delay={0.2}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Platform</th>
                <th className="text-right py-2 font-normal">Revenue</th>
                <th className="text-right py-2 font-normal">Ad Spend</th>
                <th className="text-right py-2 font-normal">Returns</th>
                <th className="text-right py-2 font-normal">Net Margin</th>
              </tr>
            </thead>
            <tbody>
              {plRows.map((r, i) => (
                <tr key={r.platform} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                  <td className="py-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: r.color }} />
                      <span className="text-foreground">{r.platform}</span>
                    </span>
                  </td>
                  <td className="py-3 text-right font-mono text-foreground">{r.rev}</td>
                  <td className="py-3 text-right font-mono text-muted-foreground">{r.spend}</td>
                  <td className={`py-3 text-right font-mono ${r.retColor}`}>{r.returns}</td>
                  <td className={`py-3 text-right font-mono ${r.mColor}`}>{r.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`mt-4 p-3 rounded-xl ${planAdded ? "bg-sw-green-dim border border-sw-green/20" : "bg-primary/10 border border-primary/20"}`}>
            <p className="text-[11px] text-foreground">💡 D2C has the highest net margin (51%). Shift 10% of Flipkart spend to D2C to add ~₹8L/mo in net profit.</p>
            <button onClick={() => setPlanAdded(true)} className={`mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium ${planAdded ? "bg-sw-green/20 text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
              {planAdded ? "✓ Added to Plan" : "Add to Plan"}
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Scheduled Reports" delay={0.25}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{reports.length} active</span>
            <button onClick={() => setReportAdded(true)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium ${
                reportAdded ? "bg-sw-green-dim text-sw-green" : "border border-primary/30 text-primary hover:bg-primary/10"
              }`}>
              {reportAdded ? "✓ Report Added" : "+ New"}
            </button>
          </div>
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r.name} className="bg-surface-2 rounded-xl border border-subtle p-3">
                <p className="text-xs text-foreground font-medium">{r.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.schedule} · {r.to}</p>
                <span className={`inline-block mt-1.5 font-mono text-[9px] px-2 py-0.5 rounded-full ${r.sColor}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
};

export default ReportsView;
