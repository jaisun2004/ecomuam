import React, { useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, BarChart, Bar, ScatterChart, Scatter, ZAxis } from "recharts";
import { ChevronDown, ChevronRight, FileText, X, Plus, Sparkles, History, FileEdit, Clock, GripVertical, Shield, AlertTriangle, Swords, TrendingUp, Target, DollarSign, Zap } from "lucide-react";
import { useGuardrails } from "@/contexts/GuardrailContext";

/* ── existing mock data ── */
const revenueData = [
  { day: "Mar 1", spend: 40 },
  { day: "Mar 5", spend: 42 },
  { day: "Mar 10", spend: 45 },
  { day: "Mar 15", spend: 48 },
  { day: "Mar 20", spend: 50 },
  { day: "Mar 25", spend: 52 },
  { day: "Mar 30", spend: 55 },
];

const campaigns = [
  { name: "Good Day Butter — Sponsored", platform: "Amazon", platformColor: "#FF9900", roas: "5.1x", spend: "₹82K", status: "LIVE", ai: true },
  { name: "Q-Commerce Biscuit Push", platform: "Blinkit", platformColor: "#FDDC2B", roas: "3.8x", spend: "₹50K", status: "LIVE", ai: true },
  { name: "Marie Gold Retargeting", platform: "Flipkart", platformColor: "#2F77FF", roas: "2.1x", spend: "₹30K", status: "PAUSED", ai: false, reason: "ROAS below 2.5x" },
  { name: "Bourbon Brand Awareness", platform: "Instagram", platformColor: "#E1306C", roas: "4.4x", spend: "₹50K", status: "LIVE", ai: false },
  { name: "NutriChoice New Users", platform: "Zepto", platformColor: "#833AB4", roas: "3.2x", spend: "₹30K", status: "LIVE", ai: true },
];

const platformROAS = [
  { name: "Amazon", roas: 5.1, color: "#FF9900" },
  { name: "Blinkit", roas: 3.8, color: "#FDDC2B" },
  { name: "Flipkart", roas: 2.1, color: "#2F77FF" },
  { name: "Zepto", roas: 3.2, color: "#833AB4" },
  { name: "Instagram", roas: 4.4, color: "#E1306C" },
];

const budgetAlloc = [
  { name: "Amazon Ads", pct: 38, spend: "₹7L", roas: "5.1x", dir: "↑", color: "#FF9900", roasColor: "text-sw-green" },
  { name: "Instagram/Meta", pct: 22, spend: "₹4.1L", roas: "4.4x", dir: "↑", color: "#E1306C", roasColor: "text-sw-green" },
  { name: "Blinkit Ads", pct: 18, spend: "₹3.3L", roas: "3.8x", dir: "→", color: "#FDDC2B", roasColor: "text-sw-amber" },
  { name: "Flipkart Ads", pct: 12, spend: "₹2.2L", roas: "2.1x", dir: "↓", color: "#2F77FF", roasColor: "text-sw-red" },
  { name: "Zepto Ads", pct: 10, spend: "₹1.8L", roas: "3.2x", dir: "→", color: "#833AB4", roasColor: "text-sw-amber" },
];

const keywords = [
  { kw: "butter biscuits online", bid: "₹28", roas: "6.2x", imp: "142K", roasColor: "text-sw-green", action: "Raise bid", actionColor: "text-sw-green border-sw-green/30" },
  { kw: "cream biscuits", bid: "₹45", roas: "3.1x", imp: "498K", roasColor: "text-sw-amber", action: "Hold bid", actionColor: "text-muted-foreground border-subtle" },
  { kw: "glucose biscuits bulk", bid: "₹22", roas: "1.4x", imp: "87K", roasColor: "text-sw-red", action: "Lower bid", actionColor: "text-sw-red border-sw-red/30" },
  { kw: "digestive biscuits", bid: "₹18", roas: "5.8x", imp: "63K", roasColor: "text-sw-green", action: "Raise bid", actionColor: "text-sw-green border-sw-green/30" },
  { kw: "choco chip cookies", bid: "₹35", roas: "4.7x", imp: "211K", roasColor: "text-sw-green", action: "Raise bid", actionColor: "text-sw-green border-sw-green/30" },
  { kw: "biscuit combo pack", bid: "₹12", roas: "1.8x", imp: "321K", roasColor: "text-sw-red", action: "Lower bid", actionColor: "text-sw-red border-sw-red/30" },
];

const copilotCards = [
  { impact: "HIGH IMPACT", emoji: "💰", text: "Shift ₹25,000 from Flipkart Marie Gold (ROAS 2.1x) to Amazon Good Day (ROAS 5.1x). Projected ROAS improvement: +0.4x blended.", confidence: 91, action: "Apply Now" },
  { impact: "HIGH IMPACT", emoji: "🔍", text: "Add 8 new long-tail keywords to Amazon Good Day campaign. 'butter biscuits family pack' has 0% competition and 45K monthly searches.", confidence: 86, action: "Add Keywords" },
  { impact: "MED IMPACT", emoji: "⚡", text: "NutriChoice trending +47% on Blinkit South Delhi. Launch 7-day burst campaign now before stock drops below 30%.", confidence: 78, action: "Launch Campaign" },
];

/* ── Hierarchical Report Data ── */
type ReportKeyword = {
  keyword: string;
  impressions: string;
  clicks: string;
  spend: string;
  roas: string;
  roasColor: string;
  cities?: { city: string; impressions: string; clicks: string; spend: string; roas: string; roasColor: string; products: { code: string; title: string; spend: string; roas: string; roasColor: string }[] }[];
};

type ReportCampaign = {
  name: string;
  status: string;
  spend: string;
  roas: string;
  roasColor: string;
  impressions: string;
  clicks: string;
  ctr: string;
  keywords: ReportKeyword[];
};

type ReportPlatform = {
  platform: string;
  color: string;
  totalSpend: string;
  blendedRoas: string;
  roasColor: string;
  campaigns: ReportCampaign[];
};

const reportData: ReportPlatform[] = [
  {
    platform: "Amazon", color: "#FF9900", totalSpend: "₹7.8L", blendedRoas: "5.1x", roasColor: "text-sw-green",
    campaigns: [
      {
        name: "Good Day Butter — Sponsored", status: "LIVE", spend: "₹4.2L", roas: "5.1x", roasColor: "text-sw-green",
        impressions: "842K", clicks: "28.4K", ctr: "3.4%",
        keywords: [
          {
            keyword: "butter biscuits online", impressions: "342K", clicks: "12.8K", spend: "₹1.8L", roas: "6.2x", roasColor: "text-sw-green",
            cities: [
              { city: "Delhi NCR", impressions: "98K", clicks: "4.1K", spend: "₹52K", roas: "6.5x", roasColor: "text-sw-green",
                products: [
                  { code: "SKU-GD200", title: "Good Day Butter 200g", spend: "₹32K", roas: "6.6x", roasColor: "text-sw-green" },
                  { code: "SKU-GD100", title: "Good Day Butter 100g", spend: "₹20K", roas: "6.5x", roasColor: "text-sw-green" },
                ]},
              { city: "Mumbai", impressions: "82K", clicks: "3.2K", spend: "₹44K", roas: "6.4x", roasColor: "text-sw-green",
                products: [
                  { code: "SKU-GD200", title: "Good Day Butter 200g", spend: "₹28K", roas: "6.4x", roasColor: "text-sw-green" },
                  { code: "SKU-GD100", title: "Good Day Butter 100g", spend: "₹16K", roas: "6.3x", roasColor: "text-sw-green" },
                ]},
            ],
          },
          {
            keyword: "cream biscuits", impressions: "498K", clicks: "14.2K", spend: "₹2.1L", roas: "3.1x", roasColor: "text-sw-amber",
          },
        ],
      },
      {
        name: "Marie Gold — Keyword Target", status: "PAUSED", spend: "₹1.8L", roas: "2.1x", roasColor: "text-sw-red",
        impressions: "284K", clicks: "8.2K", ctr: "2.9%",
        keywords: [
          {
            keyword: "glucose biscuits bulk", impressions: "187K", clicks: "5.4K", spend: "₹1.2L", roas: "1.4x", roasColor: "text-sw-red",
            cities: [
              { city: "Delhi NCR", impressions: "62K", clicks: "1.8K", spend: "₹42K", roas: "1.4x", roasColor: "text-sw-red",
                products: [
                  { code: "SKU-MG250", title: "Marie Gold 250g", spend: "₹42K", roas: "1.4x", roasColor: "text-sw-red" },
                ]},
            ],
          },
        ],
      },
    ],
  },
  {
    platform: "Blinkit", color: "#FDDC2B", totalSpend: "₹3.3L", blendedRoas: "3.8x", roasColor: "text-sw-amber",
    campaigns: [
      {
        name: "Q-Commerce Biscuit Push", status: "LIVE", spend: "₹2.8L", roas: "3.8x", roasColor: "text-sw-amber",
        impressions: "412K", clicks: "14.8K", ctr: "3.6%",
        keywords: [
          {
            keyword: "butter biscuits", impressions: "188K", clicks: "7.2K", spend: "₹1.4L", roas: "4.0x", roasColor: "text-sw-green",
            cities: [
              { city: "Delhi NCR", impressions: "92K", clicks: "3.8K", spend: "₹72K", roas: "4.3x", roasColor: "text-sw-green",
                products: [
                  { code: "SKU-GD200", title: "Good Day Butter 200g", spend: "₹48K", roas: "4.4x", roasColor: "text-sw-green" },
                  { code: "SKU-5050", title: "50-50 Maska Chaska 120g", spend: "₹24K", roas: "4.2x", roasColor: "text-sw-green" },
                ]},
            ],
          },
          {
            keyword: "choco chip cookies", impressions: "124K", clicks: "4.8K", spend: "₹88K", roas: "3.6x", roasColor: "text-sw-amber",
          },
        ],
      },
    ],
  },
  {
    platform: "Flipkart", color: "#2F77FF", totalSpend: "₹5.2L", blendedRoas: "2.1x", roasColor: "text-sw-red",
    campaigns: [
      {
        name: "Marie Gold Retargeting", status: "PAUSED", spend: "₹3.0L", roas: "2.1x", roasColor: "text-sw-red",
        impressions: "524K", clicks: "12.8K", ctr: "2.4%",
        keywords: [
          {
            keyword: "glucose biscuits", impressions: "284K", clicks: "6.2K", spend: "₹1.8L", roas: "1.4x", roasColor: "text-sw-red",
            cities: [
              { city: "Delhi NCR", impressions: "82K", clicks: "1.8K", spend: "₹52K", roas: "1.4x", roasColor: "text-sw-red",
                products: [
                  { code: "SKU-MG250", title: "Marie Gold 250g", spend: "₹52K", roas: "1.4x", roasColor: "text-sw-red" },
                ]},
            ],
          },
        ],
      },
    ],
  },
];

/* ── Day Parting Data ── */
const dayPartingSlots = [
  { slot: "Early Morning", time: "6:00 – 9:00 AM", campaigns: ["Good Day Butter — Sponsored", "Q-Commerce Biscuit Push"], budgetPct: 15 },
  { slot: "Morning Peak", time: "9:00 AM – 12:00 PM", campaigns: ["Good Day Butter — Sponsored", "Bourbon Brand Awareness", "NutriChoice New Users"], budgetPct: 25 },
  { slot: "Afternoon", time: "12:00 – 4:00 PM", campaigns: ["Marie Gold Retargeting", "Bourbon Brand Awareness"], budgetPct: 15 },
  { slot: "Evening Peak", time: "4:00 – 8:00 PM", campaigns: ["Good Day Butter — Sponsored", "Q-Commerce Biscuit Push", "NutriChoice New Users", "Bourbon Brand Awareness"], budgetPct: 30 },
  { slot: "Night", time: "8:00 PM – 12:00 AM", campaigns: ["Good Day Butter — Sponsored", "Q-Commerce Biscuit Push"], budgetPct: 12 },
  { slot: "Late Night", time: "12:00 – 6:00 AM", campaigns: ["Marie Gold Retargeting"], budgetPct: 3 },
];

/* ── Campaign Creator Modal ── */
const CampaignCreatorModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const [method, setMethod] = useState<null | "ai" | "history" | "manual">(null);
  const [launched, setLaunched] = useState(false);

  if (!open) return null;

  const aiSuggestions = [
    { name: "Stock Recovery Blitz", signal: "Marie Gold OOS on Instamart — 6 pincodes", roas: "4.8x", budget: "₹15K", duration: "3 days", keywords: ["butter biscuits", "cream biscuits"] },
    { name: "Price Advantage Push", signal: "Good Day 14% cheaper than Sunfeast", roas: "5.2x", budget: "₹20K", duration: "7 days", keywords: ["glucose biscuits", "digestive biscuits"] },
    { name: "Trending Capture", signal: "NutriChoice trending +47% on Blinkit", roas: "3.9x", budget: "₹12K", duration: "5 days", keywords: ["digestive biscuits", "health biscuits"] },
  ];

  const historyCampaigns = [
    { name: "Good Day Summer Push 2025", platform: "Amazon", spend: "₹3.2L", roas: "4.9x", duration: "14 days" },
    { name: "Festive Season Blast", platform: "Flipkart", spend: "₹5.1L", roas: "5.6x", duration: "21 days" },
    { name: "Q-Commerce Biscuit Pilot", platform: "Blinkit", spend: "₹1.8L", roas: "3.4x", duration: "7 days" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-surface-1 border border-border-visible rounded-2xl w-[720px] max-h-[85vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-subtle">
          <div>
            <h2 className="font-display font-bold text-lg text-foreground">Autonomous Campaign Creator</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Choose your campaign creation method</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-3 text-muted-foreground"><X size={16} /></button>
        </div>

        {!method && (
          <div className="p-6 grid grid-cols-3 gap-4">
            {[
              { key: "ai" as const, icon: Sparkles, label: "Autonomous AI", desc: "AI recommends everything automatically", gradient: "from-sw-purple to-primary" },
              { key: "history" as const, icon: History, label: "From History", desc: "Use historical campaigns to create new campaigns", gradient: "from-primary to-sw-cyan" },
              { key: "manual" as const, icon: FileEdit, label: "Manual Entry", desc: "Configure everything yourself manually", gradient: "from-surface-3 to-surface-2" },
            ].map(m => (
              <button key={m.key} onClick={() => setMethod(m.key)}
                className="flex flex-col items-center gap-3 p-6 rounded-2xl border border-subtle bg-surface-2 hover:border-primary/40 hover:bg-surface-3 transition-all group">
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${m.gradient} flex items-center justify-center`}>
                  <m.icon size={24} className="text-foreground" />
                </div>
                <span className="font-display font-bold text-sm text-foreground">{m.label}</span>
                <span className="text-[11px] text-muted-foreground text-center">{m.desc}</span>
              </button>
            ))}
          </div>
        )}

        {method === "ai" && !launched && (
          <div className="p-6 space-y-3">
            <button onClick={() => setMethod(null)} className="text-[11px] text-primary mb-2">← Back to methods</button>
            <p className="text-xs text-muted-foreground mb-3">AI-generated campaigns based on current signals</p>
            {aiSuggestions.map((s, i) => (
              <div key={i} className="p-4 rounded-xl border border-subtle bg-surface-2 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-display font-bold text-sm text-foreground">{s.name}</span>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-sw-green-dim text-sw-green">Est. ROAS {s.roas}</span>
                </div>
                <p className="text-[11px] text-muted-foreground">📡 Signal: {s.signal}</p>
                <div className="flex gap-3 text-[10px] font-mono text-muted2">
                  <span>Budget: {s.budget}</span><span>Duration: {s.duration}</span>
                  <span>Keywords: {s.keywords.join(", ")}</span>
                </div>
                <button onClick={() => setLaunched(true)} className="mt-1 px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/20 text-primary hover:bg-primary/30">
                  🚀 Launch Campaign
                </button>
              </div>
            ))}
          </div>
        )}

        {method === "history" && !launched && (
          <div className="p-6 space-y-3">
            <button onClick={() => setMethod(null)} className="text-[11px] text-primary mb-2">← Back to methods</button>
            <p className="text-xs text-muted-foreground mb-3">Clone and customize a past campaign</p>
            {historyCampaigns.map((h, i) => (
              <div key={i} className="p-4 rounded-xl border border-subtle bg-surface-2 flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium text-foreground">{h.name}</span>
                  <div className="flex gap-3 text-[10px] font-mono text-muted-foreground mt-1">
                    <span>{h.platform}</span><span>Spend: {h.spend}</span><span>ROAS: {h.roas}</span><span>{h.duration}</span>
                  </div>
                </div>
                <button onClick={() => setLaunched(true)} className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-primary/20 text-primary hover:bg-primary/30">
                  Clone & Edit
                </button>
              </div>
            ))}
          </div>
        )}

        {method === "manual" && !launched && (
          <div className="p-6 space-y-4">
            <button onClick={() => setMethod(null)} className="text-[11px] text-primary mb-2">← Back to methods</button>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Campaign Name</label>
                <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="e.g. Summer Whey Push" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Platform</label>
                <select className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground">
                  <option>Amazon</option><option>Flipkart</option><option>Blinkit</option><option>Zepto</option><option>Instamart</option><option>Instagram</option>
                </select>
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
                <label className="text-[11px] text-muted-foreground block mb-1">Duration (days)</label>
                <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="14" type="number" />
              </div>
              <div>
                <label className="text-[11px] text-muted-foreground block mb-1">Target ROAS</label>
                <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="4.0x" />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground block mb-1">Keywords (comma-separated)</label>
              <input className="w-full bg-surface-2 border border-subtle rounded-lg px-3 py-2 text-sm text-foreground" placeholder="whey protein, protein powder, gym supplement" />
            </div>
            <button onClick={() => setLaunched(true)} className="px-4 py-2 rounded-lg text-sm font-medium bg-primary text-foreground hover:bg-primary/80">
              🚀 Create Campaign
            </button>
          </div>
        )}

        {launched && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-sw-green-dim flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✓</span>
            </div>
            <h3 className="font-display font-bold text-foreground text-lg">Campaign Created!</h3>
            <p className="text-xs text-muted-foreground mt-1">Your campaign is now live and being optimized by AI</p>
            <button onClick={onClose} className="mt-4 px-4 py-2 rounded-lg text-sm bg-surface-3 text-foreground hover:bg-surface-2">Close</button>
          </div>
        )}
      </div>
    </div>
  );
};

const CampaignView: React.FC = () => {
  const [selectedCampaign, setSelectedCampaign] = useState(0);
  const [bidStates, setBidStates] = useState<Record<number, string>>({});
  const [copilotStates, setCopilotStates] = useState<Record<number, boolean>>({});
  const [reallocApplied, setReallocApplied] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showDayParting, setShowDayParting] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<number, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedKeywords, setExpandedKeywords] = useState<Record<string, boolean>>({});
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});
  const [expandedSlots, setExpandedSlots] = useState<Record<number, boolean>>({});
  const [slotStates, setSlotStates] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    dayPartingSlots.forEach((s, si) => s.campaigns.forEach((_, ci) => { init[`${si}-${ci}`] = true; }));
    return init;
  });

  const togglePlatform = (i: number) => setExpandedPlatforms(p => ({ ...p, [i]: !p[i] }));
  const toggleCampaign = (k: string) => setExpandedCampaigns(p => ({ ...p, [k]: !p[k] }));
  const toggleKeyword = (k: string) => setExpandedKeywords(p => ({ ...p, [k]: !p[k] }));
  const toggleCity = (k: string) => setExpandedCities(p => ({ ...p, [k]: !p[k] }));

  const g = useGuardrails();
  const [selectedDigest, setSelectedDigest] = useState<Record<number, boolean>>({});
  const [dismissedDigest, setDismissedDigest] = useState<Record<number, boolean>>({});
  const [undoToast, setUndoToast] = useState<string | null>(null);

  const digestActions = [
    { id: 0, campaign: "Whey Protein — Sponsored", insight: "Defense bid increase", tier: 1 as const, tierLabel: "TIER 1", confidence: 4, metric: "+62% CTR", icon: Swords, blocked: false, ownedBy: null },
    { id: 1, campaign: "Q-Commerce Launch Push", insight: "Daypart budget shift", tier: 3 as const, tierLabel: "TIER 3", confidence: 5, metric: "+18% Conv", icon: Clock, blocked: false, ownedBy: null },
    { id: 2, campaign: "Creatine Retargeting", insight: "Budget reallocation", tier: 3 as const, tierLabel: "TIER 3", confidence: 4, metric: "+₹1.2L Rev", icon: DollarSign, blocked: false, ownedBy: "Budget Optimiser" },
    { id: 3, campaign: "BCAA Brand Awareness", insight: "Bid optimisation", tier: 3 as const, tierLabel: "TIER 3", confidence: 3, metric: "+0.8x ROAS", icon: TrendingUp, blocked: false, ownedBy: null },
    { id: 4, campaign: "Pre-Workout New Users", insight: "Keyword expansion", tier: 3 as const, tierLabel: "TIER 3", confidence: 2, metric: "+12K Imp", icon: Target, blocked: true, ownedBy: null },
  ];

  const visibleDigest = digestActions.filter(d => !dismissedDigest[d.id]);
  const selectedCount = Object.values(selectedDigest).filter(Boolean).length;
  const pendingCount = visibleDigest.filter(d => !d.blocked && !d.ownedBy).length;

  const tierColor = (tier: number) => {
    if (tier === 1) return "#FF5C5C";
    if (tier === 2) return "#F5A623";
    return "#2ECF8E";
  };

  const tierBg = (tier: number) => {
    if (tier === 1) return "rgba(255,92,92,0.12)";
    if (tier === 2) return "rgba(245,166,35,0.12)";
    return "rgba(46,207,142,0.12)";
  };

  const confidencePips = (level: number) => {
    const colors = level >= 4 ? "#2ECF8E" : level === 3 ? "#F5A623" : "#555A6E";
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < level ? colors : "#333" }}>●</span>
    ));
  };

  const showUndoToast = (msg: string) => {
    setUndoToast(msg);
    setTimeout(() => setUndoToast(null), 5000);
  };

  const [tab, setTab] = useState("overview");

  // Analytics mock data
  const spendRoasTrend = Array.from({ length: 30 }, (_, i) => ({
    day: `Mar ${i + 1}`,
    spend: Math.round(40 + Math.random() * 20),
    roas: +(3.5 + Math.random() * 2).toFixed(1),
  }));

  const scatterData = campaigns.map((c) => ({
    name: c.name,
    spend: parseInt(c.spend.replace(/[₹KL,]/g, "")) || 50,
    roas: parseFloat(c.roas) || 3,
    impressions: 500,
  }));

  const actionHistory = [
    { time: "Mar 16 09:42", action: "Defense bid increase", campaign: "Whey Protein — Sponsored", roasBefore: "4.8x", roasAfter: "5.1x", trigger: "Auto" },
    { time: "Mar 15 14:20", action: "Budget reallocation", campaign: "Creatine Retargeting", roasBefore: "2.1x", roasAfter: "2.1x", trigger: "Manual" },
    { time: "Mar 15 08:00", action: "Daypart shift", campaign: "Q-Commerce Launch Push", roasBefore: "3.5x", roasAfter: "3.8x", trigger: "Auto" },
    { time: "Mar 14 16:45", action: "Keyword expansion", campaign: "BCAA Brand Awareness", roasBefore: "4.2x", roasAfter: "4.4x", trigger: "Auto" },
    { time: "Mar 13 10:30", action: "Bid reduction", campaign: "Pre-Workout New Users", roasBefore: "2.8x", roasAfter: "3.2x", trigger: "Auto" },
  ];

  return (
    <div className="space-y-6 pb-20">
      <CampaignCreatorModal open={showCreator} onClose={() => setShowCreator(false)} />

      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {/* Undo toast */}
      {undoToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl border bg-surface-1 border-subtle shadow-lg flex items-center gap-3"
          style={{ boxShadow: "0 8px 30px rgba(0,0,0,0.4)" }}>
          <span className="text-xs text-foreground">{undoToast}</span>
          <button onClick={() => setUndoToast(null)} className="text-xs font-medium" style={{ color: "#A78BFA" }}>Undo</button>
        </div>
      )}

      {tab === "overview" ? (<>

      {/* Context filter chip bar */}
      {g.contextFilter && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/5 border border-primary/20">
          <span className="text-[11px] text-foreground">
            Filtered: {g.contextFilter.type === "availability" ? `Availability · ${g.contextFilter.params.sku || ""}` :
              g.contextFilter.type === "sos-retailer" ? `${g.contextFilter.params.platform} campaigns` :
              g.contextFilter.type === "defense" ? `Defense · ${g.contextFilter.params.keyword || ""}` :
              g.contextFilter.type === "content-audit" ? `Content Audit · ${g.contextFilter.params.sku || ""}` :
              g.contextFilter.type === "search-listing" ? `Search Listing · ${g.contextFilter.params.sku || ""}` :
              g.contextFilter.type === "competitor-content" ? `Competitor content · ${g.contextFilter.params.competitor || ""}` :
              g.contextFilter.type === "subcategory" ? `Subcategory · ${g.contextFilter.params.subcategory || ""}` :
              g.contextFilter.type === "shelf-gap" ? `Shelf gap · ${g.contextFilter.params.keyword || ""} on ${g.contextFilter.params.platform || ""}` :
              g.contextFilter.type === "shelf-coverage" ? `Shelf coverage · ${g.contextFilter.params.category || ""}` :
              g.contextFilter.type}
          </span>
          <button onClick={() => g.setContextFilter(null)} className="text-[10px] font-medium flex items-center gap-0.5" style={{ color: "#8B8FA8" }}>
            <X size={10} /> Clear filter
          </button>
        </div>
      )}

      {/* Contextual insight card for content-audit */}
      {g.contextFilter?.type === "content-audit" && (
        <div className="rounded-xl border p-4" style={{ borderLeft: "3px solid #4F7FFF", backgroundColor: "rgba(79,127,255,0.06)", borderColor: "rgba(79,127,255,0.2)" }}>
          <h4 className="text-sm font-medium text-foreground">Content action — {g.contextFilter.params.sku}</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Content score {g.contextFilter.params.score}/100. Weak: {g.contextFilter.params.issues?.replace(/,/g, ", ")}. 
            Recommended: increase bids on this SKU to defend visibility while content is being fixed.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] flex gap-0.5">{confidencePips(4)}</span>
            <button onClick={() => { showUndoToast("Bid boost applied"); g.setContextFilter(null); }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
              Apply bid boost
            </button>
          </div>
        </div>
      )}

      {/* Contextual card for search-listing */}
      {g.contextFilter?.type === "search-listing" && (
        <div className="rounded-xl border p-4" style={{ borderLeft: "3px solid #4F7FFF", backgroundColor: "rgba(79,127,255,0.06)", borderColor: "rgba(79,127,255,0.2)" }}>
          <h4 className="text-sm font-medium text-foreground">Keyword visibility low for {g.contextFilter.params.sku}</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Keywords: {g.contextFilter.params.keywords?.replace(/,/g, ", ")}
          </p>
          <button onClick={() => { showUndoToast("Bid increase applied"); g.setContextFilter(null); }} className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
            Increase bids on these keywords
          </button>
        </div>
      )}

      {/* Contextual card for shelf-gap */}
      {g.contextFilter?.type === "shelf-gap" && (
        <div className="rounded-xl border p-4" style={{ borderLeft: "3px solid #4F7FFF", backgroundColor: "rgba(79,127,255,0.06)", borderColor: "rgba(79,127,255,0.2)" }}>
          <h4 className="text-sm font-medium text-foreground">Shelf gap detected</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            No listing for '{g.contextFilter.params.keyword}' on {g.contextFilter.params.platform}. Recommend creating a sponsored campaign to capture this uncovered search volume.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] flex gap-0.5">{confidencePips(4)}</span>
            <button onClick={() => { showUndoToast("Campaign created"); g.setContextFilter(null); }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
              Create campaign
            </button>
          </div>
        </div>
      )}

      {/* Contextual card for shelf-coverage */}
      {g.contextFilter?.type === "shelf-coverage" && (
        <div className="rounded-xl border p-4" style={{ borderLeft: "3px solid #4F7FFF", backgroundColor: "rgba(79,127,255,0.06)", borderColor: "rgba(79,127,255,0.2)" }}>
          <h4 className="text-sm font-medium text-foreground">Shelf coverage gaps — {g.contextFilter.params.category}</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Multiple keyword × platform gaps detected. Recommend creating sponsored campaigns to fill uncovered positions.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-[10px] flex gap-0.5">{confidencePips(3)}</span>
            <button onClick={() => { showUndoToast("Campaigns queued"); g.setContextFilter(null); }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
              Fill gaps
            </button>
          </div>
        </div>
      )}

      {/* Contextual card for competitor-content */}
      {g.contextFilter?.type === "competitor-content" && (
        <div className="rounded-xl border p-4" style={{ borderLeft: "3px solid #4F7FFF", backgroundColor: "rgba(79,127,255,0.06)", borderColor: "rgba(79,127,255,0.2)" }}>
          <h4 className="text-sm font-medium text-foreground">Competitor {g.contextFilter.params.competitor} updated content</h4>
          <p className="text-[11px] text-muted-foreground mt-1">
            Defensive bid response recommended for affected keywords.
          </p>
          <button onClick={() => { showUndoToast("Defensive bid response applied"); g.setContextFilter(null); }} className="mt-2 px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
            Defensive bid response
          </button>
        </div>
      )}

      {/* Insert 1 — Conflict callout banner */}
      {g.hasActiveTier1() && (
        <div id="campaign-conflict-banner" className="rounded-xl border p-4" style={{
          borderLeft: "3px solid #F5A623",
          backgroundColor: "rgba(245,166,35,0.10)",
          borderColor: "rgba(245,166,35,0.25)",
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                <AlertTriangle size={14} style={{ color: "#F5A623" }} />
                Tier 1 conflict active — 2 insights blocked
              </h3>
              <p className="text-[11px] text-muted-foreground mt-1">
                <strong>Availability threshold</strong> (stock &lt; 20%) fired · Affecting: Creatine Retargeting, Pre-Workout New Users · Est. auto-clearance: {g.estResolutionTime}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#F5A623" }}>
                Override manually
              </button>
              <button onClick={() => g.navigateTo("guardrails")} className="text-[11px] font-medium" style={{ color: "#4F7FFF" }}>
                View guardrail →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Insert 2 — Today's Action Digest */}
      <div id="campaign-digest" className="rounded-xl border border-subtle bg-surface-1 overflow-hidden">
        <div className="p-4 flex items-center justify-between border-b border-subtle">
          <h3 className="text-sm font-medium text-foreground">Today's actions</h3>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#A78BFA" }}>
              {pendingCount} pending
            </span>
            <button
              onClick={() => { showUndoToast("All safe actions approved"); }}
              className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}
            >
              Approve all safe
            </button>
          </div>
        </div>

        {/* Batch approve bar */}
        {selectedCount > 0 && (
          <div className="px-4 py-2 border-b border-subtle flex items-center gap-3" style={{ backgroundColor: "rgba(167,139,250,0.05)" }}>
            <span className="text-xs text-foreground">{selectedCount} actions selected</span>
            <button onClick={() => setSelectedDigest({})} className="text-[11px] border rounded-lg px-2 py-1" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8FA8" }}>Clear</button>
            <button onClick={() => { setSelectedDigest({}); showUndoToast(`${selectedCount} actions applied`); }} className="px-3 py-1.5 rounded-lg text-[11px] font-medium text-white" style={{ backgroundColor: "#A78BFA" }}>
              Apply selected
            </button>
          </div>
        )}

      {/* Insight rows */}
        <div className="divide-y divide-subtle/50">
          {visibleDigest.map((d) => (
            <div key={d.id} data-insight-type={d.insight.includes("Defense") ? "defense" : d.insight.includes("Budget") ? "budget" : "other"} data-status={d.blocked ? "blocked" : d.ownedBy ? "handled" : "active"} className={`flex items-center gap-3 px-4 py-3 ${d.blocked ? "opacity-[0.45]" : ""}`}
              style={{ borderLeft: `3px solid ${tierColor(d.tier)}` }}>
              {!d.blocked && !d.ownedBy && (
                <input type="checkbox" checked={!!selectedDigest[d.id]}
                  onChange={() => setSelectedDigest(p => ({ ...p, [d.id]: !p[d.id] }))}
                  className="w-3.5 h-3.5 rounded accent-primary flex-shrink-0" />
              )}
              {(d.blocked || d.ownedBy) && <div className="w-3.5" />}
              <d.icon size={14} className="text-muted-foreground flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-foreground truncate">{d.campaign}</span>
                  <span className="text-[11px] text-muted-foreground">· {d.insight}</span>
                </div>
                {d.blocked && <p className="text-[10px] text-muted-foreground mt-0.5">Blocked by Tier 1: Availability threshold</p>}
              </div>
              <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: tierBg(d.tier), color: tierColor(d.tier), letterSpacing: "0.08em" }}>
                {d.tierLabel}
              </span>
              <span className="text-[10px] flex gap-0.5 flex-shrink-0">{confidencePips(d.confidence)}</span>
              <span className="font-mono text-[11px] text-foreground flex-shrink-0">{d.metric}</span>

              {d.ownedBy ? (
                <button onClick={() => g.navigateTo("budget")}
                  className="font-mono text-[9px] px-2 py-1 rounded flex-shrink-0 cursor-pointer"
                  style={{ backgroundColor: "rgba(85,90,110,0.15)", color: "#8B8FA8" }}>
                  Handled in {d.ownedBy}
                </button>
              ) : d.blocked ? (
                <button disabled className="px-2 py-1 rounded-lg text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: "rgba(85,90,110,0.12)", color: "#555A6E" }}>
                  Queued
                </button>
              ) : d.confidence <= 2 ? (
                <button className="px-2 py-1 rounded-lg text-[10px] font-medium border flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8FA8" }}>
                  Review first
                </button>
              ) : (
                <>
                  <button onClick={() => { setDismissedDigest(p => ({ ...p, [d.id]: true })); showUndoToast(`${d.insight} applied`); }}
                    className="px-2 py-1.5 rounded-lg text-[10px] font-medium text-white flex-shrink-0" style={{ backgroundColor: "#A78BFA" }}>
                    Apply
                  </button>
                  <button className="px-2 py-1 rounded-lg text-[10px] font-medium border flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.12)", color: "#8B8FA8" }}>
                    Review
                  </button>
                </>
              )}
              {!d.blocked && (
                <button onClick={() => setDismissedDigest(p => ({ ...p, [d.id]: true }))} className="text-[10px] flex-shrink-0" style={{ color: "#555A6E" }}>
                  Dismiss
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KPICard title="Total Ad Spend (30D)" value="₹18.4L" delta="▲ ₹2.1L vs last mo" deltaType="positive" sub="Across 6 platforms · 24 campaigns" accentColor="bg-primary" delay={0} />
        <KPICard title="Blended ROAS" value="4.2x" delta="▲ 0.6x MoM" deltaType="positive" sub="Target: 4.5x · 93% of goal" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="AI-Optimised Budget" value="67%" delta="▲ Auto-reallocated ₹3.4L" deltaType="positive" sub="From underperforming campaigns" accentColor="bg-sw-purple" delay={0.1} />
        <KPICard title="Attributed Revenue" value="₹77L" delta="▲ 18% MoM" deltaType="positive" sub="Across all ad-attributed orders" accentColor="bg-sw-cyan" delay={0.15} />
      </div>

      {/* Action bar */}
      <div className="flex items-center gap-3 justify-end">
        <button onClick={() => setShowCreator(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-primary text-foreground hover:bg-primary/80 transition-all">
          <Plus size={14} /> Create Campaign
        </button>
        <button onClick={() => setShowDayParting(!showDayParting)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            showDayParting ? "bg-sw-amber-dim text-sw-amber border border-sw-amber/20" : "bg-surface-2 border border-subtle text-foreground hover:bg-surface-3"
          }`}>
          <Clock size={14} /> Day Parting
        </button>
        <button onClick={() => setShowReports(!showReports)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all ${
            showReports ? "bg-primary/20 text-primary" : "bg-surface-2 border border-subtle text-foreground hover:bg-surface-3"
          }`}>
          <FileText size={14} />
          {showReports ? "Close Reports" : "Campaign Reports"}
        </button>
      </div>

      {/* ── DAY PARTING SECTION ── */}
      {showDayParting && (
        <PanelCard title="Day Parting Configuration" badge="6 time slots" badgeColor="amber" delay={0.05}>
          <p className="text-[10px] text-muted-foreground mb-4">Group campaigns into time slots to optimize budget allocation throughout the day.</p>
          {/* Visual timeline bar */}
          <div className="mb-5">
            <div className="flex h-8 rounded-xl overflow-hidden border border-subtle">
              {dayPartingSlots.map((s, i) => {
                const colors = ["bg-primary/40", "bg-sw-green/40", "bg-sw-amber/40", "bg-sw-purple/40", "bg-sw-cyan/40", "bg-surface-3"];
                return (
                  <div key={i} className={`${colors[i]} flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                    style={{ width: `${s.budgetPct}%` }}
                    onClick={() => setExpandedSlots(p => ({ ...p, [i]: !p[i] }))}>
                    <span className="text-[8px] font-mono text-foreground truncate px-1">{s.budgetPct}%</span>
                  </div>
                );
              })}
            </div>
            <div className="flex mt-1">
              {dayPartingSlots.map((s, i) => (
                <div key={i} className="text-center" style={{ width: `${s.budgetPct}%` }}>
                  <span className="text-[7px] text-muted-foreground">{s.time.split("–")[0].trim()}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            {dayPartingSlots.map((s, si) => (
              <div key={si} className="border border-subtle rounded-xl overflow-hidden">
                <button onClick={() => setExpandedSlots(p => ({ ...p, [si]: !p[si] }))}
                  className="w-full flex items-center gap-3 p-3 hover:bg-surface-2 transition-colors">
                  {expandedSlots[si] ? <ChevronDown size={13} className="text-muted-foreground" /> : <ChevronRight size={13} className="text-muted-foreground" />}
                  <Clock size={13} className="text-sw-amber" />
                  <span className="text-xs font-medium text-foreground">{s.slot}</span>
                  <span className="text-[10px] font-mono text-muted-foreground">{s.time}</span>
                  <span className="ml-auto flex items-center gap-3">
                    <span className="font-mono text-[10px] text-sw-amber">{s.budgetPct}% budget</span>
                    <span className="text-[10px] text-muted-foreground">{s.campaigns.length} campaigns</span>
                  </span>
                </button>
                {expandedSlots[si] && (
                  <div className="border-t border-subtle p-3 bg-surface-2/30 space-y-1.5">
                    {s.campaigns.map((cName, ci) => {
                      const campData = campaigns.find(c => c.name === cName);
                      const key = `${si}-${ci}`;
                      return (
                        <div key={ci} className="flex items-center gap-3 p-2 rounded-lg bg-surface-2 border border-subtle">
                          <GripVertical size={12} className="text-muted-foreground" />
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: campData?.platformColor || "#4F6EF7" }} />
                          <span className="text-[11px] text-foreground flex-1">{cName}</span>
                          {campData && <span className="font-mono text-[10px] text-muted-foreground">{campData.roas} ROAS</span>}
                          <button onClick={() => setSlotStates(p => ({ ...p, [key]: !p[key] }))}
                            className={`px-2 py-0.5 rounded text-[9px] font-mono transition-all ${
                              slotStates[key] ? "bg-sw-green-dim text-sw-green" : "bg-sw-red-dim text-sw-red"
                            }`}>
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
      )}

      {/* ── CAMPAIGN REPORTS SECTION ── */}
      {showReports && (
        <PanelCard title="Campaign Performance Reports" badge="Drill-down View" badgeColor="accent" delay={0.05}>
          <p className="text-[10px] text-muted-foreground mb-4 uppercase tracking-wide">Platform → Campaign → Keyword → City → Product</p>
          <div className="space-y-2">
            {reportData.map((plat, pi) => (
              <div key={plat.platform} className="border border-subtle rounded-xl overflow-hidden">
                {/* Platform level */}
                <button onClick={() => togglePlatform(pi)}
                  className="w-full flex items-center gap-3 p-3.5 hover:bg-surface-2 transition-colors">
                  {expandedPlatforms[pi] ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: plat.color }} />
                  <span className="text-sm text-foreground font-semibold">{plat.platform}</span>
                  <div className="ml-auto flex items-center gap-4 text-[11px]">
                    <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{plat.totalSpend}</span></span>
                    <span className="text-muted-foreground">Revenue <span className="font-mono text-foreground">{plat.totalRevenue}</span></span>
                    <span className={`font-mono font-bold ${plat.roasColor}`}>{plat.blendedRoas}</span>
                  </div>
                </button>
                {expandedPlatforms[pi] && (
                  <div className="border-t border-subtle">
                    {plat.campaigns.map((camp, ci) => {
                      const ck = `${pi}-${ci}`;
                      return (
                        <div key={ck} className="border-b border-subtle last:border-0">
                          <button onClick={() => toggleCampaign(ck)}
                            className="w-full flex items-center gap-3 p-3 pl-8 hover:bg-surface-2/50 transition-colors">
                            {expandedCampaigns[ck] ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
                            <span className="text-xs text-foreground font-medium">{camp.name}</span>
                            <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${camp.status === "LIVE" ? "bg-sw-green-dim text-sw-green" : "bg-sw-amber-dim text-sw-amber"}`}>{camp.status}</span>
                            <div className="ml-auto flex items-center gap-3 text-[10px]">
                              <span className="text-muted-foreground">Imp <span className="font-mono text-foreground">{camp.impressions}</span></span>
                              <span className="text-muted-foreground">Clicks <span className="font-mono text-foreground">{camp.clicks}</span></span>
                              <span className="text-muted-foreground">CTR <span className="font-mono text-foreground">{camp.ctr}</span></span>
                              <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{camp.spend}</span></span>
                              <span className="text-muted-foreground">Rev <span className="font-mono text-foreground">{camp.revenue}</span></span>
                              <span className={`font-mono font-bold ${camp.roasColor}`}>{camp.roas}</span>
                            </div>
                          </button>
                          {expandedCampaigns[ck] && (
                            <div className="bg-surface-2/30">
                              {camp.keywords.map((kw, ki) => {
                                const kwk = `${ck}-${ki}`;
                                return (
                                  <div key={kwk} className="border-t border-subtle/50">
                                    <button onClick={() => toggleKeyword(kwk)}
                                      className="w-full flex items-center gap-3 p-2.5 pl-14 hover:bg-surface-2/50 transition-colors">
                                      {kw.cities ? (expandedKeywords[kwk] ? <ChevronDown size={11} /> : <ChevronRight size={11} />) : <span className="w-[11px]" />}
                                      <span className="font-mono text-[11px] text-foreground">"{kw.keyword}"</span>
                                      <div className="ml-auto flex items-center gap-3 text-[10px]">
                                        <span className="text-muted-foreground">Imp <span className="font-mono text-foreground">{kw.impressions}</span></span>
                                        <span className="text-muted-foreground">Clicks <span className="font-mono text-foreground">{kw.clicks}</span></span>
                                        <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{kw.spend}</span></span>
                                        <span className="text-muted-foreground">Rev <span className="font-mono text-foreground">{kw.revenue}</span></span>
                                        <span className={`font-mono font-bold ${kw.roasColor}`}>{kw.roas}</span>
                                      </div>
                                    </button>
                                    {expandedKeywords[kwk] && kw.cities && (
                                      <div className="bg-surface-3/30">
                                        {kw.cities.map((city, cii) => {
                                          const cityk = `${kwk}-${cii}`;
                                          return (
                                            <div key={cityk} className="border-t border-subtle/30">
                                              <button onClick={() => toggleCity(cityk)}
                                                className="w-full flex items-center gap-3 p-2 pl-20 hover:bg-surface-3/50 transition-colors">
                                                {expandedCities[cityk] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                                <span className="text-[11px] text-foreground">📍 {city.city}</span>
                                                <div className="ml-auto flex items-center gap-3 text-[9px]">
                                                  <span className="text-muted-foreground">Imp <span className="font-mono text-foreground">{city.impressions}</span></span>
                                                  <span className="text-muted-foreground">Clicks <span className="font-mono text-foreground">{city.clicks}</span></span>
                                                  <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{city.spend}</span></span>
                                                  <span className="text-muted-foreground">Rev <span className="font-mono text-foreground">{city.revenue}</span></span>
                                                  <span className={`font-mono font-bold ${city.roasColor}`}>{city.roas}</span>
                                                </div>
                                              </button>
                                              {expandedCities[cityk] && (
                                                <div className="bg-surface-3/20">
                                                  {city.products.map((prod) => (
                                                    <div key={prod.code} className="flex items-center gap-3 p-2 pl-28 border-t border-subtle/20 text-[10px]">
                                                      <span className="font-mono text-muted-foreground">{prod.code}</span>
                                                      <span className="text-foreground flex-1">{prod.title}</span>
                                                      <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{prod.spend}</span></span>
                                                      <span className="text-muted-foreground">Rev <span className="font-mono text-foreground">{prod.revenue}</span></span>
                                                      <span className={`font-mono font-bold ${prod.roasColor}`}>{prod.roas}</span>
                                                    </div>
                                                  ))}
                                                </div>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PanelCard>
      )}

      {/* Chart + Campaign cards */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Revenue vs Ad Spend — 30 Day Trend" badge="ROAS improving" badgeColor="green" className="col-span-2" delay={0.2}>
          <div className="flex items-center gap-4 mb-3 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-sw-green rounded-full" /> Revenue</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 bg-primary rounded-full" /> Ad Spend</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160,70%,48%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160,70%,48%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(228,90%,64%)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="hsl(228,90%,64%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "hsl(225,10%,46%)" }} axisLine={false} tickLine={false} />
              <RTooltip contentStyle={{ background: "hsl(232,28%,6%)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, fontSize: 11 }} />
              <Area type="monotone" dataKey="revenue" stroke="hsl(160,70%,48%)" fill="url(#gRev)" strokeWidth={2} />
              <Area type="monotone" dataKey="spend" stroke="hsl(228,90%,64%)" fill="url(#gSpend)" strokeWidth={2} strokeDasharray="5 5" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>

        <PanelCard title="Active Campaigns" badge="AI managing 16" badgeColor="purple" delay={0.25}>
          <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
            {campaigns.map((c, i) => (
              <div key={c.name} onClick={() => setSelectedCampaign(i)}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  selectedCampaign === i ? "border-primary bg-primary/5" : "border-subtle bg-surface-2 hover:border-border-visible"
                }`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-foreground font-medium truncate">{c.name}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-mono" style={{ backgroundColor: c.platformColor + "22", color: c.platformColor }}>{c.platform}</span>
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
                  {c.ai && <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-sw-purple-dim text-sw-purple font-mono">⚡ AI Autopilot</span>}
                </div>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-3 gap-4">
        <PanelCard title="Platform ROAS Comparison" delay={0.3}>
          <div className="space-y-3">
            {platformROAS.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-foreground w-20">{p.name}</span>
                <div className="flex-1 h-3 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(p.roas / 6) * 100}%`, backgroundColor: p.color }} />
                </div>
                <span className={`font-mono text-[11px] w-8 text-right ${p.roas >= 3.5 ? "text-sw-green" : p.roas >= 2.5 ? "text-sw-amber" : "text-sw-red"}`}>{p.roas}x</span>
              </div>
            ))}
          </div>
          <div className={`mt-4 p-3 rounded-xl ${reallocApplied ? "bg-sw-green-dim border border-sw-green/20" : "bg-sw-purple-dim border border-sw-purple/20"}`}>
            <p className="text-[11px] text-foreground mb-2">💡 Shift ₹25K from Flipkart → Amazon. Projected ROAS improvement: +0.3x blended</p>
            <button onClick={() => setReallocApplied(true)} className={`text-[11px] font-medium px-3 py-1 rounded-lg ${reallocApplied ? "bg-sw-green/20 text-sw-green" : "bg-sw-purple/20 text-sw-purple hover:bg-sw-purple/30"}`}>
              {reallocApplied ? "✓ Applied!" : "Apply Reallocation →"}
            </button>
          </div>
        </PanelCard>

        <PanelCard title="Budget Allocation vs Performance" badge="AI auto-balancing" badgeColor="purple" delay={0.35}>
          <div className="space-y-3">
            {budgetAlloc.map((b) => (
              <div key={b.name}>
                <div className="flex items-center justify-between mb-1">
                  <span className="flex items-center gap-1.5 text-xs text-foreground">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: b.color }} />
                    {b.name}
                  </span>
                  <span className="font-mono text-[10px] text-muted-foreground">{b.pct}% · {b.spend}</span>
                </div>
                <div className="h-2 bg-surface-3 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${b.pct * 2.5}%`, backgroundColor: b.color }} />
                </div>
                <p className={`font-mono text-[10px] mt-0.5 ${b.roasColor}`}>{b.roas} {b.dir}</p>
              </div>
            ))}
          </div>
        </PanelCard>

        <PanelCard title="Keyword Bid Optimiser" badge="Amazon · Auto-bid ON" badgeColor="accent" delay={0.4}>
          <div className="space-y-2">
            {keywords.map((k, i) => (
              <div key={k.kw} className="flex items-center gap-2 py-1.5 border-b border-subtle last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-foreground truncate font-mono">{k.kw}</p>
                  <p className="text-[9px] text-muted-foreground font-mono">{k.bid} · {k.imp} imp</p>
                </div>
                <span className={`font-mono text-[10px] ${k.roasColor}`}>{k.roas}</span>
                <button onClick={() => setBidStates((p) => ({ ...p, [i]: k.action.includes("Raise") ? "↑ ₹34" : k.action.includes("Lower") ? "↓ ₹16" : "— ₹45" }))}
                  className={`px-2 py-0.5 rounded text-[9px] font-medium border transition-all ${
                    bidStates[i] ? "bg-sw-green-dim text-sw-green border-sw-green/20" : k.actionColor
                  }`}>
                  {bidStates[i] || k.action}
                </button>
              </div>
            ))}
          </div>
        </PanelCard>
      </div>

      {/* AI Copilot */}
      <div className="opacity-0 animate-fade-slide-in" style={{ animationDelay: "0.45s" }}>
        <div className="rounded-2xl overflow-hidden border border-sw-purple/20">
          <div className="bg-gradient-to-r from-sw-purple/20 to-primary/20 px-6 py-4">
            <h3 className="font-display font-bold text-foreground">🧠 AI Campaign Copilot — 3 Recommendations Ready</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Updated 4 minutes ago</p>
          </div>
          <div className="bg-surface-1 p-5 grid grid-cols-3 gap-4">
            {copilotCards.map((c, i) => (
              <div key={i} className="bg-surface-2 rounded-xl border border-subtle p-4">
                <span className={`font-mono text-[9px] px-2 py-0.5 rounded-full ${c.impact === "HIGH IMPACT" ? "bg-sw-green-dim text-sw-green" : "bg-sw-amber-dim text-sw-amber"}`}>{c.impact}</span>
                <p className="text-sm text-foreground mt-3">{c.emoji} {c.text}</p>
                <p className="text-[10px] text-muted-foreground mt-2 font-mono">Confidence: {c.confidence}%</p>
                <div className="flex items-center gap-2 mt-3">
                  <button onClick={() => setCopilotStates((p) => ({ ...p, [i]: true }))}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      copilotStates[i] ? "bg-sw-green-dim text-sw-green" : "bg-primary/20 text-primary hover:bg-primary/30"
                    }`}>
                    {copilotStates[i] ? "✓ Applied!" : c.action}
                  </button>
                  {!copilotStates[i] && <button className="px-3 py-1.5 rounded-lg text-[11px] text-muted-foreground hover:text-foreground">Dismiss</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      </>) : (
        /* Analytics tab */
        <div className="space-y-5">
          <PanelCard title="Spend vs ROAS — 30 Day Trend" badge="Dual Axis" badgeColor="accent" delay={0}>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={spendRoasTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} interval={4} />
                <YAxis yAxisId="spend" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="roas" orientation="right" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(225,10%,30%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "#1C1F27", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, fontSize: 13 }} />
                <Bar yAxisId="spend" dataKey="spend" fill="hsl(38,92%,50%)" opacity={0.5} radius={[4, 4, 0, 0]} name="Spend (₹K)" />
                <Line yAxisId="roas" type="monotone" dataKey="roas" stroke="hsl(160,70%,48%)" strokeWidth={2} dot={false} name="ROAS" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-amber opacity-50" /> Spend</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full bg-sw-green" /> ROAS</span>
            </div>
          </PanelCard>

          <PanelCard title="Action History Log" badge="Last 30 days" badgeColor="purple" delay={0.1}>
            <table className="w-full text-xs">
              <thead>
                <tr className="text-muted-foreground border-b border-subtle">
                  <th className="text-left py-2 font-normal">Timestamp</th>
                  <th className="text-left py-2 font-normal">Action</th>
                  <th className="text-left py-2 font-normal">Campaign</th>
                  <th className="text-right py-2 font-normal">ROAS Before</th>
                  <th className="text-right py-2 font-normal">ROAS After</th>
                  <th className="text-right py-2 font-normal">Trigger</th>
                </tr>
              </thead>
              <tbody>
                {actionHistory.map((a, i) => (
                  <tr key={i} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                    <td className="py-2.5 font-mono text-muted-foreground">{a.time}</td>
                    <td className="py-2.5 text-foreground">{a.action}</td>
                    <td className="py-2.5 text-foreground">{a.campaign}</td>
                    <td className="py-2.5 text-right font-mono text-muted-foreground">{a.roasBefore}</td>
                    <td className="py-2.5 text-right font-mono text-sw-green">{a.roasAfter}</td>
                    <td className="py-2.5 text-right">
                      <span className={`font-mono text-[9px] px-1.5 py-0.5 rounded-full ${a.trigger === "Auto" ? "bg-sw-purple-dim text-sw-purple" : "bg-surface-3 text-muted-foreground"}`}>{a.trigger}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default CampaignView;
