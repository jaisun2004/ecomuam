import React, { useState, useMemo } from "react";
import KPICard from "@/components/sw/KPICard";
import PanelCard from "@/components/sw/PanelCard";
import ScreenTabs from "@/components/ScreenTabs";
import { useGuardrails } from "@/contexts/GuardrailContext";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip, LineChart, Line, Legend } from "recharts";
import { ArrowRight, AlertCircle, MapPin, X } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

/* ── Dark Store pincode-level data ── */
interface DarkStore {
  id: string;
  name: string;
  pincode: string;
  city: string;
  platform: "Blinkit" | "Zepto" | "Swiggy Instamart";
  lat: number; // mapped to SVG Y
  lng: number; // mapped to SVG X
  marketShare: number;
  availability: number;
  avgDeliveryMin: number;
  ordersPerDay: number;
  revenue: string;
  topSku: string;
  oosRate: number;
  competitorPresence: number;
  slotShare: number;
}

const darkStores: DarkStore[] = [
  { id: "ds-1", name: "Blinkit Connaught Place", pincode: "110001", city: "Delhi", platform: "Blinkit", lat: 148, lng: 192, marketShare: 34, availability: 96, avgDeliveryMin: 11, ordersPerDay: 142, revenue: "₹1.8L", topSku: "Good Day Butter 200g", oosRate: 4, competitorPresence: 5, slotShare: 42 },
  { id: "ds-2", name: "Zepto Hauz Khas", pincode: "110016", city: "Delhi", platform: "Zepto", lat: 153, lng: 188, marketShare: 28, availability: 91, avgDeliveryMin: 14, ordersPerDay: 98, revenue: "₹1.2L", topSku: "Marie Gold 250g", oosRate: 9, competitorPresence: 4, slotShare: 31 },
  { id: "ds-3", name: "Blinkit Noida Sec 18", pincode: "201301", city: "Noida", platform: "Blinkit", lat: 156, lng: 200, marketShare: 31, availability: 93, avgDeliveryMin: 12, ordersPerDay: 110, revenue: "₹1.4L", topSku: "Bourbon Cream 150g", oosRate: 7, competitorPresence: 3, slotShare: 38 },
  { id: "ds-4", name: "Instamart Dwarka", pincode: "110075", city: "Delhi", platform: "Swiggy Instamart", lat: 150, lng: 182, marketShare: 22, availability: 88, avgDeliveryMin: 18, ordersPerDay: 65, revenue: "₹82K", topSku: "NutriChoice Digestive 100g", oosRate: 12, competitorPresence: 6, slotShare: 24 },
  { id: "ds-5", name: "Zepto Gurugram DLF", pincode: "122002", city: "Gurugram", platform: "Zepto", lat: 155, lng: 178, marketShare: 26, availability: 90, avgDeliveryMin: 15, ordersPerDay: 88, revenue: "₹1.1L", topSku: "Good Day Butter 200g", oosRate: 10, competitorPresence: 4, slotShare: 29 },
  { id: "ds-6", name: "Blinkit Andheri West", pincode: "400058", city: "Mumbai", platform: "Blinkit", lat: 285, lng: 155, marketShare: 38, availability: 97, avgDeliveryMin: 10, ordersPerDay: 168, revenue: "₹2.1L", topSku: "Good Day Butter 200g", oosRate: 3, competitorPresence: 6, slotShare: 45 },
  { id: "ds-7", name: "Zepto Bandra", pincode: "400050", city: "Mumbai", platform: "Zepto", lat: 288, lng: 160, marketShare: 30, availability: 92, avgDeliveryMin: 13, ordersPerDay: 125, revenue: "₹1.6L", topSku: "Marie Gold 250g", oosRate: 8, competitorPresence: 5, slotShare: 33 },
  { id: "ds-8", name: "Instamart Powai", pincode: "400076", city: "Mumbai", platform: "Swiggy Instamart", lat: 282, lng: 165, marketShare: 24, availability: 86, avgDeliveryMin: 16, ordersPerDay: 72, revenue: "₹92K", topSku: "Bourbon Cream 150g", oosRate: 14, competitorPresence: 4, slotShare: 22 },
  { id: "ds-9", name: "Blinkit Koramangala", pincode: "560034", city: "Bangalore", platform: "Blinkit", lat: 340, lng: 185, marketShare: 36, availability: 95, avgDeliveryMin: 11, ordersPerDay: 155, revenue: "₹1.9L", topSku: "Good Day Butter 200g", oosRate: 5, competitorPresence: 5, slotShare: 40 },
  { id: "ds-10", name: "Zepto HSR Layout", pincode: "560102", city: "Bangalore", platform: "Zepto", lat: 345, lng: 190, marketShare: 29, availability: 90, avgDeliveryMin: 14, ordersPerDay: 102, revenue: "₹1.3L", topSku: "NutriChoice Digestive 100g", oosRate: 10, competitorPresence: 4, slotShare: 30 },
  { id: "ds-11", name: "Blinkit Whitefield", pincode: "560066", city: "Bangalore", platform: "Blinkit", lat: 338, lng: 196, marketShare: 32, availability: 93, avgDeliveryMin: 13, ordersPerDay: 120, revenue: "₹1.5L", topSku: "Marie Gold 250g", oosRate: 7, competitorPresence: 3, slotShare: 35 },
  { id: "ds-12", name: "Blinkit Hinjewadi", pincode: "411057", city: "Pune", platform: "Blinkit", lat: 295, lng: 170, marketShare: 33, availability: 94, avgDeliveryMin: 12, ordersPerDay: 95, revenue: "₹1.2L", topSku: "Good Day Butter 200g", oosRate: 6, competitorPresence: 3, slotShare: 37 },
  { id: "ds-13", name: "Zepto Kothrud", pincode: "411038", city: "Pune", platform: "Zepto", lat: 298, lng: 175, marketShare: 25, availability: 89, avgDeliveryMin: 15, ordersPerDay: 78, revenue: "₹98K", topSku: "Bourbon Cream 150g", oosRate: 11, competitorPresence: 4, slotShare: 26 },
  { id: "ds-14", name: "Blinkit Madhapur", pincode: "500081", city: "Hyderabad", platform: "Blinkit", lat: 305, lng: 215, marketShare: 30, availability: 92, avgDeliveryMin: 13, ordersPerDay: 118, revenue: "₹1.5L", topSku: "Good Day Butter 200g", oosRate: 8, competitorPresence: 4, slotShare: 34 },
  { id: "ds-15", name: "Instamart Gachibowli", pincode: "500032", city: "Hyderabad", platform: "Swiggy Instamart", lat: 308, lng: 210, marketShare: 20, availability: 84, avgDeliveryMin: 19, ordersPerDay: 55, revenue: "₹70K", topSku: "NutriChoice Digestive 100g", oosRate: 16, competitorPresence: 5, slotShare: 20 },
  { id: "ds-16", name: "Blinkit T. Nagar", pincode: "600017", city: "Chennai", platform: "Blinkit", lat: 370, lng: 215, marketShare: 27, availability: 91, avgDeliveryMin: 14, ordersPerDay: 85, revenue: "₹1.1L", topSku: "Good Day Butter 200g", oosRate: 9, competitorPresence: 3, slotShare: 30 },
  { id: "ds-17", name: "Zepto Anna Nagar", pincode: "600040", city: "Chennai", platform: "Zepto", lat: 375, lng: 220, marketShare: 23, availability: 87, avgDeliveryMin: 16, ordersPerDay: 68, revenue: "₹86K", topSku: "Marie Gold 250g", oosRate: 13, competitorPresence: 4, slotShare: 25 },
  { id: "ds-18", name: "Blinkit Salt Lake", pincode: "700091", city: "Kolkata", platform: "Blinkit", lat: 230, lng: 282, marketShare: 22, availability: 85, avgDeliveryMin: 17, ordersPerDay: 62, revenue: "₹78K", topSku: "Good Day Butter 200g", oosRate: 15, competitorPresence: 3, slotShare: 24 },
  { id: "ds-19", name: "Blinkit Malviya Nagar", pincode: "302017", city: "Jaipur", platform: "Blinkit", lat: 182, lng: 152, marketShare: 18, availability: 80, avgDeliveryMin: 20, ordersPerDay: 42, revenue: "₹52K", topSku: "Bourbon Cream 150g", oosRate: 20, competitorPresence: 2, slotShare: 18 },
  { id: "ds-20", name: "Zepto SG Highway", pincode: "380054", city: "Ahmedabad", platform: "Zepto", lat: 230, lng: 140, marketShare: 20, availability: 82, avgDeliveryMin: 18, ordersPerDay: 48, revenue: "₹60K", topSku: "Good Day Butter 200g", oosRate: 18, competitorPresence: 2, slotShare: 20 },
  { id: "ds-21", name: "Blinkit Gomti Nagar", pincode: "226010", city: "Lucknow", platform: "Blinkit", lat: 180, lng: 230, marketShare: 16, availability: 78, avgDeliveryMin: 22, ordersPerDay: 35, revenue: "₹44K", topSku: "Marie Gold 250g", oosRate: 22, competitorPresence: 2, slotShare: 16 },
  { id: "ds-22", name: "Blinkit Sector 17", pincode: "160017", city: "Chandigarh", platform: "Blinkit", lat: 120, lng: 176, marketShare: 25, availability: 90, avgDeliveryMin: 14, ordersPerDay: 72, revenue: "₹90K", topSku: "Good Day Butter 200g", oosRate: 10, competitorPresence: 3, slotShare: 28 },
  { id: "ds-23", name: "Zepto Vijay Nagar", pincode: "452010", city: "Indore", platform: "Zepto", lat: 238, lng: 175, marketShare: 14, availability: 76, avgDeliveryMin: 24, ordersPerDay: 28, revenue: "₹35K", topSku: "NutriChoice Digestive 100g", oosRate: 24, competitorPresence: 2, slotShare: 14 },
  { id: "ds-24", name: "Blinkit Edappally", pincode: "682024", city: "Kochi", platform: "Blinkit", lat: 395, lng: 192, marketShare: 21, availability: 88, avgDeliveryMin: 16, ordersPerDay: 58, revenue: "₹72K", topSku: "Good Day Butter 200g", oosRate: 12, competitorPresence: 2, slotShare: 22 },
];

const platformColorMap: Record<string, string> = {
  Blinkit: "#FDDC2B",
  Zepto: "#833AB4",
  "Swiggy Instamart": "#FC8019",
};

const platforms = ["Blinkit", "Zepto", "Swiggy Instamart", "Amazon", "Flipkart"];
const competitors = ["Sunfeast", "Parle", "Unibic", "McVities", "ITC"];

const platformShareData = platforms.map(p => ({
  platform: p,
  you: Math.round(15 + Math.random() * 20),
  rival1: Math.round(10 + Math.random() * 20),
  rival2: Math.round(8 + Math.random() * 15),
  rival3: Math.round(5 + Math.random() * 12),
  others: Math.round(10 + Math.random() * 15),
}));

const subcategoryMovers = [
  { name: "Butter Cookies", thisWeek: 28, lastWeek: 24, change: 4, leader: "Sunfeast" },
  { name: "Glucose Biscuits", thisWeek: 18, lastWeek: 22, change: -4, leader: "Parle" },
  { name: "Cream Biscuits", thisWeek: 31, lastWeek: 29, change: 2, leader: "You" },
  { name: "Digestive/Health", thisWeek: 15, lastWeek: 14, change: 1, leader: "McVities" },
  { name: "Kids Biscuits", thisWeek: 12, lastWeek: 15, change: -3, leader: "Parle" },
];

// Analytics data
const shareOverTime = Array.from({ length: 90 }, (_, i) => ({
  day: `Day ${i + 1}`,
  you: Math.round(22 + Math.sin(i / 10) * 5 + Math.random() * 3),
  rival1: Math.round(20 + Math.cos(i / 8) * 4 + Math.random() * 3),
  rival2: Math.round(15 + Math.sin(i / 12) * 3 + Math.random() * 2),
  rival3: Math.round(12 + Math.random() * 4),
  rival4: Math.round(8 + Math.random() * 3),
}));

const platformMatrix = platforms.map(p => ({
  platform: p,
  you: Math.round(15 + Math.random() * 20),
  ...Object.fromEntries(competitors.slice(0, 5).map(c => [c, Math.round(5 + Math.random() * 25)])),
}));

const velocityData = ["You", ...competitors.slice(0, 4)].map(brand => ({
  brand,
  change: brand === "You" ? 2.4 : Math.round((Math.random() * 8 - 3) * 10) / 10,
}));

const newEntrants = [
  { brand: "Cremica", firstSeen: "Mar 2, 2026", platforms: ["Blinkit", "Zepto"], share: "1.2%", keywords: ["butter cookies budget", "cream biscuits india", "tea snack"] },
  { brand: "Karachi Bakery", firstSeen: "Mar 8, 2026", platforms: ["Amazon"], share: "0.8%", keywords: ["premium cookies", "fruit biscuits"] },
];

const MarketShareView: React.FC = () => {
  const [tab, setTab] = useState("overview");
  const g = useGuardrails();
  const [platformFilter, setPlatformFilter] = useState("All");
  const [selectedStore, setSelectedStore] = useState<DarkStore | null>(null);
  const [storeFilter, setStoreFilter] = useState<"All" | "Blinkit" | "Zepto" | "Swiggy Instamart">("All");

  const filteredStores = useMemo(() =>
    storeFilter === "All" ? darkStores : darkStores.filter(s => s.platform === storeFilter),
    [storeFilter]
  );

  return (
    <div className="space-y-6 pb-20">
      <div>
        <h1 className="font-display text-xl font-bold text-foreground">Market Share</h1>
        <p className="text-xs text-muted-foreground mt-1">Your position in the category across platforms and subcategories.</p>
      </div>

      <ScreenTabs activeTab={tab} onTabChange={setTab} />

      {tab === "overview" ? (<>
        <div className="grid grid-cols-4 gap-4">
          <KPICard title="Overall Category Share" value="22%" delta="▲ 1.4% vs last wk" deltaType="positive" sub="Across all platforms" accentColor="bg-primary" delay={0} />
          <KPICard title="Rank in Category" value="#2 of 8" delta="▲1 vs last week" deltaType="positive" sub="Behind Parle at 26%" accentColor="bg-sw-green" delay={0.05} />
          <KPICard title="Fastest Growing Competitor" value="ITC" delta="+3.2% share gain" deltaType="negative" sub="Aggressive Q-commerce push" accentColor="bg-sw-red" delay={0.1} />
          <KPICard title="Platform Where You Lead" value="Flipkart" delta="Highest share: 31%" deltaType="positive" sub="2.1x vs nearest rival" accentColor="bg-sw-purple" delay={0.15} />
        </div>

        {/* Share by platform */}
        <PanelCard title="Share by Platform" badge="Stacked comparison" badgeColor="accent" delay={0.2}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={platformShareData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={false} vertical={true} />
              <XAxis type="number" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="platform" tick={{ fontSize: 10, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} width={120} />
              <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
              <Bar dataKey="you" stackId="a" fill="#A78BFA" radius={[0, 0, 0, 0]} name="You" />
              <Bar dataKey="rival1" stackId="a" fill="#FF5C5C" name="Sunfeast" />
              <Bar dataKey="rival2" stackId="a" fill="#FF8A80" name="Parle" />
              <Bar dataKey="rival3" stackId="a" fill="#FFAB91" name="Unibic" />
              <Bar dataKey="others" stackId="a" fill="rgba(85,90,110,0.4)" radius={[0, 4, 4, 0]} name="Others" />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5C5C" }} /> Sunfeast</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF8A80" }} /> Parle</span>
            <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FFAB91" }} /> Unibic</span>
          </div>
        </PanelCard>

        {/* Subcategory movers */}
        <PanelCard title="Subcategories to Watch" badge="WoW change" badgeColor="amber" delay={0.3}>
          <div className="space-y-2">
            {subcategoryMovers.map(s => {
              const [showDetail, setShowDetail] = React.useState(false);
              return (
              <div key={s.name}>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-subtle">
                  <span className="text-xs text-foreground flex-1">{s.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{s.thisWeek}%</span>
                  <span className="text-[9px] text-muted-foreground">vs {s.lastWeek}%</span>
                  <span className={`font-mono text-[11px] w-12 text-right ${s.change > 0 ? "text-sw-green" : s.change < 0 ? "text-sw-red" : "text-muted-foreground"}`}>
                    {s.change > 0 ? "+" : ""}{s.change}%
                  </span>
                  <span className="text-[9px] text-muted-foreground">Leader: {s.leader}</span>
                  <button onClick={() => setShowDetail(!showDetail)} className="text-[10px] font-medium px-2 py-1 rounded-lg bg-primary/15 text-primary flex-shrink-0">
                    {showDetail ? "Hide" : "Details"}
                  </button>
                  <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "subcategory", params: { subcategory: s.name } })} className="text-[10px] font-medium flex-shrink-0" style={{ color: "#4F7FFF" }}>
                    View campaigns →
                  </button>
                </div>
                {showDetail && (
                  <div className="mt-1 ml-4 p-3 rounded-xl bg-surface-1 border border-subtle space-y-2">
                    <div className="grid grid-cols-4 gap-2">
                      <div className="p-2 rounded-lg bg-surface-2">
                        <p className="text-[9px] text-muted-foreground">Availability</p>
                        <p className="font-mono text-sm text-foreground">{Math.round(65 + Math.random() * 30)}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-2">
                        <p className="text-[9px] text-muted-foreground">Avg Price Δ</p>
                        <p className="font-mono text-sm text-sw-red">+{(Math.random() * 8 + 2).toFixed(1)}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-2">
                        <p className="text-[9px] text-muted-foreground">Discount Pressure</p>
                        <p className="font-mono text-sm text-sw-amber">{Math.round(10 + Math.random() * 20)}%</p>
                      </div>
                      <div className="p-2 rounded-lg bg-surface-2">
                        <p className="text-[9px] text-muted-foreground">New SKUs</p>
                        <p className="font-mono text-sm text-foreground">{Math.round(1 + Math.random() * 5)}</p>
                      </div>
                    </div>
                    <button onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "subcategory", params: { subcategory: s.name } })} className="text-[10px] font-medium" style={{ color: "#4F7FFF" }}>
                      Open in Campaign Manager →
                    </button>
                  </div>
                )}
              </div>
              );
            })}
          </div>
        </PanelCard>
      </>) : (
        <div className="space-y-5">
          {/* Share over time */}
          <PanelCard title="Market Share Over Time — 90 Days" badge="Multi-brand" badgeColor="accent" delay={0}>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {["All", ...platforms].map(p => (
                <button key={p} onClick={() => setPlatformFilter(p)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-medium transition-all ${platformFilter === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"}`}>
                  {p}
                </button>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={shareOverTime}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} interval={14} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} />
                <Line type="monotone" dataKey="you" stroke="#A78BFA" strokeWidth={2} dot={false} name="You" />
                <Line type="monotone" dataKey="rival1" stroke="#FF5C5C" strokeWidth={2} dot={false} name="Sunfeast" />
                <Line type="monotone" dataKey="rival2" stroke="#FF8A80" strokeWidth={2} dot={false} name="Parle" />
                <Line type="monotone" dataKey="rival3" stroke="#FFAB91" strokeWidth={2} dot={false} name="Unibic" />
                <Line type="monotone" dataKey="rival4" stroke="hsl(220,10%,46%)" strokeWidth={1} dot={false} strokeDasharray="5 5" name="ITC" />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#A78BFA" }} /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF5C5C" }} /> Sunfeast</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FF8A80" }} /> Parle</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#FFAB91" }} /> Unibic</span>
            </div>
          </PanelCard>

          {/* Platform share matrix */}
          <PanelCard title="Platform Share Matrix" badge="You vs 5 competitors" badgeColor="purple" delay={0.1}>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-muted-foreground border-b border-subtle">
                    <th className="text-left py-2 font-normal">Platform</th>
                    <th className="text-right py-2 font-normal" style={{ color: "#A78BFA" }}>You</th>
                    {competitors.slice(0, 5).map(c => (
                      <th key={c} className="text-right py-2 font-normal">{c.split(" ")[0]}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {platformMatrix.map((row, i) => (
                    <tr key={row.platform} className={i % 2 === 0 ? "bg-surface-2/50" : ""}>
                      <td className="py-2.5 text-foreground">{row.platform}</td>
                      <td className="py-2.5 text-right font-mono" style={{ color: "#A78BFA" }}>{row.you}%</td>
                      {competitors.slice(0, 5).map(c => {
                        const val = (row as any)[c] || 0;
                        const isMax = val > row.you && val >= Math.max(...competitors.slice(0, 5).map(cc => (row as any)[cc] || 0));
                        return <td key={c} className={`py-2.5 text-right font-mono ${isMax ? "text-sw-red" : "text-foreground"}`}>{val}%</td>;
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </PanelCard>

          {/* Share velocity */}
          <PanelCard title="Who Is Gaining Fastest" badge="WoW change" badgeColor="green" delay={0.2}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={velocityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,91%)" horizontal={true} vertical={false} />
                <XAxis dataKey="brand" tick={{ fontSize: 10, fill: "hsl(220,20%,15%)" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fontFamily: "var(--font-mono)", fill: "hsl(220,10%,46%)" }} axisLine={false} tickLine={false} />
                <RTooltip contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(220,13%,91%)", borderRadius: 12, fontSize: 13 }} formatter={(value: number) => `${value > 0 ? "+" : ""}${value}% share`} />
                <Bar dataKey="change" radius={[4, 4, 0, 0]} name="WoW Share Change">
                  {velocityData.map((entry, index) => (
                    <rect key={index} fill={entry.brand === "You" ? "#60A5FA" : entry.change > 0 ? "#F87171" : entry.change < 0 ? "#34D399" : "#6B7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="flex items-center gap-4 mt-2 text-[10px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#60A5FA" }} /> You</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#F87171" }} /> Gaining</span>
              <span className="flex items-center gap-1"><span className="w-3 h-1.5 rounded-full" style={{ backgroundColor: "#34D399" }} /> Losing</span>
            </div>
          </PanelCard>

          {/* New entrants */}
          <PanelCard title="New Competitors Detected" badge="Last 30 days" badgeColor="red" delay={0.3}>
            <div className="space-y-3">
              {newEntrants.map(e => {
                const [showProducts, setShowProducts] = React.useState(false);
                const productTrend = Array.from({ length: 4 }, (_, w) => ({
                  week: `W${w + 1}`,
                  rank: Math.round(20 - w * 3 + Math.random() * 5),
                  share: +(parseFloat(e.share) * (1 + w * 0.3)).toFixed(1),
                }));
                return (
                <div key={e.brand} className="p-4 rounded-xl bg-surface-2 border border-subtle">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground flex items-center gap-2">
                      <AlertCircle size={14} className="text-sw-red" /> {e.brand}
                    </span>
                    <span className="text-[10px] text-muted-foreground">First seen: {e.firstSeen}</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    {e.platforms.map(p => (
                      <span key={p} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-surface-3 text-foreground">{p}</span>
                    ))}
                    <span className="font-mono text-[10px] text-muted-foreground ml-2">Est. share: {e.share}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap mb-2">
                    {e.keywords.map(kw => (
                      <span key={kw} className="font-mono text-[9px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">{kw}</span>
                    ))}
                  </div>
                  <button onClick={() => setShowProducts(!showProducts)} className="text-[10px] font-medium inline-block px-2 py-1 rounded-lg bg-sw-red/15 text-sw-red">
                    {showProducts ? "Hide Products & Trend" : "View Products & Trend →"}
                  </button>
                  {showProducts && (
                    <div className="mt-3 p-3 rounded-lg bg-surface-1 border border-subtle">
                      <p className="text-[10px] text-muted-foreground mb-2">Product trend over last 4 weeks:</p>
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="text-muted-foreground">
                            <th className="text-left py-1 font-normal">Week</th>
                            <th className="text-right py-1 font-normal">Avg Rank</th>
                            <th className="text-right py-1 font-normal">Est. Share</th>
                          </tr>
                        </thead>
                        <tbody>
                          {productTrend.map(t => (
                            <tr key={t.week}>
                              <td className="py-1 text-foreground">{t.week}</td>
                              <td className="py-1 text-right font-mono text-foreground">#{t.rank}</td>
                              <td className="py-1 text-right font-mono text-sw-red">{t.share}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                );
              })}
            </div>
          </PanelCard>

          {/* Dark Store Map */}
          <PanelCard title="Dark Store Network — Pincode Level" badge={`${filteredStores.length} stores`} badgeColor="cyan" delay={0.35}>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(["All", "Blinkit", "Zepto", "Swiggy Instamart"] as const).map(p => (
                <button key={p} onClick={() => { setStoreFilter(p); setSelectedStore(null); }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                    storeFilter === p ? "bg-primary/20 text-primary" : "bg-surface-3 text-muted-foreground hover:text-foreground"
                  }`}>
                  {p !== "All" && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: platformColorMap[p] }} />}
                  {p}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-5 gap-4">
              {/* Map column */}
              <div className="col-span-3 relative">
                <svg viewBox="100 80 220 360" className="w-full" style={{ height: 420 }}>
                  {/* India outline */}
                  <path
                    d="M165,95 L195,88 L220,100 L250,110 L270,130 L285,155 L298,185 L305,220 L298,250 L290,280 L275,305 L260,325 L245,345 L230,365 L220,385 L210,400 L195,415 L182,410 L175,395 L180,370 L170,345 L160,320 L150,300 L140,270 L125,245 L115,220 L120,195 L130,170 L145,140 L155,115 Z"
                    fill="hsl(var(--surface-2))"
                    stroke="hsl(var(--border))"
                    strokeWidth="0.5"
                    opacity={0.5}
                  />
                  {/* Store dots */}
                  {filteredStores.map(store => {
                    const isSelected = selectedStore?.id === store.id;
                    const color = platformColorMap[store.platform];
                    return (
                      <g key={store.id} onClick={() => setSelectedStore(isSelected ? null : store)} className="cursor-pointer">
                        {/* Pulse ring for selected */}
                        {isSelected && (
                          <circle cx={store.lng} cy={store.lat} r="8" fill="none" stroke={color} strokeWidth="1" opacity={0.4}>
                            <animate attributeName="r" from="5" to="12" dur="1.2s" repeatCount="indefinite" />
                            <animate attributeName="opacity" from="0.6" to="0" dur="1.2s" repeatCount="indefinite" />
                          </circle>
                        )}
                        <circle
                          cx={store.lng} cy={store.lat}
                          r={isSelected ? 5 : 3.5}
                          fill={color}
                          stroke={isSelected ? "#fff" : "none"}
                          strokeWidth={isSelected ? 1 : 0}
                          opacity={isSelected ? 1 : 0.85}
                          className="transition-all duration-200"
                        >
                          <title>{store.name} · {store.pincode}</title>
                        </circle>
                      </g>
                    );
                  })}
                </svg>
                {/* Map legend */}
                <div className="flex items-center justify-center gap-4 mt-2">
                  {Object.entries(platformColorMap).map(([name, color]) => (
                    <span key={name} className="flex items-center gap-1.5 text-[9px] text-muted-foreground">
                      <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {/* KPI panel */}
              <div className="col-span-2">
                {selectedStore ? (
                  <div className="rounded-xl border border-subtle bg-surface-2 p-4 space-y-3 animate-fade-slide-in">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: platformColorMap[selectedStore.platform] }} />
                          <span className="font-mono text-[9px] text-muted-foreground">{selectedStore.platform}</span>
                        </div>
                        <h4 className="text-sm font-medium text-foreground leading-tight">{selectedStore.name}</h4>
                        <p className="text-[10px] text-muted-foreground mt-0.5 flex items-center gap-1">
                          <MapPin size={9} /> {selectedStore.city} · {selectedStore.pincode}
                        </p>
                      </div>
                      <button onClick={() => setSelectedStore(null)} className="p-1 rounded hover:bg-surface-3 text-muted-foreground">
                        <X size={12} />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { label: "Market Share", value: `${selectedStore.marketShare}%`, good: selectedStore.marketShare >= 25 },
                        { label: "Availability", value: `${selectedStore.availability}%`, good: selectedStore.availability >= 90 },
                        { label: "Avg Delivery", value: `${selectedStore.avgDeliveryMin} min`, good: selectedStore.avgDeliveryMin <= 15 },
                        { label: "Orders/Day", value: `${selectedStore.ordersPerDay}`, good: selectedStore.ordersPerDay >= 80 },
                        { label: "Revenue", value: selectedStore.revenue, good: true },
                        { label: "Slot Share", value: `${selectedStore.slotShare}%`, good: selectedStore.slotShare >= 30 },
                        { label: "OOS Rate", value: `${selectedStore.oosRate}%`, good: selectedStore.oosRate <= 10 },
                        { label: "Competitors", value: `${selectedStore.competitorPresence}`, good: selectedStore.competitorPresence <= 3 },
                      ].map(kpi => (
                        <div key={kpi.label} className="p-2.5 rounded-lg bg-surface-1 border border-subtle">
                          <p className="text-[9px] text-muted-foreground">{kpi.label}</p>
                          <p className={`font-mono text-sm font-bold mt-0.5 ${kpi.good ? "text-sw-green" : "text-sw-red"}`}>{kpi.value}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 border-t border-subtle">
                      <p className="text-[9px] text-muted-foreground">Top SKU</p>
                      <p className="text-[11px] text-foreground font-medium mt-0.5">{selectedStore.topSku}</p>
                    </div>

                    <button
                      onClick={() => g.navigateWithContext("campaigns", "campaign-digest", { type: "dark-store", params: { store: selectedStore.name, pincode: selectedStore.pincode, platform: selectedStore.platform } })}
                      className="w-full mt-1 px-3 py-2 rounded-lg text-[10px] font-medium text-center transition-all hover:opacity-80"
                      style={{ backgroundColor: "rgba(167,139,250,0.15)", color: "#A78BFA" }}>
                      Boost this location →
                    </button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-subtle bg-surface-2 p-6 flex flex-col items-center justify-center text-center" style={{ minHeight: 300 }}>
                    <MapPin size={24} className="text-muted-foreground mb-2" />
                    <p className="text-xs text-muted-foreground">Click a dark store on the map</p>
                    <p className="text-[10px] text-muted-foreground mt-1">to view pincode-level KPIs</p>
                  </div>
                )}
              </div>
            </div>

            {/* City summary strip */}
            <div className="mt-4 pt-3 border-t border-subtle">
              <div className="flex items-center gap-3 flex-wrap">
                {Array.from(new Set(filteredStores.map(s => s.city))).map(city => {
                  const cityStores = filteredStores.filter(s => s.city === city);
                  const avgShare = Math.round(cityStores.reduce((a, s) => a + s.marketShare, 0) / cityStores.length);
                  return (
                    <span key={city} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className={`w-1.5 h-1.5 rounded-full ${avgShare >= 30 ? "bg-sw-green" : avgShare >= 20 ? "bg-sw-amber" : "bg-sw-red"}`} />
                      {city} <span className="font-mono text-foreground">{avgShare}%</span>
                      <span className="text-muted-foreground">({cityStores.length})</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </PanelCard>

          {/* Quick commerce metrics */}
          <PanelCard title="Quick Commerce Performance" badge="Dark store & Q-commerce" badgeColor="amber" delay={0.4}>
            <p className="text-[10px] text-muted-foreground mb-3">Metrics specific to dark store and q-commerce platforms</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Dark Store Coverage</p>
                <p className="font-mono text-lg font-bold text-foreground mt-1">248 / 316</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">vs top competitor: 292 / 316</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Avg Delivery Slot Share</p>
                <p className="font-mono text-lg font-bold text-sw-green mt-1">34%</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">% of windows in top 3 results</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Platform Exclusivity Score</p>
                <p className="font-mono text-sm font-bold text-foreground mt-1">Rival A: 2.1x on Zepto only</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">Where competitors dominate exclusively</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2 border border-subtle">
                <p className="text-[10px] text-muted-foreground">Impulse Category Rank</p>
                <p className="font-mono text-lg font-bold text-sw-amber mt-1">#4</p>
                <p className="text-[9px] text-muted-foreground mt-0.5">In "frequently bought together" placements</p>
              </div>
            </div>
            <p className="text-[9px] text-muted-foreground mt-3 italic">Q-commerce metrics estimated from platform auction signals and availability data.</p>
          </PanelCard>
        </div>
      )}
    </div>
  );
};

export default MarketShareView;
