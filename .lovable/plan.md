

# Screen-wise API List & Backend Schema

**Scope**: 27 screens · ~120 API endpoints · ~60 database tables

---

## Shared Reference Tables

```sql
CREATE TABLE skus (id VARCHAR(50) PRIMARY KEY, name VARCHAR(200), category VARCHAR(100), brand VARCHAR(100));
CREATE TABLE platforms (id VARCHAR(50) PRIMARY KEY, name VARCHAR(100), color VARCHAR(10), type VARCHAR(20));
CREATE TABLE competitors (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), name VARCHAR(100), color VARCHAR(10));
```

---

## 1. Central Cockpit

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/cockpit/kpis` | Brand SoV, Content Score, ROAS, Availability |
| GET | `/api/cockpit/urgent-issues` | T1/T2/T3 tiered issues with source linking |
| GET | `/api/cockpit/engagement` | Impressions, Clicks, CTR, Orders, AOV, Conversion Rate |
| GET | `/api/cockpit/potential-flags` | Near-threshold warnings |
| GET | `/api/cockpit/system-status` | Health status per module |

```sql
CREATE TABLE cockpit_kpi_snapshots (id UUID PK, brand_sov DECIMAL, content_score INT, roas DECIMAL, availability DECIMAL, snapshot_at TIMESTAMPTZ);
CREATE TABLE cockpit_issues (id UUID PK, tier VARCHAR(2), description TEXT, source_module VARCHAR(50), source_id VARCHAR(50), target_anchor VARCHAR(100), confidence INT, resolved BOOLEAN, created_at TIMESTAMPTZ);
CREATE TABLE cockpit_engagement (id UUID PK, impressions BIGINT, clicks INT, ctr DECIMAL, orders INT, aov DECIMAL, conversion_rate DECIMAL, recorded_at TIMESTAMPTZ);
```

---

## 2. Dashboard (Section Grid)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/kpis` | in_stock_rate, price_competitiveness, market_share, content_score |
| GET | `/api/dashboard/modules` | Module summaries with alert_count, change_pct |
| GET | `/api/dashboard/anomalies` | Real-time anomaly feed with investigation data |
| POST | `/api/campaigns/launch` | Launch reactive campaign from anomaly |

```sql
CREATE TABLE dashboard_kpi_snapshots (id UUID PK, in_stock_rate DECIMAL, price_competitiveness DECIMAL, market_share DECIMAL, content_score INT, snapshot_at TIMESTAMPTZ);
CREATE TABLE module_summaries (id VARCHAR(50) PK, label VARCHAR(100), kpi VARCHAR(20), change_pct DECIMAL, alert_count INT, status VARCHAR(20), summary TEXT);
CREATE TABLE anomaly_alerts (id UUID PK, type VARCHAR(50), title TEXT, detail TEXT, severity VARCHAR(20), platform VARCHAR(50), resolved BOOLEAN, created_at TIMESTAMPTZ);
```

---

## 3. Availability

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/availability/score-trend` | 30-day availability score trend |
| GET | `/api/availability/oos-products` | Currently out-of-stock products |
| GET | `/api/availability/platform-sku-matrix` | Combined platform × SKU availability (Own) |
| GET | `/api/availability/stock-forecast` | Days-to-OOS prediction per SKU |
| GET | `/api/availability/darkstore-gaps?city={city}` | Dark store listing gaps by city |
| GET | `/api/availability/competition` | Competition availability vs yours |
| POST | `/api/availability/target-competition` | Trigger campaign targeting competitor products |

```sql
CREATE TABLE availability_snapshots (id UUID PK, sku_id VARCHAR(50), platform VARCHAR(50), availability_pct DECIMAL, recorded_at TIMESTAMPTZ);
CREATE TABLE oos_events (id UUID PK, sku_id VARCHAR(50), platform VARCHAR(50), started_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ);
CREATE TABLE stock_forecasts (id UUID PK, sku_id VARCHAR(50), platform VARCHAR(50), current_stock INT, days_to_oos DECIMAL, trend VARCHAR(20));
CREATE TABLE darkstore_gaps (id UUID PK, city VARCHAR(100), total_darkstores INT, sku_id VARCHAR(50), listed INT, unlisted INT, coverage_pct DECIMAL, campaigns_running BOOLEAN, wasting_budget BOOLEAN);
CREATE TABLE competition_availability (id UUID PK, competitor VARCHAR(100), platform VARCHAR(50), competitor_avail DECIMAL, your_avail DECIMAL, top_product VARCHAR(200), trend VARCHAR(20));
```

---

## 4. Pricing

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/pricing/alerts` | Price parity alerts with severity |
| GET | `/api/pricing/platform-index` | Platform price index with view-through |
| GET | `/api/pricing/competitor-matrix?skuGroup={}&platform={}` | Filtered competitor intelligence matrix |
| GET | `/api/pricing/history?sku={}&platform={}` | 30-day price history (SKU/platform toggle) |
| GET | `/api/pricing/price-advantage` | SKUs where you're lower — keyword attack opportunities |
| GET | `/api/pricing/analytics/trend?sku={}` | Price index trend for analytics |
| POST | `/api/pricing/alert-team` | Alert team for non-parity prices |
| POST | `/api/pricing/attack-keywords` | Trigger keyword campaign for price advantage |

```sql
CREATE TABLE price_snapshots (id UUID PK, sku_id VARCHAR(50), platform VARCHAR(50), your_price DECIMAL, recorded_at TIMESTAMPTZ);
CREATE TABLE competitor_prices (id UUID PK, sku_id VARCHAR(50), competitor VARCHAR(100), platform VARCHAR(50), price DECIMAL, recorded_at TIMESTAMPTZ);
CREATE TABLE price_alerts (id UUID PK, sku_id VARCHAR(50), competitor VARCHAR(100), platform VARCHAR(50), your_price DECIMAL, comp_price DECIMAL, gap_pct DECIMAL, impact TEXT, severity VARCHAR(20));
CREATE TABLE platform_price_index (id UUID PK, platform VARCHAR(50), avg_your_price DECIMAL, avg_comp_price DECIMAL, index_score DECIMAL, parity BOOLEAN);
```

---

## 5. Keyword Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/keywords/rankings?platform={}` | Keyword rankings: sponsored, organic, competitor, SoS |
| GET | `/api/keywords/rank-trend` | 30-day rank trend per keyword |
| GET | `/api/keywords/campaign-performance` | Keyword-level campaign metrics |
| GET | `/api/keywords/campaign-impact` | Keyword-campaign overlap & recommendations |
| GET | `/api/keywords/losing` | Keywords losing rank/share with competitor attribution |
| GET | `/api/keywords/analytics/search-volume` | Search volume and SoS % |
| POST | `/api/keywords/defend` | Launch defensive campaign |

```sql
CREATE TABLE keyword_rankings (id UUID PK, keyword VARCHAR(200), platform VARCHAR(50), sponsored_rank INT, organic_rank INT, top_competitor VARCHAR(100), competitor_rank INT, search_volume VARCHAR(20), share_of_search DECIMAL, trend VARCHAR(10), can_reduce_spend BOOLEAN);
CREATE TABLE keyword_rank_history (id UUID PK, keyword VARCHAR(200), platform VARCHAR(50), rank INT, rank_type VARCHAR(20), recorded_at TIMESTAMPTZ);
CREATE TABLE keyword_losing (id UUID PK, keyword VARCHAR(200), your_product VARCHAR(200), last_week_rank INT, this_week_rank INT, sos_loss VARCHAR(10), competitor_product VARCHAR(200), competitor_rank_change VARCHAR(20), reason TEXT);
```

---

## 6. Content Quality Score

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/content/sku-scores` | Per-SKU scores (5 dimensions) + impression change 14d |
| GET | `/api/content/competitor-scores` | Competitor content scores per SKU |
| GET | `/api/content/sku-detail/{skuId}` | Detailed audit checks per dimension |
| GET | `/api/content/last-audit` | Last audit metadata + download URL |
| POST | `/api/content/generate-audit` | Trigger new AI-generated audit |
| POST | `/api/content/alert-stakeholder` | Send alert with AI recommendations |
| POST | `/api/content/generate-recommendation/{skuId}/{dim}` | AI content recommendation |

```sql
CREATE TABLE content_scores (id UUID PK, sku_id VARCHAR(50), platform VARCHAR(50), title_score INT, hero_image_score INT, search_listing_score INT, page_content_score INT, competitor_aggression_score INT, impression_change_14d DECIMAL, last_updated TIMESTAMPTZ);
CREATE TABLE content_audits (id UUID PK, generated_at TIMESTAMPTZ, report_url TEXT, generated_by VARCHAR(50));
CREATE TABLE content_audit_checks (id UUID PK, audit_id UUID FK, sku_id VARCHAR(50), dimension VARCHAR(50), check_label TEXT, pass BOOLEAN, potential_points INT);
CREATE TABLE content_alerts (id UUID PK, sku_id VARCHAR(50), dimension VARCHAR(50), recommendation TEXT, stakeholder_email VARCHAR(200), sent_at TIMESTAMPTZ);
```

---

## 7. Share of Shelf

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/shelf/heatmap` | SKU × Platform availability heatmap |
| GET | `/api/shelf/search-data?platform={}` | Share of search per keyword |
| GET | `/api/shelf/rank-data?platform={}` | Position & rank by keyword |
| GET | `/api/shelf/competitor-matrix?platform={}` | Competitor shelf share |

```sql
CREATE TABLE shelf_snapshots (id UUID PK, sku_id VARCHAR(50), platform VARCHAR(50), keyword VARCHAR(200), share_of_search DECIMAL, position INT, competitor VARCHAR(100), competitor_share DECIMAL, poaching BOOLEAN);
```

---

## 8. Market Share (Dark Store Map)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/marketshare/darkstores` | Full dark store list with KPIs |
| GET | `/api/marketshare/darkstore/{id}` | Single store detail |
| GET | `/api/marketshare/city-summary` | City-level aggregation |
| GET | `/api/marketshare/platform-summary` | Platform-level aggregation |

```sql
CREATE TABLE dark_stores (id VARCHAR(50) PK, name VARCHAR(200), pincode VARCHAR(10), city VARCHAR(100), platform VARCHAR(50), lat DECIMAL, lng DECIMAL);
CREATE TABLE dark_store_metrics (id UUID PK, dark_store_id VARCHAR(50) FK, market_share DECIMAL, availability DECIMAL, avg_delivery_min INT, orders_per_day INT, revenue VARCHAR(20), top_sku VARCHAR(200), oos_rate DECIMAL, competitor_presence INT, slot_share DECIMAL);
```

---

## 9. Competitor Ads Hub

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/competitor-ads/sov-trend` | 30-day SoV trend |
| GET | `/api/competitor-ads/heatmap` | Hourly ad intensity heatmap |
| GET | `/api/competitor-ads/contested-keywords` | Contested keywords with bid index |
| GET | `/api/competitor-ads/profiles` | Competitor ad profiles |
| GET | `/api/competitor-ads/hourly?keyword={}` | Hourly competitor activity |
| GET | `/api/competitor-ads/spend-trend` | Weekly spend trend |
| GET | `/api/competitor-ads/budget-exhaustion?keyword={}` | Budget exhaustion opportunities |

```sql
CREATE TABLE competitor_ad_profiles (id UUID PK, competitor VARCHAR(100), est_spend VARCHAR(20), platforms TEXT[], top_keywords TEXT[], keyword_count INT, pattern TEXT, budget_exhausted BOOLEAN, sponsored_active BOOLEAN);
CREATE TABLE competitor_sov_snapshots (id UUID PK, competitor VARCHAR(100), sov_pct DECIMAL, platform VARCHAR(50), recorded_at TIMESTAMPTZ);
CREATE TABLE competitor_ad_hourly (id UUID PK, competitor VARCHAR(100), keyword VARCHAR(200), platform VARCHAR(50), hour INT, intensity INT, recorded_at DATE);
CREATE TABLE budget_exhaustion_events (id UUID PK, competitor VARCHAR(100), platform VARCHAR(50), keyword VARCHAR(200), last_seen TIMESTAMPTZ, sponsored_rank_status TEXT, opportunity TEXT);
```

---

## 10. Campaign Manager

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaigns` | List campaigns with status, ROAS, spend |
| GET | `/api/campaigns/{id}` | Campaign detail |
| GET | `/api/campaigns/{id}/report` | Hierarchical: platform → campaign → keyword → city → SKU |
| GET | `/api/campaigns/platform-roas` | Per-platform ROAS |
| GET | `/api/campaigns/budget-allocation` | Budget allocation by platform |
| GET | `/api/campaigns/keyword-performance` | Keyword-level bids, ROAS, impressions |
| GET | `/api/campaigns/copilot-cards` | AI optimization suggestions |
| POST | `/api/campaigns/create` | Create campaign (granularity: sku, city_sku, city for Q-Com) |
| POST | `/api/campaigns/{id}/pause` | Pause campaign |
| POST | `/api/campaigns/{id}/apply-suggestion` | Apply copilot suggestion |

```sql
CREATE TABLE campaigns (id UUID PK, name VARCHAR(200), platform VARCHAR(50), status VARCHAR(20), roas DECIMAL, spend VARCHAR(20), ai_managed BOOLEAN, pause_reason TEXT, granularity VARCHAR(20));
CREATE TABLE campaign_keywords (id UUID PK, campaign_id UUID FK, keyword VARCHAR(200), bid DECIMAL, match_type VARCHAR(20), roas DECIMAL, impressions VARCHAR(20), clicks INT, ctr DECIMAL);
CREATE TABLE campaign_city_breakdown (id UUID PK, campaign_id UUID FK, keyword_id UUID FK, city VARCHAR(100), impressions VARCHAR(20), clicks INT, spend VARCHAR(20), roas DECIMAL);
CREATE TABLE campaign_sku_breakdown (id UUID PK, city_breakdown_id UUID FK, sku_code VARCHAR(50), sku_title VARCHAR(200), spend VARCHAR(20), roas DECIMAL);
CREATE TABLE copilot_suggestions (id UUID PK, impact VARCHAR(20), text TEXT, confidence INT, action_label VARCHAR(50), applied BOOLEAN);
```

---

## 11. Campaign Reports

Shares tables with Campaign Manager. Additional endpoint:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/campaign-reports/hierarchy` | Drill-down: platform → campaign → keyword → city → SKU |
| GET | `/api/campaign-reports/spend-trend` | Daily spend trend chart |
| GET | `/api/campaign-reports/roas-comparison` | Platform ROAS bar chart |

---

## 12. Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/kpis?range={7D\|30D\|90D}` | Availability %, SoS %, Sponsored Rank, Organic Rank, ROAS |
| GET | `/api/reports/platform-performance?range={}` | Spend, returns, margin by platform |
| GET | `/api/reports/scheduled` | List scheduled reports |
| POST | `/api/reports/schedule` | Create scheduled report config |

```sql
CREATE TABLE scheduled_reports (id UUID PK, name VARCHAR(200), frequency VARCHAR(20), day_of_week VARCHAR(20), time_of_day TIME, format VARCHAR(10), recipients TEXT[], status VARCHAR(20));
CREATE TABLE report_snapshots (id UUID PK, time_range VARCHAR(10), availability_pct VARCHAR(20), sos_pct VARCHAR(20), sponsored_rank VARCHAR(20), organic_rank VARCHAR(20), roas VARCHAR(20), recorded_at TIMESTAMPTZ);
```

---

## 13. Alerts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/alerts` | All alerts by severity |
| GET | `/api/alerts/rules` | Alert rules with toggles |
| POST | `/api/alerts/rules` | Create alert rule |
| PUT | `/api/alerts/rules/{id}/toggle` | Toggle rule on/off |
| GET | `/api/alerts/email-config` | Screen-level email config |
| PUT | `/api/alerts/email-config` | Update email config |

```sql
CREATE TABLE alerts (id UUID PK, title TEXT, detail TEXT, severity VARCHAR(20), category VARCHAR(50), action_label VARCHAR(50), created_at TIMESTAMPTZ, resolved_at TIMESTAMPTZ);
CREATE TABLE alert_rules (id UUID PK, name VARCHAR(200), description TEXT, category VARCHAR(50), threshold TEXT, action VARCHAR(50), enabled BOOLEAN, auto_action BOOLEAN);
CREATE TABLE alert_email_config (id UUID PK, screen VARCHAR(100), enabled BOOLEAN, emails TEXT[]);
```

---

## 14. Strategic Planning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/strategic/brand-context` | Brand context card |
| PUT | `/api/strategic/brand-context` | Update from cold start |
| GET | `/api/strategic/observations` | Pre-generated ambient observations |
| GET | `/api/strategic/sku-data` | SKU data for planning |
| POST | `/api/strategic/insights` | Generate plan-breaking & plan-informing insights |
| POST | `/api/strategic/scenarios` | Generate scenario options |
| POST | `/api/strategic/action-plan` | Generate detailed action plan |
| GET | `/api/strategic/recommendations` | AI recommendation queue |
| PUT | `/api/strategic/recommendations/{id}` | Approve/dismiss |

```sql
CREATE TABLE brand_contexts (id UUID PK, posture VARCHAR(50), category_belief TEXT, historical_frustration TEXT, current_hypothesis TEXT, session_reasoning TEXT[]);
CREATE TABLE strategic_observations (id VARCHAR(50) PK, type VARCHAR(50), title TEXT, detail TEXT, rendered BOOLEAN, resolved BOOLEAN);
CREATE TABLE strategic_scenarios (id VARCHAR(50) PK, name VARCHAR(100), description TEXT, blinkit_split VARCHAR(20), zepto_split VARCHAR(20), roas_range VARCHAR(20), risk VARCHAR(20), est_impressions VARCHAR(50));
CREATE TABLE scenario_city_budgets (id UUID PK, scenario_id VARCHAR(50) FK, city VARCHAR(100), blinkit_budget VARCHAR(20), zepto_budget VARCHAR(20));
CREATE TABLE strategic_recommendations (id VARCHAR(50) PK, priority VARCHAR(5), text TEXT, reason TEXT, status VARCHAR(20));
```

---

## 15. Approval Flow

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/approvals` | List plan submissions |
| GET | `/api/approvals/{id}` | Plan detail with campaign breakdown |
| PUT | `/api/approvals/{id}/approve` | Approve and trigger execution |
| PUT | `/api/approvals/{id}/reject` | Reject with reason |
| PUT | `/api/approvals/{id}/escalate` | Escalate for higher approval |

```sql
CREATE TABLE plan_submissions (id VARCHAR(50) PK, scenario_name VARCHAR(100), scenario_type VARCHAR(20), submitted_by VARCHAR(100), submitted_at TIMESTAMPTZ, total_budget VARCHAR(20), blinkit_split VARCHAR(20), zepto_split VARCHAR(20), roas_range VARCHAR(20), est_impressions VARCHAR(50), confidence INT, status VARCHAR(20));
CREATE TABLE plan_campaigns (id UUID PK, plan_id VARCHAR(50) FK, name VARCHAR(200), sku VARCHAR(200), platform VARCHAR(50), campaign_type VARCHAR(50), city VARCHAR(100), day_part VARCHAR(20), day_type VARCHAR(20), budget VARCHAR(20), est_roas VARCHAR(10), est_impressions VARCHAR(20));
CREATE TABLE plan_campaign_keywords (id UUID PK, plan_campaign_id UUID FK, keyword VARCHAR(200), bid VARCHAR(20), match_type VARCHAR(20));
```

---

## 16. Budget Optimiser

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/budget/utilisation` | Utilisation ratio per campaign |
| GET | `/api/budget/waste-analysis` | Efficient/Moderate/Wasted breakdown |
| GET | `/api/budget/same-platform-shifts` | Intra-platform shift recommendations |
| GET | `/api/budget/cross-platform-shifts` | Cross-platform shift recommendations |
| POST | `/api/budget/apply-shift` | Apply shift |

```sql
CREATE TABLE budget_utilisation (id UUID PK, campaign_name VARCHAR(200), utilisation_ratio DECIMAL);
CREATE TABLE budget_shift_recommendations (id UUID PK, shift_type VARCHAR(20), from_platform VARCHAR(50), from_campaign VARCHAR(200), from_roas VARCHAR(10), to_platform VARCHAR(50), to_campaign VARCHAR(200), to_roas VARCHAR(10), amount VARCHAR(20), projected_impact TEXT, confidence INT, applied BOOLEAN);
```

---

## 17. Discovery

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/discovery/search-trends` | 30-day search volume trend |
| GET | `/api/discovery/demand-forecast` | Category demand current vs forecast |
| GET | `/api/discovery/trending-keywords?platform={}&category={}` | Trending keywords with opportunity |
| GET | `/api/discovery/competitor-activity` | Competitor campaign activity |
| POST | `/api/discovery/launch-campaign` | Launch from trending keyword |

```sql
CREATE TABLE search_trends (id UUID PK, date DATE, volume INT, platform VARCHAR(50), category VARCHAR(100));
CREATE TABLE trending_keywords (id UUID PK, keyword VARCHAR(200), search_volume VARCHAR(20), wow_change VARCHAR(10), opportunity VARCHAR(20), platform VARCHAR(50), category VARCHAR(100));
CREATE TABLE demand_forecasts (id UUID PK, category VARCHAR(100), current_index INT, forecast_index INT);
```

---

## 18. Category Whitespace

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/whitespace/opportunities` | Whitespace opportunities |
| GET | `/api/whitespace/subcategory-gaps` | Sub-category gaps |
| POST | `/api/whitespace/launch-campaign` | Launch campaign for opportunity |

```sql
CREATE TABLE whitespace_opportunities (id UUID PK, title VARCHAR(200), description TEXT, tags TEXT[], impact VARCHAR(20));
CREATE TABLE subcategory_gaps (id UUID PK, subcategory VARCHAR(100), gap_description TEXT, platforms TEXT[], search_volume VARCHAR(20), competition VARCHAR(20));
```

---

## 19. Festival Campaigns

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/festivals/comparison` | Historical festival performance |
| GET | `/api/festivals/ramp-up` | Pre-festival spend ramp-up trends |
| GET | `/api/festivals/upcoming` | Upcoming festivals with AI-recommended campaigns |
| POST | `/api/festivals/launch-campaign` | Launch festival campaign |

```sql
CREATE TABLE festival_campaigns (id UUID PK, festival_name VARCHAR(100), date_range VARCHAR(50), days_away INT, recommendation TEXT);
CREATE TABLE festival_campaign_plans (id UUID PK, festival_id UUID FK, campaign_name VARCHAR(200), platform VARCHAR(50), campaign_type VARCHAR(50), budget VARCHAR(20), duration VARCHAR(50), keywords TEXT[], target_roas VARCHAR(10));
CREATE TABLE festival_performance_history (id UUID PK, festival_name VARCHAR(100), spend DECIMAL, roas DECIMAL, conversions INT, year INT);
```

---

## 20. Category Assortment

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/assortment/health` | Sub-category health metrics |
| GET | `/api/assortment/price-bands` | Price band heatmap |
| GET | `/api/assortment/brand-activity` | Brand activity scatter |

```sql
CREATE TABLE subcategory_health (id UUID PK, subcategory VARCHAR(100), sku_count INT, brand_count INT, avg_discount DECIMAL, availability DECIMAL);
CREATE TABLE price_band_distribution (id UUID PK, subcategory VARCHAR(100), price_band VARCHAR(20), sku_count INT);
CREATE TABLE brand_activity (id UUID PK, brand VARCHAR(100), sku_count INT, activity_index INT, ad_spend VARCHAR(20), roas VARCHAR(10), availability DECIMAL, content_score INT);
```

---

## 21. Offline Ads

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/offline-ads/online-health` | Online ad health summary |
| GET | `/api/offline-ads/channels` | Offline channel recommendations |
| GET | `/api/offline-ads/channel-performance` | Channel ROI comparison |

```sql
CREATE TABLE offline_channels (id UUID PK, channel VARCHAR(100), channel_type VARCHAR(100), cities TEXT[], est_reach VARCHAR(50), est_cost VARCHAR(20), projected_impact TEXT, roi VARCHAR(20), rationale TEXT);
```

---

## 22. Guardrails

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/guardrails/hard-stops` | Hard stop rules |
| POST | `/api/guardrails/hard-stops` | Create rule |
| PUT | `/api/guardrails/hard-stops/{id}` | Update rule |
| DELETE | `/api/guardrails/hard-stops/{id}` | Delete rule |
| GET | `/api/guardrails/strategic-locks` | Strategic locks |
| POST | `/api/guardrails/strategic-locks` | Create lock |
| GET | `/api/guardrails/analytics` | Trigger history, block/allow counts |

```sql
CREATE TABLE hard_stop_rules (id UUID PK, label VARCHAR(200), conditions JSONB, actions TEXT[], scope VARCHAR(50), scope_campaigns TEXT[], enabled BOOLEAN);
CREATE TABLE strategic_locks (id UUID PK, label VARCHAR(200), start_date DATE, end_date DATE, trigger_conditions JSONB, actions TEXT[], enabled BOOLEAN);
CREATE TABLE guardrail_trigger_log (id UUID PK, rule_id UUID, rule_type VARCHAR(20), action_taken TEXT, blocked BOOLEAN, triggered_at TIMESTAMPTZ);
```

---

## 23. Taxonomy Config

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/taxonomy/config` | Current config |
| PUT | `/api/taxonomy/config` | Update config |

```sql
CREATE TABLE taxonomy_config (id UUID PK, prefix VARCHAR(20), separator VARCHAR(5), segments JSONB);
```

---

## 24. Crawling Inputs

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/crawling/inputs` | Current crawling input tags |
| PUT | `/api/crawling/inputs` | Update inputs |
| GET | `/api/crawling/campaign-values` | Pull values from campaigns |

```sql
CREATE TABLE crawling_inputs (id UUID PK, input_type VARCHAR(50), tags TEXT[]);
```

---

## 25. War Room

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/warroom/sku-catalogue` | SKU catalogue with scores |
| POST | `/api/warroom/generate-plan` | Generate campaign plan |
| GET | `/api/warroom/plan/{id}/cards` | Campaign cards by phase |
| PUT | `/api/warroom/plan/{id}/rules` | Update automated rules |
| POST | `/api/warroom/plan/{id}/launch` | Launch campaign |

```sql
CREATE TABLE warroom_plans (id UUID PK, goal VARCHAR(50), goal_value DECIMAL, selected_skus TEXT[], budget DECIMAL);
CREATE TABLE warroom_campaign_cards (id UUID PK, plan_id UUID FK, phase VARCHAR(20), name VARCHAR(200), budget VARCHAR(20), platform VARCHAR(50), status VARCHAR(30), source TEXT, sku_id VARCHAR(50), warning TEXT);
CREATE TABLE warroom_rules (id UUID PK, plan_id UUID FK, conditions JSONB, actions JSONB, enabled BOOLEAN);
```

---

## 26. Competitors (Legacy)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/competitors/matrix` | Competitor intelligence matrix |
| GET | `/api/competitors/content-gaps` | Content gap comparison |
| GET | `/api/competitors/price-history` | 30-day price history |

Shares tables with Pricing and Content screens.

---

## 27. Account Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account/profile` | User profile, plan, usage |
| GET | `/api/account/platforms` | Connected platforms + status |
| POST | `/api/account/platforms/connect` | Initiate connection |

```sql
CREATE TABLE user_profiles (id UUID PK, name VARCHAR(200), role VARCHAR(100), company VARCHAR(200), plan VARCHAR(50), plan_price VARCHAR(20), skus_tracked INT, skus_limit INT, team_members INT, data_refresh_interval VARCHAR(20));
CREATE TABLE platform_connections (id UUID PK, user_id UUID FK, platform_name VARCHAR(100), status VARCHAR(20), connected_at TIMESTAMPTZ);
```

---

## Summary

**27 screens · ~120 API endpoints · ~60 database tables**

This is a documentation-only deliverable. No code changes required. If you'd like this exported as a downloadable document, let me know.

