import React, { useMemo, useState } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Search, Zap, ShieldAlert, Sparkles, Lightbulb, PackageX, TrendingUp,
  Archive, Edit3, CheckCircle2, BookOpen, MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from "recharts";

type Platform = "Talabat" | "Talabat Pro" | "Noon Minutes";
type Health = "high_competition" | "high_oos_risk" | "efficiency_winner";
type Lens = "keyword" | "pincode" | "budget";

interface KeywordReco {
  id: string;
  platform: Platform;
  category: string;
  target_keyword: string;
  original_recommendation: string;
  agency_insight_signal: string;
  agency_reasoning: string;
  health: Health;
  risk_level: "low" | "medium" | "high";
  current_sov: number;
  suggested_bid: { current: number; suggested: number };
  winning_pincodes: string[];
  estimated_waste_avoided: number;
}

const MOCK: KeywordReco[] = [
  {
    id: "k1", platform: "Talabat", category: "Breakfast Staples",
    target_keyword: "Organic Ghee",
    original_recommendation: "Increase bid by 15% to capture Top-of-Search",
    agency_insight_signal: "Reject. Competitor SOV is 70% in 560034.",
    agency_reasoning: "Pivot budget to long-tail 'cow ghee 1L jar' — 40% lower CPC, +18% CVR observed last 14d.",
    health: "high_competition", risk_level: "high",
    current_sov: 22, suggested_bid: { current: 38, suggested: 26 },
    winning_pincodes: ["110092", "560066", "400076"],
    estimated_waste_avoided: 48000,
  },
  {
    id: "k2", platform: "Talabat", category: "Breakfast Staples",
    target_keyword: "Muesli 1kg",
    original_recommendation: "Maintain bid at AED 14 — performing well",
    agency_insight_signal: "Bulk-verify. CVR 9.2% vs cat avg 4.1%.",
    agency_reasoning: "Efficiency winner. Apply +10% budget cap to capture incremental volume in 8 winning pincodes.",
    health: "efficiency_winner", risk_level: "low",
    current_sov: 41, suggested_bid: { current: 14, suggested: 15 },
    winning_pincodes: ["110001", "110024", "560034", "560066", "400001"],
    estimated_waste_avoided: 0,
  },
  {
    id: "k3", platform: "Noon Minutes", category: "Late Night Snacks",
    target_keyword: "Instant Noodles",
    original_recommendation: "Increase bid +22% — slot available 11pm-2am",
    agency_insight_signal: "Pause. 4 dark stores OOS for top SKU.",
    agency_reasoning: "ATC→Checkout fell 38% last 7d in Abu Dhabi cluster. Resume after restock ETA 48h.",
    health: "high_oos_risk", risk_level: "high",
    current_sov: 28, suggested_bid: { current: 19, suggested: 0 },
    winning_pincodes: ["400076", "400053"],
    estimated_waste_avoided: 62000,
  },
  {
    id: "k4", platform: "Noon Minutes", category: "Late Night Snacks",
    target_keyword: "Cold Coffee",
    original_recommendation: "Steady — no change suggested",
    agency_insight_signal: "Bulk-verify. CPC 22% below cat median.",
    agency_reasoning: "Efficiency winner in 5 metros. Recommend +15% budget shift from 'iced tea' which is over-bid.",
    health: "efficiency_winner", risk_level: "low",
    current_sov: 36, suggested_bid: { current: 11, suggested: 12 },
    winning_pincodes: ["560034", "560066", "110092", "400076", "411014"],
    estimated_waste_avoided: 0,
  },
  {
    id: "k5", platform: "Talabat", category: "Beverages",
    target_keyword: "Energy Drink",
    original_recommendation: "Increase bid +18% to defend rank #2",
    agency_insight_signal: "Reject. Category margin can't sustain AED /click ask.",
    agency_reasoning: "Re-allocate to 'sports drink 500ml' where SOV is 12% with headroom to 30%.",
    health: "high_competition", risk_level: "medium",
    current_sov: 31, suggested_bid: { current: 24, suggested: 18 },
    winning_pincodes: ["560066", "110024"],
    estimated_waste_avoided: 31000,
  },
  {
    id: "k6", platform: "Talabat", category: "Snacks",
    target_keyword: "Protein Bar",
    original_recommendation: "Maintain — strong ROAS",
    agency_insight_signal: "Bulk-verify. Pincode availability 92%.",
    agency_reasoning: "Efficiency winner. Stable performance across 6 pincodes; safe to enable auto-bid.",
    health: "efficiency_winner", risk_level: "low",
    current_sov: 38, suggested_bid: { current: 16, suggested: 17 },
    winning_pincodes: ["110092", "400076", "560034"],
    estimated_waste_avoided: 0,
  },
  {
    id: "k7", platform: "Talabat", category: "Beverages",
    target_keyword: "Cold Pressed Juice",
    original_recommendation: "Bid +25% — auction pressure rising",
    agency_insight_signal: "Hold. OOS risk in 3 of 7 winning pincodes.",
    agency_reasoning: "Wait 24h — restock confirmed. Avoids AED 22k waste on dead clicks.",
    health: "high_oos_risk", risk_level: "medium",
    current_sov: 19, suggested_bid: { current: 21, suggested: 21 },
    winning_pincodes: ["110024", "560066"],
    estimated_waste_avoided: 22000,
  },
  {
    id: "k8", platform: "Noon Minutes", category: "Late Night Snacks",
    target_keyword: "Chips Combo Pack",
    original_recommendation: "Bid +12% to claim ToS",
    agency_insight_signal: "Reject. Competitor SOV 64% in late-night slot.",
    agency_reasoning: "Pivot to 'desi namkeen pack' where SOV opportunity is 40% with 30% lower CPC.",
    health: "high_competition", risk_level: "high",
    current_sov: 14, suggested_bid: { current: 17, suggested: 12 },
    winning_pincodes: ["400053", "411014"],
    estimated_waste_avoided: 29000,
  },
];

const HEALTH_META: Record<Health, { label: string; icon: React.ElementType; cls: string }> = {
  high_competition: { label: "High Competition", icon: ShieldAlert, cls: "text-sw-red bg-sw-red-dim border-sw-red/30" },
  high_oos_risk: { label: "High OOS Risk", icon: PackageX, cls: "text-sw-amber bg-sw-amber-dim border-sw-amber/30" },
  efficiency_winner: { label: "Efficiency Winner", icon: TrendingUp, cls: "text-sw-green bg-sw-green-dim border-sw-green/30" },
};

const PLATFORM_TINT: Record<Platform, string> = {
  Talabat: "bg-sw-amber-dim text-sw-amber",
  "Talabat Pro": "bg-sw-purple-dim text-sw-purple",
  "Noon Minutes": "bg-sw-cyan-dim text-sw-cyan",
};

const LEDGER = [
  { date: "May 2", platform: "Noon Minutes", decision: "Rejected", original: "Bid +30% on 'frozen paratha'", saved: 84000, why: "Competitor SOV 78% in target pincodes" },
  { date: "Apr 28", platform: "Talabat", decision: "Modified", original: "+20% budget on 'organic ghee'", saved: 48000, why: "Pivoted to long-tail variants" },
  { date: "Apr 24", platform: "Talabat", decision: "Archived", original: "Audience expansion 'health-conscious'", saved: 36000, why: "Overlap with existing winning segment" },
  { date: "Apr 19", platform: "Noon Minutes", decision: "Rejected", original: "Bid +15% on 'instant noodles'", saved: 62000, why: "ATC→Checkout dropped on OOS" },
  { date: "Apr 14", platform: "Talabat", decision: "Modified", original: "Bid +25% on 'cold pressed juice'", saved: 22000, why: "Held 24h for restock" },
  { date: "Apr 9", platform: "Talabat", decision: "Rejected", original: "+18% on 'energy drink'", saved: 31000, why: "Margin pressure unsustainable" },
];

const fmtINR = (n: number) => `AED ${(n / 1000).toFixed(0)}k`;
const fmtINRLarge = (n: number) => n >= 100000 ? `AED ${(n / 100000).toFixed(2)}L` : fmtINR(n);

const RecommendationsView: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>("Talabat");
  const [lens, setLens] = useState<Lens>("keyword");
  const [policy, setPolicy] = useState<"convenience" | "expert">("expert");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<string | null>(null);
  const [editBid, setEditBid] = useState<string>("");

  const visible = useMemo(() => {
    const base = MOCK.filter(k => k.platform === platform && !dismissed.has(k.id));
    if (lens === "budget") return [...base].sort((a, b) => b.estimated_waste_avoided - a.estimated_waste_avoided);
    if (lens === "pincode") return [...base].sort((a, b) => b.winning_pincodes.length - a.winning_pincodes.length);
    return base;
  }, [platform, lens, dismissed]);

  const winners = visible.filter(k => k.health === "efficiency_winner");
  const totalWaste = MOCK.reduce((s, k) => s + k.estimated_waste_avoided, 0) + 196000;
  const pending = MOCK.filter(k => !dismissed.has(k.id)).length;

  const apply = (id: string, label = "Verified & applied") => {
    setDismissed(prev => new Set(prev).add(id));
    toast.success(label);
  };

  const bulkVerify = () => {
    const ids = winners.map(w => w.id);
    setDismissed(prev => { const n = new Set(prev); ids.forEach(i => n.add(i)); return n; });
    toast.success(`${ids.length} efficiency winners verified & applied`);
  };

  const aggressionData = [{ name: "agg", value: 1.4, fill: "hsl(var(--sw-amber))" }];

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-2xl text-foreground">Recommendations</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Keyword aggression vs operational reality across Q-Commerce platforms
          </p>
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <BookOpen size={14} /> Savings Ledger
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[480px] sm:max-w-[480px]">
            <SheetHeader>
              <SheetTitle className="font-display">Savings Attribution Ledger</SheetTitle>
            </SheetHeader>
            <div className="mt-2 mb-5">
              <p className="text-xs text-muted-foreground">Losses avoided YTD</p>
              <p className="font-display font-bold text-3xl text-sw-green">{fmtINRLarge(totalWaste + 1240000)}</p>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-200px)] pr-2">
              {LEDGER.map((l, i) => (
                <div key={i} className="border border-subtle rounded-xl p-3 bg-surface-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-muted-foreground">{l.date} · {l.platform}</span>
                    <Badge variant="outline" className="text-[10px]">{l.decision}</Badge>
                  </div>
                  <p className="text-sm text-foreground">{l.original}</p>
                  <p className="text-[11px] text-muted-foreground mt-1">{l.why}</p>
                  <p className="text-sm font-mono text-sw-green mt-2">Saved {fmtINR(l.saved)}</p>
                </div>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Strategic Header KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Total Keyword Spend" value="AED 6.84L" delta="MTD" deltaType="neutral"
          sub="Across 142 active sponsored keywords" accentColor="bg-sw-purple" delay={0}
        />
        <KPICard
          title="Weighted Avg SOV" value="32.4%" delta="+3.1pt vs last wk" deltaType="positive"
          sub="Volume-weighted across all live keywords" accentColor="bg-sw-green" delay={0.05}
        />
        <KPICard
          title="Pincode Availability" value="84%" delta="-4pt WoW" deltaType="warning"
          sub="16% of dark stores OOS for top-bid SKUs" accentColor="bg-sw-amber" delay={0.1}
        />
        <KPICard
          title="Pending Verifications" value={`${pending}`} delta={`${winners.length} winners`} deltaType="positive"
          sub="Keyword recos awaiting agency triage" accentColor="bg-primary" delay={0.15}
        />
      </div>

      {/* Policy toggle */}
      <div className="bg-surface-1 border border-subtle rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles size={16} className="text-primary" />
          <div>
            <p className="text-sm font-medium text-foreground">Triage Policy</p>
            <p className="text-[11px] text-muted-foreground">
              {policy === "convenience"
                ? "Auto-verifying low-risk efficiency winners"
                : "Manual agency triage on every recommendation"}
            </p>
          </div>
        </div>
        <div className="inline-flex border border-subtle rounded-lg overflow-hidden">
          <button
            onClick={() => { setPolicy("convenience"); toast("Convenience mode on"); }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${policy === "convenience" ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground hover:text-foreground"}`}
          >High Convenience</button>
          <button
            onClick={() => { setPolicy("expert"); toast("Expert mode on"); }}
            className={`px-3 py-1.5 text-xs font-medium transition-colors ${policy === "expert" ? "bg-primary text-primary-foreground" : "bg-surface-2 text-muted-foreground hover:text-foreground"}`}
          >Expert Triage</button>
        </div>
      </div>

      {/* Tabs + lens + bulk */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Tabs value={platform} onValueChange={(v) => setPlatform(v as Platform)}>
          <TabsList>
            <TabsTrigger value="Talabat">Talabat</TabsTrigger>
            <TabsTrigger value="Talabat">Talabat</TabsTrigger>
            <TabsTrigger value="Noon Minutes">Noon Minutes</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex items-center gap-3">
          <Select value={lens} onValueChange={(v) => setLens(v as Lens)}>
            <SelectTrigger className="h-9 w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="keyword">Keyword Focus</SelectItem>
              <SelectItem value="pincode">Pincode Focus</SelectItem>
              <SelectItem value="budget">Budget Focus</SelectItem>
            </SelectContent>
          </Select>
          <Button
            size="sm" className="gap-2" disabled={winners.length === 0}
            onClick={bulkVerify}
          >
            <CheckCircle2 size={14} /> Bulk Verify Winners ({winners.length})
          </Button>
        </div>
      </div>

      {/* Body grid: feed + war-room */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {visible.length === 0 && (
            <div className="col-span-full bg-surface-1 border border-subtle rounded-2xl p-10 text-center text-sm text-muted-foreground">
              No pending recommendations for {platform}. All caught up.
            </div>
          )}
          {visible.map((k) => {
            const HM = HEALTH_META[k.health];
            const HIcon = HM.icon;
            const bidDelta = k.suggested_bid.suggested - k.suggested_bid.current;
            return (
              <div key={k.id} className="bg-surface-1 border border-subtle rounded-2xl overflow-hidden flex flex-col">
                <div className="px-4 py-3 border-b border-subtle flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono ${PLATFORM_TINT[k.platform]}`}>{k.platform}</span>
                    <Search size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="font-display font-semibold text-sm text-foreground truncate">{k.target_keyword}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${HM.cls}`}>
                    <HIcon size={10} /> {HM.label}
                  </span>
                </div>

                <div className="px-4 py-3 space-y-3 flex-1">
                  <p className="text-[11px] text-muted-foreground">{k.category}</p>

                  <div className="bg-surface-2 rounded-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                      <Zap size={10} /> Platform Tip
                    </p>
                    <p className="text-sm text-foreground">{k.original_recommendation}</p>
                  </div>

                  <div className="bg-sw-amber-dim border-l-4 border-sw-amber rounded-r-lg p-3">
                    <p className="text-[10px] uppercase tracking-wider text-sw-amber mb-1 flex items-center gap-1">
                      <Lightbulb size={10} /> Agency Keyword Pivot
                    </p>
                    <p className="text-sm font-medium text-foreground">{k.agency_insight_signal}</p>
                    <p className="text-[12px] text-foreground/80 mt-1">{k.agency_reasoning}</p>
                    {k.estimated_waste_avoided > 0 && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-sw-green-dim text-sw-green text-[10px] font-mono rounded-full">
                        Saves ~{fmtINR(k.estimated_waste_avoided)}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-surface-2 rounded-lg p-2">
                      <p className="text-[9px] uppercase text-muted-foreground">Current SOV</p>
                      <p className="font-mono text-sm text-foreground mt-0.5">{k.current_sov}%</p>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-2">
                      <p className="text-[9px] uppercase text-muted-foreground">Sug. Bid</p>
                      <p className="font-mono text-sm text-foreground mt-0.5">
                        <span className="line-through text-muted-foreground/70">AED {k.suggested_bid.current}</span>{" "}
                        <span className={bidDelta < 0 ? "text-sw-red" : bidDelta > 0 ? "text-sw-green" : "text-foreground"}>
                          AED {k.suggested_bid.suggested}
                        </span>
                      </p>
                    </div>
                    <div className="bg-surface-2 rounded-lg p-2">
                      <p className="text-[9px] uppercase text-muted-foreground">Win PIN</p>
                      <p className="font-mono text-sm text-foreground mt-0.5">{k.winning_pincodes.length}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {k.winning_pincodes.slice(0, 3).map(p => (
                      <span key={p} className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-surface-3 rounded text-[10px] font-mono text-muted-foreground">
                        <MapPin size={9} />{p}
                      </span>
                    ))}
                    {k.winning_pincodes.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono text-muted-foreground">+{k.winning_pincodes.length - 3} more</span>
                    )}
                  </div>

                  {editing === k.id && (
                    <div className="bg-surface-2 border border-subtle rounded-lg p-3 space-y-2">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Modify bid</p>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number" value={editBid} onChange={(e) => setEditBid(e.target.value)}
                          className="h-8" placeholder={`${k.suggested_bid.suggested}`}
                        />
                        <Button size="sm" onClick={() => { apply(k.id, `Bid set to AED ${editBid || k.suggested_bid.suggested}`); setEditing(null); }}>Save</Button>
                        <Button size="sm" variant="ghost" onClick={() => setEditing(null)}>Cancel</Button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="px-4 py-3 border-t border-subtle flex items-center gap-2">
                  <Button size="sm" className="flex-1 gap-1" onClick={() => apply(k.id)}>
                    <CheckCircle2 size={13} /> Verify & Apply
                  </Button>
                  <Button
                    size="sm" variant="outline" className="gap-1"
                    onClick={() => { setEditing(k.id); setEditBid(String(k.suggested_bid.suggested)); }}
                  >
                    <Edit3 size={13} /> Modify
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="gap-1 text-sw-red hover:text-sw-red">
                        <Archive size={13} />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Archive recommendation?</AlertDialogTitle>
                        <AlertDialogDescription>
                          "{k.target_keyword}" will move to the savings ledger as rejected.
                          {k.estimated_waste_avoided > 0 && ` Estimated AED ${fmtINR(k.estimated_waste_avoided)} of waste avoided.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => apply(k.id, "Archived to ledger")}>Archive</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>

        {/* War-Room sidebar */}
        <div className="space-y-4">
          <PanelCard title="Aggression Index" badge="vs category" badgeColor="purple">
            <div className="h-[140px] -mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="65%" outerRadius="100%" data={aggressionData} startAngle={180} endAngle={0}>
                  <PolarAngleAxis type="number" domain={[0, 2]} tick={false} />
                  <RadialBar dataKey="value" cornerRadius={10} background={{ fill: "hsl(var(--surface-3))" }} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="text-center -mt-16">
                <p className="font-display font-bold text-2xl text-foreground">1.4x</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Aggressive</p>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground text-center mt-6">
              Bid intensity is 40% above category median. Selectively pull back on high-comp keywords.
            </p>
          </PanelCard>

          <PanelCard title="Waste Prevention" badge="Keywords" badgeColor="green">
            <p className="font-display font-bold text-3xl text-sw-green">AED 2.84L</p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Saved this month from pausing keywords where ATC→Checkout dropped due to dark-store stock-outs.
            </p>
            <div className="mt-3 pt-3 border-t border-subtle space-y-1.5">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Top saving keywords</p>
              {[
                { k: "instant noodles", v: 62000 },
                { k: "organic ghee", v: 48000 },
                { k: "energy drink", v: 31000 },
              ].map(r => (
                <div key={r.k} className="flex items-center justify-between text-xs">
                  <span className="text-foreground truncate">{r.k}</span>
                  <span className="font-mono text-sw-green">{fmtINR(r.v)}</span>
                </div>
              ))}
            </div>
          </PanelCard>

          <PanelCard title="Quick Stats" badgeColor="grey">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted-foreground">Keywords paused (7d)</span><span className="font-mono">12</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Restored after restock</span><span className="font-mono">7</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Pivots applied</span><span className="font-mono">23</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Avg CPC reduction</span><span className="font-mono text-sw-green">-18%</span></div>
            </div>
          </PanelCard>
        </div>
      </div>
    </div>
  );
};

export default RecommendationsView;
