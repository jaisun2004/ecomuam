# Campaign creation confirmation cleanup

## Scope
Update only the Autonomous AI Chat, Copy Existing, Manual, and their shared create-path UI.

## Changes
- Remove native confirmation dialogs and create-path custom modal dialogs.
- Remove consent and irreversible-budget acknowledgement checkboxes; Create works immediately when at least one non-blocked campaign is selected.
- Keep product, city, recommendation, and row-selection checkboxes unchanged.
- Treat warning-only rows as creatable; hold only rows with blocker findings and carry warnings into confirmation.
- Keep Autonomous AI Chat on the chat screen after creation and show its confirmation as a transcript card.
- Keep Manual and Copy Existing confirmation on the shared confirmation screen.
- Remove created-campaign file/download, filename, push, and API wording while leaving held-row worksheet downloads intact.
- Make every “Go to Campaign Manager” action open Campaign Manager directly.
- Remove “Store availability crawl · collected today” from recommendation cards used by these flows.

## Technical details
- Adjust the shared review and confirmation components only where used by the three creation routes.
- Preserve existing blocker partitioning and selection behavior.
- Do not add components, dependencies, tests, browser checks, screenshots, or unrelated changes.
