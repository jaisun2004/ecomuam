## Goal
Produce a Word document (`.docx`) delivering business-use-case documentation for the tool, excluding Governance, Configuration, and Reports sections. One page per screen, plain language, analogies for complex visuals, and a "How a business team reads this" note per visual. Bullets used when explanations run over three sentences.

## Scope — Screens to Cover (one page each)
Grouped by sidebar bucket, based on the app's active views:

**Cockpit**
1. Central Cockpit

**Planning & Insights**
2. Strategic Planning
3. Approval Flow
4. Market Share Intelligence
5. Category White-space
6. Bestseller Intelligence
7. Keyword Analysis
8. Discovery / Share of Shelf
9. Content Quality Audit
10. Competitor Ads
11. Availability
12. Pricing

**Campaigns**
13. Campaign Manager (with Day Parting)
14. Campaign Reports
15. Festival Campaigns
16. Offline Ads

**Optimisation**
17. Budget Optimiser
18. Recommendations
19. Manual Data Entry
20. Guardrails

*(Excluded per request: Governance module, Taxonomy Config, Crawling Inputs, Alerts, Reports, Account.)*

## Page Structure (per screen)
Each page uses a consistent template so business readers scan quickly:
- **Screen name** (H1)
- **Purpose** — one line on the business question it answers
- **Who uses it** — role (brand manager, media planner, category lead)
- **Key visuals** — for each chart/panel:
  - What it shows (plain description)
  - Analogy if the visual is complex (e.g., radar chart = "a spider web where each leg is a keyword; the bigger your web, the more shelf you own")
  - **How to read it** — bullet list of business signals (when 3+ points, always bullets)
- **Typical decisions triggered** — 2–3 bullets
- **Cross-links** — where the user goes next

Page break between every screen so each occupies its own page.

## Document Setup
- US Letter, 1" margins, Arial body (Heading styles bold)
- Cover page: title, subtitle ("Business Use Case Documentation"), date, one-line product tagline
- Table of Contents auto-generated from Heading 1/2
- Section dividers per bucket (Cockpit / Planning & Insights / Campaigns / Optimisation)

## Build Approach
- Use the `docx` skill with `docx-js` (Node) to generate the file
- Write to `/mnt/documents/business-use-case-documentation.docx`
- Validate with the skill's validator
- QA: convert to PDF → images → visually inspect every page for overflow, spacing, page-break placement; fix and re-run until clean
- Deliver via `<presentation-artifact>` tag

## Out of Scope
- Governance, Configuration (Taxonomy/Crawling), Reports/Alerts, Account
- Technical/implementation details, data schemas, code references
- Screenshots of the actual UI (text-only description with analogies)

## Deliverable
Single `.docx` at `/mnt/documents/business-use-case-documentation.docx`, ~20 content pages + cover + TOC.
