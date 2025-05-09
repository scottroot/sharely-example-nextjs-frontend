import { graphRead } from "@/lib/neo4j";
import Link from "next/link";
import Breadcrumbs from "@/app/BreadcrumbHeader";
import {getIronSession} from "iron-session";
import {SessionData, sessionOptions} from "@/lib/session";
import {cookies} from "next/headers";


async function getParentCategories(account: string, rootCategoryName: string) {
  try {
    const query = `
      MATCH (r:RootCategory {account: $account, name: $rootCategoryName})<-[:BELONGS_TO]-(p:ParentCategory {account: $account})
      WITH collect(p.name) as parent_categories
      RETURN parent_categories
    `;

    const result = await graphRead(query,{ account, rootCategoryName });

    if (!result.length || !result[0].parent_categories) {
      throw new Error(`No Parent Categories found for Root Category: ${rootCategoryName}`);
    }

    return result[0].parent_categories as string[];
  } catch (error) {
    console.error("Error fetching root categories:", error);
    throw error;
  }
}


export default async function RootCategoryPage(
  { params }:
    { params: Promise<{rootCategory: string}> }
) {
  const rootCategory = decodeURIComponent((await params).rootCategory);
  if (!rootCategory) {
    return <div>404<br/>No Root Category selected</div>;
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if(!session || !session.account) {
    return (
      <div>404<br />Please <Link href="/login" className="italic">login</Link></div>
    )
  }

  const parentCategories = await getParentCategories(session.account, rootCategory);
  return (
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Breadcrumbs rootCategory={rootCategory} parentCategory={undefined} />
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left space-y-6">
          {parentCategories && parentCategories.map((category: string, idx: number) => (
            <li key={idx} className="tracking-[-.01em]">
              <Link
                href={`/browse/${encodeURIComponent(rootCategory)}/${encodeURIComponent(category)}`}
                className="text-sm font-medium text-gray-900 hover:text-gray-950 hover:underline"
              >
                {category}
              </Link>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
