import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getLatestReport } from "./pollDrift.js";

async function getDriftStatus(
  _request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log("Drift status request received");

  const report = getLatestReport();

  if (!report) {
    return {
      status: 200,
      jsonBody: {
        status: "no_data",
        message: "No drift report available yet. Waiting for first poll cycle.",
      },
    };
  }

  return { status: 200, jsonBody: report };
}

app.http("getDriftStatus", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: getDriftStatus,
});
