export type DriftSeverity = "allowed" | "suspicious" | "critical";

export interface BaselineResource {
  type: string;
  name: string;
  provider: string;
  attributes: Record<string, unknown>;
}

export interface LiveResource {
  type: string;
  name: string;
  id: string;
  attributes: Record<string, unknown>;
  fetchedAt: string;
}

export interface DriftField {
  path: string;
  baselineValue: unknown;
  liveValue: unknown;
}

export interface DriftItem {
  resourceType: string;
  resourceName: string;
  resourceId: string;
  fields: DriftField[];
  detectedAt: string;
}

export interface DriftClassification {
  driftItem: DriftItem;
  severity: DriftSeverity;
  reason: string;
  gxpImpact: string;
  cfrReference: string;
  remediationSuggestion: string;
}

export interface DriftReport {
  id: string;
  environment: string;
  timestamp: string;
  baselineSerial: number;
  totalResources: number;
  drifts: DriftClassification[];
  summary: {
    allowed: number;
    suspicious: number;
    critical: number;
  };
}

export interface RemediationPR {
  driftClassification: DriftClassification;
  prTitle: string;
  prBody: string;
  terraformDiff: string;
  changeJustification: string;
}
