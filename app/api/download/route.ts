import { NextRequest, NextResponse } from "next/server";
import { getFileFromS3 } from "./getFileFromS3";


export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const account: string|null = searchParams.get("account")
  const fileName: string|null = searchParams.get("fileName");

  if (!account || !fileName) {
    return NextResponse.json({ error: "Can't get PDF - missing account name or file name" }, { status: 400 });
  }

  const pdfBuffer: Buffer<ArrayBuffer> = await getFileFromS3(account, fileName);

  return new NextResponse(pdfBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${fileName}"`,
    },
  });
}
