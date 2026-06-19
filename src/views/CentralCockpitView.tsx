import React from "react";
import { useGuardrails } from "@/contexts/GuardrailContext";
import {
  Gauge,
  RefreshCw,
  ArrowRight,
  Search,
  Megaphone,
  Package,
  Tag,
  Sparkles,
  BarChart3,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  YAxis,
  Tooltip,
} from "recharts";

type TrendSeries = {
  key: string;
  label: string;
  color: string;
  data: number[];
};

type StatBlock = {
  value: string;
  label: string;
  items: string[];
};

type AreaPanel = {
  id: string;
  name: string;
  icon: React.ComponentType<any>;
  routeId: string;
  trendTitle: string;
  current: string;
  delta: string;
  deltaPositive: boolean;
  series: TrendSeries[];
  stats: StatBlock[];
};

type CampaignFlag = {
  id: string;
  campaign: string;
  platform: string;
  issues: string[];
  metric: string;
  routeId: string;
  target?: string;
};

const COLORS = {
  primary: "#5B2D8E",
  accent: "#4F7FFF",
  amber: "#F5A623",
};

const PANELS: AreaPanel[] = [
  {
    id: "availability",
    name: "Availability",
    icon: Package,
    routeId: "availability",
    trendTitle: "In-stock % · last 7d",
    current: "68%",
    delta: "-4 pts WoW",
    deltaPositive: false,
    series: [
      { key: "v", label: "In-stock %", color: COLORS.primary, data: [78, 76, 74, 73, 71, 70, 68] },
    ],
    stats: [
      { value: "9", label: "Cities with low availability", items: ["Mumbai", "Pune", "Bangalore"] },
      { value: "14", label: "Products with low availability", items: ["Parle-G 250g", "Hide & Seek 120g", "Krackjack 200g"] },
    ],
  },
  {
    id: "pricing",
    name: "Pricing",
    icon: Tag,
    routeId: "pricing",
    trendTitle: "Avg price & discount · last 7d",
    current: "₹ 48 · 12% off",
    delta: "+₹2 · -1pt",
    deltaPositive: false,
    series: [
      { key: "price", label: "Avg price (₹)", color: COLORS.primary, data: [46, 46, 47, 47, 47, 48, 48] },
      { key: "discount", label: "Discount %", color: COLORS.accent, data: [14, 14, 13, 13, 12, 12, 12] },
    ],
    stats: [
      { value: "6", label: "Cities where competitors priced lower", items: ["Delhi NCR", "Hyderabad", "Chennai"] },
      { value: "4", label: "Products with price jump", items: ["Parle-G 250g (+8%)", "Monaco 120g (+6%)", "Krackjack (+5%)"] },
    ],
  },
  {
    id: "shelf",
    name: "Keyword Analysis",
    icon: Search,
    routeId: "shelf",
    trendTitle: "Avg keyword rank · last 7d",
    current: "4.8",
    delta: "+0.6 (worse)",
    deltaPositive: false,
    series: [
      { key: "rank", label: "Avg rank", color: COLORS.primary, data: [4.1, 4.2, 4.3, 4.5, 4.6, 4.7, 4.8] },
    ],
    stats: [
      { value: "12", label: "Keywords lost rank", items: ["glucose biscuit", "cream biscuit", "sugar free biscuit"] },
      { value: "7", label: "Keywords where competitors lead", items: ["digestive biscuit", "marie biscuit", "kids biscuit"] },
    ],
  },
  {
    id: "content",
    name: "Content Quality Score",
    icon: Sparkles,
    routeId: "content",
    trendTitle: "Portfolio content score · last 7d",
    current: "74/100",
    delta: "-5 WoW",
    deltaPositive: false,
    series: [
      { key: "score", label: "Score", color: COLORS.primary, data: [79, 78, 77, 76, 75, 75, 74] },
    ],
    stats: [
      { value: "11", label: "Products below score threshold", items: ["Hide & Seek 120g", "Monaco Classic", "Krackjack 200g"] },
      { value: "5", label: "Products with missing assets", items: ["Parle-G 50g", "Hide & Seek Fab", "20-20 Cookies"] },
    ],
  },
  {
    id: "campaigns",
    name: "Campaign Manager",
    icon: Megaphone,
    routeId: "campaigns",
    trendTitle: "Portfolio ROAS · last 7d",
    current: "4.2x",
    delta: "+0.3x WoW",
    deltaPositive: true,
    series: [
      { key: "roas", label: "ROAS", color: COLORS.primary, data: [3.9, 4.0, 4.0, 4.1, 4.1, 4.2, 4.2] },
    ],
    stats: [
      { value: "7", label: "Campaigns underpacing", items: ["Hide & Seek Always-On Zepto", "Krackjack Discovery BB", "Monaco Brand Search"] },
      { value: "3", label: "Campaigns budget exhausted", items: ["Parle-G Brand Defense Blinkit", "Hide & Seek Fab Awareness", "Krackjack Push Instamart"] },
    ],
  },
  {
    id: "budget",
    name: "Budget Optimiser",
    icon: BarChart3,
    routeId: "budget",
    trendTitle: "Daily spend vs plan · last 7d",
    current: "₹ 1.18L / ₹ 1.05L",
    delta: "112% of plan",
    deltaPositive: false,
    series: [
      { key: "spend", label: "Spend (₹K)", color: COLORS.primary, data: [98, 102, 108, 110, 114, 116, 118] },
      { key: "plan", label: "Plan (₹K)", color: COLORS.accent, data: [105, 105, 105, 105, 105, 105, 105] },
    ],
    stats: [
      { value: "₹ 50K", label: "Reallocation opportunities", items: ["Hide & Seek Blinkit → Parle-G Zepto", "Monaco BB → Krackjack Instamart"] },
      { value: "₹ 18K", label: "Wasted spend pockets (7d)", items: ["Krackjack Discovery — 14 kws", "Monaco Brand — low CTR slots"] },
    ],
  },
];

const CAMPAIGN_FLAGS: CampaignFlag[] = [
  {
    id: "cf1",
    campaign: "Parle-G — Brand Defense Blinkit",
    platform: "Blinkit",
    issues: ["Budget exhausted", "Competitor bid intrusion"],
    metric: "ROAS 5.1x · Spend ₹ 1.2L / ₹ 1.2L",
    routeId: "campaigns",
  },
  {
    id: "cf2",
    campaign: "Hide & Seek 120g — Always-On Zepto",
    platform: "Zepto",
    issues: ["Underpacing", "Low bids"],
    metric: "ROAS 2.8x · Spend ₹ 38K / ₹ 75K",
    routeId: "campaigns",
  },
  {
    id: "cf3",
    campaign: "Parle-G 250g — Category Push Instamart",
    platform: "Instamart",
    issues: ["OOS risk (3 cities)"],
    metric: "ROAS 3.6x · Spend ₹ 22K / ₹ 40K",
    routeId: "campaigns",
  },
  {
    id: "cf4",
    campaign: "Krackjack — Discovery BigBasket",
    platform: "BigBasket",
    issues: ["Wasted spend on 14 keywords"],
    metric: "ROAS 2.1x · Spend ₹ 31K / ₹ 50K",
    routeId: "campaigns",
  },
  {
    id: "cf5",
    campaign: "Hide & Seek Fab — Brand Awareness Blinkit",
    platform: "Blinkit",
    issues: ["Weak geo (Delhi NCR)", "CTR drop"],
    metric: "ROAS 3.2x · Spend ₹ 18K / ₹ 30K",
    routeId: "campaigns",
  },
];

const buildChartData = (series: TrendSeries[]) => {
  const len = series[0]?.data.length ?? 0;
  return Array.from({ length: len }, (_, i) => {
    const row: Record<string, number | string> = { i: `D${i + 1}` };
    series.forEach(s => {
      row[s.key] = s.data[i];
    });
    return row;
  });
};

const CentralCockpitView: React.FC = () => {
  const g = useGuardrails();

  return (
    <div className="space-y-6 pb-20 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Gauge size={20} className="text-primary" /> Central Cockpit
          </h1>
          <p className="text-[12px] text-muted-foreground mt-1">
            Trends and open issues across every area — click any panel to drill in
          </p>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="text-[11px]">Updated 4 min ago</span>
          <RefreshCw size={13} className="cursor-pointer hover:text-foreground transition-colors" />
        </div>
      </div>

      {/* Area panels */}
      <section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {PANELS.map(p => {
            const Icon = p.icon;
            const chartData = buildChartData(p.series);
            return (
              <div
                key={p.id}
                className="rounded-xl border border-subtle bg-surface-1 overflow-hidden"
              >
                <button
                  onClick={() => g.navigateTo(p.routeId)}
                  className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors border-b border-subtle/60"
                >
                  <Icon size={16} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-[13px] font-semibold text-foreground flex-1 truncate">
                    {p.name}
                  </span>
                  <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
                </button>

                <div className="grid grid-cols-2 divide-x divide-subtle/60">
                  {/* Trend */}
                  <div className="px-4 py-3">
                    <p className="text-[10px] uppercase tracking-wider font-mono text-muted-foreground">
                      {p.trendTitle}
                    </p>
                    <div className="mt-1.5 h-[58px] -mx-1">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
                          <YAxis hide domain={["auto", "auto"]} />
                          <Tooltip
                            contentStyle={{
                              fontSize: 10,
                              padding: "4px 6px",
                              borderRadius: 6,
                              border: "1px solid hsl(var(--border))",
                            }}
                            labelStyle={{ display: "none" }}
                          />
                          {p.series.map(s => (
                            <Line
                              key={s.key}
                              type="monotone"
                              dataKey={s.key}
                              stroke={s.color}
                              strokeWidth={1.75}
                              dot={false}
                              name={s.label}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="mt-1.5 flex items-baseline gap-2">
                      <span className="text-[14px] font-semibold font-mono text-foreground">
                        {p.current}
                      </span>
                      <span
                        className="text-[10px] font-mono"
                        style={{ color: p.deltaPositive ? "#2ECF8E" : "#FF5C5C" }}
                      >
                        {p.delta}
                      </span>
                    </div>
                    {p.series.length > 1 && (
                      <div className="mt-1.5 flex flex-wrap gap-2">
                        {p.series.map(s => (
                          <span key={s.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <span className="w-2 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
                            {s.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="px-4 py-3 space-y-3">
                    {p.stats.map((st, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[16px] font-bold font-mono text-foreground">
                            {st.value}
                          </span>
                          <span className="text-[10px] text-muted-foreground leading-tight">
                            {st.label}
                          </span>
                        </div>
                        <ul className="mt-1 space-y-0.5">
                          {st.items.slice(0, 3).map(it => (
                            <li
                              key={it}
                              className="text-[11px] text-foreground/80 truncate"
                              style={{ lineHeight: 1.3 }}
                            >
                              · {it}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Campaign-level flags */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <div>
            <h2 className="font-display text-sm font-semibold text-foreground">Flagged Campaigns</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Campaigns with active issues — click to open
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-subtle bg-surface-1 overflow-hidden divide-y divide-subtle/50">
          {CAMPAIGN_FLAGS.map(c => (
            <button
              key={c.id}
              onClick={() => g.navigateTo(c.routeId, c.target)}
              className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[13px] font-semibold text-foreground truncate">
                    {c.campaign}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-subtle text-muted-foreground">
                    {c.platform}
                  </span>
                </div>
                <p className="text-[11px] font-mono text-muted-foreground mt-1">{c.metric}</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {c.issues.map(iss => (
                    <span
                      key={iss}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-foreground/70"
                    >
                      {iss}
                    </span>
                  ))}
                </div>
              </div>
              <ArrowRight size={14} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};

export default CentralCockpitView;
