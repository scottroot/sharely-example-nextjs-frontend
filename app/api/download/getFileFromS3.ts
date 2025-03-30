import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function getFileFromS3(account: string, fileName: string): Promise<Buffer<ArrayBuffer>> {
  const command = new GetObjectCommand({
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Key: `${account}/${fileName}`,
  });
  const { Body } = await s3Client.send(command);

  const streamToBuffer = async (stream: any) => {
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    return Buffer.concat(chunks);
  };

  return await streamToBuffer(Body);
}
