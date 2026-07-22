# Rework Edit Day Parting Modal

Update the `EditDayPartingModal` in `src/views/CampaignView.tsx` so each config expands into a full detail view, with two clear actions below: **Edit config** and **Delete config**.

## Changes

### 1. Expanded config detail (replace current campaign-only list)
Inside each expanded config row, show four labeled sub-sections in a compact grid:
- **Platforms** — chips derived from the campaigns' platforms (looked up in `campaigns` array by name, deduped).
- **Campaigns** — existing list of campaign name pills (kept).
- **Time slot & Weekdays** — show `c.time` plus weekday chips (Mon–Sun). Since `dayPartingSlots` has no weekdays field, default to "Mon–Sun" (all seven) as a mock, matching the wizard's default.
- **Date range** — show a mock "Ongoing" or a static date range (e.g. "01 Jun – 30 Jun 2026") since no field exists on the slot data.

Each sub-section uses the same styling language as the current campaign pills (small uppercase label + chip row on `bg-surface-1 border-subtle`).

### 2. Action buttons
Replace the current "Replace campaigns" / "Delete whole config" pair with:
- **Edit config** (primary style) — wires to the existing `onReplaceCampaigns(slot)` handler (which already opens the `CreateDayPartingModal` in `replace` mode pre-seeded with platforms, time, campaigns). Rename the prop internally to `onEditConfig` for clarity, and rename `replaceTarget` → `editTarget` in the parent.
- **Delete config** (red style) — keeps the inline confirm flow already present.

### 3. Copy tweaks
- Dialog description → "Expand a config to review its platforms, campaigns, time slot, weekdays and date range. Edit or delete it below."
- The CreateDayPartingModal's `replace` mode title text stays as-is (already reads as an edit flow).

## Technical notes
- No data-shape migration required; weekdays and date range are display-only mocks for now, consistent with the existing mock-data approach in this view.
- Platforms per config are derived at render time from the `campaigns` list already passed in via the parent scope — pass `allCampaigns` (name → platform map) into `EditDayPartingModal` as a new prop.
- Icon usage: keep `FileEdit` for Edit, `X` for Delete.
- No changes needed in `CreateDayPartingModal` — its replace/edit path already pre-selects platforms, hours and campaigns.

## Files touched
- `src/views/CampaignView.tsx` (only)
