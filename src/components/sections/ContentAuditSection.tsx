import { useState } from "react";
import CampaignTriggerPanel, { CampaignTrigger } from "@/components/CampaignTriggerPanel";
import KPICard from "@/components/KPICard";
import DeepDiveToggle from "@/components/DeepDiveToggle";
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
  { sku: "SKU-404", name: "FitCrunch Protein Bar 60g", retailer: "Amazon", titleScore: 78, titleLength: 55, maxLength: 80, heroScore: 82, ratingScore: 58, avgRating: 3.4, reviewCount: 89, keywordScore: 65, searchRank: 9 },
];

const productTitles: Record<string, { current: string; optimized: string }> = {
  "SKU-101": { current: "ZapDrink Energy Boost 250ml Can - Sugar Free Caffeine Drink", optimized: "ZapDrink Energy Boost 250ml Can | Sugar Free | Electrolytes | Pre-Workout Gym Drink | Zero Calories" },
  "SKU-205": { current: "HydraMax Electrolyte Water 500ml", optimized: "HydraMax Electrolyte Water 500ml | Keto Friendly | Vegan | Zero Sugar | Coconut Water + Minerals" },
  "SKU-404": { current: "FitCrunch Protein Bar 60g", optimized: "FitCrunch Protein Bar 60g | 20g Protein | Low Sugar | Gym Snack | Whey Protein | Chocolate Flavour" },
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
  { sku: "SKU-101", name: "ZapDrink Energy Boost", issues: ["Low contrast on mobile"], score: 72, hasInfoGraphic: true, hasBadge: true, hasLifestyle: false },
  { sku: "SKU-205", name: "HydraMax Electrolyte", issues: ["White background too plain", "No USP callout", "Small product"], score: 40, hasInfoGraphic: false, hasBadge: false, hasLifestyle: false },
  { sku: "SKU-300", name: "PureLeaf Green Tea", issues: [], score: 95, hasInfoGraphic: true, hasBadge: true, hasLifestyle: true },
  { sku: "SKU-404", name: "FitCrunch Protein Bar", issues: ["No nutritional callout"], score: 68, hasInfoGraphic: true, hasBadge: false, hasLifestyle: true },
];

const ratingAnalysis = [
  { sku: "SKU-101", name: "ZapDrink Energy", rating: 4.3, reviews: 1245, trend: 0.1, sentiment: 82, topIssue: "Taste complaints (12%)", topPraise: "Energy boost (45%)", responseRate: 78 },
  { sku: "SKU-205", name: "HydraMax Electrolyte", rating: 3.6, reviews: 234, trend: -0.2, sentiment: 58, topIssue: "Packaging leaks (22%)", topPraise: "Refreshing (38%)", responseRate: 45 },
  { sku: "SKU-300", name: "PureLeaf Green Tea", rating: 4.5, reviews: 3200, trend: 0.05, sentiment: 91, topIssue: "Price (8%)", topPraise: "Natural taste (52%)", responseRate: 92 },
  { sku: "SKU-404", name: "FitCrunch Protein Bar", rating: 3.4, reviews: 89, trend: -0.3, sentiment: 48, topIssue: "Too sweet (28%)", topPraise: "Protein content (35%)", responseRate: 22 },
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
    <Star key={i} className={`h-3 w-3 ${i < Math.floor(rating) ? 'text-warning fill-warning' : 'text-muted-foreground/30'}`} />
  ));
};

const campaignTriggers: CampaignTrigger[] = [
  {
    id: "content-1", signal: "SKU-205 title underperforming vs category",
    signalDetail: "Title score 45/100 — missing 4 high-volume keywords. Add-to-cart rate 35% below avg",
    strategy: "Sponsored Ads to compensate weak organic", campaignType: "Sponsored Product + Headline Search",
    platforms: ["Amazon", "Flipkart"],
    keywords: ["electrolyte water", "keto drink", "sports hydration", "coconut water"],
    estimatedImpact: "Maintain visibility while title is optimized — protect ₹2.1L/week", urgency: "critical",
    icon: <Target className="h-4 w-4 text-destructive" />,
  },
  {
    id: "content-2", signal: "SKU-404 rating dropped below 3.5",
    signalDetail: "Rating fell from 3.7 to 3.4 — 'too sweet' complaints rising",
    strategy: "Review Recovery + Brand Defense", campaignType: "Post-purchase email + Review request",
    platforms: ["Amazon", "Flipkart", "BigBasket"],
    keywords: ["protein bar", "healthy snack", "gym protein bar"],
    estimatedImpact: "Target 4.0 rating in 30 days — unlock 18% higher conversion", urgency: "high",
    icon: <Shield className="h-4 w-4 text-warning" />,
  },
];

const ContentAuditSection = () => {
  const [deepDive, setDeepDive] = useState(false);
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-foreground">Content Audit & SEO</h1>
          <p className="text-muted-foreground text-sm mt-1">Optimize titles, hero images, and ratings for search page visibility</p>
        </div>
        <DeepDiveToggle isDeepDive={deepDive} onToggle={() => setDeepDive(!deepDive)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <KPICard title="Search Page Score" value="68/100" change={-5} changeLabel="vs last month" icon={<Search className="h-5 w-5" />} variant="warning" />
        <KPICard title="Title Score" value="69/100" change={3} changeLabel="across all SKUs" icon={<FileText className="h-5 w-5" />} variant="warning" />
        <KPICard title="Hero Image Score" value="72/100" change={-2} changeLabel="mobile optimized" icon={<Image className="h-5 w-5" />} variant="warning" />
        <KPICard title="Avg Rating" value="3.95" change={-0.1} changeLabel="across platforms" icon={<Star className="h-5 w-5" />} variant="destructive" />
        <KPICard title="Reviews" value="5,568" change={12} changeLabel="total reviews" icon={<BarChart3 className="h-5 w-5" />} variant="success" />
      </div>

      {!deepDive ? (
        <>
          <CampaignTriggerPanel triggers={campaignTriggers} title="Content-Based Campaign Triggers" />

          {/* Content Health Heatmap */}
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
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Hero</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Rating</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Rank</th>
                    <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {contentHealthScores.map((item, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-mono text-sm text-muted-foreground">{item.sku}</td>
                      <td className="p-3 text-sm text-foreground font-medium">{item.retailer}</td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.titleScore)}`}>{item.titleScore}</span></td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.keywordScore)}`}>{item.keywordScore}</span></td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.heroScore)}`}>{item.heroScore}</span></td>
                      <td className="p-3 text-center"><span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(item.ratingScore)}`}>{item.avgRating}</span></td>
                      <td className="p-3 text-center">
                        <span className={`text-sm font-bold ${item.searchRank <= 5 ? 'text-success' : item.searchRank <= 10 ? 'text-warning' : 'text-destructive'}`}>#{item.searchRank}</span>
                      </td>
                      <td className="p-3 text-center">
                        <button className="px-3 py-1.5 rounded-md gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-card">Optimize</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Ratings at a glance */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Ratings Intelligence</h3>
            <p className="text-xs text-muted-foreground mb-4">Products below 4.0 see 40% lower conversion</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {ratingAnalysis.map((item, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${item.rating < 4.0 ? 'border-destructive/30 bg-destructive/5' : 'border-success/20 bg-success/5'}`}>
                  <p className="font-bold text-sm text-foreground">{item.name}</p>
                  <div className="flex items-center gap-1 my-2">{renderStars(item.rating)}</div>
                  <p className={`text-2xl font-bold ${item.rating >= 4.0 ? 'text-success' : 'text-destructive'}`}>{item.rating}</p>
                  <p className="text-[10px] text-muted-foreground">{item.reviews.toLocaleString()} reviews</p>
                  <p className={`text-xs font-bold mt-1 ${item.trend >= 0 ? 'text-success' : 'text-destructive'}`}>
                    {item.trend >= 0 ? '↑' : '↓'} {Math.abs(item.trend)} trend
                  </p>
                  {item.rating < 4.0 && (
                    <button className="mt-2 w-full py-1.5 bg-destructive text-destructive-foreground text-xs font-bold rounded-md hover:bg-destructive/90">Recover</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Deep Dive: Radar + Title Optimization + Hero Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Search Page Factor Analysis</h3>
              <p className="text-xs text-muted-foreground mb-4">Your listing vs top seller</p>
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
              <h3 className="font-heading font-semibold text-foreground mb-1">Rating Impact on Conversion</h3>
              <p className="text-xs text-muted-foreground mb-4">How ratings affect add-to-cart on search page</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={[
                  { range: "< 3.0", convRate: 8 },
                  { range: "3.0-3.5", convRate: 15 },
                  { range: "3.5-4.0", convRate: 28 },
                  { range: "4.0-4.5", convRate: 42 },
                  { range: "4.5+", convRate: 58 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(260, 15%, 90%)" />
                  <XAxis dataKey="range" tick={{ fontSize: 11 }} stroke="hsl(260, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 12 }} stroke="hsl(260, 10%, 50%)" />
                  <Tooltip contentStyle={{ borderRadius: 10, fontSize: 13 }} />
                  <Bar dataKey="convRate" name="Conversion Rate %" fill="hsl(270, 70%, 50%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Title Optimization Engine */}
          <div className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="font-heading font-semibold text-foreground mb-1">Title Optimisation Engine</h3>
            <p className="text-xs text-muted-foreground mb-4">Analyse title length, keyword density, and search relevance</p>
            <div className="space-y-3">
              {Object.entries(productTitles).map(([sku, titles]) => {
                const isExpanded = expandedSku === sku;
                const skuData = contentHealthScores.find(c => c.sku === sku);
                return (
                  <div key={sku} className="border border-border rounded-lg overflow-hidden">
                    <div className="flex items-center justify-between p-3 bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => setExpandedSku(isExpanded ? null : sku)}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-foreground">{sku}</span>
                        <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${getScoreColor(skuData?.titleScore || 0)}`}>
                          Title: {skuData?.titleScore}/100
                        </span>
                      </div>
                      <span className="text-muted-foreground text-xs">{isExpanded ? '▲' : '▼'}</span>
                    </div>
                    {isExpanded && (
                      <div className="p-4 space-y-3 animate-fade-in">
                        <div>
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Current Title</p>
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
                          <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">AI-Optimized Title</p>
                          <div className="p-3 bg-success/5 border border-success/20 rounded-lg">
                            <p className="text-sm text-foreground font-mono">{titles.optimized}</p>
                            <p className="text-[10px] text-success font-bold mt-2">+4 high-volume keywords • Better for search truncation</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 gradient-primary text-primary-foreground rounded-lg text-xs font-bold shadow-card hover:opacity-90">Apply Optimized Title</button>
                          <button className="px-4 py-2 border border-border text-foreground rounded-lg text-xs font-bold hover:bg-muted">Edit Manually</button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hero Image + Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Hero Image Audit</h3>
              <p className="text-xs text-muted-foreground mb-4">Hero image is #1 factor for add-to-cart on mobile search</p>
              <div className="space-y-3">
                {heroImageAudit.map((item, idx) => (
                  <div key={idx} className={`p-3 rounded-lg border flex items-center justify-between ${item.score >= 80 ? 'border-success/30 bg-success/5' : item.score >= 60 ? 'border-warning/30 bg-warning/5' : 'border-destructive/30 bg-destructive/5'}`}>
                    <div>
                      <p className="font-bold text-sm text-foreground">{item.sku} — {item.name}</p>
                      <div className="flex gap-2 mt-1">
                        {[{ label: "Info", has: item.hasInfoGraphic }, { label: "Badge", has: item.hasBadge }, { label: "Lifestyle", has: item.hasLifestyle }].map((c, i) => (
                          <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${c.has ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                            {c.has ? '✓' : '✗'} {c.label}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(item.score)}`}>{item.score}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border bg-card shadow-card p-5">
              <h3 className="font-heading font-semibold text-foreground mb-1">Review Sentiment</h3>
              <p className="text-xs text-muted-foreground mb-4">What customers love vs complain about</p>
              <div className="space-y-3">
                {ratingAnalysis.map((item, idx) => (
                  <div key={idx} className="p-3 bg-muted/30 rounded-lg border border-border">
                    <p className="font-bold text-sm text-foreground mb-1.5">{item.name}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 bg-success/5 border border-success/20 rounded-lg">
                        <p className="text-[10px] text-success uppercase font-bold">Praise</p>
                        <p className="text-xs text-foreground">{item.topPraise}</p>
                      </div>
                      <div className="p-2 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <p className="text-[10px] text-destructive uppercase font-bold">Issue</p>
                        <p className="text-xs text-foreground">{item.topIssue}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContentAuditSection;
