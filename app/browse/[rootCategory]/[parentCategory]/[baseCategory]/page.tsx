import Link from "next/link";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import Markdown, {MarkdownAsync} from "react-markdown";
import { SessionData, sessionOptions } from "@/lib/session";
import { graphRead } from "@/lib/neo4j";
import Breadcrumbs from "@/app/BreadcrumbHeader";
import {GetObjectCommand, S3Client} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {ChevronRightIcon} from "@heroicons/react/20/solid";
import clsx from "clsx";


function cleanMarkdown(input: string): string {
  return input.replace(/\*\*(.+?)\s\*\*/g, (_, content) => `**${content}**`);
}

type Chunk = {
  text: string;
  fileName: string;
  pageNumber: number;
  url: string;
  headers: string[];
}

async function getChunks(account: string, baseCategoryName: string) {
  const s3Client = new S3Client({
    region: process.env.AWS_BUCKET_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
  try {
    const query = `
      MATCH (b:BaseCategory {account: $account, name: $baseCategoryName})<-[:HAS_CATEGORY]-(c:Chunk {account: $account})
      RETURN c.file_name as fileName, c.page_number as pageNumber, c.text as text, c.headers as headers
    `;
    const result = await graphRead<Chunk[]>(query,{ account, baseCategoryName });

    if (!result.length) {
      throw new Error(`No Base Categories found for Parent Category: ${baseCategoryName}`);
    }

    const chunks: Chunk[] = [];
    for (const chunk of result) {
      const command = new GetObjectCommand({
        Bucket: `${process.env.AWS_BUCKET_NAME}`,
        Key: `${account}/${chunk.fileName}`,
      });
      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 120 });
      chunks.push({
        text: chunk.text,
        fileName: chunk.fileName,
        pageNumber: chunk.pageNumber,
        url: `${signedUrl}#page=${chunk.pageNumber}`,
        headers: chunk.headers,
      });
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
        <ol className="list-inside text-sm/6 text-center sm:text-left space-y-6 divide-y divide-gray-300 max-w-4xl mx-auto">
          {textChunks && textChunks.map((chunk, idx) => (
            <li key={idx} className="tracking-[-.01em] pb-10 pt-4">
              <div className="rounded-lg bg-neutral-100 shadow-lg px-4 py-5 sm:p-6">
                {(chunk.headers && chunk.headers.length) &&
                  <div className="mb-4 border-b-2 border-gray-300 pb-4 prose-sm">
                    <h3 className="">
                      Section:
                    </h3>
                    {chunk.headers.map((header, idx) => (
                      <div
                        key={idx}
                        // style={{paddingLeft: `${(idx + 1) * 10}px`}}  calc(var(--spacing) * 8)
                        className={`pl-${4 * (idx + 1)}`}
                      >
                        ⁍ {header.replaceAll("*", "")}
                      </div>
                    ))}
                  </div>
                }
                <div className="prose-sm border-b-2 border-gray-300 pb-4 mb-4">
                  <Markdown>
                  {cleanMarkdown(chunk.text)}
                </Markdown>
                </div>
                  {/*<span*/}
                  {/*  className="text-gray-900"*/}
                  {/*  dangerouslySetInnerHTML={{ __html: chunk.text.trim().replaceAll("\n", "<br />") }}*/}
                  {/*/>*/}
                  <div className="grid grid-cols-3 mt-2">
                    <p className="text-gray-600 text-left">{chunk.fileName}</p>
                    <p className="text-gray-600 text-center">pg. {chunk.pageNumber}</p>
                    <a className="text-gray-600 text-right hover:underline" href={chunk.url} target="_blank" rel="noopener noreferrer">
                      Open page
                      <ChevronRightIcon className="inline w-5 h-5" aria-hidden="true" />
                    </a>
                  </div>
                {/*</Markdown>*/}
              </div>
            </li>
          ))}
        </ol>
      </main>
    </div>
  );
}
