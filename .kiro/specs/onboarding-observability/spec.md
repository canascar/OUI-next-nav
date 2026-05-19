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
| Step indicator | `Step X/N · Step Title` at top-left | Shows progress through the flow |
| Progress dots | Vertical dot trail between steps (timeline) | Indicates completed/current/upcoming |
| "Finish onboarding later" link | Bottom center of page | Allows user to exit and resume later |
| Background | Light gradient (left panel slightly different from right) | Sets onboarding apart from main app |

---

## Flow Architecture (from diagram)

The onboarding flow is organized into three logical phases derived from the flowchart:

1. **Registration/Profile Phase** (Steps 1–2): Identify user intent and select technology stack
2. **Data Collection Phase** (Steps 3–5): Connect data source, validate connectivity, and configure/transform collection parameters
3. **Dashboard/Completion Phase** (Steps 6–8): Review configuration, observe live data collection, and launch observability dashboards

---

## Steps Definition

---

### Step 1 of 8

**Step Title:** `What do you want to observe?`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Welcome to OpenSearch Observability! I'll help you get your data flowing. What would you like to observe?* |
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
| Content type | Card grid |
| Content details | 3 illustrated cards representing each option: (1) Application icon with code brackets, (2) Cloud icon with connection lines, (3) Sample data icon with chart. Each card has a title, short description, and icon. |
| Dynamic behavior | When a chip is selected on the left, the corresponding card on the right highlights with a border glow and expands slightly to show additional detail about what that path includes. |
| Secondary section | None |

---

### Step 2 of 8

**Step Title:** `Select your environment`

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
| Default selection | None |
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

### Step 3 of 8

**Step Title:** `Configure your OpenTelemetry collector`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Run the following command to start your OpenTelemetry collector. Once it's running, click "I am ready" to continue.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `I am ready` |
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

### Step 4 of 8

**Step Title:** `Connect your data source`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Next: hook up your telemetry. Where does your infrastructure live?* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `OpenSearch` |
| | Option 2: `Prometheus` |
| | Option 3: `Amazon CloudWatch Logs` |
| | Option 4: `Amazon S3` |
| | Option 5: `Skip` |
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
| Secondary section | **LIVE INGEST** dashboard panel showing: total event count (e.g., 2,347 events/s) with sparkline rows for Metrics (~rate/s), Logs (~rate/s), Traces (~rate/s). Each row has a colored dot indicator and an on/off toggle. This section appears only after successful connection. |

---

### Step 5 of 8

**Step Title:** `Transform your data`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Your data is flowing! Logs from agents aren't always in the perfect format. Would you like to make any changes to your log sources? We have a few out-of-the-box options — you can always do this later if you want to just move forward.* |
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

### Step 6 of 8

**Step Title:** `Review and confirm`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Here's a summary of your setup. Everything look good?* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Looks good — deploy my configuration` |
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
| Secondary section | **Estimated Resources** — Shows estimated storage usage per day, number of indices created, and recommended instance type. |

---

### Step 7 of 8

**Step Title:** `Collecting your data`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Your pipeline is deployed and data is flowing in! I'm collecting logs, metrics, and traces from your sources. You can watch the live counts on the right — once you're satisfied, continue to finish setup.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Continue` |
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

### Step 8 of 8

**Step Title:** `You're all set!`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Your observability pipeline is live! Data is flowing into OpenSearch. Here are some next steps to explore.* |
| Option type | Chips (pill buttons) |
| Options | |
| | Option 1: `Go to Dashboards` — View your pre-built observability dashboards |
| | Option 2: `Explore in Discover` — Query your data in the Discover interface |
| | Option 3: `Set up Alerts` — Configure alerting rules for your signals |
| | Option 4: `Add more data sources` — Connect additional providers or applications |
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
| Step transition | Auto-advance after selection + confirmation animation (1s delay). Steps 3, 5, 6, and 7 require explicit confirmation before advancing due to their configuration/deployment nature. |
| Back navigation | Users can click on any completed step in the progress timeline (left side dots) to navigate back. Changes to earlier steps cascade-reset subsequent steps. Step 3 also has an explicit "Go back" option. |
| Skip steps | Step 2 (environment) is skippable if user chose "sample data" in Step 1. A "Skip" text link appears below the options. |
| Validation | Steps 1–4 require a selection before advancing. Step 4 additionally validates that the connection is successful before showing confirmation. Step 5 allows skipping without selection. Step 6 requires explicit confirmation. Step 7 requires user to click "Continue" after observing live data. |
| Loading states | Step 3 shows a collector verification spinner when "I am ready" is clicked. Step 4 shows a connection/validation spinner (2–5s) after provider selection. Step 6 shows a deployment progress bar with stage indicators when user confirms. Step 7 shows live-updating counters immediately upon entering. |
| Completion | After Step 8, selecting a destination navigates the user out of the onboarding flow to the chosen feature (dashboards, discover, alerts, or back to onboarding for additional sources). |

---

## Flow Decision Logic (from diagram)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: Registration / Profile                                          │
│                                                                          │
│  [Start] → Step 1: Choose observation goal                              │
│         ├─ "Application" → Step 2: Select environment                   │
│         ├─ "Cloud services" → Step 2: Select environment (cloud preset) │
│         └─ "Sample data" → Skip to Step 3 (pre-configured)             │
│                                                                          │
│  Step 2: Select environment → Step 3                                     │
│                                                                          │
│  Step 3: Configure OTel collector                                        │
│         ├─ "I am ready" → Step 4                                        │
│         └─ "Go back" → Step 2                                           │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: Data Collection / Validation                                    │
│                                                                          │
│  Step 4: Connect data source                                            │
│         → [Attempt connection]                                          │
│         → ◇ Is connection valid?                                        │
│           ├─ YES → Step 5: Configure collection parameters              │
│           └─ NO  → Show error + retry prompt (loop back)                │
│                                                                          │
│  Step 5: Transform your data                                            │
│         → User multi-selects transformations OR clicks "Skip for now"   │
│         ├─ Selections made → Apply transformations → Step 6             │
│         └─ "Skip for now" → No transformations applied → Step 6         │
└─────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: Dashboard / Completion                                          │
│                                                                          │
│  Step 6: Review and confirm                                             │
│         ├─ "Looks good" → [Deploy configuration]                        │
│         │              → Step 7: Live data collection                    │
│         └─ "Make changes" → Navigate back to relevant step              │
│                                                                          │
│  Step 7: Collecting your data                                           │
│         → Live counters show logs, metrics, traces incrementing         │
│         → "Continue" → Step 8: Completion                               │
│                                                                          │
│  Step 8: Completion                                                      │
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
