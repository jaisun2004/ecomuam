import React, { useState } from "react";
import { motion } from "framer-motion";
import PanelCard from "@/components/sw/PanelCard";
import KPICard from "@/components/sw/KPICard";
import { ChevronDown, ChevronRight, ArrowLeft } from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { useGuardrails } from "@/contexts/GuardrailContext";

/* ── Report Data ── */
type ReportKeyword = {
  keyword: string; impressions: string; clicks: string; spend: string; roas: string; roasColor: string;
  cities?: { city: string; impressions: string; clicks: string; spend: string; roas: string; roasColor: string; products: { code: string; title: string; spend: string; roas: string; roasColor: string }[] }[];
};
type ReportCampaign = { name: string; status: string; spend: string; roas: string; roasColor: string; impressions: string; clicks: string; ctr: string; keywords: ReportKeyword[]; };
type ReportPlatform = { platform: string; color: string; totalSpend: string; blendedRoas: string; roasColor: string; campaigns: ReportCampaign[]; };

const reportData: ReportPlatform[] = [
  {
    platform: "Instamart", color: "#FF9900", totalSpend: "₹ 7.8L", blendedRoas: "5.1x", roasColor: "text-sw-green",
    campaigns: [
      { name: "Parle-G 250g — Sponsored", status: "LIVE", spend: "₹ 4.200g", roas: "5.1x", roasColor: "text-sw-green", impressions: "842K", clicks: "28.4K", ctr: "3.4%",
        keywords: [
          { keyword: "butter biscuits online", impressions: "342K", clicks: "12.8K", spend: "₹ 1.8L", roas: "6.2x", roasColor: "text-sw-green",
            cities: [
              { city: "Mumbai", impressions: "98K", clicks: "4.1K", spend: "₹ 52K", roas: "6.5x", roasColor: "text-sw-green", products: [{ code: "SKU-GD200", title: "Parle-G 120g", spend: "₹ 32K", roas: "6.6x", roasColor: "text-sw-green" }, { code: "SKU-GD100", title: "Parle-G 250g 100g", spend: "₹ 20K", roas: "6.5x", roasColor: "text-sw-green" }] },
              { city: "Delhi NCR", impressions: "82K", clicks: "3.2K", spend: "₹ 44K", roas: "6.4x", roasColor: "text-sw-green", products: [{ code: "SKU-GD200", title: "Parle-G 120g", spend: "₹ 28K", roas: "6.4x", roasColor: "text-sw-green" }] },
            ],
          },
          { keyword: "cream biscuits", impressions: "498K", clicks: "14.2K", spend: "₹ 2.250g", roas: "3.1x", roasColor: "text-sw-amber" },
        ],
      },
      { name: "Marie Gold — Keyword Target", status: "PAUSED", spend: "₹ 1.8L", roas: "2.1x", roasColor: "text-sw-red", impressions: "284K", clicks: "8.2K", ctr: "2.9%",
        keywords: [{ keyword: "glucose biscuits bulk", impressions: "187K", clicks: "5.4K", spend: "₹ 1.200g", roas: "1.4x", roasColor: "text-sw-red",
          cities: [{ city: "Mumbai", impressions: "62K", clicks: "1.8K", spend: "₹ 42K", roas: "1.4x", roasColor: "text-sw-red", products: [{ code: "SKU-MG250", title: "Marie Gold 120g", spend: "₹ 42K", roas: "1.4x", roasColor: "text-sw-red" }] }],
        }],
      },
    ],
  },
  {
    platform: "Blinkit", color: "#FDDC2B", totalSpend: "₹ 3.3L", blendedRoas: "3.8x", roasColor: "text-sw-amber",
    campaigns: [
      { name: "Q-Commerce Biscuits Push", status: "LIVE", spend: "₹ 2.8L", roas: "3.8x", roasColor: "text-sw-amber", impressions: "412K", clicks: "14.8K", ctr: "3.6%",
        keywords: [
          { keyword: "butter biscuits", impressions: "188K", clicks: "7.2K", spend: "₹ 1.4L", roas: "4.0x", roasColor: "text-sw-green",
            cities: [{ city: "Mumbai", impressions: "92K", clicks: "3.8K", spend: "₹ 72K", roas: "4.3x", roasColor: "text-sw-green", products: [{ code: "SKU-GD200", title: "Parle-G 250g", spend: "₹ 48K", roas: "4.4x", roasColor: "text-sw-green" }, { code: "SKU-5050", title: "Hide & Seek Choco 120g", spend: "₹ 24K", roas: "4.2x", roasColor: "text-sw-green" }] }],
          },
          { keyword: "choco chip biscuits", impressions: "124K", clicks: "4.8K", spend: "₹ 88K", roas: "3.6x", roasColor: "text-sw-amber" },
        ],
      },
    ],
  },
  {
    platform: "Instamart", color: "#2F77FF", totalSpend: "₹ 5.200g", blendedRoas: "2.1x", roasColor: "text-sw-red",
    campaigns: [
      { name: "Marie Gold Retargeting", status: "PAUSED", spend: "₹ 3.0L", roas: "2.1x", roasColor: "text-sw-red", impressions: "524K", clicks: "12.8K", ctr: "2.4%",
        keywords: [{ keyword: "glucose biscuits", impressions: "284K", clicks: "6.2K", spend: "₹ 1.8L", roas: "1.4x", roasColor: "text-sw-red",
          cities: [{ city: "Mumbai", impressions: "82K", clicks: "1.8K", spend: "₹ 52K", roas: "1.4x", roasColor: "text-sw-red", products: [{ code: "SKU-MG250", title: "Marie Gold 120g", spend: "₹ 52K", roas: "1.4x", roasColor: "text-sw-red" }] }],
        }],
      },
    ],
  },
];

const spendTrend = Array.from({ length: 30 }, (_, i) => ({
  day: `Mar ${i + 1}`,
  spend: Math.round(40 + Math.random() * 20),
  roas: +(3.5 + Math.random() * 2).toFixed(1),
}));

const platformBreakdown = [
  { platform: "Instamart", spend: 78, roas: 5.1, color: "#FF9900" },
  { platform: "Blinkit", spend: 33, roas: 3.8, color: "#FDDC2B" },
  { platform: "Instamart", spend: 52, roas: 2.1, color: "#2F77FF" },
  { platform: "Zepto", spend: 18, roas: 3.2, color: "#833AB4" },
  { platform: "Instamart", spend: 41, roas: 4.4, color: "#E1306C" },
];

const CampaignReportsView: React.FC = () => {
  const g = useGuardrails();
  const [expandedPlatforms, setExpandedPlatforms] = useState<Record<number, boolean>>({});
  const [expandedCampaigns, setExpandedCampaigns] = useState<Record<string, boolean>>({});
  const [expandedKeywords, setExpandedKeywords] = useState<Record<string, boolean>>({});
  const [expandedCities, setExpandedCities] = useState<Record<string, boolean>>({});

  const togglePlatform = (i: number) => setExpandedPlatforms(p => ({ ...p, [i]: !p[i] }));
  const toggleCampaign = (k: string) => setExpandedCampaigns(p => ({ ...p, [k]: !p[k] }));
  const toggleKeyword = (k: string) => setExpandedKeywords(p => ({ ...p, [k]: !p[k] }));
  const toggleCity = (k: string) => setExpandedCities(p => ({ ...p, [k]: !p[k] }));

  const tooltipStyle = {
    contentStyle: { backgroundColor: "hsl(var(--surface-2))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 },
    labelStyle: { color: "hsl(var(--foreground))" },
    itemStyle: { color: "hsl(var(--muted-foreground))" },
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-10">
      <div className="flex items-center gap-3">
        <button onClick={() => g.navigateTo("campaigns")} className="p-2 rounded-lg hover:bg-surface-3 text-muted-foreground hover:text-foreground">
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 className="text-xl font-display font-bold text-foreground">Campaign Reports</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Detailed performance metrics across all campaigns</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-5 gap-4">
        <KPICard title="Total Spend (30D)" value="₹ 18.4L" delta="▲ ₹ 2.250g MoM" deltaType="positive" sub="24 campaigns" accentColor="bg-primary" delay={0} />
        <KPICard title="Blended ROAS" value="4.2x" delta="▲ 0.6x MoM" deltaType="positive" sub="Target: 4.5x" accentColor="bg-sw-green" delay={0.05} />
        <KPICard title="Total Impressions" value="4.2M" delta="▲ 18%" deltaType="positive" sub="Across all platforms" accentColor="bg-sw-cyan" delay={0.1} />
        <KPICard title="Avg CTR" value="3.1%" delta="▲ 0.4%" deltaType="positive" sub="Industry avg: 2.2%" accentColor="bg-sw-purple" delay={0.15} />
        <KPICard title="Avg CPC" value="₹ 18.2" delta="▼ ₹ 2.1" deltaType="positive" sub="30-day average" accentColor="bg-sw-amber" delay={0.2} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-5">
        <PanelCard title="Spend & ROAS trend (30D)" badge="Daily" badgeColor="accent" delay={0.05}>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={spendTrend} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="day" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} interval={4} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip {...tooltipStyle} />
              <Area type="monotone" dataKey="spend" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.15} name="Spend (₹ K)" />
            </AreaChart>
          </ResponsiveContainer>
        </PanelCard>
        <PanelCard title="Platform spend breakdown" badge="₹ K" badgeColor="accent" delay={0.1}>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={platformBreakdown} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" />
              <XAxis dataKey="platform" tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <YAxis tick={{ fontSize: 9, fill: "hsl(var(--muted-foreground))" }} />
              <Tooltip {...tooltipStyle} />
              <Bar dataKey="spend" name="Spend (₹ K)" radius={[4, 4, 0, 0]}>
                {platformBreakdown.map((entry, i) => (
                  <motion.rect key={i} fill={entry.color} fillOpacity={0.8} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </PanelCard>
      </div>

      {/* Drill-down table */}
      <PanelCard title="Campaign drill-down" badge="Platform → Campaign → Keyword → City → Product" badgeColor="accent" delay={0.15}>
        <div className="space-y-2">
          {reportData.map((plat, pi) => (
            <div key={plat.platform} className="border border-subtle rounded-xl overflow-hidden">
              <button onClick={() => togglePlatform(pi)} className="w-full flex items-center gap-3 p-3.5 hover:bg-surface-2 transition-colors">
                {expandedPlatforms[pi] ? <ChevronDown size={14} className="text-muted-foreground" /> : <ChevronRight size={14} className="text-muted-foreground" />}
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: plat.color }} />
                <span className="text-sm text-foreground font-semibold">{plat.platform}</span>
                <div className="ml-auto flex items-center gap-4 text-[11px]">
                  <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{plat.totalSpend}</span></span>
                  <span className={`font-mono font-bold ${plat.roasColor}`}>ROAS {plat.blendedRoas}</span>
                </div>
              </button>
              {expandedPlatforms[pi] && (
                <div className="border-t border-subtle">
                  {plat.campaigns.map((camp, ci) => {
                    const ck = `${pi}-${ci}`;
                    return (
                      <div key={ck} className="border-b border-subtle last:border-0">
                        <button onClick={() => toggleCampaign(ck)} className="w-full flex items-center gap-3 p-3 pl-8 hover:bg-surface-2/50 transition-colors">
                          {expandedCampaigns[ck] ? <ChevronDown size={12} className="text-muted-foreground" /> : <ChevronRight size={12} className="text-muted-foreground" />}
                          <span className="text-xs text-foreground font-medium">{camp.name}</span>
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${camp.status === "LIVE" ? "bg-sw-green-dim text-sw-green" : "bg-sw-red-dim text-sw-red"}`}>{camp.status}</span>
                          <div className="ml-auto flex items-center gap-3 text-[10px]">
                            <span className="text-muted-foreground">Imp <span className="font-mono text-foreground">{camp.impressions}</span></span>
                            <span className="text-muted-foreground">Clicks <span className="font-mono text-foreground">{camp.clicks}</span></span>
                            <span className="text-muted-foreground">CTR <span className="font-mono text-foreground">{camp.ctr}</span></span>
                            <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{camp.spend}</span></span>
                            <span className={`font-mono font-bold ${camp.roasColor}`}>{camp.roas}</span>
                          </div>
                        </button>
                        {expandedCampaigns[ck] && camp.keywords.map((kw, ki) => {
                          const kwk = `${ck}-${ki}`;
                          return (
                            <div key={kwk} className="border-t border-subtle/50">
                              <button onClick={() => toggleKeyword(kwk)} className="w-full flex items-center gap-3 p-2.5 pl-14 hover:bg-surface-2/30 transition-colors">
                                {kw.cities ? (expandedKeywords[kwk] ? <ChevronDown size={11} /> : <ChevronRight size={11} />) : <span className="w-[11px]" />}
                                <span className="text-[11px] text-foreground font-mono">"{kw.keyword}"</span>
                                <div className="ml-auto flex items-center gap-3 text-[10px]">
                                  <span className="text-muted-foreground">Imp <span className="font-mono text-foreground">{kw.impressions}</span></span>
                                  <span className="text-muted-foreground">Clicks <span className="font-mono text-foreground">{kw.clicks}</span></span>
                                  <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{kw.spend}</span></span>
                                  <span className={`font-mono font-bold ${kw.roasColor}`}>{kw.roas}</span>
                                </div>
                              </button>
                              {expandedKeywords[kwk] && kw.cities?.map((city, cii) => {
                                const cityk = `${kwk}-${cii}`;
                                return (
                                  <div key={cityk} className="border-t border-subtle/30">
                                    <button onClick={() => toggleCity(cityk)} className="w-full flex items-center gap-3 p-2 pl-20 hover:bg-surface-2/20 transition-colors">
                                      {expandedCities[cityk] ? <ChevronDown size={10} /> : <ChevronRight size={10} />}
                                      <span className="text-[10px] text-foreground">{city.city}</span>
                                      <div className="ml-auto flex items-center gap-3 text-[9px]">
                                        <span className="text-muted-foreground">Imp <span className="font-mono text-foreground">{city.impressions}</span></span>
                                        <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{city.spend}</span></span>
                                        <span className={`font-mono font-bold ${city.roasColor}`}>{city.roas}</span>
                                      </div>
                                    </button>
                                    {expandedCities[cityk] && city.products.map((prod, pri) => (
                                      <div key={pri} className="flex items-center gap-3 p-2 pl-28 text-[9px] border-t border-subtle/20">
                                        <span className="font-mono text-muted-foreground">{prod.code}</span>
                                        <span className="text-foreground flex-1">{prod.title}</span>
                                        <span className="text-muted-foreground">Spend <span className="font-mono text-foreground">{prod.spend}</span></span>
                                        <span className={`font-mono font-bold ${prod.roasColor}`}>{prod.roas}</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </PanelCard>

      {/* Performance summary table */}
      <PanelCard title="Campaign performance summary" badge="All campaigns" badgeColor="accent" delay={0.2}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border">
                {["Campaign", "Platform", "Status", "Spend", "Imp", "Clicks", "CTR", "ROAS"].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-mono text-muted-foreground uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportData.flatMap(p => p.campaigns.map(c => ({ ...c, platform: p.platform, color: p.color }))).map((c, i) => (
                <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? "bg-surface-2/30" : ""}`}>
                  <td className="py-2 px-3 text-foreground font-medium">{c.name}</td>
                  <td className="py-2 px-3"><span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ backgroundColor: c.color }} />{c.platform}</span></td>
                  <td className="py-2 px-3"><span className={`font-mono text-[9px] px-1.5 py-0.5 rounded ${c.status === "LIVE" ? "bg-sw-green-dim text-sw-green" : "bg-sw-red-dim text-sw-red"}`}>{c.status}</span></td>
                  <td className="py-2 px-3 font-mono text-foreground">{c.spend}</td>
                  <td className="py-2 px-3 font-mono text-foreground">{c.impressions}</td>
                  <td className="py-2 px-3 font-mono text-foreground">{c.clicks}</td>
                  <td className="py-2 px-3 font-mono text-foreground">{c.ctr}</td>
                  <td className={`py-2 px-3 font-mono font-bold ${c.roasColor}`}>{c.roas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </PanelCard>
    </motion.div>
  );
};

export default CampaignReportsView;
