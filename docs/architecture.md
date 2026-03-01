# Drift Sentinel — Architecture

## Component Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         Azure Functions Host                         │
│                                                                      │
│  ┌────────────────────┐  ┌────────────────────┐  ┌───────────────┐  │
│  │ pollDrift          │  │ classifyDrift       │  │ getDriftStatus│  │
│  │ (Timer: 5 min)     │  │ (HTTP POST)         │  │ (HTTP GET)    │  │
│  │                    │  │                     │  │               │  │
│  │ 1. Fetch live      │  │ Classifies a single │  │ Returns the   │  │
│  │    Azure configs   │  │ DriftItem via AI    │  │ latest drift  │  │
│  │ 2. Load baseline   │  │ (or heuristic)      │  │ report to the │  │
│  │ 3. Diff            │  │                     │  │ dashboard     │  │
│  │ 4. Classify all    │  └────────────────────┘  └───────────────┘  │
│  │ 5. Generate PRs    │                                              │
│  └────────────────────┘                                              │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                        Shared Libraries                       │   │
│  │  azure-client.ts │ diff-engine.ts │ classifier.ts │ github-pr│   │
│  └──────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
          │                                              ▲
          ▼                                              │
┌──────────────────┐  ┌───────────────┐  ┌──────────────────────────┐
│ Azure Resource   │  │ QA Baseline   │  │ React Dashboard          │
│ Manager API      │  │ (tfstate JSON)│  │ (polls getDriftStatus)   │
└──────────────────┘  └───────────────┘  └──────────────────────────┘
```

## Data Flow

1. **Poll** — Timer triggers every 5 minutes, Azure SDK fetches live resource configs
2. **Diff** — Deep comparison of live state against validated QA baseline (Terraform state)
3. **Classify** — Each drift is classified as Allowed / Suspicious / Critical using GxP rules
4. **Remediate** — Critical drifts trigger GitHub PR generation with Terraform fix + change justification
5. **Report** — Dashboard queries the latest drift report via HTTP API

## GxP Compliance Design

### FDA 21 CFR Part 11 Mapping

| Section | Requirement | How Drift Sentinel Addresses It |
|---------|------------|-------------------------------|
| §11.10(a) | Validation | Baseline is a QA-validated Terraform state |
| §11.10(c) | Record protection | Detects encryption/access control changes |
| §11.10(d) | Access control | Detects IAM role escalations, network exposure |
| §11.10(e) | Audit trails | Every drift is logged with timestamps and classification |
| §11.10(g) | Authority checks | Detects unauthorized privilege changes |

### Classification Criteria

- **Allowed** — Non-GxP-critical changes (e.g., cost tags, scaling parameters)
- **Suspicious** — Changes that may affect compliance (e.g., tag modifications on validated resources)
- **Critical** — Direct violations of GxP controls (encryption disabled, public access enabled, role escalation)

## Technology Stack

- **Runtime:** Node.js 18+ with TypeScript
- **Backend:** Azure Functions v4 (programming model v4)
- **Cloud SDK:** Azure Resource Manager client libraries
- **Frontend:** React (planned)
- **AI Classification:** Pluggable — supports local LLMs or cloud AI APIs
- **VCS Integration:** GitHub API for PR generation
