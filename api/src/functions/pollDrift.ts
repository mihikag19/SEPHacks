import { app, InvocationContext, Timer } from "@azure/functions";
import { fetchLiveResources } from "../lib/azure-client.js";
import { loadBaseline, compareResources } from "../lib/diff-engine.js";
import { classifyAll } from "../lib/classifier.js";
import { generateRemediationPR } from "../lib/github-pr.js";
import { DriftReport, DriftClassification } from "../types/index.js";

// In-memory store for the latest drift report (will be replaced with persistent storage)
let latestReport: DriftReport | null = null;

export function getLatestReport(): DriftReport | null {
  return latestReport;
}

async function pollDrift(_timer: Timer, context: InvocationContext): Promise<void> {
  context.log("Drift Sentinel — starting drift poll");

  const baselinePath = process.env.BASELINE_PATH ?? "../baselines/qa-validated-baseline.tfstate.json";

  try {
    const { serial, resources: baselineResources } = await loadBaseline(baselinePath);
    context.log(`Loaded baseline (serial ${serial}) with ${baselineResources.length} resources`);

    const liveResources = await fetchLiveResources();
    context.log(`Fetched ${liveResources.length} live resources`);

    const drifts = compareResources(baselineResources, liveResources);
    context.log(`Detected ${drifts.length} drifted resources`);

    const classifications = await classifyAll(drifts);

    const summary = {
      allowed: classifications.filter((c) => c.severity === "allowed").length,
      suspicious: classifications.filter((c) => c.severity === "suspicious").length,
      critical: classifications.filter((c) => c.severity === "critical").length,
    };

    latestReport = {
      id: `report-${Date.now()}`,
      environment: "production",
      timestamp: new Date().toISOString(),
      baselineSerial: serial,
      totalResources: baselineResources.length,
      drifts: classifications,
      summary,
    };

    context.log(
      `Drift report: ${summary.critical} critical, ${summary.suspicious} suspicious, ${summary.allowed} allowed`
    );

    // Auto-generate PRs for critical drifts
    const criticalDrifts = classifications.filter((c) => c.severity === "critical");
    for (const critical of criticalDrifts) {
      const pr = await generateRemediationPR(critical);
      context.log(`Generated remediation PR: ${pr.prTitle}`);
      // TODO: Actually create the GitHub PR via Octokit
    }
  } catch (error) {
    context.error("Drift poll failed", error);
    throw error;
  }
}

app.timer("pollDrift", {
  schedule: "0 */5 * * * *",
  handler: pollDrift,
});
