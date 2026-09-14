# Screen logic document (plain language)

A single markdown document explaining what every screen does, what each chart, table and card on it shows, and the rules behind the numbers. No technical words, no code references, short lines.

## Where it goes

`/mnt/documents/screen-logic.md`, downloadable from chat. Nothing in the app changes.

## Shape of the document

Opening section, one page:
- What the product is for and who uses it.
- How a person moves through it: watch the cockpit, look into a problem, act on it, check the result.
- Who can sign in and what they can see (as the app behaves today).
- Where the numbers come from, how often they refresh, and the rules that apply everywhere: money is shown as spend only and never as revenue, stock and price figures are only shown when a real reading exists, and a city is only listed when there is something measured for it.

Then one short section per screen, in sidebar order:

- Central Cockpit
- Availability, Pricing, Rank & Market Share, Keyword Analysis, Content Quality Score
- Campaign Manager and campaign creation (the three ways: guided chat, copy an old campaign, fill it in yourself)
- Recommendations, Budget Optimiser, Manual Data Entry
- Guardrails, Taxonomy Config, Crawling Inputs
- Governance: Overview, Rules, Approved Plans, Campaign Audit, Creative Compliance
- Reports, Alerts

Each screen section holds four short parts:
1. **What this screen answers** — one sentence.
2. **What you see** — every card, chart, table and filter on the screen, one line each: what it shows and how to read it.
3. **The rules behind it** — the thresholds, colour meanings and grouping logic in words (for example: a competitor price turns red only when it is lower than ours; a warning never stops a campaign from being created).
4. **What you can do from here** — the actions and where they lead.

## Two worked walk-throughs at the end

- A stock problem, from the flag on the cockpit to the paused campaign.
- Creating campaigns from the guided chat: pick products, the app ranks cities on what it can actually measure, you set one budget, it is split across cities, campaigns are created, and anything held back comes back with a plain reason and the exact fix.

## How it gets written

Read each screen and its data in turn and describe only what is actually there — every threshold, colour rule and grouping stated in the document is taken from the screen itself, not assumed. Length limit: at most two pages per screen.
