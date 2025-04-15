import { Connection, Client } from "@temporalio/client";
import path from "path";
import fs from "fs-extra";


export async function getTemporalWorkflowStatus(workflowId: string) {
  const certPath = path.join(process.cwd(), "temporal-certs");
  const cert = await fs.readFile(`${certPath}/client.pem`);
  const key = await fs.readFile(`${certPath}/client.key`);

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

  const handle = client.workflow.getHandle(workflowId);
  const desc = await handle.describe();

  return {
    status: desc.status.name,
    runId: desc.runId,
    startTime: desc.startTime,
    closeTime: desc.closeTime,
  }
}
