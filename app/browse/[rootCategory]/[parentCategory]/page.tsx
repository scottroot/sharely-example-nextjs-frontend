import Link from "next/link";
import { cookies } from "next/headers";
import { getIronSession} from "iron-session";
import { graphRead } from "@/lib/neo4j";
import Breadcrumbs from "@/app/BreadcrumbHeader";
import { SessionData, sessionOptions } from "@/lib/session";


async function getBaseCategories(account: string, parentCategoryName: string) {
  try {
    const query = `
      MATCH (p:ParentCategory {account: $account, name: $parentCategoryName})<-[:BELONGS_TO]-(b:BaseCategory {account: $account})
      WITH collect(b.name) as base_categories
      RETURN base_categories
    `;

    const result = await graphRead(query,{ account, parentCategoryName });

    if (!result.length || !result[0].base_categories) {
      throw new Error(`No Base Categories found for Parent Category: ${parentCategoryName}`);
    }

    return result[0].base_categories as string[];
  } catch (error) {
    console.error("Error fetching root categories:", error);
    throw error;
  }
}


export default async function ParentCategoryPage(
  { params }:
    { params: Promise<{rootCategory: string, parentCategory: string}> }
) {
  const rootCategory = decodeURIComponent((await params).rootCategory);
  const parentCategory = decodeURIComponent((await params).parentCategory);
  if (!parentCategory) return <div>404<br/>No Root Category selected</div>;

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if(!session || !session.account) {
    return (
      <div>404<br />Please <Link href="/login" className="italic">login</Link></div>
    )
  }

  const parentCategories = await getBaseCategories(session.account, parentCategory);

  return (
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Breadcrumbs rootCategory={rootCategory} parentCategory={parentCategory} />
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <ol className="list-inside list-decimal text-sm/6 text-center sm:text-left space-y-6">
          {parentCategories && parentCategories.map((category: string, idx: number) => (
            <li key={idx} className="tracking-[-.01em]">
              <Link
                href={`/${encodeURIComponent(rootCategory)}/${encodeURIComponent(parentCategory)}/${encodeURIComponent(category)}`}
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
