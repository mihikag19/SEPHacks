import { DriftClassification, RemediationPR } from "../types/index.js";

/**
 * Generates a GitHub pull request with remediation Terraform code
 * and a pre-written GxP change justification.
 *
 * In production, this will use the GitHub API (via Octokit or `gh` CLI)
 * to create branches and PRs. For now, returns the PR payload.
 */
export async function generateRemediationPR(
  classification: DriftClassification
): Promise<RemediationPR> {
  const { driftItem, reason, gxpImpact, cfrReference, remediationSuggestion } =
    classification;

  const resourceRef = `${driftItem.resourceType}.${driftItem.resourceName}`;
  const driftedFields = driftItem.fields
    .map((f) => `  - ${f.path}: ${JSON.stringify(f.liveValue)} → ${JSON.stringify(f.baselineValue)}`)
    .join("\n");

  const terraformDiff = generateTerraformRemediation(classification);

  const changeJustification = [
    `## GxP Change Justification`,
    ``,
    `**Change Control ID:** CHG-${Date.now().toString(36).toUpperCase()}`,
    `**Classification:** Critical Drift Remediation (Automated)`,
    `**Regulatory Reference:** ${cfrReference}`,
    ``,
    `### Description of Change`,
    `Automated remediation of configuration drift detected on \`${resourceRef}\`.`,
    ``,
    `### Reason for Change`,
    reason,
    ``,
    `### GxP Impact Assessment`,
    gxpImpact,
    ``,
    `### Remediation Action`,
    remediationSuggestion,
    ``,
    `### Drifted Fields`,
    driftedFields,
    ``,
    `### Risk Assessment`,
    `- **Pre-remediation risk:** HIGH — GxP compliance violation detected`,
    `- **Post-remediation risk:** LOW — Configuration restored to validated baseline`,
    ``,
    `### Validation Impact`,
    `This change restores the system to its validated state. No re-validation required `,
    `per GAMP 5 guidelines for configuration restoration to a known-good baseline.`,
    ``,
    `### Approval`,
    `- [ ] QA Review`,
    `- [ ] Security Review`,
    `- [ ] Change Advisory Board`,
  ].join("\n");

  const prTitle = `[CRITICAL DRIFT] Remediate ${resourceRef} — ${reason}`;

  const prBody = [
    `## Automated Drift Remediation`,
    ``,
    `Drift Sentinel detected a **critical** configuration drift on \`${resourceRef}\` `,
    `that violates GxP compliance requirements.`,
    ``,
    `### Drift Details`,
    `- **Resource:** \`${driftItem.resourceId}\``,
    `- **Detected at:** ${driftItem.detectedAt}`,
    `- **Fields affected:**`,
    driftedFields,
    ``,
    `### Regulatory Reference`,
    `${cfrReference}`,
    ``,
    `---`,
    ``,
    changeJustification,
  ].join("\n");

  return {
    driftClassification: classification,
    prTitle,
    prBody,
    terraformDiff,
    changeJustification,
  };
}

function generateTerraformRemediation(classification: DriftClassification): string {
  const { driftItem } = classification;
  const lines: string[] = [
    `# Remediation for ${driftItem.resourceType}.${driftItem.resourceName}`,
    `# Restores drifted fields to QA-validated baseline values`,
    ``,
  ];

  for (const field of driftItem.fields) {
    lines.push(`# ${field.path}`);
    lines.push(`# Live (drifted):  ${JSON.stringify(field.liveValue)}`);
    lines.push(`# Baseline (correct): ${JSON.stringify(field.baselineValue)}`);
    lines.push(``);
  }

  lines.push(`# Apply by running: terraform apply -target=${driftItem.resourceType}.${driftItem.resourceName}`);

  return lines.join("\n");
}
