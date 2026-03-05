import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import AlertItem from "@/components/sw/AlertItem";

const criticalAlerts = [
  { icon: "🚨", title: "OOS — Whey 500g on Instamart", detail: "6 Mumbai pin codes out of stock. Est. loss ₹1.2L/day.", meta: "2m ago · Instamart", action: "Alert Team" },
  { icon: "💸", title: "Pre-Workout 18.8% above market", detail: "MuscleBlaze and BigMuscles priced ₹300 lower. Conversion drop -22%.", meta: "15m ago · Amazon", action: "Fix Price" },
  { icon: "📉", title: "Creatine rank drop #4→#11", detail: "Competitor launched sponsored push with 3x bid.", meta: "32m ago · Flipkart", action: "Raise Bid" },
  { icon: "⚠️", title: "Blinkit Pre-Workout stock at 12%", detail: "Trending +47%. Will stock out in 2.3 days.", meta: "1h ago · Blinkit", action: "Reorder" },
];

const warningAlerts = [
  { icon: "📝", title: "Content score below 40%", detail: "Pre-Workout listing missing A+ content, 3 images, 4 keywords.", meta: "2h ago · Amazon", action: "Fix Now" },
  { icon: "💰", title: "ROAS below 2.5x threshold", detail: "Flipkart Creatine at 2.1x for 5 days. Auto-pause triggered.", meta: "3h ago · Flipkart", action: "Review" },
  { icon: "🏷️", title: "Negative review spike", detail: "4 new 1-star reviews on Zepto BCAA — all mention packaging damaged.", meta: "5h ago · Zepto", action: "Escalate" },
];

const resolvedAlerts = [
  { icon: "✅", title: "AI auto-resolved", detail: "Flipkart BCAA bid ₹28→₹18. ROAS improved 1.9x→4.1x in 4 hours.", meta: "Today 2PM", action: "View Details" },
  { icon: "✅", title: "Stock replenished", detail: "Whey 1kg restocked on Zepto. Availability back to 93% Delhi NCR.", meta: "Today 11AM", action: "View Details" },
];

const rules = [
  { name: "Stock < 20%", desc: "WhatsApp + Slack → Category Head", status: "ON", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Competitor price ±8%", desc: "Alert + auto-analyze → Trade Marketing", status: "ON", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "ROAS < 2.5x for 3d", desc: "Auto-pause campaign → Alert Ecom Mgr", status: "ON + AUTO", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Search rank drops ≥5", desc: "Alert + suggest bid raise → Ops team", status: "ON", sColor: "text-sw-green bg-sw-green-dim" },
  { name: "Review rating < 4.0", desc: "Alert → Customer Success + Brand Head", status: "ON", sColor: "text-sw-amber bg-sw-amber-dim" },
  { name: "Content score < 50%", desc: "Alert + AI draft fix → Content Team", status: "ON", sColor: "text-sw-green bg-sw-green-dim" },
];

const AlertsView: React.FC = () => {
  const [ruleAdded, setRuleAdded] = useState(false);

  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Critical Alerts" value="4" delta="Needs immediate action" deltaType="negative" sub="Revenue at risk: ₹12.8L/day" accentColor="bg-sw-red" delay={0} />
        <KPICard title="Warnings" value="11" delta="Review within 24h" deltaType="warning" sub="Pricing, content, stock" accentColor="bg-sw-amber" delay={0.05} />
        <KPICard title="Resolved Today" value="7" delta="▲ 3 auto-resolved by AI" deltaType="positive" sub="Campaign pauses, price actions" accentColor="bg-sw-green" delay={0.1} />
        <KPICard title="Alert Rules Active" value="34" delta="Monitoring 24/7" deltaType="neutral" sub="Stock, price, rank, ROAS" accentColor="bg-primary" delay={0.15} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="All Active Alerts" className="col-span-2" delay={0.2}>
          <div className="max-h-[600px] overflow-y-auto pr-1 space-y-4">
            <p className="font-mono text-[10px] text-sw-red uppercase tracking-widest">CRITICAL</p>
            <div className="space-y-2">
              {criticalAlerts.map((a) => (
                <AlertItem key={a.title} severity="critical" icon={a.icon} title={a.title} detail={a.detail} meta={a.meta} action={a.action} />
              ))}
            </div>
            <p className="font-mono text-[10px] text-sw-amber uppercase tracking-widest pt-2">WARNINGS</p>
            <div className="space-y-2">
              {warningAlerts.map((a) => (
                <AlertItem key={a.title} severity="warning" icon={a.icon} title={a.title} detail={a.detail} meta={a.meta} action={a.action} />
              ))}
            </div>
            <p className="font-mono text-[10px] text-sw-green uppercase tracking-widest pt-2">RESOLVED TODAY</p>
            <div className="space-y-2">
              {resolvedAlerts.map((a) => (
                <AlertItem key={a.title} severity="success" icon={a.icon} title={a.title} detail={a.detail} meta={a.meta} action={a.action} />
              ))}
            </div>
          </div>
        </PanelCard>

        <PanelCard title="Alert Rules" delay={0.25}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-muted-foreground">{rules.length} rules</span>
            <button onClick={() => setRuleAdded(true)} className={`px-3 py-1 rounded-lg text-[11px] font-medium ${ruleAdded ? "bg-sw-green-dim text-sw-green" : "border border-primary/30 text-primary hover:bg-primary/10"}`}>
              {ruleAdded ? "✓ Rule Added" : "+ Rule"}
            </button>
          </div>
          <div className="space-y-2">
            {rules.map((r) => (
              <div key={r.name} className="bg-surface-2 rounded-xl border border-subtle p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-foreground font-medium">{r.name}</p>
                  <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${r.sColor}`}>{r.status}</span>
                </div>
                <p className="text-[10px] text-muted-foreground mt-0.5">{r.desc}</p>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>
    </div>
  );
};

export default AlertsView;
