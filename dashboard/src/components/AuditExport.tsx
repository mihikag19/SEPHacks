import { useState, useCallback } from "react";
import type { StatusResponse, DriftEvent } from "../types";

interface Props {
  status: StatusResponse;
  events: DriftEvent[];
}

function buildReport(status: StatusResponse, events: DriftEvent[]) {
  return {
    velira_audit_report: {
      generated_at: new Date().toISOString(),
      environment: status.environment,
      baseline_version: status.baseline_serial,
      environment_state: status.state,
      risk_score: status.risk_score,
      total_resources: status.total_resources,
      compliant_resources: status.compliant_resources,
      drifted_resources: status.drifted_resources,
      total_events: events.length,
      summary: status.summary,
    },
    drift_events: events.map((e) => ({
      timestamp: e.timestamp,
      resource_name: e.resource_name,
      resource_type: e.resource_type,
      severity: e.severity,
      what_changed: {
        field: e.attribute_path,
        baseline_value: e.baseline_value,
        current_value: e.current_value,
      },
      gxp_impact: e.gxp_impact,
      fda_regulation: e.cfr_reference,
      remediation: e.remediation_suggestion,
      pr_url: e.pr_link,
      status: e.pr_link ? "pr_opened" : "detected",
    })),
  };
}

function formatFilename() {
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  return `velira-audit-trail-${ts}.json`;
}

export default function AuditExport({ status, events }: Props) {
  const [copied, setCopied] = useState(false);

  const getJson = useCallback(() => {
    return JSON.stringify(buildReport(status, events), null, 2);
  }, [status, events]);

  const handleDownload = useCallback(() => {
    const json = getJson();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = formatFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [getJson]);

  const handleCopy = useCallback(async () => {
    const json = getJson();
    await navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [getJson]);

  return (
    <div className="audit-export">
      <button className="audit-btn" onClick={handleDownload}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 2v8m0 0L5 7m3 3l3-3"/>
          <path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2"/>
        </svg>
        Export Audit Report
      </button>
      <button className="audit-btn" onClick={handleCopy}>
        {copied ? (
          <>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 8.5l2.5 2.5L12 5"/>
            </svg>
            Copied
          </>
        ) : (
          <>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="5" width="8" height="8" rx="1"/>
              <path d="M3 11V3a1 1 0 011-1h8"/>
            </svg>
            Copy Report
          </>
        )}
      </button>
    </div>
  );
}
