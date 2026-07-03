## Manual Data Entry — CSV import/export + change log controls

All changes are in `src/views/ManualDataEntryView.tsx`. No other files touched.

### 1. Header: split "Export CSV" into two buttons
Replace the single top-right "Export CSV" with two buttons:
- **Download template** (outline, `FileDown` icon) — exports an empty CSV with the exact column headers the importer expects, plus one commented example row showing valid dropdown values. This is the "insertable" format users fill in and re-import.
- **Import CSV** (outline, `Upload` icon) — opens a hidden `<input type="file" accept=".csv">` and parses the file client-side.

### 2. Import CSV validation
Parse rows with a small CSV parser (handles quoted fields, commas, escaped quotes) — no new deps.

Validation performed before any row is added:
1. **Header check** — required columns must all be present (case-insensitive, trimmed): `Timestamp` (optional, auto-filled if blank), `Customer`, `Platform`, `Campaign`, `Change Type`, `Value`, `Why`. Extra columns are ignored; missing columns abort the whole import.
2. **Dropdown value check** per row:
   - `Customer` ∈ `CUSTOMERS`
   - `Platform` ∈ `PLATFORMS`
   - `Change Type` ∈ `CHANGE_TYPES`
   - `Campaign` ∈ `CAMPAIGNS[customer][platform]`
   - `Why` non-empty, trimmed, sliced to 300 chars
   - `Value` required unless change type is `Campaign Paused` / `Campaign Resumed` (then coerced to `—`)
3. **Result summary** — show a toast: `Imported X rows, skipped Y (see details)`. If any row fails, show a dismissible error panel above the change log listing row number + reason for each failure (max 10 shown, "+N more"). Valid rows are prepended to the log; invalid rows are not added.
4. On header mismatch: show a single toast `Import failed: missing columns X, Y` and abort.

### 3. Change log: local Export CSV + date range
Add a compact toolbar row above the existing filter row (or inline with it) containing:
- **Date range** — two `<Input type="date">` fields labeled `From` / `To`, filtering `entries` by the date portion of `ts`. Empty = unbounded. Placed at the left of the filter row.
- **Export CSV** button on the right side of the log's `PanelCard` title area (using the card's title-row via a small header slot, or as the first item on the filter row) — exports **only the currently filtered** rows using the same column format as the template so the file round-trips through import.

Filter pipeline order: date range → customer → platform → change type → search box. Existing filter chips and search are unchanged.

### Technical notes
- Reuse the existing `exportCsv` logic but extract a small `buildCsv(rows)` helper inside the file so the template, header export, and log export all share the same column order.
- Template row example uses realistic values already in the mock data.
- `Timestamp` in imports: if blank or unparseable, use `now()`; if present, keep the string as-is (no strict date parsing, matches how seed data is stored).
- No changes to types, seed data, or other views.
