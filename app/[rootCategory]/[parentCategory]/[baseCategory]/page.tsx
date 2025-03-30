import Link from "next/link";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import Markdown from "react-markdown";
import { SessionData, sessionOptions } from "@/lib/session";
import { graphRead } from "@/lib/neo4j";
import Breadcrumbs from "@/app/BreadcrumbHeader";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";



async function getChunks(account: string, baseCategoryName: string) {
  const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  try {
    // const query = `
    //   MATCH (b:BaseCategory {account: $account, name: $baseCategoryName})<-[:HAS_CATEGORY]-(c:Chunk {account: $account})
    //   WITH collect(c.text) as text_chunks
    //   RETURN text_chunks
    // `;
    const query = `
      MATCH (b:BaseCategory {account: $account, name: $baseCategoryName})<-[:HAS_CATEGORY]-(c:Chunk {account: $account})
      RETURN c.file_name as fileName, c.page_number as pageNumber, c.text as text
    `;
    const result = await graphRead(query,{ account, baseCategoryName });
    console.log(JSON.stringify(result));
    if (!result.length) {
      throw new Error(`No Base Categories found for Parent Category: ${baseCategoryName}`);
    }

    const chunks: {text: string, url: string}[] = [];
    for (const chunk of result) {
      const command = new GetObjectCommand({
        Bucket: `${process.env.AWS_BUCKET_NAME}`,
        Key: `${account}/${chunk.fileName}`,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });
      chunks.push({text: chunk.text, url: `${signedUrl}#page=${chunk.pageNumber}`});
    }

    return chunks;
  } catch (error) {
    console.error("Error fetching root categories:", error);
    throw error;
  }
}


export default async function BaseCategoryPage(
  { params }:
    { params: Promise<{rootCategory: string, parentCategory: string, baseCategory: string}> }
) {
  const rootCategory = decodeURIComponent((await params).rootCategory);
  const parentCategory = decodeURIComponent((await params).parentCategory);
  const baseCategory = decodeURIComponent((await params).baseCategory);
  if (!baseCategory) {
    return <div>404<br />No Category selected</div>;
  }

  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  if(!session || !session.account) {
    return (
      <div>404<br />Please <Link href="/login" className="italic">login</Link></div>
    )
  }
  const textChunks = await getChunks(session.account, baseCategory);

  return (
    <div className="grid p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Breadcrumbs rootCategory={rootCategory} parentCategory={parentCategory} baseCategory={baseCategory} />
      <main className="flex flex-col gap-[32px] items-center sm:items-start">
        <ol className="list-inside text-sm/6 text-center sm:text-left space-y-6 divide-y divide-gray-300">
          {textChunks && textChunks.map((chunk, idx) => (
            <li key={idx} className="tracking-[-.01em] pb-10 pt-4">
              <div className="rounded-lg bg-neutral-100 shadow-lg px-4 py-5 sm:p-6">
                {/*<Markdown>*/}
                  <p className="text-gray-700 dark:text-white">{chunk.text}</p>
                  <a className="text-blue-700 hover:underline hover:text-blue-800" href={chunk.url} target="_blank" rel="noopener noreferrer">Open page</a>
                {/*</Markdown>*/}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
