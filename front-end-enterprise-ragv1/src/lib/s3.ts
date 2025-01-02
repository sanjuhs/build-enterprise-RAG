import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function deleteFromS3(s3Url: string) {
  try {
    console.log("Original S3 URL:", s3Url);

    // Remove any query parameters from the URL
    const urlWithoutParams = s3Url.split("?")[0];
    console.log("URL without params:", urlWithoutParams);

    const url = new URL(urlWithoutParams);
    console.log("Parsed URL:", {
      hostname: url.hostname,
      pathname: url.pathname,
      protocol: url.protocol,
    });

    // Extract the path without leading slash
    const key = decodeURIComponent(url.pathname.slice(1));

    // Extract bucket name
    const bucket = url.hostname.split(".")[0];

    console.log("S3 Delete Parameters:", {
      bucket,
      key,
      originalUrl: s3Url,
      urlWithoutParams,
      parsedHostname: url.hostname,
    });

    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    });

    console.log("Sending delete command to S3");
    const response = await s3Client.send(command);
    console.log("S3 delete response:", response);

    return response;
  } catch (error: unknown) {
    const e = error as Error & { code?: string };
    console.error("Detailed S3 deletion error:", {
      error: e,
      message: e.message,
      stack: e.stack,
      code: e.code,
      name: e.name,
    });
    throw error;
  }
}
