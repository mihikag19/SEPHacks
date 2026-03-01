import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { classifyDrift } from "../lib/classifier.js";
import { DriftItem } from "../types/index.js";

async function classifyDriftHandler(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Classify drift request received");

  try {
    const body = (await request.json()) as unknown;

    if (!body || typeof body !== "object") {
      return { status: 400, jsonBody: { error: "Request body must be a DriftItem object" } };
    }

    const driftItem = body as DriftItem;

    if (!driftItem.resourceType || !driftItem.resourceName || !driftItem.fields) {
      return {
        status: 400,
        jsonBody: { error: "Missing required fields: resourceType, resourceName, fields" },
      };
    }

    const classification = await classifyDrift(driftItem);

    return { status: 200, jsonBody: classification };
  } catch (error) {
    context.error("Classification failed", error);
    return { status: 500, jsonBody: { error: "Internal classification error" } };
  }
}

app.http("classifyDrift", {
  methods: ["POST"],
  authLevel: "anonymous",
  handler: classifyDriftHandler,
});
