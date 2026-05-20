# Onboarding Experience: OpenSearch Observability Data Collection

## Overview

A step-by-step guided onboarding wizard for collecting data into OpenSearch Observability. The experience uses a split-panel layout:

- **Left panel (Conversation):** A guided conversational flow where the system asks questions and the user selects options (chips, cards, or buttons). Includes step progress indicator and status confirmations. Use assistant-ui components for conversational interface. Use tool-ui components option list when option type is checkbox or radio.
- **Right panel (Preview/Context):** A contextual panel that shows a visual preview of the user's selections, live data feedback, or supplementary information related to the current step.

---

## Layout Specification

```
┌──┬──────────────────────────────────────────────────────────────────────┐
│  │  Content panel (rounded white background, same chrome as other pages)│
│  ├────────────────────────────┬─────────────────────────────────────────┤
│  │                            │                                         │
│L │  LEFT PANEL                │  RIGHT PANEL                            │
│O │  (~35-40% width)           │  (~60-65% width)                        │
│G │                            │                                         │
│O │  ┌─ Step indicator ──────┐ │  ┌─ Contextual preview ────────────────┐│
│  │  │ Step X/N · Step Title │ │  │                                     ││
│N │  └───────────────────────┘ │  │  Visual content changes per step:   ││
│A │                            │  │  - Cards / tiles                     ││
│V │  ┌─ Question bubble ─────┐ │  │  - Live data charts                 ││
│  │  │ System message with   │ │  │  - Configuration previews           ││
│  │  │ inline links/emphasis │ │  │  - Status indicators                ││
│  │  └───────────────────────┘ │  │                                     ││
│  │                            │  │                                     ││
│  │  ┌─ Selections ──────────┐ │  └─────────────────────────────────────┘│
│  │  │ • Chips (pill buttons)│ │                                         │
│  │  │ • Cards               │ │                                         │
│  │  │ • Input fields        │ │                                         │
│  │  └───────────────────────┘ │                                         │
│  │                            │                                         │
│  │  ┌─ Feedback ────────────┐ │                                         │
│  │  │ ✓ DONE                │ │                                         │
│  │  │ Summary of selection  │ │                                         │
│  │  └───────────────────────┘ │                                         │
│  │                            │                                         │
│  ├────────────────────────────┴─────────────────────────────────────────┤
│  │                     [ Finish onboarding later ]                       │
└──┴──────────────────────────────────────────────────────────────────────┘
```

**Chrome:** The page uses the same navigation shell and `samplePagesContentPanel` wrapper as all other pages. The left navigation rail is present but empty — it displays only the OpenSearch logo (no nav items, no footer icons). This keeps the onboarding visually consistent with the rest of the application while signaling that no other navigation is available during setup.

---

## Global Elements

| Element | Description | Notes |
|---------|-------------|-------|
| Step indicator | `Step X of 6` in H6 style, followed by the step title in H3 style below it | Shows progress and current step context |
| Progress dots | Horizontal dot trail between steps (timeline) | One dot per main step — indicates completed/current |
| "Finish onboarding later" link | Bottom center of page | Allows user to exit and resume later |
| Background | Light gradient (left panel slightly different from right) | Sets onboarding apart from main app |

---

## Flow Architecture (from diagram)

The onboarding flow is organized into 6 main steps. Step 1 contains sub-steps for environment selection and collector configuration:

| Main Step | Title | Sub-steps |
|-----------|-------|-----------|
| 1 | What do you want to observe? | 1a. Choose observation goal, 1b. Select environment, 1c. Configure collector |
| 2 | Connect your data source | — |
| 3 | Transform your data | — |
| 4 | Review and confirm | — |
| 5 | Collecting your data | — |
| 6 | You're all set! | — |

The step indicator displays `Step X/6` based on the main step number. Timeline dots track main step completion (not sub-steps).

---

## Steps Definition

---

### Step 1 of 6 — Sub-step 1a

**Step Title:** `Set up data sources`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Welcome to OpenSearch for Observability. I'll help you set up your data. What would you like to observe?* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Collect data from your application` |
| | Option 2: `Connect with cloud services` |
| | Option 3: `Get started with sample data` |
| Default selection | None |
| Confirmation message | ✓ DONE — Great choice! Let's set up **{selected option}**. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Getting Started` |
| Panel subtitle | `Choose your observability path` |
| Content type | Readonly checklist |
| Content details | A vertical list of 6 items representing the main onboarding steps. Each item is a card with: (1) an empty circle indicator (non-interactive), (2) the step title in bold, (3) a subdued description. Steps: "What do you want to observe?", "Connect your data source", "Transform your data", "Review and confirm", "Collecting your data", "You're all set!" |
| Dynamic behavior | None — the checklist is purely informational, showing the user the full journey ahead. Items are not clickable or checkable. |
| Secondary section | None |

| Content details | A structured summary card showing all selections: (1) Observation goal, (2) Environment, (3) Data source / provider, (4) Signals enabled (metrics, logs, traces), (5) Estimated data volume, (6) Index patterns to be created. Each row shows the step title, selected value, and an edit icon. |
| Dynamic behavior | If user selects "I want to make changes," the right panel highlights the editable fields and the left panel navigates back to the relevant step. If user confirms, a deployment progress indicator appears showing: creating indices → configuring pipeline → starting collection → verifying data flow. |

---

### Step 1 of 6 — Sub-step 1b

**Step Title:** `Set up data sources`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *What environment are you collecting data from? This helps me recommend the right integration approach.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `OpenTelemetry` |
| | Option 2: `EKS` |
| | Option 3: `Kubernetes` |
| | Option 4: `Other` |
| Confirmation message | ✓ DONE — **{selected environment}** selected. I'll configure the collector for your environment. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Environment` |
| Panel subtitle | `Supported collection environments` |
| Content type | Card grid |
| Content details | Grid of 4 environment cards, each showing the environment logo, name, and supported signal types (metrics ✓, logs ✓, traces ✓). Cards show compatibility badges (e.g., "Native integration" for OpenTelemetry, "Managed service" for EKS). |
| Dynamic behavior | When an environment card is selected on the left, the right panel highlights that card and reveals a detail section below showing: recommended collector setup, supported signals, and estimated setup time for that environment. |
| Secondary section | A "What's included" summary listing: collector configuration, pre-built dashboards, and alerting templates available for the selected environment. |

---

### Step 1 of 6 — Sub-step 1c

**Step Title:** `Set up data sources`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Run the following command to start your OpenTelemetry collector. Once it's running, click "I am ready" to continue.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `I am ready` | Option 1 is primary button |
| | Option 2: `Go back` |
| Default selection | None |
| Confirmation message | ✓ DONE — Collector configured. Moving to data source connection. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Collector Setup` |
| Panel subtitle | `Run this command to start the OTel collector` |
| Content type | Code preview |
| Content details | A code block displaying the docker run command: `docker run -e CLICKHOUSE_ENDPOINT="https://d9vcnuuz5c.us-west-2.aws.clickhouse.cloud:8443" -e CLICKHOUSE_USER="default" -e CLICKHOUSE_PASSWORD="<your_password_here>" -p 4317:4317 -p 4318:4318 clickhouse/clickstack-otel-collector:latest`. Includes a "Copy" button in the top-right corner of the code block. |
| Dynamic behavior | When user clicks "I am ready," the right panel briefly shows a connection verification spinner, then transitions to a green checkmark with "Collector detected" status. If "Go back" is selected, navigates to the previous step. |
| Secondary section | A brief note below the code block: "Replace `<your_password_here>` with your actual password. The collector will listen on ports 4317 (gRPC) and 4318 (HTTP) for incoming telemetry data." |

---

### Step 2 of 6

**Step Title:** `Connect additional data sources`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Next: Connect to telemetry from additional data sources* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `OpenSearch` |
| | Option 2: `Prometheus` |
| | Option 3: `Amazon CloudWatch Logs` |
| | Option 4: `Amazon S3` |
| Action | `Skip for now` — text link below the options to advance without selecting any data sources |
| Default selection | None |
| Confirmation message | ✓ DONE — Connected to **{selected provider}**. I'm seeing **{N} services** and **{N} log groups**. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Data Sources` |
| Panel subtitle | `Where telemetry comes from` |
| Content type | Card grid |
| Content details | 3–4 cloud provider cards (AWS, Azure, GCP, On-prem) each showing: provider logo, name, subtitle ("Cloud infrastructure"), and connection status badge (disconnected/connected/live). |
| Dynamic behavior | When a provider chip is selected, the system initiates a connection check. The corresponding card transitions from "Disconnected" → spinner → "Connected" with a green badge and "Live" pulse indicator. Other cards remain in their default disconnected state. |
| Secondary section | None |

---

### Step 3 of 6

**Step Title:** `Transform your data`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Logs collected aren't always in the perfect format. Would you like to make any changes to your log sources?* |
| Option type | Multi-select (checkboxes) |
| Options | |
| | Option 1: `Remove Personally Identifiable data` — Strip PII such as emails, IP addresses, and names from your log sources |
| | Option 2: `Add service catalog data` — Enrich logs with service ownership, team, and environment metadata |
| Action | `Skip for now` — text link below the options to advance without selecting any transformations |
| Default selection | None selected |
| Confirmation message (if selections made) | ✓ DONE — Applying **{selected transformations}** to your data pipeline. |
| Confirmation message (if skipped) | ✓ DONE — No transformations applied. You can configure these later from settings. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Data Transformations` |
| Panel subtitle | `Enrich and clean your log sources` |
| Content type | Configuration summary |
| Content details | A visual before/after comparison showing a sample log entry. The "before" shows raw log output with highlighted PII fields and missing metadata. The "after" updates dynamically based on selected transformations: PII fields redacted (shown as `[REDACTED]`) and/or service catalog fields appended (e.g., `service.team`, `service.environment`). |
| Dynamic behavior | As the user checks/unchecks transformations on the left, the "after" preview updates in real-time. When "Remove Personally Identifiable data" is checked, PII fields in the sample log are masked. When "Add service catalog data" is checked, additional metadata fields appear in the log entry. If nothing is selected, the "after" panel shows the raw log unchanged with a note: "No transformations selected." |
| Secondary section | **Pipeline Status** — Shows the current data connection health: ✓ "Connection valid — data flowing" or ⚠ "Connection issue — check credentials". If validation fails, an inline retry/fix prompt appears in the left panel. |

---

### Step 4 of 6

**Step Title:** `Review and confirm`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Here's a summary of your setup. Everything look good?* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Looks good — deploy my configuration` | Option 1 is primary button |
| | Option 2: `I want to make changes` |
| Default selection | None |
| Confirmation message | ✓ DONE — Configuration deployed! Collecting data now. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Configuration Summary` |
| Panel subtitle | `Review before deploying` |
| Content type | Configuration summary |
| Content details | A structured summary card showing all selections: (1) Observation goal, (2) Environment, (3) Data source / provider, (4) Signals enabled (metrics, logs, traces), (5) Estimated data volume, (6) Index patterns to be created. Each row shows the step title, selected value, and an edit icon. |
| Dynamic behavior | If user selects "I want to make changes," the right panel highlights the editable fields and the left panel navigates back to the relevant step. If user confirms, a deployment progress indicator appears showing: creating indices → configuring pipeline → starting collection → verifying data flow. |

---

### Step 5 of 6

**Step Title:** `Collecting your data`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Your pipeline is deployed and data is flowing in! I'm collecting logs, metrics, and traces from your sources. You can watch the live counts on the right — once you're satisfied, continue to finish setup.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Continue` | Option 1 is primary button |
| Default selection | None |
| Confirmation message | ✓ DONE — Data collection verified. Your observability pipeline is active. |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Live Data Collection` |
| Panel subtitle | `Watching your data flow in real-time` |
| Content type | Live counters dashboard |
| Content details | Three large stat counters stacked vertically, each with an icon, label, count, and sparkline: (1) **Logs** — document icon, count animating upward (e.g., 1,204 → 1,247 → 1,302…), mini sparkline showing ingest rate. (2) **Metrics** — chart icon, count animating upward (e.g., 8,491 → 8,530 → 8,576…), mini sparkline. (3) **Traces** — branch icon, count animating upward (e.g., 342 → 358 → 371…), mini sparkline. Each counter has a colored status dot (green = healthy) and a rate indicator (e.g., "+12/s"). |
| Dynamic behavior | Counters increment in real-time (polling every 1–2 seconds). Numbers animate with a counting-up effect. Sparklines extend with each new data point. If a signal type was not enabled in earlier steps, that row shows as "—" (disabled) with a muted style. A subtle pulse animation on the green dots indicates active data flow. |
| Secondary section | **Collection Health** — A summary bar at the bottom showing: overall status (✓ Healthy), uptime since deployment, total documents indexed, and average ingest latency. If any signal stops flowing, the dot turns amber with a "Stalled" label. |

---

### Step 6 of 6

**Step Title:** `You're all set!`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Your observability pipeline is live! Data is flowing into OpenSearch. Here are some next steps to explore.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Start using OpenSearch` — View your pre-built observability dashboards | Primary button for option 1 |
| | Option 2: `Set up Alerts` — Configure alerting rules for your signals |
| | Option 3: `Collect data sources` — Connect additional providers or applications |
| | Option 4: `Import dashboards and queries` — Import objects from other platforms such as Splunk, Elastic, and Datadog |
| Default selection | None |
| Confirmation message | *(No confirmation needed — selections navigate to the chosen destination)* |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `Observability Dashboard` |
| Panel subtitle | `Your data is flowing` |
| Content type | Status dashboard |
| Content details | A live mini-dashboard showing: (1) Health status — green "Healthy" badge, (2) Data ingestion rate chart (sparkline over last 5 minutes), (3) Signal breakdown — metrics count, logs count, traces count, (4) Quick stats: indices created, documents indexed, avg latency. |
| Dynamic behavior | The dashboard updates in real-time as data flows in. Numbers animate/count up. Sparkline charts show live data points arriving. |
| Secondary section | **Quick Links** — A row of icon links: Documentation, Community, Support, API Reference. |

---

## Interaction Patterns

| Behavior | Description |
|----------|-------------|
| Typing animation | System (assistant) messages are streamed word-by-word with a typing effect (~30ms per token), matching the thread page's streaming pattern. Interactive options (chips, multi-select) only appear after the typing animation completes. |
| Step transition | Auto-advances to the next step ~1 second after confirmation. No "Continue" button — the flow progresses automatically once the user makes a selection and the confirmation displays. The last step (Step 6) does not auto-advance; its chips navigate to other pages. When advancing to a new main step, the chat history from previous main steps is cleared — only sub-step history within the current main step is visible. |
| Back navigation | Users can click on any completed main step dot in the progress timeline to navigate back. Changes to earlier steps cascade-reset subsequent steps. Sub-step 1c also has an explicit "Go back" option that returns to 1b. |
| Skip steps | Sub-step 1b (environment) is skippable if user chose "sample data" in sub-step 1a. A "Skip" text link appears below the options. |
| Validation | Sub-steps 1a–1c and Step 2 require a selection before advancing. Step 2 additionally validates that the connection is successful before showing confirmation. Step 3 allows skipping without selection. Step 4 requires explicit confirmation via chip selection ("Looks good"). Step 5 requires user to click "Continue" chip after observing live data. |
| Loading states | Sub-step 1c shows a collector verification spinner when "I am ready" is clicked. Step 2 shows a connection/validation spinner (2–5s) after provider selection. Step 4 shows a deployment progress bar with stage indicators when user confirms. Step 5 shows live-updating counters immediately upon entering. |
| Completion | After Step 6, selecting a destination navigates the user out of the onboarding flow to the chosen feature (dashboards, discover, alerts, or back to onboarding for additional sources). |

---

## Flow Decision Logic (from diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 1: What do you want to observe? (contains 3 sub-steps)             │
│                                                                          │
│  [Start] → 1a: Choose observation goal                                  │
│         ├─ "Application" → 1b: Select environment                       │
│         ├─ "Cloud services" → 1b: Select environment (cloud preset)     │
│         └─ "Sample data" → Skip to 1c (pre-configured)                 │
│                                                                          │
│  1b: Select environment → 1c                                            │
│                                                                          │
│  1c: Configure OTel collector                                            │
│         ├─ "I am ready" → Step 2                                        │
│         └─ "Go back" → 1b                                               │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 2: Connect data source                                              │
│                                                                          │
│         → [Attempt connection]                                          │
│         → ◇ Is connection valid?                                        │
│           ├─ YES → Step 3: Transform your data                          │
│           └─ NO  → Show error + retry prompt (loop back)                │
│                                                                          │
│ STEP 3: Transform your data                                              │
│         → User multi-selects transformations OR clicks "Skip for now"   │
│         ├─ Selections made → Apply transformations → Step 4             │
│         └─ "Skip for now" → No transformations applied → Step 4         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ STEP 4: Review and confirm                                               │
│         ├─ "Looks good" → [Deploy configuration]                        │
│         │              → Step 5: Live data collection                    │
│         └─ "Make changes" → Navigate back to relevant step              │
│                                                                          │
│ STEP 5: Collecting your data                                             │
│         → Live counters show logs, metrics, traces incrementing         │
│         → "Continue" → Step 6: Completion                               │
│                                                                          │
│ STEP 6: You're all set!                                                  │
│         → User selects destination → Exit onboarding                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Visual Style Notes

Based on the screenshot reference:

- Left panel has a subtle gradient background (light blue/teal tint)
- Right panel has a card-based white container with rounded corners and subtle shadows
- Option chips use dark fills with white text (pill-shaped buttons)
- Progress dots between steps use teal/green coloring
- "DONE" status cards have a green checkmark icon and bordered container
- Decision/validation states use yellow/amber highlighting (as seen in the flowchart's middle panel)
- Error states use red/destructive coloring with retry action
- Option chips and multi-select options are left-aligned, matching the system message alignment
- The overall feel is clean, spacious, and conversational

---

## Technical Notes

- This page is rendered at the `/onboarding-wizard` route
- Wrapped in the application chrome: a fixed-position outer container with the `samplePagesLeftNav` (logo-only, no nav items) and the `samplePagesContentPanel` content area
- The wizard itself uses `position: absolute` to fill the content panel (not `position: fixed`, since it lives inside the chrome wrapper)
- Built using OUI components (OuiFlexGroup, OuiText, OuiIcon, OuiStat, OuiToolTip, etc.)
- Only uses existing OUI icons from `src/components/icon/assets/`
- Must render correctly under both `v9-light` and `v9-dark` themes
- Step data is defined as a JS config array (`STEPS`), making it easy to add/remove/reorder steps
- Validation logic (connection checks) will be async with timeout and retry support
- State management tracks: current step, selections per step, validation status, and connection health

---

## Example Step (from screenshot — Step 3)

For reference, here's how the screenshot content maps to this spec:

**Step Title:** `Connect your data source`

#### Left Panel
- **System message:** "Next: hook up your ⊙ telemetry. Where does your infrastructure live?"
- **Option type:** Chips
- **Options:** AWS, Azure, GCP, On-premises
- **Confirmation:** "✓ DONE — Connected to ⊙ Azure. I'm seeing ⊞ 6 services and ⊙ 42 log groups."

#### Right Panel
- **Panel title:** "Data sources"
- **Panel subtitle:** "Where telemetry comes from"
- **Content type:** Card grid
- **Content details:** 3–4 provider cards (AWS, Azure, GCP) each with logo, provider name, subtitle, and connection status. Azure shows "Connected" badge + "Live" indicator.
- **Secondary section:** "LIVE INGEST" dashboard showing event count (2,347 events/s), with sparkline rows for Metrics (~2,347/s), Logs (~189/s), Traces (~56/s), each with colored dot indicators and toggle switches.
