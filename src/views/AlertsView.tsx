import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import AlertItem from "@/components/sw/AlertItem";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Mail, Plus, X, Settings, Check } from "lucide-react";

const severityFilter = ["All", "Critical", "Warning", "Resolved"];

const criticalAlerts = [
  { icon: "🚨", title: "OOS — Marie Gold 250g on Instamart", detail: "6 Mumbai pin codes out of stock.", meta: "2m ago · Instamart", action: "Alert Team" },
  { icon: "💸", title: "Good Day 18.8% above market", detail: "Sunfeast and Parle priced ₹5 lower. Conversion drop -22%.", meta: "15m ago · Amazon", action: "Fix Price" },
  { icon: "📉", title: "Cream biscuits rank drop #5→#8", detail: "Competitor launched sponsored push with 3x bid.", meta: "32m ago · Flipkart", action: "Raise Bid" },
  { icon: "⚠️", title: "Blinkit Good Day stock at 12%", detail: "Trending +47%. Will stock out in 2.3 days.", meta: "1h ago · Blinkit", action: "Reorder" },
];

const warningAlerts = [
  { icon: "📝", title: "Content score below 40%", detail: "50-50 Maska Chaska listing missing A+ content, 3 images, 4 keywords.", meta: "2h ago · Amazon", action: "Fix Now" },
  { icon: "💰", title: "ROAS below 2.5x threshold", detail: "Flipkart Marie Gold at 2.1x for 5 days. Auto-pause triggered.", meta: "3h ago · Flipkart", action: "Review" },
  { icon: "🏷️", title: "Negative review spike", detail: "4 new 1-star reviews on Zepto Bourbon — all mention packaging damaged.", meta: "5h ago · Zepto", action: "Escalate" },
];

const resolvedAlerts = [
  { icon: "✅", title: "AI auto-resolved", detail: "Flipkart Bourbon bid ₹28→₹18. ROAS improved 1.9x→4.1x in 4 hours.", meta: "Today 2PM", action: "View Details" },
  { icon: "✅", title: "Stock replenished", detail: "Marie Gold restocked on Zepto. Availability back to 93% Delhi NCR.", meta: "Today 11AM", action: "View Details" },
];

const categoryOptions = ["All", "Stock", "Pricing", "Campaigns", "Content", "Reviews"];

const rules = [
  { name: "Stock < 20%", desc: "Alert → Category Head", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Stock" },
  { name: "Competitor price ±8%", desc: "Alert + auto-analyze → Trade Marketing", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Pricing" },
  { name: "ROAS < 2.5x for 3d", desc: "Auto-pause campaign → Alert Ecom Mgr", status: "ON + AUTO", sColor: "text-sw-green bg-sw-green-dim", category: "Campaigns" },
  { name: "Search rank drops ≥5", desc: "Alert + suggest bid raise → Ops team", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Campaigns" },
  { name: "Review rating < 4.0", desc: "Alert → Customer Success + Brand Head", status: "ON", sColor: "text-sw-amber bg-sw-amber-dim", category: "Reviews" },
  { name: "Content score < 50%", desc: "Alert + AI draft fix → Content Team", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Content" },
];

const screenOptions = [
  { screen: "Availability", desc: "OOS and stock alerts" },
  { screen: "Pricing", desc: "Price change alerts" },
  { screen: "Keyword Analysis", desc: "Rank drop alerts" },
  { screen: "Content Quality", desc: "Content score alerts" },
  { screen: "Campaign Manager", desc: "ROAS and budget alerts" },
  { screen: "Market Share", desc: "Share change alerts" },
];

const AlertsView: React.FC = () => {
  const [showNewAlert, setShowNewAlert] = useState(false);
  const [severityView, setSeverityView] = useState("All");
  const [categoryView, setCategoryView] = useState("All");
  const [ruleToggles, setRuleToggles] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    rules.forEach((_, i) => { init[i] = true; });
    return init;
  });
  const [showEmailConfig, setShowEmailConfig] = useState(false);
  const [emailConfig, setEmailConfig] = useState<Record<string, { enabled: boolean; emails: string[] }>>(() => {
    const init: Record<string, { enabled: boolean; emails: string[] }> = {};
    screenOptions.forEach(s => { init[s.screen] = { enabled: true, emails: ["team@britannia.com"] }; });
    return init;
  });
  const [emailSaved, setEmailSaved] = useState(false);

  // New alert form state
  const [newAlertConfig, setNewAlertConfig] = useState({ name: "", category: "Stock", threshold: "", action: "Alert", emails: [""] });
  const [alertCreated, setAlertCreated] = useState(false);

  const filteredRules = categoryView === "All" ? rules : rules.filter(r => r.category === categoryView);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Critical Alerts" value="4" delta="Needs immediate action" deltaType="negative" sub="Action required now" accentColor="bg-sw-red" delay={0} />
        <KPICard title="Warnings" value="11" delta="Review within 24h" deltaType="warning" sub="Pricing, content, stock" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Resolved Today" value="7" delta="▲ 3 auto-resolved by AI" deltaType="positive" sub="Campaign pauses, price actions" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Alert Rules Active" value="34" delta="Monitoring 24/7" deltaType="neutral" sub="Stock, price, rank, ROAS" accentColor="bg-primary" delay={0.15} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="All Active Alerts" className="col-span-2" delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            {severityFilter.map(s => (
              <button key={s} onClick={() => setSeverityView(s)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                  severityView === s ? (
                    s === "Critical" ? "bg-sw-red/20 text-sw-red" :
                    s === "Warning" ? "bg-sw-amber/20 text-sw-amber" :
                    s === "Resolved" ? "bg-sw-green/20 text-sw-green" :
                    "bg-primary/20 text-primary"
                  ) : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>{s}</button>
            ))}
          </div>

          <div className="max-h-[600px] overflow-y-auto pr-1 space-y-4">
            {(severityView === "All" || severityView === "Critical") && (
              <>
                <p className="font-mono text-[10px] text-sw-red uppercase tracking-widest">CRITICAL</p>
                <div className="space-y-2">
                  {criticalAlerts.map((a) => (
                    <AlertItem key={a.title} severity="critical" icon={a.icon} title={a.title} detail={a.detail} meta={a.meta} action={a.action} />
                  ))}
                </div>
              </>
            )}
            {(severityView === "All" || severityView === "Warning") && (
              <>
                <p className="font-mono text-[10px] text-sw-amber uppercase tracking-widest pt-2">WARNINGS</p>
                <div className="space-y-2">
                  {warningAlerts.map((a) => (
                    <AlertItem key={a.title} severity="warning" icon={a.icon} title={a.title} detail={a.detail} meta={a.meta} action={a.action} />
                  ))}
                </div>
              </>
            )}
            {(severityView === "All" || severityView === "Resolved") && (
              <>
                <p className="font-mono text-[10px] text-sw-green uppercase tracking-widest pt-2">RESOLVED TODAY</p>
                <div className="space-y-2">
                  {resolvedAlerts.map((a) => (
                    <AlertItem key={a.title} severity="success" icon={a.icon} title={a.title} detail={a.detail} meta={a.meta} action={a.action} />
                  ))}
                </div>
              </>
            )}
          </div>
        </PanelCard>

        <PanelCard title="Alert Rules" delay={0.25}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{filteredRules.length} rules</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowEmailConfig(true)} className="px-2 py-1 rounded-lg text-[10px] font-medium border border-subtle text-muted-foreground hover:text-foreground flex items-center gap-1">
                <Settings size={10} /> Email Setup
              </button>
              <button onClick={() => setShowNewAlert(true)} className="px-3 py-1 rounded-lg text-[11px] font-medium border border-primary/30 text-primary hover:bg-primary/10 flex items-center gap-1">
                <Plus size={10} /> Rule
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {categoryOptions.map(c => (
              <button key={c} onClick={() => setCategoryView(c)}
                className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${
                  categoryView === c ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                }`}>{c}</button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredRules.map((r, ri) => {
              const origIdx = rules.indexOf(r);
              return (
                <div key={r.name} className="bg-surface-2 rounded-xl border border-subtle p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground font-medium">{r.name}</p>
                    <button
                      onClick={() => setRuleToggles(p => ({ ...p, [origIdx]: !p[origIdx] }))}
                      className={`font-mono text-[9px] px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                        ruleToggles[origIdx] ? r.sColor : "bg-surface-3 text-muted-foreground"
                      }`}>
                      {ruleToggles[origIdx] ? r.status : "OFF"}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              );
            })}
            {alertCreated && (
              <div className="bg-surface-2 rounded-xl border border-sw-green/30 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground font-medium">{newAlertConfig.name || "Custom Rule"}</p>
                  <span className="font-mono text-[9px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">ON</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{newAlertConfig.category} · {newAlertConfig.action}</p>
              </div>
            )}
          </div>
        </PanelCard>
      </div>

      {/* New Alert Rule Dialog */}
      <Dialog open={showNewAlert} onOpenChange={setShowNewAlert}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm">Create Alert Rule</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Rule Name</label>
              <input value={newAlertConfig.name} onChange={e => setNewAlertConfig(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="e.g. Low stock alert" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Category</label>
                <select value={newAlertConfig.category} onChange={e => setNewAlertConfig(p => ({ ...p, category: e.target.value }))}
                  className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Stock</option><option>Pricing</option><option>Campaigns</option><option>Content</option><option>Reviews</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Action</label>
                <select value={newAlertConfig.action} onChange={e => setNewAlertConfig(p => ({ ...p, action: e.target.value }))}
                  className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Alert</option><option>Alert + Auto-action</option><option>Escalate</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Threshold</label>
              <input value={newAlertConfig.threshold} onChange={e => setNewAlertConfig(p => ({ ...p, threshold: e.target.value }))}
                className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="e.g. < 20% or > ₹5000" />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Email Recipients</label>
              <div className="space-y-1.5">
                {newAlertConfig.emails.map((email, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input value={email} onChange={e => setNewAlertConfig(p => ({ ...p, emails: p.emails.map((em, j) => j === i ? e.target.value : em) }))}
                      className="flex-1 bg-surface-2 border border-subtle rounded-lg px-3 py-1.5 text-sm text-foreground" placeholder="email@example.com" />
                  </div>
                ))}
                <button onClick={() => setNewAlertConfig(p => ({ ...p, emails: [...p.emails, ""] }))} className="text-[10px] text-primary flex items-center gap-0.5"><Plus size={10} /> Add email</button>
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <button className="px-4 py-2 rounded-lg text-xs text-muted-foreground hover:bg-surface-2">Cancel</button>
            </DialogClose>
            <button onClick={() => { setAlertCreated(true); setShowNewAlert(false); }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90">
              Create Rule
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Email Configuration Dialog */}
      <Dialog open={showEmailConfig} onOpenChange={setShowEmailConfig}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-sm">Alert Email Configuration</DialogTitle>
          </DialogHeader>
          <p className="text-[11px] text-muted-foreground">Configure which screens send email alerts and to whom. All alerts are triggered via email.</p>
          <div className="space-y-3 max-h-[400px] overflow-y-auto">
            {screenOptions.map(s => {
              const cfg = emailConfig[s.screen];
              return (
                <div key={s.screen} className="p-3 bg-surface-2 rounded-xl border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-xs text-foreground font-medium">{s.screen}</p>
                      <p className="text-[10px] text-muted-foreground">{s.desc}</p>
                    </div>
                    <button onClick={() => setEmailConfig(p => ({ ...p, [s.screen]: { ...p[s.screen], enabled: !p[s.screen].enabled } }))}
                      className={`relative w-10 h-5 rounded-full transition-colors ${cfg.enabled ? "bg-primary" : "bg-surface-3"}`}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${cfg.enabled ? "translate-x-[20px]" : "translate-x-0.5"}`} />
                    </button>
                  </div>
                  {cfg.enabled && (
                    <div className="space-y-1">
                      {cfg.emails.map((email, i) => (
                        <div key={i} className="flex items-center gap-1">
                          <Mail size={10} className="text-muted-foreground flex-shrink-0" />
                          <input value={email} onChange={e => {
                            const newEmails = [...cfg.emails];
                            newEmails[i] = e.target.value;
                            setEmailConfig(p => ({ ...p, [s.screen]: { ...p[s.screen], emails: newEmails } }));
                          }} className="flex-1 bg-surface-1 border border-subtle rounded px-2 py-1 text-[11px] text-foreground" placeholder="email@example.com" />
                        </div>
                      ))}
                      <button onClick={() => setEmailConfig(p => ({ ...p, [s.screen]: { ...p[s.screen], emails: [...p[s.screen].emails, ""] } }))}
                        className="text-[9px] text-primary flex items-center gap-0.5"><Plus size={8} /> Add</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <DialogFooter>
            <button onClick={() => { setEmailSaved(true); setShowEmailConfig(false); setTimeout(() => setEmailSaved(false), 3000); }}
              className="px-4 py-2 rounded-lg text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-1">
              {emailSaved ? <><Check size={10} /> Saved</> : "Save Configuration"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AlertsView;
