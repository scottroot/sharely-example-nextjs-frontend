import { cookies } from "next/headers";
import Link from "next/link";
import { graphRead } from "@/lib/neo4j";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";
import Visualize from "@/app/info/Visualize";


type RootDataItem = {root_category: string, top_3: string[]};


async function getRootCategories(account: string) {
  try {
    const query = `
      MATCH (r:RootCategory {account: $account})<-[:BELONGS_TO]-(p:ParentCategory {account: $account})<-[:BELONGS_TO]-(b:BaseCategory {account: $account})<-[:HAS_CATEGORY]-(c:Chunk)
      WITH r, p, COUNT(c) AS chunk_count
      ORDER BY r.name, chunk_count DESC
      WITH r, COLLECT(p.name) AS parent_categories
      RETURN r.name AS root_category, parent_categories[..3] AS top_3
    `;

    const result = await graphRead(query, { account });

    if (!result.length) throw("Query response had no results...");

    return result as RootDataItem[];
  } catch (error) {
    console.error("Error fetching root categories:", error);
    return
  }
}

async function getData(account: string) {
  try {
    const query = `
      MATCH (r:RootCategory {account: $account})<-[:BELONGS_TO]-(p:ParentCategory {account: $account})
            <-[:BELONGS_TO]-(b:BaseCategory {account: $account})
            <-[:HAS_CATEGORY]-(c:Chunk {account: $account})
      RETURN
        id(r) AS rId, labels(r)[0] AS rLabel, properties(r) AS rProps,
        id(p) AS pId, labels(p)[0] AS pLabel, properties(p) AS pProps,
        id(b) AS bId, labels(b)[0] AS bLabel, properties(b) AS bProps,
        id(c) AS cId, labels(c)[0] AS cLabel, properties(c) AS cProps
    `;

    const result = await graphRead(query, { account });

    // if (!result.length) throw("Query response had no results...");

    const nodesMap = new Map();
    const links: any[] = [];

    result.forEach(rec => {
      const entities = [
        { id: rec.rId, label: 'RootCategory', props: rec.rProps },
        { id: rec.pId, label: 'ParentCategory', props: rec.pProps },
        { id: rec.bId, label: 'BaseCategory', props: rec.bProps },
        { id: rec.cId, label: 'Chunk', props: rec.cProps },
      ];

      entities.forEach(({ id, label, props }) => {
        if (!nodesMap.has(id)) nodesMap.set(id, { id, label, ...props });
      });

      links.push({ source: rec.cId, target: rec.bId, type: 'HAS_CATEGORY' });
      links.push({ source: rec.bId, target: rec.pId, type: 'BELONGS_TO' });
      links.push({ source: rec.pId, target: rec.rId, type: 'BELONGS_TO' });
    });

    return { nodes: [...nodesMap.values()], links };
  } catch (error) {
    console.error("Error fetching root categories:", error);
    return
  }
}


export default async function Home() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const account = session?.account;

  const data = account ? await getData(account) : undefined;
  return (
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Knowledge Categories
        </h2>
      </div>
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        {!account
          ? "Please login first in order to browse categories!"
          : <Visualize data={data} />
        }
      </main>
    </div>
  );
}
