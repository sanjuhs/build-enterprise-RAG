import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sql } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uploads = await sql`
      SELECT 
        document_id as id,
        file_name as "fileName",
        status,
        created_at as "createdAt",
        updated_at as "updatedAt",
        s3_url as "s3Url"
      FROM documents 
      WHERE user_id = ${session.user.id}
      ORDER BY updated_at DESC
    `;

    return NextResponse.json(uploads);
  } catch (error) {
    console.error("Error fetching upload history:", error);
    return NextResponse.json(
      { error: "Failed to fetch upload history" },
      { status: 500 }
    );
  }
}
