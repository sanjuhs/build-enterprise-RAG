import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  S3Client,
  ListObjectsV2Command,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateStr = searchParams.get("date");
    const date = dateStr ? new Date(dateStr) : new Date();

    // Format the prefix for the specific date
    const prefix = `ai_gen/${session.user.id}/${date.getFullYear()}/${(
      date.getMonth() + 1
    )
      .toString()
      .padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}/`;

    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Prefix: prefix,
      MaxKeys: 1000, // Get all images for the day
    });

    const listResponse = await s3Client.send(listCommand);

    // Sort by LastModified (newest first)
    const sortedContents = (listResponse.Contents || []).sort((a, b) => {
      const dateA = a.LastModified?.getTime() || 0;
      const dateB = b.LastModified?.getTime() || 0;
      return dateB - dateA;
    });

    const images = await Promise.all(
      sortedContents.map(async (object) => {
        if (!object.Key) return null;

        const command = new GetObjectCommand({
          Bucket: process.env.AWS_S3_BUCKET_NAME!,
          Key: object.Key,
        });

        const url = await getSignedUrl(s3Client, command, {
          expiresIn: 3600,
        });

        return {
          s3Url: `s3://${process.env.AWS_S3_BUCKET_NAME}/${object.Key}`,
          fileName: object.Key.split("/").pop() || "",
          createdAt: object.LastModified?.toISOString(),
          url,
        };
      })
    ).then((images) => images.filter(Boolean));

    return NextResponse.json({
      images,
      total: images.length,
    });
  } catch (error) {
    console.error("Error fetching images:", error);
    return NextResponse.json(
      { error: "Failed to fetch images" },
      { status: 500 }
    );
  }
}
