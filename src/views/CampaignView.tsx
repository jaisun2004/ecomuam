import React, { useState } from "react";
import { motion } from "framer-motion";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip } from "recharts";
import { ChevronDown, ChevronRight, X, Plus, Sparkles, History, FileEdit, Clock, GripVertical } from "lucide-react";
import type { ViewProps } from "@/pages/Index";

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const fadeUp = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.35 } } };

const revenueData = [
  { day: "Mar 1", revenue: 180, spend: 40 },
  { day: "Mar 5", revenue: 195, spend: 42 },
  { day: "Mar 10", revenue: 210, spend: 45 },
  { day: "Mar 15", revenue: 230, spend: 48 },
  { day: "Mar 20", revenue: 245, spend: 50 },
  { day: "Mar 25", revenue: 258, spend: 52 },
  { day: "Mar 30", revenue: 270, spend: 55 },
];

const campaignsByPlatform: Record<string, { name: string; roas: string; revenue: string; spend: string; status: string; ai: boolean; reason?: string }[]> = {
  Amazon: [
    { name: "EnergyMax — Sponsored Products", roas: "5.1x", revenue: "₹4.2L", spend: "₹82K", status: "LIVE", ai: true },
    { name: "Sugar Free — Keyword Target", roas: "2.1x", revenue: "₹63K", spend: "₹30K", status: "PAUSED", ai: false, reason: "ROAS below 2.5x" },
    { name: "Berry Variant Launch", roas: "4.4x", revenue: "₹2.2L", spend: "₹50K", status: "LIVE", ai: true },
  ],
  Flipkart: [
    { name: "Energy Drink — Brand Push", roas: "3.2x", revenue: "₹1.6L", spend: "₹50K", status: "LIVE", ai: false },
    { name: "Sugar Free Retargeting", roas: "2.1x", revenue: "₹63K", spend: "₹30K", status: "PAUSED", ai: false, reason: "ROAS below 2.5x" },
  ],
  Blinkit: [
    { name: "Q-Commerce Launch Push", roas: "3.8x", revenue: "₹1.9L", spend: "₹50K", status: "LIVE", ai: true },
    { name: "Citrus Quick Delivery", roas: "4.2x", revenue: "₹84K", spend: "₹20K", status: "LIVE", ai: true },
  ],
  Zepto: [
    { name: "Energy Drink New Users", roas: "3.2x", revenue: "₹96K", spend: "₹30K", status: "LIVE", ai: true },
  ],
  Instamart: [
    { name: "Original 500ml Push", roas: "2.8x", revenue: "₹56K", spend: "₹20K", status: "LIVE", ai: false },
  ],
};

const keywords = [
  { kw: "energy drink 500ml", bid: "₹28", roas: "6.2x", imp: "142K", roasColor: "text-sw-green" },
  { kw: "energy drink", bid: "₹45", roas: "3.1x", imp: "498K", roasColor: "text-sw-amber" },
  { kw: "sugar free energy drink", bid: "₹22", roas: "1.4x", imp: "87K", roasColor: "text-sw-red" },
  { kw: "energy booster", bid: "₹18", roas: "5.8x", imp: "63K", roasColor: "text-sw-green" },
  { kw: "sports drink india", bid: "₹12", roas: "1.8x", imp: "321K", roasColor: "text-sw-red" },
];

const dayPartingSlots = [
  { slot: "Early Morning", time: "6:00 – 9:00 AM", campaigns: ["EnergyMax — Sponsored Products"], budgetPct: 15 },
  { slot: "Morning Peak", time: "9:00 AM – 12:00 PM", campaigns: ["EnergyMax — Sponsored Products", "Berry Variant Launch"], budgetPct: 25 },
  { slot: "Afternoon", time: "12:00 – 4:00 PM", campaigns: ["Sugar Free — Keyword Target"], budgetPct: 15 },
  { slot: "Evening Peak", time: "4:00 – 8:00 PM", campaigns: ["EnergyMax — Sponsored Products", "Berry Variant Launch", "Q-Commerce Launch Push"], budgetPct: 30 },
  { slot: "Night", time: "8:00 PM – 12:00 AM", campaigns: ["EnergyMax — Sponsored Products"], budgetPct: 12 },
  { slot: "Late Night", time: "12:00 – 6:00 AM", campaigns: ["Sugar Free — Keyword Target"], budgetPct: 3 },
];

const copilotCards = [
  { impact: "HIGH IMPACT", emoji: "💰", text: "Shift ₹25K from Sugar Free (ROAS 2.1x) to EnergyMax Sponsored (ROAS 5.1x). Projected uplift: +₹1.04L.", confidence: 91, action: "Apply Now" },
  { impact: "HIGH IMPACT", emoji: "🔍", text: "Add 8 new long-tail keywords: 'energy drink for gym' has 0% competition and 45K searches.", confidence: 86, action: "Add Keywords" },
  { impact: "MED IMPACT", emoji: "⚡", text: "Berry variant trending +47% on Blinkit. Launch 7-day burst campaign before stock drops.", confidence: 78, action: "Launch Campaign" },
];

/* Campaign Creator Modal */
const CampaignCreatorModal: React.FC<{ open: boolean; onClose: () => void; platform: string }> = ({ open, onClose, platform }) => {
  const [method, setMethod] = useState<null | "ai" | "history" | "manual">(null);
  const [launched, setLaunched] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface-1 border border-border-visible rounded-2xl w-[680px] max-h-[80vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Create Campaign — {platform}</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your creation method</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground"><X size={16} /></button>
        </div>

        {!method && !launched && (
          <div className="p-6 grid grid-cols-3 gap-4">
            {[
              { key: "ai" as const, icon: Sparkles, label: "Autonomous AI", desc: "AI recommends based on signals" },
              { key: "history" as const, icon: History, label: "From History", desc: "Clone a past campaign" },
              { key: "manual" as const, icon: FileEdit, label: "Manual Entry", desc: "Full control" },
            ].map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-subtle bg-surface-2 hover:border-primary/40 transition-all">
                <m.icon size={24} className="text-primary" />
                <span className="font-display font-bold text-sm text-foreground">{m.label}</span>
                <span className="text-[11px] text-muted-foreground text-center">{m.desc}</span>
              </button>
            ))}
          </div>
        )}

        {method === "manual" && !launched && (
          <div className="p-6 space-y-4">
            <button onClick={() => setMethod(null)} className="text-[11px] text-primary mb-2">← Back</button>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Campaign Name</label>
                <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="e.g. Summer Energy Push" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Campaign Type</label>
                <select className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Sponsored Products</option><option>Keyword Conquesting</option><option>Retargeting</option><option>Brand Awareness</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Daily Budget</label>
                <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="₹5,000" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Target ROAS</label>
                <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="4.0x" />
              </div>
            </div>
            <button onClick={() => setLaunched(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/80">
              🚀 Create Campaign
            </button>
          </div>
        )}

        {method === "ai" && !launched && (
          <div className="p-6 space-y-3">
            <button onClick={() => setMethod(null)} className="text-[11px] text-primary mb-2">← Back</button>
            {[
              { name: "Stock Recovery Blitz", signal: "Sugar Free OOS on Blinkit", roas: "4.8x" },
              { name: "Price Advantage Push", signal: "Original 20% cheaper than Red Bull", roas: "5.2x" },
              { name: "Trending Capture", signal: "Berry energy +47% search on Blinkit", roas: "3.9x" },
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-subtle bg-surface-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-display font-bold text-sm text-foreground">{s.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">Est. ROAS {s.roas}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">📡 {s.signal}</p>
                <button onClick={() => setLaunched(true)} className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/20 text-primary hover:bg-primary/30">
                  🚀 Launch
                </button>
              </div>
            ))}
          </div>
        )}

        {method === "history" && !launched && (
          <div className="p-6 space-y-3">
            <button onClick={() => setMethod(null)} className="text-[11px] text-primary mb-2">← Back</button>
            {[
              { name: "Summer Energy Push 2025", roas: "4.9x", duration: "14 days" },
              { name: "Festive Season Blast", roas: "5.6x", duration: "21 days" },
            ].map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-subtle bg-surface-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">{h.name}</span>
                  <div className="flex gap-3 text-[10px] font-mono text-muted-foreground mt-1">
                    <span>ROAS: {h.roas}</span><span>{h.duration}</span>
                  </div>
                </div>
                <button onClick={() => setLaunched(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/20 text-primary">Clone & Edit</button>
              </div>
            ))}
          </div>
        )}

        {launched && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-sw-green-dim flex items-center justify-center mx-auto mb-4"><span className="text-2xl">✓</span></div>
            <h3 className="font-display font-bold text-foreground text-lg">Campaign Created!</h3>
            <p className="text-xs text-muted-foreground mt-1">Now live and being optimized by AI</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg text-sm bg-surface-3 text-foreground hover:bg-surface-2">Close</button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

const CampaignView: React.FC<ViewProps> = ({ platform }) => {
  const [bidStates, setBidStates] = useState<Record<number, string>>({});
  const [copilotStates, setCopilotStates] = useState<Record<number, boolean>>({});
  const [showDayParting, setShowDayParting] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [expandedSlots, setExpandedSlots] = useState<Record<number, boolean>>({});
  const [slotStates, setSlotStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    dayPartingSlots.forEach((s, si) => s.campaigns.forEach((_, ci) => { init[`${si}-${ci}`] = true; }));
    return init;
  });

  const campaigns = campaignsByPlatform[platform] || campaignsByPlatform.Amazon;

  return (
    <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6 pb-20">
      <CampaignCreatorModal open={showCreator} onClose={() => setShowCreator(false)} platform={platform} />

      <motion.div variants={fadeUp} className="grid grid-cols-4 gap-4">
        <KPICard title="Total Ad Spend (30D)" value="₹18.4L" delta="▲ ₹2.1L vs last mo" deltaType="positive" sub={`${platform} · ${campaigns.length} campaigns`} accentColor="bg-primary" delay={0} />
        <KPICard title="Blended ROAS" value="4.2x" delta="▲ 0.6x MoM" deltaType="positive" sub="Target: 4.5x · 93% of goal" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="AI-Optimised Budget" value="67%" delta="▲ Auto-reallocated" deltaType="positive" sub="From underperforming campaigns" accentColor="bg-primary" delay={0.1} />
        <KPICard title="Attributed Revenue" value="₹77L" delta="▲ 18% MoM" deltaType="positive" sub="Ad-attributed orders" accentColor="bg-sw-cyan" delay={0.15} />
      </motion.div>

      {/* Action bar */}
      <motion.div variants={fadeUp} className="flex items-center gap-3 justify-end">
        <button onClick={() => setShowCreator(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/80 transition-all">
          <Plus size={14} /> Create Campaign
        </button>
        <button onClick={() => setShowDayParting(!showDayParting)} className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${showDayParting ? "bg-sw-amber-dim text-sw-amber border border-sw-amber/20" : "bg-surface-2 border border-subtle text-foreground hover:bg-surface-3"}`}>
          <Clock size={14} /> Day Parting
        </button>
      </motion.div>

      {/* Day Parting */}
      {showDayParting && (
        <motion.div variants={fadeUp}>
          <PanelCard title="Day Parting Configuration" badge="6 time slots" badgeColor="amber" delay={0}>
            <div className="mb-5">
              <div className="flex h-8 rounded-xl overflow-hidden border border-subtle">
                {dayPartingSlots.map((s, i) => {
                  const colors = ["bg-primary/40", "bg-sw-green/40", "bg-sw-amber/40", "bg-primary/30", "bg-sw-cyan/40", "bg-surface-3"];
                  return (
                    <div key={i} className={`${colors[i]} flex items-center justify-center cursor-pointer hover:opacity-80`}
                      style={{ width: `${s.budgetPct}%` }}
                      onClick={() => setExpandedSlots(p => ({ ...p, [i]: !p[i] }))}>
                      <span className="text-[8px] font-mono text-foreground truncate px-1">{s.budgetPct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-2">
              {dayPartingSlots.map((s, si) => (
                <div key={si} className="border border-subtle rounded-xl overflow-hidden">
                  <button onClick={() => setExpandedSlots(p => ({ ...p, [si]: !p[si] }))}
                    className="w-full flex items-center gap-3 p-3 hover:bg-surface-2 transition-colors">
                    {expandedSlots[si] ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                    <Clock size={13} className="text-sw-amber" />
                    <span className="text-xs font-medium text-foreground">{s.slot}</span>
                    <span className="text-[10px] font-mono text-muted-foreground">{s.time}</span>
                    <span className="ml-auto font-mono text-[10px] text-sw-amber">{s.budgetPct}% budget</span>
                  </button>
                  {expandedSlots[si] && (
                    <div className="border-t border-subtle p-3 bg-surface-2/30 space-y-1.5">
                      {s.campaigns.map((cName, ci) => {
                        const key = `${si}-${ci}`;
                        return (
                          <div key={ci} className="flex items-center gap-3 p-2 rounded-lg bg-surface-2 border border-subtle">
                            <GripVertical size={12} className="text-muted-foreground" />
                            <span className="text-[11px] text-foreground flex-1">{cName}</span>
                            <button onClick={() => setSlotStates(p => ({ ...p, [key]: !p[key] }))}
                              className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${slotStates[key] ? "bg-sw-green-dim text-sw-green" : "bg-sw-red-dim text-sw-red"}`}>
                              {slotStates[key] ? "ACTIVE" : "OFF"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PanelCard>
        </motion.div>
      )}

      {/* Chart + Campaign cards */}
      <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4">
        <PanelCard title="Revenue vs Ad Spend — 30D" badge="ROAS improving" badgeColor="green" className="col-span-2" delay={0}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160,70%,48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160,70%,48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(268,78%,54%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(268,78%,54%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(255,8%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(260,22%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(160,70%,48%)" fill="url(#gRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="spend" stroke="hsl(268,78%,54%)" fill="url(#gSpend)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title={`Active Campaigns — ${platform}`} badge={`${campaigns.length} total`} badgeColor="accent" delay={0}>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {campaigns.map((c) => (
              <div key={c.name} className="p-3 rounded-xl border border-subtle bg-surface-2">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground font-medium truncate">{c.name}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-[10px] mb-2">
                  <div><span className="text-muted-foreground">ROAS</span><p className="font-mono text-foreground">{c.roas}</p></div>
                  <div><span className="text-muted-foreground">Rev</span><p className="font-mono text-foreground">{c.revenue}</p></div>
                  <div><span className="text-muted-foreground">Spend</span><p className="font-mono text-foreground">{c.spend}</p></div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-[10px] ${c.status === "LIVE" ? "text-sw-green" : "text-sw-amber"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${c.status === "LIVE" ? "bg-sw-green animate-pulse" : "bg-sw-amber"}`} />
                    {c.status}
                  </span>
                  {c.reason && <span className="text-[9px] text-muted-foreground">— {c.reason}</span>}
                  {c.ai && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-sw-purple-dim text-sw-purple font-mono">⚡ AI</span>}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* Keyword Bid Optimiser */}
      <motion.div variants={fadeUp}>
        <PanelCard title={`Keyword Bid Optimiser — ${platform}`} badge="Auto-bid ON" badgeColor="accent" delay={0}>
          <div className="grid grid-cols-2 gap-x-6">
            {keywords.map((k, i) => (
              <div key={k.kw} className="flex items-center gap-2 py-2 border-b border-subtle last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground truncate font-mono">{k.kw}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{k.bid} · {k.imp} imp</p>
                </div>
                <span className={`font-mono text-[10px] ${k.roasColor}`}>{k.roas}</span>
                <button onClick={() => setBidStates((p) => ({ ...p, [i]: "✓" }))}
                  className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${bidStates[i] ? "bg-sw-green-dim text-sw-green border-sw-green/20" : "border-subtle text-muted-foreground hover:text-foreground"}`}>
                  {bidStates[i] || "Optimize"}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>
      </motion.div>

      {/* AI Copilot */}
      <motion.div variants={fadeUp}>
        <div className="rounded-2xl overflow-hidden border border-primary/20">
          <div className="bg-gradient-to-r from-primary/20 to-sw-cyan/10 px-6 py-4">
            <h3 className="font-display font-bold text-foreground">🧠 AI Campaign Copilot — 3 Recommendations</h3>
          </div>
          <div className="bg-surface-1 p-5 grid grid-cols-3 gap-4">
            {copilotCards.map((c, i) => (
              <div key={i} className="bg-surface-2 rounded-xl border border-subtle p-4">
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${c.impact === "HIGH IMPACT" ? "bg-sw-green-dim text-sw-green" : "bg-sw-amber-dim text-sw-amber"}`}>{c.impact}</span>
                <p className="text-sm text-foreground mt-3">{c.emoji} {c.text}</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">Confidence: {c.confidence}%</p>
                <button onClick={() => setCopilotStates((p) => ({ ...p, [i]: true }))}
                  className={`mt-3 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${copilotStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"}`}>
                  {copilotStates[i] ? "✓ Applied!" : c.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CampaignView;
