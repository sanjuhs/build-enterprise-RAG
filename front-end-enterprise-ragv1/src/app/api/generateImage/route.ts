import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { auth } from "@/auth";
import Together from "together-ai";

const together = new Together({
  apiKey: process.env.TOGETHER_API_KEY,
});

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: Request) {
  try {
    console.log("1. Starting image generation request");
    const session = await auth();
    console.log("2. Auth session:", JSON.stringify(session, null, 2));

    if (!session?.user?.id) {
      console.log("3. No user ID found in session");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const json = await req.json();

    // Generate image
    const response = await together.images.create({
      prompt: json.prompt,
      model: "black-forest-labs/FLUX.1-schnell",
      width: 1024,
      height: 768,
      steps: 3,
      response_format: "base64",
    });

    const base64Data = response.data[0].b64_json;
    if (!base64Data) {
      throw new Error("No image data received");
    }

    // Generate S3 presigned URL directly
    const timestamp = new Date().getTime();
    const fileName = `image_${timestamp}.jpg`;
    const now = new Date();
    const s3Key = `ai_gen/${userId}/${now.getFullYear()}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now
      .getDate()
      .toString()
      .padStart(2, "0")}/${fileName}`;

    try {
      console.log("5. Creating S3 command for:", s3Key);
      const command = new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME!,
        Key: s3Key,
        ContentType: "image/jpeg",
      });

      console.log("6. Generating presigned URL");
      const presignedUrl = await getSignedUrl(s3Client, command, {
        expiresIn: 3600,
      });
      console.log(
        "7. Got presigned URL:",
        presignedUrl.substring(0, 50) + "..."
      );

      // Upload to S3
      console.log("8. Starting S3 upload");
      const binaryData = Buffer.from(base64Data, "base64");
      console.log("9. Binary data length:", binaryData.length);

      const uploadResponse = await fetch(presignedUrl, {
        method: "PUT",
        body: binaryData,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      console.log("10. S3 upload response status:", uploadResponse.status);
      if (uploadResponse.ok) {
        console.log("11. Upload successful");
        return NextResponse.json({
          base64: base64Data,
          s3Url: `s3://${process.env.AWS_S3_BUCKET_NAME}/${s3Key}`,
        });
      } else {
        console.log("11. Upload failed with status:", uploadResponse.status);
        const errorText = await uploadResponse.text();
        console.log("Upload error details:", errorText);
        throw new Error(`Upload failed with status ${uploadResponse.status}`);
      }
    } catch (uploadError) {
      console.error("S3 upload failed:", uploadError);
      return NextResponse.json({
        base64: base64Data,
        error: "Image generated but S3 upload failed",
      });
    }
  } catch (error) {
    console.error("Error generating image:", error);
    return NextResponse.json(
      { error: "Failed to generate image" },
      { status: 500 }
    );
  }
}
