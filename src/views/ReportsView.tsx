import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Mail, Plus, X, Check } from "lucide-react";

const timeRangeOptions = ["7D", "30D", "90D"];

const plRowsByTime: Record<string, { platform: string; color: string; spend: string; returns: string; retColor: string; margin: string; mColor: string }[]> = {
  "7D": [
    { platform: "Amazon", color: "#FF9900", spend: "₹1.9L", returns: "6.8%", retColor: "text-sw-amber", margin: "39%", mColor: "text-sw-green font-bold" },
    { platform: "Flipkart", color: "#2F77FF", spend: "₹1.3L", returns: "9.1%", retColor: "text-sw-red", margin: "29%", mColor: "text-sw-amber font-bold" },
    { platform: "Blinkit", color: "#FDDC2B", spend: "₹0.7L", returns: "2.0%", retColor: "text-sw-green", margin: "43%", mColor: "text-sw-green font-bold" },
    { platform: "Zepto", color: "#833AB4", spend: "₹0.4L", returns: "1.7%", retColor: "text-sw-green", margin: "45%", mColor: "text-sw-green font-bold" },
  ],
  "30D": [
    { platform: "Amazon", color: "#FF9900", spend: "₹7.8L", returns: "7.1%", retColor: "text-sw-amber", margin: "38%", mColor: "text-sw-green font-bold" },
    { platform: "Flipkart", color: "#2F77FF", spend: "₹5.2L", returns: "9.4%", retColor: "text-sw-red", margin: "28%", mColor: "text-sw-amber font-bold" },
    { platform: "Blinkit", color: "#FDDC2B", spend: "₹2.9L", returns: "2.1%", retColor: "text-sw-green", margin: "42%", mColor: "text-sw-green font-bold" },
    { platform: "Zepto", color: "#833AB4", spend: "₹1.8L", returns: "1.8%", retColor: "text-sw-green", margin: "44%", mColor: "text-sw-green font-bold" },
  ],
  "90D": [
    { platform: "Amazon", color: "#FF9900", spend: "₹22L", returns: "6.9%", retColor: "text-sw-amber", margin: "40%", mColor: "text-sw-green font-bold" },
    { platform: "Flipkart", color: "#2F77FF", spend: "₹14L", returns: "9.2%", retColor: "text-sw-red", margin: "30%", mColor: "text-sw-amber font-bold" },
    { platform: "Blinkit", color: "#FDDC2B", spend: "₹8L", returns: "2.0%", retColor: "text-sw-green", margin: "44%", mColor: "text-sw-green font-bold" },
    { platform: "Zepto", color: "#833AB4", spend: "₹5L", returns: "1.6%", retColor: "text-sw-green", margin: "46%", mColor: "text-sw-green font-bold" },
  ],
};

const kpisByTime: Record<string, { avail: string; availDelta: string; sos: string; sosDelta: string; sponsRank: string; sponsDelta: string; orgRank: string; orgDelta: string; roas: string; roasDelta: string }> = {
  "7D": { avail: "68%", availDelta: "▼ 4% WoW", sos: "22%", sosDelta: "▲ 2%", sponsRank: "#2.4", sponsDelta: "Avg across keywords", orgRank: "#5.8", orgDelta: "Avg across keywords", roas: "4.2x", roasDelta: "▲ 0.3x WoW" },
  "30D": { avail: "72%", availDelta: "▲ 3% MoM", sos: "20%", sosDelta: "▲ 1%", sponsRank: "#2.8", sponsDelta: "Avg across keywords", orgRank: "#6.2", orgDelta: "Avg across keywords", roas: "3.9x", roasDelta: "▲ 0.5x MoM" },
  "90D": { avail: "75%", availDelta: "▲ 8% QoQ", sos: "19%", sosDelta: "▲ 3%", sponsRank: "#3.1", sponsDelta: "Avg across keywords", orgRank: "#6.5", orgDelta: "Avg across keywords", roas: "4.1x", roasDelta: "▲ 0.4x QoQ" },
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
  const [showNewReport, setShowNewReport] = useState(false);
  const [reportCreated, setReportCreated] = useState(false);
  const [reportConfig, setReportConfig] = useState({ name: "", frequency: "Weekly", day: "Monday", time: "08:00", emails: [""], format: "PDF" });

  const plRows = plRowsByTime[timeRange];
  const kpis = kpisByTime[timeRange];

  const [tab, setTab] = useState("overview");

  const addEmail = () => setReportConfig(p => ({ ...p, emails: [...p.emails, ""] }));
  const updateEmail = (i: number, v: string) => setReportConfig(p => ({ ...p, emails: p.emails.map((e, j) => j === i ? v : e) }));
  const removeEmail = (i: number) => setReportConfig(p => ({ ...p, emails: p.emails.filter((_, j) => j !== i) }));

  return (
    <div className="space-y-6 pb-20">
      <ScreenTabs activeTab={tab} onTabChange={setTab} tab1Label="Summary" tab2Label="Raw Data" />
      {tab === "overview" ? (<>
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground mr-2">Time Range:</span>
        {timeRangeOptions.map(t => (
          <button key={t} onClick={() => setTimeRange(t)}
            className={`px-4 py-1.5 rounded-lg font-mono text-xs font-medium transition-all ${
              timeRange === t ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
            }`}>{t}</button>
        ))}
      </div>

      <div className="grid grid-cols-5 gap-4">
        <KPICard title="Availability %" value={kpis.avail} delta={kpis.availDelta} deltaType={kpis.availDelta.includes("▲") ? "positive" : "negative"} <KPICard title="Availability %" value={kpis.avail} delta={kpis.availDelta} deltaType={kpis.availDelta.includes("▲") ? "positive" : "negative"} sub="Reflects stock health across all connected platforms" accentColor="bg-sw-green" delay={0} /> delay={0} />
        <KPICard title="Share of Search" value={kpis.sos} delta={kpis.sosDelta} deltaType="positive" sub="Avg across keywords" accentColor="bg-sw-purple" delay={0.05} />
        <KPICard title="Sponsored Rank" value={kpis.sponsRank} delta={kpis.sponsDelta} deltaType="neutral" sub="Avg weighted by spend" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Organic Rank" value={kpis.orgRank} delta={kpis.orgDelta} deltaType="neutral" sub="Avg across keywords" accentColor="bg-sw-cyan" delay={0.12} />
        <KPICard title="ROAS" value={kpis.roas} delta={kpis.roasDelta} deltaType="positive" sub="Blended across platforms" accentColor="bg-sw-green" delay={0.15} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PanelCard title={`Platform Performance — ${timeRange}`} badge="Net Margin View" badgeColor="accent" className="col-span-2" delay={0.2}>
          <table className="w-full text-xs">
            <thead>
              <tr className="text-muted-foreground">
                <th className="text-left py-2 font-normal">Platform</th>
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
                  <td className="py-3 text-right font-mono text-muted-foreground">{r.spend}</td>
                  <td className={`py-3 text-right font-mono ${r.retColor}`}>{r.returns}</td>
                  <td className={`py-3 text-right font-mono ${r.mColor}`}>{r.margin}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`mt-4 p-3 rounded-xl ${planAdded ? "bg-sw-green-dim border border-sw-green/20" : "bg-primary/10 border border-primary/20"}`}>
            <p className="text-[11px] text-foreground">💡 Blinkit has the highest net margin. Consider reallocating 10% of Flipkart spend to Blinkit.</p>
            <button onClick={() => setPlanAdded(true)} className={`mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium ${planAdded ? "bg-sw-green/20 text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
              {planAdded ? "✓ Added to Plan" : "Add to Plan"}
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Scheduled Reports" delay={0.25}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{reports.length} active</span>
            <button onClick={() => setShowNewReport(true)}
              className="px-3 py-1 rounded-lg text-[11px] font-medium border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1">
              <Plus size={10} /> New Report
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
            {reportCreated && (
              <div className="bg-surface-2 rounded-xl border border-sw-green/30 p-3">
                <p className="text-xs text-foreground font-medium">{reportConfig.name || "Custom Report"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{reportConfig.frequency} · {reportConfig.emails.filter(e => e).join(", ")}</p>
                <span className="inline-block mt-1.5 font-mono text-[9px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">ACTIVE</span>
              </div>
            )}
          </div>
        </PanelCard>
      </div>

      {/* New Report Config Dialog */}
      <Dialog open={showNewReport} onOpenChange={setShowNewReport}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Schedule New Report</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Report Name</label>
              <input value={reportConfig.name} onChange={e => setReportConfig(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="e.g. Weekly Performance Summary" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Frequency</label>
                <select value={reportConfig.frequency} onChange={e => setReportConfig(p => ({ ...p, frequency: e.target.value }))}
                  className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Daily</option><option>Weekly</option><option>Bi-Weekly</option><option>Monthly</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Day</label>
                <select value={reportConfig.day} onChange={e => setReportConfig(p => ({ ...p, day: e.target.value }))}
                  className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Time</label>
                <input type="time" value={reportConfig.time} onChange={e => setReportConfig(p => ({ ...p, time: e.target.value }))}
                  className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Format</label>
              <div className="flex gap-2">
                {["PDF", "CSV", "Excel"].map(f => (
                  <button key={f} onClick={() => setReportConfig(p => ({ ...p, format: f }))}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium ${reportConfig.format === f ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground"}`}>{f}</button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] text-muted-foreground">Email Recipients</label>
                <button onClick={addEmail} className="text-[10px] text-primary flex items-center gap-0.5"><Plus size={10} /> Add</button>
              </div>
              <div className="space-y-2">
                {reportConfig.emails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Mail size={12} className="text-muted-foreground flex-shrink-0" />
                    <input value={email} onChange={e => updateEmail(i, e.target.value)}
                      className="flex-1 bg-surface-2 border border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground" placeholder="email@example.com" />
                    {reportConfig.emails.length > 1 && (
                      <button onClick={() => removeEmail(i)} className="text-muted-foreground hover:text-foreground"><X size={12} /></button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:bg-surface-2">Cancel</button>
            </DialogClose>
            <button onClick={() => { setReportCreated(true); setShowNewReport(false); }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              Schedule Report
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </>) : (
        <div className="space-y-5">
          <div className="rounded-xl border border-subtle bg-surface-1 p-5">
            <h3 className="text-sm font-medium text-foreground mb-3">Raw Data Tables</h3>
            <p className="text-xs text-muted-foreground mb-4">Export raw performance data for custom analysis</p>
            <div className="grid grid-cols-3 gap-3">
              {["Campaign Performance", "Keyword Metrics", "Platform Analytics", "SKU Analytics", "Attribution Data", "Audience Segments"].map((t) => (
                <button key={t} className="p-3 rounded-xl bg-surface-2 border border-subtle text-left hover:bg-surface-3 transition-colors">
                  <p className="text-xs text-foreground font-medium">{t}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Export CSV / View</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsView;
