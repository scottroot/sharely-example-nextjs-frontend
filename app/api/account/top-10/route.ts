import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import { sessionOptions } from "@/lib/session";
import type { SessionData } from "@/lib/session";
import {S3Client, GetObjectCommand, PutObjectCommand, PutObjectCommandInput} from "@aws-sdk/client-s3";
import { revalidatePath } from "next/cache";
import {graphRead} from "@/lib/neo4j";


const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

async function getFileFromS3(account: string): Promise<{root_categories: string[]}> {
  const command = new GetObjectCommand({
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Key: `${account}/top_10_categories.json`,
  });
  const res = await s3Client.send(command);
  const data = await res.Body?.transformToString();

  return JSON.parse(data || `{"root_categories": []}`)
}


async function putFileToS3(account: string, rootCategories: string[]) {
  const params: PutObjectCommandInput = {
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Key: `${account}/top_10_categories.json`,
    Body: JSON.stringify({root_categories: rootCategories}),
    ContentType: "application/json; charset=utf-8",
  };
  const command = new PutObjectCommand(params);
  const res = await s3Client.send(command);

  return {};
}



export async function GET() {
  try {
    console.log("Top 10 API - running function...");
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if(!session.account) {
      console.log("Cannot get top 10 root categories - no session account.");
      return NextResponse.json({ error: "Cannot get top 10 root categories - no session account" }, { status: 500 });
    }

    console.log(`Running top 10 api as account: ${session.account}`);

    const data = await graphRead<{category: string, subcategories?: string[]}[]>(
      `MATCH (r:RootCategory {account: $account})
      OPTIONAL MATCH (r)<-[:BELONGS_TO]-(p:ParentCategory {account: $account})
      ORDER BY r.name
      RETURN r.name as category, collect(p.name) AS subcategories`,
      { account: session.account }
    )

    return NextResponse.json({ rootCategories: data });
  } catch (error) {
    console.error("Error handling user session switch:", error);
    return NextResponse.json({ error: `Internal Server Error: ${error}` }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
    if(!session.account) {
      return NextResponse.json({ error: "Cannot set top 10 root categories - no session account" }, { status: 500 });
    }

    console.log(`Running top 10 api as account: ${session.account}`);

    // const req: { rootCategories: string[] | undefined } = await request.json();
    // const rootCategories = req.rootCategories;
    // if(!rootCategories || rootCategories.length !== 10) {
    //   return NextResponse.json({ error: "Must provide 10 root categories to save." }, { status: 500 });
    // }
    // await putFileToS3(session.account, rootCategories);
    // // console.log(JSON.stringify({rootCategories}))
    // return NextResponse.json({});
    const req: { category?: string, name?: string, originalName?: string } = await request.json();

    if(!req.name) return NextResponse.json({}, { status: 400, statusText: "Missing new Category name."});
    // const top10 = await graphRead(
    //   `MATCH (r:RootCategory {account: $account}) ORDER BY r.name RETURN r.name as category`,
    //   { account: session.account }
    // );
    if(req.category) {
      if(req.originalName && req.originalName !== "") {
        const status = graphRead(
          `MATCH (p:ParentCategory {account: $account, name: $originalName})-[:BELONGS_TO]->(r:RootCategory {account: $account, name: $category})
          SET p.name = $name`,
          { account: session.account, category: req.category, name: req.name, originalName: req.originalName }
        );
        // return NextResponse.json({});
        console.log(`Renamed category... ${JSON.stringify(status)}`)
      }
      else {
        console.error("Could not update mid-level without the original subcategory name.")
      }
    }
    else if(req.originalName && req.originalName !== "") {
      const status = graphRead(
        `MATCH (r:RootCategory {account: $account, name: $originalName})
        SET r.name = $name`,
        { account: session.account, name: req.name, originalName: req.originalName }
      );
      // return NextResponse.json({});
      console.log(`Renamed category... ${JSON.stringify(status)}`)
    }
    else {
      const status = graphRead(
        `MERGE (r:RootCategory {account: $account, name: $name})
        SET r.name = $name`,
        { account: session.account, name: req.name }
      );
      console.log(`Created category... ${JSON.stringify(status)}`)
    }

    revalidatePath("/api/account/top-10");
    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({ error: "Error saving root categories" }, { status: 500 });
  }
}


