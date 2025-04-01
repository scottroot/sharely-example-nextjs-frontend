import { Connection, Client } from "@temporalio/client";
import path from "path";
import fs from "fs-extra";


export async function runTemporalWorkflow(workflowType: string, taskQueue: string, args: any[]) {
  const certPath = path.join(process.cwd(), "temporal-certs");
  const cert = await fs.readFile(`${certPath}/client.pem`);
  const key = await fs.readFile(`${certPath}/client.key`);

  try {
    const connection = await Connection.connect({
      address: `${process.env.TEMPORAL_SERVER || "sharelyai.hcfpy.tmprl.cloud:7233"}`,
      tls: {
        clientCertPair: {
          crt: cert,
          key: key,
        }
      },
    });

    const client = new Client({
      connection,
      namespace: "sharelyai.hcfpy"
    });

    const info = await client.workflowService.getSystemInfo({});
    console.log('Connected to Temporal:', JSON.stringify(info));

    const handle = await client.workflow.start(workflowType, {
      args,
      taskQueue,
      workflowId: `workflow-${Date.now()}`,
    });

    const runId = handle.workflowId;
    const result = await handle.result();

    return { runId, result }
  } catch (error) {
    console.error(error);
    throw({ error: "Failed to start workflow" });
  }
}
