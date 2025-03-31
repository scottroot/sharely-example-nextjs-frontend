import { cookies } from "next/headers";
import Link from "next/link";
import { graphRead } from "@/lib/neo4j";
import { getIronSession } from "iron-session";
import { SessionData, sessionOptions } from "@/lib/session";


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


export default async function Home() {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const account = session?.account;

  const rootCategories = account ? await getRootCategories(account) : undefined;
  return (
    // <div className="grid items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <div className="min-w-0 flex-1">
        <h2 className="text-2xl/7 font-bold text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
          Knowledge Categories
        </h2>
      </div>
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        {!account && "Please login first in order to browse categories!"}
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left space-y-2">
          {rootCategories && rootCategories.map((category: RootDataItem, idx: number) => (
            <li key={idx} className="tracking-[-.01em]">
              <Link
                href={`/${encodeURIComponent(category.root_category)}`}
                className="text-sm font-medium text-gray-900 hover:text-gray-950 hover:underline"
              >
                {category.root_category}
              </Link>
              <ul>
                {category.top_3.map((child: string, ci: number) => (
                  <li key={ci} className="list-disc ml-8 mt-1/2">
                    <Link
                      href={`/${encodeURIComponent(category.root_category)}/${encodeURIComponent(child)}`}
                      className="text-xs/4 text-gray-500 hover:text-gray-900"
                    >
                      <code
                        // className="bg-black/[.05] px-1 py-0.5 rounded"
                        className="px-1 py-0.5"
                      >
                        {child}
                      </code>
                    </Link>
                  </li>
                ))}
              </ul>

            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
