

## Plan: Rule Engine + Actionability KPI Cards on Budget Optimiser

Single-file edit: `src/views/BudgetOptimiserView.tsx`.

### 1. Replace top KPI cards (Overview tab)
Swap the existing 4 KPI cards with action-oriented metrics:

| Card | Value | Sub-context |
|---|---|---|
| Optimisations carried out yesterday | `12 actions` | Auto + manual budget shifts applied |
| ROAS increment from yesterday | `+0.3x` | Blended portfolio gain vs prior day |
| Underperforming campaigns | `7 campaigns` | Below brand avg ROAS of 3.4x → click to view |
| Lowest avg ROAS platform | `Flipkart · 2.1x` | 1.3x below brand average |

Each is the existing `<KPICard>` component, preserves accent colors (primary / green / red / amber). The Underperforming and Lowest-Platform cards carry deltaType "negative" to flag attention.

### 2. New "Rule Engine" section (Overview tab, inserted above Active Guardrails)

A `<PanelCard title="Rule Engine" badge="Automation" badgeColor="purple">` containing two subsections:

**A. Rule Templates (toggle on/off)** — 6 pre-built rule cards in a 2-column grid. Each row:
- Rule name + one-line description
- Metric chip(s) it monitors (e.g. ROAS, CPC, ACoS, CTR, Spend Pacing, Conversion Rate)
- Action chip (e.g. "Reduce bid -20%", "Pause campaign", "Increase budget +15%")
- `<Switch>` to enable/disable

Templates:
1. **Pause low-ROAS campaigns** — IF ROAS < 1.5x for 3 days → pause
2. **Bid down high ACoS keywords** — IF ACoS > 40% → reduce bid 20%
3. **Boost top performers** — IF ROAS > 5x AND budget util > 90% → increase budget 25%
4. **Throttle overpacing campaigns** — IF spend pacing > 120% by noon → cap remaining spend
5. **Defend dropping rank** — IF organic rank drops ≥ 3 positions → raise sponsored bid 15%
6. **Cut redundant paid** — IF organic rank ≤ 3 AND paid ROAS < 2.5x → reduce budget 30%

State held locally as `Record<ruleId, boolean>`.

**B. Custom Rule Builder (compact)** — single inline row:
- Metric `<Select>` (ROAS, ACoS, CPC, CTR, Conversion Rate, Spend Pacing, Budget Utilisation, Organic Rank, Sponsored Rank, Impression Share)
- Operator `<Select>` (>, <, =, between)
- Threshold input
- Action `<Select>` (Pause, Reduce bid -X%, Increase budget +X%, Send alert)
- "Add rule" button → appends to a "Custom rules" list below (visual only, mock state)

Active custom rules render as small chips below the builder with a remove ✕.

### Design adherence
- Uses existing `KPICard`, `PanelCard`, Shadcn `Switch`, `Select`, `Input` — no new deps
- Tier color system preserved (red/amber/green for thresholds)
- KPI context one-liner pattern on all 4 new cards
- No revenue metrics shown
- Animation delays follow existing `delay={0/0.05/0.1/0.15}` cascade

### File touched
- `src/views/BudgetOptimiserView.tsx` only

