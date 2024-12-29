import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Temporary solution for testing - REMOVE IN PRODUCTION
const BYPASS_AUTH = process.env.NODE_ENV === "production";

export async function POST(request: Request) {
  try {
    let userId = "test-user-1"; // Default for testing

    if (!BYPASS_AUTH) {
      const session = await auth();
      console.log("Full session:", JSON.stringify(session, null, 2));

      if (!session?.user?.id) {
        console.log("Missing user ID in session");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      userId = session.user.id;
    }

    const { fileName } = await request.json();

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME!,
      Key: `uploads/${userId}/${fileName}`,
      ContentType: "application/octet-stream",
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({ url: presignedUrl });
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return NextResponse.json(
      { error: "Failed to generate presigned URL" },
      { status: 500 }
    );
  }
}
