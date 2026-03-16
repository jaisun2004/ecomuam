

## Plan: Campaign Guardrails + Cross-Screen Deduplication System

### Summary
Add a new **Guardrails** screen under Planning, insert additive components (conflict banners, action digest, guardrail widgets) into 4 existing screens, and implement a cross-screen deduplication system using shared React state.

---

### Architecture: Shared Guardrail State

Create a shared context (`GuardrailContext`) in `src/contexts/GuardrailContext.tsx` that holds:
- Active Tier 1/2/3 rule states
- Action ownership registry (which screen owns which insight)
- Deduplication helpers (`isOwnedBy`, `getOwner`, `isBlocked`)

`Index.tsx` wraps content in this provider. All screens consume it to determine what banners/chips to show and what CTAs to suppress.

The `onChange` callback in Index will be extended to support deep-link scrolling (pass a `scrollTarget` param alongside the active view ID).

---

### File Changes

**1. `src/contexts/GuardrailContext.tsx`** — NEW
- Shared state for guardrail rules, active blocks, action ownership
- Mock data: availability hard stop active, one defense action in Campaign Manager, one budget action in Budget Optimiser
- Helper functions for deduplication checks
- Navigation callback support for deep-linking between screens

**2. `src/views/GuardrailsView.tsx`** — NEW (full screen)
- **Card A** — Hard Stops (Tier 1): Red left border, table with 4 rows, editable inputs, scope dropdowns, ON/OFF toggles, emergency kill switch button. Uses `GuardrailContext` to update rule states.
- **Card B** — Strategic Locks (Tier 2): Amber left border, 3 lock rows with campaign multi-select, date range, toggles, ₹ input for budget pacing floor.
- **Card C** — Action Permissions (Tier 3): Green left border, 5×5 matrix grid. Each cell cycles Allow→Review→Block on click with corresponding tier colors.
- **Card D** — Conflict Resolution: Blue left border, 3 selectable mode cards with purple border on selected. "Est. resolution time" input shown conditionally.
- **Card E** — Velocity Limits: Purple left border, range sliders for bid/budget %, steppers for action limits, duration picker for cooling-off. "Reset to defaults" ghost button.
- Auto-save with inline "Saved ✓" green text appearing for 2s on any change.

**3. `src/components/Sidebar.tsx`** — MINIMAL EDIT
- Add `{ id: "guardrails", icon: Shield, label: "Guardrails", notify: false }` as third item in PLANNING section (after Discovery, line ~10).
- Import `Shield` from lucide-react.
- Zero other changes.

**4. `src/pages/Index.tsx`** — MINIMAL EDIT
- Import `GuardrailsView` and add to views map.
- Wrap content in `GuardrailProvider`.
- Extend `onChange` to support `scrollTarget` for deep-link highlighting.

**5. `src/views/CampaignView.tsx`** — ADDITIVE INSERTS at top of component return
- **Insert 1**: Conflict callout banner (amber left border, conditionally shown when Tier 1 active from context). Shows rule name, affected campaigns, "Override manually" amber button, "View guardrail" blue link.
- **Insert 2**: Today's Action Digest panel with header (title + purple pending badge + "Approve all safe" button), batch approve bar, and 5 mock insight rows. Each row has tier-colored left border, confidence pips, metric chip, action/review/dismiss buttons. Rows with ownership chips (from context deduplication) show "Handled in [Screen]" gray chip instead of action buttons. Budget insight row shows "Handled in Budget Optimiser" chip.
- **Undo toast**: Fixed bottom-center, 5s auto-dismiss on any action apply.
- All inserted ABOVE line 390 (existing KPI cards). Existing content untouched.

**6. `src/views/AvailabilityView.tsx`** — ADDITIVE INSERT at top
- Deduplication banner: shown when context reports active Tier 1 availability hard stop. Blue-gray tint, info icon, "Campaign action already in progress" title, "View active Tier stops in Campaign Manager →" link. `display: none` when inactive.
- Suppress any campaign-level CTAs (e.g., "Pause Ads" buttons in ad waste alerts) when banner is visible.

**7. `src/views/CompetitorAdsView.tsx`** — ADDITIVE INSERT at top
- Amber conflict alert banner when defense insight is BLOCKED by Tier 1 (from context).
- When defense is ACTIVE (not blocked) in Campaign Manager: hide amber banner, show "In progress" gray chips on affected keyword rows.
- `display: none` when neither condition applies.

**8. `src/views/BudgetOptimiserView.tsx`** — ADDITIVE INSERT at bottom
- Collapsible "Active Guardrails" card with traffic-light dots per campaign type (Brand Search, Performance Max, Non-Brand, Retargeting, Festival).
- "Edit guardrails →" blue link navigating to Guardrails screen.
- Does not push/reflow existing content.

---

### Design System Compliance
All new components use the specified tier colors (Red #FF5C5C, Amber #F5A623, Green #2ECF8E, Blue #4F7FFF, Purple #A78BFA), dark surface cards with 1px subtle borders, 12px radius, monospace chips, and confidence pips following the ≥4/3/≤2 green/amber/gray rule. Deep-link navigation triggers a 1s blue outline pulse animation on the target component.

