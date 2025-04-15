import { cookies } from "next/headers";
import Link from "next/link";
import { graphRead } from "@/lib/neo4j";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import Visualize from "@/app/info/Visualize";


type RootDataItem = {root_category: string, top_3: string[]};


// async function getRootCategories(account: string) {
//   try {
//     const query = `
//       MATCH (r:RootCategory {account: $account})<-[:BELONGS_TO]-(p:ParentCategory {account: $account})<-[:BELONGS_TO]-(b:BaseCategory {account: $account})<-[:HAS_CATEGORY]-(c:Chunk)
//       WITH r, p, COUNT(c) AS chunk_count
//       ORDER BY r.name, chunk_count DESC
//       WITH r, COLLECT(p.name) AS parent_categories
//       RETURN r.name AS root_category, parent_categories[..3] AS top_3
//     `;
//
//     const result = await graphRead(query, { account });
//
//     if (!result.length) throw("Query response had no results...");
//
//     return result as RootDataItem[];
//   } catch (error) {
//     console.error("Error fetching root categories:", error);
//     return
//   }
// }

interface Node {
  id: string;
  labels?: string[];
  properties?: Record<string, unknown>;
}

interface Relationship {
  id: string;
  source: string;
  target: string;
  // type?: string;
  // properties?: Record<string, unknown>;
}

async function getFiles(account: string) {
  try {
    const query = `
      MATCH (c:Chunk {account: $account})-[:HAS_CATEGORY]->(b:BaseCategory {account: $account})
      RETURN DISTINCT c.file_name as fileName, COUNT(DISTINCT b.name) as baseCategoryCount
    `;
    const files = await graphRead(query, { account });
    return { files: files as {fileName: string, baseCategoryCount: number}[] }
  } catch (error) {
    console.error("Error fetching root categories:", error);
    // return { error: `Error fetching account files... ${JSON.stringify(error)}` };
  }
}

async function getVisualizationNodes(account: string) {
  try {
    const query = `
      MATCH (n:BaseCategory {account: $account})-[r]->(m:ParentCategory {account: $account})
      RETURN n, r, m
      LIMIT 50
    `;
    const records = await graphRead(query, { account }, true);

    const nodeMap = new Map<string, Node>();
    const relationships: Relationship[] = [];

    records.forEach((record: any) => {
      const n = record.get('n');
      const m = record.get('m');
      const r = record.get('r');

      const node1: Node = {
        id: n.identity.toString(),
        labels: n.labels,
        properties: n.properties,
      };

      const node2: Node = {
        id: m.identity.toString(),
        labels: m.labels,
        properties: m.properties,
      };

      const rel: Relationship = {
        id: r.identity.toString(),
        source: r.start.toString(),
        target: r.end.toString(),
        // type: r.type,
        // properties: r.properties,
      };

      nodeMap.set(node1.id, node1);
      nodeMap.set(node2.id, node2);
      relationships.push(rel);
    });

    return {
      nodes: Array.from(nodeMap.values()),
      rels: relationships,
      links: relationships,
    };
  } catch (error) {
    console.error("Error fetching root categories:", error);
    // return { error: `Error fetching account files... ${JSON.stringify(error)}` };
  }
}

async function getCategoryCount(account: string) {
  const query = `
    WITH "bsf-sat" as account
    MATCH (c:Chunk {account: account})-[:HAS_CATEGORY]->(b:BaseCategory {account: account})
    MATCH (b)-[:BELONGS_TO]->(p:ParentCategory {account: account})-[:BELONGS_TO]->(r:RootCategory {account: account})
    RETURN 
      c.file_name as fileName, 
      count(DISTINCT c.id) as totalChunks,
      count(DISTINCT b.name) as totalTags, 
      count(DISTINCT p.name) as totalSubcategories, 
      count(DISTINCT r.name) as totalCategories
  `;
  type Result = {
    fileName: string,
    totalChunks: number,
    totalTags: number,
    totalSubcategories: number,
    totalCategories: number
  }[];
  const result = await graphRead<Result>(query, { account });
  return result;
}
export default async function Info() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const account = session?.account;

  const fileData = account ? await getFiles(account) : undefined;
  // const visualizationData = account ? await getVisualizationNodes(account) : undefined;
  const categoryCounts = account ? await getCategoryCount(account) : undefined;
  return (
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          My Files
        </h2>
      </div>
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left space-y-6">
          {fileData?.files && fileData.files.map(({fileName, baseCategoryCount}, idx) => {
            const fileCounts = categoryCounts ? categoryCounts.find(x => x.fileName == fileName) : undefined;
            return (
            <li key={idx} className="tracking-[-.01em] text-sm font-medium text-gray-900 cursor-default">
              {fileName} <span className="text-sm text-gray-500">- {baseCategoryCount} categories</span>
              <ul className="pl-4">
                {fileCounts &&
                  <>
                    <li>
                      Total chunks: &nbsp;{fileCounts.totalChunks}
                    </li>
                    <li>
                      Tags assigned: &nbsp;{fileCounts.totalTags}
                    </li>
                    <li>
                      Subcategories assigned: &nbsp;{fileCounts.totalSubcategories}
                    </li>
                    <li>
                      Categories assigned: &nbsp;{fileCounts.totalCategories}
                    </li>
                  </>
                }
              </ul>
            </li>
            )
          })}
        </ol>
      </main>
      {/*<main className="flex flex-col gap-[32px] items-center sm:items-start">*/}
      {/*  {visualizationData &&*/}
      {/*    <Visualize data={visualizationData} />*/}
      {/*    // <pre>{JSON.stringify(visualizationData, null, 2)}</pre>*/}
      {/*  }*/}
      {/*</main>*/}
    </div>
  );
}
