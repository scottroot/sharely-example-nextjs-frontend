import { NextRequest, NextResponse } from "next/server";
import { runTemporalWorkflow } from "./runTemporalWorkflow";


export async function POST(req: NextRequest): Promise<NextResponse<{error?: string, runId?: string, result?: string[]}>> {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const customerName = formData.get("customerName") as string;

  if (!file || !customerName) {
    return NextResponse.json({ error: "Missing file or customer name..." }, { status: 400 });
  }


  try {
    // const { fileUrl, bucket, fileName } = await uploadFileToS3(file, customerName);

    const { runId, result } = await runTemporalWorkflow(
      "PDF2CategoriesWorkflow",
      "parse-pdf-queue",
      [{
        account: customerName,
        file_name: file.name,
      }]
    )
    console.log(JSON.stringify(runId));

    return NextResponse.json({ runId, result });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: `Error processing PDF\n${err}` }, { status: 500 });
  }
}

//
// export async function GET(request: NextRequest) {
//   const { searchParams } = new URL(request.url);
//   const key = searchParams.get("key");
//
//   if (!key) {
//     return NextResponse.json({ error: "No key provided" }, { status: 400 });
//   }
//   const params = {
//     Bucket: BUCKET_NAME, // Replace with your LocalStack bucket name
//     Key: file.name,
//     Body: fileBuffer,
//     ContentType: file.type,
//   };
//
//   const command = new PutObjectCommand(params);
//   await s3Client.send(command);
//
//   const s3FileUrl = (process.env.NODE_ENV === "development"
//     ? `http://localhost:4566/${BUCKET_NAME}/${params.Key}`
//     : `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "us-east-1"}.amazonaws.com/${params.Key}`
//
//   );
//
//   return NextResponse.json({ s3FileUrl });
// }
