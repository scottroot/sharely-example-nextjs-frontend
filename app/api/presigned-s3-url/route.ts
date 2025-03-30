import { NextRequest, NextResponse } from "next/server";
import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const account: string|null = searchParams.get("account")
  const fileName: string|null = searchParams.get("fileName");

  if (!account || !fileName) {
    return NextResponse.json({ error: "Can't get PDF - missing account name or file name" }, { status: 400 });
  }

  const command = new GetObjectCommand({
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Key: `${account}/${fileName}`,
  });

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 }); // 60 seconds

  return NextResponse.json({ url: signedUrl });
}
