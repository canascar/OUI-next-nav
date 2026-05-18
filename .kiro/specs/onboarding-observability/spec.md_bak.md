# Onboarding Experience: OpenSearch Observability Data Collection

## Overview

A step-by-step guided onboarding wizard for collecting data into OpenSearch Observability. The experience uses a split-panel layout:

- **Left panel (Conversation):** A guided conversational flow where the system asks questions and the user selects options (chips, cards, or buttons). Includes step progress indicator and status confirmations. Use assistant-ui components for conversational interface. Use tool-ui components option list when option type is checkbox or radio.
- **Right panel (Preview/Context):** A contextual panel that shows a visual preview of the user's selections, live data feedback, or supplementary information related to the current step.

---

## Layout Specification

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Full-screen, no chrome (no left nav, no top header)                    │
├────────────────────────────┬────────────────────────────────────────────┤
│                            │                                            │
│  LEFT PANEL                │  RIGHT PANEL                               │
│  (~35-40% width)           │  (~60-65% width)                           │
│                            │                                            │
│  ┌─ Step indicator ──────┐ │  ┌─ Contextual preview ─────────────────┐  │
│  │ Step X/N · Step Title │ │  │                                      │  │
│  └───────────────────────┘ │  │  Visual content changes per step:    │  │
│                            │  │  - Cards / tiles                      │  │
│  ┌─ Question bubble ───────┐ │  │  - Live data charts                  │  │
│  │ System message with   │ │  │  - Configuration previews            │  │
│  │ inline links/emphasis │ │  │  - Status indicators                 │  │
│  └───────────────────────┘ │  │                                      │  │
│                            │  │                                      │  │
│  ┌-Selections from question─┐ │  │                                      │  │
│  │ • Chips (pill buttons)│ │  └──────────────────────────────────────┘  │
│  │ • Cards               │ │                                            │
│  │ • Input fields        │ │                                            │
│  └───────────────────────┘ │                                            │
│                            │                                            │
│  ┌─ Feedback after user selects option ─┐ │                                            │
│  │ ✓ DONE                │ │                                            │
│  │ Summary of selection  │ │                                            │
│  └───────────────────────┘ │                                            │
│                            │                                            │
│                            │                                            │
├────────────────────────────┴────────────────────────────────────────────┤
│                     [ Finish onboarding later ]                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Global Elements

| Element | Description | Notes |
|---------|-------------|-------|
| Step indicator | `Step X/N · Step Title` at top-left | Shows progress through the flow |
| Progress dots | Vertical dot trail between steps (timeline) | Indicates completed/current/upcoming |
| "Finish onboarding later" link | Bottom center of page | Allows user to exit and resume later |
| Background | Light gradient (left panel slightly different from right) | Sets onboarding apart from main app |

---

## Steps Definition

Fill in each step below with the content you'd like to appear in the prototype.

---

### Step 1 of N

**Step Title:** `What do you want to observe`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | *Welcome to OpenSearch, I'll help you set up your data* |
| Option type | Chips (pill buttons)|
| Options | |
| | Option 1: `Collect data from your application` |
| | Option 2: `Connect with cloud services` |
| | Option 3: `Get started with sample data` |
| Default selection | *(Pre-selected option, if any)* |
| Confirmation message | *(Text shown in the "DONE" status card after the user selects, e.g., "Connected to ⊙ Azure. I'm seeing ⊞ 6 services and ⊙ 42 log groups.")* |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | `_______` |
| Panel subtitle | `_______` |
| Content type | ☐ Card grid / ☐ Data visualization / ☐ Code preview / ☐ Configuration summary / ☐ Status dashboard / ☐ Custom |
| Content details | *(Describe what should be displayed. E.g., "3 cloud provider cards — AWS, Azure, GCP — each showing logo, name, and connection status badge")* |
| Dynamic behavior | *(How does the right panel react to user selection on the left? E.g., "Selected provider card gets a 'Connected' badge and turns green")* |
| Secondary section | *(Optional — additional content below the main preview, e.g., a "LIVE INGEST" chart showing metrics/logs/traces)* |

---

### Step 2 of N

**Step Title:** `___________________________________________`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | |
| Option type | ☐ Chips / ☐ Cards / ☐ Radio buttons / ☐ Text input / ☐ Multi-select |
| Options | |
| | Option 1: `_______` |
| | Option 2: `_______` |
| | Option 3: `_______` |
| | Option 4: `_______` |
| Default selection | |
| Confirmation message | |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | |
| Panel subtitle | |
| Content type | ☐ Card grid / ☐ Data visualization / ☐ Code preview / ☐ Configuration summary / ☐ Status dashboard / ☐ Custom |
| Content details | |
| Dynamic behavior | |
| Secondary section | |

---

### Step 3 of N

**Step Title:** `___________________________________________`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | |
| Option type | ☐ Chips / ☐ Cards / ☐ Radio buttons / ☐ Text input / ☐ Multi-select |
| Options | |
| | Option 1: `_______` |
| | Option 2: `_______` |
| | Option 3: `_______` |
| | Option 4: `_______` |
| Default selection | |
| Confirmation message | |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | |
| Panel subtitle | |
| Content type | ☐ Card grid / ☐ Data visualization / ☐ Code preview / ☐ Configuration summary / ☐ Status dashboard / ☐ Custom |
| Content details | |
| Dynamic behavior | |
| Secondary section | |

---

### Step 4 of N

**Step Title:** `___________________________________________`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | |
| Option type | ☐ Chips / ☐ Cards / ☐ Radio buttons / ☐ Text input / ☐ Multi-select |
| Options | |
| | Option 1: `_______` |
| | Option 2: `_______` |
| | Option 3: `_______` |
| | Option 4: `_______` |
| Default selection | |
| Confirmation message | |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | |
| Panel subtitle | |
| Content type | ☐ Card grid / ☐ Data visualization / ☐ Code preview / ☐ Configuration summary / ☐ Status dashboard / ☐ Custom |
| Content details | |
| Dynamic behavior | |
| Secondary section | |

---

### Step 5 of N

**Step Title:** `___________________________________________`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | |
| Option type | ☐ Chips / ☐ Cards / ☐ Radio buttons / ☐ Text input / ☐ Multi-select |
| Options | |
| | Option 1: `_______` |
| | Option 2: `_______` |
| | Option 3: `_______` |
| | Option 4: `_______` |
| Default selection | |
| Confirmation message | |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | |
| Panel subtitle | |
| Content type | ☐ Card grid / ☐ Data visualization / ☐ Code preview / ☐ Configuration summary / ☐ Status dashboard / ☐ Custom |
| Content details | |
| Dynamic behavior | |
| Secondary section | |

---

### Step 6 of N

**Step Title:** `___________________________________________`

#### Left Panel — Question

| Field | Content |
|-------|---------|
| System message | |
| Option type | ☐ Chips / ☐ Cards / ☐ Radio buttons / ☐ Text input / ☐ Multi-select |
| Options | |
| | Option 1: `_______` |
| | Option 2: `_______` |
| | Option 3: `_______` |
| | Option 4: `_______` |
| Default selection | |
| Confirmation message | |

#### Right Panel — Preview

| Field | Content |
|-------|---------|
| Panel title | |
| Panel subtitle | |
| Content type | ☐ Card grid / ☐ Data visualization / ☐ Code preview / ☐ Configuration summary / ☐ Status dashboard / ☐ Custom |
| Content details | |
| Dynamic behavior | |
| Secondary section | |

---

## Interaction Patterns

Fill in any additional interaction details:

| Behavior | Description |
|----------|-------------|
| Step transition | *(How does the user advance? Auto-advance on selection? Explicit "Next" button? Both?)* |
| Back navigation | *(Can users go back to previous steps? How?)* |
| Skip steps | *(Are any steps optional/skippable?)* |
| Validation | *(Are selections required before advancing?)* |
| Loading states | *(Should any steps show loading/processing animations after selection?)* |
| Completion | *(What happens after the final step? Redirect to dashboard? Show summary?)* |

---

## Visual Style Notes

Based on the screenshot reference:

- Left panel has a subtle gradient background (light blue/teal tint)
- Right panel has a card-based white container with rounded corners and subtle shadows
- Option chips use dark fills with white text (pill-shaped buttons)
- Progress dots between steps use teal/green coloring
- "DONE" status cards have a green checkmark icon and bordered container
- The overall feel is clean, spacious, and conversational

---

## Technical Notes

- This page will be added as a new route (e.g., `/onboarding-v2` or replaces the existing `/onboarding`)
- Built using OUI components (OuiFlexGroup, OuiText, OuiIcon, OuiStat, etc.)
- Only uses existing OUI icons from `src/components/icon/assets/`
- Must render correctly under both `v9-light` and `v9-dark` themes
- Step data will be defined as a JSON/JS config array, making it easy to add/remove/reorder steps

---

## Example Step (from screenshot — Step 3)

For reference, here's how the screenshot content maps to this spec:

**Step Title:** `Connect your data source`

#### Left Panel
- **System message:** "Next: hook up your ⊙ telemetry. Where does your infrastructure live?"
- **Option type:** Chips
- **Options:** Azure (other options implied but not shown)
- **Confirmation:** "✓ DONE — Connected to ⊙ Azure. I'm seeing ⊞ 6 services and ⊙ 42 log groups."

#### Right Panel
- **Panel title:** "Data sources"
- **Panel subtitle:** "Where telemetry comes from"
- **Content type:** Card grid
- **Content details:** 3 provider cards (AWS, Azure, GCP) each with logo, provider name, subtitle, and connection status. Azure shows "Connected" badge + "Live" indicator.
- **Secondary section:** "LIVE INGEST" dashboard showing event count (2,347 events/s), with sparkline rows for Metrics (~2,347/s), Logs (~189/s), Traces (~56/s), each with colored dot indicators and toggle switches.
