# Governance Module — Plan

A new sidebar section "Governance" with four sub-views covering campaign setup compliance, creative compliance, an editable approved-plan registry, a rule builder, and a violations monitor with diff/pause/waive/export actions. All data is mock/demo (frontend-only), consistent with the rest of the app.

## Navigation

Add a new section in `src/components/Sidebar.tsx` between Insights and Configs:

```text
Governance
├─ Governance Overview      (id: governance)
├─ Rules                    (id: governance-rules)
├─ Approved Media Plans     (id: governance-plans)
├─ Campaign Audit           (id: governance-audit)
└─ Creative Compliance      (id: governance-creative)
```

Register the five views in `src/pages/Index.tsx`. Icons: `ShieldCheck`, `ListChecks`, `FileSpreadsheet`, `ClipboardCheck`, `ImageOff`.

## 1. Governance Overview (`GovernanceOverview.tsx`)

Top KPI strip:
- Active rules
- Approved plans (count)
- Open violations (severity split: critical / warning / info)
- Compliance score (% of audited campaigns passing) — last 7 days trend sparkline

Two stacked panels:
- **Recent violations** (top 5, with severity chip, campaign, rule, "View" → opens diff drawer in Campaign Audit)
- **Pending creative discrepancies** (top 5, with publisher, SKU, mismatch type)

## 2. Rules (`GovernanceRulesView.tsx`)

Rule list + create/edit panel. Each rule:
- Name, Description
- Category: `setup` | `creative`
- Scope: platform(s), campaign type(s)
- Conditions (reusing the `ConditionBuilder` patterns from Guardrails where possible)
  - Setup: allowed objectives, allowed geos (city allowlist), frequency cap range, allowed placements, required tracking params (regex), naming convention pattern
  - Creative: required asset versions, allowed landing-page domains, required CTAs, banned claims
- Severity: critical / warning / info
- Enabled toggle
- Action on violation: flag-only / auto-pause / require-review

State held locally; seed with 6–8 example rules.

## 3. Approved Media Plans (`GovernancePlansView.tsx`)

Editable table of approved plan rows (one row per campaign-intent). Columns:
- Campaign name, Platform, Objective, Audience, Geo (cities), Frequency cap, Placements (multi), Tracking params, Daily budget, Start, End, Approved-by, Status

Inline edit + "Add plan" dialog. Bulk import is **excluded** per project constraints (no CSV).

This table is the source of truth the Campaign Audit compares live campaign config against.

## 4. Campaign Audit / Violations Monitor (`GovernanceAuditView.tsx`)

Filter bar: platform, severity, rule, status (open / waived / resolved), date.

Table columns: Campaign | Platform | Rule | Field | Approved | Live | Severity | Status | Actions.

Row actions:
- **View diff** — opens side drawer with field-by-field comparison of approved-plan vs live-config (highlight mismatched rows in red).
- **Pause / Request fix** — pause sends to a toast + marks status "Pause requested"; request fix opens a small dialog (assignee, note) and marks "Fix requested".
- **Acknowledge / waive** — dialog asking reason + expiry; marks "Waived (until …)".
- **Export** — top-right "Export audit report" button generates CSV download client-side from current filtered view.

Seed 10–14 mock violations covering: wrong geo, missing tracking macro, frequency cap exceeded, placement not approved, objective mismatch, naming convention failure.

## 5. Creative Compliance (`GovernanceCreativeView.tsx`)

Grouped by publisher (Amazon, Flipkart, BlinkIt, Zepto, Instamart). Each card:
- Asset thumbnail placeholder, SKU, approved version vs served version (highlight when mismatch)
- Landing-page approved vs served (highlight)
- CTA approved vs served (highlight)
- Status chip: OK / Mismatch / Missing
- Actions: View diff, Request fix, Waive

Top summary: count of mismatches by type (asset / LP / CTA) as horizontal bar.

## Shared bits

- New context-free module: no Supabase / no schema changes. All state is in-component (`useState`) seeded with mocks, matching how `GuardrailContext` seeds defaults.
- New shared types in `src/views/governance/types.ts`: `GovernanceRule`, `ApprovedPlan`, `Violation`, `CreativeCheck`.
- New helper component `DiffDrawer.tsx` (uses shadcn `Sheet`) reused by Campaign Audit and Creative Compliance.
- CSV export helper in `src/views/governance/exportCsv.ts` (string-builder + `Blob` download — no library).

## Visual conventions

- Reuses existing tokens: severity colors (`text-destructive`, `text-warning`, `text-info`, `text-success`), `rounded-xl border bg-card shadow-card` panels, Syne headings, DM Sans UI, JetBrains Mono for IDs/params.
- No revenue metrics. No CSV upload (export only). No social/Instagram surfaces.

## Files to create

```text
src/views/GovernanceOverview.tsx
src/views/GovernanceRulesView.tsx
src/views/GovernancePlansView.tsx
src/views/GovernanceAuditView.tsx
src/views/GovernanceCreativeView.tsx
src/views/governance/types.ts
src/views/governance/mockData.ts
src/views/governance/DiffDrawer.tsx
src/views/governance/exportCsv.ts
```

## Files to edit

- `src/components/Sidebar.tsx` — add Governance section + 5 nav items.
- `src/pages/Index.tsx` — import + register the 5 views in the `views` map.

## Out of scope (v1)

- No real backend / persistence. No live campaign-config ingestion (mocked). No bulk import. No role-based approval workflow beyond a single "Approved-by" string field.
