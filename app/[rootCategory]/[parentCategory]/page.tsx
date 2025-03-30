import { graphRead } from "@/lib/neo4j";
import Link from "next/link";
import Breadcrumbs from "@/app/BreadcrumbHeader";


async function getBaseCategories(parentCategoryName: string) {
  console.log(JSON.stringify({parentCategoryName}))
  try {
    const query = `
      MATCH (p:ParentCategory {name: $parentCategoryName})<-[:BELONGS_TO]-(b:BaseCategory)
      WITH collect(b.name) as base_categories
      RETURN base_categories
    `;

    const result = await graphRead(query,{ parentCategoryName });

    console.log(JSON.stringify(result, null, 4))
    console.log(query.replaceAll("$parentCategoryName", `"${parentCategoryName}"`));

    if (!result.length || !result[0].base_categories) throw new Error(`No Base Categories found for Parent Category: ${parentCategoryName}`);

    return result[0].base_categories as string[];
  } catch (error) {
    console.error("Error fetching root categories:", error);
    throw error;
  }
}


interface Params {
  params: {
    rootCategory: string;
    parentCategory: string;
  }
}

export default async function RootCategoryPage({ params, }: Params) {
  const rootCategory = decodeURIComponent((await params).rootCategory);
  const parentCategory = decodeURIComponent((await params).parentCategory);
  if (!parentCategory) return <div>404<br/>No Root Category selected</div>;

  const parentCategories = await getBaseCategories(parentCategory);

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
