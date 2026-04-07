

# Add Always-Visible Date Range Picker with Comparison to Topbar

## What exists now
The Topbar already has time-range toggles (7D/30D/90D), a Compare toggle, and dual calendar popovers -- but the date range calendars only appear when Compare is enabled. The user wants the primary date range selector to always be visible, with comparison as an add-on.

## Changes

**File: `src/components/Topbar.tsx`**

Restructure the right side of the Topbar:

1. **Always-visible date range button**: Show the current date range (`currentRange`) as a permanent button with a calendar icon, regardless of compare state. Clicking opens a range calendar popover. This replaces the current pattern where date pickers only show on compare toggle.

2. **Compare toggle + second range**: Keep the Compare button. When enabled, show a second date range button (the comparison period) with a "vs" label between them. The comparison button uses dashed border styling to visually distinguish it.

3. **Remove time-range presets dependency on date picker**: The 7D/30D/90D preset buttons auto-set the `currentRange` dates (e.g., 7D sets from = today-7 to = today) so presets and the calendar stay in sync.

**Layout (always visible)**:
```text
[7D 30D 90D]  [📅 Mar 7 – Apr 6]  [⇄ Compare]  [platforms]  [avatar]
```

**When Compare enabled**:
```text
[7D 30D 90D]  [📅 Mar 7 – Apr 6] vs [📅 Feb 5 – Mar 6]  [⇄ Compare]  [platforms]  [avatar]
```

## Technical details
- Move the `currentRange` popover outside the `compareEnabled` conditional so it renders always
- Keep the `compareRange` popover inside the conditional
- Add a helper to sync time-range presets with `currentRange` (e.g., clicking "7D" sets `from` to 7 days ago, `to` to today)
- Single file change: `src/components/Topbar.tsx`

