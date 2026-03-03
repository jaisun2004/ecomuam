import { useState } from "react";

const contentHealthScores = [
  { sku: "SKU-101", retailer: "Amazon", titleScore: 85 },
  { sku: "SKU-101", retailer: "Flipkart", titleScore: 72 },
  { sku: "SKU-205", retailer: "Amazon", titleScore: 45 },
  { sku: "SKU-205", retailer: "Blinkit", titleScore: 68 },
  { sku: "SKU-300", retailer: "Amazon", titleScore: 90 },
  { sku: "SKU-300", retailer: "Flipkart", titleScore: 55 },
];

const productTitles: Record<string, string> = {
  "SKU-101": "ZapDrink Energy Boost 250ml Can - Sugar Free Caffeine Drink",
  "SKU-205": "HydraMax Electrolyte Water 500ml",
  "SKU-300": "PureLeaf Green Tea Natural Detox 330ml Bottle",
};

const getScoreColor = (score: number) => {
  if (score < 50) return 'bg-destructive/10 text-destructive';
  if (score < 80) return 'bg-warning/10 text-warning';
  return 'bg-success/10 text-success';
};

const ContentAuditSection = () => {
  const [expandedSku, setExpandedSku] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-heading font-bold text-foreground">Content Audit & Optimisation</h1>
        <p className="text-muted-foreground text-sm mt-1">Audit product listings, identify content gaps, and optimize for conversion</p>
      </div>

      {/* Score Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Content Score", value: "72", sub: "Good", color: "text-success", pct: 72 },
          { label: "SEO Health (Keywords)", value: "64/100", sub: "Missing high-volume terms", color: "text-warning", pct: 64 },
          { label: "Hero Images", value: "88/100", sub: "25% weight", color: "text-success", pct: 88 },
          { label: "Description Quality", value: "92/100", sub: "10% weight", color: "text-info", pct: 92 },
        ].map((item, idx) => (
          <div key={idx} className="rounded-xl border bg-card shadow-card p-5">
            <h3 className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{item.label}</h3>
            <div className="flex items-end mt-2 gap-2">
              <span className={`text-3xl font-bold ${item.color}`}>{item.value}</span>
              {item.sub && !item.sub.includes("weight") && (
                <span className={`text-sm ${item.color} mb-1`}>{item.sub}</span>
              )}
            </div>
            {item.sub.includes("weight") && (
              <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
            )}
            <div className="w-full bg-muted h-1.5 rounded-full mt-2">
              <div className={`h-1.5 rounded-full ${
                item.pct >= 80 ? 'bg-success' : item.pct >= 60 ? 'bg-warning' : 'bg-destructive'
              }`} style={{ width: `${item.pct}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Optimisation Heatmap */}
      <div className="rounded-xl border bg-card shadow-card p-5">
        <h3 className="font-heading font-semibold text-foreground mb-1">Content Optimisation Heatmap</h3>
        <p className="text-xs text-muted-foreground mb-4">Which product titles and descriptions need immediate improvement?</p>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">SKU</th>
                <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Retailer</th>
                <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider">Current Title</th>
                <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Title Score</th>
                <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Keyword Score</th>
                <th className="p-3 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {contentHealthScores.map(({ sku, retailer, titleScore }) => {
                const keywordScore = Math.max(30, titleScore - 15);
                return (
                  <tr key={`${sku}-${retailer}`} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-mono text-sm text-muted-foreground">{sku}</td>
                    <td className="p-3 text-sm text-foreground font-medium">{retailer}</td>
                    <td className="p-3 text-muted-foreground text-sm max-w-xs truncate" title={productTitles[sku]}>{productTitles[sku]}</td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(titleScore)}`}>
                        {titleScore}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getScoreColor(keywordScore)}`}>
                        {keywordScore}
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <button className="px-3 py-1.5 rounded-md gradient-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-opacity shadow-card">
                        Optimize
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Keyword Gap + Content Gap */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Keyword Gap Analysis</h3>
          <p className="text-xs text-muted-foreground mb-4">High volume keywords missing from titles</p>
          <div className="space-y-4">
            {[
              { sku: 'SKU-101', missing: ['Sugar Free', 'Electrolytes', 'Gym'], volume: 'High' },
              { sku: 'SKU-205', missing: ['Keto Friendly', 'Vegan'], volume: 'Medium' },
              { sku: 'SKU-300', missing: ['Organic', 'Detox'], volume: 'Medium' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border">
                <div>
                  <p className="font-bold text-sm text-foreground">{item.sku}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {item.missing.map((kw, i) => (
                      <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive text-[10px] font-bold rounded-full border border-destructive/20">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-muted-foreground block">Search Vol</span>
                  <span className={`text-xs font-bold ${item.volume === 'High' ? 'text-destructive' : 'text-warning'}`}>
                    {item.volume}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card shadow-card p-5">
          <h3 className="font-heading font-semibold text-foreground mb-1">Content Gap Leaderboard</h3>
          <p className="text-xs text-muted-foreground mb-4">Revenue at risk due to poor content</p>
          <div className="space-y-3">
            {[
              { sku: 'SKU-205', gap: 'Missing Video', risk: '₹12L', urgency: 'high' },
              { sku: 'SKU-300', gap: 'Short Description', risk: '₹8L', urgency: 'medium' },
              { sku: 'SKU-101', gap: 'Low Res Hero Image', risk: '₹5L', urgency: 'medium' },
            ].map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-card rounded-lg border-l-4 border-l-destructive shadow-card border border-border">
                <div>
                  <p className="font-bold text-sm text-foreground">{item.sku}</p>
                  <p className="text-xs text-muted-foreground">{item.gap}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-destructive">{item.risk}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">Revenue Risk</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentAuditSection;
