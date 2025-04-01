import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import {getIronSession} from "iron-session";
import {SessionData, sessionOptions} from "@/lib/session";
import {cookies} from "next/headers";


const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const session = await getIronSession<SessionData>(await cookies(), sessionOptions);
  const account = session.account;
  if (!account) {
    return NextResponse.json({ error: "Can't get presigned S3 url - missing session `account`." }, { status: 400 });
  }

  const { searchParams } = new URL(request.url);
  const contentType: string|null = searchParams.get("contentType");
  const fileName: string|null = searchParams.get("fileName");
  if (!fileName) {
    return NextResponse.json({ error: "Can't get presigned S3 url - missing session `fileName`" }, { status: 400 });
  }

  let command;

  if(contentType) {
    command = new PutObjectCommand({
      Bucket: `${process.env.AWS_BUCKET_NAME}`,
      Key: `${account}/${fileName}`,
      ContentType: contentType,
    });
  } else {
    command = new GetObjectCommand({
      Bucket: `${process.env.AWS_BUCKET_NAME}`,
      Key: `${account}/${fileName}`,
    });
  }

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // 60 seconds

  return NextResponse.json({ url: signedUrl });
}
