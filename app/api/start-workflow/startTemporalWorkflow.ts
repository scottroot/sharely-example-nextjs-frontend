import { Connection, Client } from "@temporalio/client";
import path from "path";
import fs from "fs-extra";


export async function startTemporalWorkflow(workflowType: string, taskQueue: string, args: any[]): Promise<{workflowId?: string, error?: string}> {
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

    const handle = await client.workflow.start(workflowType, {
      args,
      taskQueue,
      workflowId: `workflow-${args[0].account}_${args[0].file_name.split(".")[0]}-${Date.now()}`,
    });

    const workflowId = handle.workflowId;

    return { workflowId }
  } catch (error) {
    console.error(error);
    return {error: `${error}`}
  }
}
