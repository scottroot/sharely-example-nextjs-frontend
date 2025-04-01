import { S3Client, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";


const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function uploadFileToS3(file: File, customerName: string): Promise<{fileUrl: string, bucket: string, fileName: string}> {
  const fileBuffer = new Uint8Array(await file.arrayBuffer());

  const params: PutObjectCommandInput = {
    Bucket: `${process.env.AWS_BUCKET_NAME}`,
    Key: `${customerName}/${file.name}`,
    Body: fileBuffer,
    ContentType: file.type,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return {
    fileUrl: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_BUCKET_REGION}.amazonaws.com/${customerName}/${file.name}`,
    bucket: `${process.env.AWS_BUCKET_NAME}`,
    fileName: file.name,
  }
}
