## Manual Data Entry Screen

Add a new screen under the **Optimisation** section in the sidebar for logging manual campaign changes on quick commerce platforms.

### Navigation
- Add `manualentry` nav item in `src/components/Sidebar.tsx` under the OPTIMISATION bucket (below Budget Optimiser), using a `ClipboardEdit` (or `Pencil`) icon.
- Register `ManualDataEntryView` in `src/pages/Index.tsx` view map.

### Screen layout (`src/views/ManualDataEntryView.tsx`)

**Header**
- Title: "Manual Data Entry"
- Subtitle: "Log manual changes made to quick commerce campaigns"
- Right side: "Export CSV" button

**Entry form (top card)** — inline row that appends to the table on submit:
| Field | Type | Options |
|---|---|---|
| Customer | Dropdown | Britannia, Sunfeast, Unibic, Anmol (mock list) |
| Platform | Dropdown | Blinkit, Instamart, Zepto |
| Campaign | Dropdown | Filtered by selected customer + platform (mock campaign list) |
| Change Type | Dropdown (fixed) | Bid Increase, Bid Decrease, Budget Increase, Budget Decrease, Keyword Added, Keyword Removed, Campaign Paused, Campaign Resumed, City Added, City Removed, Schedule Changed |
| Value | Input | Numeric with unit auto-selected by change type (₹ / % / text for keyword/city); disabled for pause/resume |
| Why | Textarea | Free text, max 300 chars, required |
| Add | Button | Validates and prepends to log table |

**Log table (below form)**
Columns: Timestamp • Customer • Platform • Campaign • Change Type (colored chip) • Value • Why • Actions (delete row)
- Sorted newest first, sticky header, search box, filter chips for Customer / Platform / Change Type.
- Empty state when no entries.

### State & data
- Local `useState` array of entries; seed with 5-6 mock entries so the table isn't empty.
- Reuse existing shadcn `Select`, `Input`, `Textarea`, `Button`, `Table`, `Badge` components.
- Follow project design tokens (purple sidebar theme, DM Sans, JetBrains Mono for numeric).
- No backend / no Lovable Cloud — pure client state as per project's "Live Data Integration" constraint being about auto-crawled feeds; manual entry is the explicit purpose here.

### Files touched
- `src/components/Sidebar.tsx` — add nav item
- `src/pages/Index.tsx` — import + register view
- `src/views/ManualDataEntryView.tsx` — new file
