import { DriftItem, DriftClassification, DriftSeverity } from "../types/index.js";

/**
 * Classifies drift items through a GxP / FDA 21 CFR Part 11 lens.
 *
 * In production, this will call an AI model (e.g., Claude or GPT) with a
 * system prompt encoding GxP rules. For now, uses a rule-based heuristic
 * as a placeholder.
 */
export async function classifyDrift(drift: DriftItem): Promise<DriftClassification> {
  // Rule-based heuristic classifier (will be replaced with AI)
  const { severity, reason, gxpImpact, cfrReference, remediationSuggestion } =
    applyHeuristics(drift);

  return {
    driftItem: drift,
    severity,
    reason,
    gxpImpact,
    cfrReference,
    remediationSuggestion,
  };
}

export async function classifyAll(drifts: DriftItem[]): Promise<DriftClassification[]> {
  return Promise.all(drifts.map(classifyDrift));
}

interface HeuristicResult {
  severity: DriftSeverity;
  reason: string;
  gxpImpact: string;
  cfrReference: string;
  remediationSuggestion: string;
}

const CRITICAL_PATTERNS: Array<{ test: (d: DriftItem) => boolean; result: Omit<HeuristicResult, "severity"> }> = [
  {
    test: (d) => d.fields.some((f) => f.path.includes("encryption") && f.liveValue === false),
    result: {
      reason: "Encryption was disabled on a GxP-validated resource",
      gxpImpact: "Loss of data confidentiality for regulated records; potential data integrity violation",
      cfrReference: "21 CFR Part 11 §11.10(c) — Protection of electronic records",
      remediationSuggestion: "Re-enable encryption and rotate affected keys immediately",
    },
  },
  {
    test: (d) => d.fields.some((f) => f.path.includes("public_network_access_enabled") && f.liveValue === true),
    result: {
      reason: "Public network access was enabled on a GxP-validated resource",
      gxpImpact: "GxP-regulated data exposed to unauthorized network access; violates access control requirements",
      cfrReference: "21 CFR Part 11 §11.10(d) — Limiting system access to authorized individuals",
      remediationSuggestion: "Disable public network access and ensure private endpoint connectivity",
    },
  },
  {
    test: (d) => d.fields.some((f) => f.path.includes("purge_protection_enabled") && f.liveValue === false),
    result: {
      reason: "Purge protection disabled on Key Vault containing GxP secrets",
      gxpImpact: "Cryptographic keys protecting regulated data can be permanently deleted; irreversible data loss risk",
      cfrReference: "21 CFR Part 11 §11.10(c) — Protection of electronic records to enable accurate and ready retrieval",
      remediationSuggestion: "Re-enable purge protection on the Key Vault",
    },
  },
  {
    test: (d) => d.fields.some((f) => f.path.includes("threat_detection") && f.liveValue === "Disabled"),
    result: {
      reason: "Threat detection disabled on database containing clinical trial data",
      gxpImpact: "Loss of security monitoring for GxP-regulated database; audit trail gap",
      cfrReference: "21 CFR Part 11 §11.10(e) — Use of secure audit trails",
      remediationSuggestion: "Re-enable Advanced Threat Protection on the SQL database",
    },
  },
  {
    test: (d) => d.fields.some((f) =>
      f.path === "role_definition_name" &&
      f.baselineValue !== f.liveValue &&
      (f.liveValue === "Owner" || f.liveValue === "Contributor")
    ),
    result: {
      reason: "IAM role escalation detected — privilege elevated beyond validated baseline",
      gxpImpact: "Violation of least-privilege access model for GxP environment; unauthorized access risk",
      cfrReference: "21 CFR Part 11 §11.10(d) — Limiting system access to authorized individuals",
      remediationSuggestion: "Revert role assignment to the validated baseline role",
    },
  },
  {
    test: (d) => d.fields.some((f) => {
      if (!f.path.includes("security_rule") || !Array.isArray(f.liveValue)) return false;
      const rules = f.liveValue as Array<Record<string, unknown>>;
      return rules.some((r) =>
        r.source_address_prefix === "Internet" && r.access === "Allow" && r.direction === "Inbound"
      );
    }),
    result: {
      reason: "NSG rule allowing inbound Internet traffic added to GxP data tier",
      gxpImpact: "GxP network perimeter breached; regulated data tier exposed to internet",
      cfrReference: "21 CFR Part 11 §11.10(d) — Limiting system access to authorized individuals",
      remediationSuggestion: "Remove the inbound Internet allow rule from the NSG",
    },
  },
];

function applyHeuristics(drift: DriftItem): HeuristicResult {
  for (const pattern of CRITICAL_PATTERNS) {
    if (pattern.test(drift)) {
      return { severity: "critical", ...pattern.result };
    }
  }

  // Suspicious: tag changes on GxP resources, non-critical config changes
  const hasTagDrift = drift.fields.some((f) => f.path.includes("tags"));
  if (hasTagDrift) {
    return {
      severity: "suspicious",
      reason: "Tags modified on a GxP-validated resource",
      gxpImpact: "May affect resource traceability and audit classification",
      cfrReference: "21 CFR Part 11 §11.10(e) — Audit trail integrity",
      remediationSuggestion: "Review tag changes and revert if not approved via change control",
    };
  }

  return {
    severity: "allowed",
    reason: "Configuration change does not impact GxP-critical settings",
    gxpImpact: "No direct impact on regulated data or access controls",
    cfrReference: "N/A",
    remediationSuggestion: "No action required — log for audit trail",
  };
}
