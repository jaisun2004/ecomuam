import { useState } from "react";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import KPICard from "@/components/KPICard";
import { FileText, Image, Star, Search, Target, Shield, Eye, BarChart3 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend,
} from "recharts";

const contentHealthScores = [
  { sku: "SKU-101", name: "ZapDrink Energy Boost 250ml", retailer: "Amazon", titleScore: 85, titleLength: 58, maxLength: 80, heroScore: 92, ratingScore: 88, avgRating: 4.3, reviewCount: 1245, keywordScore: 70, searchRank: 3 },
  { sku: "SKU-101", name: "ZapDrink Energy Boost 250ml", retailer: "Flipkart", titleScore: 72, titleLength: 42, maxLength: 80, heroScore: 65, ratingScore: 78, avgRating: 4.1, reviewCount: 890, keywordScore: 55, searchRank: 7 },
  { sku: "SKU-205", name: "HydraMax Electrolyte Water 500ml", retailer: "Amazon", titleScore: 45, titleLength: 32, maxLength: 80, heroScore: 40, ratingScore: 62, avgRating: 3.6, reviewCount: 234, keywordScore: 30, searchRank: 18 },
  { sku: "SKU-205", name: "HydraMax Electrolyte Water 500ml", retailer: "Blinkit", titleScore: 68, titleLength: 48, maxLength: 60, heroScore: 75, ratingScore: 70, avgRating: 3.8, reviewCount: 156, keywordScore: 58, searchRank: 5 },
  { sku: "SKU-300", name: "PureLeaf Green Tea 330ml", retailer: "Amazon", titleScore: 90, titleLength: 72, maxLength: 80, heroScore: 95, ratingScore: 94, avgRating: 4.5, reviewCount: 3200, keywordScore: 82, searchRank: 1 },
  { sku: "SKU-300", name: "PureLeaf Green Tea 330ml", retailer: "Flipkart", titleScore: 55, titleLength: 38, maxLength: 80, heroScore: 50, ratingScore: 72, avgRating: 4.0, reviewCount: 1800, keywordScore: 45, searchRank: 12 },
  { sku: "SKU-404", name: "FitCrunch Protein Bar 60g", retailer: "Amazon", titleScore: 78, titleLength: 55, maxLength: 80, heroScore: 82, ratingScore: 58, avgRating: 3.4, reviewCount: 89, keywordScore: 65, searchRank: 9 },
  { sku: "SKU-404", name: "FitCrunch Protein Bar 60g", retailer: "Zepto", titleScore: 62, titleLength: 40, maxLength: 60, heroScore: 60, ratingScore: 52, avgRating: 3.2, reviewCount: 45, keywordScore: 48, searchRank: 14 },
];

const productTitles: Record<string, { current: string; optimized: string }> = {
  "SKU-101": {
    current: "ZapDrink Energy Boost 250ml Can - Sugar Free Caffeine Drink",
    optimized: "ZapDrink Energy Boost 250ml Can | Sugar Free | Electrolytes | Pre-Workout Gym Drink | Zero Calories"
  },
  "SKU-205": {
    current: "HydraMax Electrolyte Water 500ml",
    optimized: "HydraMax Electrolyte Water 500ml | Keto Friendly | Vegan | Zero Sugar | Coconut Water + Minerals"
  },
  "SKU-300": {
    current: "PureLeaf Green Tea Natural Detox 330ml Bottle",
    optimized: "PureLeaf Green Tea 330ml | Organic Detox | Antioxidant Rich | Weight Loss | Natural Flavour"
  },
  "SKU-404": {
    current: "FitCrunch Protein Bar 60g",
    optimized: "FitCrunch Protein Bar 60g | 20g Protein | Low Sugar | Gym Snack | Whey Protein | Chocolate Flavour"
  },
};

const titleKeywordData = [
  { keyword: "Title Keywords", you: 72, topSeller: 95 },
  { keyword: "Hero Image", you: 68, topSeller: 90 },
  { keyword: "Rating", you: 70, topSeller: 92 },
  { keyword: "Review Count", you: 55, topSeller: 88 },
  { keyword: "Search Visibility", you: 60, topSeller: 85 },
  { keyword: "Add-to-Cart Rate", you: 48, topSeller: 78 },
];

const heroImageAudit = [
  { sku: "SKU-101", name: "ZapDrink Energy Boost", issues: ["Low contrast on mobile", "No lifestyle shot"], score: 72, hasInfoGraphic: true, hasBadge: true, hasLifestyle: false },
  { sku: "SKU-205", name: "HydraMax Electrolyte", issues: ["White background too plain", "No USP callout", "Small product in frame"], score: 40, hasInfoGraphic: false, hasBadge: false, hasLifestyle: false },
  { sku: "SKU-300", name: "PureLeaf Green Tea", issues: [], score: 95, hasInfoGraphic: true, hasBadge: true, hasLifestyle: true },
  { sku: "SKU-404", name: "FitCrunch Protein Bar", issues: ["No nutritional callout"], score: 68, hasInfoGraphic: true, hasBadge: false, hasLifestyle: true },
];

const ratingAnalysis = [
  { sku: "SKU-101", name: "ZapDrink Energy", rating: 4.3, reviews: 1245, trend: 0.1, sentiment: 82, topIssue: "Taste complaints (12%)", topPraise: "Energy boost (45%)", responseRate: 78 },
  { sku: "SKU-205", name: "HydraMax Electrolyte", rating: 3.6, reviews: 234, trend: -0.2, sentiment: 58, topIssue: "Packaging leaks (22%)", topPraise: "Refreshing (38%)", responseRate: 45 },
  { sku: "SKU-300", name: "PureLeaf Green Tea", rating: 4.5, reviews: 3200, trend: 0.05, sentiment: 91, topIssue: "Price (8%)", topPraise: "Natural taste (52%)", responseRate: 92 },
  { sku: "SKU-404", name: "FitCrunch Protein Bar", rating: 3.4, reviews: 89, trend: -0.3, sentiment: 48, topIssue: "Too sweet (28%)", topPraise: "Protein content (35%)", responseRate: 22 },
];

const searchPageSimulation = [
  { sku: "SKU-101", title: "ZapDrink Energy Boost 250ml Can - Sugar Free", rating: 4.3, reviews: "1.2K", price: "₹99", badge: "Best Seller", titleScore: 85, imageScore: 72 },
  { sku: "SKU-205", title: "HydraMax Electrolyte Water 500ml", rating: 3.6, reviews: "234", price: "₹45", badge: null, titleScore: 45, imageScore: 40 },
  { sku: "SKU-300", title: "PureLeaf Green Tea Natural Detox 330ml", rating: 4.5, reviews: "3.2K", price: "₹120", badge: "Amazon's Choice", titleScore: 90, imageScore: 95 },
];

const getScoreColor = (score: number) => {
  if (score < 50) return 'bg-destructive/10 text-destructive';
  if (score < 80) return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
};

const getScoreBg = (score: number) => {
  if (score < 50) return 'bg-destructive';
  if (score < 80) return 'bg-warning';
  return 'bg-success';
};

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }).map((_, i) => (
    <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-warning fill-warning' : i < rating ? 'text-warning fill-warning/50' : 'text-muted-foreground/30'}`} />
  ));
};

const campaignTriggers: CampaignTrigger[] = [
  {
    id: "content-1",
    signal: "SKU-205 title underperforming vs category",
    signalDetail: "Title score 45/100 — missing 4 high-volume keywords. Add-to-cart rate 35% below category avg on search page",
    strategy: "Sponsored Ads to compensate weak organic",
    campaignType: "Sponsored Product + Headline Search",
    platforms: ["Amazon", "Flipkart"],
    keywords: ["electrolyte water", "keto drink", "sports hydration", "coconut water"],
    estimatedImpact: "Maintain visibility while title is optimized — protect ₹2.1L/week",
    urgency: "critical",
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
  {
    id: "content-2",
    signal: "SKU-404 rating dropped below 3.5",
    signalDetail: "Rating fell from 3.7 to 3.4 — 'too sweet' complaints rising. Risk of losing search page badge",
    strategy: "Review Recovery + Brand Defense",
    campaignType: "Post-purchase email + Review request campaign",
    platforms: ["Amazon", "Flipkart", "BigBasket"],
    keywords: ["protein bar", "healthy snack", "gym protein bar"],
    estimatedImpact: "Target 4.0 rating in 30 days — unlock 18% higher conversion",
    urgency: "high",
    icon: <Shield className="h-4 w-4 text-warning" />,
  },
];

const ContentAuditSection = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'title' | 'hero' | 'ratings' | 'search'>('overview');
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  const tabs = [
    { id: 'overview', label: 'SEO Overview' },
    { id: 'title', label: 'Title Optimisation' },
    { id: 'hero', label: 'Hero Image Audit' },
    { id: 'ratings', label: 'Ratings & Reviews' },
    { id: 'search', label: 'Search Page Simulator' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Content Audit & SEO Optimisation</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Optimize titles, hero images, and ratings for search page visibility — because on qcom, the search result IS the shelf
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 bg-muted p-1 rounded-lg w-fit border border-border">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
              activeTab === tab.id ? 'bg-card text-primary shadow-card' : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <KPICard title="Search Page Score" value="68/100" change={-5} changeLabel="vs last month" icon={<Search className="h-5 w-5" />} variant="warning" />
            <KPICard title="Title Score (Avg)" value="69/100" change={3} changeLabel="across all SKUs" icon={<FileText className="h-5 w-5" />} variant="warning" />
            <KPICard title="Hero Image Score" value="72/100" change={-2} changeLabel="mobile optimized" icon={<Image className="h-5 w-5" />} variant="warning" />
            <KPICard title="Avg Rating" value="3.95" change={-0.1} changeLabel="across platforms" icon={<Star className="h-5 w-5" />} variant="destructive" />
            <KPICard title="Review Volume" value="5,568" change={12} changeLabel="total reviews" icon={<BarChart3 className="h-5 w-5" />} variant="success" />
          </div>

          {/* Campaign Triggers */}
          <CampaignTriggerPanel triggers={campaignTriggers} title="Content-Based Campaign Triggers" />

          {/* Search Page Factors Radar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Search Page Factor Analysis</h3>
              <p className="text-xs text-muted-foreground mb-4">Your listing vs top seller — what matters for add-to-cart from search</p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={titleKeywordData}>
                  <PolarGrid stroke="hsl(260, 15%, 88%)" />
                  <PolarAngleAxis dataKey="keyword" tick={{ fontSize: 10 }} stroke="hsl(260, 10%, 50%)" />
                  <Radar name="Your Brand" dataKey="you" stroke="hsl(270, 70%, 50%)" fill="hsl(270, 70%, 50%)" fillOpacity={0.3} />
                  <Radar name="Top Seller" dataKey="topSeller" stroke="hsl(142, 71%, 45%)" fill="hsl(142, 71%, 45%)" fillOpacity={0.15} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Why Search Page Matters on Q-Com</h3>
              <p className="text-xs text-muted-foreground mb-4">On quick commerce apps, 70%+ products are added to cart directly from search results</p>
              <div className="space-y-4">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <h4 className="font-bold text-sm text-foreground">Title = First Impression</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Users see truncated titles on search. First 40-60 chars must contain key USPs and high-volume keywords.</p>
                </div>
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Image className="h-4 w-4 text-warning" />
                    <h4 className="font-bold text-sm text-foreground">Hero Image = Buy/Skip Decision</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Mobile thumbnails must show clear product, badges, USP callouts, and be visually differentiated from competition.</p>
                </div>
                <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="h-4 w-4 text-success" />
                    <h4 className="font-bold text-sm text-foreground">Rating = Trust Signal</h4>
                  </div>
                  <p className="text-xs text-muted-foreground">Products below 4.0 rating see 40% lower add-to-cart. Review count acts as social proof on the search tile.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Master Content Heatmap */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Content Health Heatmap</h3>
            <p className="text-xs text-muted-foreground mb-4">Comprehensive scoring across all search page factors</p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SKU</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Retailer</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Title</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Keywords</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Hero Image</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Rating</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Search Rank</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {contentHealthScores.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-sm text-muted-foreground">{item.sku}</td>
                      <td className="p-3 text-sm text-foreground font-medium">{item.retailer}</td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.titleScore)}`}>{item.titleScore}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.keywordScore)}`}>{item.keywordScore}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.heroScore)}`}>{item.heroScore}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.ratingScore)}`}>{item.avgRating}</span>
                      </td>
                      <td className="p-3 text-center">
                        <span className={`text-sm font-bold ${item.searchRank <= 5 ? 'text-success' : item.searchRank <= 10 ? 'text-warning' : 'text-destructive'}`}>
                          #{item.searchRank}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button className="px-3 py-1.5 rounded-md gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-card">
                          Optimize
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'title' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Title Optimisation Engine</h3>
            <p className="text-xs text-muted-foreground mb-4">Analyse title length, keyword density, and search relevance for each SKU</p>
            <div className="space-y-4">
              {Object.entries(productTitles).map(([sku, titles]) => {
                const isExpanded = expandedSku === sku;
                const skuData = contentHealthScores.find(c => c.sku === sku);
                return (
                  <div key={sku} className="border border-border rounded-lg overflow-hidden">
                    <div
                      className="flex items-center justify-between p-4 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedSku(isExpanded ? null : sku)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">{sku}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getScoreColor(skuData?.titleScore || 0)}`}>
                          Title: {skuData?.titleScore}/100
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <div className="p-4 space-y-4 animate-fade-in">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">Current Title</p>
                          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                            <p className="text-sm text-foreground font-mono">{titles.current}</p>
                            <div className="flex items-center gap-2 mt-2">
                              <div className="flex-1 h-1.5 bg-muted rounded-full">
                                <div className={`h-1.5 rounded-full ${getScoreBg(skuData?.titleScore || 0)}`} style={{ width: `${((skuData?.titleLength || 0) / (skuData?.maxLength || 80)) * 100}%` }}></div>
                              </div>
                              <span className="text-[10px] text-muted-foreground">{skuData?.titleLength}/{skuData?.maxLength} chars</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider mb-1">AI-Optimized Title</p>
                          <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                            <p className="text-sm text-foreground font-mono">{titles.optimized}</p>
                            <p className="text-[10px] text-success font-bold mt-2">+4 high-volume keywords added • Better for search truncation</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 gradient-primary text-primary-foreground rounded-lg text-xs font-bold shadow-card hover:opacity-90 transition-opacity">
                            Apply Optimized Title
                          </button>
                          <button className="px-4 py-2 border border-border text-foreground rounded-lg text-xs font-bold hover:bg-muted transition-colors">
                            Edit Manually
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Keyword Gap */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Missing High-Volume Keywords</h3>
              <p className="text-xs text-muted-foreground mb-4">Keywords competitors use that you're missing</p>
              <div className="space-y-4">
                {[
                  { sku: 'SKU-101', missing: ['Sugar Free', 'Electrolytes', 'Gym Drink', 'Pre Workout'], volume: 'High', monthlySearches: '45K' },
                  { sku: 'SKU-205', missing: ['Keto Friendly', 'Vegan', 'Coconut Water', 'Zero Sugar'], volume: 'High', monthlySearches: '32K' },
                  { sku: 'SKU-404', missing: ['20g Protein', 'Whey', 'Low Sugar', 'Gym Snack'], volume: 'Medium', monthlySearches: '18K' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-sm text-foreground">{item.sku}</span>
                      <span className="text-xs text-muted-foreground">{item.monthlySearches} monthly searches</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {item.missing.map((kw, i) => (
                        <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold rounded-full border border-destructive/20">
                          + {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Title Truncation Preview</h3>
              <p className="text-xs text-muted-foreground mb-4">How your title appears on different platforms</p>
              <div className="space-y-4">
                {[
                  { platform: "Amazon App", chars: 65, bg: "bg-warning/5" },
                  { platform: "Blinkit Search", chars: 40, bg: "bg-destructive/5" },
                  { platform: "Flipkart App", chars: 55, bg: "bg-info/5" },
                  { platform: "Zepto Search", chars: 35, bg: "bg-destructive/5" },
                ].map((platform, idx) => (
                  <div key={idx} className={`p-3 ${platform.bg} border border-border rounded-lg`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foreground">{platform.platform}</span>
                      <span className="text-[10px] text-muted-foreground">Shows first {platform.chars} chars</span>
                    </div>
                    <p className="text-xs text-foreground font-mono">
                      {productTitles["SKU-101"].current.substring(0, platform.chars)}
                      {productTitles["SKU-101"].current.length > platform.chars && <span className="text-muted-foreground">...</span>}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hero' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Hero Image Audit</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Hero image is the #1 factor for add-to-cart on search results — especially on mobile qcom apps
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {heroImageAudit.map((item, idx) => (
                <div key={idx} className={`border rounded-xl p-5 ${item.score >= 80 ? 'border-success/30 bg-success/5' : item.score >= 60 ? 'border-warning/30 bg-warning/5' : 'border-destructive/30 bg-destructive/5'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground text-sm">{item.sku} — {item.name}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(item.score)}`}>
                      {item.score}/100
                    </span>
                  </div>

                  {/* Image Checklist */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: "Infographic", has: item.hasInfoGraphic },
                      { label: "Badge/Trust", has: item.hasBadge },
                      { label: "Lifestyle", has: item.hasLifestyle },
                    ].map((check, i) => (
                      <div key={i} className={`text-center p-2 rounded-lg border ${check.has ? 'bg-success/10 border-success/20' : 'bg-destructive/10 border-destructive/20'}`}>
                        <span className="text-lg">{check.has ? '✓' : '✗'}</span>
                        <p className={`text-[10px] font-bold ${check.has ? 'text-success' : 'text-destructive'}`}>{check.label}</p>
                      </div>
                    ))}
                  </div>

                  {item.issues.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Issues</p>
                      {item.issues.map((issue, i) => (
                        <p key={i} className="text-xs text-destructive flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-destructive"></span>
                          {issue}
                        </p>
                      ))}
                    </div>
                  )}

                  <button className="mt-3 w-full py-2 text-xs font-bold border border-primary text-primary hover:bg-primary hover:text-primary-foreground rounded-lg transition-colors">
                    View & Fix Hero Image
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ratings' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Ratings & Review Intelligence</h3>
            <p className="text-xs text-muted-foreground mb-4">
              Products below 4.0 rating see 40% lower conversion on search page. Monitor and recover ratings proactively.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-border bg-muted/50">
                  <tr>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Product</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Rating</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Reviews</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Trend</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Sentiment</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Top Issue</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Response Rate</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {ratingAnalysis.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <p className="text-sm font-bold text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {renderStars(item.rating)}
                        </div>
                        <span className={`text-sm font-bold ${item.rating >= 4.0 ? 'text-success' : item.rating >= 3.5 ? 'text-warning' : 'text-destructive'}`}>
                          {item.rating}
                        </span>
                      </td>
                      <td className="p-3 text-center text-sm font-bold text-foreground">{item.reviews.toLocaleString()}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-bold ${item.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                          {item.trend >= 0 ? '↑' : '↓'} {Math.abs(item.trend)}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="w-full bg-muted h-2 rounded-full mx-auto max-w-[60px]">
                          <div className={`h-2 rounded-full ${item.sentiment >= 80 ? 'bg-success' : item.sentiment >= 60 ? 'bg-warning' : 'bg-destructive'}`} style={{ width: `${item.sentiment}%` }}></div>
                        </div>
                        <span className="text-[10px] text-muted-foreground">{item.sentiment}%</span>
                      </td>
                      <td className="p-3 text-xs text-destructive font-medium max-w-[150px]">{item.topIssue}</td>
                      <td className="p-3 text-center">
                        <span className={`text-xs font-bold ${item.responseRate >= 70 ? 'text-success' : item.responseRate >= 40 ? 'text-warning' : 'text-destructive'}`}>
                          {item.responseRate}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        {item.rating < 4.0 ? (
                          <button className="px-3 py-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-md hover:bg-destructive/90 transition-colors shadow-card">
                            Recover
                          </button>
                        ) : (
                          <button className="px-3 py-1.5 border border-border text-foreground text-xs font-bold rounded-md hover:bg-muted transition-colors">
                            Monitor
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sentiment Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Review Sentiment by Category</h3>
              <p className="text-xs text-muted-foreground mb-4">What customers love vs complain about</p>
              <div className="space-y-4">
                {ratingAnalysis.map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="font-bold text-sm text-foreground mb-2">{item.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-success/5 border border-success/20 rounded-lg">
                        <p className="text-[10px] text-success uppercase font-bold">Top Praise</p>
                        <p className="text-xs text-foreground">{item.topPraise}</p>
                      </div>
                      <div className="p-2 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-[10px] text-destructive uppercase font-bold">Top Issue</p>
                        <p className="text-xs text-foreground">{item.topIssue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Rating Impact on Conversion</h3>
              <p className="text-xs text-muted-foreground mb-4">How ratings affect add-to-cart rate on search page</p>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={[
                  { range: "< 3.0", convRate: 8, color: "hsl(0, 72%, 51%)" },
                  { range: "3.0-3.5", convRate: 15, color: "hsl(0, 72%, 51%)" },
                  { range: "3.5-4.0", convRate: 28, color: "hsl(38, 92%, 50%)" },
                  { range: "4.0-4.5", convRate: 42, color: "hsl(142, 71%, 45%)" },
                  { range: "4.5+", convRate: 58, color: "hsl(142, 71%, 45%)" },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(260, 10%, 50%)" label={{ value: "Rating", position: "bottom", fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" label={{ value: "Add-to-Cart %", angle: -90, position: "insideLeft", fontSize: 11 }} />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Bar dataKey="convRate" name="Conversion Rate %" fill="hsl(270, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'search' && (
        <div className="space-y-4 animate-fade-in">
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Search Page Simulator</h3>
            <p className="text-xs text-muted-foreground mb-4">Preview how your products appear on search results — the moment of decision for the customer</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {searchPageSimulation.map((item, idx) => (
                <div key={idx} className="border border-border rounded-xl overflow-hidden bg-card hover:shadow-card-md transition-shadow">
                  {/* Simulated search result card */}
                  <div className="h-48 bg-muted/50 flex items-center justify-center relative border-b border-border">
                    <div className="text-4xl opacity-20">📦</div>
                    {item.badge && (
                      <span className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded">
                        {item.badge}
                      </span>
                    )}
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${getScoreColor(item.titleScore)}`}>T:{item.titleScore}</span>
                      <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${getScoreColor(item.imageScore)}`}>I:{item.imageScore}</span>
                    </div>
                  </div>
                  <div className="p-3 space-y-2">
                    <p className="text-sm text-foreground font-medium leading-tight line-clamp-2">{item.title}</p>
                    <div className="flex items-center gap-1.5">
                      {renderStars(item.rating)}
                      <span className="text-xs text-muted-foreground">({item.reviews})</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">{item.price}</span>
                      <button className="px-3 py-1.5 gradient-primary text-primary-foreground text-xs font-bold rounded-lg shadow-card">
                        Add to Cart
                      </button>
                    </div>
                  </div>
                  {/* Score analysis */}
                  <div className="px-3 pb-3 space-y-1">
                    <div className="h-px bg-border"></div>
                    {item.titleScore < 80 && (
                      <p className="text-[10px] text-destructive flex items-center gap-1">
                        <span className="w-1 h-1 bg-destructive rounded-full"></span>
                        Title needs keyword optimization
                      </p>
                    )}
                    {item.imageScore < 80 && (
                      <p className="text-[10px] text-warning flex items-center gap-1">
                        <span className="w-1 h-1 bg-warning rounded-full"></span>
                        Hero image needs improvement
                      </p>
                    )}
                    {item.titleScore >= 80 && item.imageScore >= 80 && (
                      <p className="text-[10px] text-success flex items-center gap-1">
                        <span className="w-1 h-1 bg-success rounded-full"></span>
                        Optimized for search visibility
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAuditSection;
