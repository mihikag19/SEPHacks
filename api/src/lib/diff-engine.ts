import * as fs from "node:fs/promises";
import * as path from "node:path";
import { BaselineResource, DriftItem, DriftField, LiveResource } from "../types/index.js";

interface TerraformState {
  version: number;
  serial: number;
  resources: Array<{
    type: string;
    name: string;
    provider: string;
    instances: Array<{ attributes: Record<string, unknown> }>;
  }>;
}

export async function loadBaseline(baselinePath: string): Promise<{ serial: number; resources: BaselineResource[] }> {
  const raw = await fs.readFile(path.resolve(baselinePath), "utf-8");
  const state: TerraformState = JSON.parse(raw);

  const resources: BaselineResource[] = state.resources.map((r) => ({
    type: r.type,
    name: r.name,
    provider: r.provider,
    attributes: r.instances[0]?.attributes ?? {},
  }));

  return { serial: state.serial, resources };
}

export function compareResources(baseline: BaselineResource[], live: LiveResource[]): DriftItem[] {
  const drifts: DriftItem[] = [];

  for (const baselineRes of baseline) {
    const liveRes = live.find(
      (l) => l.type === baselineRes.type && l.name === baselineRes.name
    );

    if (!liveRes) {
      drifts.push({
        resourceType: baselineRes.type,
        resourceName: baselineRes.name,
        resourceId: "MISSING",
        fields: [{ path: "(entire resource)", baselineValue: "exists", liveValue: "missing" }],
        detectedAt: new Date().toISOString(),
      });
      continue;
    }

    const fields = diffAttributes("", baselineRes.attributes, liveRes.attributes);

    if (fields.length > 0) {
      drifts.push({
        resourceType: baselineRes.type,
        resourceName: baselineRes.name,
        resourceId: liveRes.id,
        fields,
        detectedAt: new Date().toISOString(),
      });
    }
  }

  // Check for resources in live that are not in baseline (new unauthorized resources)
  for (const liveRes of live) {
    const exists = baseline.some(
      (b) => b.type === liveRes.type && b.name === liveRes.name
    );
    if (!exists) {
      drifts.push({
        resourceType: liveRes.type,
        resourceName: liveRes.name,
        resourceId: liveRes.id,
        fields: [{ path: "(entire resource)", baselineValue: "not in baseline", liveValue: "exists" }],
        detectedAt: new Date().toISOString(),
      });
    }
  }

  return drifts;
}

function diffAttributes(prefix: string, baseline: unknown, live: unknown): DriftField[] {
  const fields: DriftField[] = [];

  if (baseline === live) return fields;

  if (Array.isArray(baseline) && Array.isArray(live)) {
    if (JSON.stringify(baseline) !== JSON.stringify(live)) {
      fields.push({ path: prefix || "(root)", baselineValue: baseline, liveValue: live });
    }
    return fields;
  }

  if (
    typeof baseline === "object" && baseline !== null &&
    typeof live === "object" && live !== null &&
    !Array.isArray(baseline) && !Array.isArray(live)
  ) {
    const baseObj = baseline as Record<string, unknown>;
    const liveObj = live as Record<string, unknown>;
    const allKeys = new Set([...Object.keys(baseObj), ...Object.keys(liveObj)]);

    for (const key of allKeys) {
      const childPath = prefix ? `${prefix}.${key}` : key;
      if (!(key in baseObj)) {
        fields.push({ path: childPath, baselineValue: undefined, liveValue: liveObj[key] });
      } else if (!(key in liveObj)) {
        fields.push({ path: childPath, baselineValue: baseObj[key], liveValue: undefined });
      } else {
        fields.push(...diffAttributes(childPath, baseObj[key], liveObj[key]));
      }
    }
    return fields;
  }

  // Primitive mismatch
  if (baseline !== live) {
    fields.push({ path: prefix || "(root)", baselineValue: baseline, liveValue: live });
  }

  return fields;
}
