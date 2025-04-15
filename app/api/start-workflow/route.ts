import { NextRequest, NextResponse } from "next/server";
import { startTemporalWorkflow } from "./startTemporalWorkflow";
import {getIronSession} from "iron-session";
import {SessionData, sessionOptions} from "@/lib/session";
import {cookies} from "next/headers";


export async function POST(req: NextRequest): Promise<NextResponse<{error?: string, workflowId?: string}>> {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const account = session.account;

  const { fileName, customerName } = await req.json();

  if (!fileName || !customerName || customerName !== account) {
    console.error(`Start Workflow API route error, invalid input(s): ${JSON.stringify({fileName, customerName, account})}`)
    return NextResponse.json({ error: "Missing valid file or customer name..." }, { status: 400 });
  }

  try {
    const { workflowId } = await startTemporalWorkflow(
      "TopDownPDF2CategoriesWorkflow",
      // "PDF2CategoriesWorkflow",
      "parse-pdf-queue",
      [{
        account: account,
        file_name: fileName,
      }]
    )
    console.log(JSON.stringify(workflowId));

    return NextResponse.json({ workflowId });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: `Error processing PDF\n${err}` }, { status: 500 });
  }
}
