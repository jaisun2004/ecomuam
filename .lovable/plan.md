

# Availability Screen — MySQL Schema & API Documentation

This is a documentation-only deliverable. A comprehensive MySQL schema and API specification will be generated based on the data structures currently used in `AvailabilityView.tsx` and `AvailabilitySection.tsx`.

## Deliverable

A single markdown file exported to `/mnt/documents/availability-db-schema.md` containing:

1. **MySQL CREATE DATABASE + CREATE TABLE statements** for all availability entities
2. **Full API endpoint list** with request/response key definitions
3. **Textual ER diagram** showing table relationships
4. **Indexes** optimized for analytics queries
5. **Audit fields** (created_at, updated_at) on all tables
6. **BIGINT IDs**, ENUMs, foreign keys, and constraints

## Tables to be defined (based on screen data)

| Table | Purpose | Source in UI |
|-------|---------|-------------|
| `skus` | Master SKU reference | allSkus array, oosProductsToday |
| `platforms` | Platform reference (Amazon, Blinkit, etc.) | platformAvailability |
| `competitors` | Competitor brands | competitionAvailability |
| `availability_snapshots` | Per-SKU per-platform availability % over time | availScoreTrend, heatmapData |
| `oos_events` | Out-of-stock event log | oosProductsToday |
| `platform_sku_availability` | Matrix: SKU × Platform availability | platformAvailability with nested skus |
| `stock_forecasts` | AI-predicted days-to-OOS | stockForecast |
| `darkstore_gaps` | City × SKU darkstore listing coverage | darkstoreGaps |
| `competition_availability` | Competitor vs own availability | competitionAvailability |
| `competition_oos_opportunities` | Competitor OOS for conquest campaigns | Competition OOS panel |
| `campaign_triggers` | Availability-based campaign triggers | campaignTriggers |
| `availability_kpi_snapshots` | Daily KPI rollups | KPI cards |

## API Endpoints to be documented

~12 endpoints covering: KPIs, OOS products, platform-SKU matrix, stock forecasts, darkstore gaps, competition availability, competition OOS opportunities, campaign triggers, score trend, heatmap data, and campaign launch actions.

Each endpoint will include: method, path, query parameters, response keys with types and descriptions.

## Technical details

- All IDs: `BIGINT UNSIGNED AUTO_INCREMENT`
- ENUMs for: `platform_type` (marketplace, qcommerce), `trend_status` (critical, warning, ok, stable, improving, declining), `oos_severity`, `campaign_trigger_urgency`
- Composite indexes on `(sku_id, platform_id, recorded_at)` for time-series queries
- Foreign keys with `ON DELETE CASCADE` where appropriate
- `created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP`, `updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`

