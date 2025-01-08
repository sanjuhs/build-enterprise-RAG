interface PresignedUrlResponse {
  url: string;
  fields?: { [key: string]: string };
}

function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now();
  const extension = originalName.split(".").pop();
  const baseName = originalName.replace(/\.[^/.]+$/, ""); // Remove extension
  return `${baseName}_${timestamp}.${extension}`;
}

export async function generatePresignedUrl(
  fileName: string
): Promise<PresignedUrlResponse> {
  try {
    const uniqueFileName = generateUniqueFileName(fileName);
    console.log("Requesting presigned URL for:", uniqueFileName);

    const response = await fetch("/api/uploads/presigned-url", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ fileName: uniqueFileName }),
    });

    console.log("Presigned URL response status:", response.status);
    if (!response.ok) {
      const errorData = await response.text();
      console.error("Presigned URL error response:", errorData);
      throw new Error("Failed to generate presigned URL");
    }

    const data = await response.json();
    console.log("Presigned URL generated successfully");
    return data;
  } catch (error) {
    console.error("Error in generatePresignedUrl:", error);
    throw new Error("Failed to generate presigned URL");
  }
}

export async function generatePresignedUrlForAiGen(
  userId: string,
  fileName: string
) {
  console.log("1. Starting presigned URL request for:", { userId, fileName });

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  console.log("2. Using base URL:", baseUrl);

  const response = await fetch(`${baseUrl}/api/uploads/presigned-url`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: `${userId}/ai_gen/${fileName}`,
      contentType: "image/jpeg",
    }),
  });

  console.log("3. Presigned URL response status:", response.status);

  if (!response.ok) {
    console.log("4. Failed to get presigned URL:", await response.text());
    throw new Error("Failed to get presigned URL");
  }

  const data = await response.json();
  console.log("5. Successfully got presigned URL");
  return data;
}
