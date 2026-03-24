

# Restyle to Match mFilterIt Purple/White Theme

## What changes

The current app uses a dark theme (dark background, light text). The reference image shows a **light/white theme** with a **purple sidebar** and clean white content area. This is a full theme overhaul.

## Changes required

### 1. CSS Variables (src/index.css)
Rewrite all CSS custom properties to a light theme:
- **Background**: White (`0 0% 100%`)
- **Foreground**: Dark text (`220 20% 15%`)
- **Card/Popover**: White with subtle grey borders
- **Primary**: Purple (`270 70% 50%`) to match the mFilterIt purple
- **Sidebar**: Deep purple background (`270 60% 35%`), white text
- **Surface layers**: Light greys instead of dark greys
- **Borders**: Light grey (`220 10% 90%`) instead of white-alpha
- **Muted**: Light grey backgrounds, medium grey text
- **Status colors**: Keep red/amber/green but adjust for light background readability

### 2. Sidebar (src/components/Sidebar.tsx)
- Change background from `bg-background` to a deep purple (`bg-[#5B2D8E]` or similar)
- All text becomes white
- Active item: white background with purple text (or lighter purple highlight)
- Section labels: white/light purple
- Logo area: white text on purple
- Hover states: lighter purple overlay

### 3. Topbar (src/components/Topbar.tsx)
- White background with subtle bottom border
- Dark text
- Surface pills become light grey

### 4. PanelCard (src/components/sw/PanelCard.tsx)
- White cards with light grey borders instead of dark surface colors

### 5. AlertItem (src/components/sw/AlertItem.tsx)
- White/light background cards

### 6. Tailwind Config (tailwind.config.ts)
- No structural changes needed; colors flow from CSS variables

## Files to modify
1. `src/index.css` — Full variable rewrite
2. `src/components/Sidebar.tsx` — Purple sidebar styling
3. `src/components/Topbar.tsx` — Light topbar
4. `src/components/sw/PanelCard.tsx` — Light cards
5. `src/components/sw/AlertItem.tsx` — Light alert cards

## Visual target
- Purple sidebar (#5B2D8E / #6B3FA0 range)
- White main content area
- Light grey card backgrounds
- Dark text throughout content
- Purple accents for active states and buttons
- Status badges remain colorful (red critical, amber warning, green success)

