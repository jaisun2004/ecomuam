import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import AlertItem from "@/components/sw/AlertItem";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const severityFilter = ["All", "Critical", "Warning", "Resolved"];

const criticalAlerts = [
  { icon: "🚨", title: "OOS — Sugar Free 500ml", detail: "Out of stock on Blinkit Delhi NCR. Critical availability drop.", meta: "2m ago", action: "View Details" },
  { icon: "💸", title: "Original 500ml priced above market", detail: "Red Bull dropped price by ₹10. You're now 20% above on Sugar Free.", meta: "15m ago", action: "View Pricing" },
  { icon: "📉", title: "Berry rank dropped #3→#8", detail: "Competitor launched sponsored push with higher bids.", meta: "32m ago", action: "View" },
  { icon: "⚠️", title: "Electrolyte stock at 12%", detail: "Trending upward. Will stock out in 2.3 days.", meta: "1h ago", action: "View" },
];

const warningAlerts = [
  { icon: "📝", title: "Content score below 40%", detail: "Shot 60ml listing missing A+ content, 3 images, 4 keywords.", meta: "2h ago", action: "View" },
  { icon: "💰", title: "ROAS below 2.5x threshold", detail: "Sugar Free Retargeting at 2.1x for 5 days.", meta: "3h ago", action: "View" },
  { icon: "🏷️", title: "Negative review spike", detail: "3 new 1-star reviews on Berry 350ml — packaging damage.", meta: "5h ago", action: "View" },
];

const resolvedAlerts = [
  { icon: "✅", title: "AI auto-resolved bid", detail: "Energy drink keyword bid ₹28→₹18. ROAS improved 1.9x→4.1x.", meta: "Today 2PM", action: "View Details" },
  { icon: "✅", title: "Stock replenished", detail: "Original 500ml restocked on Zepto. Availability back to 93%.", meta: "Today 11AM", action: "View Details" },
];

const categoryOptions = ["All", "Stock", "Pricing", "Campaigns", "Content", "Reviews"];

const rules = [
  { name: "Stock < 20%", desc: "Alert → Category Head", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Stock" },
  { name: "Competitor price ±8%", desc: "Alert → Trade Marketing", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Pricing" },
  { name: "ROAS < 2.5x for 3d", desc: "Auto-pause → Alert Ecom Mgr", status: "ON + AUTO", sColor: "text-sw-green bg-sw-green-dim", category: "Campaigns" },
  { name: "Search rank drops ≥5", desc: "Alert → Ops team", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Campaigns" },
  { name: "Review rating < 4.0", desc: "Alert → Customer Success", status: "ON", sColor: "text-sw-amber bg-sw-amber-dim", category: "Reviews" },
  { name: "Content score < 50%", desc: "Alert → Content Team", status: "ON", sColor: "text-sw-green bg-sw-green-dim", category: "Content" },
];

const AlertsView: React.FC<ViewProps> = ({ platform }) => {
  const [severityView, setSeverityView] = useState("All");
  const [categoryView, setCategoryView] = useState("All");
  const [ruleToggles, setRuleToggles] = useState<Record<number, boolean>>(() => {
    const init: Record<number, boolean> = {};
    rules.forEach((_, i) => { init[i] = true; });
    return init;
  });

  const filteredRules = categoryView === "All" ? rules : rules.filter(r => r.category === categoryView);

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Critical Alerts" value="4" delta="Needs immediate action" deltaType="negative" sub={`${platform} · Energy Drinks`} accentColor="bg-sw-red" delay={0} />
        <KPICard title="Warnings" value="11" delta="Review within 24h" deltaType="warning" sub="Pricing, content, stock" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Resolved Today" value="7" delta="▲ 3 auto-resolved by AI" deltaType="positive" sub="Automated actions" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Alert Rules Active" value="34" delta="Monitoring 24/7" deltaType="neutral" sub="Stock, price, rank, ROAS" accentColor="bg-primary" delay={0.15} />
      </motion.div>

      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <PanelCard title="All Active Alerts" className="col-span-2" delay={0}>
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
                }`}>
                {s}
              </button>
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

        <PanelCard title="Alert Rules" delay={0}>
          <div className="flex items-center gap-1 mb-3 flex-wrap">
            {categoryOptions.map(c => (
              <button key={c} onClick={() => setCategoryView(c)}
                className={`px-2 py-1 rounded-lg text-[9px] font-medium transition-all ${categoryView === c ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-2">
            {filteredRules.map((r, ri) => {
              const origIdx = rules.indexOf(r);
              return (
                <div key={r.name} className="bg-surface-2 rounded-xl border border-subtle p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-foreground font-medium">{r.name}</p>
                    <button onClick={() => setRuleToggles(p => ({ ...p, [origIdx]: !p[origIdx] }))}
                      className={`font-mono text-[9px] px-2 py-0.5 rounded-full transition-all cursor-pointer ${ruleToggles[origIdx] ? r.sColor : "bg-surface-3 text-muted-foreground"}`}>
                      {ruleToggles[origIdx] ? r.status : "OFF"}
                    </button>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
                </div>
              );
            })}
          </div>
        </PanelCard>
      </motion.div>
    </motion.div>
  );
};

export default AlertsView;
