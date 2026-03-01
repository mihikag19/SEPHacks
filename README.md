# Drift Sentinel

GxP-aware cloud configuration drift detection for biotech companies.

Drift Sentinel continuously monitors Azure cloud infrastructure against a validated QA baseline, classifies deviations through a GxP/FDA 21 CFR Part 11 compliance lens, and auto-generates remediation pull requests for critical drift.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Drift Sentinel                           │
│                                                                 │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │ Azure        │    │ Diff Engine  │    │ AI Classifier    │  │
│  │ Resource     ├───►│              ├───►│ (GxP Lens)       │  │
│  │ Poller       │    │ Live vs      │    │                  │  │
│  │ (Timer: 5m)  │    │ Baseline     │    │ Allowed /        │  │
│  └──────────────┘    └──────────────┘    │ Suspicious /     │  │
│                                          │ Critical         │  │
│  ┌──────────────┐    ┌──────────────┐    └────────┬─────────┘  │
│  │ QA Baseline  │    │ GitHub PR    │◄────────────┘            │
│  │ (Terraform   │    │ Generator    │  (Critical → auto-PR)   │
│  │  State JSON) │    │              │                          │
│  └──────────────┘    └──────────────┘                          │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              React Dashboard                             │   │
│  │  Real-time risk status • Drift timeline • Environment   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## What It Monitors

| Resource Type         | GxP-Critical Settings                          |
|-----------------------|------------------------------------------------|
| Storage Accounts      | Encryption (AES-256), HTTPS-only, access tier  |
| Key Vaults            | Soft delete, purge protection, access policies |
| Network Security Groups | Inbound/outbound rules, port restrictions    |
| SQL Databases         | TDE, auditing, backup retention                |
| IAM Role Assignments  | Least-privilege roles, scope boundaries        |

## Project Structure

```
drift-sentinel/
├── api/                  # Azure Functions backend (Node.js/TypeScript)
│   └── src/
│       ├── functions/    # Azure Function handlers
│       ├── lib/          # Core logic (diff engine, classifier, etc.)
│       └── types/        # TypeScript interfaces
├── baselines/            # Validated QA baseline configs
├── dashboard/            # React frontend (coming soon)
└── docs/                 # Architecture and compliance docs
```

## Quick Start

```bash
# Install dependencies
npm install

# Type-check the backend
npm run typecheck

# Start Azure Functions locally
npm run dev
```

## GxP Compliance Context

This tool is designed for environments governed by:
- **FDA 21 CFR Part 11** — Electronic records and signatures
- **EU Annex 11** — Computerised systems
- **GAMP 5** — Good Automated Manufacturing Practice

Every detected drift is classified against these frameworks. Critical drift (e.g., encryption disabled on a GxP-validated storage account) triggers automatic remediation with a pre-written change justification suitable for audit trails.

## Roadmap

- [x] Project scaffold and mock baseline
- [ ] Drift diff engine with deep comparison
- [ ] AI-powered GxP drift classification
- [ ] GitHub PR auto-generation with remediation code
- [ ] React dashboard with real-time risk status
- [ ] Webhook alerts (Slack, Teams, email)
