# Velira Demo Environment

Mock biotech production infrastructure repository used to demonstrate **GxP configuration drift detection** by [Velira](https://github.com/shreyanair612/SEPHacks).

This repo represents an FDA 21 CFR Part 11 validated cloud environment. Velira monitors it for unauthorized configuration changes and auto-generates remediation PRs when critical drift is detected.

---

## Monitored Resources

| Resource | Type | Baseline |
|----------|------|----------|
| `genomics-data-storage-prod` | Azure Storage Account | Encryption enabled, HTTPS-only, TLS 1.2, public access disabled |
| `genomics-pipeline-nsg` | Network Security Group | Only port 443 allowed, source restricted to `10.0.0.0/8` |
| `pipeline-iam` | IAM Role Assignments | Reader-only access, MFA required, quarterly access review |

## How It Works

1. Velira continuously compares live infrastructure config against the validated baseline (`configs/baseline-v3.2.json`)
2. When drift is detected, it classifies the severity using Azure AI grounded in FDA regulations
3. For **critical** violations, Velira auto-generates a remediation PR targeting the affected Terraform file
4. QA managers review and merge the PR to restore GxP compliance

---

> Auto-generated PRs are created by the Velira GxP Compliance Engine.
