import { NextResponse } from "next/server";
import { deleteUploadRecord, getUploadRecord } from "@/lib/db";
import { deleteFromS3 } from "@/lib/s3";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    console.log("Starting delete for document ID:", id);

    // 1. Get the upload record
    const uploadRecord = await getUploadRecord(id);
    console.log("Found upload record:", uploadRecord);

    // 2. Delete from S3 if there's an S3 URL
    if (uploadRecord?.s3_url) {
      // Note: changed from s3Url to s3_url to match your schema
      console.log("Attempting to delete from S3:", uploadRecord.s3_url);
      await deleteFromS3(uploadRecord.s3_url);
      console.log("Successfully deleted from S3");
    } else {
      console.log("No S3 URL found in record");
    }

    // 3. Delete from database
    await deleteUploadRecord(id);
    console.log("Successfully deleted from database");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("Detailed error in DELETE route:", {
      error,
    });
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 }
    );
  }
}
