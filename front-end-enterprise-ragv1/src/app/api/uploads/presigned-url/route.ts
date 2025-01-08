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
    console.log("1. Starting presigned URL generation");
    let userId = "test-user-1"; // Default for testing

    if (!BYPASS_AUTH) {
      console.log("2. Auth check enabled, getting session");
      const session = await auth();
      console.log("3. Full session data:", JSON.stringify(session, null, 2));

      if (!session?.user?.id) {
        console.log("4. Missing user ID in session");
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      console.log("5. Using user ID:", session.user.id);
      userId = session.user.id;
    } else {
      console.log("2. Auth check bypassed, using test user");
    }

    const { fileName } = await request.json();
    console.log("6. Generating presigned URL for file:", fileName);

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
