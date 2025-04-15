import { NextRequest, NextResponse } from "next/server";
import { getTemporalWorkflowStatus } from "./getTemporalWorkflowStatus";


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const workflowId = searchParams.get("workflowId");
  if(!workflowId) {
    return NextResponse.json({}, { status: 404, statusText: "Not Found" });
  }
  const { status, runId, startTime, closeTime } = await getTemporalWorkflowStatus(workflowId);

  return NextResponse.json({ status, runId, startTime, closeTime });
}
