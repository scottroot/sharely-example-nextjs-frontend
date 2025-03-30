import { graphRead } from "@/lib/neo4j";
import Breadcrumbs from "@/app/BreadcrumbHeader";
import Markdown from 'react-markdown'


async function getChunks(baseCategoryName: string) {
  try {
    const query = `
      MATCH (b:BaseCategory {name: $baseCategoryName})<-[:HAS_CATEGORY]-(c:Chunk)
      WITH collect(c.text) as text_chunks
      RETURN text_chunks
    `;

    console.log(query.replaceAll("$baseCategoryName", `"${baseCategoryName}"`));
    const result = await graphRead(query,{ baseCategoryName });
    // console.log(JSON.stringify({result}))

    if (!result.length || !result[0].text_chunks) throw new Error(`No Base Categories found for Parent Category: ${baseCategoryName}`);

    return result[0].text_chunks as string[];
  } catch (error) {
    console.error("Error fetching root categories:", error);
    throw error;
  }
}


interface Params {
  params: {
    rootCategory: string;
    parentCategory: string;
    baseCategory: string;
  }
}

export default async function RootCategoryPage({ params, }: Params) {
  const rootCategory = decodeURIComponent((await params).rootCategory);
  const parentCategory = decodeURIComponent((await params).parentCategory);
  const baseCategory = decodeURIComponent((await params).baseCategory);
  if (!baseCategory) return <div>404<br/>No Category selected</div>;

  const textChunks = await getChunks(baseCategory);

  return (
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Breadcrumbs rootCategory={rootCategory} parentCategory={parentCategory} baseCategory={baseCategory} />
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <ol className="list-inside text-sm/6 text-center sm:text-left space-y-6 divide-y divide-gray-300">
          {textChunks && textChunks.map((chunk: string, idx: number) => (
            <li key={idx} className="tracking-[-.01em] pb-10 pt-4">
              <div className="rounded-lg bg-neutral-100 shadow-lg px-4 py-5 sm:p-6">
                <Markdown>
                  {chunk}
                </Markdown>
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
